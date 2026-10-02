/* Account-scoped onboarding. The letter describes the product; tours use live availability. */
(() => {
  'use strict';
  const $q = s => document.querySelector(s);
  const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M3 14h7a4 4 0 0 0 4-4V3M14 14l7 7"/></svg>';
  let owner = '', state = null, loading = false, queue = Promise.resolve(), welcome = null, tour = null;
  let startTimer = 0, scheduled = 0, pausedArea = '', lastArea = '', stepId = '', signature = '', previousFocus = null;
  let tourStepIds=null;
  let inertNodes = [], exposed = [], busy = false, stateEpoch = 0, mutationVersion = 0;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const delay = ms => new Promise(resolve => setTimeout(resolve, reduced() ? 0 : ms));
  const identity = () => signed ? prefs.accountProfile?.id || '' : '';
  const config = () => window.ShiyuFeatureConfig?.onboarding?.();
  const enabled = () => config()?.enabled === true;
  const allowed = key => window.ShiyuFeatureConfig?.allowed(key) !== false;
  const category = key => window.ShiyuFeatureConfig?.category(key) !== false;
  function area() {
    const params = new URLSearchParams(location.search);
    if (window.parent !== window || params.has('tool-account') || params.has('tool-login') || params.has('page') || params.has('corner') || params.has('operations-preview')) return '';
    if (document.body.classList.contains('world-active') || $q('#my-corner[open],#space-atlas[open]')) return '';
    if (view === 'space') return 'space';
    if (view === 'home' && !['space.shiyubox.com','world.shiyubox.com'].includes(location.hostname)) return 'home';
    return '';
  }
  const blocking = () => document.hidden || !!$q('dialog[open]:not(.sy-welcome):not(.sy-tour),.workspace-guide,.at-drawer:not([hidden])') || document.body.classList.contains('paper-edit-active');
  const ready = () => !!identity() && owner === identity() && !!state && enabled() && document.documentElement.classList.contains('shiyu-account-ready');
  const visible = el => el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && Number(getComputedStyle(el).opacity) > .05;
  function target(step) { return step.targets.map(selector => $q(selector)).find(el=>el&&el.getClientRects().length&&!el.closest('[hidden]')); }
  const homeSteps = [
    {id:'world', title:'向外，发现一个世界', body:'这里是「世界」。发现精选网址、学习路线与创作素材，把遇见的喜欢带回自己的空间。', targets:['body>.world-entry'], available:() => allowed('world') && !$q('body.world-entry-disabled') && window.ShiyuFeatureConfig?.worldAvailable?.() === true},
    {id:'space', title:'向内，安放你的喜欢', body:'这里进入「我的空间」。把常用网址收藏起来，用空间、场景与分组整理工作、学习和生活。进入后，还会带你认识里面的操作。', targets:['.dock-trigger','.scroll-invitation'], available:() => allowed('space') && allowed('spaceViews')},
    {id:'theme', title:'换一个主题，换一种心情', body:'从左上角切换主题，找到喜欢的页面风格。展开主题菜单，还可以浏览当前可用的主题。', targets:['body>header .brand'], available:() => category('themes')},
    {id:'search', title:'从这里，找到你想要的', body:'切换「搜网页」和「搜收藏」，既能搜索网上的内容，也能查找自己收藏的网址。点击搜索引擎名称，还可以选择不同的搜索引擎或平台。', targets:['.search-area']},
    {id:'pet', title:'我的一隅，有个伙伴陪你', body:'这是你的桌面伙伴，也是一组随手可用的快捷入口。展开后，可以查看当前开放的功能，快速进入常用模块；还可以和伙伴互动、拖动它的位置，在「桌面伙伴」设置中选择喜欢的形象。', targets:['#desktop-pet .pet-character','#desktop-pet .pet-menu'],combine:true, available:() => category('pet') && window.ShiyuDesktopPet?.read().enabled!==false},
  ];
  const spaceSteps = [
    {id:'spaces',title:'从空间开始整理',body:'左上角是当前空间。你可以切换空间，把工作、学习和生活分开管理。',targets:['.sidebar .space-heading-controls','.sidebar .space-select']},
    {id:'scenes',title:'用场景区分日常',body:'在左侧切换场景，把日常收藏、工作学习等不同用途分开。每个场景都可以拥有自己的网址分组。',targets:['.sidebar .scene-scroll'],combine:true},
    {id:'groups',title:'用分组整理网址',body:'在这里切换当前场景下的分组，把同一类网址放在一起，查找和使用更方便。',targets:['.group-tab-bar']},
    {id:'views',title:'切换视图与样式',body:'右下角可以切换当前开放的视图；旁边的样式按钮，可以选择自己喜欢的呈现方式。',targets:['.workspace-tools>.group-view-controls'],available:() => allowed('spaceViews')},
    {id:'collect',title:'收藏网址，稍后再整理',body:'点击「收藏网址」手动添加。通过浏览器插件收下的网址会进入「稍后整理」，回来后再归类；插件可以从头像菜单中的「浏览器插件」了解和获取。',targets:['.space-top-actions [data-action="add"]','.space-top-actions [data-space-inbox]'],combine:true},
    {id:'return',title:'随时回到首页',body:'点击上方的返回入口回到首页。网址列表已经在顶部时，也可以连续向上滚动两次返回。',targets:['.space-home-tab','.peek-return']}
  ];
  const moduleAllowed = name => config()?.[name] !== false && (name !== 'space' || allowed('space') && allowed('spaceViews'));
  function steps(name) { return moduleAllowed(name) ? (name === 'home' ? homeSteps : spaceSteps).filter(step => (!step.available || step.available()) && (tourStepIds?tourStepIds.has(step.id):step.id==='pet'?!!$q('#desktop-pet'):target(step))) : []; }
  function applyColor(el) {
    const accent = resolveThemeColor();
    if (accent) el.style.setProperty('--guide-accent', accent);
    const rgb = /^#([0-9a-f]{6})$/i.exec(accent || '');
    if (rgb) { const n = parseInt(rgb[1],16); el.style.setProperty('--guide-on-accent', ((n>>16)*299+((n>>8)&255)*587+(n&255)*114)/1000 > 158 ? '#182024' : '#fff'); }
  }
  function cache() { try { localStorage.setItem('shiyu-onboarding:'+owner, JSON.stringify(state)); } catch {} }
  async function loadState() {
    const id = identity();
    if (!id || loading || busy || !document.documentElement.classList.contains('shiyu-account-ready')) return;
    loading = true;
    const epoch = stateEpoch, version = mutationVersion;
    try {
      const response = await fetch('/api/shiyu/auth/onboarding', {credentials:'same-origin',cache:'no-store'});
      const result = await response.json();
      if (response.ok && identity() === id && epoch === stateEpoch && version === mutationVersion && result.userId === id) { owner=id;state=result.onboarding;cache(); }
    } catch {} finally { loading=false;schedule(); }
  }
  function action(type, fields = {}) {
    const id = identity(), epoch = stateEpoch, round = state?.round;
    const task = queue.then(async () => {
      if (identity() !== id || epoch !== stateEpoch) return false;
      mutationVersion++;
      try {
        const response = await fetch('/api/shiyu/auth/onboarding', {method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:id,action:type,round,...fields})});
        const result = await response.json();
        if (identity() !== id || epoch !== stateEpoch || result.userId && result.userId !== id) return false;
        if (result.onboarding) { state=result.onboarding;owner=id;cache(); }
        if (!response.ok) throw Error(result.message || '引导进度暂未保存，请重试');
        schedule();return true;
      } catch(error) { toast(error.message || '引导进度暂未保存，请重试');return false; }
    });
    queue = task.catch(() => false);return task;
  }
  function syncMenu() {
    const existing = [...document.querySelectorAll('[data-onboarding-entry]')];
    const menu = $q('body>header .account-menu');
    const show = area()==='home' && signed && enabled() && !!menu;
    existing.forEach(node => { if (!show || node.parentElement !== menu) node.remove(); });
    if (!show || menu.querySelector('[data-onboarding-entry]')) return;
    const button = document.createElement('button');button.type='button';button.dataset.onboardingEntry='';button.setAttribute('role','menuitem');
    button.innerHTML=icon+'<span>开启新手引导</span>';
    const exit=menu.querySelector('[data-account-signout]');exit ? exit.before(button) : menu.append(button);
    button.onclick=async () => { if (!ready()) await loadState(); if (!ready()) {toast('正在确认登录和引导状态，请稍后重试');return;} $q('.account-menu-wrap')?.classList.remove('menu-pinned');button.blur();openLetter(); };
  }
  function art(kind) {
    const common='viewBox="0 0 220 120" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
    const drawings={
      world:'<circle cx="110" cy="61" r="36" opacity=".13" fill="currentColor" stroke="none"/><ellipse cx="110" cy="61" rx="66" ry="21" transform="rotate(-22 110 61)" opacity=".45"/><circle cx="110" cy="61" r="31"/><ellipse cx="110" cy="61" rx="14" ry="31"/><path d="M80 53h60M83 73h54" opacity=".6"/><circle cx="165" cy="38" r="4" fill="currentColor"/><path d="M48 39h8m-4-4v8m109 48h6m-3-3v6" opacity=".6"/>',
      space:'<rect x="53" y="22" width="105" height="74" rx="6" transform="rotate(-8 53 22)" opacity=".18" fill="currentColor" stroke="none"/><rect x="57" y="26" width="112" height="74" rx="5" fill="var(--guide-paper)"/><path d="M57 43h112M86 43v57" opacity=".5"/><circle cx="65" cy="35" r="1"/><circle cx="70" cy="35" r="1"/><path d="M64 54h14m-14 10h10m-10 10h14" opacity=".5"/><rect x="95" y="52" width="27" height="17" rx="3"/><rect x="129" y="52" width="27" height="17" rx="3"/><rect x="95" y="77" width="27" height="14" rx="3" opacity=".5"/><rect x="129" y="77" width="27" height="14" rx="3" opacity=".5"/>',
      pet:'<ellipse cx="110" cy="99" rx="48" ry="5" fill="currentColor" opacity=".09" stroke="none"/><path d="M78 64V31l21 15q11-5 22 0l21-15v33q4 31-32 31T78 64Z" fill="currentColor" opacity=".12" stroke="none"/><path d="M79 63V31l21 15q10-5 21 0l21-15v33q4 31-32 31T79 63Z"/><path d="M94 64h1m29 0h1m-20 12q5 7 10 0m-37-6-12-3m12 11-12 3m76-11 12-3m-12 11 12 3"/><path d="M167 28c-7-9-17 1 0 12 17-11 7-21 0-12Z" opacity=".6"/>'
    };
    return '<svg class="sy-concept-art" '+common+'>'+drawings[kind]+(kind==='world'?'<g fill="var(--guide-paper)"><rect x="22" y="70" width="37" height="25" rx="4"/><rect x="158" y="20" width="40" height="27" rx="4"/><rect x="158" y="82" width="26" height="23" rx="3"/></g><path d="M22 78h37m-29 7h20m-20 5h12m147-53-7-4v8Zm-13 57h10m-10 5h7"/><g fill="currentColor" stroke="none" font-size="9" text-anchor="middle"><text x="40" y="108">网址</text><text x="178" y="59">UP 主</text><text x="171" y="117">素材</text></g>':kind==='pet'?'<g fill="var(--guide-paper)"><rect x="23" y="27" width="37" height="45" rx="5" transform="rotate(-10 42 50)"/><rect x="29" y="31" width="37" height="45" rx="5"/></g><path d="M34 60l8-11 7 6 8-15M34 68h26"/><circle cx="162" cy="76" r="7" fill="currentColor" opacity=".25"/><circle cx="178" cy="76" r="7" fill="currentColor" opacity=".55"/>':'')+'</svg>';
  }
  function openLetter() {
    if (welcome || tour || area()!=='home' || blocking() || !ready()) return;
    clearTimeout(startTimer);previousFocus=document.activeElement;
    const dialog=document.createElement('dialog');welcome=dialog;dialog.className='sy-welcome';dialog.setAttribute('aria-label','致用户的一封信');applyColor(dialog);
    dialog.innerHTML='<button class="sy-welcome-close" aria-label="收起欢迎信">×</button><div class="sy-welcome-stage"><div class="sy-envelope-scene"><p class="sy-envelope-kicker"><span>拾隅来信</span><small>A LETTER FROM SHIYU</small></p><div class="sy-envelope"><div class="sy-envelope-back"></div><div class="sy-envelope-letter">致刚来到拾隅的你<small>A LITTLE CORNER, JUST FOR YOU</small></div><div class="sy-envelope-front"></div><div class="sy-envelope-flap"></div><button class="sy-wax" aria-label="揭开火漆印，打开信件">'+icon+'</button><span class="sy-envelope-address">给你 · 一个属于自己的小角落</span></div><p class="sy-envelope-hint">轻触火漆，拆开这封信</p></div><article class="sy-letter" inert aria-hidden="true"><div class="sy-letter-head"><span>拾隅 · 写给你</span><span>发现 / 收藏 / 陪伴</span></div><h1>世界很大，留一隅给自己。</h1><p class="sy-letter-intro">你好，欢迎来到拾隅。<br>这里可以是你打开浏览器时的第一站：向外，遇见值得收藏的世界；向内，安放自己的喜欢。我们想先带你认识三个小地方。</p><div class="sy-letter-concepts"><section class="sy-concept">'+art('world')+'<h2>拾隅世界</h2><p>精选网址、UP 主资源、学习路线与创作素材。循着好奇，发现新的灵感。</p></section><section class="sy-concept">'+art('pet')+'<h2>我的一隅</h2><p>丰富的主题、喜欢的配色，还有宠物伙伴。把日常的小角落，装扮成自己的样子。</p></section><section class="sy-concept">'+art('space')+'<h2>我的空间</h2><p>收藏常用网址，按空间、场景和分组，整理工作、学习与生活。</p></section></div><p class="sy-letter-note">再换一个主题，挑一种喜欢的颜色，让这里慢慢成为你的样子。<br>接下来，我们会带你认识当前开放的入口；你可以随时跳过，按自己的节奏探索。</p><p class="sy-letter-signature">让喜欢，自有归处。<br><small>—— 拾隅</small></p><footer class="sy-letter-footer"><div><button class="sy-guide-primary" data-letter-start>开始探索之旅 <span aria-hidden="true">→</span></button></div></footer></article></div><button class="sy-text-button sy-letter-later" data-letter-later>稍后再看</button>';
    document.body.classList.remove('global-chrome-idle','fullscreen-idle');document.body.append(dialog);dialog.showModal();dialog.querySelector('.sy-wax').focus({preventScroll:true});
    dialog.querySelector('.sy-wax').onclick=()=>unsealLetter(dialog);
    const later=async event => { if(busy)return;const stow=event?.currentTarget?.hasAttribute('data-letter-later');busy=true;if(await action('welcome')){if(stow)await stowLetter(dialog);else await closeLetter();}busy=false; };
    dialog.querySelectorAll('[data-letter-later],.sy-welcome-close').forEach(button=>button.onclick=later);
    dialog.addEventListener('cancel',event=>{event.preventDefault();void later();});
    dialog.querySelector('[data-letter-start]').onclick=async () => { if(busy)return;busy=true;const button=dialog.querySelector('[data-letter-start]');button.disabled=true;if(await action('start')){pausedArea='';for(const name of ['home','space'])if(!moduleAllowed(name))await action('complete',{module:name});await flyLetter(dialog);if(!moduleAllowed('home')&&moduleAllowed('space'))toast('指引已开启，进入我的空间时继续');}else button.disabled=false;busy=false;schedule(); };
  }
  async function unsealLetter(dialog) {
    if(dialog.classList.contains('is-opening')||busy)return;
    dialog.classList.add('is-opening');dialog.querySelector('[data-letter-later]').hidden=true;
    await delay(480);if(welcome!==dialog||dialog.classList.contains('is-closing')||dialog.classList.contains('is-stowing'))return;
    const letter=dialog.querySelector('.sy-letter'),envelope=dialog.querySelector('.sy-envelope'),scene=dialog.querySelector('.sy-envelope-scene');
    const r=envelope.getBoundingClientRect();
    letter.style.transition='none';letter.style.transform='none';
    const box=letter.getBoundingClientRect(),scale=(r.width-48)/box.width;
    const x=r.left+r.width/2-(box.left+box.width/2),y=r.top+r.height*.5-(box.top+box.height/2);
    const extracted=y-Math.min(r.height*.68,innerHeight*.22);
    dialog.classList.add('is-extracting');
    const animation=letter.animate([
      {opacity:1,transform:`translate(${x}px,${y}px) scale(${scale})`,clipPath:'inset(0 0 100% 0 round 16px)',offset:0},
      {opacity:1,transform:`translate(${x}px,${extracted}px) scale(${scale})`,clipPath:'inset(0 0 0% 0 round 16px)',offset:.48},
      {opacity:1,transform:'translate(0,0) scale(1)',clipPath:'inset(0 0 0% 0 round 16px)',offset:1}
    ],{duration:reduced()?1:1600,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'});
    scene.animate([{opacity:1,transform:'none'},{opacity:1,transform:'translateY(25px)',offset:.45},{opacity:0,transform:'translateY(100px) scale(.94)'}],{duration:reduced()?1:1600,easing:'ease-in-out',fill:'forwards'});
    await animation.finished.catch(()=>{});
    if(welcome!==dialog||dialog.classList.contains('is-closing')||dialog.classList.contains('is-stowing'))return;
    dialog.classList.add('is-open');animation.cancel();letter.style.removeProperty('transition');letter.style.removeProperty('transform');
    letter.inert=false;letter.removeAttribute('aria-hidden');scene.inert=true;dialog.querySelector('[data-letter-start]').focus({preventScroll:true});
  }
  async function stowLetter(dialog) {
    if(welcome!==dialog)return;
    const avatar=$q('body>header [data-account-open]');
    if(reduced()||!visible(avatar)){await closeLetter(true);return;}
    const scene=dialog.querySelector('.sy-envelope-scene'),letter=dialog.querySelector('.sy-letter'),envelope=dialog.querySelector('.sy-envelope');
    const wasOpen=dialog.classList.contains('is-opening');
    dialog.classList.add('is-stowing');letter.inert=true;scene.inert=true;
    // Freeze any in-progress opening before reversing the same paper back into its envelope.
    const current=getComputedStyle(letter),from={transform:current.transform,opacity:current.opacity,clipPath:current.clipPath};
    letter.getAnimations().forEach(a=>a.cancel());scene.getAnimations().forEach(a=>a.cancel());
    Object.assign(scene.style,{transition:'none',transform:'none',opacity:wasOpen?'0':'1'});
    const r=envelope.getBoundingClientRect();
    letter.style.transition='none';letter.style.transform='none';const box=letter.getBoundingClientRect();
    const x=r.left+r.width/2-(box.left+box.width/2),y=r.top+r.height/2-(box.top+box.height/2),scale=(r.width-48)/box.width;
    if(wasOpen){
      scene.animate([{opacity:0},{opacity:1}],{duration:600,fill:'forwards'});
      const retract=letter.animate([from,{transform:`translate(${x}px,${y-r.height*.48}px) scale(${scale})`,opacity:1,clipPath:'inset(0 0 0% 0 round 16px)',offset:.58},{transform:`translate(${x}px,${y}px) scale(${scale})`,opacity:1,clipPath:'inset(0 0 100% 0 round 16px)'}],{duration:1050,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
      await retract.finished.catch(()=>{});if(welcome!==dialog)return;
    }
    letter.style.visibility='hidden';dialog.classList.remove('is-open','is-opening','is-extracting');
    await delay(wasOpen?850:80);if(welcome!==dialog)return;
    dialog.classList.add('is-stow-flight');
    const a=avatar.getBoundingClientRect(),e=envelope.getBoundingClientRect(),s=scene.getBoundingClientRect();
    scene.style.transformOrigin=`${e.left+e.width/2-s.left}px ${e.top+e.height/2-s.top}px`;
    const dx=a.left+a.width/2-(e.left+e.width/2),dy=a.top+a.height/2-(e.top+e.height/2);
    const flight=scene.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${dx*.45}px,${dy*.3-35}px) scale(.55) rotate(7deg)`,opacity:1,offset:.5},{transform:`translate(${dx}px,${dy}px) scale(${Math.min(a.width/e.width,a.height/e.height)*.7}) rotate(0deg)`,opacity:0}],{duration:1150,easing:'cubic-bezier(.45,0,.2,1)',fill:'forwards'});
    await flight.finished.catch(()=>{});if(welcome!==dialog)return;
    await closeLetter(true);
    if(avatar.isConnected)avatar.animate([{filter:'brightness(1)'},{filter:'brightness(1.35)',offset:.45},{filter:'brightness(1)'}],{duration:550,easing:'ease-out'});
  }
  async function flyLetter(dialog) {
    if(welcome!==dialog)return;
    if(reduced()){await closeLetter(true);startTour();return;}
    exposeTargets();
    const first=moduleAllowed('home')?steps('home')[0]:null,el=first&&target(first),dest=el?.getBoundingClientRect();
    const letter=dialog.querySelector('.sy-letter'),box=letter.getBoundingClientRect(),cx=box.left+box.width/2,cy=box.top+box.height/2;
    const scale=Math.min(230/box.width,150/box.height),shape='polygon(0% 0%,100% 50%,12% 100%,29% 53%)';
    dialog.classList.add('is-departing');letter.inert=true;
    for(const child of letter.children)child.animate([{opacity:1},{opacity:0}],{duration:280,fill:'forwards'});
    const fold=letter.animate([
      {transform:'scale(1)',clipPath:'polygon(0% 0%,100% 0%,100% 100%,0% 100%)',offset:0},
      {transform:'scale(.72) rotate(-4deg)',clipPath:'polygon(0% 0%,100% 50%,0% 100%,12% 50%)',offset:.55},
      {transform:`scale(${scale}) rotate(-8deg)`,clipPath:shape,offset:1}
    ],{duration:950,easing:'cubic-bezier(.45,0,.2,1)',fill:'forwards'});
    await fold.finished.catch(()=>{});if(welcome!==dialog)return;
    const plane=document.createElement('div');plane.className='sy-paper-plane';
    Object.assign(plane.style,{left:box.left+'px',top:box.top+'px',width:box.width+'px',height:box.height+'px',transform:`scale(${scale}) rotate(-8deg)`});
    plane.innerHTML='<svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M12 16 228 54 79 83Z" fill="var(--plane-paper)"/><path d="M79 83 228 54 98 137Z" fill="var(--plane-shadow)"/><path d="M79 83 98 137 137 104 228 54Z" fill="var(--plane-fold)"/><path d="M24 104 228 54 137 104Z" fill="var(--plane-light)"/><path d="M12 16 228 54 24 104M79 83 228 54M98 137 137 104 228 54" fill="none" stroke="var(--plane-edge)" stroke-width="1.1" stroke-linejoin="round"/></svg>';
    dialog.append(plane);letter.style.visibility='hidden';
    // Measure after the fold so revealed navigation controls have reached their resting position.
    const landing=el?.isConnected?el.getBoundingClientRect():dest;
    const dx=(landing?landing.left+landing.width/2:innerWidth*.8)-cx,dy=(landing?landing.top+landing.height/2:innerHeight*.15)-cy;
    const arc=Math.min(260,innerWidth*.2),p1={x:arc,y:-arc*.14},p2={x:dx+Math.min(arc,innerWidth-cx-dx-48),y:dy*.55};
    const frames=Array.from({length:81},(_,i)=>{
      const t=i/80,u=1-t,x=3*u*u*t*p1.x+3*u*t*t*p2.x+t*t*t*dx,y=3*u*u*t*p1.y+3*u*t*t*p2.y+t*t*t*dy;
      const vx=3*u*u*p1.x+6*u*t*(p2.x-p1.x)+3*t*t*(dx-p2.x),vy=3*u*u*p1.y+6*u*t*(p2.y-p1.y)+3*t*t*(dy-p2.y);
      const angle=Math.atan2(vy,vx)*180/Math.PI,size=scale*(1-.82*t*t);
      return {offset:t,transform:`translate(${x}px,${y}px) scale(${size}) rotate(${angle}deg)`,opacity:t<.92?1:(1-t)/.08};
    });
    const flight=plane.animate(frames,{duration:1850,easing:'cubic-bezier(.3,0,.25,1)',fill:'forwards'});
    await flight.finished.catch(()=>{});if(welcome!==dialog)return;
    await closeLetter(true);startTour();
    if(!tour){for(const [node,name]of exposed)node.classList.remove(name);exposed=[];}
  }
  async function closeLetter(immediate=false) {
    const dialog=welcome;if(!dialog)return;
    dialog.classList.add('is-closing');if(!immediate)await delay(650);
    dialog.close();dialog.remove();if(welcome===dialog)welcome=null;
    if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});schedule();
  }
  function exposeTargets() {
    document.body.classList.remove('global-chrome-idle','fullscreen-idle');
    // Reveal the existing hover controls without changing preferences or their resting layout.
    for(const selector of ['body>header','.peek-return']) { const el=$q(selector);if(el&&!el.classList.contains(selector.includes('header')?'cords-expanded':'revealed')){const name=selector.includes('header')?'cords-expanded':'revealed';el.classList.add(name);exposed.push([el,name]);} }
  }
  function cleanTour() {
    if(document.body.classList.contains('sy-tour-pet'))window.ShiyuDesktopPet?.guide(false);tour?.remove();tour=null;signature='';tourStepIds=null;
    for(const [el,value] of inertNodes)if(el.isConnected)el.inert=value;inertNodes=[];
    for(const [el,name] of exposed)el.classList.remove(name);exposed=[];
    document.body.classList.remove('sy-tour-active','sy-tour-pet');
    if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
  }
  function startTour() {
    if(tour||welcome||!ready()||blocking()||state.status!=='active')return;
    const name=area();if(!name||!moduleAllowed(name)||state[name]?.status==='done'||pausedArea===name)return;
    exposeTargets();const list=steps(name);
    if(!list.length){for(const [el,cls]of exposed)el.classList.remove(cls);exposed=[];busy=true;void action('complete',{module:name}).then(ok=>{if(ok)toast('当前没有需要介绍的入口，可以自由探索。');busy=false;schedule();});return;}
    tourStepIds=new Set(list.map(step=>step.id));previousFocus=document.activeElement;stepId=list.some(s=>s.id===state[name]?.step)?state[name].step:list[0].id;
    tour=document.createElement('div');tour.className='sy-tour';tour.dataset.area=name;tour.setAttribute('popover','manual');tour.setAttribute('role','dialog');tour.setAttribute('aria-modal','true');tour.setAttribute('aria-labelledby','sy-tour-title');
    tour.innerHTML='<div class="sy-tour-ring"></div><section class="sy-tour-panel"></section>';document.body.append(tour);tour.showPopover();applyColor(tour);
    inertNodes=[...document.body.children].filter(el=>el!==tour&&!['SCRIPT','STYLE','LINK'].includes(el.tagName)).map(el=>[el,el.inert]);inertNodes.forEach(([el])=>el.inert=true);
    document.body.classList.add('sy-tour-active');renderStep();
  }
  function renderStep() {
    if(!tour)return;const name=tour.dataset.area,list=steps(name);
    if(!list.length){cleanTour();busy=true;void action('complete',{module:name}).finally(()=>{busy=false;schedule();});return;}
    let index=list.findIndex(step=>step.id===stepId);
    if(index<0){const all=name==='home'?homeSteps:spaceSteps,old=all.findIndex(s=>s.id===stepId);index=list.findIndex(s=>all.indexOf(s)>old);if(index<0)index=list.length-1;stepId=list[index].id;}
    const step=list[index],nextSignature=name+':'+list.map(s=>s.id).join(',')+':'+stepId;
    if(signature!==nextSignature){
      signature=nextSignature;const last=index===list.length-1;
      if(step.id==='pet'||document.body.classList.contains('sy-tour-pet'))window.ShiyuDesktopPet?.guide(step.id==='pet');
      document.body.classList.toggle('sy-tour-pet',step.id==='pet');
      const panel=tour.querySelector('.sy-tour-panel');panel.innerHTML='<div class="sy-tour-progress"><span>'+(name==='home'?'首页':'空间')+' · '+(index+1)+' / '+list.length+'</span><button data-tour-skip>跳过引导</button></div><h2 id="sy-tour-title">'+step.title+'</h2><p>'+step.body+'</p><div class="sy-tour-actions"><button data-tour-prev '+(index===0?'disabled':'')+'>上一步</button>'+'<button class="sy-guide-primary" data-tour-next>'+(last?(name==='home'?'开始体验':'完成引导'):'下一步')+'</button></div>';
      panel.querySelector('[data-tour-skip]').onclick=async()=>{if(busy)return;busy=true;if(await action('skip')){cleanTour();releaseGift();}busy=false;};
      panel.querySelector('[data-tour-prev]').onclick=()=>move(-1);
      panel.querySelector('[data-tour-next]').onclick=()=>last?complete():move(1);
      panel.querySelector('[data-tour-next]').focus({preventScroll:true});
    }
    position(step);
    if(step.id==='pet')setTimeout(()=>{if(tour&&stepId==='pet')position(step);},400);
  }
  async function move(delta) { if(busy||!tour)return;const name=tour.dataset.area,list=steps(name),index=list.findIndex(s=>s.id===stepId),next=list[index+delta];if(!next)return;busy=true;if(await action('progress',{module:name,step:next.id})){stepId=next.id;renderStep();}busy=false; }
  function releaseGift() { if(!identity())return;prefs.workspaceGuideDoneV1=true;persist();window.dispatchEvent(new Event('shiyu-workspace-guide-complete')); }
  async function complete() {
    if(busy||!tour)return;busy=true;const name=tour.dataset.area;
    if(await action('complete',{module:name})){cleanTour();if(name==='space')releaseGift();schedule();}busy=false;
  }
  function position(step) {
    if(!tour)return;const el=target(step);if(!el)return;
    const nodes=step.combine?step.targets.map(selector=>$q(selector)).filter(visible):[el];
    if(step.id==='scenes'){nodes.length=0;nodes.push(...document.querySelectorAll('.sidebar .scene-scroll .scene-button'));}
    if(step.id==='pet')nodes.push(...document.querySelectorAll('#desktop-pet .pet-menu button'));
    const boxes=nodes.filter(visible).map(node=>node.getBoundingClientRect());
    const r={left:Math.min(...boxes.map(b=>b.left)),top:Math.min(...boxes.map(b=>b.top)),right:Math.max(...boxes.map(b=>b.right)),bottom:Math.max(...boxes.map(b=>b.bottom))},w=document.documentElement.clientWidth,h=visualViewport?.height||innerHeight;
    const left=Math.max(5,r.left-7),top=Math.max(5,r.top-7),right=Math.min(w-5,r.right+7),bottom=Math.min(h-5,r.bottom+7);
    const ring=tour.querySelector('.sy-tour-ring');Object.assign(ring.style,{left:left+'px',top:top+'px',width:Math.max(1,right-left)+'px',height:Math.max(1,bottom-top)+'px'});
    const panel=tour.querySelector('.sy-tour-panel'),box=panel.getBoundingClientRect(),pad=16,gap=18;
    let x=(left+right-box.width)/2,y=bottom+gap;
    if(y+box.height>h-pad)y=top-box.height-gap;
    if(y<pad){y=Math.max(pad,(h-box.height)/2);x=right+gap+box.width<w-pad?right+gap:left-box.width-gap;}
    Object.assign(panel.style,{left:Math.max(pad,Math.min(x,w-box.width-pad))+'px',top:Math.max(pad,Math.min(y,h-box.height-pad))+'px'});
  }
  function tick() {
    scheduled=0;syncMenu();const id=identity(),currentArea=area();
    if(owner&&owner!==id){stateEpoch++;owner='';state=null;cleanTour();void closeLetter(true);pausedArea='';}
    if(currentArea!==lastArea){pausedArea='';lastArea=currentArea;clearTimeout(startTimer);startTimer=0;}
    if(!ready()||blocking()||!currentArea){clearTimeout(startTimer);startTimer=0;if(tour)cleanTour();if(welcome&&(!id||currentArea!=='home'||blocking()||!enabled()))void closeLetter(true);return;}
    if(tour){if(tour.dataset.area!==currentArea||state.status!=='active'||!moduleAllowed(currentArea))cleanTour();else renderStep();return;}
    if(welcome||busy||pausedArea===currentArea)return;
    const shouldWelcome=currentArea==='home'&&config().welcome!==false&&state.welcome==='pending';
    const shouldGuide=state.status==='active'&&moduleAllowed(currentArea)&&state[currentArea].status!=='done';
    if(!shouldWelcome&&!shouldGuide){clearTimeout(startTimer);startTimer=0;return;}
    if(!startTimer)startTimer=setTimeout(()=>{startTimer=0;if(!ready()||blocking()||area()!==currentArea||pausedArea===currentArea)return;if(shouldWelcome&&state.welcome==='pending')openLetter();else startTour();},1100);
  }
  function schedule() { if(!scheduled)scheduled=requestAnimationFrame(tick); }
  window.ShiyuOnboarding={ownsWorkspace:()=>true,giftMayShow:()=>!enabled()||!!state&&(state.welcome!=='pending'||config()?.welcome===false)&&!welcome&&!tour&&(state.status!=='active'||state.space.status==='done'||!moduleAllowed('space')),refresh:loadState};
  // Observe only application surfaces; animation changes inside the guide must not restart its timers.
  new MutationObserver(schedule).observe($q('#main'),{childList:true,subtree:true});
  new MutationObserver(schedule).observe(document.body,{childList:true,attributes:true,attributeFilter:['class','data-view']});
  new MutationObserver(schedule).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  for(const event of ['resize','scroll','shiyu-feature-config','shiyu-operations-config','shiyu-pet-context','popstate'])window.addEventListener(event,schedule);
  visualViewport?.addEventListener('resize',schedule);
  document.addEventListener('visibilitychange',()=>{schedule();if(!document.hidden)void loadState();});
  document.addEventListener('close',schedule,true);
  window.addEventListener('shiyu-session-ready',()=>{void loadState();schedule();});
  window.addEventListener('shiyu-account-state',()=>{stateEpoch++;owner='';state=null;cleanTour();void closeLetter(true);schedule();});
  window.addEventListener('focus',()=>{if(!tour&&!welcome)void loadState();});
  window.addEventListener('keydown',event=>{
    if(!tour)return;
    if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();pausedArea=area();cleanTour();}
    else if(event.key==='Tab'){const buttons=[...tour.querySelectorAll('button:not(:disabled)')],first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
  },true);
  window.addEventListener('wheel',event=>{if(tour){event.stopImmediatePropagation();if(!event.target.closest('.sy-tour-panel'))event.preventDefault();}},{capture:true,passive:false});
  const oldHeader=updateHeader;updateHeader=function(...args){const result=oldHeader(...args);syncMenu();return result;};
  const oldRender=render;render=function(...args){const result=oldRender(...args);schedule();return result;};
  void loadState();schedule();
})();
