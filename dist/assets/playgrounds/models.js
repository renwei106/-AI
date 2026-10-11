/* Nine mutually attracting bodies, in illustrative screen units. */
(function(root){
 'use strict';
 root.ShiyuSolarSystemModel=function(config){
  const names=['太阳','水星','金星','地球','火星','木星','土星','天王星','海王星'];
  const masses=[100,.00002,.00025,.0003,.00003,.095,.028,.0044,.0051];
  const radii=[11,2.7,3.7,4,3.2,7,6,4.8,4.6];
  const colors=['#e6ad4c','#a7a29a','#c7a273','#639eaa','#bf785d','#b59373','#c5b28a','#7baeb0','#6489bc'];
  let bodies=[],trails=[],time=0,trailTime=0,grab=null,center={x:0,y:0,z:0},scale=46;
  const project=v=>({x:v.x+.45*v.z,y:.62*v.y-.6*v.z});
  const point=b=>{const q=project({x:b.x-center.x,y:b.y-center.y,z:b.z-center.z});return {x:512+q.x*scale,y:265+q.y*scale};};
  const world=(p,z)=>({x:center.x+(p.x-512)/scale-.45*(z-center.z),y:center.y+((p.y-265)/scale+.6*(z-center.z))/.62});
  function reset(){
   const distances=[.65,.95,1.3,1.65,2.25,2.9,3.55,4.25];
   const inclinations=[0,7,3.4,0,1.85,1.3,2.5,.77,1.77];
   bodies=names.map((name,i)=>{const a=i*2.399,r=i?distances[i-1]:0,v=i?Math.sqrt(config.gravity*100/r):0,tilt=inclinations[i]*Math.PI/180;return {name,mass:masses[i],x:Math.cos(a)*r,y:Math.sin(a)*r*Math.cos(tilt),z:Math.sin(a)*r*Math.sin(tilt),vx:-Math.sin(a)*v,vy:Math.cos(a)*v*Math.cos(tilt),vz:Math.cos(a)*v*Math.sin(tilt)};});
   const mass=masses.reduce((a,b)=>a+b,0),vx=bodies.reduce((a,b)=>a+b.mass*b.vx,0)/mass,vy=bodies.reduce((a,b)=>a+b.mass*b.vy,0)/mass;
   const vz=bodies.reduce((a,b)=>a+b.mass*b.vz,0)/mass;
   // Illustrative common motion at 60 degrees to the reference orbital plane.
   bodies.forEach(b=>{b.vx+=.425-vx;b.vy-=vy;b.vz+=.85*Math.sin(Math.PI/3)-vz});trails=names.map(()=>[]);time=0;trailTime=0;grab=null;center={x:0,y:0,z:0};scale=46;
  }
  function acceleration(p){const a=bodies.map(()=>({x:0,y:0,z:0}));for(let i=0;i<9;i++)for(let j=i+1;j<9;j++){const d={x:bodies[j].x-bodies[i].x,y:bodies[j].y-bodies[i].y,z:bodies[j].z-bodies[i].z},k=p.gravity/Math.pow(d.x*d.x+d.y*d.y+d.z*d.z+.0004,1.5);for(const axis of ['x','y','z']){a[i][axis]+=d[axis]*k*bodies[j].mass;a[j][axis]-=d[axis]*k*bodies[i].mass;}}return a;}
  // Contact uses actual spatial distance, not apparent screen overlap.
  function contacts(){for(let pass=0;pass<4;pass++)for(let i=0;i<9;i++)for(let j=i+1;j<9;j++){
   const a=bodies[i],b=bodies[j],delta={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z},d=Math.hypot(delta.x,delta.y,delta.z),limit=(radii[i]+radii[j])/46;if(d>=limit)continue;
   const normal=d>1e-10?{x:delta.x/d,y:delta.y/d,z:delta.z/d}:{x:1,y:0,z:0},total=a.mass+b.mass,overlap=limit-d+1e-8;
   let closing=0;for(const axis of ['x','y','z']){a[axis]-=normal[axis]*overlap*b.mass/total;b[axis]+=normal[axis]*overlap*a.mass/total;closing+=(b['v'+axis]-a['v'+axis])*normal[axis];}
   if(closing<0){const impulse=-2*closing/(1/a.mass+1/b.mass);for(const axis of ['x','y','z']){a['v'+axis]-=impulse*normal[axis]/a.mass;b['v'+axis]+=impulse*normal[axis]/b.mass;}}
  }}
  function frame(p,dt){
   const sun=bodies[0],near=bodies.filter(b=>Math.hypot(b.x-sun.x,b.y-sun.y,b.z-sun.z)<7),mass=near.reduce((a,b)=>a+b.mass,0),target={x:near.reduce((a,b)=>a+b.x*b.mass,0)/mass,y:near.reduce((a,b)=>a+b.y*b.mass,0)/mass,z:near.reduce((a,b)=>a+b.z*b.mass,0)/mass},blend=1-Math.exp(-dt*3);
   for(const axis of ['x','y','z']){const offset=target[axis]-center[axis];center[axis]+=Math.sign(offset)*Math.max(0,Math.abs(offset)-(axis==='y'?1.2:1.6))*blend;}
   const extent=Math.max(2,...near.map(b=>Math.hypot(b.x-target.x,b.y-target.y,b.z-target.z)));scale+=(Math.max(30,Math.min(85,190/extent))-scale)*blend;
   if(p.wrap)bodies.forEach((b,i)=>{const q=point(b),x=((q.x+24)%848+848)%848-24,y=((q.y+24)%568+568)%568-24;if(q.x < -24||q.x>824||q.y < -24||q.y>544){const next=world({x,y},b.z);b.x=next.x;b.y=next.y;trails[i].push({x:b.x,y:b.y,z:b.z,t:trailTime,break:true});}});
  }
  function update(dt,p){config=p;if(grab)return;contacts();let remaining=dt*p.speed*.3;
   while(remaining>1e-9){let h=Math.min(remaining,1/360);for(let i=0;i<9;i++)for(let j=i+1;j<9;j++){const a=bodies[i],b=bodies[j],r=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);h=Math.min(h,.03*Math.sqrt(Math.pow(r*r+.0004,1.5)/(p.gravity*(a.mass+b.mass))),.04*Math.max(.02,r)/Math.max(.01,Math.hypot(a.vx-b.vx,a.vy-b.vy,a.vz-b.vz)));}
    const a=acceleration(p);bodies.forEach((b,i)=>{b.vx+=a[i].x*h/2;b.vy+=a[i].y*h/2;b.vz+=a[i].z*h/2;b.x+=b.vx*h;b.y+=b.vy*h;b.z+=b.vz*h});contacts();const next=acceleration(p);bodies.forEach((b,i)=>{b.vx+=next[i].x*h/2;b.vy+=next[i].y*h/2;b.vz+=next[i].z*h/2});time+=h;remaining-=h;
   }
   trailTime+=dt;frame(p,dt);bodies.forEach((b,i)=>{trails[i].push({x:b.x,y:b.y,z:b.z,t:trailTime});while(trails[i].length&&(trailTime-trails[i][0].t>p.trail||trails[i].length>4002))trails[i].shift();});
  }
  function interact(p,tool){let best=-1,d=18; bodies.forEach((b,i)=>{const q=point(b),distance=Math.hypot(q.x-p.x,q.y-p.y);if(distance<d){d=distance;best=i}});if(best<0)return false;grab={i:best,tool,x:p.x,y:p.y,original:{...bodies[best]}};return true;}
  function addedVelocity(p){const x=(p.x-grab.x)/scale*1.2,y=(p.y-grab.y)/(scale*.62)*1.2,length=Math.hypot(x,y),original=grab.original,limit=Math.max(.5,Math.min(4,Math.hypot(original.vx,original.vy,original.vz)*.5)),factor=length>limit?limit/length:1;return {x:x*factor,y:y*factor};}
  function release(p){if(!grab)return;const b=bodies[grab.i];if(!p)Object.assign(b,grab.original);else{const added=addedVelocity(p);b.vx=grab.original.vx+added.x;b.vy=grab.original.vy+added.y;}grab=null;}
  function draw(c,palette,p,pointer){
   const transform=c.getTransform(),ratio=Math.abs(transform.a/transform.d)||1,circle=(x,y,r)=>c.ellipse(x,y,r,r*ratio,0,0,Math.PI*2);
   trails.forEach((trail,i)=>{if(trail.length<2||p.trail<=0)return;c.strokeStyle=colors[i];c.lineWidth=.8;for(let j=1;j<trail.length;j++){if(trail[j].break)continue;const a=point(trail[j-1]),b=point(trail[j]),remaining=p.trail-(trailTime-(trail[j-1].t+trail[j].t)/2),f=Math.max(0,Math.min(1,remaining/(p.trail*.35)));c.globalAlpha=.24*f*f*(3-2*f);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}});
   bodies.map((b,i)=>({b,i})).sort((a,b)=>(a.b.y*.6+a.b.z*.62)-(b.b.y*.6+b.b.z*.62)).forEach(({b,i})=>{const q=point(b);c.globalAlpha=.06;c.fillStyle=colors[i];c.beginPath();circle(q.x,q.y,radii[i]*2);c.fill();c.globalAlpha=1;c.beginPath();circle(q.x,q.y,radii[i]);c.fill();if(i===6){c.globalAlpha=.5;c.strokeStyle=colors[i];c.beginPath();c.ellipse(q.x,q.y,11,3,-.3,0,Math.PI*2);c.stroke();}c.globalAlpha=.65;c.fillStyle=palette[1];c.font=(7/Math.abs(transform.d))+'px system-ui';c.fillText(b.name,q.x+radii[i]+5,q.y+3);});c.globalAlpha=1;
   if(grab&&pointer){const q=point(bodies[grab.i]);c.strokeStyle=palette[0];c.globalAlpha=.7;c.beginPath();circle(q.x,q.y,radii[grab.i]+5);c.stroke();const added=addedVelocity(pointer);root.ShiyuVelocityPreview?.draw(c,q,project({x:grab.original.vx,y:grab.original.vy,z:grab.original.vz}),project({...added,z:0}),palette[0],95/Math.max(Math.abs(transform.a),Math.abs(transform.d)),7/Math.abs(transform.d),true);c.globalAlpha=1;}
  }
  reset();return {update,draw,interact,release,configure:p=>{config=p},action:reset,stats:()=>({bodies:bodies.map(b=>({...b})),points:bodies.map(point),simulationTime:time})};
 };
})(window);

