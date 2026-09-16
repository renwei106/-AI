module.exports=async function themeConfigProxy(req,res){
  const url=new URL(req.url,'http://127.0.0.1')
  if(url.pathname!=='/api/shiyu/themes'||req.method!=='GET')return false
  try{
    const upstream=new URL('/api/shiyu/themes',process.env.SHIYU_ADMIN_ORIGIN||'http://127.0.0.1:5175')
    const response=await fetch(upstream,{headers:{accept:'application/json'},cache:'no-store'})
    const body=await response.text()
    res.writeHead(response.status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'})
    res.end(body)
  }catch{
    res.writeHead(502,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'})
    res.end(JSON.stringify({message:'主题配置服务暂不可用'}))
  }
  return true
}
