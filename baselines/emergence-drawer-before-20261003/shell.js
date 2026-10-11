import { SCENES, fieldsFor, sanitize, migrateSelection, mergeLegacyContent } from './scenes.js';
import { EmergenceEngine } from './engine.js';

const glyph = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${({bird:'<path d="m2 6 9 6 1 7 1-7 9-6-8 11-2 3-2-3Z"/>',fish:'<path d="M3 12c4-6 10-6 14 0-4 6-10 6-14 0Zm14 0 5-4v8Z"/><circle cx="7" cy="11" r=".7"/>',triangle:'<path d="m5 20 7-17 7 17-7-4Z"/>',line:'<path d="m6 18 12-12"/>',dot:'<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>',restart:'<path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/>',pause:'<path d="M9 5v14M15 5v14"/>',play:'<path d="m8 4 12 8-12 8Z"/>',reset:'<path d="M4 12a8 8 0 1 1 4 7M4 6v6h6"/><path d="M12 8v5l3 2"/>'})[name]||''}</svg>`;
const sceneArt = id => `<svg viewBox="0 0 140 66" aria-hidden="true" class="emergence-scene-art">${id==='birds'?'<g fill="currentColor" opacity=".75"><path d="m25 45 10-16-2 14-3-3Z"/><path d="m47 30 10-16-2 14-3-3Z"/><path d="m70 37 12-15-4 14-3-3Z"/><path d="m94 24 13-12-5 12-3-3Z"/><path d="m82 56 9-16-1 14-3-3Z"/><path d="m113 43 11-14-3 13-3-3Z"/></g>':'<g fill="none" stroke="currentColor" opacity=".7"><ellipse cx="70" cy="33" rx="48" ry="15" transform="rotate(-22 70 33)"/><ellipse cx="70" cy="33" rx="27" ry="24" transform="rotate(32 70 33)"/><circle cx="70" cy="33" r="7" fill="currentColor" opacity=".3"/><circle cx="108" cy="14" r="3" fill="currentColor"/><circle cx="46" cy="46" r="2" fill="currentColor"/></g>'}</svg>`;

export function mountEmergence(root, {color, owner, onScene = () => {}}) {
  const abort = new AbortController(), on = (target, type, fn, options = {}) => target.addEventListener(type, fn, {...options, signal:abort.signal});
  const key = 'shiyu-emergence-v1:' + owner;
  let saved = {}; try { saved=JSON.parse(localStorage.getItem(key)||'{}')||{}; } catch {}
  saved=migrateSelection(saved);
  let engine, config, scene, configs={}, dead=false, loading=false, holdTimer, heldPointer=null;
  root.insertAdjacentHTML('afterbegin', '<canvas class="emergence-canvas" aria-label="涌现动态场景"></canvas>');
  root.insertAdjacentHTML('beforeend', `<button type="button" class="emergence-open" aria-label="涌现场景设置" title="场景设置" aria-expanded="false" aria-controls="emergence-panel" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.5" fill="var(--bg)"/><circle cx="15" cy="17" r="2.5" fill="var(--bg)"/></svg></button><aside id="emergence-panel" class="emergence-panel" aria-label="涌现场景设置" hidden><div class="emergence-panel-head"><strong>涌现</strong><button type="button" data-emergence-action="close" aria-label="关闭场景设置">×</button></div><div class="emergence-panel-scroll"><div class="emergence-scenes" role="group" aria-label="选择场景"></div><div class="emergence-fields"></div></div><div class="emergence-panel-foot"><div><button type="button" data-emergence-action="restart">重新开始</button><button type="button" data-emergence-action="pause">暂停</button><button type="button" data-emergence-action="reset">恢复默认</button></div><small class="emergence-save" role="status"></small></div></aside><p class="emergence-error" role="status">正在载入场景…</p>`);
  const $ = selector => root.querySelector(selector), canvas=$('.emergence-canvas'), panel=$('.emergence-panel'), opener=$('.emergence-open'), message=$('.emergence-error');
  panel.querySelector('.emergence-panel-head strong').innerHTML='涌现<small>简单规则，自由生长</small>';
  $('[data-emergence-action="restart"]').innerHTML=glyph('restart')+'<span>重新开始</span>';
  $('[data-emergence-action="reset"]').innerHTML=glyph('reset')+'<span>恢复默认</span>';
  const playback = () => { $('[data-emergence-action="pause"]').innerHTML=glyph(engine?.paused?'play':'pause')+`<span>${engine?.paused?'继续':'暂停'}</span>`; };
  const allowed = () => Object.keys(SCENES).filter(id => config?.scenes?.[id]?.enabled === true);
  const defaults = id => sanitize(id, config.scenes[id].defaults);
  function save() { saved={scene,configs:structuredClone(configs)};try { localStorage.setItem(key,JSON.stringify(saved));$('.emergence-save').textContent='已保存在此浏览器'; } catch { $('.emergence-save').textContent='仅本次有效，浏览器存储不可用'; } }
  function stopHold(event) { if(event?.pointerId!==undefined&&heldPointer!==null&&event.pointerId!==heldPointer)return;clearTimeout(holdTimer);heldPointer=null;engine?.setBoost(false); }
  function layout() { panel.style.top=Math.max(80,(document.querySelector('body>header')?.getBoundingClientRect().bottom||80)+12)+'px'; }
  function toggle(open, focus = true) { stopHold();layout();panel.hidden=!open;opener.setAttribute('aria-expanded',String(open));if(engine)engine.clearPointer();if(focus)(open?$('[data-emergence-action="close"]'):opener).focus({preventScroll:true}); }
  function fieldHTML(f) {
    const value=configs[scene][f.key], id='emergence-'+f.key;
    if(f.type==='choice')return `<div class="emergence-field"><span>${f.label}</span><div class="emergence-segments ${f.key==='shape'?'emergence-shapes':''}" role="group" aria-label="${f.label}">${f.options.map(([v,label])=>`<button type="button" data-emergence-field="${f.key}" data-emergence-value="${v}" aria-pressed="${v===value}">${f.key==='shape'?glyph(v):''}<span>${label}</span></button>`).join('')}</div></div>`;
    return `<div class="emergence-field"><div><label for="${id}">${f.label}</label><output for="${id}">${value}${f.unit||''}</output></div><input id="${id}" type="range" data-emergence-field="${f.key}" min="${f.min}" max="${f.max}" step="${f.step}" value="${value}" style="--fill:${(value-f.min)/(f.max-f.min)*100}%">${f.hint?`<small>${f.hint}</small>`:''}</div>`;
  }
  function draw() {
    const s=SCENES[scene];
    $('.emergence-scenes').innerHTML=allowed().map(id=>`<button type="button" data-emergence-scene="${id}" aria-label="${SCENES[id].name}" aria-pressed="${id===scene}">${sceneArt(id)}<strong>${SCENES[id].name}</strong><small>${id==='birds'?'聚散相随':'引力轨迹'}</small></button>`).join('');
    const group=(name,fields)=>`<section class="emergence-group"><h3>${name}</h3>${fields.map(fieldHTML).join('')}</section>`;
    const appearance=new Set(['shape','depth','pointer']);
    $('.emergence-fields').innerHTML=config.allowCustomize?group('运动节奏',s.basic.filter(f=>!appearance.has(f.key)&&f.key!=='predators'))+group('形态与互动',s.basic.filter(f=>appearance.has(f.key)))+(s.lifecycle?group('捕食者',s.basic.filter(f=>f.key==='predators'))+s.lifecycle.map(g=>`<details class="emergence-group"><summary>${g.title}</summary>${g.fields.map(fieldHTML).join('')}</details>`).join(''):'')+`<details class="emergence-group"><summary>探索规则</summary><p>${s.rules.join(' · ')}</p>${s.advanced.map(fieldHTML).join('')}<p>${s.note}</p></details>`:'<p class="emergence-managed">此场景使用平台预设参数。</p>';
    $('[data-emergence-action="reset"]').hidden=!config.allowCustomize;
    canvas.setAttribute('aria-label',s.name+'动态场景');
    root.dataset.emergenceScene=scene;
    onScene(s);
    dimensionControls();
  }
  function dimensionControls() {
    const threeD=configs[scene].depth==='depth';
    for(const button of panel.querySelectorAll('[data-emergence-field="pointer"]'))button.disabled=threeD&&!['none','magnify'].includes(button.dataset.emergenceValue);
    panel.querySelector('.emergence-orbit-note')?.remove();
    panel.querySelector('.emergence-magnify-note')?.remove();
    if(configs[scene].pointer==='magnify')panel.querySelector('[data-emergence-field="pointer"]')?.closest('.emergence-field').insertAdjacentHTML('beforeend','<small class="emergence-magnify-note">局部放大 2.5 倍 · 移动鼠标观察，不改变运动规则</small>');
    if(threeD)panel.querySelector('[data-emergence-field="depth"]')?.closest('.emergence-field').insertAdjacentHTML('beforeend','<small class="emergence-orbit-note">拖动环绕观察 · 3D 模式不启用鼠标驱散与长按加速</small>');
    const current=panel.querySelector('#emergence-current');if(current)current.closest('.emergence-field').hidden=configs[scene].shape!=='fish';
  }
  function updateField(key,value) {
    if(!config.allowCustomize||!fieldsFor(scene).some(f=>f.key===key))return;
    if(key==='depth')stopHold();
    configs[scene]=sanitize(scene,{...configs[scene],[key]:value});engine.setConfig(configs[scene]);
    // Preserve the active slider and open disclosures while synchronizing linked caps.
    for(const input of panel.querySelectorAll('input[data-emergence-field]')){input.value=configs[scene][input.dataset.emergenceField];const f=fieldsFor(scene).find(f=>f.key===input.dataset.emergenceField);input.style.setProperty('--fill',`${(Number(input.value)-f.min)/(f.max-f.min)*100}%`);input.previousElementSibling.querySelector('output').textContent=input.value+(f.unit||'');}
    for(const button of panel.querySelectorAll('button[data-emergence-field]'))button.setAttribute('aria-pressed',String(configs[scene][button.dataset.emergenceField]===button.dataset.emergenceValue));
    dimensionControls();
    save();
  }
  function palette() { engine?.setPalette(color(),document.body.dataset.dark==='true'); }
  async function refresh() {
    if(loading||dead)return;loading=true;
    try {
      const response=await fetch('/api/shiyu/operations',{credentials:'include',cache:'no-store',signal:abort.signal});if(!response.ok)throw Error();
      const next=mergeLegacyContent((await response.json()).emergenceContent);
      if(dead)return;
      if(!next||!Object.keys(SCENES).some(id=>next.scenes?.[id]?.enabled===true))throw Error();
      if(config&&JSON.stringify(config)===JSON.stringify(next))return;
      const previous=config; config=next;
      const ids=allowed();scene=ids.includes(scene)?scene:ids.includes(saved.scene)?saved.scene:ids.includes(config.defaultScene)?config.defaultScene:ids[0];
      for(const id of ids)configs[id]=config.allowCustomize?sanitize(id,{...defaults(id),...(previous?.allowCustomize?configs[id]:saved.configs?.[id])}):defaults(id);
      stopHold();
      if(engine)engine.setScene(scene,configs[scene]);else engine=new EmergenceEngine(canvas,{scene,config:configs[scene],color:color(),dark:document.body.dataset.dark==='true'});
      message.hidden=true;opener.hidden=false;draw();playback();
    } catch { if(!dead&&!engine){message.innerHTML='场景配置暂不可用。<button type="button" data-emergence-action="retry">重试</button>';opener.hidden=true;} }
    finally { loading=false; }
  }
  on(opener,'click',()=>toggle(panel.hidden));
  // Capture before canvas orbit handling; let the clicked control keep its normal action and focus.
  on(document,'pointerdown',event=>{
    if(!panel.hidden&&!event.composedPath().includes(panel)&&!event.composedPath().includes(opener))toggle(false,false);
  },{capture:true});
  on(root,'click',event=>{
    const button=event.target.closest('button');if(!button||!root.contains(button))return;
    if(button.dataset.emergenceAction==='retry'){void refresh();return;}
    if(!engine)return;
    if(button.dataset.emergenceScene&&allowed().includes(button.dataset.emergenceScene)){stopHold();scene=button.dataset.emergenceScene;engine.setScene(scene,configs[scene]);draw();save();$(`[data-emergence-scene="${scene}"]`).focus();}
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
  on(canvas,'pointerdown',event=>{if(!engine||!event.isPrimary||event.button!==0||engine.paused)return;stopHold();heldPointer=event.pointerId;holdTimer=setTimeout(()=>{if(heldPointer!==null&&!document.hidden&&!engine.paused)engine.setBoost(true);},280);});
  on(canvas,'contextmenu',event=>{if(heldPointer!==null)event.preventDefault();});
  on(document,'pointermove',event=>{if(!engine)return;if(event.target!==canvas){engine.clearPointer();stopHold();return;}engine.setPointer(event.clientX,event.clientY);});
  on(document,'pointerout',event=>{if(!event.relatedTarget){stopHold();if(engine)engine.clearPointer();}});
  on(window,'pointerup',event=>{stopHold(event);if(engine&&event.pointerType!=='mouse')engine.clearPointer();},{capture:true});
  on(window,'pointercancel',event=>{stopHold(event);if(engine)engine.clearPointer();},{capture:true});
  on(window,'blur',()=>{stopHold();if(engine)engine.clearPointer();});
  on(document,'visibilitychange',()=>{if(document.hidden){stopHold();if(engine)engine.clearPointer();}else void refresh();});
  on(window,'focus',()=>void refresh());
  on(window,'resize',layout);
  const appearance=new MutationObserver(palette);appearance.observe(document.body,{attributes:true,attributeFilter:['data-dark']});appearance.observe(document.documentElement,{attributes:true,attributeFilter:['style']});
  void refresh();
  return () => {dead=true;stopHold();abort.abort();appearance.disconnect();engine?.destroy();};
}