/* Six bounded interactive models. All run locally, without network assets. */
(function(root){
 'use strict';
 const W=800,H=520,rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),circle=(c,x,y,r)=>{const t=c.getTransform(),ratio=Math.sqrt(Math.abs(t.d/t.a))||1;c.beginPath();c.ellipse(x,y,r*ratio,r/ratio,0,0,Math.PI*2);c.fill();};
 const wrapped=(v,size)=>((v%size)+size)%size;
 function velocityPreview(c,q,velocity,added,accent,maxLength=95,fontSize=10,showParallelogram=false,pixelsPerVelocity){
  const combined={x:velocity.x+added.x,y:velocity.y+added.y},factor=pixelsPerVelocity??maxLength/Math.max(1,Math.hypot(velocity.x,velocity.y),Math.hypot(added.x,added.y),Math.hypot(combined.x,combined.y));
  c.save();const arrow=(v,color,label,dashed,offset)=>{const dx=v.x*factor,dy=v.y*factor,x=q.x+dx,y=q.y+dy;c.strokeStyle=color;c.fillStyle=color;c.lineWidth=.8;c.setLineDash(dashed?[4,4]:[]);if(Math.hypot(dx,dy)>(showParallelogram?1e-8:2)){c.beginPath();c.moveTo(q.x,q.y);c.lineTo(x,y);c.stroke();c.setLineDash([]);const a=Math.atan2(dy,dx);c.beginPath();c.moveTo(x,y);c.lineTo(x-5*Math.cos(a-.45),y-5*Math.sin(a-.45));c.lineTo(x-5*Math.cos(a+.45),y-5*Math.sin(a+.45));c.closePath();c.fill();}if(label){c.font=fontSize+'px system-ui';c.fillText(label,x+10,y+offset);}};
  c.globalAlpha=showParallelogram?.9:.6;arrow(velocity,'#497eb0',showParallelogram?'原速度':'',false,-12);arrow(added,'#bb793d',showParallelogram?'新增速度':Math.hypot(added.x,added.y).toFixed(2),false,14);c.globalAlpha=showParallelogram?.85:.22;arrow(combined,accent,showParallelogram?'合速度':'',true,0);c.globalAlpha=1;
  {c.setLineDash([2,4]);c.globalAlpha=showParallelogram?.45:.18;c.strokeStyle=accent;c.beginPath();c.moveTo(q.x+velocity.x*factor,q.y+velocity.y*factor);c.lineTo(q.x+combined.x*factor,q.y+combined.y*factor);if(showParallelogram){c.moveTo(q.x+added.x*factor,q.y+added.y*factor);c.lineTo(q.x+combined.x*factor,q.y+combined.y*factor);}c.stroke();}c.restore();
 }
 root.ShiyuVelocityPreview={draw:velocityPreview};
 function particleLife(config){
  let particles=[],rules=[],time=0;
  const one=(x=rand(40,760),y=rand(40,480),type=Math.floor(rand(0,3)))=>({x,y,vx:rand(-6,6),vy:rand(-6,6),type});
  const randomRules=()=>{rules=Array.from({length:3},(_,i)=>Array.from({length:3},(_,j)=>i===j?.65:rand(-1,1)));};randomRules();
  for(let i=0;i<config.count;i++)particles.push(one());
  function configure(p){while(particles.length<p.count)particles.push(one());particles.length=p.count;}
  function interact(p,tool){if(tool==='add'){const incoming=24;particles.splice(0,Math.max(0,particles.length+incoming-600));for(let i=0;i<incoming;i++)particles.push(one(wrapped(p.x+rand(-20,20),W),wrapped(p.y+rand(-20,20),H)));return;}for(const b of particles){const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy);if(d<100&&d>1){b.vx+=dx/d*30;b.vy+=dy/d*30;}}}
  function update(dt,p,pointer){time+=dt;dt*=p.speed;const grid=new Map(),R=82,nx=Math.floor(W/R),ny=Math.floor(H/R),cw=W/nx,ch=H/ny;for(const b of particles){const key=Math.floor(b.x/cw)+','+Math.floor(b.y/ch);if(!grid.has(key))grid.set(key,[]);grid.get(key).push(b);}const changes=[];for(const b of particles){let fx=0,fy=0;const gx=Math.floor(b.x/cw),gy=Math.floor(b.y/ch);for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const q of grid.get((p.wrap?wrapped(gx+dx,nx):gx+dx)+','+(p.wrap?wrapped(gy+dy,ny):gy+dy))||[]){if(q===b)continue;const x=p.wrap?wrapped(q.x-b.x+W/2,W)-W/2:q.x-b.x,y=p.wrap?wrapped(q.y-b.y+H/2,H)-H/2:q.y-b.y,r=Math.hypot(x,y);if(r<.1||r>R)continue;const force=r<13?(r/13-1)*120:rules[b.type][q.type]*p.attraction*(1-r/R)*28;fx+=x/r*force;fy+=y/r*force;}changes.push({fx,fy});}particles.forEach((b,i)=>{b.vx=clamp((b.vx+changes[i].fx*dt)*Math.exp(-2*dt),-120,120);b.vy=clamp((b.vy+changes[i].fy*dt)*Math.exp(-2*dt),-120,120);b.x+=b.vx*dt;b.y+=b.vy*dt;if(p.wrap){b.x=wrapped(b.x,W);b.y=wrapped(b.y,H);}else{if(b.x<3||b.x>W-3)b.vx*=-1;if(b.y<3||b.y>H-3)b.vy*=-1;b.x=clamp(b.x,3,W-3);b.y=clamp(b.y,3,H-3);}});if(pointer?.down&&pointer.tool==='stir')interact(pointer,'stir');}
  function draw(c,colors){particles.forEach(b=>{c.globalAlpha=.72;c.fillStyle=colors[b.type];circle(c,b.x,b.y,b.type===0?2.7:2);});c.globalAlpha=1;}
  return {update,draw,interact,configure,action:randomRules,stats:()=>({particles:particles.length,rules:rules.flat(),positions:particles.slice(0,8).map(b=>[b.x,b.y])})};
 }
 function ecoGarden(config){
  const species={rabbit:{name:'兔',diet:[],speed:28,size:5,color:'#497eb0',energy:2},sheep:{name:'羊',diet:[],speed:18,size:7,color:'#687da0',energy:3},fox:{name:'狐',diet:['rabbit'],speed:34,size:7,color:'#c67c3e',energy:4},wolf:{name:'狼',diet:['rabbit','sheep'],speed:30,size:8,color:'#945b83',energy:5},tiger:{name:'虎',diet:['rabbit','sheep','fox'],speed:26,size:10,color:'#b95b47',energy:6}};
  const plants=[],animals=[];let rain=0,clock=0,nextId=0;
  const herbivore=a=>!species[a.kind].diet.length;
  const plant=(x=rand(60,740),y=rand(50,470))=>{if(plants.length<700)plants.push({x,y,size:rand(1.5,4)});};
  const animal=(kind,x=rand(80,720),y=rand(70,450))=>{kind=kind==='prey'?'sheep':kind==='predator'?'wolf':kind;if(!species[kind])return;const herb=!species[kind].diet.length;if(animals.filter(a=>herbivore(a)===herb).length<(herb?100:20))animals.push({id:nextId++,x:clamp(x,30,770),y:clamp(y,30,490),kind,angle:rand(0,Math.PI*2),energy:species[kind].energy,cooldown:6});};
  for(let i=0;i<260;i++)plant();for(let i=0;i<config.herbivores;i++)animal(i%2?'rabbit':'sheep');for(let i=0;i<config.predators;i++)animal(['fox','wolf','tiger'][i%3]);
  function configure(p,changed){for(const key of ['herbivores','predators']){if(changed&&changed!==key)continue;const herb=key==='herbivores';let list=animals.filter(a=>herbivore(a)===herb);while(list.length<p[key]){animal(herb?(list.length%2?'rabbit':'sheep'):['fox','wolf','tiger'][list.length%3]);list=animals.filter(a=>herbivore(a)===herb);}while(list.length>p[key])animals.splice(animals.indexOf(list.pop()),1);}}
  function interact(p,tool){if(tool==='plant'||tool==='water'){for(let i=0;i<(tool==='water'?20:12);i++)plant(clamp(p.x+rand(-30,30),30,770),clamp(p.y+rand(-30,30),30,490));if(tool==='water')rain=1;}else animal(tool,p.x,p.y);}
  function update(dt,p){clock+=dt;rain=Math.max(0,rain-dt*.12);if(Math.random()<dt*p.growth*14)plant();for(const a of animals.slice()){if(!animals.includes(a))continue;const spec=species[a.kind],herb=herbivore(a),targets=herb?plants:animals.filter(q=>spec.diet.includes(q.kind));let target=null,best=herb?150:210;for(const q of targets){const d=dist(a,q);if(d<best){best=d;target=q;}}let threat=null,danger=75;for(const q of animals){if(!species[q.kind].diet.includes(a.kind))continue;const d=dist(a,q);if(d<danger){danger=d;threat=q;}}if(threat)a.angle=Math.atan2(a.y-threat.y,a.x-threat.x);else if(target){a.angle=Math.atan2(target.y-a.y,target.x-a.x);if(best<8){const list=herb?plants:animals,index=list.indexOf(target);if(index>=0){list.splice(index,1);a.energy+=herb?.5:species[target.kind].energy*.65;}}}else a.angle+=rand(-1,1)*dt*2;
   const speed=spec.speed*(threat?1.3:1);a.x=clamp(a.x+Math.cos(a.angle)*speed*dt,30,770);a.y=clamp(a.y+Math.sin(a.angle)*speed*dt,30,490);if(a.x<=30||a.x>=770||a.y<=30||a.y>=490)a.angle+=Math.PI;a.energy-=dt*(herb?.055:.1);a.cooldown-=dt;if(a.energy>spec.energy*1.8&&a.cooldown<=0){a.energy*=.55;a.cooldown=12;animal(a.kind,a.x+8,a.y+8);}if(a.energy<=0){const i=animals.indexOf(a);if(i>=0)animals.splice(i,1);}}
  }
  function drawAnimal(c,a){const spec=species[a.kind],t=c.getTransform(),scale=Math.sqrt(Math.abs(t.a*t.d));c.save();c.translate(a.x,a.y);c.scale(scale/Math.abs(t.a),scale/Math.abs(t.d));c.rotate(a.angle);c.fillStyle=spec.color;c.beginPath();c.ellipse(0,0,spec.size,3,0,0,Math.PI*2);c.fill();c.restore();}
  function draw(c,colors,p){plants.forEach(b=>{c.globalAlpha=.4;c.fillStyle=colors[0];circle(c,b.x,b.y,b.size);c.fillRect(b.x-.4,b.y,1,b.size*2);});c.globalAlpha=.95;animals.forEach(a=>drawAnimal(c,a));if(rain>0){c.globalAlpha=rain*.2;c.strokeStyle=colors[1];for(let i=0;i<45;i++){const x=(i*139)%W,y=wrapped(clock*180+i*61,H);c.beginPath();c.moveTo(x,y);c.lineTo(x-3,y+13);c.stroke();}}c.globalAlpha=1;}
  return {update,draw,configure,interact,action:()=>{rain=1;for(let i=0;i<80;i++)plant();},stats:()=>({plants:plants.length,herbivores:animals.filter(herbivore).length,predators:animals.filter(a=>!herbivore(a)).length,species:Object.fromEntries(Object.keys(species).map(k=>[k,animals.filter(a=>a.kind===k).length])),foodWeb:Object.fromEntries(Object.entries(species).map(([k,v])=>[k,v.diet.length?v.diet:['plants']])),animals:animals.map(a=>({...a})),positions:animals.slice(0,6).map(a=>[a.x,a.y])})};
 }
 function elementSandbox(){
  const nx=160,ny=104,grid=new Uint8Array(nx*ny),age=new Uint16Array(nx*ny),off=document.createElement('canvas');off.width=nx;off.height=ny;const oc=off.getContext('2d'),pixels=oc.createImageData(nx,ny);let accumulator=0,ticks=0;
  const at=(x,y)=>x<0||x>=nx||y<0||y>=ny?5:grid[y*nx+x];
  const set=(x,y,t)=>{if(x>=0&&x<nx&&y>=0&&y<ny){grid[y*nx+x]=t;age[y*nx+x]=0;}};
  for(let x=0;x<nx;x++)for(let y=ny-8-Math.floor(3*Math.sin(x/11));y<ny;y++)set(x,y,5);
  for(let x=24;x<68;x++)for(let y=50+Math.abs(x-46)*.6;y<95;y++)set(x,Math.floor(y),1);
  for(let x=90;x<142;x++)for(let y=77;y<94;y++)if(!at(x,y))set(x,y,2);
  for(let x=108;x<130;x+=5)set(x,76,6);
  function interact(p,tool,config){const types={sand:1,water:2,fire:3,seed:6,wall:5,erase:0},cx=Math.floor(p.x/5),cy=Math.floor(p.y/5),r=config.brush;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r)set(cx+x,cy+y,types[tool]??1);}
  function tick(){ticks++;const done=new Uint8Array(grid.length);for(let y=ny-2;y>=0;y--)for(let n=0;n<nx;n++){const x=ticks%2?n:nx-1-n,i=y*nx+x,t=grid[i];if(!t||done[i])continue;const move=(tx,ty)=>{if(tx<0||tx>=nx||ty<0||ty>=ny)return false;const j=ty*nx+tx,q=grid[j];if(q&&!(t===1&&q===2))return false;grid[i]=q;grid[j]=t;age[j]=age[i];done[j]=1;return true;};const direction=Math.random()<.5?-1:1;if(t===1||t===2||t===6){if(t===6&&[at(x-1,y),at(x+1,y),at(x,y+1)].includes(2)){set(x,y,4);set(x,y-1,4);continue;}if(move(x,y+1)||move(x+direction,y+1)||move(x-direction,y+1))continue;if(t===2){move(x+direction,y)||move(x-direction,y);}}else if(t===3){age[i]++;if(age[i]>25+Math.random()*25){grid[i]=0;continue;}for(const [dx,dy] of [[0,-1],[-1,0],[1,0],[0,1]]){const q=at(x+dx,y+dy);if(q===4||q===6)set(x+dx,y+dy,3);if(q===2){grid[i]=0;break;}}if(Math.random()<.5)move(x+direction,y-1);}else if(t===4&&Math.random()<.008){if([at(x-1,y+1),at(x+1,y+1),at(x,y+1)].includes(2))set(x+direction,y-1,4);}}
  }
  function update(dt,p,pointer){if(pointer?.down)interact(pointer,pointer.tool,p);accumulator+=dt*p.speed;for(let n=0;n<5&&accumulator>=1/30;n++){tick();accumulator-=1/30;}}
  function draw(c){const colors=[[0,0,0,0],[194,154,87,235],[71,139,171,210],[236,124,67,230],[80,137,92,240],[116,125,113,100],[150,126,79,230]];for(let i=0;i<grid.length;i++){const p=colors[grid[i]],j=i*4;for(let k=0;k<4;k++)pixels.data[j+k]=p[k];}oc.putImageData(pixels,0,0);c.imageSmoothingEnabled=false;c.drawImage(off,0,0,W,H);c.imageSmoothingEnabled=true;}
  return {update,draw,interact,configure:()=>{},action:()=>{grid.fill(0);age.fill(0);},stats:()=>({cells:grid.reduce((n,t)=>n+(t>0),0),sand:grid.reduce((n,t)=>n+(t===1),0),water:grid.reduce((n,t)=>n+(t===2),0),fire:grid.reduce((n,t)=>n+(t===3),0),ticks})};
 }
 function softFabric(){
  const cols=28,rows=19,nodes=[],links=[],fallenPins=[];let time=0,grab=-1;
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const px=130+x*20,py=50+y*19;nodes.push({x:px,y:py,ox:px,oy:py,pin:y===0&&x%4===0});if(x)links.push({a:y*cols+x-1,b:y*cols+x,length:20,cut:false});if(y)links.push({a:(y-1)*cols+x,b:y*cols+x,length:19,cut:false});}
  function closest(p){let index=-1,best=30;nodes.forEach((n,i)=>{const d=dist(n,p);if(d<best){index=i;best=d;}});return index;}
  function interact(p,tool){grab=-1;if(tool==='pull'){grab=closest(p);if(grab>=0&&nodes[grab].pin&&dist(nodes[grab],p)<12){const n=nodes[grab];n.pin=false;fallenPins.push({x:n.x,y:n.y,vy:0,age:0});grab=-1;}}else if(tool==='pin'){const i=closest(p);if(i>=0)nodes[i].pin=true;}else if(tool==='cut'){for(const l of links){const a=nodes[l.a],b=nodes[l.b];if(dist({x:(a.x+b.x)/2,y:(a.y+b.y)/2},p)<25)l.cut=true;}}}
  function update(dt,p,pointer){for(const pin of fallenPins){pin.age+=dt;pin.vy+=180*dt;pin.y+=pin.vy*dt;}while(fallenPins.length&&fallenPins[0].age>1.2)fallenPins.shift();time+=dt;const t=Math.min(.02,dt);nodes.forEach((n,i)=>{if(n.pin)return;if(i===grab&&pointer?.down){n.x=clamp(pointer.x,5,795);n.y=clamp(pointer.y,5,510);n.ox=n.x;n.oy=n.y;return;}const vx=clamp((n.x-n.ox)*.98,-8,8),vy=clamp((n.y-n.oy)*.98,-8,8);n.ox=n.x;n.oy=n.y;n.x+=vx+Math.sin(time*1.4+n.y*.02)*p.wind*.15;n.y+=vy+220*t*t;n.x=clamp(n.x,5,795);n.y=clamp(n.y,5,510);});if(!pointer?.down)grab=-1;if(pointer?.down&&pointer.tool==='cut')interact(pointer,'cut');for(let k=0;k<5;k++)for(const l of links){if(l.cut)continue;const a=nodes[l.a],b=nodes[l.b],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,f=(d-l.length)/d*(.65-p.elasticity*.25);if(!a.pin&&l.a!==grab){a.x+=dx*f;a.y+=dy*f;}if(!b.pin&&l.b!==grab){b.x-=dx*f;b.y-=dy*f;}}}
  function draw(c,colors){const torn=new Set(links.filter(l=>l.cut).map(l=>l.a));c.fillStyle=colors[0];for(let y=0;y<rows-1;y++)for(let x=0;x<cols-1;x++){const i=y*cols+x,a=nodes[i],b=nodes[i+1],d=nodes[i+cols],e=nodes[i+cols+1];if(dist(a,b)>35||dist(a,d)>35||torn.has(i))continue;c.globalAlpha=.08+.12*(.5+.5*Math.sin(a.x*.02+a.y*.015));c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(e.x,e.y);c.lineTo(d.x,d.y);c.closePath();c.fill();}c.globalAlpha=.3;c.strokeStyle=colors[0];c.lineWidth=.6;for(const l of links){if(l.cut)continue;const a=nodes[l.a],b=nodes[l.b];c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}c.globalAlpha=1;c.fillStyle=colors[1];for(const n of [...nodes.filter(n=>n.pin),...fallenPins]){c.globalAlpha=n.age===undefined?1:Math.max(0,1-n.age/1.2);circle(c,n.x,n.y-3,4);c.strokeStyle=colors[1];c.lineWidth=1;c.beginPath();c.moveTo(n.x,n.y);c.lineTo(n.x,n.y+6);c.stroke();}c.globalAlpha=1;}
  return {update,draw,interact,configure:()=>{},action:()=>nodes.forEach(n=>n.pin=false),stats:()=>({nodes:nodes.length,cut:links.filter(l=>l.cut).length,pinned:nodes.filter(n=>n.pin).length,positions:nodes.filter((_,i)=>i%90===0).map(n=>[n.x,n.y])})};
 }
 function binarySystem(config){
  const total=config.mass0+config.mass1,relative=Math.sqrt(config.gravity*total*4/Math.pow(4+.0001,1.5));
  const bodies=[{mass:config.mass0,x:-2*config.mass1/total,y:0,vx:0,vy:-relative*config.mass1/total},{mass:config.mass1,x:2*config.mass0/total,y:0,vx:0,vy:relative*config.mass0/total}],trails=[[],[]];let gravity=config.gravity,time=0,grab=null,scale=150,center={x:0,y:0};
  const point=b=>({x:400+(b.x-center.x)*scale,y:260+(b.y-center.y)*scale});
  function acceleration(){const dx=bodies[1].x-bodies[0].x,dy=bodies[1].y-bodies[0].y,k=gravity/Math.pow(dx*dx+dy*dy+.0001,1.5);return [{x:dx*k*bodies[1].mass,y:dy*k*bodies[1].mass},{x:-dx*k*bodies[0].mass,y:-dy*k*bodies[0].mass}];}
  function configure(p){bodies[0].mass=p.mass0;bodies[1].mass=p.mass1;gravity=p.gravity;}
  function update(dt,p,pointer){configure(p);if(grab&&pointer?.down)return;let remaining=dt*p.speed,steps=0;while(remaining>1e-10&&steps++<1000){const r=Math.hypot(bodies[1].x-bodies[0].x,bodies[1].y-bodies[0].y),h=Math.min(remaining,1/720,.02*Math.sqrt(Math.pow(r*r+.0001,1.5)/(gravity*(bodies[0].mass+bodies[1].mass))));const a=acceleration();bodies.forEach((b,i)=>{b.vx+=a[i].x*h/2;b.vy+=a[i].y*h/2;b.x+=b.vx*h;b.y+=b.vy*h;});const next=acceleration();bodies.forEach((b,i)=>{b.vx+=next[i].x*h/2;b.vy+=next[i].y*h/2;});remaining-=h;time+=h;}bodies.forEach((b,i)=>{trails[i].push({x:b.x,y:b.y});if(trails[i].length>1000)trails[i].shift();});}
  function interact(p){let best=-1,d=28;bodies.forEach((b,i)=>{const distance=dist(point(b),p);if(distance<d){d=distance;best=i;}});if(best<0)return false;grab={i:best,x:p.x,y:p.y};return true;}
  function release(pointer){if(grab&&pointer){const dx=(pointer.x-grab.x)/scale*.6,dy=(pointer.y-grab.y)/scale*.6,factor=Math.min(1,.5/(Math.hypot(dx,dy)||1));bodies[grab.i].vx+=dx*factor;bodies[grab.i].vy+=dy*factor;}grab=null;}
  function draw(c,colors,p,pointer){const total=bodies[0].mass+bodies[1].mass;center={x:bodies.reduce((s,b)=>s+b.x*b.mass,0)/total,y:bodies.reduce((s,b)=>s+b.y*b.mass,0)/total};scale=180/Math.max(1.25,...bodies.map(b=>Math.hypot(b.x-center.x,b.y-center.y)));const palette=[colors[0],colors[2]];trails.forEach((trail,i)=>{c.strokeStyle=palette[i];c.lineWidth=1;let previous=trail.length?point(trail[0]):null;for(let j=1;j<trail.length;j++){const q=point(trail[j]),fade=Math.min(1,(1000-trail.length+j-.5)/350);c.globalAlpha=.3*fade*fade*(3-2*fade);c.beginPath();c.moveTo(previous.x,previous.y);c.lineTo(q.x,q.y);c.stroke();previous=q;}});
   bodies.forEach((b,i)=>{const q=point(b),r=8+Math.cbrt(b.mass)*5,glow=c.createRadialGradient(q.x,q.y,0,q.x,q.y,r*4);glow.addColorStop(0,palette[i]);glow.addColorStop(1,'transparent');c.globalAlpha=.15;c.fillStyle=glow;circle(c,q.x,q.y,r*4);c.globalAlpha=1;c.fillStyle=palette[i];circle(c,q.x,q.y,r);c.globalAlpha=.65;c.font='8px system-ui';c.fillText(i===0?'α':'β',q.x+r+6,q.y+3);});c.globalAlpha=1;if(grab&&pointer){const b=bodies[grab.i],q=point(b),dx=(pointer.x-grab.x)/scale*.6,dy=(pointer.y-grab.y)/scale*.6,factor=Math.min(1,.5/(Math.hypot(dx,dy)||1));velocityPreview(c,q,{x:b.vx,y:b.vy},{x:dx*factor,y:dy*factor},colors[0],70,8);}}
  return {update,draw,configure,interact,release,action:()=>{bodies[0].vx+=.08;bodies[0].vy-=.04;},stats:()=>({bodies:bodies.map(b=>({...b})),points:bodies.map(point),positions:bodies.map(b=>[b.x,b.y]),simulationTime:time,energy:bodies.reduce((s,b)=>s+b.mass*(b.vx*b.vx+b.vy*b.vy)/2,0)-gravity*bodies[0].mass*bodies[1].mass/Math.sqrt((bodies[0].x-bodies[1].x)**2+(bodies[0].y-bodies[1].y)**2+.0001),momentum:{x:bodies.reduce((s,b)=>s+b.mass*b.vx,0),y:bodies.reduce((s,b)=>s+b.mass*b.vy,0)}})};
 }
 const models={binarySystem,particleLife,ecoGarden,elementSandbox,softFabric};root.ShiyuPlaygroundModels={create:(id,config)=>models[id](config),width:W,height:H};
})(window);
