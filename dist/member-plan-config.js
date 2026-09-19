// Membership presentation shares the administrator's saved catalog and plan order.
(() => {
 let plans = [], selectedId = null;
 // The gate UI consumes the same published catalog as the membership center.
 // Keeping this snapshot on window avoids a second, potentially stale source of
 // quota and feature values while leaving the center's existing rendering intact.
 const publish = (ready = true) => {
  window.__shiyuMemberCatalog = { ready, plans: plans.map(plan => ({ ...plan, entitlements: Array.isArray(plan.entitlements) ? plan.entitlements.map(item => ({ ...item })) : [] })) };
  window.dispatchEvent(new CustomEvent('shiyu-member-catalog', { detail: window.__shiyuMemberCatalog }));
 };
 const original = openMemberCenter;
 function syncMemberHeader() {
  const heading = document.querySelector('#member-center[open] .member-heading');
  if (!heading) return;
  let message = '';
  if (isMember()) {
   const active = [prefs.membership, prefs.membershipDemo].filter(item => item && Number.isFinite(Number(item.expiresAt)) && Number(item.expiresAt) > Date.now());
   if (active.some(item => Number(item.expiresAt) === Number.MAX_SAFE_INTEGER || String(item.label || '').trim() === '永久')) {
    message = '永久会员 · 永久有效';
   } else if (active.length) {
    const end = new Date(Math.max(...active.map(item => Number(item.expiresAt))));
    if (Number.isFinite(end.getTime())) message = `会员有效期至 ${end.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Shanghai' })}`;
   }
  }
  let label = heading.querySelector('.member-current-status');
  if (!message) { label?.remove(); return; }
  if (!label) {
   label = document.createElement('small');
   label.className = 'member-current-status';
   label.setAttribute('role', 'status');
   heading.insertBefore(label, heading.querySelector('button'));
  }
  label.textContent = message;
 }
 function paint() {
  syncMemberHeader();
  const d = document.querySelector('#member-center');
  if (!d?.open || !plans.length) return;
  const rail = d.querySelector('.member-plans'), table = d.querySelector('.member-comparison table');
  if (!rail || !table) return;
  selectedId = plans.some(p => p.id === selectedId) ? selectedId : plans.find(p => p.id !== 'free')?.id || plans[0].id;
  rail.querySelectorAll('button').forEach(b => b.remove());
  rail.style.gridTemplateColumns = `var(--member-label-width, 280px) repeat(${plans.length},minmax(200px,1fr))`;
  plans.forEach(p => {
   const b = document.createElement('button');
   b.className = p.id === selectedId ? 'selected-plan' : '';
   b.setAttribute('aria-pressed', String(p.id === selectedId));
   b.innerHTML = `<small>${esc(p.tag)}</small><h3>${esc(p.name)}</h3><strong><em>¥</em>${Number(p.price)}</strong><del>${p.original > p.price ? '¥'+Number(p.original) : ''}</del><span>${esc(p.cycle)}</span>`;
   b.onclick = () => { selectedId=p.id; freeMemberSelected=p.id==='free'; if(!freeMemberSelected)selectedMemberPlan=MEMBER_CONFIG.plans.findIndex(x=>x.id===p.id); memberAgreed=false; openMemberCenter(); };
   rail.append(b);
  });
  const rows = [...new Map(plans.flatMap(p=>p.entitlements).map(b=>[b.key,b])).values()];
  table.innerHTML = `<colgroup><col style="width:280px">${plans.map(()=>'<col>').join('')}</colgroup><thead><tr><th>功能权益</th>${plans.map(p=>`<th>${esc(p.name)}</th>`).join('')}</tr></thead><tbody>${rows.map((b,i)=>`<tr><th><span class="benefit-category">${!i||rows[i-1].scope!==b.scope?esc(b.scope):''}</span><span>${esc(b.name)}</span></th>${plans.map(p=>{const value=p.entitlements.find(x=>x.key===b.key);const content=!value?.enabled?'—':value.kind==='quantity'?value.value:value.value||'✓';return `<td class="${content==='✓'?'benefit-check ':''}${p.id===selectedId?'selected-entitlement':''}">${esc(String(content))}</td>`}).join('')}</tr>`).join('')}</tbody>`;
 }
 openMemberCenter = function() { original(); paint(); };
 const originalHeader = updateHeader;
 updateHeader = function(...args) { const result = originalHeader.apply(this, args); syncMemberHeader(); return result; };
 async function refresh() {
  try {
   const r=await fetch('/api/shiyu/plans',{cache:'no-store'});if(!r.ok)throw Error();
   const data=await r.json(),next=data.items.filter(p=>p.enabled);
   if(!next.length) { plans=[];publish();const d=document.querySelector('#member-center'); if(d?.open){d.querySelector('.member-plans').textContent='暂无上架套餐';d.querySelector('.member-comparison table').replaceChildren();d.querySelector('.member-checkout').hidden=true;} return; }
   if(JSON.stringify(plans)===JSON.stringify(next))return;
   plans=next;
   publish();
   const paid=plans.filter(p=>p.id!=='free');
   // Existing checkout uses the paid-plan list; match it by stable plan ID.
   if(paid.length) { MEMBER_CONFIG.plans=paid.map(p=>({...p,auto:p.autoRenew,saving:p.cycle}));selectedMemberPlan=Math.max(0,paid.findIndex(p=>p.id===selectedId)); }
   if(document.querySelector('#member-center')?.open)openMemberCenter();
  }catch{if(!plans.length)publish(false);const d=document.querySelector('#member-center');if(d?.open){d.querySelector('.member-comparison table').innerHTML='<tbody><tr><td>套餐配置暂时无法加载，请稍后重试。</td></tr></tbody>';}}
 }
 syncMemberHeader();refresh();window.addEventListener('focus',refresh);setInterval(refresh,15000);
})();
