// 蓝色调色板
const colorData = [
  'rgb(214, 234, 255)',  // cornflower-blue-2
  'rgb(123, 194, 255)',  // cornflower-blue-4
  'rgb(44, 173, 255)',   // cornflower-blue-6
  'rgb(44, 150, 225)',   // cornflower-blue-8
  'rgb(38, 114, 168)',   // cornflower-blue-11
  'rgb(32, 96, 142)',    // cornflower-blue-13
  'rgb(24, 76, 114)',    // cornflower-blue-15
  'rgb(14, 55, 84)',     // cornflower-blue-17
  'rgb(4, 32, 54)',      // cornflower-blue-19
];

// 整组椭圆均为单层、不透明的纯白或默认灰填充时，应用蓝色系。
// 渐变、图片、多层填充和其他已有配色均保留。
function allEllipsesHaveDefaultFill(ellipses: any[]): boolean {
  return ellipses.length > 0 && ellipses.every(ellipse => {
    const fills = ellipse.fills;
    if (!Array.isArray(fills) || fills.length !== 1) return false;
    const fill = fills[0];
    const color = fill.color;
    // SDK 可能以浮点数存储 216 / 255，容忍浮点精度误差。
    const matchesGray = (value: number) => Number.isFinite(value) && Math.abs(value - 216 / 255) < 0.000001;
    const isWhite = color?.r === 1 && color?.g === 1 && color?.b === 1;
    const isDefaultGray = color && matchesGray(color.r) && matchesGray(color.g) && matchesGray(color.b);
    return fill.type === 'SOLID' && fill.isVisible !== false && fill.visible !== false &&
      (fill.opacity === undefined || fill.opacity === 1) &&
      (isWhite || isDefaultGray) &&
      (color.a === undefined || color.a === 1);
  });
}

/**
 * 随机设置EllipseNode的弧度数据
 * @param selection 当前选中的元素
 * @returns 操作结果
 */
export function randomizeArcData(
  selection: any[]
): { success: boolean; message?: string } {
  if (!selection || selection.length === 0) {
    return { success: false, message: '请先选择一个或多个椭圆对象' };
  }

  const ellipses = selection.filter(e => e.type === 'ELLIPSE');
  if (ellipses.length === 0) {
    return { success: false, message: '请选择至少一个椭圆对象' };
  }

  // 按图层顺序排序，index越大越上层
  ellipses.sort((a, b) => a.index - b.index);

  const applyBluePalette = allEllipsesHaveDefaultFill(ellipses);
  const count = ellipses.length;

  // 计算每个椭圆的弧度百分比
  const percentages: number[] = [];
  
  // 最下层（最后一个）始终是100%
  percentages[count - 1] = 100;
  
  // 为其他椭圆生成随机百分比，确保上层不大于下层
  for (let i = count - 2; i >= 0; i--) {
    // 生成一个比下一层小的随机百分比
    // 范围从5%到下一层百分比的80%
    const minPercent = 5;
    const maxPercent = Math.floor(percentages[i + 1] * 0.8);
    const randomPercent = Math.floor(Math.random() * (maxPercent - minPercent + 1)) + minPercent;
    percentages[i] = randomPercent;
  }

  const startAngle = (-90 * Math.PI) / 180;

  for (let i = 0; i < ellipses.length; i++) {
    ellipses[i].arcData = {
      startingAngle: startAngle,
      endingAngle: startAngle + (percentages[i] / 100) * 2 * Math.PI,
      innerRadius: ellipses[i].arcData?.innerRadius ?? 0
    };
    
    // 解析RGB字符串并创建SolidPaint对象
    const colorStr = colorData[i % colorData.length];
    
    const rgbMatch = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (applyBluePalette && rgbMatch) {
      const [, r, g, b] = rgbMatch;
      
      // 创建正确的RGBA对象
      const rgbaColor = {
        r: parseInt(r) / 255,
        g: parseInt(g) / 255,
        b: parseInt(b) / 255,
        a: 1
      };
      
      // 取消使用样式
      if ('fillStyleId' in ellipses[i]) {
        ellipses[i].fillStyleId = '';
      }
      
      // 给节点设置 fills（按照MasterGo的正确格式）
      ellipses[i].fills = [
        {
          type: 'SOLID' as const,
          color: rgbaColor
        }
      ];
    }
  }

  // 提交到撤销历史
  if (typeof mg !== 'undefined' && mg.commitUndo) {
    mg.commitUndo();
  }

  return { success: true };
}




/**
 * 方案二：非线性（曲线）+ 随机
 */
