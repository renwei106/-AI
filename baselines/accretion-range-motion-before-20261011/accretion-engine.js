import {PhysicsEngine, Particle, installPeriodicPhysics, periodicDelta} from './vendor/gravity-core.js';
import {sanitize,accretionMassLevels} from './scenes.js';
import {stepCosmicBodies,cosmicMassAppearance} from './engine.js';

const BODY_DISPLAY_SCALE=.1;

// Keep force softening unchanged; contact queries use the drawn solid surface.
class AccretionParticle extends Particle {
  constructor(owner,...args){super(...args);const radius=this.radius;delete this.radius;this.physicalRadius=radius;this.owner=owner;}
  get radius(){return this.physicalRadius*(this.owner?.contactPass?BODY_DISPLAY_SCALE:1);}
  set radius(value){this.physicalRadius=value;}
  get momentOfInertia(){return .5*this.mass*this.physicalRadius*this.physicalRadius;}
}

// Cosmos supplies the shared force/evolution kernel; this renderer retains
// its own births, visual contact scale and asynchronous snapshots.
export class AccretionEngine {
  constructor(canvas,{config={},color,dark=false}={}) {
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.config=sanitize('accretion',config);
    this.setPalette(color,dark);this.paused=false;this.boost=false;this.dead=false;
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);
    this.resize();this.reset();this.last=performance.now();
    if(typeof Worker==='function'){
      this.worker=new Worker(new URL('./accretion-worker.js',import.meta.url),{type:'module'});
      this.worker.onmessage=({data})=>{
        if(data.generation!==this.generation||this.dead)return;
        const bodies=data.bodies.map(p=>({...p,position:{x:p.x,y:p.y}}));
        // Timestamp at dispatch, not delivery: worker latency must not reset motion.
        this.snapshots.push({at:this.sentAt,age:data.age,bodies,merged:data.merged});
        if(this.snapshots.length>16)this.snapshots.shift();
        this.workerBusy=false;
      };
      this.worker.onerror=()=>{this.worker.terminate();this.worker=null;this.workerBusy=false;this.reset();};
      this.reset();
    }
    this.installInteractions();
    this.frame=this.frame.bind(this);this.raf=requestAnimationFrame(this.frame);
  }
  get particles(){return this.physics.particles;}
  get merged(){return this.physics.collisionCount;}
  get shattered(){return 0;}
  setPalette(color,dark){this.color=color;this.dark=dark;}
  setPointer(x,y){const box=this.canvas.getBoundingClientRect();this.pointer={x:x-box.left,y:y-box.top};this.pointerInside=true;if(this.paused)this.draw();}
  clearPointer(){this.pointerInside=false;this.followHintUntil=0;if(this.paused)this.draw();}
  setMagnifier(active){this.magnifierActive=!!active;if(!active)this.followId=null;this.canvas.dispatchEvent(new CustomEvent('emergence-magnifier-change',{detail:{active:!!active}}));this.draw();}
  bodyPoint(p){const previous=this.previousBodies?.get(p.id),blend=this.blend??1;return {x:this.width/2+periodicDelta(previous?previous.position.x+periodicDelta(p.position.x-previous.position.x,this.bounds.width)*blend:p.position.x,this.bounds.width)*this.scale,y:this.height/2+periodicDelta(previous?previous.position.y+periodicDelta(p.position.y-previous.position.y,this.bounds.height)*blend:p.position.y,this.bounds.height)*this.scale};}
  lensView(){const target=this.particles.find(p=>p.id===this.followId&&this.canFocusBody(p));if(this.followId&&!target)this.followId=null;return {...(target?this.bodyPoint(target):this.pointer||{x:this.width/2,y:this.height/2}),radius:Math.min(150,this.width*.23,this.height*.23),zoom:this.lensZoom||2.5};}
  canFocusBody(p){return cosmicMassAppearance(p.mass,{massLevels:accretionMassLevels(this.config)}).stage>=2;}
  pickFocusable(){
    if(!this.pointerInside||!this.pointer)return null;
    const lens=this.lensView(),inside=this.magnifierActive&&Math.hypot(this.pointer.x-lens.x,this.pointer.y-lens.y)<=lens.radius;
    let target=null,best=10;
    for(const p of this.particles){if(!this.canFocusBody(p))continue;const point=this.bodyPoint(p);
      for(const dx of [-this.width,0,this.width])for(const dy of [-this.height,0,this.height]){
        const x=inside?lens.x+(point.x+dx-lens.x)*lens.zoom:point.x+dx,y=inside?lens.y+(point.y+dy-lens.y)*lens.zoom:point.y+dy;
        if(inside&&Math.hypot(x-lens.x,y-lens.y)>lens.radius)continue;
        const distance=Math.hypot(x-this.pointer.x,y-this.pointer.y);if(distance<best){best=distance;target=p.id;}
      }
    }
    return target;
  }
  installInteractions(){
    this.listeners=[];const on=(node,type,fn,options)=>{node.addEventListener(type,fn,options);this.listeners.push(()=>node.removeEventListener(type,fn,options));};
    on(this.canvas,'pointerdown',event=>{if(event.button!==0||!event.isPrimary)return;this.setPointer(event.clientX,event.clientY);const target=this.pickFocusable();this.gesture={x:event.clientX,y:event.clientY,at:performance.now(),target};});
    on(this.canvas,'click',event=>{const g=this.gesture;if(event.button!==0||event.detail>1||!g||g.target==null||performance.now()-g.at>280||Math.hypot(event.clientX-g.x,event.clientY-g.y)>6)return;clearTimeout(this.followTimer);this.followTimer=setTimeout(()=>{if(this.dead||!this.particles.some(p=>p.id===g.target&&this.canFocusBody(p)))return;this.setMagnifier(true);this.followId=g.target;this.followHintUntil=performance.now()+1800;clearTimeout(this.followHintTimer);this.followHintTimer=setTimeout(()=>{this.followHintUntil=0;if(!this.dead&&this.paused)this.draw();},1800);this.draw();},350);});
    on(this.canvas,'dblclick',()=>clearTimeout(this.followTimer));
    on(window,'keydown',event=>{if(event.key==='Escape'&&(this.followId!=null||this.followTimer)){event.preventDefault();event.stopImmediatePropagation();clearTimeout(this.followTimer);this.followTimer=null;this.followId=null;this.draw();}},true);
    on(this.canvas,'contextmenu',event=>{if(this.magnifierActive&&this.followId!=null){event.preventDefault();event.stopImmediatePropagation();this.followId=null;this.setPointer(event.clientX,event.clientY);this.draw();}});
    this.lensWheel=event=>{if(!this.magnifierActive||event.ctrlKey)return false;const box=this.canvas.getBoundingClientRect(),lens=this.lensView();if(Math.hypot(event.clientX-box.left-lens.x,event.clientY-box.top-lens.y)>lens.radius)return false;event.preventDefault();event.stopImmediatePropagation();const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?this.height:1);this.lensZoom=Math.max(2.5,Math.min(10,lens.zoom*Math.exp(-Math.max(-240,Math.min(240,delta))*.002)));this.draw();return true;};
    this.canvas.consumeMagnifierWheel=this.lensWheel;on(this.canvas,'wheel',this.lensWheel,{passive:false});
  }
  setBoost(value){this.boost=value;}
  setPaused(value){const now=performance.now();if(value&&!this.paused)this.pausedAt=now;if(!value&&this.paused){const delay=now-(this.pausedAt||now);for(const snapshot of this.snapshots||[])snapshot.at+=delay;this.sentAt+=delay;}this.paused=value;this.boost=false;this.last=now;this.draw();}
  resize(){
    const rect=this.canvas.getBoundingClientRect();this.width=Math.max(1,rect.width);this.height=Math.max(1,rect.height);
    const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);
    const previous=this.bounds;this.bounds={width:700,height:700*this.height/this.width};this.scale=this.width/700;
    if(this.physics&&previous){for(const p of this.particles){p.position.x*=this.bounds.width/previous.width;p.position.y*=this.bounds.height/previous.height;}this.physics.forcesDirty=true;this.physics.tree=null;}
    if(this.worker){this.snapshots=[];this.previousBodies=null;this.worker.postMessage({type:'resize',bounds:this.bounds,generation:this.generation});}
  }
  reset(){
    this.motionTrails=new Map();this.trailClock=0;
    this.physics=new PhysicsEngine(24);this.physics.G=120*this.config.gravityStrength;
    installPeriodicPhysics(this.physics,()=>this.bounds);this.physics.collisionMode='merge';
    const resolve=this.physics.resolveCollisions.bind(this.physics);
    this.physics.resolveCollisions=previous=>{this.contactPass=true;try{return resolve(previous);}finally{this.contactPass=false;}};
    this.followId=null;clearTimeout(this.followTimer);this.age=0;this.emitted=0;this.openingCount=this.config.count;this.supply=0;this.injectedMass=0;
    this.snapshots=[];this.previousBodies=null;this.previousAge=0;this.nextAge=0;this.workerBusy=false;this.blendAt=0;this.blend=1;
    if(this.worker){this.generation=(this.generation||0)+1;this.worker.postMessage({type:'reset',config:this.config,bounds:this.bounds,generation:this.generation});}
  }
  setScene(id,config){this.config=sanitize('accretion',config);this.reset();}
  setConfig(config){this.config=sanitize('accretion',config);this.physics.G=120*this.config.gravityStrength;this.physics.forcesDirty=true;if(this.worker)this.worker.postMessage({type:'config',config:this.config,generation:this.generation});}
  add(x,y,vx,vy){
    const p=new AccretionParticle(this,x,y,this.config.fragmentMass??.2,vx,vy);p.born=this.age;p.maxTrailLength=0;
    this.physics.addParticle(p);this.injectedMass+=p.mass;return p;
  }
  birth(dt){
    this.age+=dt;
    // A visible charge followed by a spread of launch speeds, never velocity resets.
    const target=Math.min(this.openingCount,Math.floor(Math.max(0,this.age-1.2)/2.2*this.openingCount));
    while(this.emitted<target){const a=Math.random()*Math.PI*2,r=8+Math.random()*18,v=18+Math.random()*65;
      const p=this.add(Math.cos(a)*r,Math.sin(a)*r,Math.cos(a)*v,Math.sin(a)*v);p.cosmicState={burstFloor:(this.config.driftSpeed??.16)*(this.bounds.width/100)/9,burstStart:this.age};this.emitted++;}
    if(this.age<3.4)return;
    // Count the smallest bodies, rather than total bodies: grown stars never
    // consume the dust quota. Refill gradually and avoid spawning inside hosts.
    const dust=this.particles.filter(p=>p.mass<=(this.config.fragmentMass??.2)*(1+1e-6)).length;
    this.supply=Math.min(4,this.supply+dt*Math.min(120,Math.max(12,this.config.count*.16)));
    const quota=Math.min(this.config.count-dust,Math.floor(this.supply));
    let added=0;
    for(let attempt=0;attempt<quota*8&&added<quota;attempt++){
      const x=(Math.random()-.5)*this.bounds.width,y=(Math.random()-.5)*this.bounds.height;
      if(this.particles.some(p=>Math.hypot(periodicDelta(p.position.x-x,this.bounds.width),periodicDelta(p.position.y-y,this.bounds.height))<this.bodyRadius(p.mass,p.radius)+2))continue;
      const a=Math.random()*Math.PI*2,v=(this.config.driftSpeed??.16)*(this.bounds.width/100)*(.8+Math.random()*.4);this.add(x,y,Math.cos(a)*v,Math.sin(a)*v);added++;
    }
    this.supply-=added;
  }
  blackHoleRadius(mass){return Math.min(9,3+6*Math.max(0,Math.log2(Math.max(1,mass/this.config.blackHoleMass)))/2);}
  bodyRadius(mass,radius=Particle.radiusForMass(mass)){
    const stage=cosmicMassAppearance(mass,{massLevels:accretionMassLevels(this.config)}).stage;
    return stage===6?this.blackHoleRadius(mass):Math.min(radius*BODY_DISPLAY_SCALE,[.18,.32,.6,1.2,2.4,4.5][stage]);
  }
  advance(dt){
    this.birth(dt);
    if(this.particles.length){
      const width=this.bounds.width,height=this.bounds.height;
      const bodies=this.particles.map(p=>({...p.cosmicState,x:p.position.x+width/2,y:p.position.y+height/2,z3:height/2,vx:p.velocity.x/9,vy:p.velocity.y/9,vz:0,mass:p.mass,trail:[],born:p.born,visualId:p.visualId,displayRadius:p.physicalRadius,owner:undefined}));
      const result=stepCosmicBodies(bodies,{width,height,dt,time:this.age,gravityStrength:this.config.gravityStrength,merged:this.merged,orbitalConfig:{gravityGain:this.config.gravityGain??30,gravityRange:this.config.gravityRange??3,softeningMeters:this.config.softeningMeters??.02},massLevels:accretionMassLevels(this.config),blackHoleMass:this.config.blackHoleMass,contactRadius:p=>this.bodyRadius(p.mass,p.displayRadius??Particle.radiusForMass(p.mass))});
      this.physics.particles=result.bodies.map(body=>{
        const p=new AccretionParticle(this,body.x-width/2,body.y-height/2,body.mass,body.vx*9,body.vy*9);
        p.born=body.born;p.visualId=body.visualId;p.maxTrailLength=0;p.cosmicState=body;return p;
      });
      this.physics.collisionCount=result.merged;
    }
    // Wrap after swept contact resolution so seam collisions keep their path.
    for(const p of this.particles){p.position.x=periodicDelta(p.position.x,this.bounds.width);p.position.y=periodicDelta(p.position.y,this.bounds.height);}
    this.physics.forcesDirty=true;this.physics.tree=null;
  }
  recordMotionTrails(dt){
    this.trailClock=(this.trailClock||0)+dt;
    if(!this.motionTrails)this.motionTrails=new Map();
    const alive=new Set(),cutoff=this.trailClock-(this.config.trailSeconds??3);
    const threshold=accretionMassLevels(this.config)[3].mass;
    for(const p of this.particles){
      if(p.mass<threshold)continue;
      alive.add(p.id);const point=this.bodyPoint(p);
      const x=(point.x-this.width/2)/this.scale,y=(point.y-this.height/2)/this.scale;
      const points=this.motionTrails.get(p.id)||[];
      while(points.length&&points[0].t<cutoff)points.shift();
      if(!points.length||this.trailClock-points[points.length-1].t>=1/30){points.push({x,y,t:this.trailClock});}
      this.motionTrails.set(p.id,points);
    }
    for(const id of this.motionTrails.keys())if(!alive.has(id))this.motionTrails.delete(id);
  }
  draw(context=this.ctx,view=null){
    const c=context,dpr=this.canvas.width/this.width;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,view?view.radius*2:this.width,view?view.radius*2:this.height);
    if(view){c.translate(view.radius-view.x*view.zoom,view.radius-view.y*view.zoom);c.scale(view.zoom,view.zoom);}
    c.translate(this.width/2,this.height/2);c.scale(this.scale,this.scale);
    const ink=getComputedStyle(document.body).getPropertyValue('--ink').trim()||'#dbeade';
    const accent=this.color||ink;
    if(!view){this.hoverId=this.pickFocusable();this.canvas.style.cursor=this.hoverId!=null?'pointer':'';}
    for(const points of this.motionTrails?.values()||[]){
      c.strokeStyle=accent;c.lineWidth=.8/this.scale;c.lineCap='round';
      const duration=this.config.trailSeconds??3;
      for(let i=1;i<points.length;i++){
        const a=points[i-1],b=points[i],age=this.trailClock-b.t;
        if(age>duration||Math.abs(b.x-a.x)>this.bounds.width/2||Math.abs(b.y-a.y)>this.bounds.height/2)continue;
        c.globalAlpha=.38*Math.max(0,1-age/duration);
        c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
      }
    }
    for(const p of this.particles){
      const hole=p.blackHole||p.cosmicState?.blackHole;
      const appearance=cosmicMassAppearance(p.mass,{massLevels:accretionMassLevels(this.config)});
      const r=this.bodyRadius(p.mass,p.radius),alpha=Math.min(1,(this.age-(p.born||0))/(p.born<3.4?.15:.7));
      for(const sx of [-this.bounds.width,0,this.bounds.width])for(const sy of [-this.bounds.height,0,this.bounds.height]){
        const previous=this.previousBodies?.get(p.id),blend=this.blend??1;
        const px=previous?previous.position.x+periodicDelta(p.position.x-previous.position.x,this.bounds.width)*blend:p.position.x;
        const py=previous?previous.position.y+periodicDelta(p.position.y-previous.position.y,this.bounds.height)*blend:p.position.y;
        const x=periodicDelta(px,this.bounds.width)+sx,y=periodicDelta(py,this.bounds.height)+sy;if(Math.abs(x)>this.bounds.width/2+r*3||Math.abs(y)>this.bounds.height/2+r*3)continue;
        if(hole){
          const core=this.blackHoleRadius(p.mass),level=Math.max(.35,p.blackHoleLevel??p.cosmicState?.blackHoleLevel??0);
          c.save();c.translate(x,y);c.rotate(-.35);c.globalAlpha=alpha*level;
          const halo=c.createRadialGradient(0,0,core,0,0,core*4);halo.addColorStop(0,ink);halo.addColorStop(.4,accent);halo.addColorStop(1,'transparent');c.fillStyle=halo;c.globalAlpha*=.45;c.beginPath();c.arc(0,0,core*4,0,Math.PI*2);c.fill();
          c.globalAlpha=alpha*level*.8;c.strokeStyle=accent;c.lineWidth=1.5/this.scale;c.beginPath();c.ellipse(0,0,core*2.5,core*.85,0,0,Math.PI*2);c.stroke();
          c.globalAlpha=alpha;c.fillStyle='#030508';c.beginPath();c.arc(0,0,core,0,Math.PI*2);c.fill();c.strokeStyle=ink;c.globalAlpha=alpha*.55;c.lineWidth=.7/this.scale;c.stroke();c.restore();continue;
        }
        const tint=appearance.stage===0?accent:ink;
        c.globalAlpha=alpha*(p.id===this.hoverId||p.id===this.followId?1:appearance.opacity);c.fillStyle=tint;
        if(appearance.glow){const glow=c.createRadialGradient(x,y,0,x,y,r*3);glow.addColorStop(0,tint);glow.addColorStop(1,'transparent');c.fillStyle=glow;c.globalAlpha=alpha*appearance.glow;c.beginPath();c.arc(x,y,r*3,0,Math.PI*2);c.fill();c.fillStyle=tint;c.globalAlpha=alpha*appearance.opacity;}
        if(appearance.stage>0){const surface=c.createRadialGradient(x-r*.35,y-r*.35,r*.05,x,y,r);surface.addColorStop(0,ink);surface.addColorStop(1,accent);c.fillStyle=surface;}
        c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
      }
    }
    this.drawOpening(c,ink,accent);
    c.globalAlpha=1;
    if(!view&&this.magnifierActive){
      const lens=this.lensView(),side=Math.ceil(lens.radius*2*dpr);
      if(!this.lensCanvas)this.lensCanvas=document.createElement('canvas');
      if(this.lensCanvas.width!==side||this.lensCanvas.height!==side){this.lensCanvas.width=side;this.lensCanvas.height=side;}
      this.draw(this.lensCanvas.getContext('2d'),lens);
      c.save();c.setTransform(dpr,0,0,dpr,0,0);c.beginPath();c.arc(lens.x,lens.y,lens.radius,0,Math.PI*2);c.clip();c.clearRect(lens.x-lens.radius,lens.y-lens.radius,lens.radius*2,lens.radius*2);c.drawImage(this.lensCanvas,lens.x-lens.radius,lens.y-lens.radius,lens.radius*2,lens.radius*2);c.restore();
      c.save();c.setTransform(dpr,0,0,dpr,0,0);c.strokeStyle=ink;c.globalAlpha=.22;c.lineWidth=1;c.beginPath();c.arc(lens.x,lens.y,lens.radius,0,Math.PI*2);c.stroke();c.globalAlpha=.72;c.fillStyle=ink;c.font='10px system-ui, sans-serif';c.textAlign='center';this.drawLensHints(c,lens);c.restore();
    }
  }
  drawLensHints(ctx,{x,y,radius,zoom}){
    const ink=this.color||getComputedStyle(document.body).getPropertyValue('--ink').trim()||'#dbeade';
    const inside=!!this.pointerInside&&!!this.pointer&&Math.hypot(this.pointer.x-x,this.pointer.y-y)<=radius;
    const hoverId=this.pickFocusable();
    const target=this.particles.find(p=>p.id===(hoverId??this.followId));
    if(target){const point=this.bodyPoint(target);ctx.save();ctx.beginPath();ctx.arc(x,y,radius-3,0,Math.PI*2);ctx.clip();ctx.strokeStyle=ink;ctx.globalAlpha=.85;ctx.lineWidth=1;for(const dx of [-this.width,0,this.width])for(const dy of [-this.height,0,this.height]){ctx.beginPath();ctx.arc(x+(point.x+dx-x)*zoom,y+(point.y+dy-y)*zoom,7,0,Math.PI*2);ctx.stroke();}ctx.restore();}
    const canFocus=this.paused&&hoverId!=null&&hoverId!==this.followId;
    const showExit=this.followId&&(performance.now()<this.followHintUntil||inside);
    const hints=canFocus?['点击聚焦']:[];
    ctx.globalAlpha=.72;ctx.fillStyle=ink;ctx.font='10px system-ui, sans-serif';ctx.textAlign='center';
    const hintInset=showExit?16:0;
    ctx.fillText(`${Number(zoom.toFixed(1))}×`,x,y+radius-16-hints.length*16-hintInset);
    hints.forEach((hint,i)=>ctx.fillText(hint,x,y+radius-16-(hints.length-1-i)*16-hintInset));
    if(inside){
      ctx.save();ctx.font='10px system-ui, sans-serif';ctx.globalAlpha=.48;ctx.textBaseline='middle';
      const arcRadius=radius-15,glyphs=[...'滚轮缩放 · 2.5–10×'];
      const widths=glyphs.map(char=>ctx.measureText(char).width+.8),total=widths.reduce((a,b)=>a+b,0);
      let offset=-total/2;
      for(let i=0;i<glyphs.length;i++){
        const angle=-Math.PI/2+(offset+widths[i]/2)/arcRadius;
        ctx.save();ctx.translate(x+Math.cos(angle)*arcRadius,y+Math.sin(angle)*arcRadius);ctx.rotate(angle+Math.PI/2);
        ctx.fillText(glyphs[i],0,0);ctx.restore();offset+=widths[i];
      }
      ctx.restore();
    }
    if(showExit){
      ctx.save();ctx.font='9px system-ui, sans-serif';ctx.globalAlpha=.4;ctx.textBaseline='middle';
      const arcRadius=radius-13,glyphs=[...'右键 / Esc 退出跟随'];
      const widths=glyphs.map(char=>ctx.measureText(char).width+.6),total=widths.reduce((a,b)=>a+b,0);
      let offset=-total/2;
      for(let i=0;i<glyphs.length;i++){
        const angle=Math.PI/2-(offset+widths[i]/2)/arcRadius;
        ctx.save();ctx.translate(x+Math.cos(angle)*arcRadius,y+Math.sin(angle)*arcRadius);ctx.rotate(angle-Math.PI/2);
        ctx.fillText(glyphs[i],0,0);ctx.restore();offset+=widths[i];
      }
      ctx.restore();
    }
  }
  drawOpening(c,ink,accent){
    const burst=this.age-1.2;
    if(burst>=2.2)return;
    const charge=Math.min(1,this.age/1.2),fade=burst<0?1:Math.pow(Math.max(0,1-burst/2.2),2);
    const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    c.save();
    // The charge nucleus persists through emission, then fades rather than vanishing.
    const radius=burst<0?1+3.6*charge:4.6+10*(1-Math.exp(-burst*8));
    const glow=c.createRadialGradient(0,0,0,0,0,radius*5);
    glow.addColorStop(0,ink);glow.addColorStop(.25,accent);glow.addColorStop(1,'transparent');
    c.globalAlpha=fade*(burst<0?.12+.25*charge:reduced?.3:.62);c.fillStyle=glow;
    c.beginPath();c.arc(0,0,radius*5,0,Math.PI*2);c.fill();
    c.globalAlpha=fade*(.4+.4*charge);c.fillStyle=ink;
    c.beginPath();c.arc(0,0,burst<0?radius:4.6*Math.exp(-burst*2),0,Math.PI*2);c.fill();
    c.restore();
  }
  presentSnapshots(now){
    const queue=this.snapshots;if(!queue?.length)return;
    const renderAt=now-50;
    while(queue.length>2&&queue[1].at<=renderAt)queue.shift();
    const from=queue[0],to=queue[1]||from,interval=Math.max(1,to.at-from.at);
    // A short delayed buffer absorbs uneven deliveries; bounded prediction bridges
    // a late snapshot instead of stopping at its last known position.
    this.blend=from===to?1:Math.max(0,Math.min(1+50/interval,(renderAt-from.at)/interval));
    this.previousBodies=from===to?null:new Map(from.bodies.map(p=>[p.id,p]));
    this.physics.particles=to.bodies;this.physics.collisionCount=to.merged;
    this.age=from.age+(to.age-from.age)*this.blend;
  }
  frame(now){
    if(this.dead)return;const dt=Math.min(.025,Math.max(0,(now-this.last)/1000));this.last=now;
    if(this.worker){
      if(!this.paused&&!document.hidden){
        this.presentSnapshots(now);
        if(!this.workerBusy){this.workerBusy=true;this.sentAt=now;this.worker.postMessage({type:'step',dt:1/60*this.config.speed*(this.boost?2:1),generation:this.generation});}
      }
    }else if(!this.paused&&!document.hidden)this.advance(dt*this.config.speed*(this.boost?2:1));
    if(!this.paused&&!document.hidden)this.recordMotionTrails(dt);
    if(!this.worker||(!this.paused&&!document.hidden))this.draw();this.raf=requestAnimationFrame(this.frame);
  }
  destroy(){this.dead=true;cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();this.worker?.terminate();this.worker=null;clearTimeout(this.followTimer);clearTimeout(this.followHintTimer);this.listeners?.forEach(off=>off());delete this.canvas.consumeMagnifierWheel;}
}
