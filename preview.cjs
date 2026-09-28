const http=require('node:http'),fs=require('node:fs'),path=require('node:path')
const port=Number(process.env.PORT)||4318,host=process.env.HOST||'127.0.0.1',root=path.join(__dirname,'dist')
const shareHandler=require('./share-server.cjs'),themeConfigProxy=require('./theme-config-proxy.cjs'),extensionRoutes=require('./extension-routes.cjs'),shiyuUserProxy=require('./shiyu-user-proxy.cjs')
const feedbackHandler=require('./feedback-server.cjs')
const {localized}=require('./i18n/frontend-server.cjs')
let paymentHandler
async function handlePayment(req,res){
  if(!req.url.startsWith('/api/shiyu/payments/'))return false
  try{
    // Keep the existing preview available when payment credentials/runtime are not installed yet.
    paymentHandler ||= require('./payments/server.cjs').createPaymentHandler()
    return await paymentHandler(req,res)
  }catch{
    res.writeHead(503,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'})
    res.end(JSON.stringify({code:'PAYMENT_SETUP_REQUIRED',message:'支付服务尚未配置完成'}))
    return true
  }
}
const routes={
  '/analytics.js':'analytics.js',
  '/desktop-pet.js':'desktop-pet.js','/desktop-pet.css':'desktop-pet.css','/desktop-pet-host.js':'desktop-pet-host.js','/feature-config.js':'feature-config.js',
  '/assets/desktop-pet/paper-person.webp':'assets/desktop-pet/paper-person.webp',
  '/site-filing.js':'site-filing.js','/site-filing.css':'site-filing.css',
  '/i18n-client.js':'i18n-client.js','/i18n-client.css':'i18n-client.css',
  '/member-payment.js':'member-payment.js','/member-payment.css':'member-payment.css',
  '/world.css':'world.css','/world-config.js':'world-config.js','/world.js':'world.js',
  '/member-plan-config.js':'member-plan-config.js',
  '/member-entitlements.js':'member-entitlements.js','/member-invitations.js':'member-invitations.js',
  '/feedback.css':'feedback.css','/feedback.js':'feedback.js',
  '/memoir-theme.css':'memoir-theme.css','/memoir-theme.js':'memoir-theme.js',
  '/memo-paper.css':'memo-paper.css','/memo-paper.js':'memo-paper.js',
 '/corner.css':'corner.css','/corner.js':'corner.js','/earth-theme.css':'earth-theme.css','/earth-theme.js':'earth-theme.js','/earth-source.js':'earth-source.js',
  '/':'index.html','/index.html':'index.html','/style.css':'style.css','/app.js':'app.js','/v4.js':'v4.js','/v4.css':'v4.css','/account-access.js':'account-access.js',
  '/space-atlas.js':'space-atlas.js','/space-atlas.css':'space-atlas.css','/assets/reading/valley-closed.webp':'assets/reading/valley-closed.webp','/assets/reading/valley-open.webp':'assets/reading/valley-open.webp',
  '/surge-theme.css':'surge-theme.css','/surge-theme.js':'surge-theme.js','/flow-theme.css':'flow-theme.css','/flow-theme.js':'flow-theme.js','/reading-theme.css':'reading-theme.css','/reading-theme.js':'reading-theme.js',
  '/poly-theme.css':'poly-theme.css','/poly-theme.js':'poly-theme.js','/poly-engine.js':'poly-engine.js','/poly-worker.js':'poly-worker.js','/theme-availability.js':'theme-availability.js',
  '/assets/poly/delaunator.min.js':'assets/poly/delaunator.min.js','/poster-sea.png':'poster-sea.png','/poster-night.png':'poster-night.png','/poster-road.png':'poster-road.png'
}
http.createServer(async(req,res)=>{
  // Explicit, one-time local reset requested for the current preview browser.
  if(process.env.SHIYU_PREVIEW_REVIEW==='1'&&host==='127.0.0.1'&&req.url.startsWith('/__local-memo-reset/')){
    const requestFile=path.join(__dirname,'.local/memo-reset/request.json')
    const request=fs.existsSync(requestFile)?JSON.parse(fs.readFileSync(requestFile,'utf8')):null
    res.setHeader('Cache-Control','no-store')
    if(request&&req.method==='GET'&&req.url===request.route+'/status'){
      res.setHeader('Content-Type','application/json');res.end(JSON.stringify({done:request.done}));return
    }
    if(request&&req.method==='POST'&&req.url===request.route+'/complete'&&req.headers.origin===`http://${host}:${port}`){
      request.done=true;fs.writeFileSync(requestFile,JSON.stringify(request));res.end('OK');return
    }
    if(request&&req.method==='GET'&&req.url===request.route){
      res.setHeader('Content-Type','text/html; charset=utf-8');res.end(request.done?'本次初始化已完成，不会再次覆盖数据。':fs.readFileSync(path.join(__dirname,'.local/memo-reset/page.html')));return
    }
    res.writeHead(404);res.end('Not found');return
  }
  // Use the admin service's module availability in the local preview.
  if((process.env.SHIYU_PREVIEW_REVIEW==='1'||process.env.SHIYU_PREVIEW_MEMO==='1')&&host==='127.0.0.1'&&req.method==='GET'&&req.url.split('?')[0]==='/api/shiyu/operations'){
    try{
      const response=await fetch('http://127.0.0.1:5175/api/shiyu/operations',{headers:{cookie:req.headers.cookie||'',accept:'application/json',...(req.headers.origin?{origin:req.headers.origin}:{})},signal:AbortSignal.timeout(5000)})
      if(!response.ok)throw new Error('Operations unavailable')
      const config=await response.json()
      const allowedOrigin=['http://127.0.0.1:4173','http://localhost:4173'].includes(req.headers.origin)?req.headers.origin:''
      res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...(allowedOrigin?{'Access-Control-Allow-Origin':allowedOrigin,'Access-Control-Allow-Credentials':'true','Vary':'Origin'}:{})})
      res.end(JSON.stringify(config));return
    }catch{
      res.writeHead(503,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'})
      res.end(JSON.stringify({message:'本地预览配置暂不可用，请确认本地服务已启动'}));return
    }
  }
  if(await require('./theme-access/server.cjs').handler(req,res))return
  if(await handlePayment(req,res))return
  if(await feedbackHandler(req,res))return
  if(shiyuUserProxy(req,res))return
  if(/^\/extension\/(integration|store)\.js\?/.test(req.url)&&await localized(req,res,req.url.split('?')[0].slice(1),root))return
  if(extensionRoutes(req,res))return
  if(await themeConfigProxy(req,res))return
  if(await shareHandler(req,res))return
  const pathname=req.url.split('?')[0]
  const fontAsset=/^\/assets\/fonts\/shiyu-(?:youfeng|qingya-song|wenrun-kai)\/[A-Za-z0-9._-]+\.woff2$/i.test(pathname)?pathname.slice(1):''
  let file=routes[pathname]||fontAsset||(/^\/assets\/site-icons\/[a-z0-9._-]+\.(?:svg|ico|png|webp)$/i.test(pathname)?pathname.slice(1):'')
  if(/^\/assets\/toolbox\/(?:common|memo|todo|icons|emoji|cutout)\.svg$/.test(pathname))file=pathname.slice(1)
  if(/^\/assets\/memo-paper\/(?:engine\.js|carousel\.js|LICENSE|THIRD_PARTY_NOTICES\.txt|vat\/geo\/vertex_animation_textures1_mesh\.fbx|vat\/tex\/vertex_animation_textures1_pos\.exr)$/.test(pathname))file=pathname.slice(1)
  if(pathname==='/official/')file='official/index.html'
  else if(pathname==='/official/v2/'||pathname==='/official/v2')file='official/v2/index.html'
  else if(/^\/official\/(?!.*\.\.)[A-Za-z0-9._/-]+$/.test(pathname))file=pathname.slice(1)
  if(!file){res.writeHead(404);res.end('Not found');return}
  if(await localized(req,res,file,root))return
  const fullPath=path.join(root,file)
  if(!fullPath.startsWith(root+path.sep)||!fs.existsSync(fullPath)||!fs.statSync(fullPath).isFile()){res.writeHead(404);res.end('Not found');return}
  // The desktop preview serves files directly from dist while the app stays
  // open for long sessions. Never let a previous UI bundle survive a refresh.
  res.setHeader('Cache-Control','no-store, max-age=0')
  if(/\.(?:fbx|exr)$/.test(file)){res.setHeader('Content-Type','application/octet-stream');fs.createReadStream(fullPath).pipe(res);return}
  res.setHeader('Content-Type',file.endsWith('.svg')?'image/svg+xml':file.endsWith('.ico')?'image/x-icon':file.endsWith('.png')?'image/png':file.endsWith('.webp')?'image/webp':file.endsWith('.woff2')?'font/woff2':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8')
  const stream=fs.createReadStream(fullPath)
  stream.on('error',()=>{if(!res.headersSent)res.writeHead(404);res.end('Not found')})
  stream.pipe(res)
}).listen(port,host,()=>console.log(`Preview: http://${host}:${port}`))
