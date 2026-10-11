export type ThreeBodyContent = { allowCustomize: boolean; defaults: { gravity:number; speed:number; bodies:Array<{mass:number;x:number;y:number;vx:number;vy:number}> } }
const initial=[[-.97000436,.24308753,.466203685,.43236573],[.97000436,-.24308753,.466203685,.43236573],[0,0,-.93240737,-.86473146]]
export const threeBodyDefaults:ThreeBodyContent={allowCustomize:true,defaults:{gravity:1,speed:1,bodies:initial.map(([x,y,vx,vy])=>({mass:1,x,y,vx,vy}))}}
export function normalizeThreeBodyContent(input:unknown):ThreeBodyContent {
 const s=input&&typeof input==='object'?input as Partial<ThreeBodyContent>:{},d=s.defaults
 const number=(v:unknown,fallback:number,min:number,max:number)=>{if(v===undefined)return fallback;const n=Number(v);if(!Number.isFinite(n)||n<min||n>max)throw Error('三体参数超出允许范围');return n}
 return {allowCustomize:s.allowCustomize!==false,defaults:{gravity:number(d?.gravity,1,.2,2),speed:number(d?.speed,1,.2,2),bodies:threeBodyDefaults.defaults.bodies.map((b,i)=>({...b,mass:number(d?.bodies?.[i]?.mass,1,.2,3)}))}}
}
