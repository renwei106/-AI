const http=require('node:http')

module.exports=function shiyuUserProxy(req,res){
  if(!req.url.startsWith('/api/shiyu/auth/'))return false
  const upstream=http.request({host:'127.0.0.1',port:5175,path:req.url,method:req.method,headers:{'content-type':req.headers['content-type']||'application/json'}},response=>{
    res.writeHead(response.statusCode||502,{'content-type':response.headers['content-type']||'application/json; charset=utf-8','cache-control':'no-store'})
    response.pipe(res)
  })
  upstream.on('error',()=>{res.writeHead(503,{'content-type':'application/json; charset=utf-8'});res.end(JSON.stringify({message:'登录服务暂时不可用'}))})
  req.pipe(upstream)
  return true
}
