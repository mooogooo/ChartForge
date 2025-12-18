import { MIN_HEIGHT, HEIGHT_RANGE_MIN, HEIGHT_RANGE_MAX, FLUCTUATION_MIN, INCREMENT_MIN, INCREMENT_MAX } from './constants';

// 随机增减50%高度
export function randomizeHeightFluctuate(selection: readonly any[]) {
  if (selection.length === 0) {
    return { success: false, message: '请先选择一个矩形' };
  }

  for (var i = 0; i < selection.length; i++) {
    var element = selection[i];
    
    if (element.height !== undefined && element.y !== undefined) {
      var currentHeight = element.height;
      var currentY = element.y;
      
      // 计算随机变化比例：-50%到+50%
      var fluctuationFactor = (Math.random() - 0.5) * 1.0;
      
      // 计算新高度和变化量
      var newHeight = Math.max(MIN_HEIGHT, Math.round(currentHeight * (1 + fluctuationFactor)));
      var heightChange = newHeight - currentHeight;
      
      // 应用新高度并调整Y坐标
      try {
        var el = element;
        el.height = newHeight;
        el.y = currentY - heightChange;
      } catch (e) {
        return { success: false, message: '修改元素高度失败' };
      }
    }
  }
  
  return { success: true };
}

// 设置120px-500px随机高度
export function randomizeHeightRange(selection: readonly any[]) {
  if (selection.length === 0) {
    return { success: false, message: '请先选择一个矩形' };
  }

  for (var i = 0; i < selection.length; i++) {
    var element = selection[i];
    
    if (element.height !== undefined && element.y !== undefined) {
      var currentHeight = element.height;
      var currentY = element.y;
      
      // 生成120px-500px内的随机值
      var newHeight = Math.round(Math.random() * (HEIGHT_RANGE_MAX - HEIGHT_RANGE_MIN) + HEIGHT_RANGE_MIN);
      var heightChange = newHeight - currentHeight;
      
      // 应用新高度并调整Y坐标
      try {
        var el = element;
        el.height = newHeight;
        el.y = currentY - heightChange;
      } catch (e) {
        return { success: false, message: '修改元素高度失败' };
      }
    }
  }
  
  return { success: true };
}

// 随机增加20%-50%高度
export function randomizeHeightIncrement(selection: readonly any[]) {
  if (selection.length === 0) {
    return { success: false, message: '请先选择一个矩形' };
  }

  for (var i = 0; i < selection.length; i++) {
    var element = selection[i];
    
    if (element.height !== undefined && element.y !== undefined) {
      var currentHeight = element.height;
      var currentY = element.y;
      
      // 计算随机增加比例：20%到50%
      var increaseFactor = Math.random() * (INCREMENT_MAX - INCREMENT_MIN) + INCREMENT_MIN;
      
      // 计算新高度和增加量
      var newHeight = Math.round(currentHeight * (1 + increaseFactor));
      var heightIncrease = newHeight - currentHeight;
      
      // 应用新高度并调整Y坐标
      try {
        var el = element;
        el.height = newHeight;
        el.y = currentY - heightIncrease;
      } catch (e) {
        return { success: false, message: '修改元素高度失败' };
      }
    }
  }
  
  return { success: true };
}

// 删除了 randomizeCurvePoints 函数