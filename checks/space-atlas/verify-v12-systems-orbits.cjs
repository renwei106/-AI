const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

/*
 * Black-box contract for the 3D "场景星系" view.
 *
 * Deliberate selector assumptions:
 * - data-orbit belongs to a main orbit; data-satellite-orbit belongs to a
 *   scene's group orbit. The two must never be treated as the same hierarchy.
 * - the dashed add node occupies a visible main-orbit slot, so capacity and
 *   re-spacing checks count every level-one [data-orbit] node, while entity
 *   integrity checks count only [data-kind="scene"].
 * - orbitPlans persist presentation placement; yiyu-prototype-v1 persists the
 *   underlying sibling order. A refresh check must verify both stores.
 */
const BASE_URL=process.env.SHIYU_PREVIEW_URL||'http://127.0.0.1:4318/';
const SPACE_ID='v12-systems-space';
const SCENE_COUNT=7;
const GROUP_COUNT=7;
const errors=[];
const checks=[];
const report={structure:{},focus:{},emptyOrbitDrop:{},nodeExchange:{},satelliteTransfers:{},refresh:{}};
let browser;

const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const sceneKey=id=>'c:'+id;
const sceneSelector=key=>`.at-node[data-level="1"][data-kind="scene"][data-key="${key}"]`;

function fixture(){
  const iconNames=['work','home','star','book','note','film','music'];
  return [{
    id:SPACE_ID,name:'场景星系测试空间',icon:'space',scenes:Array.from({length:SCENE_COUNT},(_,sceneIndex)=>({
      id:`v12-scene-${sceneIndex}`,name:`场景 ${sceneIndex+1}`,icon:iconNames[sceneIndex%iconNames.length],description:'',
      groups:Array.from({length:GROUP_COUNT},(_,groupIndex)=>({
        id:`v12-group-${sceneIndex}-${groupIndex}`,name:`分组 ${sceneIndex+1}-${groupIndex+1}`,icon:'folder',
        items:Array.from({length:3},(_,linkIndex)=>[
          `网址 ${sceneIndex+1}-${groupIndex+1}-${linkIndex+1}`,
          `https://example.com/v12/${sceneIndex}/${groupIndex}/${linkIndex}`,
          '场景星系回归测试','icon:globe'
        ])
      }))
    }))
  }];
}

