const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4327',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__emergence);

 const result=await page.evaluate(()=>{
  const e=__emergence.engine,check=(v,m)=>{if(!v)throw Error(m);},near=(a,b)=>Math.abs(a-b)<1e-7,reports=[];
  const totals=()=>e.particles.reduce((s,p)=>({mass:s.mass+p.mass,x:s.x+p.mass*p.vx,y:s.y+p.mass*p.vy,z:s.z+p.mass*p.vz}),{mass:0,x:0,y:0,z:0});
  const seed=(depth,config={})=>{e.setScene('cosmos',{depth,influx:'no',edgeWrap:'yes',mutualGravity:0,collisions:'auto',...config});e.reset(false);e.setPaused(true);};
  const body=values=>({...e.model.create(e),x:500,y:450,z3:e.world.depth/2,vx:0,vy:0,vz:0,...values});
  const conserve=(before,label)=>{const after=totals();for(const k of ['mass','x','y','z'])check(near(after[k],before[k]),label+' '+k);};
  for(const depth of ['flat','depth']){
   seed(depth);e.particles=[body({mass:3,x:499,vx:.1}),body({mass:7,x:501,vx:-.1})];const slow=totals();e.step();check(e.particles.length===1&&e.merged===1,'slow central fusion');conserve(slow,'fusion');
   for(const [name,a,b] of [
    ['fast',{mass:3,x:499,vx:1.5},{mass:3,x:501,vx:-1.5}],
    ['grazing',{x:498,vx:.8},{x:502,y:452,vx:-.8}],
    ['unequal',{mass:100,x:499,vx:.1},{mass:1,x:501,vx:-20}]
   ]){
    seed(depth);e.particles=[body(a),body(b)];const before=totals(),oldEnergy=e.particles.reduce((s,p)=>s+p.mass*(p.vx**2+p.vy**2+p.vz**2),0);e.step();
    check(e.particles.length===3&&e.merged===1&&e.shattered===1,name+' produces remnant plus debris');conserve(before,name);
    const masses=e.particles.map(p=>p.mass);check(masses[0]>masses[1]&&masses[1]>masses[2],name+' unequal masses');
    check(e.particles.every(p=>p.collisionAt>e.time&&p.mergeAt>e.time),'grace period');
    check(e.particles.reduce((s,p)=>s+p.mass*(p.vx**2+p.vy**2+p.vz**2),0)<=oldEnergy+1e-8,'inelastic outcome');
    if(name==='grazing')check(e.particles[1].visualRadius<e.particles[0].visualRadius,'smaller fragments');
   }
   seed(depth);e.particles=[body({x:499,vx:-.1}),body({x:501,vx:.1})];e.step();check(e.merged===0&&e.shattered===0&&e.particles[0].vx<0,'already separating: no rebound');
   seed(depth);e.particles=[body({x:499,vx:.1,mergeAt:10}),body({x:501,vx:-.1})];e.step();check(e.merged===0&&e.particles[0].vx===.1,'cooldown: no rebound');
   seed(depth,{collisions:'merge'});e.particles=[body({x:498,vx:.8}),body({x:502,y:452,vx:-.8})];e.step();check(e.particles.length===2&&e.particles[0].vx===.8,'merge-only grazing passes through');
   seed(depth,{collisions:'off'});e.particles=[body({vx:1}),body({x:501})];e.step();check(e.particles.length===2,'off respected');
   seed(depth,{count:1200});e.particles=[body({vx:2}),body({x:502,vx:-2}),...Array.from({length:1198},()=>body({x:100,y:100,collisionAt:Infinity}))];const capped=totals();e.step();check(e.particles.length===1200&&e.shattered===1,'cap retains one debris piece');conserve(capped,'cap');
   seed(depth,{count:100,collisions:'merge'});e.particles=[body({mass:320,x:350,vx:.1}),body({mass:380,x:352,vx:-.1})];e.step();
   check(e.cosmicBirth?.recycling&&e.particles.length===1,'cycle begins at final merger');const origin={...e.particles[0]};
   for(let i=0;i<30;i++)e.step();check(e.particles.length===1,'still concentrating');check(Math.abs(e.particles[0].x-origin.x)<5,'keeps current location');
   e.setConfig({...e.config,trail:8});check(e.cosmicBirth.recycling,'config change preserves cycle');
   for(let i=0;i<50;i++)e.step();check(e.particles.length===100&&near(totals().mass,700),'cycle bursts configured count and preserves mass');
   const mean=e.particles.reduce((s,p)=>s+p.x,0)/100;check(Math.abs(mean-origin.x)<50,'burst stays away from screen center');
   for(let i=0;i<330;i++)e.step();check(!e.cosmicBirth,'cycle completes');
   for(let cycle=0;cycle<2;cycle++){e.particles=[body({mass:700,x:350,vx:.1})];e.step();check(e.cosmicBirth.recycling,'can repeat');for(let i=0;i<370;i++)e.step();check(e.particles.length>1&&near(totals().mass,700),'repeat conserves');}
   seed(depth,{count:650,mutualGravity:2});const initial=totals().mass,start=performance.now();for(let i=0;i<600;i++)e.step();check(e.snapshot().finite&&e.particles.length<=1200,'stable long run');check(near(totals().mass,initial),'long-run mass');check(e.particles.every(p=>p.mass>0),'positive masses');reports.push({depth,count:e.particles.length,merged:e.merged,shattered:e.shattered,msPerStep:(performance.now()-start)/600});
  }
  return reports;
 });assert.deepEqual(errors,[]);console.log('PASS partial fusion, debris ratios, momentum, cap, cycles, location and mass',result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
