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
  const firefoxLinux=/Firefox\//.test(navigator.userAgent)&&/Linux/.test(navigator.platform);
  const defaultKeys={home:firefoxLinux?'Alt+Q':'Alt+1',space:firefoxLinux?'Alt+W':'Alt+2',world:firefoxLinux?'Alt+R':'Alt+3','app:memo':'Alt+M','app:todo':'Alt+Y','app:common':'Alt+C','app:toolbox':'Alt+Z','app:icons':'Alt+I','app:palette':'Alt+P','app:cutout':'Alt+X','app:excalidraw':'Alt+G'};
  let recording='',shortcutBusy=false;
  const shortcutErrors=new Map();
  const bindings=()=>prefs.keyboardShortcutsV1?.[prefs.accountProfile?.id]||{};
  const binding=id=>Object.hasOwn(bindings(),id)?bindings()[id]:(defaultKeys[id]||'');
  function destinations(){
    if(!signed)return [];
    const feature=window.ShiyuFeatureConfig,items=[{id:'home',label:'返回首页'}];
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
    prefs.keyboardShortcutsV1[prefs.accountProfile.id][id]=value;shortcutErrors.delete(id);persist();recording='';renderSettings();
  }
  function renderShortcuts(container){
    const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    const rows=destinations().map(item=>{
      const error=shortcutErrors.get(item.id),saved=binding(item.id),message=error?.message||(saved&&browserConflict(saved)?'与浏览器快捷键冲突':'');
      const value=error?.chord|| (recording===item.id?'请按快捷键…':saved||'未设置');
      return '<div class="keyboard-row"><span>'+escape(item.label)+'</span><button type="button" data-record-shortcut="'+escape(item.id)+'" aria-label="设置'+escape(item.label)+'快捷键" aria-describedby="keyboard-error-'+escape(item.id)+'" aria-pressed="'+(recording===item.id)+'">'+escape(value)+'</button><button type="button" class="keyboard-clear" data-clear-shortcut="'+escape(item.id)+'" '+(!saved?'disabled':'')+' aria-label="清除'+escape(item.label)+'快捷键">清除</button><small id="keyboard-error-'+escape(item.id)+'" class="keyboard-row-error" role="status" aria-live="polite">'+escape(message)+'</small></div>';
    }).join('');
    container.innerHTML='<section class="keyboard-settings"><p class="keyboard-hint">首页按一次进入对应页面，再按一次返回首页；输入或编辑时不触发。点击键位即可修改，按 Esc 取消。</p>'+(signed?rows+'<p class="keyboard-hint">支持单个字母、数字、F1–F12，也可搭配 Ctrl / Alt / Shift / ⌘。常见冲突会提示，扩展或自定义快捷键可能无法识别。修改自动保存。</p><button type="button" data-reset-shortcuts>恢复默认快捷键</button>':'<p class="keyboard-empty">登录后，可为已启用且有权限的功能设置快捷键。</p><button type="button" data-shortcut-login>登录后设置</button>')+'<p class="keyboard-status" role="status" aria-live="polite"></p></section>';
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.recordShortcut){shortcutErrors.clear();recording=button.dataset.recordShortcut;renderSettings();document.querySelector('[data-record-shortcut="'+CSS.escape(recording)+'"]')?.focus();}
    if(button.dataset.clearShortcut)saveBinding(button.dataset.clearShortcut,'');
    if(button.hasAttribute('data-reset-shortcuts')&&signed){prefs.keyboardShortcutsV1??={};prefs.keyboardShortcutsV1[prefs.accountProfile.id]={};shortcutErrors.clear();persist();recording='';renderSettings();}
    if(button.hasAttribute('data-shortcut-login'))void authorize('settings');
    if(button.dataset.settingsTab&&button.dataset.settingsTab!=='shortcuts'){recording='';shortcutErrors.clear();}
  });
  const settingsDialog=document.querySelector('#settings');
  settingsDialog?.addEventListener('close',()=>{recording='';shortcutErrors.clear();});
  let backdropDown=false;
  const outside=event=>{const rect=settingsDialog.getBoundingClientRect();return event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom;};
  settingsDialog?.addEventListener('pointerdown',event=>{backdropDown=settingsTab==='shortcuts'&&event.target===settingsDialog&&outside(event);});
  settingsDialog?.addEventListener('click',event=>{if(backdropDown&&event.target===settingsDialog&&outside(event))settingsDialog.close();backdropDown=false;});
  function keyChord(event){
    if(!/^(Key[A-Z]|Digit[0-9]|F(?:[1-9]|1[0-2]))$/.test(event.code))return '';
    return [event.ctrlKey?'Ctrl':'',event.altKey?'Alt':'',event.shiftKey?'Shift':'',event.metaKey?'Meta':'',event.code.replace(/^(Key|Digit)/,'')].filter(Boolean).join('+');
  }
  function reserved(event){
    return event.getModifierState?.('AltGraph')===true;
  }
  // Known defaults, not a live enumeration of browser/extension bindings.
  // Sources: Chrome Help 157179; Microsoft Edge keyboard shortcuts;
  // Mozilla keyboard shortcuts; Apple Safari cpsh003.
  function browserConflict(chord){
    const ua=navigator.userAgent,mac=/Mac|iPhone|iPad/.test(navigator.platform),edge=/Edg\//.test(ua),firefox=/Firefox\//.test(ua),safari=/Safari\//.test(ua)&&!/(Chrome|Chromium|Edg)\//.test(ua);
    const parts=chord.split('+'),key=parts.pop(),mods=parts.join('+');
    if(!mods&&['F1','F3','F4','F5','F6','F7','F10','F11','F12'].includes(key))return true;
    if((mods==='Shift'&&['F3','F5','F6','F10'].includes(key))||(mods==='Ctrl'&&['F4','F5','F6'].includes(key)))return true;
    const primary=mac?'Meta':'Ctrl';
    if(mods===primary&&('ABDEFGHJKLNOPRSTUWY'.includes(key)&&key.length===1||/^[0-9]$/.test(key)))return true;
    if(mods===(mac?'Shift+Meta':'Ctrl+Shift')||mods==='Ctrl+Shift'&&mac){
      const keys=edge?'BCDEGHIJKLMNOPRTUVWY':firefox?'ABCDGH IJKMNOPRTWYZ'.replace(/ /g,''):safari?'BDGHILNRTW':'ABDG IJMNORTW'.replace(/ /g,'');
      if(key.length===1&&keys.includes(key))return true;
    }
    if(!mac&&mods==='Alt'&&['D','E','F','F4'].includes(key))return true;
    if(!mac&&firefox&&mods==='Alt'&&(['B','H','S','T','V'].includes(key)||/Linux/.test(navigator.platform)&&/^[1-9]$/.test(key)))return true;
    if(!mac&&mods==='Alt+Shift'&&['B','I','T'].includes(key)&&!firefox&&!safari)return true;
    if(mac&&mods==='Alt+Meta'&&['F','I','J','L'].includes(key))return true;
    return edge&&!mods&&key==='F9';
  }
  function rowError(id,chord,message){
    shortcutErrors.set(id,{chord,message});renderSettings();
    document.querySelector('[data-record-shortcut="'+CSS.escape(id)+'"]')?.focus();
  }
  document.addEventListener('keydown',async event=>{
    if(event.isComposing||event.repeat)return;
    if(recording&&settingsDialog?.open&&settingsTab==='shortcuts'){
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();shortcutErrors.delete(recording);recording='';renderSettings();return;}
      if(['Tab','Shift','Control','Alt','Meta'].includes(event.key))return;
      event.preventDefault();event.stopImmediatePropagation();
      const chord=keyChord(event);
      if(!chord||reserved(event)){rowError(recording,chord,'请使用字母、数字或 F1–F12，可搭配修饰键。');return;}
      if(browserConflict(chord)){rowError(recording,chord,'与浏览器快捷键冲突');return;}
      if(!/Mac/.test(navigator.platform)&&event.metaKey||event.altKey&&event.code==='F4'){rowError(recording,chord,'与系统快捷键冲突');return;}
      const conflict=destinations().find(item=>item.id!==recording&&binding(item.id)===chord);
      if(conflict){rowError(recording,chord,'该快捷键已用于「'+conflict.label+'」。');return;}
      saveBinding(recording,chord);return;
    }
    if(!signed||document.hidden||!document.hasFocus()||blocked()||event.defaultPrevented||event.composedPath().some(node=>node.matches?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]')))return;
    const chord=keyChord(event),item=chord&&destinations().find(item=>binding(item.id)===chord);if(!item||reserved(event))return;
    const destination=shortcutDestination();if(!destination||item.id!=='home'&&destination!=='home'&&destination!==item.id)return;
    if(item.id==='home'&&destination==='home')return;
    event.preventDefault();event.stopImmediatePropagation();if(shortcutBusy)return;shortcutBusy=true;
    const account=prefs.accountProfile?.id;
    try{
      if(!await authorize(item.id)||account!==prefs.accountProfile?.id||destination!==shortcutDestination()||blocked()||!destinations().some(next=>next.id===item.id))return;
      if(item.id==='home'||destination===item.id){await returnHome();return;}
      rememberSpace();
      transitionUntil=0;
      if(item.id.startsWith('app:'))await window.ShiyuCorner?.openModule(item.id.slice(4),pet.root.querySelector('.pet-character'));
      else if(item.id==='space')enterLastSpace();else window.ShiyuWorld?.resume?.();
    }catch{toast('暂时无法打开，请稍后重试。');}finally{shortcutBusy=false;}
  },true);
  for(const event of ['shiyu-account-state','shiyu-session-ready','shiyu-user-entitlements','shiyu-feature-config','shiyu-corner-config'])window.addEventListener(event,()=>{
    if(settingsDialog?.open&&settingsTab==='shortcuts'){recording='';shortcutErrors.clear();renderSettings();}
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
