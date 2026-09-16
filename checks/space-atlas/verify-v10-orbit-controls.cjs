const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const BASE_URL=process.env.SHIYU_PREVIEW_URL||'http://127.0.0.1:4318/';
const errors=[],checks=[],report={controls:[],rings:null,drags:[],ancestry:[],motion:{}};
let browser;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const node=key=>`.at-node[data-key="${key}"]`;
const center=locator=>locator.evaluate(el=>{const r=(el.querySelector('.at-orb,.at-logo,.at-add-mark,.at-bundle-mark')||el).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}});
const settle=page=>page.waitForTimeout(600);

async function newAtlas(reducedMotion='reduce'){
  const context=await browser.newContext({viewport:{width:1440,height:1041},reducedMotion});
  await context.addInitScript(()=>{localStorage.removeItem('yiyu-prototype-v1');localStorage.removeItem('shiyu-space-atlas-v1')});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  await page.goto(BASE_URL,{waitUntil:'networkidle'});
  await page.evaluate(()=>{
    const item=(id,index)=>['收藏 '+index,'https://example.com/'+id+'/'+index,'回归测试','icon:globe'];
    data=[{id:'orbit-space',name:'轨道测试空间',icon:'work',scenes:Array.from({length:11},(_,i)=>({
      id:'orbit-scene-'+i,name:'场景 '+(i+1),icon:['work','home','star'][i%3],description:'',
      groups:Array.from({length:3},(_,j)=>({id:'orbit-group-'+i+'-'+j,name:'分组 '+(j+1),icon:'folder',items:Array.from({length:4},(_,k)=>item(i+'-'+j,k+1))}))
    }))}];
    signed=true;prefs.membership={expiresAt:Date.now()+86400000};prefs.spaceThemePolicy='last';
    spaceId='orbit-space';sceneId='orbit-scene-0';view='space';render();
  });
  await page.locator('.workspace .space-mode-entry').click();
  await page.locator('[data-space-mode="atlas"]').click();
  await page.locator('#space-atlas[open].atlas-ready .at-canvas').waitFor({state:'visible'});
  await settle(page);return{context,page};
}

async function choose(page,id){
  const trigger=page.locator('[data-at="views"]');
  const popup=page.locator('#at-view-dialog');
  await page.mouse.move(600,450);await page.waitForTimeout(240);await trigger.hover();await popup.waitFor({state:'visible'});
  const mode=['spatial','solar','systems'].includes(id)?'3d':'2d';
  await popup.getByRole('tab',{name:mode==='3d'?'3D':'2D'}).click();
  await popup.locator(`[data-at-view="${id}"]`).click();await settle(page);
  assert.equal(await page.locator('.at-full-page').getAttribute('data-mode'),mode);
  if(mode==='2d')assert.equal(await page.locator('.at-full-page').getAttribute('data-layout'),id);
  if(id==='solar')assert.equal(await page.locator('.at-full-page').getAttribute('data-presentation'),'solar');
}

async function positions(page){return page.locator('.at-node[data-level="1"][data-kind="scene"]').evaluateAll(elements=>Object.fromEntries(elements.map(el=>{
  const r=el.querySelector('.at-orb').getBoundingClientRect();return[el.dataset.key,{x:r.x+r.width/2,y:r.y+r.height/2,orbit:el.dataset.orbit}];
})));}

