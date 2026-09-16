const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');

const BASE_URL=process.env.SHIYU_PREVIEW_URL||'http://127.0.0.1:4318/';
const shots=path.resolve(__dirname);
const checks=[];
const errors=[];
const measurements={chrome:{},radial:null,anchors:null,addShapes:null};
let browser;

const clean=text=>String(text||'').replace(/\s+/g,' ').trim();
const near=(a,b,tolerance=.02)=>Math.abs(a-b)<=tolerance;

async function newPage(viewport){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'});
  await context.addInitScript(()=>{
    localStorage.removeItem('yiyu-prototype-v1');
    localStorage.removeItem('shiyu-space-atlas-v1');
  });
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(BASE_URL,{waitUntil:'networkidle'});
  return {context,page};
}

async function openSpace(page){
  await page.evaluate(()=>{signed=true;goSpace(data[0].id)});
  await page.locator('.workspace .space-mode-entry').waitFor({state:'visible'});
}

async function openAtlas(page){
  await page.locator('.workspace .space-mode-entry').click();
  await page.locator('[data-space-mode="atlas"]').click();
  await page.locator('#space-atlas[open] .at-canvas').waitFor({state:'visible'});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}

async function verifyHomeAndSettings(page){
  await page.evaluate(()=>{signed=true;prefs.theme='base';delete prefs.homeCopy;delete prefs.sharedHomeCopy;view='home';render()});
  assert.equal(clean(await page.locator('.home-base h1').textContent()),'你的喜欢，自有归处','the default cover title should use the requested copy');
  checks.push('默认首页标题为“你的喜欢，自有归处”');

  await page.locator('[data-action="settings"]').click();
  const spaceTab=page.locator('#settings [data-settings-tab="space-entry"]');
  await spaceTab.waitFor({state:'visible'});
  assert.equal(clean(await spaceTab.textContent()),'空间','the global settings tab should be named 空间');
  await spaceTab.click();

  const panel=page.locator('#settings .space-entry-settings');
  const headings=await panel.locator(':scope > h3').allTextContents();
  assert.equal(headings.length,2,'space settings should contain exactly two groups');
  assert.equal(await panel.locator(':scope > p').count(),0,'space settings should not keep a fixed explanatory paragraph under either group heading');
  assert.equal(await panel.locator('.space-entry-row > small').count(),2,'each setting row should expose one live description for its current choice');

  async function chooseAndReopen(key,value){
    const selector=`#settings [data-pref="${key}"][data-value="${value}"]`;
    const option=page.locator(selector);
    const beforeRow=option.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " space-entry-row ")][1]');
    const beforeNote=clean(await beforeRow.locator(':scope > small').textContent());
    await option.click();
    assert.equal(await page.evaluate(key=>prefs[key],key),value,`${key} should update in the same click task`);
    const selected=page.locator(`#settings [data-pref="${key}"].selected, #settings [data-pref="${key}"][aria-pressed="true"]`);
    assert.equal(await selected.getAttribute('data-value'),value,`${key} selected state should update immediately`);
    const currentRow=selected.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " space-entry-row ")][1]');
    const expectedNote=clean(await currentRow.locator(':scope > small').textContent());
    assert(expectedNote.length>0,`${key}:${value} live description should not be empty`);
    assert.notEqual(expectedNote,beforeNote,`${key} live description should change with the selected value`);
    if(key==='homeEntryGesture')assert.match(expectedNote,/连续.*两次/);
    if(key==='spaceThemePolicy')assert.match(expectedNote,/默认主题/);

    await page.locator('#settings .dialog-heading [data-action="close"]').click();
    await page.locator('[data-action="settings"]').click();
    const reopenedTab=page.locator('#settings [data-settings-tab="space-entry"]');
    await reopenedTab.click();
    const reopened=page.locator(`#settings [data-pref="${key}"].selected, #settings [data-pref="${key}"][aria-pressed="true"]`);
    assert.equal(await reopened.getAttribute('data-value'),value,`${key} should remain selected after reopening settings`);
    const reopenedRow=reopened.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " space-entry-row ")][1]');
    assert.equal(clean(await reopenedRow.locator(':scope > small').textContent()),expectedNote,`${key} description should remain correct after reopening settings`);
  }

  await chooseAndReopen('homeEntryGesture','double');
  await chooseAndReopen('spaceThemePolicy','default');
  await page.locator('#settings .dialog-heading [data-action="close"]').click();
  checks.push('“空间”设置两组无固定说明，选项说明随选择即时联动并在重开后保持');
}

