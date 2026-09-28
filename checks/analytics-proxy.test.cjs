const test=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {once}=require('node:events');

test('analytics proxy accepts CORS without a credentials header and preserves existing credential responses',async t=>{
  const origins=[];
  const upstream=http.createServer((req,res)=>{
    origins.push(req.headers.origin);
    res.setHeader('Access-Control-Allow-Origin',req.url.includes('credential')?'http://127.0.0.1:4341':'*');
    if(req.url.includes('credential'))res.setHeader('Access-Control-Allow-Credentials','true');
    res.writeHead(202,{'content-type':'application/json'});res.end('{"accepted":true}');
  });
  upstream.listen(0,'127.0.0.1');await once(upstream,'listening');
  t.after(()=>upstream.close());
  const mod={exports:{}};
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../shiyu-user-proxy.cjs'),'utf8'),{module:mod,require:()=>({request:(options,callback)=>http.request({...options,port:upstream.address().port},callback)})});
  const proxy=http.createServer((req,res)=>{if(!mod.exports(req,res)){res.writeHead(404);res.end()}});
  proxy.listen(0,'127.0.0.1');await once(proxy,'listening');t.after(()=>proxy.close());
  for(const credentials of [false,true]){
    const response=await fetch(`http://127.0.0.1:${proxy.address().port}/api/shiyu/auth/analytics${credentials?'?credential=1':''}`,{method:'POST',headers:{origin:'http://127.0.0.1:4341','content-type':'application/json'},body:'{"events":[]}'});
    assert.equal(response.status,202);
    assert.equal(response.headers.get('access-control-allow-credentials'),credentials?'true':null);
    assert.deepEqual(await response.json(),{accepted:true});
  }
  assert.deepEqual(origins,['http://127.0.0.1:4341','http://127.0.0.1:4341']);
});