async function verifyControls(page){
  assert.equal(await page.locator('[data-at="views"]').count(),1,'one consolidated view selector');
  assert.equal(await page.locator('[data-at-mode],[data-at="layouts"],[data-at="motion"],[data-at="zoom-in"],[data-at="zoom-out"],[data-at="fit"],.at-zoom').count(),0,'old display, playback and zoom controls are removed');
  const box=await page.locator('[data-at="views"]').boundingBox(),viewport=page.viewportSize();
  assert(box.x>viewport.width*.65&&box.y>viewport.height*.72,'view selector lives in the lower right');
  await page.locator('[data-at="views"]').hover();
  await page.locator('#at-view-dialog').waitFor({state:'visible'});
  assert.deepEqual(await page.locator('[data-at-view]').evaluateAll(els=>els.map(el=>el.dataset.atView)),['radial','organization','mindmap','spatial','solar','systems']);
  await page.mouse.move(600,450);await page.waitForTimeout(240);
  for(const id of ['radial','organization','mindmap','spatial','solar']){
    await choose(page,id);report.controls.push({id,label:await page.locator('[data-at="views"]').innerText()});
  }
  const before=await page.locator(node('s:orbit-space')).boundingBox();
  await page.locator('.at-canvas').dispatchEvent('wheel',{deltaY:-180,bubbles:true,cancelable:true});
  await settle(page);const after=await page.locator(node('s:orbit-space')).boundingBox();
  assert(after.width>before.width*1.1,'wheel zoom is still available after removing zoom buttons');
  await choose(page,'radial');
  checks.push('右下单一菜单整合三种 2D、两种 3D 视图；旧缩放和播放按钮已移除，滚轮仍可缩放');
}

async function verifyRings(page){
  await choose(page,'solar');
  const rings=await page.evaluate(()=>[...document.querySelectorAll('.at-orbit-track')].map(el=>({
    id:el.dataset.orbit,color:getComputedStyle(el).stroke,
    count:document.querySelectorAll(`.at-node[data-level="1"][data-orbit="${el.dataset.orbit}"]`).length,
    paths:el.getAttribute('d')
  })));
  rings.sort((a,b)=>Number(a.id)-Number(b.id));
  assert(rings.length>=2,'synthetic hierarchy should use multiple orbital rings');
  assert(rings.every((r,i)=>i===0||r.count>=rings[i-1].count),'outer rings must not have fewer occupied slots than inner rings: '+JSON.stringify(rings.map(({id,count})=>({id,count}))));
  assert.equal(new Set(rings.map(r=>r.color)).size,rings.length,'each orbital ring has a distinct theme-derived color');
  assert(rings.every(r=>r.paths?.startsWith('M')),'all orbit paths render');
  report.rings=rings.map(({paths,...rest})=>rest);
  await page.screenshot({path:path.join(__dirname,'v10-solar-overview.png')});
  checks.push('轨道颜色可区分，外圈容量随半径增加，轨道保留完整路径');
}

