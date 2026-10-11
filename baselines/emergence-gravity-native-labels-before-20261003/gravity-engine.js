import {PhysicsEngine,Particle,Renderer} from './vendor/gravity-core.js';
import {gravityCanvas} from './gravity-canvas.js';
import {sanitize} from './scenes.js';

export class GravityEngine {
 constructor(canvas,{config={},color}={}){
  this.canvas=canvas;this.ctx=canvas.getContext('2d');this.config=sanitize('gravity',config);this.color=color;
  this.paused=false;this.camera={x:0,y:0,zoom:1};this.abort=new AbortController();
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.resize();this.reset();
  const on=(target,name,fn,opt={})=>target.addEventListener(name,fn,{...opt,signal:this.abort.signal});
  on(canvas,'pointerdown',e=>{
   if(e.button!==0&&e.button!==1)return;
   e.preventDefault();const point=this.local(e);this.drag={id:e.pointerId,start:point,end:point,world:this.world(point),pan:e.button===1||e.ctrlKey,camera:{...this.camera}};
   canvas.setPointerCapture(e.pointerId);
  });
  on(canvas,'pointermove',e=>{if(!this.drag||this.drag.id!==e.pointerId)return;this.drag.end=this.local(e);
   if(this.drag.pan){this.camera.x=this.drag.camera.x-(this.drag.end.x-this.drag.start.x)/this.scale;this.camera.y=this.drag.camera.y-(this.drag.end.y-this.drag.start.y)/this.scale;this.fieldDirty=true;}
  });
  on(canvas,'pointerup',e=>{
   const d=this.drag;if(!d||d.id!==e.pointerId)return;this.drag=null;
   if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
   if(!d.pan&&Math.hypot(d.end.x-d.start.x,d.end.y-d.start.y)>4&&this.particles.length<1600){
    const end=this.world(d.end);this.add(d.world.x,d.world.y,this.config.addMass,(end.x-d.world.x)*.05,(end.y-d.world.y)*.05);this.physics.refresh();this.fieldDirty=true;
   }
  });
  on(canvas,'pointercancel',()=>this.drag=null);on(window,'blur',()=>this.drag=null);
  this.consumeWheel=e=>{const point=this.local(e),before=this.world(point);this.camera.zoom=Math.max(.2,Math.min(6,this.camera.zoom*Math.exp(-Math.max(-240,Math.min(240,e.deltaY))*.0009531)));this.resize();const after=this.world(point);this.camera.x+=before.x-after.x;this.camera.y+=before.y-after.y;this.fieldDirty=true;e.preventDefault();e.stopPropagation();return true;};
  canvas.consumeMagnifierWheel=this.consumeWheel;on(canvas,'wheel',this.consumeWheel,{passive:false});
  this.last=performance.now();this.frame=this.frame.bind(this);this.raf=requestAnimationFrame(this.frame);
 }
 get particles(){return this.physics.particles;}
 setPalette(color,dark){this.color=color;this.dark=dark;}
 setPointer(){} clearPointer(){} setBoost(){} // Drag aims a new body, never accelerates time.
 setPaused(value){this.paused=value;this.accumulator=0;}
 local(e){const r=this.canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
 world(p){return {x:(p.x-this.width/2)/this.scale+this.camera.x,y:(p.y-this.height/2)/this.scale+this.camera.y};}
 resize(){const r=this.canvas.getBoundingClientRect();this.width=Math.max(1,r.width);this.height=Math.max(1,r.height);this.dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=this.width*this.dpr;this.canvas.height=this.height*this.dpr;this.scale=this.width/1000*this.camera.zoom;this.fieldDirty=true;}
 add(x,y,mass,vx,vy){const p=new Particle(x,y,mass,vx,vy);p.maxTrailLength=this.config.trailLength;this.physics.addParticle(p);return p;}
 reset(){
  this.physics=new PhysicsEngine(32);this.physics.G=.5*this.config.gravityStrength;
  this.physics.collisionMode='merge';this.renderer=new Renderer(gravityCanvas(this.canvas),this.physics);
  // Separate visibility switches around the upstream drawing pass, no force changes.
  const arrow=this.renderer.drawParticleArrow.bind(this.renderer);
  this.renderer.drawParticleArrow=(p,v,t,c)=>{if(c[0]===255?this.config.forceVectors==='yes':this.config.velocityVectors==='yes')arrow(p,v,t,c);};
  // Inspection labels include the smallest dust; do not round fractional mass
  // to zero or apply the upstream minimum-body-size label filter.
  this.renderer.drawMassLabels=(particles,size)=>{
   const c=this.ctx,z=this.scale;c.save();c.font=`${10/z}px sans-serif`;
   c.textAlign='center';c.textBaseline='bottom';c.fillStyle='#fffaf0';
   c.strokeStyle='rgba(15,20,28,.65)';c.lineWidth=2/z;c.lineJoin='round';
   for(const p of particles){
    const label=String(Number(p.mass.toFixed(2))),x=p.position.x,y=p.position.y-size(p)-4/z;
    c.strokeText(label,x,y);c.fillText(label,x,y);
   }
   c.restore();
  };
  // Rendering only: shrink low-mass dust, with a smooth return to the original
  // visual radius as it accumulates mass. Physical/contact radii stay untouched.
  this.renderer.drawParticles=()=>{
   const c=this.ctx,r=this.renderer,z=this.scale;
   // The opening is a cloud of equally fine light points, including bodies
   // already merged by the unchanged physics. Reveal growth smoothly afterward.
   const progress=Math.max(0,Math.min(1,(this.age-5.5)/1.5)),reveal=progress*progress*(3-2*progress);
   const tint=(a,b)=>a.map((v,i)=>Math.round(v+(b[i]-v)*reveal)).join(',');
   const body=tint([255,247,224],[150,200,255]),edge=tint([255,252,240],[200,220,255]);
   const size=p=>{const t=Math.max(0,Math.min(1,(p.mass-.4)/.6)),grown=Math.max(p.radius*r.particleSizeMultiplier*(.45+.55*t),(.65+.85*t)/z);return .65/z+(grown-.65/z)*reveal;};
   r.p.push();c.save();c.fillStyle=`rgba(${tint([255,239,200],[100,150,255])},0.118)`;
   for(const p of this.particles){c.beginPath();c.arc(p.position.x,p.position.y,size(p)*1.5,0,Math.PI*2);c.fill();}
   c.fillStyle=`rgb(${body})`;c.strokeStyle=`rgb(${edge})`;
   for(const p of this.particles){
    const t=Math.max(0,Math.min(1,(p.mass-.4)/.6)),radius=size(p),{x,y}=p.position;
    c.fillStyle=`rgb(${body})`;
    if(radius*z>=3){
     const surface=c.createRadialGradient(x-radius*.3,y-radius*.3,0,x,y,radius);
     surface.addColorStop(0,'rgb(200,226,255)');surface.addColorStop(.55,'rgb(150,200,255)');surface.addColorStop(1,'rgb(100,156,218)');c.fillStyle=surface;
    }
    c.lineWidth=.5/z+(((.5/z)*(1-t)+2*t)-.5/z)*reveal;c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.fill();c.stroke();
   }
   c.restore();if(reveal===1)r.drawSpinMarkers(this.particles);r.drawMassLabels(this.particles,size);r.p.pop();
  };
  this.time=0;this.age=0;this.emitted=0;this.accumulator=0;this.fieldDirty=true;this.fieldLast=-Infinity;this.drag=null;
  this.camera={x:0,y:0,zoom:1};this.resize();
 }
 setScene(id,config){this.config=sanitize('gravity',config);this.reset();}
 setConfig(config){const old=this.config;this.config=sanitize('gravity',config);if(old.count!==this.config.count){this.reset();return;}
  this.physics.G=.5*this.config.gravityStrength;this.physics.refresh();this.fieldDirty=true;
  for(const p of this.particles){p.maxTrailLength=this.config.trailLength;if(p.trail.length>p.maxTrailLength)p.trail.splice(0,p.trail.length-p.maxTrailLength);}
 }
 releaseDust(){
  const target=Math.min(this.config.count,Math.floor(Math.max(0,this.age-3)/2.5*this.config.count));
  while(this.emitted<target){
   const a=Math.random()*Math.PI*2,speed=(5+Math.random()*7)*this.config.initialSpeed;
   const r=10+Math.max(0,this.age-3)*12*Math.random();
   this.add(Math.cos(a)*r,Math.sin(a)*r,.1+Math.random()*.3,Math.cos(a)*speed,Math.sin(a)*speed);this.emitted++;
  }
 }
 wrapScreen(){
  // Fixed periodic screen boundary, measured through the current camera so
  // resizing, zooming and panning never leave a stale world-space box.
  const spanX=this.width/this.scale,spanY=this.height/this.scale;
  const minX=this.camera.x-spanX/2,minY=this.camera.y-spanY/2;
  const wrap=(value,min,span)=>min+((value-min)%span+span)%span;
  let changed=false;
  for(const p of this.particles){
   let jumped=false;
   if(p.position.x<minX||p.position.x>=minX+spanX){p.position.x=wrap(p.position.x,minX,spanX);jumped=true;}
   if(p.position.y<minY||p.position.y>=minY+spanY){p.position.y=wrap(p.position.y,minY,spanY);jumped=true;}
   if(jumped){
    // Keep this body, its mass and momentum. Never draw the teleport as a path.
    p.trail=[];p.recordTrail();changed=true;
   }
  }
  if(changed){this.physics.refresh();this.fieldDirty=true;}
 }
 step(dt){this.wrapScreen();this.physics.step(dt);this.wrapScreen();this.time+=dt;}
 frame(now){
  const dt=Math.min(.05,(now-this.last)/1000);this.last=now;
  if(!this.paused&&!document.hidden){this.age+=dt;this.releaseDust();this.accumulator+=dt*6*this.config.speed;
   const start=performance.now();let n=0;while(this.accumulator>=.1&&n<12){this.step(.1);this.accumulator-=.1;n++;if(performance.now()-start>9)break;}this.accumulator=Math.min(this.accumulator,.6);
  }
  this.draw(now);this.raf=requestAnimationFrame(this.frame);
 }
 draw(now=performance.now()){
  const c=this.ctx;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.width,this.height);
  const r=this.renderer;r.zoom=this.scale;r.particleSizeMultiplier=this.config.bodySize;r.arrowSizeMultiplier=this.config.arrowSize/this.scale;
  r.showTrails=this.config.trails==='yes'&&this.emitted>=this.config.count&&this.particles.length<=80;
  r.showParticleVectors=this.config.guides==='yes'&&(this.config.forceVectors==='yes'||this.config.velocityVectors==='yes');
  r.showVectorField=this.config.guides==='yes'&&this.config.field!=='off';
  const f=this.physics.vectorField;f.fieldMode=this.config.field;f.baseGridSize=this.config.fieldSpacing/this.scale;
  if(r.showVectorField&&(this.fieldDirty||now-this.fieldLast>200)&&this.particles.length){
   this.physics.updateField({minX:this.camera.x-this.width/2/this.scale,minY:this.camera.y-this.height/2/this.scale,maxX:this.camera.x+this.width/2/this.scale,maxY:this.camera.y+this.height/2/this.scale});this.fieldLast=now;this.fieldDirty=false;
  }
  c.save();c.translate(this.width/2,this.height/2);c.scale(this.scale,this.scale);c.translate(-this.camera.x,-this.camera.y);r.draw();
  if(this.drag&&!this.drag.pan){const end=this.world(this.drag.end);r.drawVelocityPreview(this.drag.world.x,this.drag.world.y,end.x,end.y);}
  c.restore();
  if(this.age<3){const a=this.age/3,rad=2+7*a;c.save();c.fillStyle='#fffaf0';c.shadowColor='#ffeac2';c.shadowBlur=8+22*a;c.beginPath();c.arc(this.width/2,this.height/2,rad,0,Math.PI*2);c.fill();c.restore();}
 }
 destroy(){this.destroyed=true;cancelAnimationFrame(this.raf);this.abort.abort();this.resizeObserver.disconnect();if(this.canvas.consumeMagnifierWheel===this.consumeWheel)delete this.canvas.consumeMagnifierWheel;}
}
