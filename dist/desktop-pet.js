/* Shared, dependency-free desktop companion. Hosts supply navigation and authorization. */
(() => {
  'use strict';
  if (window.ShiyuDesktopPet) return;
  const KEY = 'shiyu-desktop-pet-v1', COOKIE = 'shiyu_pet_v1';
  const defaults = { enabled: true, skin: 'paper', size: 'normal', motion: 'lively', roaming: 'fixed', position: null, home: '', updated: 0 };
  const skins = { cat: ['隅猫', '伸个懒腰，摇摇尾巴陪着你'], bird: ['纸雀', '轻轻展翅，把灵感带来'], sprout: ['芽芽', '慢慢生长，陪你发现新意'], line: ['小线', '轻轻晃一晃，向你挥挥手'], paper: ['小满', '草帽轻轻晃，陪你慢慢来'], swordswoman: ['女侠', '斗笠藏风，抱剑伴你行'] };
  const locomotion = { cat: 'ground', bird: 'air', sprout: 'ground', line: 'ground', paper: 'ground', swordswoman: 'ground' };
  const paperAsset = new URL('assets/desktop-pet/paper-person.webp?pose=seated-v1', document.currentScript?.src || location.href).href;
  const paperFrames = Array.from({length:32},(_,frame)=>new URL(`assets/site-icons/pet-girl-frame-${frame}.png`,document.currentScript?.src||location.href).href);
  const swordswomanFrames = Array.from({length:28},(_,frame)=>new URL(`assets/site-icons/pet-swordswoman-frame-${frame}.png`,document.currentScript?.src||location.href).href);
  const isSpriteSkin = skin => skin==='paper'||skin==='swordswoman';
  const spriteFrames = skin => skin==='swordswoman'?swordswomanFrames:paperFrames;
  let swordswomanPreloaded=false;
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
    roam: svg('<path d="M4 7h3l3 5 3-5h7M4 17h3l3-5 3 5h7"/><path d="m17 4 3 3-3 3m0 4 3 3-3 3"/>'),
    fixed: svg('<path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="7"/>'),
    down: svg('<path d="m6 9 6 6 6-6"/>')
  };
  function art(skin) {
    if (skin === 'line' || isSpriteSkin(skin)) return humanArt(skin);
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
    if(skin==='swordswoman'&&!swordswomanPreloaded){swordswomanPreloaded=true;for(const src of swordswomanFrames){const image=new Image();image.src=src;}}
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
    return `<span class="pet-art pet-girl-sprite" aria-hidden="true"><img class="pet-girl-cutout" src="${escape(spriteFrames(skin)[skin==='swordswoman'?4:0])}" alt="" draggable="false"></span>`;
  }

  function normalize(value) {
    const v = value && typeof value === 'object' ? value : {};
    const p = v.position;
    let home='';try{const u=new URL(v.home);if(['http:','https:'].includes(u.protocol)&&['127.0.0.1','localhost','shiyubox.com'].includes(u.hostname)&&!u.username&&!u.password)home=u.origin+'/';}catch{}
    const motion = {normal:'lively',gentle:'quiet',off:'quiet'}[v.motion] || (['quiet','lively','excited'].includes(v.motion) ? v.motion : 'lively');
    return { enabled: v.enabled !== false, skin: skins[v.skin] ? v.skin : 'paper', size: ['small','normal','large'].includes(v.size) ? v.size : 'normal', motion, roaming: v.roaming === 'roam' ? 'roam' : 'fixed',home,
      position: p && ['x','y','width','height'].every(k => Number.isFinite(p[k])) && p.width > 0 && p.height > 0 ? {x: clamp(p.x,0,p.width),y:clamp(p.y,0,p.height),width:p.width,height:p.height} : null,
      updated: Number.isFinite(v.updated) ? v.updated : 0 };
  }
  function read() {
    let local, shared;
    try { local = normalize(JSON.parse(localStorage.getItem(KEY))); } catch {}
    try { const cookie = document.cookie.split('; ').find(c => c.startsWith(COOKIE+'=')); if(cookie)shared=normalize(JSON.parse(decodeURIComponent(cookie.slice(COOKIE.length+1)))); } catch {}
    return shared && (!local || shared.updated >= local.updated) ? shared : local || {...defaults};
  }
  let config = read(), instance, activeAdapter={};
  function skinCookieName(account){let hash=2166136261;for(const c of String(account)){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619)}return 'shiyu_pet_skin_v1_'+(hash>>>0).toString(36)}
  function accountSkin(account){if(!account)return 'paper';try{const name=skinCookieName(account),entry=document.cookie.split('; ').find(c=>c.startsWith(name+'=')),value=entry?decodeURIComponent(entry.slice(name.length+1)):'';return skins[value]?value:'paper'}catch{return 'paper'}}
  function saveAccountSkin(account,skin){if(!account||!skins[skin])return;try{const firstParty=/(^|\.)shiyubox\.com$/.test(location.hostname);document.cookie=`${skinCookieName(account)}=${encodeURIComponent(skin)}; Path=/; Max-Age=31536000; SameSite=Lax${firstParty?'; Domain=shiyubox.com':''}${location.protocol==='https:'?'; Secure':''}`}catch{}}
  function save(patch) {
    config = normalize({...config,...patch,updated:Date.now()});
    if(Object.hasOwn(patch,'skin'))saveAccountSkin(activeAdapter.accountKey?.(),config.skin);
    try { localStorage.setItem(KEY,JSON.stringify(config)); } catch { instance?.notify('本机存储不可用，位置会在本次使用中保留。'); }
    // Only non-sensitive companion preferences cross first-party subdomains (and local preview ports).
    const firstParty = /(^|\.)shiyubox\.com$/.test(location.hostname);
    try { document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(config))}; Path=/; Max-Age=31536000; SameSite=Lax${firstParty?'; Domain=shiyubox.com':''}${location.protocol==='https:'?'; Secure':''}`; } catch {}
    instance?.refresh();
  }
  function mount(adapter) {
    if(instance)return instance;
    activeAdapter=adapter||{};config=normalize({...config,skin:accountSkin(activeAdapter.accountKey?.())});
    if(adapter.homeURL&&config.home!==adapter.homeURL)save({home:adapter.homeURL});
    const root=document.createElement('aside');root.id='desktop-pet';root.className='desktop-pet';root.setAttribute('aria-label','桌面伙伴');
    root.innerHTML='<div class="pet-menu" id="desktop-pet-menu" role="group" aria-label="快捷入口" hidden></div><button type="button" class="pet-character" aria-controls="desktop-pet-menu" aria-expanded="false"></button><div class="pet-speech" role="status" aria-live="off" hidden><span class="pet-speech-text"></span></div><div class="pet-panel" hidden></div><div class="pet-notice" role="status" hidden></div>';
    const core=root.querySelector('.pet-character'),menu=root.querySelector('.pet-menu'),panel=root.querySelector('.pet-panel'),speech=root.querySelector('.pet-speech'),speechText=root.querySelector('.pet-speech-text');
    let opened=false,pinned=false,drag=null,point={x:0,y:0},transientPoint=null,size=76,leaveTimer,enterTimer,noticeTimer,suppressUntil=0,raf=0,busy=false,signature='',skin='',contextKey='',direction=null,panelKind='',inCorridor=false,corridor=[],shortcutPath=[],selectedShortcutIndex=0,hintShowTimer=0,conversationTimer=0,conversationMode='',conversationIndex=0,queuedMoods=[];
    let idleTimer,roamTimer,roamFrame=0,roamState=null,lastThemePage=false;
    const context=()=>adapter.context?.()||{};
    const skinName=id=>String(adapter.skinName?.(id)||'').trim()||skins[id]?.[0]||'';
    const isThemePage=ctx=>ctx.area==='home'&&!ctx.app;
    const isAirborne=()=>locomotion[skin]==='air';
    function stopRoaming(resetPosition=false){clearTimeout(roamTimer);roamTimer=0;if(roamFrame)cancelAnimationFrame(roamFrame);roamFrame=0;roamState=null;root.dataset.roamPhase='idle';if(resetPosition){transientPoint=null;place();}}
    function themePerches(){
      // Themes with canvas-only artwork can optionally expose anchors with data-pet-perch.
      const bounds=viewportBounds(),selectors='h1,h2,h3,h4,button,a,img,svg,canvas,article,section,header,nav,form,[role="toolbar"]',explicit=[...document.querySelectorAll('[data-pet-perch]')],elements=explicit.length?explicit:[...document.querySelectorAll(isSpriteSkin(skin)?selectors+',p,blockquote,label,input,textarea':selectors)];
      const seen=new Set(),perches=[];
      for(const el of elements){
        if(root.contains(el)||el.closest('dialog,[hidden],[aria-hidden="true"],.desktop-pet')||seen.has(el))continue;seen.add(el);
        const style=getComputedStyle(el),r=el.getBoundingClientRect();
        if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)<.08||r.width<24||r.height<14||r.width>bounds.width*.72||r.height>bounds.height*.55)continue;
        if(r.right<bounds.left+size||r.left>bounds.right-size||r.top<bounds.top+size||r.bottom>bounds.bottom-size)continue;
        const area=r.width*r.height;if(area>bounds.width*bounds.height*.18)continue;
        const surface=isSpriteSkin(skin)?el:el.closest('[data-pet-perch],[role="toolbar"],nav,form,article,header')||el,rect={left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
        const offsets=explicit.length||el.matches('button,a,article,section,header,nav,form,[role="toolbar"],canvas,img,svg,p,blockquote,label,input,textarea')?[.18,.5,.82]:[.5];
        for(const offset of offsets){
          const x=clamp(r.left+r.width*offset,bounds.left+size/2+10,bounds.right-size/2-10),y=clamp(r.top-size/2+3,bounds.top+size/2+10,bounds.bottom-size/2-10);
          if(perches.some(p=>p.surface===surface&&Math.hypot(p.x-x,p.y-y)<Math.max(28,size*.55)))continue;
          perches.push({x,y,surface,rect,explicit:el.hasAttribute('data-pet-perch')});
        }
      }
      if(isSpriteSkin(skin))for(const offset of [.08,.24,.4,.56,.72,.88])perches.push({x:bounds.left+bounds.width*offset,y:bounds.bottom-size/2-10,surface:null,rect:null});
      return perches;
    }
    function scheduleRoaming(delay=60000){
      if(roamState||roamTimer)return;
      const ctx=context();
      if(config.roaming!=='roam'||!isThemePage(ctx)||!config.enabled||root.hidden||root.inert||opened||drag||document.hidden||root.dataset.motion==='off')return;
      roamTimer=setTimeout(()=>{roamTimer=0;beginRoaming();},delay);
    }
    function beginRoaming(){
      if(config.roaming!=='roam'||!isThemePage(context())||root.dataset.motion==='off'||document.hidden)return;
      if(opened||drag||root.matches(':hover')){scheduleRoaming(5000);return;}
      const bounds=viewportBounds(),candidates=themePerches();
      const fallback={x:bounds.left+size/2+10+Math.random()*Math.max(1,bounds.width-size-20),y:isSpriteSkin(skin)?bounds.bottom-size/2-10:bounds.top+size/2+10+Math.random()*Math.max(1,bounds.height-size-20),surface:null,rect:null};
      const nearest=candidates.filter(p=>Math.hypot(p.x-point.x,p.y-point.y)<size*1.8).sort((a,b)=>Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y))[0];
      const sourceSurface=nearest?.surface||null;
      const preferred=candidates.some(p=>p.explicit)?candidates.filter(p=>p.explicit):candidates;
      const options=preferred.filter(p=>Math.hypot(p.x-point.x,p.y-point.y)>size*1.25);
      const nearby=isSpriteSkin(skin)?options.filter(p=>Math.hypot(p.x-point.x,p.y-point.y)<Math.max(420,bounds.width*.42)):[];
      const pool=nearby.length?nearby:options.length?options:preferred;
      const target=pool.length?pool[Math.floor(Math.random()*pool.length)]:fallback;
      const sameSurface=!!sourceSurface&&sourceSurface===target.surface||isSpriteSkin(skin)&&!sourceSurface&&!target.surface&&Math.abs(point.y-target.y)<size*.35,grounded=!isAirborne(),gentle=root.dataset.motion==='gentle',from={...point};let route=grounded?'jump':'flight';
      const steps=[];
      const addStep=(phase,a,b,duration,height=0)=>steps.push({phase,from:{...a},to:{...b},duration,height});
      const face=(a,b)=>{if(Math.abs(b.x-a.x)>3)root.dataset.facing=b.x<a.x?'left':'right';};
      if(grounded&&sameSurface){
        const distance=Math.hypot(target.x-from.x,target.y-from.y),phase=distance<size*1.5?'walk':'run';route=phase;
        face(from,target);addStep(phase,from,target,Math.max(480,Math.min(3200,distance/(phase==='walk'?125:205)*1000)));
      }else if(!grounded){
        face(from,target);addStep('flight',from,target,Math.max(1300,Math.min(2600,Math.hypot(target.x-from.x,target.y-from.y)*1.15)),Math.min(190,size*.9+Math.abs(target.y-from.y)*.25));
      }else{
        let takeoff={...from};
        if(sourceSurface){
          const r=sourceSurface.getBoundingClientRect(),rightward=target.x>=from.x,edgeX=rightward?r.right+size*.18:r.left-size*.18;
          takeoff={x:clamp(edgeX,bounds.left+size/2+10,bounds.right-size/2-10),y:clamp(r.top-size/2+3,bounds.top+size/2+10,bounds.bottom-size/2-10)};
        }else{
          const dx=target.x-from.x,sign=Math.sign(dx)||1,runUp=Math.min(Math.abs(dx)*.22,size*1.65);
          takeoff={x:clamp(from.x+sign*runUp,bounds.left+size/2+10,bounds.right-size/2-10),y:from.y};
        }
        const runDistance=Math.hypot(takeoff.x-from.x,takeoff.y-from.y);
        if(runDistance>8){face(from,takeoff);addStep('run',from,takeoff,Math.max(320,Math.min(3200,runDistance/190*1000)));}
        addStep('takeoff',takeoff,takeoff,190,size*.045);
        face(takeoff,target);const gap=Math.hypot(target.x-takeoff.x,target.y-takeoff.y),arc=Math.min(size*1.08,Math.max(size*.62,gap*.085+Math.abs(target.y-takeoff.y)*.22));
        const airborne=isSpriteSkin(skin)&&gap>Math.max(360,bounds.width*.3);
        if(airborne)route='flight';
        addStep(airborne?'flight':'jump',takeoff,target,Math.max(1180,Math.min(2050,1080+gap*.48)),arc*(gentle?.82:1));
        addStep('land',target,target,230,size*.035);
      }
      hideHint();delete root.dataset.roamCollision;root.dataset.roamRoute=route;
      roamState={steps,index:0,started:performance.now(),surfaces:isSpriteSkin(skin)?candidates.filter(p=>p.rect):[]};root.dataset.roamPhase=steps[0]?.phase||'idle';
      transientPoint={...point};
      const tick=now=>{
        roamFrame=0;if(!roamState)return;
        const s=roamState,step=s.steps[s.index],elapsed=now-s.started;
        if(!step){point={...s.lastPoint};transientPoint={...point};roamState=null;root.dataset.roamPhase='idle';root.dataset.landing='true';setTimeout(()=>{delete root.dataset.landing;},280);scheduleRoaming(60000);place();return;}
        const t=clamp(elapsed/step.duration,0,1),previous={...point};root.dataset.roamPhase=step.phase;face(step.from,step.to);
        if(step.phase==='run'||step.phase==='walk')root.dataset.runUntil=String(now+110);
        if(step.phase==='takeoff')point={x:step.to.x,y:step.to.y+Math.sin(Math.PI*t)*step.height};
        else if(step.phase==='jump'||step.phase==='flight')point={x:step.from.x+(step.to.x-step.from.x)*t,y:isSpriteSkin(skin)?step.from.y+(step.to.y-step.from.y-4*step.height)*t+4*step.height*t*t:step.from.y+(step.to.y-step.from.y)*t-Math.sin(Math.PI*t)*step.height};
        else if(step.phase==='land')point={x:step.to.x,y:step.to.y-Math.sin(Math.PI*t)*step.height};
        else point={x:step.from.x+(step.to.x-step.from.x)*t,y:step.from.y+(step.to.y-step.from.y)*t};
        let bounced=false;
        if(isSpriteSkin(skin)&&['jump','flight','run','walk'].includes(step.phase)){
          const radius=size*.43,oldFoot=previous.y+size*.5-3,newFoot=point.y+size*.5-3,descending=point.y>previous.y;
          for(const perch of s.surfaces){
            const r=perch.rect;
            if(!r||r.width<20||r.height<10)continue;
            if(descending&&oldFoot<=r.top+2&&newFoot>=r.top&&point.x>=r.left+radius*.45&&point.x<=r.right-radius*.45){
              point={x:point.x,y:r.top-size*.5+3};s.steps=[];s.lastPoint={...point};root.dataset.roamCollision='landing';break;
            }
            const withinHeight=point.y+size*.35>r.top&&point.y-size*.35<r.bottom;
            if(withinHeight&&previous.x+radius<=r.left&&point.x+radius>r.left){point.x=r.left-radius-2;s.steps=[{phase:'bounce',from:{...point},to:{x:clamp(point.x-size*.55,bounds.left+size/2,bounds.right-size/2),y:point.y},duration:320}];s.index=0;s.started=now;s.lastPoint={...point};bounced=true;root.dataset.roamCollision='bounce';root.dataset.facing='left';break;}
            if(withinHeight&&previous.x-radius>=r.right&&point.x-radius<r.right){point.x=r.right+radius+2;s.steps=[{phase:'bounce',from:{...point},to:{x:clamp(point.x+size*.55,bounds.left+size/2,bounds.right-size/2),y:point.y},duration:320}];s.index=0;s.started=now;s.lastPoint={...point};bounced=true;root.dataset.roamCollision='bounce';root.dataset.facing='right';break;}
          }
        }
        if(t>=1&&s.steps.length&&!bounced){point={...step.to};s.lastPoint={...point};s.index++;s.started=now;const next=s.steps[s.index];if(next)face(next.from,next.to);}
        transientPoint={...point};place();roamFrame=requestAnimationFrame(tick);
      };
      roamFrame=requestAnimationFrame(tick);
    }
    function wakePet(){
      root.removeAttribute('data-idle');root.inert=false;clearTimeout(idleTimer);
      if(opened||isThemePage(context()))return;
      idleTimer=setTimeout(()=>{if(drag||opened||root.matches(':hover')){wakePet();return}close();root.dataset.idle='true';root.inert=true},60000);
    }
    window.addEventListener('pointermove',wakePet,{capture:true,passive:true});
    window.addEventListener('pointerdown',wakePet,{capture:true,passive:true});
    wakePet();
    const reduced=()=>config.motion==='quiet'||matchMedia('(prefers-reduced-motion: reduce)').matches;
    function notify(message){const el=root.querySelector('.pet-notice');el.textContent=message;el.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.hidden=true,3200);}
    function hideHint(){clearInterval(conversationTimer);conversationMode='';queuedMoods=[];speech.hidden=true;speechText.textContent='';}
    function positionSpeech(){
      const pet=core.getBoundingClientRect(),bounds=viewportBounds(),gap=5,pad=8,width=speech.offsetWidth||150,height=speech.offsetHeight||30;
      const anchorX=pet.left+pet.width/2,anchorY=pet.top+clamp(pet.height*.12,8,16);
      const top=clamp(anchorY-height-gap,bounds.top+pad,Math.max(bounds.top+pad,bounds.bottom-height-pad));
      const raw=[anchorX-width/2,pet.right-width+12,pet.left-12];
      const candidates=raw.map((x,rank)=>({left:clamp(x,bounds.left+pad,Math.max(bounds.left+pad,bounds.right-width-pad)),rank}));
      const shortcuts=[...menu.querySelectorAll('.pet-shortcut')].map(node=>node.getBoundingClientRect());
      const scored=candidates.map(candidate=>({ ...candidate,overlap:shortcuts.reduce((sum,r)=>sum+Math.max(0,Math.min(candidate.left+width,r.right)-Math.max(candidate.left,r.left))*Math.max(0,Math.min(top+height,r.bottom)-Math.max(top,r.top)),0)}));
      scored.sort((a,b)=>a.overlap-b.overlap||a.rank-b.rank);
      const left=scored[0].left,edge=anchorY<top?'top':'bottom',baseY=edge==='bottom'?top+height:top,tailX=clamp(anchorX-left,12,width-12),tailAbsX=left+tailX;
      const angle=Math.atan2(anchorX-tailAbsX,anchorY-baseY)*180/Math.PI;
      speech.dataset.tailEdge=edge;speech.style.left=`${left}px`;speech.style.top=`${top}px`;speech.style.setProperty('--pet-speech-tail-x',`${tailX}px`);speech.style.setProperty('--pet-speech-tail-angle',`${angle}deg`);
    }
    const girlPhraseOptions={rest:['慢慢来，今天也会很棒！','准备好迎接一点小惊喜了吗？','和你一起，心情都变好了！'],wave:['你好呀！很高兴见到你！','嗨，今天也要开心呀！','见到你真开心！'],yawn:['Hello！一起开启好心情！','伸个懒腰，元气满满！','舒展一下，继续出发！'],dance:['好开心呀，和我一起动一动！','今天也充满好心情！','一起把快乐传递出去！'],run:['跑起来啦，一起出发！','风从耳边吹过，好开心！','跟着你去看看新风景！']};
    const girlPhraseIndices={rest:0,wave:0,yawn:0,dance:0,run:0};
    function nextGirlPhrase(state){const options=girlPhraseOptions[state]||girlPhraseOptions.rest,index=girlPhraseIndices[state]||0;girlPhraseIndices[state]=(index+1)%options.length;return options[index];}
    function dialogueLines(mode){
      const action=root.dataset.girlAction,state=mode==='run'?'run':action==='run'?'run':action==='wave'?'wave':action==='dance'?'dance':action==='yawn'?'yawn':'rest';
      const mood=skin==='paper'&&mode!=='run'?nextGirlPhrase(state):'';
      const first=mood||(mode==='run'?'跑起来啦，一起出发！':mode==='hover'?'好开心啊！':mode==='wheel'?'滚轮切换真有趣！':'你点到我啦！');
      if(mode==='run')return girlPhraseOptions.run;
      if(mode==='wheel')return [first,'继续滚动，逐项切换','点我进入当前选项'];
      if(mode==='click')return [first,'试试滚动切换入口','选中后点我进入'];
      return [first,'试试滚动切换入口','选中后点我进入'];
    }
    function showConversationLine(){if(drag?.active||['walk','run','takeoff','jump','flight','land','bounce'].includes(root.dataset.roamPhase)||root.hidden||root.inert){speech.hidden=true;return;}const queued=queuedMoods.shift(),lines=queued?null:dialogueLines(conversationMode);speech.dataset.hint=conversationMode;speechText.textContent=queued||lines[conversationIndex%lines.length];speech.hidden=false;positionSpeech();}
    function startConversation(mode){
      if(drag?.active&&mode!=='run'||root.hidden||root.inert)return;
      if(conversationMode===mode&&!speech.hidden)return;
      clearTimeout(hintShowTimer);clearInterval(conversationTimer);if(mode!=='mood')queuedMoods=[];conversationMode=mode;conversationIndex=0;showConversationLine();
      conversationTimer=setInterval(()=>{if(drag?.active&&conversationMode!=='run'||conversationMode==='run'&&!drag?.active||(conversationMode!=='mood'&&conversationMode!=='run'&&!root.matches(':hover')&&!opened&&!inCorridor)||conversationMode==='mood'&&!queuedMoods.length){hideHint();return;}conversationIndex++;showConversationLine();},5000);
    }
    function scheduleHint(){if(drag?.active)return;clearTimeout(hintShowTimer);hintShowTimer=setTimeout(()=>startConversation('hover'),760);}
    let lastGirlPhraseState='';
    function updateGirlDialogue(frame){const state=frame===1||frame===2?'wave':frame===4||frame===5||frame===6?'yawn':frame>=10&&frame<=12?'dance':'';if(!state){lastGirlPhraseState='';return;}if(state===lastGirlPhraseState)return;lastGirlPhraseState=state;queuedMoods.push(nextGirlPhrase(state));if(queuedMoods.length>4)queuedMoods.shift();if(!conversationMode)startConversation('mood');}
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
      if(!drag?.active){const p=transientPoint||config.position;point=p?(p===transientPoint?{x:p.x,y:p.y}:{x:p.x*innerWidth/p.width,y:p.y*innerHeight/p.height}):{x:innerWidth-76,y:innerHeight-142};}
      const b=viewportBounds();point.x=clamp(point.x,b.left+size/2+10,Math.max(b.left+size/2+10,b.right-size/2-10));point.y=clamp(point.y,b.top+size/2+10,Math.max(b.top+size/2+10,b.bottom-size/2-10));
      root.style.left=(point.x-size/2)+'px';root.style.top=(point.y-size/2)+'px';
    }
    function refresh(){
      const ctx=context(),host=adapter.host?.()||document.fullscreenElement||document.body;
      if(root.parentNode!==host)host.append(root);
      const blocked=adapter.blocked?.()??Boolean(document.querySelector('dialog[open]'));
      const available=adapter.available?.()!==false;
      root.hidden=!config.enabled||blocked||!available;root.inert=blocked||!available;
      root.dataset.motion=matchMedia('(prefers-reduced-motion: reduce)').matches?'off':config.motion==='quiet'?'gentle':'normal';
      root.dataset.temperament=config.motion;
      root.dataset.dark=String(ctx.dark??(document.body.dataset.dark==='true'||document.body.classList.contains('dark')));
      if(ctx.accent)root.style.setProperty('--pet-accent',ctx.accent);
      const accountPreferredSkin=accountSkin(adapter.accountKey?.());if(config.skin!==accountPreferredSkin)config=normalize({...config,skin:accountPreferredSkin});
      const visibleSkin=adapter.skinAllowed?.(config.skin)===false?[...new Set([...(adapter.skinOrder?.()||[]),...Object.keys(skins)])].find(id=>skins[id]&&adapter.skinAllowed?.(id)!==false)||'paper':config.skin;
      root.dataset.skin=visibleSkin;
      if(skin!==visibleSkin){skin=visibleSkin;core.innerHTML=art(skin);}
      if(!drag?.active)core.setAttribute('aria-label',`${skinName(skin)}，点击展开快捷入口，按住拖动`);
      root.dataset.roaming=config.roaming==='roam'&&isThemePage(ctx)?'true':'false';
      if(isThemePage(ctx)){root.removeAttribute('data-idle');root.inert=blocked||!available;clearTimeout(idleTimer);}
      else if(lastThemePage){transientPoint=null;stopRoaming();wakePet();}
      lastThemePage=isThemePage(ctx);
      place();
      const next=JSON.stringify([ctx.area,ctx.app,ctx.worldEnabled]);
      if(next!==contextKey){contextKey=next;signature='';if(opened)buildMenu();}
      if(blocked||!config.enabled||!available)close();
      if(config.roaming==='roam'&&isThemePage(ctx))scheduleRoaming(60000);else stopRoaming(config.roaming!=='roam'||!isThemePage(ctx));
    }
    function button(action,id,label,icon,nav=false,current=false){return `<button type="button" class="pet-shortcut${nav?' pet-nav':''}" data-pet-action="${action}" data-pet-id="${escape(id)}" aria-label="${escape(label)}"${current?' aria-current="page"':''}><span class="pet-shortcut-icon">${icon||icons.space}</span><span class="pet-shortcut-label">${escape(label)}</span></button>`;}
    function buildMenu(){
      const apps=adapter.apps?.()||[],ctx=context();
      const visible=apps.length>5?[...apps.slice(0,4),{id:'__more',label:'更多应用',icon:icons.more}]:apps;
      const nav=[...(ctx.worldEnabled===false?[]:[['world',adapter.navigationName?.('world')||'世界',icons.world]]),['home',ctx.area==='home'&&!ctx.app?'首页':'回首页',icons.home],['space','我的空间',icons.space]];
      const modeLabel=config.roaming==='roam'?'切换到固定模式':'切换到漫游模式',modeIcon=config.roaming==='roam'?icons.fixed:icons.roam;
      const html=visible.map(app=>button(app.id==='__more'?'more':'app',app.id,app.label,app.icon,false,ctx.app===app.id)).join('')+nav.map(([id,label,icon])=>button('navigate',id,label,icon,true,ctx.area===id&&!ctx.app)).join('')+'<button type="button" class="pet-mode-entry" data-pet-action="toggle-roaming" aria-label="'+modeLabel+'" title="'+modeLabel+'">'+modeIcon+'</button><button type="button" class="pet-settings-entry" data-pet-action="settings" aria-label="桌面伙伴设置" title="桌面伙伴设置">'+icons.settings+'</button>';
      if(signature!==html){menu.innerHTML=html;signature=html;}
      layout();
      const items=[...menu.querySelectorAll('.pet-shortcut')],current=items.findIndex(item=>item.hasAttribute('aria-current')),currentPath=current>=0?shortcutPath.indexOf(items[current]):-1;
      selectShortcut(currentPath>=0?currentPath:Math.min(selectedShortcutIndex,shortcutPath.length-1));
    }
    function selectShortcut(index){
      if(!shortcutPath.length)shortcutPath=[...menu.querySelectorAll('.pet-shortcut')];
      if(!shortcutPath.length)return;
      selectedShortcutIndex=(index%shortcutPath.length+shortcutPath.length)%shortcutPath.length;
      shortcutPath.forEach((item,i)=>{item.dataset.wheelOrder=String(i);if(i===selectedShortcutIndex)item.dataset.selected='true';else delete item.dataset.selected;});
    }
    function stepShortcut(delta){const items=menu.querySelectorAll('.pet-shortcut');if(!items.length)return;const previous=selectedShortcutIndex;selectShortcut(previous+delta);if(selectedShortcutIndex!==previous){adapter.playSound?.();startConversation('wheel');}}
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
      const settings=menu.querySelector('.pet-settings-entry'),mode=menu.querySelector('.pet-mode-entry');
      const obstacles=[{x:0,y:0,width:size,height:size},...[settings,mode].map(el=>({x:el.offsetLeft+el.offsetWidth/2-size/2,y:el.offsetTop+el.offsetHeight/2-size/2,width:el.offsetWidth,height:el.offsetHeight}))];
      const positions=(group,angle,spread,r)=>group.map((el,i)=>{
        const a=angle+(i-(group.length-1)/2)*spread/Math.max(1,group.length-1);
        return {el,r,x:Math.cos(a)*r,y:Math.sin(a)*r,...bounds.get(el)};
      });
      const adaptiveSpread=(group,r,limit)=>{
        if(group.length<2)return 0;
        const largest=Math.max(...group.map(el=>Math.hypot(bounds.get(el).width,bounds.get(el).height)));
        const chord=largest+(group[0].classList.contains('pet-nav')?8:12);
        const step=2*Math.asin(Math.min(.98,chord/(2*r)));
        return Math.min(limit,step*(group.length-1));
      };
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
            const innerSpread=adaptiveSpread(navigation,navRadius,Math.min(1.58,spread));
            const inner=positions(navigation,angle,innerSpread,navRadius);
            if(!fits(inner)||!separated(inner))continue;
            for(let radius=180;radius<=308;radius+=16){
              const appSpread=adaptiveSpread(apps,radius,spread);
              const points=[...positions(apps,angle,appSpread,radius),...inner];
              if(fits(points)&&separated(points)){chosen={points,name,angle,spread:Math.max(appSpread,innerSpread),navigation};break search;}
            }
          }
        }
      }
      root.dataset.compact=String(!chosen);root.dataset.direction=chosen?.name||preferred;
      if(chosen){direction=chosen.name;shortcutPath=[...apps,...chosen.navigation.slice().reverse()];chosen.points.forEach((p,i)=>{p.el.style.setProperty('--item-x',p.x+'px');p.el.style.setProperty('--item-y',p.y+'px');p.el.style.setProperty('--item-order',i);});
        const radius=Math.max(180,...chosen.points.map(p=>p.r))+40;
        corridor=[{x:0,y:0},...Array.from({length:12},(_,i)=>{const angle=chosen.angle-chosen.spread/2+i*chosen.spread/11;return {x:Math.cos(angle)*radius,y:Math.sin(angle)*radius};})];
      }else{
        shortcutPath=items;
        const rows=Math.ceil(items.length/3),width=Math.min(284,boundsView.width-20),height=Math.min(boundsView.height-24,rows*64+Math.max(0,rows-1)*6+(useCompact?62:44));
        menu.style.setProperty('--compact-x',(clamp(point.x-width/2,boundsView.left+10,boundsView.right-width-10)-point.x+size/2)+'px');
        menu.style.setProperty('--compact-y',(clamp(point.y>(boundsView.top+boundsView.bottom)/2?point.y-size/2-height-12:point.y+size/2+12,boundsView.top+10,boundsView.bottom-height-10)-point.y+size/2)+'px');
        menu.style.setProperty('--compact-width',width+'px');
      }
      if(panelKind)positionPanel();
    }
    function open(){if(root.hidden||root.inert||drag?.active||Date.now()<suppressUntil)return;clearTimeout(leaveTimer);clearTimeout(idleTimer);if(!opened){clearTimeout(roamTimer);roamTimer=0;if(roamState){transientPoint={...point};stopRoaming();}direction=null;opened=true;root.dataset.open='true';menu.hidden=false;core.setAttribute('aria-expanded','true');buildMenu();}}
    function close(){clearTimeout(enterTimer);clearTimeout(leaveTimer);opened=false;pinned=false;inCorridor=false;root.dataset.open='false';menu.hidden=true;panel.hidden=true;panelKind='';core.setAttribute('aria-expanded','false');direction=null;if(config.roaming==='roam')scheduleRoaming(60000);}
    function positionPanel(){const b=viewportBounds(),width=Math.min(260,b.width-20),height=Math.min(340,b.height-24);panel.style.width=width+'px';panel.style.maxHeight=height+'px';panel.style.left=(clamp(point.x-width/2,b.left+10,b.right-width-10)-point.x+size/2)+'px';panel.style.top=(clamp(point.y>(b.top+b.bottom)/2?point.y-size/2-height-12:point.y+size/2+12,b.top+12,b.bottom-height-12)-point.y+size/2)+'px';}
    async function showPanel(kind){
      if(kind==='spaces'&&!await adapter.authorize?.('space'))return;
      panelKind=kind;pinned=true;panel.hidden=false;
      const items=kind==='spaces'?(adapter.spaces?.()||[]).map(s=>({id:s.id,label:s.label,icon:icons.space})):(adapter.apps?.()||[]);
      panel.innerHTML='<div class="pet-panel-heading"><b>'+ (kind==='spaces'?'切换空间':'全部应用')+'</b><button type="button" data-pet-action="close-panel" aria-label="关闭列表">×</button></div>'+items.map(app=>button(kind==='spaces'?'space':'app',app.id,app.label,app.icon)).join('');positionPanel();panel.querySelector('.pet-shortcut')?.focus({preventScroll:true});
    }
    async function activate(action,id){
      if(busy)return;
      if(action==='toggle-roaming'){
        const roaming=config.roaming!=='roam';
        if(roamState){transientPoint={...point};stopRoaming();}
        clearTimeout(roamTimer);roamTimer=0;
        save({roaming:roaming?'roam':'fixed'});
        if(opened)buildMenu();
        notify(roaming?'已切换到漫游模式':'已切换到固定模式');
        if(roaming&&isThemePage(context()))scheduleRoaming(60000);
        return;
      }
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
    root.addEventListener('pointerenter',e=>{clearTimeout(leaveTimer);clearTimeout(roamTimer);roamTimer=0;wakePet();if(roamState){transientPoint={...point};stopRoaming();}if(e.pointerType==='mouse')enterTimer=setTimeout(open,100);});
    core.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')scheduleHint();});
    core.addEventListener('pointerleave',()=>{clearTimeout(hintShowTimer);setTimeout(()=>{if(!root.matches(':hover')&&!inCorridor)hideHint();},260);});
    function deferClose(){clearTimeout(leaveTimer);leaveTimer=setTimeout(()=>{if(!pinned&&!drag?.active&&!inCorridor&&!root.matches(':hover')){close();wakePet();}},280);}
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
    root.addEventListener('pointerleave',()=>{clearTimeout(enterTimer);if(!pinned&&!drag?.active)deferClose();if(config.roaming==='roam')scheduleRoaming(60000);});
    root.addEventListener('focusin',()=>{clearTimeout(leaveTimer);});
    root.addEventListener('focusout',e=>{if(!root.contains(e.relatedTarget)&&!pinned)deferClose();});
    root.addEventListener('click',e=>{e.stopPropagation();if(Date.now()<suppressUntil){e.preventDefault();return;}const b=e.target.closest('[data-pet-action]');if(b){startConversation('click');void activate(b.dataset.petAction,b.dataset.petId);}else if(e.target.closest('.pet-character')){startConversation('click');if(!opened){open();pinned=true;return;}const selected=shortcutPath[selectedShortcutIndex];if(!selected||selected.hasAttribute('aria-current')){close();wakePet();}else void activate(selected.dataset.petAction,selected.dataset.petId);}});
    core.addEventListener('contextmenu',e=>e.preventDefault());
    core.addEventListener('pointerdown',e=>{
      if(e.button!==0||busy)return;e.stopPropagation();clearTimeout(hintShowTimer);hideHint();
      if(roamState){transientPoint={...point};stopRoaming();}clearTimeout(roamTimer);roamTimer=0;
      drag={pid:e.pointerId,x:e.clientX,y:e.clientY,point:{...point},active:false,pointerType:e.pointerType};const current=drag;
      if(e.pointerType==='touch')drag.timer=setTimeout(()=>{if(drag===current)startDrag();},260);
    });
    function startDrag(){if(!drag||drag.active)return;clearTimeout(hintShowTimer);hideHint();clearTimeout(drag.timer);clearTimeout(enterTimer);drag.active=true;close();core.setPointerCapture(drag.pid);root.dataset.dragging='true';core.setAttribute('aria-label','拖动宠物，松开保存位置');}
    function finish(commit){if(!drag)return;const d=drag;drag=null;clearTimeout(d.timer);if(core.hasPointerCapture(d.pid))core.releasePointerCapture(d.pid);root.dataset.dragging='false';core.setAttribute('aria-label',`${skinName(skin)}，点击展开快捷入口，按住拖动`);
      if(d.active){suppressUntil=Date.now()+400;if(commit){
        // A manual drop replaces the temporary roaming anchor before save() redraws.
        transientPoint=null;save({position:{...point,width:innerWidth,height:innerHeight}});
      }else place();if(!reduced()){root.dataset.landing='true';setTimeout(()=>delete root.dataset.landing,360);}if(core.matches(':hover'))scheduleHint();if(config.roaming==='roam')scheduleRoaming(60000);}}
    window.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pid)return;if(!drag.active){if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<(drag.pointerType==='touch'?9:3))return;startDrag();}e.preventDefault();e.stopPropagation();const now=performance.now(),dx=e.clientX-(drag.lastX??drag.x),dy=e.clientY-(drag.lastY??drag.y);if(Math.abs(dx)>1)root.dataset.facing=dx<0?'left':'right';root.dataset.dragSpeed=String(Math.round(Math.hypot(dx,dy)/Math.max(16,now-(drag.lastAt||now-16))*1000));drag.lastX=e.clientX;drag.lastY=e.clientY;drag.lastAt=now;root.dataset.runUntil=String(now+150);point={x:drag.point.x+e.clientX-drag.x,y:drag.point.y+e.clientY-drag.y};place();},{capture:true,passive:false});
    window.addEventListener('pointerup',e=>{if(drag?.pid===e.pointerId)finish(true);},true);
    window.addEventListener('pointercancel',e=>{if(drag?.pid===e.pointerId)finish(false);},true);
    core.addEventListener('lostpointercapture',()=>{if(drag)finish(false);});
    window.addEventListener('blur',()=>{finish(false);close();});
    document.addEventListener('pointerdown',e=>{if(!root.contains(e.target)){close();wakePet();}},true);
    root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(false);close();core.focus({preventScroll:true});wakePet();}else if(e.key==='ArrowDown'&&e.target===core){e.preventDefault();open();pinned=true;menu.querySelector('button')?.focus({preventScroll:true});}});
    document.addEventListener('wheel',e=>{
      if(!opened||panelKind||e.ctrlKey||!e.deltaY||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
      const x=e.clientX,y=e.clientY,inside=root.contains(e.target)||root.dataset.compact==='true'&&(()=>{const r=menu.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom})()||root.dataset.compact!=='true'&&insideCorridor(x-point.x,y-point.y);
      if(!inside)return;
      e.preventDefault();e.stopPropagation();stepShortcut(e.deltaY>0?1:-1);
    },{capture:true,passive:false});
    for(const name of ['pointerdown','pointermove','pointerup','touchstart','touchend','wheel'])root.addEventListener(name,e=>e.stopPropagation(),{passive:true});
    const schedule=()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;refresh();});};
    new MutationObserver(records=>{if(records.some(r=>!root.contains(r.target)))schedule();}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open','hidden','class','data-dark','data-mode','data-view','data-corner-module']});
    document.addEventListener('fullscreenchange',()=>{close();schedule();});
    window.addEventListener('resize',()=>{finish(false);close();refresh();});
    window.visualViewport?.addEventListener('resize',()=>{if(compactHome()){finish(false);close();schedule();}});
    for(const name of ['popstate','hashchange','shiyu-account-state','shiyu-pet-context'])window.addEventListener(name,()=>{close();schedule();});
    window.addEventListener('shiyu-operations-config',schedule);
    const sync=()=>{const next=read();if(next.updated!==config.updated){config=next;close();}refresh();};
    window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null)sync();});window.addEventListener('focus',()=>{sync();wakePet();});document.addEventListener('visibilitychange',()=>{if(!document.hidden){sync();wakePet();}});
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',schedule);
    // Each state owns three authored gestures; the backend enables individual action IDs.
    const girlActions={
      sit:[['sit-rest',[0,6,0],950],['sit-wave',[0,1,2,1,0],320],['sit-yawn',[0,4,5,4,6,0],450]],
      lie:[['lie-rest',[20,23,20],950],['lie-wave',[20,21,20],360],['lie-yawn',[20,22,20],480]],
      stand:[['stand-rest',[9,10,9],950],['stand-wave',[9,10,11,10,9],320],['stand-dance',[9,10,11,12,11,10,9],300]],
      jog:[['jog-light',[16,17,18,19],170],['jog-bounce',[17,18,19,16],185],['jog-turn',[18,19,16,17],165]],
      sprint:[['sprint-fast',[16,17,18,19],90],['sprint-lean',[17,18,19,16],82],['sprint-dash',[18,19,16,17],76]],
      jump:[['jump-hop',[24,25,27],170],['jump-leap',[24,26,27],160],['jump-wave',[24,25,26,27],150]],
      flight:[['flight-hover',[28,28,31,28],330],['flight-glide',[28,29,29,31],290],['flight-turn',[28,30,31],260]],
    };
    const swordswomanActions={"sit":[["swordswoman-sit-meditate",[4,5,4],700],["swordswoman-sit-hug",[4,6,4],650],["swordswoman-sit-look",[4,7,4],650]],"lie":[["swordswoman-lie-rest",[8,9,8],800],["swordswoman-lie-stretch",[8,10,9,8],650],["swordswoman-lie-breathe",[8,11,8],800]],"stand":[["swordswoman-stand-draw",[0,1,2,1,0],400],["swordswoman-stand-practice",[0,1,2,3,2,1,0],350],["swordswoman-stand-guard",[0,1,3,2,3,1,0],400]],"jog":[["swordswoman-jog-light",[12,13,14,15],170],["swordswoman-jog-steady",[12,13,14,15],185],["swordswoman-jog-swift",[12,13,14,15],150]],"sprint":[["swordswoman-sprint-fast",[16,17,18,19],95],["swordswoman-sprint-dash",[16,17,18,19],80],["swordswoman-sprint-chase",[16,17,18,19],110]],"jump":[["swordswoman-jump-hop",[20,21,22,23],170],["swordswoman-jump-leap",[20,21,22,22,23],150],["swordswoman-jump-land",[20,21,22,23,20],160]],"flight":[["swordswoman-flight-glide",[24,25,26,27,24],230],["swordswoman-flight-float",[24,25,24,27,24],300],["swordswoman-flight-descend",[24,26,27,25,24],260]]};
    const spriteActions=()=>skin==='swordswoman'?swordswomanActions:girlActions;
    function companionTempo(mode=opened||root.matches(':hover')?'hover':'idle'){
      const personality=config.motion,defaults={quiet:{state:30000,group:3500,gap:1800,speed:1.4},lively:{state:23000,group:2800,gap:1200,speed:1},excited:{state:16000,group:2200,gap:800,speed:.85}}[personality];
      const published=adapter.petTiming?.()?.[personality]?.[mode]||{},tempo={...defaults};
      for(const [key,min,max] of [['group',1000,10000],['gap',0,30000],['state',3000,300000]])if(typeof published[key]==='number'&&Number.isFinite(published[key]))tempo[key]=clamp(published[key],min,max);
      tempo.state=Math.max(tempo.state,tempo.group+tempo.gap);return tempo;
    }
    let girlSkin='',girlFrame=-1,girlState='',girlAction=null,girlStep=0,girlAt=0,girlChangeAt=0,girlStateStarted=0,girlRestUntil=0,girlMotion='',girlCycleTempo=null;
    const pose=(frame)=>{
      if(frame===girlFrame)return;girlFrame=frame;const el=core.querySelector('.pet-girl-cutout');if(!el)return;
      el.src=spriteFrames(skin)[frame];root.dataset.girlFrame=String(frame);
      if(skin==='paper')updateGirlDialogue(frame);
    };
    function pickGirlAction(state){
      const choices=spriteActions()[state].filter(([id])=>adapter.petActionEnabled?.(id)!==false);
      const pool=choices.length?choices:spriteActions()[state];
      const other=pool.filter(([id])=>id!==girlAction?.[0]);
      return (other.length?other:pool)[Math.floor(Math.random()*(other.length||pool.length))];
    }
    function girlTick(){
      const now=performance.now();
      if(!speech.hidden)positionSpeech();
      if(!isSpriteSkin(skin)||root.hidden||document.hidden){girlState='';girlAction=null;return;}
      if(girlSkin!==skin){girlSkin=skin;girlFrame=-1;girlState='';girlAction=null;girlRestUntil=0;girlStateStarted=now;}
      if(root.dataset.motion==='off'){girlState='';girlAction=null;girlMotion='off';root.dataset.petState='sit';root.dataset.girlAction='rest';pose(skin==='swordswoman'?4:0);return;}
      if(girlMotion!==root.dataset.temperament){girlMotion=root.dataset.temperament;girlStateStarted=now;}
      const cycleDone=!girlAction||girlStep>=girlAction[1].length&&now>=girlAt;
      const movingAction=['jog','sprint','jump','flight'].includes(girlState);
      if(girlAction&&cycleDone&&!movingAction&&!girlRestUntil)girlRestUntil=now+girlCycleTempo.gap;
      const ready=cycleDone&&(!girlAction||movingAction||now>=girlRestUntil);
      const disabled=girlAction&&adapter.petActionEnabled?.(girlAction[0])===false;
      const phase=root.dataset.roamPhase,travel=['walk','run','jump','takeoff','land','flight','bounce'].includes(phase);
      const movingDrag=drag?.active&&now<Number(root.dataset.runUntil||0);
      let wanted=drag?.active?(movingDrag?(Number(root.dataset.dragSpeed||0)>380?'sprint':'jog'):'stand'):
        phase==='flight'?'flight':phase==='jump'||phase==='takeoff'||phase==='land'||phase==='bounce'?'jump':phase==='run'?'sprint':phase==='walk'?'jog':
        opened||root.matches(':hover')?'stand':girlState;
      if(!travel&&!drag?.active&&!opened&&!root.matches(':hover')&&ready){
        const idleStates=config.roaming==='roam'?['sit','lie','stand']:['sit','lie'];
        if(!idleStates.includes(wanted)||now-girlStateStarted>=companionTempo('idle').state){const other=idleStates.filter(state=>state!==girlState);wanted=other[Math.floor(Math.random()*other.length)];}
      }
      if(wanted!==girlState||!girlAction||disabled||ready&&now>=girlChangeAt){
        if(wanted!==girlState||!girlAction)girlStateStarted=now;
        girlState=wanted;girlAction=pickGirlAction(wanted);girlStep=0;girlAt=now;girlRestUntil=0;
        girlCycleTempo=companionTempo();girlChangeAt=now+girlCycleTempo.group;
        root.dataset.petState=wanted;root.dataset.petActionId=girlAction[0];
        root.dataset.girlAction=wanted==='jog'||wanted==='sprint'?'run':girlAction[0].includes('wave')?'wave':girlAction[0].includes('yawn')?'yawn':girlAction[0].includes('dance')?'dance':wanted;
      }
      if(now>=girlAt&&(!cycleDone||movingAction||girlStep===0)){
        const frames=girlAction[1],moving=['jog','sprint','jump','flight'].includes(wanted);
        if(girlStep>=frames.length)girlStep=0;
        pose(frames[girlStep++]);
        // Resting gestures finish and return to their neutral pose before selection.
        girlAt=now+(moving?girlAction[2]*girlCycleTempo.speed:girlCycleTempo.group/frames.length);
      }
    }
    setInterval(girlTick,50);
    // Joint-driven vector rigs share timing but retain individual gestures.
    let vectorSkin='',vectorNext=0,vectorAlternate=0,vectorStarted=0,vectorAction='rest',vectorMode='idle',vectorProgress=0,vectorLast=0,vectorCycleTempo=null;
    const turn=(el,angle,x,y,dx=0,dy=0)=>{if(el)el.style.transform=`translate(${dx}px,${dy}px) rotate(${angle}deg)`;if(el)el.style.transformOrigin=`${x}px ${y}px`;};
    function vectorTick(now){
      requestAnimationFrame(vectorTick);
      const dt=Math.min(50,now-(vectorLast||now))/1000;vectorLast=now;
      if(isSpriteSkin(skin)){vectorSkin='';return;}
      if(root.hidden||document.hidden){vectorNext=now+6000;return;}
      if(vectorSkin!==skin){vectorSkin=skin;vectorCycleTempo=companionTempo();vectorNext=now+vectorCycleTempo.gap;vectorAlternate=0;vectorAction='rest';vectorMode='idle';vectorProgress=0;root.dataset.rig='joint';
        const art=core.querySelector('svg');
        if(skin==='cat'){
          const gait=document.createElementNS('http://www.w3.org/2000/svg','g');gait.classList.add('pet-cat-gait');
          gait.innerHTML='<path class="pet-tail" d="M24 66Q9 66 12 46"/><path class="pet-fur" d="M22 58Q38 46 63 56L71 75Q45 83 24 74Z"/><g class="gait-legs"><path d="M28 72v18h7"/><path d="M38 74v17h7"/><path d="M58 73v18h7"/><path d="M67 71v18h7"/></g>';
          const head=core.querySelector('.pet-head').cloneNode(true);head.setAttribute('transform','translate(40 29) scale(.58)');head.classList.remove('pet-head');gait.append(head);art.append(gait);
        }
        if(skin==='sprout')core.querySelector('.pet-feet').innerHTML='';
      }
      const phase=root.dataset.roamPhase,moving=drag?.active&&now<Number(root.dataset.runUntil||0)||['run','walk'].includes(phase);
      let wanted=drag?.active||['run','walk','jump','flight','takeoff','land'].includes(phase)?'travel':opened||root.matches(':hover')?'hello':'idle';
      if(vectorMode==='hello'&&wanted==='idle'&&now<vectorNext)wanted='hello';
      if(wanted!==vectorMode){vectorMode=wanted;vectorStarted=now;vectorAction=wanted==='idle'?'settle':wanted;vectorCycleTempo=companionTempo();vectorNext=now+vectorCycleTempo.group+vectorCycleTempo.gap;}
      if(root.dataset.motion==='off'){vectorProgress=0;vectorAction='rest';}
      else if(wanted!=='travel'&&now>=vectorNext){vectorAction=(wanted==='hello'?['hello','idle-a','idle-b']:['idle-a','idle-b'])[vectorAlternate++%(wanted==='hello'?3:2)];vectorStarted=now;vectorCycleTempo=companionTempo();vectorNext=now+vectorCycleTempo.group+vectorCycleTempo.gap;}
      const age=(now-vectorStarted)/1000,duration=vectorCycleTempo.group/1000,elapsed=age/duration*(vectorAction==='hello'?2.4:2.1);
      if(wanted!=='travel'&&age>=duration)vectorAction='rest';
      const active=root.dataset.motion!=='off',amp=root.dataset.motion==='gentle'?.45:1;
      const envelope=active&&vectorAction!=='rest'?Math.sin(Math.PI*Math.min(1,age/duration)):0;
      const a=envelope*amp,w=Math.sin(elapsed*8)*a;
      vectorProgress+=(Number(active&&wanted==='travel')-vectorProgress)*Math.min(1,dt*7);
      root.dataset.vectorAction=vectorAction;root.dataset.vectorMoving=String(!!moving);
      const q=s=>core.querySelector(s),body=q('.pet-body'),head=q('.pet-head'),paw=q('.pet-paw');
      const travel=vectorProgress,step=active&&moving?Math.sin(now/85):0;
      const art=q('.pet-art');art.style.transform=`rotate(${wanted==='travel'?(root.dataset.facing==='left'?-3:3)*travel:0}deg) ${skin!=='cat'&&wanted==='travel'&&root.dataset.facing==='left'?'scaleX(-1)':''}`;
      if(skin==='cat'){
        const gait=q('.pet-cat-gait');gait.style.opacity=travel;gait.style.transform=root.dataset.facing==='left'?'translate(96px,0) scaleX(-1)':'none';
        body.style.opacity=1-travel;q('.pet-tail').style.opacity=1-travel;
        turn(body,0,48,90,0,-5*travel);turn(head,vectorAction==='idle-a'?12*a:vectorAction==='idle-b'?-20*a:vectorAction==='hello'?-8*a:0,48,62,0,vectorAction==='idle-a'?3*a:0);
        turn(paw,vectorAction==='idle-a'?65*a:vectorAction==='hello'?45*a+15*w:0,30,75,vectorAction==='idle-a'?5*a:0,vectorAction==='idle-a'?-11*a:0);
        turn(q('.pet-tail'),vectorAction==='idle-b'?22*w:active?4*Math.sin(now/1200):0,66,80);
        [...gait.querySelectorAll('.gait-legs path')].forEach((leg,i)=>{const x=[28,38,58,67][i],swing=step*(i%2?1:-1)*7;leg.setAttribute('d',`M${x} 73l${swing} ${16-Math.abs(swing)*.35}h6`)});
      }else if(skin==='bird'){
        const flight=vectorAction==='hello'?Math.sin(Math.PI*Math.min(1,age/duration))*14:travel*12;
        turn(body,vectorAction==='idle-a'?12*w:vectorAction==='idle-b'?15*a:0,48,80,wanted==='hello'?Math.sin(elapsed*3)*5*a:0,-flight);
        turn(q('.pet-wing'),flight>1?-25+25*Math.sin(now/70):vectorAction==='idle-b'?-28*a:0,28,54);
        turn(q('.pet-feet'),0,48,84,0,flight>1?-4:0);
      }else if(skin==='sprout'){
        const hello=vectorAction==='hello';turn(body,hello?9*w:0,48,85,hello?3*w:0,hello?-Math.max(0,Math.sin(elapsed*6))*5*a:0);
        const leaves=core.querySelectorAll('.pet-leaf');leaves.forEach((leaf,i)=>turn(leaf,vectorAction==='idle-a'?Math.sin(elapsed*4-i)*20*a:-travel*12,48,24));
        turn(paw,vectorAction==='idle-b'?50*a:hello?30*a+10*w:0,24,62);
        const feet=q('.pet-feet'),s=step*7;feet.setAttribute('d',`M33 82l${s} 9h-7m${28-s} -9l${-s} 9h7`);
        turn(q('.pet-eyes'),0,48,50,0,vectorAction==='idle-b'?3*a:0);
      }else if(skin==='line'){
        const lift=vectorAction==='idle-b',hello=vectorAction==='hello';
        turn(q('.pet-human-head-look'),vectorAction==='idle-a'?12*w:hello?-6*a:0,48,39);
        turn(q('.pet-human-arm-rest'),lift?125*a:vectorAction==='idle-a'?105*a:travel*step*28,35,46);
        turn(q('.pet-human-arm-wave'),lift?-125*a:hello?(-100+15*Math.sin(elapsed*12))*a:-travel*step*28,61,46);
        const legs=q('.pet-human-balance>path'),feet=q('.pet-human-feet');const swing=travel*step*9+(hello?Math.sin(elapsed*7)*a*4:0);
        legs.setAttribute('d',`M36 63L${34+swing} 88l9 1L48 70l${5-swing} 19 9-1L60 63`);
        feet.setAttribute('d',`M${34+swing} 89l-3 5h13v-4M${53-swing} 89v6h13l-4-5`);
      }
    }
    requestAnimationFrame(vectorTick);

    instance={refresh,close,notify,root,settingsMarkup,bindSettings};refresh();return instance;

    function settingsMarkup(){
      const choices=(key,values)=>'<div class="pet-setting-choices">'+values.map(([id,label])=>`<button type="button" data-pet-pref="${key}" data-value="${id}" aria-pressed="${String(config[key])===id}">${label}</button>`).join('')+'</div>';
      return '<div class="pet-preferences" data-motion="'+config.motion+'"><div class="pet-setting-row"><div><h3>桌面伙伴</h3><p>在首页、空间、世界与子应用中陪伴你。</p></div>'+choices('enabled',[['true','开启'],['false','关闭']])+'</div><div class="pet-skin-choices">'+[...new Set([...(adapter.skinOrder?.()||[]),...Object.keys(skins)])].filter(id=>skins[id]&&adapter.skinAllowed?.(id)!==false).map(id=>[id,skins[id]]).map(([id,[,description]])=>`<button type="button" class="pet-skin-choice" data-pet-pref="skin" data-value="${id}" aria-pressed="${skin===id}">${art(id)}<b>${escape(skinName(id))}</b><span>${description}</span></button>`).join('')+'</div><div class="pet-setting-row"><h3>显示大小</h3>'+choices('size',[['small','小'],['normal','标准'],['large','大']])+'</div><div class="pet-setting-row"><div><h3>性格</h3><p>安静、活泼、兴奋都会有动作，区别在于更换动作的间隔。系统开启“减少动态效果”时会保持静止。</p></div>'+choices('motion',[['quiet','安静'],['lively','活泼'],['excited','兴奋']])+'</div><div class="pet-setting-row"><div><h3>主题页活动方式</h3><p>仅主题首页生效；漫游时每分钟跑动并跳跃或飞到新的停靠位置。</p></div>'+choices('roaming',[['fixed','固定'],['roam','漫游']])+'</div><div class="pet-setting-row"><h3>位置记忆</h3><p>按住伙伴移动即可拖动，松开后保存；切换主题保持原位。</p></div><button type="button" data-pet-reset>恢复默认位置</button></div></div>';
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
