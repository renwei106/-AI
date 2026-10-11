import {PhysicsEngine, Particle, installPeriodicPhysics, periodicDelta} from './vendor/gravity-core.js';
import {sanitize} from './scenes.js';

// Toy simulation units, not astronomical measurements. Upstream forces,
// adaptive Verlet integration and mass/momentum conserving contacts are intact.
export class AccretionEngine {
  constructor(canvas,{config={},color,dark=false}={}) {
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.config=sanitize('accretion',config);
    this.setPalette(color,dark);this.paused=false;this.boost=false;this.dead=false;
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);
    this.resize();this.reset();this.last=performance.now();
    this.frame=this.frame.bind(this);this.raf=requestAnimationFrame(this.frame);
  }
  get particles(){return this.physics.particles;}
  get merged(){return this.physics.collisionCount;}
  get shattered(){return 0;}
  setPalette(color,dark){this.color=color;this.dark=dark;}
  setPointer(){} clearPointer(){} setMagnifier(){}
  setBoost(value){this.boost=value;}
  setPaused(value){this.paused=value;this.last=performance.now();}
  resize(){
    const rect=this.canvas.getBoundingClientRect();this.width=Math.max(1,rect.width);this.height=Math.max(1,rect.height);
    const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);
    const previous=this.bounds;this.bounds={width:700,height:700*this.height/this.width};this.scale=this.width/700;
    if(this.physics&&previous){for(const p of this.particles){p.position.x*=this.bounds.width/previous.width;p.position.y*=this.bounds.height/previous.height;}this.physics.forcesDirty=true;this.physics.tree=null;}
  }
  reset(){
    this.physics=new PhysicsEngine(24);this.physics.G=120*this.config.gravityStrength;
    installPeriodicPhysics(this.physics,()=>this.bounds);this.physics.collisionMode='merge';
    this.age=0;this.emitted=0;this.openingCount=this.config.count;this.supply=0;this.injectedMass=0;
  }
  setScene(id,config){this.config=sanitize('accretion',config);this.reset();}
  setConfig(config){this.config=sanitize('accretion',config);this.physics.G=120*this.config.gravityStrength;this.physics.forcesDirty=true;}
  add(x,y,vx,vy){
    const p=new Particle(x,y,.2,vx,vy);p.born=this.age;p.maxTrailLength=0;
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
      const a=Math.random()*Math.PI*2,v=1+Math.random()*5;this.add(x,y,Math.cos(a)*v,Math.sin(a)*v);added++;
    }
    this.supply-=added;
  }
  advance(dt){
    this.birth(dt);
    if(this.particles.length)this.physics.step(dt*3);
    // Wrap after swept contact resolution so seam collisions keep their path.
    for(const p of this.particles){p.position.x=periodicDelta(p.position.x,this.bounds.width);p.position.y=periodicDelta(p.position.y,this.bounds.height);}
    this.physics.forcesDirty=true;this.physics.tree=null;
  }
  draw(){
    const c=this.ctx,dpr=this.canvas.width/this.width;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,this.width,this.height);
    c.translate(this.width/2,this.height/2);c.scale(this.scale,this.scale);
    const ink=getComputedStyle(document.body).getPropertyValue('--ink').trim()||'#dbeade';
    const accent=this.color||ink;
    for(const p of this.particles){
      const r=p.radius,alpha=Math.min(1,(this.age-(p.born||0))/.7);
      for(const sx of [-this.bounds.width,0,this.bounds.width])for(const sy of [-this.bounds.height,0,this.bounds.height]){
        const x=p.position.x+sx,y=p.position.y+sy;if(Math.abs(x)>this.bounds.width/2+r*3||Math.abs(y)>this.bounds.height/2+r*3)continue;
        c.globalAlpha=alpha*(p.mass>.2?.9:.58);c.fillStyle=p.mass>.2?ink:accent;
        if(p.mass>=1){const glow=c.createRadialGradient(x,y,0,x,y,r*3);glow.addColorStop(0,ink);glow.addColorStop(1,'transparent');c.fillStyle=glow;c.globalAlpha=alpha*.16;c.beginPath();c.arc(x,y,r*3,0,Math.PI*2);c.fill();c.fillStyle=ink;c.globalAlpha=alpha*.9;}
        if(p.mass>=1){const surface=c.createRadialGradient(x-r*.35,y-r*.35,r*.05,x,y,r);surface.addColorStop(0,ink);surface.addColorStop(1,accent);c.fillStyle=surface;}
        c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
      }
    }
    if(this.age<1.2){c.globalAlpha=.4+this.age*.4;c.fillStyle=ink;c.beginPath();c.arc(0,0,1+this.age*3,0,Math.PI*2);c.fill();}
    c.globalAlpha=1;
  }
  frame(now){
    if(this.dead)return;const dt=Math.min(.025,Math.max(0,(now-this.last)/1000));this.last=now;
    if(!this.paused&&!document.hidden)this.advance(dt*this.config.speed*(this.boost?2:1));
    this.draw();this.raf=requestAnimationFrame(this.frame);
  }
  destroy(){this.dead=true;cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();}
}