async function setup(){
  const context=await browser.newContext({viewport:{width:1440,height:1041},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(BASE_URL,{waitUntil:'networkidle'});
  await page.evaluate(({dataFixture,spaceId})=>{
    data=dataFixture;
    signed=true;
    prefs={...prefs,homeEntryGesture:'single',spaceThemePolicy:'last',inspirationMockV1:true,firstSpaceCapacityV1:true,membership:{expiresAt:Date.now()+86400000}};
    persist();
    goSpace(spaceId);
  },{dataFixture:fixture(),spaceId:SPACE_ID});
  await page.locator('.workspace .space-mode-entry').click();
  await page.locator('#space-mode-menu [data-space-mode="atlas"]').click();
  await page.locator('#space-atlas[open].atlas-ready .at-canvas').waitFor({state:'visible'});
  await chooseSystems(page);
  return {context,page};
}

async function chooseSystems(page){
  const trigger=page.locator('#space-atlas [data-at="views"]');
  const picker=page.locator('#space-atlas .at-layout-menu');
  // Pointer entry is the product's primary affordance. A synthetic click moves
  // the pointer over the trigger first and would otherwise open, then toggle it
  // closed in the same action.
  await trigger.hover();
  await picker.waitFor({state:'visible'});
  await picker.locator('[data-at-dimension="3d"]').click();
  await picker.locator('[data-at-view="systems"]').click();
  await page.locator('#space-atlas .at-full-page[data-mode="3d"][data-presentation="systems"]').waitFor();
  await settle(page);
}

async function settle(page){
  await page.waitForFunction(()=>!document.querySelector('#space-atlas .at-canvas.is-settling'));
  await page.waitForTimeout(160);
}

async function symbolCenter(locator){
  return locator.evaluate(el=>{
    const symbol=el.querySelector('.at-orb,.at-logo,.at-add-mark,.at-bundle-mark')||el;
    const box=symbol.getBoundingClientRect();
    return {x:box.left+box.width/2,y:box.top+box.height/2};
  });
}

async function mainOrbitSnapshot(page){
  return page.evaluate(()=>{
    const canvas=document.querySelector('#space-atlas .at-canvas');
    const canvasBox=canvas.getBoundingClientRect();
    const nodes=[...canvas.querySelectorAll('.at-node[data-level="1"][data-orbit]')].map(el=>{
      const symbol=el.querySelector('.at-orb,.at-add-mark,.at-logo,.at-bundle-mark')||el;
      const box=symbol.getBoundingClientRect();
      return {key:el.dataset.key,kind:el.dataset.kind,orbit:el.dataset.orbit,x:box.left+box.width/2,y:box.top+box.height/2};
    });
    const rings=[...canvas.querySelectorAll('.at-orbit-track[data-orbit]')].map(track=>({
      id:track.dataset.orbit,
      capacity:Number(track.dataset.capacity),
      count:nodes.filter(node=>node.orbit===track.dataset.orbit).length,
      sceneCount:nodes.filter(node=>node.kind==='scene'&&node.orbit===track.dataset.orbit).length,
      speed:Number(track.dataset.speed),
      path:track.getAttribute('d')||''
    })).sort((a,b)=>Number(a.id)-Number(b.id));
    return {canvas:{x:canvasBox.x,y:canvasBox.y,width:canvasBox.width,height:canvasBox.height},nodes,rings};
  });
}

async function verifyStructure(page){
  const shell=page.locator('#space-atlas .at-full-page');
  assert.equal(await shell.getAttribute('data-mode'),'3d');
  assert.equal(await shell.getAttribute('data-presentation'),'systems');
  assert.match((await page.locator('[data-at="views"]').innerText()).replace(/\s+/g,' '),/3D.*场景星系|场景星系.*3D/);

  const root=page.locator('.at-node[data-level="0"][data-kind="space"]');
  assert.equal(await root.count(),1,'systems keeps the current space as its central star');
  const rootCenter=await symbolCenter(root),snapshot=await mainOrbitSnapshot(page),canvas=snapshot.canvas;
  assert(Math.abs(rootCenter.x-(canvas.x+canvas.width/2))<3,'space star is horizontally centered');
  assert(Math.abs(rootCenter.y-(canvas.y+canvas.height/2))<12,'space star is vertically centered in the usable graph plane');
  assert(snapshot.rings.length>=2,'fixture renders more than one main scene orbit');
  assert(snapshot.rings.every(ring=>ring.path.startsWith('M')&&ring.path.includes('L')),'every main orbit renders a complete vector path');
  assert(snapshot.rings.every((ring,index)=>index===0||ring.speed<snapshot.rings[index-1].speed),'outer main orbits move more slowly');
  assert(snapshot.rings.every(ring=>ring.count<=ring.capacity),'each main orbit stays within its declared capacity');
  assert.equal(snapshot.nodes.filter(node=>node.kind==='scene').length,SCENE_COUNT,'every scene is present on a main orbit');
  assert.equal(snapshot.nodes.filter(node=>node.kind==='add').length,1,'the add-scene affordance remains the final visible orbit item');
  assert(snapshot.nodes.filter(node=>node.kind==='scene').every(node=>snapshot.rings.some(ring=>ring.id===node.orbit)),'each scene references a rendered main orbit');

  let previewGroupCount=null;
  for(let sceneIndex=0;sceneIndex<SCENE_COUNT;sceneIndex++){
    const parent=sceneKey(`v12-scene-${sceneIndex}`);
    const tracks=page.locator(`.at-satellite-track[data-orbit-parent="${parent}"]`);
    const groups=page.locator(`.at-node[data-level="2"][data-kind="group"][data-orbit-parent="${parent}"][data-satellite-orbit]`);
    const overflow=page.locator(`.at-node[data-level="2"][data-kind="bundle"][data-orbit-parent="${parent}"][data-satellite-orbit]`);
    const shown=await groups.count();
    if(previewGroupCount===null)previewGroupCount=shown;
    assert.equal(shown,previewGroupCount,`${parent} uses the same overview group limit as its peer scenes`);
    assert(shown>0&&shown<GROUP_COUNT,`${parent} previews groups while leaving an explicit overflow`);
    assert.equal(await overflow.count(),1,`${parent} aggregates the remaining groups once`);
    assert.equal((await overflow.locator('.at-more-orb').innerText()).trim(),'…',`${parent} uses the compact ellipsis planet`);
    assert.equal((await overflow.locator('strong').innerText()).trim(),`还有 ${GROUP_COUNT-shown} 个`,`${parent} reports the exact overflow count`);
    assert.equal(await overflow.locator('.at-node-menu').count(),0,'overflow planet has no misleading edit control');
    const capacities=await tracks.evaluateAll(elements=>elements.map(el=>Number(el.dataset.capacity)));
    assert.equal(await tracks.count(),Math.ceil((shown+1)/capacities[0]),`${parent} distributes its visible groups and overflow planet by satellite capacity`);
    const trackIds=new Set(await tracks.evaluateAll(elements=>elements.map(el=>el.dataset.satelliteOrbit)));
    const childTrackIds=await page.locator(`.at-node[data-level="2"][data-orbit-parent="${parent}"]`).evaluateAll(elements=>elements.map(el=>el.dataset.satelliteOrbit));
    assert(childTrackIds.every(id=>trackIds.has(id)),`${parent} group planets reference only its own satellite paths`);
  }

  const groupOrbGeometry=await page.locator('.at-node[data-level="2"][data-kind="group"] .at-orb').evaluateAll(elements=>elements.map(el=>{
    const box=el.getBoundingClientRect(),style=getComputedStyle(el);
    return {width:box.width,height:box.height,radius:style.borderTopLeftRadius};
  }));
  assert(groupOrbGeometry.length===SCENE_COUNT*previewGroupCount,'all preview groups use planet symbols');
  assert(groupOrbGeometry.every(value=>Math.abs(value.width-value.height)<1&&(value.radius==='50%'||parseFloat(value.radius)>=value.width*.45)),'group planets are circular rather than cards');
  const saved=await page.evaluate(spaceId=>JSON.parse(localStorage.getItem('shiyu-space-atlas-v1'))[spaceId],SPACE_ID);
  assert.equal(saved.mode,'3d');assert.equal(saved.scene3d,'systems');
  report.structure={rootCenter,rings:snapshot.rings.map(({path,...ring})=>ring),previewGroupCount,satelliteTracks:await page.locator('.at-satellite-track').count(),groupOrbGeometry:groupOrbGeometry[0],saved:{mode:saved.mode,scene3d:saved.scene3d}};
  await page.screenshot({path:path.join(__dirname,'v12-systems-overview.png')});
  checks.push('场景星系以空间为中心，场景位于主轨，分组以球形子轨环绕，超出预览数量时显示“…”');
}

async function verifySatelliteTracksFollowDrag(page){
  const scene=page.locator('.at-node[data-level="1"][data-kind="scene"][data-orbit]').first(),key=await scene.getAttribute('data-key'),track=page.locator(`.at-satellite-track[data-orbit-parent="${key}"]`).first();
  const start=await symbolCenter(scene),before=await track.boundingBox();
  await page.mouse.move(start.x,start.y);await page.mouse.down();
  try{
    await page.mouse.move(start.x+8,start.y+4,{steps:2});await page.mouse.move(start.x+52,start.y+31,{steps:8});await page.waitForTimeout(100);
    const held=await symbolCenter(scene),during=await track.boundingBox(),nodeDelta={x:held.x-start.x,y:held.y-start.y},trackDelta={x:during.x-before.x,y:during.y-before.y};
    assert(Math.hypot(nodeDelta.x,nodeDelta.y)>45,'scene is visibly held away from its orbit slot');
    assert(Math.abs(nodeDelta.x-trackDelta.x)<3&&Math.abs(nodeDelta.y-trackDelta.y)<3,'the scene satellite paths follow the held scene without detaching');
  }finally{await page.mouse.up();await settle(page);await page.waitForTimeout(260)}
  checks.push('拖动场景时，其分组节点和浅色子轨道保持为一个整体移动');
}

async function verifySceneFocus(page){
  const owner='c:v12-scene-0';
  const overflow=page.locator(`.at-node[data-level="2"][data-kind="bundle"][data-orbit-parent="${owner}"] .at-node-main`);
  await overflow.click();
  await page.locator(`.at-node[data-level="0"][data-kind="scene"][data-key="${owner}"]`).waitFor();
  await settle(page);
  const groups=page.locator('.at-node[data-level="1"][data-kind="group"][data-orbit]');
  assert.equal(await groups.count(),GROUP_COUNT,'focusing a scene reveals every real group on main orbits');
  assert.equal(await page.locator('.at-node[data-level="1"][data-kind="bundle"]').count(),0,'focused scene does not aggregate its groups');
  assert.equal(await page.locator('.at-satellite-track').count(),0,'focused groups graduate from satellite paths to the current main paths');
  assert.equal(await page.locator(`.at-node.is-parent[data-level="-1"][data-kind="space"][data-key="s:${SPACE_ID}"]`).count(),1,'the space remains visible as the immediate parent');
  const round=await groups.locator('.at-orb').evaluateAll(elements=>elements.every(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return Math.abs(r.width-r.height)<1&&(s.borderTopLeftRadius==='50%'||parseFloat(s.borderTopLeftRadius)>=r.width*.45)}));
  assert.equal(round,true,'focused groups remain spherical');
  report.focus={scene:owner,groups:await groups.count(),satelliteTracks:await page.locator('.at-satellite-track').count()};
  await page.screenshot({path:path.join(__dirname,'v12-systems-focused-scene.png')});
  checks.push('点击分组溢出星球会聚焦所属场景，并完整显示该场景的全部分组');
  await page.locator(`.at-node.is-parent[data-key="s:${SPACE_ID}"] .at-node-main`).click();
  await page.locator('.at-node[data-level="0"][data-kind="space"]').waitFor();
  await settle(page);
}

async function emptyPointOnOrbit(page,orbitId){
  return page.locator(`.at-orbit-track[data-orbit="${orbitId}"]`).evaluate((track,id)=>{
    const matrix=track.getScreenCTM(),length=track.getTotalLength();
    const occupied=[...document.querySelectorAll('#space-atlas .at-node[data-level="1"] .at-orb,#space-atlas .at-node[data-level="1"] .at-add-mark')].map(el=>{const r=el.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}});
    let best=null;
    for(let index=0;index<360;index++){
      const point=track.getPointAtLength(length*index/360).matrixTransform(matrix);
      const clearance=Math.min(...occupied.map(node=>Math.hypot(node.x-point.x,node.y-point.y)));
      if(!best||clearance>best.clearance)best={x:point.x,y:point.y,clearance,index};
    }
    return {...best,orbit:id};
  },orbitId);
}

