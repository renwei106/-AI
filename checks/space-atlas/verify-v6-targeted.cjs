const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

const checks=[];
const errors=[];
let browser;
const close=(a,b,tolerance=1)=>Math.abs(a-b)<=tolerance;
const rect=locator=>locator.evaluate(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}});

async function dragFirstPastThird(page,kind){
  await page.evaluate(kind=>manageOrganization(kind),kind);
  const rows=page.locator('#organization .organization-list>[data-organization-id]');
  assert((await rows.count())>=3,kind+' needs at least three rows');
  const before=await rows.evaluateAll(es=>es.map(e=>e.dataset.organizationId));
  const from=await rows.nth(0).locator('span').boundingBox(),to=await rows.nth(2).locator('span').boundingBox();
  await page.mouse.move(from.x+from.width/2,from.y+from.height/2);
  await page.mouse.down();
  await page.waitForTimeout(430);
  await page.mouse.move(to.x+to.width/2,to.y+to.height*.9,{steps:8});
  await page.mouse.up();
  await page.waitForTimeout(120);
  const after=await rows.evaluateAll(es=>es.map(e=>e.dataset.organizationId));
  assert.notDeepEqual(after,before,kind+' dialog order should change');
  const stored=await page.evaluate(kind=>organizationList(kind).map(x=>x.id),kind);
  assert.deepEqual(stored,after,kind+' stored order should match dialog order');
  await page.locator('#organization .dialog-heading [data-action=close]').click();
}

