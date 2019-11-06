export function createSimpleGraphPanel(title: string, y: number, color: string) {
  return {
    type: 'graph',
    title,
    gridPos: { h: 6, w: 12, x: 0, y },
    targets: [{ refId: 'A', scenarioId: 'random_walk' }],
    aliasColors: {
      'A-series': color,
    },
  };
}
