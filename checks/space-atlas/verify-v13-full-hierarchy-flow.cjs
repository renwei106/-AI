const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

const BASE_URL=process.env.SHIYU_PREVIEW_URL||'http://127.0.0.1:4318/';
const SPACE_ID='v13-flow-space';
const SCENE_ID='v13-flow-scene';
const GROUP_ID='v13-flow-group';
const errors=[];
let browser;

const fixture=[{
  id:SPACE_ID,name:'完整流向测试空间',icon:'space',scenes:[{
    id:SCENE_ID,name:'完整流向场景',icon:'work',description:'',groups:[{
      id:GROUP_ID,name:'完整流向分组',icon:'folder',items:[
        ['第一个网址','https://example.com/flow/1','测试','icon:globe'],
        ['第二个网址','https://example.com/flow/2','测试','icon:globe'],
        ['第三个网址','https://example.com/flow/3','测试','icon:globe']
      ]
    },{
      id:'v13-flow-sibling',name:'平级分组',icon:'folder',items:[['平级网址','https://example.com/sibling','测试','icon:globe']]
    }]
  },{
    id:'v13-scene-sibling',name:'平级场景',icon:'home',description:'',groups:[]
  }]
}];

async function clickNode(page,key){
  await page.locator(`.at-node[data-key="${key}"] .at-node-main`).click();
  await page.locator('.at-canvas').waitFor({state:'visible'});
  await page.waitForTimeout(120);
}

(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1041},reducedMotion:'no-preference'});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(BASE_URL,{waitUntil:'networkidle'});
  await page.evaluate(({fixture,spaceId})=>{
    data=fixture;signed=true;prefs={...prefs,homeEntryGesture:'single',spaceThemePolicy:'last',membership:{expiresAt:Date.now()+86400000}};
    localStorage.setItem('shiyu-space-atlas-v1',JSON.stringify({[spaceId]:{mode:'2d',layout:'radial'}}));
    persist();goSpace(spaceId);
  },{fixture,spaceId:SPACE_ID});
  await page.locator('.workspace .space-mode-entry').click();
  await page.locator('#space-mode-menu [data-space-mode="atlas"]').click();
  await page.locator('#space-atlas[open].atlas-ready .at-canvas').waitFor({state:'visible'});
  await page.locator(`.at-node[data-key="c:${SCENE_ID}"]`).hover();
  assert(await page.locator(`.at-node[data-key="g:${GROUP_ID}"]`).evaluate(el=>el.classList.contains('is-related')),'hover keeps the hovered scene descendants visible');
  assert(await page.locator('.at-node[data-key="c:v13-scene-sibling"]').evaluate(el=>el.classList.contains('is-muted')),'unrelated scene branch is weakened');
  await clickNode(page,`c:${SCENE_ID}`);
  await clickNode(page,`g:${GROUP_ID}`);

  const current=page.locator(`.at-node[data-key="g:${GROUP_ID}"]`);
  await current.hover();
  const relation=await page.evaluate(()=>({
    relatedNodes:[...document.querySelectorAll('.at-node.is-related')].map(el=>el.dataset.key),
    mutedNodes:[...document.querySelectorAll('.at-node.is-muted')].map(el=>el.dataset.key),
    relatedEdges:[...document.querySelectorAll('.at-line.is-related')].map(el=>`${el.dataset.from}>${el.dataset.to}`),
    upstreamEdges:[...document.querySelectorAll('.at-line.is-related.is-upstream')].map(el=>`${el.dataset.from}>${el.dataset.to}`)
  }));
  assert(relation.relatedNodes.includes(`s:${SPACE_ID}`),'highest visible ancestor remains in the active chain');
  assert(relation.relatedNodes.includes(`c:${SCENE_ID}`),'intermediate ancestor remains in the active chain');
  assert(relation.relatedNodes.includes(`g:${GROUP_ID}`),'hovered node remains active');
  assert(relation.relatedNodes.includes(`u:${GROUP_ID}:0`),'visible descendants remain in the active chain');
  assert.deepEqual(relation.upstreamEdges.sort(),[`s:${SPACE_ID}>c:${SCENE_ID}`,`c:${SCENE_ID}>g:${GROUP_ID}`].sort());
  assert(relation.relatedEdges.includes(`g:${GROUP_ID}>u:${GROUP_ID}:0`),'flow continues from current node to its visible descendants');

  const firstSeen=new Map(),samples=[];
  const started=Date.now();
  while(Date.now()-started<2700){
    const active=await page.locator('.at-packet').evaluateAll(elements=>elements.filter(el=>el.dataset.phase!=='idle'&&Number(getComputedStyle(el).opacity)>0).map(el=>({edge:`${el.dataset.from}>${el.dataset.to}`,phase:el.dataset.phase})));
    const elapsed=Date.now()-started;
    for(const item of active)if(!firstSeen.has(item.edge))firstSeen.set(item.edge,{time:elapsed,phase:item.phase});
    samples.push({elapsed,active});
    await page.waitForTimeout(24);
  }
  const source=`s:${SPACE_ID}>c:${SCENE_ID}`,middle=`c:${SCENE_ID}>g:${GROUP_ID}`,child=`g:${GROUP_ID}>u:${GROUP_ID}:0`;
  assert(firstSeen.has(source)&&firstSeen.has(middle)&&firstSeen.has(child),'every visible hierarchy segment receives the travelling point');
  assert(firstSeen.get(source).time<firstSeen.get(middle).time,'flow reaches level two after leaving the source');
  assert(firstSeen.get(middle).time<firstSeen.get(child).time,'flow reaches descendants only after arriving at the current node');
  assert.equal(firstSeen.get(source).phase,'incoming');
  assert.equal(firstSeen.get(middle).phase,'incoming');
  assert.equal(firstSeen.get(child).phase,'outgoing');
  const childStarts=[...firstSeen].filter(([edge])=>edge.startsWith(`g:${GROUP_ID}>`)).map(([,value])=>value.time);
  assert(Math.max(...childStarts)-Math.min(...childStarts)<90,'all direct child branches leave the current node together');

  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'PASS',checks:[
    '悬停当前节点时保留完整祖先链与全部可见后代链，并弱化无关分支',
    '光点从最高可见上级逐级流到当前节点，再同时扩散到各直接下级',
    '上游链保持虚线，下游链保持实线'
  ],timing:Object.fromEntries(firstSeen),relation},null,2));
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
