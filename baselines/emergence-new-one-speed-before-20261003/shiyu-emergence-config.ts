import schema from './membership/emergence-scenes.json'

export type EmergenceField = { key:string; label:string; type:string; value:string|number; min?:number; max?:number; step?:number; unit?:string; hint?:string; options?:string[][] }
export const emergenceScenes = schema as Array<{id:string;name:string;basic:EmergenceField[];advanced:EmergenceField[];lifecycle:Array<{title:string;fields:EmergenceField[]}>;physics:Array<{title:string;fields:EmergenceField[]}>}>
export type EmergenceContent = { defaultScene:string; allowCustomize:boolean; scenes:Record<string,{enabled:boolean;defaults:Record<string,string|number>}> }
export type EmergencePreferences = { scene:string; configs:Record<string,Record<string,string|number>> }
export function normalizeEmergencePreferences(input:unknown):EmergencePreferences {
  const raw=record(input),configs=record(raw.configs),ids=emergenceScenes.map(scene=>scene.id)
  if(typeof raw.scene!=='string'||!ids.includes(raw.scene)||Object.keys(configs).some(id=>!ids.includes(id)))throw Error('涌现场景无效')
  const content=normalizeEmergenceContent({defaultScene:raw.scene,scenes:Object.fromEntries(Object.entries(configs).map(([id,defaults])=>[id,{defaults}]))})
  return {scene:raw.scene,configs:Object.fromEntries(Object.keys(configs).map(id=>[id,content.scenes[id].defaults]))}
}
const fields = (id:string) => { const s=emergenceScenes.find(s=>s.id===id)!; return [...s.basic,...s.advanced,...s.lifecycle.flatMap(g=>g.fields),...s.physics.flatMap(g=>g.fields)] }
export const emergenceDefaults:EmergenceContent = {defaultScene:'birds',allowCustomize:true,scenes:Object.fromEntries(emergenceScenes.map(s=>[s.id,{enabled:true,defaults:Object.fromEntries(fields(s.id).map(f=>[f.key,f.value]))}]))}
const record = (v:unknown):Record<string,unknown> => v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{}
export function normalizeEmergenceContent(input:unknown):EmergenceContent {
  let raw=record(input)
  const legacy=record(raw.scenes)
  if(legacy.fish){
    const birds=record(legacy.birds),fish=record(legacy.fish),preferFish=raw.defaultScene==='fish'||!legacy.birds||birds.enabled===false&&fish.enabled===true
    const chosen=preferFish?fish:birds,scenes:Record<string,unknown>={...legacy,birds:{...chosen,enabled:birds.enabled===true||fish.enabled===true,defaults:{...(preferFish?{shape:'fish'}:{}),...record(chosen.defaults)}}}
    delete scenes.fish
    raw={...raw,defaultScene:raw.defaultScene==='fish'?'birds':raw.defaultScene,scenes}
  }
  const result=structuredClone(emergenceDefaults)
  if(raw.allowCustomize!==undefined){if(typeof raw.allowCustomize!=='boolean')throw Error('涌现自定义开关无效');result.allowCustomize=raw.allowCustomize}
  if(raw.defaultScene!==undefined){if(typeof raw.defaultScene!=='string'||!result.scenes[raw.defaultScene])throw Error('涌现默认场景无效');result.defaultScene=raw.defaultScene}
  for(const scene of emergenceScenes){
    const value=record(record(raw.scenes)[scene.id]),defaults=record(value.defaults),target=result.scenes[scene.id]
    if(value.enabled!==undefined){if(typeof value.enabled!=='boolean')throw Error('涌现场景开关无效');target.enabled=value.enabled}
    for(const f of fields(scene.id)){
      const v=f.key==='collisions'&&defaults[f.key]==='merge'?'auto':defaults[f.key];if(v===undefined)continue
      if(f.type==='choice') {if(typeof v!=='string'||!f.options?.some(([key])=>key===v))throw Error(`${scene.name}：${f.label}无效`);target.defaults[f.key]=v}
      else {if(typeof v!=='number'||!Number.isFinite(v)||v<f.min!||v>f.max!)throw Error(`${scene.name}：${f.label}超出范围`);target.defaults[f.key]=Number((f.min!+Math.round((v-f.min!)/f.step!)*f.step!).toFixed(4))}
    }
    if(scene.lifecycle.length){target.defaults.populationCap=Math.max(Number(target.defaults.count),Number(target.defaults.populationCap));target.defaults.predatorCap=Math.max(Number(target.defaults.predators),Number(target.defaults.predatorCap))}
  }
  if(!Object.values(result.scenes).some(s=>s.enabled))throw Error('涌现至少保留一个场景')
  if(!result.scenes[result.defaultScene].enabled)throw Error('请将涌现默认场景设为已开启的场景')
  return result
}

