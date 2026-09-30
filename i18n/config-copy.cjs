const fs=require('node:fs'),path=require('node:path');
const {hash}=require('./catalog.cjs');

// Only public UI fields belong in the catalog. Never collect account data,
// access lists, destinations, identifiers, or user-authored notes/bookmarks.
function operationCopy(config){
 const rows=[];
 const add=(value,group)=>{if(typeof value==='string'&&/[\u3400-\u9fff]/.test(value))rows.push({source:value,group})};
 for(const field of ['title','description'])add(config.world?.[field],'world-discover');
 for(const module of config.corner?.modules||[])for(const field of ['entryName','panelName','description','category'])add(module[field],'home-corner');
 for(const [kind,category] of Object.entries(config.personalization||{}))for(const option of Object.values(category.options||{}))add(option.name,kind==='themes'?'home-themes':'common-settings');
 for(const name of Object.values(config.optionNames||{}))add(name,'common-settings');
 return rows;
}
function appendConfigCopy(inventory,store){
 const directory=path.dirname(store),rows=[];
 const file=path.join(directory,'shiyu-operations.json');
 if(fs.existsSync(file))rows.push(...operationCopy(JSON.parse(fs.readFileSync(file,'utf8'))).map(row=>({...row,file:'config/operations'})));
 const fields=new Set(['name','description','unit','cycle','tag','scope']);
 function collect(value,file){if(!value||typeof value!=='object')return;for(const [key,child]of Object.entries(value)){if(fields.has(key)&&typeof child==='string'&&/[\u3400-\u9fff]/.test(child))rows.push({source:child,group:'common-member',file});else if(child&&typeof child==='object')collect(child,file)}}
 for(const name of ['shiyu-plans.json','shiyu-themes.json']){const file=path.join(directory,name);if(fs.existsSync(file))collect(JSON.parse(fs.readFileSync(file,'utf8')),'config/'+name)}
 const resources=path.resolve(directory,'../membership/resources.json');
 if(fs.existsSync(resources))collect(JSON.parse(fs.readFileSync(resources,'utf8')),'config/member-resources');
 for(const {source,group,file} of rows){
  const id=hash(source),entry=inventory.entries[id]??={id,source,files:[],groups:[],order:Object.keys(inventory.entries).length};
  if(!entry.files.includes(file))entry.files.push(file);
  if(!entry.groups.includes(group))entry.groups.push(group);
 }
 return inventory;
}
module.exports={operationCopy,appendConfigCopy};
