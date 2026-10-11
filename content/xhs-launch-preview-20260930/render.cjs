const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const names = ['01-封面','02-收藏整理','03-个性首页','04-随手收藏','05-资源预告','06-会员活动','07-兴趣征集'];
(async()=>{
  fs.mkdirSync(path.join(__dirname,'export'),{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:540,height:720},deviceScaleFactor:2});
  await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const audit=await page.evaluate(()=>[...document.querySelectorAll('.slide')].map(s=>({id:s.id,text:s.innerText,brokenImages:[...s.querySelectorAll('img')].filter(i=>!i.naturalWidth).length,overflow:[...s.querySelectorAll('h1,h2,p,.row,.theme-grid,.theme-bottom,.plugin-body,.resource-list,.offer-strip,.member-card,.cta')].filter(e=>{const a=e.getBoundingClientRect(),b=s.getBoundingClientRect();return a.width&&(a.right>b.right||a.bottom>b.bottom-48||a.left<b.left);}).map(e=>e.textContent)})));
  if(audit.some(s=>s.brokenImages||s.overflow.length))throw new Error(JSON.stringify(audit));
  for(let i=0;i<names.length;i++){await page.locator(`#s${i+1}`).screenshot({path:path.join(__dirname,'export',names[i]+'.png')});console.log('exported',names[i]);}
  fs.writeFileSync(path.join(__dirname,'qa.json'),JSON.stringify(audit,null,2));
  await page.setViewportSize({width:1128,height:826});
  await page.setContent(`<html><head><meta charset="UTF-8"><style>*{box-sizing:border-box}body{margin:0;padding:20px;background:#dfe3d9;font:12px 'Microsoft YaHei';color:#284235}.grid{display:grid;grid-template-columns:repeat(4,260px);gap:18px 16px}.item img{width:260px;height:346.667px;display:block}.item p{margin:7px 0 0}.end{padding:35px 20px;display:flex;flex-direction:column;justify-content:center;height:347px;color:#375040}.end h1{font-size:28px;line-height:1.6}.end p{line-height:1.9}</style></head><body><div class="grid">${names.map(n=>`<div class="item"><img src="${pathToFileURL(path.join(__dirname,'export',n+'.png')).href}"><p>${n}</p></div>`).join('')}<div class="end"><h1>拾隅<br>上线预告</h1><p>1 张封面 + 6 张配图<br>1080 × 1440 px<br>真实界面 · 功能 · 亮点 · 活动</p></div></div></body></html>`);
  await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
  await page.screenshot({path:path.join(__dirname,'总览.png'),fullPage:true});
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