async function dragTo(page,sourceKey,target,{targetClass,sourceSelector=sceneSelector}){
  const source=page.locator(sourceSelector(sourceKey));
  const start=await symbolCenter(source);
  await page.mouse.move(start.x,start.y);
  await page.mouse.down();
  await page.mouse.move(start.x+8,start.y+3,{steps:2});
  await page.mouse.move(target.x,target.y,{steps:22});
  await page.waitForTimeout(120);
  if(targetClass)assert.equal(await page.locator(targetClass).count(),1,`drag exposes ${targetClass} as the active drop target`);
  const duringKeys=await page.locator('.at-node[data-level="1"][data-kind="scene"]').evaluateAll(elements=>elements.map(el=>el.dataset.key).sort());
  assert.equal(duringKeys.length,SCENE_COUNT,'no scene disappears while a branch is held');
  await page.mouse.up();
  await settle(page);
  return {start,duringKeys};
}

async function emptyPointOnSatellite(page,trackId){
  return page.locator(`.at-satellite-track[data-satellite-orbit="${trackId}"]`).evaluate((track,id)=>{
    const matrix=track.getScreenCTM(),length=track.getTotalLength();
    const occupied=[...document.querySelectorAll('#space-atlas .at-node[data-level="2"] .at-orb')].map(el=>{const r=el.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}});
    let best=null;
    for(let index=0;index<360;index++){
      const point=track.getPointAtLength(length*index/360).matrixTransform(matrix);
      const clearance=Math.min(...occupied.map(node=>Math.hypot(node.x-point.x,node.y-point.y)));
      if(!best||clearance>best.clearance)best={x:point.x,y:point.y,clearance,index};
    }
    return {...best,track:id};
  },trackId);
}

