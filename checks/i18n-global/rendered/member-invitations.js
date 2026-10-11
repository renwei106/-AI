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
      const result = await response.json(); if (!response.ok) throw Error(result.message || "Couldn't load the event");
      loadedAt = Date.now(); campaignData = result; return result;
    }).finally(() => { loading = null; });
    return loading;
  }
  function updateEntry() {
    const entry = document.querySelector('#member-center [data-invite-entry] small');
    if (!entry) return;
    const campaign = campaignData?.campaign;
    const label = campaign ? `Friend joins: ${campaign.newUserDays} days · First payment: ${campaign.inviterDays} days for you` : "View invite rewards";
    if (entry.textContent !== label) entry.textContent = label;
    if (signed && Date.now() - loadedAt >= 30000 && !loading) void loadCampaign().then(updateEntry).catch(() => { loadedAt = Date.now(); });
  }
  new MutationObserver(updateEntry).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('focus', updateEntry);
  window.addEventListener('shiyu-account-state', () => { loadedAt = 0; campaignData = null; updateEntry(); });
  updateEntry();
  openMemberInvite = async function () {
    if (!signed) { show('#login'); return; }
    const dialog = memberDialog('member-invite-dialog', "Invite friends. Keep the good things going.");
    dialog.classList.add('invite-monochrome');
    dialog.innerHTML += "<div class=\"member-invite-content\">Loading event…</div>";
    dialog.showModal();
    const target = dialog.querySelector('.member-invite-content');
    try {
      const result = await loadCampaign();
      if (!dialog.open) return;
      const campaign = result.campaign;
      const link = result.invitationCode ? location.origin + '/?invite=' + encodeURIComponent(result.invitationCode) : location.origin + '/';
      const shareCopy = "I found a home for my favorite things on Shiyu. Join to save, organize and revisit links and ideas your way. Take a look: \n" + link;
      const cap = (value, period) => value === null ? '' : `Earn up to ${value} reward days per ${period}.`;
      const rules = campaign ? "<section class=\"invitation-rules-block\"><h3><small>01</small> Rules</h3><p class=\"invite-rule-summary\">"+text(campaign.name)+"</p><div class=\"invite-reward-cards\"><article><small>When your friend joins through your invite, they receive</small><strong>+"+text(campaign.newUserDays)+"<em>membership days</em></strong></article><article><small>When your friend first pays, you receive</small><strong>+"+text(campaign.inviterDays)+"<em>membership days</em></strong></article></div><p class=\"invite-rule-summary\">Your friend must make their first payment within "+text(campaign.purchaseWithinDays)+" days of joining. Each stage is rewarded once."+text(cap(campaign.weeklyCap,"week")+cap(campaign.monthlyCap,"Month"))+" Ends "+text(new Date(campaign.end).toLocaleString())+'。</p></section>' : "<section class=\"invitation-rules-block\"><h3><small>01</small> Rules</h3><p class=\"invite-rule-summary\">Rewards follow the event settings. When active, sign-up rewards, first-payment rewards and limits appear here.</p></section>";
      target.innerHTML = rules;
      const items = Array.isArray(result.items) ? result.items : [];
      target.innerHTML = "<section class=\"invite-share-card\"><div><small>Share Shiyu</small><p>Keep what matters close, and share it with someone who cares.</p></div><input readonly aria-label=\"Share link\" value=\""+text(link)+"\"><div class=\"invite-share-actions\"><button class=\"member-primary\" data-copy-invitation>Copy message</button><button type=\"button\" data-share-invitation>Share</button></div></section>" + target.innerHTML;
      target.innerHTML += "<section class=\"invitation-records-block\"><h3><small>02</small> My rewards</h3><div class=\"invite-summary-grid\"><article><small>Total Rewards</small><strong>"+text(items.reduce((sum,item)=>sum+Number(item.days||0),0))+"<em>days</em></strong></article><article><small>Registration Reward</small><strong>"+text(items.filter(item=>item.type==="Registration Reward").reduce((sum,item)=>sum+Number(item.days||0),0))+"<em>days</em></strong></article><article><small>Purchase Reward</small><strong>"+text(items.filter(item=>item.type==="Purchase Reward").reduce((sum,item)=>sum+Number(item.days||0),0))+"<em>days</em></strong></article></div>"+(items.length ? "<div class=\"invite-record-list\"><div class=\"invite-record-head\"><span>Event</span><span>Reward</span><span>Status</span><span>Days</span></div>"+items.map(item=>'<div class="invite-record-row"><span><b>'+text(item.campaignName)+'</b><small>'+text(new Date(item.occurredAt).toLocaleDateString())+'</small></span><span>'+text(item.type)+'</span><span>'+text(item.note)+'</span><strong>'+text(item.days)+" days</strong></div>").join('')+'</div>' : "<p class=\"member-sub\">Your rewards will appear here once received.</p>")+'</section>';
      target.querySelector('[data-copy-invitation]')?.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(shareCopy); toast("Message copied"); }
        catch { const input = target.querySelector('input'); input.focus(); input.select(); toast("Copy the selected invite link"); }
      });
      target.querySelector('[data-share-invitation]')?.addEventListener('click', async () => {
        if (!navigator.share) { target.querySelector('[data-copy-invitation]')?.click(); return; }
        try { await navigator.share({ title: "Shiyu", text: shareCopy, url: link }); } catch { /* User cancelled the native share sheet. */ }
      });
    } catch (error) { target.textContent = error.message || "Couldn't load the event"; }
  };
})();
