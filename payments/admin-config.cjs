'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {loadConfig,inspect}=require('./config.cjs');
const ids=['wechat','alipay'];
const fields={wechat:['appId','mchId','serialNo','publicKeyId','apiV3Key','privateKey','publicKey','platformCertificate'],alipay:['appId','sellerId','privateKey','publicKey','appCertContent','alipayPublicCertContent','alipayRootCertContent']};
const files={privateKey:'privateKeyPath',publicKey:'publicKeyPath',platformCertificate:'platformCertificatePath',appCertContent:'appCertPath',alipayPublicCertContent:'alipayPublicCertPath',alipayRootCertContent:'alipayRootCertPath'};
const secret=k=>k==='apiV3Key'||Object.hasOwn(files,k);
function view(filename){const c=loadConfig(filename),state=inspect(c);return {items:ids.map(id=>({id,enabled:c[id].enabled!==false,ready:state.providers[id].ready,updatedAt:c[id].updatedAt||null,values:Object.fromEntries(fields[id].filter(k=>!secret(k)).map(k=>[k,c[id][k]||''])),configured:Object.fromEntries(fields[id].filter(secret).map(k=>[k,!!c[id][k]]))})),publicBaseUrl:c.publicBaseUrl};}
function save(id,input,filename){
 if(!ids.includes(id)||!input||typeof input!=='object')throw Error('支付方式无效');
 const c=loadConfig(filename),file=c.file,raw=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'')):{};
 // Read immediately before the synchronous write so two administrators cannot disable the last channel.
 if(input.enabled!==undefined){if(typeof input.enabled!=='boolean')throw Error('开关值无效');if(!input.enabled&&!ids.some(other=>other!==id&&raw[other]?.enabled!==false))throw Error('至少保留一种支付方式');}
 const values=input.values||{};if(typeof values!=='object'||Array.isArray(values))throw Error('配置格式无效');
 const next={...(raw[id]||{})},pending=[];
 for(const [k,v] of Object.entries(values)){
  if(!fields[id].includes(k)||typeof v!=='string'||v.length>16000)throw Error('配置字段无效');const text=v.trim();if(secret(k)&&!text)continue;
  if(text){
   const patterns={appId:id==='wechat'?/^wx[a-zA-Z0-9]{16}$/:/^\d{16}$/,mchId:/^\d{8,12}$/,sellerId:/^2088\d{12}$/,serialNo:/^[A-Fa-f0-9]{16,64}$/,publicKeyId:/^PUB_KEY_ID_\d+$/};
   if(patterns[k]&&!patterns[k].test(text))throw Error(k+' 格式不正确');
   if(k==='apiV3Key'&&Buffer.byteLength(text)!==32)throw Error('APIv3 密钥必须为 32 字节');
   if(k==='privateKey'){try{const key=crypto.createPrivateKey(text);if(key.asymmetricKeyType!=='rsa'||key.asymmetricKeyDetails.modulusLength<2048)throw Error();}catch{throw Error('请填写有效的 RSA 私钥（至少 2048 位）');}}
   if(k==='publicKey'){try{crypto.createPublicKey(require('./config.cjs').pemPublic(text));}catch{throw Error('请填写有效的支付平台公钥');}}
   if(k.toLowerCase().includes('cert')){try{new crypto.X509Certificate(text);}catch{throw Error('请填写有效的 PEM 证书');}}
  }
  if(files[k])pending.push([k,text]);else next[k]=text;
 }
 if(input.publicBaseUrl!==undefined){const u=input.publicBaseUrl;if(typeof u!=='string')throw Error('回调域名无效');if(u){try{const parsed=new URL(u);if(parsed.protocol!=='https:'||parsed.pathname!=='/'||parsed.search||parsed.hash||parsed.username||parsed.password)throw Error();}catch{throw Error('请填写不带路径的 HTTPS 回调域名');}}raw.publicBaseUrl=u.replace(/\/$/,'');}
 const dir=path.dirname(file);fs.mkdirSync(dir,{recursive:true});
 for(const [k,text] of pending){const name=`keys/${id}/${k}-${crypto.randomUUID()}.pem`,target=path.join(dir,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,text,{mode:0o600});next[files[k]]=name;}
 if(input.enabled!==undefined)next.enabled=input.enabled;
 next.updatedAt=new Date().toISOString();raw[id]=next;
 // Saving merchant parameters enables the configured service; readiness still validates all required inputs.
 if(input.values)raw.enabled=true;
 fs.writeFileSync(file+'.tmp',JSON.stringify(raw,null,2),{mode:0o600});fs.renameSync(file+'.tmp',file);return view(file);
}
module.exports={view,save};
