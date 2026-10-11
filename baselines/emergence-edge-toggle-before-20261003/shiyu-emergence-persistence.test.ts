import { afterAll, expect, it, vi } from 'vitest'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const isolated=vi.hoisted(()=>({file:'',authorized:true}))
vi.mock('./platform-access-plugin',()=>({getPlatformSession:()=>isolated.authorized?{superadmin:true,applicationIds:['shiyu']}:null}))
vi.mock('node:fs',async original=>{
 const fs=await original<typeof import('node:fs')>()
 const path=(p:unknown)=>String(p).replaceAll('\\','/').endsWith('/.local/shiyu-operations.json')?isolated.file:String(p).replaceAll('\\','/').endsWith('/.local/shiyu-operations.json.tmp')?isolated.file+'.tmp':p
 return {...fs,existsSync:(p:never)=>fs.existsSync(path(p) as never),readFileSync:(p:never,o:never)=>fs.readFileSync(path(p) as never,o),writeFileSync:(p:never,d:never,o:never)=>fs.writeFileSync(path(p) as never,d,o),renameSync:(a:never,b:never)=>fs.renameSync(path(a) as never,path(b) as never)}
})
import { shiyuOperationsPlugin } from './shiyu-operations-plugin'
const directory=mkdtempSync(join(tmpdir(),'emergence-persistence-'));isolated.file=join(directory,'operations.json')
afterAll(()=>rmSync(directory,{recursive:true,force:true}))
it('round-trips emergence settings, preserves unrelated settings, and rejects invalid/unauthorized writes',async()=>{
 let middleware:Function=()=>{};(shiyuOperationsPlugin().configureServer as Function)({middlewares:{use(fn:Function){middleware=fn}}})
 async function request(method:string,body:unknown={}){
  let data:any,status=0
  const req={url:'/api/shiyu/operations',method,headers:{},async *[Symbol.asyncIterator](){yield Buffer.from(JSON.stringify(body))}}
  await middleware(req,{set statusCode(n:number){status=n},setHeader(){},end(text:string){data=JSON.parse(text)}},()=>{});return {status,data}
 }
 const initial=(await request('GET')).data,content=structuredClone(initial.emergenceContent)
 content.defaultScene='birds';content.scenes.cosmos.enabled=false;content.scenes.birds.defaults.speed=1.2;content.scenes.birds.defaults.depth='depth';content.scenes.birds.defaults.shape='bird';content.allowCustomize=false
 content.scenes.cosmos.defaults={...content.scenes.cosmos.defaults,mutualGravity:1.2,collisions:'merge',fragmentSpeed:2.4,fragmentGrace:3,mergeOverlap:80,mergeCooldown:6}
 const saved=await request('PUT',{emergenceContent:content});expect(saved.status).toBe(200);expect(saved.data.emergenceContent).toEqual(content)
 expect(JSON.parse(readFileSync(isolated.file,'utf8')).emergenceContent).toEqual(content)
 await request('PUT',{officialFont:initial.officialFont});const restored=(await request('GET')).data
 expect(restored.emergenceContent).toEqual(content);expect(restored.personalization).toEqual(initial.personalization);expect(restored.forestContent).toEqual(initial.forestContent)
 const before=readFileSync(isolated.file,'utf8')
 expect((await request('PUT',{emergenceContent:{defaultScene:'water'}})).status).toBe(400)
 isolated.authorized=false;expect((await request('PUT',{emergenceContent:initial.emergenceContent})).status).toBe(403)
 expect(readFileSync(isolated.file,'utf8')).toBe(before)
})
