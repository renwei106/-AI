const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const id='20261003000000',root='/opt/shiyu/backups/release-'+id,store='/opt/shiyu-admin/current/.local/shiyu-i18n.json';
const source=fs.readFileSync(require('node:path').join(__dirname,'../deploy/online/release-state.mjs'),'utf8').replace(/^import .*;\r?$/gm,'').replaceAll('import.meta.url','"file:///tmp/release-state.mjs"');
const old={settings:{fallback:'zh-CN',languages:[{code:'zh-CN',enabled:true},{code:'en',enabled:false},{code:'ja',enabled:false}]},notices:{announcement:{draft:'keep'}},releases:{ja:{dictionary:{a:'keep'}}}};
function fixture(enabled=true){
 const record={id:'release-14',version:'V1.0.14',initializeEnglish:enabled},files=new Map();
 const put=(p,data)=>files.set(p,JSON.stringify(data));put('/tmp/shiyu-release-'+id+'.json',record);put(root+'/admin/shiyu-i18n.json',old);put(store,{changed:true});
 put(root+'/preserved-config.json',{});put(root+'/admin/shiyu-release-history.json',{items:[]});put('/opt/shiyu-admin/current/.local/shiyu-release-history.json',{items:[record]});
 const fake={readFileSync:p=>{if(!files.has(p))throw Error('Missing '+p);return files.get(p)},existsSync:p=>files.has(p),copyFileSync:(a,b)=>files.set(b,files.get(a)),renameSync:(a,b)=>{files.set(b,files.get(a));files.delete(a)},unlinkSync:p=>files.delete(p)};
 const run=action=>vm.runInNewContext('(async()=>{'+source+'})()',{fs:fake,path:require('node:path'),crypto:require('node:crypto'),process:{argv:['node','release-state',action,id]},console:{log(){}},createRequire(){throw Error('Unexpected payment access')}});
 return {files,put,run};
}
test('failed opted-in release restores the previous language file',async()=>{const f=fixture();await f.run('restore-language');assert.deepEqual(JSON.parse(f.files.get(store)),old)});
test('rollback removes a newly initialized file when production previously had none',async()=>{const f=fixture();f.files.delete(root+'/admin/shiyu-i18n.json');await f.run('restore-language');assert(!f.files.has(store))});
test('ordinary release rollback never changes language settings',async()=>{const f=fixture(false),before=f.files.get(store);await f.run('restore-language');assert.equal(f.files.get(store),before)});
test('release verification requires English and preservation of other language settings',async()=>{const f=fixture(),next=structuredClone(old);next.settings.languages[1].enabled=true;next.releases.en={dictionary:{a:'English'}};f.put(store,next);await f.run('verify');next.settings.fallback='en';f.put(store,next);await assert.rejects(f.run('verify'),/Unrelated language settings changed/)});
