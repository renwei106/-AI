import { normalizePlatformOptionOrder, mergePlatformOptionOrder } from './shiyu-platform-order'
import { createCreatorStore, normalizeCreators } from './shiyu-creator-store'
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { normalizeOnboardingConfig } from './shiyu-onboarding'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'
import { getPlatformSession } from './platform-access-plugin'
import { readUsers } from './shiyu-user-plugin'
import { effectiveAccess, normalizeOptionNames, normalizePersonalization, mergePersonalization, normalizePetActions, normalizePetTiming, normalizeReleaseControl } from './shiyu-feature-config'
import { readThemes, writeThemeSelection } from './shiyu-theme-plugin'
import { normalizePlatformTheme, seedPlatformTheme, platformThemeModes } from './shiyu-platform-theme'
import { normalizeWorldModules, normalizeWorldChildren, mergeWorldChildren, normalizeToolFeatures, mergeToolFeatures, type ToolFeatures, type WorldModules, type WorldChildren } from './shiyu-world-config'

type WorldConfig = {
  enabled: boolean
  modules: WorldModules
  children: WorldChildren
  toolFeatures: ToolFeatures
  audience: 'all' | 'whitelist' | 'percentage'
  percentage: number
  whitelist: string
  blacklist: string
  title: string
  description: string
  appearance: { lightBackground: string; lightAccent: string; darkBackground: string; darkAccent: string }
}
type CornerModule = { id: string; enabled: boolean; entryName: string; panelName: string; icon: string; href?: string; description?: string; category?: string; backgroundImage?: string }
type CornerConfig = { modules: CornerModule[] }
const removedCornerModuleIds = new Set(['icons', 'palette', 'cutout', 'emoji'])
const officialExcalidrawIcon = 'https://excalidraw.com/android-chrome-192x192.png'
const oldExcalidrawIconPrefix = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+'
type SpaceViews = { regular: { enabled: boolean; follow: boolean; cards: boolean; list: boolean; poker: boolean; paper: boolean; record: boolean; film: boolean; planet: boolean; calendar: boolean }; graph: { enabled: boolean; twoD: { enabled: boolean; radial: boolean; organization: boolean; mindmap: boolean }; threeD: { enabled: boolean; micro: boolean; galaxy: boolean } } }

const defaults: WorldConfig = {
  toolFeatures: normalizeToolFeatures(null),
  modules: normalizeWorldModules(null),
  children: normalizeWorldChildren(null, normalizeWorldModules(null)),
  appearance: { lightBackground: '#eadcc2', lightAccent: '#856544', darkBackground: '#29251f', darkAccent: '#c8a775' },
  enabled: false,
  audience: 'all',
  percentage: 20,
  whitelist: '',
  blacklist: '',
  title: '一个值得慢慢探索的世界',
  description: '在拾隅世界，发现精选网址、学习路线与创作素材，遇见更多值得收藏的灵感。我们正在认真准备，敬请期待。',
}
const cornerDefaults: CornerConfig = { modules: [
  { id: 'common', enabled: true, entryName: '我的收藏', panelName: '我的收藏', icon: '' },
  { id: 'memo', enabled: true, entryName: '我的小记', panelName: '我的小记', icon: '' },
  { id: 'todo', enabled: true, entryName: '我的待办', panelName: '我的待办', icon: '', category: '记录与整理' },
  { id: 'toolbox', enabled: true, entryName: '百宝箱', panelName: '百宝箱', icon: '' },
] }
const spaceViewsDefaults: SpaceViews = { regular: { enabled: true, follow: true, cards: true, list: true, poker: true, paper: true, record: true, film: true, planet: true, calendar: true }, graph: { enabled: true, twoD: { enabled: true, radial: true, organization: true, mindmap: true }, threeD: { enabled: true, micro: true, galaxy: true } } }
const spaceViewOrderDefaults = { regular: ['follow','cards','list','poker','paper','record','film','planet','calendar'], graph: ['twoD','threeD'], twoD: ['radial','organization','mindmap'], threeD: ['micro','galaxy'] }
const publicColorOrderDefaults = ['member','world.lightBackground','world.lightAccent','world.darkBackground','world.darkAccent']
const normalizeOrder = (value: unknown, defaults: string[]) => [...new Set([...(Array.isArray(value) ? value.map(String) : []), ...defaults])].filter(id => defaults.includes(id))
function normalizeSpaceViewOrder(value: unknown) { const source = value && typeof value === 'object' ? value as Record<string,unknown> : {}; return Object.fromEntries(Object.entries(spaceViewOrderDefaults).map(([key, ids]) => [key, normalizeOrder(source[key], ids)])) as typeof spaceViewOrderDefaults }
function publishedPersonalization(value: ReturnType<typeof normalizePersonalization>) {
  const catalog = readThemes()
  return { ...value, themes: { ...value.themes, order: catalog.map(item => item.id), options: Object.fromEntries(catalog.map(item => [item.id, { ...value.themes.options[item.id], enabled: item.enabled }])) } }
}
const officialFontIds = ['youfeng', 'qingya-song', 'wenrun-kai'] as const
type OfficialFontId = typeof officialFontIds[number]

