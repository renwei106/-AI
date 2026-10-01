import {createMemoCarousel} from './assets/memo-paper/carousel.js';

const icon = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const bin = icon('<g class="memo-bin-lid"><path d="M4 7h16M9 7V4h6v3"/></g><path d="M6 7l1 14h10l1-14M10 11v6m4-6v6"/>');
const arrow = icon('<path d="m14 6-6 6 6 6"/>');
const plus = icon('<path d="M12 5v14M5 12h14"/>');
const restoreIcon = icon('<path d="M8 5 4 9l4 4M4 9h9a6 6 0 1 1 0 12h-3"/>');
const closeIcon = icon('<path d="m6 6 12 12M18 6 6 18"/>');
const archiveIcon = icon('<path d="M4 8h16v12H4zM3 4h18v4H3zM9 12h6"/>');
const star = icon('<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8L12 2Z" fill="currentColor" stroke="none"/>');
const COLORS = [
  ['theme','跟随主题','var(--accent)'],
  ['gray','灰色','#8b9097'],['red','红色','#c35f64'],['green','绿色','#5c956e'],
  ['orange','橙色','#d89245'],['blue','蓝色','#598fc4'],['purple','紫色','#9670ba']
];
// Old saved color labels map to the nearest of the six current choices.
const LEGACY_COLORS={default:'theme',coral:'red',pink:'red',yellow:'orange',lime:'green',teal:'green',indigo:'blue'};
const PAGE_SIZE = 12;
const TEXT_LIMITS={title:20,content:300};
const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter('zh',{granularity:'grapheme'}):null;
const characters=value=>segmenter?[...segmenter.segment(value)].map(part=>part.segment):Array.from(value);
function limitEdit(value,previous,limit){
  const next=characters(value),before=characters(previous);if(next.length<=limit)return value;
  let start=0,end=0;
  while(start<before.length&&start<next.length&&before[start]===next[start])start++;
  while(end<before.length-start&&end<next.length-start&&before[before.length-1-end]===next[next.length-1-end])end++;
  return [...next.slice(0,start),...next.slice(start,start+Math.max(0,limit-start-end)),...next.slice(next.length-end)].join('');
}

// The app passes the actual 我的常用 playCardSound function. Standalone review
// uses its identical dry ratchet synthesis, without loading account code.
function previewSound() {
  let ctx, noise;
  return {
    play() {
      try {
        const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
        ctx??=new Audio();if(ctx.state==='closed')return;
        const t=ctx.currentTime,level=ctx.state==='suspended'?.48:1;
        const hit=ctx.createOscillator(),envelope=ctx.createGain();hit.type='triangle';hit.frequency.setValueAtTime(1450,t);hit.frequency.exponentialRampToValueAtTime(420,t+.025);envelope.gain.setValueAtTime(.001,t);envelope.gain.linearRampToValueAtTime(.055*level,t+.002);envelope.gain.exponentialRampToValueAtTime(.001,t+.045);hit.connect(envelope).connect(ctx.destination);hit.start(t);hit.stop(t+.05);hit.onended=()=>{hit.disconnect();envelope.disconnect();};
        if(!noise){noise=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.045),ctx.sampleRate);const samples=noise.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;}
        const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=noise;filter.type='highpass';filter.frequency.value=1800;gain.gain.setValueAtTime(.018*level,t);gain.gain.exponentialRampToValueAtTime(.001,t+.035);source.connect(filter).connect(gain).connect(ctx.destination);source.start(t);source.stop(t+.045);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
        if(ctx.state==='suspended')ctx.resume().catch(()=>{});
      }catch{}
    },
    dispose(){if(ctx&&ctx.state!=='closed')ctx.close().catch(()=>{});}
  };
}

