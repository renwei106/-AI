/* Exercise actual tab clicks and compare the common dialog shell on every frame. */
const {fixture}=require('./verify-desktop-pet.cjs');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const f=await fixture(browser),p=f.page;fs.mkdirSync('checks/keyboard-shortcuts',{recursive:true});
 for(const viewport of [{width:1440,height:960},{width:390,height:844}]){
  await p.setViewportSize(viewport);
  for(const mode of ['light','dark']){
   await p.evaluate(mode=>{document.querySelector('#settings').close();prefs.mode=mode;render();settingsTab='desktop-pet';renderSettings();show('#settings');},mode);
   await p.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);});
   const frames=await p.evaluate(async()=>{
    const dialog=document.querySelector('#settings');
    const geometry=()=>{
     const rect=node=>{const r=node.getBoundingClientRect();return [r.x,r.y,r.width,r.height]};
     const backdrop=getComputedStyle(dialog,'::backdrop');
     return {dialog:rect(dialog),heading:rect(dialog.querySelector('.dialog-heading')),tabs:rect(dialog.querySelector('.settings-tabs')),buttons:[...dialog.querySelectorAll('[data-settings-tab]')].map(button=>[button.dataset.settingsTab,...rect(button)]),background:backdrop.backgroundColor,blur:backdrop.backdropFilter,bodyScroll:document.scrollingElement.scrollTop};
    };
    const initial=geometry(),samples=[];
    for(const tab of ['shortcuts','copy','shortcuts','layout','shortcuts','desktop-pet','shortcuts']){
     dialog.querySelector('[data-settings-tab="'+tab+'"]').click();samples.push({tab,geometry:geometry()});
     for(let frame=0;frame<3;frame++){await new Promise(requestAnimationFrame);samples.push({tab,geometry:geometry()});}
    }
    return {initial,samples};
   });
   for(const sample of frames.samples)assert.deepEqual(sample.geometry,frames.initial,`${viewport.width} ${mode} ${sample.tab} moved the shared shell`);
   await p.screenshot({path:`checks/keyboard-shortcuts/shared-shell-${viewport.width}-${mode}.png`});
   console.log(`PASS ${viewport.width} ${mode}: dialog, header, all tabs and backdrop stable across 28 frames`);
  }
 }
 assert.deepEqual(f.errors,[]);await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