async function verifyModeCopy(page){
  await openSpace(page);
  await page.locator('.workspace .space-mode-entry').click();
  const menu=page.locator('#space-mode-menu');
  const options=await menu.locator('[data-space-mode]').evaluateAll(buttons=>buttons.map(button=>({
    id:button.dataset.spaceMode,
    title:button.querySelector('b')?.textContent.trim(),
    description:button.querySelector('small')?.textContent.trim()
  })));
  assert.deepEqual(options,[
    {id:'daily',title:'常规视图',description:'按场景和分组整齐呈现，适合日常浏览、搜索与管理'},
    {id:'atlas',title:'图谱视图',description:'用节点和连线展开层级，适合查看上下级与整体关系'}
  ]);
  checks.push('模式菜单使用“常规视图 / 图谱视图”及对应的新描述');
  await page.keyboard.press('Escape');
}

async function verifyChromeAt(viewport){
  const {context,page}=await newPage(viewport);
  try{
    await openSpace(page);
    await page.locator('.workspace .space-mode-entry').click();
    const transitionSamples=await page.evaluate(async()=>{
      const selectors={
        daily:{search:'.workspace .space-top-actions .global-search-trigger',add:'.workspace .space-top-actions [data-action="add"]',share:'.workspace .space-top-actions [data-share-open]',settings:'.workspace .space-top-actions [data-display-scope-open]'},
        atlas:{search:'#space-atlas .at-header-actions .global-search-trigger',add:'#space-atlas .at-header-actions [data-at-header="add"]',share:'#space-atlas .at-header-actions [data-at-header="share"]',settings:'#space-atlas .at-header-actions [data-at-header="settings"]'}
      };
      const read=set=>Object.fromEntries(Object.entries(set).map(([name,selector])=>{
        const element=document.querySelector(selector);
        if(!element)return [name,null];
        const rect=element.getBoundingClientRect();
        const style=getComputedStyle(element);
        const visible=rect.width>0&&rect.height>0&&style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity)>0;
        return [name,{x:rect.x+rect.width/2,y:rect.y+rect.height/2,width:rect.width,height:rect.height,visible}];
      }));
      const snapshot=frame=>({
        frame,
        daily:read(selectors.daily),
        atlas:read(selectors.atlas),
        bodyClass:document.body.className,
        dialogOpen:document.querySelector('#space-atlas')?.open===true
      });
      document.querySelector('[data-space-mode="atlas"]').click();
      const opening=[snapshot('sync')];
      for(let frame=1;frame<=8;frame++){
        await new Promise(resolve=>requestAnimationFrame(resolve));
        opening.push(snapshot(frame));
      }
      await new Promise(resolve=>setTimeout(resolve,0));
      document.querySelector('#space-atlas .space-mode-entry').click();
      document.querySelector('#space-mode-menu [data-space-mode="daily"]').click();
      const closing=[snapshot('sync')];
      for(let frame=1;frame<=8;frame++){
        await new Promise(resolve=>requestAnimationFrame(resolve));
        closing.push(snapshot(frame));
      }
      return {opening,closing};
    });

    const {opening,closing}=transitionSamples;
    for(const sample of opening){
      for(const name of ['search','add','share','settings']){
        const source=sample.daily[name],target=sample.atlas[name];
        assert(source&&target,`${name} should exist in both views at ${viewport.width}px, frame ${sample.frame}`);
        assert(near(source.x,target.x)&&near(source.y,target.y),`${name} centers differ at ${viewport.width}px, frame ${sample.frame}: ${JSON.stringify({source,target})}`);
        assert(near(target.x,opening[0].atlas[name].x)&&near(target.y,opening[0].atlas[name].y),`${name} moved after the synchronous switch at ${viewport.width}px, frame ${sample.frame}`);
      }
    }

    const reference={
      daily:Object.fromEntries(['search','add','share','settings'].map(name=>[name,opening[0].daily[name]])),
      atlas:Object.fromEntries(['search','add','share','settings'].map(name=>[name,opening[0].atlas[name]]))
    };
    for(const sample of closing){
      for(const name of ['search','add','share','settings']){
        const daily=sample.daily[name],atlas=sample.atlas[name];
        assert(daily,`${name} daily control should exist while closing atlas at ${viewport.width}px, frame ${sample.frame}`);
        assert(near(daily.x,reference.daily[name].x)&&near(daily.y,reference.daily[name].y),`${name} daily center moved while closing atlas at ${viewport.width}px, frame ${sample.frame}: ${JSON.stringify({reference:reference.daily[name],daily})}`);
        if(atlas&&atlas.width>0&&atlas.height>0){
          assert(near(atlas.x,reference.atlas[name].x)&&near(atlas.y,reference.atlas[name].y),`${name} atlas center moved while closing at ${viewport.width}px, frame ${sample.frame}: ${JSON.stringify({reference:reference.atlas[name],atlas})}`);
          assert(near(daily.x,atlas.x)&&near(daily.y,atlas.y),`${name} daily and atlas centers differ while closing at ${viewport.width}px, frame ${sample.frame}: ${JSON.stringify({daily,atlas})}`);
        }
        assert(daily.visible||atlas?.visible,`${name} has a blank frame while closing atlas at ${viewport.width}px, frame ${sample.frame}: ${JSON.stringify(sample)}`);
      }
    }
    measurements.chrome[viewport.width]={opening,closing};
    await page.screenshot({path:path.join(shots,`v7-feedback-${viewport.width}.png`),fullPage:false});
  }finally{
    await context.close();
  }
}