async function dragExchange(page,id,{crossRing=false,cancel=false}={}){
  await choose(page,id);await page.mouse.move(12,100);
  let before=await positions(page),entries=Object.entries(before);
  const onscreen=entries.filter(([,p])=>p.x>150&&p.x<1290&&p.y>220&&p.y<860);
  let pair;
  for(const a of onscreen){for(const b of onscreen){
    if(a[0]===b[0]||distance(a[1],b[1])<60)continue;
    if(id==='solar'&&(crossRing?a[1].orbit===b[1].orbit:a[1].orbit!==b[1].orbit))continue;
    if(!pair||distance(a[1],b[1])<distance(pair[0][1],pair[1][1]))pair=[a,b];
  }}
  assert(pair,`${id}: find two reachable siblings${crossRing?' on different rings':''}`);
  const [[from,a],[to,b]]=pair;
  const listBefore=await page.evaluate(()=>data[0].scenes.map(s=>s.id));
  await page.mouse.move(a.x,a.y);await page.mouse.down();
  await page.mouse.move(a.x+8,a.y+3,{steps:2});
  await page.mouse.move(b.x,b.y,{steps:18});await page.waitForTimeout(200);
  const during=await positions(page);
  assert(Object.keys(during).length===entries.length,`${id}: no sibling disappears during drag`);
  assert(distance(during[to],b)>8,`${id}: destination visibly yields towards the vacated slot`);
  for(const [key,p] of Object.entries(during)){
    if(key===from||key===to)continue;
    assert(distance(p,before[key])<3,`${id}: unrelated sibling ${key} is not pushed off its slot`);
  }
  if(cancel)await page.locator('.at-canvas').dispatchEvent('pointercancel',{pointerId:1,pointerType:'mouse',bubbles:true});
  await page.mouse.up();await settle(page);
  const after=await positions(page),listAfter=await page.evaluate(()=>data[0].scenes.map(s=>s.id));
  const expected=[...listBefore];
  if(!cancel){const ai=expected.indexOf(from.slice(2)),bi=expected.indexOf(to.slice(2));[expected[ai],expected[bi]]=[expected[bi],expected[ai]];}
  assert.deepEqual(listAfter,expected,`${id}: ${cancel?'canceled drag must not save':'drop exchanges the two siblings'}`);
  for(const [key,p] of Object.entries(after)){
    const slot=cancel?before[key]:key===from?before[to]:key===to?before[from]:before[key];
    assert(distance(p,slot)<3,`${id}: ${key} returns to its assigned slot, delta ${distance(p,slot)}`);
  }
  assert.equal(Object.keys(after).length,entries.length,`${id}: all siblings remain after drop`);
  if(id==='solar'){
    const oldCounts={},newCounts={};entries.forEach(([,p])=>oldCounts[p.orbit]=(oldCounts[p.orbit]||0)+1);Object.values(after).forEach(p=>newCounts[p.orbit]=(newCounts[p.orbit]||0)+1);
    assert.deepEqual(newCounts,oldCounts,'dragging preserves orbit capacities');
  }
  report.drags.push({id,from,to,crossRing,cancel,order:listAfter});
}

async function verifyAncestry(page){
  for(const id of ['radial','organization','mindmap','spatial','solar']){
    await choose(page,id);
    await page.locator('[data-at-focus="c:orbit-scene-0"]').click();await settle(page);
    await page.locator('[data-at-focus="g:orbit-group-0-0"]').click();await settle(page);
    const upper=page.locator(node('s:orbit-space')),parent=page.locator(node('c:orbit-scene-0')),focus=page.locator(node('g:orbit-group-0-0'));
    assert.equal(await upper.getAttribute('data-level'),'-2');assert.equal(await parent.getAttribute('data-level'),'-1');
    const a=await center(upper),b=await center(parent),c=await center(focus);
    for(const ancestor of [upper,parent]){
      const resting=await ancestor.locator('.at-node-main').evaluate(el=>({color:getComputedStyle(el).backgroundColor,image:getComputedStyle(el).backgroundImage,shadow:getComputedStyle(el).boxShadow}));
      assert.equal(resting.color,'rgba(0, 0, 0, 0)',`${id}: ancestor has no rectangular background`);assert.equal(resting.image,'none');assert.equal(resting.shadow,'none');
    }
    await parent.hover();await page.waitForTimeout(80);
    assert.equal(await parent.locator('.at-node-main').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)',`${id}: ancestor stays background-free on hover`);
    const cross=Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x));
    assert(cross/Math.max(1,distance(a,c))<2,`${id}: ancestor chain is a straight line to current focus`);
    assert(distance(a,b)<=118,`${id}: the two visible ancestor levels stay close together`);
    assert(b.x>=Math.min(a.x,c.x)-1&&b.x<=Math.max(a.x,c.x)+1&&b.y>=Math.min(a.y,c.y)-1&&b.y<=Math.max(a.y,c.y)+1,`${id}: immediate parent lies between space and current focus`);
    const heading=await page.locator('.at-mode-host').boundingBox();
    assert(a.x<600&&a.y>heading.y+heading.height,`${id}: top ancestor sits below the upper-left space heading`);
    for(const [from,to] of [['s:orbit-space','c:orbit-scene-0'],['c:orbit-scene-0','g:orbit-group-0-0']])assert.equal(await page.locator(`.at-line[data-from="${from}"][data-to="${to}"]`).count(),1,`${id}: ancestor relationship remains visible`);
    const colors=await page.evaluate(()=>[...document.querySelectorAll('.at-node.is-parent .at-orb,.at-node[data-level="0"] .at-orb')].map(e=>({parent:e.closest('.at-node').classList.contains('is-parent'),color:getComputedStyle(e).color,background:getComputedStyle(e).backgroundImage||getComputedStyle(e).backgroundColor})));
    assert(colors.filter(v=>v.parent).every(v=>v.color!==colors.find(v=>!v.parent).color||v.background!==colors.find(v=>!v.parent).background),`${id}: ancestor has a distinct subdued style`);
    await page.evaluate(()=>getSelection()?.removeAllRanges());
    await page.mouse.move(1300,700);await page.keyboard.down('Shift');await page.mouse.down();await page.mouse.move(1220,740,{steps:10});await page.mouse.up();await page.keyboard.up('Shift');await settle(page);
    assert(distance(await center(upper),a)<2&&distance(await center(parent),b)<2,`${id}: ancestor positions stay fixed while camera pans`);
    assert.equal(await page.evaluate(()=>String(getSelection()||'')),'',`${id}: dragging the canvas must not select page text`);
    const links=await page.locator('.at-node[data-kind="link"] .at-node-main').evaluateAll(els=>els.map(el=>({tag:el.tagName,href:el.getAttribute('href'),target:el.getAttribute('target')})));
    assert(links.length&&links.every(l=>l.tag==='A'&&l.href.startsWith('https://')&&l.target==='_blank'),`${id}: leaf URLs retain their direct-open interaction`);
    report.ancestry.push({id,a,b,c,colors});
    if(id==='solar')await page.screenshot({path:path.join(__dirname,'v10-solar-group-path.png')});
    await page.locator('[data-at-focus="s:orbit-space"]').click();await settle(page);
  }
  checks.push('五种布局均显示完整祖先路径；上级位于左上、颜色弱化、初始共线连接且随相机移动保持固定');
}