const root = resolve(fileURLToPath(new URL('.', import.meta.url)))
const storeFile = resolve(root, '.local/shiyu-operations.json')
const agreementStore = createRequire(import.meta.url)('./membership/agreement-store.cjs').createAgreementStore()
const themeSessions = createRequire(import.meta.url)('../导航站/theme-access/store.cjs') as { session:(req:IncomingMessage)=>string|null }
const filingFile = resolve(root, '.local/shiyu-filing.json')
const filingDefaults = { label: '备案号', icp: { number: '晋ICP备2026014070号-1', url: 'https://beian.miit.gov.cn/' }, police: { number: '', url: '' } }
function normalizeFiling(value: unknown) {
  if (!value || typeof value !== 'object') throw new Error('请填写备案信息')
  const source = value as Record<string, unknown>
  const entry = (key: string) => {
    const item = source[key] && typeof source[key] === 'object' ? source[key] as Record<string, unknown> : {}
    const number = String(item.number || '').trim()
    const url = String(item.url || '').trim()
    if (number.length > 120 || url.length > 1000) throw new Error('备案号或查询链接过长')
    if (url) {
      let parsed: URL
      try { parsed = new URL(url) } catch { throw new Error('查询链接须为完整的 HTTP 或 HTTPS 地址') }
      if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error('查询链接须为完整的 HTTP 或 HTTPS 地址')
    }
    return { number, url }
  }
  const label = String(source.label || '备案号').trim()
  if (label.length > 20) throw new Error('前缀文案最多 20 个字')
  return { label: label || '备案号', icp: entry('icp'), police: entry('police') }
}
function readFiling() {
  try { return normalizeFiling(JSON.parse(readFileSync(filingFile, 'utf8')).filing) } catch { return filingDefaults }
}
const creatorStore = createCreatorStore(resolve(root, 'platform-creators.json'))
const creatorSyncFile = resolve(root, '.local/bilibili-creator-sync.json')
const creatorSyncBatchSize = 3
const creatorSyncSpacingMs = 90_000
const creatorSyncRiskCooldownMs = 7 * 24 * 60 * 60 * 1000
const creatorSyncFreshWindowMs = 30 * 24 * 60 * 60 * 1000
const identifiers = (value: unknown) => [...new Set(String(value || '').split(/[\s,，;；]+/).map((item) => item.trim().toLowerCase()).filter(Boolean))]

