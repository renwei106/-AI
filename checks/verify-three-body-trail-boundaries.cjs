const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const output='.local/checks/verify-three-body-trail-boundaries';
const themes=['base','poly','music','cosmos','flow','flip','rain','cinema','paper','globe','forestCompanion','emergence','threeBody','starlink'];
fs.mkdirSync(output,{recursive:true});
function observe(){
 localStorage.setItem('yiyu-prototype-v1',JSON.stringify({signed:false,prefs:{theme:'base',mode:'dark',color:'#115263',brandGuideDismissed:true,workspaceGuideDoneV1:true}}));
 const nativeRAF=window.requestAnimationFrame.bind(window);window.__times=[];window.__intervals=[];window.__wraps=[];window.__segments=[];window.__badSegments=[];let last=0;
 window.requestAnimationFrame=callback=>nativeRAF(now=>{const watched=callback.name==='draw'&&!!window.ShiyuThreeBodyScene;const start=performance.now();callback(now);if(watched&&window.__perfActive){__times.push(performance.now()-start);if(last)__intervals.push(now-last);last=now;}if(watched&&window.__boundaryActive){for(const [i,trail]of __readTrails().entries())for(const p of trail)if(p.break&&!__wraps.some(q=>q.i===i&&q.t===p.t))__wraps.push({i,t:p.t,x:p.x,y:p.y});for(const segment of __segments)if(segment.length>innerWidth*.7||!Number.isFinite(segment.length))__badSegments.push(segment);}});
 const proto=CanvasRenderingContext2D.prototype,original={};for(const name of ['clearRect','beginPath','moveTo','lineTo','stroke'])original[name]=proto[name];
 const watching=ctx=>(window.__boundaryActive||window.__geometryActive)&&ctx.canvas.classList.contains('three-body-canvas');
 proto.clearRect=function(...args){if(watching(this))__segments=[];return original.clearRect.apply(this,args);};
 proto.beginPath=function(...args){if(watching(this))this.__path=[];return original.beginPath.apply(this,args);};
 proto.moveTo=function(x,y){if(watching(this))(this.__path??=[]).push(['M',x,y]);return original.moveTo.call(this,x,y);};
 proto.lineTo=function(x,y){if(watching(this))(this.__path??=[]).push(['L',x,y]);return original.lineTo.call(this,x,y);};
 proto.stroke=function(...args){if(watching(this)&&[1.1,1.8].some(w=>Math.abs(w-this.lineWidth)<1e-5)&&this.__path?.length===2){const [a,b]=this.__path;if(a[0]==='M'&&b[0]==='L')__segments.push({a:a.slice(1),b:b.slice(1),length:Math.hypot(a[1]-b[1],a[2]-b[2]),color:this.strokeStyle,width:this.lineWidth,alpha:this.globalAlpha});}return original.stroke.apply(this,args);};
}
async function capture(browser){
 const context=await browser.newContext({viewport:{width:2066,height:1070},deviceScaleFactor:1}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await context.addInitScript(observe);
 await context.route('**/api/**',route=>{const path=new URL(route.request().url()).pathname;let json={};if(path==='/api/shiyu/theme-access')json={items:themes.map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:false};else if(path==='/api/shiyu/operations')json={onboarding:{enabled:false},world:{enabled:false},threeBodyContent:{allowCustomize:true,defaults:{speed:10,trail:24}}};return route.fulfill({json});});
 // A read-only test probe; sampling, simulation, trimming and drawing execute their original code.
 let source=fs.readFileSync('dist/three-body-theme.js','utf8');assert.ok(source.includes('window.ShiyuThreeBodyScene={snapshot:'));
 source=source.replace('window.ShiyuThreeBodyScene={snapshot:', 'window.__readTrails=()=>history.map(trail=>trail.map(p=>({...p})));window.ShiyuThreeBodyScene={snapshot:');
 await context.route('**/three-body-theme.js',route=>route.fulfill({contentType:'text/javascript',body:source}));
 try{
  await page.goto('http://127.0.0.1:4349/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(1000);
  await page.evaluate(()=>{scope='global';changeTheme('threeBody');});await page.waitForFunction(()=>window.ShiyuThreeBodyScene?.snapshot().loaded===true);
  await page.mouse.move(500,700);await page.mouse.down();await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().accelerating),true);
  await page.waitForTimeout(1000);await page.evaluate(()=>{__times=[];__intervals=[];__perfActive=true;});await page.waitForTimeout(2500);
  const performanceResult=await page.evaluate(()=>{__perfActive=false;const quantile=(v,p)=>v.slice().sort((a,b)=>a-b)[Math.floor((v.length-1)*p)];return {samples:__times.length,drawMs:{median:quantile(__times,.5),p95:quantile(__times,.95),max:Math.max(...__times)},frameMs:{median:quantile(__intervals,.5),p95:quantile(__intervals,.95),max:Math.max(...__intervals)},snapshot:ShiyuThreeBodyScene.snapshot(),trails:__readTrails().map(trail=>({length:trail.length,oldestAge:ShiyuThreeBodyScene.snapshot().time-trail[0]?.t,newestAge:ShiyuThreeBodyScene.snapshot().time-trail.at(-1)?.t,finite:trail.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.t))}))};});
  await page.mouse.up();assert.ok(performanceResult.samples>20,'real RAF produced enough samples');assert.ok(performanceResult.snapshot.time>24,'full 24-second tail sampled');assert.ok(performanceResult.trails.every(t=>t.length>1&&t.length<=Math.ceil(24*720)+2&&t.finite&&t.oldestAge<=24+1e-6),'24-second tail is finite and bounded');
  assert.ok(performanceResult.drawMs.p95<50,'30x drawing does not stall the main thread');assert.ok(performanceResult.frameMs.p95<100,'real animation frames continue at 30x');
  await page.evaluate(()=>{__geometryActive=true;});await page.waitForTimeout(50);
  const geometry=await page.evaluate(()=>{
   const snapshot=ShiyuThreeBodyScene.snapshot(),groups=new Map();
   for(const segment of __segments){const key=segment.color+':'+segment.width,group=groups.get(key)||{color:segment.color,width:segment.width,count:0,lastAlpha:0,fadeMonotonic:true};group.count++;group.fadeMonotonic&&=segment.alpha>=group.lastAlpha-1e-12;group.lastAlpha=segment.alpha;group.endpoint=segment.b;groups.set(key,group);}
   return {segments:__segments.length,maxLength:Math.max(0,...__segments.map(s=>s.length)),finite:__segments.every(s=>[...s.a,...s.b,s.length,s.alpha].every(Number.isFinite)),groups:[...groups.values()].map(group=>({...group,endpointDistance:Math.min(...snapshot.points.map(p=>Math.hypot(p.x-group.endpoint[0],p.y-group.endpoint[1])))})),sampling:__readTrails().map(trail=>({ordered:trail.every((p,i)=>!i||p.t>=trail[i-1].t),maxInterval:Math.max(0,...trail.slice(1).map((p,i)=>p.t-trail[i].t))}))};
  });
  await page.evaluate(()=>{__geometryActive=false;});
  assert.ok(geometry.segments>0&&geometry.finite,'actual finite trail strokes observed');assert.equal(geometry.groups.length,3,'all three bodies have distinct visible trails');
  assert.ok(geometry.maxLength<12,'regular 30x orbits use short sampled segments');assert.ok(geometry.sampling.every(t=>t.ordered&&t.maxInterval<=.012+1/720+1e-6),'sampled history follows simulation time without frame-sized gaps');
  assert.ok(geometry.groups.every(g=>g.fadeMonotonic&&g.lastAlpha<=.42+1e-6&&g.endpointDistance<2),'trail opacity increases toward the joined body endpoint');
  await page.screenshot({path:output+'/30x-trail24.png'});
  let boundary;
   await page.evaluate(()=>{__boundaryActive=true;});
   // Apply real pointer drags in one animation interval, accumulating only the existing UI impulse.
   for(let attempt=0;attempt<4;attempt++){
    const p=await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().points[0]);
    await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(Math.min(2000,p.x+500),p.y,{steps:1});await page.mouse.up();
   }
   await page.mouse.move(500,700);await page.mouse.down();await page.waitForTimeout(350);
   await page.waitForFunction(()=>__wraps.length>0,null,{polling:50,timeout:15000});await page.waitForTimeout(300);
   boundary=await page.evaluate(()=>({wraps:__wraps,badSegments:__badSegments,final:ShiyuThreeBodyScene.snapshot(),trails:__readTrails().map(trail=>({length:trail.length,oldestAge:ShiyuThreeBodyScene.snapshot().time-trail[0]?.t,breaks:trail.filter(p=>p.break),finite:trail.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.t))}))}));
   await page.mouse.up();assert.ok(boundary.wraps.length>0,'real UI drag induced wrapping');assert.deepEqual(boundary.badSegments,[],'wrapping never draws cross-screen bridge');assert.ok(boundary.trails.every(t=>t.finite&&t.length<=Math.ceil(24*720)+2&&t.oldestAge<=24+1e-6),'wrap nodes remain finite and trimmed');await page.screenshot({path:output+'/real-pointer-wrap.png'});
  assert.deepEqual(errors,[]);const result={viewport:{width:2066,height:1070},performance:performanceResult,geometry,boundary,errors};fs.writeFileSync(output+'/results.json',JSON.stringify(result,null,2));console.log('PASS real RAF: '+JSON.stringify(performanceResult.drawMs)+'; frames='+performanceResult.samples+'; wrap='+boundary.wraps.length+'; max segment='+geometry.maxLength.toFixed(2)+'px');return result;
 }finally{await context.close();}
}
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{await capture(browser);}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
