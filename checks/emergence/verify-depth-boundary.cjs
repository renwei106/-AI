const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:2066,height:1070},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/engine.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('dist/assets/emergence/engine.js','utf8')+'\nexport {volume,advance3};'}));
 await page.goto('http://127.0.0.1:4327');await page.waitForFunction(()=>window.__emergence);
 const result=await page.evaluate(async()=>{
  const {volume,advance3}=await import('./engine.js'),e=__emergence.engine,check=(v,m)=>{if(!v)throw Error(m);};
  e.setScene('birds',{depth:'depth',shape:'dot',predators:0,breeding:'no'});const w=e.world;
  for(const [axis,velocity,length] of [['x','vx',w.width],['y','vy',w.height],['z3','vz',w.depth]])for(const side of [0,1]){
   const p={x:w.width/2,y:w.height/2,z3:w.depth/2,vx:0,vy:0,vz:0};p[axis]=side?length-.01:.01;p[velocity]=side?4:-4;
   const old=p[axis];advance3(p,1,w);check(Math.abs(p[axis]-old)<4,'no world teleport');check(p[axis]>=0&&p[axis]<=length,'bounded habitat');check(side?p[velocity]<0:p[velocity]>0,'turn back locally');
  }
  const unproject=(x,y,z)=>{
   const {yaw,pitch}=e.camera,k=e.projection3.focal/(e.projection3.distance+z),u=(x-e.width/2)/k,yy=(y-e.height/2)/k;
   const v=-yy*Math.sin(pitch)+z*Math.cos(pitch);
   return {x:w.width/2+u*Math.cos(yaw)-v*Math.sin(yaw),y:w.height/2+yy*Math.cos(pitch)+z*Math.sin(pitch),z3:w.depth/2+u*Math.sin(yaw)+v*Math.cos(yaw)};
  };
  const pixels=(x,y,width,height)=>{const d=e.ctx.getImageData(x*e.dpr,y*e.dpr,width*e.dpr,height*e.dpr).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n;};
  const p=e.particles[0];p.size=7;e.particles=[p];e.predators=[];e.fades=[];
  for(const [yaw,pitch] of [[0,0],[Math.PI/2,.4],[Math.PI,-.5],[5.9,1.2]]){
   e.camera={yaw,pitch};
   for(const [x,y,vertical] of [[-.1,e.height/2,false],[e.width+.1,e.height/2,false],[e.width/2,-.1,true],[e.width/2,e.height+.1,true]]){
    Object.assign(p,unproject(x,y,0));e.draw();
    check(vertical?pixels(0,0,e.width,6)&&pixels(0,e.height-6,e.width,6):pixels(0,0,6,e.height)&&pixels(e.width-6,0,6,e.height),'body crosses only through matching screen edges');
    check(!pixels(e.width/2-10,e.height/2-10,20,20),'no stretched body across center');
   }
   const near=volume.project(e,unproject(e.width/2,e.height/2,-w.depth*.35)),far=volume.project(e,unproject(e.width/2,e.height/2,w.depth*.35));
   check(near.sizeK>far.sizeK&&near.depth<far.depth,'near larger and brighter, far smaller and dimmer');check(near.sizeK<=e.scale*2.6,'near size cap');
  }
  for(const scene of ['birds','cosmos']){
   e.setScene(scene,{depth:'depth',predators:0,breeding:'no',centers:0,collisions:'off',mutualGravity:0});
   e.particles=e.particles.slice(0,40);for(let n=0;n<500;n++){const before=e.particles.map(p=>[p.x,p.y,p.z3]);e.step();e.particles.forEach((p,i)=>check(Math.hypot(p.x-before[i][0],p.y-before[i][1],p.z3-before[i][2])<5,'continuous physical trajectory'));}
   check(e.snapshot().finite,'finite after boundary turns');
  }
  return {continuousDepth:true,allFourScreenEdges:true,rotatedViews:4,nearFar:true,bothModels:true};
 });
 assert.deepEqual(errors,[]);console.log('PASS',result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
