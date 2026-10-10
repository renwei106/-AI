const {test}=require('node:test'),assert=require('node:assert/strict'),http=require('node:http');
const proxy=require('../shiyu-user-proxy.cjs');
test('website proxy forwards OAuth redirect and Origin protection headers',async()=>{
 const upstream=http.createServer((req,res)=>{if(req.url.includes('profile-start')){res.writeHead(302,{Location:'https://open.weixin.qq.com/connect/oauth2/authorize?state=test','Referrer-Policy':'no-referrer'});res.end();}else{res.setHeader('Content-Type','application/json');res.end(JSON.stringify({origin:req.headers.origin||null}));}});
 const website=http.createServer((req,res)=>{if(!proxy(req,res)){res.statusCode=404;res.end();}});
 const listen=server=>new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const previous=process.env.SHIYU_ADMIN_ORIGIN;
 try{
  await listen(upstream);process.env.SHIYU_ADMIN_ORIGIN='http://127.0.0.1:'+upstream.address().port;await listen(website);
  const base='http://127.0.0.1:'+website.address().port;
  const r=await fetch(base+'/api/shiyu/auth/wechat/profile-start?ticket=test',{redirect:'manual'});assert.equal(r.status,302);assert.match(r.headers.get('location'),/^https:\/\/open.weixin.qq.com\//);assert.equal(r.headers.get('referrer-policy'),'no-referrer');
  const p=await fetch(base+'/api/shiyu/auth/wechat/profile',{method:'PUT',headers:{Origin:'https://shiyubox.com','Content-Type':'application/json'},body:'{}'});assert.equal((await p.json()).origin,'https://shiyubox.com');
  const ordinary=await fetch(base+'/api/shiyu/auth/session',{headers:{Origin:'https://unrelated.test'}});assert.equal((await ordinary.json()).origin,null);
 }finally{if(previous===undefined)delete process.env.SHIYU_ADMIN_ORIGIN;else process.env.SHIYU_ADMIN_ORIGIN=previous;await Promise.all([new Promise(r=>website.close(r)),new Promise(r=>upstream.close(r))]);}
});
