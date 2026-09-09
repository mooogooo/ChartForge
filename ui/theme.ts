import { PluginMessage, sendMsgToPlugin, UIMessage } from '@messages/sender';

// 修改根节点主题属性即可更新颜色，不重新挂载 UI，也不影响编辑中的输入。
window.addEventListener('message', event => {
  if (event.source !== parent) return;
  const message = event.data?.pluginMessage ?? event.data;
  if (message?.type === PluginMessage.THEME_CHANGED &&
      (message.data === 'light' || message.data === 'dark')) {
    document.documentElement.dataset.chartforgeTheme = message.data;
  }
});

// UI 准备完成后再请求一次，避免主题消息早于监听器注册而丢失。
sendMsgToPlugin({ type: UIMessage.UI_READY });
