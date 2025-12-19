// 路径节点Y轴变换算法接口
export interface PathTransformAlgorithm {
  name: string;
  transform(y: number): number;
}

// 随机缩放算法（改进版）
export class RandomScaleAlgorithm implements PathTransformAlgorithm {
  name = 'randomScale';
  private minFactor: number;
  private maxFactor: number;
  private defaultRange: number;

  constructor(minFactor: number = 0.5, maxFactor: number = 2.0, defaultRange: number = 100) {
    this.minFactor = minFactor;
    this.maxFactor = maxFactor;
    this.defaultRange = defaultRange;
  }

  transform(y: number): number {
    // 生成随机因子
    const randomFactor = Math.random() * (this.maxFactor - this.minFactor) + this.minFactor;
    
    if (y === 0) {
      // 当y为0时，使用默认范围生成随机值
      return (Math.random() * 2 - 1) * this.defaultRange;
    } else {
      // 当y不为0时，使用缩放因子
      return y * randomFactor;
    }
  }
}

// 随机偏移算法
export class RandomOffsetAlgorithm implements PathTransformAlgorithm {
  name = 'randomOffset';
  private minOffset: number;
  private maxOffset: number;

  constructor(minOffset: number = -100, maxOffset: number = 100) {
    this.minOffset = minOffset;
    this.maxOffset = maxOffset;
  }

  transform(y: number): number {
    // 生成随机偏移量
    const randomOffset = Math.random() * (this.maxOffset - this.minOffset) + this.minOffset;
    return y + randomOffset;
  }
}

// 算法工厂类
export class PathTransformFactory {
  private static algorithms: Map<string, PathTransformAlgorithm> = new Map();

  static registerAlgorithm(name: string, algorithm: PathTransformAlgorithm) {
    this.algorithms.set(name, algorithm);
  }

  static getAlgorithm(name: string): PathTransformAlgorithm | undefined {
    return this.algorithms.get(name);
  }

  static getAllAlgorithms(): Map<string, PathTransformAlgorithm> {
    return this.algorithms;
  }
}

// 注册默认算法
PathTransformFactory.registerAlgorithm('randomScale', new RandomScaleAlgorithm());
PathTransformFactory.registerAlgorithm('randomOffset', new RandomOffsetAlgorithm());

// 随机变换路径控制点Y轴参数
export function randomizePathPoints(selection: readonly any[], algorithmName: string = 'randomScale') {
  if (selection.length === 0) {
    return { success: false, message: '请先选择一个路径物体' };
  }

  // 获取算法实例
  const algorithm = PathTransformFactory.getAlgorithm(algorithmName);
  if (!algorithm) {
    return { success: false, message: `算法 ${algorithmName} 不存在` };
  }

  for (var i = 0; i < selection.length; i++) {
    var element = selection[i];
    
    // 检查是否是路径物体（PenNode）
    if (element.type === 'PEN' && element.penNetwork !== undefined) {
      var penNetwork = element.penNetwork;
      
      // 检查是否包含nodes数组
      if (penNetwork.nodes !== undefined && penNetwork.nodes.length > 0) {
        // 遍历每个节点并随机变换Y轴参数
        for (var j = 0; j < penNetwork.nodes.length; j++) {
          var node = penNetwork.nodes[j];
          
          if (node.y !== undefined) {
            try {
              // 应用随机变换
              const newY = algorithm.transform(node.y);
              node.y = newY;
            } catch (e) {
              return { success: false, message: '修改路径节点失败' };
            }
          }
        }
        
        // 重新赋值penNetwork以触发画布更新
        try {
          element.penNetwork = penNetwork;
        } catch (e) {
          return { success: false, message: '重新赋值penNetwork失败' };
        }
      } else {
        return { success: false, message: '选择的路径物体不包含nodes数组' };
      }
    } else {
      return { success: false, message: '选择的物体不是路径物体或不包含penNetwork' };
    }
  }
  
  return { success: true };
}