async function installSyntheticHierarchy(page){
  await page.evaluate(()=>{
    const item=(name)=>[name,`https://example.com/${name}`,'测试网址',name.slice(0,1)];
    const group=(id,name)=>({id,name,icon:'folder',items:[item(id)]});
    data=[{
      id:'v7-space',name:'V7 测试空间',icon:'work',scenes:[
        {id:'single-a',name:'单分组甲',icon:'work',description:'',groups:[group('single-a-g1','甲分组')]},
        {id:'multi-b',name:'多分组乙',icon:'home',description:'',groups:[group('multi-b-g1','乙一'),group('multi-b-g2','乙二'),group('multi-b-g3','乙三')]},
        {id:'single-c',name:'单分组丙',icon:'star',description:'',groups:[group('single-c-g1','丙分组')]},
        {id:'multi-d',name:'多分组丁',icon:'globe',description:'',groups:[group('multi-d-g1','丁一'),group('multi-d-g2','丁二')]}
      ]
    }];
    signed=true;spaceId='v7-space';sceneId='single-a';view='space';prefs.spaceThemePolicy='last';render();
  });
  await openAtlas(page);
  if(await page.locator('[data-at-mode="2d"][aria-pressed="false"]').count())await page.locator('[data-at-mode="2d"]').click();
  const picker=page.locator('[data-at="layouts"]');
  if(!/径向/.test(clean(await picker.textContent()))){await picker.click();await page.locator('[data-at-layout="radial"]').click()}
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}

async function verifyRadialHierarchy(page){
  const geometry=await page.evaluate(()=>{
    const anchor=key=>{
      const node=document.querySelector(`.at-node[data-key="${CSS.escape(key)}"]`);
      const target=node?.querySelector('.at-orb,.at-logo,.at-bundle-mark,.at-add-mark');
      if(!target)return null;
      const rect=target.getBoundingClientRect();return{x:rect.x+rect.width/2,y:rect.y+rect.height/2};
    };
    const root=anchor('s:v7-space');
    const scenes=['single-a','multi-b','single-c','multi-d'];
    const groups={
      'single-a':['single-a-g1'],
      'multi-b':['multi-b-g1','multi-b-g2','multi-b-g3'],
      'single-c':['single-c-g1'],
      'multi-d':['multi-d-g1','multi-d-g2']
    };
    return {root,branches:Object.fromEntries(scenes.map(id=>[id,{scene:anchor('c:'+id),groups:groups[id].map(groupId=>({id:groupId,point:anchor('g:'+groupId)}))}]))};
  });
  assert(geometry.root,'synthetic space root should render');
  const metrics=[];
  for(const [sceneId,branch] of Object.entries(geometry.branches)){
    assert(branch.scene,`${sceneId} should render`);
    const sx=branch.scene.x-geometry.root.x,sy=branch.scene.y-geometry.root.y,sceneRadius=Math.hypot(sx,sy),ux=sx/sceneRadius,uy=sy/sceneRadius;
    const branchMetrics=[];
    for(const {id,point} of branch.groups){
      assert(point,`${id} should render`);
      const gx=point.x-geometry.root.x,gy=point.y-geometry.root.y;
      const radius=Math.hypot(gx,gy),projection=gx*ux+gy*uy,perpendicular=gx*(-uy)+gy*ux;
      assert(radius>sceneRadius+12,`${id} should sit outside its scene radius`);
      assert(projection>sceneRadius+8,`${id} should fan outward beyond its scene instead of crossing the inner ring`);
      branchMetrics.push({id,radius,projection,perpendicular});
    }
    if(branch.groups.length===1){
      const only=branchMetrics[0];
      const angle=Math.atan2(Math.abs(only.perpendicular),only.projection);
      assert(angle<.16,`${sceneId} and its single group should stay near-collinear (angle ${angle})`);
    }
    metrics.push({sceneId,sceneRadius,groups:branchMetrics});
  }
  measurements.radial=metrics;
  checks.push('2D 径向布局中单分组沿主射线近共线，多分组只在对应场景外侧展开');
}

