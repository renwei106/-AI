module.exports=async function themeConfigProxy(req,res){
  const url=new URL(req.url,'http://127.0.0.1')
  if(!['/api/shiyu/themes','/api/shiyu/plans','/api/shiyu/plans/catalog','/api/shiyu/operations','/api/shiyu/member-visual','/api/shiyu/i18n/public'].includes(url.pathname)||req.method!=='GET')return false
  try{
    const upstream=new URL(url.pathname,process.env.SHIYU_ADMIN_ORIGIN||'http://127.0.0.1:5175')
    const response=await fetch(upstream,{headers:{accept:'application/json'},cache:'no-store'})
    const body=await response.text()
    res.writeHead(response.status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'})
    res.end(body)
  }catch{
    res.writeHead(502,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'})
    res.end(JSON.stringify({message:'拾隅配置服务暂不可用'}))
  }
  return true
}