export function mountMemoPaper(root, api) {
  const state=Object.assign({view:'notes',page:0,active:1},api.state);
  const library=api.library,esc=api.escape;
  // Number unassigned records by creation time, independently of list order.
  // Legacy records without a creation time keep their original insertion order.
  // A monotonic counter survives sorting, restore and permanent deletion.
  let lastNumber=Math.max(Number(library.lastNumber)||0,...library.notes.map(n=>Number(n.number)||0)),numbered=false;
  const usedNumbers=new Set();
  const createdAt=note=>Number.isFinite(Number(note.createdAt))&&Number(note.createdAt)>0?Number(note.createdAt):0;
  for(const note of [...library.notes].reverse().sort((a,b)=>createdAt(a)-createdAt(b))){
    if(!Number.isSafeInteger(note.number)||note.number<1||usedNumbers.has(note.number)){note.number=++lastNumber;numbered=true;}
    usedNumbers.add(note.number);
  }
  if(library.lastNumber!==lastNumber){library.lastNumber=lastNumber;numbered=true;}if(numbered)void api.save();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const signal=new AbortController(),sound=api.playSound?null:previewSound();
  let savingMemo=false;
  async function saveChanges(){savingMemo=true;try{return (await api.save())!==false&&isCurrent();}finally{savingMemo=false;}}
  let engine,disposed=false,busy=false,selectedId=null,editorIsTrash=false,editorIsArchived=false,confirmIds=null,archiveRenderKey='';
  let editorMode='preview',colorNoteId=null,colorAnchor=null,colorCloseTimer;
  let carousel,generation=0,fallback=false,drag=null,suppressClick=false,focusReturn=null,viewReady=0,wheelSwitch=false;
  let activeNotes=[],currentTrash=[],animations=[];
  let draft=null,editorClosing=false,editorMotion=null,editorCoverMotion=null,compositionBefore=null;
  const isolated=new Map();
  // Keep the existing creation order; visible ordinals are derived separately
  // from the current deck so discarding / restoring never leaves a gap.
  const ordered=()=>{const ranks=new Map((library.cardOrder||[]).map((id,i)=>[id,i]));return [...library.notes].sort((a,b)=>{
    const ar=ranks.get(a.id),br=ranks.get(b.id);return ar===undefined&&br===undefined?b.number-a.number:ar===undefined?-1:br===undefined?1:ar-br;
  });};
  const live=()=>ordered().filter(n=>!n.deletedAt&&!n.archivedAt),trash=()=>library.notes.filter(n=>n.deletedAt&&!n.archivedAt);
  const archived=()=>library.notes.filter(n=>n.archivedAt&&!n.deletedAt).sort((a,b)=>b.archivedAt-a.archivedAt||b.number-a.number);
  const isCurrent=()=>!disposed&&(!api.isCurrent||api.isCurrent());
  const playSound=()=>api.playSound?api.playSound():sound.play();
  root.className='memo-paper-app';
  root.innerHTML=`<header class="memo-paper-heading"><div><h2><button type="button" data-corner-next-theme title="点击切换主题">${esc(api.title)}</button></h2><p>${esc(api.subtitle)}</p></div></header>
    <nav class="memo-view-tabs" aria-label="小记视图"><button type="button" data-memo-view="notes">我的小记 <span data-memo-count="notes"></span></button><button type="button" data-memo-view="archive">已归档 <span data-memo-count="archive"></span></button><button type="button" data-memo-view="trash">废纸团 <span data-memo-count="trash"></span></button></nav>
    <div class="memo-paper-surface"><div class="memo-paper-canvas" aria-label="丢弃的纸团，点击进入垃圾桶，再次点击展开"></div><div class="memo-card-deck" aria-label="小记卡牌，可滚动或拖动翻阅"></div><div class="memo-paper-empty" hidden><span>${bin}</span><p>垃圾桶空空的</p><small>丢掉的念头，会暂时留在这里</small></div><div class="memo-paper-fallback" hidden></div><div class="memo-paper-edit-slot"></div><p class="memo-paper-status" role="status" hidden></p><span class="memo-paper-focus" hidden></span></div>
    <footer class="memo-paper-footer"><div class="memo-paper-navigation"><button type="button" data-memo-step="-1" aria-label="上一张">${arrow}</button><span data-memo-position></span><button type="button" data-memo-step="1" aria-label="下一张">${arrow}</button></div><div class="memo-page-controls" hidden></div><button type="button" class="memo-bin-action" data-memo-pour hidden>${bin}<span>倾倒垃圾桶</span></button></footer>
    <button type="button" class="memo-archive-dock" data-memo-archive-toggle aria-expanded="false" aria-controls="memo-archive-shelf" aria-label="展开已归档的小记"><span class="memo-archive-mini" aria-hidden="true"></span></button>
    <section id="memo-archive-shelf" class="memo-archive-shelf" aria-label="已归档的小记" hidden><div class="memo-archive-grid"></div></section>
    <div class="memo-paper-access" aria-label="选择已丢弃的小记"></div><div class="memo-confirm-slot"></div><div id="memo-color-palette" class="memo-color-popover" role="dialog" aria-label="选择卡牌颜色" hidden><span class="memo-color-caption">给小记一个颜色</span><div>${COLORS.map(([id,name,color])=>`<button type="button" data-memo-color="${id}" title="${name}" aria-label="${name}" aria-pressed="false" style="--swatch:${color}"><span>${id==='theme'?icon('<path d="M19 8a7 7 0 0 0-12-2L4 9m0-5v5h5M5 16a7 7 0 0 0 12 2l3-3m0 5v-5h-5"/>'):''}</span></button>`).join('')}</div></div>`;
  const q=selector=>root.querySelector(selector);
  const host=q('.memo-paper-canvas'),deck=q('.memo-card-deck'),status=q('.memo-paper-status'),surface=q('.memo-paper-surface');
  const cardFor=id=>[...deck.children].find(card=>card.dataset.noteId===id);
  const colorFor=note=>COLORS.find(([id])=>id===(LEGACY_COLORS[note.color]||note.color))||COLORS[0];
  const paperNote=note=>({...note,paperColor:colorFor(note)[0]==='theme'?getComputedStyle(root).getPropertyValue('--accent').trim():colorFor(note)[2]});
  function paintNote(element,note){
    const [id,,color]=colorFor(note);element.dataset.memoColor=id;
    element.style.setProperty('--memo-tint',color);
  }
  function closeColors(returnFocus=false){
    clearTimeout(colorCloseTimer);
    if(returnFocus)colorAnchor?.focus({preventScroll:true});
    q('.memo-color-popover').hidden=true;colorAnchor?.setAttribute('aria-expanded','false');
    colorNoteId=null;colorAnchor=null;
  }
  function openColors(anchor){
    if(!isCurrent()||busy||selectedId||state.view!=='notes')return;
    const note=library.notes.find(n=>n.id===anchor.dataset.memoColorTrigger);if(!note||note.deletedAt||note.archivedAt)return;
    clearTimeout(colorCloseTimer);colorAnchor?.setAttribute('aria-expanded','false');
    colorAnchor=anchor;colorNoteId=note.id;anchor.setAttribute('aria-expanded','true');
    const popover=q('.memo-color-popover');popover.hidden=false;
    q('.memo-color-caption').textContent=colorFor(note)[0]==='theme'?'跟随主题':'小记颜色 · '+colorFor(note)[1];
    for(const button of popover.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.memoColor===colorFor(note)[0]));
    const rect=anchor.getBoundingClientRect(),bounds=root.getBoundingClientRect();
    popover.style.left=Math.max(12,Math.min(rect.left-bounds.left-10,bounds.width-popover.offsetWidth-12))+'px';
    popover.style.top=Math.max(12,Math.min(rect.bottom-bounds.top+8,bounds.height-popover.offsetHeight-12))+'px';
  }
  async function changeColor(id){
    if(!COLORS.some(color=>color[0]===id))return;
    const note=library.notes.find(n=>n.id===colorNoteId);if(!note||note.deletedAt||note.archivedAt)return;
    note.color=id;
    if(!await saveChanges()){if(!isCurrent())return;setBusy(false);renderCards();return;}paintNote(cardFor(note.id),note);
    if(!colorAnchor||!colorNoteId)return;
    q('.memo-color-caption').textContent=id==='theme'?'跟随主题':'小记颜色 · '+colorFor(note)[1];
    colorAnchor.setAttribute('aria-label',`小记颜色：${colorFor(note)[1]}，悬停选择颜色`);
    for(const button of q('.memo-color-popover').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.memoColor===id));
  }
  function backgroundColor(){
    const swatch=document.createElement('span');swatch.style.color='var(--bg)';root.append(swatch);
    const color=getComputedStyle(swatch).color;swatch.remove();
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
    const context=canvas.getContext('2d');context.fillStyle=color;context.fillRect(0,0,1,1);
    const rgba=context.getImageData(0,0,1,1).data;return `rgb(${rgba[0]},${rgba[1]},${rgba[2]})`;
  }
  function setBusy(value){
    busy=value;root.classList.toggle('is-busy',value);root.setAttribute('aria-busy',String(value));
    for(const button of root.querySelectorAll('button'))button.disabled=value;
    if(!value)updateUI();
  }
  function updatePosition(){
    q('[data-memo-position]').textContent=state.view==='notes'?`共 ${activeNotes.length} 则`:`${trash().length} 个纸团`;
    q('[data-memo-step="-1"]').disabled=busy||state.active===0;
    q('[data-memo-step="1"]').disabled=busy||state.active>=activeNotes.length;
  }
  function updateUI(){
    root.dataset.memoView=state.view;
    for(const button of root.querySelectorAll('[data-memo-view]'))button.setAttribute('aria-pressed',String(button.dataset.memoView===state.view));
    q('[data-memo-count=notes]').textContent=live().length;q('[data-memo-count=trash]').textContent=trash().length;
    q('.memo-paper-navigation').hidden=state.view!=='notes';
    q('[data-memo-pour]').hidden=state.view!=='trash';q('[data-memo-pour]').disabled=busy||!trash().length;
    q('.memo-paper-empty').hidden=state.view!=='trash'||!!trash().length;
    const pages=Math.max(1,Math.ceil(trash().length/PAGE_SIZE));
    q('.memo-page-controls').hidden=state.view!=='trash'||pages<2;
    q('.memo-page-controls').innerHTML=`<button type="button" data-memo-page="-1" ${state.page===0?'disabled':''}>上一页</button><span>${state.page+1} / ${pages}</span><button type="button" data-memo-page="1" ${state.page>=pages-1?'disabled':''}>下一页</button>`;
    q('.memo-paper-access').innerHTML=currentTrash.map(n=>`<button type="button" data-memo-open="${esc(n.id)}">打开已丢弃的小记：${esc(n.title||'无题')}</button>`).join('');
    q('.memo-paper-fallback').hidden=!fallback||state.view!=='trash';
    q('.memo-paper-fallback').innerHTML=currentTrash.map(n=>`<button type="button" data-memo-open="${esc(n.id)}">${esc(n.title||'无题')}</button>`).join('');
    updatePosition();
    renderArchive();
  }
  function renderArchive(){
    const notes=archived(),dock=q('.memo-archive-dock');
    dock.hidden=state.view!=='notes';dock.setAttribute('aria-expanded',String(state.view==='archive'));
    q('.memo-archive-shelf').hidden=state.view!=='archive';q('[data-memo-count=archive]').textContent=notes.length;
    const key=JSON.stringify(notes.map(n=>[n.id,n.title,n.content,n.color,n.archivedAt]));if(key===archiveRenderKey)return;archiveRenderKey=key;
    q('.memo-archive-mini').innerHTML=Array.from({length:Math.max(3,Math.min(6,notes.length))},(_,i)=>notes[i]||null).map((n,i)=>`<span class="memo-archive-spine" style="--file-height:${40-i%3*3}px;--memo-tint:${n?colorFor(n)[2]:'var(--accent)'}">${n?esc(characters(n.title||'无题').slice(0,4).join('')):''}</span>`).join('');
    q('.memo-archive-grid').innerHTML=notes.length?notes.map(n=>`<div class="memo-archive-item"><button type="button" class="memo-archive-card" data-memo-archive-open="${esc(n.id)}" data-note-color="${colorFor(n)[0]}" style="--memo-tint:${colorFor(n)[2]}"><span class="memo-archive-card-meta">${archiveIcon}<span>已归档</span><time>${esc(api.time(n.archivedAt))}</time></span><strong>${esc(n.title||'无题')}</strong><span class="memo-archive-excerpt">${esc(n.content||'还没有写下什么。')}</span></button><button type="button" class="memo-archive-restore" data-memo-restore-card="${esc(n.id)}" aria-label="恢复编辑：${esc(n.title||'无题')}">${restoreIcon}<span>恢复编辑</span></button></div>`).join(''):'<p class="memo-archive-empty">归档的小记，会收在这里。</p>';
  }
  function renderCards(){
    closeColors();
    activeNotes=live();
    const markup=`<article class="memo-cover memo-add-cover" data-note-id="" aria-label="新增小记"><button type="button" class="memo-cover-open" data-memo-new><span class="memo-cover-inner"><span class="memo-cover-head">给新的念头，留一张纸</span><span class="memo-cover-plus">${plus}</span><strong>写下一笔</strong><span class="memo-cover-prompt">从这里开始，记下此刻。</span><span class="memo-cover-foot">新增小记<span>＋</span></span></span></button></article>`+
      activeNotes.map((note,i)=>`<article class="memo-cover" data-note-id="${esc(note.id)}" aria-label="小记：${esc(note.title||'无题')}"><button type="button" class="memo-cover-open" data-memo-card="${esc(note.id)}"><span class="memo-cover-inner"><span class="memo-cover-head"><time>${esc(api.time(note.updatedAt))}</time></span><strong>${esc(note.title||'无题')}</strong><span class="memo-cover-rule"></span><span class="memo-cover-excerpt">${esc(note.content||'把尚未成形的念头，先轻轻放在这里。')}</span><span class="memo-cover-foot">小记 · ${String(activeNotes.length-i).padStart(2,'0')}<span>展开编辑 ↗</span></span></span></button><button type="button" class="memo-color-trigger" data-memo-color-trigger="${esc(note.id)}" aria-label="小记颜色：${colorFor(note)[1]}，悬停选择颜色" aria-haspopup="dialog" aria-controls="memo-color-palette" aria-expanded="false">${star}</button><button type="button" class="memo-cover-archive" data-memo-archive="${esc(note.id)}" aria-label="归档${esc(note.title||'无题')}">${archiveIcon}<span>归档</span></button><button type="button" class="memo-cover-discard" data-memo-discard="${esc(note.id)}" aria-label="丢弃${esc(note.title||'无题')}">${bin}<span>丢弃</span></button></article>`).join('');
    const template=document.createElement('template');template.innerHTML=markup;
    const previous=new Map([...deck.children].map(el=>[el.dataset.noteId,el]));
    deck.replaceChildren(...[...template.content.children].map(next=>{
      const existing=previous.get(next.dataset.noteId);if(!existing)return next;
      existing.innerHTML=next.innerHTML;existing.setAttribute('aria-label',next.getAttribute('aria-label'));return existing;
    }));
    activeNotes.forEach(note=>paintNote(cardFor(note.id),note));
    state.active=Math.min(state.active,activeNotes.length);
    carousel=createMemoCarousel([...deck.children],{initial:state.active,onChange(index,audible){closeColors();state.active=index;root.dataset.activeCard=String(index);updatePosition();if(audible&&wheelSwitch&&isCurrent())playSound();}});
  }
  function syncTrash(){
    state.page=Math.min(Math.max(0,state.page),Math.max(0,Math.ceil(trash().length/PAGE_SIZE)-1));
    currentTrash=trash().slice(state.page*PAGE_SIZE,(state.page+1)*PAGE_SIZE);
    engine?.setNotes(currentTrash.map(paperNote));updateUI();
  }
  function isolateEditor(value){
    root.closest('#my-corner')?.classList.toggle('memo-editor-mode',value);
    if(value){
      const elements=[...root.querySelectorAll('.memo-paper-heading,.memo-view-tabs,.memo-paper-footer,.memo-paper-access,.memo-card-deck,.memo-paper-canvas,.memo-paper-fallback,.memo-archive-dock,.memo-archive-shelf')];
      elements.push(...(root.closest('#my-corner')?.querySelectorAll('.corner-pull-cord,.corner-close-entry,.dialog-heading')||[]));
      for(const element of elements){if(!isolated.has(element))isolated.set(element,element.inert);element.inert=true;}
    }else{for(const [element,inert]of isolated)element.inert=inert;isolated.clear();}
  }
  function clearEditor(restoreFocus=false){
    editorMotion?.cancel();editorMotion=null;editorCoverMotion?.cancel();editorCoverMotion=null;editorClosing=false;draft=null;compositionBefore=null;isolateEditor(false);
    root.classList.remove('is-editor-closing');
    for(const card of deck.children)card.style.removeProperty('visibility');
    root.querySelectorAll('.memo-archive-card.is-preview-source').forEach(card=>card.classList.remove('is-preview-source'));
    selectedId=null;editorIsTrash=false;editorIsArchived=false;editorMode='preview';delete root.dataset.memoMode;q('.memo-paper-edit-slot').replaceChildren();root.classList.remove('has-editor','has-trash-editor');
    if(restoreFocus){const target=focusReturn?.isConnected?focusReturn:cardFor(activeNotes[state.active-1]?.id)?.querySelector('button');target?.focus({preventScroll:true});}
  }
  function fitEditor(rect){
    const el=q('.memo-paper-editor');if(el&&rect&&editorIsTrash){const canvas=host.getBoundingClientRect(),base=q('.memo-paper-edit-slot').getBoundingClientRect();el.style.inset='auto';el.style.margin='0';el.style.right='auto';el.style.bottom='auto';el.style.left=(rect.left+canvas.left-base.left)+'px';el.style.top=(rect.top+canvas.top-base.top)+'px';el.style.width=rect.width+'px';el.style.height=rect.height+'px';}
  }
  function animateElement(el,frames,duration=650,options={}){
    if(reduced)return;
    const animation=el.animate(frames,{duration,easing:'cubic-bezier(.2,.8,.2,1)',...options});
    animations.push(animation);animation.finished.catch(()=>{}).finally(()=>{animations=animations.filter(a=>a!==animation);});
    return animation;
  }
  function cardGeometry(card){
    if(!card)return null;
    const box=card.getBoundingClientRect(),matrix=new DOMMatrix(getComputedStyle(card).transform);
    return {x:box.x+box.width/2,y:box.y+box.height/2,width:card.offsetWidth,height:card.offsetHeight,angle:Math.atan2(matrix.b,matrix.a)*180/Math.PI};
  }
  function cardTransform(source,editor){
    const box=editor.getBoundingClientRect();
    return `translate(${source.x-box.x-box.width/2}px,${source.y-box.y-box.height/2}px) rotate(${source.angle}deg) scale(${source.width/box.width},${source.height/box.height})`;
  }
  function updateDraftCounts(){
    if(!draft)return;
    const title=characters(draft.title).length,content=characters(draft.content).length;
    q('[data-memo-content-count]').textContent=`${content} / ${TEXT_LIMITS.content} 字`;
    const over=title>TEXT_LIMITS.title||content>TEXT_LIMITS.content;
    q('[data-memo-limit-message]').hidden=!over;
    q('[data-memo-title]').setAttribute('aria-invalid',String(title>TEXT_LIMITS.title));
    q('[data-memo-content]').setAttribute('aria-invalid',String(content>TEXT_LIMITS.content));
  }
  async function saveDraft(){
    const note=library.notes.find(n=>n.id===selectedId);if(!draft||!isCurrent()||!note||note.deletedAt||note.archivedAt)return false;
    if(draft.title===note.title&&draft.content===note.content)return true;
    if(characters(draft.title).length>TEXT_LIMITS.title||characters(draft.content).length>TEXT_LIMITS.content){updateDraftCounts();q(characters(draft.title).length>TEXT_LIMITS.title?'[data-memo-title]':'[data-memo-content]').focus();return false;}
    note.title=draft.title;note.content=draft.content;note.updatedAt=Date.now();if(!await saveChanges()){if(!isCurrent())return;setBusy(false);renderCards();return;}return true;
  }
  function showEditor(id,rect,source){
    if(!isCurrent()||busy)return;
    const note=library.notes.find(n=>n.id===id);if(!note)return;
    if(note.deletedAt&&state.view!=='trash')return;
    if(note.archivedAt&&state.view!=='archive')return;
    closeColors();focusReturn=document.activeElement;selectedId=id;editorIsTrash=Boolean(note.deletedAt);editorIsArchived=Boolean(note.archivedAt);
    if(editorIsArchived)focusReturn=[...q('.memo-archive-grid').querySelectorAll('[data-memo-archive-open]')].find(card=>card.dataset.memoArchiveOpen===id)||focusReturn;
    editorMode=editorIsTrash||editorIsArchived?'preview':'edit';root.dataset.memoMode=editorIsArchived?'archive-preview':editorMode;
    const preview=editorMode==='preview';
    source=editorIsTrash?null:(source||cardGeometry(cardFor(id)));
    if(!preview)draft={title:note.title||'',content:note.content||''};
    q('.memo-paper-edit-slot').innerHTML=`<div class="memo-editor-backdrop" aria-hidden="true"></div><section class="memo-paper-editor is-sheet ${preview?'is-preview':''}" role="dialog" aria-modal="true" aria-label="${editorIsArchived?'查看归档小记':preview?'预览已丢弃的小记':'编辑小记'}" tabindex="-1"><div class="memo-paper-editor-top"><span>${editorIsArchived?'已归档 · 只读':preview?'暂放在垃圾桶里':'编辑小记'}</span>${editorIsArchived?'':`<div class="memo-editor-top-actions"><button type="button" data-memo-close aria-label="关闭小记" title="关闭">${closeIcon}</button></div>`}</div>${preview?`<h3 class="memo-paper-preview-title">${esc(note.title||'无题')}</h3><div class="memo-paper-preview-content">${esc(note.content||'还没有写下什么。')}</div>`:`<label class="memo-paper-title"><span class="memo-sr-only">标题</span><input data-memo-title data-memo-limit="20" aria-describedby="memo-limit-message" value="${esc(note.title||'')}" placeholder="给这一刻留一个名字"></label><label class="memo-paper-content"><span class="memo-sr-only">正文，最多300字</span><textarea data-memo-content data-memo-limit="300" aria-describedby="memo-content-count memo-limit-message" placeholder="让想法慢慢展开……">${esc(note.content||'')}</textarea></label><p id="memo-limit-message" class="memo-limit-message" data-memo-limit-message role="status" hidden>内容超出字数限制，请精简后保存。</p>`}<footer class="memo-paper-editor-meta"><time>${esc(api.time(note.updatedAt))}</time>${editorIsArchived?`<div class="memo-paper-editor-actions"><button type="button" data-memo-unarchive>${restoreIcon}<span>恢复编辑</span></button></div>`:editorIsTrash?`<div class="memo-paper-editor-actions"><button type="button" data-memo-restore>${restoreIcon}<span>恢复编辑</span></button></div>`:'<span id="memo-content-count" data-memo-content-count></span>'}</footer></section>`;
    root.classList.add('has-editor');root.classList.toggle('has-trash-editor',editorIsTrash);fitEditor(rect);
    const editor=q('.memo-paper-editor');
    paintNote(editor,note);
    if(!preview){updateDraftCounts();}
    if(!preview||editorIsArchived||editorIsTrash){isolateEditor(true);animateElement(q('.memo-editor-backdrop'),[{opacity:0},{opacity:1}],420);}
    if(editorIsArchived)focusReturn?.classList.add('is-preview-source');
    if(source)editorMotion=animateElement(editor,[{transform:cardTransform(source,editor)},{transform:'none'}],520);
    editor.focus({preventScroll:true});
  }
  function openNote(id){
    if(busy||confirmIds||selectedId)return;
    const note=library.notes.find(n=>n.id===id);if(!note)return;
    if(note.deletedAt){if(state.view!=='trash'){switchView('trash',id);return;}if(performance.now()<viewReady)return;if(fallback)showEditor(id);else engine?.openNote(id);}
    else showEditor(id);
  }
  async function closeNote(){
    if(editorClosing||savingMemo||!selectedId)return;
    if(editorIsArchived){
      editorClosing=true;const editor=q('.memo-paper-editor'),target=focusReturn?.isConnected?cardGeometry(focusReturn):null;
      const from=getComputedStyle(editor).transform;editorMotion?.cancel();
      const backdrop=q('.memo-editor-backdrop'),opacity=getComputedStyle(backdrop).opacity;
      animateElement(backdrop,[{opacity},{opacity:0}],360,{fill:'forwards'});
      if(focusReturn?.isConnected)editorCoverMotion=animateElement(focusReturn,[{opacity:0},{opacity:0,offset:.7},{opacity:1}],420,{fill:'both'});
      editorMotion=animateElement(editor,[{transform:from,opacity:1},{transform:target?cardTransform(target,editor):'scale(.96)',opacity:0}],420,{fill:'forwards'});
      if(editorMotion)await editorMotion.finished.catch(()=>{});if(!disposed)clearEditor(true);return;
    }
    const returnId=selectedId,wasEditing=editorMode==='edit';
    if(wasEditing){
      if(!await saveDraft())return;
      editorClosing=true;
      // Update the existing cover before handing the sheet back to it.
      renderCards();
      const editor=q('.memo-paper-editor'),card=cardFor(selectedId);
      const fromTransform=getComputedStyle(editor).transform;
      editorMotion?.cancel();editorMotion=null;
      const target=cardGeometry(card);
      root.classList.add('is-editor-closing');
      const backdrop=q('.memo-editor-backdrop'),backdropOpacity=getComputedStyle(backdrop).opacity;
      // Hold the final transparent frame until the sheet unmounts: reverting
      // to the backdrop's default opacity between animations caused a flash.
      animateElement(backdrop,[{opacity:backdropOpacity},{opacity:0}],420,{fill:'forwards'});
      if(editor&&target){
        editorCoverMotion=animateElement(card,[{opacity:0},{opacity:0,offset:.78},{opacity:getComputedStyle(card).opacity}],520,{fill:'both'});
        editorMotion=animateElement(editor,[{transform:fromTransform,opacity:1},{opacity:1,offset:.78},{transform:cardTransform(target,editor),opacity:0}],520,{fill:'forwards'});
      }
      if(editorMotion)await editorMotion.finished.catch(()=>{});
      if(disposed)return;
    }
    const wasTrash=editorIsTrash||state.view==='trash';clearEditor();if(wasTrash)engine?.closeNote();if(!wasEditing)renderCards();updateUI();
    const target=cardFor(returnId)?.querySelector('button')||(focusReturn?.isConnected?focusReturn:cardFor(activeNotes[state.active-1]?.id)?.querySelector('button'));target?.focus({preventScroll:true});
  }
  function switchView(view,id){
    if(busy||confirmIds||editorClosing||selectedId&&editorIsArchived||view===state.view)return;
    const shelf=q('.memo-archive-shelf'),leavingArchive=state.view==='archive';
    const oldShelf=leavingArchive?shelf.cloneNode(true):null;
    const positions=[...deck.children].map(card=>{const style=getComputedStyle(card);return{card,from:{left:style.left,top:style.top,transform:style.transform,transformOrigin:style.transformOrigin}};});
    animations.forEach(animation=>animation.cancel());
    closeNote();state.view=view;viewReady=performance.now()+(reduced?0:700);
    engine?.cancelDrag();
    root.dataset.focusedPaper=id||'';updateUI();
    for(const {card,from}of positions){if(!card.isConnected)continue;card.style.transition='none';const style=getComputedStyle(card),to={left:style.left,top:style.top,transform:style.transform,transformOrigin:style.transformOrigin};animateElement(card,[from,to],700);card.style.removeProperty('transition');}
    if(view==='archive'){
      animateElement(shelf,[{opacity:0,transform:'translateY(-20px) scale(.97)'},{opacity:1,transform:'none'}],560);
      [...q('.memo-archive-grid').children].forEach((card,i)=>animateElement(card,[{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'none'}],460,{delay:Math.min(i,5)*35,fill:'backwards'}));
    }else if(oldShelf&&!reduced){
      oldShelf.removeAttribute('id');oldShelf.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));oldShelf.inert=true;oldShelf.setAttribute('aria-hidden','true');root.append(oldShelf);
      const exit=animateElement(oldShelf,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-14px) scale(.98)'}],320,{fill:'forwards'});exit?.finished.catch(()=>{}).finally(()=>oldShelf.remove());
    }
    if(view==='trash'){
      const position=id&&engine?.paperPosition(id),bounds=surface.getBoundingClientRect();
      const x=position?position.x-bounds.left:bounds.width/2,y=position?position.y-bounds.top:bounds.height*.65;
      host.style.transformOrigin=`${x}px ${y}px`;
      animateElement(host,[{transform:'scale(.82) translateY(18%)',opacity:.4},{transform:'scale(1.035)',opacity:1,offset:.72},{transform:'none',opacity:1}],700);
      if(position){const ring=q('.memo-paper-focus');ring.hidden=false;ring.style.left=x+'px';ring.style.top=y+'px';animateElement(ring,[{transform:'translate(-50%,-50%) scale(.5)',opacity:.7},{transform:'translate(-50%,-50%) scale(2)',opacity:0}],700);setTimeout(()=>{if(!disposed)ring.hidden=true;},710);}
    }
  }
  async function discardNote(id){
    const note=library.notes.find(n=>n.id===id);if(!isCurrent()||!note||note.deletedAt||note.archivedAt||busy)return;
    const card=cardFor(id),element=selectedId===id?q('.memo-paper-editor'):card;
    const rect=element.getBoundingClientRect(),matrix=new DOMMatrix(getComputedStyle(element).transform),angle=Math.atan2(matrix.b,matrix.a);
    note.deletedAt=Date.now();if(!await saveChanges()){if(!isCurrent())return;setBusy(false);renderCards();return;}setBusy(true);root.classList.add('is-tossing');
    if(currentTrash.length>=PAGE_SIZE)engine?.setNotes(currentTrash.slice(-PAGE_SIZE+1).map(paperNote));
    // VAT / physics takes over the actual cover position, then falls behind it.
    engine?.tossNote(paperNote(note),rect,angle);clearEditor();card?.classList.add('is-discarded');
    await new Promise(resolve=>setTimeout(resolve,reduced?0:180));if(!isCurrent())return;
    renderCards();root.classList.remove('is-tossing');
    await new Promise(resolve=>setTimeout(resolve,reduced?0:650));if(!isCurrent())return;
    if(trash().length>PAGE_SIZE){state.page=Math.floor((trash().length-1)/PAGE_SIZE);syncTrash();}
    else{currentTrash=trash();updateUI();}
    setBusy(false);api.toast('已丢进垃圾桶，可以捡回来');
  }
  async function archiveNote(id){
    const note=library.notes.find(n=>n.id===id);if(!isCurrent()||busy||selectedId||state.view!=='notes'||!note||note.deletedAt||note.archivedAt)return;
    closeColors();const card=cardFor(id),source=cardGeometry(card),target=q('.memo-archive-spine').getBoundingClientRect();
    const flight=document.createElement('div');flight.className='memo-archive-flight';flight.inert=true;flight.setAttribute('aria-hidden','true');flight.innerHTML=card.querySelector('.memo-cover-inner').outerHTML+`<span class="memo-color-trigger">${star}</span>`;
    paintNote(flight,note);Object.assign(flight.style,{left:source.x-source.width/2+'px',top:source.y-source.height/2+'px',width:source.width+'px',height:source.height+'px'});
    setBusy(true);card.style.visibility='hidden';root.append(flight);
    const dx=target.x+target.width/2-source.x,dy=target.y+target.height/2-source.y;
    const motion=animateElement(flight,[{transform:`rotate(${source.angle}deg)`,opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(0deg) scale(${target.width/source.width},${target.height/source.height})`,opacity:.7}],620,{fill:'forwards'});
    if(motion)await motion.finished.catch(()=>{});flight.remove();if(!isCurrent())return;
    note.archivedAt=Date.now();if(!await saveChanges()){if(!isCurrent())return;setBusy(false);renderCards();return;}renderCards();setBusy(false);
    animateElement(q('.memo-archive-spine'),[{transform:'translateY(-10px)',opacity:.4},{transform:'none',opacity:1}],320);api.toast('已归档');
  }
  async function restoreArchivedCard(id){
    const note=library.notes.find(n=>n.id===id);
    if(!isCurrent()||busy||selectedId||state.view!=='archive'||!note?.archivedAt||note.deletedAt)return;
    const card=[...q('.memo-archive-grid').querySelectorAll('[data-memo-archive-open]')].find(el=>el.dataset.memoArchiveOpen===id);
    const source=cardGeometry(card);delete note.archivedAt;if(!await saveChanges()){if(!isCurrent())return;setBusy(false);renderCards();return;}
    state.active=live().findIndex(n=>n.id===id)+1;renderCards();switchView('notes');showEditor(id,null,source);
    api.toast('已恢复，可以继续编辑');
  }
  async function restoreArchived(){
    const note=library.notes.find(n=>n.id===selectedId);if(!isCurrent()||busy||editorClosing||!note?.archivedAt||note.deletedAt)return;
    const editor=q('.memo-paper-editor'),bounds=editor.getBoundingClientRect(),source={...cardGeometry(editor),width:bounds.width,height:bounds.height};
    const opacity=getComputedStyle(q('.memo-editor-backdrop')).opacity;delete note.archivedAt;if(!await saveChanges()){if(!isCurrent())return;setBusy(false);renderCards();return;}clearEditor();
    state.active=live().findIndex(n=>n.id===note.id)+1;renderCards();switchView('notes');showEditor(note.id,null,source);
    const backdrop=q('.memo-editor-backdrop');backdrop.getAnimations().forEach(animation=>animation.cancel());animateElement(backdrop,[{opacity},{opacity:1}],420);api.toast('已恢复，可以继续编辑');
  }
  async function restoreNote(){
    const note=library.notes.find(n=>n.id===selectedId);if(!isCurrent()||!note?.deletedAt)return;
    delete note.deletedAt;if(!await saveChanges()){if(!isCurrent())return;setBusy(false);renderCards();return;}closeNote();syncTrash();state.active=live().findIndex(n=>n.id===note.id)+1;renderCards();switchView('notes');api.toast('已捡回我的小记');
  }
  function cancelConfirm(){confirmIds=null;q('.memo-confirm-slot').replaceChildren();q('[data-memo-pour]').focus();}
  function askPour(){
    if(!trash().length||busy)return;closeNote();confirmIds=new Set(trash().map(n=>n.id));
    q('.memo-confirm-slot').innerHTML=`<div class="memo-confirm-backdrop"><section class="memo-pour-confirm" role="alertdialog" aria-modal="true" aria-labelledby="memo-pour-title" aria-describedby="memo-pour-detail"><span class="memo-confirm-icon">${bin}</span><h3 id="memo-pour-title">倾倒这些纸团？</h3><p id="memo-pour-detail">垃圾桶里的 ${confirmIds.size} 条小记将被彻底删除，无法恢复。</p><div><button type="button" data-memo-cancel-pour>先留着</button><button type="button" class="primary" data-memo-confirm-pour>确认倾倒</button></div></section></div>`;q('[data-memo-cancel-pour]').focus();
  }
  async function pour(){
    if(!confirmIds||busy)return;
    const ids=confirmIds;setBusy(true);q('.memo-confirm-slot').replaceChildren();confirmIds=null;status.hidden=false;status.textContent='正在倾倒…';
    const complete=engine?await engine.pour():true;if(!isCurrent())return;
    if(complete){library.notes=library.notes.filter(n=>!ids.has(n.id)||!n.deletedAt);if(!await saveChanges()){if(!isCurrent())return;status.hidden=true;syncTrash();setBusy(false);renderCards();return;}api.toast('垃圾桶已清空');}
    status.hidden=true;syncTrash();setBusy(false);q('[data-memo-view=trash]').focus();
  }
  root.addEventListener('click',async event=>{
    if(suppressClick){event.preventDefault();return;}
    if(!isCurrent()||busy||savingMemo||editorClosing)return;
    const b=event.target.closest('button'),editor=q('.memo-paper-editor');
    if(editorMode==='preview'&&selectedId&&b?.matches('[data-memo-close]')){void closeNote();return;}
    if(editorMode==='edit'&&selectedId){
      if(b?.matches('[data-memo-close]')||event.target.matches('.memo-editor-backdrop'))void closeNote();
      return;
    }
    if(editor&&!confirmIds&&!b){
      if(!event.target.closest('.memo-paper-editor')){closeNote();return;}
      if(editorMode==='preview'){if(!window.getSelection()?.toString())closeNote();return;}
    }
    if(!b){if(colorNoteId&&!event.target.closest('.memo-color-popover'))closeColors();return;}
    if(confirmIds&&!b.matches('[data-memo-cancel-pour],[data-memo-confirm-pour]'))return;
    if(b.closest('.memo-card-deck')&&state.view!=='notes'){switchView('notes');return;}
    if(b.hasAttribute('data-memo-color-trigger'))openColors(b);
    else if(b.hasAttribute('data-memo-color'))changeColor(b.dataset.memoColor);
    else if(b.hasAttribute('data-memo-view'))switchView(b.dataset.memoView);
    else if(b.hasAttribute('data-memo-new')){const source=cardGeometry(b.closest('.memo-cover'));const note={id:crypto.randomUUID(),title:'',content:'',updatedAt:Date.now(),createdAt:Date.now(),number:++library.lastNumber,icon:'✦',color:'theme'};library.notes.unshift(note);if(!await saveChanges()){if(!isCurrent())return;setBusy(false);renderCards();return;}state.active=1;renderCards();updateUI();showEditor(note.id,null,source);}
    else if(b.hasAttribute('data-memo-card'))openNote(b.dataset.memoCard);
    else if(b.hasAttribute('data-memo-open'))openNote(b.dataset.memoOpen);
    else if(b.hasAttribute('data-memo-discard'))void discardNote(b.dataset.memoDiscard);
    else if(b.hasAttribute('data-memo-archive'))void archiveNote(b.dataset.memoArchive);
    else if(b.hasAttribute('data-memo-archive-toggle'))switchView(state.view==='archive'?'notes':'archive');
    else if(b.hasAttribute('data-memo-restore-card'))restoreArchivedCard(b.dataset.memoRestoreCard);
    else if(b.hasAttribute('data-memo-archive-open'))showEditor(b.dataset.memoArchiveOpen,null,cardGeometry(b));
    else if(b.hasAttribute('data-memo-unarchive'))restoreArchived();
    else if(b.hasAttribute('data-memo-step'))carousel.step(Number(b.dataset.memoStep));
    else if(b.hasAttribute('data-memo-page')){closeNote();state.page+=Number(b.dataset.memoPage);syncTrash();}
    else if(b.matches('[data-memo-close]'))void closeNote();
    else if(b.hasAttribute('data-memo-restore'))restoreNote();
    else if(b.hasAttribute('data-memo-pour'))askPour();
    else if(b.hasAttribute('data-memo-cancel-pour'))cancelConfirm();
    else if(b.hasAttribute('data-memo-confirm-pour'))void pour();
    else if(b.hasAttribute('data-memo-retry'))void start();
  },{signal:signal.signal});
  root.addEventListener('pointerover',event=>{
    if(event.pointerType==='touch')return;
    const anchor=event.target.closest('[data-memo-color-trigger]');
    if(anchor)openColors(anchor);
    else if(event.target.closest('.memo-color-popover'))clearTimeout(colorCloseTimer);
  },{signal:signal.signal});
  root.addEventListener('pointerout',event=>{
    if(event.target.closest('[data-memo-color-trigger],.memo-color-popover')&&!event.relatedTarget?.closest('[data-memo-color-trigger],.memo-color-popover')){
      clearTimeout(colorCloseTimer);colorCloseTimer=setTimeout(()=>closeColors(),150);
    }
  },{signal:signal.signal});
  root.addEventListener('focusin',event=>{
    if(event.target.matches('[data-memo-color-trigger]'))openColors(event.target);
    else if(!event.target.closest('.memo-color-popover'))closeColors();
  },{signal:signal.signal});
  window.addEventListener('resize',()=>closeColors(),{signal:signal.signal});
  function readDraftInput(event){
    if(!isCurrent()||!draft||editorClosing||!event.target.matches('[data-memo-title],[data-memo-content]'))return;
    const field=event.target,key=field.hasAttribute('data-memo-title')?'title':'content',limit=TEXT_LIMITS[key];
    const note=library.notes.find(n=>n.id===selectedId);if(!note||note.deletedAt||note.archivedAt)return;
    if(!event.isComposing&&characters(note[key]||'').length<=limit){
      const before=compositionBefore?.field===field?compositionBefore.value:draft[key],value=limitEdit(field.value,before,limit);
      if(value!==field.value){const cursor=Math.max(0,field.selectionStart-(field.value.length-value.length));field.value=value;field.setSelectionRange(cursor,cursor);}
    }
    draft[key]=field.value;updateDraftCounts();
  }
  root.addEventListener('input',readDraftInput,{signal:signal.signal});
  root.addEventListener('compositionstart',event=>{if(draft&&event.target.matches('[data-memo-title],[data-memo-content]'))compositionBefore={field:event.target,value:event.target.value};},{signal:signal.signal});
  root.addEventListener('compositionend',event=>{readDraftInput(event);compositionBefore=null;},{signal:signal.signal});
  root.addEventListener('wheel',event=>{
    if(drag||event.ctrlKey||event.target.closest('.memo-paper-editor,.memo-confirm-slot,.memo-color-popover')||busy||selectedId||state.view!=='notes')return;
    event.preventDefault();event.stopPropagation();wheelSwitch=true;try{carousel.wheel(event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?host.clientHeight:1));}finally{wheelSwitch=false;}
  },{passive:false,signal:signal.signal});

  function sortSlots(){
    const probe=document.createElement('article');probe.className='memo-cover';probe.style.cssText='visibility:hidden;pointer-events:none;transition:none';deck.append(probe);
    const slots=activeNotes.map((_,i)=>{probe.style.setProperty('--active',(i+1-state.active)/10);return cardGeometry(probe);});probe.remove();return slots;
  }
  function layoutSort(){
    const add=deck.querySelector('.memo-add-cover');deck.append(add,...activeNotes.map(n=>cardFor(n.id)));
    carousel=createMemoCarousel([...deck.children],{initial:state.active,onChange(index){state.active=index;root.dataset.activeCard=String(index);updatePosition();}});
    activeNotes.forEach((n,i)=>{const foot=cardFor(n.id).querySelector('.memo-cover-foot');foot.firstChild.textContent='小记 · '+String(activeNotes.length-i).padStart(2,'0');});
  }
  function beginSort(){
    if(!drag||drag.moved||!drag.noteId||!isCurrent()||busy||selectedId||state.view!=='notes')return;
    closeColors();const card=cardFor(drag.noteId),source=cardGeometry(card),note=activeNotes.find(n=>n.id===drag.noteId);
    const flight=document.createElement('div');flight.className='memo-sort-flight';flight.inert=true;flight.setAttribute('aria-hidden','true');flight.innerHTML=card.querySelector('.memo-cover-inner').outerHTML+'<span class="memo-sort-mark">'+star+'</span>';
    paintNote(flight,note);Object.assign(flight.style,{left:source.x-source.width/2+'px',top:source.y-source.height/2+'px',width:source.width+'px',height:source.height+'px',transform:'rotate('+source.angle+'deg)'});
    Object.assign(drag,{sorting:true,flight,source,original:[...activeNotes],originalActive:state.active,slots:sortSlots(),edgeAt:0});
    card.style.visibility='hidden';root.append(flight);root.classList.add('is-sorting');root.setPointerCapture(drag.id);
    const tick=now=>{if(!drag?.sorting)return;const direction=drag.x<55?-1:drag.x>innerWidth-55?1:0;
      if(direction){if(!drag.edgeAt)drag.edgeAt=now;else if(now-drag.edgeAt>420){const next=Math.max(1,Math.min(activeNotes.length,state.active+direction));if(next!==state.active){state.active=next;layoutSort();drag.slots=sortSlots();moveSort();}drag.edgeAt=now;}}else drag.edgeAt=0;
      drag.frame=requestAnimationFrame(tick);
    };drag.frame=requestAnimationFrame(tick);
  }
  function moveSort(){
    const d=drag;if(!d?.sorting)return;
    const dx=d.x-d.start,dy=d.y-d.startY;d.flight.style.transform='translate('+dx+'px,'+dy+'px) rotate('+d.source.angle+'deg)';
    const x=d.source.x+dx,y=d.source.y+dy;let closest=0,distance=Infinity;
    d.slots.forEach((slot,i)=>{const delta=Math.hypot(slot.x-x,slot.y-y);if(delta<distance){distance=delta;closest=i;}});
    const from=activeNotes.findIndex(n=>n.id===d.noteId);if(from===closest)return;
    const [note]=activeNotes.splice(from,1);activeNotes.splice(closest,0,note);layoutSort();d.flight.querySelector('.memo-cover-foot').firstChild.textContent='小记 · '+String(activeNotes.length-closest).padStart(2,'0');
  }
  async function endDrag(commit=true){
    const d=drag;if(!d)return;drag=null;clearTimeout(d.timer);cancelAnimationFrame(d.frame);
    if(root.hasPointerCapture(d.id))root.releasePointerCapture(d.id);
    if(d.moved||d.sorting){suppressClick=true;setTimeout(()=>suppressClick=false,0);}
    if(!d.sorting)return;
    if(disposed){d.flight.remove();return;}
    if(!commit||!isCurrent()){activeNotes=d.original;state.active=d.originalActive;layoutSort();}
    else if(activeNotes.some((n,i)=>n.id!==d.original[i].id)){
      const ids=new Set(activeNotes.map(n=>n.id)),queue=activeNotes.map(n=>n.id);
      library.cardOrder=ordered().map(n=>ids.has(n.id)?queue.shift():n.id);if(!await saveChanges()){if(!isCurrent())return;d.flight.remove();root.classList.remove('is-sorting');setBusy(false);renderCards();return;}
    }
    const target=sortSlots()[activeNotes.findIndex(n=>n.id===d.noteId)],dx=target.x-d.source.x,dy=target.y-d.source.y;
    setBusy(true);const motion=animateElement(d.flight,[{transform:d.flight.style.transform},{transform:'translate('+dx+'px,'+dy+'px) rotate('+target.angle+'deg)'}],300,{fill:'forwards'});
    if(motion)await motion.finished.catch(()=>{});d.flight.remove();cardFor(d.noteId)?.style.removeProperty('visibility');root.classList.remove('is-sorting');if(!disposed)setBusy(false);
  }
  root.addEventListener('pointerdown',event=>{
    if(busy||selectedId||drag||state.view!=='notes'||event.button!==0||!event.isPrimary||!event.target.closest('.memo-cover-open'))return;
    const target=event.target.closest('.memo-cover-open');drag={id:event.pointerId,start:event.clientX,startY:event.clientY,x:event.clientX,y:event.clientY,moved:false,target,noteId:target.dataset.memoCard};
    if(drag.noteId)drag.timer=setTimeout(beginSort,300);
  },{signal:signal.signal});
  root.addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId)return;
    const previous=drag.x;drag.x=event.clientX;drag.y=event.clientY;
    if(drag.sorting){moveSort();event.preventDefault();return;}
    if(Math.hypot(event.clientX-drag.start,event.clientY-drag.startY)>6){drag.moved=true;clearTimeout(drag.timer);root.setPointerCapture(event.pointerId);}
    if(drag.moved){carousel.drag(event.clientX-previous);event.preventDefault();}
  },{signal:signal.signal});
  root.addEventListener('pointerup',()=>void endDrag(),{signal:signal.signal});
  root.addEventListener('pointercancel',()=>void endDrag(false),{signal:signal.signal});
  root.addEventListener('lostpointercapture',()=>{if(drag)void endDrag(false);},{signal:signal.signal});
  window.addEventListener('blur',()=>void endDrag(false),{signal:signal.signal});
  window.addEventListener('resize',()=>{if(drag)void endDrag(false);},{signal:signal.signal});
  root.addEventListener('keydown',event=>{
    if(drag){if(event.key==='Escape'){event.preventDefault();event.stopPropagation();void endDrag(false);}return;}
    if(event.key==='Escape'&&colorNoteId){event.preventDefault();event.stopPropagation();closeColors(true);return;}
    if(event.target.matches('[data-memo-color-trigger]')&&event.key==='ArrowDown'){event.preventDefault();openColors(event.target);q('button[data-memo-color]').focus();return;}
    if(event.target.closest('.memo-color-popover'))return;
    const dialog=confirmIds?q('.memo-pour-confirm'):q('.memo-paper-editor');
    if(dialog&&event.key==='Tab'){const fields=[...dialog.querySelectorAll('button,input,textarea')].filter(el=>!el.disabled);const at=fields.indexOf(document.activeElement);event.preventDefault();fields[(at+(event.shiftKey?-1:1)+fields.length)%fields.length].focus();return;}
    if(event.target.closest('input,textarea')||busy||confirmIds||selectedId||state.view!=='notes')return;
    if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();carousel.step(event.key==='ArrowRight'?1:-1);}
    if(event.key==='Home'){event.preventDefault();carousel.focus(0,true);}
    if(event.key==='End'){event.preventDefault();carousel.focus(activeNotes.length,true);}
  },{signal:signal.signal});
  async function start(){
    const token=++generation;status.hidden=false;status.textContent='正在准备纸团…';
    try{
      const {createPaperScene}=await import('./assets/memo-paper/engine.js');if(disposed||token!==generation)return;
      const scene=await createPaperScene(host,{background:backgroundColor(),dark:document.body.dataset.dark==='true',reducedMotion:reduced,
        canGrab:()=>state.view==='trash'&&!busy&&!confirmIds&&!selectedId&&performance.now()>=viewReady,
        landingTop:()=>q('.memo-view-tabs').getBoundingClientRect().top,

        onPick(id){if(busy||confirmIds||selectedId&&!editorIsTrash)return false;if(state.view==='notes'){switchView('trash',id);return false;}return performance.now()>=viewReady;},
        onOpening(id){clearEditor();selectedId=id;editorIsTrash=true;root.classList.add('has-editor','has-trash-editor');},onOpen:showEditor,onClose(){if(editorIsTrash)clearEditor();},onResize:fitEditor
      });
      if(disposed||token!==generation){scene.dispose();return;}engine=scene;fallback=false;root.classList.remove('is-fallback');status.hidden=true;syncTrash();
    }catch(error){if(disposed)return;fallback=true;root.classList.add('is-fallback');status.innerHTML='纸团暂未加载，小记仍可使用。<button type="button" data-memo-retry>重试</button>';console.warn('Memo paper scene unavailable:',error.message);updateUI();}
  }
  const themeObserver=new MutationObserver(()=>{engine?.setBackground(backgroundColor());engine?.updateNotes(currentTrash.map(paperNote));});
  themeObserver.observe(document.body,{attributes:true,attributeFilter:['data-dark','style']});themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['style']});
  renderCards();syncTrash();void start();
  return {state,cancel(){if(drag){void endDrag(false);return true;}if(busy||savingMemo)return true;if(colorNoteId){closeColors(true);return true;}if(confirmIds){cancelConfirm();return true;}if(selectedId){if(editorMode==='preview')void closeNote();return true;}if(state.view==='archive'){switchView('notes');return true;}return false;},destroy(){disposed=true;if(drag){clearTimeout(drag.timer);cancelAnimationFrame(drag.frame);drag.flight?.remove();drag=null;}generation++;clearTimeout(colorCloseTimer);signal.abort();themeObserver.disconnect();animations.forEach(a=>a.cancel());isolateEditor(false);engine?.dispose();sound?.dispose();root.replaceChildren();}};
}
