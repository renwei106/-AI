const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const BASE_URL=process.env.SHIYU_PREVIEW_URL||'http://127.0.0.1:4318/';
const OUTPUT_DIR=__dirname;
const errors=[];
const checks=[];
const report={modes:{},semanticIcons:null,brandImages:[]};
let browser;

const near=(value,target,tolerance=.08)=>Math.abs(value-target)<=tolerance;

async function afterPaint(page){
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}

async function openSyntheticAtlas(page){
  await page.evaluate(()=>{
    const item=(name,mark)=>[name,`https://example.com/${encodeURIComponent(name)}`,'清晰度测试',mark];
    const group=(id,name,items)=>({id,name,icon:'folder',items});
    data=[{
      id:'vector-space',name:'清晰图谱',icon:'work',scenes:[
        {id:'vector-scene-a',name:'日常收藏',icon:'home',description:'',groups:[
          group('vector-group-a1','常用入口',[item('文字标识网址','网'),item('矢量标识网址','icon:globe')]),
          group('vector-group-a2','阅读稍后',[item('阅读网址','阅')])
        ]},
        {id:'vector-scene-b',name:'工作资料',icon:'work',description:'',groups:[
          group('vector-group-b1','项目资料',[item('项目网址','项')])
        ]},
        {id:'vector-scene-c',name:'灵感收集',icon:'star',description:'',groups:[
          group('vector-group-c1','设计参考',[item('设计网址','设')]),
          group('vector-group-c2','文字参考',[item('文字网址','文')])
        ]}
      ]
    }];
    signed=true;spaceId='vector-space';sceneId='vector-scene-a';view='space';render();
  });
  await page.locator('.workspace .space-mode-entry').waitFor({state:'visible'});
  await page.locator('.workspace .space-mode-entry').click();
  await page.locator('[data-space-mode="atlas"]').click();
  await page.locator('#space-atlas[open].atlas-ready .at-canvas').waitFor({state:'visible'});
  await afterPaint(page);
}

async function selectMode(page,mode){
  const trigger=page.locator('[data-at="views"]');
  const picker=page.locator('#at-view-dialog');
  await trigger.hover();
  await picker.waitFor({state:'visible'});
  await picker.getByRole('tab',{name:mode==='3d'?'3D':'2D',exact:true}).click();
  await picker.locator(`[data-at-view="${mode==='3d'?'spatial':'radial'}"]`).click();
  await page.locator(`#space-atlas .at-full-page[data-mode="${mode}"]`).waitFor();
  await afterPaint(page);
}

async function setZoom(page,ratio){
  const mode=await page.locator('#space-atlas .at-full-page').getAttribute('data-mode');
  await selectMode(page,mode);
  await afterPaint(page);
  if(ratio!==1){
    await page.locator('.at-canvas').dispatchEvent('wheel',{
      deltaY:-Math.log(ratio)*1000,
      bubbles:true,
      cancelable:true
    });
    await afterPaint(page);
  }
  const actual=await page.locator('.at-node[data-level="0"]').evaluate(el=>Number(getComputedStyle(el).zoom));
  assert(near(actual,ratio,.001),`wheel should zoom the node to ${ratio*100}%`);
}

async function vectorSnapshot(page){
  return page.evaluate(()=>{
    const root=document.querySelector('.at-node[data-level="0"]');
    const text=root?.querySelector('.at-node-main>strong');
    const icon=root?.querySelector('.at-orb>svg,.at-logo>svg,.at-bundle-mark>svg,.at-add-mark>svg');
    const box=element=>{const rect=element.getBoundingClientRect();return{width:rect.width,height:rect.height}};
    const matrixScale=element=>{
      const transform=getComputedStyle(element).transform;
      if(transform==='none')return{x:1,y:1,transform};
      const matrix=new DOMMatrixReadOnly(transform);
      return{x:Math.hypot(matrix.a,matrix.b),y:Math.hypot(matrix.c,matrix.d),transform};
    };
    const scaleChain=[];
    for(let element=root;element&&element.matches('#space-atlas *');element=element.parentElement){
      const computed=getComputedStyle(element),matrix=matrixScale(element);
      scaleChain.push({
        node:element.className||element.tagName,
        inlineTransform:element.style.transform,
        cssScale:computed.scale,
        matrixX:matrix.x,
        matrixY:matrix.y,
        transform:matrix.transform,
        zoom:computed.zoom
      });
      if(element.classList.contains('at-canvas'))break;
    }
    return{
      root:box(root),
      text:box(text),
      icon:box(icon),
      nodeZoom:Number(getComputedStyle(root).zoom),
      textTag:text?.tagName,
      textIsNativeHtml:!!text&&!text.closest('svg,canvas,img'),
      iconTag:icon?.tagName,
      iconViewBox:icon?.getAttribute('viewBox'),
      scaleChain
    };
  });
}

