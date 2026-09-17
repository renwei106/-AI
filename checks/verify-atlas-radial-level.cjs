const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');const assert=require('node:assert/strict');let browser;
(async()=>{
 browser=await chromium.launch({channel:'msedge',headless:true});const p=await browser.newPage({viewport:{width:1381,height:1041},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});
 await p.evaluate(()=>{signed=true;prefs.accountProfile={id:'radial-level-check'};prefs.mode='dark';prefs.theme='cinema';prefs.color='#b18c59';prefs.explicitColor='#b18c59';persist();goSpace(data[0].id)});await p.locator('.workspace .space-mode-entry').click();await p.locator('[data-space-mode=atlas]').click();
 const change=async(mode,dimension='2d')=>{await p.locator('[data-at=views]').click();await p.locator(`[data-at-dimension="${dimension}"]`).click();await p.locator(`[data-at-view=${mode}]`).click();await p.mouse.move(200,60);await p.waitForTimeout(200)};
 const check=async kind=>{
   assert.equal(await p.locator('.at-node[data-level="2"]').count(),0);assert.equal(await p.locator('.at-node[data-kind=bundle]').count(),0);assert.equal(await p.locator(`.at-node[data-level="0"][data-kind=${kind}]`).count(),1);
   const report=await p.locator('.at-canvas').evaluate(canvas=>{
     const root=canvas.querySelector('.at-node[data-level="0"] .at-orb').getBoundingClientRect(),box=canvas.getBoundingClientRect(),center={x:root.x+root.width/2-box.x,y:root.y+root.height/2-box.y};
     const lines=[...canvas.querySelectorAll('.at-line[data-level="1"]')].map(el=>{const length=el.getTotalLength(),points=Array.from({length:81},(_,i)=>el.getPointAtLength(length*i/80));return points});
     let reverse=0,crossings=0;for(const pts of lines)for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],cross=(a.x-center.x)*(b.y-center.y)-(a.y-center.y)*(b.x-center.x);if(cross<-.01)reverse++}
     const turn=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
     for(let i=0;i<lines.length;i++)for(let j=i+1;j<lines.length;j++)for(let k=1;k<lines[i].length;k++)for(let l=1;l<lines[j].length;l++){const a=lines[i][k-1],b=lines[i][k],c=lines[j][l-1],d=lines[j][l];if(Math.max(a.x,b.x)<Math.min(c.x,d.x)||Math.max(c.x,d.x)<Math.min(a.x,b.x)||Math.max(a.y,b.y)<Math.min(c.y,d.y)||Math.max(c.y,d.y)<Math.min(a.y,b.y))continue;if(turn(a,b,c)*turn(a,b,d)<-1e-6&&turn(c,d,a)*turn(c,d,b)<-1e-6)crossings++}
     return {reverse,crossings,lines:lines.length};
   });assert.equal(report.reverse,0,kind+' consistent clockwise');assert.equal(report.crossings,0,kind+' crossing lines');console.log(kind,report);
 };
 await change('radial');const original=await p.evaluate(()=>JSON.stringify(data));await check('space');await p.mouse.move(690,510);await p.mouse.wheel(0,450);await p.mouse.move(200,60);await p.waitForTimeout(200);await p.screenshot({path:'checks/atlas-radial-one-level.png'});
 await p.locator('.at-node[data-level="1"][data-kind=scene] .at-node-main').first().click();await p.waitForTimeout(200);await check('scene');await p.locator('.at-node[data-level="1"][data-kind=group] .at-node-main').first().click();await p.waitForTimeout(200);await check('group');assert.equal(await p.locator('.at-node[data-kind=link]').count(),+(await p.locator('.at-node[data-level="0"] small').textContent()).match(/\d+/)[0]);
 await p.locator('.is-parent[data-kind=space] .at-node-main').click();await change('spatial','3d');assert(await p.locator('.at-node[data-level="2"]').count()>0);await change('radial');await p.setViewportSize({width:390,height:844});await p.waitForTimeout(200);await check('space');assert.equal(await p.evaluate(()=>JSON.stringify(data)),original);assert.deepEqual(errors,[]);console.log('PASS progressive navigation, full links, mobile, 3D unchanged, no data changes');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>browser?.close());
