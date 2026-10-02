// Release preflight, protected backups and append-only release history. No credentials are logged.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {DatabaseSync,backup} from 'node:sqlite';
const [action,id]=process.argv.slice(2);
if(!/^\d{14}$/.test(id||''))throw Error('Invalid release id');
const root='/opt/shiyu/backups/release-'+id,history='/opt/shiyu-admin/current/.local/shiyu-release-history.json';
const json=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const configFiles=['/opt/shiyu-admin/current/.local/shiyu-operations.json','/opt/shiyu-admin/current/.local/shiyu-plans.json'];
function checkJobs(){
 for(const name of ['generation-jobs','cutout-jobs']){
  const dir='/opt/shiyu-tools/current/.local/'+name;if(!fs.existsSync(dir))continue;
  const pending=fs.readdirSync(dir).filter(key=>{const f=path.join(dir,key,'job.json');return fs.existsSync(f)&&!['done','failed'].includes(json(f).status)});
  if(pending.length)throw Error('Active tool jobs prevent restart: '+pending.length);
 }
}
if(action==='prepare'){
 checkJobs();
 const record=json('/tmp/shiyu-release-'+id+'.json'),state=json(history),last=state.items.filter(x=>x.target==='website').at(-1);
 if(!record.id||record.target!=='website'||!/^V\d+\.\d+\.\d+$/.test(record.version)||!['feature','fix','change'].includes(record.changeType)||!record.summary||record.summary.length>500||!Number.isFinite(Date.parse(record.releasedAt)))throw Error('Invalid release record');
 const parts=last.version.slice(1).split('.').map(Number);parts[2]++;
 if(record.version!=='V'+parts.join('.')||state.items.some(x=>x.id===record.id||x.target==='website'&&x.version===record.version))throw Error('Release version conflicts with current history');
 fs.mkdirSync(root,{mode:0o700});
 const require=createRequire(import.meta.url),cfg=require('/opt/shiyu/current/payments/config.cjs').loadConfig();
 if(!fs.existsSync(cfg.file))throw Error('Missing production payment configuration');
 if(fs.existsSync(cfg.database)){
  const db=new DatabaseSync(cfg.database,{readOnly:true});await backup(db,root+'/orders.sqlite');db.close();
  const copy=new DatabaseSync(root+'/orders.sqlite',{readOnly:true});if(copy.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw Error('Payment backup integrity failed');copy.close();
 }
 for(const [name,dir] of [['admin','/opt/shiyu-admin/current/.local'],['front','/opt/shiyu/current/.local']]){
  fs.mkdirSync(root+'/'+name,{mode:0o700});
  for(const item of fs.readdirSync(dir,{withFileTypes:true}))if(item.isFile()&&item.name.endsWith('.json'))fs.copyFileSync(path.join(dir,item.name),root+'/'+name+'/'+item.name);
 }
 const creators='/opt/shiyu-admin/current/platform-creators.json';
 if(fs.existsSync(creators))fs.copyFileSync(creators,root+'/admin/platform-creators.json');
 const sums=Object.fromEntries([...configFiles,cfg.file].filter(fs.existsSync).map(f=>[fs.realpathSync(f),digest(f)]));
 fs.writeFileSync(root+'/preserved-config.json',JSON.stringify(sums),{mode:0o600});
 // Recheck immediately before appending; never replace historical rows with local seed data.
 if(JSON.stringify(json(history))!==JSON.stringify(state))throw Error('Release history changed during preflight');
 state.items.push(record);fs.writeFileSync(history+'.release.tmp',JSON.stringify(state,null,2)+'\n');fs.renameSync(history+'.release.tmp',history);
 if(JSON.stringify(json(history).items.slice(0,-1))!==JSON.stringify(json(root+'/admin/shiyu-release-history.json').items))throw Error('Previous release history changed');
 console.log('BACKUP='+root+'\nAPPENDED_RELEASE='+record.version);
}else if(action==='verify'){
 const sums=json(root+'/preserved-config.json');for(const [file,hash] of Object.entries(sums))if(digest(file)!==hash)throw Error('Production configuration changed: '+path.basename(file));
 const before=json(root+'/admin/shiyu-release-history.json'),current=json(history),record=json('/tmp/shiyu-release-'+id+'.json');
 if(JSON.stringify(current.items.slice(0,-1))!==JSON.stringify(before.items)||current.items.at(-1).id!==record.id)throw Error('Release history verification failed');
 console.log('PASS preserved production configuration and append-only release history');
}else throw Error('Unknown action');
