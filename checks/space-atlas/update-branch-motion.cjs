const fs=require('node:fs');let s=fs.readFileSync('dist/space-atlas.js','utf8');
function change(a,b){if(!s.includes(a))throw Error('Missing '+a.slice(0,80));s=s.replace(a,b)}
function section(a,b,c){const i=s.indexOf(a),j=s.indexOf(b,i);if(i<0||j<0)throw Error(a);s=s.slice(0,i)+c+s.slice(j)}
change('drag:null, limit:0','drag:null, settling:false, flowStart:0, suppressClickUntil:0, limit:0');
change("    if(heading&&!heading.querySelector('.space-mode-entry')){heading.replaceChildren(modeButton(space().name));}","    if(heading&&!heading.querySelector('.space-mode-entry')){heading.replaceChildren(modeButton(space().name));}syncCordClearance();");
section('  function modeButton(', '  function modeButton(', ''); // Verify the insertion point without changing it.
const at=s.indexOf('  function modeButton(');
s=s.slice(0,at)+String.raw`  function syncCordClearance(){
    const actions=document.querySelector('.workspace .space-top-actions');if(!actions||view!=='space')return;
    actions.style.translate='';const box=actions.getBoundingClientRect();let shift=0;
    for(const cord of document.querySelectorAll('.mode-pull-cord,.color-pull-cord')){const r=cord.getBoundingClientRect();if(box.top<r.bottom&&box.bottom>r.top&&box.right>r.left-14)shift=Math.min(shift,r.left-14-box.right)}
    if(shift)actions.style.translate=shift+'px 0';
  }
  addEventListener('resize',()=>{syncCordClearance();if(dialog?.open)positionChrome()});
`+s.slice(at);
change("dialog.addEventListener('click',click);","dialog.addEventListener('click',e=>{if(performance.now()<state.suppressClickUntil){e.preventDefault();e.stopImmediatePropagation()}},true);\n      dialog.addEventListener('click',click);\n      dialog.addEventListener('dragstart',e=>{if(e.target.closest('.at-node'))e.preventDefault()});");
change("dialog.addEventListener('pointercancel',()=>{state.drag=null;query('.at-canvas')?.classList.remove('is-dragging')});","dialog.addEventListener('pointercancel',pointerUp);");
change("state.hover=null;state.drag=null;\n    dialog.innerHTML", "state.hover=null;state.drag=null;state.settling=false;\n    dialog.innerHTML");
change("const n=get(state.focus)||root, chain=pathOf(n), peers=n.parent?get(n.parent).children:[];", "const n=get(state.focus)||root;");
s=s.split('\n').filter(line=>!line.includes('<div class="at-context">')).join('\n');
change("    needsPaint=true;query('.at-peer[aria-current=true]')?.scrollIntoView({block:'nearest',inline:'nearest'});","    needsPaint=true;");
change("  function positionChrome(){","  function positionChrome(){\n    syncCordClearance();");
change("radial:'镜像布局',organization:'组织架构',mindmap:'脑图布局'","radial:'径向环绕',organization:'层级结构',mindmap:'思维脉络'");
change("if(!child.children.length||(!radial&&first.length>12))continue;","if(!child.children.length||(!radial&&first.length>12)||(n.parent&&first.length>10))continue;");
change("const flow=path.cloneNode();flow.classList.add('at-flow');flow.setAttribute('pathLength','100');lines.append(flow);edgeEls.push({el:path,flow,from:parent,to:r})",String.raw`const flow=document.createElementNS('http://www.w3.org/2000/svg','g');flow.classList.add('at-packet');flow.innerHTML='<circle class="at-packet-halo" r="8"/><circle class="at-packet-trail" r="2"/><circle class="at-packet-trail" r="2.7"/><circle class="at-packet-head" r="4"/>';flow.dataset.from=parent.key;flow.dataset.to=r.key;lines.append(flow);edgeEls.push({el:path,flow,from:parent,to:r})`);
change("query('.at-hint').textContent=state.mode==='3d'?'拖动旋转 · 滚轮缩放 · 悬停查看流向':'拖动画布 · 滚轮缩放 · 点击节点聚焦';","query('.at-hint').textContent=state.mode==='3d'?'拖动节点 · 空白处旋转 · 滚轮缩放':'拖动节点 · 松手归位 · 滚轮缩放';");
change("top=compactLayout?230:185,bottom=compactLayout?180:155", "top=compactLayout?190:145,bottom=compactLayout?180:155");
change("for(const r of visible){r.bx=0;r.by=0;r.bz=0}","for(const r of visible){r.bx=0;r.by=0;r.bz=0;r.ox=0;r.oy=0}");
change("    if(radial){",String.raw`    if(radial&&n.parent){
      // Focused children use evenly spaced concentric rings, with no per-frame relaxation.
      const widest=Math.max(80,...direct.map(c=>Math.hypot(c.w,c.h))),step=widest+18;
      let radius=(Math.hypot(n.w,n.h)+widest)/2+22,cursor=0,ring=0;
      while(cursor<direct.length){const capacity=Math.max(4,Math.floor(Math.PI/Math.asin(Math.min(.95,(widest+16)/(2*radius))))),batch=direct.slice(cursor,cursor+capacity);batch.forEach((c,i)=>{const angle=-Math.PI/2+2*Math.PI*i/batch.length+(ring%2?Math.PI/batch.length:0);c.bx=Math.cos(angle)*radius;c.by=Math.sin(angle)*radius;c.bz=state.mode==='3d'?Math.sin(angle*2+.4)*radius*.24:0;c.ring=ring;
        const ch=children(c),outer=radius+step;ch.forEach((g,j)=>{const a=angle+(j-(ch.length-1)/2)*(Math.PI*1.5/Math.max(1,batch.length))/Math.max(1,ch.length);g.bx=Math.cos(a)*outer;g.by=Math.sin(a)*outer;g.bz=state.mode==='3d'?Math.sin(a*2+.4)*outer*.24:0})
      });cursor+=batch.length;radius+=step;ring++}
      // Leave the readable node size unchanged; large rings remain reachable by panning/zooming.
    }else if(radial){`);