export function normalizeWorld(value: unknown): WorldConfig {
  const candidate = value && typeof value === 'object' ? value as { world?: Partial<WorldConfig> } : {}
  const world = candidate.world && typeof candidate.world === 'object' ? candidate.world : {}
  const percentage = Number(world.percentage)
  const modules = normalizeWorldModules(world.modules)
  return {
    enabled: world.enabled === true,
    modules,
    children: normalizeWorldChildren(world.children, modules),
    toolFeatures: normalizeToolFeatures(world.toolFeatures),
    audience: world.audience === 'whitelist' || world.audience === 'percentage' ? world.audience : 'all',
    percentage: Number.isFinite(percentage) ? Math.min(100, Math.max(0, Math.round(percentage))) : defaults.percentage,
    whitelist: identifiers(world.whitelist).join('\n').slice(0, 30_000),
    blacklist: identifiers(world.blacklist).join('\n').slice(0, 30_000),
    title: String(world.title || defaults.title).trim().slice(0, 60),
    description: String(world.description || defaults.description).trim().slice(0, 1000),
    appearance: Object.fromEntries(Object.entries(defaults.appearance).map(([key, fallback]) => [key, String(world.appearance?.[key as keyof WorldConfig['appearance']] ?? fallback).trim()])) as WorldConfig['appearance'],
  }
}
export function normalizeCorner(value: unknown): CornerConfig {
  const candidate = value && typeof value === 'object' ? value as { corner?: Partial<CornerConfig> } : {}
  const incoming = Array.isArray(candidate.corner?.modules) ? candidate.corner!.modules : []
  const valid = incoming.filter((entry): entry is CornerModule => Boolean(entry && typeof entry === 'object' && /^[a-z][a-z0-9_-]{1,39}$/.test(String((entry as CornerModule).id || '')) && !removedCornerModuleIds.has((entry as CornerModule).id)))
  const byId = new Map(valid.map(entry => [entry.id, entry]))
  const defaultsById = new Map(cornerDefaults.modules.map(entry => [entry.id, entry]))
  const seen = new Set<string>()
  const orderedIds = [...valid.map(entry => entry.id), ...cornerDefaults.modules.map(entry => entry.id)].filter(id => { if (id === 'toolbox' || seen.has(id)) return false; seen.add(id); return true })
  const merged = [...orderedIds.map(id => defaultsById.get(id) || byId.get(id)!), defaultsById.get('toolbox')!]
  if (merged.length > 50) throw new Error('我的一隅最多配置 50 个工具')
  const modules = merged.map((fallback) => {
    const item = byId.get(fallback.id)
    const savedIcon = typeof item?.icon === 'string' && /^(?:data:image\/(?:png|svg\+xml);base64,|https?:\/\/)/i.test(item.icon) ? item.icon.slice(0, 1_500_000) : ''
    const icon = fallback.id === 'excalidraw' && (!savedIcon || savedIcon.startsWith(oldExcalidrawIconPrefix)) ? officialExcalidrawIcon : savedIcon
    const href = String(item?.href || fallback.href || '').trim()
    if (typeof item?.backgroundImage === 'string' && item.backgroundImage.length > 3_000_000) throw new Error('背景图大小不能超过 2 MB')
    const backgroundImage = typeof item?.backgroundImage === 'string' && /^(?:data:image\/(?:png|jpeg|webp);base64,|https?:\/\/)/i.test(item.backgroundImage) ? item.backgroundImage : ''
    return { ...fallback, enabled: fallback.id === 'toolbox' ? true : item?.enabled !== false, entryName: String(item?.entryName || fallback.entryName).trim().slice(0, 24), panelName: String(item?.panelName || fallback.panelName).trim().slice(0, 60), icon, href, description: String(item?.description ?? fallback.description ?? '').trim().slice(0, 500), category: String(item?.category ?? fallback.category ?? '').trim().slice(0, 40), backgroundImage }
  })
  if (!modules.some((module) => module.enabled)) modules[0].enabled = true
  return { modules }
}
export function normalizeSpaceViews(value: unknown): SpaceViews {
  const candidate=value&&typeof value==='object'?value as {spaceViews?:Partial<SpaceViews>}:{}
  const source=candidate.spaceViews||{}
  const regular={...spaceViewsDefaults.regular,...source.regular}
  const twoD={...spaceViewsDefaults.graph.twoD,...source.graph?.twoD}
  const threeD={...spaceViewsDefaults.graph.threeD,...source.graph?.threeD}
  const graph={...spaceViewsDefaults.graph,...source.graph,twoD,threeD}
  if(regular.enabled===false) for(const key of Object.keys(regular) as (keyof typeof regular)[]) if(key!=='enabled') regular[key]=false
  if(graph.enabled===false){twoD.enabled=false;threeD.enabled=false}
  if(twoD.enabled===false) for(const key of Object.keys(twoD) as (keyof typeof twoD)[]) if(key!=='enabled') twoD[key]=false
  if(threeD.enabled===false) for(const key of Object.keys(threeD) as (keyof typeof threeD)[]) if(key!=='enabled') threeD[key]=false
  return {regular,graph}
}
function readCreators() { return creatorStore.read().items }

