import { describe, expect, it } from 'vitest'
import { emergenceDefaults, normalizeEmergenceContent } from './shiyu-emergence-config'
import { mergePersonalization, normalizePersonalization, personalizationDefaults } from './shiyu-feature-config'
import { readThemes } from './shiyu-theme-plugin'
describe('emergence configuration',()=>{
 it('registers an independent theme while preserving other personalization',()=>{
  expect(readThemes().some(t=>t.id==='emergence')).toBe(true)
  const merged=mergePersonalization(personalizationDefaults,{themes:{...personalizationDefaults.themes,options:{...personalizationDefaults.themes.options,emergence:{name:'自然涌现',enabled:false}}}})
  expect(merged.themes.options.emergence).toEqual({name:'自然涌现',enabled:false})
  expect(merged.colors).toEqual(normalizePersonalization(personalizationDefaults).colors)
 })
 it('provides merged flock and cosmos with bounded lifecycle',()=>{
  expect(Object.keys(normalizeEmergenceContent(null).scenes)).toEqual(['birds','cosmos'])
  expect(emergenceDefaults.scenes.birds.defaults.predatorBirthInterval).toBeGreaterThanOrEqual(180)
 })
 it('persists enabled scene selection and rejects an unavailable default',()=>{
  const value=structuredClone(emergenceDefaults);value.defaultScene='cosmos';value.scenes.birds.enabled=false;value.allowCustomize=false
  expect(normalizeEmergenceContent(value)).toEqual(value)
  value.defaultScene='birds';expect(()=>normalizeEmergenceContent(value)).toThrow('默认场景')
  Object.values(value.scenes).forEach(s=>s.enabled=false);expect(()=>normalizeEmergenceContent(value)).toThrow('至少保留一个')
 })
 it('migrates legacy fish settings and preserves disabled state',()=>{
  const result=normalizeEmergenceContent({defaultScene:'fish',scenes:{birds:{enabled:false},fish:{enabled:true,defaults:{count:260,speed:1.2,depth:'depth'}},cosmos:{enabled:false}}})
  expect(result.defaultScene).toBe('birds');expect(result.scenes.birds.enabled).toBe(true);expect(result.scenes.birds.defaults).toMatchObject({shape:'fish',count:260,speed:1.2,depth:'depth'})
  expect(result.scenes.fish).toBeUndefined()
  const disabled=normalizeEmergenceContent({defaultScene:'cosmos',scenes:{birds:{enabled:false},fish:{enabled:false},cosmos:{enabled:true}}})
  expect(disabled.scenes.birds.enabled).toBe(false)
 })
 it('rejects invalid numeric/choice values and normalizes linked caps',()=>{
  expect(()=>normalizeEmergenceContent({scenes:{birds:{defaults:{speed:30}}}})).toThrow('超出范围')
  expect(()=>normalizeEmergenceContent({scenes:{fish:{defaults:{shape:'water'}}}})).toThrow('无效')
  const result=normalizeEmergenceContent({scenes:{birds:{defaults:{count:900,populationCap:60,predators:4,predatorCap:1}}}})
  expect(result.scenes.birds.defaults.populationCap).toBe(900);expect(result.scenes.birds.defaults.predatorCap).toBe(4)
 })
 it('accepts magnification for both scenes and keeps rejecting unknown interactions',()=>{
  const value=structuredClone(emergenceDefaults)
  for(const scene of Object.values(value.scenes))scene.defaults.pointer='magnify'
  expect(normalizeEmergenceContent(value)).toEqual(value)
  value.scenes.birds.defaults.pointer='unknown'
  expect(()=>normalizeEmergenceContent(value)).toThrow('无效')
 })
 it('fills legacy cosmic defaults and validates gravity and collisions',()=>{
  const legacy=normalizeEmergenceContent({scenes:{cosmos:{defaults:{count:650,centers:1}}}})
  expect(legacy.scenes.cosmos.defaults).toMatchObject({mutualGravity:.7,collisions:'auto',fragmentSpeed:1.8,mergeOverlap:65,mergeCooldown:3})
  const value=normalizeEmergenceContent({scenes:{cosmos:{defaults:{centers:0,mutualGravity:0,collisions:'merge',fragmentSpeed:3,fragmentGrace:4,massAppearance:'color',mergeOverlap:80,mergeCooldown:6}}}})
  expect(normalizeEmergenceContent(value)).toEqual(value)
  for(const key of ['centers','gravity','massAppearance']) { expect(legacy.scenes.cosmos.defaults).not.toHaveProperty(key); expect(value.scenes.cosmos.defaults).not.toHaveProperty(key) }
  expect(()=>normalizeEmergenceContent({scenes:{cosmos:{defaults:{mergeOverlap:100}}}})).toThrow('超出范围')
  expect(()=>normalizeEmergenceContent({scenes:{cosmos:{defaults:{mergeCooldown:0}}}})).toThrow('超出范围')
  expect(()=>normalizeEmergenceContent({scenes:{cosmos:{defaults:{mutualGravity:8}}}})).toThrow('超出范围')
  expect(()=>normalizeEmergenceContent({scenes:{cosmos:{defaults:{collisions:'invalid'}}}})).toThrow('无效')
 })
})
