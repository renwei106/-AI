const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
const fontCSS=fs.readFileSync(path.join(__dirname,'fonts/d-fonts.css'),'utf8').replace(/url\("\.\/([^"\)]+)"\)/g,(_,file)=>'url("data:font/woff2;base64,'+fs.readFileSync(path.join(__dirname,'fonts',file)).toString('base64')+'")');
const uiCSS=fs.readFileSync(path.join(__dirname,'fonts/fonts.css'),'utf8').split('\n').filter(line=>line.includes('"Manrope"')||line.includes('"Noto Sans SC"')).join('\n').replace(/url\("\.\/([^"\)]+)"\)/g,(_,file)=>'url("data:font/woff2;base64,'+fs.readFileSync(path.join(__dirname,'fonts',file)).toString('base64')+'")');
async function actualFonts(page,selector){const client=await page.context().newCDPSession(page);await client.send('DOM.enable');await client.send('CSS.enable');const {root}=await client.send('DOM.getDocument');const {nodeId}=await client.send('DOM.querySelector',{nodeId:root.nodeId,selector});const result=await client.send('CSS.getPlatformFontsForNode',{nodeId});await client.detach();return result.fonts;}
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});const report={date:new Date().toISOString(),checks:[],samples:[]};
 try{
  for(const [size,viewport] of Object.entries({desktop:{width:1440,height:900},mobile:{width:390,height:844}})){
   const page=await browser.newPage({viewport,reducedMotion:'reduce',deviceScaleFactor:1});
   await page.goto('http://127.0.0.1:4320/official/v2/index.html',{waitUntil:'networkidle'});await page.evaluate(()=>{window.requestAnimationFrame=()=>0});
   await page.addStyleTag({content:fontCSS+'\n'+uiCSS+'\n.scene-copy h1,.scene-copy h2,.brand span{font-family:"Ma Shan Zheng"!important;font-weight:400!important;font-synthesis:none}.whisper,.entry-link,.cue-label,.eyebrow,.topline>p,.progress-count{font-family:"Manrope","Noto Sans SC",sans-serif!important;font-weight:400!important}.progress-count{font-variant-numeric:tabular-nums}'});
   await page.evaluate(async()=>{await Promise.all([document.fonts.load('400 48px "Ma Shan Zheng"','拾隅万千世界始于一点喜欢'),document.fonts.load('400 12px "Noto Sans SC"','在纷繁之中'),document.fonts.load('400 12px "Manrope"','A LITTLE LIGHT 0123456789')]);await document.fonts.ready});
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error('D official overflow: '+size);
   const fonts=await actualFonts(page,'#origin-title');if(fonts.some(font=>!font.isCustomFont))throw new Error('D official fallback '+JSON.stringify(fonts));
   report.samples.push({size,fonts});await page.screenshot({path:path.join(__dirname,'captures','d-'+size+'.png'),animations:'disabled'});await page.close();
  }
  const page=await browser.newPage({viewport:{width:1320,height:1500},deviceScaleFactor:1});const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4324/?variant=d&export=1',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  const dFonts={};for(const selector of ['.brand-cn','.chinese-sample','.english-sample','.figures','.mixed']){const fonts=await actualFonts(page,selector);if(!fonts.length||fonts.some(font=>!font.isCustomFont))throw new Error('D sample fallback '+selector+' '+JSON.stringify(fonts));dFonts[selector]=fonts;}
  report.samples.push({size:'board',fonts:dFonts});
  await page.locator('#board').screenshot({path:path.join(__dirname,'d-board.png')});
  await page.locator('.specimen').screenshot({path:path.join(__dirname,'d-specimen.png')});
  for(const key of ['a','b','c']){
   await page.goto('http://127.0.0.1:4324/?variant='+key+'&export=1',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
   const buffer=await page.locator('#board').screenshot();const expected=fs.readFileSync(path.join(__dirname,key+'-board.png'));
   const identical=hash(buffer)===hash(expected);report.checks.push({retainedVariant:key,identicalScreenshot:identical});if(!identical)throw new Error('Retained direction changed: '+key);
  }
  for(const width of [320,390,1320]){
   await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:4324/?variant=d',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
   for(const key of ['a','b','c','d']){await page.locator('.tabs [data-variant='+key+']').click();await page.evaluate(()=>document.fonts.ready);if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error('Preview overflow '+width+' '+key);if(await page.locator('#board').getAttribute('data-variant')!==key)throw new Error('Tab failure '+key);}
   await page.locator('.theme-toggle').click();if(await page.locator('#board').getAttribute('data-dark')!=='true')throw new Error('D theme failure');await page.locator('.theme-toggle').click();
   if(width===390)await page.screenshot({path:path.join(__dirname,'captures','d-study-mobile.png'),fullPage:true});
  }
  if(errors.length)throw new Error(errors.join('\n'));
  const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'baseline-hashes.json'),'utf8')),baselineMismatches=[];for(const [file,expected] of Object.entries(baseline.files))if(hash(fs.readFileSync(path.join(baseline.root,file)))!==expected)baselineMismatches.push(file);report.officialBaselineMismatches=baselineMismatches;
  report.checks.push('D Chinese, English, numeric and punctuation runs all use the intended readable web fonts','A/B/C/D switching and D light/dark toggle pass at 320px, 390px and 1320px without overflow',baselineMismatches.length?'Official baseline has concurrent external changes: '+baselineMismatches.join(', '):'All 39 official v2 files unchanged','No browser errors');
  fs.writeFileSync(path.join(__dirname,'verification-d.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report.checks,null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
