const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:2066,height:1070},reducedMotion:'reduce'}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4327',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__emergence);
 const reports=[];
 for(const depth of ['flat','depth']){
  const result=await p.evaluate(depth=>{
   const e=__emergence.engine,check=(v,m)=>{if(!v)throw Error(depth+' '+m)},near=(a,b)=>Math.abs(a-b)<1e-6;
   let randomSeed=1827;Math.random=()=>{randomSeed=(randomSeed*1664525+1013904223)>>>0;return randomSeed/4294967296};
   const total=()=>e.particles.reduce((n,p)=>n+p.mass,0);
   const setup=extra=>{e.setScene('cosmos',{depth,influx:'no',...extra});e.setPaused(true)};
   setup();check(e.particles.length===0,'starts empty');for(let i=0;i<60;i++)e.step();check(e.particles.length===0,'charging alone');
   for(let i=0;i<306;i++)e.step();check(!e.cosmicBirth&&near(total(),650),'formation preserves all mass');
   for(let i=0;i<840;i++)e.step();
   const heavy=e.particles.filter(p=>p.mass>30);check(heavy.length>=2,'multiple freely moving massive centers remain');check(e.snapshot().finite,'finite evolution');check(near(total(),650),'closed system mass');
   const formed={count:e.particles.length,heavy:heavy.map(p=>p.mass)};
   // A bound pair completes actual gravity-driven turns without orbital helper forces.
   setup({collisions:'off',mutualGravity:1});e.reset(false);
   const center={x:e.world.width/2,y:e.world.height/2,z3:e.world.depth/2},r=65,m=80,v=Math.sqrt(2.4*(m+1)*r*r/(r*r+15.6**2)**1.5);
   const body=o=>({...e.model.create(e),...center,vx:0,vy:0,vz:0,mass:1,...o});
   const a=body({mass:m,vy:-v/(m+1)}),q=body({x:center.x+r,vy:v*m/(m+1)});e.particles=[a,q];
   let angle=0,last=0,min=r,max=r;
   for(let i=0;i<1200;i++){e.step();const d=Math.hypot(q.x-a.x,q.y-a.y),t=Math.atan2(q.y-a.y,q.x-a.x);angle+=Math.atan2(Math.sin(t-last),Math.cos(t-last));last=t;min=Math.min(min,d);max=Math.max(max,d)}
   check(angle>Math.PI*4,'at least two complete orbits');check(min>r*.92&&max<r*1.08,'bounded orbital radius');
   // Supply starts outside the actual view and enters without a boundary teleport, also after rotating 3D.
   for(const edgeWrap of ['no','yes']){
    setup({collisions:'off',mutualGravity:0,influx:'yes',influxInterval:3,influxBatch:2,edgeWrap});e.reset(false);e.particles=[];
    if(depth==='depth')e.rotateCamera(1.4,.3);
    const screen=p=>{if(depth==='flat')return {x:p.x*e.scale,y:p.y*e.scale};const x=p.x-e.world.width/2,y=p.y-e.world.height/2,z=p.z3-e.world.depth/2,c=e.camera,u=x*Math.cos(c.yaw)+z*Math.sin(c.yaw),v=-x*Math.sin(c.yaw)+z*Math.cos(c.yaw),yy=y*Math.cos(c.pitch)-v*Math.sin(c.pitch),zz=y*Math.sin(c.pitch)+v*Math.cos(c.pitch),k=e.projection3.focal/(e.projection3.distance+zz);return{x:e.width/2+u*k,y:e.height/2+yy*k}};
    e.replenishCosmos(3.01);check(e.particles.length===2&&e.arrived===2,'batch added');
    const incoming=[...e.particles],before=incoming.map(screen);check(before.every(s=>s.x<0||s.x>e.width||s.y<0||s.y>e.height),'outside screen');
    e.containEdges();check(incoming.every((p,i)=>near(screen(p).x,before[i].x)&&near(screen(p).y,before[i].y)),'no boundary snap');
    for(let i=0;i<120;i++)e.step();check(incoming.every(p=>!p.incoming),'enters view');check(near(total(),e.incomingMass),'external mass accounted');
    e.setConfig({...e.config,influx:'no'});const count=e.particles.length;for(let i=0;i<200;i++)e.step();check(e.particles.length===count,'off respected');
    e.setConfig({...e.config,influx:'yes'});e.particles=Array.from({length:1200},()=>body({}));e.replenishCosmos(30);check(e.particles.length===1200,'cap respected');
    e.reset();e.replenishCosmos(30);check(e.particles.length===0,'no arrivals during charging');
   }
   return {depth,formed,orbit:{angle,min,max}};
  },depth);reports.push(result);console.log(JSON.stringify(result));
 }
 assert.deepEqual(errors,[]);fs.writeFileSync('checks/emergence/orbits-influx-results.json',JSON.stringify(reports,null,2));console.log('PASS formation, mass, multiple centers, true orbits, rotated edge arrivals, switches and cap');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