async function evenSpacing(page,orbitIds){
  return page.evaluate(ids=>Object.fromEntries(ids.map(id=>{
    const track=document.querySelector(`.at-orbit-track[data-orbit="${id}"]`),d=track.getAttribute('d')||'';
    const vertices=[...d.matchAll(/[ML]\s*([-+0-9.e]+),([-+0-9.e]+)/gi)].map(match=>({x:Number(match[1]),y:Number(match[2])}));
    if(vertices.length>1&&Math.hypot(vertices[0].x-vertices.at(-1).x,vertices[0].y-vertices.at(-1).y)<.5)vertices.pop();
    const canvas=document.querySelector('#space-atlas .at-canvas').getBoundingClientRect();
    const members=[...document.querySelectorAll(`.at-node[data-level="1"][data-orbit="${id}"]`)].map(el=>{const symbol=el.querySelector('.at-orb,.at-add-mark,.at-logo,.at-bundle-mark')||el,r=symbol.getBoundingClientRect();return{x:r.x+r.width/2-canvas.x,y:r.y+r.height/2-canvas.y,key:el.dataset.key}});
    const indices=members.map(member=>({key:member.key,index:vertices.reduce((best,point,index)=>Math.hypot(point.x-member.x,point.y-member.y)<Math.hypot(vertices[best].x-member.x,vertices[best].y-member.y)?index:best,0)})).sort((a,b)=>a.index-b.index);
    const gaps=indices.map((entry,index)=>(indices[(index+1)%indices.length].index-entry.index+vertices.length)%vertices.length);
    return [id,{vertices:vertices.length,members:indices,gaps,spread:Math.max(...gaps)-Math.min(...gaps)}];
  })),orbitIds);
}

