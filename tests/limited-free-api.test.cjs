const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),http=require('node:http');
const {once}=require('node:events'),{pathToFileURL}=require('node:url');
const admin=path.resolve(__dirname,'../../聚合管理后台');
const ts=require(path.join(admin,'node_modules/typescript'));
const {createLimitedFreeStore}=require(path.join(admin,'membership/limited-free-store.cjs'));
test('actual plan middleware enforces admin authorization and origin, persists rules and publishes the same runtime catalog',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'limited-free-api-'));
 const catalog={items:[{key:'share-password',kind:'text',enabled:true,value:'✓'}],resources:{}};
 const store=createLimitedFreeStore({file:path.join(dir,'rules.json'),catalog:()=>catalog});
 const code=ts.transpileModule(fs.readFileSync(path.join(admin,'shiyu-plan-plugin.ts'),'utf8').replaceAll('require','localRequire').replaceAll('import.meta.url',JSON.stringify(pathToFileURL(path.join(admin,'entry.ts')).href)),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const runtimeRequire=name=>{
  if(name==='node:module')return {createRequire:()=>runtimeRequire};
  if(name==='./platform-access-plugin')return {getPlatformSession:req=>req.headers.authorization?{superadmin:false,applicationIds:req.headers.authorization==='admin'?['shiyu']:[],admin:{name:'QA'}}:null};
  if(name==='./membership/plan-store.cjs')return {getCatalog:()=>catalog,readPublishedPlans:()=>[],readAdminPlans:()=>({}),readHistory:()=>[]};
  if(name==='./membership/limited-free-store.cjs')return store;
  if(name==='./membership/resources.json')return {fonts:[]};
  if(name.startsWith('node:'))return require(name);
  throw Error(name);
 };
 const module={exports:{}};vm.runInNewContext(code,{module,exports:module.exports,require:runtimeRequire,process,URL,Date,Set,Error,console});
 let handler;module.exports.shiyuPlanPlugin().configureServer({middlewares:{use:fn=>handler=fn}});
 const server=http.createServer((req,res)=>handler(req,res,()=>{res.writeHead(404);res.end()}));server.listen(0,'127.0.0.1');await once(server,'listening');
 t.after(()=>{server.close();fs.rmSync(dir,{recursive:true,force:true})});
 const url='http://127.0.0.1:'+server.address().port, endpoint='/api/shiyu/plans/limited-free/admin';
 const items=[{id:'qa',key:'share-password',enabled:true,startsAt:Date.now()-1000,endsAt:Date.now()+100000}];
 const request=async(headers={},body={revision:0,items})=>fetch(url+endpoint,{method:'PUT',headers:{'content-type':'application/json',...headers},body:JSON.stringify(body)});
 assert.equal((await fetch(url+endpoint)).status,401);
 assert.equal((await request({authorization:'other'})).status,403);
 assert.equal((await request({authorization:'admin',origin:'https://evil.example'})).status,403);
 assert.equal((await request({authorization:'admin',origin:url})).status,200);
 assert.equal((await request({authorization:'admin',origin:url})).status,409);
 const saved=await (await fetch(url+endpoint,{headers:{authorization:'admin'}})).json();assert.equal(saved.items.length,1);
 for(const route of ['/api/shiyu/plans','/api/shiyu/plans/catalog']) { const value=await (await fetch(url+route)).json();assert.deepEqual(value.limitedFree.items,saved.items);assert.equal(typeof value.limitedFree.serverTime,'number'); }
 assert.equal((await request({authorization:'admin'}, {revision:1,items:[{...items[0],key:'unknown'}]})).status,400);
});