type CreatorSyncState = { version: 1; cursor: number; nextRunAt: string; lastRunAt: string; lastFinishedAt: string; lastStatus: 'scheduled' | 'running' | 'success' | 'paused' | 'error'; lastMessage: string; lastChecked: number; cooldownUntil: string }
const defaultCreatorSyncState = (): CreatorSyncState => ({ version: 1, cursor: 0, nextRunAt: '', lastRunAt: '', lastFinishedAt: '', lastStatus: 'scheduled', lastMessage: '', lastChecked: 0, cooldownUntil: '' })
function readCreatorSyncState(): CreatorSyncState {
  try { const value = JSON.parse(readFileSync(creatorSyncFile, 'utf8')) as Partial<CreatorSyncState>; return { ...defaultCreatorSyncState(), ...value, version: 1, cursor: Math.max(0, Number(value.cursor) || 0), lastChecked: Math.max(0, Number(value.lastChecked) || 0) } } catch { return defaultCreatorSyncState() }
}
function writeCreatorSyncState(value: CreatorSyncState) {
  mkdirSync(resolve(root, '.local'), { recursive: true })
  writeFileSync(`${creatorSyncFile}.tmp`, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  renameSync(`${creatorSyncFile}.tmp`, creatorSyncFile)
}
function nextCreatorSyncTime(from: Date) { const next = new Date(from); next.setHours(3, 15, 0, 0); if (next.getTime() <= from.getTime()) next.setDate(next.getDate() + 1); return next.toISOString() }
function pauseCreatorSyncUntil(from: Date, milliseconds: number) { return new Date(from.getTime() + milliseconds).toISOString() }
function creatorImageUrl(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return ''
  try { const url = new URL(value.startsWith('//') ? `https:${value}` : value); return ['http:', 'https:'].includes(url.protocol) && /(^|\.)(hdslb\.com|bilibili\.com)$/i.test(url.hostname) ? url.toString().replace(/^http:/i, 'https:') : '' } catch { return '' }
}
const waitForCreatorSync = (milliseconds: number) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds))
let creatorSyncTimer: ReturnType<typeof setTimeout> | undefined
let creatorSyncRunning = false
async function runCreatorSync() {
  if (creatorSyncRunning) return
  creatorSyncRunning = true
  const state = readCreatorSyncState(), startedAt = new Date()
  state.lastRunAt = startedAt.toISOString(); state.lastFinishedAt = ''; state.lastStatus = 'running'; state.lastMessage = '正在检查 B 站头像和空间头图'; state.lastChecked = 0; state.nextRunAt = nextCreatorSyncTime(startedAt)
  writeCreatorSyncState(state)
  try {
    const creators = readCreators().filter((item) => item.platform.includes('哔哩哔哩') && item.status === 'published' && /^\d+$/.test(item.uid))
    if (!creators.length) throw new Error('没有可同步的已发布 B 站账号')
    const candidates = Array.from({ length: creators.length }, (_, offset) => { const index = (state.cursor + offset) % creators.length; return { index, creator: creators[index] } }).filter(({ creator }) => { const avatarCheckedAt = Date.parse(creator.avatarCheckedAt || '') || 0, coverCheckedAt = Date.parse(creator.coverCheckedAt || '') || 0, cutoff = Date.now() - creatorSyncFreshWindowMs; return avatarCheckedAt < cutoff || coverCheckedAt < cutoff }).slice(0, creatorSyncBatchSize)
    if (!candidates.length) { state.lastStatus = 'success'; state.lastMessage = '所有账号都在 30 天检查周期内'; state.lastFinishedAt = new Date().toISOString(); state.nextRunAt = nextCreatorSyncTime(new Date()); return }
    let checked = 0
    for (let count = 0; count < candidates.length; count++) {
      const { index, creator } = candidates[count]
      const endpoint = new URL('https://api.bilibili.com/x/web-interface/card')
      endpoint.searchParams.set('mid', creator.uid); endpoint.searchParams.set('photo', 'true')
      const response = await fetch(endpoint, { headers: { 'User-Agent': 'ShiyuCreatorResourceSync/1.0', Referer: creator.profileUrl }, signal: AbortSignal.timeout(15_000) })
      let result: { code?: number; message?: string; data?: { card?: { face?: string }; space?: { l_img?: string } } }
      try { result = await response.json() as typeof result } catch { throw new Error(`B 站返回了无法识别的响应（HTTP ${response.status}）`) }
      if (!response.ok || result.code !== 0) {
        const riskLimited = [403, 412, 429].includes(response.status) || result.code === -352
        const retryAfter = Number(response.headers.get('retry-after'))
        const cooldown = riskLimited ? Math.max(creatorSyncRiskCooldownMs, Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 0) : 0
        if (cooldown) state.cooldownUntil = pauseCreatorSyncUntil(new Date(), cooldown)
        throw Object.assign(new Error(`B 站未允许本次读取：${result.message || `HTTP ${response.status}, code ${result.code ?? 'unknown'}`}`), { riskLimited: Boolean(cooldown) })
      }
      const avatarUrl = creatorImageUrl(result.data?.card?.face), coverUrl = creatorImageUrl(result.data?.space?.l_img)
      if (!avatarUrl && !coverUrl) throw new Error(`B 站没有返回 ${creator.name} 的头像或空间头图`)
      const checkedAt = new Date().toISOString()
      creatorStore.updateArtwork(creator.id, { ...(avatarUrl ? { avatarUrl } : {}), ...(coverUrl ? { coverUrl } : {}), avatarCheckedAt: checkedAt, coverCheckedAt: checkedAt }, creator.profileUrl)
      state.cursor = (index + 1) % creators.length; checked++; state.lastChecked = checked; state.lastMessage = `已更新 ${creator.name} 的公开头像和空间头图`
      writeCreatorSyncState(state)
      if (count + 1 < candidates.length) await waitForCreatorSync(creatorSyncSpacingMs)
    }
    state.lastStatus = 'success'; state.lastMessage = `本批已检查 ${checked} 位 UP 主`; state.lastFinishedAt = new Date().toISOString(); state.nextRunAt = nextCreatorSyncTime(new Date()); state.cooldownUntil = ''
  } catch (error) {
    const riskLimited = Boolean(error && typeof error === 'object' && 'riskLimited' in error && error.riskLimited)
    state.lastStatus = riskLimited ? 'paused' : 'error'; state.lastMessage = error instanceof Error ? error.message : '同步失败'; state.lastFinishedAt = new Date().toISOString(); state.nextRunAt = state.cooldownUntil || nextCreatorSyncTime(new Date())
  } finally {
    writeCreatorSyncState(state); creatorSyncRunning = false
  }
}
function scheduleCreatorSync() {
  if (creatorSyncTimer) clearTimeout(creatorSyncTimer)
  const state = readCreatorSyncState(), now = new Date()
  if (!state.nextRunAt) { state.nextRunAt = nextCreatorSyncTime(now); writeCreatorSyncState(state) }
  const cooldown = Date.parse(state.cooldownUntil), next = Date.parse(state.nextRunAt)
  const runAt = Number.isFinite(cooldown) && cooldown > now.getTime() ? cooldown : Number.isFinite(next) ? next : now.getTime() + 60_000
  creatorSyncTimer = setTimeout(() => { void runCreatorSync().finally(() => scheduleCreatorSync()) }, Math.max(1_000, runAt - now.getTime()))
  creatorSyncTimer.unref?.()
}

