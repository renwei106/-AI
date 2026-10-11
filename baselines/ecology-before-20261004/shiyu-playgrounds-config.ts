import catalog from './shiyu-playgrounds-catalog.json'
export type PlaygroundField={key:string;label:string;value:number;min:number;max:number;step:number}
export type PlaygroundDefinition={id:string;name:string;fields:PlaygroundField[]}
export const playgroundCatalog=catalog as PlaygroundDefinition[]
export type PlaygroundScene={enabled:boolean;defaults:Record<string,number>}
export type PlaygroundScenes=Record<string,PlaygroundScene>
export const playgroundDefaults:PlaygroundScenes=Object.fromEntries([{id:'threeBody',fields:[]},...playgroundCatalog].map(s=>[s.id,{enabled:true,defaults:Object.fromEntries(s.fields.map(f=>[f.key,f.value]))}]))
export function normalizePlaygroundScenes(input:unknown):PlaygroundScenes{
 const source=input&&typeof input==='object'?input as Record<string,Partial<PlaygroundScene>>:{}
 const result:PlaygroundScenes={threeBody:{enabled:source.threeBody?.enabled!==false,defaults:{}}}
 for(const scene of playgroundCatalog){const saved=source[scene.id];result[scene.id]={enabled:saved?.enabled!==false,defaults:Object.fromEntries(scene.fields.map(f=>{const value=saved?.defaults?.[f.key]??f.value;if(!Number.isFinite(value)||value<f.min||value>f.max)throw Error(`${scene.name}参数超出允许范围`);return [f.key,f.step>=1?Math.round(value):value]}))}}
 if(!Object.values(result).some(s=>s.enabled))throw Error('至少保留一个可用玩法')
 return result
}
