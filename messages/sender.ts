// 插件发出的消息
export enum PluginMessage {
}

//UI发出的消息
export enum UIMessage {
  HELLO = 'Hello!',
  RANDOMIZE_HEIGHT = 'RandomizeHeight',
  SET_FIXED_SIZE = 'SetFixedSize',
  RANDOMIZE_HEIGHT_FLUCTUATE = 'RandomizeHeightFluctuate', // 随机增加或减少50%
  RANDOMIZE_HEIGHT_RANGE = 'RandomizeHeightRange', // 设置120px-500px随机值
  RANDOMIZE_HEIGHT_INCREMENT = 'RandomizeHeightIncrement', // 随机增加20%-50%
  RANDOMIZE_PATH_POINTS = 'RandomizePathPoints', // 随机变换路径控制点Y轴参数
  RANDOMIZE_ARC_DATA = 'RandomizeArcData', // 随机设置EllipseNode的弧度数据
}

type MessageType = {
  type: UIMessage | PluginMessage,
  data?: any;
}

/**
 * 向UI发送消息
 */
export const sendMsgToUI = (data: MessageType) => {
  mg.ui.postMessage(data, "*")
}


/**
 * 向插件发送消息
 */
export const sendMsgToPlugin = (data: MessageType) => {
  parent.postMessage(data, "*")
}