export function randomizeArcData_curve(
  selection: any[]
): { success: boolean; message?: string } {
  if (!selection || selection.length === 0) {
    return { success: false, message: '请先选择一个或多个椭圆对象' };
  }

  const ellipses = selection.filter(e => e.type === 'ELLIPSE');
  if (ellipses.length === 0) {
    return { success: false, message: '请选择至少一个椭圆对象' };
  }

  ellipses.sort((a, b) => a.index - b.index);

  const applyBluePalette = allEllipsesHaveDefaultFill(ellipses);
  const count = ellipses.length;
  const percentages: number[] = [];

  const minTopPercent = Math.max(10, 100 / (count * 2));
  const curvePower = 1.4;

  percentages[0] = 100;

  for (let i = 1; i < count; i++) {
    const t = i / (count - 1);
    const curve = Math.pow(t, curvePower);

    const base =
      100 - curve * (100 - minTopPercent);

    const avgStep =
      (100 - minTopPercent) / Math.max(1, count - 1);

    const jitter =
      (Math.random() - 0.5) * avgStep;

    let value = base + jitter;

    value = Math.min(percentages[i - 1] - 1, value);
    value = Math.max(minTopPercent, value);

    percentages[i] = value;
  }

  const startAngle = (-90 * Math.PI) / 180;

  for (let i = 0; i < ellipses.length; i++) {
    ellipses[i].arcData = {
      startingAngle: startAngle,
      endingAngle: startAngle + (percentages[i] / 100) * 2 * Math.PI,
      innerRadius: ellipses[i].arcData?.innerRadius ?? 0
    };
    
    // 设置填充颜色
    const colorStr = colorData[i % colorData.length];
    const rgbMatch = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (applyBluePalette && rgbMatch) {
      const [, r, g, b] = rgbMatch;
      
      const rgbaColor = {
        r: parseInt(r) / 255,
        g: parseInt(g) / 255,
        b: parseInt(b) / 255,
        a: 1
      };
      
      // 取消使用样式
      if ('fillStyleId' in ellipses[i]) {
        ellipses[i].fillStyleId = '';
      }
      
      // 设置填充颜色
      ellipses[i].fills = [
        {
          type: 'SOLID' as const,
          color: rgbaColor
        }
      ];
    }
  }

  // 提交到撤销历史
  if (typeof mg !== 'undefined' && mg.commitUndo) {
    mg.commitUndo();
  }

  return { success: true };
}



const PIE_CYCLE_KEY = 'chartforge.pieCycle.v1';

/**
 * 四步循环：平均、前半偏大、后半偏大、轻微起伏。
 * 先计算实际可见占比，再转换成叠放椭圆的累计弧度。
 * 保留函数名称以兼容现有按钮入口。
 */
export function randomizeArcData_randomSet(
  selection: any[]
): { success: boolean; message?: string } {
  if (!selection || selection.length === 0) {
    return { success: false, message: '请先选择一个或多个椭圆对象' };
  }

  const ellipses = selection.filter(e => e.type === 'ELLIPSE');
  if (ellipses.length === 0) {
    return { success: false, message: '请选择至少一个椭圆对象' };
  }

  // 同父级按真实图层顺序排序，不依赖用户框选/点选的先后顺序。
  ellipses.sort((a, b) => {
    if (a.parent && a.parent.id === b.parent?.id) {
      const siblings = a.parent.children;
      return siblings.findIndex((node: any) => node.id === a.id) -
        siblings.findIndex((node: any) => node.id === b.id);
    }
    return (a.index ?? 0) - (b.index ?? 0) || a.id.localeCompare(b.id);
  });

  const applyBluePalette = allEllipsesHaveDefaultFill(ellipses);
  const count = ellipses.length;
  const selectionKey = JSON.stringify(ellipses.map(node => [node.parent?.id, node.id]));
  const previous = ellipses[0].getPluginData(PIE_CYCLE_KEY);
  let stage = 0;
  try {
    const saved = JSON.parse(previous);
    if (saved.selectionKey === selectionKey && Number.isInteger(saved.nextStage) &&
        saved.nextStage >= 0 && saved.nextStage < 4 &&
        ellipses.every(node => node.getPluginData(PIE_CYCLE_KEY) === previous)) {
      stage = saved.nextStage;
    }
  } catch (_) { /* 新选区或无效数据从平均开始。 */ }

  let shares: number[];
  if (stage === 0 || count === 1) {
    shares = ellipses.map(() => 100 / count);
  } else {
    const favoredCount = Math.ceil(count / 2);
    const weights = ellipses.map((_, i) => {
      if (stage === 3) return 0.8 + Math.random() * 0.4;
      const favored = stage === 1 ? i < favoredCount : i >= count - favoredCount;
      return favored ? 3 + Math.random() * 2 : 0.5 + Math.random() * 0.5;
    });
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    // 留出 75% 的空间拉开差异；每块仍至少占平均比例的 1/4。
    shares = weights.map(weight => 25 / count + 75 * weight / totalWeight);
  }

  // 底层保持整圆；相邻层累计弧度的差值才是该层实际可见的占比。
  // 例如 shares=[20,30,50] 时，累计弧度应为 [100,80,50]。
  const percentages: number[] = [100];
  for (let i = 1; i < count; i++) {
    percentages.push(percentages[i - 1] - shares[i - 1]);
  }

  const startAngle = (-90 * Math.PI) / 180;

  for (let i = 0; i < ellipses.length; i++) {
    ellipses[i].arcData = {
      startingAngle: startAngle,
      endingAngle: startAngle + (percentages[i] / 100) * 2 * Math.PI,
      innerRadius: ellipses[i].arcData?.innerRadius ?? 0
    };
    
    // 设置填充颜色
    const colorStr = colorData[i % colorData.length];
    const rgbMatch = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (applyBluePalette && rgbMatch) {
      const [, r, g, b] = rgbMatch;
      
      const rgbaColor = {
        r: parseInt(r) / 255,
        g: parseInt(g) / 255,
        b: parseInt(b) / 255,
        a: 1
      };
      
      // 取消使用样式
      if ('fillStyleId' in ellipses[i]) {
        ellipses[i].fillStyleId = '';
      }
      
      // 设置填充颜色
      ellipses[i].fills = [
        {
          type: 'SOLID' as const,
          color: rgbaColor
        }
      ];
    }
  }

  // 每个成员保存相同状态；换选区会重新从平均开始。
  // 随图形一起提交，重开插件可续接，撤销时也能恢复循环进度。
  const nextCycle = JSON.stringify({ selectionKey, nextStage: (stage + 1) % 4 });
  for (const ellipse of ellipses) ellipse.setPluginData(PIE_CYCLE_KEY, nextCycle);

  // 提交到撤销历史
  if (typeof mg !== 'undefined' && mg.commitUndo) {
    mg.commitUndo();
  }

  return { success: true };
}
