(() => {
  'use strict';
  const ID='starlink';
  THEMES[ID]={...THEMES.base,name:'星光漫游',en:'STARLIGHT WANDER',desc:'星点相遇，连成此刻的星图。',mini:'星'};
  THEME_IDENTITIES[ID]=['星光漫游','lib-Sparkles'];
  COPY_DEFAULTS[ID]={...COPY_DEFAULTS.base,title:'循着微光，\n自在漫游。',intro:'不必急着抵达，让思绪随星光走一会儿。'};
  const artwork=themeArtwork;
  themeArtwork=id=>id===ID?'<img src="assets/starlink/cover.svg" alt="星光漫游" style="width:100%;height:100%;object-fit:cover">':artwork(id);
  const storageKey=()=>`shiyu-starlink:${signed?String(accountProfile().id||'guest'):'guest'}`;
  const count=()=>{let value;try{const key=storageKey();if(localStorage.getItem(key+':count-version')!=='100-300-v1'){localStorage.setItem(key,'150');localStorage.setItem(key+':count-version','100-300-v1');}value=localStorage.getItem(key);}catch{}return Math.max(20,Math.min(300,Number(value)||150));};
  const speed=()=>{let value;try{value=localStorage.getItem(storageKey()+':speed');}catch{}return Math.max(0.5,Math.min(5,Number(value)||2.5));};
  const distance=()=>{let value;try{value=localStorage.getItem(storageKey()+':distance');}catch{}return Math.max(50,Math.min(250,Number(value)||150));};
  let activeRoot,activeKey;
  const renderKey=()=>`${storageKey()}:${count()}:${resolveThemeColor()}`;
  function paintCopy(){const copy=currentCopy(ID),root=activeRoot?.querySelector('.starlink-copy');if(root){root.querySelector('h1').textContent=copy.title;root.querySelector('.intro').textContent=copy.intro;}}
  const previousHome=home;
  home=function(){
    if(view==='home'&&effective().theme===ID&&activeRoot?.isConnected&&activeKey===renderKey()){paintCopy();return;}
    activeRoot=null; previousHome();
    if(view!=='home'||effective().theme!==ID)return;
    const root=document.querySelector('.home-starlink'),copy=currentCopy(ID);
    if(!root)return; activeRoot=root;activeKey=renderKey();
    root.insertAdjacentHTML('afterbegin',`<iframe class="starlink-stage" title="星光漫游粒子动画" sandbox="allow-scripts allow-same-origin"></iframe><div class="starlink-copy"><div class="eyebrow" data-live-date>${dateText()}</div><h1>${esc(copy.title)}</h1><p class="intro">${esc(copy.intro)}</p></div><button class="starlink-open" aria-label="星光漫游设置" title="星光漫游设置" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="m10.2 10.4-3-2.7m6.5 2.6 3.5-3.5m-3.1 6.4 4.1 2.3m-7.7-1.6-2.9 3.8"/><circle cx="12" cy="12" r="2.4"/><circle cx="6" cy="6.5" r="1.7"/><circle cx="18.5" cy="5.5" r="1.7"/><circle cx="20" cy="16.5" r="1.7"/><circle cx="6.5" cy="19" r="1.7"/></svg></button><dialog class="starlink-panel" aria-label="星光漫游设置"><div class="starlink-panel-head"><strong>星光漫游设置</strong><button aria-label="关闭星光漫游设置">关闭</button></div><label><span>星点数量</span><output>${count()}</output><input type="range" min="20" max="300" step="10" value="${count()}"></label><label><span>漫游速度</span><output data-speed-output>${speed()}×</output><input data-starlink-speed type="range" min="0.5" max="5" step="0.5" value="${speed()}"></label><label><span>连线距离</span><output data-distance-output>${distance()}</output><input data-starlink-distance type="range" min="50" max="250" step="10" value="${distance()}"></label><footer class="starlink-panel-footer"><button type="button" data-starlink-reset>恢复默认配置</button></footer></dialog>`);
    const frame=root.querySelector('iframe'),panel=root.querySelector('dialog'),input=panel.querySelector('input');
    panel.querySelectorAll('input[type=range]').forEach(slider=>{const paint=()=>slider.style.setProperty('--fill',`${(Number(slider.value)-Number(slider.min))/(Number(slider.max)-Number(slider.min))*100}%`);paint();slider.addEventListener('input',paint);});
    const refresh=()=>{activeKey=renderKey();frame.src=`assets/starlink/frame.html?count=${count()}&speed=${speed()}&distance=${distance()}`;};
    refresh();
    const speedInput=panel.querySelector('[data-starlink-speed]');
    speedInput.oninput=()=>{panel.querySelector('[data-speed-output]').textContent=speedInput.value+'×';try{localStorage.setItem(storageKey()+':speed',speedInput.value);}catch{}frame.contentWindow?.setStarlinkSpeed?.(Number(speedInput.value));};
        const distanceInput=panel.querySelector('[data-starlink-distance]');
    distanceInput.oninput=()=>{panel.querySelector('[data-distance-output]').textContent=distanceInput.value;try{localStorage.setItem(storageKey()+':distance',distanceInput.value);}catch{}frame.contentWindow?.setStarlinkDistance?.(Number(distanceInput.value));};
    frame.addEventListener('load',()=>{frame.contentWindow?.setStarlinkSpeed?.(speed());frame.contentWindow?.setStarlinkDistance?.(distance());});
    panel.querySelector('[data-starlink-reset]').onclick=()=>{
      try{localStorage.setItem(storageKey(),'150');localStorage.setItem(storageKey()+':speed','2.5');localStorage.setItem(storageKey()+':distance','150');}catch{}
      input.value='150';speedInput.value='2.5';distanceInput.value='150';
      input.dispatchEvent(new Event('input'));speedInput.dispatchEvent(new Event('input'));distanceInput.dispatchEvent(new Event('input'));
      refresh();
    };
    const trigger=root.querySelector('.starlink-open');
    trigger.onclick=()=>{if(panel.open)panel.close();else panel.showModal();trigger.setAttribute('aria-expanded',String(panel.open));};
    panel.addEventListener('close',()=>trigger.setAttribute('aria-expanded','false'));
    panel.querySelector('button').onclick=()=>panel.close();
    panel.addEventListener('click',event=>{const rect=panel.getBoundingClientRect();if(event.target===panel&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))panel.close();});
    input.oninput=()=>{panel.querySelector('output').textContent=input.value;};
    input.addEventListener('pointerup',event=>{
      const rect=input.getBoundingClientRect(),edge=6;
      const value=event.clientX<=rect.left+edge?input.min:event.clientX>=rect.right-edge?input.max:null;
      if(value!==null&&input.value!==value){input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));}
    });
    input.onchange=()=>{try{localStorage.setItem(storageKey(),input.value);}catch{}refresh();};
    panel.onkeydown=e=>{if(e.key==='Escape'){panel.close();root.querySelector('.starlink-open').focus();}};
  };
  const previousCopy=applyHomeCopy;
  applyHomeCopy=function(){previousCopy();if(view==='home'&&effective().theme===ID){const copy=currentCopy(ID),root=document.querySelector('.starlink-copy');if(root){root.querySelector('h1').textContent=copy.title;root.querySelector('.intro').textContent=copy.intro;}}};
  window.addEventListener('shiyu-account-state',()=>{if(view==='home'&&effective().theme===ID)home();});
})();
