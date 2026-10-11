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
  async function returnHome(){
    if(!await leaveContent())return;
    transitionUntil=0;
    if(['space.shiyubox.com','world.shiyubox.com'].includes(location.hostname)){location.assign('https://shiyubox.com/');return;}
    const url=new URL(location.href);for(const key of ['page','section','topic','q','source','id','corner','pet-settings','pet-destination'])url.searchParams.delete(key);
    history.replaceState(history.state,'',url);changeView('home');
  }
  function shortcutDestination(){
    const module=document.querySelector('#my-corner[open]')?.dataset.cornerModule;
    if(module)return 'app:'+module;
    if(document.body.classList.contains('world-active'))return 'world';
    return view==='space'?'space':view==='home'?'home':'';
  }
  function showPetSettings(){scope='global';settingsTab='desktop-pet';renderSettings();show('#settings');}
  function showShortcuts(){scope='global';settingsTab='shortcuts';renderSettings();show('#settings');}
  const defaultKeys={space:'Alt+Shift+S',world:'Alt+Shift+W','app:memo':'Alt+Shift+M','app:todo':'Alt+Shift+T','app:common':'Alt+Shift+C','app:toolbox':'Alt+Shift+B','app:icons':'Alt+Shift+I','app:palette':'Alt+Shift+P','app:cutout':'Alt+Shift+X'};
  let recording='',shortcutBusy=false;
  const bindings=()=>prefs.keyboardShortcutsV1?.[prefs.accountProfile?.id]||{};
  const binding=id=>Object.hasOwn(bindings(),id)?bindings()[id]:(defaultKeys[id]||'');
  function destinations(){
    if(!signed)return [];
    const feature=window.ShiyuFeatureConfig,items=[];
    if(feature?.allowed('space')!==false)items.push({id:'space',label:'进入空间页'});
    if(feature?.worldAvailable()===true)items.push({id:'world',label:'进入世界页'});
    for(const app of window.ShiyuCorner?.shortcuts()||[]){
      const meta=window.ShiyuCornerModules?.config(app.id)||{};
      if(meta.entitlementKey&&window.ShiyuEntitlements?.allows(meta.entitlementKey,meta.entitlementValue)!==true)continue;
      items.push({id:'app:'+app.id,label:app.label});
    }
    return items;
  }
  function saveBinding(id,value){
    if(!signed||!prefs.accountProfile?.id||!destinations().some(item=>item.id===id))return;
    prefs.keyboardShortcutsV1??={};prefs.keyboardShortcutsV1[prefs.accountProfile.id]??={};
    prefs.keyboardShortcutsV1[prefs.accountProfile.id][id]=value;persist();recording='';renderSettings();
  }
  function renderShortcuts(container){
    const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    container.innerHTML='<section class="keyboard-settings"><p class="keyboard-hint">首页按一次进入对应页面，再按一次返回首页；输入或编辑时不触发。点击键位即可修改，按 Esc 取消。</p>'+(signed?destinations().map(item=>'<div class="keyboard-row"><span>'+escape(item.label)+'</span><button type="button" data-record-shortcut="'+escape(item.id)+'" aria-label="设置'+escape(item.label)+'快捷键" aria-pressed="'+(recording===item.id)+'">'+(recording===item.id?'请按组合键…':escape(binding(item.id)||'未设置'))+'</button><button type="button" class="keyboard-clear" data-clear-shortcut="'+escape(item.id)+'" '+(!binding(item.id)?'disabled':'')+' aria-label="清除'+escape(item.label)+'快捷键">清除</button></div>').join('')+'<p class="keyboard-hint">使用 Ctrl / Alt / Shift / ⌘ 与字母或数字组合；系统及浏览器保留组合键不可设置。修改自动保存。</p><button type="button" data-reset-shortcuts>恢复默认快捷键</button>':'<p class="keyboard-empty">登录后，可为已启用且有权限的功能设置快捷键。</p><button type="button" data-shortcut-login>登录后设置</button>')+'<p class="keyboard-status" role="status" aria-live="polite"></p></section>';
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.recordShortcut){recording=button.dataset.recordShortcut;renderSettings();document.querySelector('[data-record-shortcut="'+CSS.escape(recording)+'"]')?.focus();}
    if(button.dataset.clearShortcut)saveBinding(button.dataset.clearShortcut,'');
    if(button.hasAttribute('data-reset-shortcuts')&&signed){prefs.keyboardShortcutsV1??={};prefs.keyboardShortcutsV1[prefs.accountProfile.id]={};persist();recording='';renderSettings();}
    if(button.hasAttribute('data-shortcut-login'))void authorize('settings');
    if(button.dataset.settingsTab&&button.dataset.settingsTab!=='shortcuts')recording='';
  });
  const settingsDialog=document.querySelector('#settings');
  settingsDialog?.addEventListener('close',()=>{recording='';});
  let backdropDown=false;
  const outside=event=>{const rect=settingsDialog.getBoundingClientRect();return event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom;};
  settingsDialog?.addEventListener('pointerdown',event=>{backdropDown=settingsTab==='shortcuts'&&event.target===settingsDialog&&outside(event);});
  settingsDialog?.addEventListener('click',event=>{if(backdropDown&&event.target===settingsDialog&&outside(event))settingsDialog.close();backdropDown=false;});
  function keyChord(event){
    if(!/^(Key[A-Z]|Digit[0-9])$/.test(event.code)||!(event.ctrlKey||event.altKey||event.metaKey))return '';
    return [event.ctrlKey?'Ctrl':'',event.altKey?'Alt':'',event.shiftKey?'Shift':'',event.metaKey?'Meta':'',event.code.replace(/^(Key|Digit)/,'')].filter(Boolean).join('+');
  }
  function reserved(event){
    // Ctrl+Alt is commonly AltGr; avoid stealing international text input.
    return event.ctrlKey&&event.altKey||event.metaKey&&event.altKey||((event.ctrlKey||event.metaKey)&&(!event.shiftKey||/[TWNPBIJCOQR]/.test(event.code.slice(3))))||event.altKey&&!event.shiftKey;
  }
  document.addEventListener('keydown',async event=>{
    if(event.isComposing||event.repeat)return;
    if(recording&&settingsDialog?.open&&settingsTab==='shortcuts'){
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();recording='';renderSettings();return;}
      if(['Tab','Shift','Control','Alt','Meta'].includes(event.key))return;
      event.preventDefault();event.stopImmediatePropagation();
      const chord=keyChord(event),status=document.querySelector('.keyboard-status');
      if(!chord||reserved(event)){status.textContent='请换一个组合键，避开浏览器和系统快捷键。';return;}
      const conflict=destinations().find(item=>item.id!==recording&&binding(item.id)===chord);
      if(conflict){status.textContent='该快捷键已用于「'+conflict.label+'」。';return;}
      saveBinding(recording,chord);return;
    }
    if(!signed||document.hidden||!document.hasFocus()||blocked()||event.defaultPrevented||event.composedPath().some(node=>node.matches?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]')))return;
    const chord=keyChord(event),item=chord&&destinations().find(item=>binding(item.id)===chord);if(!item||reserved(event))return;
    const destination=shortcutDestination();if(destination!=='home'&&destination!==item.id)return;
    event.preventDefault();event.stopImmediatePropagation();if(shortcutBusy)return;shortcutBusy=true;
    const account=prefs.accountProfile?.id;
    try{
      if(!await authorize(item.id)||account!==prefs.accountProfile?.id||destination!==shortcutDestination()||blocked()||!destinations().some(next=>next.id===item.id))return;
      if(destination===item.id){await returnHome();return;}
      rememberSpace();
      if(item.id.startsWith('app:'))await window.ShiyuCorner?.openModule(item.id.slice(4),pet.root.querySelector('.pet-character'));
      else if(item.id==='space')enterLastSpace();else window.ShiyuWorld?.resume?.();
    }catch{toast('暂时无法打开，请稍后重试。');}finally{shortcutBusy=false;}
  },true);
  for(const event of ['shiyu-account-state','shiyu-session-ready','shiyu-user-entitlements','shiyu-feature-config','shiyu-corner-config'])window.addEventListener(event,()=>{
    if(settingsDialog?.open&&settingsTab==='shortcuts'){recording='';renderSettings();}
  });
  pet=window.ShiyuDesktopPet.mount({
    homeURL:['localhost','127.0.0.1'].includes(location.hostname)?location.origin+'/':'https://shiyubox.com/',
    accountKey:()=>signed&&prefs.accountProfile?.id||'',
    authorize,host:surface,blocked,
    available:()=>window.ShiyuFeatureConfig?.category('pet')!==false,
    skinAllowed:id=>window.ShiyuFeatureConfig?.option('pet',id)!==false,
    skinUsable:id=>window.ShiyuFeatureConfig?.option('pet',id)!==false && window.ShiyuEntitlements?.allows('desktop-pets',id)===true,
    requireSkin:id=>window.ShiyuEntitlements?.require('desktop-pets',id,'personal')===true,
    skinOrder:()=>window.ShiyuFeatureConfig?.order('pet')||[],
    skinName:id=>window.ShiyuFeatureConfig?.optionLabel('pet',id,'')||'',
    petActionEnabled:id=>window.ShiyuFeatureConfig?.petAction(id)!==false,
    petTiming:()=>window.ShiyuFeatureConfig?.petTiming(),
    navigationName:id=>window.ShiyuFeatureConfig?.label(id,'')||'',
    playSound:()=>window.ShiyuCorner?.playShortcutSound?.(),
    context:()=>{rememberSpace();return {area:document.body.classList.contains('world-active')?'world':view,app:document.querySelector('#my-corner[open]')?.dataset.cornerModule,worldEnabled:!document.body.classList.contains('world-entry-disabled'),dark:document.body.classList.contains('world-active')?document.querySelector('#world-page')?.dataset.mode==='dark':document.body.dataset.dark==='true',accent:resolveThemeColor()};},
    apps:()=>window.ShiyuCorner?.shortcuts()||[],
    spaces:()=>signed?data.map(s=>({id:s.id,label:s.name})):[],
    openSettings:showPetSettings,
    openShortcuts:showShortcuts,
    async navigate(action,id,trigger){
      if(action==='navigate'&&id==='home'){await returnHome();return;}
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
      if(id==='space'){
        enterLastSpace();
      }else if(id==='world'&&signed)window.ShiyuWorld?.resume?.();
    }
  });
  window.addEventListener('shiyu-account-state',()=>pet.refresh());
  window.addEventListener('shiyu-session-ready',()=>pet.refresh());
  for(const event of ['shiyu-user-entitlements','shiyu-member-resources','shiyu-feature-config'])window.addEventListener(event,()=>pet.refresh());
  const originalSettings=renderSettings;
  renderSettings=function(){
    originalSettings();if(scope!=='global')return;
    const tabs=document.querySelector('#settings .settings-tabs');if(!tabs)return;
    tabs.insertAdjacentHTML('beforeend','<button type="button" role="tab" data-settings-tab="shortcuts" aria-selected="'+(settingsTab==='shortcuts')+'">快捷键</button>');
    if(settingsTab==='shortcuts'){
      const note=document.querySelector('#settings .scope-note');if(note)note.textContent='为常用功能设置快捷键。';
      renderShortcuts(document.querySelector('#settings .settings-panel'));
    }
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
