/* Shared, dependency-free desktop companion. Hosts supply navigation and authorization. */
(() => {
  'use strict';
  if (window.ShiyuDesktopPet) return;
  const KEY = 'shiyu-desktop-pet-v1', COOKIE = 'shiyu_pet_v1';
  const defaults = { enabled: true, skin: 'cat', size: 'normal', motion: 'normal', position: null, home: '', updated: 0 };
  const skins = { cat: ['隅猫', '眨眨眼，陪你安放日常'], bird: ['纸雀', '轻轻展翅，把灵感带来'], sprout: ['芽芽', '慢慢生长，陪你发现新意'], line: ['线条人物', '轻轻晃一晃，向你挥挥手'], paper: ['纸片人物', '草帽轻轻晃，陪你慢慢来'] };
  const paperAsset = new URL('assets/desktop-pet/paper-person.webp', document.currentScript?.src || location.href).href;
  let artId = 0;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const svg = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const icons = {
    home: svg('<path d="m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10"/>'),
    space: svg('<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>'),
    world: svg('<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/>'),
    more: svg('<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'),
    settings: svg('<path d="M4 7h9m6 0h1M4 17h1m6 0h9"/><circle cx="16" cy="7" r="3"/><circle cx="8" cy="17" r="3"/>'),
    down: svg('<path d="m6 9 6 6 6-6"/>')
  };
  function art(skin) {
    if (skin === 'line' || skin === 'paper') return humanArt(skin);
    const common = '<ellipse class="pet-ground" cx="48" cy="94" rx="26" ry="3"/>';
    const eyes = '<g class="pet-eyes"><path d="M35 44v3m24-3v3"/></g><path d="m45 51 3 2 3-2M48 53v3m-4 0q4 4 8 0"/>';
    const shapes = {
      cat: `<path class="pet-tail" d="M65 81c25 5 26-16 20-23"/><g class="pet-body"><path class="pet-fur" d="M29 57c-8 8-8 25-4 31 3 6 12 4 15 0 5 5 12 5 17 0 5 5 15 4 15-3 0-14-5-25-14-28Z"/><path class="pet-belly" d="M40 67c-6 6-7 16-3 20h20c4-7 1-15-4-20Z"/><path class="pet-feet" d="M29 83v7m34-7v7"/><g class="pet-head"><path class="pet-fur" d="M22 35 23 12q1-4 5 0l14 13q6-2 13 0l14-14q4-3 5 2l1 23c8 25-10 32-27 32S12 58 22 35Z"/><path class="pet-ear" d="m27 20 1 15 10-7Zm42 0-1 15-10-7Z"/><path class="pet-mark" d="m44 29 1 7m7-7-1 7"/>${eyes}<g class="pet-cheeks"><path d="M25 51h5m36 0h5"/></g></g><path class="pet-accent" d="M29 61q19 10 38 0l-1 9q-19 6-36-1Z"/><path class="pet-accent" d="m58 69 7 0-1 13-9-3Z"/><path class="pet-paw pet-fur" d="M30 72q-7-3-9 4t10 5"/></g>`,
      bird: `<g class="pet-body"><path class="pet-feet" d="m38 82-2 10m-6 0h12m16-10 2 10m-5 0h12"/><path class="pet-paper-back" d="m24 62-14 10 19 9Z"/><path class="pet-paper" d="M21 58 34 21 62 17 78 44 65 79 39 85Z"/><path class="pet-paper-fold" d="m34 21 5 64 26-6 13-35-31 10Z"/><path class="pet-wing" d="m26 53 33 8-20 24Z"/><path class="pet-beak" d="m72 40 17 7-15 7Z"/><g class="pet-eyes"><path d="M56 35v4"/></g><path class="pet-cheeks" d="M57 45h6"/><path class="pet-accent" d="m31 72 8 13 26-6-8-5-18 5Z"/></g>`,
      sprout: `<g class="pet-body"><path class="pet-feet" d="M33 82v9h-7m35-9v9h7"/><path class="pet-sprout-body" d="M23 55c0-18 8-27 25-27s25 9 25 27c0 20-9 30-25 30S23 75 23 55Z"/><g class="pet-leaves"><path class="pet-stem" d="M48 31V17"/><path class="pet-leaf" d="M48 24C27 25 24 11 26 6c14-1 24 4 22 18Z"/><path class="pet-leaf pet-leaf-light" d="M48 21C49 6 61 3 73 7c-3 14-11 19-25 14Z"/></g><g class="pet-eyes"><path d="M36 49v3m24-3v3"/></g><path d="M41 61q7 7 14 0"/><path class="pet-cheeks" d="M27 59h5m33 0h5"/><path class="pet-paw pet-stem" d="M24 62q-10 2-12-6"/><path class="pet-stem" d="M73 62q8 1 10-4"/></g>`
    };
    return `<svg class="pet-art" viewBox="0 0 96 104" fill="none" stroke="var(--pet-outline)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${common}${shapes[skin] || shapes.cat}</svg>`;
  }
  function humanArt(skin) {
    if (skin === 'line') return `<svg class="pet-art pet-human pet-human-line" viewBox="0 0 96 104" fill="none" stroke="var(--pet-line-ink)" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <g class="pet-human-balance">
        <path d="m36 63-2 26 9 1 5-20 5 20 9-1-2-27M35 84l9 1m8 0 10-1"/>
        <g class="pet-human-arm-rest"><path d="M35 44c-7 1-9 8-11 17l7 3 7-15M24 62l-1 5q0 5 4 5l4-7m-7 1 4 1"/></g>
        <path d="m41 39-7 5 3 13-2 7q13 4 26-1l-2-11 3-8-8-5M42 38v4l6 5 6-5v-5M39 43l4 8 5-4 5 4 5-8M48 48v14M52 54h5M41 58l-1 4"/>
        <g class="pet-human-arm-wave"><path d="M61 44c7 2 9 10 10 17l-7 3-5-13M64 64l1 5q2 5 5 3l2-3-1-7m-6 5 5-2"/></g>
        <g class="pet-human-head-look"><g class="pet-human-head-nod">
          <path d="M36 22q-4-2-4 3t4 5m25-8q4-2 4 3t-4 5M36 21c-1 11 3 18 12 18s14-7 13-18M36 24l1-7q5 3 9-2 5 5 12 1l3 9"/>
          <path d="M34 22c-5-4-3-9 1-10-2-5 4-8 8-5 1-5 8-5 10-1 5-4 10 0 9 5 5 1 6 7 1 11M36 11q3 3 6-1m9 1q4 3 7-1"/>
          <g class="pet-human-eyes"><path d="M42 25v1.5m13-1.5v1.5"/></g>
          <path d="m48 27-1 3h2m-6 3q5 3 10-1" stroke-width="1.35"/>
        </g></g>
      </g>
      <path class="pet-human-feet" d="m34 89-3 4q-1 3 3 3h10l-1-6m10 0-1 6h12q3-1 0-4l-2-3M32 94h11m10 0h11M36 92h3m17 0h3"/>
    </svg>`;
    // Reuse one transparent illustration as articulated layers. Unique mask IDs allow
    // the floating pet and its settings preview to coexist without SVG collisions.
    const id = `pet-paper-${++artId}`;
    const head = 'M0 0H1024V438H0Z';
    const left = 'M411 451L445 461L438 590L423 651L396 728L368 760L346 772L338 810L296 871L229 897H0V451Z';
    const right = 'M605 449H1024V920H743L690 831L673 784L640 773L616 746L594 650L591 619L602 554Z';
    const picture = `<image href="${escape(paperAsset)}" width="1024" height="1536"/>`;
    return `<svg class="pet-art pet-human pet-human-paper" viewBox="0 0 96 104" aria-hidden="true">
      <svg x="12.4" y="-3.2" width="71.2" height="106.8" viewBox="0 0 1024 1536" overflow="visible">
        <defs>
          <clipPath id="${id}-head"><path d="${head}"/></clipPath>
          <clipPath id="${id}-left"><path d="${left}"/></clipPath>
          <clipPath id="${id}-right"><path d="${right}"/></clipPath>
          <clipPath id="${id}-feet"><path d="M0 1330H1024V1536H0Z"/></clipPath>
          <mask id="${id}-body" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536" style="mask-type:luminance"><path fill="white" d="M0 0H1024V1338H0Z"/><path fill="black" d="${head}"/><path fill="black" d="${left}"/><path fill="black" d="${right}"/></mask>
          <mask id="${id}-below-head" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536" style="mask-type:luminance"><path fill="white" d="M0 0H1024V1536H0Z"/><path fill="black" d="${head}"/></mask>
        </defs>
        <g class="pet-human-balance">
          <g mask="url(#${id}-body)">${picture}</g>
          <g class="pet-human-arm-rest"><g mask="url(#${id}-below-head)" clip-path="url(#${id}-left)">${picture}</g></g>
          <g class="pet-human-arm-wave"><g mask="url(#${id}-below-head)" clip-path="url(#${id}-right)">${picture}</g></g>
          <g class="pet-human-head-look"><g class="pet-human-head-nod"><g clip-path="url(#${id}-head)">${picture}</g><g class="pet-paper-blink" fill="#f5d5b6"><ellipse cx="459" cy="328" rx="13" ry="19"/><ellipse cx="550" cy="318" rx="13" ry="19"/><path d="M450 331q9 5 18-1m73-9q9 5 18-1" fill="none" stroke="#705440" stroke-width="4" stroke-linecap="round"/></g></g></g>
        </g>
        <g class="pet-human-feet" clip-path="url(#${id}-feet)">${picture}</g>
      </svg>
    </svg>`;
  }
  function normalize(value) {
    const v = value && typeof value === 'object' ? value : {};
    const p = v.position;
    let home='';try{const u=new URL(v.home);if(['http:','https:'].includes(u.protocol)&&['127.0.0.1','localhost','shiyubox.com'].includes(u.hostname)&&!u.username&&!u.password)home=u.origin+'/';}catch{}
    return { enabled: v.enabled !== false, skin: skins[v.skin] ? v.skin : 'cat', size: ['small','normal','large'].includes(v.size) ? v.size : 'normal', motion: ['normal','gentle','off'].includes(v.motion) ? v.motion : 'normal',home,
      position: p && ['x','y','width','height'].every(k => Number.isFinite(p[k])) && p.width > 0 && p.height > 0 ? {x: clamp(p.x,0,p.width),y:clamp(p.y,0,p.height),width:p.width,height:p.height} : null,
      updated: Number.isFinite(v.updated) ? v.updated : 0 };
  }
  function read() {
    let local, shared;
    try { local = normalize(JSON.parse(localStorage.getItem(KEY))); } catch {}
    try { const cookie = document.cookie.split('; ').find(c => c.startsWith(COOKIE+'=')); if(cookie)shared=normalize(JSON.parse(decodeURIComponent(cookie.slice(COOKIE.length+1)))); } catch {}
    return shared && (!local || shared.updated >= local.updated) ? shared : local || {...defaults};
  }
  let config = read(), instance;
  function save(patch) {
    config = normalize({...config,...patch,updated:Date.now()});
    try { localStorage.setItem(KEY,JSON.stringify(config)); } catch { instance?.notify('本机存储不可用，位置会在本次使用中保留。'); }
    // Only non-sensitive companion preferences cross first-party subdomains (and local preview ports).
    const firstParty = /(^|\.)shiyubox\.com$/.test(location.hostname);
    try { document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(config))}; Path=/; Max-Age=31536000; SameSite=Lax${firstParty?'; Domain=shiyubox.com':''}${location.protocol==='https:'?'; Secure':''}`; } catch {}
    instance?.refresh();
  }
  function mount(adapter) {
    if(instance)return instance;
    if(adapter.homeURL&&config.home!==adapter.homeURL)save({home:adapter.homeURL});
    const root=document.createElement('aside');root.id='desktop-pet';root.className='desktop-pet';root.setAttribute('aria-label','桌面宠物');
    root.innerHTML='<div class="pet-menu" id="desktop-pet-menu" role="group" aria-label="快捷入口" hidden></div><button type="button" class="pet-character" aria-controls="desktop-pet-menu" aria-expanded="false"></button><div class="pet-panel" hidden></div><div class="pet-notice" role="status" hidden></div>';
    const core=root.querySelector('.pet-character'),menu=root.querySelector('.pet-menu'),panel=root.querySelector('.pet-panel');
    let opened=false,pinned=false,drag=null,point={x:0,y:0},size=76,leaveTimer,enterTimer,noticeTimer,suppressUntil=0,raf=0,busy=false,signature='',skin='',contextKey='',direction=null,panelKind='',inCorridor=false,corridor=[];
    const reduced=()=>config.motion!=='normal'||matchMedia('(prefers-reduced-motion: reduce)').matches;
    function notify(message){const el=root.querySelector('.pet-notice');el.textContent=message;el.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.hidden=true,3200);}
    const context=()=>adapter.context?.()||{};
    const compactHome=()=>context().area==='home'&&!context().app&&innerWidth<=1100;
    function viewportBounds(){
      if(!compactHome())return {left:0,top:0,right:innerWidth,bottom:innerHeight,width:innerWidth,height:innerHeight};
      const v=window.visualViewport,s=getComputedStyle(root),inset=name=>parseFloat(s.getPropertyValue('--home-safe-'+name))||0;
      const zoomed=v&&Math.abs(v.scale-1)>.05,left=(zoomed?0:v?.offsetLeft||0)+inset('left'),top=(zoomed?0:v?.offsetTop||0)+inset('top');
      const right=(zoomed?innerWidth:(v?.offsetLeft||0)+(v?.width||innerWidth))-inset('right'),bottom=(zoomed?innerHeight:(v?.offsetTop||0)+(v?.height||innerHeight))-inset('bottom');
      return {left,top,right,bottom,width:right-left,height:bottom-top};
    }
    function place(){
      size={small:60,normal:76,large:92}[config.size];root.style.setProperty('--pet-size',size+'px');
      if(compactHome()&&innerWidth<=600){size={small:52,normal:60,large:76}[config.size];root.style.setProperty('--pet-size',size+'px');}
      if(!drag?.active){const p=config.position;point=p?{x:p.x*innerWidth/p.width,y:p.y*innerHeight/p.height}:{x:innerWidth-76,y:innerHeight-142};}
      const b=viewportBounds();point.x=clamp(point.x,b.left+size/2+10,Math.max(b.left+size/2+10,b.right-size/2-10));point.y=clamp(point.y,b.top+size/2+10,Math.max(b.top+size/2+10,b.bottom-size/2-10));
      root.style.left=(point.x-size/2)+'px';root.style.top=(point.y-size/2)+'px';
    }
    function refresh(){
      const ctx=context(),host=adapter.host?.()||document.fullscreenElement||document.body;
      if(root.parentNode!==host)host.append(root);
      const blocked=adapter.blocked?.()??Boolean(document.querySelector('dialog[open]'));
      const available=adapter.available?.()!==false;
      root.hidden=!config.enabled||blocked||!available;root.inert=blocked||!available;
      root.dataset.motion=matchMedia('(prefers-reduced-motion: reduce)').matches?'off':config.motion;
      root.dataset.dark=String(ctx.dark??(document.body.dataset.dark==='true'||document.body.classList.contains('dark')));
      if(ctx.accent)root.style.setProperty('--pet-accent',ctx.accent);
      const visibleSkin=adapter.skinAllowed?.(config.skin)===false?[...new Set([...(adapter.skinOrder?.()||[]),...Object.keys(skins)])].find(id=>skins[id]&&adapter.skinAllowed?.(id)!==false)||'cat':config.skin;
      if(skin!==visibleSkin){skin=visibleSkin;core.innerHTML=art(skin);core.setAttribute('aria-label',`${adapter.skinName?.(skin)||skins[skin][0]}，点击展开快捷入口，长按拖动`);}
      place();
      const next=JSON.stringify([ctx.area,ctx.app,ctx.worldEnabled]);
      if(next!==contextKey){contextKey=next;signature='';if(opened)buildMenu();}
      if(blocked||!config.enabled||!available)close();
    }
    function button(action,id,label,icon,nav=false,current=false){return `<button type="button" class="pet-shortcut${nav?' pet-nav':''}" data-pet-action="${action}" data-pet-id="${escape(id)}" aria-label="${escape(label)}"${current?' aria-current="page"':''}><span class="pet-shortcut-icon">${icon||icons.space}</span><span class="pet-shortcut-label">${escape(label)}</span></button>`;}
    function buildMenu(){
      const apps=adapter.apps?.()||[],ctx=context();
      const visible=apps.length>5?[...apps.slice(0,4),{id:'__more',label:'更多应用',icon:icons.more}]:apps;
      const nav=[...(ctx.worldEnabled===false?[]:[['world',adapter.navigationName?.('world')||'世界',icons.world]]),['home',ctx.area==='home'&&!ctx.app?'首页':'回首页',icons.home],['space',adapter.navigationName?.('spaceViews')||'空间',icons.space]];
      const html=visible.map(app=>button(app.id==='__more'?'more':'app',app.id,app.label,app.icon,false,ctx.app===app.id)).join('')+nav.map(([id,label,icon])=>button('navigate',id,label,icon,true,ctx.area===id&&!ctx.app)).join('')+'<button type="button" class="pet-settings-entry" data-pet-action="settings" aria-label="桌面宠物设置" title="桌面宠物设置">'+icons.settings+'</button>';
      if(signature!==html){menu.innerHTML=html;signature=html;}
      layout();
    }
    function layout(){
      const boundsView=viewportBounds(),useCompact=compactHome()&&(innerWidth<=600||boundsView.height<460);
      const items=[...menu.querySelectorAll('.pet-shortcut')],apps=items.filter(b=>!b.classList.contains('pet-nav')),nav=items.filter(b=>b.classList.contains('pet-nav'));
      const candidates=[[-Math.PI/2,'up'],[Math.PI/2,'down'],[Math.PI,'left'],[0,'right'],[-3*Math.PI/4,'upper-left'],[-Math.PI/4,'upper-right'],[3*Math.PI/4,'lower-left'],[Math.PI/4,'lower-right']];
      const edge=205;let preferred='up';
      if(point.x>innerWidth-edge)preferred='left';else if(point.x<edge)preferred='right';
      if(point.y<edge)preferred=preferred==='left'?'lower-left':preferred==='right'?'lower-right':'down';
      else if(point.y>innerHeight-edge)preferred=preferred==='left'?'upper-left':preferred==='right'?'upper-right':'up';
      // Measure radial buttons, even when the preceding layout used the narrow-screen fallback.
      root.dataset.compact='false';corridor=[];
      const bounds=new Map(items.map(el=>[el,{width:el.offsetWidth,height:el.offsetHeight}]));
      const settings=menu.querySelector('.pet-settings-entry');
      const obstacles=[{x:0,y:0,width:size,height:size},{x:settings.offsetLeft+settings.offsetWidth/2-size/2,y:settings.offsetTop+settings.offsetHeight/2-size/2,width:settings.offsetWidth,height:settings.offsetHeight}];
      const positions=(group,angle,spread,r)=>group.map((el,i)=>{
        const a=angle+(i-(group.length-1)/2)*spread/Math.max(1,group.length-1);
        return {el,r,x:Math.cos(a)*r,y:Math.sin(a)*r,...bounds.get(el)};
      });
      const fits=points=>points.every(p=>point.x+p.x-p.width/2>=boundsView.left+8&&point.x+p.x+p.width/2<=boundsView.right-8&&point.y+p.y-p.height/2>=boundsView.top+8&&point.y+p.y+p.height/2<=boundsView.bottom-8);
      const separated=points=>points.every((a,i)=>[...points.slice(i+1),...obstacles].every(b=>Math.abs(a.x-b.x)>=(a.width+b.width)/2+4||Math.abs(a.y-b.y)>=(a.height+b.height)/2+4));
      const ordered=[...candidates].sort((a,b)=>Number(b[1]===preferred)-Number(a[1]===preferred));
      if(direction)ordered.sort((a,b)=>Number(b[1]===direction)-Number(a[1]===direction));
      let chosen;
      search:for(const [angle,name] of (useCompact?[]:ordered)){
        // Corners open inward over a quarter circle. Slightly inset its ends at the drag limit.
        const spreads=[...(name.includes('-')?[]:[Math.PI*.84,Math.PI*.65]),Math.PI/2,Math.PI/2-.07,Math.PI/2-.14,Math.PI/2-.21];
        // Mirror the arc slots on the left so world / home / space still run from top to bottom.
        const navigation=Math.cos(angle)<-.001?[...nav].reverse():nav;
        for(const spread of spreads){
          for(const navRadius of [104,112,120,128]){
            const inner=positions(navigation,angle,Math.min(1.58,spread),navRadius);
            if(!fits(inner)||!separated(inner))continue;
            for(let radius=180;radius<=308;radius+=16){
              const points=[...positions(apps,angle,spread,radius),...inner];
              if(fits(points)&&separated(points)){chosen={points,name,angle,spread};break search;}
            }
          }
        }
      }
      root.dataset.compact=String(!chosen);root.dataset.direction=chosen?.name||preferred;
      if(chosen){direction=chosen.name;chosen.points.forEach((p,i)=>{p.el.style.setProperty('--item-x',p.x+'px');p.el.style.setProperty('--item-y',p.y+'px');p.el.style.setProperty('--item-order',i);});
        const radius=Math.max(180,...chosen.points.map(p=>p.r))+40;
        corridor=[{x:0,y:0},...Array.from({length:12},(_,i)=>{const angle=chosen.angle-chosen.spread/2+i*chosen.spread/11;return {x:Math.cos(angle)*radius,y:Math.sin(angle)*radius};})];
      }else{
        const rows=Math.ceil(items.length/3),width=Math.min(284,boundsView.width-20),height=Math.min(boundsView.height-24,rows*64+Math.max(0,rows-1)*6+(useCompact?62:44));
        menu.style.setProperty('--compact-x',(clamp(point.x-width/2,boundsView.left+10,boundsView.right-width-10)-point.x+size/2)+'px');
        menu.style.setProperty('--compact-y',(clamp(point.y>(boundsView.top+boundsView.bottom)/2?point.y-size/2-height-12:point.y+size/2+12,boundsView.top+10,boundsView.bottom-height-10)-point.y+size/2)+'px');
        menu.style.setProperty('--compact-width',width+'px');
      }
      if(panelKind)positionPanel();
    }
    function open(){if(root.hidden||root.inert||drag?.active||Date.now()<suppressUntil)return;clearTimeout(leaveTimer);if(!opened){direction=null;opened=true;root.dataset.open='true';menu.hidden=false;core.setAttribute('aria-expanded','true');buildMenu();}}
    function close(){clearTimeout(enterTimer);clearTimeout(leaveTimer);opened=false;pinned=false;inCorridor=false;root.dataset.open='false';menu.hidden=true;panel.hidden=true;panelKind='';core.setAttribute('aria-expanded','false');direction=null;}
    function positionPanel(){const b=viewportBounds(),width=Math.min(260,b.width-20),height=Math.min(340,b.height-24);panel.style.width=width+'px';panel.style.maxHeight=height+'px';panel.style.left=(clamp(point.x-width/2,b.left+10,b.right-width-10)-point.x+size/2)+'px';panel.style.top=(clamp(point.y>(b.top+b.bottom)/2?point.y-size/2-height-12:point.y+size/2+12,b.top+12,b.bottom-height-12)-point.y+size/2)+'px';}
    async function showPanel(kind){
      if(kind==='spaces'&&!await adapter.authorize?.('space'))return;
      panelKind=kind;pinned=true;panel.hidden=false;
      const items=kind==='spaces'?(adapter.spaces?.()||[]).map(s=>({id:s.id,label:s.label,icon:icons.space})):(adapter.apps?.()||[]);
      panel.innerHTML='<div class="pet-panel-heading"><b>'+ (kind==='spaces'?'切换空间':'全部应用')+'</b><button type="button" data-pet-action="close-panel" aria-label="关闭列表">×</button></div>'+items.map(app=>button(kind==='spaces'?'space':'app',app.id,app.label,app.icon)).join('');positionPanel();panel.querySelector('.pet-shortcut')?.focus({preventScroll:true});
    }
    async function activate(action,id){
      if(busy)return;
      if(action==='more'){void showPanel('apps');return;}
      if(action==='close-panel'){panel.hidden=true;panelKind='';core.focus({preventScroll:true});return;}
      if(action==='navigate'&&id==='space'&&context().area==='space'&&!context().app){void showPanel('spaces');return;}
      busy=true;root.setAttribute('aria-busy','true');
      try{
        if(!(action==='navigate'&&id==='home')&&!await adapter.authorize?.(action==='navigate'?id:action))return;
        close();
        if(action==='settings')await adapter.openSettings?.();
        else await adapter.navigate?.(action,id,core);
      }catch{notify('暂时无法打开，请稍后重试。');}
      finally{busy=false;root.removeAttribute('aria-busy');refresh();}
    }
    root.addEventListener('pointerenter',e=>{clearTimeout(leaveTimer);if(e.pointerType==='mouse')enterTimer=setTimeout(open,100);});
    function deferClose(){clearTimeout(leaveTimer);leaveTimer=setTimeout(()=>{if(!pinned&&!drag?.active&&!inCorridor&&!root.matches(':hover'))close();},280);}
    function insideCorridor(x,y){
      let inside=false;
      for(let i=0,j=corridor.length-1;i<corridor.length;j=i++){
        const a=corridor[i],b=corridor[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;
      }
      return inside;
    }
    // Observe the hover corridor without placing a click-catching overlay over the page.
    document.addEventListener('pointermove',event=>{
      if(!opened||pinned||drag?.active)return;
      inCorridor=root.dataset.compact!=='true'&&insideCorridor(event.clientX-point.x,event.clientY-point.y);
      if(inCorridor||root.contains(event.target))clearTimeout(leaveTimer);else deferClose();
    },{passive:true});
    root.addEventListener('pointerleave',()=>{clearTimeout(enterTimer);if(!pinned&&!drag?.active)deferClose();});
    root.addEventListener('focusin',()=>{clearTimeout(leaveTimer);});
    root.addEventListener('focusout',e=>{if(!root.contains(e.relatedTarget)&&!pinned)deferClose();});
    root.addEventListener('click',e=>{e.stopPropagation();if(Date.now()<suppressUntil){e.preventDefault();return;}const b=e.target.closest('[data-pet-action]');if(b)void activate(b.dataset.petAction,b.dataset.petId);else if(e.target.closest('.pet-character')){if(pinned)close();else{open();pinned=true;}}});
    core.addEventListener('contextmenu',e=>e.preventDefault());
    core.addEventListener('pointerdown',e=>{
      if(e.button!==0||busy)return;e.stopPropagation();
      drag={pid:e.pointerId,x:e.clientX,y:e.clientY,point:{...point},active:false};const current=drag;
      drag.timer=setTimeout(()=>{if(drag!==current)return;drag.active=true;close();core.setPointerCapture(e.pointerId);root.dataset.dragging='true';core.setAttribute('aria-label','拖动宠物，松开保存位置');},260);
    });
    function finish(commit){if(!drag)return;const d=drag;drag=null;clearTimeout(d.timer);if(core.hasPointerCapture(d.pid))core.releasePointerCapture(d.pid);root.dataset.dragging='false';core.setAttribute('aria-label',`${skins[skin][0]}，点击展开快捷入口，长按拖动`);
      if(d.active){suppressUntil=Date.now()+400;if(commit)save({position:{...point,width:innerWidth,height:innerHeight}});else place();if(!reduced()){root.dataset.landing='true';setTimeout(()=>delete root.dataset.landing,360);}}}
    window.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pid)return;if(!drag.active){if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>9)finish(false);return;}e.preventDefault();e.stopPropagation();point={x:drag.point.x+e.clientX-drag.x,y:drag.point.y+e.clientY-drag.y};place();},{capture:true,passive:false});
    window.addEventListener('pointerup',e=>{if(drag?.pid===e.pointerId)finish(true);},true);
    window.addEventListener('pointercancel',e=>{if(drag?.pid===e.pointerId)finish(false);},true);
    core.addEventListener('lostpointercapture',()=>{if(drag)finish(false);});
    window.addEventListener('blur',()=>{finish(false);close();});
    document.addEventListener('pointerdown',e=>{if(!root.contains(e.target))close();},true);
    root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(false);close();core.focus({preventScroll:true});}else if(e.key==='ArrowDown'&&e.target===core){e.preventDefault();open();pinned=true;menu.querySelector('button')?.focus({preventScroll:true});}});
    for(const name of ['pointerdown','pointermove','pointerup','touchstart','touchend','wheel'])root.addEventListener(name,e=>e.stopPropagation(),{passive:true});
    const schedule=()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;refresh();});};
    new MutationObserver(records=>{if(records.some(r=>!root.contains(r.target)))schedule();}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open','hidden','class','data-dark','data-mode','data-view','data-corner-module']});
    document.addEventListener('fullscreenchange',()=>{close();schedule();});
    window.addEventListener('resize',()=>{finish(false);close();refresh();});
    window.visualViewport?.addEventListener('resize',()=>{if(compactHome()){finish(false);close();schedule();}});
    for(const name of ['popstate','hashchange','shiyu-account-state','shiyu-pet-context'])window.addEventListener(name,()=>{close();schedule();});
    window.addEventListener('shiyu-operations-config',schedule);
    const sync=()=>{const next=read();if(next.updated!==config.updated){config=next;close();}refresh();};
    window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null)sync();});window.addEventListener('focus',sync);document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync();});
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',schedule);
    instance={refresh,close,notify,root,settingsMarkup,bindSettings};refresh();return instance;

    function settingsMarkup(){
      const choices=(key,values)=>'<div class="pet-setting-choices">'+values.map(([id,label])=>`<button type="button" data-pet-pref="${key}" data-value="${id}" aria-pressed="${String(config[key])===id}">${label}</button>`).join('')+'</div>';
    window.visualViewport?.addEventListener('resize',()=>{if(compactHome()){finish(false);close();schedule();}});
      return '<div class="pet-preferences" data-motion="'+config.motion+'"><div class="pet-setting-row"><div><h3>桌面宠物</h3><p>在首页、空间、世界与子应用中陪伴你。</p></div>'+choices('enabled',[['true','开启'],['false','关闭']])+'</div><div class="pet-skin-choices">'+[...new Set([...(adapter.skinOrder?.()||[]),...Object.keys(skins)])].filter(id=>skins[id]&&adapter.skinAllowed?.(id)!==false).map(id=>[id,skins[id]]).map(([id,[name,description]])=>`<button type="button" class="pet-skin-choice" data-pet-pref="skin" data-value="${id}" aria-pressed="${skin===id}">${art(id)}<b>${escape(adapter.skinName?.(id)||name)}</b><span>${description}</span></button>`).join('')+'</div><div class="pet-setting-row"><h3>宠物大小</h3>'+choices('size',[['small','小'],['normal','标准'],['large','大']])+'</div><div class="pet-setting-row"><div><h3>动作强度</h3><p>系统开启“减少动态效果”时保持静止。</p></div>'+choices('motion',[['normal','正常'],['gentle','轻微'],['off','静止']])+'</div><div class="pet-setting-row"><h3>位置记忆</h3><p>长按宠物拖动，松开后保存；切换主题保持原位。</p></div><button type="button" data-pet-reset>恢复默认位置</button></div></div>';
    }
    function bindSettings(container){
      container.innerHTML=settingsMarkup();
      container.onclick=async e=>{const b=e.target.closest('[data-pet-pref],[data-pet-reset]');if(!b||b.disabled)return;b.disabled=true;
        try{if(!await adapter.authorize?.('settings'))return;const key=b.dataset.petPref;if(key)save({[key]:key==='enabled'?b.dataset.value==='true':b.dataset.value});else save({position:null});container.innerHTML=settingsMarkup();}
        finally{b.disabled=false;}
      };
    }
  }
  window.ShiyuDesktopPet=Object.freeze({mount,art,icons,escape,read:()=>({...config,position:config.position?{...config.position}:null})});
})();
