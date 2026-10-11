const fs=require('node:fs'),path=require('node:path');
const {scan,hash,compile,validateTranslation,renderCurrent}=require('./catalog.cjs');
const {GROUPS}=require('./groups.cjs');
const {createProvider}=require('./provider.cjs');
const LANGUAGES=[{code:'zh-CN',name:'简体中文'},{code:'en',name:'English'},{code:'ja',name:'日本語'}];
const validLocale=code=>LANGUAGES.some(l=>l.code===code);
function validateSettings(value){
 if(!value||!Array.isArray(value.languages)||value.languages.length!==3)throw new Error('请配置中文、英文和日文');
 const seen=new Set(),countries=new Set();
 const languages=value.languages.map(l=>{if(!validLocale(l.code)||seen.has(l.code))throw new Error('语言重复或不支持');seen.add(l.code);if(!Array.isArray(l.countries))throw new Error('国家配置无效');const list=l.countries.map(c=>String(c).toUpperCase());for(const c of list){if(!/^[A-Z]{2}$/.test(c)||countries.has(c))throw new Error('国家默认语言不能重复：'+c);countries.add(c)}return {...LANGUAGES.find(x=>x.code===l.code),enabled:l.enabled===true,countries:list}});
 if(!languages.some(l=>l.enabled))throw new Error('至少保留一种语言');if(!languages.some(l=>l.enabled&&l.code===value.fallback))throw new Error('默认语言必须启用');return {languages,fallback:value.fallback};
}
function resolveLocale(settings,manual,country){const enabled=settings.languages.filter(l=>l.enabled);if(enabled.length===1)return enabled[0].code;if(enabled.some(l=>l.code===manual))return manual;return enabled.find(l=>l.countries.includes(country))?.code||settings.fallback}
function createService({root,store,ts,fetcher=fetch}){
 const initial=()=>({version:1,settings:{languages:LANGUAGES.map(l=>({...l,enabled:l.code==='zh-CN',countries:l.code==='zh-CN'?['CN']:l.code==='ja'?['JP']:[]})),fallback:'zh-CN'},entries:{},inventory:{entries:{},files:{}},notices:{},releases:{}});
 const read=()=>fs.existsSync(store)?JSON.parse(fs.readFileSync(store,'utf8')):initial();
 const assetCache=new Map();
 function asset(locale,file,data=read()){
  if(!data.settings.languages.some(l=>l.code===locale&&l.enabled))return;
  if(typeof file!=='string'||!(/^[\w-]+\.(js|html)$/.test(file)||/^extension\/(integration|store)\.js$/.test(file)))return;
  const target=path.join(root,file);
  if(!fs.existsSync(target)||!fs.statSync(target).isFile())return;
  const source=fs.readFileSync(target,'utf8'),dictionary=data.releases[locale]?.dictionary||{};
  const key=locale+':'+file,version=hash(source)+':'+hash(JSON.stringify(dictionary)),cached=assetCache.get(key);
  if(cached?.version===version)return cached.content;
  const content=locale==='zh-CN'?source:renderCurrent(source,file,ts,dictionary);
  assetCache.set(key,{version,content});return content;
 }
 const write=data=>{fs.mkdirSync(path.dirname(store),{recursive:true});fs.writeFileSync(store+'.tmp',JSON.stringify(data));fs.renameSync(store+'.tmp',store)};
 let translating=false;
 const translationProvider=createProvider(store,fetcher);
 const provider=translationProvider.status;
 function sync(data){data.inventory=scan(root,ts);for(const e of Object.values(data.inventory.entries))data.entries[e.id]={...data.entries[e.id],...e};return data}
 function coverage(data,locale){const rows=Object.values(data.inventory.entries);return {total:rows.length,translated:rows.filter(e=>data.entries[e.id]?.translations?.[locale]?.text).length,approved:rows.filter(e=>data.entries[e.id]?.translations?.[locale]?.approved).length}}
 async function translate(texts,locale){if(!['en','ja'].includes(locale))throw new Error('请选择英文或日文');return translationProvider.translate(texts,locale)}

 function validText(text){if(typeof text!=='string'||!text.trim()||text.length>20000||/[<>]/.test(text))throw new Error('译文不能为空或包含 HTML 标签');return text}
 function buildRelease(data,locale){
  let fallbackCount=0;
  const dictionary=Object.fromEntries(Object.keys(data.inventory.entries).map(id=>{const e=data.entries[id],t=e.translations?.[locale];if(t?.approved&&t.text?.trim())return [id,validateTranslation(e.source,validText(t.text))];fallbackCount++;return [id,e.source]}));
  const files={};for(const file of Object.keys(data.inventory.files)){files[file]=compile(fs.readFileSync(path.join(root,file),'utf8'),file,data.inventory,dictionary,ts);if(file.endsWith('.js')&&ts.createSourceFile(file,files[file],ts.ScriptTarget.Latest,true,ts.ScriptKind.JS).parseDiagnostics.length)throw new Error(file+'语言资源校验失败')}
  data.releases[locale]={sourceHash:hash(JSON.stringify(data.inventory.files)),dictionary,files,publishedAt:new Date().toISOString(),fallbackCount};return {ok:true,fallbackCount};
 }
 function publicState(data){return {settings:data.settings,revision:hash(JSON.stringify(data.settings)),notices:Object.fromEntries(Object.entries(data.notices).filter(([,n])=>n.published).map(([k,n])=>{const published=n.published,translations={...published.translations};for(const l of LANGUAGES){const t=translations[l.code];if(!t?.approved||!t.title?.trim()||!t.body?.trim())translations[l.code]=published.translations['zh-CN']}return [k,{...published,translations}]}))}}
 async function action(method,route,body={}){let data=read();
  if(route==='provider'&&method==='PUT')return translationProvider.save(body);
  if(route==='provider/test'&&method==='POST')return translationProvider.test(body);
  if(route==='public'&&method==='GET')return publicState(data);
  if(route==='admin'&&method==='GET'){sync(data);write(data);return {...data,groups:GROUPS,provider:provider(),coverage:Object.fromEntries(['en','ja'].map(l=>[l,coverage(data,l)]))}}
  if(route==='settings'&&method==='PUT'){const settings=validateSettings(body);sync(data);for(const l of settings.languages.filter(l=>l.enabled&&l.code!=='zh-CN')){if(!data.settings.languages.find(x=>x.code===l.code)?.enabled||!data.releases[l.code]||data.releases[l.code].sourceHash!==hash(JSON.stringify(data.inventory.files)))buildRelease(data,l.code)}data.settings=settings;write(data);return publicState(data)}
  if(route==='scan'&&method==='POST'){sync(data);write(data);return {total:Object.keys(data.inventory.entries).length}}
  if(route==='translate'&&method==='POST'){
   if(translating)throw new Error('翻译任务正在进行，请稍后');if(!['en','ja'].includes(body.locale))throw new Error('语言不支持');translating=true;
   try{sync(data);const requested=Array.isArray(body.ids)?new Set(body.ids):null;const rows=Object.values(data.inventory.entries).filter(e=>(!requested||requested.has(e.id))&&!data.entries[e.id]?.translations?.[body.locale]?.text).slice(0,25);if(!rows.length)return {count:0};const values=await translate(rows.map(e=>e.source),body.locale);data=read();for(let i=0;i<rows.length;i++){const e=data.entries[rows[i].id];if(!e)continue;e.translations??={};if(!e.translations[body.locale]?.text)e.translations[body.locale]={text:validateTranslation(rows[i].source,validText(values[i])),approved:false}}write(data);return {count:rows.length}}finally{translating=false}
  }
  if(route==='entry'&&method==='PUT'){const entry=Object.hasOwn(data.entries,body.id)?data.entries[body.id]:null;if(!entry||!['en','ja'].includes(body.locale))throw new Error('文案不存在');entry.translations??={};entry.translations[body.locale]={text:validateTranslation(entry.source,validText(body.text)),approved:body.approved===true};write(data);return {ok:true}}
  if(route==='entries/review'&&method==='POST'){
   if(!['en','ja'].includes(body.locale)||!['approve','withdraw'].includes(body.action))throw new Error('审核操作无效');
   if(!Array.isArray(body.ids)||!body.ids.length||body.ids.some(id=>typeof id!=='string'))throw new Error('请先选择译文');
   sync(data);const ids=[...new Set(body.ids)];
   const translations=ids.map(id=>{if(!Object.hasOwn(data.inventory.entries,id))throw new Error('部分文案已不存在，请刷新后重试');const e=data.entries[id],t=e.translations?.[body.locale];if(!t?.text?.trim())throw new Error('所选文案包含未翻译内容，请先生成译文');validateTranslation(e.source,validText(t.text));return t});
   for(const t of translations){t.approved=body.action==='approve';t.withdrawn=body.action==='withdraw'}
   write(data);return {count:translations.length};
  }
  if(route==='publish-language'&&method==='POST'){if(!['en','ja'].includes(body.locale))throw new Error('语言不支持');sync(data);const result=buildRelease(data,body.locale);write(data);return result}
  const noticeRoute=/^notices\/(announcement|update)(?:\/(translate|publish))?$/.exec(route);
  if(noticeRoute){const [,kind,op]=noticeRoute;data.notices[kind]??={draft:{enabled:false,revision:'',translations:{'zh-CN':{title:'',body:''}}}};const notice=data.notices[kind];
   if(!op&&method==='GET')return notice;
   if(!op&&method==='PUT'){const draft=body;const source=draft.translations?.['zh-CN'];if(!source||typeof source.title!=='string'||typeof source.body!=='string')throw new Error('请填写中文原文');const translations={};const changed=source.title!==notice.draft.translations['zh-CN']?.title||source.body!==notice.draft.translations['zh-CN']?.body;for(const l of LANGUAGES){const t=draft.translations?.[l.code];if(t)translations[l.code]={title:String(t.title||'').slice(0,160),body:String(t.body||'').slice(0,12000),approved:l.code==='zh-CN'||(!changed&&t.approved===true)}}notice.draft={enabled:draft.enabled===true,revision:String(draft.revision||'').slice(0,40),translations};write(data);return notice}
   if(op==='translate'&&method==='POST'){const source=notice.draft.translations['zh-CN'];if(!source.title.trim()||!source.body.trim())throw new Error('请先填写并保存中文原文');const version=hash(JSON.stringify(notice.draft));const generated={};for(const l of ['en','ja']){if(notice.draft.translations[l]?.approved)continue;const [title,bodyText]=await translate([source.title,source.body],l);generated[l]={title,body:bodyText,approved:false}}data=read();if(hash(JSON.stringify(data.notices[kind].draft))!==version)throw new Error('翻译期间原稿已更新，请重试');Object.assign(data.notices[kind].draft.translations,generated);write(data);return data.notices[kind]}
   if(op==='publish'&&method==='POST'){const draft=notice.draft;if(draft.enabled){if(!draft.revision.trim())throw new Error('请填写编号或版本号');for(const l of data.settings.languages.filter(l=>l.enabled)){const t=draft.translations[l.code];if(!t?.title?.trim()||!t?.body?.trim()||!t.approved)throw new Error(l.name+'内容不完整或未审核')}if(notice.published?.enabled&&notice.published.revision===draft.revision&&JSON.stringify(notice.published.translations)!==JSON.stringify(draft.translations))throw new Error('内容变化后请使用新编号，确保用户能收到提醒')}notice.published=JSON.parse(JSON.stringify(draft));write(data);return notice}
  }
  throw new Error('不支持的多语言操作');
 }
 return {action,read,asset,resolveLocale:(manual,country)=>resolveLocale(read().settings,manual,country)};
}
module.exports={createService,validateSettings,resolveLocale};
