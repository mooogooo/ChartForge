import { UIMessage } from '@messages/sender'
import { UI_WIDTH, UI_HEIGHT } from './constants'
import { randomizeHeightFluctuate, randomizeHeightRange, randomizeHeightIncrement } from './heightUtils'
import { randomizePathPoints } from './pathUtils'
import { randomizeArcData,randomizeArcData_curve,randomizeArcData_randomSet } from './arcUtils'

// 使用传统函数和var声明以提高兼容性
mg.showUI(__html__, {
  width: UI_WIDTH,
  height: UI_HEIGHT
});

// 处理UI消息的回调函数
mg.ui.onmessage = function(msg) {
  // 避免解构赋值，直接访问属性
  var messageType = msg.type;
  var messageData = msg.data;
  
  if (messageType === UIMessage.RANDOMIZE_HEIGHT_FLUCTUATE) {
    // 获取选中的元素
    var selection = mg.document.currentPage.selection;
    var result = randomizeHeightFluctuate(selection);
    if (!result.success) {
      mg.ui.postMessage({ type: 'Error', data: result.message || '请先选择一个矩形' });
    }
  } else if (messageType === UIMessage.RANDOMIZE_HEIGHT_RANGE) {
    // 获取选中的元素
    var selection = mg.document.currentPage.selection;
    var result = randomizeHeightRange(selection);
    if (!result.success) {
      mg.ui.postMessage({ type: 'Error', data: result.message || '请先选择一个矩形' });
    }
  } else if (messageType === UIMessage.RANDOMIZE_HEIGHT_INCREMENT) {
    // 获取选中的元素
    var selection = mg.document.currentPage.selection;
    var result = randomizeHeightIncrement(selection);
    if (!result.success) {
      mg.ui.postMessage({ type: 'Error', data: result.message || '请先选择一个矩形' });
    }
  } else if (messageType === UIMessage.RANDOMIZE_PATH_POINTS) {
      // 获取选中的元素
      var selection = mg.document.currentPage.selection;
      // 使用默认的随机缩放算法
      var result = randomizePathPoints(selection, 'randomScale');
      if (!result.success) {
        mg.ui.postMessage({ type: 'Error', data: result.message || '请先选择一个路径物体' });
      }
    } else if (messageType === UIMessage.RANDOMIZE_ARC_DATA) {
      // 获取选中的元素
      var selection = mg.document.currentPage.selection;
      var result: { success: boolean; message?: string | undefined } = randomizeArcData_randomSet(selection as any[]);
      if (!result.success) {
        mg.ui.postMessage({ type: 'Error', data: result.message || '请先选择一个椭圆对象' });
      }
    } else if (messageType === UIMessage.SET_FIXED_SIZE) {
    // 获取选中的元素
    var selection = mg.document.currentPage.selection;
    if (selection.length === 0) {
      mg.ui.postMessage({ type: 'Error', data: '请先选择一个矩形' });
      return;
    }

    var width = messageData.width;
    var height = messageData.height;
    if (width <= 0 || height <= 0) {
      mg.ui.postMessage({ type: 'Error', data: '宽高必须大于0' });
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
          }
      }
    }
  } else {
  }
};