// The existing invitation entry displays the current campaign and the user's own reward ledger.
(() => {
  const incoming = new URLSearchParams(location.search).get('invite');
  const storedAt=Number(sessionStorage.getItem('shiyu-invitation-at')||0);
  if(Date.now()-storedAt>30*60000)sessionStorage.removeItem('shiyu-invitation-code');
  if(incoming&&incoming.length<1024&&/^[A-Za-z0-9_.-]+$/.test(incoming)){sessionStorage.setItem('shiyu-invitation-code',incoming);sessionStorage.setItem('shiyu-invitation-at',String(Date.now()));}
  window.shiyuInvitationCode=sessionStorage.getItem('shiyu-invitation-code')||'';
  let signupOffer=null,signupLoaded=false,signupPending=false;
  const expiry=value=>new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false});
  function paintSignup(){
    const login=document.querySelector('#login');if(!login?.open)return;
    let note=login.querySelector('[data-signup-reward]');
    const r=signupOffer?.registration;
    const visible=signupLoaded&&!window.shiyuInvitationCode&&!signed&&r&&Date.parse(r.end)>Date.now();
    if(!visible){note?.remove();return;}
    if(!note){note=document.createElement('p');note.dataset.signupReward='';note.className='member-sub';login.append(note);}
    const value='新用户限时注册，赠送 '+r.days+' 天会员。'+expiry(r.end)+' 前完成注册，自注册成功起可使用 '+r.days+' 天。';if(note.textContent!==value)note.textContent=value;
  }
  async function refreshSignup(showInvite=false){if(signupPending)return;signupPending=true;try{const response=await fetch('/api/shiyu/auth/signup-rewards?invite='+encodeURIComponent(window.shiyuInvitationCode),{cache:'no-store'});if(!response.ok)throw Error();signupOffer=await response.json();signupLoaded=true;
    if(!signupOffer.invitation&&window.shiyuInvitationCode){window.shiyuInvitationCode='';sessionStorage.removeItem('shiyu-invitation-code');sessionStorage.removeItem('shiyu-invitation-at');if(showInvite&&!signed)toast('邀请活动已结束或链接无效，注册奖励以登录页为准');}
    if(showInvite&&!signed&&signupOffer.invitation){const r=signupOffer.invitation,d=memberDialog('invitation-arrival','好友邀你加入拾隅');d.innerHTML+='<p class="member-sub">限时注册登录，可获 '+text(r.days)+' 天会员</p><p class="member-sub">仅限首次注册；邀请人同时获赠 '+text(r.inviterDays)+' 天。<br>'+text(expiry(r.end))+' 截止（北京时间），会员自注册成功起可使用 '+text(r.days)+' 天。</p><button class="member-primary" data-invite-register>注册 / 登录领取</button><button data-invite-later>先逛逛</button>';d.querySelector('[data-invite-register]').onclick=()=>{d.close();show('#login');paintSignup()};d.querySelector('[data-invite-later]').onclick=()=>d.close();d.showModal();}
    paintSignup();
  }catch{signupLoaded=false;}finally{signupPending=false}}
  new MutationObserver(paintSignup).observe(document.querySelector('#login'),{attributes:true,childList:true,subtree:true});
  window.addEventListener('shiyu-account-state',()=>{if(signed){sessionStorage.removeItem('shiyu-invitation-code');sessionStorage.removeItem('shiyu-invitation-at');window.shiyuInvitationCode='';document.querySelector('#invitation-arrival')?.close();const url=new URL(location.href);url.searchParams.delete('invite');history.replaceState(history.state,'',url);}signupLoaded=false;void refreshSignup();});
  window.addEventListener('focus',()=>void refreshSignup());
  setInterval(()=>{if(Date.now()-Number(sessionStorage.getItem('shiyu-invitation-at')||0)>30*60000){window.shiyuInvitationCode='';sessionStorage.removeItem('shiyu-invitation-code');}if(document.querySelector('#login')?.open)void refreshSignup();},15000);
  setTimeout(()=>void refreshSignup(!!incoming),0);
  const text = value => esc(String(value ?? ''));
  let campaignData = null, loadedAt = 0, loading = null, accountGeneration = 0;
  async function loadCampaign() {
    if (loading) return loading;
    if (Date.now() - loadedAt < 30000) return campaignData;
    const generation=accountGeneration;
    loading = fetch('/api/shiyu/auth/invitations', { credentials: 'same-origin', cache: 'no-store' }).then(async response => {
      const result = await response.json(); if (!response.ok) throw Error(result.message || '活动暂时无法加载');
      if(generation!==accountGeneration)throw Error('账号已切换，请重新打开邀请页');
      loadedAt = Date.now(); campaignData = result; return result;
    }).finally(() => { if(generation===accountGeneration)loading = null; });
    return loading;
  }
  function updateEntry() {
    const entry = document.querySelector('#member-center [data-invite-entry] small');
    if (!entry) return;
    const campaign = campaignData?.campaign;
    const label = campaign ? `好友注册双方获赠会员 · 首次付费你得 ${campaign.inviterDays} 天` : '查看邀请活动与奖励';
    if (entry.textContent !== label) entry.textContent = label;
    if (signed && Date.now() - loadedAt >= 30000 && !loading) void loadCampaign().then(updateEntry).catch(() => { loadedAt = Date.now(); });
  }
  new MutationObserver(updateEntry).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('focus', updateEntry);
  window.addEventListener('shiyu-account-state', () => { accountGeneration++;loading=null;loadedAt = 0; campaignData = null; document.querySelector('#member-invite-dialog')?.close(); updateEntry(); });
  updateEntry();
  openMemberInvite = async function () {
    if (!signed) { show('#login'); return; }
    const dialog = memberDialog('member-invite-dialog', '邀请同频的人，让喜欢延续。');
    dialog.classList.add('invite-monochrome');
    dialog.innerHTML += '<div class="member-invite-content">正在加载活动…</div>';
    dialog.showModal();
    const target = dialog.querySelector('.member-invite-content');
    try {
      const result = await loadCampaign();
      if (!dialog.open) return;
      const campaign = result.campaign;
      const link = result.invitationCode ? location.origin + '/?invite=' + encodeURIComponent(result.invitationCode) : location.origin + '/';
      const shareCopy = '我在拾隅为喜欢的内容留了一个位置。注册后，你可以把网页和灵感按自己的方式收藏、分类、随时回看。点开看看：\n' + link;
      const cap = (value, period) => value === null ? '' : `每${period}最多可获得 ${value} 天奖励。`;
      const rules = campaign ? '<section class="invitation-rules-block"><h3><small>01</small> 活动规则</h3><p class="invite-rule-summary">'+text(campaign.name)+'</p><div class="invite-reward-cards"><article><small>好友注册获赠（你同时获赠 '+text(campaign.registrationInviterDays??0)+' 天）</small><strong>+'+text(campaign.newUserDays)+'<em>天会员</em></strong></article><article><small>好友首次付费成功，你可获得</small><strong>+'+text(campaign.inviterDays)+'<em>天会员</em></strong></article></div><p class="invite-rule-summary">好友需在注册后 '+text(campaign.purchaseWithinDays)+' 天内首次付费，每个阶段仅计奖一次。'+text(cap(campaign.weeklyCap,'周')+cap(campaign.monthlyCap,'月'))+' 活动截止 '+text(new Date(campaign.end).toLocaleString())+'。</p></section>' : '<section class="invitation-rules-block"><h3><small>01</small> 活动规则</h3><p class="invite-rule-summary">邀请奖励以后台活动配置为准。活动开启后，这里会展示好友注册奖励、首次购买奖励与可获得上限。</p></section>';
      target.innerHTML = rules;
      const items = Array.isArray(result.items) ? result.items : [];
      target.innerHTML = '<section class="invite-share-card"><div><small>分享拾隅</small><p>把值得的内容留在身边，也分享给同样在意的人。</p></div><input readonly aria-label="分享链接" value="'+text(link)+'"><div class="invite-share-actions"><button class="member-primary" data-copy-invitation>复制分享文案</button><button type="button" data-share-invitation>分享</button></div></section>' + target.innerHTML;
      target.innerHTML += '<section class="invitation-records-block"><h3><small>02</small> 我的奖励</h3><div class="invite-summary-grid"><article><small>累计奖励</small><strong>'+text(items.reduce((sum,item)=>sum+Number(item.days||0),0))+'<em>天</em></strong></article><article><small>注册奖励</small><strong>'+text(items.filter(item=>/^注册奖励$/.test(item.type)).reduce((sum,item)=>sum+Number(item.days||0),0))+'<em>天</em></strong></article><article><small>付费奖励</small><strong>'+text(items.filter(item=>/^付费奖励$/.test(item.type)).reduce((sum,item)=>sum+Number(item.days||0),0))+'<em>天</em></strong></article></div>'+(items.length ? '<div class="invite-record-list"><div class="invite-record-head"><span>活动</span><span>奖励类型</span><span>状态</span><span>天数</span></div>'+items.map(item=>'<div class="invite-record-row"><span><b>'+text(item.campaignName)+'</b><small>'+text(new Date(item.occurredAt).toLocaleDateString())+'</small></span><span>'+text(window.ShiyuI18n?.text(item.type)||item.type)+'</span><span>'+text(window.ShiyuI18n?.text(item.note)||item.note)+'</span><strong>'+text(item.days)+' 天</strong></div>').join('')+'</div>' : '<p class="member-sub">奖励到账后，会记录在这里。</p>')+'</section>';
      target.querySelector('[data-copy-invitation]')?.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(shareCopy); toast('分享文案已复制'); }
        catch { const input = target.querySelector('input'); input.focus(); input.select(); toast('请复制已选中的邀请链接'); }
      });
      target.querySelector('[data-share-invitation]')?.addEventListener('click', async () => {
        if (!navigator.share) { target.querySelector('[data-copy-invitation]')?.click(); return; }
        try { await navigator.share({ title: '拾隅', text: shareCopy, url: link }); } catch { /* User cancelled the native share sheet. */ }
      });
    } catch (error) { target.textContent = error.message || '活动暂时无法加载'; }
  };
})();
