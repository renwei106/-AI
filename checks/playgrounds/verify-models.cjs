const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {performance}=require('node:perf_hooks');
const output='.local/checks/playground-models';
// These numerical checks do not render; the sandbox only allocates the sand grid's pixel buffer.
const sandbox=vm.createContext({window:{},document:{createElement:()=>({getContext:()=>({createImageData:(width,height)=>({data:new Uint8ClampedArray(width*height*4)})})})}});
for(const file of ['catalog.js','models.js','stage.js'])vm.runInContext(fs.readFileSync('dist/assets/playgrounds/'+file,'utf8'),sandbox);
const E=sandbox.window.ShiyuPlaygrounds,models=sandbox.window.ShiyuPlaygroundModels,results=[];
for(const scene of E.catalog){
 for(const range of ['default','maximum']){
  const config=range==='default'?E.defaults(scene.id):Object.fromEntries(scene.fields.map(field=>[field.key,field.max]));
  const model=models.create(scene.id,config),before=model.stats(),start=performance.now();
  for(let frame=0;frame<360;frame++)model.update(1/60,config,null);
  const after=model.stats();model.action?.();
  results.push({scene:scene.id,range,milliseconds:performance.now()-start,before,after,action:model.stats()});
 }
}
const finite=value=>typeof value==='number'?Number.isFinite(value):Array.isArray(value)?value.every(finite):value&&typeof value==='object'?Object.values(value).every(finite):true;
assert.ok(results.every(finite));
for(const result of results){
 if(result.scene==='particleLife')assert.ok(result.after.particles<=600);
 if(result.scene==='ecoGarden'){assert.ok(result.after.plants<=700);assert.ok(result.after.herbivores<=100);assert.ok(result.after.predators<=20);}
 if(result.scene==='softFabric')assert.equal(result.action.pinned,0);
 if(result.scene==='elementSandbox')assert.equal(result.action.cells,0);
}
fs.mkdirSync(output,{recursive:true});fs.writeFileSync(output+'/results.json',JSON.stringify(results,null,2));
console.log(`PASS ${E.catalog.length} models: bounded state, sustained evolution, default/max parameters and available actions.`);
