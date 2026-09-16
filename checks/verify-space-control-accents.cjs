const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

const BASE_URL=process.env.SHIYU_PREVIEW_URL||'http://127.0.0.1:4318/';
const STATES=[
  {theme:'flow',mode:'light',color:'#a95e76'},
  {theme:'cosmos',mode:'dark',color:'#8b83d1'}
];
let browser;

async function sample(page,value){
  return page.evaluate(value=>{
    const node=document.createElement('i');
    node.style.cssText=`position:fixed;pointer-events:none;background:${value}`;
    document.body.append(node);
    const result=getComputedStyle(node).backgroundColor;
    node.remove();
    return result;
  },value);
}

async function background(locator){
  return locator.evaluate(node=>getComputedStyle(node).backgroundColor);
}

async function prepare(page,state){
  await page.evaluate(state=>{
    view='home';
    prefs.theme='base';
    prefs.mode='light';
    render();
    prefs.theme=state.theme;
    prefs.color=state.color;
    prefs.mode=state.mode;
    prefs.spaceThemePolicy='default';
    signed=true;
    const target=data.find(item=>item.id==='work')||data[0];
    if(target.scenes.length<2){
      target.scenes.push({id:crypto.randomUUID(),name:'第二个场景',description:'',icon:'folder',groups:[{id:crypto.randomUUID(),name:'分组',icon:'folder',items:[]}]});
    }
    const current=target.scenes[0];
    if(!current.groups.length)current.groups.push({id:crypto.randomUUID(),name:'分组',icon:'folder',items:[]});
    while(current.groups.length<14){
      current.groups.push({id:crypto.randomUUID(),name:`主题分组 ${current.groups.length+1}`,icon:'folder',items:[]});
    }
    spaceId=target.id;
    sceneId=current.id;
    activeGroups[current.id]=current.groups[0].id;
    persist();
    render();
    goSpace(target.id);
    sceneId=current.id;
    activeGroups[current.id]=current.groups[0].id;
    render();
  },state);
  await page.locator('.workspace .scene-button.active').waitFor();
  await page.waitForTimeout(120);
}

async function verifyState(page,state){
  await prepare(page,state);
  const label=`${state.theme}/${state.mode}`;
  const soft=await sample(page,'var(--space-accent-soft)');
  const hover=await sample(page,'var(--space-accent-hover)');
  const surface=await sample(page,'var(--surface)');
  const accent=await sample(page,'var(--accent)');
  if(state.mode==='dark'){
    assert.equal(await page.locator('body').evaluate(node=>node.style.getPropertyValue('--ink')),'',`${label}: base-light text color does not leak into dark mode`);
    assert.equal(await page.locator('body').evaluate(node=>node.style.getPropertyValue('--muted')),'',`${label}: base-light secondary text color does not leak into dark mode`);
  }

  const sceneManage=page.locator('.scene-actions [data-organize="scene"]');
  assert.match((await sceneManage.innerText()).trim(),/场景管理/,`${label}: the scene management label is explicit`);
  await sceneManage.hover();
  assert.equal(await background(sceneManage),hover,`${label}: scene management hover follows the theme`);

  const inactiveScene=page.locator('.sidebar .scene-button:not(.active)').first();
  await inactiveScene.hover();
  assert.equal(await background(inactiveScene),soft,`${label}: scene menu hover follows the theme`);

  const groupManage=page.locator('.group-tab-bar>[data-organize="group"]');
  await groupManage.hover();
  assert.equal(await background(groupManage),hover,`${label}: group management hover follows the theme`);

  const nextGroup=page.locator('.group-scroll-arrow:not([hidden]):not(:disabled)').last();
  await nextGroup.waitFor();
  await nextGroup.hover();
  assert.equal(await background(nextGroup),hover,`${label}: group navigation hover follows the theme`);

  const spaceSwitch=page.locator('.space-mode-entry');
  await spaceSwitch.hover();
  const currentMode=page.locator('#space-mode-menu>button[aria-pressed="true"]');
  await currentMode.waitFor();
  assert.equal(await background(currentMode),soft,`${label}: current space mode follows the theme`);
  const otherMode=page.locator('#space-mode-menu>button:not([aria-pressed="true"])').first();
  await otherMode.hover();
  assert.equal(await background(otherMode),hover,`${label}: space mode hover follows the theme`);
  await page.mouse.move(640,650);
  await page.waitForTimeout(300);

  const inbox=page.locator('.space-inbox-entry');
  assert.equal(await background(inbox),soft,`${label}: inbox starts with the theme tint`);
  assert.equal(await inbox.locator('strong').evaluate(node=>getComputedStyle(node).color),await sample(page,'var(--ink)'),`${label}: inbox title stays readable`);
  assert.notEqual(await inbox.locator('.space-inbox-drawer b').evaluate(node=>getComputedStyle(node).backgroundColor),surface,`${label}: inbox icon is distinct from its surface`);
  await inbox.hover();
  assert.equal(await background(inbox),hover,`${label}: inbox hover is visibly theme-tinted`);

  await sceneManage.click();
  const sceneDialog=page.locator('#organization[data-list-kind="scene"]');
  await sceneDialog.waitFor();
  const sceneRow=sceneDialog.locator('.organization-list>[data-organization-id]').first();
  await sceneRow.hover();
  assert.equal(await background(sceneRow),hover,`${label}: scene management rows follow the theme on hover`);
  const sceneIcon=sceneRow.locator('.entity-icon-button');
  await sceneIcon.hover();
  assert.equal(await background(sceneIcon),soft,`${label}: scene management icon hover follows the theme`);
  await sceneDialog.locator('.dialog-heading [data-action="close"]').click();

  await groupManage.click();
  const groupDialog=page.locator('#organization[data-list-kind="group"]');
  await groupDialog.waitFor();
  const groupRow=groupDialog.locator('.organization-list>[data-organization-id]').first();
  await groupRow.hover();
  assert.equal(await background(groupRow),hover,`${label}: group management rows follow the theme on hover`);
  await groupDialog.locator('.dialog-heading [data-action="close"]').click();

  await page.evaluate(()=>{currentGroup().items=[];persist();render()});
  const emptyAdd=page.locator('.empty-bookmarks .empty-create[data-action="add"]');
  await emptyAdd.waitFor();
  assert.equal(await background(emptyAdd),soft,`${label}: empty add-URL button follows the theme`);
  assert.equal(await emptyAdd.evaluate(node=>getComputedStyle(node).color),await sample(page,'var(--ink)'),`${label}: empty add-URL label stays readable`);
  assert.equal(await emptyAdd.locator(':scope>span').evaluate(node=>getComputedStyle(node).color),accent,`${label}: empty add-URL symbol uses the accent`);
  await emptyAdd.hover();
  assert.equal(await background(emptyAdd),hover,`${label}: empty add-URL hover follows the theme`);
}

(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1288,height:1041},reducedMotion:'reduce'});
  await context.addInitScript(()=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'base',mode:'light',homeEntryGesture:'single',spaceThemePolicy:'default'},signed:true})));
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(BASE_URL,{waitUntil:'networkidle'});
  for(const state of STATES)await verifyState(page,state);
  assert.deepEqual(errors,[],'no runtime errors');
  await context.close();
  console.log('PASS: requested space controls and management hovers follow the theme in light and dark modes.');
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