async function verifyEmptyOrbitDrop(page){
  const before=await mainOrbitSnapshot(page),targetRing=before.rings.find(ring=>ring.count<ring.capacity),sourceRing=[...before.rings].reverse().find(ring=>ring.id!==targetRing?.id&&ring.sceneCount>0);
  assert(targetRing&&sourceRing,'fixture exposes an unfilled target orbit and another populated source orbit');
  const source=before.nodes.find(node=>node.kind==='scene'&&node.orbit===sourceRing.id);
  assert(source,'source ring contains a movable scene');
  const empty=await emptyPointOnOrbit(page,targetRing.id);
  assert(empty.clearance>50,'chosen main-orbit point is visibly empty: '+JSON.stringify(empty));
  const keysBefore=before.nodes.filter(node=>node.kind==='scene').map(node=>node.key).sort();
  await dragTo(page,source.key,empty,{targetClass:`.at-orbit-track[data-orbit="${targetRing.id}"].is-drop-target`});
  const after=await mainOrbitSnapshot(page),keysAfter=after.nodes.filter(node=>node.kind==='scene').map(node=>node.key).sort();
  assert.deepEqual(keysAfter,keysBefore,'cross-orbit drop keeps the complete scene identity set');
  assert.equal(after.nodes.find(node=>node.key===source.key).orbit,targetRing.id,'the held scene joins the empty target orbit');
  assert.equal(after.rings.find(ring=>ring.id===sourceRing.id).count,sourceRing.count-1,'source orbit releases exactly one visible slot');
  assert.equal(after.rings.find(ring=>ring.id===targetRing.id).count,targetRing.count+1,'target orbit receives exactly one visible slot');
  const spacing=await evenSpacing(page,[sourceRing.id,targetRing.id]);
  assert(Object.values(spacing).every(value=>value.spread<=3),'both affected orbits re-space their visible nodes evenly: '+JSON.stringify(spacing));
  const storage=await page.evaluate(({spaceId,key})=>{
    const atlas=JSON.parse(localStorage.getItem('shiyu-space-atlas-v1'));
    return {assignment:atlas[spaceId].orbitPlans[`systems:s:${spaceId}`][key],plan:atlas[spaceId].orbitPlans[`systems:s:${spaceId}`]};
  },{spaceId:SPACE_ID,key:source.key});
  assert.equal(String(storage.assignment),targetRing.id,'empty-orbit placement is saved in the systems orbit plan');
  report.emptyOrbitDrop={source:source.key,from:sourceRing.id,to:targetRing.id,beforeCounts:Object.fromEntries(before.rings.map(r=>[r.id,r.count])),afterCounts:Object.fromEntries(after.rings.map(r=>[r.id,r.count])),empty,spacing,plan:storage.plan};
  await page.screenshot({path:path.join(__dirname,'v12-systems-cross-ring.png')});
  checks.push('场景拖到主轨空位后，源轨与目标轨重新均分，完整节点集与轨道归属均被保留');
  return {moved:source.key,targetRing:targetRing.id,sourceRing:sourceRing.id};
}

async function verifyNodeExchange(page,crossDrop){
  const before=await mainOrbitSnapshot(page);
  const source=before.nodes.find(node=>node.kind==='scene'&&node.orbit===crossDrop.targetRing&&node.key!==crossDrop.moved);
  const target=before.nodes.find(node=>node.kind==='scene'&&node.orbit===crossDrop.sourceRing&&node.key!==crossDrop.moved);
  assert(source&&target,'two non-moved scene planets are available for cross-orbit exchange');
  const orderBefore=await page.evaluate(spaceId=>data.find(space=>space.id===spaceId).scenes.map(scene=>scene.id),SPACE_ID);
  const positionsBefore=Object.fromEntries(before.nodes.filter(node=>node.kind==='scene').map(node=>[node.key,{x:node.x,y:node.y,orbit:node.orbit}]));
  await dragTo(page,source.key,{x:target.x,y:target.y},{targetClass:`${sceneSelector(target.key)}.is-sort-target`});
  const after=await mainOrbitSnapshot(page),positionsAfter=Object.fromEntries(after.nodes.filter(node=>node.kind==='scene').map(node=>[node.key,{x:node.x,y:node.y,orbit:node.orbit}]));
  assert.equal(positionsAfter[source.key].orbit,positionsBefore[target.key].orbit,'held scene takes the destination scene orbit');
  assert.equal(positionsAfter[target.key].orbit,positionsBefore[source.key].orbit,'destination scene takes the held scene orbit');
  assert(distance(positionsAfter[source.key],positionsBefore[target.key])<4,'held scene settles into the destination slot');
  assert(distance(positionsAfter[target.key],positionsBefore[source.key])<4,'destination scene settles into the vacated slot');
  for(const key of Object.keys(positionsBefore))if(key!==source.key&&key!==target.key)assert(distance(positionsAfter[key],positionsBefore[key])<4,`${key} remains in its own slot during a two-node exchange`);
  const orderAfter=await page.evaluate(spaceId=>data.find(space=>space.id===spaceId).scenes.map(scene=>scene.id),SPACE_ID);
  const expected=[...orderBefore],sourceIndex=expected.indexOf(source.key.slice(2)),targetIndex=expected.indexOf(target.key.slice(2));
  [expected[sourceIndex],expected[targetIndex]]=[expected[targetIndex],expected[sourceIndex]];
  assert.deepEqual(orderAfter,expected,'dropping onto another planet swaps exactly the two underlying sibling positions');
  const stores=await page.evaluate(spaceId=>({
    data:JSON.parse(localStorage.getItem('yiyu-prototype-v1')).data.find(space=>space.id===spaceId).scenes.map(scene=>scene.id),
    plan:JSON.parse(localStorage.getItem('shiyu-space-atlas-v1'))[spaceId].orbitPlans[`systems:s:${spaceId}`]
  }),SPACE_ID);
  assert.deepEqual(stores.data,orderAfter,'the reordered scene list is persisted to the application store');
  assert.equal(String(stores.plan[source.key]),positionsBefore[target.key].orbit,'the held scene orbit is persisted after exchange');
  assert.equal(String(stores.plan[target.key]),positionsBefore[source.key].orbit,'the destination scene orbit is persisted after exchange');
  report.nodeExchange={source:source.key,target:target.key,before:{source:positionsBefore[source.key],target:positionsBefore[target.key]},after:{source:positionsAfter[source.key],target:positionsAfter[target.key]},order:orderAfter,plan:stores.plan};
  checks.push('拖到另一颗星球时仅交换两者位置与轨道，其余场景不被顶出轨道');
  return {order:orderAfter,positions:positionsAfter,keys:Object.keys(positionsAfter).sort(),plan:stores.plan,source:source.key,target:target.key,moved:crossDrop.moved};
}

