// Generate fresh chart data in a stable coordinate space, never from the last Y values.
type Matrix = [[number, number, number], [number, number, number]];
type Point = { x: number; y: number };
type Range = { min: number; max: number };
const IDENTITY: Matrix = [[1, 0, 0], [0, 1, 0]];
const RANGE_KEY = 'chartforge.lineRange.v1';
const EPSILON = 0.001;
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

function multiply(a: Matrix, b: Matrix): Matrix {
  return [
    [a[0][0]*b[0][0]+a[0][1]*b[1][0], a[0][0]*b[0][1]+a[0][1]*b[1][1], a[0][0]*b[0][2]+a[0][1]*b[1][2]+a[0][2]],
    [a[1][0]*b[0][0]+a[1][1]*b[1][0], a[1][0]*b[0][1]+a[1][1]*b[1][1], a[1][0]*b[0][2]+a[1][1]*b[1][2]+a[1][2]]
  ];
}
function inverse(m: Matrix): Matrix {
  const d = m[0][0]*m[1][1]-m[0][1]*m[1][0];
  if (!Number.isFinite(d) || Math.abs(d) < 1e-10) throw new Error('路径变换无效，无法随机');
  return [[m[1][1]/d, -m[0][1]/d, (m[0][1]*m[1][2]-m[1][1]*m[0][2])/d],
    [-m[1][0]/d, m[0][0]/d, (m[1][0]*m[0][2]-m[0][0]*m[1][2])/d]];
}
function transform(m: Matrix, p: Point): Point {
  return { x: m[0][0]*p.x+m[0][1]*p.y+m[0][2], y: m[1][0]*p.x+m[1][1]*p.y+m[1][2] };
}
function absolute(node: any): Matrix { return node.type === 'PAGE' ? IDENTITY : node.absoluteTransform; }
function fixedContainer(node: any): boolean {
  if (!['FRAME', 'COMPONENT', 'INSTANCE'].includes(node.type)) return false;
  return node.flexMode === 'VERTICAL' ? node.mainAxisSizingMode === 'FIXED'
    : node.flexMode === 'HORIZONTAL' ? node.crossAxisSizingMode === 'FIXED' : true;
}
function scopeFor(node: any): any {
  for (let p = node.parent; p; p = p.parent) {
    if (p.type === 'PAGE' || fixedContainer(p)) return p;
  }
  throw new Error('路径不在有效页面中');
}
function inScope(node: any, scope: any): Matrix { return multiply(inverse(absolute(scope)), absolute(node)); }
function pointsInScope(node: any, scope: any): Point[] {
  const matrix = inScope(node, scope);
  return node.penNetwork.nodes.map((p: Point) => transform(matrix, p));
}
function signature(node: any, scope: any): string {
  const parents: string[] = [];
  for (let p = node.parent; p; p = p.parent) parents.push(p.id);
  return JSON.stringify({ parents, points: pointsInScope(node, scope).map(p => [Math.round(p.x*1000), Math.round(p.y*1000)]),
    paths: node.penNetwork.paths, ctrlNodes: node.penNetwork.ctrlNodes, regions: node.penNetwork.regions });
}

export function generateChartPoints(points: readonly Point[], range: Range, random: () => number = Math.random): Point[] {
  const output = points.map(p => ({ ...p }));
  const order = points.map((_, i) => i).sort((a, b) => points[a].x-points[b].x || a-b);
  const step = (range.max-range.min)*0.4;
  let previous: number | undefined;
  for (const i of order) {
    const min = previous === undefined ? range.min : Math.max(range.min, previous-step);
    const max = previous === undefined ? range.max : Math.min(range.max, previous+step);
    previous = min+random()*(max-min);
    output[i].y = previous;
  }
  return output;
}

function prepare(node: any) {
  if (node.type !== 'PEN' || !node.penNetwork) throw new Error('请选择直线段组成的折线路径');
  const network = clone(node.penNetwork) as { nodes: Point[]; ctrlNodes: Point[]; paths: unknown[]; regions: unknown[] };
  if (network.nodes.length < 2 || network.nodes.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) {
    throw new Error('折线至少需要两个有效节点');
  }
  if (network.ctrlNodes.length) throw new Error('暂不支持曲线控制柄，请选择直线段折线');
  const scope = scopeFor(node);
  const matrix = inScope(node, scope);
  if (Math.abs(matrix[0][1]) > 1e-8 || Math.abs(matrix[1][0]) > 1e-8 || matrix[0][0] <= 0 || matrix[1][1] <= 0) {
    throw new Error('暂不支持相对容器旋转、倾斜或翻转的折线');
  }
  const originalPoints = pointsInScope(node, scope);
  const stored = node.getPluginData(RANGE_KEY);
  let range: Range;
  if (scope.type !== 'PAGE') {
    range = { min: scope.height*0.1, max: scope.height*0.9 };
  } else {
    let saved;
    try { saved = JSON.parse(stored); } catch (_) { /* first use or invalid cache */ }
    if (saved && saved.signature === signature(node, scope) && Number.isFinite(saved.min) && Number.isFinite(saved.max) && saved.max > saved.min) {
      range = { min: saved.min, max: saved.max };
    } else {
      const ys = originalPoints.map(p => p.y);
      range = { min: Math.min(...ys), max: Math.max(...ys) };
      if (range.max-range.min < 20) {
        const center = (range.min+range.max)/2;
        range = { min: center-100, max: center+100 };
      }
    }
  }
  if (!Number.isFinite(range.min) || !Number.isFinite(range.max) || range.max <= range.min) throw new Error('容器高度无效');
  return { node, scope, network, stored, range, originalPoints,
    originalWidth: node.width, originalHeight: node.height,
    originalTransform: clone(node.absoluteTransform) as Matrix,
    target: generateChartPoints(originalPoints, range) };
}

