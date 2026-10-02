module.exports=async function avatarCatalogProxy(req,res){
  const pathname=(req.url||'').split('?')[0]
  if(pathname!=='/api/shiyu/avatars'&&!/^\/api\/shiyu\/avatar-assets\/[a-z0-9-]+\.png$/.test(pathname))return false
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return true}
  try{
    const response=await fetch(new URL(pathname,process.env.SHIYU_ADMIN_ORIGIN||'http://127.0.0.1:5175'),{method:req.method,headers:req.headers['if-none-match']?{'if-none-match':req.headers['if-none-match']}:{},signal:AbortSignal.timeout(12000)})
    const headers={'X-Content-Type-Options':'nosniff'}
    for(const name of ['content-type','cache-control','etag'])if(response.headers.get(name))headers[name]=response.headers.get(name)
    res.writeHead(response.status,headers);res.end(req.method==='HEAD'||response.status===304?undefined:Buffer.from(await response.arrayBuffer()))
  }catch{res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({message:'头像素材服务暂不可用'}))}
  return true
}