async function verifySatelliteTransfers(page,mainExpected){
  const sceneA='v12-scene-0',sceneB='v12-scene-1',parentA=sceneKey(sceneA),parentB=sceneKey(sceneB);
  const ownTracks=await page.locator(`.at-satellite-track[data-orbit-parent="${parentA}"]`).evaluateAll(elements=>elements.map(track=>({
    id:track.dataset.satelliteOrbit,capacity:Number(track.dataset.capacity),count:document.querySelectorAll(`.at-node[data-level="2"][data-satellite-orbit="${track.dataset.satelliteOrbit}"]`).length
  })));
  const ownTarget=ownTracks.find(track=>track.count<track.capacity),ownSource=ownTarget&&await page.locator(`.at-node[data-level="2"][data-kind="group"][data-orbit-parent="${parentA}"]:not([data-satellite-orbit="${ownTarget.id}"])`).first().getAttribute('data-key');
  assert(ownSource&&ownTarget,'one scene exposes a group and an unfilled sibling orbit');
  const ownEmpty=await emptyPointOnSatellite(page,ownTarget.id),ownOrderBefore=await page.evaluate(({spaceId,sceneId})=>data.find(space=>space.id===spaceId).scenes.find(scene=>scene.id===sceneId).groups.map(group=>group.id),{spaceId:SPACE_ID,sceneId:sceneA});
  await dragTo(page,ownSource,ownEmpty,{sourceSelector:key=>`.at-node[data-level="2"][data-kind="group"][data-key="${key}"]`,targetClass:`.at-satellite-track[data-satellite-orbit="${ownTarget.id}"].is-drop-target`});
  const ownOrderAfter=await page.evaluate(({spaceId,sceneId})=>data.find(space=>space.id===spaceId).scenes.find(scene=>scene.id===sceneId).groups.map(group=>group.id),{spaceId:SPACE_ID,sceneId:sceneA});
  assert.deepEqual([...ownOrderAfter].sort(),[...ownOrderBefore].sort(),'moving between one scene\'s suborbits keeps the same complete group set');
  assert.equal(await page.locator(`.at-node[data-key="${ownSource}"][data-satellite-orbit="${ownTarget.id}"]`).count(),1,'the group immediately occupies the selected sibling orbit');
  const ownStored=await page.evaluate(({spaceId,parent,key})=>JSON.parse(localStorage.getItem('shiyu-space-atlas-v1'))[spaceId].orbitPlans[`systems:satellite:${parent}`][key],{spaceId:SPACE_ID,parent:parentA,key:ownSource});
  assert.equal(String(ownStored),ownTarget.id.split(':').at(-1),'the selected sibling orbit persists in the scene plan');
  const listsBefore=await page.evaluate(({spaceId,a,b})=>{
    const space=data.find(item=>item.id===spaceId);
    return Object.fromEntries([a,b].map(id=>[id,space.scenes.find(scene=>scene.id===id).groups.map(group=>group.id)]));
  },{spaceId:SPACE_ID,a:sceneA,b:sceneB});
  const source=await page.locator(`.at-node[data-level="2"][data-kind="group"][data-orbit-parent="${parentA}"]`).first().getAttribute('data-key');
  const targetTracks=await page.locator(`.at-satellite-track[data-orbit-parent="${parentB}"]`).evaluateAll(elements=>elements.map(track=>({
    id:track.dataset.satelliteOrbit,capacity:Number(track.dataset.capacity),count:document.querySelectorAll(`.at-node[data-level="2"][data-satellite-orbit="${track.dataset.satelliteOrbit}"]`).length
  })));
  const targetTrack=targetTracks.find(track=>track.count<track.capacity);
  assert(source&&targetTrack,'two scenes expose a movable group and an unfilled satellite orbit');
  const empty=await emptyPointOnSatellite(page,targetTrack.id);
  assert(empty.clearance>28,'satellite target point is visibly separate from its existing group planets: '+JSON.stringify(empty));
  const groupSourceSelector=key=>`.at-node[data-level="2"][data-kind="group"][data-key="${key}"]`;
  await dragTo(page,source,empty,{sourceSelector:groupSourceSelector,targetClass:`.at-satellite-track[data-satellite-orbit="${targetTrack.id}"].is-drop-target`});
  const listsMoved=await page.evaluate(({spaceId,a,b})=>{
    const space=data.find(item=>item.id===spaceId);
    return Object.fromEntries([a,b].map(id=>[id,space.scenes.find(scene=>scene.id===id).groups.map(group=>group.id)]));
  },{spaceId:SPACE_ID,a:sceneA,b:sceneB});
  assert.equal(listsMoved[sceneA].length,listsBefore[sceneA].length-1,'source scene releases exactly one group');
  assert.equal(listsMoved[sceneB].length,listsBefore[sceneB].length+1,'target scene receives exactly one group');
  assert.equal(listsMoved[sceneA].includes(source.slice(2)),false,'moved group leaves its original scene');
  assert.equal(listsMoved[sceneB].includes(source.slice(2)),true,'moved group joins the target scene without losing existing groups');
  assert.equal(await page.locator(`.at-node[data-key="${source}"][data-orbit-parent="${parentB}"][data-satellite-orbit="${targetTrack.id}"]`).count(),1,'moved group immediately renders on the selected orbit around its new scene');
  const crossStored=await page.evaluate(({spaceId,parent,key})=>JSON.parse(localStorage.getItem('shiyu-space-atlas-v1'))[spaceId].orbitPlans[`systems:satellite:${parent}`][key],{spaceId:SPACE_ID,parent:parentB,key:source});
  assert.equal(String(crossStored),targetTrack.id.split(':').at(-1),'the exact destination orbit persists after a cross-scene move');

  const exchangeSource=await page.locator(`.at-node[data-level="2"][data-kind="group"][data-orbit-parent="${parentA}"]`).first().getAttribute('data-key');
  const exchangeTarget=await page.locator(`.at-node[data-level="2"][data-kind="group"][data-orbit-parent="${parentB}"]:not([data-key="${source}"])`).first().getAttribute('data-key');
  assert(exchangeSource&&exchangeTarget,'visible groups remain available for a cross-scene exchange');
  const targetPoint=await symbolCenter(page.locator(`.at-node[data-level="2"][data-kind="group"][data-key="${exchangeTarget}"]`));
  const beforeSwap=listsMoved;
  await dragTo(page,exchangeSource,targetPoint,{sourceSelector:groupSourceSelector,targetClass:`.at-node[data-level="2"][data-kind="group"][data-key="${exchangeTarget}"].is-sort-target`});
  const listsAfter=await page.evaluate(({spaceId,a,b})=>{
    const space=data.find(item=>item.id===spaceId);
    return Object.fromEntries([a,b].map(id=>[id,space.scenes.find(scene=>scene.id===id).groups.map(group=>group.id)]));
  },{spaceId:SPACE_ID,a:sceneA,b:sceneB});
  const expectedA=[...beforeSwap[sceneA]],expectedB=[...beforeSwap[sceneB]],aIndex=expectedA.indexOf(exchangeSource.slice(2)),bIndex=expectedB.indexOf(exchangeTarget.slice(2));
  [expectedA[aIndex],expectedB[bIndex]]=[expectedB[bIndex],expectedA[aIndex]];
  assert.deepEqual(listsAfter[sceneA],expectedA,'source scene receives only the exchanged destination group');
  assert.deepEqual(listsAfter[sceneB],expectedB,'destination scene receives only the exchanged source group');
  const persisted=await page.evaluate(({spaceId,a,b})=>{
    const space=JSON.parse(localStorage.getItem('yiyu-prototype-v1')).data.find(item=>item.id===spaceId);
    return Object.fromEntries([a,b].map(id=>[id,space.scenes.find(scene=>scene.id===id).groups.map(group=>group.id)]));
  },{spaceId:SPACE_ID,a:sceneA,b:sceneB});
  assert.deepEqual(persisted,listsAfter,'satellite moves and exchanges persist in the application hierarchy');
  const satellitePlans=await page.evaluate(({spaceId,parents})=>{const plans=JSON.parse(localStorage.getItem('shiyu-space-atlas-v1'))[spaceId].orbitPlans;return Object.fromEntries(parents.map(parent=>[parent,plans[`systems:satellite:${parent}`]]))},{spaceId:SPACE_ID,parents:[parentA,parentB]});
  report.satelliteTransfers={sameSceneMove:{group:ownSource,track:ownTarget.id,empty:ownEmpty},emptyMove:{group:source,from:sceneA,to:sceneB,track:targetTrack.id,empty},exchange:{source:exchangeSource,target:exchangeTarget},lists:listsAfter,satellitePlans};
  await page.screenshot({path:path.join(__dirname,'v12-systems-satellite-drag.png')});
  checks.push('分组可在同场景子轨间移动，也可跨场景移轨或交换；具体轨道与层级数据均被保留');
  return {...mainExpected,groupLists:listsAfter,satellitePlans};
}

