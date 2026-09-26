const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.MEMO_TEST_ORIGIN||'http://127.0.0.1:4330',artifacts='.local/paper-reference/qa';fs.mkdirSync(artifacts,{recursive:true});
const getNotes=p=>p.evaluate(()=>JSON.parse(JSON.stringify(prefs.cornerModules['editor-qa'].memo.notes)));
async function open(p){await p.frameLocator('#corner-orbit-preview').locator('#orbit').evaluate(el=>el._shiyuOpenOrbitModule(1));await p.waitForSelector('#my-corner[open][data-corner-module=memo]');await p.waitForFunction(()=>!document.querySelector('#my-corner').classList.contains('corner-reveal-opening'));await p.waitForFunction(()=>document.querySelector('canvas[data-paper-count]'));await p.waitForTimeout(800);}
async function setup(p,mode='light'){
  await p.route('**/api/shiyu/auth/**',r=>r.fulfill({status:r.request().url().includes('/wechat/')?200:503,json:{}}));
  await p.route('**/api/shiyu/operations',r=>r.fulfill({json:{corner:{modules:['common','memo','todo'].map(id=>({id,enabled:true}))}}}));
  await p.goto(base,{waitUntil:'domcontentloaded'});
  await p.evaluate(mode=>{signed=true;prefs.accountProfile={id:'editor-qa'};prefs.mode=mode;prefs.theme='base';prefs.brandGuideDismissed=true;localStorage.setItem('yiyu-prototype-v1',JSON.stringify({data,prefs,overrides,styles,signed}));persist();render()},mode);await open(p);
}
async function settled(p){await p.waitForTimeout(600);}
async function finish(p,selector='[data-memo-close]'){await p.locator(selector).click();await p.waitForFunction(()=>!document.querySelector('.memo-paper-editor'));}
async function checkChrome(p){
  for(const selector of ['.memo-paper-heading','.memo-view-tabs','.memo-paper-footer','.corner-close-entry','.corner-pull-cord'])assert(!(await p.locator('#my-corner '+selector).first().isVisible()),selector+' hidden while editing');
  assert.equal(await p.locator('.memo-paper-editor button').count(),1);assert.equal(await p.locator('[data-memo-title-count],[data-memo-done]').count(),0);
  assert.equal(await p.locator('.memo-paper-editor-meta button').count(),0);
  for(const selector of ['[data-memo-title]','[data-memo-content]']){
    await p.locator(selector).focus();const style=await p.locator(selector).evaluate(el=>{const s=getComputedStyle(el);return [s.borderTopWidth,s.outlineStyle,s.boxShadow]});assert.deepEqual(style,['0px','none','none']);assert.equal(await p.locator(selector).evaluate(el=>getComputedStyle(el,'::placeholder').opacity),'0');const caret=await p.locator(selector).evaluate(el=>({caret:getComputedStyle(el).caretColor,ink:getComputedStyle(el).color}));assert.equal(caret.caret,caret.ink);
  }
  assert.equal(await p.locator('.memo-paper-editor').evaluate(el=>getComputedStyle(el,'::after').borderTopStyle),'dashed');
  const allowed=await p.locator('.memo-paper-editor button,.memo-paper-editor input,.memo-paper-editor textarea').evaluateAll(els=>els.map(el=>el.outerHTML));
  for(let i=0;i<6;i++){await p.keyboard.press('Tab');assert(allowed.includes(await p.evaluate(()=>document.activeElement.outerHTML)));}
}
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
  const errors=[],p=await b.newPage({viewport:{width:1440,height:960}});p.on('pageerror',e=>errors.push(e.message));await setup(p);
  const original=await getNotes(p),id=original[1].id,card=p.locator('.memo-cover').filter({has:p.locator('[data-memo-card="'+id+'"]')});
  const from=await card.boundingBox(),rotation=await card.evaluate(el=>getComputedStyle(el).transform),active=await p.locator('.memo-paper-app').getAttribute('data-active-card');
  await card.locator('[data-memo-card]').click();
  const frames=await p.locator('.memo-paper-editor').evaluate(el=>el.getAnimations().flatMap(a=>a.effect.getKeyframes()));assert(frames.some(f=>f.transform?.includes('rotate(12')));
  await p.screenshot({path:artifacts+'/editor-expand-middle.png'});await settled(p);await checkChrome(p);
  await p.locator('[data-memo-title]').fill('标'.repeat(21));assert.equal(await p.locator('[data-memo-title]').inputValue(),'标'.repeat(20));
  await p.locator('[data-memo-content]').fill('文'.repeat(301));assert.equal(await p.locator('[data-memo-content]').inputValue(),'文'.repeat(300));
  // Inserting at the start of a full field must not eat existing trailing text.
  await p.locator('[data-memo-content]').press('Control+Home');await p.keyboard.insertText('新');assert.equal(await p.locator('[data-memo-content]').inputValue(),'文'.repeat(300));
  await p.locator('[data-memo-title]').fill('🙂'.repeat(21));assert.equal(await p.locator('[data-memo-title]').inputValue(),'🙂'.repeat(20));
  await p.locator('[data-memo-title]').fill('念'.repeat(19));await p.locator('[data-memo-title]').evaluate(el=>{el.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));el.value+='灵感';el.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true}));el.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}));});assert.equal(await p.locator('[data-memo-title]').inputValue(),'念'.repeat(19)+'灵');
  assert.deepEqual(await getNotes(p),original);
  await p.locator('.memo-paper-editor-top>span').click();assert.equal(await p.locator('.memo-paper-editor').evaluate(el=>getComputedStyle(el).outlineStyle),'none');await p.keyboard.press('Escape');assert(await p.locator('.memo-paper-editor').isVisible());await p.mouse.wheel(0,300);assert.equal(await p.locator('.memo-paper-app').getAttribute('data-active-card'),active);
  await p.screenshot({path:artifacts+'/editor-focus-light.png'});
  await p.evaluate(()=>{window.__returnFrames=[];const sample=()=>{const backdrop=document.querySelector('.memo-editor-backdrop'),editor=document.querySelector('.memo-paper-editor');window.__returnFrames.push({time:performance.now(),opacity:backdrop?Number(getComputedStyle(backdrop).opacity):0,editor:!!editor});if(editor)requestAnimationFrame(sample)};document.querySelector('.memo-editor-backdrop').addEventListener('click',()=>requestAnimationFrame(sample),{once:true});});
  await p.mouse.click(80,170);await p.waitForTimeout(120);await p.screenshot({path:artifacts+'/editor-contract-middle.png'});await p.waitForFunction(()=>!document.querySelector('.memo-paper-editor'));
  const samples=await p.evaluate(()=>__returnFrames);assert(samples.length>6);for(let i=1;i<samples.length;i++)assert(samples[i].opacity<=samples[i-1].opacity+.005,'backdrop never flashes back after fading');assert(samples.some(s=>s.editor&&s.opacity<.001));
  const to=await card.boundingBox();for(const key of ['x','y','width','height'])assert(Math.abs(from[key]-to[key])<1,key+' restored');assert.equal(await card.evaluate(el=>getComputedStyle(el).transform),rotation);assert.equal(await p.locator('.memo-paper-app').getAttribute('data-active-card'),active);
  let saved=(await getNotes(p)).find(n=>n.id===id);assert.equal(saved.title,'念'.repeat(19)+'灵');assert.equal(saved.content,'文'.repeat(300));
  await card.locator('[data-memo-card]').click();await settled(p);await p.locator('[data-memo-title]').fill('关闭也保留');await finish(p,'[data-memo-close]');assert.equal((await getNotes(p)).find(n=>n.id===id).title,'关闭也保留');assert(await p.locator('.corner-close-entry').isVisible());
  await p.locator('.corner-close-entry').click();await p.waitForFunction(()=>!document.querySelector('#my-corner').open);await p.reload({waitUntil:'domcontentloaded'});await p.evaluate(()=>{signed=true});await open(p);assert.equal((await getNotes(p)).find(n=>n.id===id).title,'关闭也保留');
  // Existing long content is never truncated simply by opening / closing it.
  await p.locator('.corner-close-entry').click();await p.waitForFunction(()=>!document.querySelector('#my-corner').open);
  await p.evaluate(()=>{const note=prefs.cornerModules['editor-qa'].memo.notes[0];note.title='旧'.repeat(25);note.content='正文'.repeat(200);persist()});await open(p);
  await p.locator('.is-active [data-memo-card]').click();await settled(p);assert.equal((await p.locator('[data-memo-content]').inputValue()).length,400);await finish(p,'[data-memo-close]');assert.equal((await getNotes(p))[0].content.length,400);
  await p.locator('.is-active [data-memo-card]').click();await settled(p);await p.locator('[data-memo-title]').fill('修改旧小记');await p.locator('[data-memo-close]').click();assert(await p.locator('[data-memo-limit-message]').isVisible());assert(await p.locator('.memo-paper-editor').isVisible());await p.locator('[data-memo-content]').fill('已精简');await finish(p);
  await p.locator('.is-active').hover();await p.locator('.is-active [data-memo-discard]').click();await p.waitForFunction(()=>!document.querySelector('.memo-paper-app.is-busy'));await p.locator('[data-memo-view=trash]').click();await p.waitForTimeout(900);await p.locator('.memo-paper-access button').evaluate(el=>el.click());await p.waitForSelector('.memo-paper-editor.is-preview');
  assert.equal(await p.locator(' .memo-paper-editor input,.memo-paper-editor textarea,[data-memo-done]').count(),0);assert.equal(await p.locator('.memo-paper-editor').evaluate(el=>getComputedStyle(el,'::after').borderTopStyle),'dashed');await p.screenshot({path:artifacts+'/preview-dashed-paper.png'});await p.locator('[data-memo-close]').click();await p.waitForFunction(()=>!document.querySelector('.memo-paper-editor'));await p.close();
  console.log('PASS borderless focus, dashed paper, angled source expansion / exact return, hidden controls / focus trap, blank overlay saves / Escape blocked, drafts, overlay and Close saving, reload, Chinese / emoji / paste / IME limits, old long notes preserved, trash remains preview only');
  for(const [name,options,mode]of [['dark',{viewport:{width:1440,height:960}},'dark'],['mobile',{viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'},'light']]){
    const page=await b.newPage(options);page.on('pageerror',e=>errors.push(e.message));await setup(page,mode);await page.locator('.is-active [data-memo-card]').click();await settled(page);await checkChrome(page);await page.locator('[data-memo-title]').fill('此刻的一点灵感');await page.locator('[data-memo-content]').fill('把想法留在纸上。\n'.repeat(40));const bounds=await page.locator('.memo-paper-editor').boundingBox();const view=page.viewportSize();assert(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=view.width&&bounds.y+bounds.height<=view.height);await page.screenshot({path:artifacts+'/editor-focus-'+name+'.png'});await finish(page);await page.close();
  }
  assert.deepEqual(errors,[]);console.log('PASS dark / mobile / reduced motion, contrasting caret / hidden focused placeholders, no page errors');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
