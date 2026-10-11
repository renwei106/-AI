import {mountSharedAccount} from './shared-account.js';
import {installDesktopPet} from './desktop-pet-host.js';
import {cutoutPage,bindCutout} from './cutout-workspace.js';
import {generateAI,pollGeneration} from './ai-generation.js';
import { loadPlatformSvg } from './platform-icons.js';
import {confirmLeaveWorkspace} from './leave-workspace.js';
import {syncToolDisplay} from './tool-display-sync.js';
import { showDownload } from './download-dialog.js';
import { saveToGroup, newGroupDialog, removeGroupDialog } from './group-dialogs.js';
import { enhanceSelects } from './soft-select.js';
import { readMyIcons, readMyLibrary, saveMyIcons } from './my-icons.js';
import { upcoming, upcomingCover, bindUpcoming } from './coming-soon.js';
import { showLogin } from './login.js';
import { entries } from './catalog.js';
import { icon, needsDarkPreview } from './icons.js';
import { zip } from './zip.js';
import { cover, toolCards, homeBackdrop } from './entrance.js';
import { uiIcon } from './ui.js';
import { loadLibrary, libraryEntry, libraryState, libraryItems, libraryPage, libraryResults } from './library.js';
import { bindLibraryControls } from './library-controller.js';
import { showScreen, settleScreens } from './transition.js';
import { auth, restoreSession, logout, checkActiveSession } from './auth.js';
import { presets, colors, defaults, state, sourceIcons, setScene, setCustomColor, setDimension, toggleLock, generateItems, generationSnapshot, quantities, cfg, filename } from './model.js';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Existing local collections remain untouched while the collection UI is paused.
try{if(localStorage.getItem('lighttools:theme')==='dark')document.body.classList.add('dark');}catch{}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3200);}
const sceneSelected=x=>!state.customScene.trim()&&state.scene===x;
state.screen='cover';
let disposeLibrary=null;
let lastDestination='',batchVersion=0;const savedResults=new Set(),downloadedResults=new Set();
let creationMode='prompt',referenceImage='';
function clearWorkspace(){batchVersion++;state.generating=false;state.items=[];state.selected.clear();savedResults.clear();downloadedResults.clear();render();}
function leaveWorkspace(commit){if(!state.items.length){clearWorkspace();lastDestination='';commit();return;}if(document.querySelector('.leave-dialog'))return;const remaining=state.items.filter(e=>!savedResults.has(e.id)&&!downloadedResults.has(e.id)).length;const message=state.generating?'图标仍在后台生成，离开不会取消已提交的模型调用。返回创建页后可恢复查看。':remaining?`还有 ${remaining} 个图标未保存到我的图标库或下载。确认离开后，当前生成结果将被清空。`:state.items.length?'当前图标已保存或已发起下载。离开后将清空本页结果，已保存的图标不受影响。':'确认离开当前图标创建页面？';confirmLeaveWorkspace(message,()=>{clearWorkspace();lastDestination='';commit();});}

