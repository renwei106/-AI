/* Optional space view. The existing data and editors remain the source of truth. */
(() => {
  'use strict';
  const KEY = 'shiyu-space-atlas-v1';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const svg = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const icons = {
    graph:svg('<circle cx="12" cy="5" r="3"/><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="m10.5 7.6-4 7.8m7-7.8 4 7.8M8 18h8"/>'),
    space:svg('<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>'),
    scene:svg('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M9 9v11"/>'),
    group:svg('<path d="M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9H3Z"/>'),
    link:svg('<path d="m10 14 4-4m-6 6-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 10a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-1 1" transform="translate(1 0) scale(.9)"/>'),
    grid:svg('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
    list:svg('<path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"/>'),
    search:svg('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>'),
    close:svg('<path d="m6 6 12 12M18 6 6 18"/>'),
    chevron:svg('<path d="m9 5 7 7-7 7"/>'),
    down:svg('<path d="m6 9 6 6 6-6"/>'),
    back:svg('<path d="M20 12H4m6-6-6 6 6 6"/>'),
    more:svg('<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'),
    add:svg('<path d="M12 5v14M5 12h14"/>'),
    minus:svg('<path d="M5 12h14"/>'),
    fit:svg('<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/>'),
    pause:svg('<path d="M9 5v14M15 5v14"/>'),
    play:svg('<path d="m8 5 11 7-11 7V5Z"/>'),
    edit:svg('<path d="m4 16 11-11 4 4L8 20H4Zm9-9 4 4"/>'),
    move:svg('<path d="M4 7h8M9 4l3 3-3 3M20 17h-8m3-3-3 3 3 3M4 15v5h5M20 9V4h-5"/>'),
    open:svg('<path d="M14 3h7v7M21 3 10 14M10 3H4v17h17v-6"/>'),
    trash:svg('<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>'),
    up:svg('<path d="M12 20V4m-6 6 6-6 6 6"/>')
  };
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch {}
  const state = {sid:null, focus:null, mode:'3d', motion:false, layout:'radial', scene3d:'spatial', orbitClock:0, zoom:1, yaw:0, pitch:0, panX:0, panY:0, phase:0, hover:null, drag:null, settling:false, flowStart:0, suppressClickUntil:0, limit:0, overview:false};
  const solar = () => state.mode==='3d'&&state.scene3d==='solar';
  const systems = () => state.mode==='3d'&&state.scene3d==='systems';
  const orbital = () => solar()||systems();
  let orbits=[], satelliteOrbits=[];
  let dialog, index=new Map(), root, visible=[], nodeEls=new Map(), edgeEls=[], activeFlow=null, raf=0, lastFrame=0, needsPaint=true, returnFocus, resizeObserver, noticeTimer, compactLayout=false, modeMenu, menuTimer, menuTrigger, viewMenuTimer=0, editorBusy=false, atlasTransitionTimer=0, atlasClosing=false;
  let leavingForHome=false;
  const get = key => index.get(key);
  const query = s => dialog.querySelector(s);
  const label = kind => ({space:'空间',scene:'场景',group:'分组',link:'网址',bundle:'分支'}[kind]);
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const hash = s => Array.from(s).reduce((v,c)=>(Math.imul(v,31)+c.charCodeAt(0))|0,7)>>>0;
  const safeURL = value => {try{const u=new URL(value);return /^https?:$/.test(u.protocol)?u.href:''}catch{return ''}};
  const host = value => {try{return new URL(value).hostname.replace(/^www\./,'')}catch{return '网址地址待完善'}};
  function graphBookmarkMark(item){
    const mark=bookmarkMark(item);
    if(/<(?:svg|img)\b/i.test(mark))return mark;
    const raw=typeof item?.[3]==='string'?item[3].trim():'';
    const source=raw&&!/^\d+$/.test(raw)?raw:(item?.[0]||'网址');
    const glyph=Array.from(source)[0]||'网';
    return '<svg class="at-vector-letter" viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="12" text-anchor="middle" dominant-baseline="central">'+esc(glyph)+'</text></svg>';
  }
  const pathOf = n => {const chain=[];for(let p=n;p;p=get(p.parent))chain.unshift(p);return chain};
  const countText = n => n.kind==='space'?`${n.children.length} 个场景 · ${n.children.reduce((v,c)=>v+c.children.length,0)} 个分组`:n.kind==='scene'?`${n.children.length} 个分组`:n.kind==='group'?`${n.children.length} 个网址`:host(n.item?.[1]);
  function preferences() {
    const p=saved[state.sid]||{};
    state.mode=p.mode==='3d'?'3d':'2d';state.motion=!reduceMotion.matches;state.layout=['radial','organization','mindmap'].includes(p.layout)?p.layout:'radial';
    state.scene3d=['spatial','solar','systems'].includes(p.scene3d)?p.scene3d:'spatial';
  }
  function savePreferences() {
    saved[state.sid]={...saved[state.sid],mode:state.mode,motion:state.motion,layout:state.layout,scene3d:state.scene3d};
    rememberPresentation(state.sid,'atlas');
    writeSaved();
  }
  function writeSaved(){
    try{localStorage.setItem(KEY,JSON.stringify(saved))}catch{toast('本次视图设置暂时保留，浏览器未能保存')}
  }
  function rememberPresentation(sid,viewName){
    const p=saved[sid]??={};p.entry??={};p.entry.last={view:viewName,theme:effective().theme,...(viewName==='atlas'?{mode:state.mode,layout:state.layout,scene3d:state.scene3d,motion:state.motion}:{})};
  }
  function entryPresentation(sid){return prefs.spaceThemePolicy==='default'?{view:'daily',theme:'base'}:saved[sid]?.entry?.last}
  function buildIndex() {
    index=new Map();
    const s=data.find(s=>s.id===state.sid);if(!s)return false;
    const make=(key,kind,entity,parent,context={})=>{const n={key,kind,entity,name:kind==='link'?entity[0]:entity.name,parent,children:[],links:0,...context};index.set(key,n);if(parent)get(parent).children.push(n);return n};
    root=make('s:'+s.id,'space',s,null,{sid:s.id});
    for(const c of s.scenes){const cn=make('c:'+c.id,'scene',c,root.key,{sid:s.id,cid:c.id});for(const g of c.groups){const gn=make('g:'+g.id,'group',g,cn.key,{sid:s.id,cid:c.id,gid:g.id});g.items.forEach((item,i)=>make('u:'+g.id+':'+i,'link',item,gn.key,{sid:s.id,cid:c.id,gid:g.id,item,position:i}));gn.links=g.items.length;cn.links+=gn.links}root.links+=cn.links}
    if(!get(state.focus))state.focus=root.key;
    return true;
  }
  function mountEntry() {
    if(view!=='space'){syncCordClearance();return}
    document.querySelectorAll('.space-atlas-entry').forEach(b=>b.remove());
    const heading=document.querySelector('.workspace .space-heading');
    if(heading&&!heading.querySelector('.space-mode-entry')){heading.replaceChildren(modeButton(space().name));}
    mountGlobalSearch(document.querySelector('.workspace .space-top-actions'));
    const field=document.querySelector('.workspace #filter');if(field){field.hidden=true;const mark=field.previousElementSibling;if(mark?.tagName==='SPAN')mark.hidden=true}
    syncCordClearance();
  }
  function mountGlobalSearch(host){
    if(!host||host.querySelector('.space-global-search'))return;
    const el=document.createElement('div');el.className='space-global-search';
    el.innerHTML='<button type="button" class="global-search-trigger" aria-label="搜索全部网址" aria-expanded="false" title="搜索全部网址">'+icons.search+'</button><div class="global-search-field"><input type="search" aria-label="搜索全部空间的网址" placeholder="搜索全部空间的网址" autocomplete="off"></div><div class="global-search-results" hidden></div>';
    host.prepend(el);const input=el.querySelector('input'),trigger=el.querySelector('button'),results=el.querySelector('.global-search-results');
    const expand=()=>{el.classList.add('is-open');trigger.setAttribute('aria-expanded','true')},close=()=>{el.classList.remove('is-open');trigger.setAttribute('aria-expanded','false');results.hidden=true};
    el.onpointerenter=expand;trigger.onclick=()=>{expand();input.focus()};el.onpointerleave=()=>{if(!el.contains(document.activeElement))close()};el.onfocusout=()=>requestAnimationFrame(()=>{if(!el.contains(document.activeElement)&&!el.matches(':hover'))close()});
    input.oninput=()=>{const q=input.value.trim().toLowerCase();results.hidden=!q;if(!q)return;
      const matches=allItems().filter(x=>x.item.join(' ').toLowerCase().includes(q)||x.path.toLowerCase().includes(q));
      results.innerHTML=matches.slice(0,60).map(x=>'<a href="'+esc(safeURL(x.item[1]))+'" target="_blank" rel="noopener noreferrer"><i>'+bookmarkMark(x.item)+'</i><span><b>'+esc(x.item[0])+'</b><small>'+esc(x.path)+'</small></span>'+icons.open+'</a>').join('')+'<p>'+(!matches.length?'没有找到，试试名称或网址':'共 '+matches.length+' 个网址'+(matches.length>60?' · 请补充关键词缩小范围':''))+'</p>';
    };
    el.onkeydown=e=>{if(e.key==='Escape'){e.stopPropagation();input.value='';input.blur();close();trigger.focus()}if(e.key==='ArrowDown'){e.preventDefault();results.querySelector('a')?.focus()}if(e.key==='Enter'&&e.target===input)results.querySelector('a')?.click()};
  }
  function clearCordOverlap(target,gap=14){
    if(!target)return;
    target.style.translate='';const box=target.getBoundingClientRect();let shift=0;
    for(const cord of document.querySelectorAll('.mode-pull-cord,.color-pull-cord')){if(getComputedStyle(cord).display==='none')continue;const r=cord.getBoundingClientRect();if(box.top<r.bottom&&box.bottom>r.top&&box.left<r.right+gap&&box.right>r.left-gap)shift=Math.min(shift,r.left-gap-box.right)}
    if(shift)target.style.translate=shift+'px 0';
  }
  function syncCordClearance(){
    if(view==='home'){clearCordOverlap(document.querySelector('header .header-right'));return}
    if(view==='space')clearCordOverlap(document.querySelector('.workspace .space-top-actions'));
  }
  const updateHeaderBeforeCordClearance=updateHeader;
  updateHeader=function(){updateHeaderBeforeCordClearance();requestAnimationFrame(syncCordClearance)};
  addEventListener('resize',()=>{syncCordClearance();if(dialog?.open)positionChrome()});
  function modeButton(name,atlas=false){
    const b=document.createElement('button');b.type='button';b.className='space-mode-entry';
    const s=data.find(s=>s.id===(atlas?state.sid:spaceId)),mark=typeof entityIcon==='function'?entityIcon(s?.icon||'work'):icons.space;
    b.innerHTML='<i class="space-detail-icon">'+mark+'</i><span class="space-mode-name">'+esc(name)+'</span><i class="space-mode-indicator" title="'+(atlas?'图谱视图':'常规视图')+'">'+(atlas?icons.graph:icons.grid)+'</i>'+icons.down;
    b.setAttribute('aria-label',name+'，当前'+(atlas?'图谱视图':'常规视图')+'，切换空间展示方式');b.setAttribute('aria-expanded','false');b.setAttribute('aria-haspopup','true');
    b.onpointerenter=()=>showModeMenu(b);b.onclick=()=>showModeMenu(b);b.onpointerleave=()=>{menuTimer=setTimeout(hideModeMenu,240)};return b;
  }
  function hideModeMenu(){if(modeMenu)modeMenu.hidden=true;document.querySelectorAll('.space-mode-entry').forEach(b=>b.setAttribute('aria-expanded','false'))}
  function showModeMenu(button){
    clearTimeout(menuTimer);menuTrigger=button;
    if(!modeMenu){modeMenu=document.createElement('div');modeMenu.id='space-mode-menu';document.body.append(modeMenu);modeMenu.onpointerenter=()=>clearTimeout(menuTimer);modeMenu.onpointerleave=()=>{menuTimer=setTimeout(hideModeMenu,240)};modeMenu.onkeydown=e=>{if(e.key==='Escape'){hideModeMenu();menuTrigger?.focus()}}}
    const active=!!dialog?.open;
    modeMenu.innerHTML=`<p>空间展示方式</p><button data-space-mode="daily" aria-pressed="${!active}"><span class="mode-preview mode-preview-daily"><i></i><i></i><i></i><i></i></span><span><b>常规视图</b><small>按场景和分组整齐呈现，适合日常浏览、搜索与管理</small></span></button><button data-space-mode="atlas" aria-pressed="${active}"><span class="mode-preview mode-preview-atlas">${icons.graph}</span><span><b>图谱视图</b><small>用节点和连线展开层级，适合查看上下级与整体关系</small></span></button>`;
    const rect=button.getBoundingClientRect();modeMenu.style.left=clamp(rect.left,12,innerWidth-304)+'px';modeMenu.style.top=rect.bottom+9+'px';modeMenu.hidden=false;button.setAttribute('aria-expanded','true');
    modeMenu.onclick=e=>{const choice=e.target.closest('[data-space-mode]');if(!choice)return;hideModeMenu();if(choice.dataset.spaceMode==='atlas'){if(!dialog?.open)open(spaceId,button)}else if(dialog?.open)closeAtlas('daily')};
  }
  document.addEventListener('click',e=>{if(!e.target.closest('#space-mode-menu,.space-mode-entry'))hideModeMenu()});
  function open(sid,trigger,preset,directEntry=false) {
    returnFocus=trigger;state.sid=sid;state.focus='s:'+sid;preferences();resetCamera();
    if(preset)for(const field of ['mode','layout','scene3d'])if(preset[field]!==undefined)state[field]=preset[field];
    if(!dialog){
      dialog=document.createElement('dialog');dialog.id='space-atlas';dialog.setAttribute('aria-label','空间关系视图');document.body.append(dialog);
      dialog.addEventListener('click',e=>{if(performance.now()<state.suppressClickUntil){e.preventDefault();e.stopImmediatePropagation()}},true);
      dialog.addEventListener('click',click);
      dialog.addEventListener('dragstart',e=>{if(e.target.closest('.at-node'))e.preventDefault()});
      dialog.addEventListener('input',input);
      dialog.addEventListener('keydown',keydown);
      dialog.addEventListener('close',()=>{const goHome=leavingForHome;leavingForHome=false;atlasClosing=false;clearTimeout(atlasTransitionTimer);atlasTransitionTimer=0;dialog.classList.remove('atlas-ready','atlas-direct-entry');cancelAnimationFrame(raf);resizeObserver?.disconnect();state.hover=null;state.drag=null;clearTimeout(noticeTimer);clearTimeout(viewMenuTimer);hideModeMenu();document.body.classList.remove('atlas-active','atlas-transitioning');if(view==='space'&&spaceId===state.sid){rememberPresentation(spaceId,goHome?'atlas':'daily');writeSaved()}if(goHome){changeView('home');return}render();requestAnimationFrame(()=>document.querySelector('.workspace .space-mode-entry')?.focus({preventScroll:true}))});
      dialog.addEventListener('cancel',e=>{if(!query('.at-drawer').hidden){e.preventDefault();closeDrawer()}else if(!query('.global-search-results').hidden){e.preventDefault();clearSearch()}});
      dialog.addEventListener('wheel',wheel,{passive:false});
      dialog.addEventListener('pointerdown',pointerDown);
      dialog.addEventListener('pointermove',pointerMove);
      dialog.addEventListener('pointerup',pointerUp);
      dialog.addEventListener('pointercancel',pointerUp);
      dialog.addEventListener('lostpointercapture',()=>{if(state.drag)pointerUp({type:'pointercancel'})});
      dialog.addEventListener('mouseover',hover);
      dialog.addEventListener('mouseout',unhover);
      dialog.addEventListener('focusin',hover);
      dialog.addEventListener('focusout',unhover);
      document.addEventListener('close',e=>{if(e.target!==dialog&&dialog.open&&e.target.matches('dialog'))requestAnimationFrame(refresh)},true);
    }
    if(!buildIndex())return;
    clearTimeout(atlasTransitionTimer);atlasClosing=false;dialog.classList.remove('atlas-ready','atlas-direct-entry');document.body.classList.remove('atlas-active','atlas-transitioning');
    if(directEntry)dialog.classList.add('atlas-direct-entry');else document.body.classList.add('atlas-transitioning');
    window.scrollTo({top:0,behavior:'instant'});dialog.show();renderAtlas();paint(0);start();
    if(directEntry){positionChrome();paint(0);dialog.classList.add('atlas-ready');document.body.classList.add('atlas-active');requestAnimationFrame(()=>requestAnimationFrame(()=>dialog?.classList.remove('atlas-direct-entry')))}
    else requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!dialog.open||atlasClosing)return;positionChrome();paint(0);dialog.classList.add('atlas-ready');atlasTransitionTimer=setTimeout(()=>{if(dialog.open&&!atlasClosing){document.body.classList.add('atlas-active');document.body.classList.remove('atlas-transitioning')}},reduceMotion.matches?0:110)}));
    rememberPresentation(sid,'atlas');writeSaved();
  }
  function resetCamera(){state.zoom=1;state.yaw=0;state.pitch=0;state.panX=0;state.panY=0;state.phase=0;state.orbitClock=0;needsPaint=true}
  function renderAtlas() {
    const n=get(state.focus)||root;
    state.hover=null;state.drag=null;state.settling=false;
    dialog.innerHTML=`<div class="at-shell at-full-page${orbital()?' at-orbital':''}" data-mode="${state.mode}" data-layout="${state.layout}" data-presentation="${state.mode==='3d'?state.scene3d:'spatial'}">
      <button class="at-cover-return" data-at="home" aria-label="返回首页"><span>首页</span><span>点击返回首页</span></button><div class="at-mode-host"></div><div class="at-header-actions space-top-actions"><button class="primary" data-at-header="add">＋ 收藏网址</button><button class="space-share" data-at-header="share" aria-label="分享空间" title="分享空间">${svg('<path d="M12 16V3m-4 4 4-4 4 4M5 11v10h14V11"/>')}</button><button class="display-scope-button" data-at-header="settings" aria-label="空间设置" title="空间设置">${icons.grid}</button></div>
      <div class="at-canvas" aria-label="${esc(n.name)}关系图" tabindex="0"></div>
      <div class="at-footer"><div class="at-legend"><span><i></i>空间</span><span><i></i>场景</span><span><i></i>分组</span><span>${icons.link}网址</span><span class="at-parent-legend">┄ 上级</span><span class="at-child-legend">─ 下级</span></div><p class="at-hint" role="status"></p>${layoutPicker()}</div>
      <aside class="at-drawer" hidden aria-label="图谱管理"></aside><div class="at-notice" hidden role="status"></div></div>`;
    query('.at-mode-host').append(modeButton(root.name,true));mountGlobalSearch(query('.at-header-actions'));query('.at-search')?.remove();positionChrome();
    resizeObserver?.disconnect();const observedCanvas=query('.at-canvas');let observedWidth=observedCanvas.clientWidth,observedHeight=observedCanvas.clientHeight;
    resizeObserver=new ResizeObserver(()=>{if(dialog.open){positionChrome();const resized=observedCanvas.clientWidth!==observedWidth||observedCanvas.clientHeight!==observedHeight;if(!resized)return;observedWidth=observedCanvas.clientWidth;observedHeight=observedCanvas.clientHeight;if((observedWidth<650)!==compactLayout)renderGraph(get(state.focus));else layout(true);needsPaint=true}});resizeObserver.observe(observedCanvas);
    const picker=query('.at-view-picker');
    picker.onpointerenter=openViewPicker;picker.onpointerleave=()=>{clearTimeout(viewMenuTimer);viewMenuTimer=setTimeout(closeViewPicker,180)};
    picker.onfocusin=openViewPicker;picker.onfocusout=()=>requestAnimationFrame(()=>{if(!picker.contains(document.activeElement)&&!picker.matches(':hover'))closeViewPicker()});
    renderGraph(n);
    needsPaint=true;
  }
  function positionChrome(){
    syncCordClearance();
    const heading=document.querySelector('.workspace .space-heading')?.getBoundingClientRect(),actions=document.querySelector('.workspace .space-top-actions')?.getBoundingClientRect();
    const host=query('.at-mode-host'),buttons=query('.at-header-actions');
    if(heading){host.style.left=heading.left+'px';host.style.top=heading.top+'px';host.style.width=heading.width+'px';const source=document.querySelector('.workspace .space-mode-entry');if(source)host.style.font=getComputedStyle(source).font;dialog.style.setProperty('--chrome-left',heading.left+'px');dialog.style.setProperty('--chrome-top',heading.top+'px')}
    if(actions){buttons.style.left=actions.left+'px';buttons.style.top=actions.top+'px';buttons.style.right='auto'}else{buttons.style.left='auto';buttons.style.right='18px';buttons.style.top='24px'}
    clearCordOverlap(buttons);
    if(actions)dialog.style.setProperty('--chrome-right',Math.max(24,innerWidth-actions.right)+'px');
    const original=document.querySelector('.workspace [data-action=add]');if(original)query('[data-at-header=add]').innerHTML=original.innerHTML;
    const originalSettings=document.querySelector('.workspace [data-display-scope-open]');if(originalSettings)query('[data-at-header=settings]').innerHTML=originalSettings.innerHTML;
  }
  const layoutName=id=>({radial:'径向环绕',organization:'层级结构',mindmap:'思维脉络',spatial:'星际漫游',solar:'行星轨道',systems:'场景星系'}[id]);
  function layoutPicker(){
    const current=state.mode==='2d'?state.layout:state.scene3d;
    const descriptions={radial:'从中心向四周逐级展开',organization:'从上到下，清楚呈现层级',mindmap:'从左到右，沿着分支浏览',spatial:'在立体空间中，探索收藏的关系',solar:'以当前节点为恒星，内容沿多层轨道运行',systems:'场景沿主轨道运行，分组环绕各自场景'};
    const groups={two:['radial','organization','mindmap'],three:['spatial','solar','systems']};
    const panel=(mode,ids)=>'<div class="at-view-panel" id="at-view-panel-'+mode+'" role="tabpanel" aria-labelledby="at-view-tab-'+mode+'" data-at-view-panel="'+mode+'"'+(state.mode===mode?'':' hidden')+'>'+ids.map(id=>'<button data-at-view="'+id+'" aria-pressed="'+(id===current)+'">'+layoutIcon(id)+'<span><b>'+layoutName(id)+'</b><small>'+descriptions[id]+'</small></span></button>').join('')+'</div>';
    return '<div class="at-layout-picker at-view-picker"><button class="at-quiet" data-at="views" aria-label="切换图谱视图" aria-haspopup="dialog" aria-controls="at-view-dialog" aria-expanded="false"><small class="at-view-dimension">'+state.mode.toUpperCase()+'</small><span class="at-view-current">'+layoutIcon(current)+'<b>'+layoutName(current)+'</b></span>'+icons.down+'</button><div class="at-layout-menu" id="at-view-dialog" role="dialog" aria-label="图谱展示方式" hidden><div class="at-view-tabs" role="tablist" aria-label="选择二维或三维"><button id="at-view-tab-2d" role="tab" data-at-dimension="2d" aria-controls="at-view-panel-2d" aria-selected="'+(state.mode==='2d')+'">2D</button><button id="at-view-tab-3d" role="tab" data-at-dimension="3d" aria-controls="at-view-panel-3d" aria-selected="'+(state.mode==='3d')+'">3D</button></div>'+panel('2d',groups.two)+panel('3d',groups.three)+'</div></div>';
  }
  function layoutIcon(id){if(id==='systems')return svg('<circle cx="8" cy="12" r="2.6"/><ellipse cx="8" cy="12" rx="6" ry="3.5"/><circle cx="15.5" cy="8" r="1.8"/><ellipse cx="15.5" cy="8" rx="5.5" ry="2.8" transform="rotate(-18 15.5 8)"/><circle cx="20" cy="7" r="1"/>');if(id==='solar')return svg('<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="6" transform="rotate(-25 12 12)"/><circle cx="21" cy="8" r="2"/>');if(id==='spatial')return icons.space;return id==='radial'?icons.graph:id==='organization'?svg('<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v5M5 17v-5h14v5"/>'):svg('<rect x="2" y="9" width="6" height="6" rx="1"/><rect x="17" y="2" width="5" height="5" rx="1"/><rect x="17" y="17" width="5" height="5" rx="1"/><path d="M8 12h5V5h4m-4 7v7h4"/>')}
  function bundle(parent,children,kind) {
    return {key:'b:'+parent.key+':'+kind,kind:'bundle',bundleKind:kind,parent:parent.key,name:children.length+' 个'+label(kind),children:[],source:children,owner:parent.key,links:children.reduce((s,x)=>s+(x.kind==='link'?1:x.links),0)};
  }
  function collect(n) {
    const canvas=query('.at-canvas'),w=canvas.clientWidth,h=canvas.clientHeight;
    const radial=state.mode==='3d'||state.layout==='radial';
    const budget=radial?Math.max(18,Math.min(70,Math.floor(w*Math.max(240,h-320)/15500))):state.layout==='organization'?Math.max(4,Math.floor((w-110)/140)):Math.max(4,Math.floor((h-330)/76));
    const result=[{...n,level:0}],pageSize=w<650?6:orbital()?9:radial?18:state.layout==='organization'?9:7;
    const first=n.kind==='group'?n.children.slice(0,Math.max(pageSize,state.limit)):n.children;
    result.push(...first.map(x=>({...x,level:1})));
    if(first.length<n.children.length)result.push({...bundle(n,n.children.slice(first.length),'link'),level:1});
    const perBranch=orbital()?2:Math.min(n.kind==='space'&&radial?3:Infinity,Math.max(1,Math.floor((radial?budget-result.length:budget)/Math.max(1,first.length))));
    for(const child of first){
      if(systems()&&n.kind==='space'&&child.kind==='scene'&&child.children.length){const limit=w<650?2:4,shown=child.children.slice(0,limit);result.push(...shown.map(x=>({...x,level:2})));if(shown.length<child.children.length)result.push({...bundle(child,child.children.slice(shown.length),child.children[0].kind),level:2});continue}
      if(orbital()&&child.children.length){result.push({...bundle(child,child.children,child.children[0].kind),level:2});continue}
      if(!child.children.length||(!radial&&first.length>12)||(!state.overview&&n.parent&&first.length>(w<650?4:10)))continue;
      const isLinks=child.kind==='group';
      const shown=isLinks&&child.children.length>3&&!state.overview?[]:child.children.length<=perBranch?child.children:child.children.slice(0,Math.max(0,perBranch-1));
      result.push(...shown.map(x=>({...x,level:2})));
      if(shown.length<child.children.length)result.push({...bundle(child,child.children.slice(shown.length),child.children[0].kind),level:2});
    }
    const addKind=n.kind==='space'?'scene':n.kind==='scene'?'group':'link';
    result.push({key:'add:'+n.key,kind:'add',addKind,name:'新增'+label(addKind),parent:n.key,owner:n.key,children:[],level:1});
    const ancestors=pathOf(n).slice(0,-1);
    ancestors.forEach((p,i)=>result.push({...p,level:i-ancestors.length,isParent:true,ancestorIndex:i,ancestorCount:ancestors.length}));
    return result;
  }
  function renderGraph(n) {
    compactLayout=query('.at-canvas').clientWidth<650;
    visible=collect(n);nodeEls=new Map();edgeEls=[];activeFlow=null;orbits=[];satelliteOrbits=[];
    const canvas=query('.at-canvas');canvas.innerHTML='<svg class="at-lines" aria-hidden="true"></svg><svg class="at-flows" aria-hidden="true"></svg>';
    const lines=canvas.querySelector('.at-lines'),flows=canvas.querySelector('.at-flows'),dense=visible.length>36,tiny=false;
    for(const r of visible){
      const el=document.createElement('div');el.className='at-node'+(r.isParent?' is-parent':'')+(r.kind==='link'&&tiny?' at-link-dot':'');el.dataset.key=r.key;el.dataset.kind=r.kind;el.dataset.level=r.level;
      if(r.kind==='add')el.dataset.addKind=r.addKind;
      const rootNode=r.level===0,shapeKind=r.kind==='add'?r.addKind:r.kind,size=rootNode?[compactLayout?115:145,compactLayout?118:137]:shapeKind==='link'?(tiny?[15,15]:[compactLayout?120:144,52]):shapeKind==='bundle'?[compactLayout?112:126,51]:shapeKind==='group'?[compactLayout?86:dense?90:112,63]:[compactLayout?94:dense?102:122,compactLayout?73:86];
      if(rootNode){size[1]+=36}
      if(orbital()&&!rootNode&&!r.isParent){size[0]=shapeKind==='link'?112:r.kind==='bundle'?104:108;size[1]=r.level===2?56:shapeKind==='link'?72:103;el.style.setProperty('--planet-shift',((hash(r.key)%5)-2)*13+'deg')}
      if(systems()&&r.level===2&&!r.isParent){size[0]=r.kind==='bundle'?60:68;size[1]=46}
      if(state.mode==='2d'&&state.layout!=='radial'&&!rootNode&&shapeKind!=='link'){size[0]=124;size[1]=48;el.classList.add('at-compact-node')}
      if(r.isParent){size[0]=compactLayout?100:138;size[1]=70;el.classList.remove('at-compact-node')}
      r.w=size[0];r.h=size[1];el.style.width=r.w+'px';el.style.height=r.h+'px';
      const name=esc(r.name), satelliteMore=systems()&&r.kind==='bundle'&&r.level===2,mark=r.kind==='add'?'<span class="at-add-mark">'+icons.add+'</span>':r.kind==='link'?`<span class="at-logo">${graphBookmarkMark(r.item)}</span>`:satelliteMore?'<span class="at-orb at-more-orb">…</span>':r.kind==='bundle'?'<span class="at-bundle-mark">'+(r.bundleKind==='link'?icons.link:icons.group)+'</span>':`<span class="at-orb">${icons[r.kind]}</span>`;
      const content=mark+`<strong>${satelliteMore?'还有 '+r.source.length+' 个':name}</strong>`+(r.isParent?'':rootNode?`<small>${esc(countText(r))}</small>`:orbital()&&r.level===1&&r.kind!=='add'&&r.kind!=='bundle'?'':satelliteMore?'':r.kind==='bundle'?'<small>'+ (r.bundleKind==='group'?r.links+' 个网址':'展开查看')+'</small>':r.kind==='group'?'<small>'+r.links.toLocaleString()+' 个网址</small>':r.kind==='scene'?'<small>'+r.children.length+' 个分组 · '+r.links+' 个网址</small>':'');
      el.innerHTML=r.kind==='link'?`<a class="at-node-main" href="${esc(safeURL(r.item[1])||'#')}" target="_blank" rel="noopener noreferrer" title="打开 ${name}" data-at-link="${esc(r.key)}">${content}</a>`:`<button class="at-node-main" data-at-focus="${esc(r.key)}" title="${name}" aria-label="${r.isParent?'返回':rootNode?'当前':'进入'}${name}">${content}</button>`;
      if(r.kind==='add'){el.querySelector('button').removeAttribute('data-at-focus');el.querySelector('button').setAttribute('data-at-create',r.owner);el.querySelector('button').setAttribute('aria-label',r.name)}
      if(!['bundle','add'].includes(r.kind)&&!r.isParent)el.insertAdjacentHTML('beforeend',`<button class="at-node-menu" data-at-details="${esc(r.key)}" aria-label="管理 ${name}" title="管理">${icons.more}</button>`);
      if(rootNode&&['scene','space'].includes(r.kind))el.insertAdjacentHTML('beforeend',`<button class="at-summary" data-at-overview aria-pressed="${state.overview}" title="展开各分组的网址">${icons.link}<span>共 ${r.links.toLocaleString()} 个网址</span>${icons.chevron}</button>`);
      canvas.append(el);nodeEls.set(r.key,el);
      const symbol=el.querySelector('.at-orb,.at-logo,.at-bundle-mark,.at-add-mark')||el.querySelector('.at-node-main'),nodeBox=el.getBoundingClientRect(),symbolBox=symbol.getBoundingClientRect();
      r.anchorX=symbolBox.left-nodeBox.left+symbolBox.width/2;r.anchorY=symbolBox.top-nodeBox.top+symbolBox.height/2;
      const parent=visible.find(x=>x.key===r.parent);
      if(parent){const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.classList.add('at-line');if(parent.isParent)path.classList.add('is-upstream');if(r.kind==='link')path.classList.add('at-link-line');path.dataset.from=parent.key;path.dataset.to=r.key;lines.append(path);const flow=document.createElementNS('http://www.w3.org/2000/svg','g');flow.classList.add('at-packet');flow.innerHTML='<circle class="at-packet-head" r="1.65"/>';flow.dataset.from=parent.key;flow.dataset.to=r.key;flows.append(flow);edgeEls.push({el:path,flow,from:parent,to:r})}
    }
    const aggregated=visible.some(x=>x.kind==='bundle');
    query('.at-hint').textContent=state.mode==='3d'?'拖动排序 · 空白处旋转 · 滚轮缩放':'拖动排序 · 空白处移动 · 滚轮缩放';
    layout(true);
    if(!reduceMotion.matches)canvas.animate([{opacity:.25},{opacity:1}],{duration:340,easing:'ease-out'});
  }
  function layout(fit=false) {
    if(!dialog?.open)return;
    const canvas=query('.at-canvas'),w=canvas.clientWidth,h=canvas.clientHeight,n=visible.find(x=>x.level===0);if(!w||!h||!n)return;
    const top=compactLayout?190:145,bottom=compactLayout?180:155,usableH=Math.max(220,h-top-bottom),centerY=top+usableH/2;
    const childrenMap=new Map();for(const x of visible){if(x.level<=0)continue;if(!childrenMap.has(x.parent))childrenMap.set(x.parent,[]);childrenMap.get(x.parent).push(x)}
    const children=p=>childrenMap.get(p.key)||[],direct=children(n),radial=state.mode==='3d'||state.layout==='radial';
    for(const r of visible){r.bx=0;r.by=0;r.bz=0;r.ox=0;r.oy=0}
    if(orbital()){
      layoutSolar(n,children,w,usableH,fit);
    }else if(radial){
      // Lay out the complete first level before placing any second-level nodes.
      // This keeps scenes together near a space and moves their groups outside every scene ring.
      const widest=Math.max(80,...direct.map(c=>Math.hypot(c.w,c.h))),step=widest+18,rings=[];
      let radius=(Math.hypot(n.w,n.h)+widest)/2+22,cursor=0,ring=0;
      while(cursor<direct.length){const capacity=Math.max(4,Math.floor(Math.PI/Math.asin(Math.min(.95,(widest+16)/(2*radius))))),batch=direct.slice(cursor,cursor+capacity);batch.forEach((c,i)=>{const angle=-Math.PI/2+2*Math.PI*i/batch.length+(ring%2?Math.PI/batch.length:0);c.bx=Math.cos(angle)*radius;c.by=Math.sin(angle)*radius;c.bz=state.mode==='3d'?Math.sin(angle*2+.4)*radius*.24:0;c.ring=ring;c.layoutAngle=angle;
        if(state.mode==='3d'){const ch=children(c),outer=radius+step;ch.forEach((g,j)=>{const a=angle+(j-(ch.length-1)/2)*(Math.PI*1.5/Math.max(1,batch.length))/Math.max(1,ch.length);g.bx=Math.cos(a)*outer;g.by=Math.sin(a)*outer;g.bz=Math.sin(a*2+.4)*outer*.24})}
      });rings.push({batch,radius});cursor+=batch.length;radius+=step;ring++}
      if(state.mode==='2d'){
        const outerDirect=rings.at(-1)?.radius||radius-step;
        // Keep each branch on its scene's outward ray. One child is exactly collinear;
        // siblings open into a small mirrored fan without entering any first-level ring.
        rings.forEach((firstRing,ringIndex)=>{const baseRadius=outerDirect+step*(ringIndex+1),sector=2*Math.PI/Math.max(4,firstRing.batch.length);
          for(const parent of firstRing.batch){const descendants=children(parent);if(!descendants.length)continue;
            const childWidest=Math.max(70,...descendants.map(node=>Math.hypot(node.w,node.h))),span=sector*.7,separation=descendants.length>1?Math.min(.34,span/(descendants.length-1)):0;
            const childRadius=separation?Math.max(baseRadius,(childWidest+16)/(2*Math.sin(separation/2))):baseRadius;
            descendants.forEach((node,index)=>{const angle=parent.layoutAngle+(index-(descendants.length-1)/2)*separation;node.bx=Math.cos(angle)*childRadius;node.by=Math.sin(angle)*childRadius;node.bz=0;node.ring=rings.length+ringIndex;node.layoutAngle=angle});
          }
        });
      }
      // Leave the readable node size unchanged; large rings remain reachable by panning/zooming.
    }else if(direct.length>12){
      // Dense sibling levels wrap as connected graph branches; no list view is used.
      if(state.layout==='organization'){
        const cols=Math.max(2,Math.floor((w-90)/145)),rows=Math.ceil(direct.length/cols);n.by=-usableH/2+70;
        direct.forEach((c,i)=>{const row=Math.floor(i/cols),count=Math.min(cols,direct.length-row*cols);c.bx=(i%cols-(count-1)/2)*Math.min(154,(w-90)/cols);c.by=-usableH/2+195+row*Math.min(100,(usableH-225)/Math.max(1,rows-1))});
      }else{
        const rows=Math.max(4,Math.floor((usableH-70)/57)),cols=Math.ceil(direct.length/rows);n.bx=-w/2+120;
        direct.forEach((c,i)=>{c.bx=-w/2+320+Math.floor(i/rows)*Math.min(230,(w-460)/Math.max(1,cols-1));c.by=(i%rows-(Math.min(rows,direct.length-Math.floor(i/rows)*rows)-1)/2)*57});
      }
    }else{
      const vertical=state.layout==='organization',gap=vertical?22:18;
      function measure(p){const ch=children(p);p.span=Math.max(vertical?p.w:p.h,ch.length?ch.reduce((sum,c)=>sum+measure(c),0)+gap*(ch.length-1):0);return p.span}measure(n);
      const maxLevel=Math.max(...visible.map(r=>r.level)),crossScale=Math.min(1,(vertical?w-100:usableH-60)/n.span),step=vertical?Math.min(220,(usableH-130)/Math.max(1,maxLevel)):Math.min(320,(w-260)/Math.max(1,maxLevel));
      function arrange(p,depth,cross){if(vertical){p.bx=cross*crossScale;p.by=(depth-maxLevel/2)*step}else{p.bx=(depth-maxLevel/2)*step;p.by=cross*crossScale}const ch=children(p);let cursor=cross-(ch.reduce((sum,c)=>sum+c.span,0)+Math.max(0,ch.length-1)*gap)/2;ch.forEach(c=>{arrange(c,depth+1,cursor+c.span/2);cursor+=c.span+gap})}arrange(n,0,0);
    }
    if(n.parent){const x=n.bx,y=n.by,z=n.bz;for(const r of visible)if(!r.isParent){r.bx-=x;r.by-=y;r.bz-=z}}
    needsPaint=true;
  }
  function orbitIdentity(r){return r.kind==='link'?'u:'+hash((r.item?.[1]||'')+'\u0000'+(r.item?.[0]||'')):r.key}
  function orbitPlan(n,create=false,scope='main'){
    const owner=saved[state.sid]||(create?(saved[state.sid]={}):{}),plans=owner.orbitPlans||(create?(owner.orbitPlans={}):null),key=state.scene3d+':'+(scope==='satellite'?'satellite:':'')+n.key;
    return {owner,plans,key,values:plans?.[key]||null};
  }
  function layoutSolar(n,children,w,usableH,fit){
    orbits=[];satelliteOrbits=[];
    const direct=children(n),available=Math.min(w*.43,(usableH-155)/1.04);
    // Larger circumferences receive more slots. Saved ring choices change only
    // this visual arrangement; the data hierarchy remains the source of truth.
    const capacities=[];let capacity=0;
    while(capacity<direct.length){const next=(compactLayout?3:4)+capacities.length*2;capacities.push(next);capacity+=next}
    const baseRingCount=Math.max(1,capacities.length),counts=capacities.map(c=>Math.floor(direct.length*c/Math.max(1,capacity)));
    for(let remaining=direct.length-counts.reduce((a,b)=>a+b,0),i=counts.length-1;remaining>0;remaining--,i=(i-1+counts.length)%counts.length)counts[i]++;
    const autoRings=[];for(let i=0;i<counts.length;i++)for(let j=0;j<counts[i];j++)autoRings.push(i);
    const stored=orbitPlan(n).values||{},assignments=direct.map((r,i)=>{const value=stored[orbitIdentity(r)];return Number.isInteger(value)&&value>=0&&value<baseRingCount?value:autoRings[i]||0});
    const ringCount=Math.max(baseRingCount,...assignments.map(x=>x+1));while(capacities.length<ringCount)capacities.push((compactLayout?3:4)+capacities.length*2);
    const branches=Array.from({length:ringCount},()=>[]);direct.forEach((r,i)=>branches[assignments[i]].push(r));
    const nestedSystems=systems()&&n.kind==='space',inner=Math.max(nestedSystems?255:230,Math.min(nestedSystems?335:310,available*.56)),step=Math.max(nestedSystems?190:160,(available-inner)/Math.max(1,ringCount-1));
    for(let i=0;i<ringCount;i++){
      const members=branches[i],radius=inner+i*step;
      const color=['var(--at-accent)','color-mix(in srgb,var(--at-accent) 48%,#709dc4)','color-mix(in srgb,var(--at-accent) 42%,#b496c7)','color-mix(in srgb,var(--at-accent) 45%,#bc9b66)'][i%4];
      const orbit={id:i,parentKey:n.key,nodeKind:members.find(r=>!['add','bundle'].includes(r.kind))?.kind,radius,tilt:1.0,speed:.00013/Math.pow(i+1,1.45),members,capacity:capacities[i],color,angle:-.75+i*1.1};orbits.push(orbit);
      members.forEach((r,j)=>{
        r.orbit=orbit;r.orbitAngle=orbit.angle+j*Math.PI*2/Math.max(1,members.length);r.ring=i;
        const el=nodeEls.get(r.key);el.dataset.orbit=i;el.style.setProperty('--orbit-color',color);el.style.setProperty('--planet-shift','0deg');
        const satellites=children(r);
        if(nestedSystems&&r.kind==='scene'&&satellites.length){
          const subCapacity=3,defaultSubCount=Math.max(1,Math.ceil(satellites.length/subCapacity)),storedSatellite=orbitPlan(r,false,'satellite').values||{};
          const assignments=satellites.map((child,index)=>{const value=storedSatellite[orbitIdentity(child)];return Number.isInteger(value)&&value>=0?value:Math.floor(index/subCapacity)});
          const subCount=Math.max(defaultSubCount,...assignments.map(value=>value+1));
          for(let sub=0;sub<subCount;sub++){
            const satelliteMembers=satellites.filter((child,index)=>assignments[index]===sub),satellite={id:'scene:'+r.key+':'+sub,parent:r,parentKey:r.key,nodeKind:'group',radius:(compactLayout?58:72)+sub*(compactLayout?34:43),tilt:.72+(hash(r.key+sub)%14)/100,speed:.00022/Math.pow(sub+1,1.25),members:satelliteMembers,capacity:subCapacity,ring:sub,color,angle:(hash(r.key)%628)/100+sub*.8,isSatellite:true};
            satelliteOrbits.push(satellite);
            satelliteMembers.forEach((child,k)=>{child.satellite={parent:r,orbit:satellite};child.orbitAngle=satellite.angle+k*Math.PI*2/Math.max(1,satelliteMembers.length);child.ring=sub;const childEl=nodeEls.get(child.key);childEl.dataset.satelliteOrbit=satellite.id;childEl.dataset.orbitParent=r.key;childEl.style.setProperty('--orbit-color',color)});
          }
        }else satellites.forEach(child=>{child.satellite={parent:r};child.ring=i;nodeEls.get(child.key).style.setProperty('--orbit-color',color)});
      });
    }
    const lines=query('.at-lines');lines.querySelectorAll('.at-orbit-track,.at-orbit-current,.at-satellite-track').forEach(el=>el.remove());
    const ns='http://www.w3.org/2000/svg',firstLine=()=>lines.querySelector('.at-line');
    orbits.forEach(orbit=>{orbit.el=document.createElementNS(ns,'path');orbit.el.classList.add('at-orbit-track');orbit.el.dataset.orbit=orbit.id;orbit.el.dataset.capacity=orbit.capacity;orbit.el.dataset.speed=orbit.speed;orbit.el.style.setProperty('--orbit-color',orbit.color);lines.insertBefore(orbit.el,firstLine());orbit.marker=document.createElementNS(ns,'rect');orbit.marker.classList.add('at-orbit-current');orbit.marker.style.setProperty('--orbit-color',orbit.color);orbit.marker.setAttribute('width','3');orbit.marker.setAttribute('height','3');lines.append(orbit.marker)});
    satelliteOrbits.forEach(orbit=>{orbit.el=document.createElementNS(ns,'path');orbit.el.classList.add('at-satellite-track');orbit.el.dataset.satelliteOrbit=orbit.id;orbit.el.dataset.orbitParent=orbit.parentKey;orbit.el.dataset.capacity=orbit.capacity;orbit.el.style.setProperty('--orbit-color',orbit.color);lines.insertBefore(orbit.el,firstLine())});
    updateSolarPositions();
    // Fit the whole system on entry, keeping the individual labels readable.
    if(fit){const extent=(orbits.at(-1)?.radius||inner)+(nestedSystems?120:0);
      state.zoom=Math.min(1,(w-90)/(extent*2+160),(usableH-35)/(extent*2*Math.cos(1)+185));
      state.zoom=Math.max(.34,state.zoom);
    }
  }
  function orbitPoint(orbit,a){
    const local={x:Math.cos(a)*orbit.radius,y:Math.sin(a)*orbit.radius*Math.cos(orbit.tilt),z:Math.sin(a)*orbit.radius*Math.sin(orbit.tilt)};
    return orbit.isSatellite?{x:orbit.parent.bx+local.x,y:orbit.parent.by+local.y,z:orbit.parent.bz+local.z}:local;
  }
  function updateSolarPositions(){
    for(const r of visible){if(r.orbit){const o=r.orbit,p=orbitPoint(o,r.orbitAngle+state.orbitClock*o.speed);r.bx=p.x;r.by=p.y;r.bz=p.z}}
    for(const orbit of satelliteOrbits)for(const r of orbit.members){const p=orbitPoint(orbit,r.orbitAngle+state.orbitClock*orbit.speed);r.bx=p.x;r.by=p.y;r.bz=p.z}
    for(const r of visible){if(r.satellite&&!r.satellite.orbit){const {parent}=r.satellite;r.bx=parent.bx;r.by=parent.by;r.bz=parent.bz}}
  }
  function project(x,y,z,fixed=false){
    const canvas=query('.at-canvas'),w=canvas.clientWidth,h=canvas.clientHeight,top=compactLayout?190:145,bottom=compactLayout?180:155;
    const yaw=state.mode==='3d'?state.yaw+state.phase:0,pitch=state.mode==='3d'?state.pitch:0;
    const rx=fixed?x:x*Math.cos(yaw)+z*Math.sin(yaw),rz=fixed?0:z*Math.cos(yaw)-x*Math.sin(yaw),ry=fixed?y:y*Math.cos(pitch)-rz*Math.sin(pitch),depth=fixed?0:rz*Math.cos(pitch)+y*Math.sin(pitch);
    return {x:w/2+rx*state.zoom+state.panX,y:top+(h-top-bottom)/2+ry*state.zoom+state.panY,depth};
  }
  function paintOrbits(){
    if(!orbital())return;
    for(const orbit of [...orbits,...satelliteOrbits]){let d='';orbit.screenPoints=[];for(let i=0;i<=80;i++){const a=i/80*Math.PI*2,world=orbitPoint(orbit,a),p=project(world.x,world.y,world.z);if(orbit.isSatellite){p.x+=orbit.parent.ox||0;p.y+=orbit.parent.oy||0}orbit.screenPoints.push(p);d+=(i?' L':'M')+p.x+','+p.y}orbit.el.setAttribute('d',d);
      if(orbit.marker){const world=orbitPoint(orbit,state.orbitClock*orbit.speed+orbit.angle+.5),p=project(world.x,world.y,world.z);orbit.marker.setAttribute('transform','translate('+(p.x-1.5)+' '+(p.y-1.5)+') rotate(45 1.5 1.5)')}
    }
  }
  function paint(dt) {
    const canvas=query('.at-canvas');if(!canvas)return;const w=canvas.clientWidth,h=canvas.clientHeight,top=compactLayout?190:145,bottom=compactLayout?180:155;
    const animate=state.mode==='3d'&&!reduceMotion.matches&&!state.hover&&!state.drag&&!state.settling&&query('.at-drawer').hidden&&query('.at-layout-menu').hidden&&!document.querySelector('dialog[open]:not(#space-atlas)');
    if(animate){if(orbital())state.orbitClock+=dt;else state.phase+=dt*.000028;needsPaint=true}
    if(state.drag?.type==='branch'&&state.drag.moved){const d=state.drag,amount=reduceMotion.matches?1:1-Math.exp(-dt/100);for(const r of visible){if(d.keys.has(r.key))continue;r.ox+=(r.previewX-r.ox)*amount;r.oy+=(r.previewY-r.oy)*amount}needsPaint=true}
    if(state.settling){const keep=reduceMotion.matches?0:Math.exp(-dt/115);let unfinished=false;for(const r of visible){r.ox=(r.ox||0)*keep;r.oy=(r.oy||0)*keep;if(Math.abs(r.ox)+Math.abs(r.oy)<.08){r.ox=0;r.oy=0}else unfinished=true}state.settling=unfinished;needsPaint=true;canvas.classList.toggle('is-settling',unfinished)}
    if(needsPaint){if(orbital())updateSolarPositions();const yaw=state.mode==='3d'?state.yaw+state.phase:0,pitch=state.mode==='3d'?state.pitch:0,camera=Math.max(w,h)*3;
      const heading=query('.at-mode-host').getBoundingClientRect(),canvasBox=canvas.getBoundingClientRect(),startX=clamp(heading.left-canvasBox.left+(compactLayout?42:58),55,w*.25),startY=clamp(heading.bottom-canvasBox.top+55,105,h*.28),centerX=w/2,centerY=top+(h-top-bottom)/2;
      for(const r of visible){const x=r.bx||0,y=r.by||0,z=r.bz||0,rx=r.isParent?x:x*Math.cos(yaw)+z*Math.sin(yaw),rz=r.isParent?0:z*Math.cos(yaw)-x*Math.sin(yaw),ry=r.isParent?y:y*Math.cos(pitch)-rz*Math.sin(pitch),depth=r.isParent?0:rz*Math.cos(pitch)+y*Math.sin(pitch);
        r.baseX=w/2+rx*state.zoom+state.panX;r.baseY=top+(h-top-bottom)/2+ry*state.zoom+state.panY+(r.satellite&&!r.satellite.orbit?90*state.zoom:0);r.px=r.baseX+(r.ox||0);r.py=r.baseY+(r.oy||0);
        if(r.isParent){const span=Math.max(1,Math.hypot(centerX-startX,centerY-startY)),ancestorGap=compactLayout?94:112,t=r.ancestorIndex*Math.min(.34,ancestorGap/span);r.baseX=r.px=startX+(centerX-startX)*t;r.baseY=r.py=startY+(centerY-startY)*t}
        const anchorX=r.anchorX??r.w/2,anchorY=r.anchorY??r.h/2;
        const el=nodeEls.get(r.key),renderZoom=r.isParent?1:state.zoom;
        // CSS zoom asks Chromium to lay out and repaint type and SVG paths at the
        // requested size. A transform scale would enlarge a cached texture and
        // makes both labels and icons visibly soft after zooming.
        el.style.zoom=String(renderZoom);el.style.transform='translate('+(r.px/renderZoom-anchorX)+'px,'+(r.py/renderZoom-anchorY)+'px)';el.style.transformOrigin='0 0';el.style.zIndex=String(30+Math.round(-depth/50));el.style.setProperty('--depth-opacity',String(clamp(1-depth/(camera*.65),.5,1)));el.dataset.depth=Math.round(depth);
      }
      for(const edge of edgeEls){const {el,from:a,to:b}=edge;let path;
        if(a.isParent)path='M'+a.px+','+a.py+' L'+b.px+','+b.py;
        else if(state.mode==='2d'&&state.layout==='organization'){const my=(a.py+b.py)/2;path='M'+a.px+','+a.py+' C'+a.px+','+my+' '+b.px+','+my+' '+b.px+','+b.py}
        else if(state.mode==='2d'&&state.layout==='mindmap'){const mx=(a.px+b.px)/2;path='M'+a.px+','+a.py+' C'+mx+','+a.py+' '+mx+','+b.py+' '+b.px+','+b.py}
        else path='M'+a.px+','+a.py+' L'+b.px+','+b.py;
        el.setAttribute('d',path);edge.length=el.getTotalLength();
      }
      paintOrbits();
      needsPaint=false;
    }
    paintPackets();
  }
  function hierarchyFlow(key){
    const byKey=new Map(visible.map(node=>[node.key,node])),incoming=[],nodes=new Set([key]),seen=new Set([key]);let cursor=byKey.get(key);
    while(cursor?.parent&&byKey.has(cursor.parent)&&!seen.has(cursor.parent)){const edge=edgeEls.find(item=>item.from.key===cursor.parent&&item.to.key===cursor.key);if(!edge)break;incoming.unshift(edge);cursor=byKey.get(cursor.parent);seen.add(cursor.key);nodes.add(cursor.key)}
    const levels=[];let frontier=[key];
    while(frontier.length){const parents=new Set(frontier),level=edgeEls.filter(edge=>parents.has(edge.from.key)&&!nodes.has(edge.to.key));if(!level.length)break;levels.push(level);frontier=[];for(const edge of level){nodes.add(edge.to.key);frontier.push(edge.to.key)}}
    const edges=new Map();incoming.forEach((edge,stage)=>edges.set(edge,{stage,phase:'incoming'}));levels.forEach((level,offset)=>level.forEach(edge=>edges.set(edge,{stage:incoming.length+offset,phase:'outgoing'})));
    return {nodes,edges,stages:incoming.length+levels.length};
  }
  function paintPackets(){
    const hovered=visible.find(n=>n.key===state.hover),plan=activeFlow,stageSpan=720,travel=640,cycle=Math.max(1800,(plan?.stages||0)*stageSpan+420),elapsed=(performance.now()-state.flowStart)%cycle,receiving=new Set();
    for(const edge of edgeEls){const step=plan?.edges.get(edge),active=!!hovered&&!!step&&!state.drag?.moved&&!state.settling;
      let t=-1;if(active){if(reduceMotion.matches)t=.58;else{const local=elapsed-step.stage*stageSpan;if(local>=0&&local<=travel)t=clamp(local/travel,0,1)}}
      edge.flow.style.opacity=t>=0?'1':'0';edge.flow.dataset.phase=t>=0?step.phase:'idle';edge.flow.classList.toggle('is-upstream',step?.phase==='incoming');
      if(t<0||!edge.length)continue;
      const children=edge.flow.children;for(let i=0;i<children.length;i++){const f=clamp(t-(i===1?.055:i===2?.027:0),0,1),point=edge.el.getPointAtLength(edge.length*f);children[i].setAttribute('cx',point.x);children[i].setAttribute('cy',point.y)}
      if(!reduceMotion.matches&&t>=.82)receiving.add(edge.to.key);
    }
    nodeEls.forEach((el,key)=>el.classList.toggle('is-receiving',receiving.has(key)));
  }
  function start(){cancelAnimationFrame(raf);lastFrame=performance.now();const tick=now=>{if(!dialog.open)return;const dt=Math.min(40,now-lastFrame);lastFrame=now;if(!document.hidden)paint(dt);raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick)}
  function setContext(n) {
    spaceId=n.sid||state.sid;
    if(n.cid)sceneId=n.cid;else if(!space()?.scenes.some(c=>c.id===sceneId))sceneId=space()?.scenes[0]?.id;
    if(n.gid&&n.cid)activeGroups[n.cid]=n.gid;
  }
  function focus(key) {
    const bundleNode=visible.find(x=>x.key===key&&x.kind==='bundle');
    if(bundleNode){const owner=get(bundleNode.owner);if(owner&&owner.key!==state.focus)focus(owner.key);else if(owner?.kind==='group'){state.limit=visible.filter(x=>x.kind==='link').length+(compactLayout?8:18);renderAtlas()}return}
    const n=get(key);if(!n||n.kind==='link')return;
    state.focus=key;state.limit=0;state.overview=false;setContext(n);resetCamera();renderAtlas();query('.at-canvas').focus({preventScroll:true});
  }
  function refresh(){if(!dialog?.open)return;if(!buildIndex()){dialog.close();return}renderAtlas()}
  function hover(e) {
    if(state.drag?.moved)return;const el=e.target.closest('.at-node');if(!el||el.contains(e.relatedTarget)||state.hover===el.dataset.key)return;
    state.hover=el.dataset.key;state.flowStart=performance.now();activeFlow=hierarchyFlow(state.hover);const related=activeFlow.nodes;
    for(const [key,node] of nodeEls){node.classList.toggle('is-muted',!related.has(key));node.classList.toggle('is-related',related.has(key))}
    edgeEls.forEach(x=>{const step=activeFlow.edges.get(x),on=!!step;x.el.classList.toggle('is-related',on);x.el.classList.toggle('is-upstream',step?.phase==='incoming');x.el.classList.toggle('is-muted',!on)});
  }
  function clearHover(){state.hover=null;activeFlow=null;nodeEls.forEach(el=>el.classList.remove('is-muted','is-related','is-receiving'));edgeEls.forEach(x=>{x.el.classList.remove('is-muted','is-related');x.flow.style.opacity='0';x.flow.dataset.phase='idle';x.el.classList.toggle('is-upstream',x.from.isParent===true)})}
  function unhover(e){if(state.drag?.moved)return;const el=e.target.closest('.at-node');if(!el||el.contains(e.relatedTarget))return;clearHover()}
  function input(e){if(e.target.matches('.at-search input'))search(e.target.value)}
  function search(text) {
    const box=query('.at-search-results'),q=text.trim().toLowerCase();box.hidden=!q;if(!q)return;
    const matches=[...index.values()].filter(n=>n.name.toLowerCase().includes(q)||(n.kind==='link'&&(n.item[1]+' '+n.item[2]).toLowerCase().includes(q)));
    box.innerHTML=matches.slice(0,40).map(n=>{const content=`${icons[n.kind]}<span><b>${esc(n.name)}</b><small>${esc(pathOf(n).slice(0,-1).map(x=>x.name).join(' / ')||'当前空间')}</small></span>`;return n.kind==='link'?`<div class="at-result"><a class="at-result" href="${esc(safeURL(n.item[1])||'#')}" data-at-link="${esc(n.key)}" target="_blank" rel="noopener noreferrer">${content}</a><button data-at-locate="${esc(n.key)}" title="定位到所属分组" aria-label="定位 ${esc(n.name)}">${icons.fit}</button></div>`:`<button class="at-result" data-at-focus="${esc(n.key)}">${content}</button>`}).join('')+`<span class="at-search-note">${matches.length?'找到 '+matches.length+' 项'+(matches.length>40?' · 显示前 40 项，请输入更具体的关键词':''):'没有找到，试试名称或网址'}</span>`;
  }
  function clearSearch(){const el=query('.space-global-search');if(el){el.querySelector('input').value='';el.querySelector('.global-search-results').hidden=true;el.classList.remove('is-open')}}
  function drawer(title,body) {
    const aside=query('.at-drawer');aside.onclick=null;aside.hidden=false;aside.innerHTML=`<div class="at-drawer-top"><h2>${esc(title)}</h2><button data-at="close-drawer" aria-label="关闭面板">${icons.close}</button></div>${body}<button class="at-drawer-done" data-at="close-drawer">完成</button>`;
    aside.querySelector('button')?.focus({preventScroll:true});return aside;
  }
  function closeDrawer(){query('.at-drawer').hidden=true;query('.at-canvas').focus({preventScroll:true})}
  function details(key) {
    const n=get(key);if(!n)return;
    const actions=n.kind==='link'?[['open','打开网址',icons.open],['edit','编辑收藏',icons.edit],['move','移动到…',icons.move],['delete','删除收藏',icons.trash]]:[['add','新增'+(n.kind==='space'?'场景':n.kind==='scene'?'分组':'网址'),icons.add],['edit','重命名',icons.edit],...(n.kind==='space'?[]:[['move','移动到…',icons.move]]),['delete','删除'+label(n.kind),icons.trash]];
    drawer('管理'+label(n.kind),`<h3 class="at-detail-title">${esc(n.name)}</h3><p class="at-detail-path">${esc(pathOf(n).slice(0,-1).map(x=>x.name).join(' / ')||'我的空间')}</p><p class="at-detail-note">${esc(n.kind==='link'?(n.item[2]||host(n.item[1])):countText(n))}</p>${actions.map(([id,name,ic])=>`<button class="at-drawer-action" data-at-manage="${id}" data-at-key="${esc(key)}">${ic}${name}</button>`).join('')}`);
  }
  function writable(n,fn) {
    setContext(n);
    authorizeOrganization(()=>{setContext(n);fn()});
  }
  function withEditor(n,fn){writable(n,()=>{editorBusy=true;try{render();fn();const inline=document.querySelector('.workspace .inline-create');if(inline){const aside=drawer('新增'+(n.kind==='space'?'场景':'分组'),'<div class="at-existing-editor"></div>');aside.querySelector('.at-existing-editor').append(inline);inline.querySelector('input')?.focus()}}finally{editorBusy=false}})}
  function addChild(n){withEditor(n,()=>{if(n.kind==='group')add();else editOrganization(n.kind==='space'?'scene':'group')})}
  function sourceList(n){return n.kind==='space'?data:n.kind==='scene'?data.find(s=>s.id===n.sid)?.scenes:n.kind==='group'?data.find(s=>s.id===n.sid)?.scenes.find(c=>c.id===n.cid)?.groups:get(n.parent)?.entity.items}
  function manage(action,key) {
    const n=get(key);if(!n)return;
    if(action==='open'){const url=safeURL(n.item[1]);if(url)window.open(url,'_blank','noopener,noreferrer');else notify('这个网址地址无效，请先编辑');return}
    if(action==='add'){addChild(n);return}
    if(action==='edit'){withEditor(n,()=>n.kind==='link'?editBookmark(n.position):editOrganization(n.kind,n.entity.id));return}
    if(action==='move'){writable(n,()=>movePicker(n));return}
    if(action==='up'||action==='down'){writable(n,()=>{const list=sourceList(n),at=list.indexOf(n.entity),to=at+(action==='up'?-1:1);if(to<0||to>=list.length){notify(action==='up'?'已经是第一项':'已经是最后一项');return}[list[at],list[to]]=[list[to],list[at]];persist();refresh();notify('顺序已调整，日常视图同步更新')});return}
    if(action==='delete')writable(n,()=>{drawer('删除'+label(n.kind),`<h3 class="at-detail-title">${esc(n.name)}</h3><p class="at-detail-note">${n.kind==='link'?'删除后可通过下方提示撤销。':'将同时删除其中的内容，删除后可通过下方提示撤销。'}</p><button class="at-confirm" data-at-delete="${esc(key)}">确认删除</button>`)});
  }
  let undo=null;
  function remove(key){const n=get(key);if(!n)return;writable(n,()=>{const list=sourceList(n);if(n.kind!=='link'&&list.length<2){notify('请至少保留一个'+label(n.kind));return}const at=list.indexOf(n.entity);if(at<0)return;list.splice(at,1);undo=()=>{list.splice(Math.min(at,list.length),0,n.entity);persist()};persist();if(n.key===root.key){state.sid=data[0].id;state.focus='s:'+state.sid;preferences()}else if(state.focus===key)state.focus=n.parent;repairContext();refresh();notify('已删除「'+n.name+'」',true)})}
  function repairContext(){if(!data.some(x=>x.id===spaceId))spaceId=data[0].id;const s=space();if(!s.scenes.some(c=>c.id===sceneId))sceneId=s.scenes[0]?.id}
  function movePicker(n) {
    const kind=n.kind==='scene'?'space':n.kind==='group'?'scene':'group';
    const targets=[];
    for(const s of data){if(kind==='space')targets.push({entity:s,sid:s.id,name:s.name,list:s.scenes});else for(const c of s.scenes){if(kind==='scene')targets.push({entity:c,sid:s.id,cid:c.id,name:s.name+' / '+c.name,list:c.groups});else for(const g of c.groups)targets.push({entity:g,sid:s.id,cid:c.id,gid:g.id,name:s.name+' / '+c.name+' / '+g.name,list:g.items})}}
    const available=targets.filter(t=>t.list!==sourceList(n));
    const aside=drawer('移动「'+n.name+'」',`<p class="at-detail-note">选择目标${label(kind)}，内容与日常视图同步更新。</p><input placeholder="搜索目标${label(kind)}" aria-label="搜索移动目标"><div class="at-drawer-list"></div>`);
    const draw=q=>{const matches=available.filter(t=>t.name.toLowerCase().includes(q.toLowerCase()));aside.querySelector('.at-drawer-list').innerHTML=matches.slice(0,60).map(t=>`<button data-at-destination="${available.indexOf(t)}">${esc(t.name)}<small>${t.list.length} 项内容</small></button>`).join('')+(matches.length>60?'<p class="at-detail-note">输入名称查找更多目标</p>':!matches.length?'<p class="at-detail-note">还没有可用的目标位置</p>':'')};draw('');aside.querySelector('input').oninput=e=>draw(e.target.value);
    aside.onclick=e=>{const b=e.target.closest('[data-at-destination]');if(!b)return;const t=available[Number(b.dataset.atDestination)];writable(n,()=>{
      const from=sourceList(n),at=from.indexOf(n.entity);if(n.kind!=='link'&&from.length<2){notify('原位置需至少保留一个'+label(n.kind));return}if(at<0)return;
      from.splice(at,1);t.list.push(n.entity);undo=()=>{const i=t.list.indexOf(n.entity);if(i>=0){t.list.splice(i,1);from.splice(Math.min(at,from.length),0,n.entity);persist()}};persist();if(state.focus===n.key)state.focus=n.parent;repairContext();refresh();notify('已移动到 '+t.name,true);
    })};
  }
  function notify(text,canUndo=false){const el=query('.at-notice');el.hidden=false;el.innerHTML=`<span>${esc(text)}</span>${canUndo?'<button data-at="undo">撤销</button>':''}`;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{if(el.isConnected)el.hidden=true},canUndo?12000:3500)}
  function click(e) {
    if(!e.target.closest('.at-layout-picker'))closeViewPicker();
    if(!e.target.closest('.space-global-search')){const results=query('.global-search-results');if(results)results.hidden=true}
    const b=e.target.closest('button,a');if(!b)return;
    if(b.hasAttribute('data-at-header')){const selector={add:'[data-action=add]',share:'[data-share-open]',settings:'[data-display-scope-open]'}[b.dataset.atHeader];setContext(get(state.focus));editorBusy=true;try{render();document.querySelector('.workspace '+selector)?.click()}finally{editorBusy=false}return}
    if(b.hasAttribute('data-at-link')){const n=get(b.dataset.atLink);if(!n||!safeURL(n.item[1])){e.preventDefault();notify('这个网址地址无效，请从管理菜单编辑')}return}
    if(b.hasAttribute('data-at-create')){const n=get(b.dataset.atCreate);if(n)addChild(n);return}
    if(b.hasAttribute('data-at-overview')){state.overview=!state.overview;renderAtlas();return}
    if(b.hasAttribute('data-at-focus')){focus(b.dataset.atFocus);return}
    if(b.hasAttribute('data-at-details')){details(b.dataset.atDetails);return}
    if(b.hasAttribute('data-at-manage')){manage(b.dataset.atManage,b.dataset.atKey);return}
    if(b.hasAttribute('data-at-delete')){remove(b.dataset.atDelete);return}
    if(b.hasAttribute('data-at-locate')){const n=get(b.dataset.atLocate);if(n){focus(n.parent);requestAnimationFrame(()=>query(`[data-key="${CSS.escape(n.key)}"] a`)?.focus({preventScroll:true}))}return}
    if(b.hasAttribute('data-at-dimension')){setViewDimension(b.dataset.atDimension,true);return}
    if(b.hasAttribute('data-at-view')){const id=b.dataset.atView;state.mode=['spatial','solar','systems'].includes(id)?'3d':'2d';if(state.mode==='3d')state.scene3d=id;else state.layout=id;state.motion=!reduceMotion.matches;savePreferences();resetCamera();renderAtlas();query('[data-at=views]').focus({preventScroll:true});return}
    if(b.hasAttribute('data-at-space')){state.sid=b.dataset.atSpace;state.focus='s:'+state.sid;preferences();resetCamera();buildIndex();setContext(root);renderAtlas();return}
    const action=b.dataset.at;
    if(action==='daily'){setContext(get(state.focus));closeAtlas('daily');return}
    if(action==='home'){leaveAtlasForHome();return}
    if(action==='views'){openViewPicker();return}
    if(action==='back'){const p=get(state.focus).parent;if(p)focus(p);return}
    if(action==='spaces'){drawer('切换空间',`<div class="at-drawer-list">${data.map(s=>`<button data-at-space="${esc(s.id)}" aria-current="${s.id===state.sid}">${esc(s.name)}<small>${s.scenes.length} 个场景</small></button>`).join('')}</div>`);return}
    if(action==='add'){addChild(get(state.focus));return}
    if(action==='close-drawer'){closeDrawer();return}
    if(action==='undo'&&undo){undo();undo=null;repairContext();refresh();notify('已撤销，内容已恢复')}
  }
  function closeAtlas(destination='daily'){
    if(!dialog?.open||atlasClosing)return;atlasClosing=true;leavingForHome=destination==='home';clearTimeout(atlasTransitionTimer);
    if(destination==='daily'){document.body.classList.remove('atlas-active');document.body.classList.add('atlas-transitioning')}
    dialog.classList.remove('atlas-ready');atlasTransitionTimer=setTimeout(()=>{if(dialog.open)dialog.close()},reduceMotion.matches?0:110);
  }
  function leaveAtlasForHome(){closeAtlas('home')}
  function setViewDimension(mode,focusTab=false){
    if(!['2d','3d'].includes(mode))return;
    query('.at-view-tabs')?.querySelectorAll('[data-at-dimension]').forEach(tab=>tab.setAttribute('aria-selected',String(tab.dataset.atDimension===mode)));
    query('.at-layout-menu')?.querySelectorAll('[data-at-view-panel]').forEach(panel=>panel.hidden=panel.dataset.atViewPanel!==mode);
    if(focusTab)query('[data-at-dimension="'+mode+'"]')?.focus({preventScroll:true});
  }
  function openViewPicker(){clearTimeout(viewMenuTimer);const pop=query('.at-layout-menu');if(!pop)return;pop.hidden=false;query('[data-at=views]')?.setAttribute('aria-expanded','true')}
  function closeViewPicker(){clearTimeout(viewMenuTimer);const pop=query('.at-layout-menu');if(pop)pop.hidden=true;query('[data-at=views]')?.setAttribute('aria-expanded','false')}
  function zoomBy(ratio){state.zoom=clamp(state.zoom*ratio,.35,3);needsPaint=true}
  function wheel(e){
    if(!e.target.closest('.at-canvas'))return;e.preventDefault();e.stopPropagation();if(!state.drag)zoomBy(Math.exp(-e.deltaY*.001))
  }
  function branchKeys(key){const keys=new Set([key]);for(let found=true;found;){found=false;for(const r of visible)if(keys.has(r.parent)&&!keys.has(r.key)){keys.add(r.key);found=true}}return keys}
  function segmentDistance(point,a,b){const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy,t=length?clamp(((point.x-a.x)*dx+(point.y-a.y)*dy)/length,0,1):0;return Math.hypot(point.x-(a.x+dx*t),point.y-(a.y+dy*t))}
  function nearestOrbitTrack(clientX,clientY,source){
    if(!orbital()||!source?.orbit)return null;
    const box=query('.at-canvas').getBoundingClientRect(),point={x:clientX-box.left,y:clientY-box.top};let best=null;
    for(const orbit of orbits){if(orbit.id===source.orbit.id||orbit.parentKey!==source.parent||!orbit.screenPoints?.length)continue;let distance=Infinity;for(let i=1;i<orbit.screenPoints.length;i++)distance=Math.min(distance,segmentDistance(point,orbit.screenPoints[i-1],orbit.screenPoints[i]));if(distance<(best?.distance??Infinity))best={orbit,distance}}
    return best&&best.distance<18?best.orbit:null;
  }
  function nearestSatelliteTrack(clientX,clientY,source){
    if(!systems()||!source?.satellite?.orbit)return null;
    const box=query('.at-canvas').getBoundingClientRect(),point={x:clientX-box.left,y:clientY-box.top};let best=null;
    for(const orbit of satelliteOrbits){if(orbit.id===source.satellite.orbit.id||!orbit.screenPoints?.length)continue;let distance=Infinity;for(let i=1;i<orbit.screenPoints.length;i++)distance=Math.min(distance,segmentDistance(point,orbit.screenPoints[i-1],orbit.screenPoints[i]));if(distance<(best?.distance??Infinity))best={orbit,distance}}
    return best&&best.distance<16?best.orbit:null;
  }
  function clearOrbitTargets(){for(const orbit of [...orbits,...satelliteOrbits])orbit.el?.classList.remove('is-drop-target')}
  function orbitValuesFor(n){
    const info=orbitPlan(n,true),values={...(info.values||{})};
    for(const orbit of orbits)for(const member of orbit.members)if(member.entity&&!['add','bundle'].includes(member.kind))values[orbitIdentity(member)]=orbit.id;
    info.plans[info.key]=values;return {info,values};
  }
  function satelliteValuesFor(scene){
    const info=orbitPlan(scene,true,'satellite'),values={...(info.values||{})};
    for(const orbit of satelliteOrbits)if(orbit.parentKey===scene.key)for(const member of orbit.members)if(member.entity&&member.kind==='group')values[orbitIdentity(member)]=orbit.ring;
    info.plans[info.key]=values;return {info,values};
  }
  function restoreMotion(positions,camera){refresh();query('.at-canvas').getAnimations().forEach(animation=>animation.cancel());Object.assign(state,camera);needsPaint=true;paint(0);for(const r of visible){const prev=positions.get(r.entity);if(prev){r.ox=prev.x-r.baseX;r.oy=prev.y-r.baseY}}state.settling=true;needsPaint=true}
  function pointerDown(e){
    const canvas=e.target.closest('.at-canvas');if(!canvas||e.button!==0||e.target.closest('.at-node-menu'))return;
    const node=e.target.closest('.at-node');
    if(node&&['add','bundle'].includes(node.dataset.kind))return;
    if(node&&!node.classList.contains('is-parent')){const keys=branchKeys(node.dataset.key);state.drag={type:'branch',key:node.dataset.key,keys,x:e.clientX,y:e.clientY,moved:false,offsets:new Map(visible.map(r=>[r.key,{x:r.ox||0,y:r.oy||0}])),slots:new Map(visible.map(r=>[r.key,{x:r.baseX,y:r.baseY}]))};for(const r of visible){r.previewX=0;r.previewY=0}return}
    if(e.target.closest('button,a'))return;
    e.preventDefault();
    state.drag={type:'canvas',x:e.clientX,y:e.clientY,yaw:state.yaw,pitch:state.pitch,panX:state.panX,panY:state.panY,pan:e.shiftKey||state.mode==='2d'};canvas.setPointerCapture(e.pointerId);canvas.classList.add('is-dragging');
  }
  function previewSwap(d,target){
    const sourceSlot=d.slots.get(d.key),targetSlot=d.slots.get(target),targetKeys=target?branchKeys(target):new Set();
    for(const r of visible){r.previewX=targetKeys.has(r.key)?sourceSlot.x-targetSlot.x:0;r.previewY=targetKeys.has(r.key)?sourceSlot.y-targetSlot.y:0}
  }
  function pointerMove(e){
    const d=state.drag;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;
    if(d.type==='branch'){
      if(!d.moved&&Math.hypot(dx,dy)<6)return;
      if(!d.moved){d.moved=true;state.settling=false;query('.at-canvas').setPointerCapture(e.pointerId);query('.at-canvas').classList.add('is-node-dragging');clearHover();for(const key of d.keys)nodeEls.get(key)?.classList.add('is-held')}
      e.preventDefault();for(const r of visible)if(d.keys.has(r.key)){r.ox=d.offsets.get(r.key).x+dx;r.oy=d.offsets.get(r.key).y+dy}
      const source=visible.find(r=>r.key===d.key),crossSceneGroups=systems()&&source?.kind==='group'&&source.satellite?.orbit,candidates=visible.filter(r=>(r.parent===source?.parent||crossSceneGroups&&r.kind==='group'&&r.satellite?.orbit)&&r.kind===source?.kind&&r.key!==d.key&&!r.isParent);
      const origin=d.slots.get(d.key),x=origin.x+dx,y=origin.y+dy,dist=r=>Math.hypot(d.slots.get(r.key).x-x,d.slots.get(r.key).y-y);
      const nearest=candidates.sort((a,b)=>dist(a)-dist(b))[0];
      d.target=nearest&&dist(nearest)<Math.max(46,Math.hypot(nearest.w,nearest.h)*state.zoom*.62)?nearest.key:null;
      const mainTarget=d.target?null:nearestOrbitTrack(e.clientX,e.clientY,source),satelliteTarget=d.target||mainTarget?null:nearestSatelliteTrack(e.clientX,e.clientY,source);
      d.orbitTarget=mainTarget?.id;d.satelliteTarget=satelliteTarget?.id;
      previewSwap(d,d.target);
      nodeEls.forEach((el,key)=>el.classList.toggle('is-sort-target',key===d.target));
      clearOrbitTargets();if(d.orbitTarget!==undefined&&d.orbitTarget!==null)orbits.find(orbit=>orbit.id===d.orbitTarget)?.el?.classList.add('is-drop-target');else if(d.satelliteTarget)satelliteOrbits.find(orbit=>orbit.id===d.satelliteTarget)?.el?.classList.add('is-drop-target');
    }else if(d.pan){state.panX=d.panX+dx;state.panY=d.panY+dy}else{state.yaw=d.yaw+dx*.006;state.pitch=d.pitch+dy*.005}
    needsPaint=true;
  }
  function pointerUp(e){
    const d=state.drag;if(d?.type==='branch'&&d.moved){state.suppressClickUntil=performance.now()+400;state.settling=true;needsPaint=true;nodeEls.forEach(el=>el.classList.remove('is-held'));query('.at-canvas').classList.add('is-settling')}
    state.drag=null;query('.at-canvas')?.classList.remove('is-dragging','is-node-dragging');
    nodeEls.forEach(el=>el.classList.remove('is-sort-target'));clearOrbitTargets();
    if(d?.moved&&e?.type!=='pointercancel'){if(d.target)reorder(d.key,d.target);else if(d.orbitTarget!==undefined&&d.orbitTarget!==null)moveToOrbit(d.key,d.orbitTarget,e.clientX,e.clientY);else if(d.satelliteTarget)moveGroupToScene(d.key,d.satelliteTarget,e.clientX,e.clientY)}
  }
  function reorder(key,target){
    const n=get(key),other=get(target),vr=visible.find(r=>r.key===key),vo=visible.find(r=>r.key===target),crossSceneGroups=systems()&&n?.kind==='group'&&other?.kind==='group'&&vr?.satellite?.orbit&&vo?.satellite?.orbit&&n.parent!==other.parent;if(!n||!other||n.kind!==other.kind||n.parent!==other.parent&&!crossSceneGroups)return;
    if(crossSceneGroups){swapGroups(n,other);return}
    writable(n,()=>{const list=sourceList(n),a=list.indexOf(n.entity),b=list.indexOf(other.entity);if(a<0||b<0)return;
      paint(0);
      const before=[...list],positions=new Map(visible.filter(r=>r.entity).map(r=>[r.entity,{x:r.px,y:r.py}])),camera=Object.fromEntries(['zoom','yaw','pitch','panX','panY','phase','orbitClock'].map(k=>[k,state[k]])),focusNode=get(state.focus);let beforePlan=null,planInfo=null;
      if(orbital()&&vr?.orbit&&vo?.orbit){const plan=orbitValuesFor(focusNode);planInfo=plan.info;beforePlan={...plan.values};const left=orbitIdentity(vr),right=orbitIdentity(vo),ring=plan.values[left];plan.values[left]=plan.values[right];plan.values[right]=ring;planInfo.plans[planInfo.key]=plan.values}
      else if(systems()&&vr?.satellite?.orbit&&vo?.satellite?.orbit){const plan=satelliteValuesFor(get(vr.parent));planInfo=plan.info;beforePlan={...plan.values};const left=orbitIdentity(vr),right=orbitIdentity(vo),ring=plan.values[left];plan.values[left]=plan.values[right];plan.values[right]=ring;planInfo.plans[planInfo.key]=plan.values}
      [list[a],list[b]]=[list[b],list[a]];undo=()=>{list.splice(0,list.length,...before);if(planInfo){planInfo.plans[planInfo.key]=beforePlan;writeSaved()}persist()};persist();if(planInfo)writeSaved();restoreMotion(positions,camera);
    });
  }
  function moveToOrbit(key,orbitId,clientX,clientY){
    const n=get(key),source=visible.find(r=>r.key===key),target=orbits.find(orbit=>orbit.id===orbitId),focusNode=get(state.focus);if(!n||!source?.orbit||!target||source.orbit.id===target.id||source.parent!==target.parentKey)return;
    const realTargets=target.members.filter(r=>r.entity&&!['add','bundle'].includes(r.kind)&&r.kind===source.kind);
    if(target.members.length>=target.capacity&&realTargets.length){const box=query('.at-canvas').getBoundingClientRect(),x=clientX-box.left,y=clientY-box.top,nearest=[...realTargets].sort((a,b)=>Math.hypot(a.px-x,a.py-y)-Math.hypot(b.px-x,b.py-y))[0];reorder(key,nearest.key);return}
    writable(n,()=>{const list=sourceList(n),at=list.indexOf(n.entity);if(at<0)return;paint(0);
      const before=[...list],positions=new Map(visible.filter(r=>r.entity).map(r=>[r.entity,{x:r.px,y:r.py}])),camera=Object.fromEntries(['zoom','yaw','pitch','panX','panY','phase','orbitClock'].map(k=>[k,state[k]])),plan=orbitValuesFor(focusNode),beforePlan={...plan.values};
      plan.values[orbitIdentity(source)]=target.id;plan.info.plans[plan.info.key]=plan.values;
      list.splice(at,1);const anchors=target.members.map(r=>r.entity).filter(Boolean),last=anchors.map(entity=>list.indexOf(entity)).filter(i=>i>=0).at(-1);list.splice(last===undefined?list.length:last+1,0,n.entity);
      undo=()=>{list.splice(0,list.length,...before);plan.info.plans[plan.info.key]=beforePlan;persist();writeSaved()};persist();writeSaved();restoreMotion(positions,camera);notify('已移到第 '+(target.id+1)+' 条轨道',true);
    });
  }
  function swapGroups(n,other){
    const vr=visible.find(r=>r.key===n.key),vo=visible.find(r=>r.key===other.key);if(!vr?.satellite?.orbit||!vo?.satellite?.orbit)return;
    writable(n,()=>{
      const left=sourceList(n),right=sourceList(other),a=left.indexOf(n.entity),b=right.indexOf(other.entity);if(a<0||b<0)return;
      paint(0);
      const beforeLeft=[...left],beforeRight=[...right],positions=new Map(visible.filter(r=>r.entity).map(r=>[r.entity,{x:r.px,y:r.py}])),camera=Object.fromEntries(['zoom','yaw','pitch','panX','panY','phase','orbitClock'].map(k=>[k,state[k]]));
      const leftPlan=satelliteValuesFor(get(n.parent)),rightPlan=satelliteValuesFor(get(other.parent)),beforeLeftPlan={...leftPlan.values},beforeRightPlan={...rightPlan.values},leftId=orbitIdentity(vr),rightId=orbitIdentity(vo),leftRing=leftPlan.values[leftId]??vr.ring??0,rightRing=rightPlan.values[rightId]??vo.ring??0;
      delete leftPlan.values[leftId];delete rightPlan.values[rightId];leftPlan.values[rightId]=leftRing;rightPlan.values[leftId]=rightRing;leftPlan.info.plans[leftPlan.info.key]=leftPlan.values;rightPlan.info.plans[rightPlan.info.key]=rightPlan.values;
      left[a]=other.entity;right[b]=n.entity;
      undo=()=>{left.splice(0,left.length,...beforeLeft);right.splice(0,right.length,...beforeRight);leftPlan.info.plans[leftPlan.info.key]=beforeLeftPlan;rightPlan.info.plans[rightPlan.info.key]=beforeRightPlan;persist();writeSaved()};
      persist();writeSaved();restoreMotion(positions,camera);notify('两个分组已交换位置',true)
    })
  }
  function moveGroupToScene(key,orbitId,clientX,clientY){
    const n=get(key),source=visible.find(r=>r.key===key),targetOrbit=satelliteOrbits.find(orbit=>orbit.id===orbitId),scene=get(targetOrbit?.parentKey),fromScene=get(n?.parent);if(!n||n.kind!=='group'||!source?.satellite?.orbit||!scene||scene.kind!=='scene'||!fromScene)return;
    const realTargets=targetOrbit.members.filter(r=>r.entity&&r.kind==='group');
    if(targetOrbit.members.length>=targetOrbit.capacity&&realTargets.length){const box=query('.at-canvas').getBoundingClientRect(),x=clientX-box.left,y=clientY-box.top,nearest=[...realTargets].sort((a,b)=>Math.hypot(a.px-x,a.py-y)-Math.hypot(b.px-x,b.py-y))[0];reorder(key,nearest.key);return}
    writable(n,()=>{
      const sameScene=n.parent===scene.key,from=sourceList(n),to=scene.entity.groups,at=from.indexOf(n.entity);if(at<0)return;
      if(!sameScene&&from.length<2){notify('原场景需至少保留一个分组');return}
      paint(0);
      const beforeFrom=[...from],beforeTo=sameScene?null:[...to],positions=new Map(visible.filter(r=>r.entity).map(r=>[r.entity,{x:r.px,y:r.py}])),camera=Object.fromEntries(['zoom','yaw','pitch','panX','panY','phase','orbitClock'].map(k=>[k,state[k]]));
      const fromPlan=satelliteValuesFor(fromScene),toPlan=sameScene?fromPlan:satelliteValuesFor(scene),beforeFromPlan={...fromPlan.values},beforeToPlan=sameScene?null:{...toPlan.values},identity=orbitIdentity(source);
      if(!sameScene)delete fromPlan.values[identity];toPlan.values[identity]=targetOrbit.ring;fromPlan.info.plans[fromPlan.info.key]=fromPlan.values;toPlan.info.plans[toPlan.info.key]=toPlan.values;
      from.splice(at,1);to.splice(Math.min(to.length,targetOrbit.ring*targetOrbit.capacity),0,n.entity);
      undo=()=>{from.splice(0,from.length,...beforeFrom);if(!sameScene)to.splice(0,to.length,...beforeTo);fromPlan.info.plans[fromPlan.info.key]=beforeFromPlan;if(!sameScene)toPlan.info.plans[toPlan.info.key]=beforeToPlan;persist();writeSaved()};
      persist();writeSaved();restoreMotion(positions,camera);notify(sameScene?'已移到第 '+(targetOrbit.ring+1)+' 条分组轨道':'已移到「'+scene.name+'」的第 '+(targetOrbit.ring+1)+' 条轨道',true)
    })
  }
  function keydown(e){
    if(e.target.matches('input,textarea')){if(e.key==='Escape'){e.preventDefault();clearSearch()}return}
    if(e.target.matches('[data-at-dimension]')&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=[...query('.at-view-tabs').querySelectorAll('[data-at-dimension]')],at=tabs.indexOf(e.target),next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(at+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;setViewDimension(tabs[next].dataset.atDimension,true);return}
    if(e.key==='Escape'&&state.drag){e.preventDefault();pointerUp({type:'pointercancel'});return}
    if(e.key==='Escape'&&!query('.at-layout-menu').hidden){e.preventDefault();closeViewPicker();query('[data-at=views]').focus();return}
    if(e.key==='Backspace'&&get(state.focus).parent){e.preventDefault();focus(get(state.focus).parent)}
    if(e.key==='+'||e.key==='='){e.preventDefault();zoomBy(1.2)}if(e.key==='-'){e.preventDefault();zoomBy(1/1.2)}
  }
  const sessionThemes=new Map(),effectiveBeforeEntry=effective;
  effective=function(){const p={...effectiveBeforeEntry()};if(view==='space'&&sessionThemes.has(spaceId))p.theme=sessionThemes.get(spaceId);return p};
  const themeBeforeEntry=changeTheme;
  changeTheme=function(id){if(view==='space')sessionThemes.set(spaceId,id==='projection'?'wallfilm':id);const value=themeBeforeEntry(id);if(view==='space'){rememberPresentation(spaceId,dialog?.open?'atlas':'daily');writeSaved()}return value};
  const settingsBeforeEntry=renderSettings;
  renderSettings=function(){settingsBeforeEntry();if(scope!=='global')return;const tabs=document.querySelector('#settings .settings-tabs');if(!tabs)return;tabs.insertAdjacentHTML('beforeend','<button role="tab" data-settings-tab="space-entry" aria-selected="'+(settingsTab==='space-entry')+'">空间</button>');if(settingsTab==='space-entry')document.querySelector('#settings .settings-panel').innerHTML=entryPanel()};
  function entryPanel(){
    const gestureNote=prefs.homeEntryGesture==='double'?'从首页连续向下滑动两次，即可进入我的空间':'从首页向下滑动一次，即可进入我的空间';
    const themeNote=prefs.spaceThemePolicy==='default'?'每次进入空间时，从默认主题开始':'再次进入空间时，接着上次离开时的主题';
    return '<section class="space-entry-settings"><h3>进入空间的方式</h3><div class="space-entry-row"><div><i>'+icons.down+'</i><b>首页下滑</b></div>'+choices('homeEntryGesture',[['single','单次滑动'],['double','连续滑动']],prefs)+'<small>'+gestureNote+'</small></div><h3>空间打开样式</h3><div class="space-entry-row"><div><i>'+icons.grid+'</i><b>进入时显示</b></div>'+choices('spaceThemePolicy',[['default','默认样式'],['last','上次切换的样式']],prefs)+'<small>'+themeNote+'</small></div></section>';
  }
  const originalRender=render;let lastView=view,lastSid=spaceId;
  render=function(){const entering=view==='space'&&(lastView!=='space'||lastSid!==spaceId),preferred=entering?entryPresentation(spaceId):null,active=dialog?.open;
    if(entering){if(preferred?.theme&&THEMES[preferred.theme])sessionThemes.set(spaceId,preferred.theme);else sessionThemes.delete(spaceId)}lastView=view;lastSid=spaceId;
    originalRender();mountEntry();
    if(active&&!editorBusy){if(view!=='space'){dialog.close();return}if(entering&&preferred?.view==='daily'){dialog.close();return}if(state.sid!==spaceId){state.sid=spaceId;state.focus='s:'+spaceId;preferences();if(preferred?.view==='atlas')for(const field of ['mode','layout','scene3d'])if(preferred[field]!==undefined)state[field]=preferred[field];resetCamera()}if(buildIndex())renderAtlas();else dialog.close()}
    else if(!active&&entering&&preferred?.view==='atlas')open(spaceId,null,preferred,true);
  };
  mountEntry();
})();