// Keep geometry and the object's bounds in the same coordinate system. Changing
// width/height may scale the old geometry, so replace the network AFTER resizing.
function writePoints(node: any, scope: any, network: any, target: Point[]) {
  const local = inverse(inScope(node, scope));
  const oldAbsolute = clone(absolute(node));
  const localPoints = target.map(p => transform(local, p));
  const minX = Math.min(...localPoints.map(p => p.x));
  const minY = Math.min(...localPoints.map(p => p.y));
  const width = Math.max(...localPoints.map(p => p.x))-minX;
  const height = Math.max(...localPoints.map(p => p.y))-minY;
  const origin = transform(oldAbsolute, { x: minX, y: minY });
  const desiredAbsolute: Matrix = [
    [oldAbsolute[0][0], oldAbsolute[0][1], origin.x],
    [oldAbsolute[1][0], oldAbsolute[1][1], origin.y]
  ];
  const next = clone(network);
  next.nodes = network.nodes.map((p: Point, i: number) => ({
    ...p, x: localPoints[i].x-minX, y: localPoints[i].y-minY
  }));
  node.width = width;
  node.height = height;
  node.penNetwork = next;
  // The origin moves to the new top-left; subtracting that same offset from all
  // vertices above preserves every target point's position on the canvas.
  // Read the parent transform now, since resizing can move auto-sizing groups.
  node.relativeTransform = multiply(inverse(absolute(node.parent)), desiredAbsolute);
  if (pointsInScope(node, scope).some((p, i) => Math.abs(p.x-target[i].x) > EPSILON || Math.abs(p.y-target[i].y) > EPSILON)) {
    throw new Error('外框更新时宿主改变了节点位置，请将折线放入固定尺寸容器');
  }
  assertBounds(node);
}

function assertBounds(node: any) {
  const points: Point[] = node.penNetwork.nodes;
  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxX = Math.max(...points.map(p => p.x));
  const maxY = Math.max(...points.map(p => p.y));
  if (![minX, minY, maxX, maxY, node.width, node.height].every(Number.isFinite) ||
      Math.abs(minX) > EPSILON || Math.abs(minY) > EPSILON ||
      Math.abs(maxX-node.width) > EPSILON || Math.abs(maxY-node.height) > EPSILON) {
    throw new Error('宿主未能同步折线外框，本次操作已取消');
  }
}

export function randomizePathPoints(selection: readonly any[]): { success: boolean; message?: string } {
  if (!selection.length) return { success: false, message: '请先选择一个折线路径' };
  const changed: ReturnType<typeof prepare>[] = [];
  try {
    // Preflight the whole selection before changing anything.
    const plans = selection.map(prepare);
    for (const plan of plans) {
      changed.push(plan);
      writePoints(plan.node, plan.scope, plan.network, plan.target);
    }
    // Recheck after all writes (siblings may share an auto-sizing group).
    for (const plan of plans) {
      const actual = pointsInScope(plan.node, plan.scope);
      if (actual.some((p, i) => Math.abs(p.x-plan.target[i].x) > EPSILON || Math.abs(p.y-plan.target[i].y) > EPSILON)) {
        throw new Error('父级布局改变了折线位置，请使用固定尺寸容器');
      }
      assertBounds(plan.node);
      plan.node.setPluginData(RANGE_KEY, plan.scope.type === 'PAGE'
        ? JSON.stringify({ ...plan.range, signature: signature(plan.node, plan.scope) }) : '');
    }
    mg.commitUndo();
    return { success: true };
  } catch (error) {
    let restored = true;
    for (const plan of changed.reverse()) {
      try {
        plan.node.width = plan.originalWidth;
        plan.node.height = plan.originalHeight;
        plan.node.penNetwork = clone(plan.network);
        plan.node.relativeTransform = multiply(inverse(absolute(plan.node.parent)), plan.originalTransform);
        plan.node.setPluginData(RANGE_KEY, plan.stored);
      } catch (_) { restored = false; }
    }
    return { success: false, message: (error instanceof Error ? error.message : '随机折线失败') + (restored ? '' : '；部分路径恢复失败，请撤销本次操作') };
  }
}