(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1288,height:1041}});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});
  await page.evaluate(()=>{
    signed=true;
    const s=data[0],seed=structuredClone(s.scenes[0]);
    s.scenes=Array.from({length:14},(_,i)=>({
      ...structuredClone(seed),id:'radial-scene-'+i,name:'场景 '+String(i+1).padStart(2,'0'),icon:['work','home','globe','bulb'][i%4],
      groups:Array.from({length:i===0?1:3},(_,j)=>({id:'radial-group-'+i+'-'+j,name:'分组 '+(j+1),icon:['folder','book','star'][j],items:[[i+'-'+j+' 网址','https://example.com/'+i+'/'+j,'测试网址','E']]}))
    }));
    spaceId=s.id;sceneId=s.scenes[0].id;view='space';render();
  });
  await page.waitForTimeout(180);

  const dailyActions=await rect(page.locator('.workspace .space-top-actions'));
  const geometry=await page.evaluate(()=>({doc:document.documentElement.scrollHeight,body:document.body.scrollHeight,main:document.querySelector('#main').scrollHeight}));
  assert.equal(geometry.doc,geometry.body);
  assert.equal(geometry.doc,geometry.main);
  checks.push('Space bottom margin remains inside the themed page background');

  await page.locator('.workspace .space-mode-entry').click();
  const menuText=await page.locator('#space-mode-menu').innerText();
  assert.match(menuText,/常规视图/);assert.match(menuText,/按场景和分组整齐呈现，适合日常浏览、搜索与管理/);
  assert.match(menuText,/图谱视图/);assert.match(menuText,/用节点和连线展开层级，适合查看上下级与整体关系/);
  await page.locator('[data-space-mode=atlas]').click();
  await page.waitForTimeout(430);
  const atlasActions=await rect(page.locator('#space-atlas .at-header-actions'));
  assert(close(atlasActions.x,dailyActions.x)&&close(atlasActions.y,dailyActions.y),'desktop action chrome should match');
  checks.push('Mode names and desktop action chrome match the daily view');

  await page.locator('[data-at-mode="2d"]').click();
  await page.waitForTimeout(430);
  const rings=await page.evaluate(()=>{
    const symbol=e=>e.querySelector('.at-orb,.at-logo,.at-bundle-mark,.at-add-mark')||e;
    const point=e=>{const r=symbol(e).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}};
    const center=point(document.querySelector('.at-node[data-level="0"]')),distance=e=>{const p=point(e);return Math.hypot(p.x-center.x,p.y-center.y)};
    const angle=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x),delta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
    const branches=[...document.querySelectorAll('.at-node[data-level="1"]')].filter(e=>e.dataset.kind==='scene').map(scene=>{
      const scenePoint=point(scene),children=[...document.querySelectorAll('.at-node[data-level="2"]')].filter(child=>document.querySelector(`.at-line[data-from="${CSS.escape(scene.dataset.key)}"][data-to="${CSS.escape(child.dataset.key)}"]`));
      const ray=angle(center,scenePoint),offsets=children.map(child=>{const p=point(child),out={x:p.x-scenePoint.x,y:p.y-scenePoint.y},axis={x:scenePoint.x-center.x,y:scenePoint.y-center.y};return{angle:delta(angle(center,p),ray),outward:out.x*axis.x+out.y*axis.y}});
      return{key:scene.dataset.key,offsets};
    });
    return {
      first:[...document.querySelectorAll('.at-node[data-level="1"]')].map(distance),
      second:[...document.querySelectorAll('.at-node[data-level="2"]')].map(distance),branches
    };
  });
  assert(rings.first.length>8&&rings.second.length>8);
  assert(Math.min(...rings.second)>Math.max(...rings.first)+20,'all second-level nodes should be outside all first-level rings');
  assert(rings.branches.flatMap(x=>x.offsets).every(x=>x.outward>0),'every child should extend outward from its scene');
  const one=rings.branches.find(x=>x.offsets.length===1);assert(one&&Math.abs(one.offsets[0].angle)<.01,'a single group should stay on its scene ray');
  assert(rings.branches.filter(x=>x.offsets.length>1).every(x=>Math.abs(x.offsets.reduce((sum,v)=>sum+v.angle,0))<.02),'multiple groups should fan symmetrically around their scene ray');

  const centered=await page.evaluate(()=>{
    const canvas=document.querySelector('.at-canvas').getBoundingClientRect(),point=key=>{const node=document.querySelector(`.at-node[data-key="${CSS.escape(key)}"]`),symbol=node.querySelector('.at-orb,.at-logo,.at-bundle-mark,.at-add-mark')||node,r=symbol.getBoundingClientRect();return{x:r.x+r.width/2-canvas.x,y:r.y+r.height/2-canvas.y}};
    return [...document.querySelectorAll('.at-line')].map(path=>{
      const d=path.getAttribute('d'),numbers=(d.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
      if(numbers.length<4)return {d,start:Infinity,end:Infinity};
      const from=point(path.dataset.from),to=point(path.dataset.to);
      return {d,start:Math.hypot(numbers[0]-from.x,numbers[1]-from.y),end:Math.hypot(numbers.at(-2)-to.x,numbers.at(-1)-to.y)};
    });
  });
  assert(centered.every(x=>x.start<.75&&x.end<.75),'every relationship path should run visual-symbol center to center: '+JSON.stringify(centered.filter(x=>x.start>=.75||x.end>=.75).slice(0,3)));

  const sceneAdd=page.locator('.at-node[data-kind=add][data-add-kind=scene]');
  assert.equal(await sceneAdd.count(),1);
  const sceneAddShape=await sceneAdd.locator('.at-add-mark').evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{w:r.width,h:r.height,radius:s.borderRadius}});
  assert(close(sceneAddShape.w,sceneAddShape.h)&&parseFloat(sceneAddShape.radius)>=sceneAddShape.w/2-1,'2D scene add should be circular');

  await page.locator('.at-node[data-kind=scene][data-level="1"]').first().hover();
  await page.waitForTimeout(240);
  await page.waitForFunction(()=>{const packet=document.querySelector('.at-packet[data-phase=incoming]');if(!packet||getComputedStyle(packet).opacity==='0')return false;const target=document.querySelector(`.at-node[data-key="${CSS.escape(packet.dataset.to)}"]`),symbol=target?.querySelector('.at-orb,.at-logo,.at-bundle-mark,.at-add-mark'),canvas=document.querySelector('.at-canvas')?.getBoundingClientRect(),head=packet.querySelector('.at-packet-head');if(!symbol||!canvas||!head)return false;const r=symbol.getBoundingClientRect(),x=Number(head.getAttribute('cx')),y=Number(head.getAttribute('cy'));return Math.hypot(x-(r.x+r.width/2-canvas.x),y-(r.y+r.height/2-canvas.y))<8},{timeout:1200});
  const overlay=await page.evaluate(()=>({flow:Number(getComputedStyle(document.querySelector('.at-flows')).zIndex),node:Number(getComputedStyle(document.querySelector('.at-node.is-related')).zIndex)}));
  assert(overlay.flow>overlay.node,'travelling point should visibly reach the symbol center');
  const themeUpstream=await page.evaluate(()=>{
    const dialog=document.querySelector('#space-atlas'),up=document.querySelector('.at-line.is-upstream'),down=document.querySelector('.at-line.is-related:not(.is-upstream)'),style=getComputedStyle(dialog);
    return{up:getComputedStyle(up).stroke,down:getComputedStyle(down).stroke,parent:style.getPropertyValue('--at-parent').trim()};
  });
  assert.notEqual(themeUpstream.up,themeUpstream.down,'upstream and downstream should remain visually distinct');
  assert(!themeUpstream.parent.includes('#ad9065'),'upstream line must not use the old fixed yellow');
  await page.evaluate(()=>document.querySelector('#space-atlas').style.setProperty('--at-accent','#a855f7'));
  await page.waitForTimeout(240);
  const changedUpstream=await page.locator('.at-line.is-upstream').evaluate(e=>getComputedStyle(e).stroke);
  assert.notEqual(changedUpstream,themeUpstream.up,'upstream line should respond to the theme color');
  await page.evaluate(()=>document.querySelector('#space-atlas').style.removeProperty('--at-accent'));
  await page.waitForTimeout(240);
  assert((await page.locator('.at-node.is-muted').count())>0);
  assert((await page.locator('.at-node.is-related').count())>=2);
  checks.push('2D hierarchy is ring separated, center connected, theme colored, and hover focused');
  await page.screenshot({path:'checks/space-atlas/v6-radial-desktop.png'});

  await page.locator('.at-node[data-kind=scene][data-level="1"] .at-node-main').first().click();await page.waitForTimeout(380);
  const groupAdd=page.locator('.at-node[data-kind=add][data-add-kind=group]');assert.equal(await groupAdd.count(),1);
  const group2d=await groupAdd.locator('.at-add-mark').evaluate(e=>{const r=e.getBoundingClientRect();return{w:r.width,h:r.height,radius:parseFloat(getComputedStyle(e).borderRadius)}});
  assert(close(group2d.w,group2d.h)&&group2d.radius<group2d.w/2-2,'2D group add should be a rounded square');
  await page.locator('.at-node[data-kind=group][data-level="1"] .at-node-main').first().click();await page.waitForTimeout(380);
  const linkAdd=page.locator('.at-node[data-kind=add][data-add-kind=link]');assert.equal(await linkAdd.count(),1);
  const link2d=await linkAdd.evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e.querySelector('.at-node-main'));return{w:r.width,h:r.height,direction:s.flexDirection}});
  assert(link2d.w>link2d.h*2&&link2d.direction==='row','2D URL add should use the URL card shape');
  await page.locator('[data-at-mode="3d"]').click();await page.waitForTimeout(120);
  assert.equal(await linkAdd.locator('.at-node-main').evaluate(e=>getComputedStyle(e).flexDirection),'row','3D spatial URL add should retain the URL card shape');
  await page.locator('[data-at=back]').click();await page.waitForTimeout(90);
  const group3d=page.locator('.at-node[data-kind=add][data-add-kind=group] .at-add-mark');
  assert(await group3d.evaluate(e=>{const r=e.getBoundingClientRect();return parseFloat(getComputedStyle(e).borderRadius)>=r.width/2-1}),'3D spatial group add should follow the spherical hierarchy shape');
  await page.locator('[data-at=back]').click();await page.waitForTimeout(90);
  const scene3d=page.locator('.at-node[data-kind=add][data-add-kind=scene] .at-add-mark');
  assert(await scene3d.evaluate(e=>{const r=e.getBoundingClientRect();return parseFloat(getComputedStyle(e).borderRadius)>=r.width/2-1}),'3D spatial scene add should follow the spherical hierarchy shape');
  await page.locator('[data-at=layouts]').click();await page.locator('[data-at-layout=solar]').click();await page.waitForTimeout(100);
  const solarShape=await scene3d.evaluate(e=>{const r=e.getBoundingClientRect();return{width:r.width,height:r.height,radius:getComputedStyle(e).borderRadius}});
  assert(Math.abs(solarShape.width-solarShape.height)<1&&parseFloat(solarShape.radius)>=solarShape.width/2-1,'solar add should use the current orbital planet shape: '+JSON.stringify(solarShape));
  await page.locator('[data-at-mode="2d"]').click();await page.waitForTimeout(380);
  checks.push('Add controls follow scene, group, URL, spatial, and orbital shapes');

  for(const [width,height] of [[600,900],[390,844]]){
    await page.setViewportSize({width,height});
    await page.waitForTimeout(220);
    const mobileDaily=await rect(page.locator('.workspace .space-top-actions'));
    const mobileAtlas=await rect(page.locator('#space-atlas .at-header-actions'));
    assert(close(mobileAtlas.x,mobileDaily.x)&&close(mobileAtlas.y,mobileDaily.y),'mobile action chrome should match at '+width);
    assert(mobileAtlas.x>=0&&mobileAtlas.right<=width,'mobile actions should stay in the viewport at '+width);
    const cords=await page.locator('.mode-pull-cord,.color-pull-cord').evaluateAll(es=>es.filter(e=>getComputedStyle(e).display!=='none').map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom}}));
    assert(cords.every(c=>mobileAtlas.right<=c.x||mobileAtlas.x>=c.right||mobileAtlas.bottom<=c.y||mobileAtlas.y>=c.bottom),'mobile actions should not overlap pull cords at '+width);
    if(width===600)await page.screenshot({path:'checks/space-atlas/v6-radial-mobile.png'});
  }
  checks.push('Mobile action chrome stays aligned, inside the viewport, and clear of pull cords');

  await page.setViewportSize({width:1288,height:1041});
  await page.waitForTimeout(220);
  await page.locator('#space-atlas .space-mode-entry').click();await page.locator('[data-space-mode=daily]').click();
  assert(await page.locator('#space-atlas').evaluate(e=>e.open),'atlas should remain mounted during the short crossfade');
  assert.equal(await page.locator('.workspace').evaluate(e=>getComputedStyle(e).visibility),'visible');
  await page.waitForTimeout(150);assert.equal(await page.locator('#space-atlas').evaluate(e=>e.open),false);
  await page.locator('.workspace .space-mode-entry').click();await page.locator('[data-space-mode=atlas]').click();await page.waitForTimeout(240);
  assert(await page.locator('#space-atlas').evaluate(e=>e.classList.contains('atlas-ready')));assert(await page.locator('body').evaluate(e=>e.classList.contains('atlas-active')));
  checks.push('View switching crossfades aligned layers without moving the shared chrome');
  const zoomBefore=await page.locator('.at-zoom').textContent();
  for(let i=0;i<4;i++)await page.locator('.at-canvas').dispatchEvent('wheel',{deltaY:-90,clientY:80,bubbles:true,cancelable:true});
  await page.waitForTimeout(250);
  assert(await page.locator('#space-atlas').evaluate(e=>e.open),'wheel gestures should not leave the atlas');
  assert.equal(await page.locator('body').getAttribute('data-view'),'space');
  assert.notEqual(await page.locator('.at-zoom').textContent(),zoomBefore,'wheel should remain available for graph zoom');
  const returnControl=page.locator('.at-cover-return');
  assert.equal((await returnControl.locator('span').first().textContent()).trim(),'首页');
  await returnControl.hover();
  assert.equal((await returnControl.locator('span').last().textContent()).trim(),'点击返回首页');
  await returnControl.click();await page.waitForTimeout(250);
  assert.equal(await page.locator('#space-atlas').evaluate(e=>e.open),false);
  assert.equal(await page.locator('body').getAttribute('data-view'),'home');
  checks.push('Atlas wheel gestures only zoom; the subtle explicit control is the sole way back to the cover');

  await page.evaluate(()=>{view='space';spaceId=data[0].id;sceneId=data[0].scenes[0].id;render()});
  await page.waitForTimeout(100);
  await dragFirstPastThird(page,'scene');
  await page.evaluate(()=>{sceneId=space().scenes.find(s=>s.groups.length>=3).id;render()});
  await dragFirstPastThird(page,'group');
  await dragFirstPastThird(page,'space');
  checks.push('Space, scene, and group management dialogs support persistent long-press sorting');

  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'PASS',checks,errors},null,2));
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
