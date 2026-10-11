import { ShiyuNotices } from './ShiyuNotices'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { DeleteOutlined, EyeOutlined, PlusOutlined, SettingOutlined, UploadOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Drawer, Form, Input, InputNumber, Row, Select, Space, Switch, Tag, Typography, Upload, message } from 'antd'
import { optionNameDefaults, type OptionNames, type ReleaseControl } from '../shiyu-feature-config'
import { ShiyuSpaceVisualConfig, spaceOrderDefaults, type SpaceViewOrder } from './ShiyuSpaceVisualConfig'
import { normalizeWorldModules, normalizeWorldChildren, type WorldModules, type WorldChildren } from '../shiyu-world-config'

import { ShiyuWorldEntryControls } from './ShiyuWorldEntryControls'

type Notice = { enabled: boolean; revision: string; title: string; body: string }
type CornerModule = { id: string; enabled: boolean; entryName: string; panelName: string; icon: string; href?: string; description?: string; category?: string; backgroundImage?: string }
type CornerConfig = { modules: CornerModule[] }
type SpaceViews = { regular: { enabled: boolean; follow: boolean; cards: boolean; list: boolean; poker: boolean; paper: boolean; record: boolean; film: boolean; planet: boolean; calendar: boolean }; graph: { enabled: boolean; twoD: { enabled: boolean; radial: boolean; organization: boolean; mindmap: boolean }; threeD: { enabled: boolean; micro: boolean; galaxy: boolean } } }
type WorldAppearance = { lightBackground: string; lightAccent: string; darkBackground: string; darkAccent: string }
type Draft = { world: { enabled: boolean; modules: WorldModules; children: WorldChildren; audience: 'all' | 'whitelist' | 'percentage'; percentage: number; whitelist: string; blacklist: string; title: string; description: string; appearance: WorldAppearance }; corner: CornerConfig; spaceViews: SpaceViews; announcement: Notice; update: Notice }
export type UserAccount = { id: string; name: string; phone: string; email?: string }
type LoginMethod = 'phone' | 'email' | 'password' | 'wechat'
type LoginMethods = { phone: boolean; email: boolean; password: boolean; wechat: boolean; order: LoginMethod[] }
type SmsConfig = { enabled: boolean; accessKeyId: string; accessKeySecret: string; signName: string; templateCode: string; codeTtlSeconds: number; codeLength: number }
const KEY = 'shiyu-operations-draft-v1'
const removedCornerModuleIds = new Set(['icons', 'palette', 'cutout', 'emoji'])
const officialExcalidrawIcon = 'https://excalidraw.com/android-chrome-192x192.png'
const oldExcalidrawIconPrefix = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCI+'
const worldAppearance: WorldAppearance = { lightBackground: '#eadcc2', lightAccent: '#856544', darkBackground: '#29251f', darkAccent: '#c8a775' }
const initial: Draft = {
 world: { enabled: false, modules: normalizeWorldModules(null), children: normalizeWorldChildren(null, normalizeWorldModules(null)), audience: 'all', percentage: 20, whitelist: '', blacklist: '', title: '一个值得慢慢探索的世界', description: '在拾隅世界，发现精选网址、学习路线与创作素材，遇见更多值得收藏的灵感。我们正在认真准备，敬请期待。', appearance: worldAppearance },
 corner: { modules: [{ id: 'common', enabled: true, entryName: '我的收藏', panelName: '我的收藏', icon: '' }, { id: 'memo', enabled: true, entryName: '我的小记', panelName: '我的小记', icon: '' }, { id: 'todo', enabled: true, entryName: '我的待办', panelName: '我的待办', icon: '', category: '记录与整理' }, { id: 'toolbox', enabled: true, entryName: '百宝箱', panelName: '百宝箱', icon: '' }] },
 spaceViews: { regular: { enabled: true, follow: true, cards: true, list: true, poker: true, paper: true, record: true, film: true, planet: true, calendar: true }, graph: { enabled: true, twoD: { enabled: true, radial: true, organization: true, mindmap: true }, threeD: { enabled: true, micro: true, galaxy: true } } },
 announcement: { enabled: false, revision: 'maintenance-01', title: '服务维护通知', body: '为了提供更稳定的体验，我们计划进行服务维护。\n维护期间，部分功能可能暂时无法使用。感谢你的理解与耐心。' },
 update: { enabled: false, revision: '1.1.0', title: '拾隅有了一点新变化', body: '这次更新，让收藏与探索更顺手。\n\n· 新增拾隅世界，发现更多优质内容\n· 优化卡片之间的网址移动\n· 改善主题与日夜模式的联动体验' },
}
const loginMethodOptions: { key: LoginMethod; label: string; description: string }[] = [
 { key: 'phone', label: '手机登录', description: '通过手机验证码登录或注册' },
 { key: 'email', label: '邮箱登录', description: '通过邮箱验证码登录或注册' },
 { key: 'password', label: '密码登录', description: '使用手机号或邮箱与密码登录' },
 { key: 'wechat', label: '微信登录', description: '使用微信服务号扫码登录' },
]
const initialLoginMethods: LoginMethods = { phone: true, email: true, password: true, wechat: true, order: loginMethodOptions.map(item => item.key) }
const initialSmsConfig: SmsConfig = { enabled: false, accessKeyId: '', accessKeySecret: '', signName: '', templateCode: 'SMS_338715137', codeTtlSeconds: 600, codeLength: 6 }
const defaultCornerIcons: Record<CornerModule['id'], string> = {
 icons: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2348614c" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 8h8v8H8z"/></svg>',
 palette: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2348614c" stroke-width="1.7"><path d="M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 1-4 2 2 0 0 1 2-3h2a3 3 0 0 0 3-3 9 9 0 0 0-10-8Z"/><path d="M7 11h.01M10 7h.01M16 7h.01"/></svg>',
 cutout: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2348614c" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>',
 toolbox: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2348614c" stroke-width="1.7"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v3h4v-3"/></svg>',
 common: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2348614c" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h5M8 16h8"/></svg>',
 memo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2348614c" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2Z"/><path d="M8 9h8M8 13h5"/></svg>',
 todo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2348614c" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="m7 12 3 3 7-7"/></svg>',
 external: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2348614c" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 12h8m-5-3-3 3 3 3m2-6 3 3-3 3"/></svg>',
}
const systemCornerIds = new Set(initial.corner.modules.map(module => module.id))
const cornerPreviewIcon = (module: CornerModule) => systemCornerIds.has(module.id) ? defaultCornerIcons[module.id] : module.id === 'excalidraw' && (!module.icon || module.icon.startsWith(oldExcalidrawIconPrefix)) ? officialExcalidrawIcon : module.icon || defaultCornerIcons.external
function readCornerModules(saved: unknown): CornerModule[] { const modules = Array.isArray(saved) ? saved.filter((item): item is CornerModule => Boolean(item && typeof item === 'object' && typeof item.id === 'string' && !removedCornerModuleIds.has(item.id))) : []; const defaults = new Map(initial.corner.modules.map(item => [item.id, item])); const seen = new Set<string>(); const ordered = [...modules.map(item => ({ ...defaults.get(item.id), ...item })), ...initial.corner.modules].filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true }); return [...ordered.filter(item => item.id !== 'toolbox'), ordered.find(item => item.id === 'toolbox') || initial.corner.modules.at(-1)!] }
function read(): Draft { try { const value = JSON.parse(localStorage.getItem(KEY) || 'null'); return { world: { ...initial.world, ...value?.world, appearance: { ...worldAppearance, ...value?.world?.appearance } }, corner: { modules: readCornerModules(value?.corner?.modules) }, spaceViews: { ...initial.spaceViews, ...value?.spaceViews, regular: { ...initial.spaceViews.regular, ...value?.spaceViews?.regular }, graph: { ...initial.spaceViews.graph, ...value?.spaceViews?.graph, twoD: { ...initial.spaceViews.graph.twoD, ...value?.spaceViews?.graph?.twoD }, threeD: { ...initial.spaceViews.graph.threeD, ...value?.spaceViews?.graph?.threeD } } }, announcement: { ...initial.announcement, ...value?.announcement }, update: { ...initial.update, ...value?.update } } } catch { return initial } }
export const identifiers = (value = '') => [...new Set(value.split(/[\s,，;；]+/).map(item => item.trim().toLowerCase()).filter(Boolean))]
const normalizeIdentifiers = (value = '') => identifiers(value).join('\n')
export const validIdentifier = (value: string) => /^1\d{10}$/.test(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/.test(value)
const identifierOf = (user: UserAccount) => user.phone || user.email || user.id
const identifiersOf = (user: UserAccount) => [user.phone, user.email, user.id].map(item => item?.trim().toLowerCase()).filter(Boolean) as string[]
const maskPhone = (phone: string) => phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')

export function UserListInput({ value = '', onChange, users, loading }: { value?: string; onChange?: (value: string) => void; users: UserAccount[]; loading: boolean }) {
 const current = identifiers(value)
 const selected = users.filter(user => identifiersOf(user).some(item => current.includes(item))).map(user => user.id)
 const choose = (ids: string[]) => {
  const known = new Set(users.flatMap(identifiersOf))
  const manual = current.filter(item => !known.has(item))
  const picked = ids.map(id => identifierOf(users.find(user => user.id === id)!)).filter(Boolean)
  onChange?.([...new Set([...picked, ...manual])].join('\n'))
 }
 return <Space orientation="vertical" size={10} style={{ width: '100%' }}>
  <Select mode="multiple" allowClear loading={loading} value={selected} onChange={choose} placeholder="从用户列表搜索并选择" optionFilterProp="search" style={{ width: '100%' }} options={users.map(user => ({ value: user.id, search: `${user.name} ${user.phone} ${user.email || ''}`, label: `${user.name} · ${maskPhone(user.phone)}${user.email ? ` · ${user.email}` : ''}` }))} />
  <Input.TextArea rows={4} value={value} onChange={event => onChange?.(event.target.value)} onBlur={() => onChange?.(normalizeIdentifiers(value))} placeholder={'也可直接粘贴手机号、邮箱或用户 ID\n每条一行，也支持逗号、分号分隔'} />
 </Space>
}
export function ShiyuOperations({ notices = false, section = 'features' }: { notices?: boolean; section?: 'features'|'auth' }) { return notices ? <ShiyuNotices /> : <ShiyuFeatureOperations section={section} /> }
function ShiyuFeatureOperations({ section }: { section:'features'|'auth' }) {
 const authSection=section==='auth'
 const [draft, setDraft] = useState<Draft>(read)
 const [featureOpen, setFeatureOpen] = useState(false)
 const [cornerOpen, setCornerOpen] = useState(false)
 const [editingCornerId, setEditingCornerId] = useState<string | null>(null)
 const cornerDragId = useRef<string | null>(null)
 const cornerDragClick = useRef(false)
 const [spaceViewsOpen, setSpaceViewsOpen] = useState(false)
 const [spaceViewOrder,setSpaceViewOrder]=useState<SpaceViewOrder>(spaceOrderDefaults)
 const [optionNames,setOptionNames]=useState<OptionNames>({...optionNameDefaults})
 const [savedNames,setSavedNames]=useState<OptionNames>({...optionNameDefaults})
 const discardNames=()=>setOptionNames(savedNames)
 const [releaseControl,setReleaseControl]=useState<ReleaseControl>({rules:[]})
 const [saving, setSaving] = useState(false)
 const [loginMethods, setLoginMethods] = useState<LoginMethods>(initialLoginMethods)
 const [loginDraft, setLoginDraft] = useState<LoginMethods>(initialLoginMethods)
 const [loginOrder, setLoginOrder] = useState<LoginMethod[]>(initialLoginMethods.order)
 const [draggingLoginMethod, setDraggingLoginMethod] = useState<LoginMethod | null>(null)
 const loginDrag = useRef<{ key: LoginMethod; pointerId: number; offsetX: number; offsetY: number; ghost: HTMLElement } | null>(null)
 const [loginOpen, setLoginOpen] = useState(false)
 const [loginSaving, setLoginSaving] = useState(false)
 const [smsConfig, setSmsConfig] = useState<SmsConfig>(initialSmsConfig)
 const [smsOpen, setSmsOpen] = useState(false)
 const [smsSaving, setSmsSaving] = useState(false)
 const [featureForm] = Form.useForm<Draft['world']>()
 const [cornerForm] = Form.useForm<CornerConfig>()
 const watchedCornerModules = Form.useWatch('modules', cornerForm)
 const [smsForm] = Form.useForm<SmsConfig>()
 const saveWorld = async (world: Draft['world']) => {
  setSaving(true)
  try {
   const response = await fetch('/api/shiyu/operations', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ world, optionNames }) })
   const result = await response.json() as { world: Draft['world']; corner: CornerConfig; optionNames:OptionNames; message?: string }
   if (!response.ok) throw new Error(result.message || '配置保存失败')
   const next = { ...draft, world: result.world }
   try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* 服务端保存成功后，本地缓存失败不影响发布结果。 */ }
   setDraft(next)
   setOptionNames(result.optionNames);setSavedNames(result.optionNames)
   message.success('配置已保存并同步到前台')
   return true
  } catch (error) {
   message.error(error instanceof Error ? error.message : '配置保存失败')
   return false
  } finally { setSaving(false) }
 }
 const saveCorner = async () => {
  try {
   await cornerForm.validateFields()
   const corner = cornerForm.getFieldsValue(true) as CornerConfig
   if (!corner.modules.some(module => module.enabled)) { message.warning('至少保留一个启用模块'); return }
   if (corner.modules.length > 50) { message.warning('我的一隅最多配置 50 个工具'); return }
   setSaving(true)
   const response = await fetch('/api/shiyu/operations', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ corner, optionNames }) })
   const result = await response.json() as { corner: CornerConfig; optionNames:OptionNames; message?: string }
   if (!response.ok) throw new Error(result.message || '一隅配置保存失败')
   const next = { ...draft, corner: result.corner }
   try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* 服务端保存成功即可。 */ }
   setDraft(next); setOptionNames(result.optionNames);setSavedNames(result.optionNames); setCornerOpen(false); setEditingCornerId(null); message.success('子应用配置已保存并同步到前台')
  } catch (error) { if (error instanceof Error && error.message) message.error(error.message) } finally { setSaving(false) }
 }
 const saveFeature = async () => {
  try {
   const world = await featureForm.validateFields()
   if (await saveWorld(world)) setFeatureOpen(false)
  } catch { /* Ant Design 在对应字段下展示校验信息。 */ }
 }
 const saveLoginMethods = async () => {
  try {
   const values = { ...loginDraft, order: loginOrder }
   if (!loginMethodOptions.some(item => values[item.key])) { message.warning('至少保留一种登录方式'); return }
   setLoginSaving(true)
   const response = await fetch('/api/shiyu/login-methods', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
   const result = await response.json() as { loginMethods: LoginMethods; message?: string }
   if (!response.ok) throw new Error(result.message || '登录方式配置保存失败')
   setLoginMethods(result.loginMethods)
   setLoginOpen(false)
   message.success('登录方式配置已保存')
  } catch (error) {
   if (error instanceof Error && error.message) message.error(error.message)
  } finally { setLoginSaving(false) }
 }
 const saveSmsConfig = async () => {
  try {
   const values = await smsForm.validateFields()
   setSmsSaving(true)
   const response = await fetch('/api/shiyu/sms-config', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
   const result = await response.json() as { smsConfig: SmsConfig; message?: string }
   if (!response.ok) throw new Error(result.message || '短信配置保存失败')
   setSmsConfig(result.smsConfig); setSmsOpen(false); message.success('短信服务配置已保存')
  } catch (error) { if (error instanceof Error && error.message) message.error(error.message) } finally { setSmsSaving(false) }
 }
 useEffect(() => {
  if(!authSection) fetch('/api/shiyu/operations', { credentials: 'include', cache: 'no-store' }).then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.message || '运营配置加载失败'); return result as { world: Draft['world']; corner: CornerConfig; spaceViews: SpaceViews; spaceViewOrder?: SpaceViewOrder; optionNames:OptionNames; releaseControl:ReleaseControl } }).then(result => {setDraft(current => ({ ...current, world: result.world, corner: result.corner || current.corner, spaceViews: result.spaceViews || current.spaceViews }));setSpaceViewOrder(result.spaceViewOrder||spaceOrderDefaults);if(result.optionNames){setOptionNames(result.optionNames);setSavedNames(result.optionNames)}if(result.releaseControl)setReleaseControl(result.releaseControl)}).catch(error => message.error(error instanceof Error ? error.message : '运营配置加载失败'))
  if(authSection){
   fetch('/api/shiyu/login-methods', { credentials: 'include', cache: 'no-store' }).then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.message || '登录方式配置加载失败'); return result as { loginMethods: LoginMethods } }).then(result => { const next = { ...initialLoginMethods, ...result.loginMethods }; setLoginMethods(next); setLoginOrder(next.order) }).catch(error => message.error(error instanceof Error ? error.message : '登录方式配置加载失败'))
   fetch('/api/shiyu/sms-config', { credentials: 'include', cache: 'no-store' }).then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.message || '短信配置加载失败'); return result as { smsConfig: SmsConfig } }).then(result => setSmsConfig({ ...initialSmsConfig, ...result.smsConfig })).catch(error => message.error(error instanceof Error ? error.message : '短信配置加载失败'))
  }
 }, [authSection])
 useEffect(() => { if (cornerOpen) cornerForm.setFieldsValue(draft.corner) }, [cornerOpen, draft.corner, cornerForm])
 useEffect(() => () => loginDrag.current?.ghost.remove(), [])
 const startLoginDrag = (event: ReactPointerEvent<HTMLElement>, key: LoginMethod) => {
  if (event.button !== 0 || (event.target as HTMLElement).closest('button,input,a')) return
  const card = event.currentTarget
  const rect = card.getBoundingClientRect()
  const ghost = card.cloneNode(true) as HTMLElement
  ghost.removeAttribute('data-login-method')
  Object.assign(ghost.style, { position: 'fixed', zIndex: '10000', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, margin: '0', pointerEvents: 'none', cursor: 'grabbing', opacity: '.97', boxShadow: '0 16px 38px rgba(15, 23, 42, .22)', transform: 'scale(1.015)', transition: 'box-shadow 120ms ease, transform 120ms ease' })
  document.body.append(ghost)
  loginDrag.current = { key, pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, ghost }
  setDraggingLoginMethod(key)
  event.currentTarget.setPointerCapture(event.pointerId)
  const move = (pointer: PointerEvent) => {
   const drag = loginDrag.current
   if (!drag || pointer.pointerId !== drag.pointerId) return
   drag.ghost.style.left = `${pointer.clientX - drag.offsetX}px`
   drag.ghost.style.top = `${pointer.clientY - drag.offsetY}px`
   const cards = [...document.querySelectorAll<HTMLElement>('[data-login-method]')].filter(node => node.dataset.loginMethod !== drag.key)
   const target = cards.reduce<HTMLElement | null>((nearest, node) => !nearest || Math.abs(node.getBoundingClientRect().top + node.offsetHeight / 2 - pointer.clientY) < Math.abs(nearest.getBoundingClientRect().top + nearest.offsetHeight / 2 - pointer.clientY) ? node : nearest, null)
   const targetKey = target?.dataset.loginMethod as LoginMethod | undefined
   if (!targetKey) return
   setLoginOrder(current => {
    const from = current.indexOf(drag.key), to = current.indexOf(targetKey)
    if (from < 0 || to < 0 || from === to) return current
    const next = [...current]
    next.splice(to, 0, next.splice(from, 1)[0])
    return next
   })
  }
  const end = (pointer: PointerEvent) => {
   const drag = loginDrag.current
   if (!drag || pointer.pointerId !== drag.pointerId) return
   drag.ghost.remove(); loginDrag.current = null; setDraggingLoginMethod(null)
   window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end)
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', end)
  window.addEventListener('pointercancel', end)
 }
 const preview = () => {
  const token = crypto.randomUUID(), origin = import.meta.env.DEV ? 'http://127.0.0.1:4341' : 'https://shiyubox.com'
  const child = window.open(`${origin}/?operations-preview=${token}`, '_blank')
  if (!child) { message.warning('请允许浏览器打开预览窗口'); return }
  const handle = (event: MessageEvent) => {
   if (event.origin !== origin || event.source !== child || event.data?.type !== 'shiyu-operations-ready' || event.data?.token !== token) return
   const rule=releaseControl.rules.find(item=>item.features.includes('world'))
   const previewDraft=rule?{...draft,world:{...draft.world,audience:rule.audience,percentage:rule.percentage,whitelist:rule.whitelist,blacklist:rule.blacklist}}:draft
   child.postMessage({ type: 'shiyu-operations-preview', token, draft:previewDraft, identity: 'guest', kind:'world' }, origin)
   window.removeEventListener('message', handle)
  }
  window.addEventListener('message', handle); window.setTimeout(() => window.removeEventListener('message', handle), 60000)
 }
 return <>
  <div className="shiyu-page-heading"><div><Typography.Title level={3}>{authSection?'登录与验证':'功能模块'}</Typography.Title><Typography.Paragraph type="secondary">{authSection?'管理登录方式与短信验证码。':'按模块查看已开启的入口，点击配置查看全部选项。'}</Typography.Paragraph></div></div>
  {!authSection && <>
  <Card title={optionNames.world} extra={<Space><Button icon={<EyeOutlined/>} onClick={preview}>前台预览</Button><Button type="primary" icon={<SettingOutlined />} onClick={() => { featureForm.setFieldsValue({ ...draft.world, modules: normalizeWorldModules(draft.world.modules), children: normalizeWorldChildren(draft.world.children, normalizeWorldModules(draft.world.modules)) }); setFeatureOpen(true) }}>配置</Button></Space>}>
   <Space wrap><Tag color={draft.world.enabled?'green':'default'}>{draft.world.enabled?'入口已开启':'入口已关闭'}</Tag>{releaseControl.rules.find(rule=>rule.features.includes('world'))&&<Tag>上线控制：{releaseControl.rules.find(rule=>rule.features.includes('world'))?.name}</Tag>}</Space>
   <Typography.Paragraph type="secondary" style={{margin:'10px 0 0'}}>首页「发现世界」与世界页入口。{draft.world.enabled?'未开放用户仍可看到介绍。':'关闭后前台入口隐藏。'}</Typography.Paragraph>
  </Card>
  <Card title={optionNames.corner} extra={<Button type="primary" icon={<SettingOutlined />} onClick={() => { cornerForm.setFieldsValue(draft.corner); setEditingCornerId(null); setCornerOpen(true) }}>配置</Button>} style={{marginTop:20}}>
   <Space wrap>{draft.corner.modules.filter(module=>module.enabled).map(module=><Tag key={module.id} color="green">{module.entryName}</Tag>)}</Space>
   <Typography.Paragraph type="secondary" style={{margin:'10px 0 0'}}>{draft.corner.modules.filter(module=>module.enabled).length} 个子应用已开启。</Typography.Paragraph>
  </Card>
  <Card title={optionNames.spaceViews} extra={<Button type="primary" icon={<SettingOutlined />} onClick={() => setSpaceViewsOpen(true)}>配置</Button>} style={{marginTop:20}}>
   <div style={{display:'grid',gap:10}}>
    {draft.spaceViews.regular.enabled&&<Space wrap><Tag color="green">{optionNames['spaceViews.regular']}</Tag>{spaceViewOrder.regular.filter(key=>draft.spaceViews.regular[key as keyof SpaceViews['regular']]).map(key=><Tag key={key}>{optionNames[`spaceViews.regular.${key}` as keyof OptionNames]}</Tag>)}</Space>}
    {draft.spaceViews.graph.enabled&&<div><Tag color="green">{optionNames['spaceViews.graph']}</Tag><div style={{display:'grid',gap:8,marginTop:8,paddingLeft:12}}>
     {spaceViewOrder.graph.map(group=>draft.spaceViews.graph[group].enabled&&<Space key={group} wrap><Tag color="green">{optionNames[`spaceViews.graph.${group}` as keyof OptionNames]}</Tag>{spaceViewOrder[group].filter(key=>(draft.spaceViews.graph[group] as unknown as Record<string,boolean>)[key]).map(key=><Tag key={key}>{optionNames[`spaceViews.graph.${group}.${key}` as keyof OptionNames]}</Tag>)}</Space>)}
    </div></div>}
   </div>
   <Typography.Paragraph type="secondary" style={{margin:'10px 0 0'}}>仅显示已开启的视图及子选项。</Typography.Paragraph>
  </Card>
  </>}
  {authSection && <Card title="登录方式" extra={<Tag>{loginMethodOptions.filter(item => loginMethods[item.key]).length} 种已开启</Tag>} style={{ marginTop: 20 }}>
   <Row align="middle" gutter={[20, 20]}><Col flex="auto"><Space wrap>{loginMethods.order.map(key => { const item = loginMethodOptions.find(option => option.key === key)!; return <Tag color={loginMethods[key] ? 'green' : 'default'} key={key}>{item.label} · {loginMethods[key] ? '已开启' : '已关闭'}</Tag> })}</Space><Typography.Paragraph type="secondary" style={{ margin: '12px 0 0' }}>前台仅展示已开启的登录方式，并按这里的顺序排列；第一种已开启方式为默认登录方式。</Typography.Paragraph></Col><Col><Button icon={<SettingOutlined />} onClick={() => { setLoginDraft(loginMethods); setLoginOrder(loginMethods.order); setLoginOpen(true) }}>配置</Button></Col></Row>
  </Card>}
  {authSection && <Card title="短信验证码服务" extra={<Tag color={smsConfig.enabled ? 'green' : 'default'}>{smsConfig.enabled ? '已启用' : '未启用'}</Tag>} style={{ marginTop: 20 }}>
   <Row align="middle" gutter={[20, 20]}><Col flex="auto"><Typography.Paragraph type="secondary" style={{ margin: 0 }}>管理阿里云短信签名、AccessKey 与验证码规则。当前为 {smsConfig.codeLength} 位数字，有效期 {Math.round(smsConfig.codeTtlSeconds / 60)} 分钟。</Typography.Paragraph></Col><Col><Button icon={<SettingOutlined />} onClick={() => { smsForm.setFieldsValue({ ...smsConfig, accessKeySecret: '' }); setSmsOpen(true) }}>配置短信服务</Button></Col></Row>
  </Card>}
  <Drawer title="拾隅世界 · 功能配置" width={620} open={featureOpen} onClose={() => {discardNames();setFeatureOpen(false)}} footer={<Space style={{ display: 'flex', justifyContent: 'flex-end' }}><Button disabled={saving} onClick={() => {discardNames();setFeatureOpen(false)}}>取消</Button><Button type="primary" loading={saving} onClick={() => void saveFeature()}>保存配置</Button></Space>}>
   <Form layout="vertical"><Form.Item label="模块名称"><Input aria-label="模块名称" maxLength={24} value={optionNames.world} onChange={e=>setOptionNames(current=>({...current,world:e.target.value}))}/></Form.Item></Form>
   <Form form={featureForm} layout="vertical">
    <Form.Item name="enabled" label="显示入口" valuePropName="checked" extra="关闭后隐藏首页入口，并关闭点击、滑动和直达访问。"><Switch /></Form.Item>
    <ShiyuWorldEntryControls form={featureForm} />
    <Form.Item name="title" label="未开放提示标题" rules={[{ required: true, whitespace: true, message: '请输入标题' }]}><Input maxLength={60} /></Form.Item>
    <Form.Item name="description" label="功能介绍" rules={[{ required: true, whitespace: true, message: '请输入功能介绍' }]}><Input.TextArea rows={4} maxLength={1000} showCount /></Form.Item>
    <Typography.Paragraph type="secondary">开放对象统一在「上线控制」设置。未获得开放资格的用户仍能看到介绍。</Typography.Paragraph>
   </Form>
  </Drawer>
  <Drawer title={editingCornerId ? '编辑子应用' : '子应用 · 功能配置'} width={620} open={cornerOpen} onClose={() => { discardNames();setCornerOpen(false); setEditingCornerId(null) }} footer={<Space style={{ display: 'flex', justifyContent: 'flex-end' }}><Button disabled={saving} onClick={() => {if(editingCornerId)setEditingCornerId(null);else{discardNames();setCornerOpen(false)}}}>{editingCornerId ? '返回列表' : '取消'}</Button><Button type="primary" loading={saving} onClick={() => void saveCorner()}>保存并同步前台</Button></Space>}>
   {!editingCornerId&&<Form layout="vertical"><Form.Item label="模块名称"><Input aria-label="模块名称" maxLength={24} value={optionNames.corner} onChange={e=>setOptionNames(current=>({...current,corner:e.target.value}))}/></Form.Item></Form>}
   <Form form={cornerForm} layout="vertical">
    <Form.List name="modules">{(fields, { add, remove, move }) => {
     const moduleAt = (index: number) => (watchedCornerModules?.[index] || cornerForm.getFieldValue(['modules', index])) as CornerModule | undefined
     const active = fields.find(field => moduleAt(field.name)?.id === editingCornerId)
     if (active) {
      const module = moduleAt(active.name)!
      const system = systemCornerIds.has(module.id)
      return <>
       <Button type="link" style={{ paddingLeft: 0, marginBottom: 12 }} onClick={() => setEditingCornerId(null)}>← 查看全部子应用</Button>
       <Space align="center" size={14} style={{ marginBottom: 22 }}><img src={cornerPreviewIcon(module)} alt="" width={52} height={52} style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 12, background: 'var(--ant-color-fill-quaternary)', padding: 7 }} /><div><Typography.Text strong>{module.entryName}</Typography.Text><br /><Typography.Text type="secondary">{system ? '系统应用 · 图案和动效由前台维护' : '第三方内容 · 一张图标即可使用'}</Typography.Text></div></Space>
       <Form.Item name={[active.name, 'id']} hidden><Input /></Form.Item>
       <Form.Item name={[active.name, 'panelName']} hidden><Input /></Form.Item>
       <Form.Item name={[active.name, 'entryName']} label="名称" rules={[{ required: true, whitespace: true, message: '请输入名称' }]}><Input maxLength={24} onChange={event => cornerForm.setFieldValue(['modules', active.name, 'panelName'], event.target.value)} /></Form.Item>
       <Form.Item name={[active.name, 'enabled']} label="启用" valuePropName="checked" extra={module.id === 'toolbox' ? '百宝箱固定展示在最后，不能关闭。' : '关闭后前台不展示这个子应用。'}><Switch disabled={module.id === 'toolbox'} /></Form.Item>
       {!system && <>
        <Form.Item name={[active.name, 'href']} label="跳转链接" rules={[{ validator: (_, value) => { if (!value) return Promise.resolve(); try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? Promise.resolve() : Promise.reject(new Error('只支持 HTTP 或 HTTPS 链接')) } catch { return Promise.reject(new Error('请输入完整的 HTTP 或 HTTPS 链接')) } } }]}><Input maxLength={1000} placeholder="https://..." /></Form.Item>
        <Form.Item name={[active.name, 'icon']} hidden><Input /></Form.Item>
        <Form.Item label="图标" extra="上传一张 PNG 或 SVG 即可；鼠标移入的轻微动效由前台实现，不用准备第二张图。">
         <Space align="center"><img src={cornerPreviewIcon(module)} alt="当前图标" width={52} height={52} style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 10, background: 'var(--ant-color-fill-quaternary)', padding: 6 }} />
          <Upload accept=".png,.svg,image/png,image/svg+xml" showUploadList={false} beforeUpload={(file) => { const svg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name); const png = file.type === 'image/png' || /\.png$/i.test(file.name); if ((!svg && !png) || file.size > 512 * 1024) { message.error('请选择不超过 512 KB 的 PNG 或 SVG 图标'); return Upload.LIST_IGNORE } const reader = new FileReader(); reader.onload = () => cornerForm.setFieldValue(['modules', active.name, 'icon'], String(reader.result || '')); reader.readAsDataURL(new Blob([file], { type: svg ? 'image/svg+xml' : 'image/png' })); return false }}><Button icon={<UploadOutlined />}>上传图标</Button></Upload>
          <Button disabled={!module.icon} onClick={() => cornerForm.setFieldValue(['modules', active.name, 'icon'], '')}>使用默认图标</Button></Space>
        </Form.Item>
        <Button danger icon={<DeleteOutlined />} onClick={() => { remove(active.name); setEditingCornerId(null) }}>移除这个第三方应用</Button>
       </>}
      </>
     }
     return <>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 18 }}>拖动图标调整顺序；点击某个应用后编辑名称和启用状态。系统应用的动效图案由前台提供，百宝箱固定在最后。</Typography.Paragraph>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
       {fields.map(field => { const module = moduleAt(field.name); if (!module) return null; return <button type="button" key={field.key} data-corner-module={module.id} draggable={module.id !== 'toolbox'} onPointerDown={() => { if (!cornerDragId.current) cornerDragClick.current = false }} onDragStart={event => { cornerDragId.current = module.id; cornerDragClick.current = true; event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', module.id) }} onDragOver={event => { if (!cornerDragId.current || cornerDragId.current === module.id) return; event.preventDefault(); const modules = cornerForm.getFieldValue('modules') as CornerModule[]; const from = modules.findIndex(item => item.id === cornerDragId.current); const to = module.id === 'toolbox' ? modules.length - 2 : modules.findIndex(item => item.id === module.id); if (from >= 0 && to >= 0 && from !== to) move(from, to) }} onDrop={event => event.preventDefault()} onDragEnd={() => { cornerDragId.current = null }} onClick={() => { if (!cornerDragClick.current) setEditingCornerId(module.id) }} aria-label={`${module.entryName}，${module.enabled ? '已启用' : '已停用'}，点击编辑${module.id === 'toolbox' ? '' : '，拖动排序'}`} style={{ minWidth: 0, minHeight: 105, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1px solid var(--ant-color-border)', borderRadius: 12, background: 'var(--ant-color-bg-container)', color: 'var(--ant-color-text)', cursor: module.id === 'toolbox' ? 'pointer' : 'grab', opacity: module.enabled ? 1 : .5, padding: 10 }}><img src={cornerPreviewIcon(module)} alt="" width={42} height={42} draggable={false} style={{ width: 42, height: 42, objectFit: 'contain' }} /><span style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>{module.entryName}</span><small style={{ color: 'var(--ant-color-text-secondary)' }}>{module.enabled ? '已启用' : '已停用'}</small></button> })}
      </div>
      <Button type="dashed" block icon={<PlusOutlined />} style={{ marginTop: 18 }} disabled={fields.length >= 50} onClick={() => { const id = 'tool-' + Date.now().toString(36); add({ id, enabled: true, entryName: '新应用', panelName: '新应用', icon: '', href: '' }, Math.max(0, fields.length - 1)); setEditingCornerId(id) }}>新增第三方内容</Button>
     </>
    }}</Form.List>
   </Form>
  </Drawer>
  <ShiyuSpaceVisualConfig open={spaceViewsOpen} initial={draft.spaceViews} names={optionNames} order={spaceViewOrder} onClose={() => setSpaceViewsOpen(false)} onSaved={(views,names,order) => { setDraft(current => ({ ...current, spaceViews: views })); setOptionNames(names); setSavedNames(names); setSpaceViewOrder(order); setSpaceViewsOpen(false) }} />
  <Drawer title="短信验证码服务配置" width={560} open={smsOpen} onClose={() => setSmsOpen(false)} footer={<Space style={{ display: 'flex', justifyContent: 'flex-end' }}><Button disabled={smsSaving} onClick={() => setSmsOpen(false)}>取消</Button><Button type="primary" loading={smsSaving} onClick={() => void saveSmsConfig()}>保存配置</Button></Space>}>
   <Form form={smsForm} layout="vertical">
    <Alert type="info" showIcon message="凭证只保存在后台服务端" description="AccessKey Secret 不会回显到页面，也不会发送到前台。" style={{ marginBottom: 20 }} />
    <Form.Item name="enabled" label="启用短信验证码" valuePropName="checked"><Switch /></Form.Item>
    <Form.Item name="accessKeyId" label="AccessKey ID"><Input autoComplete="off" /></Form.Item>
    <Form.Item name="accessKeySecret" label="AccessKey Secret" extra="如果已有 Secret，留空表示保持不变。"><Input.Password autoComplete="new-password" placeholder="请输入 AccessKey Secret；已有配置可留空" /></Form.Item>
    <Form.Item name="signName" label="短信签名" rules={[{ required: true, message: '请输入短信签名' }]}><Input placeholder="填写阿里云控制台中的签名原文" /></Form.Item>
    <Form.Item name="templateCode" label="模板 CODE"><Input disabled /></Form.Item>
    <Form.Item name="codeLength" label="验证码位数" rules={[{ required: true, message: '请输入验证码位数' }]}><InputNumber min={4} max={8} precision={0} addonAfter="位" style={{ width: '100%' }} /></Form.Item>
    <Form.Item name="codeTtlSeconds" label="验证码有效期" rules={[{ required: true, message: '请输入验证码有效期' }]} extra="可设置 60–1800 秒，默认 600 秒（10 分钟）。"><InputNumber min={60} max={1800} precision={0} addonAfter="秒" style={{ width: '100%' }} /></Form.Item>
   </Form>
  </Drawer>
  <Drawer title="登录方式配置" width={520} open={loginOpen} onClose={() => setLoginOpen(false)} footer={<Space style={{ display: 'flex', justifyContent: 'flex-end' }}><Button disabled={loginSaving} onClick={() => setLoginOpen(false)}>取消</Button><Button type="primary" loading={loginSaving} onClick={() => void saveLoginMethods()}>保存配置</Button></Space>}>
   <Alert type="info" showIcon message="拖动卡片调整前台顺序" description="至少保留一种登录方式。排在最前面的已开启方式会成为前台默认登录方式。" style={{ marginBottom: 20 }} />
   <div style={{ display: 'grid', gap: 12 }}>
    {loginOrder.map(key => { const item = loginMethodOptions.find(option => option.key === key)!; const firstEnabled = loginOrder.find(id => loginDraft[id]); return <Card key={key} size="small" data-login-method={key} onPointerDown={event => startLoginDrag(event, key)} style={{ cursor: draggingLoginMethod === key ? 'grabbing' : 'grab', visibility: draggingLoginMethod === key ? 'hidden' : 'visible', transition: 'box-shadow 150ms ease', boxShadow: draggingLoginMethod && draggingLoginMethod !== key ? '0 4px 16px rgba(22,119,255,.08)' : undefined, touchAction: 'none', userSelect: 'none' }} styles={{ body: { padding: '14px 16px' } }}>
     <Row align="middle" wrap={false} gutter={12}><Col><span aria-hidden="true" style={{ color: '#98a2b3', fontSize: 18, letterSpacing: -3 }}>⠿</span></Col><Col flex="auto"><Space size={8}><Typography.Text strong>{item.label}</Typography.Text>{firstEnabled === key ? <Tag color="blue">默认</Tag> : null}</Space><Typography.Paragraph type="secondary" style={{ margin: '4px 0 0' }}>{item.description}</Typography.Paragraph></Col><Col><Switch aria-label={`启用${item.label}`} checked={loginDraft[key]} onChange={checked => setLoginDraft(current => ({ ...current, [key]: checked }))} /></Col></Row>
    </Card> })}
   </div>
  </Drawer>
 </>
}
