import {PhysicsEngine, Particle, Vector2D} from './vendor/gravity-core.js';
import {sanitize} from './scenes.js';

// Theme adapter only. Gravity, Verlet integration, collision detection and
// mass/momentum-conserving merges are provided by the pinned MIT upstream core.
export const STELLAR_LEVELS = [
  {name:'尘埃',mass:0,size:.65},{name:'碎片',mass:2,size:1.15},
  {name:'碎石',mass:8,size:1.8},{name:'小行星',mass:16,size:3.1},
  {name:'行星',mass:32,size:6.2},{name:'星系源',mass:128,size:12.4},
  {name:'黑洞',mass:384,size:16},
];
export const stellarLevel = mass => STELLAR_LEVELS.findLastIndex(t=>mass>=t.mass);

export class StarsEngine {
  constructor(canvas,{config={},color='#8bbcac',dark=true}={}) {
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.config=sanitize('stars',config);
    this.color=color;this.dark=dark;this.paused=false;this.boost=false;this.zoom=2.5;
    this.abort=new AbortController();this.resizeObserver=new ResizeObserver(()=>this.resize());
    this.resizeObserver.observe(canvas);this.resize();this.reset();
    const on=(target,event,fn,extra={})=>target.addEventListener(event,fn,{...extra,signal:this.abort.signal});
    on(canvas,'click',()=>{if(this.config.pointer==='magnify'&&this.pointer)this.follow=this.pick(this.pointer);});
    on(canvas,'contextmenu',e=>{if(this.follow){e.preventDefault();this.follow=null;}});
    on(window,'keydown',e=>{if(e.key==='Escape')this.follow=null;});
    this.consumeWheel=e=>{
      const center=this.lensCenter();if(!center)return false;
      const rect=canvas.getBoundingClientRect();
      if(Math.hypot(e.clientX-rect.left-center.x,e.clientY-rect.top-center.y)>this.lensRadius)return false;
      this.zoom=Math.max(2.5,Math.min(10,this.zoom-e.deltaY*.005));
      e.preventDefault();e.stopPropagation();return true;
    };
    canvas.consumeMagnifierWheel=this.consumeWheel;
    on(canvas,'wheel',this.consumeWheel,{passive:false});
    this.last=performance.now();this.frame=this.frame.bind(this);this.raf=requestAnimationFrame(this.frame);
  }
  get particles(){return this.physics.particles;}
  get merged(){return this.physics.collisionCount;}
  get shattered(){return 0;}
  resize(){
    const rect=this.canvas.getBoundingClientRect();this.width=Math.max(1,rect.width);this.height=Math.max(1,rect.height);
    const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);
    this.ctx.setTransform(dpr,0,0,dpr,0,0);this.scale=this.width/240;this.worldHeight=this.height/this.scale;
    this.lensRadius=Math.min(130,this.width*.28);
  }
  reset(){
    this.physics=new PhysicsEngine();this.physics.G=.5*this.config.gravity;
    this.physics.collisionMode=this.config.collisions==='off'?'none':'merge';
    this.time=0;this.supply=0;this.releasedDust=0;this.accumulator=0;this.follow=null;this.births=new WeakMap();
    for(let i=0;i<this.config.count;i++)this.addDust(false);
  }
  addDust(incoming){
    const angle=Math.random()*Math.PI*2,speed=(.15+Math.random()*.2)*this.config.initialSpeed;
    let x=(Math.random()-.5)*230,y=(Math.random()-.5)*this.worldHeight*.94;
    // Background arrivals fade in with their own velocity; no manual placement
    // and no prebuilt central masses or target orbital systems.
    const p=new Particle(x,y,.35+Math.random()*.3,Math.cos(angle)*speed,Math.sin(angle)*speed);
    p.maxTrailLength=24;this.physics.addParticle(p);this.births.set(p,incoming?this.time:this.time-Math.random()*1.2);
  }
  setScene(id,config){this.config=sanitize('stars',config);this.reset();}
  setConfig(config){const old=this.config;this.config=sanitize('stars',config);if(old.count!==this.config.count)this.reset();
    this.physics.G=.5*this.config.gravity;this.physics.collisionMode=this.config.collisions==='off'?'none':'merge';
    if(this.config.pointer!=='magnify')this.follow=null;
    this.physics.refresh();
  }
  setPalette(color,dark){this.color=color;this.dark=dark;}
  setPaused(paused){this.paused=paused;this.accumulator=0;}
  setBoost(active){this.boost=active;}
  setPointer(x,y){const r=this.canvas.getBoundingClientRect();this.pointer={x:x-r.left,y:y-r.top};}
  clearPointer(){this.pointer=null;}
  screen(p){return {x:this.width/2+p.position.x*this.scale,y:this.height/2+p.position.y*this.scale};}
  pick(point){let best=null,dist=12;for(const p of this.particles){const s=this.screen(p),d=Math.hypot(s.x-point.x,s.y-point.y);if(d<dist){dist=d;best=p;}}return best;}
  lensCenter(){return this.config.pointer==='magnify'?(this.follow?this.screen(this.follow):this.pointer):null;}
  step(dt=1/30){
    this.physics.step(dt);this.time+=dt;this.supply+=dt;
    const xLimit=120,yLimit=this.worldHeight/2;
    let corrected=false;
    for(const p of this.particles){
      for(const [axis,limit] of [['x',xLimit],['y',yLimit]]){
        if(Math.abs(p.position[axis])<=limit)continue;
        if(this.config.edgeWrap==='yes'){p.position[axis]=-Math.sign(p.position[axis])*limit;p.trail=[];}
        else {p.position[axis]=Math.sign(p.position[axis])*limit;p.velocity[axis]=-Math.sign(p.position[axis])*Math.abs(p.velocity[axis]);}
        corrected=true;
      }
    }
    if(corrected)this.physics.refresh();
    if(this.supply>=this.config.influxInterval){this.supply%=this.config.influxInterval;
      if(this.config.influx==='yes')for(let i=0,n=Math.min(this.config.influxBatch,1200-this.particles.length,Math.max(0,this.config.dustReserve-this.releasedDust));i<n;i++){this.addDust(true);this.releasedDust++;}
    }
    if(this.follow&&!this.particles.includes(this.follow))this.follow=null;
  }
  frame(now){
    const elapsed=Math.min(.05,(now-this.last)/1000);this.last=now;
    if(!this.paused&&!document.hidden){
      // Playback changes simulated time, never the masses or gravity constant.
      this.accumulator+=elapsed*3*this.config.speed*(this.boost?2:1);
      const started=performance.now();let steps=0;
      while(this.accumulator>=.1&&steps<12){this.step(.1);this.accumulator-=.1;steps++;if(performance.now()-started>9)break;}
      this.accumulator=Math.min(this.accumulator,.6);
    }
    this.draw();this.raf=requestAnimationFrame(this.frame);
  }
  paintBodies(){
    const c=this.ctx;
    for(const p of this.particles){
      const s=this.screen(p),level=stellarLevel(p.mass),r=STELLAR_LEVELS[level].size;
      const fade=Math.min(1,Math.max(0,(this.time-(this.births.get(p)??(this.time-2)))/1.2));
      c.strokeStyle=this.color;c.lineWidth=.5;
      const trail=p.trail.slice(-this.config.trail);
      if(this.config.trail>0)for(let i=1;i<trail.length;i++){
        if(trail[i].jumped)continue;
        c.globalAlpha=fade*.12*i/trail.length;c.beginPath();
        c.moveTo(this.width/2+trail[i-1].position.x*this.scale,this.height/2+trail[i-1].position.y*this.scale);
        c.lineTo(this.width/2+trail[i].position.x*this.scale,this.height/2+trail[i].position.y*this.scale);c.stroke();
      }
      c.globalAlpha=fade*(.38+level*.085);c.fillStyle=this.color;c.beginPath();c.arc(s.x,s.y,r,0,Math.PI*2);c.fill();
      if(level>=4){c.globalAlpha=fade*.1;c.beginPath();c.arc(s.x,s.y,r*1.5,0,Math.PI*2);c.fill();}
      if(level===6){c.globalAlpha=fade;c.fillStyle='#080a0c';c.beginPath();c.arc(s.x,s.y,r*.65,0,Math.PI*2);c.fill();}
    }
    c.globalAlpha=1;
  }
  draw(){
    const c=this.ctx;c.clearRect(0,0,this.width,this.height);this.paintBodies();
    const lens=this.lensCenter();if(!lens)return;
    const {x,y}=lens,r=this.lensRadius;
    c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.clip();c.clearRect(x-r,y-r,r*2,r*2);
    c.translate(x,y);c.scale(this.zoom,this.zoom);c.translate(-x,-y);this.paintBodies();c.restore();
    c.save();c.strokeStyle=this.color;c.globalAlpha=.28;c.lineWidth=1;c.shadowColor=this.color;c.shadowBlur=5;
    c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();c.shadowBlur=0;
    c.font='11px sans-serif';c.textAlign='center';c.fillStyle=this.color;c.fillText(`${this.zoom.toFixed(1)}×`,x,y+r-12);
    const hovered=this.pointer&&this.pick(this.pointer);
    if(hovered){const s=this.screen(hovered);c.globalAlpha=.8;c.beginPath();c.arc(x+(s.x-x)*this.zoom,y+(s.y-y)*this.zoom,6,0,Math.PI*2);c.stroke();}
    c.restore();
  }
  destroy(){this.destroyed=true;cancelAnimationFrame(this.raf);this.abort.abort();this.resizeObserver.disconnect();if(this.canvas.consumeMagnifierWheel===this.consumeWheel)delete this.canvas.consumeMagnifierWheel;}
}
