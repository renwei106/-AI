// Account-owned avatar selection; IndexedDB stores the actual PNG bytes for offline use.
(() => {
  'use strict';
  const catalogKey='shiyu-avatar-catalog-v1',accountKey=id=>'shiyu-avatar-selection-v1:'+id;
  const pngs=new Map(),inflight=new Map(); let items=[],catalogRequest=null,syncing=null,dialog=null,saveSequence=0,choosing=false;
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch{return fallback}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
  const currentId=()=>signed?String(accountProfile().id||''):'';
  const owns=id=>!!id&&currentId()===id&&read('yiyu-prototype-v1',{}).prefs?.accountProfile?.id===id;
  const gender=value=>['male','female'].includes(value)?value:'private';
  const safeItem=x=>x&&/^[a-z0-9-]{1,100}$/.test(x.id)&&typeof x.name==='string'&&/^\/api\/shiyu\/avatar-assets\/[a-z0-9-]+\.png$/.test(x.imageUrl)&&/^#[a-f0-9]{6}$/i.test(x.color);
  items=read(catalogKey,[]).filter(safeItem);
  const selectedId=()=>String(accountProfile().avatar||'').replace(/^catalog:/,'');
  const find=id=>items.find(x=>x.id===id);
  const eligible=()=>items.filter(x=>x.enabled&&!x.deletedAt&&(gender(accountProfile().gender)==='private'||x.gender==='all'||x.gender===gender(accountProfile().gender))).sort((a,b)=>a.sort-b.sort);
  const dbPromise=new Promise(resolve=>{try{const request=indexedDB.open('shiyu-avatar-images',1);request.onupgradeneeded=()=>request.result.createObjectStore('pngs');request.onsuccess=()=>resolve(request.result);request.onerror=()=>resolve(null);request.onblocked=()=>resolve(null)}catch{resolve(null)}});
  const dbGet=async key=>{const db=await dbPromise;if(!db)return null;return new Promise(resolve=>{try{const q=db.transaction('pngs','readonly').objectStore('pngs').get(key);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>resolve(null)}catch{resolve(null)}})};
  const dbPut=async(key,blob)=>{const db=await dbPromise;if(!db)return false;return new Promise(resolve=>{try{const tx=db.transaction('pngs','readwrite');tx.objectStore('pngs').put(blob,key);tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false);tx.onabort=()=>resolve(false)}catch{resolve(false)}})};
  function refreshImageNodes(url){document.querySelectorAll('img[data-avatar-url]').forEach(img=>{if(img.dataset.avatarUrl===url&&pngs.has(url))img.src=pngs.get(url)})}
  async function cacheImage(item){
    if(!item)return false;const key=item.imageUrl;if(pngs.has(key))return true;if(inflight.has(key))return inflight.get(key);
    const request=(async()=>{let blob=await dbGet(key),saved=!!blob;
      if(!blob){try{const response=await fetch(key,{cache:'force-cache',credentials:'same-origin'});if(!response.ok||!response.headers.get('content-type')?.includes('image/png'))return false;blob=await response.blob();if(blob.size>8*1024*1024)return false;saved=await dbPut(key,blob)}catch{return false}}
      pngs.set(key,URL.createObjectURL(blob));refreshImageNodes(key);return saved;
    })().finally(()=>inflight.delete(key));inflight.set(key,request);return request;
  }
  async function prefetch(list){let index=0;await Promise.all(Array.from({length:3},async()=>{while(index<list.length)await cacheImage(list[index++])}))}
  function imageMarkup(item){void cacheImage(item);return `<img class="shiyu-avatar-image" src="${esc(pngs.get(item.imageUrl)||item.imageUrl)}" data-avatar-url="${esc(item.imageUrl)}" alt="${esc(item.name)}" decoding="async">`}
  const originalMarkup=avatarMarkup;
  avatarMarkup=function(value){const id=String(value||'').replace(/^catalog:/,''),item=find(id);if(item)return imageMarkup(item);if(String(value||'').startsWith('data:')||String(value||'').startsWith('catalog:'))return entityIcon(ACCOUNT_AVATARS[0]);return originalMarkup(value)};
  function paintAccount(){
    const d=document.querySelector('#account-center');if(!d||!signed)return;
    const grid=d.querySelector('.people-avatars');if(grid){grid.classList.add('avatar-catalog-entry');grid.innerHTML=`<button type="button" data-open-avatar-catalog>${avatarMarkup(accountProfile().avatar)}<span>选择头像</span></button>`}
    d.querySelectorAll('.account-avatar,[data-profile-edit="avatar"]>span').forEach(node=>node.innerHTML=avatarMarkup(accountProfile().avatar));
    d.querySelector('#profile-upload')?.closest('label')?.remove();
  }
  const previousCenter=openAccountCenter;
  openAccountCenter=function(...args){previousCenter(...args);paintAccount()};
  function repaint(){updateHeader();paintAccount();if(dialog?.open)paintPicker()}
  async function loadCatalog(){
    if(catalogRequest)return catalogRequest;
    catalogRequest=(async()=>{const response=await fetch('/api/shiyu/avatars',{cache:'no-store'});if(!response.ok)throw Error('头像素材暂时无法加载');const data=await response.json();if(!Array.isArray(data.items))throw Error('头像素材格式无效');items=data.items.filter(safeItem);write(catalogKey,items);repaint();return items})().finally(()=>catalogRequest=null);return catalogRequest;
  }
  function applyLocal(id,record){if(!owns(id))return false;const p=accountProfile();prefs.accountProfile={...p,gender:record.gender,...(record.avatarId?{avatar:'catalog:'+record.avatarId}:String(p.avatar||'').startsWith('catalog:')?{avatar:ACCOUNT_AVATARS[0]}:{})};persist();repaint();return true}
  function recordFor(id){return read(accountKey(id),null)}
  async function sendRecord(id,record){
    const response=await fetch('/api/shiyu/auth/avatar',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:id,avatarId:record.avatarId,gender:record.gender})});
    const result=await response.json();if(!response.ok){const error=Error(result.message||'头像保存失败');error.status=response.status;throw error}if(result.userId!==id)throw Error('头像账号不匹配');return result.profile;
  }
  async function saveSelection(avatarId,nextGender){
    const id=currentId();if(!owns(id)){toast('请先登录');return false}
    const item=find(avatarId);if(avatarId&&avatarId!==selectedId()&&(!item?.enabled||item.deletedAt)){toast('此头像已下架，请重新选择');return false}
    const token=++saveSequence,record={avatarId,gender:gender(nextGender),pending:true,revision:Date.now()+'-'+token};
    const old=recordFor(id),oldProfile={...accountProfile()},cached=await cacheImage(item);
    if(!owns(id)||token!==saveSequence)return false;
    if(!write(accountKey(id),record)){toast('浏览器存储空间不足，请清理后重试');return false}
    applyLocal(id,record);
    try{await sendRecord(id,record);if(owns(id)&&recordFor(id)?.revision===record.revision){write(accountKey(id),{...record,pending:false});toast(cached||!avatarId?'头像设置已保存到账号':'已保存到账号，但图片离线缓存失败')}}
    catch(error){if(!owns(id)||recordFor(id)?.revision!==record.revision)return false;if(error.status){write(accountKey(id),old||{});prefs.accountProfile=oldProfile;persist();repaint();toast(error.message);return false}else toast('已保存在本机，联网后将同步到账号')}
    return true;
  }
  async function syncAccount(){
    const id=currentId();if(!owns(id))return;
    const before=recordFor(id);if(before?.avatarId)applyLocal(id,before);
    if(syncing)return syncing;
    syncing=(async()=>{
      try{
        let profile;
        if(before?.pending){try{profile=await sendRecord(id,before)}catch(error){if(!error.status)throw error;if(!owns(id))return;toast(error.message);const r=await fetch('/api/shiyu/auth/avatar',{credentials:'same-origin',cache:'no-store'});if(!r.ok)return;const d=await r.json();if(d.userId!==id)return;profile=d.profile||{avatarId:'',gender:gender(accountProfile().gender)}}}
        else {const response=await fetch('/api/shiyu/auth/avatar',{credentials:'same-origin',cache:'no-store'});if(!response.ok)return;const data=await response.json();if(data.userId!==id)return;profile=data.profile}
        if(!profile||!owns(id)||recordFor(id)?.revision!==before?.revision)return;
        const record={...profile,pending:false,revision:before?.revision||Date.now()+'-server'};write(accountKey(id),record);applyLocal(id,record);await cacheImage(find(record.avatarId));
      }catch{/* Keep this account's cached selection and PNG when offline. */}
    })().finally(()=>{syncing=null;if(currentId()&&currentId()!==id)void syncAccount()});return syncing;
  }
  function paintPicker(){
    if(!dialog)return;const list=eligible(),chosen=selectedId();
    dialog.innerHTML=`<div class="dialog-heading"><div><h2>选择一个喜欢的自己</h2><p class="avatar-picker-note">${gender(accountProfile().gender)==='private'?'全部头像':gender(accountProfile().gender)==='male'?'男生头像':'女生头像'} · ${list.length} 个选择</p></div><button type="button" data-avatar-close aria-label="关闭头像选择">×</button></div><div class="avatar-honeycomb" role="group" aria-label="头像选择"></div><p class="avatar-picker-status" role="status">选择后保存到你的账号，已缓存的头像可离线显示。</p>`;
    const grid=dialog.querySelector('.avatar-honeycomb'),columns=matchMedia('(max-width:600px)').matches?3:5;let start=0,row=0;
    while(start<list.length){const count=row%2?columns-1:columns,chunk=list.slice(start,start+count),line=document.createElement('div');line.className='avatar-honeycomb-row';line.innerHTML=chunk.map(item=>`<button type="button" class="avatar-hex-choice" data-avatar-choice="${esc(item.id)}" aria-label="${esc(item.name+'，'+item.category)}" aria-pressed="${chosen===item.id}" title="${esc(item.name)}" style="--avatar-color:${item.color}"><span class="avatar-hex-art">${imageMarkup(item)}</span><span class="avatar-choice-name">${esc(item.name)}</span>${chosen===item.id?'<span class="avatar-selected-mark" aria-hidden="true">✓</span>':''}</button>`).join('');grid.append(line);start+=count;row++}
    if(!list.length)grid.innerHTML='<div class="avatar-picker-empty">暂时没有可选头像。<button type="button" data-avatar-retry>重新加载</button></div>';
    dialog.querySelector('[data-avatar-close]').onclick=()=>dialog.close();
    dialog.querySelector('[data-avatar-retry]')?.addEventListener('click',()=>loadCatalog().catch(error=>toast(error.message)));
    dialog.querySelectorAll('[data-avatar-choice]').forEach(button=>{button.disabled=choosing;button.onclick=async()=>{if(choosing)return;choosing=true;const id=button.dataset.avatarChoice;dialog.querySelectorAll('[data-avatar-choice]').forEach(b=>b.disabled=true);try{const ok=await saveSelection(id,accountProfile().gender);if(ok)dialog.close()}finally{choosing=false;if(dialog.open)paintPicker()}}});
    void prefetch(list);
  }
  async function openPicker(){
    if(!currentId()){show('#login');return}
    if(!dialog){dialog=document.createElement('dialog');dialog.id='avatar-catalog-picker';document.body.append(dialog)}
    paintPicker();if(!dialog.open)dialog.showModal();
    try{await loadCatalog()}catch{const status=dialog.querySelector('.avatar-picker-status');if(status)status.textContent=items.length?'当前离线，正在显示本机缓存的头像。':'无法加载头像，请联网后重试。'}
  }
  window.ShiyuAvatars={open:openPicker,changeGender:next=>saveSelection(find(selectedId())?selectedId():'',next),sync:syncAccount,refresh:loadCatalog,items:()=>items,cacheImage,cacheReady:()=>Promise.all([...inflight.values()])};
  window.addEventListener('click',event=>{if(event.target.closest?.('[data-open-avatar-catalog]')){event.preventDefault();event.stopImmediatePropagation();void openPicker()}},true);
  window.addEventListener('shiyu-session-ready',()=>void syncAccount());
  window.addEventListener('shiyu-account-state',()=>{if(!signed){saveSequence++;dialog?.close()}else void syncAccount()});
  window.addEventListener('online',()=>{void loadCatalog().catch(()=>{});void syncAccount()});
  window.addEventListener('storage',event=>{if(event.key===accountKey(currentId())){const record=recordFor(currentId());if(record)applyLocal(currentId(),record)}if(event.key==='yiyu-prototype-v1'&&!owns(currentId())){saveSequence++;dialog?.close()}});
  window.addEventListener('resize',()=>{if(dialog?.open)paintPicker()});
  void loadCatalog().catch(()=>{});void syncAccount();repaint();
})();
