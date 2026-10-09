// A private local-storage adapter, shared by popup and panel. Its document loads
// three small scripts, never the website application or the current browser tab.
export function attachLocalClient(api) {
  const clientId = crypto.randomUUID();
  let port, frame, origin;
  const pending = new Map();
  function remove(id, result) {
    const item = pending.get(id); if (!item) return;
    pending.delete(id); clearTimeout(item.timer);
    try { port?.postMessage({ type: 'local-result', id, ...result }); } catch { /* The popup has closed. */ }
  }
  function connect() {
    if (port) return;
    port = api.runtime.connect({ name: 'shiyu-local-v1:' + clientId });
    port.onDisconnect.addListener(() => {
      port = null; for (const item of pending.values()) clearTimeout(item.timer); pending.clear();
      frame?.remove(); frame = null; origin = null;
    });
    port.onMessage.addListener(message => {
      if (message?.type !== 'local-request' || typeof message.id !== 'string') return;
      const expected = new URL(message.site).origin;
      if (origin && origin !== expected && pending.size) { port.postMessage({ type: 'local-result', id: message.id, ok: false, error: '登录账号已变化，请重新打开插件。' }); return; }
      if (!frame || origin !== expected) {
        frame?.remove(); origin = expected;
        frame = document.createElement('iframe'); frame.hidden = true; frame.setAttribute('aria-hidden', 'true');
        frame.src = new URL('/extension/bridge.html', origin).href;
        frame.addEventListener('load', () => { for (const item of pending.values()) dispatch(item.message); });
        document.body.append(frame);
      }
      const duration = message.deadline - Date.now();
      if (duration <= 0) { port.postMessage({ type: 'local-result', id: message.id, ok: false, error: '读取超时，请重试连接拾隅。' }); return; }
      pending.set(message.id, { message, timer: setTimeout(() => remove(message.id, { ok: false, error: '读取超时，请重试连接拾隅。' }), duration) });
      dispatch(message);
    });
  }
  function dispatch(message) {
    if (Date.now() >= message.deadline) return;
    frame?.contentWindow?.postMessage({ ...message, protocol: 'shiyu-local-v1' }, origin);
  }
  window.addEventListener('message', event => {
    if (event.source !== frame?.contentWindow || event.origin !== origin || event.data?.protocol !== 'shiyu-local-v1') return;
    const result = event.data;
    remove(result.id, result.ok ? { ok: true, value: result.value } : { ok: false, error: result.error });
  });
  return { send(message) { connect(); return api.runtime.sendMessage({ ...message, clientId }); } };
}
