/* 灵感落雪: a self-contained cover. Shared navigation and workspace actions are untouched. */
(() => {
  'use strict';
  COPY_DEFAULTS.surge={title:'让灵感\n缓缓落下',intro:'每一个落下的念头，都有停泊之处。'};
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const styleSwitch=()=>`<div class="inspiration-style-switch" data-active-style="surge"><button class="surge-eyebrow inspiration-style-label" data-inspiration-toggle title="点击切换为混沌成形" aria-label="当前为灵感落雪，点击切换为混沌成形"><span>灵感落雪</span><span class="inspiration-style-mark" aria-hidden="true"><i></i><i></i></span></button></div>`;
  function transitionLayer(cover,transition){
    if(!transition?.image)return;
    const veil=document.createElement('img');veil.className='inspiration-transition-veil';veil.alt='';veil.src=transition.image;cover.appendChild(veil);
    requestAnimationFrame(()=>requestAnimationFrame(()=>veil.classList.add('is-leaving')));
    setTimeout(()=>veil.remove(),1900);
  }
  function random(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

  // Independent variation of flow: a falling, recirculating body of pieces.
  // A swept pointer collision and paired vortices lift a crest instead of attracting pieces.
  class SurgeField {
    constructor(width,height){
      this.nx=clamp(Math.ceil(width/29)+2,14,88);this.ny=clamp(Math.ceil(height/29)+2,14,64);
      this.dx=width/(this.nx-2);this.dy=height/(this.ny-2);this.n=this.nx*this.ny;
      for(const k of ['u','v','oldU','oldV','pressure','div','curl'])this[k]=new Float32Array(this.n);
    }
    sample(a,x,y){
      x=clamp(x,.5,this.nx-1.5);y=clamp(y,.5,this.ny-1.5);
      const ix=Math.floor(x),iy=Math.floor(y),tx=x-ix,ty=y-iy,i=iy*this.nx+ix;
      return(a[i]*(1-tx)+a[i+1]*tx)*(1-ty)+(a[i+this.nx]*(1-tx)+a[i+this.nx+1]*tx)*ty;
    }
    stir(x,y,vx,vy,radius,swirl=0){
      const gx=x/this.dx+1,gy=y/this.dy+1,rx=radius/this.dx,ry=radius/this.dy;
      for(let yy=Math.max(1,Math.floor(gy-ry));yy<Math.min(this.ny-1,gy+ry);yy++)for(let xx=Math.max(1,Math.floor(gx-rx));xx<Math.min(this.nx-1,gx+rx);xx++){
        const px=(xx-gx)*this.dx,py=(yy-gy)*this.dy,q=(px*px+py*py)/(radius*radius);if(q>=1)continue;
        const w=(1-q)**2,i=yy*this.nx+xx;
        this.u[i]=clamp(this.u[i]+(vx-py/radius*swirl)*w,-1400,1400);
        this.v[i]=clamp(this.v[i]+(vy+px/radius*swirl)*w,-1400,1400);
      }
    }
    step(dt){
      const {nx,ny,dx,dy,u,v,oldU,oldV,pressure:p,div,curl}=this,h=(dx+dy)/2,fade=Math.exp(-.8*dt);
      oldU.set(u);oldV.set(v);
      for(let y=1;y<ny-1;y++)for(let x=1;x<nx-1;x++){
        const i=y*nx+x,px=x-oldU[i]*dt/dx,py=y-oldV[i]*dt/dy;
        u[i]=this.sample(oldU,px,py)*fade;v[i]=this.sample(oldV,px,py)*fade;
      }
      for(let y=1;y<ny-1;y++)for(let x=1;x<nx-1;x++){const i=y*nx+x;curl[i]=(v[i+1]-v[i-1])/(2*dx)-(u[i+nx]-u[i-nx])/(2*dy);}
      for(let y=2;y<ny-2;y++)for(let x=2;x<nx-2;x++){
        const i=y*nx+x,gx=(Math.abs(curl[i+1])-Math.abs(curl[i-1]))/dx,gy=(Math.abs(curl[i+nx])-Math.abs(curl[i-nx]))/dy,len=Math.hypot(gx,gy)+.0001;
        u[i]=clamp(u[i]+gy/len*curl[i]*24*dt,-1400,1400);v[i]=clamp(v[i]-gx/len*curl[i]*24*dt,-1400,1400);
      }
      p.fill(0);
      for(let y=1;y<ny-1;y++)for(let x=1;x<nx-1;x++){const i=y*nx+x;div[i]=((u[i+1]-u[i-1])/dx+(v[i+nx]-v[i-nx])/dy)*.5;}
      for(let pass=0;pass<9;pass++)for(let y=1;y<ny-1;y++)for(let x=1;x<nx-1;x++){const i=y*nx+x;p[i]=(p[i-1]+p[i+1]+p[i-nx]+p[i+nx]-div[i]*h*h)/4;}
      for(let y=1;y<ny-1;y++)for(let x=1;x<nx-1;x++){const i=y*nx+x;u[i]-=(p[i+1]-p[i-1])/(2*dx);v[i]-=(p[i+nx]-p[i-nx])/(2*dy);}
    }
  }
  function makeShapes(){
    const circle=new Path2D();circle.arc(0,0,.92,0,Math.PI*2);
    const square=new Path2D();square.roundRect(-.88,-.88,1.76,1.76,.13);
    const tri=new Path2D('M0 -1.08 L1 .74 L-1 .74 Z');
    const cross=new Path2D('M-.23 -1H.23V-.23H1V.23H.23V1H-.23V.23H-1V-.23H-.23Z');
    const capsule=new Path2D();capsule.roundRect(-.5,-1.12,1,2.24,.45);
    const diamond=new Path2D('M0 -1.08 1 0 0 1.08 -1 0Z');
    return[circle,square,tri,cross,capsule,diamond];
  }
  const shapes=makeShapes();
  function mountSurge(root){
    const transition=globalThis.__inspirationTransition?.toStyle==='surge'?globalThis.__inspirationTransition:null;
    if(transition)delete globalThis.__inspirationTransition;
    const copy=currentCopy('surge');
    root.insertAdjacentHTML('afterbegin',`<div class="surge-cover"><canvas class="surge-canvas" aria-hidden="true"></canvas><svg class="surge-filter-defs" aria-hidden="true"><defs><filter id="surge-water-glass" x="-10%" y="-20%" width="120%" height="140%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".014 .035" numOctaves="2" seed="7" result="water"/><feDisplacementMap in="SourceGraphic" in2="water" scale="16" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="1.4"/></filter></defs></svg><div class="surge-copy">${styleSwitch()}<h1><span data-surge-title></span><span class="surge-glass-title" aria-hidden="true"></span></h1><p data-surge-intro></p></div><canvas class="surge-water" aria-hidden="true"></canvas><span class="surge-touch-hint">轻触或滑动，掀起一阵浪</span></div>`);
    const cover=root.querySelector('.surge-cover'),canvas=cover.querySelector('canvas'),ctx=canvas.getContext('2d',{alpha:true});
    cover.querySelector('[data-surge-title]').textContent=copy.title;cover.querySelector('.surge-glass-title').textContent=copy.title;cover.querySelector('[data-surge-intro]').textContent=copy.intro;
    if(!ctx)return;
    const reduce=matchMedia('(prefers-reduced-motion: reduce)'),rand=random(94176);
    const water=cover.querySelector('.surge-water'),waterCtx=water.getContext('2d'),heading=cover.querySelector('h1');
    let width=0,height=0,dpr=1,field,blocks=[],head,next,hashCols,frame=0,last=0,clock=0,disposed=false,previous=null,ink='#fff',tone='#d9e1ff',modalOpen=false,inherited=transition?.particles||null;
    const glassTitle=cover.querySelector('.surge-glass-title');
    let wake=[],ripples=[],lens=null,lastRipple=0,wakeStroke=0,headingRect,lightInk=true,waterBackground='#5e6fd9',waterWasDrawn=false;
    const cell=24,pixel=document.createElement('canvas');pixel.width=pixel.height=1;const pixelContext=pixel.getContext('2d',{willReadFrequently:true});
    function colors(){
      if(disposed||!root.isConnected)return;
      const color=getComputedStyle(cover).backgroundColor;waterBackground=color;
      pixelContext.fillStyle=color;pixelContext.fillRect(0,0,1,1);
      const rgb=pixelContext.getImageData(0,0,1,1).data;
      const linear=[...rgb].slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
      const luminance=linear[0]*.2126+linear[1]*.7152+linear[2]*.0722,light=luminance<.3;
      lightInk=light;ink=light?'#f5f7ff':'#26354b';tone=light?'#c7d4ff':'#66758c';
      document.body.style.setProperty('--surge-ink',ink);
      cover.style.setProperty('--surge-ink',ink);
      if(reduce.matches||modalOpen)draw();
    }
    function resize(){
      if(disposed)return;
      const r=cover.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height),ratio=Math.min(devicePixelRatio||1,2,Math.sqrt(4800000/(w*h)));
      if(w===width&&h===height&&ratio===dpr)return;
      const oldWidth=width,oldHeight=height;width=w;height=h;dpr=ratio;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);water.width=canvas.width;water.height=canvas.height;
      field=new SurgeField(w,h);hashCols=Math.ceil(w/cell)+1;head=new Int32Array(hashCols*(Math.ceil(h/cell)+1));
      const count=inherited?.length?clamp(inherited.length,190,2400):clamp(Math.round(w*h/720),380,2400);
      if(blocks.length&&oldWidth&&oldHeight)blocks.forEach(p=>{p.x=p.x/oldWidth*w;p.y=p.y/oldHeight*h;p.laneOffset=p.laneOffset/oldWidth*w;p.vx*=.5;p.vy*=.5;});
      blocks.length=Math.min(blocks.length,count);
      while(blocks.length<count){
        const y=rand()*h*1.25-h*.25,lane=Math.floor(rand()*7),laneOffset=(rand()-.5)*w*.075,x=spawnX(lane,y,laneOffset),r=3.5+rand()*3.7;
        blocks.push({x,y,r,m:r/5.5,vx:(rand()-.5)*20,vy:125+rand()*85,angle:rand()*Math.PI*2,spin:(rand()-.5)*1.2,tilt:rand()*6.28,kind:Math.floor(rand()*6),tone:rand()>.88,rest:0,sleep:0,sleeping:false,life:2.2+rand()*2.8,lane,laneOffset});
      }
      if(inherited?.length){blocks.forEach((p,i)=>{const source=inherited[i%inherited.length];p.x=clamp(source.x*w,p.r,w-p.r);p.y=clamp(source.y*h,-h*.4,h-p.r);p.vx=source.vx||0;p.vy=source.vy||0;p.angle=source.angle||0;p.spin=source.spin||0;p.tilt=source.tilt||0;p.kind=source.kind??p.kind;p.tone=source.tone??p.tone;p.lane=i%7;p.laneOffset=clamp(p.x-laneCenter(p.lane,p.y),-w*.13,w*.13);p.rest=0;p.sleep=0;p.sleeping=false;});inherited=null;}
      next=new Int32Array(count);canvas.dataset.particles=String(count);previous=null;wake=[];ripples=[];lens=null;headingRect=heading.getBoundingClientRect();colors();draw();
    }
    function laneCenter(lane,y){return width*(.06+lane*.88/6)+Math.sin(y*.006+clock*.52+lane*1.7)*width*.036+Math.sin(y*.002-clock*.35+lane)*width*.018;}
    function spawnX(lane=Math.floor(rand()*7),y=0,offset=(rand()-.5)*width*.075){return clamp(laneCenter(lane,y)+offset,0,width);}
    function contacts(){
      head.fill(-1);
      for(let i=0;i<blocks.length;i++){
        const a=blocks[i],cx=clamp(Math.floor(a.x/cell),0,hashCols-1),cy=clamp(Math.floor(a.y/cell),0,Math.floor((head.length-1)/hashCols));
        for(let yy=Math.max(0,cy-1);yy<=cy+1;yy++)for(let xx=Math.max(0,cx-1);xx<=Math.min(hashCols-1,cx+1);xx++){
          const bucket=yy*hashCols+xx;if(bucket>=head.length)continue;
          for(let j=head[bucket];j!==-1;j=next[j]){
            const b=blocks[j],dx=b.x-a.x,dy=b.y-a.y,min=(a.r+b.r)*.92,sq=dx*dx+dy*dy;if(sq>=min*min)continue;
            if(a.sleeping&&b.sleeping)continue;
            const distance=Math.sqrt(sq)||.01,nx=sq?dx/distance:1,ny=sq?dy/distance:0,overlap=(min-distance)*.82,mobileA=a.sleeping?0:1,mobileB=b.sleeping?0:1,mobility=mobileA+mobileB;
            a.x-=nx*overlap*mobileA/mobility;a.y-=ny*overlap*mobileA/mobility;b.x+=nx*overlap*mobileB/mobility;b.y+=ny*overlap*mobileB/mobility;
            const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
            if(relative<0){const impulse=-relative*.72;if(mobileA){a.vx-=impulse*nx;a.vy-=impulse*ny;}if(mobileB){b.vx+=impulse*nx;b.vy+=impulse*ny;}const twist=clamp(((b.vx-a.vx)*ny-(b.vy-a.vy)*nx)*.004,-.3,.3);if(mobileA)a.spin+=twist;if(mobileB)b.spin-=twist;}
          }
        }
        const bucket=cy*hashCols+cx;next[i]=head[bucket];head[bucket]=i;
      }
    }
    function simulate(dt){
      clock+=dt;field.step(dt);
      for(const p of blocks){
        if(p.sleeping){
          p.rest+=dt;
          if(p.rest>p.life){p.y=-18-rand()*120;p.lane=Math.floor(rand()*7);p.laneOffset=(rand()-.5)*width*.075;p.x=spawnX(p.lane,p.y,p.laneOffset);p.vx=(rand()-.5)*22;p.vy=125+rand()*85;p.rest=0;p.sleep=0;p.sleeping=false;}
          continue;
        }
        const x=p.x/field.dx+1,y=p.y/field.dy+1;
        const currentX=field.sample(field.u,x,y),currentY=field.sample(field.v,x,y),curl=field.sample(field.curl,x,y),drag=1-Math.exp(-dt*1.65/p.m);
        const lanePull=clamp((laneCenter(p.lane??0,p.y)+(p.laneOffset||0)-p.x)*1.05,-150,150),streamX=lanePull+Math.sin(p.y*.011+clock*.9)*34,streamY=58+Math.cos(p.x*.008+p.y*.003-clock*.5)*22;
        p.vx+=(currentX+streamX-p.vx)*drag;p.vy+=(currentY+streamY-p.vy)*drag+400*p.m*dt;
        p.vx=clamp(p.vx,-1300,1300);p.vy=clamp(p.vy,-1350,950);p.x+=p.vx*dt;p.y+=p.vy*dt;
        p.spin=clamp(p.spin+(curl*.85-p.spin)*Math.min(1,dt*.8),-14,14);p.angle+=p.spin*dt;p.tilt+=(p.spin*.4+p.vx*.003)*dt;
        if(p.x<p.r){p.x=p.r;p.vx=Math.abs(p.vx)*.35;}if(p.x>width-p.r){p.x=width-p.r;p.vx=-Math.abs(p.vx)*.35;}
        if(p.y < -height*.4){p.y=-height*.4;p.vy=Math.abs(p.vy)*.15;}
        if(p.y>height-p.r){p.y=height-p.r;p.vy=Math.abs(p.vy)<135?0:-Math.abs(p.vy)*.055;p.vx*=Math.exp(-dt*12);p.spin*=Math.exp(-dt*8);}
        const settling=p.y>height-82&&Math.hypot(p.vx,p.vy)<42;
        p.sleep=settling?p.sleep+dt:0;
        if(p.sleep>.16){p.sleeping=true;p.vx=0;p.vy=0;p.spin=0;p.rest=0;}
      }
      contacts();contacts();
      for(const p of wake){p.age+=dt;const x=p.x/field.dx+1,y=p.y/field.dy+1;p.x+=field.sample(field.u,x,y)*dt*.055;p.y+=(field.sample(field.v,x,y)*.055+8)*dt;}
      wake=wake.filter(p=>p.age<.92);for(const r of ripples)r.age+=dt;ripples=ripples.filter(r=>r.age<.9);
    }
    function draw(){
      if(disposed||!width)return;
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      for(const p of blocks){
        const c=Math.cos(p.angle),s=Math.sin(p.angle),sx=p.r*(.73+.27*Math.abs(Math.cos(p.tilt))),sy=p.r;
        ctx.setTransform(dpr*c*sx,dpr*s*sx,-dpr*s*sy,dpr*c*sy,dpr*p.x,dpr*p.y);
        ctx.globalAlpha=(p.tone?.63:.92)*Math.min(1,(p.life-p.rest)*4);ctx.fillStyle=p.tone?tone:ink;ctx.fill(shapes[p.kind]);
      }
      ctx.globalAlpha=1;ctx.setTransform(dpr,0,0,dpr,0,0);drawWater();
    }
    function smoothPath(context,points,close=false){
      if(!points.length)return;context.beginPath();context.moveTo(points[0].x,points[0].y);
      for(let i=1;i<points.length-1;i++)context.quadraticCurveTo(points[i].x,points[i].y,(points[i].x+points[i+1].x)/2,(points[i].y+points[i+1].y)/2);
      if(points.length>1)context.lineTo(points.at(-1).x,points.at(-1).y);if(close)context.closePath();
    }
    function ribbonEdges(points){
      const upper=[],lower=[];
      for(let i=0;i<points.length;i++){
        const p=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1;
        const taper=Math.min(1,i/4,(points.length-1-i)/4),spread=p.radius*Math.sin(Math.PI*clamp(1-p.age/.92,0,1))*taper;
        upper.push({x:p.x-dy/length*spread,y:p.y+dx/length*spread});lower.push({x:p.x+dy/length*spread,y:p.y-dx/length*spread});
      }
      return{upper,lower,outline:[...upper,...lower.slice().reverse()]};
    }
    function updateGlassTrail(points){
      const near=points.filter(p=>p.age<.78&&p.x>headingRect.left-p.radius&&p.x<headingRect.right+p.radius&&p.y>headingRect.top-p.radius&&p.y<headingRect.bottom+p.radius);
      if(near.length<2){glassTitle.style.opacity='0';glassTitle.style.clipPath='polygon(0 0,0 0,0 0)';glassTitle.style.transform='none';return;}
      const {outline}=ribbonEdges(near),polygon=outline.map(p=>`${(p.x-headingRect.left).toFixed(1)}px ${(p.y-headingRect.top).toFixed(1)}px`).join(','),last=near.at(-1),before=near[Math.max(0,near.length-3)],dx=last.x-before.x,dy=last.y-before.y,length=Math.hypot(dx,dy)||1;
      glassTitle.style.clipPath=`polygon(${polygon})`;
      glassTitle.style.opacity=String(clamp(1-last.age/.78,.2,1));
      glassTitle.style.transform=`translate(${(dx/length*11).toFixed(1)}px,${(dy/length*11).toFixed(1)}px)`;
    }
    function drawWater(){
      if(!waterCtx)return;const c=waterCtx;c.setTransform(dpr,0,0,dpr,0,0);
      if(!wake.length&&!ripples.length){if(waterWasDrawn){c.clearRect(0,0,width,height);waterWasDrawn=false;glassTitle.style.opacity='0';glassTitle.style.clipPath='polygon(0 0,0 0,0 0)';glassTitle.style.transform='none';cover.dataset.wake='0';}return;}
      waterWasDrawn=true;c.clearRect(0,0,width,height);c.lineJoin='round';c.lineCap='round';
      // Each pointer stroke keeps its own smooth ribbon, so separate gestures never form a jagged bridge.
      if(wake.length>2){
        const strokes=new Map();for(const p of wake){if(!strokes.has(p.stroke))strokes.set(p.stroke,[]);strokes.get(p.stroke).push(p);}
        for(const points of strokes.values()){
          if(points.length<3)continue;
          const {upper,lower,outline}=ribbonEdges(points),alpha=clamp((1-points.at(-1).age/.92)*.72,0,1),averageRadius=points.reduce((sum,p)=>sum+p.radius,0)/points.length;
          // The broad translucent body carries a slightly displaced copy of the pieces below it.
          c.save();smoothPath(c,outline,true);c.clip();c.globalAlpha=alpha;c.fillStyle=waterBackground;c.fillRect(0,0,width,height);c.drawImage(canvas,0,0,canvas.width,canvas.height,5,2,width,height);c.restore();
          c.save();c.globalAlpha=alpha*.2;c.filter='blur(5px)';smoothPath(c,points);c.strokeStyle=lightInk?'rgba(150,181,245,.2)':'rgba(46,78,124,.15)';c.lineWidth=averageRadius*.72;c.stroke();c.restore();
          c.globalAlpha=alpha*.55;smoothPath(c,upper);c.strokeStyle=lightInk?'rgba(167,197,255,.2)':'rgba(48,83,132,.18)';c.lineWidth=.65;c.stroke();smoothPath(c,lower);c.strokeStyle=lightInk?'rgba(8,24,58,.13)':'rgba(31,68,88,.12)';c.lineWidth=.65;c.stroke();
        }
        updateGlassTrail(strokes.get(wake.at(-1).stroke)||[]);
      }else{
        glassTitle.style.opacity='0';
      }
      for(const r of ripples){
        const age=r.age,radius=r.radius+age*(170+r.power*85),alpha=(1-age)**2*r.power;c.globalAlpha=alpha;
        c.beginPath();for(let i=0;i<=56;i++){const a=i/56*Math.PI*2,rr=radius*(1+.028*Math.sin(a*5-age*8)),x=r.x+Math.cos(a)*rr,y=r.y+Math.sin(a)*rr*.64+age*20;i?c.lineTo(x,y):c.moveTo(x,y);}
        c.strokeStyle=lightInk?'rgba(158,191,255,.18)':'rgba(48,83,132,.2)';c.lineWidth=1;c.stroke();c.save();c.translate(0,2);c.strokeStyle='rgba(12,35,59,.11)';c.stroke();c.restore();
      }
      c.globalAlpha=1;
      cover.dataset.wake=String(wake.length);
    }
    function tick(now){
      frame=0;if(disposed||document.hidden||modalOpen||reduce.matches)return;
      const dt=last?Math.min((now-last)/1000,.034):1/60;last=now;
      simulate(dt/2);simulate(dt/2);draw();frame=requestAnimationFrame(tick);
    }
    function run(){
      if(disposed)return;cancelAnimationFrame(frame);frame=0;last=0;previous=null;
      modalOpen=!!document.querySelector('dialog[open]');
      const active=!document.hidden&&!modalOpen&&!reduce.matches;canvas.dataset.active=String(active);
      if(active)frame=requestAnimationFrame(tick);else{wake=[];ripples=[];lens=null;draw();}
    }
    function inputAllowed(event){return !disposed&&!reduce.matches&&!document.hidden&&!modalOpen&&!event.target.closest('button,a,input,textarea,select,dialog,.dock,.header-right');}
    function move(event){
      if(!inputAllowed(event)){previous=null;lens=null;return;}
      const samples=event.getCoalescedEvents?.();for(const sample of samples?.length?samples:[event])sweep(sample);
    }
    function sweep(event){
      const now=event.timeStamp||performance.now(),x=event.clientX,y=event.clientY;
      lens={x,y,radius:width<600?80:125};
      if(!previous||previous.id!==event.pointerId||now-previous.time>=150)wakeStroke++;
      if(previous&&previous.id===event.pointerId&&now-previous.time<150){
        const dt=clamp((now-previous.time)/1000,.004,.06),dx=x-previous.x,dy=y-previous.y,distance=Math.hypot(dx,dy),speed=Math.min(3200,distance/dt);
        if(distance>.25){
          const vx=dx/(distance||1)*speed,vy=dy/(distance||1)*speed,radius=(width<600?48:68)+Math.min(46,speed*.018),steps=clamp(Math.ceil(distance/22),1,80),nx=-dy/distance,ny=dx/distance;
          // No pointer easing: sample the entire swept segment, including fast movements.
          for(let k=1;k<=steps;k++){
            const px=previous.x+dx*k/steps,py=previous.y+dy*k/steps;
            field.stir(px,py,vx*.24,vy*.24-Math.min(140,speed*.07),radius);
            field.stir(px+nx*radius*.55,py+ny*radius*.55,0,0,radius*.85,speed*.34);
            field.stir(px-nx*radius*.55,py-ny*radius*.55,0,0,radius*.85,-speed*.34);
            wake.push({x:px,y:py,age:0,radius:22+Math.min(42,speed*.022),stroke:wakeStroke});
          }
          for(const p of blocks){
            const t=clamp(((p.x-previous.x)*dx+(p.y-previous.y)*dy)/(distance*distance),0,1),ox=p.x-(previous.x+dx*t),oy=p.y-(previous.y+dy*t),d=Math.hypot(ox,oy);
            if(d>=radius+p.r)continue;const strength=(1-d/(radius+p.r))**1.3,normal=1/Math.max(d,1),push=Math.min(320,speed*.2)*strength,mix=.64*strength;
            p.vx+=(vx*.7-p.vx)*mix+ox*normal*push;
            p.vy+=(vy*.7-p.vy)*mix+oy*normal*push-Math.min(420,speed*.22)*strength;
            p.spin+=clamp((vx*oy-vy*ox)*normal*.01,-10,10)*strength;p.rest=0;p.sleep=0;p.sleeping=false;
          }
          if(speed>900&&now-lastRipple>180){ripples.push({x,y,age:0,radius:radius*.4,power:.45});lastRipple=now;}
          wake=wake.slice(-110);ripples=ripples.slice(-7);
        }
      }
      previous={x,y,time:now,id:event.pointerId};
    }
    function tap(event){
      if(!inputAllowed(event))return;const radius=width<600?110:160;
      field.stir(event.clientX,event.clientY,0,-700,radius,520);
      for(const p of blocks){const dx=p.x-event.clientX,dy=p.y-event.clientY,d=Math.hypot(dx,dy);if(d<radius){const weight=1-d/radius;p.vx+=dx/Math.max(1,d)*230*weight;p.vy-=650*weight;p.spin+=dx*.04*weight;p.rest=0;p.sleep=0;p.sleeping=false;}}
      ripples.push({x:event.clientX,y:event.clientY,age:0,radius:15,power:1});ripples=ripples.slice(-7);previous={x:event.clientX,y:event.clientY,time:event.timeStamp,id:event.pointerId};
    }
    function leave(){previous=null;lens=null;}
    cover.addEventListener('pointermove',move,{passive:true});cover.addEventListener('pointerdown',tap,{passive:true});cover.addEventListener('pointerleave',leave);cover.addEventListener('pointercancel',leave);cover.addEventListener('pointerup',event=>{if(event.pointerType!=='mouse')leave();});
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(cover);const copyObserver=new ResizeObserver(()=>{headingRect=heading.getBoundingClientRect();});copyObserver.observe(heading);
    const bodyObserver=new MutationObserver(records=>{if(records.some(r=>r.attributeName==='open'))run();if(records.some(r=>r.target===document.body&&r.attributeName==='data-dark'))colors();});
    bodyObserver.observe(document.body,{attributes:true,subtree:true,attributeFilter:['open','data-dark']});
    const paletteObserver=new MutationObserver(colors);paletteObserver.observe(document.documentElement,{attributes:true,attributeFilter:['style']});
    document.addEventListener('visibilitychange',run);reduce.addEventListener('change',run);window.addEventListener('resize',resize);
    const cleanupObserver=new MutationObserver(()=>{if(root.isConnected)return;disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();copyObserver.disconnect();bodyObserver.disconnect();paletteObserver.disconnect();cleanupObserver.disconnect();document.removeEventListener('visibilitychange',run);reduce.removeEventListener('change',run);window.removeEventListener('resize',resize);blocks=[];});
    cover.__inspirationSnapshot=()=>({image:canvas.toDataURL('image/png'),particles:blocks.map(p=>({x:p.x/width,y:p.y/height,vx:p.vx,vy:p.vy,angle:p.angle,spin:p.spin,tilt:p.tilt,kind:p.kind,tone:p.tone}))});
    cleanupObserver.observe(root.parentNode,{childList:true});resize();transitionLayer(cover,transition);run();
  }
  const homeBefore=home;home=function(){homeBefore();if(effective().theme==='flow'&&prefs.flowStyle==='surge'){const root=$('.home-flow');if(root){root.classList.replace('home-flow','home-surge');mountSurge(root);}}};
  const copyBefore=applyHomeCopy;applyHomeCopy=function(){copyBefore();if(view!=='home'||effective().theme!=='flow'||prefs.flowStyle!=='surge')return;const copy=currentCopy('surge'),title=$('[data-surge-title]'),glass=$('.surge-glass-title'),intro=$('[data-surge-intro]');if(title)title.textContent=copy.title;if(glass)glass.textContent=copy.title;if(intro)intro.textContent=copy.intro;};
  const requested=new URL(location.href).searchParams.get('theme');
  if(requested==='surge'){prefs.flowStyle='snow';scope='global';changeTheme('flow');}
  else if(effective().theme==='surge'){prefs.theme='flow';prefs.flowStyle='snow';persist();render();}
})();
