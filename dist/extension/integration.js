/* Narrow integration: one avatar-menu entry, local extension bridge, explicit deep links. */
(function () {
  'use strict';
  const store = window.ShiyuExtensionStore;
  const previousHeader = updateHeader;
  updateHeader = function () {
    previousHeader();
    const menu = document.querySelector('.account-menu');
    if (!menu || menu.querySelector('[data-menu-extension]')) return;
    const button = document.createElement('button');
    button.dataset.menuExtension = ''; button.setAttribute('role', 'menuitem');
    button.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4H4v6a3 3 0 1 1 0 6v4h6a3 3 0 1 1 6 0h4v-6a3 3 0 1 0 0-6V4h-5a3 3 0 1 0-6 0Z"/></svg>浏览器插件';
    button.onclick = () => window.open('/extension/', '_blank', 'noopener,noreferrer');
    const exit = menu.querySelector('[data-account-signout]');
    if (exit) exit.before(button); else menu.append(button);
  };
  function decorateWorkspace() {
    if (view !== 'space') return;
    const groupHost=document.querySelector('#groups');
    if(groupHost&&!groupHost.dataset.laterScrollBound){groupHost.dataset.laterScrollBound='true';groupHost.addEventListener('wheel',e=>{const group=e.target.closest('.group');if(innerWidth>760&&group&&!(e.deltaY<0&&group.scrollTop<=2)){e.stopPropagation();gestureTotal=0;wheelBurstHandled=false;lastWheelAt=Date.now();if(e.deltaY>0)coverReturnArmed=0;}},{passive:true});}
    const actions = document.querySelector('.space-top-actions') || document.querySelector('.workspace-top');
    if (!actions || actions.querySelector('[data-space-inbox]')) return;
    const count = Array.isArray(prefs.extensionInbox) ? prefs.extensionInbox.length : 0;
    const button = document.createElement('button');
    button.className = 'space-inbox-entry'; button.dataset.spaceInbox = '';
    button.title = '打开稍后整理'; button.setAttribute('aria-label', `稍后整理，${count ? count + ' 条待整理' : '当前为空'}`);
    button.innerHTML = `<span class="space-inbox-drawer" aria-hidden="true"><i></i><i></i><b></b></span><span><strong>稍后整理</strong><small>${count ? count + ' 条待整理' : '回头再归类'}</small></span>`;
    button.onclick = () => signed ? openLaterDrawer() : show('#login');
    const add = actions.querySelector('[data-action="add"]');
    if (add) actions.insertBefore(button, add); else actions.append(button);
  }
  const renderBeforeExtension = render;
  render = function () { renderBeforeExtension(); decorateWorkspace(); };
  let laterDrawer,laterTab='archive',laterChosen=new Set(),laterAccount,confirmClear=false;
  const laterCategory=x=>x.category==='temporary'?'temporary':'archive';
  const laterSymbol=id=>svgIcon(id==='archive'?'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h5M8 16h3"/>':'<path d="m3 9 3-5h12l3 5v11H3Z"/><path d="M3 10h5l2 3h4l2-3h5"/>');
  const laterMoveSymbol=id=>svgIcon(id==='archive'?'<path d="M14 4H5a2 2 0 0 0-2 2v14h14v-5M7 9h4M7 13h3M14 9h8m-3-3 3 3-3 3"/>':'<path d="m3 12 3-5h5m9 5v8H3v-8h5l2 3h4l2-3h4M14 6h8m-3-3 3 3-3 3"/>');
  function openLaterDrawer(){
    store.seedInboxDemo();
    laterAccount=store.snapshot().accountId;laterTab='archive';laterChosen.clear();confirmClear=false;
    if(!laterDrawer){
      laterDrawer=document.createElement('dialog');laterDrawer.id='space-later-drawer';laterDrawer.setAttribute('aria-label','稍后管理');document.body.append(laterDrawer);
      laterDrawer.addEventListener('cancel',e=>{const target=laterDrawer.querySelector('.later-archive-target');if(target&&!target.hidden){e.preventDefault();hideLaterTarget();}});
      laterDrawer.addEventListener('click',e=>{const target=laterDrawer.querySelector('.later-archive-target');if(target&&!target.hidden&&!e.target.closest('.later-archive-target,[data-later-archive]')){hideLaterTarget();if(e.target===laterDrawer)return;}if(e.target===laterDrawer){const r=laterDrawer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)laterDrawer.close();}});
    }
    drawLaterDrawer();if(!laterDrawer.open)laterDrawer.showModal();
  }
  function hideLaterTarget(){const target=laterDrawer.querySelector('.later-archive-target');if(!target)return;target.hidden=true;target.querySelectorAll('.select-options').forEach(x=>x.hidden=true);target.querySelectorAll('.select-trigger').forEach(x=>x.setAttribute('aria-expanded','false'));laterDrawer.querySelector('[data-later-archive]')?.setAttribute('aria-expanded','false');}
  function drawLaterDrawer(){
    const all=store.inbox(),entries=all.filter(x=>laterCategory(x)===laterTab);laterChosen=new Set([...laterChosen].filter(id=>entries.some(x=>x.id===id)));
    laterDrawer.innerHTML=`<div class="later-tabs" role="tablist" aria-label="留存类型">${[['archive','待整理'],['temporary','暂时收纳']].map(([id,name])=>`<button role="tab" data-later-tab="${id}" aria-selected="${id===laterTab}">${laterSymbol(id)}<span>${name}</span><small>${all.filter(x=>laterCategory(x)===id).length}</small></button>`).join('')}<button class="later-close" aria-label="关闭稍后管理">${svgIcon('<path d="m6 6 12 12M18 6 6 18"/>')}</button></div><div class="later-selection"><label><input type="checkbox" data-later-all ${entries.length&&entries.every(x=>laterChosen.has(x.id))?'checked':''} ${entries.length?'':'disabled'}>全选本页</label><span>${laterTab==='temporary'?'随时查看，用完可清除':'留到有空，再安放到合适的分组'}</span></div><div class="later-list" role="tabpanel">${entries.map(x=>`<article class="later-item"><input type="checkbox" data-later-id="${esc(x.id)}" aria-label="选择 ${esc(x.item[0])}" ${laterChosen.has(x.id)?'checked':''}><a href="${esc(/^https?:\/\//i.test(x.item[1])?x.item[1]:'#')}" target="_blank" rel="noopener noreferrer"><i>${bookmarkMark(x.item)}</i><span><strong>${esc(x.item[0])}</strong><small>${esc(x.item[1])}</small>${x.item[2]?'<p>'+esc(x.item[2])+'</p>':''}</span></a><button data-later-category="${esc(x.id)}" title="${laterTab==='temporary'?'移至待整理':'移至暂时收纳'}" aria-label="${laterTab==='temporary'?'移至待整理':'移至暂时收纳'}">${laterMoveSymbol(laterTab==='temporary'?'archive':'temporary')}</button></article>`).join('')||'<div class="later-empty">'+(laterTab==='temporary'?'暂时没有留存的网址':'还没有待整理的网址')+'</div>'}</div><div class="later-footer"><p class="later-status" role="status"></p><div class="later-archive-target" id="later-archive-popover" role="group" aria-label="选择归档位置" hidden><label>空间<select data-later-space></select></label><label>场景<select data-later-scene></select></label><label>分组<select data-later-group></select></label><button class="primary" data-later-commit>确认归档</button></div><div class="later-batch"><span data-later-count>已选 ${laterChosen.size} 项</span><button data-later-clear>清除</button><button class="primary" data-later-archive aria-controls="later-archive-popover" aria-expanded="false">归档到…</button></div></div>`;
    laterDrawer.querySelector('.later-close').onclick=()=>laterDrawer.close();
    const heading=document.createElement('div');heading.className='later-heading';heading.innerHTML=svgIcon('<path d="m4 4-2 11v5h20v-5L20 4Z"/><path d="M2 15h6l2 3h4l2-3h6M8 8h8m-8 3h6"/>')+'<h2>稍后整理</h2>';heading.append(laterDrawer.querySelector('.later-close'));laterDrawer.prepend(heading);
    laterDrawer.querySelectorAll('[data-later-tab]').forEach(b=>b.onclick=()=>{laterTab=b.dataset.laterTab;laterChosen.clear();confirmClear=false;drawLaterDrawer();});
    function selection(){confirmClear=false;laterDrawer.querySelector('[data-later-clear]').textContent='清除';laterDrawer.querySelector('[data-later-count]').textContent='已选 '+laterChosen.size+' 项';laterDrawer.querySelectorAll('[data-later-clear],[data-later-archive],[data-later-commit]').forEach(b=>b.disabled=!laterChosen.size);const check=laterDrawer.querySelector('[data-later-all]');check.checked=entries.length>0&&laterChosen.size===entries.length;check.indeterminate=laterChosen.size>0&&laterChosen.size<entries.length;}
    laterDrawer.querySelectorAll('[data-later-id]').forEach(check=>check.onchange=()=>{check.checked?laterChosen.add(check.dataset.laterId):laterChosen.delete(check.dataset.laterId);selection();});
    laterDrawer.querySelector('[data-later-all]').onchange=e=>{laterChosen=new Set(e.target.checked?entries.map(x=>x.id):[]);laterDrawer.querySelectorAll('[data-later-id]').forEach(c=>c.checked=e.target.checked);selection();};
    function perform(action,extra={}){try{const result=store.updateInbox({accountId:laterAccount,ids:[...laterChosen],action,...extra});laterChosen.clear();confirmClear=false;drawLaterDrawer();laterDrawer.querySelector('.later-status').textContent=action==='archive'?'已归档到 '+result.label:action==='clear'?'已清除 '+result.count+' 项':'已移至'+(extra.category==='temporary'?'暂时收纳':'待整理');}catch(error){laterDrawer.querySelector('.later-status').textContent=error.message;}}
    laterDrawer.querySelectorAll('[data-later-category]').forEach(b=>b.onclick=()=>perform('category',{ids:[b.dataset.laterCategory],category:laterTab==='temporary'?'archive':'temporary'}));
    laterDrawer.querySelector('[data-later-clear]').onclick=e=>{if(!confirmClear){confirmClear=true;e.currentTarget.textContent='确认清除 '+laterChosen.size+' 项';return;}perform('clear');};
    const target=laterDrawer.querySelector('.later-archive-target'),spaces=target.querySelector('[data-later-space]'),scenes=target.querySelector('[data-later-scene]'),groups=target.querySelector('[data-later-group]');
    const options=(el,items)=>{el.replaceChildren(...items.map(x=>new Option(x.name,x.id)));if(!items.length)el.add(new Option('暂无可选位置',''));};
    const setGroups=()=>options(groups,data.find(s=>s.id===spaces.value)?.scenes.find(c=>c.id===scenes.value)?.groups||[]);
    const setScenes=()=>{options(scenes,data.find(s=>s.id===spaces.value)?.scenes||[]);setGroups();};
    options(spaces,data);if(data.some(s=>s.id===spaceId))spaces.value=spaceId;setScenes();spaces.onchange=setScenes;scenes.onchange=setGroups;
    laterDrawer.querySelector('[data-later-archive]').onclick=()=>{confirmClear=false;laterDrawer.querySelector('[data-later-clear]').textContent='清除';if(!target.hidden){hideLaterTarget();return;}target.hidden=false;laterDrawer.querySelector('[data-later-archive]').setAttribute('aria-expanded','true');};
    laterDrawer.querySelector('[data-later-commit]').onclick=()=>perform('archive',{spaceId:spaces.value,sceneId:scenes.value,groupId:groups.value});selection();
  }
  function refresh(event) {
    const value = JSON.parse(localStorage.getItem(store.KEY) || '{}');
    if (!Array.isArray(value.data)) return;
    if(event?.detail?.type==='inbox-category'){
      prefs.extensionInbox=value.prefs?.extensionInbox||[];
      if(laterDrawer?.open)drawLaterDrawer();
      return;
    }
    data = value.data; prefs = { ...defaults, ...value.prefs }; signed = !!value.signed;
    overrides = value.overrides || {}; styles = value.styles || {};
    if (value.themeMemory) themeMemory = value.themeMemory;
    render();
    if(laterDrawer?.open){if(!signed||store.snapshot().accountId!==laterAccount)laterDrawer.close();else drawLaterDrawer();}
  }
  window.addEventListener('shiyu-extension-change', refresh);
  window.addEventListener('storage', event => { if (event.key === store.EVENT_KEY) refresh(); });
  window.shiyuExtensionBridge = Object.freeze({ dispatch(request) {
    try {
      if (request?.type === 'state') {
        const value = store.snapshot();
        if (value.signed) { const theme = effective(); value.theme = { color: theme.color || '#48614c', mode: theme.mode || 'system' }; }
        return { ok: true, value };
      }
      if (request?.type === 'save') return { ok: true, value: store.save(request.payload) };
      return { ok: false, error: '不支持的插件操作。' };
    } catch (error) { return { ok: false, error: error.message }; }
  } });
  updateHeader(); decorateWorkspace();
  const query = new URLSearchParams(location.search);
  if (query.get('extension') === 'login' && !signed) show('#login');
  if (query.get('extension') === 'collection' && signed) {
    const s = data.find(x => x.id === query.get('space')) || data[0];
    if (s) { goSpace(s.id); const c = s.scenes.find(x => x.id === query.get('scene'));
      if (c) { sceneId = c.id; const g = c.groups.find(x => x.id === query.get('group')); if (g) activeGroups[c.id] = g.id; render(); }
    }
  }
})();
