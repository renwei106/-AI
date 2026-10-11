const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await browser.newPage({viewport:{width:2066,height:1070},reducedMotion:'reduce'});
 await p.goto('http://127.0.0.1:4327');await p.waitForFunction(()=>window.__emergence);
 for(const [width,height] of [[2066,1070],[1033,781],[390,844]]){
  await p.setViewportSize({width,height});
  const report=await p.evaluate(()=>{
   const e=__emergence.engine,check=(ok,msg)=>{if(!ok)throw Error(msg)};
   e.resize();
   const project=p=>{
    if(!e.is3D)return {x:p.x*e.scale,y:p.y*e.scale};
    const x=p.x-e.world.width/2,y=p.y-e.world.height/2,z=p.z3-e.world.depth/2,c=e.camera;
    const u=x*Math.cos(c.yaw)+z*Math.sin(c.yaw),v=-x*Math.sin(c.yaw)+z*Math.cos(c.yaw),yy=y*Math.cos(c.pitch)-v*Math.sin(c.pitch),zz=y*Math.sin(c.pitch)+v*Math.cos(c.pitch),k=e.projection3.focal/(e.projection3.distance+zz);
    return {x:e.width/2+u*k,y:e.height/2+yy*k};
   };
   const inside=()=>{for(const body of [...e.particles,...e.predators]){const s=project(body);check(s.x>=-1e-6&&s.x<=e.width+1e-6&&s.y>=-1e-6&&s.y<=e.height+1e-6,'screen containment '+JSON.stringify({s,scene:e.scene.id,dimension:e.config.depth,view:[e.width,e.height]}));}check(e.snapshot().finite,'finite simulation')};
   for(const scene of ['birds','cosmos'])for(const depth of ['flat','depth']){
    e.setScene(scene,{depth,edgeWrap:'no',count:100,predators:2,breeding:'yes',birthInterval:10,collisions:'off',mutualGravity:0});e.setPaused(true);inside();
    for(let angle=0;angle<4;angle++){
     if(e.is3D)e.rotateCamera(Math.PI/2,.08);inside();
     for(let i=0;i<180;i++){e.step();inside()}
    }
    if(scene==='birds')check(e.born>0,'newborns included');
    const count=e.particles.length;e.setConfig({...e.config,edgeWrap:'yes'});check(e.particles.length===count,'switch does not reset population');e.setConfig({...e.config,edgeWrap:'no'});inside();
   }
   e.setScene('cosmos',{edgeWrap:'no',mutualGravity:0,collisions:'off'});
   const sample=()=>({...e.model.create(e),vx:0,vy:0,vz:0});
   for(const side of ['left','right','top','bottom']){
    const body=sample();body.x=side==='left'?0:side==='right'?e.world.width:e.world.width/2;body.y=side==='top'?0:side==='bottom'?e.world.height:e.world.height/2;body.vx=side==='left'?-3:side==='right'?3:0;body.vy=side==='top'?-3:side==='bottom'?3:0;e.particles=[body];e.step();inside();
    check(side==='left'?body.vx>0:side==='right'?body.vx<0:side==='top'?body.vy>0:body.vy<0,'edge turns inward '+side);
   }
   e.setConfig({...e.config,edgeWrap:'yes'});const body=sample();body.x=e.world.width-.5;body.vx=2;e.particles=[body];e.step();check(body.x<5,'wrap remains available');
   e.setConfig({...e.config,edgeWrap:'no',mutualGravity:1});const a=sample(),b=sample();a.x=10;b.x=e.world.width-10;a.y=b.y=e.world.height/2;e.particles=[a,b];e.step();check(a.ax>0&&b.ax<0,'closed edges use direct gravity, not seam attraction');
   return {width:e.width,height:e.height,scenes:2,dimensions:2,rotations:4};
  });console.log('PASS screen edges, rotations, births, hunters, switching, no seam forces',report);
 }
 // Container resizing must work even when the browser window stays unchanged.
 await p.evaluate(()=>{const e=__emergence.engine;e.setScene('birds',{depth:'depth',edgeWrap:'no'});e.canvas.style.setProperty('width','300px','important');e.canvas.style.setProperty('height','400px','important')});
 await p.waitForFunction(()=>__emergence.engine.width===300&&__emergence.engine.height===400);
 assert.equal(await p.evaluate(()=>__emergence.engine.snapshot().finite),true);console.log('PASS container ResizeObserver');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
