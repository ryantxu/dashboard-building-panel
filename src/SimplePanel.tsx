import React, { PureComponent } from 'react';
import { PanelProps, Select } from '@grafana/ui';
import { SimpleOptions } from 'types';
import { SelectableValue } from '@grafana/data';
import { getBackendSrv, getLocationSrv } from '@grafana/runtime';
import { createSimpleGraphPanel } from 'panelBuilder';

interface Props extends PanelProps<SimpleOptions> {}
interface State {
  loading: boolean;
  values: string[];
  building: boolean;
}

export class SimplePanel extends PureComponent<Props, State> {
  state: State = {
    loading: true,
    values: [],
    building: false,
  };

  async componentDidMount() {
    // TODO: this could make a query and then populate the dropdown
    this.setState({
      loading: false,
      values: ['aaa', 'bbb', 'ccc'],
      building: false,
    });
  }

  getCurrentDashboardUID = () => {
    const url = window.location.href;
    const idx = url.indexOf('/d/');
    if (idx > 0) {
      const edx = url.indexOf('/', idx + 4);
      return url.substring(idx, edx);
    }
    return null;
  };

  async buildNewDashboard(value: string) {
    this.setState({ building: true });

    const uid = this.getCurrentDashboardUID();
    if (!uid) {
      throw new Error('can not find dashboard UID');
    }

    const backendSrv = getBackendSrv();
    const info = await backendSrv.get('api/dashboards/uid/' + uid);

    // Build a dashboard
    const dashboard = {
      ...info.dashboard,
      panels: [
        createSimpleGraphPanel('Panel 1', 0, 'red'),
        createSimpleGraphPanel('Panel 2', 6, 'green'),
        createSimpleGraphPanel('Panel 3', 12, 'blue'),
      ],
    };

    // Create a new dashboard?
    if (true) {
      delete dashboard.id;
      delete dashboard.uid;
      delete dashboard.version;
      dashboard.title = `Generated Dashboard (${Date.now()})`;
    }

    // Validate the panel IDs
    let i = 1;
    for (const panel of dashboard.panels) {
      panel.id = i++;
    }

    console.log('SAVE:', dashboard);
    const res = await backendSrv.post('api/dashboards/db', {
      dashboard,
      message: 'Generated in the UI',
      overwrite: false,
    });

    if (res.url) {
      getLocationSrv().update({
        path: res.url,
      });
    }
  }

  onSelectionChange = (item: SelectableValue<string>) => {
    this.buildNewDashboard(item.value!);
  };

  render() {
    const { loading, values, building } = this.state;
    if (loading) {
      return <div>loading...</div>;
    }
    const vals: SelectableValue<string>[] = values.map(v => {
      return { label: v, value: v };
    });

    return (
      <div>
        <Select options={vals} onChange={this.onSelectionChange} />
        {building && <div>... generating new dashboard...</div>}
      </div>
    );
  }
}
