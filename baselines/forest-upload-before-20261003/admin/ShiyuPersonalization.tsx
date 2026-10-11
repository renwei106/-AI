import { useEffect, useState, type ReactNode } from 'react'
import { Button, Card, ColorPicker, Drawer, Input, Space, Switch, Tag, Typography, message } from 'antd'
import { featureModules, paperActionDefaults, petTimingDefaults, normalizePetTiming, type PetTiming, personalizationDefaults, type Personalization, type PetActions } from '../shiyu-feature-config'
import { ShiyuResourceCards, type ResourceCard } from './ShiyuResourceCards'
import { ShiyuPetActionPreview } from './ShiyuPetActionPreview'
import { ShiyuPetTiming } from './ShiyuPetTiming'
import { ShiyuThemeTrial } from './ShiyuThemeTrial'

type Category = keyof Personalization
const fontFamilies: Record<string,string> = {
  youfeng:"'Shiyu Youfeng Preview', 'Microsoft YaHei', sans-serif", qingya:"'Shiyu Qingya Song Preview', 'Songti SC', serif", wenrun:"'Shiyu Wenrun Kai Preview', 'KaiTi', serif",
  sans:"'Microsoft YaHei', 'PingFang SC', sans-serif", serif:"'SimSun', 'Songti SC', serif", kai:"'KaiTi', 'STKaiti', serif", fang:"'FangSong', 'STFangsong', serif", hei:"'SimHei', 'Heiti SC', sans-serif", mono:"'Cascadia Mono', Consolas, monospace",
}
const preview = (category:Category,id:string,value?:string):ReactNode => {
  if(category==='themes')return <img src={`/shiyu-visuals/theme-${id}.svg`} alt={`${personalizationDefaults.themes.options[id]?.name||id}原始封面`} />
  if(category==='pet')return <img data-pet-skin={id} className={['paper','swordswoman'].includes(id)?'shiyu-pet-paper-image':undefined} src={id==='swordswoman'?'/shiyu-visuals/pet-swordswoman-frame-0.png':id==='paper'?'/shiyu-visuals/pet-girl-frame-9.png':`/shiyu-visuals/pet-${id}.png`} alt={`${personalizationDefaults.pet.options[id]?.name||id}原始形象`} />
  if(category==='fonts')return <div className="shiyu-font-visual" style={{fontFamily:fontFamilies[id]}}>拾起喜欢<span>字里有光 · Aa 09</span></div>
  if(id==='custom')return <div className="shiyu-color-visual is-custom"><b>＋</b><span>自定义颜色</span></div>
  return <div className="shiyu-color-visual" style={{background:value||id}}><span>{value||id}</span></div>
}

