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
    if (rgbMatch) {
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
    if (rgbMatch) {
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



/**
 * 方案三：随机点集 + 排序
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

  ellipses.sort((a, b) => a.index - b.index);

  const count = ellipses.length;

  const minTopPercent = Math.max(8, 100 / (count * 2));
  const randomValues: number[] = [];

  for (let i = 0; i < count - 1; i++) {
    randomValues.push(
      minTopPercent +
        Math.random() * (100 - minTopPercent)
    );
  }

  randomValues.sort((a, b) => b - a);

  const percentages = [100, ...randomValues];

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
    if (rgbMatch) {
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