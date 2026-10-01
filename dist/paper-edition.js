/* Built-in photographs use the same cover field and account storage as uploads. */
const PAPER_IMAGE_PRESETS=Object.freeze([
 {id:'mist',name:'山间薄雾'},
 {id:'reading',name:'窗边阅读'},
 {id:'breakfast',name:'清晨餐桌'}
].map(item=>Object.freeze({...item,src:new URL(`assets/site-icons/paper-photo-${item.id}-v1.webp`,document.currentScript.src).href})));
/* Private newspaper content is loaded from the authenticated server session. */
(()=>{
 let owner='',record={cover:{},edition:{}},generation=0;
 const identity=()=>signed?String(prefs.accountProfile?.id||''):'';
 const defaults=()=>({...PAPER_LIFE_DEFAULTS,editionMasthead0:'日常头条',editionMasthead1:'生活快讯',editionMasthead2:'心情副刊'});
 // Legacy shared content is the starting point for each independently saved page.
 paperLife=(index=0)=>({...defaults(),...(owner&&owner===identity()?(record.editions?.[index]??record.edition):{})});
 window.paperCoverData=()=>({...defaults(),...(owner&&owner===identity()?record.cover:{})});
 async function load(){const ticket=++generation;owner='';record={cover:{},edition:{}};document.querySelector('[data-account-paper]')?.remove();document.querySelector('[data-paper-image-picker]')?.remove();document.body.classList.remove('paper-edit-active');if(effective().theme==='paper')home();try{const r=await fetch('/api/shiyu/auth/newspaper',{cache:'no-store'});if(!r.ok)return;const v=await r.json();if(ticket!==generation||v.userId!==identity())return;owner=v.userId;record=v.newspaper;if(effective().theme==='paper')home();}catch{}}
 async function edit(section){try{
 const page=document.querySelector(section==='cover'?'.edition-cover':'.newspaper');if(!page||document.body.classList.contains('paper-edit-active'))return;
 const editionIndex=section==='edition'?Number(page.dataset.edition):undefined,ticket=generation;
 const r=await fetch('/api/shiyu/auth/newspaper',{cache:'no-store'});if(r.status===401){toast('请先登录后编辑报纸');show('#login');return;}if(!r.ok)throw Error('暂时无法读取版面');const v=await r.json();if(ticket!==generation||v.userId!==identity())throw Error('账号已切换，请刷新后重试');
 if(!page.isConnected||page.hidden||document.body.classList.contains('paper-edit-active')||(section==='edition'&&Number(page.dataset.edition)!==editionIndex))return;
 owner=v.userId;record=v.newspaper;const id=owner,draft=section==='cover'?paperCoverData():paperLife(editionIndex);
 page.classList.add('paper-editing');document.body.classList.add('paper-edit-active');
 if(section==='cover')for(const [selector,key] of [[':scope > strong','masthead'],['.edition-cover-rule','strip'],[':scope > b','title'],['.edition-cover-intro','intro']])page.querySelector(selector)?.setAttribute('data-paper-life',key);
 const editable=[...page.querySelectorAll('[data-paper-life]')].filter(el=>section==='cover'||!el.closest('.edition-page')||Number(el.closest('.edition-page').dataset.edition)===editionIndex);
 const keys=editable.map(el=>el.dataset.paperLife);
 for(const el of editable){el.textContent=draft[el.dataset.paperLife]??'';el.contentEditable='plaintext-only';el.dataset.paperInline=el.dataset.paperLife;el.setAttribute('role','textbox');el.oninput=()=>{draft[el.dataset.paperLife]=el.textContent?el.innerText.slice(0,2000):'';};}
 const trigger=page.querySelector(section==='cover'?'.edition-cover-edit':'[data-paper-edit]');if(trigger){if(section==='edition')trigger.style.visibility='hidden';else trigger.hidden=true;}
 const art=page.querySelector(section==='cover'?'.edition-cover-art':'.edition-page:not([hidden]) .paper-cover,.edition-page:not([hidden]) .landscape');let reading=false,picker=null,imageRequest=0;
 if(art){
  keys.push('cover');const currentImage=section==='cover'?art.querySelector('img'):art;if(currentImage?.tagName==='IMG')currentImage.src=draft.cover||PAPER_IMAGE_PRESETS[0].src;
  const holder=art.parentElement.classList.contains('paper-photo-frame')?art.parentElement:document.createElement('div');
  if(!holder.isConnected){art.before(holder);holder.append(art);}holder.classList.add('paper-inline-upload','paper-visual-upload');
  const choose=document.createElement('button');choose.type='button';choose.className='paper-upload-cover';choose.textContent='选择配图 / 上传图片';holder.append(choose);
  if(section==='edition'){const label=document.createElement('span');label.textContent=choose.textContent;choose.replaceChildren(label);}
  const file=document.createElement('input');file.type='file';file.accept='image/png,image/jpeg,image/webp';file.hidden=true;holder.append(file);
  picker=document.createElement('div');picker.className='paper-image-picker';picker.dataset.paperImagePicker='';picker.setAttribute('popover','auto');picker.setAttribute('role','group');picker.setAttribute('aria-label','选择日报配图');
  picker.innerHTML='<div class="paper-image-heading"><strong>给日报选一张配图</strong><button type="button" data-image-close aria-label="关闭配图选择">×</button></div><p>点选即可预览，也可以上传自己的照片。</p><div class="paper-image-presets">'+PAPER_IMAGE_PRESETS.map(p=>`<button type="button" data-paper-image="${p.id}" aria-pressed="${!draft.cover&&p.id==='mist'}"><img src="${esc(p.src)}" alt="" width="1536" height="1024"><span>${p.name}</span></button>`).join('')+'</div><button type="button" class="paper-image-upload">上传自己的图片 ↗</button><small>推荐横向图片 · JPG、PNG、WebP · 最大 3 MB</small>';
  document.body.append(picker);
  const applyImage=async(source,preset='')=>{
   const ticket=++imageRequest;reading=true;picker.setAttribute('aria-busy','true');
   try{
    const blob=typeof source==='string'?await fetch(source,{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error();return r.blob();}):source;
    if(!['image/png','image/jpeg','image/webp'].includes(blob.type)||blob.size>3*1024*1024)throw Error('请选择 3 MB 以内的 JPG、PNG 或 WebP 图片');
    const value=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
    const img=new Image();img.src=value;await img.decode();
    if(ticket!==imageRequest||!page.isConnected||id!==identity())return;
    draft.cover=value;img.alt=preset?PAPER_IMAGE_PRESETS.find(p=>p.id===preset).name:'封面预览';img.className='paper-cover';img.style.cssText='width:100%;height:100%;object-fit:cover';
    if(section==='cover')art.replaceChildren(img);else holder.querySelector('.paper-cover,.landscape')?.replaceWith(img);
    for(const button of picker.querySelectorAll('[data-paper-image]'))button.setAttribute('aria-pressed',String(button.dataset.paperImage===preset));
    picker.hidePopover();choose.focus({preventScroll:true});
   }catch(error){if(ticket===imageRequest&&page.isConnected)toast(error.message||'图片暂时无法读取，请重试或上传自己的图片');}
   finally{if(ticket===imageRequest){reading=false;picker.removeAttribute('aria-busy');}}
  };
  choose.onclick=e=>{e.stopPropagation();picker.showPopover();const r=choose.getBoundingClientRect(),gap=16;picker.style.left=Math.max(gap,Math.min(r.left,innerWidth-picker.offsetWidth-gap))+'px';picker.style.top=Math.max(gap,Math.min(r.top,innerHeight-picker.offsetHeight-gap))+'px';picker.querySelector('[data-paper-image]')?.focus({preventScroll:true});};
  picker.querySelector('[data-image-close]').onclick=()=>{picker.hidePopover();choose.focus({preventScroll:true});};
  for(const button of picker.querySelectorAll('[data-paper-image]'))button.onclick=()=>void applyImage(PAPER_IMAGE_PRESETS.find(p=>p.id===button.dataset.paperImage).src,button.dataset.paperImage);
  picker.querySelector('.paper-image-upload').onclick=()=>{picker.hidePopover();file.click();};
  file.onchange=()=>{const selected=file.files[0];file.value='';if(selected)void applyImage(selected);};
 }
 const actions=document.createElement('div');actions.className='paper-inline-actions';actions.dataset.accountPaper='true';const cancel=document.createElement('button');cancel.textContent='取消';const save=document.createElement('button');save.textContent='保存版面';save.dataset.paperSave='';cancel.dataset.paperCancel='';actions.append(cancel,save);document.body.append(actions);
 const finish=()=>{++imageRequest;picker?.remove();document.body.classList.remove('paper-edit-active');actions.remove();home();};cancel.onclick=finish;
 save.onclick=async()=>{if(reading)return toast('图片正在读取');if(id!==identity()){finish();return toast('账号已切换，请重新编辑');}save.disabled=true;try{const fields=Object.fromEntries(keys.map(k=>[k,String(draft[k]??'')]));const response=await fetch('/api/shiyu/auth/newspaper',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:id,section,editionIndex,fields})});const result=await response.json();if(!response.ok)throw Error(result.message||'保存失败');if(identity()!==id||ticket!==generation)return;owner=id;record=result.newspaper;finish();toast('已保存到当前账号');}catch(error){toast(error.message);}finally{save.disabled=false;}};
 }catch(error){toast(error.message);}}
 editPaper=()=>edit('edition');window.editPaperCover=()=>edit('cover');
 window.addEventListener('shiyu-account-state',load);window.addEventListener('shiyu-session-ready',()=>{if(owner!==identity())void load();});window.addEventListener('storage',e=>{if(e.key==='yiyu-prototype-v1')void load();});void load();
})();
/* Daily edition: existing editorial fields and persistence remain authoritative. */
(()=>{
 let opened=false,edition=0,returnToCover=false,coverPresented=false;
 const titles=['日常头条','生活快讯','心情副刊'];
 function mount(){
  const paper=document.querySelector('.home-paper .newspaper.paper-life');
  document.body.classList.toggle('paper-reader-active',!!paper);
  if(!paper){document.querySelector('[data-paper-image-picker]')?.remove();opened=false;edition=0;return;}
  if(paper.dataset.editionReady)return;
  if(returnToCover){opened=false;edition=0;returnToCover=false;}
  paper.dataset.editionReady='true';
  const leadPhoto=document.createElement('img');leadPhoto.className='paper-cover';leadPhoto.src=paperLife().cover||PAPER_IMAGE_PRESETS[0].src;leadPhoto.alt=paperLife().cover?'日报配图':PAPER_IMAGE_PRESETS[0].name;
  const photoFrame=document.createElement('div');photoFrame.className='paper-photo-frame';photoFrame.append(leadPhoto);
  paper.querySelector('.paper-lead .paper-cover,.paper-lead .landscape')?.replaceWith(photoFrame);
  const stage=document.createElement('div');stage.className='edition-stage';paper.before(stage);stage.append(paper);
  const original=paper.querySelector('.paper-columns');original.classList.add('edition-page');original.dataset.edition='0';
  const clone=selector=>paper.querySelector(selector)?.cloneNode(true);
  const daily=document.createElement('section');daily.className='edition-page edition-daily';daily.dataset.edition='1';daily.setAttribute('aria-label',titles[1]);
  daily.append(clone('[data-paper-life="dailyLabel"]'));
  const stories=document.createElement('div');stories.className='edition-stories';paper.querySelectorAll('.paper-life-story').forEach(el=>stories.append(el.cloneNode(true)));daily.append(stories,clone('.paper-editor-note'));
  const personal=document.createElement('section');personal.className='edition-page edition-personal';personal.dataset.edition='2';personal.setAttribute('aria-label',titles[2]);
  personal.append(clone('[data-paper-life="sideLabel"]'));
  const columns=document.createElement('div');columns.className='edition-personal-columns';paper.querySelectorAll('.paper-life-column').forEach(el=>columns.append(el.cloneNode(true)));personal.append(columns,clone('[data-paper-life="quote"]'));
  original.after(daily,personal);
  const content=document.createElement('div');content.className='edition-content';original.before(content);content.append(original,daily,personal);
  for(const page of [original,daily,personal]){const data=paperLife(Number(page.dataset.edition));for(const el of page.querySelectorAll('[data-paper-life]'))el.textContent=data[el.dataset.paperLife]??'';}
  const cover=document.createElement('div');cover.tabIndex=0;cover.setAttribute('role','button');cover.className='edition-cover';cover.setAttribute('aria-label','展开日报');
  const p=paperCoverData();cover.innerHTML=`<span class="edition-cover-date">${esc(dateText())} · DAILY EDITION</span><strong>${esc(p.masthead)}</strong><span class="edition-cover-rule">${esc(p.strip)}</span><b>${esc(p.title)}</b><span class="edition-cover-art" aria-hidden="true"><img src="${esc(p.cover||PAPER_IMAGE_PRESETS[0].src)}" alt=""></span><span class="edition-cover-intro">${esc(p.intro)}</span><span class="edition-open-hint">点击展开今日报纸 <span aria-hidden="true">↗</span></span>`;
  if(coverPresented)cover.style.animation='none';coverPresented=true;stage.prepend(cover);
  const coverEdit=document.createElement('button');coverEdit.type='button';coverEdit.className='edition-cover-edit';coverEdit.textContent='编辑封面版面 ↗';cover.querySelector('.edition-open-hint').append(coverEdit);
  coverEdit.onclick=event=>{event.stopPropagation();if(!busy)void editPaperCover();};
  cover.addEventListener('keydown',event=>{if(event.target===cover&&['Enter',' '].includes(event.key)){event.preventDefault();cover.click();}});
  // These two tree silhouettes look like navigation arrows at the image edges.
  cover.querySelector('.landscape path[stroke]')?.remove();
  const nav=document.createElement('nav');nav.className='edition-nav';nav.setAttribute('aria-label','日报翻版');nav.innerHTML='<button type="button" data-edition-back>↖ 收起报纸</button><div><button type="button" data-edition-prev aria-label="上一版">← 上一版</button><output aria-live="polite"></output><button type="button" data-edition-next aria-label="下一版">下一版 →</button></div><button type="button" data-edition-front>回到头版</button>';paper.append(nav);
  let busy=false;
  const fit=()=>{
   if(!stage.isConnected)return;
   const headerBottom=Math.max(72,document.querySelector('body>header')?.getBoundingClientRect().bottom||86);
   stage.style.top=opened?'0px':headerBottom+'px';
   stage.style.setProperty('--edition-header-space',headerBottom+'px');
   if(!opened)return;
   const page=paper.querySelector('.edition-page:not([hidden])');if(!page)return;
   page.style.zoom='1';page.style.width='100%';page.style.setProperty('--edition-page-height','0px');
   const scale=innerWidth>760?Math.max(.78,Math.min(1,content.clientHeight/Math.max(1,page.scrollHeight))):1;
   page.style.zoom=String(scale);
   page.style.setProperty('--edition-page-height',(content.clientHeight/scale)+'px');
  };
  const update=()=>{
   stage.dataset.open=String(opened);paper.hidden=!opened;cover.hidden=opened;coverEdit.hidden=opened;nav.hidden=!opened;
   for(const el of paper.querySelectorAll('.edition-page'))el.hidden=Number(el.dataset.edition)!==edition;
   nav.querySelector('output').textContent=`0${edition+1} / 03 · ${titles[edition]}`;
   nav.querySelector('[data-edition-prev]').disabled=edition===0;nav.querySelector('[data-edition-next]').disabled=edition===2;
   paper.dataset.edition=String(edition);
   content.scrollTop=0;
   const data=paperLife(edition),heading=paper.querySelector('.masthead h1');if(heading){const key='editionMasthead'+edition;heading.textContent=data[key]??titles[edition];heading.dataset.paperLife=key;}
   for(const el of paper.querySelectorAll('[data-paper-life="tagline"],[data-paper-life="strip"]'))el.textContent=data[el.dataset.paperLife]??'';
   fit();
  };
  const motion=async(el,frames,duration)=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;await el.animate(frames,{duration,easing:'cubic-bezier(.25,.65,.25,1)',fill:'none'}).finished;};
  const turn=async(next)=>{
   if(busy||next===edition||next<0||next>2)return;
   if(paper.classList.contains('paper-editing')){toast('请先保存或取消当前版面编辑');return;}
   busy=true;const direction=next>edition?-1:1;
   try{
    await motion(paper,[{transform:'rotateY(0deg)'},{transform:`rotateY(${direction*88}deg)`,filter:'brightness(.7)'}],300);
    edition=next;update();
    await motion(paper,[{transform:`rotateY(${-direction*88}deg)`,filter:'brightness(.7)'},{transform:'rotateY(0deg)',filter:'brightness(1)'}],360);
   }finally{busy=false;}
  };
  cover.onclick=async()=>{if(busy||cover.classList.contains('paper-editing'))return;busy=true;
   const start=cover.getBoundingClientRect();
   await motion(cover,[{transform:'rotate(-4deg) rotateY(0deg)'},{transform:'rotate(-2deg) rotateY(-85deg) scale(1.08)',filter:'brightness(.7)'}],360);
   opened=true;update();const end=paper.getBoundingClientRect();
   await motion(paper,[{transform:`translate(${start.left+start.width/2-end.left-end.width/2}px,${start.top+start.height/2-end.top-end.height/2}px) rotateY(85deg) scale(${start.width/end.width},${start.height/end.height})`,filter:'brightness(.7)'},{transform:'translate(0,0) rotateY(0deg) scale(1)',filter:'brightness(1)'}],560);
   busy=false;nav.querySelector('[data-edition-next]').focus({preventScroll:true});};
  nav.querySelector('[data-edition-prev]').onclick=()=>turn(edition-1);nav.querySelector('[data-edition-next]').onclick=()=>turn(edition+1);nav.querySelector('[data-edition-front]').onclick=()=>turn(0);
  nav.querySelector('[data-edition-back]').onclick=()=>{if(paper.classList.contains('paper-editing')){toast('请先保存或取消当前版面编辑');return;}opened=false;edition=0;update();cover.focus({preventScroll:true});};
  stage.addEventListener('keydown',e=>{if(!opened||e.target.closest('[contenteditable],input,textarea')||document.querySelector('dialog[open]'))return;if(e.key==='ArrowRight'){e.preventDefault();turn(edition+1);}if(e.key==='ArrowLeft'){e.preventDefault();turn(edition-1);}});
  // Newspaper scrolling never triggers the site's page-to-space wheel gesture.
  stage.addEventListener('wheel',e=>e.stopPropagation(),{passive:true});
  update();
  const resize=()=>fit();window.addEventListener('resize',resize);
  const observer=new ResizeObserver(()=>{if(!stage.isConnected){observer.disconnect();window.removeEventListener('resize',resize);return;}fit();});observer.observe(stage);
  paper.querySelectorAll('img').forEach(img=>img.addEventListener('load',fit,{once:true}));
  void document.fonts.ready.then(fit);
 }
 new MutationObserver(()=>mount()).observe(document.querySelector('#main'),{childList:true,subtree:true});
 mount();
})();



