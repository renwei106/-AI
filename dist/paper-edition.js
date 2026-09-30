/* Private newspaper content is loaded from the authenticated server session. */
(()=>{
 let owner='',record={cover:{},edition:{}},generation=0;
 const identity=()=>signed?String(prefs.accountProfile?.id||''):'';
 const defaults=()=>({...PAPER_LIFE_DEFAULTS,editionMasthead0:'日常头条',editionMasthead1:'生活快讯',editionMasthead2:'心情副刊'});
 paperLife=()=>({...defaults(),...(owner&&owner===identity()?record.edition:{})});
 window.paperCoverData=()=>({...defaults(),...(owner&&owner===identity()?record.cover:{})});
 async function load(){const ticket=++generation;owner='';record={cover:{},edition:{}};document.querySelector('[data-account-paper]')?.remove();document.body.classList.remove('paper-edit-active');if(effective().theme==='paper')home();try{const r=await fetch('/api/shiyu/auth/newspaper',{cache:'no-store'});if(!r.ok)return;const v=await r.json();if(ticket!==generation||v.userId!==identity())return;owner=v.userId;record=v.newspaper;if(effective().theme==='paper')home();}catch{}}
 async function edit(section){try{
 const r=await fetch('/api/shiyu/auth/newspaper',{cache:'no-store'});if(r.status===401){toast('请先登录后编辑报纸');show('#login');return;}if(!r.ok)throw Error('暂时无法读取版面');const v=await r.json();if(v.userId!==identity())throw Error('账号已切换，请刷新后重试');owner=v.userId;record=v.newspaper;const id=owner,draft={...defaults(),...record[section]};
 const labels={masthead:'报纸名称',tagline:'报纸副标题',leadLabel:'头条栏目名称',strip:'细头条',title:'大头条',intro:'简介',quote:'页边小记',dailyLabel:'快讯栏目名称',sideLabel:'专栏名称'};
 const keys=section==='cover'?['masthead','strip','title','intro']:Object.keys(draft).filter(k=>k!=='cover');
 const page=document.querySelector(section==='cover'?'.edition-cover':'.newspaper');if(!page||document.body.classList.contains('paper-edit-active'))return;
 page.classList.add('paper-editing');document.body.classList.add('paper-edit-active');
 if(section==='cover')for(const [selector,key] of [[':scope > strong','masthead'],['.edition-cover-rule','strip'],[':scope > b','title'],['.edition-cover-intro','intro']])page.querySelector(selector)?.setAttribute('data-paper-life',key);
 for(const el of page.querySelectorAll('[data-paper-life]')){el.contentEditable='plaintext-only';el.dataset.paperInline=el.dataset.paperLife;el.setAttribute('role','textbox');el.oninput=()=>{draft[el.dataset.paperLife]=el.innerText.slice(0,2000);};}
 const trigger=page.querySelector(section==='cover'?'.edition-cover-edit':'[data-paper-edit]');if(trigger)trigger.hidden=true;
 const art=page.querySelector(section==='cover'?'.edition-cover-art':'.paper-cover,.landscape');let reading=false;
 if(art){const holder=document.createElement('div');holder.className='paper-inline-upload paper-visual-upload';art.before(holder);holder.append(art);const choose=document.createElement('button');choose.type='button';choose.className='paper-upload-cover';choose.textContent='点击更换封面图';holder.append(choose);const file=document.createElement('input');file.type='file';file.accept='image/png,image/jpeg,image/webp';file.hidden=true;holder.append(file);choose.onclick=e=>{e.stopPropagation();file.click();};file.onchange=()=>{const f=file.files[0];if(!f)return;if(!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>3*1024*1024)return toast('请选择 3 MB 以内的 JPG、PNG 或 WebP 图片');reading=true;const reader=new FileReader();reader.onload=()=>{reading=false;if(!page.isConnected)return;draft.cover=reader.result;const img=document.createElement('img');img.src=draft.cover;img.alt='封面预览';img.className='paper-cover';img.style.cssText='width:100%;height:100%;object-fit:cover';if(section==='cover')art.replaceChildren(img);else holder.querySelector('.paper-cover,.landscape')?.replaceWith(img);};reader.onerror=()=>{reading=false;toast('图片读取失败');};reader.readAsDataURL(f);};}
 const actions=document.createElement('div');actions.className='paper-inline-actions';actions.dataset.accountPaper='true';const cancel=document.createElement('button');cancel.textContent='取消';const save=document.createElement('button');save.textContent='保存版面';save.dataset.paperSave='';cancel.dataset.paperCancel='';actions.append(cancel,save);document.body.append(actions);
 const finish=()=>{document.body.classList.remove('paper-edit-active');actions.remove();home();};cancel.onclick=finish;
 save.onclick=async()=>{if(reading)return toast('图片正在读取');if(id!==identity()){finish();return toast('账号已切换，请重新编辑');}save.disabled=true;try{const fields=Object.fromEntries([...keys,'cover'].map(k=>[k,String(draft[k]||'')]));const response=await fetch('/api/shiyu/auth/newspaper',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:id,section,fields})});const result=await response.json();if(!response.ok)throw Error(result.message||'保存失败');if(identity()!==id)return;owner=id;record=result.newspaper;finish();toast('已保存到当前账号');}catch(error){toast(error.message);}finally{save.disabled=false;}};
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
  if(!paper){opened=false;edition=0;return;}
  if(paper.dataset.editionReady)return;
  if(returnToCover){opened=false;edition=0;returnToCover=false;}
  paper.dataset.editionReady='true';
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
  const cover=document.createElement('div');cover.tabIndex=0;cover.setAttribute('role','button');cover.className='edition-cover';cover.setAttribute('aria-label','展开日报');
  const p=paperCoverData();cover.innerHTML=`<span class="edition-cover-date">${esc(dateText())} · DAILY EDITION</span><strong>${esc(p.masthead)}</strong><span class="edition-cover-rule">${esc(p.strip)}</span><b>${esc(p.title)}</b><span class="edition-cover-art" aria-hidden="true">${p.cover?'<img src="'+esc(p.cover)+'" alt="">':landscape('paper')}</span><span class="edition-cover-intro">${esc(p.intro)}</span><span class="edition-open-hint">点击展开今日报纸 <span aria-hidden="true">↗</span></span>`;
  if(coverPresented)cover.style.animation='none';coverPresented=true;stage.prepend(cover);
  const coverEdit=document.createElement('button');coverEdit.type='button';coverEdit.className='edition-cover-edit';coverEdit.textContent='编辑封面版面 ↗';cover.querySelector('.edition-open-hint').append(coverEdit);
  coverEdit.onclick=event=>{event.stopPropagation();if(!busy)void editPaperCover();};
  cover.addEventListener('keydown',event=>{if(event.target===cover&&['Enter',' '].includes(event.key)){event.preventDefault();cover.click();}});
  // These two tree silhouettes look like navigation arrows at the image edges.
  cover.querySelector('.landscape path[stroke]')?.remove();
  const nav=document.createElement('nav');nav.className='edition-nav';nav.setAttribute('aria-label','日报翻版');nav.innerHTML='<button type="button" data-edition-back>↖ 收起报纸</button><div><button type="button" data-edition-prev aria-label="上一版">← 上一版</button><output aria-live="polite"></output><button type="button" data-edition-next aria-label="下一版">下一版 →</button></div><button type="button" data-edition-front>回到头版</button>';stage.append(nav);
  let busy=false;
  const fit=()=>{
   if(!stage.isConnected)return;
   stage.style.top=Math.max(72,document.querySelector('body>header')?.getBoundingClientRect().bottom||86)+'px';
   if(!opened)return;
   paper.style.zoom='1';paper.style.width='100%';
   const available=stage.clientHeight-nav.offsetHeight-12;
   const scale=Math.min(1,available/paper.scrollHeight);
   paper.style.zoom=String(scale);paper.style.width=(100/scale)+'%';
  };
  const update=()=>{
   stage.dataset.open=String(opened);paper.hidden=!opened;cover.hidden=opened;coverEdit.hidden=opened;nav.hidden=!opened;
   for(const el of paper.querySelectorAll('.edition-page'))el.hidden=Number(el.dataset.edition)!==edition;
   nav.querySelector('output').textContent=`0${edition+1} / 03 · ${titles[edition]}`;
   nav.querySelector('[data-edition-prev]').disabled=edition===0;nav.querySelector('[data-edition-next]').disabled=edition===2;
   paper.dataset.edition=String(edition);
   const heading=paper.querySelector('.masthead h1');if(heading){const key='editionMasthead'+edition;heading.textContent=paperLife()[key]||titles[edition];heading.dataset.paperLife=key;}
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
 }
 new MutationObserver(()=>mount()).observe(document.querySelector('#main'),{childList:true,subtree:true});
 mount();
})();



