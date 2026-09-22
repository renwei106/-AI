const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const ts=require('../../聚合管理后台/node_modules/typescript');
const {createService}=require('../i18n/service.cjs');
const {hash,renderCurrent}=require('../i18n/catalog.cjs');
const {localized}=require('../i18n/frontend-server.cjs');

test('published text applies to current markup and nested templates, with new text falling back',()=>{
 const dictionary={[hash('欢迎') ]:'Welcome',[hash('邮箱')]:'Email'};
 const source='const label="欢迎";const view=`<div class="current">${flag?"邮箱":"新文案"}</div>`;';
 const output=renderCurrent(source,'app.js',ts,dictionary);
 assert.ok(output.includes('"Welcome"'));
 assert.ok(output.includes('class="current"'));
 assert.ok(output.includes('${flag?"Email":"新文案"}'));
 assert.equal(ts.createSourceFile('app.js',output,ts.ScriptTarget.Latest,true).parseDiagnostics.length,0);
});

test('localized script URLs retain cache parameters; translation outage serves current code',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'shiyu-locale-routing-'));
 const html='<html lang="zh-CN"><head></head><body><script src="v4.js?version=42"></script><script src="earth-theme.js"></script><script src="assets/vendor.js"></script></body></html>';
 const settings={languages:[{code:'zh-CN',enabled:true,countries:[]},{code:'en',enabled:true,countries:[]}],fallback:'zh-CN'};
 const response=()=>({writeHead(status,headers){this.status=status;this.headers=headers},end(content){this.content=content}});
 try{
  fs.writeFileSync(path.join(root,'index.html'),html);fs.writeFileSync(path.join(root,'v4.js'),'const latestLogin=true;');
  t.mock.method(global,'fetch',async url=>{
   if(String(url).endsWith('/public'))return {ok:true,json:async()=>({settings})};
   throw Error('translation service unavailable');
  });
  const page=response();await localized({url:'/',headers:{cookie:'shiyu-language=en'}},page,'index.html',root);
  assert.equal(page.status,200);assert.ok(page.content.includes('v4.js?version=42&locale=en'));
  assert.ok(page.content.includes('earth-theme.js?locale=en'));assert.ok(page.content.includes('src="assets/vendor.js"'));
  const script=response();await localized({url:'/v4.js?version=42&locale=en',headers:{}},script,'v4.js',root);
  assert.equal(script.status,200);assert.equal(script.content,'const latestLogin=true;');
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('assets ignore stale application snapshots and invalidate on source or translation changes',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'shiyu-locale-test-'));
 try{
  const store=path.join(root,'state.json'),file=path.join(root,'app.js');
  fs.writeFileSync(file,'const currentTheme="欢迎";');
  const data={settings:{languages:[{code:'en',enabled:true}]},releases:{en:{dictionary:{[hash('欢迎')]:'Welcome'},files:{'app.js':'throw Error("stale bundle")'}}}};
  fs.writeFileSync(store,JSON.stringify(data));
  const service=createService({root,store,ts});
  assert.equal(service.asset('en','app.js'),'const currentTheme="Welcome";');
  fs.writeFileSync(file,'const newestTheme="欢迎";const added="新增主题";');
  assert.equal(service.asset('en','app.js'),'const newestTheme="Welcome";const added="新增主题";');
  data.releases.en.dictionary[hash('欢迎')]='Hello';fs.writeFileSync(store,JSON.stringify(data));
  assert.ok(service.asset('en','app.js').includes('"Hello"'));
  fs.writeFileSync(path.join(root,'new-theme.js'),'const enabled=true;');
  assert.equal(service.asset('en','new-theme.js'),'const enabled=true;');
  assert.equal(service.asset('ja','app.js'),undefined);
  assert.equal(service.asset('en','../app.js'),undefined);
  assert.equal(service.asset('en','state.json'),undefined);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
