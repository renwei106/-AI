/* Public feature definitions shared by the operations API and its admin editors. */
import petResources from './membership/pets.json'
export const featureModules = {
  world: '拾隅世界', corner: '子应用', spaceViews: '空间视图',
  themes: '主题', colors: '配色', fonts: '字体', pet: '桌面宠物',
} as const
export type FeatureId = keyof typeof featureModules
export const featureIds = Object.keys(featureModules) as FeatureId[]
export type ReleaseRule = { id: string; name: string; features: FeatureId[]; audience: 'all'|'whitelist'|'percentage'; percentage: number; whitelist: string; blacklist: string }
export type ReleaseControl = { rules: ReleaseRule[] }
export type Option = { enabled: boolean; name: string; value?: string }
export type Personalization = Record<'themes'|'colors'|'fonts'|'pet', { enabled: boolean; order: string[]; options: Record<string,Option> }>
export const paperActionStates = [
  {id:'sit',name:'坐',actions:[['sit-rest','轻晃草帽',0],['sit-wave','坐着招手',1],['sit-yawn','坐着打哈欠',4]]},
  {id:'lie',name:'卧',actions:[['lie-rest','侧卧休息',20],['lie-wave','卧着招手',21],['lie-yawn','卧着打哈欠',22]]},
  {id:'stand',name:'站',actions:[['stand-rest','站立张望',9],['stand-wave','站立招手',10],['stand-dance','轻轻转身',11]]},
  {id:'jog',name:'小跑',actions:[['jog-light','轻快小跑',16],['jog-bounce','雀跃小跑',17],['jog-turn','转身小跑',18]]},
  {id:'sprint',name:'快跑',actions:[['sprint-fast','加速快跑',19],['sprint-lean','前倾冲刺',17],['sprint-dash','短途冲刺',18]]},
  {id:'jump',name:'跳跃',actions:[['jump-hop','原地轻跳',24],['jump-leap','跨越跳跃',26],['jump-wave','跳起招手',25]]},
  {id:'flight',name:'飞行',actions:[['flight-hover','轻轻悬停',28],['flight-glide','张臂滑翔',29],['flight-turn','空中转身',30]]},
] as const
export const swordswomanActionStates = [{"id":"sit","name":"坐","actions":[["swordswoman-sit-meditate","抱剑静坐",4],["swordswoman-sit-hug","抱剑轻倚",4],["swordswoman-sit-look","坐看四周",4]]},{"id":"lie","name":"卧","actions":[["swordswoman-lie-rest","扣笠小憩",8],["swordswoman-lie-stretch","翘腿舒展",8],["swordswoman-lie-breathe","枕手休息",8]]},{"id":"stand","name":"站","actions":[["swordswoman-stand-draw","拔剑归鞘",0],["swordswoman-stand-practice","横剑练习",0],["swordswoman-stand-guard","持剑守望",0]]},{"id":"jog","name":"小跑","actions":[["swordswoman-jog-light","持剑小跑",12],["swordswoman-jog-steady","轻步前行",12],["swordswoman-jog-swift","疾步赶路",12]]},{"id":"sprint","name":"快跑","actions":[["swordswoman-sprint-fast","俯身疾跑",16],["swordswoman-sprint-dash","提速冲刺",16],["swordswoman-sprint-chase","追风快跑",16]]},{"id":"jump","name":"跳跃","actions":[["swordswoman-jump-hop","轻身起跳",20],["swordswoman-jump-leap","凌空跨越",20],["swordswoman-jump-land","踏空落步",20]]},{"id":"flight","name":"飞行","actions":[["swordswoman-flight-glide","御风滑行",24],["swordswoman-flight-float","轻功悬停",24],["swordswoman-flight-descend","乘风回落",24]]}] as const
export type PetActions = Record<string,boolean>
export type PetTempo = { group:number; gap:number; state:number }
export type PetTiming = Record<'quiet'|'lively'|'excited',Record<'idle'|'hover',PetTempo>>
export const petTimingDefaults:PetTiming={
  quiet:{idle:{group:3500,gap:1800,state:30000},hover:{group:3500,gap:1800,state:30000}},
  lively:{idle:{group:2800,gap:1200,state:23000},hover:{group:2800,gap:1200,state:23000}},
  excited:{idle:{group:2200,gap:800,state:16000},hover:{group:2200,gap:800,state:16000}},
}
export function normalizePetTiming(input:unknown):PetTiming {
  const source=record(input),result=structuredClone(petTimingDefaults)
  for(const personality of ['quiet','lively','excited'] as const)for(const mode of ['idle','hover'] as const){
    const values=record(record(source[personality])[mode])
    for(const key of ['group','gap','state'] as const){
      if(values[key]===undefined)continue
      const value=values[key],bounds={group:[1000,10000],gap:[0,30000],state:[3000,300000]}[key]
      if(typeof value!=='number'||!Number.isFinite(value)||value<bounds[0]||value>bounds[1])throw new Error('动作时间超出允许范围，请检查秒数')
      result[personality][mode][key]=Math.round(value)
    }
    if(mode==='idle'&&result[personality][mode].state<result[personality][mode].group+result[personality][mode].gap)throw new Error('状态切换间隔不能短于一组动作时长与组间停顿之和')
  }
  return result
}
export const paperActionDefaults:PetActions=Object.fromEntries([...paperActionStates,...swordswomanActionStates].flatMap(state=>state.actions.map(([id])=>[id,true])))
export function normalizePetActions(input:unknown):PetActions {
  const source=record(input),result:PetActions={}
  for(const state of [...paperActionStates,...swordswomanActionStates]){
    for(const [id] of state.actions)result[id]=source[id]!==false
    if(!state.actions.some(([id])=>result[id]))throw new Error(`${state.name}状态至少启用一个动作`)
  }
  return result
}

