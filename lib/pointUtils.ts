// 在PenNode位置生成EllipseNode的工具函数

export interface PointConfig {
  size?: number;
  strokeWidth?: number;
}

export function generatePointsAtPenNodes(selection: readonly any[], config: PointConfig = {}) {
  if (selection.length === 0) {
    return { success: false, message: '请先选择一个路径物体（PenNode）' };
  }

  const size = config.size ?? 8;
  const strokeWidth = config.strokeWidth ?? 2;

  const created: any[] = [];

  for (const element of selection) {
    if (element.type !== 'PEN' || !element.penNetwork?.nodes) {
      continue;
    }

    const parent = element.parent;
    if (!parent) {
      continue;
    }

    const nodes = element.penNetwork.nodes;

    for (const node of nodes) {
      if (node.x === undefined || node.y === undefined) {
        continue;
      }

      let ellipseX = node.x + (element.x || 0) - size / 2;
      let ellipseY = node.y + (element.y || 0) - size / 2;

      const ellipse = mg.createEllipse();
      ellipse.width = size;
      ellipse.height = size;

      parent.appendChild(ellipse);

      ellipse.x = ellipseX;
      ellipse.y = ellipseY;

      ellipse.fills = [
        {
          type: 'SOLID',
          color: { r: 1, g: 1, b: 1, a: 1 }
        }
      ];

      ellipse.strokes = [
        {
          type: 'SOLID',
          color: { r: 0, g: 0.5, b: 1, a: 1 }
        }
      ];
      ellipse.strokeWeight = strokeWidth;

      if (element.nextSibling) {
        parent.insertBefore(ellipse, element.nextSibling);
      }

      created.push(ellipse);
    }
  }

  if (created.length === 0) {
    return { success: false, message: '未找到可用的 PenNode 节点' };
  }

  mg.commitUndo();

  return {
    success: true,
    message: `成功创建 ${created.length} 个锚点`
  };
}
