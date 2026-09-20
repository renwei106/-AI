// The existing invitation entry displays the current campaign and the user's own reward ledger.
(() => {
  const incoming = new URLSearchParams(location.search).get('invite');
  if (incoming && incoming.length < 180 && /^[A-Za-z0-9:_-]+$/.test(incoming)) sessionStorage.setItem('shiyu-invitation-code', incoming);
  window.shiyuInvitationCode = sessionStorage.getItem('shiyu-invitation-code') || '';
  const text = value => esc(String(value ?? ''));
  let campaignData = null, loadedAt = 0, loading = null;
  async function loadCampaign() {
    if (loading) return loading;
    if (Date.now() - loadedAt < 30000) return campaignData;
    loading = fetch('/api/shiyu/auth/invitations', { credentials: 'same-origin', cache: 'no-store' }).then(async response => {
      const result = await response.json(); if (!response.ok) throw Error(result.message || '活动暂时无法加载');
      loadedAt = Date.now(); campaignData = result; return result;
    }).finally(() => { loading = null; });
    return loading;
  }
  function updateEntry() {
    const entry = document.querySelector('#member-center [data-invite-entry] small');
    if (!entry) return;
    const campaign = campaignData?.campaign;
    const label = campaign ? `好友注册得 ${campaign.newUserDays} 天 · 首次付费你得 ${campaign.inviterDays} 天` : '查看邀请活动与奖励';
    if (entry.textContent !== label) entry.textContent = label;
    if (signed && Date.now() - loadedAt >= 30000 && !loading) void loadCampaign().then(updateEntry).catch(() => { loadedAt = Date.now(); });
  }
  new MutationObserver(updateEntry).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('focus', updateEntry);
  window.addEventListener('shiyu-account-state', () => { loadedAt = 0; campaignData = null; updateEntry(); });
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
      const link = result.invitationCode ? location.origin + '/?invite=' + encodeURIComponent(result.invitationCode) : '';
      const cap = (value, period) => value === null ? '' : `每${period}最多可获得 ${value} 天奖励。`;
      target.innerHTML = campaign ? '<p class="member-sub">'+text(campaign.name)+'</p><section class="invitation-rules-block"><h3><small>01</small> 活动规则</h3><div class="invite-reward-cards"><article><small>好友通过邀请首次注册，可获得</small><strong>+'+text(campaign.newUserDays)+'<em>天会员</em></strong></article><article><small>好友首次付费成功，你可获得</small><strong>+'+text(campaign.inviterDays)+'<em>天会员</em></strong></article></div><p class="invite-rule-summary">好友需在注册后 '+text(campaign.purchaseWithinDays)+' 天内首次付费，每个阶段仅计奖一次。'+text(cap(campaign.weeklyCap,'周')+cap(campaign.monthlyCap,'月'))+' 活动截止 '+text(new Date(campaign.end).toLocaleString())+'。</p></section>' : '<p class="member-sub">当前暂无进行中的邀请活动，期待与你分享下一份惊喜。</p>';
      const items = Array.isArray(result.items) ? result.items : [];
      target.innerHTML += '<section class="invitation-records-block"><h3><small>02</small> 我的奖励</h3><div class="invite-summary-grid"><article><small>累计奖励</small><strong>'+text(items.reduce((sum,item)=>sum+Number(item.days||0),0))+'<em>天</em></strong></article><article><small>注册奖励</small><strong>'+text(items.filter(item=>item.type==='注册奖励').reduce((sum,item)=>sum+Number(item.days||0),0))+'<em>天</em></strong></article><article><small>付费奖励</small><strong>'+text(items.filter(item=>item.type==='付费奖励').reduce((sum,item)=>sum+Number(item.days||0),0))+'<em>天</em></strong></article></div>'+(items.length ? '<div class="invite-record-list"><div class="invite-record-head"><span>活动</span><span>奖励类型</span><span>状态</span><span>天数</span></div>'+items.map(item=>'<div class="invite-record-row"><span><b>'+text(item.campaignName)+'</b><small>'+text(new Date(item.occurredAt).toLocaleDateString())+'</small></span><span>'+text(item.type)+'</span><span>'+text(item.note)+'</span><strong>'+text(item.days)+' 天</strong></div>').join('')+'</div>' : '<p class="member-sub">奖励到账后，会记录在这里。</p>')+'</section>';
      if (link) target.innerHTML += '<div class="member-invite-link-row"><input readonly aria-label="邀请链接" value="'+text(link)+'"><button class="member-primary" data-copy-invitation>复制邀请链接</button></div>';
      target.querySelector('[data-copy-invitation]')?.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(link); toast('邀请链接已复制'); }
        catch { const input = target.querySelector('input'); input.focus(); input.select(); toast('请复制已选中的邀请链接'); }
      });
    } catch (error) { target.textContent = error.message || '活动暂时无法加载'; }
  };
})();
