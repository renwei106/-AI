const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

const themes=[
  {id:'base',depth:'flat',object:'paper',cover:'paper',flip:'soft'},
  {id:'music',object:'record',cover:'sleeve',flip:'record'},
  {id:'cosmos',object:'orbit',cover:'constellation',flip:'orbit'}
];

(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1381,height:1041},reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4318/',{waitUntil:'domcontentloaded'});
  for(const theme of themes){
    await page.evaluate(theme=>{
      prefs.theme=theme.id;
      prefs.mode='light';
      prefs.cornerCollections={};
      render();
      signed=true;
      document.querySelector('.corner-entry').click();
    },theme);
    await page.waitForTimeout(180);
    const state=await page.locator('#my-corner').evaluate(el=>({
      theme:el.dataset.cornerTheme,
      depth:el.dataset.cornerDepth,
      object:el.dataset.cornerObject,
      art:!!el.querySelector('.corner-theme-art svg'),
      card:el.querySelector('.corner-card:not(.corner-inbox)')?.dataset
    }));
    assert.equal(state.theme,theme.id);
    assert.equal(state.depth,theme.depth||'depth');
    assert.equal(state.object,theme.object);
    assert.equal(state.art,true);
    assert(state.card);
    assert.equal(state.card.cornerObject,theme.object);
    assert.equal(state.card.cornerCover,theme.cover);
    assert.equal(state.card.cornerFlip,theme.flip);
    assert(await page.locator('.corner-card-front').count()>0);
    const center=page.locator('.corner-card.is-center:not(.corner-inbox):not(.corner-add-card)');
    if(await center.count()){
      await page.evaluate(()=>document.querySelector('.corner-card.is-center:not(.corner-inbox) .corner-card-cover').click());
      await page.waitForTimeout(180);
      assert(await center.evaluate(el=>el.classList.contains('is-flipped')&&el.classList.contains('is-settled')));
      await page.keyboard.press('Escape');
      await page.waitForTimeout(180);
      assert.equal(await center.locator('.corner-card-front').getAttribute('aria-hidden'),'false');
    }
    await page.evaluate(()=>document.querySelector('#my-corner')?.close());
    await page.waitForTimeout(80);
  }
  assert.deepEqual(errors,[]);
  await browser.close();
  console.log('PASS black vinyl and cosmic theme adapters, art hooks, card metadata, and no page errors');
})().catch(error=>{console.error(error);process.exitCode=1});