async function verifyRefresh(page,expected){
  await page.reload({waitUntil:'networkidle'});
  await page.evaluate(spaceId=>goSpace(spaceId),SPACE_ID);
  await page.locator('#space-atlas[open].atlas-ready .at-full-page[data-mode="3d"][data-presentation="systems"] .at-canvas').waitFor({state:'visible'});
  await settle(page);
  const after=await mainOrbitSnapshot(page),positions=Object.fromEntries(after.nodes.filter(node=>node.kind==='scene').map(node=>[node.key,{x:node.x,y:node.y,orbit:node.orbit}]));
  const order=await page.evaluate(spaceId=>data.find(space=>space.id===spaceId).scenes.map(scene=>scene.id),SPACE_ID);
  assert.deepEqual(order,expected.order,'refresh restores the exchanged application order');
  assert.deepEqual(Object.keys(positions).sort(),expected.keys,'refresh restores every scene planet');
  assert.equal(positions[expected.moved].orbit,expected.positions[expected.moved].orbit,'refresh retains the earlier empty-orbit move');
  assert.equal(positions[expected.source].orbit,expected.positions[expected.source].orbit,'refresh retains the held scene exchange orbit');
  assert.equal(positions[expected.target].orbit,expected.positions[expected.target].orbit,'refresh retains the destination scene exchange orbit');
  for(const key of expected.keys)assert(distance(positions[key],expected.positions[key])<4,`${key} returns to its persisted orbital slot after refresh`);
  const plan=await page.evaluate(spaceId=>JSON.parse(localStorage.getItem('shiyu-space-atlas-v1'))[spaceId].orbitPlans[`systems:s:${spaceId}`],SPACE_ID);
  assert.deepEqual(plan,expected.plan,'refresh leaves the complete systems orbit plan unchanged');
  const groupLists=await page.evaluate(({spaceId,ids})=>{
    const space=data.find(item=>item.id===spaceId);
    return Object.fromEntries(ids.map(id=>[id,space.scenes.find(scene=>scene.id===id).groups.map(group=>group.id)]));
  },{spaceId:SPACE_ID,ids:Object.keys(expected.groupLists)});
  assert.deepEqual(groupLists,expected.groupLists,'refresh retains cross-scene group moves and exchanges');
  const satellitePlans=await page.evaluate(({spaceId,parents})=>{const plans=JSON.parse(localStorage.getItem('shiyu-space-atlas-v1'))[spaceId].orbitPlans;return Object.fromEntries(parents.map(parent=>[parent,plans[`systems:satellite:${parent}`]]))},{spaceId:SPACE_ID,parents:Object.keys(expected.satellitePlans)});
  assert.deepEqual(satellitePlans,expected.satellitePlans,'refresh retains the exact inner and outer group-orbit assignments independently from main orbits');
  report.refresh={mode:await page.locator('.at-full-page').getAttribute('data-presentation'),order,plan,groupLists,satellitePlans,sceneCount:Object.keys(positions).length};
  await page.screenshot({path:path.join(__dirname,'v12-systems-persisted.png')});
  checks.push('刷新后直接恢复场景星系，并同时保留应用排序与图谱轨道方案');
}

(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const {context,page}=await setup();
  try{
    await verifyStructure(page);
    await verifySatelliteTracksFollowDrag(page);
    await verifySceneFocus(page);
    const crossDrop=await verifyEmptyOrbitDrop(page);
    const exchange=await verifyNodeExchange(page,crossDrop);
    const completeExpectation=await verifySatelliteTransfers(page,exchange);
    await verifyRefresh(page,completeExpectation);
  }finally{await context.close()}
  assert.deepEqual(errors,[],'page should not raise runtime errors');
  const output={status:'PASS',checks,errors,report};
  fs.writeFileSync(path.join(__dirname,'v12-systems-orbits-report.json'),JSON.stringify(output,null,2));
  console.log(JSON.stringify(output,null,2));
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