export function ShiyuPersonalization({category:active,onNavigate}:{category:Category;onNavigate:(path:string)=>void}) {
 const [saved,setSaved]=useState<Personalization>(personalizationDefaults)
 const [draft,setDraft]=useState<Personalization>(personalizationDefaults)
 const [savedActions,setSavedActions]=useState<PetActions>(paperActionDefaults)
 const [draftActions,setDraftActions]=useState<PetActions>(paperActionDefaults)
 const [editingActions,setEditingActions]=useState<PetActions>(paperActionDefaults)
 const [savedTiming,setSavedTiming]=useState<PetTiming>(petTimingDefaults)
 const [draftTiming,setDraftTiming]=useState<PetTiming>(petTimingDefaults)
 const [editing,setEditing]=useState<string|null>(null)
 const [alias,setAlias]=useState('')
 const [color,setColor]=useState('')
 const [saving,setSaving]=useState(false)
 useEffect(()=>{fetch('/api/shiyu/operations',{credentials:'include',cache:'no-store'}).then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.message||'个性化配置加载失败');return data as {personalization:Personalization;petActions?:PetActions;petTiming?:PetTiming}}).then(data=>{const next=data.personalization||personalizationDefaults,actions={...paperActionDefaults,...data.petActions};setSaved(next);setDraft(structuredClone(next));setSavedActions(actions);setDraftActions({...actions});const timing=normalizePetTiming(data.petTiming);setSavedTiming(timing);setDraftTiming(structuredClone(timing))}).catch(error=>message.error(error.message))},[])
 useEffect(()=>setEditing(null),[active])
 const current=draft[active],changed=JSON.stringify(saved[active])!==JSON.stringify(draft[active])||(active==='pet'&&(JSON.stringify(savedActions)!==JSON.stringify(draftActions)||JSON.stringify(savedTiming)!==JSON.stringify(draftTiming)))
 const update=(category:Category,transform:(value:Personalization[Category])=>Personalization[Category])=>setDraft(previous=>({...previous,[category]:transform(previous[category])}))
 const toggle=(id:string)=>update(active,section=>({...section,options:{...section.options,[id]:{...section.options[id],enabled:!section.options[id].enabled}}}))
 const reorder=(order:string[])=>update(active,section=>({...section,order}))
 const startEdit=(id:string)=>{setEditing(id);setAlias(current.options[id].name);setColor(current.options[id].value||'');if(active==='pet'&&['paper','swordswoman'].includes(id))setEditingActions({...draftActions})}
 const finishEdit=()=>{
  if(!editing)return
  const nextName=alias.trim();if(!nextName){message.warning('请输入展示名称');return}
  const nextColor=active==='colors'&&editing!=='custom'?color.trim().toLowerCase():undefined
  if(nextColor&&!/^#[0-9a-f]{6}$/.test(nextColor)){message.warning('请输入六位十六进制颜色');return}
  update(active,section=>({...section,options:{...section.options,[editing]:{...section.options[editing],name:nextName,...(nextColor?{value:nextColor}:{})}}}))
  if(active==='pet'&&['paper','swordswoman'].includes(editing||''))setDraftActions({...editingActions})
  setEditing(null)
 }
 const save=async()=>{
  if(current.enabled&&!Object.values(current.options).some(option=>option.enabled)){message.warning(`${featureModules[active]}至少保留一个可用选项`);return}
  setSaving(true)
  try{
   const body={personalization:{[active]:current},...(active==='pet'?{petActions:draftActions,petTiming:draftTiming}:{}),...(active==='themes'?{themeSelection:current.order.map(id=>({id,enabled:current.options[id].enabled}))}:{})}
   const response=await fetch('/api/shiyu/operations',{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
   const result=await response.json() as {personalization?:Personalization;petActions?:PetActions;petTiming?:PetTiming;message?:string}
   if(!response.ok||!result.personalization)throw Error(result.message||'个性化配置保存失败')
   const section=result.personalization[active]
   setSaved(previous=>({...previous,[active]:section}));setDraft(previous=>({...previous,[active]:structuredClone(section)}))
   if(active==='pet'){const actions={...paperActionDefaults,...result.petActions};setSavedActions(actions);setDraftActions({...actions});const timing=normalizePetTiming(result.petTiming);setSavedTiming(timing);setDraftTiming(structuredClone(timing))}
   message.success(`${featureModules[active]}已保存并同步前台`)
  }catch(error){message.error(error instanceof Error?error.message:'个性化配置保存失败')}finally{setSaving(false)}
 }
 const items:ResourceCard[]=current.order.filter(id=>current.options[id]).map(id=>({id,defaultName:personalizationDefaults[active].options[id]?.name||id,name:current.options[id].name,enabled:current.options[id].enabled,preview:preview(active,id,current.options[id].value),detail:active==='colors'&&id!=='custom'?current.options[id].value:undefined}))
 return <>
  <div className="shiyu-page-heading"><div><Typography.Title level={3}>{featureModules[active]}</Typography.Title><Typography.Paragraph type="secondary">直接查看每个选项的原始样式，设置前台可选范围、名称和顺序。</Typography.Paragraph></div></div>
  {active==='themes'&&<ShiyuThemeTrial/>}
  <Card className="shiyu-visual-manager" title={featureModules[active]} extra={<Button type="primary" loading={saving} disabled={!changed} onClick={()=>void save()}>保存并同步前台</Button>}>
   <div className="shiyu-visual-manager-intro"><div><Typography.Title level={4}>{featureModules[active]}</Typography.Title><Typography.Text type="secondary">使用开关启用或关闭；长按卡片拖动排序；悬停后点设置修改展示名称{active==='colors'?'和颜色':''}。默认名称始终保留。</Typography.Text></div><Space><Tag color={current.enabled?'green':'default'}>{current.enabled?'入口已开启':'入口已关闭'}</Tag><Switch checked={current.enabled} aria-label={`启用${featureModules[active]}`} onChange={enabled=>update(active,section=>({...section,enabled}))}/></Space></div>
   <ShiyuResourceCards key={active} disabled={saving} label={`${featureModules[active]}全部选项`} items={items} onToggle={toggle} onEdit={startEdit} onReorder={reorder}/>
  </Card>
  {active==='pet'&&<ShiyuPetTiming value={draftTiming} onChange={setDraftTiming}/>}
  <Card className="shiyu-release-maintenance" title="上线记录维护" extra={<Tag color="green">自动维护已启用</Tag>}>
   <div><Typography.Title level={5}>确认上线后，发布前自动填写记录</Typography.Title><Typography.Paragraph type="secondary">后续由 Codex 执行的网站或插件发布，会自动追加时间、版本号、更新性质和核心内容。历史记录只追加，不会覆盖已有内容。</Typography.Paragraph><Typography.Text type="secondary">如果后续改为人工发布，可继续在“上线记录”中手动新增。</Typography.Text></div>
   <Button onClick={()=>onNavigate('/apps/shiyu/release-history')}>查看或手动补录</Button>
  </Card>
  <Drawer title={`设置${editing?personalizationDefaults[active].options[editing]?.name||editing:''}`} rootClassName={active==='pet'&&['paper','swordswoman'].includes(editing||'')?'shiyu-pet-action-drawer':undefined} width={active==='pet'&&['paper','swordswoman'].includes(editing||'')?640:500} open={!!editing} onClose={()=>setEditing(null)} footer={<Space style={{display:'flex',justifyContent:'flex-end'}}><Button onClick={()=>setEditing(null)}>取消</Button><Button type="primary" onClick={finishEdit}>应用到列表</Button></Space>}>
   {editing&&<><div className="shiyu-visual-edit-preview">{preview(active,editing,color)}</div><Typography.Paragraph>默认名称：<b>{personalizationDefaults[active].options[editing]?.name||editing}</b></Typography.Paragraph><Typography.Text type="secondary">默认名称和原始样式不会随别名改变。</Typography.Text><div style={{marginTop:20}}><Typography.Text strong>前台展示名称</Typography.Text><Input aria-label="前台展示名称" maxLength={24} value={alias} onChange={event=>setAlias(event.target.value)} style={{marginTop:8}}/></div>{active==='colors'&&editing!=='custom'&&<div style={{marginTop:24}}><Typography.Text strong>前台可选颜色</Typography.Text><div style={{marginTop:8}}><ColorPicker value={color} format="hex" disabledAlpha showText onChange={value=>setColor(value.toHexString())}/></div><Input aria-label="颜色色号" value={color} onChange={event=>setColor(event.target.value)} style={{marginTop:10}}/></div>}{active==='pet'&&['paper','swordswoman'].includes(editing||'')&&<ShiyuPetActionPreview skin={editing} name={alias} timing={draftTiming.lively.hover} values={editingActions} onChange={setEditingActions}/>}</>}
  </Drawer>
 </>
}