const entries = (items: [string,string][]) => Object.fromEntries(items.map(([id,name])=>[id,{enabled:true,name}])) as Record<string,Option>
const category = (items: [string,string][]) => ({enabled:true,order:items.map(([id])=>id),options:entries(items)})
const themeDefaults=category([['base','留白日常'],['music','黑胶时光'],['flow','灵感流体'],['poly','棱光拾景'],['cosmos','星际漫游'],['globe','星海行旅'],['flip','翻页光阴'],['rain','时间之雨'],['cinema','人生拾影'],['paper','拾光日报'],['avatarGirl','阿织 · 3D'],['avatarVideo','阿织 · 影像'],['avatarScrub','阿织 · 时间轴'],['forestCompanion','幻境奇遇'],['emergence','万象涌现']])
for(const id of ['avatarGirl','avatarVideo','avatarScrub'])themeDefaults.options[id].enabled=false
export const personalizationDefaults: Personalization = {
  themes: themeDefaults,
  colors: category([['#48614c','苔径青绿'],['#45433c','山岩石墨'],['#bd9055','麦田暖金'],['#467ea5','远山雾蓝'],['#8b83d1','暮色浅紫'],['#ba794f','陶土暖橙'],['#a95e76','干枯玫瑰'],['custom','自定义配色']]),
  fonts: category([['youfeng','拾隅游风'],['qingya','拾隅清雅宋'],['wenrun','拾隅温润楷'],['sans','清晰黑体'],['serif','经典宋体'],['kai','温润楷体'],['fang','雅致仿宋'],['hei','几何黑体'],['mono','等宽科技']]),
  pet: category(petResources.map(({id,name}):[string,string]=>[id,name])),
}
export const optionNameDefaults = {
  world:'拾隅世界', corner:'子应用', spaceViews:'空间视图',
  'spaceViews.regular':'宫格视图', 'spaceViews.regular.follow':'跟随主题', 'spaceViews.regular.cards':'卡片', 'spaceViews.regular.list':'列表', 'spaceViews.regular.poker':'扑克牌', 'spaceViews.regular.paper':'报纸', 'spaceViews.regular.record':'唱片', 'spaceViews.regular.film':'电影', 'spaceViews.regular.planet':'星球', 'spaceViews.regular.calendar':'日历',
  'spaceViews.graph':'图谱视图', 'spaceViews.graph.twoD':'2D 视图', 'spaceViews.graph.twoD.radial':'径向环绕', 'spaceViews.graph.twoD.organization':'层级结构', 'spaceViews.graph.twoD.mindmap':'思维脉络', 'spaceViews.graph.threeD':'3D 视图', 'spaceViews.graph.threeD.micro':'微观结构', 'spaceViews.graph.threeD.galaxy':'银河星系',
} as const
export type OptionNames = Record<keyof typeof optionNameDefaults,string>
const record = (v:unknown):Record<string,unknown> => v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{}
export const identifiers = (value:unknown) => [...new Set(String(value||'').split(/[\s,，;；]+/).map(item=>item.trim().toLowerCase()).filter(Boolean))]
const validIdentifier = (item:string) => /^1\d{10}$/.test(item)||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item)||/^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/.test(item)
const name = (value:unknown,fallback:string) => String(value??fallback).trim().slice(0,24)||fallback

export function normalizeOptionNames(input:unknown):OptionNames {
  const source=record(input),result={...optionNameDefaults} as OptionNames
  for(const [key,defaultName] of Object.entries(optionNameDefaults))result[key as keyof OptionNames]=name(source[key],defaultName)
  return result
}
// Omitted categories retain their latest saved values when an individual menu saves.
export function mergePersonalization(current: Personalization, patch: unknown): Personalization {
  return normalizePersonalization({ ...current, ...record(patch) })
}

