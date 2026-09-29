/* Navigation-site adapter: preserve existing destinations, account gates and content renderers. */
(() => {
  'use strict';
  let pet;
  const labels={space:'个人空间',world:'发现世界',app:'这个应用',settings:'个性化设置'};
  const spaceKey=()=>signed&&prefs.accountProfile?.id?'shiyu-pet-last-space:'+prefs.accountProfile.id:'';
  let rememberedSpace='';
  function rememberSpace(){
    if(view!=='space'||!spaceKey()||rememberedSpace===spaceKey()+':'+spaceId)return;
    rememberedSpace=spaceKey()+':'+spaceId;try{localStorage.setItem(spaceKey(),spaceId);}catch{}
  }
  function lastSpace(){try{const id=localStorage.getItem(spaceKey());return data.some(s=>s.id===id)?id:spaceId;}catch{return spaceId;}}
  function enterLastSpace(){
    if(!signed)return;
    if(location.hostname==='world.shiyubox.com'){location.assign('https://space.shiyubox.com/');return;}
    const target=lastSpace();if(target!==spaceId)goSpace(target);else changeView('space');
  }
  async function authorize(action){
    const result=await window.ShiyuAccountSession?.verify();
    if(result===true&&signed)return true;
    if(result===false||!signed){
      const settings=document.querySelector('#settings');if(settings?.open)settings.close();
      if(typeof openLogin==='function')openLogin('登录后即可进入'+(labels[action]||'这个功能')+'。');else show('#login');
    }else toast('暂时无法确认登录状态，请稍后重试。');
    return false;
  }
  const surface=()=>document.querySelector('#my-corner[open] .corner-fullscreen-shell')||document.querySelector('#space-atlas[open]')||document.fullscreenElement||document.body;
  function blocked(){
    return Boolean(document.querySelector('dialog[open]:not(#my-corner):not(#space-atlas),#my-corner.memo-editor-mode,.memo-pour-confirm,.at-drawer:not([hidden])'));
  }
  async function leaveContent(){
    if(blocked())return false;
    if(await window.ShiyuCorner?.closeModule()===false)return false;
    document.querySelector('#space-atlas[open]')?.close();
    if(document.body.classList.contains('world-active'))window.ShiyuWorld?.leaveForPet();
    return true;
  }
  function showPetSettings(){scope='global';settingsTab='desktop-pet';renderSettings();show('#settings');}
  pet=window.ShiyuDesktopPet.mount({
    homeURL:['localhost','127.0.0.1'].includes(location.hostname)?location.origin+'/':'https://shiyubox.com/',
    authorize,host:surface,blocked,
    available:()=>window.ShiyuFeatureConfig?.category('pet')!==false,
    skinAllowed:id=>window.ShiyuFeatureConfig?.option('pet',id)!==false,
    skinOrder:()=>window.ShiyuFeatureConfig?.order('pet')||[],
    skinName:id=>window.ShiyuFeatureConfig?.optionLabel('pet',id,'')||'',
    navigationName:id=>window.ShiyuFeatureConfig?.label(id,'')||'',
    playSound:()=>window.ShiyuCorner?.playShortcutSound?.(),
    context:()=>{rememberSpace();return {area:document.body.classList.contains('world-active')?'world':view,app:document.querySelector('#my-corner[open]')?.dataset.cornerModule,worldEnabled:!document.body.classList.contains('world-entry-disabled'),dark:document.body.classList.contains('world-active')?document.querySelector('#world-page')?.dataset.mode==='dark':document.body.dataset.dark==='true',accent:resolveThemeColor()};},
    apps:()=>window.ShiyuCorner?.shortcuts()||[],
    spaces:()=>signed?data.map(s=>({id:s.id,label:s.name})):[],
    openSettings:showPetSettings,
    async navigate(action,id,trigger){
      if(action==='navigate'&&id==='world'&&document.body.classList.contains('world-active')){window.ShiyuWorld?.resume?.();return;}
      if(action==='app'){
        if(!signed)return;
        if(document.body.classList.contains('world-active'))window.ShiyuWorld?.leaveForPet();
        document.querySelector('#space-atlas[open]')?.close();
        await window.ShiyuCorner?.openModule(id,trigger);return;
      }
      if(!await leaveContent())return;
      transitionUntil=0;
      if(action==='space'){
        if(signed&&data.some(s=>s.id===id))goSpace(id);return;
      }
      if(id==='home'){
        if(['space.shiyubox.com','world.shiyubox.com'].includes(location.hostname)){location.assign('https://shiyubox.com/');return;}
        // A direct home action must not restore a world-detail URL or a corner overlay.
        const url=new URL(location.href);for(const key of ['page','section','topic','q','source','id','corner','pet-settings','pet-destination'])url.searchParams.delete(key);
        history.replaceState(history.state,'',url);changeView('home');
      }else if(id==='space'){
        enterLastSpace();
      }else if(id==='world'&&signed)window.ShiyuWorld?.resume?.();
    }
  });
  const originalSettings=renderSettings;
  renderSettings=function(){
    originalSettings();if(scope!=='global')return;
    const tabs=document.querySelector('#settings .settings-tabs');if(!tabs)return;
    if(!tabs.querySelector('[data-settings-tab="desktop-pet"]'))tabs.insertAdjacentHTML('beforeend','<button type="button" role="tab" data-settings-tab="desktop-pet" aria-selected="'+(settingsTab==='desktop-pet')+'">桌面伙伴</button>');
    if(settingsTab==='desktop-pet'){
      const note=document.querySelector('#settings .scope-note');if(note)note.textContent='全局生效，宠物的位置和形象不随主题或空间变化。';
      const container=document.querySelector('#settings .settings-panel');pet.bindSettings(container);
    }
  };
  // A cross-application link carries only a destination, never credentials or account data.
  async function incoming(){
    const url=new URL(location.href),destination=url.searchParams.get('pet-destination'),settings=url.searchParams.has('pet-settings'),app=url.searchParams.get('pet-app');
    if(!destination&&!settings&&!app)return;
    const action=settings?'settings':app?'app':destination;
    if(!['settings','space','world','app'].includes(action))return;
    if(!await authorize(action))return;
    url.searchParams.delete('pet-destination');url.searchParams.delete('pet-settings');url.searchParams.delete('pet-app');history.replaceState(history.state,'',url);
    if(settings)showPetSettings();else if(app)await window.ShiyuCorner?.openModule(app,pet.root.querySelector('.pet-character'));else{transitionUntil=0;if(destination==='space')enterLastSpace();else window.ShiyuWorld?.resume?.();}
  }
  document.querySelector('#login')?.addEventListener('close',()=>{if(signed)void incoming();});
  void incoming();
})();
