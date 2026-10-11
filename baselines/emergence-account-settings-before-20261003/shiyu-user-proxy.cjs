const http=require('node:http')

module.exports=function shiyuUserProxy(req,res){
  const pathname=(req.url||'/').split('?')[0]
  if(!pathname.startsWith('/api/shiyu/auth/')&&pathname!=='/api/shiyu/login-methods'&&pathname!=='/api/shiyu/operations')return false
  const target=new URL(process.env.SHIYU_ADMIN_ORIGIN||'http://127.0.0.1:5175')
  const upstream=http.request({host:target.hostname,port:target.port||80,path:req.url,method:req.method,headers:{cookie:req.headers.cookie||'','content-type':req.headers['content-type']||'application/json',...((pathname==='/api/shiyu/operations'||pathname==='/api/shiyu/auth/analytics'||pathname==='/api/shiyu/auth/avatar')&&req.headers.origin?{origin:req.headers.origin}:{})}},response=>{
    if(response.headers['set-cookie'])res.setHeader('set-cookie',response.headers['set-cookie'])
    res.writeHead(response.statusCode||502,{'content-type':response.headers['content-type']||'application/json; charset=utf-8','cache-control':'no-store',...(response.headers['access-control-allow-origin']?{'access-control-allow-origin':response.headers['access-control-allow-origin'],...(response.headers['access-control-allow-credentials']?{'access-control-allow-credentials':response.headers['access-control-allow-credentials']}:{}),'vary':'Origin'}:{})})
    response.pipe(res)
  })
  upstream.on('error',()=>{res.writeHead(503,{'content-type':'application/json; charset=utf-8'});res.end(JSON.stringify({message:'登录服务暂时不可用'}))})
  req.pipe(upstream)
  return true
}