export function normalizePersonalization(input:unknown):Personalization {
  const source=record(input),result={} as Personalization
  for(const category of Object.keys(personalizationDefaults) as (keyof Personalization)[]){
    const saved=record(source[category]),savedOptions=record(saved.options),defaults=personalizationDefaults[category]
    const options:Record<string,Option>={}
    for(const [id,defaultOption] of Object.entries(defaults.options)){
      const option=record(savedOptions[id]);options[id]={enabled:option.enabled===undefined?defaultOption.enabled:option.enabled!==false,name:name(option.name,defaultOption.name)}
      if(category==='colors'){
        const value=id==='custom'?'':String(option.value||id).trim().toLowerCase()
        if(id!=='custom'&&!/^#[0-9a-f]{6}$/.test(value))throw new Error('个性化配色须为六位十六进制颜色')
        options[id].value=value
      }
    }
    if(category==='colors'&&new Set(Object.values(options).map(option=>option.value).filter(Boolean)).size!==Object.values(options).filter(option=>option.value).length)throw new Error('个性化配色不能重复')
    const enabled=saved.enabled!==false
    if(enabled&&!Object.values(options).some(option=>option.enabled))throw new Error(`${featureModules[category]}至少保留一个可用选项`)
    const savedOrder=Array.isArray(saved.order)?saved.order.map(String):[]
    const order=[...new Set([...savedOrder,...Object.keys(defaults.options)])].filter(id=>id in defaults.options)
    result[category]={enabled,order,options}
  }
  return result
}
export function normalizeReleaseControl(input:unknown,legacy?:{audience?:string;percentage?:number;whitelist?:string;blacklist?:string}):ReleaseControl {
  const saved=record(input),raw=saved.rules
  const seed=legacy&&(legacy.audience!=='all'||legacy.blacklist||legacy.whitelist)?[{id:'world-legacy',name:'拾隅世界原有开放规则',features:['world'],audience:legacy.audience||'all',percentage:legacy.percentage??20,whitelist:legacy.whitelist||'',blacklist:legacy.blacklist||''}]:[]
  const rules=Array.isArray(raw)?raw:seed
  if(rules.length>30)throw new Error('开放规则最多 30 条')
  const assigned=new Set<string>(),ids=new Set<string>()
  return {rules:rules.map((rawRule:unknown,index:number)=>{
    const rule=record(rawRule),id=String(rule.id||`rule-${index}`).slice(0,64)
    if(!/^[a-zA-Z0-9_-]+$/.test(id)||ids.has(id))throw new Error('开放规则 ID 无效或重复')
    ids.add(id)
    const features=[...new Set((Array.isArray(rule.features)?rule.features:[]).map(String))] as FeatureId[]
    if(!features.length||features.some(item=>!featureIds.includes(item)))throw new Error('请选择有效的功能模块')
    for(const feature of features){if(assigned.has(feature))throw new Error(`${featureModules[feature]}不能同时分配给多条规则`);assigned.add(feature)}
    const audience=rule.audience==='whitelist'||rule.audience==='percentage'?rule.audience:'all'
    const whitelist=identifiers(rule.whitelist),blacklist=identifiers(rule.blacklist)
    if([...whitelist,...blacklist].some(item=>!validIdentifier(item)))throw new Error('开放名单中有无效手机号、邮箱或用户 ID')
    if(audience==='whitelist'&&!whitelist.length)throw new Error('仅名单开放时，请至少选择一位用户')
    const percentage=Number(rule.percentage)
    return {id,name:name(rule.name,`开放规则 ${index+1}`),features,audience,percentage:Number.isFinite(percentage)?Math.max(0,Math.min(100,Math.round(percentage))):20,whitelist:whitelist.join('\n'),blacklist:blacklist.join('\n')}
  })}
}
const bucket = (id:string) => {let hash=2166136261;for(const c of id)hash=Math.imul(hash^c.charCodeAt(0),16777619);return (hash>>>0)%100}
export function effectiveAccess(control:ReleaseControl,user:{id?:string;phone?:string;email?:string;blacklisted?:boolean}|null):Record<FeatureId,boolean> {
  const identities=[user?.phone,user?.email,user?.id].map(item=>String(item||'').trim().toLowerCase()).filter(Boolean)
  const output={} as Record<FeatureId,boolean>
  for(const feature of featureIds){
    const rule=control.rules.find(item=>item.features.includes(feature))
    if(!rule){output[feature]=true;continue}
    const blocked=identifiers(rule.blacklist).some(item=>identities.includes(item))
    const listed=identifiers(rule.whitelist).some(item=>identities.includes(item))
    output[feature]=!user?.blacklisted&&!blocked&&(rule.audience==='all'||listed||(rule.audience==='percentage'&&bucket(user?.id||'guest')<rule.percentage))
  }
  return output
}
