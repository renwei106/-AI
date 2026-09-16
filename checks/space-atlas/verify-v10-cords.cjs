const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const fixture=require('./baseline.json');
const report=[],errors=[];
const wait=page=>page.waitForTimeout(350);
async function snapshot(page){return page.evaluate(()=>{
  const header=document.querySelector('#space-atlas[open] .at-header-actions')||document.querySelector('.workspace .space-top-actions')||document.querySelector('header .header-right');
  const h=header?.getBoundingClientRect();
  return [...document.querySelectorAll('.mode-pull-cord,.color-pull-cord')].map(e=>{
    const s=getComputedStyle(e),r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.bottom-10);
    return {name:e.className,display:s.display,visibility:s.visibility,opacity:Number(s.opacity),hit:hit===e||e.contains(hit),clear:!h||Math.min(h.right,r.right)<=Math.max(h.left,r.left)||Math.min(h.bottom,r.bottom)<=Math.max(h.top,r.top)};
  });
})}
async function visible(page,label){
  await page.mouse.move(15,450);await wait(page);
  const s=await snapshot(page);assert.equal(s.length,2,label);
  for(const c of s){assert.notEqual(c.display,'none',label+': '+c.name);assert.equal(c.visibility,'visible',label+': '+c.name);assert(c.opacity>=.25&&c.opacity<.5,label+': subdued '+c.name);assert(c.hit,label+': hit area '+c.name);assert(c.clear,label+': header clearance '+c.name)}
  report.push({label,cords:s});
}
async function hidden(page,label){await wait(page);for(const c of await snapshot(page)){assert.equal(c.visibility,'hidden',label+': '+c.name);assert.equal(c.hit,false,label+': no click through '+c.name)}report.push({label,hidden:true})}
async function chromePositions(page){return page.evaluate(()=>{
  const toolbar=document.querySelector('#space-atlas[open] .at-header-actions')||document.querySelector('.workspace .space-top-actions');
  return [...toolbar.children].map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}});
})}
async function changeMode(page,id){const before=await chromePositions(page);await page.locator(id==='atlas'?'.workspace .space-mode-entry':'#space-atlas .space-mode-entry').click();await page.locator('[data-space-mode="'+id+'"]').click();await wait(page);const after=await chromePositions(page);assert.equal(after.length,before.length);after.forEach((r,i)=>{for(const axis of ['x','y','width','height'])assert(Math.abs(r[axis]-before[i][axis])<1,'fixed toolbar '+id+' '+i+' '+axis+' before='+JSON.stringify(before)+' after='+JSON.stringify(after))})}
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const context=await browser.newContext({viewport:{width:1288,height:1041}});
    await context.addInitScript(value=>{localStorage.setItem('yiyu-prototype-v1',JSON.stringify({...value,signed:true}));localStorage.removeItem('shiyu-space-atlas-v1')},fixture);
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4318/');
    await page.evaluate(()=>{prefs.width='wide';goSpace(data[0].id)});await wait(page);
    for(const dark of [false,true]){
      await page.evaluate(value=>{prefs.mode=value?'dark':'light';apply()},dark);await visible(page,(dark?'dark':'light')+' daily');
      await changeMode(page,'atlas');await visible(page,(dark?'dark':'light')+' atlas');
      await page.locator('.mode-pull-cord').hover();await wait(page);assert((await snapshot(page))[0].opacity>.95);await page.mouse.move(15,450);
      await page.locator('.color-pull-cord').hover();await wait(page);assert((await snapshot(page))[1].opacity>.95);await page.mouse.move(15,450);
      await page.screenshot({path:'checks/space-atlas/v10-cords-'+(dark?'dark':'light')+'.png'});
      await page.locator('[data-at=views]').click();await visible(page,'view menu keeps cords');await page.locator('[data-at-view=solar]').click();await visible(page,'solar keeps cords');
      await page.locator('#space-atlas .space-mode-entry').click();await visible(page,'space menu keeps cords');await page.mouse.click(350,250);
      await page.locator('[data-at-header=share]').click();await hidden(page,'share dialog');await page.locator('#space-share-dialog').evaluate(e=>e.close());await visible(page,'share dialog closes');
      await page.locator('.at-node[data-level="0"]').hover();await page.locator('.at-node[data-level="0"] [data-at-details]').click();await hidden(page,'graph drawer');
      await changeMode(page,'daily');await visible(page,'closed graph with stale drawer');
      await page.evaluate(()=>{scope='global';settingsTab='colors';renderSettings();show('#settings')});await hidden(page,'global settings');await page.locator('#settings').evaluate(e=>e.close());await visible(page,'global settings closes');
    }
    for(const width of [390,1288,2560]){await page.setViewportSize({width,height:1041});await visible(page,'daily width '+width);await changeMode(page,'atlas');await visible(page,'atlas width '+width);await changeMode(page,'daily')}
    await page.mouse.move(15,450);await page.evaluate(()=>document.body.classList.add('is-fullscreen'));await wait(page);for(const c of await snapshot(page))assert.equal(c.opacity,.08,'fullscreen remains faint');await page.locator('.mode-pull-cord').hover();await wait(page);assert((await snapshot(page))[0].opacity>.95);await page.locator('.color-pull-cord').hover();await wait(page);assert((await snapshot(page))[1].opacity>.95);await page.evaluate(()=>document.body.classList.remove('is-fullscreen'));await visible(page,'fullscreen exit restores space opacity');
    const modeBefore=await page.evaluate(()=>prefs.mode);await page.locator('.mode-pull-cord').click();await page.waitForTimeout(600);assert.notEqual(await page.evaluate(()=>prefs.mode),modeBefore);const colorBefore=await page.evaluate(()=>prefs.color);await page.locator('.color-pull-cord').click();await page.waitForTimeout(600);assert.notEqual(await page.evaluate(()=>prefs.color),colorBefore);report.push({label:'Both cords keep their switching behavior',passed:true});
    assert.deepEqual(errors,[]);fs.writeFileSync('checks/space-atlas/v10-cords-report.json',JSON.stringify({report,errors},null,2));console.log(JSON.stringify({checks:report.length,report:report.map(r=>r.label),errors},null,2));
    await context.close();
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
