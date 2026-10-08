// Only clean verified releases. Refuse to delete any release still referenced by a symlink.
import fs from 'node:fs';
import path from 'node:path';
const [current,previous,mode]=process.argv.slice(2);
if(!/^\d{14}$/.test(current||'')||!/^\d{14}$/.test(previous||'')||current===previous)throw Error('Two distinct release IDs are required');
const roots=['/opt/shiyu'];
const keep=new Set([current,previous]);
const remove=[];
for(const root of roots){
  if(fs.realpathSync(root+'/current')!==root+'/releases/'+current)throw Error('Current release changed');
  for(const id of keep)if(!fs.statSync(root+'/releases/'+id).isDirectory())throw Error('Missing rollback release');
  for(const entry of fs.readdirSync(root+'/releases',{withFileTypes:true})){
    if(entry.isDirectory()&&!keep.has(entry.name))remove.push(root+'/releases/'+entry.name);
  }
}
const inside=(file,dir)=>file===dir||file.startsWith(dir+'/');
const blockers=[];
function scan(dir){
  if(remove.some(target=>inside(dir,target)))return;
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const file=path.join(dir,entry.name);
    if(entry.isSymbolicLink()){
      const direct=path.resolve(path.dirname(file),fs.readlinkSync(file));
      let resolved=direct;try{resolved=fs.realpathSync(file)}catch{}
      if(remove.some(target=>inside(direct,target)||inside(resolved,target)))blockers.push(file);
    }else if(entry.isDirectory())scan(file);
    else if(file.startsWith('/etc/systemd/system/')&&entry.isFile()){
      const content=fs.readFileSync(file,'utf8');
      if(remove.some(target=>content.includes(target)))blockers.push(file);
    }
  }
}
// Scan all applications for references, but only remove website releases.
scan('/opt');
scan('/etc/systemd/system');
console.log(JSON.stringify({keep:[...keep],remove,blockers},null,2));
if(mode!=='--apply')process.exit(0);
if(blockers.length)throw Error('Cleanup blocked: move live shared data/dependencies out of historical releases first');
// All deletion paths came from direct children of the three explicit release roots.
for(const file of remove)fs.rmSync(file,{recursive:true});
for(const entry of fs.readdirSync('/tmp')){
  const match=/^shiyu-front-(\d{14})\.tgz$/.exec(entry);
  if(match&&!keep.has(match[1]))fs.unlinkSync('/tmp/'+entry);
}
console.log('Retained current and previous website releases; other applications unchanged.');