function validateWorld(world: WorldConfig) {
  if (Object.values(world.appearance).some(color => !/^#[0-9a-f]{6}$/i.test(color))) throw new Error('世界配色请使用六位十六进制颜色，例如 #eadcc2')
  const invalid = [...identifiers(world.whitelist), ...identifiers(world.blacklist)].filter((item) => !/^1\d{10}$/.test(item) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item) && !/^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/.test(item))
  if (invalid.length) throw new Error(`存在无效手机号、邮箱或用户 ID：${invalid.slice(0, 2).join('、')}`)
  if (world.audience === 'whitelist' && !identifiers(world.whitelist).length) throw new Error('仅白名单模式下，请至少配置一位白名单用户')
  if (!world.title || !world.description) throw new Error('请填写未开放提示标题和功能介绍')
}
function validateCorner(corner: CornerConfig) {
  if (new Set(corner.modules.map((module) => module.id)).size !== corner.modules.length) throw new Error('工具标识不能重复')
  if (!corner.modules.some((module) => module.enabled)) throw new Error('我的一隅至少需要保留一个启用模块')
  for (const module of corner.modules) {
    if (!module.entryName || !module.panelName) throw new Error('请填写每个模块的入口名称和弹窗名称')
    if (!/^[a-z][a-z0-9_-]{1,39}$/.test(module.id)) throw new Error('模块标识须为 2 至 40 位小写字母、数字、连字符或下划线')
    if (module.icon && !/^(?:data:image\/(?:png|svg\+xml);base64,|https?:\/\/)/i.test(module.icon)) throw new Error('图标格式仅支持 PNG 或 SVG')
    if (module.backgroundImage && (!/^(?:data:image\/(?:png|jpeg|webp);base64,|https?:\/\/)/i.test(module.backgroundImage) || module.backgroundImage.length > 3_000_000)) throw new Error('背景图格式仅支持 PNG、JPG、WebP，大小不超过 2 MB')
    if (module.href) { let url: URL; try { url = new URL(module.href) } catch { throw new Error('跳转地址须为完整的 HTTP 或 HTTPS 地址') }; if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('跳转地址须为安全的 HTTP 或 HTTPS 地址') }
  }
}

function readStore() {
  const fallback = { platformOptionOrder: normalizePlatformOptionOrder(null), onboarding: normalizeOnboardingConfig(null), platformTheme: seedPlatformTheme(readMembershipColor(), defaults.appearance.lightAccent), world: defaults, corner: cornerDefaults, spaceViews: spaceViewsDefaults, spaceViewOrder: normalizeSpaceViewOrder(null), publicColorOrder: publicColorOrderDefaults, personalization: normalizePersonalization(null), petActions: normalizePetActions(null), petTiming: normalizePetTiming(null), optionNames: normalizeOptionNames(null), releaseControl: normalizeReleaseControl(null, defaults) }
  if (!existsSync(storeFile)) return fallback
  try { const value = JSON.parse(readFileSync(storeFile, 'utf8')); const world=normalizeWorld(value); return { platformOptionOrder: normalizePlatformOptionOrder(value.platformOptionOrder), onboarding: normalizeOnboardingConfig(value.onboarding), platformTheme: normalizePlatformTheme(value.platformTheme,seedPlatformTheme(value.membershipColor,world.appearance.lightAccent)), world, corner: normalizeCorner(value), spaceViews: normalizeSpaceViews(value), spaceViewOrder: normalizeSpaceViewOrder(value.spaceViewOrder), publicColorOrder: normalizeOrder(value.publicColorOrder,publicColorOrderDefaults), personalization: normalizePersonalization(value.personalization), petActions: normalizePetActions(value.petActions), petTiming: normalizePetTiming(value.petTiming), optionNames: normalizeOptionNames(value.optionNames), releaseControl: normalizeReleaseControl(value.releaseControl,world) } } catch { return fallback }
}
function readMembershipColor() { try { const color = JSON.parse(readFileSync(storeFile, 'utf8')).membershipColor; return /^#[0-9a-f]{6}$/i.test(color) ? color : '#46634e' } catch { return '#46634e' } }
function readOfficialFont(): OfficialFontId { try { const font = JSON.parse(readFileSync(storeFile, 'utf8')).officialFont; return officialFontIds.includes(font) ? font : 'youfeng' } catch { return 'youfeng' } }
function readWorld() { return readStore().world }
function readCorner() { return readStore().corner }
function readSpaceViews() { return readStore().spaceViews }

function sendJson(response: ServerResponse, status: number, value: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.end(JSON.stringify(value))
}

async function readBody(request: IncomingMessage) {
  let body = ''
  for await (const chunk of request) {
    body += chunk
    if (body.length > 2_000_000) throw new Error('请求内容过大')
  }
  return JSON.parse(body || '{}') as unknown
}

export function shiyuOperationsPlugin(): Plugin {
  return {
    name: 'shiyu-operations-config',
    configureServer(server) {
      scheduleCreatorSync()
      server.httpServer?.once('close', () => { if (creatorSyncTimer) clearTimeout(creatorSyncTimer); creatorSyncTimer = undefined })
      server.middlewares.use(async (request, response, next) => {
        const pathname = (request.url || '').split('?')[0]
        if (pathname === '/api/shiyu/creators') {
          const session = getPlatformSession(request)
          if (!session || (!session.superadmin && !session.applicationIds.includes('shiyu'))) return sendJson(response, 403, { message: '当前管理员没有拾隅配置权限' })
          try {
            if (request.method === 'GET') return sendJson(response, 200, creatorStore.read())
            if (request.method !== 'POST') return sendJson(response, 405, { message: '不支持该操作' })
            return sendJson(response, 200, creatorStore.change(await readBody(request)))
          } catch (error) { return sendJson(response, error && typeof error === 'object' && 'status' in error ? Number(error.status) : 400, { message: error instanceof Error ? error.message : 'UP 主维护失败' }) }
        }
        if (pathname === '/api/shiyu/creator-sync') {
          if (request.method !== 'GET') return sendJson(response, 405, { message: '不支持该操作' })
          const session = getPlatformSession(request)
          if (!session || (!session.superadmin && !session.applicationIds.includes('shiyu'))) return sendJson(response, 403, { message: '当前管理员没有拾隅配置权限' })
          return sendJson(response, 200, readCreatorSyncState())
        }
        if (pathname === '/api/shiyu/filing') {
          if (request.method === 'GET') return sendJson(response, 200, { filing: readFiling() })
          if (request.method !== 'PUT') return sendJson(response, 405, { message: '不支持该操作' })
          const session = getPlatformSession(request)
          if (!session || (!session.superadmin && !session.applicationIds.includes('shiyu'))) return sendJson(response, 403, { message: '当前管理员没有拾隅配置权限' })
          try {
            const body = await readBody(request) as { filing?: unknown }
            const filing = normalizeFiling(body.filing)
            mkdirSync(resolve(root, '.local'), { recursive: true })
            writeFileSync(`${filingFile}.tmp`, `${JSON.stringify({ filing, updatedAt: new Date().toISOString() }, null, 2)}\n`, 'utf8')
            renameSync(`${filingFile}.tmp`, filingFile)
            return sendJson(response, 200, { filing })
          } catch (error) { return sendJson(response, 400, { message: error instanceof Error ? error.message : '备案信息无效' }) }
        }
        if (pathname === '/api/shiyu/agreements' || pathname === '/api/shiyu/agreements/history') {
          const isHistory = pathname.endsWith('/history')
          const session = getPlatformSession(request)
          if ((isHistory || request.method !== 'GET') && (!session || (!session.superadmin && !session.applicationIds.includes('shiyu')))) return sendJson(response, 403, {message:'当前管理员没有拾隅配置权限'})
          try {
            if(request.method === 'GET') { const state = agreementStore.read(); return sendJson(response,200,isHistory?{items:state.history}:{revision:state.revision,agreements:state.agreements}) }
            if(request.method !== 'PUT' || isHistory) return sendJson(response,405,{message:'不支持该操作'})
            if(request.headers.origin && !['http://'+request.headers.host,'https://'+request.headers.host].includes(request.headers.origin)) return sendJson(response,403,{message:'请求来源无效'})
            if(!request.headers['content-type']?.startsWith('application/json')) return sendJson(response,415,{message:'需要 JSON 请求'})
            const body = await readBody(request)
            return sendJson(response,200,agreementStore.publish(body,session!.admin.name || session!.admin.account))
          } catch(error) { return sendJson(response,typeof error === 'object' && error && 'status' in error ? Number(error.status):400,{message:error instanceof Error?error.message:'协议发布失败'}) }
        }
        if (pathname !== '/api/shiyu/operations') return next()
        if (request.method === 'GET') {
          const origin=request.headers.origin||''
          if(['http://127.0.0.1:4173','http://localhost:4173','https://tools.shiyubox.com'].includes(origin)){response.setHeader('Access-Control-Allow-Origin',origin);response.setHeader('Access-Control-Allow-Credentials','true');response.setHeader('Vary','Origin')}
          const current=readStore(),admin=getPlatformSession(request),canEdit=!origin&&Boolean(admin&&(admin.superadmin||admin.applicationIds.includes('shiyu')))
          const userId=themeSessions.session(request),user=readUsers().find(item=>item.id===userId)||null
          const access=effectiveAccess(current.releaseControl,user)
          const creators = creatorStore.read()
          return sendJson(response,200,{platformOptionOrder:current.platformOptionOrder,onboarding:current.onboarding,platformTheme:current.platformTheme,platformThemeTokens:platformThemeModes(current.platformTheme),membershipColor:readMembershipColor(),officialFont:readOfficialFont(),world:canEdit?current.world:{...current.world,whitelist:'',blacklist:'',eligible:current.world.enabled&&access.world},corner:current.corner,spaceViews:current.spaceViews,spaceViewOrder:current.spaceViewOrder,publicColorOrder:current.publicColorOrder,platformCreators:canEdit?creators.items:creators.items.filter(item=>item.status==='published'),platformCreatorGroups:creators.groups,personalization:publishedPersonalization(current.personalization),petActions:current.petActions,petTiming:current.petTiming,optionNames:current.optionNames,access,...(canEdit?{releaseControl:current.releaseControl}:{})})
        }
        if (request.method !== 'PUT') return sendJson(response, 405, { message: '不支持该操作' })
        const session = getPlatformSession(request)
        if (!session || (!session.superadmin && !session.applicationIds.includes('shiyu'))) return sendJson(response, 403, { message: '当前管理员没有拾隅配置权限' })
        try {
          const body = await readBody(request) as { platformOptionOrder?: unknown; onboarding?: unknown; platformTheme?: unknown; membershipColor?: unknown; officialFont?: unknown; worldAppearance?: unknown; world?: unknown; corner?: unknown; spaceViews?: unknown; spaceViewOrder?: unknown; publicColorOrder?: unknown; platformCreators?: unknown; personalization?: unknown; petActions?: unknown; petTiming?: unknown; themeSelection?: Array<{id:string;enabled:boolean}>; optionNames?: unknown; releaseControl?: unknown }
          const current = readStore()
          const platformOptionOrder = body.platformOptionOrder === undefined ? current.platformOptionOrder : mergePlatformOptionOrder(current.platformOptionOrder, body.platformOptionOrder)
          const onboarding = body.onboarding === undefined ? current.onboarding : normalizeOnboardingConfig(body.onboarding)
          if (body.onboarding !== undefined && (!body.onboarding || typeof body.onboarding !== 'object' || Array.isArray(body.onboarding) || Object.entries(body.onboarding).some(([key, value]) => !['enabled','welcome','home','space'].includes(key) || typeof value !== 'boolean'))) throw new Error('新手引导配置无效')
          const platformTheme = body.platformTheme === undefined ? current.platformTheme : normalizePlatformTheme(body.platformTheme,current.platformTheme)
          const worldPatch = body.world && typeof body.world === 'object' ? body.world as Partial<WorldConfig> : {}
          const world = body.world === undefined ? current.world : normalizeWorld({ world: { ...current.world, ...worldPatch, modules: { ...current.world.modules, ...worldPatch.modules }, children: mergeWorldChildren(current.world.children, worldPatch.children), toolFeatures: mergeToolFeatures(current.world.toolFeatures, worldPatch.toolFeatures), appearance: current.world.appearance } })
          if(body.worldAppearance !== undefined) world.appearance = normalizeWorld({world:{...world,appearance:body.worldAppearance}}).appearance
          const membershipColor = body.membershipColor === undefined ? readMembershipColor() : String(body.membershipColor)
          if(!/^#[0-9a-f]{6}$/i.test(membershipColor)) throw new Error('会员中心主色须为六位十六进制颜色')
          const officialFont = body.officialFont === undefined ? readOfficialFont() : String(body.officialFont) as OfficialFontId
          if (!officialFontIds.includes(officialFont)) throw new Error('请选择有效的官方字体')
          const corner = body.corner === undefined ? current.corner : normalizeCorner({ corner: body.corner })
          const spaceViews = body.spaceViews === undefined ? current.spaceViews : normalizeSpaceViews({ spaceViews: body.spaceViews })
          const spaceViewOrder = body.spaceViewOrder === undefined ? current.spaceViewOrder : normalizeSpaceViewOrder(body.spaceViewOrder)
          const publicColorOrder = body.publicColorOrder === undefined ? current.publicColorOrder : normalizeOrder(body.publicColorOrder,publicColorOrderDefaults)
          const personalization = body.personalization === undefined ? current.personalization : mergePersonalization(current.personalization, body.personalization)
          const petActions = body.petActions === undefined ? current.petActions : normalizePetActions(body.petActions)
          const petTiming = body.petTiming === undefined ? current.petTiming : normalizePetTiming(body.petTiming)
          const optionNames = body.optionNames === undefined ? current.optionNames : normalizeOptionNames(body.optionNames)
          const releaseControl = body.releaseControl === undefined ? current.releaseControl : normalizeReleaseControl(body.releaseControl)
          const platformCreators = body.platformCreators === undefined ? readCreators() : normalizeCreators({ platformCreators: body.platformCreators })
          validateWorld(world)
          validateCorner(corner)
          if(body.themeSelection !== undefined){
            if(!Array.isArray(body.themeSelection))throw new Error('主题配置无效')
            writeThemeSelection(body.themeSelection)
          }
          mkdirSync(resolve(root, '.local'), { recursive: true })
          writeFileSync(`${storeFile}.tmp`, `${JSON.stringify({ platformOptionOrder, onboarding, platformTheme, membershipColor, officialFont, world, corner, spaceViews, spaceViewOrder, publicColorOrder, personalization, petActions, petTiming, optionNames, releaseControl, updatedAt: new Date().toISOString() }, null, 2)}\n`, 'utf8')
          renameSync(`${storeFile}.tmp`, storeFile)
          if (body.platformCreators !== undefined) creatorStore.replaceItems(platformCreators)
          return sendJson(response, 200, { platformOptionOrder, onboarding, platformTheme, platformThemeTokens: platformThemeModes(platformTheme), membershipColor: readMembershipColor(), officialFont: readOfficialFont(), world: readWorld(), corner: readCorner(), spaceViews: readSpaceViews(), spaceViewOrder, publicColorOrder, personalization: publishedPersonalization(personalization), petActions, petTiming, optionNames, releaseControl, platformCreators: readCreators() })
        } catch (error) {
          return sendJson(response, 400, { message: error instanceof Error ? error.message : '请求内容无效' })
        }
      })
    },
  }
}
