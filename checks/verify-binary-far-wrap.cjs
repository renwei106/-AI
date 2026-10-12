const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const sandbox=vm.createContext({window:{}});
for(const file of ['catalog.js','models.js','stage.js'])vm.runInContext(fs.readFileSync('dist/assets/playgrounds/'+file,'utf8'),sandbox);
const E=sandbox.window.ShiyuPlaygrounds,models=sandbox.window.ShiyuPlaygroundModels;
const palette=['#7ed6ce','#a3b8b8','#eef4f3'];
const near=(actual,expected,tolerance=1e-9)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} vs ${expected} (tolerance ${tolerance})`);
const separation=s=>Math.hypot(s.bodies[1].x-s.bodies[0].x,s.bodies[1].y-s.bodies[0].y);
const radialMotion=s=>{const [a,b]=s.bodies;return (b.x-a.x)*(b.vx-a.vx)+(b.y-a.y)*(b.vy-a.vy);};
const center=bodies=>{const mass=bodies[0].mass+bodies[1].mass;return {x:bodies.reduce((sum,b)=>sum+b.x*b.mass,0)/mass,y:bodies.reduce((sum,b)=>sum+b.y*b.mass,0)/mass};};
function invariants(bodies,gravity){const [a,b]=bodies;return {energy:bodies.reduce((sum,p)=>sum+p.mass*(p.vx*p.vx+p.vy*p.vy)/2,0)-gravity*a.mass*b.mass/Math.sqrt((b.x-a.x)**2+(b.y-a.y)**2+.0001),momentum:{x:bodies.reduce((sum,p)=>sum+p.mass*p.vx,0),y:bodies.reduce((sum,p)=>sum+p.mass*p.vy,0)}};}
function context(){let current=null;const segments=[];return {segments,globalAlpha:1,getTransform:()=>({a:1,d:1}),beginPath(){current=null;},moveTo(x,y){current={x,y};},lineTo(x,y){if(current)segments.push(Math.hypot(x-current.x,y-current.y));current={x,y};},stroke(){},ellipse(){},fill(){},fillText(){},createRadialGradient:()=>({addColorStop(){}})};}
function camera(model){const c=context();model.draw(c,palette);const state=model.stats(),origin=center(state.bodies),scale=180/Math.max(1.25,...state.bodies.map(b=>Math.hypot(b.x-origin.x,b.y-origin.y)));state.points.forEach((point,i)=>{near(point.x,400+(state.bodies[i].x-origin.x)*scale);near(point.y,260+(state.bodies[i].y-origin.y)*scale);});return {state,scale,segments:c.segments};}
function create(values={}){const config=E.normalize('binarySystem',values),model=models.create('binarySystem',config);return {model,config};}
function dragVelocity(model,index,dvx,dvy){const {state,scale}=camera(model),start=state.points[index];assert.equal(model.interact(start),true);model.release({x:start.x+dvx*scale/.6,y:start.y+dvy*scale/.6});}
// An independent one-step force calculation isolates the boundary mapping from integration.
function verlet(bodies,gravity,dt){const next=bodies.map(b=>({...b}));function acceleration(){const [a,b]=next,dx=b.x-a.x,dy=b.y-a.y,factor=gravity/Math.pow(dx*dx+dy*dy+.0001,1.5);return [{x:dx*factor*b.mass,y:dy*factor*b.mass},{x:-dx*factor*a.mass,y:-dy*factor*a.mass}];}const before=acceleration();next.forEach((b,i)=>{b.vx+=before[i].x*dt/2;b.vy+=before[i].y*dt/2;b.x+=b.vx*dt;b.y+=b.vy*dt;});const after=acceleration();next.forEach((b,i)=>{b.vx+=after[i].x*dt/2;b.vy+=after[i].y*dt/2;});return next;}
const results={};
{
 const {model,config}=create({speed:10}),initial=model.stats().energy;let maxDistance=0;
 for(let frame=0;frame<1800;frame++){model.update(1/60,config);maxDistance=Math.max(maxDistance,separation(model.stats()));}
 const final=camera(model).state;
 assert.equal(final.wrapping.count,0,'the untouched circular orbit never wraps');
 assert.ok(maxDistance<2.01);assert.ok(Math.abs((final.energy-initial)/initial)<.001);
 results.defaultOrbit={simulationTime:final.simulationTime,maxDistance,wraps:final.wrapping.count};
}
{
 const {model,config}=create({speed:10}),initial=model.stats(),relativeSpeed=initial.bodies[1].vy-initial.bodies[0].vy;
 // Starting at periapsis 2, a tangential drag gives a bound orbit with apoapsis near 28.
 const targetSpeed=Math.sqrt(2*config.gravity*(config.mass0+config.mass1)*(1/2-1/30));
 dragVelocity(model,0,0,relativeSpeed-targetSpeed);
 let maxDistance=0,turned=false,returned=false;
 for(let frame=0;frame<2100;frame++){model.update(1/60,config);const state=model.stats(),distance=separation(state);maxDistance=Math.max(maxDistance,distance);if(maxDistance>20&&radialMotion(state)<0)turned=true;if(turned&&distance<3)returned=true;assert.equal(state.wrapping.count,0,'wide bound orbits return by gravity without a screen-edge teleport');}
 assert.ok(maxDistance>25&&maxDistance<30,`expected a wide orbit, measured ${maxDistance}`);assert.equal(returned,true);camera(model);
 results.wideBoundOrbit={maxDistance,returned,wraps:model.stats().wrapping.count};
}
{
 const {model,config}=create();dragVelocity(model,0,0,-.5);
 const afterDrag=model.stats();let crossedOrdinaryRange=false;
 for(let frame=0;frame<20000&&separation(model.stats())<39.99;frame++){model.update(1/60,config);const state=model.stats();if(separation(state)>10)crossedOrdinaryRange=true;assert.equal(state.wrapping.count,0,'only the far physical separation threshold enables wrapping');}
 assert.equal(crossedOrdinaryRange,true);assert.ok(separation(model.stats())>=39.99,'the escape test reaches the distant boundary');
 const dt=1e-5;let before,expected,wrapped;
 for(let step=0;step<20000;step++){before=model.stats();expected=verlet(before.bodies,config.gravity,dt);model.update(dt,config);wrapped=model.stats();if(wrapped.wrapping.count)break;}
 assert.equal(wrapped.wrapping.count,1);assert.ok(separation(before)<=40);assert.ok(separation(wrapped)>40);assert.ok(radialMotion(before)>0);assert.ok(radialMotion(wrapped)<0,'a distant outgoing pair returns inward after crossing');
 const origin=center(expected),expectedInvariants=invariants(expected,config.gravity);
 wrapped.bodies.forEach((body,i)=>{assert.equal(body.mass,expected[i].mass);for(const axis of ['x','y'])near(body[axis],2*origin[axis]-expected[i][axis]);near(body.vx,expected[i].vx);near(body.vy,expected[i].vy);});
 const wrappedCenter=center(wrapped.bodies);near(wrappedCenter.x,origin.x);near(wrappedCenter.y,origin.y);near(wrapped.energy,expectedInvariants.energy);near(wrapped.momentum.x,expectedInvariants.momentum.x);near(wrapped.momentum.y,expectedInvariants.momentum.y);
 near(wrapped.momentum.x,afterDrag.momentum.x,1e-8);near(wrapped.momentum.y,afterDrag.momentum.y,1e-8);
 const projected=camera(model);assert.ok(Math.max(0,...projected.segments)<20,'teleportation does not draw a line across both sides of the orbit');
 const distanceAtWrap=separation(wrapped);for(let frame=0;frame<60;frame++)model.update(1/60,config);assert.ok(separation(model.stats())<distanceAtWrap);
 results.farEscape={distanceBefore:separation(before),distanceAfter:distanceAtWrap,returningDistance:separation(model.stats()),wraps:wrapped.wrapping.count,maxTrailSegment:Math.max(0,...projected.segments)};
}
results.extremes=[];
for(const [mass0,mass1] of [[.2,.2],[.2,3],[3,.2],[3,3]]){
 const {model,config}=create({mass0,mass1,gravity:2,speed:10});
 // Reducing gravity after launch exercises an escape through an existing settings change.
 config.gravity=.2;model.configure(config);const initial=model.stats();let maxDistance=0;
 for(let frame=0;frame<3600;frame++){model.update(1/60,config);const state=model.stats();maxDistance=Math.max(maxDistance,separation(state));for(const body of state.bodies)for(const value of Object.values(body))assert.ok(Number.isFinite(value));}
 const state=camera(model).state;
 assert.ok(state.wrapping.count>=2,'a distant escape remains finite over repeated crossings');near(state.simulationTime,600,1e-7);assert.ok(maxDistance<40.1);near(state.momentum.x,initial.momentum.x,1e-8);near(state.momentum.y,initial.momentum.y,1e-8);assert.ok(Math.abs((state.energy-initial.energy)/initial.energy)<.001);
 results.extremes.push({mass0,mass1,maxDistance,wraps:state.wrapping.count,simulationTime:state.simulationTime,energyDrift:Math.abs((state.energy-initial.energy)/initial.energy)});
}
const output='.local/checks/verify-binary-far-wrap';fs.mkdirSync(output,{recursive:true});fs.writeFileSync(output+'/results.json',JSON.stringify(results,null,2));
console.log('PASS: bound wide orbits return naturally; only distant outgoing pairs wrap; mass, velocity, energy, momentum, camera and disconnected trails remain intact at 10x and mass extremes.');
