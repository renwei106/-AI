const fs=require('node:fs');
let code=fs.readFileSync('dist/space-atlas.js','utf8');
function replace(a,b){if(!code.includes(a))throw Error('Missing marker '+a.slice(0,90));code=code.replace(a,b)}
function section(a,b,next){const start=code.indexOf(a),end=code.indexOf(b,start);if(start<0||end<0)throw Error('Missing section '+a);code=code.slice(0,start)+next+code.slice(end)}
replace("depth:2, motion:!reduceMotion.matches, layout:'grid', arrangement:'orbit'","motion:false, layout:'radial'");
replace('limit:60','limit:48');
replace('menuTimer, editorBusy=false','menuTimer, menuTrigger, editorBusy=false');
replace("  const isSiteView=()=>get(state.focus)?.kind==='group'&&state.arrangement!=='orbit';\n",'');
replace("state.mode=p.mode==='2d'?'2d':'3d';state.depth=p.depth===99?99:2;state.motion=p.motion!==false&&!reduceMotion.matches;state.layout=p.layout==='list'?'list':'grid';", "state.mode=p.mode==='3d'?'3d':'2d';state.motion=p.motion===true&&!reduceMotion.matches;state.layout=['radial','organization','mindmap'].includes(p.layout)?p.layout:'radial';");
replace('saved[state.sid]={mode:state.mode,depth:state.depth,motion:state.motion,layout:state.layout};','saved[state.sid]={mode:state.mode,motion:state.motion,layout:state.layout};');
section('  function modeButton(', '  function hideModeMenu()', String.raw`  function modeButton(name,atlas=false){
    const b=document.createElement('button');b.type='button';b.className='space-mode-entry';
    const s=data.find(s=>s.id===(atlas?state.sid:spaceId)),mark=typeof entityIcon==='function'?entityIcon(s?.icon||'work'):icons.space;
    b.innerHTML='<i class="space-detail-icon">'+mark+'</i><span class="space-mode-name">'+esc(name)+'</span><i class="space-mode-indicator" title="'+(atlas?'图谱模式':'日常模式')+'">'+(atlas?icons.graph:icons.grid)+'</i>'+icons.down;
    b.setAttribute('aria-label',name+'，当前'+(atlas?'图谱模式':'日常模式')+'，切换空间展示模式');b.setAttribute('aria-expanded','false');b.setAttribute('aria-haspopup','true');
    b.onpointerenter=()=>showModeMenu(b);b.onclick=()=>showModeMenu(b);b.onpointerleave=()=>{menuTimer=setTimeout(hideModeMenu,240)};return b;
  }
`);
replace('    clearTimeout(menuTimer);','    clearTimeout(menuTimer);menuTrigger=button;');
replace('hideModeMenu();button.focus()','hideModeMenu();menuTrigger?.focus()');
code=code.replaceAll("state.arrangement='orbit';",'');
replace("<div class=\"at-mode-host\"></div>","<div class=\"at-mode-host\"></div>");
const toolbarStart=code.indexOf('      <div class="at-tools">'),toolbarEnd=code.indexOf('\n      <div class="at-canvas"',toolbarStart);
code=code.slice(0,toolbarStart)+`      <div class="at-tools"><div class="at-search">\${icons.search}<input type="search" placeholder="搜索图谱" aria-label="搜索空间图谱" autocomplete="off"><div class="at-search-results" hidden></div></div><div class="at-switch" aria-label="图谱维度"><button data-at-mode="2d" aria-pressed="\${state.mode==='2d'}">2D</button><button data-at-mode="3d" aria-pressed="\${state.mode==='3d'}">3D</button></div>\${state.mode==='2d'?'<div class="at-layout-picker"><button class="at-quiet" data-at="layouts" aria-expanded="false">'+layoutIcon(state.layout)+'<span>'+layoutName(state.layout)+'</span>'+icons.down+'</button><div class="at-layout-menu" hidden>'+['radial','organization','mindmap'].map(id=>'<button data-at-layout="'+id+'" aria-pressed="'+(id===state.layout)+'">'+layoutIcon(id)+'<span><b>'+layoutName(id)+'</b><small>'+({radial:'从中心向四周逐级展开',organization:'从上到下，清楚呈现层级',mindmap:'从左到右，沿着分支浏览'}[id])+'</small></span></button>').join('')+'</div></div>':''}</div>`+code.slice(toolbarEnd);
replace("state.mode==='2d'||isSiteView()","state.mode==='2d'");
code=code.replaceAll("${isSiteView()?'disabled':''}",'');
replace("query('.at-mode-host').append(modeButton(root.name))","query('.at-mode-host').append(modeButton(root.name,true))");
replace("!isSiteView()&&(query('.at-canvas').clientWidth<650)!==compactLayout","(query('.at-canvas').clientWidth<650)!==compactLayout");
replace('    if(isSiteView())renderSites(n);else renderGraph(n);','    renderGraph(n);');
replace("if(heading){host.style.left=heading.left+'px';host.style.top=heading.top+'px';dialog.style.setProperty('--chrome-left',heading.left+'px')}","if(heading){host.style.left=heading.left+'px';host.style.top=heading.top+'px';host.style.width=heading.width+'px';const source=document.querySelector('.workspace .space-mode-entry');if(source)host.style.font=getComputedStyle(source).font;dialog.style.setProperty('--chrome-left',heading.left+'px')}");
section('  function bundle(', '  function renderGraph(',String.raw`  const layoutName=id=>({radial:'镜像布局',organization:'组织架构',mindmap:'脑图布局'}[id]);
  function layoutIcon(id){return id==='radial'?icons.graph:id==='organization'?svg('<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v5M5 17v-5h14v5"/>'):svg('<rect x="2" y="9" width="6" height="6" rx="1"/><rect x="17" y="2" width="5" height="5" rx="1"/><rect x="17" y="17" width="5" height="5" rx="1"/><path d="M8 12h5V5h4m-4 7v7h4"/>')}
  function bundle(parent,children,kind) {
    return {key:'b:'+parent.key+':'+kind,kind:'bundle',bundleKind:kind,parent:parent.key,name:children.length+' 个'+label(kind),children:[],source:children,owner:parent.key,links:children.reduce((s,x)=>s+(x.kind==='link'?1:x.links),0)};
  }
  function collect(n) {
    const canvas=query('.at-canvas'),budget=Math.max(22,Math.min(140,Math.floor(canvas.clientWidth*Math.max(240,canvas.clientHeight-310)/10500)));
    const result=[{...n,level:0}],pageSize=canvas.clientWidth<650?18:48;
    // Direct children take priority. Only URLs use a progressive "more" node.
    const first=n.kind==='group'?n.children.slice(0,Math.max(pageSize,state.limit)):n.children;
    result.push(...first.map(x=>({...x,level:1})));
    if(first.length<n.children.length)result.push({...bundle(n,n.children.slice(first.length),'link'),level:1});
    const perBranch=Math.max(1,Math.floor((budget-result.length)/Math.max(1,first.length)));
    for(const child of first){
      if(!child.children.length)continue;
      const isLinks=child.kind==='group',room=Math.max(0,perBranch-(isLinks?1:0));
      let shown=isLinks&&child.children.length>3?[]:child.children.length<=perBranch?child.children:child.children.slice(0,Math.max(0,room-1));
      result.push(...shown.map(x=>({...x,level:2})));
      if(shown.length<child.children.length)result.push({...bundle(child,child.children.slice(shown.length),child.children[0].kind),level:2});
      // Show a third structural level when it is sparse enough to remain legible.
      for(const grandchild of shown){if(!grandchild.children.length)continue;if(result.length+grandchild.children.length<=budget&&grandchild.children.length<=3)result.push(...grandchild.children.map(x=>({...x,level:3})));else if(result.length<budget)result.push({...bundle(grandchild,grandchild.children,'link'),level:3})}
    }
    if(n.parent)result.push({...get(n.parent),level:-1,isParent:true});
    return result;
  }
`);
replace("tiny=visible.filter(x=>x.kind==='link').length>100","tiny=false");
replace("[compactLayout?100:118,44]","[compactLayout?120:144,52]");
replace("name=esc(r.name), mark=", "name=esc(r.name), mark=");
replace("r.kind==='bundle'?icons[r.bundleKind]||icons.group", "r.kind==='bundle'?'<span class=\"at-more-symbol\">···</span>'");
replace("r.kind==='bundle'?`<small>${r.links.toLocaleString()} 个网址</small>`:''", "r.kind==='bundle'?'<small>展开查看</small>':r.kind==='group'?'<small>'+r.links.toLocaleString()+' 个网址</small>':''");
replace("edgeEls.push({el:path,from:parent,to:r})","const flow=path.cloneNode();flow.classList.add('at-flow');flow.setAttribute('pathLength','100');lines.append(flow);edgeEls.push({el:path,flow,from:parent,to:r})");
replace("query('.at-hint').textContent=tiny?'每个小点都是一个网址 · 悬停查看，点击打开':aggregated?'点击分组数量，展开该场景':state.mode==='3d'?'拖动 360° 旋转 · 滚轮缩放':'拖动画布 · 滚轮缩放';", "query('.at-hint').textContent=state.mode==='3d'?'拖动旋转 · 滚轮缩放 · 悬停查看流向':'拖动画布 · 滚轮缩放 · 点击节点聚焦';");
replace("'这里还没有'+(n.kind==='space'?'场景':'分组')+'<br>从右上角的“新增”开始'", "'这里还没有'+(n.kind==='space'?'场景':n.kind==='scene'?'分组':'网址')+'<br><button class=\"at-quiet\" data-at=\"add\">＋ 添加'+(n.kind==='space'?'场景':n.kind==='scene'?'分组':'网址')+'</button>'");
section('  function layout() {','  function start()',String.raw`  function layout() {
    if(!dialog?.open)return;
    const canvas=query('.at-canvas'),w=canvas.clientWidth,h=canvas.clientHeight,n=visible.find(x=>x.level===0);if(!w||!h||!n)return;
    const childrenMap=new Map();for(const x of visible){if(x.level<=0)continue;if(!childrenMap.has(x.parent))childrenMap.set(x.parent,[]);childrenMap.get(x.parent).push(x)}
    const children=p=>childrenMap.get(p.key)||[],top=compactLayout?210:176,bottom=compactLayout?185:150,usableH=Math.max(220,h-top-bottom);
    n.wx=0;n.wy=0;n.wz=0;
    if(state.mode==='2d'&&state.layout!=='radial'){
      const vertical=state.layout==='organization',gap=vertical?26:20;
      function measure(p){const ch=children(p),own=vertical?p.w:p.h;p.span=Math.max(own,ch.length?ch.reduce((sum,c)=>sum+measure(c),0)+gap*(ch.length-1):0);return p.span}measure(n);
      function arrange(p,depth,center){if(vertical){p.wx=center;p.wy=depth*170}else{p.wx=depth*230;p.wy=center}p.wz=0;const ch=children(p);let start=center-(ch.reduce((sum,c)=>sum+c.span,0)+Math.max(0,ch.length-1)*gap)/2;ch.forEach(c=>{arrange(c,depth+1,start+c.span/2);start+=c.span+gap})}arrange(n,0,0);
    }else{
      function measure(p){const ch=children(p);if(!ch.length){p.extent=Math.max(p.w*.6,p.h*.65);return p.extent}const size=Math.max(...ch.map(measure));p.radius=Math.max(p.level===0?170:95,size/Math.sin(Math.PI/Math.max(2,ch.length))*1.18);p.extent=p.radius+size;return p.extent}measure(n);
      function orbit(p){const ch=children(p);ch.forEach((c,i)=>{const angle=-Math.PI/2+Math.PI*2*i/ch.length+(p.level?Math.PI/ch.length:0);let x=Math.cos(angle),y=Math.sin(angle),z=0;
        if(state.mode==='3d'&&ch.length>2){const latitude=1-2*(i+.5)/ch.length,longitude=i*Math.PI*(3-Math.sqrt(5))+p.level*.65,rr=Math.sqrt(1-latitude*latitude);x=Math.cos(longitude)*rr;y=latitude;z=Math.sin(longitude)*rr}
        c.wx=p.wx+x*p.radius;c.wy=p.wy+y*p.radius;c.wz=p.wz+z*p.radius;orbit(c)})}orbit(n);
    }
    const parent=visible.find(x=>x.isParent);if(parent){parent.wx=n.wx-(state.layout==='organization'&&state.mode==='2d'?0:220);parent.wy=n.wy-(state.layout==='mindmap'&&state.mode==='2d'?0:160);parent.wz=state.mode==='3d'?-140:0}
    const minX=Math.min(...visible.map(x=>x.wx-x.w/2)),maxX=Math.max(...visible.map(x=>x.wx+x.w/2)),minY=Math.min(...visible.map(x=>x.wy-x.h/2)),maxY=Math.max(...visible.map(x=>x.wy+x.h/2));
    const fit=Math.min(1,(w-80)/Math.max(1,maxX-minX),usableH/Math.max(1,maxY-minY));
    const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
    for(const r of visible){r.bx=(r.wx-cx)*fit;r.by=(r.wy-cy)*fit;r.bz=r.wz*fit;r.px=undefined;r.py=undefined}
    // Resolve the initial projection once. World positions remain stable while rotating.
    const points=visible.map(r=>({r,x:w/2+r.bx,y:top+usableH/2+r.by,sw:r.w,sh:r.h}));
    for(let pass=0;pass<100;pass++){let moved=false;for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
      const a=points[i],b=points[j],dx=b.x-a.x,dy=b.y-a.y,ox=(a.sw+b.sw)/2+14-Math.abs(dx),oy=(a.sh+b.sh)/2+12-Math.abs(dy);if(ox<=0||oy<=0)continue;
      const fa=a.r.level===0?.1:b.r.level===0?.9:.5;
      if(ox<oy){const v=(dx>=0?1:-1)*(ox+.4);a.x-=v*fa;b.x+=v*(1-fa)}else{const v=(dy>=0?1:-1)*(oy+.4);a.y-=v*fa;b.y+=v*(1-fa)}moved=true;
    }if(!moved)break}
    for(const p of points){p.r.bx=p.x-w/2;p.r.by=p.y-(top+usableH/2)}
    needsPaint=true;
  }
  function paint(dt) {
    const canvas=query('.at-canvas');if(!canvas)return;const w=canvas.clientWidth,h=canvas.clientHeight,top=compactLayout?210:176,bottom=compactLayout?185:150;
    const animate=state.mode==='3d'&&state.motion&&!reduceMotion.matches&&!state.hover&&!state.drag&&query('.at-drawer').hidden&&!document.querySelector('dialog[open]:not(#space-atlas)')&&!document.activeElement?.closest('.at-node');
    if(animate){state.phase+=dt*.000028;needsPaint=true}if(!needsPaint)return;
    const yaw=state.mode==='3d'?state.yaw+state.phase:0,pitch=state.mode==='3d'?state.pitch:0,camera=Math.max(w,h)*3;
    for(const r of visible){const x=r.bx||0,y=r.by||0,z=r.bz||0,rx=x*Math.cos(yaw)+z*Math.sin(yaw),rz=z*Math.cos(yaw)-x*Math.sin(yaw),ry=y*Math.cos(pitch)-rz*Math.sin(pitch),depth=rz*Math.cos(pitch)+y*Math.sin(pitch);
      const scale=state.zoom; r.px=w/2+rx*state.zoom+state.panX;r.py=top+(h-top-bottom)/2+ry*state.zoom+state.panY;
      const el=nodeEls.get(r.key);el.style.transform='translate('+(r.px-r.w/2)+'px,'+(r.py-r.h/2)+'px) scale('+scale+')';el.style.zIndex=String(30+Math.round(-depth/50));el.style.setProperty('--depth-opacity',String(clamp(1-depth/(camera*.65),.5,1)));el.dataset.depth=Math.round(depth);
    }
    for(const {el,flow,from:a,to:b} of edgeEls){let path;
      if(state.mode==='2d'&&state.layout==='organization'){const my=(a.py+b.py)/2;path='M'+a.px+','+a.py+' C'+a.px+','+my+' '+b.px+','+my+' '+b.px+','+b.py}
      else if(state.mode==='2d'&&state.layout==='mindmap'){const mx=(a.px+b.px)/2;path='M'+a.px+','+a.py+' C'+mx+','+a.py+' '+mx+','+b.py+' '+b.px+','+b.py}
      else path='M'+a.px+','+a.py+' L'+b.px+','+b.py;
      el.setAttribute('d',path);flow.setAttribute('d',path);
    }
    needsPaint=false;
  }
`);
section('  function renderSites(', '  function setContext(', '');
replace("if(bundleNode){const owner=get(bundleNode.owner);if(owner&&owner.key!==state.focus)focus(owner.key);else browse(bundleNode);return}","if(bundleNode){const owner=get(bundleNode.owner);if(owner&&owner.key!==state.focus)focus(owner.key);else if(owner?.kind==='group'){state.limit+=compactLayout?18:48;renderAtlas()}return}");
replace('state.limit=60','state.limit=compactLayout?18:48');
replace("x.el.classList.toggle('is-muted',!on)","x.el.classList.toggle('is-muted',!on);x.flow.classList.toggle('is-flowing',on);x.flow.classList.toggle('is-upstream',x.to.key===state.hover||x.from.isParent===true)");
replace("x.el.classList.remove('is-muted','is-related');x.el.classList.toggle", "x.el.classList.remove('is-muted','is-related');x.flow.classList.remove('is-flowing');x.el.classList.toggle");
section('  function browse(', '  function details(', '');
replace("    if(!e.target.closest('.at-depth')){query('.at-popover').hidden=true;query('[data-at=depth]').setAttribute('aria-expanded','false')}","    if(!e.target.closest('.at-layout-picker')){const menu=query('.at-layout-menu');if(menu)menu.hidden=true;query('[data-at=layouts]')?.setAttribute('aria-expanded','false')}");
code=code.replace(/^.*if\(b.hasAttribute\('data-at-depth'\)\).*\r?\n/m,'');
replace("if(b.hasAttribute('data-at-layout')){state.layout=b.dataset.atLayout;savePreferences();renderSites(get(state.focus));return}","if(b.hasAttribute('data-at-layout')){state.layout=b.dataset.atLayout;savePreferences();resetCamera();renderAtlas();return}");
code=code.replace(/^.*if\(b.hasAttribute\('data-at-arrangement'\)\).*\r?\n/m,'');
replace("if(action==='depth'){const pop=query('.at-popover');pop.hidden=!pop.hidden;b.setAttribute('aria-expanded',String(!pop.hidden));return}","if(action==='layouts'){const pop=query('.at-layout-menu');pop.hidden=!pop.hidden;b.setAttribute('aria-expanded',String(!pop.hidden));return}");
code=code.replace(/^.*if\(action==='more-sites'\).*\r?\n/m,'');
code=code.replaceAll("||e.target.closest('.at-site-view')",'').replaceAll('button,a,.at-site-view','button,a');
replace("const active=dialog?.open;originalRender();mountEntry();", "const active=dialog?.open;originalRender();mountEntry();");
fs.writeFileSync('dist/space-atlas.js',code);
let v4=fs.readFileSync('dist/v4.js','utf8');
const guard="if(view!=='home'||new URLSearchParams(location.search).has('page')){button?.remove();return}";
if(v4.split(guard).length!==3)throw Error('Cord guards changed');
v4=v4.replaceAll(guard,"if(!['home','space'].includes(view)||new URLSearchParams(location.search).has('page')){button?.remove();return}");fs.writeFileSync('dist/v4.js',v4);
