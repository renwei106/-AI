const http=require('node:http'),fs=require('node:fs'),path=require('node:path')
const port=Number(process.env.PORT)||4318,host=process.env.HOST||'127.0.0.1',root=path.join(__dirname,'dist')
const shareHandler=require('./share-server.cjs'),themeConfigProxy=require('./theme-config-proxy.cjs'),extensionRoutes=require('./extension-routes.cjs')
const routes={
  '/':'index.html','/index.html':'index.html','/style.css':'style.css','/app.js':'app.js','/v4.js':'v4.js','/v4.css':'v4.css',
  '/space-atlas.js':'space-atlas.js','/space-atlas.css':'space-atlas.css','/assets/reading/valley-closed.webp':'assets/reading/valley-closed.webp','/assets/reading/valley-open.webp':'assets/reading/valley-open.webp',
  '/surge-theme.css':'surge-theme.css','/surge-theme.js':'surge-theme.js','/flow-theme.css':'flow-theme.css','/flow-theme.js':'flow-theme.js','/reading-theme.css':'reading-theme.css','/reading-theme.js':'reading-theme.js',
  '/poly-theme.css':'poly-theme.css','/poly-theme.js':'poly-theme.js','/poly-engine.js':'poly-engine.js','/poly-worker.js':'poly-worker.js','/theme-availability.js':'theme-availability.js',
  '/assets/poly/delaunator.min.js':'assets/poly/delaunator.min.js','/poster-sea.png':'poster-sea.png','/poster-night.png':'poster-night.png','/poster-road.png':'poster-road.png'
}
http.createServer(async(req,res)=>{
  if(extensionRoutes(req,res))return
  if(await themeConfigProxy(req,res))return
  if(await shareHandler(req,res))return
  const pathname=req.url.split('?')[0]
  const fontAsset=/^\/assets\/fonts\/shiyu-(?:youfeng|qingya-song|wenrun-kai)\/[A-Za-z0-9._-]+\.woff2$/i.test(pathname)?pathname.slice(1):''
  const file=routes[pathname]||fontAsset||(/^\/assets\/site-icons\/[a-z0-9._-]+\.(?:svg|ico|png|webp)$/i.test(pathname)?pathname.slice(1):'')
  if(!file){res.writeHead(404);res.end('Not found');return}
  res.setHeader('Content-Type',file.endsWith('.svg')?'image/svg+xml':file.endsWith('.ico')?'image/x-icon':file.endsWith('.png')?'image/png':file.endsWith('.webp')?'image/webp':file.endsWith('.woff2')?'font/woff2':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8')
  fs.createReadStream(path.join(root,file)).pipe(res)
}).listen(port,host,()=>console.log(`Preview: http://${host}:${port}`))
