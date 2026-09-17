const fs=require('fs'),f='dist/corner.js';let s=fs.readFileSync(f,'utf8');
s=s.replace('const flipped=new Set(),flipTimers=new WeakMap();','const flipped=new Set(),flipTimers=new WeakMap();\n  const fanMotion={position:null,target:0,frame:0,last:0,tau:100};');
s=s.replace("flipped.clear();cancelAnimationFrame(motionFrame);wheelConsumed=false;swipe=null;","flipped.clear();cancelAnimationFrame(motionFrame);cancelAnimationFrame(fanMotion.frame);fanMotion.frame=0;panel.classList.remove('corner-animating');wheelConsumed=false;swipe=null;");
s=s.replace("<div class=\"corner-back-header\"><span>编辑卡片</span><button data-corner-done=\"'+g.id+'\" title=\"翻回正面\">完成 '+glyph('<path d=\"m5 12 4 4L19 6\"/>')+'</button></div>","<div class=\"corner-back-header\"><span>编辑卡片</span></div>");
s=s.replace('<section class="corner-card-back" aria-label=','<section class="corner-card-back" tabindex="-1" aria-label=');
s=s.replace("resetFloat();layoutFan();const el=panel.querySelector('[data-corner-card=\"'+id+'\"]');(back?el?.querySelector('[data-corner-done]')","resetFloat();layoutFan(true);const el=panel.querySelector('[data-corner-card=\"'+id+'\"]');(back?el?.querySelector('.corner-card-back')");
s=s.replace("if(b?.dataset.cornerRemove){g.refs=g.refs.filter(r=>r.id!==b.dataset.cornerRemove);persist();renderPanel();return;}","if(b?.dataset.cornerRemove){g.refs=g.refs.filter(r=>r.id!==b.dataset.cornerRemove);persist();refreshLinks([g.id]);return;}");
const start=s.indexOf('  function layoutFan(){'),end=s.indexOf('  function updateArrows',start);
s=s.slice(0,start)+`  function fanMetrics(){const deck=panel.querySelector('.corner-deck'),width=deck.clientWidth||innerWidth-96,cardWidth=innerWidth<=760?Math.min(340,width-72):330;return {deck,cardWidth,step:cardWidth+40,half:Math.max(0,Math.floor((width-cardWidth)/(2*(cardWidth+40))))};}
  function fanOffset(distance,m){return distance<=m.half+1?distance*m.step:(m.half+1)*m.step+(distance-m.half-1)*30;}
  function paintFan(position){
    const m=fanMetrics(),ids=[...collection().groups.map(g=>g.id),ADD_CARD];panel.classList.toggle('corner-editing',flipped.size>0);
    for(const el of m.deck.querySelectorAll(':scope > .corner-card')){const id=el.dataset.cornerCard||ADD_CARD,i=ids.indexOf(id),delta=i-position,distance=Math.abs(delta),outer=Math.max(0,distance-m.half),visible=distance<m.half+3,selected=id===activeId;el.style.width=m.cardWidth+'px';el.style.setProperty('--fan-x',Math.sign(delta)*fanOffset(distance,m)+'px');el.style.setProperty('--fan-y',(outer?m.half*m.half*9+outer*14:distance*distance*9)+'px');el.style.setProperty('--fan-angle',(flipped.has(id)?0:Math.sign(delta)*(Math.min(distance,m.half)*1.4+Math.min(outer*3,12-m.half*1.4)))+'deg');el.style.setProperty('--fan-scale',String(1-.04*Math.min(outer,1)));el.style.zIndex=String(20-Math.min(Math.round(distance),15));el.dataset.fanOffset=String(i-ids.indexOf(activeId));el.classList.toggle('is-center',selected);el.classList.toggle('is-away',!visible);el.inert=!visible||flipped.size>0&&!flipped.has(id);el.setAttribute('aria-current',String(selected));}
  }
  function layoutFan(animate=false,fast=false){
    if(!panel)return;const groups=collection().groups,ids=[...groups.map(g=>g.id),ADD_CARD];if(!ids.includes(activeId))activeId=groups[Math.min(1,groups.length-1)]?.id||ADD_CARD;
    const target=drag?.active&&drag.type==='group'?drag.anchorIndex:ids.indexOf(activeId);fanMotion.target=target;fanMotion.tau=fast?80:115;
    if(!animate||reduced()||fanMotion.position===null){cancelAnimationFrame(fanMotion.frame);fanMotion.frame=0;fanMotion.position=target;panel.classList.remove('corner-animating');paintFan(target);updateArrows();return;}
    panel.classList.add('corner-animating');if(!fanMotion.frame){fanMotion.last=performance.now();fanMotion.frame=requestAnimationFrame(advanceFan);}updateArrows();
  }
  function advanceFan(now){
    const dt=Math.min(40,now-fanMotion.last);fanMotion.last=now;fanMotion.position+=(fanMotion.target-fanMotion.position)*(1-Math.exp(-dt/fanMotion.tau));
    const settled=Math.abs(fanMotion.target-fanMotion.position)<.001;if(settled)fanMotion.position=fanMotion.target;paintFan(fanMotion.position);
    if(settled){fanMotion.frame=0;panel.classList.remove('corner-animating');}else fanMotion.frame=requestAnimationFrame(advanceFan);
  }
  function navigate(direction,fast=false){if(flipped.size||drag?.active)return;const ids=[...collection().groups.map(g=>g.id),ADD_CARD],index=ids.indexOf(activeId),next=Math.max(0,Math.min(ids.length-1,index+direction));if(next===index||!ids[next])return;activeId=ids[next];layoutFan(true,fast);playCardSound();}
  function onWheel(e){
    if(e.ctrlKey||drag?.active)return;
    if(flipped.size){if(!e.target.closest('.corner-back-scroll'))e.preventDefault();e.stopPropagation();return;}
    const inner=e.target.closest('.corner-links');if(!e.shiftKey&&inner&&inner.scrollHeight>inner.clientHeight+2&&Math.abs(e.deltaY)>=Math.abs(e.deltaX)){e.stopPropagation();return;}
    if(e.target.closest('input,select'))return;e.preventDefault();
    const now=performance.now(),delta=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1),gap=now-wheelLast;
    if(gap>180||Math.sign(wheelSum)!==Math.sign(delta))wheelSum=0;wheelLast=now;wheelSum=Math.max(-240,Math.min(240,wheelSum+delta));
    const fast=e.shiftKey||Math.abs(delta)>=100||gap<130,interval=e.shiftKey?75:fast?110:230,threshold=e.shiftKey?14:50;
    if(now<wheelLock||Math.abs(wheelSum)<threshold)return;navigate(Math.sign(wheelSum),fast);wheelSum=0;wheelLock=now+interval;
  }
`+s.slice(end);
// Updating a URL never recreates the surrounding card or restarts its floating motion.
const marker='  function findRef(id)';s=s.replace(marker,`  function refreshLinks(groupIds){
    const entries=sources(),rows=new Map([...panel.querySelectorAll('.corner-deck [data-corner-ref]')].map(el=>[el.dataset.cornerRef,el]));
    for(const id of new Set(groupIds)){const g=collection().groups.find(g=>g.id===id),el=panel.querySelector('.corner-deck [data-corner-card="'+id+'"]');if(!g||!el)continue;
      const list=el.querySelector('.corner-links'),scroll=list.scrollTop,tmp=document.createElement('template');tmp.innerHTML=card(g,collection().groups.indexOf(g),entries);const generated=tmp.content.querySelector('.corner-links'),desired=[...generated.children].map(row=>rows.get(row.dataset.cornerRef)||row),keep=new Set(desired);
      for(const row of [...list.children])if(!keep.has(row))row.remove();let cursor=list.firstChild;for(const row of desired){if(row!==cursor)list.insertBefore(row,cursor);cursor=row.nextSibling;}list.scrollTop=scroll;el.querySelector('.corner-card-cover small').textContent=tmp.content.querySelector('.corner-card-cover small').textContent;
    }
  }
`+marker);
const a=s.indexOf('  function startDrag(e) {'),b=s.indexOf('  function closeSwitch()',a);
s=s.slice(0,a)+`  function startDrag(e) {
    const handle=e.target.closest('[data-corner-drag-group],[data-corner-drag-ref]');if(!handle||e.button!==0||flipped.size||e.target.closest('a,input,select,.corner-card-logo'))return;
    const type=handle.hasAttribute('data-corner-drag-group')?'group':'ref',id=type==='group'?handle.dataset.cornerDragGroup:handle.dataset.cornerDragRef;
    drag={id,type,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,pid:e.pointerId,active:false,snapshot:JSON.stringify(collection().groups),originalActive:activeId};
    drag.timer=setTimeout(()=>{
      if(!drag)return;drag.active=true;const groups=collection().groups;drag.anchorIndex=[...groups.map(g=>g.id),ADD_CARD].indexOf(activeId);cancelAnimationFrame(fanMotion.frame);fanMotion.frame=0;panel.classList.remove('corner-animating');
      if(type==='ref'){const g=findRef(id);if(g?.sort==='frequency'){g.refs=orderedRefs(g);g.sort='manual';}}
      const node=handle.closest(type==='group'?'.corner-card':'.corner-link');drag.node=node;drag.rect=node.getBoundingClientRect();drag.transform=getComputedStyle(node).transform;panel.classList.add('corner-dragging');panel.setPointerCapture(e.pointerId);
      if(type==='group'){node.classList.add('corner-held-card');node.style.transform=drag.transform;updateDragSlots();}
      else{drag.ghost=node.cloneNode(true);drag.ghost.classList.add('corner-ref-ghost');drag.ghost.removeAttribute('data-corner-ref');for(const n of drag.ghost.querySelectorAll('[data-corner-drag-ref],[data-corner-remove]')){n.removeAttribute('data-corner-drag-ref');n.removeAttribute('data-corner-remove');}drag.ghost.style.width=drag.rect.width+'px';drag.ghost.setAttribute('aria-hidden','true');panel.append(drag.ghost);node.classList.add('corner-held-ref');}
      positionDrag(drag.x,drag.y);
    },320);
  }
  function updateDragSlots(){const m=fanMetrics(),center=m.deck.getBoundingClientRect().left+m.deck.clientWidth/2;drag.slots=collection().groups.map((g,i)=>{const delta=i-drag.anchorIndex;return center+Math.sign(delta)*fanOffset(Math.abs(delta),m);});}
  function positionDrag(x,y){if(!drag?.active)return;drag.lastX=x;drag.lastY=y;const dx=x-drag.x,dy=y-drag.y;if(drag.type==='group')drag.node.style.transform='translate3d('+dx+'px,'+dy+'px,0) '+drag.transform;else{drag.ghost.style.left=drag.rect.left+dx+'px';drag.ghost.style.top=drag.rect.top+dy+'px';}}
  function syncCardOrder(){const deck=panel.querySelector('.corner-deck'),nodes=new Map([...deck.querySelectorAll('[data-corner-card]')].map(el=>[el.dataset.cornerCard,el])),add=deck.querySelector('[data-corner-add-card]');collection().groups.forEach((g,i)=>{const el=nodes.get(g.id);deck.insertBefore(el,add);el.querySelector('.corner-card-number').textContent=String(i+1).padStart(2,'0');});}
  window.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.pid)return;if(!drag.active){if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7)finishDrag(true);return;}
    e.preventDefault();positionDrag(e.clientX,e.clientY);const m=fanMetrics(),box=m.deck.getBoundingClientRect(),groups=collection().groups;
    if(drag.type==='group'){
      if(performance.now()>(drag.edgeAt||0)&&(e.clientX>box.right-12||e.clientX<box.left+12)){const dir=e.clientX>box.right-12?1:-1;drag.anchorIndex=Math.max(0,Math.min(groups.length-1,drag.anchorIndex+dir));layoutFan();updateDragSlots();drag.edgeAt=performance.now()+650;}
      const center=drag.rect.left+drag.rect.width/2+e.clientX-drag.x,from=groups.findIndex(g=>g.id===drag.id);let to=from;
      while(to>0&&center<(drag.slots[to-1]+drag.slots[to])/2-18)to--;
      while(to<groups.length-1&&center>(drag.slots[to]+drag.slots[to+1])/2+18)to++;
      if(to!==from){const [g]=groups.splice(from,1);groups.splice(to,0,g);layoutFan();}return;
    }
    const target=document.elementFromPoint(e.clientX,e.clientY),el=target?.closest('.corner-deck [data-corner-card]');if(!el)return;
    const row=target.closest('[data-corner-ref]'),list=el.querySelector('.corner-links'),r=list.getBoundingClientRect();if(e.clientY>r.bottom-30)list.scrollTop+=12;else if(e.clientY<r.top+30)list.scrollTop-=12;
    if(performance.now()<(drag.reorderAt||0)||row?.dataset.cornerRef===drag.id)return;
    const from=findRef(drag.id),to=el.dataset.cornerCard;let beforeId=row?.dataset.cornerRef;if(row&&e.clientY>row.getBoundingClientRect().top+row.offsetHeight/2)beforeId=row.nextElementSibling?.dataset.cornerRef;
    const previous=JSON.stringify(groups);moveRef(drag.id,to,beforeId);if(previous!==JSON.stringify(groups)){refreshLinks([from.id,to]);drag.reorderAt=performance.now()+130;}
  },{passive:false});
  function finishDrag(cancel=false){
    if(!drag)return;const state=drag;clearTimeout(state.timer);drag=null;
    if(!state.active)return;
    if(cancel){collection().groups=JSON.parse(state.snapshot);activeId=state.originalActive;}else persist();
    state.ghost?.remove();panel.querySelectorAll('.corner-held-ref').forEach(el=>el.classList.remove('corner-held-ref'));
    if(state.type==='group'){if(!cancel)activeId=collection().groups[Math.min(state.anchorIndex,collection().groups.length-1)]?.id||ADD_CARD;syncCardOrder();layoutFan();state.node.classList.remove('corner-held-card');state.node.style.removeProperty('transform');}
    else if(cancel){syncCardOrder();refreshLinks(collection().groups.map(g=>g.id));layoutFan();}
    panel.classList.remove('corner-dragging');if(panel.hasPointerCapture(state.pid))panel.releasePointerCapture(state.pid);swallowClickUntil=performance.now()+350;
  }
  window.addEventListener('pointerup',()=>finishDrag());window.addEventListener('pointercancel',()=>finishDrag(true));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drag){e.preventDefault();e.stopImmediatePropagation();finishDrag(true);}},true);
`+s.slice(b);
fs.writeFileSync(f,s);
