const fs=require('node:fs');let s=fs.readFileSync('dist/space-atlas.js','utf8');
let start=s.indexOf('  function layout() {'),end=s.indexOf('  function paint(dt)',start);
s=s.slice(0,start)+String.raw`  function layout() {
    if(!dialog?.open)return;
    const canvas=query('.at-canvas'),w=canvas.clientWidth,h=canvas.clientHeight,n=visible.find(x=>x.level===0);if(!w||!h||!n)return;
    const top=compactLayout?230:185,bottom=compactLayout?180:155,usableH=Math.max(220,h-top-bottom),centerY=top+usableH/2;
    const childrenMap=new Map();for(const x of visible){if(x.level<=0)continue;if(!childrenMap.has(x.parent))childrenMap.set(x.parent,[]);childrenMap.get(x.parent).push(x)}
    const children=p=>childrenMap.get(p.key)||[],direct=children(n),radial=state.mode==='3d'||state.layout==='radial';
    for(const r of visible){r.bx=0;r.by=0;r.bz=0}
    if(radial){
      const outerX=Math.max(130,w/2-95),outerY=Math.max(115,usableH/2-46),levels=Math.max(1,...visible.map(x=>x.level));
      function orbit(p,start,end,depth){const ch=children(p);ch.forEach((c,i)=>{const sector=(end-start)/ch.length,angle=start+sector*(i+.5),ratio=depth/levels;
        c.bx=Math.cos(angle)*outerX*ratio;c.by=Math.sin(angle)*outerY*ratio;
        c.bz=state.mode==='3d'?Math.sin(angle*2+.4)*Math.min(outerX,outerY)*ratio*.6:0;
        orbit(c,angle-sector*.44,angle+sector*.44,depth+1)
      })}orbit(n,-Math.PI/2-Math.PI/Math.max(1,direct.length),Math.PI*1.5-Math.PI/Math.max(1,direct.length),1);
      // Layout is settled once, inside the usable area. Rotation never re-runs this solver.
      const points=visible.filter(x=>!x.isParent);
      for(let pass=0;pass<100;pass++){let moved=false;for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
        const a=points[i],b=points[j],dx=b.bx-a.bx,dy=b.by-a.by,ox=(a.w+b.w)/2+10-Math.abs(dx),oy=(a.h+b.h)/2+10-Math.abs(dy);if(ox<=0||oy<=0)continue;
        const fa=a.level===0?0:b.level===0?1:.5;
        if(ox<oy){const v=(dx>=0?1:-1)*(ox+.3);a.bx-=v*fa;b.bx+=v*(1-fa)}else{const v=(dy>=0?1:-1)*(oy+.3);a.by-=v*fa;b.by+=v*(1-fa)}moved=true;
      }for(const p of points){p.bx=clamp(p.bx,-w/2+p.w/2+14,w/2-p.w/2-14);p.by=clamp(p.by,-usableH/2+p.h/2+6,usableH/2-p.h/2-6)}if(!moved)break}
    }else if(direct.length>12){
      // Dense sibling levels wrap as connected graph branches; no list view is used.
      if(state.layout==='organization'){
        const cols=Math.max(2,Math.floor((w-90)/145)),rows=Math.ceil(direct.length/cols);n.by=-usableH/2+70;
        direct.forEach((c,i)=>{const row=Math.floor(i/cols),count=Math.min(cols,direct.length-row*cols);c.bx=(i%cols-(count-1)/2)*Math.min(154,(w-90)/cols);c.by=-usableH/2+195+row*Math.min(100,(usableH-225)/Math.max(1,rows-1))});
      }else{
        const rows=Math.max(4,Math.floor((usableH-70)/57)),cols=Math.ceil(direct.length/rows);n.bx=-w/2+120;
        direct.forEach((c,i)=>{c.bx=-w/2+320+Math.floor(i/rows)*Math.min(230,(w-460)/Math.max(1,cols-1));c.by=(i%rows-(Math.min(rows,direct.length-Math.floor(i/rows)*rows)-1)/2)*57});
      }
    }else{
      const vertical=state.layout==='organization',gap=vertical?22:18;
      function measure(p){const ch=children(p);p.span=Math.max(vertical?p.w:p.h,ch.length?ch.reduce((sum,c)=>sum+measure(c),0)+gap*(ch.length-1):0);return p.span}measure(n);
      const maxLevel=Math.max(...visible.map(r=>r.level)),crossScale=Math.min(1,(vertical?w-100:usableH-60)/n.span),step=vertical?Math.min(220,(usableH-130)/Math.max(1,maxLevel)):Math.min(320,(w-260)/Math.max(1,maxLevel));
      function arrange(p,depth,cross){if(vertical){p.bx=cross*crossScale;p.by=(depth-maxLevel/2)*step}else{p.bx=(depth-maxLevel/2)*step;p.by=cross*crossScale}const ch=children(p);let cursor=cross-(ch.reduce((sum,c)=>sum+c.span,0)+Math.max(0,ch.length-1)*gap)/2;ch.forEach(c=>{arrange(c,depth+1,cursor+c.span/2);cursor+=c.span+gap})}arrange(n,0,0);
    }
    const parent=visible.find(x=>x.isParent);if(parent){parent.bx=radial?-w/2+90:n.bx-(state.layout==='organization'?190:180);parent.by=radial?-usableH/2+45:n.by-(state.layout==='organization'?70:90);parent.bz=state.mode==='3d'?-90:0}
    needsPaint=true;
  }
`+s.slice(end);
s=s.replace("top=compactLayout?210:176,bottom=compactLayout?185:150","top=compactLayout?230:185,bottom=compactLayout?180:155");
s=s.replace("if(!child.children.length)continue;", "if(!child.children.length||(!radial&&first.length>12))continue;");
s=s.replace("r.kind==='group'?'<small>'+r.links.toLocaleString()+' 个网址</small>':''", "r.kind==='group'?'<small>'+r.links.toLocaleString()+' 个网址</small>':r.kind==='scene'?'<small>'+r.children.length+' 个分组</small>':''");
fs.writeFileSync('dist/space-atlas.js',s);
