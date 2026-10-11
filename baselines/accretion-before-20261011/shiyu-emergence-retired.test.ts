import {expect,it} from 'vitest'
import {emergenceScenes,normalizeEmergenceContent,normalizeEmergencePreferences} from './shiyu-emergence-config'
it('removes retired experiments and migrates their saved selections',()=>{
 expect(emergenceScenes.map(s=>s.id)).toEqual(['birds','cosmos'])
 for(const scene of ['stars','gravity']){
  expect(normalizeEmergencePreferences({scene,configs:{[scene]:{count:10000},birds:{predators:0}}})).toMatchObject({scene:'birds',configs:{birds:{predators:0}}})
  expect(normalizeEmergenceContent({defaultScene:scene,scenes:{birds:{enabled:false},cosmos:{enabled:true},[scene]:{enabled:true}}}).defaultScene).toBe('cosmos')
 }
 expect(()=>normalizeEmergencePreferences({scene:'unknown',configs:{}})).toThrow()
 expect(Object.keys(normalizeEmergenceContent({}).scenes)).toEqual(['birds','cosmos'])
 expect(normalizeEmergencePreferences({scene:'birds',configs:{birds:{pointer:'magnify'}}}).configs.birds.pointer).toBe('repel')
 expect(normalizeEmergencePreferences({scene:'cosmos',configs:{cosmos:{pointer:'magnify'}}}).configs.cosmos.pointer).toBe('none')
})