change("const parent=visible.find(x=>x.isParent);if(parent){parent.bx=radial?-w/2+90:n.bx-(state.layout==='organization'?190:180);parent.by=radial?-usableH/2+45:n.by-(state.layout==='organization'?70:90);parent.bz=state.mode==='3d'?-90:0}","const parent=visible.find(x=>x.isParent);if(parent){parent.bx=clamp(n.bx-Math.min(240,w*.24),-w/2+parent.w/2+18,w/2-parent.w/2-18);parent.by=-usableH/2+44;parent.bz=0}");
section('  function paint(dt) {','  function start()',String.raw`  function paint(dt) {
    const canvas=query('.at-canvas');if(!canvas)return;const w=canvas.clientWidth,h=canvas.clientHeight,top=compactLayout?190:145,bottom=compactLayout?180:155;
    const animate=state.mode==='3d'&&state.motion&&!reduceMotion.matches&&!state.hover&&!state.drag&&!state.settling&&query('.at-drawer').hidden&&!document.querySelector('dialog[open]:not(#space-atlas)')&&!document.activeElement?.closest('.at-node');
    if(animate){state.phase+=dt*.000028;needsPaint=true}
    if(state.settling){const keep=reduceMotion.matches?0:Math.exp(-dt/115);let unfinished=false;for(const r of visible){r.ox=(r.ox||0)*keep;r.oy=(r.oy||0)*keep;if(Math.abs(r.ox)+Math.abs(r.oy)<.08){r.ox=0;r.oy=0}else unfinished=true}state.settling=unfinished;needsPaint=true;canvas.classList.toggle('is-settling',unfinished)}
    if(needsPaint){const yaw=state.mode==='3d'?state.yaw+state.phase:0,pitch=state.mode==='3d'?state.pitch:0,camera=Math.max(w,h)*3;
      for(const r of visible){const x=r.bx||0,y=r.by||0,z=r.bz||0,rx=r.isParent?x:x*Math.cos(yaw)+z*Math.sin(yaw),rz=r.isParent?0:z*Math.cos(yaw)-x*Math.sin(yaw),ry=r.isParent?y:y*Math.cos(pitch)-rz*Math.sin(pitch),depth=r.isParent?0:rz*Math.cos(pitch)+y*Math.sin(pitch);
        r.baseX=w/2+rx*state.zoom+state.panX;r.baseY=top+(h-top-bottom)/2+ry*state.zoom+state.panY;r.px=r.baseX+(r.ox||0);r.py=r.baseY+(r.oy||0);
        const el=nodeEls.get(r.key);el.style.transform='translate('+(r.px-r.w/2)+'px,'+(r.py-r.h/2)+'px) scale('+state.zoom+')';el.style.zIndex=String(30+Math.round(-depth/50));el.style.setProperty('--depth-opacity',String(clamp(1-depth/(camera*.65),.5,1)));el.dataset.depth=Math.round(depth);
      }
      for(const edge of edgeEls){const {el,from:a,to:b}=edge;let path;
        if(state.mode==='2d'&&state.layout==='organization'){const my=(a.py+b.py)/2;path='M'+a.px+','+a.py+' C'+a.px+','+my+' '+b.px+','+my+' '+b.px+','+b.py}
        else if(state.mode==='2d'&&state.layout==='mindmap'){const mx=(a.px+b.px)/2;path='M'+a.px+','+a.py+' C'+mx+','+a.py+' '+mx+','+b.py+' '+b.px+','+b.py}
        else path='M'+a.px+','+a.py+' L'+b.px+','+b.py;
        el.setAttribute('d',path);edge.length=el.getTotalLength();
      }
      needsPaint=false;
    }
    paintPackets();
  }
  function paintPackets(){
    const hovered=visible.find(n=>n.key===state.hover),incoming=edgeEls.some(e=>e.to.key===state.hover),elapsed=(performance.now()-state.flowStart)%2400;
    for(const edge of edgeEls){const up=edge.to.key===state.hover,down=edge.from.key===state.hover,active=!!hovered&&(up||down)&&!state.drag?.moved&&!state.settling;
      let t=-1;if(active){if(reduceMotion.matches)t=.58;else if(up&&elapsed<700)t=elapsed/700;else if(down&&elapsed>= (incoming?800:150)&&elapsed<(incoming?1700:1050))t=(elapsed-(incoming?800:150))/900}
      edge.flow.style.opacity=t>=0?'1':'0';edge.flow.dataset.phase=t>=0?(up?'incoming':'outgoing'):'idle';edge.flow.classList.toggle('is-upstream',up);
      if(t<0||!edge.length)continue;
      const children=edge.flow.children;for(let i=0;i<children.length;i++){const f=clamp(t-(i===1?.055:i===2?.027:0),0,1),point=edge.el.getPointAtLength(edge.length*f);children[i].setAttribute('cx',point.x);children[i].setAttribute('cy',point.y)}
    }
    nodeEls.forEach((el,key)=>el.classList.toggle('is-receiving',key===state.hover&&incoming&&elapsed>=660&&elapsed<930&&!reduceMotion.matches));
  }
`);
section('  function hover(e) {','  function input(e)',String.raw`  function hover(e) {
    if(state.drag?.moved)return;const el=e.target.closest('.at-node');if(!el||el.contains(e.relatedTarget)||state.hover===el.dataset.key)return;
    state.hover=el.dataset.key;state.flowStart=performance.now();const related=new Set([state.hover]);
    const n=visible.find(x=>x.key===state.hover);if(n?.parent)related.add(n.parent);visible.filter(x=>x.parent===state.hover).forEach(x=>related.add(x.key));
    for(const [key,node] of nodeEls){node.classList.toggle('is-muted',!related.has(key));node.classList.toggle('is-related',related.has(key))}
    edgeEls.forEach(x=>{const on=x.to.key===state.hover||x.from.key===state.hover;x.el.classList.toggle('is-related',on);x.el.classList.toggle('is-upstream',x.to.key===state.hover||x.from.isParent===true);x.el.classList.toggle('is-muted',!on)});
  }
  function clearHover(){state.hover=null;nodeEls.forEach(el=>el.classList.remove('is-muted','is-related','is-receiving'));edgeEls.forEach(x=>{x.el.classList.remove('is-muted','is-related');x.flow.style.opacity='0';x.el.classList.toggle('is-upstream',x.from.isParent===true)})}
  function unhover(e){if(state.drag?.moved)return;const el=e.target.closest('.at-node');if(!el||el.contains(e.relatedTarget))return;clearHover()}
`);
section('  function pointerDown(e)', '  function keydown(e)',String.raw`  function branchKeys(key){const keys=new Set([key]);for(let found=true;found;){found=false;for(const r of visible)if(keys.has(r.parent)&&!keys.has(r.key)){keys.add(r.key);found=true}}return keys}
  function pointerDown(e){
    const canvas=e.target.closest('.at-canvas');if(!canvas||e.button!==0||e.target.closest('.at-node-menu'))return;
    const node=e.target.closest('.at-node');
    if(node&&!node.classList.contains('is-parent')){const keys=branchKeys(node.dataset.key);state.drag={type:'branch',key:node.dataset.key,keys,x:e.clientX,y:e.clientY,moved:false,offsets:new Map(visible.map(r=>[r.key,{x:r.ox||0,y:r.oy||0}]))};return}
    if(e.target.closest('button,a'))return;
    state.drag={type:'canvas',x:e.clientX,y:e.clientY,yaw:state.yaw,pitch:state.pitch,panX:state.panX,panY:state.panY,pan:e.shiftKey||state.mode==='2d'};canvas.setPointerCapture(e.pointerId);canvas.classList.add('is-dragging');
  }
  function pushNeighbours(d){
    const active=new Set(d.keys),zoom=state.zoom;
    for(let pass=0;pass<8;pass++){let hit=false;for(const a of visible){if(!active.has(a.key))continue;for(const b of visible){if(b===a||d.keys.has(b.key)||b.isParent)continue;
      const dx=(b.baseX+(b.ox||0))-(a.baseX+(a.ox||0)),dy=(b.baseY+(b.oy||0))-(a.baseY+(a.oy||0)),ox=(a.w+b.w)*zoom/2+10-Math.abs(dx),oy=(a.h+b.h)*zoom/2+10-Math.abs(dy);
      if(ox<=0||oy<=0)continue;if(ox<oy)b.ox=(b.ox||0)+(dx>=0?1:-1)*(ox+.4);else b.oy=(b.oy||0)+(dy>=0?1:-1)*(oy+.4);active.add(b.key);hit=true;
    }}if(!hit)break}
  }
  function pointerMove(e){
    const d=state.drag;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;
    if(d.type==='branch'){
      if(!d.moved&&Math.hypot(dx,dy)<6)return;
      if(!d.moved){d.moved=true;state.settling=false;query('.at-canvas').setPointerCapture(e.pointerId);query('.at-canvas').classList.add('is-node-dragging');clearHover();for(const key of d.keys)nodeEls.get(key)?.classList.add('is-held')}
      e.preventDefault();for(const r of visible)if(d.keys.has(r.key)){r.ox=d.offsets.get(r.key).x+dx;r.oy=d.offsets.get(r.key).y+dy}pushNeighbours(d);
    }else if(d.pan){state.panX=d.panX+dx;state.panY=d.panY+dy}else{state.yaw=d.yaw+dx*.006;state.pitch=d.pitch+dy*.005}
    needsPaint=true;
  }
  function pointerUp(){
    const d=state.drag;if(d?.type==='branch'&&d.moved){state.suppressClickUntil=performance.now()+400;state.settling=true;needsPaint=true;nodeEls.forEach(el=>el.classList.remove('is-held'));query('.at-canvas').classList.add('is-settling')}
    state.drag=null;query('.at-canvas')?.classList.remove('is-dragging','is-node-dragging');
  }
`);
fs.writeFileSync('dist/space-atlas.js',s);