async function verifyVisualAnchors(page){
  const result=await page.evaluate(()=>{
    const canvas=document.querySelector('.at-canvas'),canvasRect=canvas.getBoundingClientRect();
    const visualCenter=key=>{
      const node=document.querySelector(`.at-node[data-key="${CSS.escape(key)}"]`);
      const visual=node?.querySelector('.at-orb,.at-logo,.at-bundle-mark,.at-add-mark');
      if(!node||!visual)return null;
      const rect=visual.getBoundingClientRect();
      return {kind:node.dataset.kind,x:rect.x+rect.width/2-canvasRect.x,y:rect.y+rect.height/2-canvasRect.y};
    };
    return [...canvas.querySelectorAll('.at-line')].map(path=>{
      const packet=path.nextElementSibling?.matches('.at-packet')?path.nextElementSibling:null;
      const from=path.dataset.from||packet?.dataset.from,to=path.dataset.to||packet?.dataset.to;
      if(!from||!to)return null;
      const start=visualCenter(from),end=visualCenter(to);
      if(!start||!end||![start.kind,end.kind].some(kind=>['space','scene','group'].includes(kind)))return null;
      const values=(path.getAttribute('d').match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
      return {from,to,startKind:start.kind,endKind:end.kind,startError:Math.hypot(values[0]-start.x,values[1]-start.y),endError:Math.hypot(values.at(-2)-end.x,values.at(-1)-end.y)};
    }).filter(Boolean);
  });
  assert(result.length>=8,'synthetic hierarchy should expose enough semantic relationship lines');
  const offCenter=result.filter(edge=>edge.startError>1||edge.endError>1);
  assert.deepEqual(offCenter,[],`space/scene/group relationship lines should use visual centers: ${JSON.stringify(offCenter.slice(0,4))}`);
  measurements.anchors=result;
  checks.push('空间、场景和分组的关系线均从视觉中心连接到视觉中心');
}

async function verifyAddTargetShapes(page){
  async function compare(targetKind){
    const shape=await page.evaluate(targetKind=>{
      const add=document.querySelector('.at-node[data-kind="add"][data-level="1"]');
      const peer=document.querySelector(`.at-node[data-kind="${targetKind}"][data-level="1"]`);
      const addMark=add?.querySelector('.at-add-mark'),peerMark=peer?.querySelector('.at-orb,.at-logo');
      if(!add||!peer||!addMark||!peerMark)return null;
      const rect=e=>{const r=e.getBoundingClientRect();return{width:r.width,height:r.height}};
      const radius=e=>getComputedStyle(e).borderRadius;
      return {node:{add:rect(add),peer:rect(peer)},mark:{add:rect(addMark),peer:rect(peerMark)},radius:{add:radius(addMark),peer:radius(peerMark)}};
    },targetKind);
    assert(shape,`add entry and a ${targetKind} peer should both render`);
    assert(near(shape.node.add.width,shape.node.peer.width,1)&&near(shape.node.add.height,shape.node.peer.height,1),`add entry should use the ${targetKind} node dimensions: ${JSON.stringify(shape.node)}`);
    assert(near(shape.mark.add.width,shape.mark.peer.width,1)&&near(shape.mark.add.height,shape.mark.peer.height,1),`add marker should use the ${targetKind} visual dimensions: ${JSON.stringify(shape.mark)}`);
    assert.equal(shape.radius.add,shape.radius.peer,`add marker should use the ${targetKind} corner shape`);
    return shape;
  }

  const shapes={scene:await compare('scene')};
  await page.locator('.at-node-main[data-at-focus="c:single-a"]').click();
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  shapes.group=await compare('group');
  await page.locator('.at-node-main[data-at-focus="g:single-a-g1"]').click();
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  shapes.link=await compare('link');
  measurements.addShapes=shapes;
  checks.push('新增入口在空间、场景、分组聚焦层级分别与场景、分组、网址节点同形');
}

(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});

  const {context,page}=await newPage({width:1288,height:1041});
  try{
    await verifyHomeAndSettings(page);
    await verifyModeCopy(page);
  }finally{
    await context.close();
  }

  for(const viewport of [{width:1288,height:1041},{width:600,height:900},{width:390,height:844}])await verifyChromeAt(viewport);
  checks.push('1288、600、390 三种视口中，两种模式双向切换的四个右侧入口连续 8 帧中心完全一致且关闭过程无空白帧');

  const synthetic=await newPage({width:1288,height:1041});
  try{
    await installSyntheticHierarchy(synthetic.page);
    await verifyRadialHierarchy(synthetic.page);
    await verifyVisualAnchors(synthetic.page);
    await synthetic.page.screenshot({path:path.join(shots,'v7-feedback-radial.png'),fullPage:false});
    await verifyAddTargetShapes(synthetic.page);
  }finally{
    await synthetic.context.close();
  }

  assert.deepEqual(errors,[],'browser page errors should remain empty');
  console.log(JSON.stringify({status:'PASS',checks,errors,measurements},null,2));
})().catch(error=>{
  console.error(error);
  process.exitCode=1;
}).finally(async()=>browser?.close());
