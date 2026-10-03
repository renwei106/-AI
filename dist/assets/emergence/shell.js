import { SCENES, rulesFor, fieldsFor, sanitize, migrateSelection, mergeLegacyContent } from './scenes.js';
import { EmergenceEngine } from './engine.js';

const glyph = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${({bird:'<path d="m2 6 9 6 1 7 1-7 9-6-8 11-2 3-2-3Z"/>',fish:'<path d="M3 12c4-6 10-6 14 0-4 6-10 6-14 0Zm14 0 5-4v8Z"/><circle cx="7" cy="11" r=".7"/>',triangle:'<path d="m5 20 7-17 7 17-7-4Z"/>',line:'<path d="m6 18 12-12"/>',dot:'<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>',restart:'<path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/>',pause:'<path d="M9 5v14M15 5v14"/>',play:'<path d="m8 4 12 8-12 8Z"/>',reset:'<path d="M4 12a8 8 0 1 1 4 7M4 6v6h6"/><path d="M12 8v5l3 2"/>'})[name]||''}</svg>`;
const sceneArt = id => `<svg viewBox="0 0 140 66" aria-hidden="true" class="emergence-scene-art">${id==='birds'?'<g fill="currentColor" opacity=".75"><path d="m25 45 10-16-2 14-3-3Z"/><path d="m47 30 10-16-2 14-3-3Z"/><path d="m70 37 12-15-4 14-3-3Z"/><path d="m94 24 13-12-5 12-3-3Z"/><path d="m82 56 9-16-1 14-3-3Z"/><path d="m113 43 11-14-3 13-3-3Z"/></g>':'<g fill="none" stroke="currentColor" opacity=".7"><ellipse cx="70" cy="33" rx="48" ry="15" transform="rotate(-22 70 33)"/><ellipse cx="70" cy="33" rx="27" ry="24" transform="rotate(32 70 33)"/><circle cx="70" cy="33" r="7" fill="currentColor" opacity=".3"/><circle cx="108" cy="14" r="3" fill="currentColor"/><circle cx="46" cy="46" r="2" fill="currentColor"/></g>'}</svg>`;

export function mountEmergence(root, {color, predatorColor = () => undefined, owner, onScene = () => {}}) {
  const abort = new AbortController(), on = (target, type, fn, options = {}) => target.addEventListener(type, fn, {...options, signal:abort.signal});
  const key = 'shiyu-emergence-v1:' + owner;
  let saved = {}; try { saved=JSON.parse(localStorage.getItem(key)||'{}')||{}; } catch {}
  saved=migrateSelection(saved);
  let engine, config, scene, configs={}, dead=false, loading=false, holdTimer, heldPointer=null;
  let panelOpen=false, panelMotion, ruleRole='prey', interactionTimer, lastCanvasPointer;
  function selectEngine(){
    const Engine=EmergenceEngine;
    if(engine instanceof Engine){engine.setScene(scene,configs[scene]);return;}
    const paused=engine?.paused||false;engine?.destroy();
    engine=new Engine(canvas,{scene,config:configs[scene],color:color(),predatorColor:predatorColor(),dark:document.body.dataset.dark==='true'});
    engine.setPaused(paused);
  }
  const accountOwner=!!owner&&owner!=='guest';
  let accountLoaded=!accountOwner, accountRestored=false, pendingSave=!!saved._pending, saveTimer, sending=false, saveVersion=0;
  root.insertAdjacentHTML('afterbegin', '<canvas class="emergence-canvas" aria-label="涌现动态场景"></canvas>');
  root.insertAdjacentHTML('beforeend', `<button type="button" class="emergence-open" aria-label="涌现场景设置" title="场景设置" aria-expanded="false" aria-controls="emergence-panel" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="m10.2 10.4-3-2.7m6.5 2.6 3.5-3.5m-3.1 6.4 4.1 2.3m-7.7-1.6-2.9 3.8"/><circle cx="12" cy="12" r="2.4"/><circle cx="6" cy="6.5" r="1.7"/><circle cx="18.5" cy="5.5" r="1.7"/><circle cx="20" cy="16.5" r="1.7"/><circle cx="6.5" cy="19" r="1.7"/></svg></button><aside id="emergence-panel" class="emergence-panel" aria-label="涌现场景设置" hidden><div class="emergence-panel-surface"><div class="emergence-panel-head"><strong>涌现</strong><button type="button" data-emergence-action="reset">恢复默认</button></div><div class="emergence-panel-scroll"><div class="emergence-scenes" role="group" aria-label="选择场景"></div><div class="emergence-fields"></div></div><small class="emergence-save" role="status"></small></div><div class="emergence-panel-foot"><div><button type="button" data-emergence-action="restart">重新开始</button><button type="button" data-emergence-action="pause">暂停</button></div></div></aside><p class="emergence-error" role="status">正在载入场景…</p>`);
  const $ = selector => root.querySelector(selector), canvas=$('.emergence-canvas'), panel=$('.emergence-panel'), opener=$('.emergence-open'), message=$('.emergence-error');
  const interactionStatus=document.createElement('div');
  interactionStatus.className='emergence-interaction-status';
  interactionStatus.setAttribute('role','status');interactionStatus.setAttribute('aria-live','polite');
  interactionStatus.setAttribute('aria-atomic','true');interactionStatus.setAttribute('popover','manual');
  root.append(interactionStatus);
  const shortcuts=document.createElement('div');shortcuts.className='emergence-shortcuts';shortcuts.setAttribute('aria-label','场景快捷操作');
  const mouseKey='<svg class="emergence-mouse-key" viewBox="0 0 18 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M9 2a6 6 0 0 0-6 6v3h6Z" fill="currentColor" fill-opacity=".4" stroke="none"/><rect x="3" y="2" width="12" height="20" rx="6"/><path d="M9 2v9H3m6 0h6"/></svg>';
  shortcuts.innerHTML=`<button type="button" data-shortcut="pause" aria-label="双击鼠标左键或按空格，暂停或播放">${mouseKey}<span>双击 /</span><kbd aria-label="空格键">␣</kbd><span>暂停或播放</span></button><button type="button" data-shortcut="magnifier" aria-pressed="false"><kbd>I</kbd><span>唤起放大镜</span></button><span class="emergence-shortcut-item" title="点击个体，自动放大并聚焦跟随">${mouseKey}<span>点击个体 · 聚焦跟随</span></span><span class="emergence-shortcut-item" title="长按鼠标左键加速，松开恢复">${mouseKey}<span>长按加速</span></span>`;
  root.append(shortcuts);
  on(canvas,'emergence-magnifier-change',event=>{
    const active=event.detail.active,button=shortcuts.querySelector('[data-shortcut="magnifier"]');
    button.setAttribute('aria-pressed',String(active));button.innerHTML=`<kbd>I</kbd><span>${active?'收起':'唤起'}放大镜</span>`;
  });
  function toggleMagnifier(active=!engine?.magnifierActive){
    if(!engine)return;stopHold();engine.setMagnifier(active);
    const button=shortcuts.querySelector('[data-shortcut="magnifier"]');button.setAttribute('aria-pressed',String(active));button.innerHTML=`<kbd>I</kbd><span>${active?'收起':'唤起'}放大镜</span>`;
    if(active){const point=lastCanvasPointer||{x:innerWidth/2,y:innerHeight/2};engine.setPointer(point.x,point.y);}
  }
  on(shortcuts,'click',event=>{const action=event.target.closest('[data-shortcut]')?.dataset.shortcut;if(!engine)return;if(action==='magnifier')toggleMagnifier();if(action==='pause'){stopHold();engine.setPaused(!engine.paused);playback();}});
  function pointerOptions() {
    return fieldsFor(scene).find(f=>f.key==='pointer').options.filter(([value])=>scene==='cosmos'||configs[scene].depth!=='depth'||['none','magnify'].includes(value));
  }
  function showInteractionStatus() {
    const label=pointerOptions().find(([value])=>value===configs[scene].pointer)?.[1]||'无';
    clearTimeout(interactionTimer);
    interactionStatus.textContent=`鼠标互动 · ${label}`;
    interactionStatus.showPopover();
    interactionTimer=setTimeout(()=>interactionStatus.hidePopover(),2200);
  }
  panel.setAttribute('popover','manual');panel.tabIndex=-1;
  panel.querySelector('.emergence-panel-head strong').innerHTML='<span></span><small>简单规则，自由生长</small>';
  function themeName() {
    const name=window.ShiyuFeatureConfig?.optionLabel('themes','emergence','万象涌现')||'万象涌现';
    panel.querySelector('.emergence-panel-head strong span').textContent=name;
    panel.setAttribute('aria-label',name+'场景设置');opener.setAttribute('aria-label',name+'场景设置');
    canvas.setAttribute('aria-label',name+'动态场景');
  }
  themeName();on(window,'shiyu-feature-config',themeName);
  $('[data-emergence-action="restart"]').innerHTML=glyph('restart')+'<span>重新开始</span>';
  $('[data-emergence-action="reset"]').innerHTML=glyph('reset')+'<span>恢复默认</span>';
  const playback = () => { $('[data-emergence-action="pause"]').innerHTML=glyph(engine?.paused?'play':'pause')+`<span>${engine?.paused?'继续':'暂停'}</span>`; };
  const allowed = () => Object.keys(SCENES).filter(id => config?.scenes?.[id]?.enabled === true);
  const defaults = id => sanitize(id, {...config.scenes[id].defaults,depth:'flat',...(id==='cosmos'?{blackHoles:'yes',collisions:'auto',influx:'yes'}:{})});
  function saveStatus(text) { if(!dead)$('.emergence-save').textContent=text; }
  function cacheSettings() {
    try { localStorage.setItem(key,JSON.stringify({...saved,_pending:pendingSave}));return true; } catch { return false; }
  }
  async function loadAccountSettings() {
    if(accountLoaded||!accountOwner)return;
    try {
      const response=await fetch('/api/shiyu/auth/emergence',{credentials:'same-origin',cache:'no-store',signal:abort.signal});
      const result=await response.json();if(!response.ok||result.userId!==owner)throw Error();
      if(dead)return;
      // Existing account settings win over a stale local cache; unsent edits stay pending.
      if(result.settings&&!pendingSave){saved=migrateSelection(result.settings);accountRestored=true;}
      else if(!result.settings&&saved.scene)pendingSave=true;
      accountLoaded=true;cacheSettings();
      saveStatus(pendingSave?'正在保存到账号…':result.settings?'已从账号恢复设置':'调整后自动保存到账号');
    }catch{saveStatus('账号暂未同步，当前使用本机配置');}
  }
  async function flushSave() {
    clearTimeout(saveTimer);
    if(!accountOwner||!pendingSave||sending)return;
    sending=true;
    let version=saveVersion;
    try {
      await loadAccountSettings();if(!accountLoaded)return;
      version=saveVersion;
      const settings={scene:saved.scene,configs:saved.configs};
      const response=await fetch('/api/shiyu/auth/emergence',{method:'PUT',credentials:'same-origin',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:owner,settings})});
      const result=await response.json();if(!response.ok||result.userId!==owner)throw Error();
      if(version===saveVersion){
        pendingSave=false;
        // A completed request from an old mount must not overwrite newer local edits.
        try { const local=JSON.parse(localStorage.getItem(key)||'{}');if(JSON.stringify({scene:local.scene,configs:local.configs})===JSON.stringify(settings))localStorage.setItem(key,JSON.stringify({...local,_pending:false})); } catch {}
        saveStatus('已保存到账号');
      }
    }catch{saveStatus('账号保存失败，将在重连后重试');}
    finally{sending=false;if(pendingSave&&version!==saveVersion)saveTimer=setTimeout(flushSave,300);}
  }
  function save() {
    saved={scene,configs:structuredClone(configs)};pendingSave=accountOwner;saveVersion++;
    const cached=cacheSettings();
    saveStatus(accountOwner?'正在保存到账号…':cached?'已保存在此浏览器':'仅本次有效，浏览器存储不可用');
    if(accountOwner){clearTimeout(saveTimer);saveTimer=setTimeout(flushSave,300);}
  }
  function stopHold(event) { if(event?.pointerId!==undefined&&heldPointer!==null&&event.pointerId!==heldPointer)return;clearTimeout(holdTimer);heldPointer=null;engine?.setBoost(false); }
  function layout() { panel.style.top='0px'; }
  function toggle(open, focus = true) {
    stopHold();layout();
    const previous=panelMotion?{transform:getComputedStyle(panel).transform,opacity:getComputedStyle(panel).opacity}:null;
    panelMotion?.cancel();panelOpen=open;panel.hidden=false;panel.showPopover();
    opener.setAttribute('aria-expanded',String(open));if(engine)engine.clearPointer();
    if(open){panel.inert=false;$('.emergence-panel-scroll').scrollTop=0;}
    if(focus)(open?panel:opener).focus({preventScroll:true});
    else if(!open&&panel.contains(document.activeElement))document.activeElement.blur();
    panel.inert=!open;panel.setAttribute('aria-hidden',String(!open));
    const offset=panel.getBoundingClientRect().width+parseFloat(getComputedStyle(panel).right)+32;
    const shown={transform:'translateX(0)',opacity:1},offscreen={transform:`translateX(${offset}px)`,opacity:0};
    const motion=panel.animate([previous||(open?offscreen:shown),open?shown:offscreen],{duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:open?380:300,easing:'cubic-bezier(.2,.75,.25,1)',fill:'both'});
    panelMotion=motion;
    motion.finished.then(()=>{if(dead||panelMotion!==motion)return;if(!panelOpen)panel.hidePopover();panel.hidden=!panelOpen;panelMotion=null;motion.cancel();}).catch(()=>{});
  }
  function fieldHTML(f) {
    const value=configs[scene][f.key], id='emergence-'+f.key;
    if(f.type==='choice')return `<div class="emergence-field"><span>${f.label}</span><div class="emergence-segments ${f.key==='shape'?'emergence-shapes':''}" role="group" aria-label="${f.label}">${f.options.map(([v,label])=>`<button type="button" data-emergence-field="${f.key}" data-emergence-value="${v}" aria-pressed="${v===value}">${f.key==='shape'?glyph(v):''}<span>${label}</span></button>`).join('')}</div></div>`;
    return `<div class="emergence-field"><div><label for="${id}">${f.label}</label><output for="${id}">${value}${f.unit||''}</output></div><input id="${id}" type="range" data-emergence-field="${f.key}" min="${f.min}" max="${f.max}" step="${f.step}" value="${value}" style="--fill:${(value-f.min)/(f.max-f.min)*100}%">${f.hint?`<small>${f.hint}</small>`:''}</div>`;
  }
  function draw() {
    const s=SCENES[scene];
    $('.emergence-scenes').innerHTML=allowed().map(id=>`<button type="button" data-emergence-scene="${id}" aria-label="${SCENES[id].name}" aria-pressed="${id===scene}">${sceneArt(id)}<strong>${SCENES[id].name}</strong><small>${id==='birds'?'聚散相随':'引力轨迹'}</small></button>`).join('');
    const group=(name,fields)=>`<section class="emergence-group"><h3>${name}</h3>${fields.map(fieldHTML).join('')}</section>`;
    const appearance=new Set(['shape','depth','pointer','edgeWrap']);
    const appearanceFields=s.basic.filter(f=>appearance.has(f.key));
    const disclosure=(name,fields,note='',footer='',{section='emergence-rule-section',open=false}={})=>`<details class="emergence-group" name="${section}"${open?' open':''}><summary>${name}</summary>${note}${fields.map(fieldHTML).join('')}${footer}</details>`;
    const explorationNote=`<p class="emergence-rules-note">${rulesFor(scene,configs[scene]).join(' · ')}</p>`;
    let rules;
    if(scene==='birds'){
      const field=key=>fieldsFor(scene).find(f=>f.key===key);
      const roleDisclosure=(role,name,fields,open=false,note='',footer='')=>disclosure(name,fields,note,footer,{section:`emergence-${role}-rules`,open});
      const tabs=[['prey','被捕食者'],['predator','捕食者']];
      appearanceFields.push({...field('speed'),hint:'同时影响被捕食者与捕食者的运行速度。'});
      rules=`<div class="emergence-role-tabs emergence-segments" role="tablist" aria-label="配置对象">${tabs.map(([id,label])=>`<button type="button" role="tab" id="emergence-tab-${id}" data-emergence-role="${id}" aria-controls="emergence-role-${id}" aria-selected="${ruleRole===id}" aria-pressed="${ruleRole===id}" tabindex="${ruleRole===id?0:-1}">${label}</button>`).join('')}</div>`+
        `<div id="emergence-role-prey" role="tabpanel" aria-labelledby="emergence-tab-prey" ${ruleRole==='prey'?'':'hidden'}>`+
        roleDisclosure('prey','群体规模',[field('count'),field('replenish')],true)+
        roleDisclosure('prey','群体繁衍',s.lifecycle.find(g=>g.fields.some(f=>f.key==='breeding')).fields)+
        roleDisclosure('prey','探索规则',s.advanced.filter(f=>f.key!=='replenish'),false,explorationNote,`<p>${s.note}</p>`)+`</div>`+
        `<div id="emergence-role-predator" role="tabpanel" aria-labelledby="emergence-tab-predator" ${ruleRole==='predator'?'':'hidden'}>`+
        roleDisclosure('predator','捕食与追逐',[{...field('predators'),label:'捕食者数量'},field('huntSpeed')],true)+
        roleDisclosure('predator','捕食者繁衍',s.lifecycle.find(g=>g.fields.some(f=>f.key==='predatorBreeding')).fields)+
        roleDisclosure('predator','探索规则',[field('captureRadius'),field('huntRest')])+`</div>`;
      rules=`<section class="emergence-role-settings" aria-label="群游对象规则">${rules}</section>`;
    }else{
      const hidden=new Set(['blackHoles','influx','trail']);
      const compact=f=>({...f,hint:f.key==='mutualGravity'?'质量越大，牵引力越大，范围越大':f.key==='orbit'||f.key==='influxBatch'?'':f.hint});
      rules=group('运动节奏',s.basic.filter(f=>!appearance.has(f.key)))+(s.physics||[]).filter(g=>!['质量等级','碰撞演化'].includes(g.title)).map(g=>disclosure(g.title,g.fields.filter(f=>!hidden.has(f.key)).map(compact))).join('')+disclosure('探索规则',s.advanced.filter(f=>!hidden.has(f.key)).map(compact));
    }
    $('.emergence-fields').innerHTML=config.allowCustomize?group('形态与互动',appearanceFields)+rules:'<p class="emergence-managed">此场景使用平台预设参数。</p>';
    $('[data-emergence-action="reset"]').hidden=!config.allowCustomize;
    canvas.setAttribute('aria-label',s.name+'动态场景');
    root.dataset.emergenceScene=scene;
    cosmicStatus();
    onScene({...s,rules:rulesFor(scene,configs[scene])});
    dimensionControls();
  }
  function selectRuleRole(role) {
    if(scene!=='birds'||!['prey','predator'].includes(role)||role===ruleRole)return;
    const scroll=panel.querySelector('.emergence-panel-scroll'),group=panel.querySelector('.emergence-role-settings');
    const scrollTop=scroll.scrollTop;
    // Keep the scroll range intact while the old panel is hidden and the new one appears.
    group.style.minHeight=group.getBoundingClientRect().height+'px';
    ruleRole=role;
    for(const tab of panel.querySelectorAll('[data-emergence-role]')){
      const active=tab.dataset.emergenceRole===role;
      tab.setAttribute('aria-selected',String(active));tab.setAttribute('aria-pressed',String(active));tab.tabIndex=active?0:-1;
      panel.querySelector('#'+tab.getAttribute('aria-controls')).hidden=!active;
    }
    group.style.minHeight='';
    const missingSpace=scrollTop-(scroll.scrollHeight-scroll.clientHeight);
    if(missingSpace>0)group.style.minHeight=(group.getBoundingClientRect().height+missingSpace)+'px';
    scroll.scrollTop=scrollTop;
  }
  function dimensionControls() {
    const threeD=configs[scene].depth==='depth';
    for(const button of panel.querySelectorAll('[data-emergence-field="pointer"]'))button.disabled=threeD&&scene!=='cosmos'&&!['none','magnify'].includes(button.dataset.emergenceValue);
    panel.querySelector('.emergence-orbit-note')?.remove();
    panel.querySelector('.emergence-magnify-note')?.remove();
    panel.querySelector('.emergence-shortcut-note')?.remove();
    const pointerField=panel.querySelector('[data-emergence-field="pointer"]')?.closest('.emergence-field');
    if(threeD)panel.querySelector('[data-emergence-field="depth"]')?.closest('.emergence-field').insertAdjacentHTML('beforeend',`<small class="emergence-orbit-note">${scene==='cosmos'?'移动鼠标牵引或推开 · 拖动时仅环绕观察':'拖动环绕观察 · 3D 模式不启用鼠标驱散与长按加速'}</small>`);
    const current=panel.querySelector('#emergence-current');if(current)current.closest('.emergence-field').hidden=configs[scene].shape!=='fish';
  }
  function updateField(key,value) {
    if(!config.allowCustomize||!fieldsFor(scene).some(f=>f.key===key))return;
    if(key==='depth'||key==='pointer')stopHold();
    configs[scene]=sanitize(scene,{...configs[scene],[key]:value});engine.setConfig(configs[scene]);
    // Preserve the active slider and open disclosures while synchronizing linked caps.
    for(const input of panel.querySelectorAll('input[data-emergence-field]')){input.value=configs[scene][input.dataset.emergenceField];const f=fieldsFor(scene).find(f=>f.key===input.dataset.emergenceField);input.style.setProperty('--fill',`${(Number(input.value)-f.min)/(f.max-f.min)*100}%`);input.previousElementSibling.querySelector('output').textContent=input.value+(f.unit||'');}
    for(const button of panel.querySelectorAll('button[data-emergence-field]'))button.setAttribute('aria-pressed',String(configs[scene][button.dataset.emergenceField]===button.dataset.emergenceValue));
    dimensionControls();
    const rules=rulesFor(scene,configs[scene]);
    const note=panel.querySelector('.emergence-rules-note');if(note)note.textContent=rules.join(' · ');
    onScene({...SCENES[scene],rules});cosmicStatus();
    save();
    if(key==='pointer'){
      if(lastCanvasPointer)engine.setPointer(lastCanvasPointer.x,lastCanvasPointer.y);
      showInteractionStatus();
    }
  }
  function cosmicStatus() {
    const status=panel.querySelector('.emergence-cosmos-status');
    if(status&&engine)status.textContent=`当前 ${engine.particles.length} 颗 · 合并 ${engine.merged} 次 · 碎裂 ${engine.shattered} 次 · 最大质量 ${Math.max(0,...engine.particles.map(p=>p.mass||1)).toFixed(1)}×`;
  }
  const statusTimer=setInterval(cosmicStatus,1000);
  function palette() { engine?.setPalette(color(),document.body.dataset.dark==='true',predatorColor()); }
  async function refresh() {
    if(loading||dead)return;loading=true;
    try {
      const response=await fetch('/api/shiyu/operations',{credentials:'include',cache:'no-store',signal:abort.signal});if(!response.ok)throw Error();
      const next=mergeLegacyContent((await response.json()).emergenceContent);
      if(dead)return;
      if(!next||!Object.keys(SCENES).some(id=>next.scenes?.[id]?.enabled===true))throw Error();
      await loadAccountSettings();if(dead)return;
      if(pendingSave&&accountLoaded)void flushSave();
      if(config&&JSON.stringify(config)===JSON.stringify(next)&&!accountRestored)return;
      const previous=config; config=next;
      const ids=allowed();scene=accountRestored&&ids.includes(saved.scene)?saved.scene:ids.includes(scene)?scene:ids.includes(saved.scene)?saved.scene:ids.includes(config.defaultScene)?config.defaultScene:ids[0];
      for(const id of ids)configs[id]=config.allowCustomize?sanitize(id,{...defaults(id),...(previous?.allowCustomize&&!accountRestored?configs[id]:saved.configs?.[id])}):defaults(id);
      if(configs.cosmos){
        const preset=defaults('cosmos');
        for(const key of ['fragmentMass','rockMass','satelliteMass','planetMass','sourceMass','blackHoleMass','blackHoles','collisions','influx'])configs.cosmos[key]=preset[key];
      }
      accountRestored=false;
      stopHold();
      selectEngine();
      message.hidden=true;opener.hidden=false;draw();playback();
    } catch { if(!dead&&!engine){message.innerHTML='场景配置暂不可用。<button type="button" data-emergence-action="retry">重试</button>';opener.hidden=true;} }
    finally { loading=false; }
  }
  on(opener,'click',()=>toggle(!panelOpen));
  // Capture before canvas orbit handling; let the clicked control keep its normal action and focus.
  on(document,'pointerdown',event=>{
    if(panelOpen&&!event.composedPath().includes(panel)&&!event.composedPath().includes(opener))toggle(false,false);
  },{capture:true});
  on(root,'click',event=>{
    const button=event.target.closest('button');if(!button||!root.contains(button))return;
    if(button.dataset.emergenceAction==='retry'){void refresh();return;}
    if(!engine)return;
    if(button.dataset.emergenceRole){selectRuleRole(button.dataset.emergenceRole);return;}
    if(button.dataset.emergenceScene&&allowed().includes(button.dataset.emergenceScene)){stopHold();scene=button.dataset.emergenceScene;selectEngine();draw();playback();save();$(`[data-emergence-scene="${scene}"]`).focus();}
    if(button.dataset.emergenceField)updateField(button.dataset.emergenceField,button.dataset.emergenceValue);
    switch(button.dataset.emergenceAction){
      case 'close':toggle(false);break;
      case 'restart':stopHold();engine.reset();$('.emergence-save').textContent='已重新开始，参数保持不变';break;
      case 'pause':stopHold();engine.setPaused(!engine.paused);playback();break;
      case 'reset':if(config.allowCustomize){stopHold();configs[scene]=defaults(scene);engine.setScene(scene,configs[scene]);draw();save();}break;
    }
  });
  on(panel,'input',event=>{if(event.target.matches('input[data-emergence-field]'))updateField(event.target.dataset.emergenceField,Number(event.target.value));});
  // Contain native scrolling here instead of invoking the shared home/space gesture.
  for(const type of ['wheel','touchstart','touchmove','touchend'])on(panel,type,event=>event.stopPropagation(),{passive:true});
  on(panel,'keydown',event=>{if(event.key==='Escape'){event.stopPropagation();toggle(false);}});
  on(panel,'keydown',event=>{
    if(!event.target.matches('[data-emergence-role]')||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();event.stopPropagation();
    selectRuleRole(event.key==='Home'?'prey':event.key==='End'?'predator':ruleRole==='prey'?'predator':'prey');
    panel.querySelector(`[data-emergence-role="${ruleRole}"]`).focus({preventScroll:true});
  });
  on(document,'keydown',event=>{
    if(dead||!engine||!root.isConnected||document.hidden||!config.allowCustomize||document.body.dataset.theme!=='emergence'||document.body.dataset.view!=='home')return;
    if(event.defaultPrevented||event.repeat||event.isComposing||event.keyCode===229||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
    if(event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]'))return;
    if(event.target!==document.body&&event.target!==document.documentElement&&!root.contains(event.target))return;
    if(document.querySelector('dialog[open],.dock.open')||[...document.querySelectorAll(':popover-open,[aria-modal="true"]')].some(node=>node!==panel&&node!==interactionStatus&&node.getClientRects().length))return;
    if(event.code==='Space'||event.key===' '){
      if(event.target.closest('button,a,[role="button"]'))return;
      event.preventDefault();event.stopPropagation();stopHold();engine.setPaused(!engine.paused);playback();return;
    }
    if(event.key.toLowerCase()!=='i')return;
    event.preventDefault();event.stopPropagation();toggleMagnifier();
  });
  on(canvas,'pointerdown',event=>{if(!engine||!event.isPrimary||event.button!==0||engine.paused)return;stopHold();heldPointer=event.pointerId;holdTimer=setTimeout(()=>{if(heldPointer!==null&&!document.hidden&&!engine.paused)engine.setBoost(true);},280);});
  on(canvas,'dblclick',event=>{
    if(!engine||event.button!==0)return;
    event.preventDefault();stopHold();engine.setPaused(!engine.paused);playback();
  });
  on(canvas,'contextmenu',event=>{if(engine?.magnifierActive){event.preventDefault();toggleMagnifier(false);}else if(heldPointer!==null)event.preventDefault();});
  on(document,'pointermove',event=>{if(!engine)return;if(event.target!==canvas){lastCanvasPointer=null;engine.clearPointer();stopHold();return;}lastCanvasPointer={x:event.clientX,y:event.clientY};engine.setPointer(event.clientX,event.clientY);});
  on(document,'pointerout',event=>{if(!event.relatedTarget){lastCanvasPointer=null;stopHold();if(engine)engine.clearPointer();}});
  on(window,'pointerup',event=>{stopHold(event);if(engine&&event.pointerType!=='mouse')engine.clearPointer();},{capture:true});
  on(window,'pointercancel',event=>{stopHold(event);if(engine)engine.clearPointer();},{capture:true});
  on(window,'blur',()=>{lastCanvasPointer=null;stopHold();if(engine)engine.clearPointer();});
  on(document,'visibilitychange',()=>{if(document.hidden){stopHold();if(engine)engine.clearPointer();}else void refresh();});
  on(window,'focus',()=>void refresh());
  on(window,'online',()=>void flushSave());
  on(window,'pagehide',()=>void flushSave());
  on(window,'resize',layout);
  const appearance=new MutationObserver(palette);appearance.observe(document.body,{attributes:true,attributeFilter:['data-dark']});appearance.observe(document.documentElement,{attributes:true,attributeFilter:['style']});
  void refresh();
  return () => {clearTimeout(saveTimer);clearTimeout(interactionTimer);interactionStatus.hidePopover();interactionStatus.remove();void flushSave();dead=true;clearInterval(statusTimer);panelMotion?.cancel();panel.hidePopover();stopHold();abort.abort();appearance.disconnect();engine?.destroy();};
}