async function verifyMotion(){
  const {context,page}=await newAtlas('no-preference');
  try{
    for(const id of ['spatial','solar']){
      await choose(page,id);await page.mouse.move(12,100);await page.locator('.at-canvas').focus();await page.waitForTimeout(100);
      const before=await positions(page);await page.waitForTimeout(850);const after=await positions(page);
      const moved=Math.max(...Object.keys(before).map(key=>distance(before[key],after[key])));
      assert(moved>1,`${id}: 3D motion starts without a play button`);
      await page.locator(node('s:orbit-space')).hover();await page.waitForTimeout(80);
      const held=await positions(page);await page.waitForTimeout(350);const heldAfter=await positions(page);
      assert(Math.max(...Object.keys(held).map(key=>distance(held[key],heldAfter[key])))<1,`${id}: hover pauses movement so the target remains reachable`);
      report.motion[id]={moved,hoverStable:true};
    }
    await choose(page,'solar');
    await page.locator('.at-canvas').dispatchEvent('wheel',{deltaY:-100,bubbles:true,cancelable:true});
    await page.mouse.move(1320,700);await page.keyboard.down('Shift');await page.mouse.down();await page.mouse.move(1290,725,{steps:8});await page.mouse.up();await page.keyboard.up('Shift');
    let before=await positions(page),pair;
    const candidates=Object.entries(before).filter(([,p])=>p.x>180&&p.x<1260&&p.y>220&&p.y<830);
    for(const a of candidates){for(const b of candidates){if(a[0]===b[0]||distance(a[1],b[1])<70)continue;if(!pair||distance(a[1],b[1])<distance(pair[0][1],pair[1][1]))pair=[a,b];}}
    assert(pair,'live solar drag has two reachable sibling slots');
    const [from,to]=pair.map(p=>p[0]),hoverPoint=await center(page.locator(node(from)));
    await page.mouse.move(hoverPoint.x,hoverPoint.y);await page.waitForTimeout(100);before=await positions(page);
    const a=before[from],b=before[to],travel=distance(a,b),beforeOrder=await page.evaluate(()=>data[0].scenes.map(s=>s.id));
    const beforeZoom=await page.locator(node('s:orbit-space')).evaluate(el=>getComputedStyle(el).zoom);
    await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(a.x+8,a.y+2);await page.mouse.move(b.x,b.y);
    const frames=await page.evaluate(async key=>{
      const samples=[];for(let i=0;i<22;i++){
        await new Promise(resolve=>requestAnimationFrame(resolve));
        const el=document.querySelector(`.at-node[data-key="${key}"] .at-orb`),r=el.getBoundingClientRect();samples.push({x:r.x+r.width/2,y:r.y+r.height/2});
      }return samples;
    },to);
    const movedDistances=frames.map(p=>distance(p,b));
    assert(movedDistances.some(d=>d>4&&d<travel-4),'live target exchange has observable intermediate animation frames');
    await page.waitForTimeout(450);
    const yieldedTarget=await center(page.locator(node(to)));
    assert(distance(yieldedTarget,a)<3,'live target smoothly reaches the source slot: '+JSON.stringify({from,to,a,b,travel,yieldedTarget,remaining:distance(yieldedTarget,a)}));
    const held=await positions(page);for(const [key,p] of Object.entries(held))if(key!==from&&key!==to)assert(distance(p,before[key])<2,'live drag does not push unrelated sibling '+key);
    await page.mouse.up();await page.locator(node('s:orbit-space')).hover();await page.waitForTimeout(800);
    const after=await positions(page),expected=[...beforeOrder],ai=expected.indexOf(from.slice(2)),bi=expected.indexOf(to.slice(2));[expected[ai],expected[bi]]=[expected[bi],expected[ai]];
    assert.deepEqual(await page.evaluate(()=>data[0].scenes.map(s=>s.id)),expected,'live drag saves exactly the sibling exchange');
    assert.equal(await page.locator(node('s:orbit-space')).evaluate(el=>getComputedStyle(el).zoom),beforeZoom,'live drag preserves zoom');
    for(const [key,p] of Object.entries(after)){const slot=key===from?before[to]:key===to?before[from]:before[key];assert(distance(p,slot)<3,'live drag preserves camera and returns '+key+' to its orbital slot');}
    report.motion.liveDrag={from,to,travel,intermediateFrames:movedDistances.filter(d=>d>4&&d<travel-4).length,beforeZoom,slotsPreserved:true};
    await page.screenshot({path:path.join(__dirname,'v10-solar-live-drag.png')});
    checks.push('3D 星际与行星视图默认缓慢运动，悬停暂缓以便点击或拖动');
    checks.push('真实动画下拖拽具有中间过渡帧，目标回填源槽，松手保留相机和缩放');
  }finally{await context.close();}
}

(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  if(process.env.ATLAS_MOTION_ONLY==='1'){await verifyMotion();console.log(JSON.stringify({status:'PASS',checks,errors,report},null,2));return;}
  const {context,page}=await newAtlas();
  try{
    await verifyControls(page);await verifyRings(page);
    for(const id of ['radial','spatial','solar']){await dragExchange(page,id);await dragExchange(page,id,{cancel:true});}
    await dragExchange(page,'solar',{crossRing:true});
    checks.push('2D/3D 拖动仅平滑交换同级槽位，取消不保存；跨轨道交换保持容量、节点完整且不挤走其他项');
    await verifyAncestry(page);
  }finally{await context.close();}
  await verifyMotion();assert.deepEqual(errors,[],'no browser runtime errors');
  const output={status:'PASS',checks,errors,report};fs.writeFileSync(path.join(__dirname,'v10-orbit-controls-report.json'),JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2));
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
