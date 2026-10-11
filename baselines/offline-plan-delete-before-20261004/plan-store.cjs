'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const resourceSource = require('./resources.json');
const root = path.resolve(__dirname, '..');
const clone = value => JSON.parse(JSON.stringify(value));
const basicStyles = ['follow', 'cards', 'paper', 'record', 'film', 'planet', 'calendar', 'poly', 'shelf'];
const defaultFreeThemeIds = new Set(['base', 'music', 'poly', 'flip', 'rain', 'cinema', 'paper']);
const defaults = [
  {id:'free',name:'免费版',cycle:'长期',days:0,price:0,original:0,tag:'基础使用',autoRenew:false,enabled:true},
  {id:'monthly',name:'月度会员',cycle:'一个月 30 天',days:30,price:10,original:10,tag:'灵活购买',autoRenew:false,enabled:true},
  {id:'auto-monthly',name:'连续包月',cycle:'每月自动续费',days:30,price:8,original:10,tag:'订阅更优惠',autoRenew:true,enabled:false},
  {id:'yearly',name:'年度会员',cycle:'一年 365 天',days:365,price:99,original:120,tag:'年度省心',autoRenew:false,enabled:true},
  {id:'auto-yearly',name:'连续包年',cycle:'每年自动续费',days:365,price:79,original:120,tag:'最优方案',autoRenew:true,enabled:false},
];
function readThemes(themesFile = path.join(root, '.local/shiyu-themes.json')) {
  let saved = [];
  try { const data = JSON.parse(fs.readFileSync(themesFile, 'utf8')); saved = Array.isArray(data.items) ? data.items : []; } catch { /* Built-in resource defaults. */ }
  const known = new Map(resourceSource.themes.map(theme => [theme.id, theme]));
  const state = new Map(saved.map(theme => [theme.id, theme.enabled]));
  const ids = [...new Set([...saved.map(theme => theme.id).filter(id => known.has(id)), ...known.keys()])];
  return ids.map(id => ({...clone(known.get(id)), enabled:state.get(id) ?? known.get(id).enabled}));
}
function getCatalog(themesFile, operationsFile = path.join(root,'.local/shiyu-operations.json')) {
  const resources = JSON.parse(fs.readFileSync(path.join(__dirname, 'resources.json'), 'utf8'));
  let personalization = {};
  try { personalization = JSON.parse(fs.readFileSync(operationsFile,'utf8')).personalization || {}; } catch(error) { if(error.code!=='ENOENT')throw Error('个性化配置读取失败'); }
  const configured = (items,category) => {
    const config=personalization[category]||{}, order=config.order||[];
    return items.map(item=>{const option=config.options?.[item.id];return {...item,name:option?.name||item.name,enabled:config.enabled!==false&&option?.enabled!==false,...category==='colors'&&option?.value?{preview:{...item.preview,color:option.value}}:{}}}).sort((a,b)=>(order.includes(a.id)?order.indexOf(a.id):999)-(order.includes(b.id)?order.indexOf(b.id):999));
  };
  resources.colors = configured(resources.colors,'colors');
  resources.pets = configured(require('./pets.json').map(pet=>({...pet,preview:{kind:'pet',url:pet.id==='paper'?'/shiyu-visuals/pet-girl-frame-9.png':pet.id==='swordswoman'?'/shiyu-visuals/pet-swordswoman-frame-0.png':`/shiyu-visuals/pet-${pet.id}.png`}})),'pet');
  resources.customColor = configured([{id:'custom',name:'自定义配色',preview:{kind:'color',color:'custom'}}],'colors');
  resources.themes = readThemes(themesFile).map(theme => ({...theme,preview:{kind:'theme',themeId:theme.id,color:theme.accent}}));
  resources.fonts.forEach(font => { if (font.preview) delete font.preview.file; });
  const selection = (key,scope,name,description,options) => ({key,scope,name,description,kind:'selection',value:[],unit:'',enabled:true,options});
  const flag = (key,scope,name,description) => ({key,scope,name,description,kind:'text',value:'✓',unit:'',enabled:true});
  const quantity = (key,name,description,unit) => ({key,scope:({'space-limit':'空间','scene-limit':'场景','group-limit':'分组','corner-limit':'拾隅工具','memo-limit':'拾隅工具','todo-limit':'拾隅工具','icon-daily-limit':'拾隅工具','color-daily-limit':'拾隅工具'})[key],name,description,kind:'quantity',value:0,unit,enabled:true});
  return {schemaVersion:2,resources,items:[
    selection('themes','主题','可用主题','从已实现的主题资源中选择；下架只暂停使用，保留授权。',resources.themes),
    selection('global-fonts','全局个性化','全局字体','可以在全局个性化中选择的字体。',resources.fonts),
    selection('global-layouts','全局个性化','全局布局','可以在全局个性化中选择的空间页宽度。',resources.layouts),
    selection('global-colors','全局个性化','预设配色','可以在全局个性化中选择的预设配色。',resources.colors),
    flag('global-custom-color','全局个性化','自定义配色','使用自选色号作为全局主题色。'),
    selection('desktop-pets','全局个性化','桌面伙伴','可以选择的伙伴形象。',resources.pets),
    selection('regular-styles','宫格视图','网址卡片样式','常规网址卡片可以选择的展示样式。',resources.styles),
    flag('space-font','空间','独立字体','为空间单独选择已授权的字体。'),
    flag('space-layout','空间','独立布局','为空间单独选择已授权的布局。'),
    flag('space-color','空间','独立配色','为空间单独设置已授权的预设或自定义配色。'),
    flag('space-style-scene','空间','按场景设置样式','让同一场景采用独立的网址卡片样式。'),
    quantity('space-limit','可拥有空间','账号可以创建并编辑的空间总数。','个空间'),
    quantity('scene-limit','每空间场景','每个空间可以创建的场景数量。','个场景'),
    quantity('group-limit','每场景分组','每个场景可以创建的分组数量。','个分组'),
    quantity('corner-limit','常用卡片数量','可以新建的常用卡片总数，系统暂存卡片不占额度。','张卡片'),
    quantity('memo-limit','我的小记','在用与归档合计，废纸船不占额度。','条'),
    quantity('todo-limit','我的待办','仅计算未完成的事项，已完成与已删除不占额度。','项'),
    quantity('icon-daily-limit','图标下载与复制','下载 SVG 与复制 SVG 共用每日次数，每天北京时间 00:00 重置。','次/天'),
    quantity('color-daily-limit','色号复制','公共库与个人收藏共用每日复制次数，当前默认不限量。','次/天'),
    selection('corner-colors','拾隅工具','卡片配色','常用卡片可以选择的颜色。',resources.cornerColors),
    flag('atlas-2d','收藏图谱','二维图谱','以平面关系图浏览收藏。'),
    flag('atlas-3d','收藏图谱','三维图谱','以立体关系图探索收藏。'),
    flag('share-password','分享','分享密码','为空间或场景的分享链接设置访问密码。'),
    flag('share-expiry','分享','分享有效期','为空间或场景的分享链接设置失效时间。'),
  ]};
}
function normalizePlan(input, catalog = getCatalog()) {
  const plan = clone(input);
  const old = new Map((plan.entitlements || []).map(item => [item.key,item]));
  const paid = plan.id !== 'free';
  const global = old.get('global-appearance')?.enabled ?? true;
  const independent = old.get('space-appearance')?.enabled ?? paid;
  const protectedShare = old.get('share-protection')?.enabled ?? paid;
  const legacyThemes = [...old.values()].filter(item => item.key.startsWith('theme-'));
  const selectedThemes = legacyThemes.length ? legacyThemes.filter(item => item.enabled).map(item => item.key.slice(6)) : catalog.resources.themes.filter(theme => paid || defaultFreeThemeIds.has(theme.id)).map(theme => theme.id);
  const limits = {'space-limit':paid?20:1,'scene-limit':paid?20:3,'group-limit':paid?20:3,'corner-limit':paid?12:3,'memo-limit':paid?200:20,'todo-limit':paid?500:50,'icon-daily-limit':paid?100:10,'color-daily-limit':0};
  const selectionDefaults = {
    themes:old.get('themes')?.enabled === false ? [] : selectedThemes,
    'global-fonts':global?catalog.resources.fonts.map(item=>item.id):[],
    'global-layouts':global?catalog.resources.layouts.map(item=>item.id):[],
    'global-colors':global?catalog.resources.colors.map(item=>item.id):[],
    'regular-styles':paid?catalog.resources.styles.map(item=>item.id):basicStyles,
    'corner-colors':paid?catalog.resources.cornerColors.map(item=>item.id):['theme'],
    'desktop-pets':catalog.resources.pets.map(item=>item.id),
  };
  const flagDefaults = {'global-custom-color':global,'space-font':independent,'space-layout':independent,'space-color':independent,'space-style-scene':paid,'atlas-2d':true,'atlas-3d':paid,'share-password':protectedShare,'share-expiry':protectedShare};
  const entitlements = catalog.items.map(definition => {
    const prior = old.get(definition.key);
    if (definition.kind === 'selection') {
      const selection = prior?.kind === 'selection' && Array.isArray(prior.value) ? prior.value : selectionDefaults[definition.key];
      return {...clone(definition),value:[...new Set(selection)],enabled:prior?.kind==='selection'?prior.enabled:Boolean(selection.length)};
    }
    if (definition.kind === 'quantity') return {...clone(definition),value:prior?.kind==='quantity'?Number(prior.value):limits[definition.key],enabled:prior?.enabled??true,...(['corner-limit','memo-limit','todo-limit','icon-daily-limit','color-daily-limit'].includes(definition.key)?{unlimited:prior?.unlimited??definition.key==='color-daily-limit'}:{})};
    return {...clone(definition),enabled:prior?.enabled??flagDefaults[definition.key]};
  });
  const catalogKeys = new Set(catalog.items.map(item => item.key));
  const legacyEntitlements = [...new Map([...(plan.legacyEntitlements||[]),...(plan.entitlements||[]).filter(item=>!catalogKeys.has(item.key))].map(item=>[item.key,item])).values()];
  const {publication,hasChanges,updatedAt,...fields}=plan;
  return {...fields,entitlements,...legacyEntitlements.length?{legacyEntitlements}:{}};
}
function business(plan) {
  const {version,publishedAt,publication,hasChanges,enabled,updatedAt,...data}=plan;
  return JSON.stringify(data);
}
function createPlanStore({file=path.join(root,'.local/shiyu-plans.json'),themesFile=path.join(root,'.local/shiyu-themes.json'),operationsFile=path.join(root,'.local/shiyu-operations.json')}={}) {
  const catalog=()=>getCatalog(themesFile,operationsFile);
  function read() {
    let raw;
    try { raw=JSON.parse(fs.readFileSync(file,'utf8')); } catch(error) {if(error.code!=='ENOENT')throw Error('套餐配置读取失败，请先检查已有配置');raw={items:clone(defaults)};}
    const schema=catalog();
    const items=(Array.isArray(raw.items)&&raw.items.length?raw.items:clone(defaults)).map(item=>{const plan=normalizePlan(item,schema);return plan.autoRenew?{...plan,enabled:false}:plan;});
    const drafts=(raw.schemaVersion===2&&Array.isArray(raw.drafts)?raw.drafts:items).map(item=>normalizePlan(item,schema));
    const defaultPlanId=items.find(plan=>plan.id===raw.defaultPlanId&&plan.enabled&&plan.id!=='free')?.id||items.find(plan=>plan.enabled&&plan.id!=='free')?.id||null;
    return {schemaVersion:2,revision:Number(raw.revision)||0,defaultPlanId,items,drafts,history:Array.isArray(raw.history)?raw.history:[],updatedAt:raw.updatedAt||null};
  }
  function adminView(state=read()) {
    return {schemaVersion:2,revision:state.revision,items:state.drafts.map(plan=>{
      const published=state.items.find(item=>item.id===plan.id);
      return {...clone(plan),enabled:published?.enabled===true,publication:published?(published.enabled?'published':'offline'):'draft',hasChanges:!published||business(plan)!==business(published),publishedAt:published?.publishedAt||null,version:published?.version||0};
    }),publishedItems:state.items.filter(item=>item.enabled).map(plan=>({...clone(plan),isDefault:plan.id===state.defaultPlanId}))};
  }
  function validatePlan(plan,previous) {
    if(!plan||typeof plan!=='object'||typeof plan.id!=='string'||!/^[-\w]{1,80}$/.test(plan.id)||typeof plan.name!=='string'||!plan.name.trim()||plan.name.length>30||typeof plan.cycle!=='string'||!plan.cycle.trim()||typeof plan.tag!=='string'||typeof plan.autoRenew!=='boolean')throw Error('请完整填写套餐信息');
    if(!Number.isInteger(plan.days)||plan.days<0||plan.days>3660||![plan.price,plan.original].every(value=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=100000&&Math.abs(value*100-Math.round(value*100))<0.00001))throw Error('套餐价格须保留至分，有效天数须为 0–3660 的整数');
    if(!Array.isArray(plan.entitlements)||!plan.entitlements.length||new Set(plan.entitlements.map(item=>item.key)).size!==plan.entitlements.length)throw Error('套餐权益配置无效或存在重复');
    const definitions=new Map(catalog().items.map(item=>[item.key,item]));
    if([...definitions.keys()].some(key=>!plan.entitlements.some(item=>item.key===key)))throw Error('权益配置不完整，请刷新后重新保存');
    for(const benefit of plan.entitlements){
      const definition=definitions.get(benefit.key);
      if(!definition)continue; // Preserve legacy rows without exposing configurable general features.
      if(benefit.kind!==definition.kind||typeof benefit.enabled!=='boolean')throw Error('权益类型无效');
      if(benefit.kind==='quantity'&&(!Number.isInteger(benefit.value)||benefit.value<0||benefit.value>1000000))throw Error('权益数量须为 0–1000000 的整数');
      if(benefit.unlimited!==undefined&&(typeof benefit.unlimited!=='boolean'||!['corner-limit','memo-limit','todo-limit','icon-daily-limit','color-daily-limit'].includes(benefit.key)))throw Error('不限量配置无效');
      if(benefit.kind==='selection'){
        const previousValue=previous?.entitlements.find(item=>item.key===benefit.key)?.value;
        const accepted=new Set([...definition.options.map(item=>item.id),...(Array.isArray(previousValue)?previousValue:[])]);
        if(!Array.isArray(benefit.value)||benefit.value.some(id=>typeof id!=='string'||!accepted.has(id))||new Set(benefit.value).size!==benefit.value.length)throw Error('请选择已实现的权益资源');
      }
    }
  }
  function validatePublication(plan) {
    if(plan.autoRenew)throw Error('自动扣款尚未开通，连续续费套餐暂不能上线，请改为单次购买');
    if(plan.id!=='free'&&(plan.price<=0||plan.days<=0))throw Error('付费套餐上线前请设置大于 0 的价格和有效天数');
    if(plan.id==='free'&&plan.price!==0)throw Error('免费版价格须为 0');
    for(const key of ['themes','global-fonts','global-layouts','global-colors','regular-styles']){
      const benefit=plan.entitlements.find(item=>item.key===key);
      if(plan.id==='free'&&(!benefit?.enabled||!benefit.value.some(id=>benefit.options.some(option=>option.id===id&&option.enabled!==false))))throw Error('免费版需保留至少一个可用主题、字体、布局、配色和网址样式');
    }
  }
  function mutate(body,operator='管理员') {
    const state=read();
    if(body.revision!==state.revision){const error=Error('配置已被其他操作更新，请刷新后重试');error.status=409;throw error;}
    const now=new Date().toISOString();
    let actionLabel;
    if(body.action==='set-default'){
      const plan=state.items.find(item=>item.id===body.id&&item.enabled&&item.id!=='free'&&!item.autoRenew);
      if(!plan)throw Error('请选择已上线的单次购买付费套餐');
      state.defaultPlanId=plan.id;actionLabel='设置默认套餐';
    }else if(body.action==='save-and-publish'){
      if(!Array.isArray(body.items)||!body.items.length||body.items.some(plan=>!plan||typeof plan!=='object')||new Set(body.items.map(plan=>plan.id)).size!==body.items.length)throw Error('套餐列表无效');
      const free=body.items.find(plan=>plan.id==='free');
      if(!free)throw Error('需保留免费版作为基础权限来源');
      if(free.enabled!==true)throw Error('免费版是基础权限来源，需保持上线');
      const previous=new Map([...state.items,...state.drafts].map(plan=>[plan.id,plan]));
      if([...previous.keys()].some(id=>!body.items.some(plan=>plan.id===id)))throw Error('已有套餐请下线保留，不可直接删除');
      const schema=catalog();
      // Validate the whole submission before changing either view or writing a file.
      const drafts=body.items.map(plan=>{
        if(typeof plan.enabled!=='boolean')throw Error('请明确设置套餐上线状态');
        validatePlan(plan,previous.get(plan.id));
        const normalized=normalizePlan(plan,schema);
        if(normalized.enabled)validatePublication(normalized);
        return normalized;
      });
      const priorById=new Map(state.items.map(plan=>[plan.id,plan]));
      const published=[];
      for(const draft of drafts){
        const prior=priorById.get(draft.id);
        if(draft.enabled){
          const changed=!prior||prior.enabled!==true||!Number.isInteger(prior.version)||prior.version<1||business(draft)!==business(prior);
          published.push({...clone(draft),enabled:true,version:changed?(prior?.version||0)+1:prior.version||0,publishedAt:changed?now:prior.publishedAt||null});
        }else if(prior){
          // Offline edits stay private. Existing grants retain the last published rights.
          published.push({...clone(prior),enabled:false});
        }
        const effective=published.find(plan=>plan.id===draft.id);
        draft.version=effective?.version||0;draft.publishedAt=effective?.publishedAt||null;
      }
      state.drafts=drafts;state.items=published;actionLabel='保存并发布';
    }else if(body.action==='save-draft'){
      if(!Array.isArray(body.items)||!body.items.length||new Set(body.items.map(item=>item.id)).size!==body.items.length)throw Error('套餐列表无效');
      if(!body.items.some(plan=>plan.id==='free'))throw Error('需保留免费版作为基础权限来源');
      const previous=new Map(state.drafts.map(plan=>[plan.id,plan]));
      if([...previous.keys()].some(id=>!body.items.some(plan=>plan.id===id)))throw Error('已有套餐请下线保留，不可直接删除');
      body.items.forEach(plan=>validatePlan(plan,previous.get(plan.id)));
      state.drafts=body.items.map(plan=>{
        const normalized=normalizePlan(plan,catalog());
        normalized.enabled=state.items.find(item=>item.id===plan.id)?.enabled===true;
        return normalized;
      });
      actionLabel='保存草稿';
    }else if(body.action==='publish'){
      const draft=state.drafts.find(plan=>plan.id===body.id);if(!draft)throw Error('套餐不存在');
      validatePlan(draft,draft);
      validatePublication(draft);
      const prior=state.items.find(plan=>plan.id===draft.id);
      const published={...clone(draft),enabled:true,version:(prior?.version||0)+1,publishedAt:now};
      state.items=state.items.filter(plan=>plan.id!==draft.id);state.items.push(published);
      // Publishing a new draft commits the chosen order without exposing other draft changes.
      const order=new Map(state.drafts.map((plan,index)=>[plan.id,index]));state.items.sort((a,b)=>(order.get(a.id)??999)-(order.get(b.id)??999));
      draft.enabled=true;actionLabel='上线套餐';
    }else if(body.action==='unpublish'){
      if(body.id==='free')throw Error('免费版是基础权限来源，需保持上线');
      const published=state.items.find(plan=>plan.id===body.id);if(!published)throw Error('套餐尚未上线');
      published.enabled=false;const draft=state.drafts.find(plan=>plan.id===body.id);if(draft)draft.enabled=false;actionLabel='下线套餐';
    }else throw Error('操作类型无效');
    if(!state.items.some(plan=>plan.id===state.defaultPlanId&&plan.enabled&&plan.id!=='free'))state.defaultPlanId=state.items.find(plan=>plan.enabled&&plan.id!=='free')?.id||null;
    state.revision+=1;state.updatedAt=now;
    state.history.unshift({id:randomUUID(),savedAt:now,operator,action:actionLabel,planId:body.id||null,items:clone(['save-draft','save-and-publish'].includes(body.action)?state.drafts:state.items),defaultPlanId:state.defaultPlanId,publishedItems:state.items.map(plan=>({...clone(plan),isDefault:plan.id===state.defaultPlanId}))});
    fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify(state,null,2)+'\n','utf8');fs.renameSync(file+'.tmp',file);
    return adminView(state);
  }
  return {getCatalog:catalog,readState:read,readAdminPlans:adminView,readPublishedPlans:()=>{const state=read();return state.items.filter(plan=>plan.enabled).map(plan=>({...clone(plan),isDefault:plan.id===state.defaultPlanId}));},publishedPlan:id=>{const plan=read().items.find(item=>item.id===id&&item.enabled);return plan?clone(plan):null;},retainedPlan:id=>{const plan=read().items.find(item=>item.id===id);return plan?clone(plan):null;},readHistory:()=>clone(read().history),mutate};
}
const defaultStore=createPlanStore();
function effectiveEntitlements(planOrId){const plan=typeof planOrId==='string'?defaultStore.publishedPlan(planOrId):planOrId;return clone(plan?.entitlements||[]);}
module.exports={createPlanStore,readThemes,getCatalog,normalizePlan,effectiveEntitlements,readPublishedPlans:()=>defaultStore.readPublishedPlans(),readAdminPlans:()=>defaultStore.readAdminPlans(),publishedPlan:id=>defaultStore.publishedPlan(id),retainedPlan:id=>defaultStore.retainedPlan(id),readHistory:()=>defaultStore.readHistory(),mutate:(body,operator)=>defaultStore.mutate(body,operator)};