function assertNoTransformScale(snapshot,label){
  assert.equal(snapshot.textTag,'STRONG',`${label}: node label must remain native HTML text`);
  assert.equal(snapshot.textIsNativeHtml,true,`${label}: node label must not be baked into an image, canvas or SVG outline`);
  assert.equal(snapshot.iconTag?.toLowerCase(),'svg',`${label}: semantic node icon must be SVG`);
  assert(snapshot.iconViewBox,`${label}: semantic node SVG must provide a viewBox`);
  for(const item of snapshot.scaleChain){
    assert(!/scale\s*\(/i.test(item.inlineTransform||''),`${label}: ${item.node} must not use transform:scale()`);
    assert(['none','1'].includes(item.cssScale),`${label}: ${item.node} must not use the independent CSS scale property (${item.cssScale})`);
    assert(near(item.matrixX,1,.002)&&near(item.matrixY,1,.002),`${label}: ${item.node} transform matrix must contain translation/rotation only (${item.transform})`);
  }
}

function assertRepaintedAtRatio(one,snapshot,ratio,label){
  assert(near(one.nodeZoom,1,.001),`${label}: 100% node should use layout zoom 1`);
  assert(near(snapshot.nodeZoom,ratio,.001),`${label}: ${ratio*100}% node should use layout zoom ${ratio}`);
  for(const part of ['root','text','icon']){
    const widthRatio=snapshot[part].width/one[part].width;
    const heightRatio=snapshot[part].height/one[part].height;
    assert(near(widthRatio,ratio),`${label}: ${part} width should be laid out again at ${ratio*100}% (${widthRatio})`);
    assert(near(heightRatio,ratio),`${label}: ${part} height should be laid out again at ${ratio*100}% (${heightRatio})`);
  }
}

async function verifyModeClarity(page,mode){
  await selectMode(page,mode);
  await setZoom(page,1);
  const one=await vectorSnapshot(page);
  assertNoTransformScale(one,`${mode} 100%`);
  await page.mouse.move(12,500);
  await page.screenshot({path:path.join(OUTPUT_DIR,`v9-vector-${mode}-100.png`),fullPage:false});

  await setZoom(page,2);
  const two=await vectorSnapshot(page);
  assertNoTransformScale(two,`${mode} 200%`);
  assertRepaintedAtRatio(one,two,2,mode);
  await page.mouse.move(12,500);
  await page.screenshot({path:path.join(OUTPUT_DIR,`v9-vector-${mode}-200.png`),fullPage:false});

  await setZoom(page,3);
  const three=await vectorSnapshot(page);
  assertNoTransformScale(three,`${mode} 300%`);
  assertRepaintedAtRatio(one,three,3,mode);
  await page.mouse.move(12,500);
  await page.screenshot({path:path.join(OUTPUT_DIR,`v9-vector-${mode}-300.png`),fullPage:false});

  report.modes[mode]={one,two,three};
  checks.push(`${mode.toUpperCase()} 节点在 100%/200%/300% 使用重新排版的 DOM 文字和 SVG，未使用 transform scale 放大缓存图层`);
}

async function verifySemanticIcons(page){
  await selectMode(page,'2d');
  await setZoom(page,1);

  const structural=await page.evaluate(()=>{
    const hosts=[...document.querySelectorAll('.at-node .at-orb,.at-node .at-bundle-mark,.at-node .at-add-mark,.at-node .at-node-menu,.at-summary,.at-controls button')];
    return hosts.map((host,index)=>({
      index,
      host:host.className||host.tagName,
      svgCount:host.querySelectorAll('svg[viewBox]').length,
      missingViewBox:[...host.querySelectorAll('svg')].filter(svg=>!svg.hasAttribute('viewBox')).length,
      bitmapCount:host.querySelectorAll('canvas,img,picture,video').length
    }));
  });
  assert(structural.length>8,'the graph should expose structural icon hosts');
  assert.deepEqual(structural.filter(icon=>icon.svgCount<1||icon.missingViewBox||icon.bitmapCount),[],`all structural graph icons should be viewBox SVG: ${JSON.stringify(structural)}`);

  await page.locator('.at-node-main[data-at-focus="c:vector-scene-a"]').click();
  await afterPaint(page);
  await page.locator('.at-node-main[data-at-focus="g:vector-group-a1"]').click();
  await afterPaint(page);
  const logos=await page.evaluate(()=>[...document.querySelectorAll('.at-node[data-kind="link"] .at-logo')].map((logo,index)=>({
    index,
    text:[...logo.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE).map(node=>node.textContent).join('').trim(),
    svg:logo.querySelectorAll(':scope>svg[viewBox]').length,
    img:logo.querySelectorAll(':scope>img.bookmark-logo-image').length,
    canvas:logo.querySelectorAll('canvas,picture,video').length,
    imageSources:[...logo.querySelectorAll(':scope>img.bookmark-logo-image')].map(img=>img.currentSrc||img.src)
  })));
  assert(logos.length>=2,'the focused test group should show its URL logos');
  assert.deepEqual(logos.filter(logo=>logo.text||logo.canvas||logo.svg+logo.img!==1),[],`URL logos must be SVG, except a real brand image may remain img: ${JSON.stringify(logos)}`);
  report.brandImages=logos.flatMap(logo=>logo.imageSources);
  report.semanticIcons={structural,logos};
  checks.push('空间、场景、分组、新增、管理及网址占位图标均为 SVG；真实网址品牌图片单独允许并记录');
}

(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1288,height:1041},deviceScaleFactor:1,reducedMotion:'reduce'});
  await context.addInitScript(()=>{
    localStorage.removeItem('yiyu-prototype-v1');
    localStorage.removeItem('shiyu-space-atlas-v1');
  });
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(BASE_URL,{waitUntil:'networkidle'});
  await openSyntheticAtlas(page);

  await verifyModeClarity(page,'2d');
  await verifyModeClarity(page,'3d');
  await verifySemanticIcons(page);

  assert.deepEqual(errors,[],'the clarity checks should not introduce browser errors');
  const output={status:'PASS',checks,errors,report};
  fs.writeFileSync(path.join(OUTPUT_DIR,'v9-vector-clarity-report.json'),JSON.stringify(output,null,2));
  console.log(JSON.stringify(output,null,2));
  await context.close();
})().catch(error=>{
  console.error(error);
  process.exitCode=1;
}).finally(async()=>browser?.close());
