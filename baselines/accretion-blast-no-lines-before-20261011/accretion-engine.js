import {PhysicsEngine, Particle, installPeriodicPhysics, periodicDelta} from './vendor/gravity-core.js';
import {sanitize} from './scenes.js';
import {stepCosmicBodies} from './engine.js';

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
        const now=performance.now(),blend=this.blend??1;
        this.previousBodies=new Map(this.particles.map(p=>{
          const previous=this.previousBodies?.get(p.id);
          return [p.id,{...p,position:previous?{
            x:previous.position.x+periodicDelta(p.position.x-previous.position.x,this.bounds.width)*blend,
            y:previous.position.y+periodicDelta(p.position.y-previous.position.y,this.bounds.height)*blend
          }:{...p.position}}];
        }));
        this.blendDuration=Math.max(16,Math.min(500,now-this.sentAt));this.blendAt=now;this.blend=0;
        this.previousAge=this.age;this.nextAge=data.age;this.physics.collisionCount=data.merged;
        this.physics.particles=data.bodies.map(p=>({...p,position:{x:p.x,y:p.y}}));this.workerBusy=false;
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
  setPointer(x,y){const box=this.canvas.getBoundingClientRect();this.pointer={x:x-box.left,y:y-box.top};if(this.paused)this.draw();}
  clearPointer(){}
  setMagnifier(active){this.magnifierActive=!!active;if(!active)this.followId=null;this.canvas.dispatchEvent(new CustomEvent('emergence-magnifier-change',{detail:{active:!!active}}));this.draw();}
  bodyPoint(p){const previous=this.previousBodies?.get(p.id),blend=this.blend??1;return {x:this.width/2+periodicDelta(previous?previous.position.x+periodicDelta(p.position.x-previous.position.x,this.bounds.width)*blend:p.position.x,this.bounds.width)*this.scale,y:this.height/2+periodicDelta(previous?previous.position.y+periodicDelta(p.position.y-previous.position.y,this.bounds.height)*blend:p.position.y,this.bounds.height)*this.scale};}
  lensView(){const target=this.particles.find(p=>p.id===this.followId);if(this.followId&&!target)this.followId=null;return {...(target?this.bodyPoint(target):this.pointer||{x:this.width/2,y:this.height/2}),radius:Math.min(150,this.width*.23,this.height*.23),zoom:this.lensZoom||2.5};}
  installInteractions(){
    this.listeners=[];const on=(node,type,fn,options)=>{node.addEventListener(type,fn,options);this.listeners.push(()=>node.removeEventListener(type,fn,options));};
    on(this.canvas,'pointerdown',event=>{if(event.button!==0||!event.isPrimary)return;this.setPointer(event.clientX,event.clientY);const lens=this.lensView(),inside=this.magnifierActive&&Math.hypot(this.pointer.x-lens.x,this.pointer.y-lens.y)<=lens.radius;let target=null,best=10;for(const p of this.particles){const point=this.bodyPoint(p);const x=inside?lens.x+(point.x-lens.x)*lens.zoom:point.x,y=inside?lens.y+(point.y-lens.y)*lens.zoom:point.y,d=Math.hypot(x-this.pointer.x,y-this.pointer.y);if(d<best){best=d;target=p.id;}}this.gesture={x:event.clientX,y:event.clientY,at:performance.now(),target};});
    on(this.canvas,'click',event=>{const g=this.gesture;if(event.button!==0||event.detail>1||!g||g.target==null||performance.now()-g.at>280||Math.hypot(event.clientX-g.x,event.clientY-g.y)>6)return;clearTimeout(this.followTimer);this.followTimer=setTimeout(()=>{if(this.dead||!this.particles.some(p=>p.id===g.target))return;this.setMagnifier(true);this.followId=g.target;this.draw();},350);});
    on(this.canvas,'dblclick',()=>clearTimeout(this.followTimer));
    on(window,'keydown',event=>{if(event.key==='Escape'&&(this.followId!=null||this.followTimer)){event.preventDefault();event.stopImmediatePropagation();clearTimeout(this.followTimer);this.followTimer=null;this.followId=null;this.draw();}},true);
    on(this.canvas,'contextmenu',event=>{if(this.magnifierActive&&this.followId!=null){event.preventDefault();event.stopImmediatePropagation();this.followId=null;this.setPointer(event.clientX,event.clientY);this.draw();}});
    this.lensWheel=event=>{if(!this.magnifierActive||event.ctrlKey)return false;const box=this.canvas.getBoundingClientRect(),lens=this.lensView();if(Math.hypot(event.clientX-box.left-lens.x,event.clientY-box.top-lens.y)>lens.radius)return false;event.preventDefault();event.stopImmediatePropagation();const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?this.height:1);this.lensZoom=Math.max(2.5,Math.min(10,lens.zoom*Math.exp(-Math.max(-240,Math.min(240,delta))*.002)));this.draw();return true;};
    this.canvas.consumeMagnifierWheel=this.lensWheel;on(this.canvas,'wheel',this.lensWheel,{passive:false});
  }
  setBoost(value){this.boost=value;}
  setPaused(value){this.paused=value;this.boost=false;this.last=performance.now();this.draw();}
  resize(){
    const rect=this.canvas.getBoundingClientRect();this.width=Math.max(1,rect.width);this.height=Math.max(1,rect.height);
    const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);
    const previous=this.bounds;this.bounds={width:700,height:700*this.height/this.width};this.scale=this.width/700;
    if(this.physics&&previous){for(const p of this.particles){p.position.x*=this.bounds.width/previous.width;p.position.y*=this.bounds.height/previous.height;}this.physics.forcesDirty=true;this.physics.tree=null;}
    if(this.worker){this.previousBodies=null;this.worker.postMessage({type:'resize',bounds:this.bounds,generation:this.generation});}
  }
  reset(){
    this.physics=new PhysicsEngine(24);this.physics.G=120*this.config.gravityStrength;
    installPeriodicPhysics(this.physics,()=>this.bounds);this.physics.collisionMode='merge';
    const resolve=this.physics.resolveCollisions.bind(this.physics);
    this.physics.resolveCollisions=previous=>{this.contactPass=true;try{return resolve(previous);}finally{this.contactPass=false;}};
    this.followId=null;clearTimeout(this.followTimer);this.age=0;this.emitted=0;this.openingCount=this.config.count;this.supply=0;this.injectedMass=0;
    this.previousBodies=null;this.previousAge=0;this.nextAge=0;this.workerBusy=false;this.blendAt=0;this.blend=1;
    if(this.worker){this.generation=(this.generation||0)+1;this.worker.postMessage({type:'reset',config:this.config,bounds:this.bounds,generation:this.generation});}
  }
  setScene(id,config){this.config=sanitize('accretion',config);this.reset();}
  setConfig(config){this.config=sanitize('accretion',config);this.physics.G=120*this.config.gravityStrength;this.physics.forcesDirty=true;if(this.worker)this.worker.postMessage({type:'config',config:this.config,generation:this.generation});}
  add(x,y,vx,vy){
    const p=new AccretionParticle(this,x,y,.2,vx,vy);p.born=this.age;p.maxTrailLength=0;
    this.physics.addParticle(p);this.injectedMass+=p.mass;return p;
  }
  birth(dt){
    this.age+=dt;
    // A visible charge followed by a spread of launch speeds, never velocity resets.
    const target=Math.min(this.openingCount,Math.floor(Math.max(0,this.age-1.2)/2.2*this.openingCount));
    while(this.emitted<target){const a=Math.random()*Math.PI*2,r=8+Math.random()*18,v=18+Math.random()*65;
      this.add(Math.cos(a)*r,Math.sin(a)*r,Math.cos(a)*v,Math.sin(a)*v);this.emitted++;}
    if(this.age<3.4)return;
    // Count the smallest bodies, rather than total bodies: grown stars never
    // consume the dust quota. Refill gradually and avoid spawning inside hosts.
    const dust=this.particles.filter(p=>p.mass<.200001).length;
    this.supply=Math.min(24,this.supply+dt*Math.max(12,this.config.count*.16));
    const quota=Math.min(this.config.count-dust,Math.floor(this.supply));
    let added=0;
    for(let attempt=0;attempt<quota*8&&added<quota;attempt++){
      const x=(Math.random()-.5)*this.bounds.width,y=(Math.random()-.5)*this.bounds.height;
      if(this.particles.some(p=>Math.hypot(periodicDelta(p.position.x-x,this.bounds.width),periodicDelta(p.position.y-y,this.bounds.height))<p.radius+2))continue;
      const a=Math.random()*Math.PI*2,v=.15*(this.bounds.width/100)*(.8+Math.random()*.4);this.add(x,y,Math.cos(a)*v,Math.sin(a)*v);added++;
    }
    this.supply-=added;
  }
  advance(dt){
    this.birth(dt);
    if(this.particles.length){
      const width=this.bounds.width,height=this.bounds.height;
      const bodies=this.particles.map(p=>({...p.cosmicState,x:p.position.x+width/2,y:p.position.y+height/2,z3:height/2,vx:p.velocity.x/9,vy:p.velocity.y/9,vz:0,mass:p.mass,trail:[],born:p.born,visualId:p.visualId,displayRadius:p.physicalRadius,owner:undefined}));
      const result=stepCosmicBodies(bodies,{width,height,dt,time:this.age,gravityStrength:this.config.gravityStrength,merged:this.merged,contactRadius:p=>(p.displayRadius??Particle.radiusForMass(p.mass))*BODY_DISPLAY_SCALE});
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
  draw(context=this.ctx,view=null){
    const c=context,dpr=this.canvas.width/this.width;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,view?view.radius*2:this.width,view?view.radius*2:this.height);
    if(view){c.translate(view.radius-view.x*view.zoom,view.radius-view.y*view.zoom);c.scale(view.zoom,view.zoom);}
    c.translate(this.width/2,this.height/2);c.scale(this.scale,this.scale);
    const ink=getComputedStyle(document.body).getPropertyValue('--ink').trim()||'#dbeade';
    const accent=this.color||ink;
    for(const p of this.particles){
      const r=p.radius*BODY_DISPLAY_SCALE,alpha=Math.min(1,(this.age-(p.born||0))/(p.born<3.4?.15:.7));
      for(const sx of [-this.bounds.width,0,this.bounds.width])for(const sy of [-this.bounds.height,0,this.bounds.height]){
        const previous=this.previousBodies?.get(p.id),blend=this.blend??1;
        const px=previous?previous.position.x+periodicDelta(p.position.x-previous.position.x,this.bounds.width)*blend:p.position.x;
        const py=previous?previous.position.y+periodicDelta(p.position.y-previous.position.y,this.bounds.height)*blend:p.position.y;
        const x=periodicDelta(px,this.bounds.width)+sx,y=periodicDelta(py,this.bounds.height)+sy;if(Math.abs(x)>this.bounds.width/2+r*3||Math.abs(y)>this.bounds.height/2+r*3)continue;
        c.globalAlpha=alpha*(p.mass>.2?.9:.58);c.fillStyle=p.mass>.2?ink:accent;
        if(p.mass>=1){const glow=c.createRadialGradient(x,y,0,x,y,r*3);glow.addColorStop(0,ink);glow.addColorStop(1,'transparent');c.fillStyle=glow;c.globalAlpha=alpha*.16;c.beginPath();c.arc(x,y,r*3,0,Math.PI*2);c.fill();c.fillStyle=ink;c.globalAlpha=alpha*.9;}
        if(p.mass>=1){const surface=c.createRadialGradient(x-r*.35,y-r*.35,r*.05,x,y,r);surface.addColorStop(0,ink);surface.addColorStop(1,accent);c.fillStyle=surface;}
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
      c.save();c.setTransform(dpr,0,0,dpr,0,0);c.strokeStyle=ink;c.globalAlpha=.22;c.lineWidth=1;c.beginPath();c.arc(lens.x,lens.y,lens.radius,0,Math.PI*2);c.stroke();c.globalAlpha=.72;c.fillStyle=ink;c.font='10px system-ui, sans-serif';c.textAlign='center';c.fillText(`${Number(lens.zoom.toFixed(1))}× · 滚轮缩放`,lens.x,lens.y+lens.radius-16);if(this.followId!=null)c.fillText('右键 / Esc 退出跟随',lens.x,lens.y+lens.radius-32);c.restore();
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
    if(burst>=0&&!reduced){
      // Soft local flash, expanding fronts and radial sparks bridge into the bodies.
      for(let i=0;i<2;i++){
        const t=burst-i*.12;if(t<0||t>1.5)continue;
        c.globalAlpha=.38*Math.pow(1-t/1.5,2);c.strokeStyle=i?accent:ink;c.lineWidth=(1.8-i*.5)/this.scale;
        c.beginPath();c.arc(0,0,5+135*(1-Math.exp(-t*1.6)),0,Math.PI*2);c.stroke();
      }
      for(let i=0;i<28;i++){
        const t=burst-(i%4)*.025;if(t<0||t>1.1)continue;
        const angle=i*Math.PI*2/28+Math.sin(i*17)*.07,speed=40+(i%7)*12,r=5+t*speed;
        c.globalAlpha=.55*Math.pow(1-t/1.1,2);c.strokeStyle=i%3?accent:ink;c.lineWidth=.8/this.scale;
        c.beginPath();c.moveTo(Math.cos(angle)*Math.max(4,r-5-t*8),Math.sin(angle)*Math.max(4,r-5-t*8));c.lineTo(Math.cos(angle)*r,Math.sin(angle)*r);c.stroke();
      }
    }
    c.restore();
  }
  frame(now){
    if(this.dead)return;const dt=Math.min(.025,Math.max(0,(now-this.last)/1000));this.last=now;
    if(this.worker){
      if(!this.paused&&!document.hidden){
        this.blend=Math.min(1,Math.max(0,(now-(this.blendAt||now))/(this.blendDuration||16)));
        this.age=(this.previousAge||0)+((this.nextAge||0)-(this.previousAge||0))*this.blend;
        if(!this.workerBusy){this.workerBusy=true;this.sentAt=now;this.worker.postMessage({type:'step',dt:1/60*this.config.speed*(this.boost?2:1),generation:this.generation});}
      }
    }else if(!this.paused&&!document.hidden)this.advance(dt*this.config.speed*(this.boost?2:1));
    if(!this.worker||(!this.paused&&!document.hidden))this.draw();this.raf=requestAnimationFrame(this.frame);
  }
  destroy(){this.dead=true;cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();this.worker?.terminate();this.worker=null;clearTimeout(this.followTimer);this.listeners?.forEach(off=>off());delete this.canvas.consumeMagnifierWheel;}
}
