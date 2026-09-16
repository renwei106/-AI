/* 静读书房 / 藏书架. Presentation only; bookmarks keep their shared actions and data. */
(() => {
  'use strict';
  const bookIcon=svgIcon('<path d="M12 6C9 3 5 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7-1-10 2Zm0 0v15"/><path d="M5 8h4m-4 4h4m6-4h4m-4 4h4"/>');
  COPY_DEFAULTS.reading={title:'翻开喜欢，自有天地',intro:'留一页空白，给此刻的自己'};
  LINK_VIEWS.shelf=['藏书架',2,4];
  const modeBefore=linkMode;
  linkMode=function(id){return id==='follow'&&effective().theme==='reading'?'shelf':modeBefore(id);};

  // Resolution-independent still life, drawn locally. No uploaded or remote image is needed.
  function stillLife(prefix='reading') {
    const lines=Array.from({length:12},(_,i)=>{
      const y=264+i*6;
      return `<path d="M278 ${y} Q360 ${y-40} 477 ${y-4}M506 ${y-4}Q616 ${y-38} 719 ${y-8}"/>`;
    }).join('');
    return `<svg viewBox="120 120 780 430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="侧光里，一本翻开的书静静放在叠起的藏书上">
      <defs>
        <linearGradient id="${prefix}-paper" x1="0" y1="0" x2="1" y2=".4"><stop stop-color="#f6f1df"/><stop offset=".82" stop-color="#ebe3cd"/><stop offset="1" stop-color="#c7b99b"/></linearGradient>
        <linearGradient id="${prefix}-right" x1="0" y1=".2" x2="1" y2=".6"><stop stop-color="#b6a98c"/><stop offset=".08" stop-color="#eee5ce"/><stop offset=".55" stop-color="#fff9e9"/><stop offset="1" stop-color="#ebe3d0"/></linearGradient>
        <linearGradient id="${prefix}-cloth" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#8b947c"/><stop offset=".25" stop-color="#768068"/><stop offset=".8" stop-color="#68745d"/><stop offset="1" stop-color="#505c48"/></linearGradient>
        <linearGradient id="${prefix}-cream" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e4d6b9"/><stop offset=".7" stop-color="#c6b798"/><stop offset="1" stop-color="#aa9c80"/></linearGradient>
        <linearGradient id="${prefix}-pages" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e5dcc5"/><stop offset="1" stop-color="#c6baa0"/></linearGradient>
        <filter id="${prefix}-shadow" x="-.3" y="-1" width="1.6" height="3"><feGaussianBlur stdDeviation="13"/></filter>
      </defs>
      <ellipse cx="516" cy="455" rx="296" ry="21" fill="#524c36" opacity=".17" filter="url(#${prefix}-shadow)"/>
      <g class="reading-books">
        <path d="M219 395 265 348H793L746 395Z" fill="#92977e"/>
        <path d="M220 396H746V447H220Q210 422 220 396Z" fill="url(#${prefix}-cloth)"/>
        <path d="m746 399 42-44v46l-42 44Z" fill="url(#${prefix}-pages)"/>
        <path d="m218 447 528 0 45-47v6l-44 46H218Z" fill="#566348"/>
        <path d="M239 404v33m9-33v33m455-33v33m9-33v33" stroke="#e5dcc0" stroke-width="1" opacity=".42"/>
        <text x="475" y="429" fill="#f0e8d1" font-size="15" letter-spacing="7" text-anchor="middle" font-family="serif">日常的诗意</text>
        <path d="m748 408 37-39m-37 46 37-39m-37 46 37-39m-37 46 37-39m-37 46 37-39" fill="none" stroke="#a6977b" stroke-width=".8" opacity=".55"/>
        <path d="M246 354 289 314H755L711 354Z" fill="#f0e5cd"/>
        <path d="M247 355H711V391H247Q241 374 247 355Z" fill="url(#${prefix}-cream)"/>
        <path d="m711 357 40-38v33l-40 37Z" fill="#d7ccb2"/>
        <path d="m247 391 464 0 44-40v5l-43 39H247Z" fill="#b9aa88"/>
        <text x="478" y="379" fill="#71634b" font-size="10" letter-spacing="4" text-anchor="middle">A PLACE FOR WONDER</text>
        <path d="M264 361v25m8-25v25m417-25v25" stroke="#9a8b6e" opacity=".5"/>
        <path d="M264 320 303 280H731L689 320Z" fill="#a5755e"/>
        <path d="M264 321H689V351H264Z" fill="#98715e"/>
        <path d="m689 324 38-38v24l-38 37Z" fill="#d4c6ab"/>
        <path d="m264 351 425 0 42-40v4l-41 40H264Z" fill="#805d4c"/>
        <path d="M244 295Q363 236 491 297Q615 239 735 282L776 339Q639 306 498 356Q358 307 235 345Z" fill="#70694f"/>
        <path d="M246 286Q364 231 490 289L499 347Q365 302 240 338Z" fill="#e0d5b9"/>
        <path d="M493 289Q612 232 735 275L769 331Q635 298 499 347Z" fill="#dfd3b7"/>
        <path d="M253 254Q363 204 489 270L495 334Q358 290 248 327Z" fill="url(#${prefix}-paper)"/>
        <path d="M492 270Q595 211 719 245L761 319Q631 282 495 334Z" fill="url(#${prefix}-right)"/>
        <path d="M253 254Q368 205 489 270M492 270Q597 211 719 245" fill="none" stroke="#fffbee" stroke-width="2"/>
        <path d="m489 270 6 64" stroke="#a49678" opacity=".55"/>
        <g fill="none" stroke="#9f947e" stroke-width=".8" opacity=".25">${lines}</g>
        <path d="M493 331Q516 347 538 347L552 408 540 402 531 415 519 360Q502 352 493 331Z" fill="#a36855"/>
        <path d="m245 333q118-32 249 8m9 0q126-43 260-14M244 337q121-29 249 8m11 0q129-44 261-13" fill="none" stroke="#b9ac90" stroke-width=".9" opacity=".65"/>
      </g>
    </svg>`;
  }
  const artworkBefore=themeArtwork;
  themeArtwork=function(id){return id==='reading'?stillLife('reading-mini'):artworkBefore(id);};
  const readingChapters=['晴空','日光','夜想'];
  let readingChapter=0,readingSceneId=0;
  function pageWorldArt(chapter,prefix){
    const palettes=[['#2543e9','#1525a1','#ff704b'],['#ff825e','#e45b49','#c9c5ff'],['#c8bdff','#9385e0','#3247ed']];
    const [sky,shade,sun]=palettes[chapter];
    const scene=[
      '<circle cx="228" cy="137" r="47" fill="url(#'+prefix+'-sun)"/><path d="M74 349 181 226l78 179H74Z" fill="#8999ff"/><path d="m181 226 20 179h58Z" fill="#5268e9"/><path d="M85 421c-15-82 169-98 190-157l16 166Z" fill="#fff"/><path d="M85 421c-15-82 169-98 190-157-5 74-154 84-160 163Z" fill="#e0e5ff"/>',
      '<circle cx="164" cy="158" r="72" fill="url(#'+prefix+'-sun)"/><path d="M67 404h58V288h56v-54h55v-54h61v252H67Z" fill="#f9f4ff"/><path d="m125 288 20 14v104h-20m36-172 20 14v54h-20m55-68 20 14v54h-20" fill="#ddcef1"/><path d="M258 319c-56-67-42-124 20-167 4 67 20 104-20 167Z" fill="#e66d51"/>',
      '<circle cx="188" cy="147" r="58" fill="url(#'+prefix+'-sun)"/><path d="M60 405c28-84 170-60 237-133v169H60Z" fill="#9991ea"/><path d="M69 404c59-22 91-88 231-47v83H69Z" fill="#666cce"/><path d="m105 286 151-57-45 128-29-55Z" fill="#fff"/><path d="m182 302 74-73-45 128Z" fill="#dddffc"/><path d="m182 302-14 36 43 19Z" fill="#a4aeea"/>'
    ][chapter];
    return '<svg viewBox="0 0 360 460" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="'+prefix+'-sky" x2=".7" y2="1"><stop stop-color="'+sky+'"/><stop offset="1" stop-color="'+shade+'"/></linearGradient><radialGradient id="'+prefix+'-sun" cx=".35" cy=".3" r=".8"><stop stop-color="'+sun+'"/><stop offset="1" stop-color="'+sun+'" stop-opacity=".8"/></radialGradient><clipPath id="'+prefix+'-window"><path d="M57 427V166a123 123 0 0 1 246 0v261Z"/></clipPath></defs><path d="M47 427V168a126 126 0 0 1 252 0v259Z" fill="#1a2755" opacity=".09"/><path d="M52 427V169a125 125 0 0 1 250 0v258Z" fill="#afb6d8" opacity=".33"/><g clip-path="url(#'+prefix+'-window)"><path fill="url(#'+prefix+'-sky)" d="M57 25h246v402H57Z"/>'+scene+'</g><path d="M57 427V166a123 123 0 0 1 246 0" fill="none" stroke="#fff" stroke-width="1.2" opacity=".6"/></svg>';
  }
  function mountReadingGallery(root){
    const prefix='reading-world-'+(++readingSceneId);
    root.insertAdjacentHTML('afterbegin','<figure class="reading-gallery" data-chapter="'+readingChapter+'" aria-label="页外，一本可以翻动的艺术书"><div class="reading-artwork" aria-hidden="true"><div class="reading-book-shadow"></div><div class="reading-book-stage"><div class="reading-book-cover"></div><div class="reading-book-edges"></div><div class="reading-page reading-page-left"><svg viewBox="0 0 360 460" fill="none"><path d="M74 94h25m-25 8h14" stroke="currentColor" stroke-width="1" opacity=".4"/><path d="M73 355c58-70 121-84 201-49M73 365c58-70 121-84 201-49M73 375c58-70 121-84 201-49" stroke="currentColor" stroke-width=".65" opacity=".16"/><circle cx="252" cy="112" r="10" fill="currentColor" opacity=".85"/></svg><span class="reading-page-number">01</span></div><div class="reading-page reading-page-right" data-reading-world>'+pageWorldArt(readingChapter,prefix+'-still')+'</div><div class="reading-flip-sheet"><div class="reading-flip-front"></div><div class="reading-flip-back"><svg viewBox="0 0 360 460" fill="none"><path d="M82 355c50-60 122-62 202-38m-202 9c50-60 122-62 202-38m-202 9c50-60 122-62 202-38" stroke="currentColor" opacity=".14"/></svg></div></div><div class="reading-binding"></div><svg class="reading-bookmark-ribbon" viewBox="0 0 120 190" fill="none"><path d="M59 0c0 30 11 70 3 104s-28 43-20 70l12-10 13 12c-10-36 18-49 13-88S69 21 72 0Z" fill="currentColor"/><path d="M63 2c0 35 9 73 1 104s-23 44-18 62" stroke="#fff" stroke-opacity=".2"/></svg></div></div><button class="reading-turn-hit" type="button" aria-label="翻到下一页：'+readingChapters[(readingChapter+1)%3]+'"><span class="reading-turn-corner" aria-hidden="true">↗</span></button><figcaption class="reading-gallery-caption"><span class="reading-gallery-title">页外</span><span class="reading-gallery-index" aria-live="polite">0'+(readingChapter+1)+' / '+readingChapters[readingChapter]+'</span></figcaption><div class="reading-gallery-nav"><button class="reading-turn-action" type="button" aria-label="翻到下一页"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 17V6c5-1 8 0 8 2 0-2 3-3 8-2v11c-5-1-8 0-8 2-1-2-4-3-8-2Zm8-9v11M9 3l3-2 3 2"/></svg><span>翻一页</span></button><div class="reading-chapter-dots" role="group" aria-label="选择书页">'+readingChapters.map((name,i)=>'<button type="button" data-reading-chapter="'+i+'" aria-label="第'+(i+1)+'页：'+name+'" aria-pressed="'+(i===readingChapter)+'"><i></i></button>').join('')+'</div></div></figure>');
    const gallery=root.querySelector('.reading-gallery'),art=gallery.querySelector('.reading-artwork'),sheet=gallery.querySelector('.reading-flip-sheet'),front=gallery.querySelector('.reading-flip-front'),world=gallery.querySelector('[data-reading-world]'),hit=gallery.querySelector('.reading-turn-hit'),dots=[...gallery.querySelectorAll('[data-reading-chapter]')];
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
    let busy=false,disposed=false,frame=0,finishTimer=0,animation=null,mx=0,my=0;
    function sync(){
      gallery.dataset.chapter=String(readingChapter);
      world.innerHTML=pageWorldArt(readingChapter,prefix+'-still');
      gallery.querySelector('.reading-page-number').textContent='0'+(readingChapter+1);
      gallery.querySelector('.reading-gallery-index').textContent='0'+(readingChapter+1)+' / '+readingChapters[readingChapter];
      hit.setAttribute('aria-label','翻到下一页：'+readingChapters[(readingChapter+1)%3]);
      dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===readingChapter)));
    }
    function finish(){
      if(disposed)return;
      animation?.cancel();animation=null;clearTimeout(finishTimer);sheet.classList.remove('is-active');front.replaceChildren();gallery.classList.remove('is-turning');gallery.removeAttribute('aria-busy');busy=false;
    }
    function turnTo(next){
      if(busy||next===readingChapter)return;
      if(reduced.matches){readingChapter=next;sync();return;}
      busy=true;gallery.classList.add('is-turning');gallery.setAttribute('aria-busy','true');
      front.innerHTML=pageWorldArt(readingChapter,prefix+'-flip');sheet.classList.add('is-active');readingChapter=next;sync();gallery.querySelector('.reading-flip-back').innerHTML=gallery.querySelector('.reading-page-left').innerHTML;
      animation=sheet.animate([{transform:'rotateY(-2deg)'},{transform:'rotateY(-38deg)',offset:.25},{transform:'rotateY(-164deg)',offset:.85},{transform:'rotateY(-180deg)'}],{duration:1250,easing:'cubic-bezier(.35,.05,.2,1)',fill:'forwards'});
      animation.finished.then(finish).catch(()=>{});
      finishTimer=setTimeout(finish,1550);
    }
    hit.addEventListener('click',()=>turnTo((readingChapter+1)%3));
    gallery.querySelector('.reading-turn-action').addEventListener('click',()=>turnTo((readingChapter+1)%3));
    dots.forEach((dot,i)=>dot.addEventListener('click',()=>turnTo(i)));
    gallery.addEventListener('pointermove',event=>{
      if(reduced.matches||!fine.matches||event.pointerType==='touch')return;
      mx=(event.clientX/innerWidth-.5)*-6;my=(event.clientY/innerHeight-.5)*-4;
      if(!frame)frame=requestAnimationFrame(()=>{frame=0;art.style.setProperty('--reading-x',mx+'px');art.style.setProperty('--reading-y',my+'px');});
    });
    gallery.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);frame=0;art.style.setProperty('--reading-x','0px');art.style.setProperty('--reading-y','0px');});
    const motionChanged=()=>{if(reduced.matches){if(busy)finish();art.style.setProperty('--reading-x','0px');art.style.setProperty('--reading-y','0px');}};
    reduced.addEventListener('change',motionChanged);
    const observer=new MutationObserver(()=>{if(root.isConnected)return;disposed=true;cancelAnimationFrame(frame);clearTimeout(finishTimer);animation?.cancel();reduced.removeEventListener('change',motionChanged);observer.disconnect();});
    observer.observe(root.parentNode,{childList:true});
    sync();
  }
  const homeBefore=home;
  home=function(){
    homeBefore();if(effective().theme!=='reading')return;
    const root=$('.home-reading');if(!root)return;
    mountReadingGallery(root);
  };
  function applyReadingCopy(){const copy=currentCopy('reading');const title=$('[data-reading-title]'),intro=$('[data-reading-intro]');if(title)title.textContent=copy.title;if(intro)intro.textContent=copy.intro;}
  const copyBefore=applyHomeCopy;
  applyHomeCopy=function(){copyBefore();if(view==='home'&&effective().theme==='reading')applyReadingCopy();};
  const dockBefore=dock;
  dock=function(){dockBefore();if(dockTheme()!=='reading')return;const trigger=$('.dock-trigger');if(!trigger)return;const label=trigger.querySelector('.dock-label')?.outerHTML||'';trigger.innerHTML=`<span class="reading-dock-book" aria-hidden="true">${bookIcon}</span>${label}`;};

  const settingsBefore=openLinkSettings;
  openLinkSettings=function(){settingsBefore();const panel=$('#link-view-settings'),choice=panel?.querySelector('[data-link-view=shelf]'),main=panel?.querySelector('.style-scroll-body>.link-view-grid');if(!choice||!main)return;choice.innerHTML=`<span>${bookIcon}</span>藏书架`;choice.title='书脊朝外，把收藏摞成一架好书';const after=main.querySelector('[data-link-view=poly]')||main.querySelector('[data-link-view=cards]');if(after)after.after(choice);else main.append(choice);};
  const fitBefore=columnFit;
  columnFit=function(){const fit=fitBefore();if(fit.mode!=='shelf')return fit;const width=$('.group:not([hidden]) .cards')?.clientWidth||$('.workspace-tools')?.clientWidth||800,max=Math.max(1,Math.min(4,Math.floor((width+36)/286))),saved=displayRule()?.columns??prefs.groupColumns?.[currentGroup().id];return{...fit,max,count:Math.min(max,saved||max),auto:!saved};};

  function layoutShelves(cards){
    if(!cards||cards.dataset.display!=='shelf')return;
    const books=[...cards.querySelectorAll(':scope>.bookmark:not(.page-hidden)')],add=cards.querySelector(':scope>.shelf-add');
    const fit=columnFit(),cols=fit.count;
    cards.style.setProperty('--shelf-columns',cols);
    const count=books.length+(add?1:0),banks=Math.max(1,Math.ceil(count/(cols*4)));
    cards.style.gridTemplateRows=Array.from({length:banks},(_,i)=>{
      // A full bank holds four books per stack; a small collection keeps one short stack.
      const rows=Math.min(4,count-i*cols*4);
      return `${[66,62,70,64].slice(0,Math.max(1,rows)).map(x=>x+'px').join(' ')} 32px`;
    }).join(' ');
    cards.querySelectorAll(':scope>.shelf-plank').forEach(el=>el.remove());
    [...books,...(add?[add]:[])].forEach((el,i)=>{
      const bank=Math.floor(i/(cols*4)),within=i%(cols*4),column=Math.floor(within/4),row=within%4;
      el.style.gridColumn=String(column+1);el.style.gridRow=String(bank*5+row+1);
      el.style.setProperty('--shelf-inset',[0,6,3,9][row]+'px');
    });
    for(let i=0;i<banks;i++){const plank=document.createElement('i');plank.className='shelf-plank';plank.setAttribute('aria-hidden','true');plank.style.gridColumn='1 / -1';plank.style.gridRow=String(i*5+Math.min(4,count-i*cols*4)+1);cards.append(plank);}
  }
  function dressShelves(){
    const cards=$('.group:not([hidden]) .cards');if(!cards||cards.dataset.display!=='shelf')return;
    cards.querySelectorAll(':scope>.bookmark').forEach((el,i)=>{
      const a=el.querySelector('a'),head=a?.querySelector('.bookmark-head'),title=head?.querySelector('strong'),logo=head?.querySelector('.site-icon');
      if(!title||!logo)return;
      const name=title.textContent;let host='';try{host=new URL(a.href).hostname.replace(/^www\./,'');}catch{}
      const hash=bookmarkHash(a.href);el.dataset.shelfTone=String(hash%5);
      const spine=document.createElement('span');spine.className='shelf-spine';
      const mark=document.createElement('span');mark.className='shelf-mark';mark.append(logo);
      const text=document.createElement('span');text.className='shelf-title';text.textContent=name;
      const domain=document.createElement('small');domain.className='shelf-domain';domain.textContent=host;
      spine.append(mark,text,domain);a.replaceChildren(spine);
      a.setAttribute('aria-label',name+'，在新标签页打开');a.title=name+(host?' · '+host:'');
    });
    if(!cards.querySelector('.shelf-add')){const add=document.createElement('button');add.className='shelf-add';add.dataset.action='add';add.innerHTML='<span aria-hidden="true">＋</span><span>收一本新书<small>收藏网址</small></span>';cards.append(add);}
    layoutShelves(cards);
  }
  const groupsBefore=renderGroups;
  renderGroups=function(){groupsBefore();dressShelves();};
  const pagesBefore=paginateBookmarks;
  paginateBookmarks=function(){pagesBefore();layoutShelves($('.group:not([hidden]) .cards'));};
  const refreshBefore=refreshColumnFit;
  refreshColumnFit=function(){refreshBefore();layoutShelves($('.group:not([hidden]) .cards'));};
  let resizeFrame=0;
  window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>layoutShelves($('.group:not([hidden]) .cards')));});
  // Keep the existing long-press interaction; only recalculate this style's shelf slots.
  const reorderBefore=animatedReorder;
  animatedReorder=function(parent,el,next){
    if(parent.dataset.display!=='shelf')return reorderBefore(parent,el,next);
    if(next===el||el.nextElementSibling===next)return;
    const children=[...parent.querySelectorAll(':scope>.bookmark')];children.forEach(x=>x.getAnimations().forEach(a=>a.cancel()));
    const rects=new Map(children.map(x=>[x,x.getBoundingClientRect()]));parent.insertBefore(el,next);layoutShelves(parent);
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    children.forEach(x=>{const from=rects.get(x),to=x.getBoundingClientRect(),dx=from.left-to.left,dy=from.top-to.top;if(dx||dy)x.animate([{translate:`${dx}px ${dy}px`},{translate:'0 0'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'});});
  };
  if(new URL(location.href).searchParams.get('theme')==='reading'){scope='global';changeTheme('reading');}
  else if(effective().theme==='reading')render();
})();
