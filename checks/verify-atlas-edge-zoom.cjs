const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');let browser;
(async()=>{
 browser=await chromium.launch({channel:'msedge',headless:true});const p=await browser.newPage({viewport:{width:1381,height:1041},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.stack));
 await p.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});
 await p.evaluate(()=>{signed=true;prefs.accountProfile={id:'edge-zoom-check'};prefs.mode='dark';prefs.theme='cinema';prefs.color='#b18c59';prefs.explicitColor='#b18c59';persist();goSpace(data[0].id)});
 await p.locator('.workspace .space-mode-entry').click();await p.locator('[data-space-mode=atlas]').click();
 const change=async mode=>{await p.locator('[data-at=views]').click();await p.locator('[data-at-dimension="2d"]').click();await p.locator(`[data-at-view=${mode}]`).click();await p.mouse.move(200,60);await p.waitForTimeout(400)};
 const verifyPorts=async()=>p.locator('.at-canvas').evaluate(canvas=>{
   const result=[];for(const path of canvas.querySelectorAll('.at-line')){for(const [key,t] of [[path.dataset.from,0],[path.dataset.to,path.getTotalLength()]]){
     const node=[...canvas.querySelectorAll('.at-node')].find(e=>e.dataset.key===key),card=node.classList.contains('at-compact-node')||['link','bundle'].includes(node.dataset.kind)||(node.dataset.kind==='add'&&node.dataset.addKind==='link');
     const shape=card?node.querySelector('.at-node-main'):node.querySelector('.at-orb,.at-logo,.at-bundle-mark,.at-add-mark'),r=shape.getBoundingClientRect(),c=canvas.getBoundingClientRect(),q=path.getPointAtLength(t),z=+getComputedStyle(node).zoom,rad=Math.min(parseFloat(getComputedStyle(shape).borderRadius)*z,r.width/2,r.height/2)||0;
     const x=Math.abs(q.x-(r.x-c.x+r.width/2))-r.width/2+rad,y=Math.abs(q.y-(r.y-c.y+r.height/2))-r.height/2+rad,d=Math.hypot(Math.max(x,0),Math.max(y,0))+Math.min(Math.max(x,y),0)-rad;
     if(Math.abs(d)>1.2)result.push({key,d});
   }}return result;
 });
 for(const mode of ['radial','organization','mindmap']){
   await change(mode);assert.equal(await p.locator('.at-summary').count(),0);assert.match(await p.locator('.at-node[data-level="0"] small').textContent(),/场景.*分组.*网址/);
   assert.deepEqual(await verifyPorts(),[],mode+' endpoints');
   const merged=await p.locator('.at-canvas').evaluate(canvas=>{
     const paths=[...canvas.querySelectorAll('.at-line')].map(el=>{const length=el.getTotalLength(),points=[];for(let d=24;d<length-24;d+=4){const a=el.getPointAtLength(d),b=el.getPointAtLength(d+4);points.push({x:a.x,y:a.y,dx:b.x-a.x,dy:b.y-a.y})}return points});let longest=0;
     for(let i=0;i<paths.length;i++)for(let j=i+1;j<paths.length;j++){let run=0;for(const a of paths[i]){const match=paths[j].some(b=>{const length=b.dx*b.dx+b.dy*b.dy,t=Math.max(0,Math.min(1,((a.x-b.x)*b.dx+(a.y-b.y)*b.dy)/length));return Math.hypot(a.x-b.x-b.dx*t,a.y-b.y-b.dy*t)<.8&&Math.abs(a.dx*b.dy-a.dy*b.dx)<.8});run=match?run+4:0;longest=Math.max(longest,run)}}return longest;
   });assert(merged<24,mode+' has merged connection length '+merged);console.log(mode,'longest touching parallel run',merged);
   await p.screenshot({path:`checks/atlas-edge-${mode}.png`});
   // Pan first, then scale at a visible node: its icon centre stays under the pointer.
   await p.mouse.move(1100,790);await p.mouse.down();await p.mouse.move(940,690,{steps:8});await p.mouse.up();await p.waitForTimeout(200);
   const target=p.locator('.at-node[data-level="1"] .at-orb').nth(3);const before=await target.boundingBox();const x=before.x+before.width/2,y=before.y+before.height/2;
   assert(x>0&&x<1381&&y>0&&y<1041);await p.mouse.move(x,y);await p.mouse.wheel(0,-180);await p.waitForTimeout(350);const after=await target.boundingBox();
   assert(Math.abs(after.x+after.width/2-x)<1.2&&Math.abs(after.y+after.height/2-y)<1.2,mode+' pointer anchor');assert(after.width>before.width);assert.deepEqual(await verifyPorts(),[],mode+' zoom endpoints');
   console.log(mode,'summary, boundary ports, pan then cursor zoom PASS');
 }
 await change('radial');await p.mouse.move(690,510);await p.mouse.wheel(0,500);await p.mouse.move(200,60);await p.waitForTimeout(350);await p.screenshot({path:'checks/atlas-edge-radial-overview.png'});
 assert.deepEqual(errors,[]);console.log('PASS',errors);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>browser?.close());