function navigate(destination){const route={cover:'icon',work:'icon/create',library:'icon/library',palette:'color'}[destination]||destination;if(lastDestination==='work'&&destination!=='work'){leaveWorkspace(()=>{location.hash=route;});return;}if(location.hash==='#'+route)route();else location.hash=route;}
function route(){const raw=location.hash.slice(1),aliases={icon:'cover','icon/create':'work','icon/library':'library',color:'palette'};const destination=aliases[raw]||raw;if(lastDestination==='work'&&destination!=='work'){history.replaceState(null,'','#icon/create');leaveWorkspace(()=>{history.replaceState(null,'','#'+raw);route();});return;}lastDestination=destination;const page=upcoming[destination]?destination:destination==='mine'?'mine':destination==='library'?'library':destination==='home'?'home':'studio',screen=destination==='work'?'work':'cover';const changed=state.page!==page,screenChanged=state.screen!==screen;state.page=page;state.screen=screen;if(changed||screenChanged||!$('#theme'))render();else applyScreen(true);}
function requireLogin(){if(auth.user)return true;login();return false;}
function loginPrompt(compact=false){return `<div class="login-prompt"><span class="login-symbol">${icon('shield',30,'#8B72DF')}</span><h2>登录，开始你的创作</h2>${compact?'':'<p>生成、复制和下载图标前，请先登录。<br>验证码验证后自动注册或登录，无需单独注册。</p>'}<button class="primary" data-login>登录 / 注册</button></div>`;}
function accountButtonLabel(){if(!auth.user)return '登录 / 注册';const name=auth.user.name||auth.user.email?.split('@')[0]||'我的账号',initial=name.trim().slice(0,1).toUpperCase()||'拾',avatar=typeof auth.user.avatarUrl==='string'&&/^https:\/\//.test(auth.user.avatarUrl)?`<img src="${esc(auth.user.avatarUrl)}" alt="">`:esc(initial);return `<span class="account-avatar" aria-hidden="true">${avatar}</span><span class="account-name">${esc(name)}</span>`;}
function iconTabs(){if(!['studio','library','mine'].includes(state.page))return '';const active=state.page==='library'?'library':state.page==='studio'&&state.screen==='work'?'work':'cover';return `<nav class="tool-tabs" aria-label="轻图标页面"><button data-nav="cover" class="${active==='cover'?'active':''}">首页</button><button data-nav="library" class="${active==='library'?'active':''}">图标库</button><button data-nav="work" class="${active==='work'?'active':''}">AI 生图</button></nav>`;}
function applyScreen(animate=false){
  document.body.dataset.page=state.page;document.body.dataset.screen=state.screen;
  if(state.page!=='studio'&&state.page!=='cutout')return;
  showScreen(state.screen,animate,state);
}
function openCutoutWorkspace(){if(state.page!=='cutout'||state.screen==='work'||state.transitioning)return;state.screen='work';applyScreen(true);}
function bindCutoutNavigation(){
  for(const id of ['start-cutout','scroll-cutout'])$('#'+id).onclick=openCutoutWorkspace;
  const cover=$('#cover');let wheelTotal=0,lastWheel=0,touchY=null;
  cover.addEventListener('wheel',event=>{if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||event.deltaY<=0||event.target.closest?.('input,button'))return;event.preventDefault();const now=Date.now();if(now-lastWheel>180)wheelTotal=0;lastWheel=now;wheelTotal+=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?window.innerHeight:1);if(wheelTotal>=35)openCutoutWorkspace();},{passive:false});
  cover.addEventListener('touchstart',event=>{touchY=event.touches[0]?.clientY??null;},{passive:true});
  cover.addEventListener('touchend',event=>{const endY=event.changedTouches[0]?.clientY;if(touchY!=null&&endY!=null&&touchY-endY>60)openCutoutWorkspace();touchY=null;},{passive:true});
}
function render(){
  if(disposeLibrary){disposeLibrary();disposeLibrary=null;}
  settleScreens();
  const scrollPosition=window.scrollY,configScroll=$('.config-inner')?.scrollTop||0,galleryScroll=$('.gallery-wrap')?.scrollTop||0;
  document.title=state.page==='home'?'拾隅工具':upcoming[state.page]?.name||'轻图标 · 拾隅工具';
  $('#app').innerHTML=`<header class="immersive-header ${state.page==='home'?'home-header':''}">${state.page==='home'?'':`${['studio','mine','library','palette','cutout','emoji'].includes(state.page)?'<button type="button" class="home-icon" data-shiyu-world aria-label="进入拾隅世界" title="拾隅世界"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M3 14h7a4 4 0 0 0 4-4V3M14 14l7 7"/></svg></button>':''}<div class="brand" ${['studio','mine','library','palette','cutout','emoji'].includes(state.page)?'role="link" tabindex="0" data-material-return title="刷新当前页面"':''} aria-label="${upcoming[state.page]?.name||'轻图标'}"><span class="app-logo">${icon(upcoming[state.page]?.symbol||'sparkles',20,'#8B72DF')}</span><span>${upcoming[state.page]?.name||'轻图标'}</span></div>`}${iconTabs()}<div class="header-right"><button id="theme" aria-label="切换为${document.body.classList.contains('dark')?'浅色':'深色'}模式" title="切换为${document.body.classList.contains('dark')?'浅色':'深色'}模式">${icon(document.body.classList.contains('dark')?'sun':'moon',19)}</button><button class="${auth.user?'account-trigger':'primary'}" id="signin">${accountButtonLabel()}</button></div></header><main class="layout immersive-layout">${state.page==='home'?home():state.page==='mine'?myLibraryPage():state.page==='library'?libraryPage():state.page==='cutout'?upcomingCover('cutout')+`<section class="work-section cutout-work-section" id="work-section" aria-label="轻抠图工作台">${cutoutPage()}</section>`:upcoming[state.page]?upcomingCover(state.page):cover()+`<section class="work-section" id="work-section" aria-label="图标创作工作区">${studio()}</section>`}</main>`;
  bind();enhanceSelects();if(state.page==='studio')renderGallery();applyScreen();
  if($('.config-inner'))$('.config-inner').scrollTop=configScroll;if($('.gallery-wrap'))$('.gallery-wrap').scrollTop=galleryScroll;window.scrollTo({top:scrollPosition,behavior:'instant'});
}
function home(){return `${homeBackdrop()}<section class="welcome"><span class="cover-kicker">SHIYU TOOLS</span><h1>拾隅工具</h1><p>轻图标、轻色卡、轻抠图与轻表情，都在这里。</p></section>${toolCards()}`;}
window.addEventListener('tool-display-updated',()=>{if(state.page==='home')render();});
syncToolDisplay();
function studio(){
  const format=state.format==='PNG'?'PNG':'SVG';
  const ready=creationInputReady(),count=format==='SVG'?1:state.count;
  return `<section class="creation-workbench"><div class="creation-mode-switch" aria-label="创建方式"><button data-create-mode="prompt" class="${creationMode==='prompt'?'selected':''}">提示词生图</button><button data-create-mode="image" class="${creationMode==='image'?'selected':''}">以图生图</button></div><div class="creation-columns"><section class="creation-input-panel"><div class="creation-panel-title"><span>创建</span></div><div class="creation-canvas ${creationMode==='image'?'image-mode':''}"><textarea id="custom-scene" maxlength="600" aria-label="图标描述" placeholder="${creationMode==='image'?'':'描述你想创建的图标，例如：一枚简洁的日历提醒图标'}">${esc(state.customScene)}</textarea>${creationMode==='image'?`<label class="creation-image-upload"><input id="reference-image" type="file" accept="image/png,image/jpeg"><span class="creation-upload-icon">${icon('image',30)}</span>${referenceImage?`<img class="creation-reference-preview" src="${referenceImage}" alt="参考图预览">`:''}<strong>${referenceImage?'更换参考图':'上传参考图'}</strong><small>PNG、JPG</small></label>`:''}<div class="creation-corner-controls"><label>风格<select id="creation-style" aria-label="图标风格"><option value="line" ${state.style==='line'?'selected':''}>线性</option><option value="solid" ${state.style==='solid'?'selected':''}>填充</option></select></label><label>格式<select id="format" data-compact="true" aria-label="输出格式"><option value="SVG" ${format==='SVG'?'selected':''}>SVG</option><option value="PNG" ${format==='PNG'?'selected':''}>PNG</option></select></label><label>数量<select id="creation-count" data-compact="true" aria-label="生成数量" ${format==='SVG'?'disabled':''}><option value="1" ${count===1?'selected':''}>1</option>${format==='PNG'?`<option value="4" ${count===4?'selected':''}>4</option><option value="9" ${count===9?'selected':''}>9</option>`:''}</select></label></div></div></section><button id="generate" class="creation-run ${ready?'':'is-disabled'}" aria-label="开始生成" aria-disabled="${String(!ready)}" title="${ready?'开始生成':creationMode==='image'?'请先上传参考图':'请先输入提示词'}">${uiIcon('right',24)}</button><section class="creation-result-panel"><div class="creation-panel-title"><span>结果</span><small id="result-description">生成 ${count} 个 ${format} 图标</small></div><div class="creation-result-canvas"><div class="gallery" id="gallery"></div><div class="results-tools" id="results-tools" hidden><span id="preview-note"></span></div><div class="selection-bar" id="selection-bar" hidden><span id="selected-count"></span><label class="select-all-compact"><input type="checkbox" id="select-all">全选</label><button id="clear" class="text-button">清空</button><button id="save-mine">${icon('folder',16)} 保存</button><button id="download" class="primary">${icon('download',16)} 下载</button></div><span id="total" hidden>${state.items.length}</span></div></section></div></section>`;
}function sceneHint(){return '场景将填入后台当前提示词版本，由 AI 生成对应图标。';}
function creationInputReady(){return creationMode==='image'?!!referenceImage:!!state.customScene.trim();}
function syncCreationRun(){const button=$('#generate');if(!button)return;const ready=creationInputReady();button.classList.toggle('is-disabled',!ready);button.setAttribute('aria-disabled',String(!ready));button.title=ready?'开始生成':creationMode==='image'?'请先上传参考图':'请先输入提示词';}
function list(){return state.items;}
function selected(){return list().filter(e=>state.selected.has(e.id));}
function emptyState(){return `<div class="creation-empty"><span>${icon('sparkles',42,'#8B72DF')}</span><h2>图标将在这里生成</h2><p>在左侧输入内容，然后点击中间箭头。</p></div>`;}
function renderGallery(){
  if(!auth.user){$('#total').textContent='0';$('#selection-bar').hidden=true;$('#results-tools').hidden=true;$('#gallery').classList.add('is-empty');$('#gallery').innerHTML=loginPrompt(true);$('#gallery [data-login]').onclick=login;return;}
  if(state.generating){$('#gallery').classList.add('is-empty');$('#gallery').innerHTML=loadingCanvas();$('#selection-bar').hidden=true;$('#results-tools').hidden=true;$('#generate').disabled=true;$('#generate').classList.add('is-running');return;}$('#generate').disabled=false;$('#generate').classList.remove('is-running');const a=list();$('#total').textContent=state.items.length;$('#selection-bar').hidden=!a.length;$('#results-tools').hidden=!a.length;
  $('#result-description').textContent=a.length?`${a.length} 个图标 · 点击图标查看详情`:`生成 ${state.format==='PNG'?state.count:1} 个 ${state.format==='PNG'?'PNG':'SVG'} 图标`;
  $('#preview-note').textContent=a.some(e=>needsDarkPreview(cfg(e).color))?'深色底仅用于预览，导出背景透明':'';
  $('#gallery').classList.toggle('is-empty',!a.length);
  $('#gallery').innerHTML=a.length?a.map((e,i)=>{const c=cfg(e);const w=48*c.width/Math.max(c.width,c.height),h=48*c.height/Math.max(c.width,c.height);return `<div class="icon-card ${state.selected.has(e.id)?'checked':''}"><input class="check" type="checkbox" data-check="${e.id}" aria-label="选择${esc(e.name)}" ${state.selected.has(e.id)?'checked':''}><button class="card-more" data-detail="${e.id}" aria-label="查看${esc(e.name)}详情">···</button><button class="icon-open" data-detail="${e.id}" aria-label="查看${esc(e.name)}"><span class="art ${needsDarkPreview(c.color)?'dark-preview':''}">${e.imageUrl?`<img src="${esc(e.imageUrl)}" width="${w}" height="${h}" style="object-fit:contain" alt="">`:icon(e.id,w,c.color,c.style,h)}</span><span class="name">${esc(e.name)}</span><span class="filename">${esc(filename(e,i))}.${(e.format||state.format).toLowerCase()}</span></button></div>`;}).join(''):emptyState();
  const count=selected().length;$('#selected-count').textContent=`已选择 ${count} 个`;$('#download').innerHTML=icon('download',16)+' '+(count?`下载所选 (${count})`:`下载全部 (${a.length})`);
  $('#select-all').checked=a.length>0&&count===a.length;$('#select-all').indeterminate=count>0&&count<a.length;
  document.querySelectorAll('[data-check]').forEach(el=>el.onchange=()=>{el.checked?state.selected.add(el.dataset.check):state.selected.delete(el.dataset.check);renderGallery();});
  document.querySelectorAll('[data-detail]').forEach(el=>el.onclick=()=>detail(a.find(e=>e.id===el.dataset.detail),a.findIndex(e=>e.id===el.dataset.detail)));
}
function updateSceneControls(){
  document.querySelectorAll('[data-scene]').forEach(b=>{b.classList.toggle('selected',sceneSelected(b.dataset.scene));b.setAttribute('aria-pressed',String(sceneSelected(b.dataset.scene)));});
  $('#scene-custom-wrap').classList.toggle('custom-active',!!state.customScene.trim());$('#clear-scene').hidden=!state.customScene;$('#scene-hint').textContent=sceneHint();$('#quantity').value=state.count;$('#quantity-hint').textContent=quantityHint();
}
function updateColorControls(){
  document.querySelectorAll('[data-color]').forEach(b=>{const active=!state.customColor&&b.dataset.color===state.color;b.classList.toggle('on',active);b.setAttribute('aria-pressed',String(active));});
  const invalid=!!state.customColor&&!/^#[0-9a-f]{6}$/i.test(state.customColor);$('#color-custom-wrap').classList.toggle('custom-active',!!state.customColor);$('#hex').setAttribute('aria-invalid',String(invalid));$('#clear-color').hidden=!state.customColor;$('#color').value=state.color;
  $('#color-hint').textContent=invalid?'请输入 # 加六位十六进制数字，或清空恢复默认':state.customColor?'已选择自定义颜色；清空后恢复默认紫色':'白色及浅色图标使用深色预览底，导出仍透明';$('#generate').disabled=invalid;renderGallery();
}
function bind(){
  const worldReturn=document.querySelector('[data-shiyu-world]');if(worldReturn)worldReturn.onclick=()=>{const commit=()=>location.assign('https://shiyubox.com/?page=world&section=materials');if(state.page==='studio'&&state.screen==='work')leaveWorkspace(commit);else commit();};
  const materialReturn=document.querySelector('[data-material-return]');
  if(materialReturn){const go=()=>{const commit=()=>location.reload();if(state.page==='studio'&&state.screen==='work')leaveWorkspace(commit);else commit();};materialReturn.style.cursor='pointer';materialReturn.onclick=go;materialReturn.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}};}

  bindToolCards(document,destination=>navigate(({studio:'icon',palette:'color'}[destination]||destination)));
  mountSharedAccount($('#signin'),{beforeAction:commit=>{if(state.page==='studio'&&state.screen==='work')leaveWorkspace(commit);else commit();},onSessionChange:async()=>{await checkActiveSession();await restoreSession();render();}});
  document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>navigate(b.dataset.nav));
  document.querySelectorAll('[data-destination]').forEach(b=>b.onclick=()=>navigate(b.dataset.destination==='studio'?'cover':b.dataset.destination));
  $('#theme').onclick=()=>{document.body.classList.toggle('dark');try{localStorage.setItem('lighttools:theme',document.body.classList.contains('dark')?'dark':'light');}catch{}render();};if(state.page==='cutout'){bindUpcoming();bindCutoutNavigation();bindCutout(toast,requireLogin);return;}if(upcoming[state.page]){bindUpcoming();return;}if(state.page==='home')return;
  if(state.page==='mine'){bindMyLibrary();return;}if(state.page==='library'){bindLibrary();return;}
  for(const id of ['start-work','scroll-work'])if($('#'+id))$('#'+id).onclick=()=>navigate('work');
  $('#open-library').onclick=()=>navigate('library');$('#library-icon-entry').onclick=()=>navigate('library');
  document.querySelectorAll('[data-platform]').forEach(b=>b.onclick=()=>{const entry=entries.find(e=>e.id===b.dataset.platform);detail({...entry,color:'#8B72DF',style:'line',width:128,height:128},entries.indexOf(entry));});
  document.querySelectorAll('[data-create-mode]').forEach(b=>b.onclick=()=>{creationMode=b.dataset.createMode;render();});
  $('#custom-scene').oninput=e=>{setScene(e.target.value,true);syncCreationRun();};
  if($('#reference-image'))$('#reference-image').onchange=e=>{const file=e.target.files[0];if(!file)return;if(!['image/png','image/jpeg'].includes(file.type)){toast('请上传 PNG 或 JPG 图片');return;}if(file.size>10*1024*1024){toast('参考图不能超过 10 MB');return;}const reader=new FileReader();reader.onload=()=>{referenceImage=reader.result;render();};reader.readAsDataURL(file);};
  if($('#creation-style'))$('#creation-style').onchange=e=>{state.style=e.target.value;};
  if($('#format'))$('#format').onchange=e=>{state.format=e.target.value;state.count=state.format==='PNG'?9:1;state.items=[];state.selected.clear();render();};
  if($('#creation-count'))$('#creation-count').onchange=e=>{state.count=Number(e.target.value);state.items=[];state.selected.clear();render();};
  if($('#generate'))$('#generate').onclick=()=>{if(!creationInputReady()){toast(creationMode==='image'?'请先上传参考图':'请先输入提示词');return;}generate();};
  if($('#select-all'))$('#select-all').onchange=e=>{list().forEach(x=>e.target.checked?state.selected.add(x.id):state.selected.delete(x.id));renderGallery();};
  if($('#clear'))$('#clear').onclick=()=>{state.selected.clear();renderGallery();};
  if($('#download'))$('#download').onclick=downloadOptions;
  if($('#save-mine'))$('#save-mine').onclick=saveCurrent;
  return;
  document.querySelectorAll('[data-style]').forEach(b=>b.onclick=()=>{state.style=b.dataset.style;render();});
  document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{state.customColor='';state.color=b.dataset.color;$('#hex').value='';updateColorControls();});
  $('#color').oninput=e=>{setCustomColor(e.target.value);$('#hex').value=state.customColor;updateColorControls();};$('#hex').oninput=e=>{setCustomColor(e.target.value);updateColorControls();};$('#clear-color').onclick=()=>{setCustomColor('');$('#hex').value='';updateColorControls();$('#hex').focus();};
  for(const axis of ['width','height'])$('#'+axis).onchange=e=>{setDimension(axis,e.target.value);$('#width').value=state.width;$('#height').value=state.height;renderGallery();};$('#lock').onclick=()=>{toggleLock();render();};
  $('#quantity').onchange=e=>{state.count=Number(e.target.value);$('#quantity-hint').textContent=quantityHint();};$('#format').onchange=e=>{state.format=e.target.value;renderGallery();};$('#naming').oninput=e=>{state.naming=e.target.value;renderGallery();};$('#reset').onclick=()=>{Object.assign(state,defaults);render();};
  document.querySelectorAll('[data-name-token]').forEach(button=>button.onclick=()=>{const input=$('#naming'),token='{'+button.dataset.nameToken+'}',current=input.value.trim();input.value=current+(current&&!/[-_ ]$/.test(current)?'-':'')+token;input.dispatchEvent(new Event('input'));input.focus();input.setSelectionRange(input.value.length,input.value.length);});
  $('#generate').onclick=()=>{generate();};
  $('#select-all').onchange=e=>{list().forEach(x=>e.target.checked?state.selected.add(x.id):state.selected.delete(x.id));renderGallery();};$('#clear').onclick=()=>{state.selected.clear();renderGallery();};
  $('#download').onclick=downloadOptions;$('#save-mine').onclick=saveCurrent;
}
function bindToolCards(root,onOpen){root.querySelectorAll('[data-tool-card]:not([aria-disabled="true"])').forEach(card=>{card.onclick=event=>{if(event.target.closest('button'))return;onOpen(card.dataset.toolCard);};card.onkeydown=event=>{if(event.target!==card||!['Enter',' '].includes(event.key))return;event.preventDefault();onOpen(card.dataset.toolCard);};});}
async function bindLibrary(){
  $('#library-custom').onclick=()=>navigate('work');
  const target=$('.library-page');
  $('#library-results').textContent='正在读取平台图标库…';
  try{await loadLibrary();if(!target.isConnected)return;
    target.outerHTML=libraryPage();$('#library-custom').onclick=()=>navigate('work');
    disposeLibrary=bindLibraryControls(async id=>{try{const entry=libraryEntry(id);await loadPlatformSvg(entry);if(state.page!=='library')return;detail({...entry,color:'#8B72DF',style:'line',width:128,height:128,format:'SVG'});}catch(error){toast(error.message);}});
  }catch(error){if(target.isConnected){$('#library-results').textContent=error.message;const retry=document.createElement('button');retry.textContent='重新加载';retry.onclick=bindLibrary;$('#library-results').append(retry);}}

}
function svgSource(e){const c=cfg(e),source=icon(e.id,c.width,c.color,c.style,c.height);return c.strokeWidth?source.replace(/stroke-width="[^"]+"/g,`stroke-width="${c.strokeWidth}"`):source;}
async function raster(e,type='image/png'){
  const c=cfg(e),canvas=document.createElement('canvas');canvas.width=c.width;canvas.height=c.height;const img=new Image(),url=URL.createObjectURL(new Blob([svgSource(e)],{type:'image/svg+xml'}));
  try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});canvas.getContext('2d').drawImage(img,0,0,c.width,c.height);return await new Promise((resolve,reject)=>canvas.toBlob(b=>b&&b.type===type?resolve(b):reject(Error('当前浏览器不支持该导出格式，请选择 PNG')),type));}finally{URL.revokeObjectURL(url);}
}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
async function exported(e,format){if(e.imageUrl){if(format==='SVG')throw Error('AI 生成结果为 PNG，暂不支持 SVG');const r=await fetch(e.imageUrl);if(!r.ok)throw Error('图片读取失败');return r.blob();}return format==='SVG'?new Blob([svgSource(e)],{type:'image/svg+xml'}):raster(e,format==='PNG'?'image/png':'image/webp');}
function detail(e,index=0){
  if(e.imageUrl){if(!requireLogin())return;const d=$('#detail');d.className='icon-dialog';d.innerHTML=`<button class="close">×</button><h2>${esc(e.name)}</h2><div class="large-preview dark-preview"><img src="${esc(e.imageUrl)}" style="max-width:100%;max-height:260px" alt="${esc(e.name)}"></div><p>${e.width} × ${e.height} · 透明 PNG</p><p class="hint">AI 生成原图，保留原始配色与立体明暗。</p><button id="ai-download" class="primary">下载 PNG</button>`;d.querySelector('.close').onclick=()=>d.close();d.querySelector('#ai-download').onclick=async()=>{try{downloadBlob(await exported(e,'PNG'),filename(e,index)+'.png');downloadedResults.add(e.id)}catch(error){toast(error.message)}};d.showModal();return;}

  const detailVersion=batchVersion,generatedId=state.items.includes(e)?e.id:null,format=e.format||state.format,c={...cfg(e)},originalColor='#000000',d=$('#detail'),sizes=[16,24,32,48,64,128,256,512];
  c.color=originalColor;
  if(!sizes.includes(c.width))sizes.push(c.width);sizes.sort((a,b)=>a-b);c.width=24;c.height=24;
  const detailColors=['#000000','#333333','#666666','#999999','#CCCCCC','#FFFFFF','#8B72DF','#547FE7','#53AE9B','#E4A95B','#E57373'];
  d.className='icon-dialog svg-detail-dialog';d.innerHTML=`<button class="close" aria-label="关闭">×</button><div class="svg-detail-heading"><div><span>SVG 图标</span><h2>${esc(e.nameZh||e.name)}</h2><p>${esc(e.name)}</p></div></div><div id="single-preview" class="svg-design-preview ${needsDarkPreview(c.color)?'dark-preview':''}"><span id="single-preview-art" class="svg-preview-art" aria-hidden="true"></span></div><div class="svg-detail-meta"><span id="preview-color-note">${originalColor}</span><span>透明背景${c.style==='threeD'?' · 3D 立体效果':''}</span></div><section class="svg-detail-settings"><div class="svg-inline-control svg-color-control"><span>颜色</span><div class="svg-color-picker"><button id="single-color-trigger" type="button" aria-label="选择颜色" aria-expanded="false" style="--current-color:${originalColor}"><i></i></button><input id="single-hex" aria-label="当前颜色色号" value="${originalColor}" maxlength="7"><div id="single-color-menu" class="svg-color-menu" hidden>${detailColors.map(color=>`<button type="button" data-detail-color="${color}" style="--option-color:${color}" title="${color}" aria-label="${color}"><i></i></button>`).join('')}<label class="custom-color-option" title="自定义颜色"><input type="color" id="single-color" aria-label="自定义颜色" value="${originalColor}"><i></i></label></div></div></div><label class="svg-inline-control svg-size-control"><span>尺寸</span><select id="single-size" aria-label="图标尺寸">${sizes.map(size=>`<option value="${size}" ${size===c.width?'selected':''}>${size} px</option>`).join('')}</select></label><label class="svg-inline-control svg-stroke-control"><span>粗细</span><div><input id="single-stroke" type="range" min="0.5" max="3" step="0.25" value="2" aria-label="线条粗细"><output id="single-stroke-value">2</output></div></label></section><div class="svg-action-row"><div class="svg-split-action"><button id="copy-current">${icon('copy',16)}<span>复制</span></button><select id="copy-format" data-compact="true" data-hover-open="true" aria-label="复制格式"><option value="SVG">SVG</option><option value="PNG">PNG</option></select></div><div class="svg-split-action primary-split"><button id="single" class="primary">${icon('download',16)}<span>下载</span></button><select id="download-format" data-compact="true" data-hover-open="true" aria-label="下载格式"><option value="SVG" ${format==='SVG'?'selected':''}>SVG</option><option value="PNG" ${format==='PNG'?'selected':''}>PNG</option><option value="WEBP" ${format==='WEBP'?'selected':''}>WebP</option></select></div></div>`;
  c.strokeWidth=2;
  const renderSinglePreview=()=>{$('#single-preview-art').innerHTML=svgSource({...c,width:240,height:240});};
  const syncPreviewBackground=color=>{const preview=$('#single-preview');const dark=needsDarkPreview(color);preview.classList.toggle('dark-preview',dark);preview.style.setProperty('--detail-surface',dark?'#262832':'#f7f8fb');preview.style.setProperty('--detail-guide',dark?'rgba(255,255,255,.11)':'rgba(91,82,123,.12)');};
  const updateSingleColor=value=>{const valid=/^#[0-9a-f]{6}$/i.test(value);$('#single-hex').setAttribute('aria-invalid',String(!valid));for(const id of ['single','copy-current'])$('#'+id).disabled=!valid;if(!valid)return;c.color=value.toUpperCase();$('#single-hex').value=c.color;$('#single-color').value=c.color;$('#preview-color-note').textContent=c.color;$('#single-color-trigger').style.setProperty('--current-color',c.color);renderSinglePreview();syncPreviewBackground(c.color);};
  renderSinglePreview();syncPreviewBackground(c.color);
  const colorMenu=$('#single-color-menu'),colorTrigger=$('#single-color-trigger');let colorMenuPinned=false,colorMenuTimer=0;const setColorMenu=open=>{clearTimeout(colorMenuTimer);colorMenu.hidden=!open;colorTrigger.setAttribute('aria-expanded',String(open));};const scheduleColorClose=()=>{colorMenuPinned=false;colorMenuTimer=setTimeout(()=>setColorMenu(false),120);};colorMenu.addEventListener('wheel',event=>event.stopPropagation(),{passive:true});colorTrigger.addEventListener('pointerenter',()=>setColorMenu(true));colorTrigger.addEventListener('pointerleave',scheduleColorClose);colorMenu.addEventListener('pointerenter',()=>setColorMenu(true));colorMenu.addEventListener('pointerleave',scheduleColorClose);colorTrigger.onclick=()=>{colorMenuPinned=!colorMenuPinned;setColorMenu(colorMenuPinned);};d.addEventListener('pointerdown',event=>{if(!event.target.closest('.svg-color-picker')){colorMenuPinned=false;setColorMenu(false);}});
  document.querySelectorAll('[data-detail-color]').forEach(button=>button.onclick=()=>{updateSingleColor(button.dataset.detailColor);colorMenu.hidden=true;colorTrigger.setAttribute('aria-expanded','false');});
  $('#single-color').oninput=event=>updateSingleColor(event.target.value);
  $('#single-hex').oninput=event=>updateSingleColor(event.target.value);
  $('#single-size').onchange=event=>{c.width=Number(event.target.value);c.height=c.width;};
  $('#single-stroke').oninput=event=>{c.strokeWidth=Number(event.target.value);$('#single-stroke-value').value=String(c.strokeWidth);renderSinglePreview();};
  d.querySelector('.close').onclick=()=>d.close();$('#copy-current').onclick=async()=>{if(!requireLogin())return;const copyFormat=$('#copy-format').value;try{if(copyFormat==='SVG'){await navigator.clipboard.writeText(svgSource(c));toast('SVG 已复制');}else{if(!window.ClipboardItem)throw Error();await navigator.clipboard.write([new ClipboardItem({'image/png':raster({...c})})]);toast('PNG 图片已复制');}}catch{toast(copyFormat==='PNG'?'当前浏览器不支持图片复制，请下载 PNG':'浏览器不允许复制，请使用下载');}};
  $('#single').onclick=async()=>{if(!requireLogin())return;const downloadFormat=$('#download-format').value;try{const snapshot={...c};downloadBlob(await exported(snapshot,downloadFormat),filename(snapshot,index)+'.'+downloadFormat.toLowerCase());if(generatedId&&detailVersion===batchVersion)downloadedResults.add(generatedId);}catch(error){toast(error.message||'导出失败，请重试');}};enhanceSelects(d);d.showModal();
}
function login(afterLogin){showLogin(async()=>{await restoreSession();render();if(typeof afterLogin==='function')afterLogin();});}
async function generate(){if(!creationInputReady()){toast(creationMode==='image'?'请先上传参考图':'请先输入提示词');return;}if(!auth.user){login(generate);return;}if(state.generating)return;if(state.width!==state.height){toast('AI 图标请使用 1:1 尺寸');return;}if(state.customColor&&!/^#[0-9a-f]{6}$/i.test(state.customColor)){toast('请填写有效颜色');return;}const settings={scene:state.customScene.trim(),style:state.style,color:state.color,count:state.format==='PNG'?state.count:1,width:state.width,height:state.height,naming:state.naming,referenceImage:creationMode==='image'?referenceImage:''};const version=++batchVersion;state.generating=true;render();const progress=message=>{const small=document.querySelector('.creation-loading small');if(small)small.textContent=message};try{const pending=sessionStorage.getItem('qing:pending-generation');const next=pending?await pollGeneration(pending,progress):await generateAI(settings,progress);if(version!==batchVersion)return;state.items=next;state.selected.clear();savedResults.clear();downloadedResults.clear();toast(next[0]?.source==='library'?`已从图标库匹配 ${next.length} 个图标，未调用 AI`:`已生成 ${next.length} 个图标`);}catch(error){toast(error.message)}finally{if(version===batchVersion){state.generating=false;render();}}}

let exporting=false;
async function batch(recolor=null,overrideFormat=null,snapshot=null){
  if(!requireLogin())return;
  if(exporting)return;const version=batchVersion;const a=(snapshot||(selected().length?selected():list())).map(e=>({...cfg(e),...(recolor?{color:recolor}:{})}));if(!a.length)return;const filenames=a.map(e=>filename(e,list().findIndex(item=>item.id===e.id)));exporting=true;$('#download').disabled=true;$('#download').textContent='正在打包…';
  try{const files=[],names=new Set();for(let i=0;i<a.length;i++){const format=overrideFormat||a[i].format||'SVG',blob=await exported(a[i],format);let name=filenames[i],base=name,j=1;while(names.has(name))name=base+'-'+j++;names.add(name);files.push({name:name+'.'+format.toLowerCase(),data:new Uint8Array(await blob.arrayBuffer())});}downloadBlob(zip(files),'轻图标-图标集.zip');if(version===batchVersion)a.forEach(e=>downloadedResults.add(e.id));toast(`已打包 ${a.length} 个图标`);}catch(e){toast(e.message||'导出失败，请减少数量或尺寸后重试');}finally{exporting=false;if($('#download')){$('#download').disabled=false;renderGallery();}}
}
// Backdrop clicks close every dialog; clicks within dialog padding do not.
for(const dialog of document.querySelectorAll('dialog')){
  let outsideDown=false;
  const outside=event=>{const rect=dialog.getBoundingClientRect();return event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom);};
  dialog.addEventListener('pointerdown',event=>{outsideDown=outside(event);});
  dialog.addEventListener('click',event=>{if(outsideDown&&outside(event))dialog.close();outsideDown=false;});
}
window.addEventListener('beforeunload',event=>{if(lastDestination==='work'&&state.items.length){event.preventDefault();event.returnValue='';}});
window.addEventListener('hashchange',route);
route();
void installDesktopPet({navigate,leave:commit=>lastDestination==='work'?leaveWorkspace(commit):commit(),onLogin:()=>render(),toast});
restoreSession().then(user=>{if(user){render();if(sessionStorage.getItem('qing:pending-generation')&&state.screen==='work')generate();}});

function quantityHint(){return `已选 ${state.count} 个 · 白名单使用 AI，其他用户从图标库匹配`;}
function loadingCanvas(){return `<div class="creation-loading" role="status" aria-live="polite"><div class="design-orbit"><i></i><i></i><span class="changing-glyphs">${['sparkles','heart','palette','leaf'].map((name,i)=>`<span style="--glyph-index:${i}">${icon(name,58,'#9F8BE4')}</span>`).join('')}</span><b>${icon('heart',25,'#C5B4EA')}</b><em>${icon('leaf',27,'#89B8AA')}</em></div><h2>一套好图标，正在成形</h2><p>生成提示词 · 调用千问 · 切图抠图</p><div class="design-progress"><span></span></div><small>正在根据后台流程生成图标，请勿重复提交</small></div>`;}
function downloadOptions(){if(!requireLogin()||!state.items.length||exporting)return;if(state.items.some(e=>e.imageUrl)){batch(null,'PNG');return;}showDownload((selected().length?selected():state.items).map(e=>({...cfg(e)})),batch);}
async function saveCurrent(){if(!requireLogin())return;const items=(selected().length?selected():state.items).map(e=>({...cfg(e)}));const version=batchVersion;if(items.length)await saveToGroup(items,()=>{if(version===batchVersion)items.forEach(e=>savedResults.add(e.id));toast(auth.user.demo?'已保存到演示图标库（仅当前浏览器，未同步云端）':'已保存到我的图标库');});}
function myLibraryPage(){return `<section class="library-page my-library"><div class="library-page-heading"><div><span class="cover-kicker">QING ICONS / MY COLLECTION</span><h1>我的图标库</h1><p>${auth.user?.demo?'演示保存仅保留在当前浏览器，不会同步到真实账号。':'保存自己的创作，随时继续使用。'}</p></div><div class="row"><button data-nav="library">平台图标库</button><button class="primary" data-nav="work">自定义创建</button></div></div><div class="my-group-toolbar"><button id="new-personal-group">＋ 新建分组</button></div><div id="my-library-results" aria-live="polite"><p class="empty">正在读取图标…</p></div></section>`;}
async function bindMyLibrary(){const target=$('#my-library-results');if(!auth.user){$('#new-personal-group').hidden=true;target.innerHTML=loginPrompt();target.querySelector('[data-login]').onclick=login;return;}$('#new-personal-group').onclick=()=>newGroupDialog(bindMyLibrary);try{const {groups,items}=await readMyLibrary();await Promise.all(items.filter(e=>e.id.startsWith('tabler:')||e.id.startsWith('iconsax:')).map(loadPlatformSvg));if(!target.isConnected)return;target.innerHTML=[{id:'',name:'未分组'},...groups].map(group=>{const members=items.map((item,index)=>({...item,index})).filter(item=>item.groupId===group.id);return `<section class="my-icon-group"><div class="my-group-heading"><h2>${icon(group.icon||'folder',21)} ${esc(group.name)} <small>${members.length}</small></h2>${group.id?`<button data-remove-group="${esc(group.id)}">移除分组</button>`:''}</div>${members.length?`<div class="gallery">${members.map(e=>`<button class="library-item ${needsDarkPreview(e.color)?'dark-preview':''}" data-my-icon="${e.index}">${e.imageUrl?`<img src="${esc(e.imageUrl)}" width="42" height="42" alt="">`:icon(e.id,42,e.color,e.style)}<strong>${esc(e.name)}</strong><small>${e.width} × ${e.height} · ${e.format}</small></button>`).join('')}</div>`:'<p class="hint">还没有图标，创作后可以保存到这里。</p>'}</section>`;}).join('');target.querySelectorAll('[data-my-icon]').forEach(button=>button.onclick=()=>detail(items[Number(button.dataset.myIcon)],Number(button.dataset.myIcon)));target.querySelectorAll('[data-remove-group]').forEach(button=>button.onclick=()=>{const group=groups.find(g=>g.id===button.dataset.removeGroup);removeGroupDialog(group,items.filter(e=>e.groupId===group.id).length,bindMyLibrary);});}catch(error){if(target.isConnected)target.textContent=error.message||'读取失败，请稍后重试';}}

function accountMenu(){const d=$('#detail');d.className='account-dialog';d.innerHTML=`<button class="close" aria-label="关闭">×</button><h2>我的账号</h2><p>${auth.user.demo?'本地演示账号':'当前账号已登录'}</p><button id="signout" class="wide">退出登录</button><p id="signout-status" role="status"></p>`;d.querySelector('.close').onclick=()=>d.close();d.querySelector('#signout').onclick=()=>{const perform=async()=>{try{await logout();clearWorkspace();d.close();render();toast('已退出登录');}catch(e){d.querySelector('#signout-status').textContent=e.message;}};if(state.items.length){d.close();leaveWorkspace(perform);}else perform();};d.showModal();}

window.addEventListener('auth-expired',()=>{clearWorkspace();render();toast('登录已失效，请重新登录');});window.addEventListener('focus',checkActiveSession);setInterval(checkActiveSession,30000);
