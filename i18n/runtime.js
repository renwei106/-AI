(()=>{
 const state=window.SHIYU_LOCALE_STATE||{},dictionary=state.dictionary||{};
 const text=value=>typeof value==='string'&&Object.hasOwn(dictionary,value)?dictionary[value]:value;
 const operations=value=>{
  if(!value||state.locale==='zh-CN')return value;
  const result=JSON.parse(JSON.stringify(value));
  const fields=(object,keys)=>{if(object)for(const key of keys)if(typeof object[key]==='string')object[key]=text(object[key]);};
  fields(result.world,['title','description']);
  for(const module of result.corner?.modules||[])fields(module,['entryName','panelName','description','category']);
  for(const category of Object.values(result.personalization||{}))for(const option of Object.values(category.options||{}))fields(option,['name']);
  fields(result.optionNames,Object.keys(result.optionNames||{}));
  return result;
 };
 const catalog=value=>{
  if(!value||typeof value!=='object'||state.locale==='zh-CN')return value;
  if(Array.isArray(value))return value.map(catalog);
  return Object.fromEntries(Object.entries(value).map(([key,child])=>[key,['name','description','unit','cycle','tag','scope'].includes(key)?text(child):child&&typeof child==='object'?catalog(child):child]));
 };
 window.ShiyuI18n=Object.freeze({text,operations,catalog});
})();
