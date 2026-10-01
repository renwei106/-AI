// The existing invitation entry displays the current campaign and the user's own reward ledger.
(() => {
  const incoming = new URLSearchParams(location.search).get('invite');
  const storedAt=Number(sessionStorage.getItem('shiyu-invitation-at')||0);
  if(Date.now()-storedAt>30*60000)sessionStorage.removeItem('shiyu-invitation-code');
  if(incoming&&incoming.length<1024&&/^[A-Za-z0-9_.-]+$/.test(incoming)){sessionStorage.setItem('shiyu-invitation-code',incoming);sessionStorage.setItem('shiyu-invitation-at',String(Date.now()));}
  window.shiyuInvitationCode=sessionStorage.getItem('shiyu-invitation-code')||'';
  let giftBusy=false,giftOwner='',giftShown=false,giftNextCheck=0;
  const giftIdentity=()=>signed?prefs.accountProfile?.id||'':'';
  const giftReady=()=>giftIdentity()&&document.documentElement.classList.contains('shiyu-account-ready')&&view==='home'&&!document.hidden&&!new URLSearchParams(location.search).has('page')&&typeof accountOnboarding!=='undefined'&&!accountOnboarding&&!document.querySelector('dialog[open],.workspace-guide,.at-drawer:not([hidden])')&&window.ShiyuOnboarding?.giftMayShow?.()===true;
  async function checkGift(){
    const id=giftIdentity();if(id!==giftOwner){giftOwner=id;giftShown=false;}if(!giftReady()||giftBusy||giftShown||Date.now()<giftNextCheck)return;giftBusy=true;giftNextCheck=Date.now()+30000;
    try{const r=await fetch('/api/shiyu/auth/signup-gift',{cache:'no-store'});if(!r.ok)return;const gift=await r.json();if(giftIdentity()!==id||gift.userId!==id||!giftReady()||!gift.pending)return;
      giftShown=true;const d=memberDialog('signup-member-gift','送你一份见面礼');d.innerHTML+='<p class="member-sub">很高兴与你相遇。</p><p class="signup-gift-days"><strong>'+text(gift.days)+'</strong> 天会员</p><p class="member-sub">已送到你的账户，愿接下来的日常多一份美好。</p><button class="member-primary" data-gift-accept>开心收下</button>';
      const acknowledge=async()=>{if(giftIdentity()!==id)return;try{await fetch('/api/shiyu/auth/signup-gift',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:id})})}catch{}};
      d.querySelector('[data-gift-accept]').onclick=()=>d.close();d.addEventListener('close',acknowledge,{once:true});d.showModal();
    }catch{}finally{giftBusy=false}
  }
  window.addEventListener('shiyu-account-state',()=>{if(signed){sessionStorage.removeItem('shiyu-invitation-code');sessionStorage.removeItem('shiyu-invitation-at');window.shiyuInvitationCode='';const url=new URL(location.href);url.searchParams.delete('invite');history.replaceState(history.state,'',url);}document.querySelector('#signup-member-gift')?.close();giftOwner='';giftShown=false;giftNextCheck=0;});
  setInterval(()=>void checkGift(),2500);
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
  window.addEventListener('shiyu-account-state', () => { accountGeneration++;loading=null;loadedAt = 0; campaignData = null; document.querySelector('#member-invite-dialog')?.close(); document.querySelector('#member-invite-records')?.close(); updateEntry(); });
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
      const rules = campaign ? '<section class="invitation-rules-block"><h3><small>01</small> 活动规则</h3><p class="invite-rule-summary">'+text(campaign.name)+'</p><div class="invite-reward-cards"><article><small>好友首次注册成功，你可获得</small><strong>+'+text(campaign.registrationInviterDays??0)+'<em>天会员</em></strong><small class="invite-both-reward">你得 '+text(campaign.registrationInviterDays??0)+' 天会员，好友同时得 '+text(campaign.newUserDays)+' 天会员。</small></article><article><small>好友首次付费成功，你可获得</small><strong>+'+text(campaign.inviterDays)+'<em>天会员</em></strong></article></div><p class="invite-rule-summary">好友需在注册后 '+text(campaign.purchaseWithinDays)+' 天内首次付费，每个阶段仅计奖一次。'+text(cap(campaign.weeklyCap,'周')+cap(campaign.monthlyCap,'月'))+' 活动截止 '+text(new Date(campaign.end).toLocaleString())+'。</p></section>' : '<section class="invitation-rules-block"><h3><small>01</small> 活动规则</h3><p class="invite-rule-summary">邀请奖励以后台活动配置为准。活动开启后，这里会展示好友注册奖励、首次购买奖励与可获得上限。</p></section>';
      target.innerHTML = rules;
      const items = Array.isArray(result.items) ? result.items : [];
      target.innerHTML = '<section class="invite-share-card"><div><small>分享拾隅</small><p>把值得的内容留在身边，也分享给同样在意的人。</p></div><input readonly aria-label="分享链接" value="'+text(link)+'"><div class="invite-share-actions"><button class="member-primary" data-copy-invitation>复制邀请链接</button><button type="button" data-share-invitation>分享</button></div></section>' + target.innerHTML;
      const recordsHtml = '<section class="invitation-records-block"><h3><small>02</small> 我的奖励</h3><div class="invite-summary-grid"><article><small>累计奖励</small><strong>'+text(items.reduce((sum,item)=>sum+Number(item.days||0),0))+'<em>天</em></strong></article><article><small>注册奖励</small><strong>'+text(items.filter(item=>/^注册奖励$/.test(item.type)).reduce((sum,item)=>sum+Number(item.days||0),0))+'<em>天</em></strong></article><article><small>付费奖励</small><strong>'+text(items.filter(item=>/^付费奖励$/.test(item.type)).reduce((sum,item)=>sum+Number(item.days||0),0))+'<em>天</em></strong></article></div>'+(items.length ? '<div class="invite-record-list"><div class="invite-record-head"><span>活动</span><span>奖励类型</span><span>状态</span><span>天数</span></div>'+items.map(item=>'<div class="invite-record-row"><span><b>'+text(item.campaignName)+'</b><small>'+text(new Date(item.occurredAt).toLocaleDateString())+'</small></span><span>'+text(window.ShiyuI18n?.text(item.type)||item.type)+'</span><span>'+text(window.ShiyuI18n?.text(item.note)||item.note)+'</span><strong>'+text(item.days)+' 天</strong></div>').join('')+'</div>' : '<p class="member-sub">奖励到账后，会记录在这里。</p>')+'</section>';
      target.insertAdjacentHTML('beforeend','<button type="button" class="invite-records-entry" data-invite-records>查看邀请明细 →</button>');
      target.querySelector('[data-invite-records]').onclick=()=>{
        const detail=memberDialog('member-invite-records','邀请明细');detail.classList.add('invite-monochrome');detail.innerHTML+=recordsHtml;detail.showModal();
      };
      target.querySelector('[data-copy-invitation]')?.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(link); toast('邀请链接已复制'); }
        catch { const input = target.querySelector('input'); input.focus(); input.select(); toast('请复制已选中的邀请链接'); }
      });
      target.querySelector('[data-share-invitation]')?.addEventListener('click', async () => {
        if (!navigator.share) { target.querySelector('[data-copy-invitation]')?.click(); return; }
        try { await navigator.share({ title: '拾隅', text: shareCopy, url: link }); } catch { /* User cancelled the native share sheet. */ }
      });
    } catch (error) { target.textContent = error.message || '活动暂时无法加载'; }
  };
})();
