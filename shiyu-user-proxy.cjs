const http=require('node:http')
// The generated policy is already in every website dist archive; its canonical
// source remains deploy/environment-contract.json, checked by the release gate.
const {environmentContract:contract}=require('./dist/environment-policy-data.js')

function resolveDefaultEnvironment(environment=process.env){
 const modes=['development','test','production']
 if(environment.SHIYU_ENV!==undefined&&!modes.includes(environment.SHIYU_ENV)||environment.NODE_ENV!==undefined&&!modes.includes(environment.NODE_ENV))throw Error('Unknown account proxy environment')
 if(environment.SHIYU_ENV&&environment.NODE_ENV&&environment.SHIYU_ENV!==environment.NODE_ENV)throw Error('Account proxy SHIYU_ENV conflicts with NODE_ENV')
 return environment.SHIYU_ENV||environment.NODE_ENV||'development'
}
function canonicalUpstream(value){
  let target;try{target=new URL(value)}catch{throw Error('Invalid account proxy upstream')}
  if(target.protocol!=='http:'||!['127.0.0.1','localhost','[::1]'].includes(target.hostname)||target.origin!==value||target.username||target.password||target.search||target.hash)throw Error('Account proxy requires a canonical loopback HTTP upstream')
  return target
}
function createShiyuUserProxy(options={}){
 const environment=options.environment===undefined?resolveDefaultEnvironment():options.environment
 if(!Object.hasOwn(contract.profiles,environment))throw Error('Invalid account proxy environment')
 let target
 if(environment==='test'){
  if(!options.upstreamOrigin||!Array.isArray(options.allowedUpstreamOrigins)||!options.allowedUpstreamOrigins.length)throw Error('Test account proxy requires explicit fixture upstream origins')
  for(const origin of options.allowedUpstreamOrigins)canonicalUpstream(origin)
  target=canonicalUpstream(options.upstreamOrigin)
  if(!options.allowedUpstreamOrigins.includes(target.origin))throw Error('Account proxy upstream is outside the explicit fixture')
 }else{
  if(options.allowedUpstreamOrigins)throw Error('Only explicit test fixtures may register proxy upstreams')
  const registered=contract.profiles[environment].internalServices.admin
  target=canonicalUpstream(options.upstreamOrigin||process.env.SHIYU_ADMIN_ORIGIN||registered.origin)
  if(!registered.enabled||target.origin!==registered.origin)throw Error('Account proxy upstream is not registered in this environment')
 }
 return function shiyuUserProxy(req,res){
  const pathname=(req.url||'/').split('?')[0]
  if(!pathname.startsWith('/api/shiyu/auth/')&&pathname!=='/api/shiyu/login-methods'&&pathname!=='/api/shiyu/operations')return false
  const profileRequest=pathname.startsWith('/api/shiyu/auth/wechat/profile')
  // Forward the browser's evidence unchanged. An internal Host is transport
  // routing, and must never become a replacement browser Origin.
  const browserHeaders=Object.fromEntries(['origin','sec-fetch-site','referer'].filter(name=>req.headers[name]!==undefined).map(name=>[name,req.headers[name]]))
  const upstream=http.request({host:target.hostname==='[::1]'?'::1':target.hostname,port:target.port||80,path:req.url,method:req.method,headers:{cookie:req.headers.cookie||'','content-type':req.headers['content-type']||'application/json',...browserHeaders}},response=>{
    if(response.headers['set-cookie'])res.setHeader('set-cookie',response.headers['set-cookie'])
    res.writeHead(response.statusCode||502,{'content-type':response.headers['content-type']||'application/json; charset=utf-8','cache-control':'no-store',...(profileRequest?Object.fromEntries(['location','referrer-policy','content-security-policy','x-content-type-options'].filter(key=>response.headers[key]).map(key=>[key,response.headers[key]])):{}),...(response.headers['access-control-allow-origin']?{'access-control-allow-origin':response.headers['access-control-allow-origin'],...(response.headers['access-control-allow-credentials']?{'access-control-allow-credentials':response.headers['access-control-allow-credentials']}:{}),'vary':'Origin'}:{})})
    response.pipe(res)
  })
  upstream.on('error',()=>{res.writeHead(503,{'content-type':'application/json; charset=utf-8'});res.end(JSON.stringify({message:'登录服务暂时不可用'}))})
  req.pipe(upstream)
  return true
 }
}
// A test flag alone never enables a random upstream for the running website.
const selected=resolveDefaultEnvironment()
const defaultProxy=selected==='test'?null:createShiyuUserProxy({environment:selected})
module.exports=function(req,res){if(!defaultProxy)throw Error('Use an explicit test account proxy factory');return defaultProxy(req,res)}
module.exports.createShiyuUserProxy=createShiyuUserProxy
module.exports.resolveDefaultEnvironment=resolveDefaultEnvironment
