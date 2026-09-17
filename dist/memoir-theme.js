/* Life memoir cover. Photo originals remain in this browser's IndexedDB. */
(() => {
  const MAX=5,INTERVAL=15000,DB='shiyu-memoir-originals';
  const svg=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const edit=svg('<path d="m15 4 5 5M4 20l5-1L20 8a2 2 0 0 0-5-5L4 14v6Z"/>');
  let generation=0,index=0,timer,editor,draft=null,editingOwner=null,editStartIndex=0,musicOwned=false,transitionUntil=0,lastWheel=0,touchY=null;
  const liveURLs=new Map();
  const owner=()=>signed?(prefs.accountProfile?.id||'local-account'):'guest';
  function defaults(){return {auto:true,photos:[
    {id:'memoir-sea',url:'poster-sea.png',title:'那年，海风很轻',text:'后来去过很多地方\n还是记得那天，风吹过的声音'},
    {id:'memoir-road',url:'poster-road.png',title:'去远方的路上',text:'没有急着抵达\n沿途的光，就已经值得收藏'},
    {id:'memoir-night',url:'poster-night.png',title:'总有一盏灯等你',text:'城市慢慢安静下来\n平凡的一天，也有值得记住的瞬间'},
    {id:'memoir-distance',url:'poster-road.png',title:'把日子过成风景',text:'走过的每一步\n都藏着后来想念的自己'},
    {id:'memoir-tide',url:'poster-sea.png',title:'下次，还来这里',text:'海会记得每一次相逢\n我们也会，有新的故事'}]};}
  function album(){if(draft)return draft;const a=(prefs.memoirAlbums??={})[owner()]??=defaults();const base=defaults().photos;while(a.photos.length<MAX)a.photos.push({...base[a.photos.length]});return a;}
  const pendingKeys=new Set();
  function database(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('files');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
  async function fileStore(method,key,value){const db=await database();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('files',method==='get'?'readonly':'readwrite'),request=tx.objectStore('files')[method](...(method==='put'?[value,key]:[key]));let result;request.onsuccess=()=>result=request.result;tx.oncomplete=()=>resolve(result);tx.onerror=tx.onabort=()=>reject(tx.error||new Error('无法保存照片'));});}finally{db.close();}}
  async function source(photo,icon=false){const key=icon?photo.iconKey:photo.key;if(!key)return icon?'':photo.url;if(liveURLs.has(key))return liveURLs.get(key);const blob=await fileStore('get',key);if(!blob)throw new Error('找不到本地照片，请重新选择');if(liveURLs.has(key))return liveURLs.get(key);const url=URL.createObjectURL(blob);liveURLs.set(key,url);return url;}
  function releaseURLs(){for(const url of liveURLs.values())URL.revokeObjectURL(url);liveURLs.clear();}
  function current(){const a=album();index=Math.min(Math.max(index,0),a.photos.length-1);return a.photos[index];}
  function status(message){const el=editor?.open?editor.querySelector('[data-memoir-status]'):document.querySelector('.memoir-status');if(el)el.textContent=message;}
  function schedule(){clearTimeout(timer);if(view!=='home'||effective().theme!=='cinema'||!album().auto||album().photos.length<2||document.hidden||editor?.open)return;timer=setTimeout(()=>{if(document.querySelector('dialog[open]'))schedule();else change(1);},INTERVAL);}
  async function paint(animate=false){
    if(draft){previewEditor();return;}
    const host=document.querySelector('.memoir-cover');if(!host)return;const turn=++generation,photo=current(),a=album();
    host.querySelector('h1').textContent=photo.title;host.querySelector('.memoir-description').textContent=photo.text||'';
    host.querySelector('.memoir-number').textContent=String(index+1).padStart(2,'0')+' / '+String(a.photos.length).padStart(2,'0');
    host.querySelector('.memoir-dots').innerHTML=a.photos.map((p,i)=>`<button aria-label="查看第 ${i+1} 张照片" aria-current="${i===index}" data-memoir-photo="${i}"></button>`).join('');
    try{
      const items=await Promise.all(a.photos.map(async(p,i)=>({src:await source(p),id:p.id,title:p.title,depth:(i-index+a.photos.length)%a.photos.length})));
      if(turn!==generation||!host.isConnected)return;
      const stack=host.querySelector('.memoir-stack'),old=stack.querySelector('.is-front'),oldId=old?.dataset.photoId;
      await Promise.all(items.map(p=>new Promise(resolve=>{const image=new Image();image.onload=image.onerror=resolve;image.src=p.src;if(image.complete)resolve();})));
      if(turn!==generation||!host.isConnected)return;
      const existing=new Map([...stack.children].map(el=>[el.dataset.photoId,el]));
      for(const p of items.sort((x,y)=>y.depth-x.depth)){
        let el=existing.get(p.id);if(!el){el=document.createElement('div');el.className='memoir-print';el.dataset.photoId=p.id;el.innerHTML='<img draggable="false"><span class="memoir-paper-label"></span>';stack.append(el);}
        el.getAnimations().forEach(a=>a.cancel());el.classList.toggle('is-front',p.depth===0);el.style.setProperty('--depth',p.depth);el.style.setProperty('--tilt',[0,-5,4,-8,7][p.depth]+'deg');el.style.zIndex=MAX-p.depth;el.setAttribute('aria-hidden',String(p.depth!==0));el.querySelector('img').src=p.src;el.querySelector('img').alt=p.depth?'':p.title;el.querySelector('span').textContent=String(index+1).padStart(2,'0')+' — 人生拾影';existing.delete(p.id);
      }
      existing.forEach(el=>el.remove());
      if(animate&&old?.isConnected&&oldId!==photo.id&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
        transitionUntil=performance.now()+1050;
        const end=getComputedStyle(old).transform;
        old.animate([{transform:'translate(0,0) rotate(0)',zIndex:8,offset:0},{transform:'translate(-82%,-12%) rotate(-16deg)',zIndex:8,offset:.48},{transform:'translate(-85%,-10%) rotate(-15deg)',zIndex:0,offset:.52},{transform:end,zIndex:0,offset:1}],{duration:1050,easing:'cubic-bezier(.35,0,.2,1)'});
        stack.querySelector('.is-front').animate([{transform:'translate(4px,-6px) rotate(-5deg)'},{transform:'translate(0,0) rotate(0)'}],{duration:950,easing:'cubic-bezier(.25,.7,.25,1)'});
        host.querySelector('.memoir-copy').animate([{opacity:.3},{opacity:1}],{duration:650});
      }
      stack.querySelectorAll('img').forEach(img=>img.onerror=()=>{img.onerror=null;img.src='poster-sea.png';status('图片暂时无法读取，可在右侧编辑中重新选择');});
    }catch(error){if(turn===generation)status(error.message);}
    schedule();
  }
  function change(step){if(performance.now()<transitionUntil)return;const photos=album().photos;index=(index+step+photos.length)%photos.length;paint(true);}
  function stopMusic(){if(musicOwned&&playing)toggleMusic();musicOwned=false;}
  function syncMusic(){const button=document.querySelector('[data-memoir-music]');if(button){button.setAttribute('aria-pressed',String(playing));button.setAttribute('aria-label',playing?'停止音乐':'播放音乐');button.title=playing?'停止音乐':'播放音乐';button.innerHTML=svg('<path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>');}const name=document.querySelector('[data-memoir-track]');if(name){name.textContent=TRACKS[trackIndex].name;name.title='点击切换下一首音乐';}}
  async function toggleSound(){musicOwned=true;await toggleMusic();syncMusic();}
  const previousMusicSync=syncMusicUI;syncMusicUI=function(){previousMusicSync();syncMusic();};
  function mount(){
    const root=document.querySelector('.home-cinema');if(!root)return;
    root.classList.add('home-memoir');root.innerHTML=`<div class="memoir-cover"><div class="memoir-copy"><p class="memoir-eyebrow">人生拾影 <span> / </span> A LIFE IN FRAMES</p><h1></h1><p class="memoir-description"></p><div class="memoir-controls"><button data-memoir-music aria-pressed="false"></button><button data-memoir-track aria-label="切换下一首音乐"></button></div><p class="memoir-status" role="status"></p></div><div class="memoir-photo-area"><button class="memoir-photo-button" aria-label="翻看下一张照片"><span class="memoir-stack"></span></button><button class="memoir-edit" data-memoir-edit aria-label="编辑回忆照片" title="编辑照片与文字">${edit}</button><div class="memoir-caption"><span class="memoir-number"></span><span>点击照片 · 下滑翻看</span><div class="memoir-dots"></div></div></div></div>`;
    const area=root.querySelector('.memoir-photo-area');root.querySelector('.memoir-photo-button').onclick=()=>change(1);
    area.addEventListener('wheel',e=>{if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;e.preventDefault();e.stopPropagation();const now=performance.now();if(Math.abs(e.deltaY)>12&&now-lastWheel>650){lastWheel=now;change(e.deltaY>0?1:-1);}},{passive:false});
    area.addEventListener('touchstart',e=>{touchY=e.touches[0]?.clientY;e.stopPropagation();},{passive:true});area.addEventListener('touchmove',e=>{if(touchY!==null){e.preventDefault();e.stopPropagation();}},{passive:false});area.addEventListener('touchend',e=>{e.stopPropagation();const dy=e.changedTouches[0]?.clientY-touchY;touchY=null;if(Math.abs(dy)>40)change(1);});
    root.querySelector('[data-memoir-music]').onclick=toggleSound;root.querySelector('[data-memoir-track]').onclick=()=>{chooseTrack((trackIndex+1)%TRACKS.length);syncMusic();};root.querySelector('[data-memoir-edit]').onclick=openEditor;
    root.querySelector('.memoir-dots').onclick=e=>{const b=e.target.closest('[data-memoir-photo]');if(b){index=Number(b.dataset.memoirPhoto);paint(true);}};syncMusic();paint();
  }
  async function validateImage(file){if(!['image/jpeg','image/png','image/webp','image/gif','image/avif'].includes(file.type))throw new Error('请选择 JPG、PNG、WebP、GIF 或 AVIF 图片');const bitmap=await createImageBitmap(file);bitmap.close();}
  function chooseFiles(){const input=document.createElement('input');input.type='file';input.accept='image/jpeg,image/png,image/webp,image/gif,image/avif';input.onchange=async()=>{
    const file=input.files[0];if(!file)return;const a=album(),who=owner(),photo=current();let key;
    try{await validateImage(file);key=crypto.randomUUID();await fileStore('put',key,file);pendingKeys.add(key);if(owner()!==who||a!==draft||current()!==photo)throw new Error('编辑状态已变化，请重新选择照片');
      photo.key=key;delete photo.url;drawEditor();
    }catch(error){if(key){pendingKeys.delete(key);fileStore('delete',key).catch(()=>{});}status(error.message||'未能保存图片，请重试');}
  };input.click();}
  function finishEditor(commit){
    if(!draft)return;
    const stored=prefs.memoirAlbums[editingOwner],keys=a=>a.photos.flatMap(p=>[p.key,p.iconKey].filter(Boolean));
    if(commit&&owner()===editingOwner){prefs.memoirAlbums[editingOwner]=draft;persist();}
    const retained=new Set(keys(prefs.memoirAlbums[editingOwner]));
    for(const key of new Set([...keys(stored),...pendingKeys]))if(!retained.has(key))fileStore('delete',key).catch(()=>{});
    pendingKeys.clear();if(!commit)index=editStartIndex;draft=null;editingOwner=null;current();paint(true);
  }
  function openEditor(){clearTimeout(timer);if(!editor){editor=document.createElement('dialog');editor.id='memoir-editor';editor.setAttribute('aria-label','编辑人生拾影');document.body.append(editor);editor.addEventListener('close',()=>{finishEditor(false);schedule();});}
    editingOwner=owner();editStartIndex=index;draft=structuredClone(album());drawEditor();if(!editor.open)editor.showModal();
  }
  async function previewEditor(){if(!draft||!editor)return;const photo=current(),preview=editor.querySelector('.memoir-editor-preview');if(!preview)return;preview.querySelector('b').textContent=photo.title;preview.querySelector('p').textContent=photo.text||'';try{const src=await source(photo);if(!draft||current()!==photo||!preview.isConnected)return;for(const img of editor.querySelectorAll('.memoir-editor-preview img,.memoir-image-upload img')){img.src=src;img.alt=photo.title;}editor.querySelector('.memoir-image-source').textContent=photo.key?'已选择本地照片 · 原图保存在本机':photo.url?.startsWith('http')?photo.url:'默认照片';}catch(e){status(e.message);}}
  function drawEditor(){
    const a=album(),photo=current(),custom=!!photo.key||photo.url!==defaults().photos[index].url;
    editor.innerHTML=`<div class="memoir-editor-heading"><h2>编辑回忆</h2><button data-memoir-close aria-label="关闭编辑">×</button></div><div class="memoir-editor-scroll"><div class="memoir-editor-preview"><div><b></b><p></p></div><img alt=""></div><div class="memoir-editor-tabs" aria-label="选择照片">${a.photos.map((p,i)=>`<button data-memoir-select="${i}" aria-pressed="${i===index}" title="${esc(p.title)}">${String(i+1).padStart(2,'0')}</button>`).join('')}<small>5 / 5</small></div><label>照片标题<input data-memoir-title maxlength="40" value="${esc(photo.title)}"></label><label>这一张的故事<textarea data-memoir-text rows="3" maxlength="240">${esc(photo.text||'')}</textarea></label><button type="button" class="memoir-image-upload" data-memoir-upload aria-label="上传封面图"><img alt=""><span>${edit}点击上传封面图</span></button><p class="memoir-image-source"></p>${custom?'<button data-memoir-reset>恢复默认</button>':''}<label>或使用图片链接<input data-memoir-url type="url" placeholder="https://…" value="${esc(photo.key?'':(photo.url||'').startsWith('http')?photo.url:'')}"></label><p class="memoir-local-note">本地照片保存在当前浏览器，保留原文件。照片框为正方形，居中裁切、等比例铺满。图片链接需联网读取。</p></div><p data-memoir-status role="status"></p><div class="memoir-editor-footer"><label class="memoir-auto-option"><input type="checkbox" role="switch" data-memoir-editor-auto ${a.auto?'checked':''}><span>自动播放（每 15 秒一张）</span></label><button class="primary" data-memoir-done>完成</button></div>`;
    previewEditor();let pendingURL=null,urlRevision=0;
    editor.querySelector('[data-memoir-done]').onclick=async()=>{if(pendingURL&&!await pendingURL)return;if(!draft)return;finishEditor(true);editor.close();};
    editor.querySelector('[data-memoir-reset]')?.addEventListener('click',()=>{a.photos[index]={...defaults().photos[index],id:photo.id};drawEditor();});
    editor.querySelector('[data-memoir-close]').onclick=()=>editor.close();
    editor.querySelectorAll('[data-memoir-select]').forEach(b=>b.onclick=()=>{index=Number(b.dataset.memoirSelect);drawEditor();});
    editor.querySelector('[data-memoir-title]').oninput=e=>{photo.title=e.target.value;previewEditor();};editor.querySelector('[data-memoir-text]').oninput=e=>{photo.text=e.target.value;previewEditor();};
    editor.querySelector('[data-memoir-upload]').onclick=chooseFiles;
    editor.querySelector('[data-memoir-editor-auto]').onchange=e=>{a.auto=e.target.checked;};
    const input=editor.querySelector('[data-memoir-url]');
    const applyURL=async()=>{const revision=++urlRevision,raw=input.value.trim();if(!raw)return true;const who=owner();let url;
      try{url=new URL(raw);if(!['http:','https:'].includes(url.protocol))throw Error();}catch{status('请输入有效的 HTTP 或 HTTPS 图片链接');return false;}
      status('正在读取照片…');
      try{await new Promise((resolve,reject)=>{const img=new Image(),timeout=setTimeout(()=>{img.src='';reject(Error('图片读取超时，请检查链接'));},12000);img.onload=()=>{clearTimeout(timeout);resolve();};img.onerror=()=>{clearTimeout(timeout);reject(Error('链接无法读取为图片，请检查地址'));};img.src=url.href;});if(owner()!==who||a!==draft||current()!==photo||!input.isConnected||revision!==urlRevision)return false;photo.url=url.href;delete photo.key;drawEditor();status('已更新照片');return true;}catch(error){status(error.message);return false;}
    };
    input.onchange=()=>{pendingURL=applyURL();};input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();pendingURL=applyURL();}};
  }
  THEMES.cinema.name='人生拾影';THEMES.cinema.en='A LIFE IN FRAMES';THEME_IDENTITIES.cinema=['人生拾影','lib-Camera'];
  const previousHome=home;home=function(){clearTimeout(timer);generation++;releaseURLs();if(effective().theme!=='cinema'&&effective().theme!=='music')stopMusic();previousHome();if(effective().theme==='cinema')mount();};
  const previousWorkspace=workspace;workspace=function(){clearTimeout(timer);generation++;releaseURLs();stopMusic();previousWorkspace();};
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);stopMusic();}else schedule();});
  if(view==='home'&&effective().theme==='cinema')home();updateHeader();
})();
