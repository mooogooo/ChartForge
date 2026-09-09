import { UIMessage } from '@messages/sender'
import { UI_WIDTH, UI_HEIGHT } from './constants'
import { randomizeHeightFluctuate, randomizeHeightRange, randomizeHeightIncrement } from './heightUtils'
import { randomizePathPoints } from './pathUtils'
import { randomizeArcData,randomizeArcData_curve,randomizeArcData_randomSet } from './arcUtils'
import { generatePointsAtPenNodes } from './pointUtils'

// 使用传统函数和var声明以提高兼容性
mg.showUI(__html__, {
  width: UI_WIDTH,
  height: UI_HEIGHT
});

// 处理UI消息的回调函数
mg.ui.onmessage = function(msg) {
  if (!msg || typeof msg.type !== 'string') return;
  // 避免解构赋值，直接访问属性
  var messageType = msg.type;
  var messageData = msg.data;

  if (messageType === UIMessage.NOTIFY_ERROR) {
    if (typeof messageData === 'string' && messageData.trim()) mg.notify(messageData);
    return;
  }

  // Validate the entire selection before any action, including mixed selections.
  var requirements: Record<string, { type: string; message: string }> = {
    [UIMessage.RANDOMIZE_HEIGHT_FLUCTUATE]: { type: 'RECTANGLE', message: '请选择一个或多个矩形，柱状图功能仅支持矩形' },
    [UIMessage.RANDOMIZE_HEIGHT_RANGE]: { type: 'RECTANGLE', message: '请选择一个或多个矩形，柱状图功能仅支持矩形' },
    [UIMessage.RANDOMIZE_HEIGHT_INCREMENT]: { type: 'RECTANGLE', message: '请选择一个或多个矩形，柱状图功能仅支持矩形' },
    [UIMessage.SET_FIXED_SIZE]: { type: 'RECTANGLE', message: '请选择一个或多个矩形' },
    [UIMessage.RANDOMIZE_PATH_POINTS]: { type: 'PEN', message: '请选择一个或多个折线路径' },
    [UIMessage.GENERATE_POINTS]: { type: 'PEN', message: '请选择一个或多个路径，再生成节点圆点' },
    [UIMessage.RANDOMIZE_ARC_DATA]: { type: 'ELLIPSE', message: '请选择一个或多个圆形或椭圆，饼图功能仅支持椭圆对象' },
  };
  var requirement = requirements[messageType];
  if (!requirement) return;
  var selected = mg.document.currentPage.selection;
  if (!selected.length || selected.some(node => node.type !== requirement.type)) {
    mg.notify(requirement.message);
    return;
  }
  if (selected.some(node => node.isLocked)) {
    mg.notify('选中的对象已锁定，请先解锁');
    return;
  }

  try {
  
  if (messageType === UIMessage.RANDOMIZE_HEIGHT_FLUCTUATE) {
    // 获取选中的元素
    var selection = mg.document.currentPage.selection;
    var result: { success: boolean; message?: string } = randomizeHeightFluctuate(selection);
    if (!result.success) {
      mg.notify(result.message || '修改高度失败');
    }
  } else if (messageType === UIMessage.RANDOMIZE_HEIGHT_RANGE) {
    // 获取选中的元素
    var selection = mg.document.currentPage.selection;
    if (messageData?.rangeMin == null || messageData?.rangeMax == null ||
        messageData.rangeMin === '' || messageData.rangeMax === '') {
      mg.notify('请填写并按回车确认高度上限和下限');
      return;
    }
    var rangeMin = messageData.rangeMin;
    var rangeMax = messageData.rangeMax;
    var result: { success: boolean; message?: string } = randomizeHeightRange(selection, rangeMin, rangeMax);
    if (!result.success) {
      mg.notify(result.message || '请先选择一个矩形');
    }
  } else if (messageType === UIMessage.RANDOMIZE_HEIGHT_INCREMENT) {
    // 获取选中的元素
    var selection = mg.document.currentPage.selection;
    var result: { success: boolean; message?: string } = randomizeHeightIncrement(selection);
    if (!result.success) {
      mg.notify(result.message || '修改高度失败');
    }
  } else if (messageType === UIMessage.RANDOMIZE_PATH_POINTS) {
      // 获取选中的元素
      var selection = mg.document.currentPage.selection;
      // 在稳定范围内生成全新走势
      var result: { success: boolean; message?: string } = randomizePathPoints(selection);
      if (!result.success) {
        mg.notify(result.message || '请先选择一个路径物体');
      }
    } else if (messageType === UIMessage.RANDOMIZE_ARC_DATA) {
      // 获取选中的元素
      var selection = mg.document.currentPage.selection;
      var result: { success: boolean; message?: string } = randomizeArcData_randomSet(selection as any[]);
      if (!result.success) {
        mg.notify(result.message || '随机饼图失败');
      }
    } else if (messageType === UIMessage.GENERATE_POINTS) {
      // 获取选中的元素
      var selection = mg.document.currentPage.selection;
      var result: { success: boolean; message?: string } = generatePointsAtPenNodes(selection);
      if (!result.success) {
        mg.notify(result.message || '生成节点圆点失败');
      }
    } else if (messageType === UIMessage.SET_FIXED_SIZE) {
    // 获取选中的元素
    var selection = mg.document.currentPage.selection;
    if (selection.length === 0) {
      mg.notify('请先选择一个矩形');
      return;
    }

    var width = messageData?.width;
    var height = messageData?.height;
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      mg.notify('宽高必须填写大于 0 的数值');
      return;
    }

    // 使用传统for循环
    for (var i = 0; i < selection.length; i++) {
      var element = selection[i];
      if (element.bound !== undefined) {
        try {
          // 直接修改bound属性
          element.bound.width = width;
          element.bound.height = height;
          } catch (e) {
            mg.notify('修改尺寸失败，请检查对象是否允许编辑');
            return;
          }
      }
    }
  } else {
  }
  } catch (_) {
    mg.notify('操作未完成，请检查对象是否允许编辑；如有部分变化，可撤销本次操作');
  }
};
