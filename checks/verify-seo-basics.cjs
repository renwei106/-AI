const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {spawn,execFileSync}=require('node:child_process');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),ua='Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)';
const baseline=execFileSync('git',['show','4980b6cae4939e18743f7beed572e5aa297d9b6f:dist/official/v3/index.html'],{cwd:root,encoding:'utf8',windowsHide:true});
const current=fs.readFileSync(path.join(root,'dist/official/v3/index.html'),'utf8');
const body=s=>s.slice(s.indexOf('<body>')).replace(/\r\n/g,'\n');
const listen=(server,port)=>new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
const close=server=>new Promise(resolve=>server.close(resolve));
(async()=>{let child,browser;const config=http.createServer((req,res)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify({settings:{languages:[{code:'zh-CN',enabled:true,countries:['CN']}],fallback:'zh-CN'},world:{enabled:false},notices:{}}))});
const official=http.createServer(async(req,res)=>{try{if(req.url==='/api/shiyu/operations'){res.setHeader('Content-Type','application/json');res.end('{"world":{"enabled":false}}');return}const upstream=await fetch('http://127.0.0.1:4397/official/v3/'+(req.url==='/'?'':req.url.slice(1)),{redirect:'manual'});res.writeHead(upstream.status,Object.fromEntries(upstream.headers));res.end(Buffer.from(await upstream.arrayBuffer()))}catch(e){res.writeHead(502);res.end(e.message)}});
try{
await listen(config,4396);await listen(official,4399);
child=spawn(process.execPath,['preview.cjs'],{cwd:root,env:{...process.env,PORT:'4397',HOST:'127.0.0.1',SHIYU_ADMIN_ORIGIN:'http://127.0.0.1:4396'},stdio:['ignore','pipe','pipe']});
await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('exit',c=>reject(Error('Server exit '+c)));setTimeout(()=>reject(Error('Server startup timeout')),10000).unref()});
const get=(route,headers={})=>new Promise((resolve,reject)=>{const request=http.get({hostname:'127.0.0.1',port:4397,path:route,headers:{'user-agent':ua,...headers}},r=>{const chunks=[];r.on('data',v=>chunks.push(v));r.on('end',()=>resolve(new Response(Buffer.concat(chunks),{status:r.statusCode,headers:r.headers})))});request.on('error',reject);request.setTimeout(10000,()=>request.destroy(Error('Request timeout')))});
for(const route of ['/official/v2','/official/v2/','/official/v2/index.html','/official/v2/?source=baidu']){const r=await get(route);assert.equal(r.status,301);assert.equal(r.headers.get('location'),'https://www.shiyubox.com/'+(route.includes('?')?'?source=baidu':''))}
assert.equal((await get('/official/v2/official.js')).status,410);
for(const [route,headers,expected]of [['/',{host:'shiyubox.com'},true],['/index.html',{host:'shiyubox.com'},true],['/?page=membership',{host:'shiyubox.com'},false],['/',{host:'space.shiyubox.com'},false],['/',{host:'world.shiyubox.com'},false],['/',{},false],['/',{'x-shiyu-public-host':'shiyubox.com'},true],['/',{'x-shiyu-public-host':'space.shiyubox.com'},false]]){const r=await get(route,headers);assert.equal(r.status,200);const html=await r.text();assert.equal(html.includes('<link rel="canonical" href="https://shiyubox.com/">'),expected,JSON.stringify([route,headers]))}
// An externally supplied proxy header must not canonicalize a private entry host.
const {localized}=require('../i18n/frontend-server.cjs');process.env.SHIYU_ADMIN_ORIGIN='http://127.0.0.1:4396';let externalHtml='';
await localized({url:'/',headers:{host:'world.shiyubox.com','x-shiyu-public-host':'shiyubox.com'},socket:{remoteAddress:'203.0.113.9'}},{writeHead(){},end(v){externalHtml=v}},'index.html',path.join(root,'dist'));assert(!externalHtml.includes('rel="canonical"'));
for(const [url,domain]of [['http://127.0.0.1:4397','shiyubox.com'],['http://127.0.0.1:4399','www.shiyubox.com']]){const robots=await fetch(url+'/robots.txt');assert.equal(robots.status,200);assert.match(robots.headers.get('content-type'),/text\/plain/);assert((await robots.text()).includes('Sitemap: https://'+domain+'/sitemap.xml'));const sitemap=await fetch(url+'/sitemap.xml');assert.equal(sitemap.status,200);assert.match(sitemap.headers.get('content-type'),/xml/);const xml=await sitemap.text();assert.deepEqual([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]),['https://'+domain+'/']);assert(!xml.includes('/official/v2/'))}
assert.equal(body(current),body(baseline),'Visible official body must remain unchanged');
browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const page=await browser.newPage();const errors=[],bad=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push(r.url())});
await page.route('**/api/shiyu/operations',r=>r.fulfill({json:{world:{enabled:false}}}));
for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
 await page.setViewportSize(viewport);
 await page.route('**/index.html',r=>r.fulfill({contentType:'text/html',body:baseline}));
 await page.goto('http://127.0.0.1:4397/official/v3/index.html',{waitUntil:'networkidle'});
 await page.evaluate(()=>document.fonts.ready);
 const before=await page.screenshot({animations:'disabled'});
 await page.unroute('**/index.html');await page.reload({waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.title(),'拾隅官网｜个性化起始页，网址收藏与导航');
 assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://www.shiyubox.com/');
 assert((await page.locator('meta[name="description"]').getAttribute('content')).includes('一站式个性化网址收藏与导航'));
 const after=await page.screenshot({animations:'disabled'});
 fs.writeFileSync(path.join(root,'.local/seo-before-'+viewport.width+'.png'),before);
 fs.writeFileSync(path.join(root,'.local/seo-after-'+viewport.width+'.png'),after);
 assert(before.equals(after),'Viewport '+viewport.width+' must remain visually identical');
 await page.locator('[data-setup="desktop"]').first().click();assert(await page.locator('#install-app').isVisible());await page.keyboard.press('Escape');
}
assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);console.log('PASS permanent redirects, separated sitemaps/robots, public-host boundary, canonical, unchanged desktop/mobile screenshots and setup interaction');
}finally{if(browser)await browser.close();if(child)child.kill();await close(official);await close(config)}})().catch(e=>{console.error(e);process.exitCode=1});
