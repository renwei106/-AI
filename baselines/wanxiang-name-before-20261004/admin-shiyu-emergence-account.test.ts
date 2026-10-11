import { afterAll, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'
const directory=mkdtempSync(join(tmpdir(),'emergence-account-'))
process.env.SHIYU_USERS_FILE=join(directory,'users.json')
process.env.SHIYU_THEME_ACCESS_STORE=join(directory,'sessions.json')
const users=[{id:'A',name:'A',blacklisted:false,accountData:[],currentTheme:'万象涌现'},{id:'B',name:'B',blacklisted:false,accountData:[]}]
writeFileSync(process.env.SHIYU_USERS_FILE,JSON.stringify({items:users}))
const {shiyuUserPlugin}=await import('./shiyu-user-plugin')
const sessions=createRequire(import.meta.url)('../导航站/theme-access/store.cjs')
const tokens={A:sessions.issueSession('A'),B:sessions.issueSession('B')}
afterAll(()=>rmSync(directory,{recursive:true,force:true}))
it('saves emergence settings by authenticated account without changing workspace data',async()=>{
 let middleware:Function=()=>{};(shiyuUserPlugin().configureServer as Function)({middlewares:{use(fn:Function){middleware=fn}}})
 async function request(method:string,identity:'A'|'B'|null,body:unknown={},headers={}){
  let data:any,status=0
  const req={url:'/api/shiyu/auth/emergence',method,headers:{host:'127.0.0.1:5175','content-type':'application/json',cookie:identity?'shiyu_user_session='+tokens[identity]:'',...headers},async *[Symbol.asyncIterator](){yield Buffer.from(JSON.stringify(body))}}
  await middleware(req,{set statusCode(v:number){status=v},setHeader(){},end(text:string){data=JSON.parse(text)}},()=>{});return {status,data}
 }
 expect((await request('GET',null)).status).toBe(401)
 expect((await request('GET','A')).data.settings).toBeNull()
 const settings={scene:'cosmos',configs:{cosmos:{speed:.45,timeScale:10,depth:'depth',blackHoleMass:65536},birds:{shape:'fish',predators:0}}}
 const saved=await request('PUT','A',{userId:'A',settings});expect(saved.status).toBe(200)
 expect(saved.data.settings.configs.cosmos).toMatchObject(settings.configs.cosmos)
 expect((await request('GET','A')).data.settings).toEqual(saved.data.settings)
 expect((await request('GET','B')).data.settings).toBeNull()
 const disk=JSON.parse(readFileSync(process.env.SHIYU_USERS_FILE!,'utf8'))
 expect(disk.items[0].accountData).toEqual([]);expect(disk.items[0].currentTheme).toBe('万象涌现');expect(disk.items[1]).toEqual(users[1])
 expect((await request('PUT','B',{userId:'A',settings})).status).toBe(409)
 expect((await request('PUT',null,{userId:'A',settings})).status).toBe(401)
 expect((await request('PUT','A',{userId:'A',settings:{...settings,scene:'water'}})).status).toBe(400)
 expect((await request('PUT','A',{userId:'A',settings:{scene:'birds',configs:{birds:{speed:100}}}})).status).toBe(400)
 expect((await request('PUT','A',{userId:'A',settings},{origin:'https://invalid.example'})).status).toBe(403)
 expect((await request('PUT','A',{userId:'A',settings},{'content-type':'text/plain'})).status).toBe(415)
 expect(JSON.parse(readFileSync(process.env.SHIYU_USERS_FILE!,'utf8')).items).toEqual(disk.items)
})
