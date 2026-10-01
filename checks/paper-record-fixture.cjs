// In-memory API fixture; the actual persistence/migration contract is tested
// against shiyu-user-plugin.ts in the backend account ownership suite.
module.exports=function savePaper(record,{section,editionIndex,fields}){
 if(section==='edition'&&editionIndex!==undefined){
  record.editions=Array.from({length:3},(_,i)=>({...record.editions?.[i]??record.edition}));
  Object.assign(record.editions[editionIndex],fields);
 }else record[section]=fields;
};
