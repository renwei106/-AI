import { afterAll, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Exercise real catalog persistence in an isolated store, never the local admin data.
const isolated = vi.hoisted(() => ({ file: '' }))
vi.mock('node:fs', async importOriginal => {
  const fs = await importOriginal<typeof import('node:fs')>()
  const target = (value: unknown) => String(value).replaceAll('\\', '/').endsWith('/.local/shiyu-themes.json') ? isolated.file
    : String(value).replaceAll('\\', '/').endsWith('/.local/shiyu-themes.json.tmp') ? isolated.file + '.tmp' : value
  return { ...fs,
    existsSync: (p: never) => fs.existsSync(target(p) as never),
    readFileSync: (p: never, options: never) => fs.readFileSync(target(p) as never, options),
    writeFileSync: (p: never, data: never, options: never) => fs.writeFileSync(target(p) as never, data, options),
    renameSync: (a: never, b: never) => fs.renameSync(target(a) as never, target(b) as never),
  }
})
import { readThemes, writeThemeSelection } from './shiyu-theme-plugin'
import { normalizePersonalization } from './shiyu-feature-config'

const directory = mkdtempSync(join(tmpdir(), 'shiyu-forest-theme-'))
isolated.file = join(directory, 'themes.json')
afterAll(() => rmSync(directory, { recursive: true, force: true }))
describe('forest companion uses the existing catalog and persisted switches', () => {
  it('adds the theme to old configurations without changing their existing choices', () => {
    const value = normalizePersonalization({ themes: { order: ['paper','base'], options: { base: { enabled: false, name: '原有名称' } } } })
    expect(value.themes.order.slice(0, 2)).toEqual(['paper','base'])
    expect(value.themes.options.base).toMatchObject({ enabled: false, name: '原有名称' })
    expect(value.themes.options.forestCompanion).toMatchObject({ name: '森间绒伴', enabled: true })
    expect(readThemes().find(t => t.id === 'forestCompanion')?.name).toBe('森间绒伴')
  })
  it('round-trips disabling and enabling through the real theme store', () => {
    const before = readThemes()
    for (const enabled of [false, true]) {
      writeThemeSelection(before.map(t => ({ id: t.id, enabled: t.id === 'forestCompanion' ? enabled : t.enabled })))
      expect(readThemes().find(t => t.id === 'forestCompanion')?.enabled).toBe(enabled)
      expect(JSON.parse(readFileSync(isolated.file, 'utf8')).items.find((t: { id: string }) => t.id === 'forestCompanion').enabled).toBe(enabled)
      expect(readThemes().filter(t => t.id !== 'forestCompanion')).toEqual(before.filter(t => t.id !== 'forestCompanion'))
    }
  })
})
