const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const vm=require('node:vm');

const script=fs.readFileSync(path.join(__dirname,'../deploy/online/release-front-only.sh'),'utf8');
const validator=script.match(/<<'RETIRED'\r?\n([\s\S]*?)\r?\nRETIRED/)[1];
const root='/opt/shiyu/releases/20261012140000',recordFile='/tmp/release-record.json';
const bytes=Buffer.from('verified retired resource\n');
const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
const entry=file=>({path:file,sha256});

// Execute the shipped validator with an in-memory prepared release, never production paths.
function run(entries,options={}){
  const files=new Map(entries.map(item=>[path.posix.join(root,item.path),bytes]));
  const deleted=[];
  const mockFs={
    realpathSync(file){
      if(file===root)return options.rootSymlink?'/opt/shared':root;
      return options.parentSymlink?'/opt/shared':file;
    },
    readFileSync(file){
      if(file===recordFile)return JSON.stringify({deletedFiles:entries});
      return options.changedBytes?Buffer.from('changed after baseline'):files.get(file);
    },
    existsSync:file=>!options.missing&&files.has(file),
    lstatSync:()=>({isFile:()=>!options.fileSymlink}),
    unlinkSync(file){deleted.push(file);files.delete(file);}
  };
  vm.runInNewContext(validator,{
    require(name){
      if(name==='node:fs')return mockFs;
      if(name==='node:path')return path.posix;
      if(name==='node:crypto')return crypto;
      throw Error('Unexpected module '+name);
    },
    process:{argv:['node','-',recordFile,root]}
  });
  return deleted;
}

test('accepts precisely the 145 retired avatar files and the legacy account store',()=>{
  const avatarFiles=[
    'dist/avatar-character-factory.js','dist/avatar-motion-engine.js','dist/avatar-scrub-theme.js',
    'dist/avatar-theme.js','dist/avatar-video-theme.js','dist/avatar-theme.css',
    'dist/assets/avatar/azhi-idle.webm',
    ...Array.from({length:121},(_,i)=>'dist/assets/avatar/timeline/frame-'+String(i).padStart(3,'0')+'.jpg'),
    ...Array.from({length:17},(_,i)=>'dist/assets/avatar/turn/frame-'+String(i).padStart(2,'0')+'.jpg')
  ];
  assert.equal(avatarFiles.length,145);
  const allowed=[...avatarFiles,'dist/extension/current/account-store.js'];
  assert.deepEqual(run(allowed.map(entry)),allowed.map(file=>root+'/'+file));
});

test('rejects active resources, near misses, out-of-range frames and path traversal',()=>{
  for(const file of [
    'dist/app.js','dist/avatar-theme.css.bak','dist/avatar-motion-engine.css',
    'dist/assets/avatar/azhi-idle.mp4','dist/assets/avatar/timeline/frame-121.jpg',
    'dist/assets/avatar/timeline/frame-00.jpg','dist/assets/avatar/timeline/frame-0000.jpg',
    'dist/assets/avatar/turn/frame-17.jpg','dist/assets/avatar/turn/frame-000.jpg',
    'dist/assets/avatar/timeline/frame-000.png','dist/assets/avatar/timeline/extra/frame-000.jpg',
    'dist/assets/avatar/../avatar/timeline/frame-000.jpg','/dist/avatar-theme.js',
    'dist\\avatar-theme.js','../shared/accounts.json'
  ])assert.throws(()=>run([entry(file)]),/Unexpected retired resource/,file);
});

test('requires a valid SHA256 and exact previous bytes',()=>{
  const file='dist/avatar-theme.js';
  for(const hash of ['',sha256.toUpperCase(),'0'.repeat(63),'g'.repeat(64)]){
    assert.throws(()=>run([{path:file,sha256:hash}]),/Unexpected retired resource/);
  }
  assert.throws(()=>run([entry(file)],{changedBytes:true}),/Retired resource baseline differs/);
});

test('refuses symlinked release roots, escaped parents and symlinked resources',()=>{
  const entries=[entry('dist/avatar-theme.js')];
  assert.throws(()=>run(entries,{rootSymlink:true}),/Prepared release is a symbolic link/);
  assert.throws(()=>run(entries,{parentSymlink:true}),/Retired resource escapes the prepared release/);
  assert.throws(()=>run(entries,{fileSymlink:true}),/Retired resource baseline differs/);
});

test('allows already absent approved resources and an empty retirement list',()=>{
  assert.deepEqual(run([entry('dist/avatar-theme.js')],{missing:true}),[]);
  assert.deepEqual(run([]),[]);
});
