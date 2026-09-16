/* 浮游灵感: a self-contained cover. Shared navigation and workspace actions are untouched. */
(() => {
  'use strict';
  COPY_DEFAULTS.flow={title:'让灵感，\n自在流动。',intro:'轻轻拨动，让喜欢的事物相遇。'};
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function random(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

  // Low-resolution velocity advection and pressure projection create a lingering wake.
  // Blocks have their own mass, angular inertia, drag, contact and downward acceleration.
  class FlowField {
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
        this.u[i]=clamp(this.u[i]+(vx-py/radius*swirl)*w,-850,850);
        this.v[i]=clamp(this.v[i]+(vy+px/radius*swirl)*w,-850,850);
      }
    }
    step(dt){
      const {nx,ny,dx,dy,u,v,oldU,oldV,pressure:p,div,curl}=this,h=(dx+dy)/2,fade=Math.exp(-.42*dt);
      oldU.set(u);oldV.set(v);
      for(let y=1;y<ny-1;y++)for(let x=1;x<nx-1;x++){
        const i=y*nx+x,px=x-oldU[i]*dt/dx,py=y-oldV[i]*dt/dy;
        u[i]=this.sample(oldU,px,py)*fade;v[i]=this.sample(oldV,px,py)*fade;
      }
      for(let y=1;y<ny-1;y++)for(let x=1;x<nx-1;x++){const i=y*nx+x;curl[i]=(v[i+1]-v[i-1])/(2*dx)-(u[i+nx]-u[i-nx])/(2*dy);}
      for(let y=2;y<ny-2;y++)for(let x=2;x<nx-2;x++){
        const i=y*nx+x,gx=(Math.abs(curl[i+1])-Math.abs(curl[i-1]))/dx,gy=(Math.abs(curl[i+nx])-Math.abs(curl[i-nx]))/dy,len=Math.hypot(gx,gy)+.0001;
        u[i]=clamp(u[i]+gy/len*curl[i]*18*dt,-850,850);v[i]=clamp(v[i]-gx/len*curl[i]*18*dt,-850,850);
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
  function mountFlow(root){
    const copy=currentCopy('flow');
    root.insertAdjacentHTML('afterbegin',`<div class="flow-cover"><canvas class="flow-canvas" aria-hidden="true"></canvas><div class="flow-copy"><span class="flow-eyebrow">浮游灵感</span><h1 data-flow-title></h1><p data-flow-intro></p></div><span class="flow-touch-hint">轻触或滑动，拨动灵感</span></div>`);
    const cover=root.querySelector('.flow-cover'),canvas=cover.querySelector('canvas'),ctx=canvas.getContext('2d',{alpha:true});
    cover.querySelector('[data-flow-title]').textContent=copy.title;cover.querySelector('[data-flow-intro]').textContent=copy.intro;
    if(!ctx)return;
    const reduce=matchMedia('(prefers-reduced-motion: reduce)'),rand=random(94176);
    let width=0,height=0,dpr=1,field,blocks=[],head,next,hashCols,frame=0,last=0,clock=0,disposed=false,previous=null,ink='#fff',tone='#d9e1ff',modalOpen=false;
    const cell=24,pixel=document.createElement('canvas');pixel.width=pixel.height=1;const pixelContext=pixel.getContext('2d',{willReadFrequently:true});
    function colors(){
      if(disposed||!root.isConnected)return;
      const color=getComputedStyle(cover).backgroundColor;
      pixelContext.fillStyle=color;pixelContext.fillRect(0,0,1,1);
      const rgb=pixelContext.getImageData(0,0,1,1).data;
      const linear=[...rgb].slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
      const luminance=linear[0]*.2126+linear[1]*.7152+linear[2]*.0722,light=luminance<.2;
      ink=light?'#f5f7ff':'#172539';tone=light?'#c7d4ff':'#425775';
      document.body.style.setProperty('--flow-ink',ink);
      cover.style.setProperty('--flow-ink',ink);
      if(reduce.matches||modalOpen)draw();
    }
    function resize(){
      if(disposed)return;
      const r=cover.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height),ratio=Math.min(devicePixelRatio||1,2,Math.sqrt(4800000/(w*h)));
      if(w===width&&h===height&&ratio===dpr)return;
      const oldWidth=width,oldHeight=height;width=w;height=h;dpr=ratio;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      field=new FlowField(w,h);hashCols=Math.ceil(w/cell)+1;head=new Int32Array(hashCols*(Math.ceil(h/cell)+1));
      const count=clamp(Math.round(w*h/1500),190,1150);
      if(blocks.length&&oldWidth&&oldHeight)blocks.forEach(p=>{p.x=p.x/oldWidth*w;p.y=p.y/oldHeight*h;p.vx*=.5;p.vy*=.5;});
      blocks.length=Math.min(blocks.length,count);
      while(blocks.length<count){
        let x,y;for(let tries=0;tries<20;tries++){x=rand()*w;y=rand()*h;const center=((x-w*.5)/(w*.35))**2+((y-h*.4)/(h*.25))**2;if(center>1||rand()<.07)break;}
        const r=3.5+rand()*3.9;
        blocks.push({x,y,r,m:r/5.5,vx:(rand()-.5)*12,vy:rand()*8,angle:rand()*Math.PI*2,spin:(rand()-.5)*.4,tilt:rand()*6.28,kind:Math.floor(rand()*6),tone:rand()>.8});
      }
      next=new Int32Array(count);canvas.dataset.particles=String(count);previous=null;colors();draw();
    }
    function contacts(){
      head.fill(-1);
      for(let i=0;i<blocks.length;i++){
        const a=blocks[i],cx=clamp(Math.floor(a.x/cell),0,hashCols-1),cy=clamp(Math.floor(a.y/cell),0,Math.floor((head.length-1)/hashCols));
        for(let yy=Math.max(0,cy-1);yy<=cy+1;yy++)for(let xx=Math.max(0,cx-1);xx<=Math.min(hashCols-1,cx+1);xx++){
          const bucket=yy*hashCols+xx;if(bucket>=head.length)continue;
          for(let j=head[bucket];j!==-1;j=next[j]){
            const b=blocks[j],dx=b.x-a.x,dy=b.y-a.y,min=(a.r+b.r)*.92,sq=dx*dx+dy*dy;if(sq>=min*min)continue;
            const distance=Math.sqrt(sq)||.01,nx=sq?dx/distance:1,ny=sq?dy/distance:0,overlap=(min-distance)*.52,share=b.m/(a.m+b.m);
            a.x-=nx*overlap*share;a.y-=ny*overlap*share;b.x+=nx*overlap*(1-share);b.y+=ny*overlap*(1-share);
            const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
            if(relative<0){const impulse=-relative*.64;a.vx-=impulse*nx*share;a.vy-=impulse*ny*share;b.vx+=impulse*nx*(1-share);b.vy+=impulse*ny*(1-share);const twist=clamp(((b.vx-a.vx)*ny-(b.vy-a.vy)*nx)*.006,-.4,.4);a.spin+=twist;b.spin-=twist;}
          }
        }
        const bucket=cy*hashCols+cx;next[i]=head[bucket];head[bucket]=i;
      }
    }
    function simulate(dt){
      clock+=dt;field.step(dt);
      for(const p of blocks){
        const x=p.x/field.dx+1,y=p.y/field.dy+1;
        const currentX=field.sample(field.u,x,y),currentY=field.sample(field.v,x,y),curl=field.sample(field.curl,x,y),drag=1-Math.exp(-dt*3.5/p.m);
        const idleX=Math.sin(p.y/height*6+clock*.12)*7,idleY=-Math.cos(p.x/width*6.28)*8;
        p.vx+=(currentX+idleX-p.vx)*drag;p.vy+=(currentY+idleY-p.vy)*drag+16*p.m*dt;
        const ex=(p.x-width*.5)/(width*.31),ey=(p.y-height*.4)/(height*.22),q=ex*ex+ey*ey;
        if(q<1&&Math.hypot(currentX,currentY)<35){p.vx+=ex*(1-q)*24*dt;p.vy+=ey*(1-q)*24*dt;}
        p.vx=clamp(p.vx,-650,650);p.vy=clamp(p.vy,-650,650);p.x+=p.vx*dt;p.y+=p.vy*dt;
        p.spin=clamp(p.spin+(curl*1.4-p.spin)*Math.min(1,dt*2),-9,9);p.angle+=p.spin*dt;p.tilt+=(p.spin*.38+p.vx*.002)*dt;
        if(p.x<p.r){p.x=p.r;p.vx=Math.abs(p.vx)*.35;}if(p.x>width-p.r){p.x=width-p.r;p.vx=-Math.abs(p.vx)*.35;}
        if(p.y<p.r){p.y=p.r;p.vy=Math.abs(p.vy)*.3;}if(p.y>height-p.r){p.y=height-p.r;p.vy=-Math.abs(p.vy)*.25;p.vx*=.98;}
      }
      contacts();
    }
    function draw(){
      if(disposed||!width)return;
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      for(const p of blocks){
        const c=Math.cos(p.angle),s=Math.sin(p.angle),sx=p.r*(.73+.27*Math.abs(Math.cos(p.tilt))),sy=p.r;
        ctx.setTransform(dpr*c*sx,dpr*s*sx,-dpr*s*sy,dpr*c*sy,dpr*p.x,dpr*p.y);
        ctx.globalAlpha=p.tone?.54:.9;ctx.fillStyle=p.tone?tone:ink;ctx.fill(shapes[p.kind]);
        ctx.globalAlpha=.14;ctx.strokeStyle=ink;ctx.lineWidth=.09;ctx.stroke(shapes[p.kind]);
      }
      ctx.globalAlpha=1;ctx.setTransform(dpr,0,0,dpr,0,0);
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
      if(active)frame=requestAnimationFrame(tick);else draw();
    }
    function inputAllowed(event){return !disposed&&!reduce.matches&&!document.hidden&&!modalOpen&&!event.target.closest('button,a,input,textarea,select,dialog,.dock,.header-right');}
    function move(event){
      if(!inputAllowed(event)){previous=null;return;}
      const now=performance.now(),x=event.clientX,y=event.clientY;
      if(previous&&previous.id===event.pointerId){
        const dt=clamp((now-previous.time)/1000,.008,.05),dx=x-previous.x,dy=y-previous.y,distance=Math.hypot(dx,dy),steps=clamp(Math.ceil(distance/30),1,10),vx=clamp(dx/dt,-1800,1800),vy=clamp(dy/dt,-1800,1800);
        if(distance<Math.max(width,height)*.65)for(let k=1;k<=steps;k++)field.stir(previous.x+dx*k/steps,previous.y+dy*k/steps,vx*.38/steps,vy*.38/steps,width<600?86:122);
      }
      previous={x,y,time:now,id:event.pointerId};
    }
    function tap(event){if(inputAllowed(event))field.stir(event.clientX,event.clientY,0,-90,width<600?108:150,360);}
    function leave(){previous=null;}
    cover.addEventListener('pointermove',move,{passive:true});cover.addEventListener('pointerdown',tap,{passive:true});cover.addEventListener('pointerleave',leave);
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(cover);
    const bodyObserver=new MutationObserver(records=>{if(records.some(r=>r.attributeName==='open'))run();if(records.some(r=>r.target===document.body&&r.attributeName==='data-dark'))colors();});
    bodyObserver.observe(document.body,{attributes:true,subtree:true,attributeFilter:['open','data-dark']});
    const paletteObserver=new MutationObserver(colors);paletteObserver.observe(document.documentElement,{attributes:true,attributeFilter:['style']});
    document.addEventListener('visibilitychange',run);reduce.addEventListener('change',run);window.addEventListener('resize',resize);
    const cleanupObserver=new MutationObserver(()=>{if(root.isConnected)return;disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();bodyObserver.disconnect();paletteObserver.disconnect();cleanupObserver.disconnect();document.removeEventListener('visibilitychange',run);reduce.removeEventListener('change',run);window.removeEventListener('resize',resize);blocks=[];});
    cleanupObserver.observe(root.parentNode,{childList:true});resize();run();
  }
  const homeBefore=home;home=function(){homeBefore();if(effective().theme==='flow'){const root=$('.home-flow');if(root)mountFlow(root);}};
  const copyBefore=applyHomeCopy;applyHomeCopy=function(){copyBefore();if(view!=='home'||effective().theme!=='flow')return;const copy=currentCopy('flow'),title=$('[data-flow-title]'),intro=$('[data-flow-intro]');if(title)title.textContent=copy.title;if(intro)intro.textContent=copy.intro;};
  const artBefore=themeArtwork;themeArtwork=function(id){if(id!=='flow')return artBefore(id);const rand=random(632),forms=['<circle r="2.7"/>','<rect x="-2.5" y="-2.5" width="5" height="5"/>','<path d="M0-3 3 2-3 2Z"/>','<path d="M-1-3h2v2h2v2H1v2h-2V1h-2v-2h2Z"/>'];return '<svg viewBox="0 0 240 135" aria-hidden="true"><rect width="240" height="135" fill="#5365ce"/><g fill="#f5f7ff">'+Array.from({length:82},()=>{let x=rand()*240,y=rand()*135;if(x>52&&x<187&&y>28&&y<88)y+=66;return '<g transform="translate('+x+' '+y+') rotate('+rand()*360+')">'+forms[Math.floor(rand()*4)]+'</g>';}).join('')+'</g><text x="120" y="67" text-anchor="middle" fill="white" font-size="19" font-family="sans-serif">自在流动</text></svg>';};
  if(new URL(location.href).searchParams.get('theme')==='flow'){scope='global';changeTheme('flow');}
  else if(effective().theme==='flow')render();
})();
