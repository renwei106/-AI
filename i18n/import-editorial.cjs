// Local maintenance only. Online imports/releases still require the release review.
const fs=require('node:fs'),path=require('node:path');
const {createService}=require('./service.cjs');
const {scan,hash,validateTranslation}=require('./catalog.cjs');
const {appendConfigCopy}=require('./config-copy.cjs');

async function importEditorial({root,store,ts,editorial,apply=false,publish=false}){
 const service=createService({root,store,ts}),data=service.read();
 const inventory=appendConfigCopy(scan(root,ts),store),rows=Object.values(inventory.entries),missing=[];
 let added=0,updated=0,unchanged=0;
 for(const entry of rows){
  const copy=editorial[entry.id];
  if(!copy){missing.push(entry.source);continue}
  if(copy.source!==entry.source||hash(copy.source)!==entry.id)throw Error('Source mismatch: '+entry.id);
  validateTranslation(entry.source,copy.text);
  const previous=data.entries[entry.id]?.translations?.en;
  if(!previous?.text)added++;else if(previous.text!==copy.text||!previous.approved)updated++;else unchanged++;
 }
 if(missing.length)throw Error('Untranslated copy: '+JSON.stringify(missing));
 if(apply){
  const backup=store+'.before-'+new Date().toISOString().replace(/[:.]/g,'-');
  if(fs.existsSync(store))fs.copyFileSync(store,backup,fs.constants.COPYFILE_EXCL);
  data.inventory=inventory;
  for(const entry of rows){const old=data.entries[entry.id];data.entries[entry.id]={...old,...entry,translations:{...old?.translations,en:{text:editorial[entry.id].text,approved:true}}}}
  fs.mkdirSync(path.dirname(store),{recursive:true});fs.writeFileSync(store+'.tmp',JSON.stringify(data));fs.renameSync(store+'.tmp',store);
  if(publish)await service.action('POST','publish-language',{locale:'en'});
 }
 return {total:rows.length,added,updated,unchanged,missing:missing.length,applied:apply,published:apply&&publish};
}
if(require.main===module){
 const args=process.argv.slice(2),value=flag=>args[args.indexOf(flag)+1],store=args.includes('--store')?path.resolve(value('--store')):null;
 if(!store||!path.basename(store).endsWith('.json'))throw Error('Specify --store PATH. Dry run by default; --apply imports, --publish-local updates the local preview.');
 if(!store.split(path.sep).includes('.local'))throw Error('This command only supports a .local store.');
 const ts=require(path.resolve(__dirname,'../../聚合管理后台/node_modules/typescript'));
 importEditorial({root:path.resolve(__dirname,'../dist'),store,ts,editorial:require('./editorial-en.json'),apply:args.includes('--apply'),publish:args.includes('--publish-local')}).then(result=>console.log(JSON.stringify(result,null,2))).catch(error=>{console.error(error.message);process.exitCode=1});
}
module.exports={importEditorial};
