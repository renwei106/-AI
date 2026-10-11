import { Fragment, useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import { Alert, Button, Card, Checkbox, Drawer, Empty, Form, Input, InputNumber, Popconfirm, Segmented, Space, Switch, Tag, Typography, message } from 'antd'
import { Table } from './ConfigurableTable'
import { ShiyuMemberVisual } from './ShiyuMemberVisual'
import { worldChildGroups, type WorldChildren, type WorldModules } from '../shiyu-world-config'
import type { Personalization } from '../shiyu-feature-config'
import type { PlanAdminView, PlanCatalog, PlanSnapshot as Snapshot, ResourceOption, ShiyuPlan as Plan, ShiyuPlanEntitlement as Benefit } from '../membership/types'
import './membership-plans.css'
const timeText = (time: string) => new Date(time).toLocaleString('zh-CN', { hour12: false })
const ordered = (plans: Plan[]) => plans.map((plan, index) => ({ plan, index })).sort((a,b) => Number(b.plan.publication === 'published') - Number(a.plan.publication === 'published') || a.index - b.index).map(item => item.plan)
const selected = (benefit: Benefit) => Array.isArray(benefit.value) ? benefit.value : []
const atlasKeys = ['atlas-2d','atlas-3d']
const toolQuantityKeys = ['corner-limit','memo-limit','todo-limit','icon-daily-limit','color-daily-limit']
type ToolConfig = {
 corner: { modules: { id: string; enabled: boolean; entryName: string }[] }
 world: { enabled: boolean; modules: WorldModules; children: WorldChildren }
 personalization?: Personalization
}
const cornerBenefitModules: Record<string,string> = {'corner-limit':'common','memo-limit':'memo','todo-limit':'todo','corner-colors':'common'}
const materialBenefitModules: Record<string,string> = {'icon-daily-limit':'studio','color-daily-limit':'palette'}
function configuredToolBenefit(benefit: Benefit, config?: ToolConfig): Benefit | null {
 const moduleId = cornerBenefitModules[benefit.key]
 if(moduleId) {
  const module = config?.corner.modules.find(item => item.id === moduleId)
  if(config && !module?.enabled) return null
  return {...benefit,scope:'拾隅工具',...(benefit.kind === 'quantity' ? {name:module?.entryName || benefit.name,description:''} : {})}
 }
 const materialId = materialBenefitModules[benefit.key]
 if(materialId) {
  const module = worldChildGroups.materials.items.find(item => item.id === materialId)
  if(config && (!config.world.enabled || !config.world.modules.materials || !config.world.children.materials[materialId as keyof WorldChildren['materials']])) return null
  return {...benefit,name:module?.label || benefit.name}
 }
 return benefit
}
// Presentation only: keep the existing entitlement keys and stored grants intact.
function matrixBenefits(plan: Plan, config?: ToolConfig): Benefit[] {
 const atlas = plan.entitlements.filter(benefit => atlasKeys.includes(benefit.key))
 const graph: Benefit = { key:'atlas-views',scope:'空间',name:'图谱视图',description:'',kind:'selection',unit:'',enabled:true,value:atlas.filter(benefit => benefit.enabled).map(benefit => benefit.key),options:atlas.map(benefit => ({id:benefit.key,name:benefit.name})) }
 const rows = plan.entitlements.filter(benefit => ![...atlasKeys,'corner-colors','global-custom-color'].includes(benefit.key)).flatMap(benefit => {
  if(benefit.key === 'global-colors') {
   const custom = plan.entitlements.find(item=>item.key==='global-custom-color')
   const definition = config?.personalization?.colors
   const rank=(option:ResourceOption)=>option.id==='custom'?1:option.preview?.color?.startsWith('linear-gradient(')?2:0
   const colorOptions:ResourceOption[]=[...(benefit.options || []).filter(option=>option.id!=='custom'),{id:'custom',name:definition?.options.custom?.name || custom?.name || '自定义配色',enabled:definition?.enabled!==false&&definition?.options.custom?.enabled!==false,preview:{kind:'color',color:'custom'}}]
   const order=definition?.order||[]
   colorOptions.sort((a,b)=>rank(a)-rank(b)||(order.includes(a.id)?order.indexOf(a.id):999)-(order.includes(b.id)?order.indexOf(b.id):999))
   return {...benefit,name:'全局配色',description:'全局使用的配色。',enabled:benefit.enabled || !!custom?.enabled,value:[...(benefit.enabled?selected(benefit):[]),...(custom?.enabled?['custom']:[])],options:colorOptions}
  }
  if(benefit.key === 'regular-styles') return {...benefit,scope:'空间',name:'宫格视图',description:''}
  const configured = configuredToolBenefit(benefit,config)
  return configured ? [configured] : []
 })
 if(atlas.length) {
  const grid = rows.findIndex(benefit => benefit.key === 'regular-styles')
  rows.splice(grid < 0 ? rows.length : grid + 1,0,graph)
 }
 const globalOrder=['global-colors','global-fonts','global-layouts','desktop-pets']
 const globals=rows.filter(item=>globalOrder.includes(item.key)).sort((a,b)=>globalOrder.indexOf(a.key)-globalOrder.indexOf(b.key))
 let index=0
 rows.forEach((item,i)=>{if(globalOrder.includes(item.key))rows[i]=globals[index++]})
 return rows.map(benefit => {
  if(['主题','全局个性化'].includes(benefit.scope)) return {...benefit,scope:'个性主题'}
  if(['场景','分组'].includes(benefit.scope)) return {...benefit,scope:'空间'}
  return benefit
 })
}
function ResourcePreview({ option }: { option: ResourceOption }) {
 const preview = option.preview
 if (preview?.kind === 'pet') return <img src={preview.url} alt="" style={{width:42,height:42,objectFit:'contain'}}/>
 if (preview?.kind === 'font') return <span className="membership-resource-preview font" style={{ fontFamily: preview.family }}>{preview.sample || '拾起喜欢'}</span>
 if (preview?.kind === 'color') return <span className={`membership-resource-preview color ${preview.color === 'custom' ? 'custom' : ''}`} style={preview.color !== 'custom' ? { background: preview.color } : undefined}/>
 if (preview?.kind === 'theme') return <span className={`membership-resource-preview theme theme-${option.id}`} style={{ '--resource-color': preview.color } as CSSProperties}><i/><i/><b>{option.name.slice(0,2)}</b></span>
 return <span className={`membership-resource-preview layout style-${preview?.styleId || ''}`} style={{ '--resource-columns': preview?.columns || 3 } as CSSProperties}>{Array.from({ length: Math.min(preview?.columns || 3, 6) }, (_,i) => <i key={i}/>)}</span>
}
function Matrix({ plans, catalog, toolConfig, editing = false, busy = false, change, choose, header, dragId, onCreate }: { plans: Plan[]; catalog?: Benefit[]; toolConfig?: ToolConfig; editing?: boolean; busy?: boolean; change?: (id: string,key: string,patch: Partial<Benefit>) => void; choose?: (id: string,key: string) => void; header: (p: Plan,i: number) => ReactNode; dragId?: string; onCreate?: () => void }) {
 const [expanded,setExpanded] = useState<Set<string>>(() => new Set())
 const displayPlans = plans.map(plan => ({...plan,entitlements:matrixBenefits(plan,toolConfig)}))
 const rows = [...new Map(displayPlans.flatMap(p => p.entitlements).map(b => [b.key,b])).values()]
 const groups = [...new Set(rows.map(b => b.scope))].map(scope => ({ scope, rows: rows.filter(b => b.scope === scope) }))
 const optionsFor = (row: Benefit) => {
  const source = (row.key === 'global-colors' ? row.options : catalog?.find(item => item.key === row.key)?.options) || row.options || []
  const options = new Map(source.map(option => [option.id,option]))
  // Keep historical grants visible alongside newly added catalog resources.
  displayPlans.forEach(plan => {
   const benefit = plan.entitlements.find(item => item.key === row.key)
   if (!benefit) return
   selected(benefit).forEach(id => { if (!options.has(id)) options.set(id, { ...benefit.options?.find(option => option.id === id), id, name: benefit.options?.find(option => option.id === id)?.name || id, enabled: false }) })
  })
  return [...options.values()]
 }
 const cellClass = (plan: Plan) => `${editing && !plan.enabled ? 'plan-offline' : ''} ${dragId === plan.id ? 'column-dragging' : ''}`
 const toggle = (key: string) => setExpanded(current => { const next = new Set(current); if(next.has(key)) next.delete(key); else next.add(key); return next })
 const toggleResource = (plan: Plan, benefit: Benefit, option: ResourceOption, checked: boolean) => {
  const ids = benefit.enabled ? selected(benefit) : []
  const value = checked ? [...new Set([...ids,option.id])] : ids.filter(id => id !== option.id)
  change?.(plan.id,benefit.key,{ value,enabled:checked ? true : benefit.enabled })
 }
 return <div className="shiyu-matrix-scroll"><table className="shiyu-plan-matrix compact-matrix membership-matrix"><thead><tr><th className="matrix-group">功能分组</th><th className="matrix-feature">权益项目</th>{plans.map((p,i) => <th key={p.id} data-plan-id={p.id} className={`${(editing ? p.enabled : p.publication === 'published') ? 'plan-published' : editing ? 'plan-offline' : ''} ${dragId === p.id ? 'column-dragging' : ''}`}>{header(p,i)}</th>)}{editing && onCreate && <th className="membership-add-column" data-role="add-plan-column"><button type="button" className="matrix-plan-card membership-add-plan-card" data-role="add-plan-card" aria-label="新增套餐" disabled={busy} onClick={onCreate}><span className="membership-add-symbol" aria-hidden="true">＋</span><strong>新增套餐</strong><small>创建一个新的会员套餐</small></button></th>}</tr></thead>{groups.map(group => <tbody key={group.scope}>{group.rows.map((row,i) => {
  const options = row.kind === 'selection' ? optionsFor(row) : []
  const open = row.kind === 'selection' && expanded.has(row.key)
  return <Fragment key={row.key}><tr data-benefit-key={row.key}>{i === 0 && <th className="matrix-group" scope="rowgroup" rowSpan={group.rows.reduce((total,item) => total + 1 + (item.kind === 'selection' && expanded.has(item.key) ? optionsFor(item).length : 0),0)}>{group.scope}</th>}<th className="matrix-feature" scope="row"><div className="membership-benefit-heading"><span>{row.name}</span>{row.kind === 'selection' && <Button size="small" type="text" className="membership-expand-toggle" aria-label={`${open?'收起':'展开'}${row.name}`} aria-expanded={open} onClick={() => toggle(row.key)}>{open?'收起':'展开'}<span aria-hidden="true">{open?'⌃':'⌄'}</span></Button>}</div>{row.description && <small>{row.description}</small>}</th>{displayPlans.map(p => { const b = p.entitlements.find(item => item.key === row.key); return <td key={p.id} data-plan-id={p.id} className={cellClass(p)}>{b && (b.kind === 'selection' ? <div className="membership-selection-summary"><span className="membership-resource-count">共 <strong>{b.enabled?selected(b).length:0}</strong> 种</span>{editing && <Button size="small" disabled={busy} aria-label={`配置${p.name}${b.name}`} onClick={() => choose?.(p.id,b.key)}>配置{b.name}</Button>}</div> : editing ? <Space size={6} wrap><Checkbox disabled={busy} checked={b.enabled} aria-label={`${p.name}包含${b.name}`} onChange={e => change?.(p.id,b.key,{ enabled:e.target.checked })}/>{b.kind === 'quantity' ? <InputNumber size="small" min={0} max={1000000} precision={0} disabled={busy || !b.enabled || b.unlimited} aria-label={`${p.name}${b.name}数量`} value={Number(b.value)} onChange={v => change?.(p.id,b.key,{ value:v ?? 0 })} addonAfter={b.unit}/> : <span>{b.enabled ? '包含' : '不包含'}</span>}{b.kind === 'quantity' && toolQuantityKeys.includes(b.key) && <Checkbox disabled={busy || !b.enabled} checked={b.unlimited === true} aria-label={`${p.name}${b.name}不限量`} onChange={e => change?.(p.id,b.key,{unlimited:e.target.checked})}>不限量</Checkbox>}</Space> : <span>{!b.enabled ? '不包含' : b.kind === 'quantity' ? b.unlimited ? '不限量' : `${b.value} ${b.unit}` : '包含'}</span>)}</td> })}{editing && onCreate && <td className="membership-add-cell" aria-hidden="true"/>}</tr>{open && options.map(option => <tr className="membership-resource-row" key={option.id} data-resource-benefit={row.key} data-resource-id={option.id}><th className="matrix-feature membership-resource-label" scope="row"><div><ResourcePreview option={option}/><span><strong>{option.name}</strong>{option.enabled === false && <small>资源已下架</small>}</span></div></th>{displayPlans.map(plan => {
   const benefit = plan.entitlements.find(item => item.key === row.key)
   const included = !!benefit?.enabled && selected(benefit).includes(option.id)
   return <td key={plan.id} data-plan-id={plan.id} className={cellClass(plan)}>{editing && benefit ? <Checkbox disabled={busy} checked={included} aria-label={`${plan.name}包含${row.name}：${option.name}`} onChange={event => toggleResource(plan,benefit,option,event.target.checked)}>{included?'已包含':'未包含'}</Checkbox> : <span className={`membership-resource-inclusion ${included?'included':''}`}><span className="membership-resource-check" aria-hidden="true">{included?'✓':''}</span>{included?'已包含':'未包含'}</span>}</td>
  })}{editing && onCreate && <td className="membership-add-cell" aria-hidden="true"/>}</tr>)}</Fragment>
 })}</tbody>)}</table></div>
}
export function PlanMatrix() {
 const [plans,setPlans] = useState<Plan[]>([]), [saved,setSaved] = useState<Plan[]>([]), [published,setPublished] = useState<Plan[]>([]), [revision,setRevision] = useState(0)
 const [toolConfig,setToolConfig] = useState<ToolConfig>()
 const [catalog,setCatalog] = useState<PlanCatalog|null>(null), [mode,setMode] = useState<string>('查看已上线'), [loading,setLoading] = useState(true), [saving,setSaving] = useState(false), [error,setError] = useState('')
 const [editing,setEditing] = useState<Plan|null>(null), [form] = Form.useForm<Plan>()
 const [resourceEditor,setResourceEditor] = useState<{ planId: string; key: string; ids: string[] }|null>(null)
 const [historyOpen,setHistoryOpen] = useState(false), [history,setHistory] = useState<Snapshot[]>([]), [historyLoading,setHistoryLoading] = useState(false), [snapshot,setSnapshot] = useState<Snapshot|null>(null)
 const [dragId,setDragId] = useState<string>(), [ghost,setGhost] = useState<{name:string;x:number;y:number}|null>(null)
 const drag = useRef<{id:string;startX:number;startY:number;active:boolean;timer:ReturnType<typeof setTimeout>;original:Plan[];centers:{id:string;x:number}[]}|null>(null), root = useRef<HTMLDivElement>(null)
 const dirty = JSON.stringify(plans) !== JSON.stringify(saved), editMode = mode === '编辑全部'
 const pendingPublish = dirty || plans.some(plan => plan.enabled && plan.hasChanges)
 const drawerAutoRenew = Form.useWatch('autoRenew',form)
 const hasPendingChange = (plan: Plan) => !!(plan.enabled && plan.hasChanges) || JSON.stringify(plan) !== JSON.stringify(saved.find(item => item.id === plan.id))
 const statusText = (plan: Plan) => { const live = published.some(item => item.id === plan.id); if(editMode && plan.enabled !== live) return plan.enabled ? '待上线' : '待下线'; return live ? '已上线' : plan.publication === 'draft' ? '未上线' : '已下线' }
 const receive = (data: PlanAdminView) => { setPlans(ordered(data.items)); setSaved(ordered(data.items)); setPublished(data.publishedItems.map(plan => ({...plan,publication:'published'}))); setRevision(data.revision) }
 const defaultSaving = useRef(false)
 const setDefault = async (id: string) => {
  if(defaultSaving.current) return
  defaultSaving.current = true; setSaving(true)
  const syncDefaultView = (data: PlanAdminView) => {
   if(!dirty) receive(data)
   else { setPublished(data.publishedItems.map(plan => ({...plan,publication:'published'}))); setRevision(data.revision) }
  }
  try {
   const response = await fetch('/api/shiyu/plans/admin', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'set-default',id,revision})})
   const data = await response.json()
   if(response.status === 409) {
    const latestResponse = await fetch('/api/shiyu/plans/admin', {cache:'no-store'})
    const latest = await latestResponse.json()
    if(!latestResponse.ok) throw Error(latest.message || '同步最新套餐失败，请刷新后重试')
    // Keep revision protection: refresh the visible choices without overwriting another administrator's selection.
    if(dirty) { setPublished(latest.publishedItems.map((plan: Plan) => ({...plan,publication:'published'}))); message.warning({key:'default-plan',content:'配置已更新；你有未保存的编辑，请刷新并核对后再设置默认套餐'}); return }
    receive(latest)
    message.info({key:'default-plan',content:'已同步最新套餐配置，请重新选择默认套餐'})
    return
   }
   if(!response.ok) throw Error(data.message || '设置失败')
   syncDefaultView(data)
   message.success({key:'default-plan',content:'默认套餐已设置，用户重新进入会员页时生效'})
  } catch(e) { message.error({key:'default-plan',content:e instanceof Error ? e.message : '设置失败'}) }
  finally { defaultSaving.current = false; setSaving(false) }
 }

 const load = async () => { setLoading(true); setError(''); try { const responses = await Promise.all([fetch('/api/shiyu/plans/admin'),fetch('/api/shiyu/plans/catalog'),fetch('/api/shiyu/operations',{credentials:'include',cache:'no-store'})]); const [data, resources, operations] = await Promise.all(responses.map(response => response.json())); if (responses.some(response => !response.ok)) throw Error(data.message || resources.message || operations.message || '套餐加载失败'); receive(data); setCatalog(resources); setToolConfig(operations) } catch(e) { setError(e instanceof Error ? e.message : '套餐加载失败') } finally { setLoading(false) } }
 useEffect(() => { void load() }, [])
 useEffect(() => () => { if(drag.current) clearTimeout(drag.current.timer) }, [])
 const benefit = (id:string,key:string,patch:Partial<Benefit>) => setPlans(items => items.map(p => p.id === id ? {...p,entitlements:p.entitlements.map(b => {
  if(key === 'global-colors' && Array.isArray(patch.value)) {
   if(b.key === 'global-custom-color') return {...b,enabled:patch.value.includes('custom')}
   if(b.key === key) {const value=patch.value.filter(id=>id!=='custom');return {...b,value,enabled:value.length>0}}
  }
  if(key === 'atlas-views' && atlasKeys.includes(b.key) && Array.isArray(patch.value)) return {...b,enabled:patch.value.includes(b.key)}
  return b.key === key ? {...b,...patch} : b
 })} : p))
 const saveAndPublish = async () => { setSaving(true); try { const response = await fetch('/api/shiyu/plans/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'save-and-publish',revision,items:plans})}); const data = await response.json(); if(!response.ok) throw Error(data.message || '保存失败'); receive(data); setMode('查看已上线'); message.success('全部套餐配置已保存并发布，前台已更新') } catch(e) { message.error(e instanceof Error ? e.message : '保存失败，修改已保留') } finally { setSaving(false) } }
 const openEditor = (plan: Plan) => { setEditing(plan); form.setFieldsValue(plan) }
 const applyEdit = async () => { try { const values = await form.validateFields(); if(editing?.id === 'free') values.enabled = true; if(values.autoRenew) values.enabled = false; setPlans(items => items.some(p => p.id === editing!.id) ? items.map(p => p.id === editing!.id ? {...p,...values} : p) : [...items,{...editing!,...values}]); setEditing(null) } catch { /* Field errors remain visible. */ } }
 const loadHistory = async () => { setHistoryOpen(true); setHistoryLoading(true); try { const r=await fetch('/api/shiyu/plans/history'), d=await r.json(); if(!r.ok)throw Error(d.message);setHistory(d.items) } catch(e) { message.error(e instanceof Error ? e.message : '记录加载失败') } finally { setHistoryLoading(false) } }
 const startDrag = (event:PointerEvent<HTMLDivElement>,plan:Plan) => { if(saving || event.button !== 0 || (event.target as HTMLElement).closest('button,input,label'))return; root.current!.setPointerCapture(event.pointerId); const centers = Array.from(root.current!.querySelectorAll<HTMLTableCellElement>('thead [data-plan-id]')).filter(element => (plans.find(p => p.id === element.dataset.planId)?.publication === 'published') === (plan.publication === 'published')).map(e => ({id:e.dataset.planId!,x:e.getBoundingClientRect().left+e.getBoundingClientRect().width/2})); const state={id:plan.id,startX:event.clientX,startY:event.clientY,active:false,original:plans,centers,timer:setTimeout(() => {state.active=true;setDragId(plan.id);setGhost({name:plan.name,x:state.startX,y:state.startY})},280)};drag.current=state }
 const moveDrag = (e:PointerEvent<HTMLDivElement>) => { const d=drag.current;if(!d)return;if(!d.active){if(Math.hypot(e.clientX-d.startX,e.clientY-d.startY)>8){clearTimeout(d.timer);drag.current=null}return}e.preventDefault();setGhost(g=>g?{...g,x:e.clientX,y:e.clientY}:g);const target=d.centers.reduce((best,c)=>Math.abs(c.x-e.clientX)<Math.abs(best.x-e.clientX)?c:best).id;setPlans(items=>{const from=items.findIndex(p=>p.id===d.id),to=items.findIndex(p=>p.id===target);if(from===to)return items;const next=[...items];next.splice(to,0,next.splice(from,1)[0]);return next}) }
 const endDrag = (cancel=false) => { const d=drag.current;if(!d)return;clearTimeout(d.timer);if(cancel&&d.active)setPlans(d.original);drag.current=null;setDragId(undefined);setGhost(null) }
 const keyboardMove = (index:number,delta:number) => setPlans(items => { const to=index+delta;if(to<0||to>=items.length||(items[index].publication==='published')!==(items[to].publication==='published'))return items;const next=[...items];next.splice(to,0,next.splice(index,1)[0]);return next })
 const resourcePlan = plans.find(p=>p.id===resourceEditor?.planId), resourceBenefit = resourcePlan ? matrixBenefits(resourcePlan,toolConfig).find(b=>b.key===resourceEditor?.key) : undefined
 const resources = resourceBenefit ? (resourceBenefit.key === 'global-colors' ? resourceBenefit.options : catalog?.items.find(b=>b.key===resourceBenefit.key)?.options) || resourceBenefit.options || [] : []
 return <>
 {catalog && <style>{catalog.resources.fonts.filter(option=>option.preview?.url).map(option=>`@font-face{font-family:${option.preview!.family!.split(',')[0]};src:url('${option.preview!.url}') format('woff2');font-display:swap;}`).join('\n')}</style>}
 <Card className="membership-plan-manager" loading={loading} title="套餐与权益" extra={<Space wrap><ShiyuMemberVisual/><Button onClick={loadHistory}>变更记录</Button>{editMode && <><Button disabled={!dirty||saving} onClick={()=>setPlans(saved)}>取消修改</Button><Button type="primary" data-role="save-and-publish" loading={saving} disabled={!pendingPublish||!!dragId} onClick={()=>void saveAndPublish()}>保存并发布</Button></>}</Space>}>
 {error ? <Alert type="error" showIcon title={error} action={<Button onClick={()=>void load()}>重新加载</Button>}/> : <><div className="membership-plan-toolbar"><Segmented value={mode} disabled={saving} options={['查看已上线','编辑全部']} onChange={value=>setMode(String(value))}/><Typography.Text type="secondary">{editMode ? '编辑内容和上线状态后，统一点击“保存并发布”。长按卡片可在同组排序。' : '已上线付费套餐必须且只能有一个默认开启；开启其他套餐会自动切换，用户进入前台会员页时默认选中该套餐。'}</Typography.Text></div>{pendingPublish && <Alert type="info" showIcon title="当前修改尚未生效，点击“保存并发布”后统一更新前台。"/>}{!(editMode?plans:published).length ? <Empty description="暂无已上线套餐"/> : <div ref={root} onPointerMove={moveDrag} onPointerUp={()=>endDrag()} onPointerCancel={()=>endDrag(true)} onLostPointerCapture={()=>endDrag()}><Matrix plans={editMode?plans:published} catalog={catalog?.items} toolConfig={toolConfig} editing={editMode} busy={saving} change={benefit} choose={(planId,key)=>setResourceEditor({planId,key,ids:selected(matrixBenefits(plans.find(p=>p.id===planId)!,toolConfig).find(b=>b.key===key)!)})} dragId={dragId} onCreate={()=>openEditor({...plans.find(p=>p.id!=='free')||plans[0],id:`custom-${Date.now()}`,name:'新套餐',autoRenew:false,enabled:false,publication:'draft',hasChanges:true,version:0,publishedAt:null})} header={(p,i)=><div className="matrix-plan-card" tabIndex={editMode?0:undefined} aria-label={`${p.name}套餐卡片`} onPointerDown={editMode?e=>startDrag(e,p):undefined} onKeyDown={e=>{if(e.key==='Escape')endDrag(true);if(editMode&&!saving&&e.altKey&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();keyboardMove(i,e.key==='ArrowLeft'?-1:1)}}}><div className="matrix-card-meta"><Tag color={p.enabled?'blue':undefined}>{statusText(p)}</Tag>{!editMode&&p.id!=='free'&&<span className="membership-default-control" title="必须保留一个默认套餐；开启其他套餐可自动切换"><span>默认</span><Switch size="small" aria-label={`${p.name}默认选中`} checked={p.isDefault===true} disabled={saving} onChange={checked=>{if(checked)void setDefault(p.id);else message.info('必须且只能有一个默认套餐开启，请开启其他套餐的开关来切换')}}/></span>}{editMode&&hasPendingChange(p)&&<small data-role="plan-pending">修改待保存</small>}</div><h3>{p.name}</h3><strong className="matrix-card-price">¥ {p.price}</strong><div className="matrix-card-cycle">{p.cycle}</div><dl><div><dt>原价</dt><dd>¥ {p.original}</dd></div><div><dt>有效期</dt><dd>{p.days?`${p.days} 天`:'长期'}</dd></div><div><dt>续费方式</dt><dd>{p.autoRenew?'连续续费（暂不可上线）':'单次购买'}</dd></div></dl>{p.tag&&<small>{p.tag}</small>}{editMode&&<div className="membership-plan-actions"><div className="membership-plan-enabled"><span>上线展示</span><Switch data-role="plan-enabled" aria-label={`${p.name}上线展示`} checked={p.id==='free'||p.enabled} disabled={saving||p.id==='free'||p.autoRenew} onChange={enabled=>setPlans(items=>items.map(plan=>plan.id===p.id?{...plan,enabled}:plan))}/></div><Button disabled={saving} onClick={()=>openEditor(p)}>编辑套餐</Button></div>}</div>}/></div>}</>}
 </Card>
 {ghost&&<div className="matrix-drag-ghost" style={{left:ghost.x+16,top:ghost.y+16}}>{ghost.name}<small>套餐与权益整列移动</small></div>}
 <Drawer title={`编辑套餐 · ${editing?.name||''}`} width={480} open={!!editing} onClose={()=>setEditing(null)} footer={<Space>{editing?.publication==='offline'&&editing.id!=='free'&&<Popconfirm title="删除此已下线套餐？" description="保留已购买用户权益和订单；保存并发布后从列表移除，无法再次上线。" onConfirm={()=>{setPlans(items=>items.filter(plan=>plan.id!==editing.id));setEditing(null)}}><Button danger>删除套餐</Button></Popconfirm>}<Button onClick={()=>setEditing(null)}>取消</Button><Button type="primary" onClick={applyEdit}>保存编辑</Button></Space>}><Form form={form} layout="vertical"><Form.Item name="name" label="套餐名称" rules={[{required:true,whitespace:true,message:'请输入套餐名称'}]}><Input maxLength={30}/></Form.Item><div className="shiyu-plan-form-grid"><Form.Item name="price" label="售价（实际购买金额）" rules={[{required:true}]}><InputNumber min={0} max={100000} precision={2} prefix="¥" disabled={editing?.id==='free'}/></Form.Item><Form.Item name="original" label="原价（价格对比展示）" rules={[{required:true}]}><InputNumber min={0} max={100000} precision={2} prefix="¥"/></Form.Item></div><Form.Item name="days" label={editing?.id==='free'?'有效天数（免费版为长期）':'有效天数（1–3660 天）'} rules={[{required:true}]}><InputNumber min={editing?.id==='free'?0:1} max={3660} precision={0} addonAfter="天" disabled={editing?.id==='free'}/></Form.Item><Form.Item name="cycle" label="展示周期（例如：一个月 30 天）" rules={[{required:true,whitespace:true}]}><Input maxLength={50}/></Form.Item><Form.Item name="tag" label="套餐标签"><Input maxLength={30}/></Form.Item><Form.Item name="autoRenew" label="连续续费" valuePropName="checked" extra="自动扣款尚未开通，连续续费套餐可保存为未上线，暂不支持上线。"><Switch disabled={!editing?.autoRenew} onChange={checked=>{if(checked)form.setFieldValue('enabled',false)}}/></Form.Item><Form.Item name="enabled" label="上线展示" valuePropName="checked" extra="仅暂存本页修改，点击右上角“保存并发布”后生效。"><Switch aria-label="编辑套餐上线展示" disabled={editing?.id==='free'||drawerAutoRenew===true}/></Form.Item><Typography.Text type="secondary">保存编辑仅保留本页修改，可继续编辑其他套餐；点击右上角“保存并发布”后统一生效。</Typography.Text></Form></Drawer>
 <Drawer title={`${resourcePlan?.name||''} · ${resourceBenefit?.name||'权益资源'}`} width={620} open={!!resourceEditor} onClose={()=>setResourceEditor(null)} footer={<div className="membership-resource-footer"><span>已选 {resourceEditor?.ids.length||0} 项</span><Space><Button onClick={()=>setResourceEditor(null)}>取消</Button><Button type="primary" onClick={()=>{if(resourceEditor)benefit(resourceEditor.planId,resourceEditor.key,{value:resourceEditor.ids,enabled:resourceEditor.ids.length>0});setResourceEditor(null)}}>保存编辑</Button></Space></div>}>
 <Typography.Paragraph type="secondary">{resourceBenefit?.description} 选中的具体资源会在权益表中回显。</Typography.Paragraph><Space className="membership-resource-actions"><Button onClick={()=>setResourceEditor(state=>state?{...state,ids:[...new Set([...state.ids,...resources.filter(option=>option.enabled!==false).map(option=>option.id)])]}:state)}>全选可用资源</Button><Button onClick={()=>setResourceEditor(state=>state?{...state,ids:[]}:state)}>清空选择</Button></Space><div className="membership-resource-grid">{resources.map(option=><label key={option.id} className={`membership-resource-option ${resourceEditor?.ids.includes(option.id)?'selected':''} ${option.enabled===false?'retired':''}`}><Checkbox checked={resourceEditor?.ids.includes(option.id)} aria-label={option.name} onChange={e=>setResourceEditor(state=>state?{...state,ids:e.target.checked?[...state.ids,option.id]:state.ids.filter(id=>id!==option.id)}:state)}/><ResourcePreview option={option}/><span><strong>{option.name}</strong><small>{option.preview?.kind==='color'&&option.preview.color!=='custom'?option.preview.color:option.enabled===false?'资源已下架，授权可保留':option.preview?.kind==='font'?'字体效果预览':''}</small></span></label>)}</div>{resourceEditor?.ids.some(id=>!resources.some(option=>option.id===id))&&<Alert style={{marginTop:16}} type="info" title="包含已移除的历史资源授权，未清空时会继续保留。"/>}
 </Drawer>
 <Drawer title="会员套餐变更记录" width={760} open={historyOpen} onClose={()=>setHistoryOpen(false)}><Table<Snapshot> configKey="ShiyuPlanHistory" fixedKeys={['actions']} loading={historyLoading} rowKey="id" dataSource={history} columns={[{title:'保存时间',dataIndex:'savedAt',render:timeText},{title:'操作人',dataIndex:'operator'},{title:'操作内容',dataIndex:'action',render:value=>value||'历史配置保存'},{title:'操作',key:'actions',render:(_,r)=><Button type="link" onClick={()=>setSnapshot(r)}>查看配置快照</Button>}]} /></Drawer>
 <Drawer title={`配置快照 · ${snapshot?timeText(snapshot.savedAt):''}`} width="92vw" open={!!snapshot} onClose={()=>setSnapshot(null)}>{snapshot&&<><Typography.Paragraph type="secondary">操作人：{snapshot.operator} · 以下为当时保存的完整配置，只读展示。</Typography.Paragraph><Matrix plans={snapshot.items} header={p=><div className="matrix-plan-card"><h3>{p.name}</h3><dl>{[['套餐编号',p.id],['套餐标签',p.tag],['售价',`¥ ${p.price}`],['原价',`¥ ${p.original}`],['展示周期',p.cycle],['有效天数',`${p.days} 天`],['连续续费',p.autoRenew?'是':'否'],['上线状态',p.enabled?'已上线':'未上线']].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>}/></>}</Drawer>
 </>
}
