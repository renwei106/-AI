/* Read-only product audit: extracted real functions, isolated fake storage/API. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}};
const extract=(source,name)=>{const start=source.search(new RegExp('(?:async )?function '+name+'\\('));assert(start>=0);const rest=source.slice(start),match=/\n}\r?(?:\n|$)/.exec(rest);assert(match);return rest.slice(0,match.index+2);};
async function connectionRace(version){
 const source=fs.readFileSync(path.join(__dirname,version,'popup.js'),'utf8');
 const nodes=new Map(),calls=[];
 const sandbox={document:{body:{dataset:{},classList:{toggle(){}}},dispatchEvent(){}},Event:function(){},$:s=>{if(!nodes.has(s))nodes.set(s,{});return nodes.get(s)},options(){},fillScenes(){},setDestinationLoading(){},updateSave(){},applyTheme(){},status(){},call(){const d=deferred();calls.push(d);return d.promise},current:{url:'https://example.test/'},draft:null};
 vm.createContext(sandbox);vm.runInContext('var state;'+extract(source,'connect')+';globalThis.snapshot=()=>({auth:document.body.dataset.auth,owner:state?.accountId});',sandbox);
 const first=sandbox.connect(),second=sandbox.connect();calls[1].resolve({signed:true,accountId:'new-owner',spaces:[]});await second;assert.equal(sandbox.snapshot().auth,'signed');calls[0].resolve({signed:false,accountId:null,spaces:[]});await first;assert.equal(sandbox.snapshot().auth,'guest');
 console.log('REPRO '+version+': stale first connect response overwrites newer signed response with guest');
 const third=sandbox.connect(),fourth=sandbox.connect();calls[3].resolve({signed:true,accountId:'new-owner',spaces:[]});await fourth;calls[2].reject(Error('old timeout'));await third;assert.equal(sandbox.snapshot().auth,'error');
 console.log('REPRO '+version+': stale first connect timeout overwrites newer signed response with error');
}
async function workerState(){
 const source=fs.readFileSync(path.join(__dirname,'1.0.1','background.js'),'utf8');
 const data=[],storage=new Map([['yiyu-prototype-v1',JSON.stringify({signed:true,data,prefs:{accountProfile:{id:'old-owner'},accountDataUserId:'old-owner'}})]]);
 let sessionReads=0;
 const sandbox={URL,AbortController,location:{origin:'https://shiyubox.com',hostname:'shiyubox.com'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setTimeout,clearTimeout,CustomEvent:function(){},dispatchEvent(){},crypto:{randomUUID:()=> 'test-id'},fetch:async()=>{sessionReads++;return{ok:true,json:async()=>({authenticated:true,user:{id:'new-owner'}})}}};sandbox.window=sandbox;
 sandbox.extensionApi={scripting:{executeScript:async options=>[{result:await options.func(...options.args)}]}};
 vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../../dist/extension/store.js'),'utf8'),sandbox);vm.runInContext(extract(source,'directAccountState')+';'+extract(source,'verifyAccount'),sandbox);
 const tab={id:1},site={origin:'https://shiyubox.com'};const state=await sandbox.directAccountState(tab,site);assert.equal(state.accountId,'old-owner');assert.equal(sessionReads,0);
 await assert.rejects(sandbox.verifyAccount({tab,site},{accountId:'old-owner'}),/登录账号已变化/);
 const retry=await sandbox.directAccountState(tab,site);assert.equal(retry.accountId,'old-owner');assert.equal(sessionReads,1);
 console.log('REPRO 1.0.1: cookie B + signed localStorage A => state/retry stays A; save session verification rejects B');
 storage.delete('yiyu-prototype-v1');const gate=deferred();sandbox.fetch=async()=>({ok:true,json:()=>gate.promise});
 const oldRequest=sandbox.directAccountState(tab,site);storage.set('yiyu-prototype-v1',JSON.stringify({signed:true,data,prefs:{accountProfile:{id:'new-owner'},accountDataUserId:'new-owner'}}));gate.resolve({authenticated:false});const lateGuest=await oldRequest;assert.equal(lateGuest.signed,false);assert.equal(sandbox.ShiyuExtensionStore.snapshot().accountId,'new-owner');
 console.log('REPRO 1.0.1: guest session response captured before login returns guest despite newer signed localStorage');
}
(async()=>{await connectionRace('1.0.0');await connectionRace('1.0.1');await workerState();})().catch(e=>{console.error(e);process.exitCode=1});
