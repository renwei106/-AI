const fs=require('fs');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{const p=await b.newPage();await p.route('**/engine.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('prototypes/emergence/engine.js','utf8')+'\nwindow.__inertiaTest={collideCosmos,updateCosmos};'}));await p.goto('http://127.0.0.1:4327');await p.waitForFunction(()=>window.__emergence);for(const depth of ['flat','depth'])console.log(await p.evaluate(depth=>{const e=__emergence.engine; e.setScene('cosmos',{depth,count:100,influx:'no',pointer:'none',collisions:'off',blackHoles:'no'});e.reset(false);e.setPaused(true);const make=(mass,x)=>({...e.model.create(e),mass,x,y:e.world.height/2,z3:e.world.depth/2,vx:0,vy:0,vz:0,trail:[]});const a=make(512,e.world.width/2),b=make(.2,e.world.width/2+5);e.particles=[a,b];e.step(.00001);const ratio=Math.abs(b.ax/a.ax);if(Math.abs(ratio-2560)>1e-6)throw Error('inertia ratio');const momentum=a.mass*a.vx+b.mass*b.vx;if(Math.abs(momentum)>1e-8)throw Error('momentum');const start=a.x,smallStart=b.x;
for(let i=0;i<300;i++)__inertiaTest.updateCosmos(e,.03,e.is3D);
const driftRatio=Math.abs((b.x-smallStart)/(a.x-start));if(Math.abs(driftRatio-2560)>1e-3)throw Error('trajectory mass ratio');
const large=make(512,e.world.width/2),dust=make(.2,large.x+.1);large.vx=.4;dust.vx=-3;
for(const q of [large,dust]){q.px=q.x;q.py=q.y;q.pz=q.z3;q.radius=1;}
e.particles=[large,dust];e.followTarget=large;__inertiaTest.collideCosmos(e,.3,e.is3D);
const merged=e.particles[0],expected=(512*.4+.2*-3)/512.2;
if(e.particles.length!==1||Math.abs(merged.vx-expected)>1e-12||merged.x!==large.x||e.followTarget!==merged)throw Error('collision inertia');
return {depth,accelerationRatio:ratio,trajectoryRatio:driftRatio,collisionVelocityBefore:.4,collisionVelocityAfter:merged.vx,momentum};},depth));}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
