/* Keep the portable companion identical in the two independently deployed frontends. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const source=path.resolve(__dirname,'../dist');
const target=path.resolve(__dirname,'../../工具集/dist');
const write=process.argv.includes('--write');
for(const file of ['desktop-pet.js','desktop-pet.css']){
  const from=path.join(source,file),to=path.join(target,file);
  if(write)fs.copyFileSync(from,to);
  assert(fs.existsSync(to)&&fs.readFileSync(from).equals(fs.readFileSync(to)),`${file} differs; run node checks/sync-desktop-pet.cjs --write`);
}
console.log(write?'PASS portable pet assets synchronized locally':'PASS portable pet assets match');
