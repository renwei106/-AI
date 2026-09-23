// Real checkout adapts the existing membership UI; all prices and payment states come from the server.
(() => {
 'use strict';
 const API = '/api/shiyu/payments';
 let status = null, account = null, currentOrder = null, timer = null, submitting = false;
 let pendingRequest = null, resultView = false, cashierUrl = '', cashierError = '', cashierLoading = false, cashierAttempt = 0;
 let quantities = Object.create(null);
 const originalCenter = openMemberCenter, originalOrders = openMemberOrders;
 const originalAgreement = simulatePayment;
 const text = value => esc(String(value ?? ''));
 const money = cents => (cents / 100).toFixed(2);
 async function request(path, options = {}) {
  const response = await fetch(API + path, { cache: 'no-store', ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
  const data = await response.json();
  if (!response.ok) { const error = new Error(data.message || '支付服务暂时无法连接'); Object.assign(error, { code: data.code, orderId: data.orderId }); throw error; }
  return data;
 }
 function decorate() {
  const d = document.querySelector('#member-center');
  if (!d?.open) return;
  const button = d.querySelector('.member-checkout>.member-primary'), note = d.querySelector('.simulation-note');
  if (!button) return;
  if (!button.dataset.paymentWidth) {
   button.style.minWidth = button.getBoundingClientRect().width + 'px';
   button.dataset.paymentWidth = 'preserved';
  }
  const available = ['alipay','wechat'].filter(id => status?.providers?.[id] && status.providers[id].enabled !== false);
  if (available.length && !available.includes(memberPayment)) { memberPayment=available[0]; originalCenter(); decorate(); return; }
  const methods=d.querySelector('.checkout-methods');
  if(methods){ methods.hidden=!available.length; methods.querySelectorAll('[data-method-choice],[data-footer-pay]').forEach(item=>{if(!available.includes(item.dataset.methodChoice||item.dataset.footerPay))item.remove();}); }
  const plan = MEMBER_CONFIG.plans[selectedMemberPlan], recurring = plan?.auto || plan?.autoRenew;
  renderQuantity(d, plan, recurring);
  renderMemberAccountSummary(d);
  button.disabled = freeMemberSelected || recurring || !status?.providers?.[memberPayment]?.ready || submitting;
  button.setAttribute('aria-busy', submitting ? 'true' : 'false');
  d.querySelectorAll('[data-member-plan],[data-payment],[data-member-quantity],[data-member-quantity-value]').forEach(control => { control.disabled = submitting; });
  button.textContent = freeMemberSelected ? '免费使用' : recurring ? '连续订阅暂未开放' : !status?.providers?.[memberPayment]?.ready ? '支付暂未开放' : submitting ? '正在创建订单…' : '立即支付';
  button.onclick = purchase;
  if (note) {
   if (!note.dataset.paymentWidth) {
    note.style.minWidth = note.getBoundingClientRect().width + 'px';
    note.dataset.paymentWidth = 'preserved';
   }
   note.textContent = status?.enabled && status.mode === 'integration' ? '联调支付会产生真实扣款' : '\u00a0';
  }
  if (account) {
   const memberStatus = d.querySelector('.member-status>span');
   if (memberStatus) memberStatus.textContent = account.member ? account.permanent ? '永久会员' : '会员有效至 ' + new Date(account.expiresAt).toLocaleDateString() : '免费账户';
  }
 }
 function quantityFor(plan) { return Math.max(1, Number(quantities[plan?.id]) || 1); }
 function renderQuantity(dialog, plan, recurring) {
  const checkout = dialog.querySelector('.member-checkout');
  if (!checkout) return;
  checkout.querySelector('.checkout-quantity')?.remove();
  if (!plan?.id || freeMemberSelected || recurring || !Number.isInteger(plan.days) || plan.days < 1) return;
  const max = 3;
  const quantity = Math.min(quantityFor(plan), max);
  quantities[plan.id] = quantity;
  const unit = plan.days >= 360 ? '年' : plan.days >= 80 ? '个季度' : '个月';
  const options = Array.from({ length: max }, (_, index) => index + 1).map(value => `<button type="button" data-member-quantity-value="${value}"${value === quantity ? ' aria-pressed="true"' : ''}>${value} ${unit}</button>`).join('');
  const control = document.createElement('label');
  control.className = 'checkout-quantity';
  control.innerHTML = `<span class="checkout-quantity-label">购买数量</span><span class="quantity-picker"><button type="button" class="quantity-picker-trigger" data-member-quantity aria-haspopup="listbox" aria-expanded="false">${quantity} ${unit}<span aria-hidden="true">⌃</span></button><span class="quantity-picker-menu" role="listbox" hidden>${options}</span></span>`;
  const choice = checkout.querySelector('.checkout-choice');
  checkout.insertBefore(control, choice || checkout.firstChild);
  const price = checkout.querySelector('.checkout-choice .checkout-price');
  if (price && !choice.querySelector('.checkout-total-prefix')) {
    const prefix = document.createElement('span');
    prefix.className = 'checkout-total-prefix';
    prefix.textContent = '订单总额';
    price.before(prefix);
  }
  if (price) price.textContent = '¥' + (Number(plan.price) * quantity).toFixed(2).replace(/\.00$/, '');
  const trigger = control.querySelector('[data-member-quantity]'), menu = control.querySelector('.quantity-picker-menu');
  trigger.onclick = () => { menu.hidden = !menu.hidden; trigger.setAttribute('aria-expanded', String(!menu.hidden)); };
  control.querySelectorAll('[data-member-quantity-value]').forEach(option => option.onclick = () => { quantities[plan.id] = Number(option.dataset.memberQuantityValue); pendingRequest = null; decorate(); });
 }
 function renderMemberAccountSummary(dialog) {
  const heading = dialog.querySelector('.member-heading');
  if (!heading) return;
  dialog.querySelector(':scope > .member-account-summary')?.remove();
  const profile = typeof accountProfile === 'function' ? accountProfile() : {};
  const entitlements = window.__shiyuUserEntitlements || account || {};
  const expiry = entitlements.permanent ? '永久有效' : Number(entitlements.expiresAt) > Date.now()
   ? '有效期至 ' + new Date(Number(entitlements.expiresAt)).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
   : '当前为免费版';
  const identity = profile.email || profile.phone || profile.id || '当前登录账户';
  const avatar = typeof avatarMarkup === 'function' ? avatarMarkup(profile.avatar) : '';
  const summary = document.createElement('div');
  summary.className = 'member-account-summary';
  summary.innerHTML = `<span class="member-account-summary-avatar">${avatar}</span><span class="member-account-summary-copy"><b>${text(profile.name || '当前用户')}</b><small>${text(identity)} · ${text(expiry)}</small></span>`;
  heading.insertAdjacentElement('afterend', summary);
}
 openMemberCenter = function () { originalCenter(); decorate(); void refreshStatus(); };
 async function refreshAccount() {
  await window.refreshShiyuMembership?.();
  account = window.__shiyuUserEntitlements || null;
  decorate();
  if (typeof updateHeader === 'function') updateHeader();
 }
 window.addEventListener('shiyu-user-entitlements', () => { account = window.__shiyuUserEntitlements; decorate(); });
 async function purchase() {
  if (submitting) return;
  if (!status?.providers?.[memberPayment]?.ready) { toast('该支付方式暂未开放'); return; }
  const plan = MEMBER_CONFIG.plans[selectedMemberPlan];
  if (!plan?.id || freeMemberSelected) { toast('请等待套餐加载完成'); return; }
  if (plan.auto || plan.autoRenew) { toast('连续订阅暂未开放，请选择月度或年度会员'); return; }
  if (!memberAgreed) {
   originalAgreement();
   const dialog = document.querySelector('#agreement-required-dialog');
   const confirm = dialog?.querySelector('[data-return-agreement]');
   if (confirm) confirm.onclick = () => { memberAgreed = true; const input = document.querySelector('[data-member-agree]'); if (input) input.checked = true; dialog.close(); purchase(); };
   return;
  }
  submitting = true; decorate();
  const quantity = quantityFor(plan), selection = plan.id + ':' + memberPayment + ':' + quantity;
  if (!pendingRequest || pendingRequest.selection !== selection) pendingRequest = { selection, requestId: crypto.randomUUID().replaceAll('-', '') };
  try {
   const data = await request('/orders', { method: 'POST', body: JSON.stringify({ planId: plan.id, quantity, provider: memberPayment, requestId: pendingRequest.requestId, accepted: true }) });
   showOrder(data.order);
  } catch (error) {
   if (error.orderId) {
    try { const data = await request('/orders/' + error.orderId); showOrder(data.order); } catch { toast('下单结果尚未确认，请在我的订单中查询，勿重复付款'); }
   } else toast(error.message);
  } finally { submitting = false; decorate(); }
 }
 simulatePayment = purchase;
 // The older page has multiple render wrappers. Capture checkout clicks to prevent any saved demo handler from running.
 document.addEventListener('click', event => {
  const button = event.target.closest('#member-center .member-checkout>.member-primary');
  if (!button) return;
  event.preventDefault(); event.stopImmediatePropagation();
  if (!button.disabled) purchase();
 }, true);
 function stopPolling() { clearTimeout(timer); timer = null; }
 function showOrder(order, showResult = false) {
  stopPolling(); currentOrder = order; resultView = showResult; cashierUrl = ''; cashierError = ''; cashierLoading = false; cashierAttempt++;
  const d = memberDialog('payment-order', order.provider === 'wechat' ? '微信扫码支付' : '支付宝支付');
  d.classList.add('payment-order-dialog');
  d.addEventListener('close', stopPolling, { once: true });
  d.innerHTML += '<div class="payment-order-body"></div>';
  paintOrder();
  if (!d.open) d.showModal();
  pollSoon();
 }
 function paintOrder(error = '') {
  const d = document.querySelector('#payment-order'), order = currentOrder;
  if (!d || !order) return;
  const body = d.querySelector('.payment-order-body'), expired = order.expiresAt <= Date.now();
  const quantityText = Number(order.quantity || 1) > 1 ? ` × ${text(order.quantity)}` : '';
  let content = `<div class="member-order-summary"><h3>${text(order.planName)}${quantityText}</h3><strong>¥${money(order.amount)}</strong><p>${order.days} 天 · ${order.provider === 'wechat' ? '微信支付' : '支付宝'}</p></div>`;
  if (order.status === 'paid') {
   content += `<h3 class="payment-confirmed">支付成功</h3><p class="member-sub">${order.fulfillment === 'pending' ? '会员权益正在同步，请稍后刷新查看' : order.memberExpiresAt ? '会员有效期至 ' + text(new Date(order.memberExpiresAt).toLocaleString()) : '永久会员权益保持有效'}</p>`;
   pendingRequest = null;
  } else if (order.status === 'closed') content += '<p class="member-sub">支付已取消，请返回会员中心重新选择。</p>';
  else if (resultView) content += '<p class="member-sub">正在确认支付结果，请稍候。</p>';
  else if (expired) content += '<p class="member-sub">二维码已过期，请返回会员中心重新发起支付。</p>';
  else if (order.checkout?.kind === 'qr') content += `<img class="payment-qr" width="264" height="264" src="${text(order.checkout.image)}" alt="微信支付二维码"><p class="member-sub">使用微信扫一扫完成付款</p>`;
  else if (order.checkout?.kind === 'embedded-qr') content += cashierUrl ? `<iframe class="payment-qr payment-alipay-frame" width="264" height="300" src="${text(cashierUrl)}" title="支付宝支付二维码"></iframe><p class="member-sub">使用支付宝扫一扫完成付款，支付结果将自动更新</p><button type="button" class="payment-retry" data-payment-retry>二维码未显示？重新加载</button>` : `<div class="payment-qr-placeholder" role="status">${text(cashierError || '正在加载支付宝二维码…')}</div>${cashierError ? '<button type="button" class="payment-retry" data-payment-retry>重新加载二维码</button>' : ''}`;
  else content += '<p class="member-sub">正在准备支付二维码，请稍候。</p>';
  if (error) content += `<p class="member-policy" role="status">${text(error)}</p>`;
  if (!['paid', 'closed'].includes(order.status)) content += '<button class="member-primary payment-query" data-payment-query>查询付款结果</button>';
  if (['paid', 'closed'].includes(order.status) || expired) content += '<button class="member-primary" data-payment-done>返回会员中心</button>';
  body.innerHTML = content;
  body.querySelector('[data-payment-query]')?.addEventListener('click', () => poll(true));
  body.querySelector('[data-payment-retry]')?.addEventListener('click', () => { cashierUrl = ''; cashierError = ''; paintOrder(); });
  if (order.checkout?.kind === 'embedded-qr' && !cashierUrl && !cashierError && !cashierLoading && !expired && !resultView && order.status !== 'paid') void loadCashier(order.id);
  body.querySelector('[data-payment-done]')?.addEventListener('click', () => { d.close(); pendingRequest = null; openMemberCenter(); });
 }
 async function loadCashier(id) {
  cashierLoading = true; const attempt = ++cashierAttempt;
  try { const data = await request('/orders/' + id + '/cashier'); if (attempt !== cashierAttempt || currentOrder?.id !== id) return; cashierUrl = data.url; }
  catch (error) { if (attempt !== cashierAttempt || currentOrder?.id !== id) return; cashierError = error.message; }
  finally { if (attempt === cashierAttempt && currentOrder?.id === id) { cashierLoading = false; paintOrder(); } }
 }
 function pollSoon() {
  if (currentOrder && !['paid', 'closed'].includes(currentOrder.status) && document.querySelector('#payment-order')?.open) timer = setTimeout(() => poll(false), 4500);
 }
 async function poll(manual) {
  stopPolling();
  const id = currentOrder?.id;
  if (!id) return;
  try {
   const data = await request('/orders/' + id + '/query', { method: 'POST' });
   if (currentOrder?.id !== id) return;
   const changed = data.order.status !== currentOrder.status || data.order.checkout?.kind !== currentOrder.checkout?.kind || data.order.expiresAt <= Date.now();
   currentOrder = data.order;
   if (changed || manual) paintOrder(manual && !['paid','closed'].includes(currentOrder.status) ? '暂未确认付款成功；若已付款，请稍候再次查询，请勿重复付款。' : '');
   if (currentOrder.status === 'paid') await refreshAccount();
  } catch (error) { if (manual && currentOrder?.id === id) paintOrder(error.message); }
  pollSoon();
 }
 openMemberOrders = function () {
  const d = memberDialog('member-orders', '我的订单');
  d.innerHTML += '<div class="member-empty">正在加载订单…</div>'; d.showModal();
  Promise.allSettled([request('/orders'), fetch('/api/shiyu/auth/membership-records', { credentials: 'same-origin', cache: 'no-store' }).then(async response => { const data = await response.json(); if (!response.ok) throw Error(data.message || '记录加载失败'); return data; })]).then(results => {
   if (!d.open) return;
   const target = d.querySelector('.member-empty'), payments = results[0].status === 'fulfilled' ? results[0].value.items : [];
   const records = results[1].status === 'fulfilled' ? results[1].value.items : [];
   if (results.every(item => item.status === 'rejected')) { target.textContent = results[1].reason.message; return; }
   const labels = { created: '待支付', pending: '待支付', unknown: '结果待确认', paid: '支付成功', closed: '已关闭' };
   const paidRows = payments.map((o, i) => '<button class="member-order-row" data-real-order="'+i+'"><span>'+text(o.planName)+'<small>'+text(new Date(o.createdAt).toLocaleString())+'</small></span><span>¥'+money(o.amount)+'<small>'+text(labels[o.status] || o.status)+'　↗</small></span></button>').join('') + records.filter(r => r.source === 'payment' && !payments.some(o => o.id === r.orderId)).map(r => '<div class="member-order-row"><span>'+text(r.title)+'<small>'+text(new Date(r.time).toLocaleString())+'</small></span><span>¥'+Number(r.amount || 0).toFixed(2)+'<small>'+text(r.duration)+'</small></span></div>').join('');
   const rewards = records.filter(r => r.source === 'reward').map(r => '<div class="member-order-row"><span>'+text(r.title)+'<small>'+text(new Date(r.time).toLocaleString())+'</small></span><span>'+text(r.duration)+'<small>活动奖励</small></span></div>').join('');
   target.innerHTML = '<h3>购买与续费</h3>'+(paidRows || '<p>暂无购买记录</p>')+'<h3>活动奖励</h3>'+(rewards || '<p>暂无奖励记录</p>');
   target.querySelectorAll('[data-real-order]').forEach(button => button.onclick = () => showOrder(payments[Number(button.dataset.realOrder)]));
  });
 };
 async function initialize() {
  try { status = await request('/status'); } catch { status = { enabled: false, providers: {} }; }
  decorate(); await refreshAccount();
  const id = new URLSearchParams(location.search).get('paymentOrder');
  if (id && /^SY[a-f0-9]{28}$/.test(id)) {
   if (window.parent !== window) { window.parent.postMessage({ type: 'shiyu-payment-return', orderId: id }, location.origin); return; }
   try { const data = await request('/orders/' + id); showOrder(data.order, true); } catch (error) { toast(error.message); }
  }
 }
 async function refreshStatus(){const before=JSON.stringify(status);try{status=await request('/status');}catch{return;}if(before!==JSON.stringify(status)&&document.querySelector('#member-center')?.open){if(!document.querySelector('#payment-order')?.open)originalCenter();decorate();}}
 window.addEventListener('focus',()=>{refreshStatus();refreshAccount();});
 setInterval(()=>{if(!document.hidden)refreshStatus();},5000);
 window.addEventListener('message', event => {
  const frame = document.querySelector('#payment-order .payment-alipay-frame');
  if (event.origin !== location.origin || event.source !== frame?.contentWindow || event.data?.type !== 'shiyu-payment-return' || event.data.orderId !== currentOrder?.id) return;
  resultView = true; paintOrder(); poll(true);
 });
 initialize();
})();
