// Real checkout adapts the existing membership UI; all prices and payment states come from the server.
(() => {
 'use strict';
 const API = '/api/shiyu/payments';
 let status = null, account = null, currentOrder = null, timer = null, submitting = false;
 let pendingRequest = null, resultView = false, cashierUrl = '', cashierError = '', cashierLoading = false, cashierAttempt = 0;
 let quantities = Object.create(null);
 let activityQuote = null, activityKey = '', quoteLoading = false, quoteAt = 0, quoteError = '', quoteGeneration = 0;
 let offerQuotes = new Map(), offersAt = 0, offersLoading = false, offersGeneration = 0, offersCatalog = '';
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
  if(methods){
   methods.hidden=!available.length;
   const menu=methods.querySelector('.payment-choice-menu'), trigger=methods.querySelector('.payment-choice-trigger');
   const signature=available.join(',')+':'+memberPayment;
   if(menu && trigger && menu.dataset.providers!==signature){
    menu.dataset.providers=signature;
    menu.innerHTML=available.map(id=>`<button type="button" data-method-choice="${id}">${paymentLineIcon(id)}<span class="payment-choice-label">${id==='alipay'?'支付宝':'微信'}</span><span class="payment-choice-check" aria-hidden="true">${id===memberPayment?'✓':''}</span></button>`).join('');
    trigger.innerHTML=paymentLineIcon(memberPayment)+`<span>${memberPayment==='alipay'?'支付宝':'微信'}</span><span class="payment-choice-chevron" aria-hidden="true"></span>`;
    menu.querySelectorAll('[data-method-choice]').forEach(item=>item.onclick=()=>{memberPayment=item.dataset.methodChoice;openMemberCenter();});
   }
  }
  const plan = MEMBER_CONFIG.plans[selectedMemberPlan], recurring = plan?.auto || plan?.autoRenew;
  renderQuantity(d, plan, recurring);
  renderActivity(d, plan, recurring);
  renderOffers(d);
  renderCheckoutSummary(d,plan);
  renderMemberAccountSummary(d);
  const zero = !!activityQuote && !!plan?.id && activityQuote.planId === plan.id && activityQuote.quantity === quantityFor(plan) && activityQuote.amount === 0 && activityQuote.eligibleQuantity > 0 && activityQuote.end > Date.now();
  button.disabled = freeMemberSelected || recurring || (!zero && !status?.providers?.[memberPayment]?.ready) || submitting;
  button.setAttribute('aria-busy', submitting ? 'true' : 'false');
  d.querySelectorAll('[data-member-plan],[data-payment],[data-member-quantity],[data-member-quantity-value]').forEach(control => { control.disabled = submitting; });
  d.querySelectorAll('[data-published-plan]').forEach(control => { control.disabled = submitting || control.dataset.publishedPlan === 'free'; });
  button.textContent = freeMemberSelected ? '免费使用' : recurring ? '连续订阅暂未开放' : submitting ? '正在创建订单…' : zero ? '确认零元领取' : !status?.providers?.[memberPayment]?.ready ? '支付暂未开放' : '立即支付';
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
 function offerFor(plan) { return activityQuote?.planId === plan?.id ? activityQuote : offerQuotes.get(plan?.id); }
 function activeOffer(q) { return q?.activityId && q.end > Date.now() && q.remainingQuantity > 0; }
 function countdown(end) {
  const seconds = Math.max(0, Math.floor((end - Date.now()) / 1000));
  if (!seconds) return '活动已结束';
  return `剩余 ${Math.floor(seconds / 86400)} 天 ${String(Math.floor(seconds / 3600) % 24).padStart(2,'0')}:${String(Math.floor(seconds / 60) % 60).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`;
 }
 function flipMarkup(end){
  const seconds=Math.max(0,Math.floor((end-Date.now())/1000));
  return [Math.floor(seconds/86400),Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60].map((value,i)=>`<span class="flip-unit"><span class="activity-flip-number">${String(value).padStart(2,'0').split('').map(n=>`<span class="flip-digit" data-flip-value="${n}"><span class="flip-base">${n}</span><span class="flip-top" aria-hidden="true">${n}</span><span class="flip-bottom" aria-hidden="true">${n}</span></span>`).join('')}</span><small>${['天','时','分','秒'][i]}</small></span>`).join('');
 }
 function updateFlip(el){
  const end=Number(el.dataset.activityCountdown),seconds=Math.max(0,Math.floor((end-Date.now())/1000));
  const next=[Math.floor(seconds/86400),Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join('');
  const digits=el.querySelectorAll('.flip-digit');el.setAttribute('aria-label',countdown(end));
  if(digits.length!==next.length){el.innerHTML=flipMarkup(end);return;}
  digits.forEach((digit,i)=>{if(digit.dataset.flipValue===next[i])return;digit.querySelector('.flip-top').textContent=digit.dataset.flipValue;digit.querySelector('.flip-bottom').textContent=next[i];digit.querySelector('.flip-base').textContent=next[i];digit.dataset.flipValue=next[i];digit.classList.remove('is-flipping');void digit.offsetWidth;digit.classList.add('is-flipping');});
 }
 function renderOffers(dialog) {
  const catalog = JSON.stringify(MEMBER_CONFIG.plans.map(p=>[p.id,p.price,p.days,p.autoRenew]));
  if(catalog!==offersCatalog){offersCatalog=catalog;offersAt=0;offersLoading=false;offersGeneration++;offerQuotes.clear();}
  dialog.querySelector('[data-activity-banner]')?.remove();
  const campaigns = new Map();
  for (const plan of MEMBER_CONFIG.plans) {
   const card = [...dialog.querySelectorAll('[data-published-plan]')].find(c=>c.dataset.publishedPlan===plan.id);
   if (!card) continue;
   if (card.dataset.activityOriginal) { card.innerHTML = card.dataset.activityOriginal; delete card.dataset.activityOriginal; }
   const q = offerFor(plan);
   if (!activeOffer(q)) continue;
   campaigns.set(q.activityId,q);
   card.dataset.activityOriginal = card.innerHTML;
   const discount = q.activityUnitCents < q.baseUnitCents;
   const badge = card.querySelector(':scope > small'); badge.className = 'activity-plan-badge';
   badge.textContent = discount ? q.bonusDaysPerUnit ? '限时优惠 + 额外赠送' : q.priceMode === 'fixed' ? '限时优惠' : '限时折扣' : '限时赠送';
   if (discount) {
    card.querySelector('strong').innerHTML = `<em>¥</em>${money(q.activityUnitCents)}`;
    card.querySelector('del').textContent = `${Number(plan.original)*100>q.baseUnitCents?`原价 ¥${Number(plan.original)} · `:''}日常价 ¥${money(q.baseUnitCents)}`;
   }
   const gift = card.querySelector(':scope > span'); gift.className = 'activity-plan-gift';
   gift.textContent = q.bonusDaysPerUnit ? `${plan.days} 天 + 限时赠 ${q.bonusDaysPerUnit} 天` : `${plan.days} 天会员`;
  }
  if (campaigns.size) {
   const banner = document.createElement('section'); banner.dataset.activityBanner = ''; banner.className = 'activity-banner'; banner.setAttribute('aria-label','会员限时活动');
   banner.innerHTML = [...campaigns.values()].map(q=>`<div class="activity-banner-row"><div class="activity-banner-copy"><span class="activity-eyebrow"><i aria-hidden="true"></i>会员限时礼遇 · 现正进行</span><h3>${text(q.activityName)}</h3>${q.activityDescription?`<p>${text(q.activityDescription)}</p>`:''}<button class="activity-jump" type="button" data-activity-jump="${text(q.activityId)}">查看活动套餐 <span aria-hidden="true">→</span></button></div><div class="activity-clock"><span class="activity-countdown-label">距离活动结束</span><div class="activity-flip-clock" data-activity-countdown="${q.end}" aria-label="${countdown(q.end)}">${flipMarkup(q.end)}</div><small>${text(new Date(q.end).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false}))} 截止（北京时间）</small></div></div>`).join('');
   banner.querySelectorAll('[data-activity-jump]').forEach(button=>button.onclick=()=>{const plan=MEMBER_CONFIG.plans.find(p=>activeOffer(offerFor(p))&&offerFor(p).activityId===button.dataset.activityJump);const card=[...dialog.querySelectorAll('[data-published-plan]')].find(c=>c.dataset.publishedPlan===plan?.id);card?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});card?.focus({preventScroll:true});});
   dialog.querySelector('.member-plans')?.before(banner);
  }
  if (!offersLoading && Date.now()-offersAt>15000) void refreshOffers();
 }
 async function refreshOffers() {
  offersLoading = true; const generation = offersGeneration;
  const plans = MEMBER_CONFIG.plans.filter(p=>p.id&&!p.auto&&!p.autoRenew&&p.days>0);
  try {
   const results = await Promise.allSettled(plans.map(p=>request('/quote?planId='+encodeURIComponent(p.id)+'&quantity=1')));
   if (generation!==offersGeneration) return;
   offerQuotes = new Map(results.flatMap((r,i)=>r.status==='fulfilled'?[[plans[i].id,r.value.quote]]:[]));
  } finally { if(generation===offersGeneration){offersLoading=false;offersAt=Date.now();decorate();} }
 }
 function renderActivity(dialog, plan, recurring) {
  dialog.querySelector('[data-membership-activity]')?.remove();
  if (!plan?.id || freeMemberSelected || recurring) return;
  const key = plan.id + ':' + quantityFor(plan);
  if (key !== activityKey) { activityKey = key; activityQuote = null; quoteAt = 0; quoteError = ''; quoteLoading = false; quoteGeneration++; }
  const quote = activityQuote;
  if (quote?.activityId && (quote.end <= Date.now() || !quote.remainingQuantity)) {
   const box = document.createElement('section'); box.dataset.membershipActivity = ''; box.className = 'membership-activity-module'; box.setAttribute('aria-live','polite');
   const ended = quote.end <= Date.now();
   box.innerHTML = `<p>${ended ? '活动已结束，请刷新价格后再购买。' : '当前活动优惠份数已用完，按正常价购买。'}</p>`;
   dialog.querySelector('.member-plans')?.after(box);
   const price = dialog.querySelector('.checkout-choice .checkout-price'); if (price && !ended) price.textContent = '¥' + money(quote.amount);
  } else if (quoteError) {
   const box = document.createElement('section'); box.dataset.membershipActivity = ''; box.className = 'membership-activity-module'; box.setAttribute('role','status');
   box.innerHTML = `<strong>活动价格暂未获取</strong><p>${text(quoteError)}，请确认登录状态后重试。</p><button type="button" data-activity-retry>重新获取价格</button>`;
   box.querySelector('[data-activity-retry]').onclick = () => { if (!quoteLoading) void refreshQuote(plan, key); };
   dialog.querySelector('.member-plans')?.after(box);
  }
  if (quote && quote.planId===plan.id && quote.quantity===quantityFor(plan) && (!quote.activityId || quote.end>Date.now())) {
   const price = dialog.querySelector('.checkout-price'); if(price)price.textContent='¥'+money(quote.amount);
   const duration=dialog.querySelector('.checkout-duration');if(duration)duration.innerHTML=`<strong>共 ${quote.days} 天</strong>${quote.bonusDays?`<small>含赠送 ${quote.bonusDays} 天</small>`:''}`;
  }
  if (!quoteLoading && Date.now() - quoteAt > 15000) void refreshQuote(plan, key);
 }
 async function refreshQuote(plan, key) {
  quoteLoading = true; const generation = quoteGeneration; let changed = false;
  try { const result = await request('/quote?planId='+encodeURIComponent(plan.id)+'&quantity='+quantityFor(plan)); if (generation !== quoteGeneration || activityKey !== key) return; changed = activityQuote?.token !== result.quote.token || activityQuote?.remainingQuantity !== result.quote.remainingQuantity || !!quoteError; if (activityQuote?.activityId && activityQuote.end <= Date.now() && !result.quote.activityId) toast('活动已结束，当前已恢复正常价格，请核对后购买'); activityQuote = result.quote; offerQuotes.set(plan.id,result.quote); quoteError = ''; }
  catch (error) { if (generation !== quoteGeneration || activityKey !== key) return; changed = quoteError !== error.message; quoteError = error.message; }
  finally { if (generation === quoteGeneration && activityKey === key) { quoteLoading = false; quoteAt = Date.now(); if (changed) decorate(); } }
 }
 const activityStyle = document.createElement('style'); activityStyle.textContent = '.membership-activity-module{margin:16px 0;padding:18px 22px;background:var(--accent-soft,var(--surface));border-radius:12px;color:var(--ink)}.membership-activity-module>strong{font-size:15px}.membership-activity-module p{margin:8px 0;font-size:13px}.membership-activity-module small{color:var(--muted);font-size:12px}'; document.head.append(activityStyle);
 function renderQuantity(dialog, plan, recurring) {
  const checkout = dialog.querySelector('.member-checkout');
  if (!checkout) return;
  checkout.querySelector('.checkout-quantity')?.remove();
  if (!plan?.id || freeMemberSelected || recurring || !Number.isInteger(plan.days) || plan.days < 1) return;
  const offer = offerFor(plan);
  const max = activeOffer(offer) ? offer.remainingQuantity : Math.min(3,Math.floor(3660 / plan.days));
  const quantity = Math.min(quantityFor(plan), max);
  quantities[plan.id] = quantity;
  const unit = plan.days >= 360 ? '年' : plan.days >= 80 ? '个季度' : '个月';
  const options = Array.from({ length: max }, (_, index) => index + 1).map(value => `<button type="button" data-member-quantity-value="${value}"${value === quantity ? ' aria-pressed="true"' : ''}>${value} ${unit}</button>`).join('');
  const control = document.createElement('label');
  control.className = 'checkout-quantity';
  control.innerHTML = `<span class="checkout-quantity-label">购买数量</span><span class="quantity-picker"><button type="button" class="quantity-picker-trigger" data-member-quantity aria-haspopup="listbox" aria-expanded="false">${quantity} ${unit}<span aria-hidden="true">⌃</span></button><span class="quantity-picker-menu" role="listbox" hidden>${options}</span></span>`;
  const choice = checkout.querySelector('.checkout-choice');
  checkout.insertBefore(control, choice || checkout.firstChild);
  checkout.querySelector('.checkout-duration')?.remove();
  const duration=document.createElement('span');duration.className='checkout-duration';duration.innerHTML=`<strong>共 ${plan.days*quantity} 天</strong>`;choice?.prepend(duration);
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
 function renderCheckoutSummary(dialog,plan){
  const choice=dialog.querySelector('.checkout-choice');if(!choice||!plan?.id)return;
  const q=activityQuote,quantity=quantityFor(plan),valid=q?.planId===plan.id&&q.quantity===quantity&&(!q.activityId||q.end>Date.now());
  const amount=valid?q.amount:Math.round(Number(plan.price)*100)*quantity,base=valid?q.baseUnitCents*quantity:Math.round(Number(plan.price)*100)*quantity;
  let details=choice.querySelector('.checkout-savings');if(!details){details=document.createElement('small');details.className='checkout-savings';choice.append(details);}
  const hasActivity=valid&&q.eligibleQuantity>0;
  details.innerHTML=hasActivity&&base>amount?`<del>日常 ¥${money(base)}</del> · 已优惠 ¥${money(base-amount)}`:'';
  details.hidden=!details.innerHTML;
  choice.querySelector(':scope > del')?.remove();
  if(!hasActivity&&Number(plan.original)*100*quantity>amount){const original=document.createElement('del');original.className='checkout-original-total';original.textContent='¥'+money(Math.round(Number(plan.original)*100)*quantity);choice.querySelector('.checkout-price')?.after(original);}
  choice.classList.toggle('checkout-without-activity',!hasActivity);
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
 window.addEventListener('shiyu-account-state', () => { activityQuote = null; activityKey = ''; quoteAt = 0; quoteGeneration++; offerQuotes.clear();offersAt=0;offersGeneration++;offersLoading=false; pendingRequest = null; decorate(); });
 async function purchase() {
  if (submitting) return;
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
   const before = activityQuote;
   const { quote } = await request('/quote?planId='+encodeURIComponent(plan.id)+'&quantity='+quantity);
   activityQuote = quote; activityKey = plan.id + ':' + quantity; quoteAt = Date.now();
   if ((quote.activityId || before?.activityId) && before?.token !== quote.token) { pendingRequest = null; toast('活动价格或名额已更新，请确认金额后再次提交'); return; }
   const data = await request('/orders', { method: 'POST', body: JSON.stringify({ planId: plan.id, quantity, provider: memberPayment, requestId: pendingRequest.requestId, accepted: true, quoteToken: quote.token }) });
   quoteAt = 0;
   showOrder(data.order);
   if (data.order.status === 'paid') await refreshAccount();
  } catch (error) {
   if (error.orderId) {
    try { const data = await request('/orders/' + error.orderId); showOrder(data.order); } catch { toast('下单结果尚未确认，请在我的订单中查询，勿重复付款'); }
   } else { if (error.code === 'QUOTE_CHANGED') { pendingRequest = null; quoteAt = 0; } toast(error.message); }
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
  const d = memberDialog('payment-order', order.provider === 'free' ? '零元领取' : order.provider === 'wechat' ? '微信扫码支付' : '支付宝支付');
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
  let content = `<div class="member-order-summary"><h3>${text(order.planName)}${quantityText}</h3><strong>¥${money(order.amount)}</strong><p>${order.days} 天 · ${order.provider === 'free' ? '零元领取，无需支付' : order.provider === 'wechat' ? '微信支付' : '支付宝'}</p></div>`;
  if (order.status === 'paid') {
   content += `<h3 class="payment-confirmed">${order.provider === 'free' ? '领取成功' : '支付成功'}</h3><p class="member-sub">${order.fulfillment === 'review' ? '付款已收到，活动订单需要核查，请联系客服并提供订单号：'+text(order.id) : order.fulfillment === 'pending' ? '会员权益正在同步，请稍后刷新查看' : order.memberExpiresAt ? '会员有效期至 ' + text(new Date(order.memberExpiresAt).toLocaleString()) : '永久会员权益保持有效'}</p>`;
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
   const paidRows = payments.map((o, i) => '<button class="member-order-row" data-real-order="'+i+'"><span>'+text(o.planName)+'<small>'+text(new Date(o.createdAt).toLocaleString())+'</small></span><span>¥'+money(o.amount)+'<small>'+text(o.provider === 'free' && o.status === 'paid' ? '领取成功' : labels[o.status] || o.status)+'　↗</small></span></button>').join('') + records.filter(r => r.source === 'payment' && !payments.some(o => o.id === r.orderId)).map(r => '<div class="member-order-row"><span>'+text(r.title)+'<small>'+text(new Date(r.time).toLocaleString())+'</small></span><span>¥'+Number(r.amount || 0).toFixed(2)+'<small>'+text(r.duration)+'</small></span></div>').join('');
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
 setInterval(()=>{const d=document.querySelector('#member-center');if(d?.open){d.querySelectorAll('[data-activity-countdown]').forEach(el=>{updateFlip(el);});if([...offerQuotes.values()].some(q=>q.activityId&&q.end<=Date.now())){offerQuotes.clear();offersAt=0;decorate();}}},1000);
 setInterval(()=>{if(!document.hidden){refreshStatus();if(document.querySelector('#member-center')?.open&&!offersLoading&&Date.now()-offersAt>15000)void refreshOffers();const plan=MEMBER_CONFIG.plans[selectedMemberPlan];if(document.querySelector('#member-center')?.open&&plan?.id&&!freeMemberSelected&&!quoteLoading&&Date.now()-quoteAt>15000)void refreshQuote(plan,plan.id+':'+quantityFor(plan));}},5000);
 window.addEventListener('message', event => {
  const frame = document.querySelector('#payment-order .payment-alipay-frame');
  if (event.origin !== location.origin || event.source !== frame?.contentWindow || event.data?.type !== 'shiyu-payment-return' || event.data.orderId !== currentOrder?.id) return;
  resultView = true; paintOrder(); poll(true);
 });
 initialize();
})();
