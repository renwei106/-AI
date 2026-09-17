import { useEffect, useState } from 'react'
import { Alert, Button, Card, Checkbox, Drawer, Input, Popconfirm, Select, Space, Table, Tabs, Tag, Typography, message } from 'antd'
type Locale = 'zh-CN' | 'en' | 'ja'
type Language = { code: Locale; name: string; enabled: boolean; countries: string[] }
type Translation = { text: string; approved: boolean; withdrawn?: boolean }
type Group = { id: string; name: string; children: { id: string; name: string }[] }
type Entry = { groups: string[]; order: number; id: string; source: string; files: string[]; translations?: Partial<Record<Locale, Translation>> }
type State = { groups: Group[]; settings: { languages: Language[]; fallback: Locale }; entries: Record<string, Entry>; inventory: { entries: Record<string, Entry> }; provider: { configured: boolean; url: string; hasKey: boolean; source: string }; coverage: Record<string, { total: number; translated: number; approved: number }> }
export async function i18nApi(route: string, method = 'GET', body?: unknown) {
 const r = await fetch('/api/shiyu/i18n/' + route, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) }); const data = await r.json(); if (!r.ok) throw new Error(data.message || '请求失败'); return data
}
export function ShiyuLanguages() {
 const [data, setData] = useState<State>(), [settings, setSettings] = useState<State['settings']>(), [open, setOpen] = useState(false), [entry, setEntry] = useState<Entry>(), [locale, setLocale] = useState<Locale>('en'), [text, setText] = useState(''), [approved, setApproved] = useState(false), [busy, setBusy] = useState(false), [search, setSearch] = useState(''), [query, setQuery] = useState(''), [moduleFilter, setModuleFilter] = useState<string>(), [groupFilter, setGroupFilter] = useState<string>(), [applied, setApplied] = useState<{ module?: string; group?: string }>({}), [page, setPage] = useState(1)
 const [selected, setSelected] = useState<string[]>([])
 useEffect(() => { setSelected([]) }, [locale, query, applied])
 const load = async () => setData(await i18nApi('admin'))
 const run = async (fn: () => Promise<unknown>) => { setBusy(true); try { await fn(); await load() } catch (e) { message.error(e instanceof Error ? e.message : '操作失败') } finally { setBusy(false) } }
 useEffect(() => { void run(load) }, [])
 const countries = (() => { const names = new Intl.DisplayNames(['zh-CN'], { type: 'region' }); const rows = []; for (let a = 65; a <= 90; a++) for (let b = 65; b <= 90; b++) { const code = String.fromCharCode(a, b), label = names.of(code); if (label && label !== code && !['ZZ', 'XA', 'XB'].includes(code)) rows.push({ value: code, label: `${label} (${code})` }) } return rows })()
 const groupList = (data?.groups || []).flatMap(m => m.children.map(g => ({ ...g, module: m.id, moduleName: m.name })))
 const matchingGroups = (e: Entry) => groupList.filter(g => e.groups?.includes(g.id) && (!applied.module || g.module === applied.module) && (!applied.group || g.id === applied.group))
 const rows = data ? Object.keys(data.inventory.entries).map(id => data.entries[id]).filter(e => matchingGroups(e).length && (!query || (e.source + e.files.join()).toLowerCase().includes(query.toLowerCase()))).sort((a, b) => groupList.indexOf(matchingGroups(a)[0]) - groupList.indexOf(matchingGroups(b)[0]) || a.order - b.order) : []
 const selectable = rows.filter(e => e.translations?.[locale]?.text?.trim()).map(e => e.id)
 const batchReview = (action: 'approve' | 'withdraw') => run(async () => { const result = await i18nApi('entries/review', 'POST', { ids: selected, locale, action }); setSelected([]); message.success(action === 'approve' ? `已审核通过 ${result.count} 条译文，发布语言包后生效` : `已下架 ${result.count} 条译文的审核状态，当前线上版本保留`) })
 const resetFilters = () => { setSearch(''); setQuery(''); setModuleFilter(undefined); setGroupFilter(undefined); setApplied({}); setPage(1) }
 const edit = (e: Entry, l: Locale = locale) => { setEntry(e); setLocale(l); setText(e.translations?.[l]?.text || ''); setApproved(e.translations?.[l]?.approved || false) }
 return <>
  <Typography.Title level={3}>语言与翻译库</Typography.Title>
  <Card title="前台语言" extra={<Button type="primary" onClick={() => { if (data) setSettings(structuredClone(data.settings)); setOpen(true) }}>配置语言</Button>} style={{ marginBottom: 20 }}>
   <Space wrap>{data?.settings.languages.map(l => <Tag key={l.code} color={l.enabled ? 'blue' : 'default'}>{l.name} · {l.enabled ? '已启用' : '待启用'}</Tag>)}</Space>
   <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>用户手动选择优先，其次按国家匹配，无法定位时使用默认语言。只有一种语言时隐藏前台切换入口。</Typography.Paragraph>
  </Card>
  <Alert style={{ marginBottom: 20 }} type="info" showIcon message="自动翻译已停用。新增文案扫描后显示为待翻译，编辑并审核后可发布；缺失译文使用中文。" />
  <Card style={{ marginBottom: 20 }}><Space wrap size={[16, 12]}>
   <Space><span>一级分组</span><Select aria-label="一级分组筛选" allowClear placeholder="全部模块" style={{ width: 150 }} value={moduleFilter} onChange={value => { setModuleFilter(value); setGroupFilter(undefined) }} options={data?.groups?.map(g => ({ value: g.id, label: g.name }))} /></Space>
   <Space><span>二级分组</span><Select aria-label="二级分组筛选" allowClear placeholder="全部功能" style={{ width: 170 }} value={groupFilter} onChange={setGroupFilter} options={groupList.filter(g => !moduleFilter || g.module === moduleFilter).map(g => ({ value: g.id, label: g.name }))} /></Space>
   <Space><span>文案</span><Input aria-label="文案筛选" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索原文或来源文件" style={{ width: 190 }} /></Space>
   <Space><Button type="primary" onClick={() => { setQuery(search.trim()); setApplied({ module: moduleFilter, group: groupFilter }); setPage(1) }}>搜索</Button><Button onClick={resetFilters}>重置</Button></Space>
  </Space></Card>
  <Card title="固定文案与系统默认文案" extra={<Space><Button loading={busy} onClick={() => void run(() => i18nApi('scan', 'POST'))}>扫描新增文案</Button><Button type="primary" loading={busy} onClick={() => void run(async () => { const result = await i18nApi('publish-language', 'POST', { locale }); message.success(`语言包已发布，${result.fallbackCount} 条文案使用中文兜底`) })}>发布语言包</Button></Space>}>
   <Tabs activeKey={locale} onChange={key => { setSelected([]); setLocale(key as Locale) }} items={[{ disabled: busy, key: 'en', label: 'English' }, { disabled: busy, key: 'ja', label: '日本語' }]} />
   <Typography.Paragraph type="secondary">{data?.coverage[locale] ? `共 ${data.coverage[locale].total} 条 · 已翻译 ${data.coverage[locale].translated} 条 · 已审核 ${data.coverage[locale].approved} 条` : ''}。系统文案按源码收录，用户填写的内容不进入翻译库。按一级、二级分组排序，同组按来源顺序排列；共用文案显示多个归属。当前筛选 {rows.length} 条。</Typography.Paragraph>
   <Alert type="info" showIcon style={{ marginBottom: 16 }} message="语言可直接启用，启用时自动发布已审核译文；缺失或未审核的文案显示中文。后续审核完成后，点击「发布语言包」更新前台。批量下架保留当前线上版本，再次发布时未审核文案回退中文。" />
   <Space wrap style={{ marginBottom: 16 }}>
    <Typography.Text>已选择 {selected.length} 条（当前语言）</Typography.Text>
    <Button disabled={busy || !selectable.length} onClick={() => setSelected(selectable)}>选择当前筛选的全部译文（{selectable.length}）</Button>
    <Button disabled={busy || !selected.length} onClick={() => setSelected([])}>清空选择</Button>
    <Popconfirm title={`审核通过所选 ${selected.length} 条译文？`} description="请确认已核对语义、术语及界面长度。审核通过后仍需发布语言包。" okText="审核通过" cancelText="取消" onConfirm={() => batchReview('approve')} disabled={busy || !selected.length}><Button type="primary" disabled={busy || !selected.length}>批量审核通过</Button></Popconfirm>
    <Popconfirm title={`下架所选 ${selected.length} 条译文的审核状态？`} description="保留译文及当前线上版本，再次发布时未审核文案回退中文。" okText="确认下架" cancelText="取消" onConfirm={() => batchReview('withdraw')} disabled={busy || !selected.length}><Button danger disabled={busy || !selected.length}>批量下架</Button></Popconfirm>
   </Space>
   <Table rowSelection={{ selectedRowKeys: selected, preserveSelectedRowKeys: true, onChange: keys => setSelected(keys.map(String)), getCheckboxProps: (e: Entry) => ({ disabled: busy || !e.translations?.[locale]?.text?.trim(), 'aria-label': `选择译文：${e.source}` }) }} rowKey="id" dataSource={rows} pagination={{ pageSize: 20, current: page, onChange: setPage, showSizeChanger: false }} scroll={{ x: 860 }} columns={[{ title: '分组', width: 190, render: (_, e: Entry) => <Space direction="vertical" size={4}>{matchingGroups(e).map(g => <div key={g.id}><Typography.Text>{g.moduleName}</Typography.Text><Typography.Text type="secondary"> / {g.name}</Typography.Text></div>)}</Space> },{ title: '中文原文', dataIndex: 'source', ellipsis: true }, { title: '译文', render: (_, e: Entry) => e.translations?.[locale]?.text || '待翻译', ellipsis: true }, { title: '状态', width: 100, render: (_, e: Entry) => <Tag color={e.translations?.[locale]?.approved ? 'green' : 'default'}>{!e.translations?.[locale]?.text?.trim() ? '待翻译' : e.translations?.[locale]?.approved ? '已审核' : e.translations?.[locale]?.withdrawn ? '已下架（待审）' : '待审核'}</Tag> }, { title: '操作', width: 80, render: (_, e: Entry) => <Button type="link" onClick={() => edit(e)}>编辑</Button> }]} />
  </Card>
  <Drawer title="语言配置" width={620} open={open} onClose={() => setOpen(false)} footer={<Space style={{ display: 'flex', justifyContent: 'flex-end' }}><Button onClick={() => setOpen(false)}>取消</Button><Button type="primary" loading={busy} onClick={() => void run(async () => { await i18nApi('settings', 'PUT', settings); setOpen(false); message.success('语言配置已同步前台') })}>保存配置</Button></Space>}>
   <Alert type="info" message="英文、日文可直接启用；启用时自动发布已审核译文，缺失或未审核文案回退中文。国家只能归属一种默认语言；其他国家使用下方默认语言。" />
   {settings?.languages.map(l => <Card key={l.code} title={<Checkbox checked={l.enabled} onChange={e => setSettings({ ...settings, languages: settings.languages.map(x => x.code === l.code ? { ...x, enabled: e.target.checked } : x) })}>{l.name}</Checkbox>} style={{ marginTop: 16 }}><Select mode="multiple" aria-label={`${l.name}默认国家`} placeholder="选择默认使用该语言的国家" optionFilterProp="label" style={{ width: '100%' }} value={l.countries} onChange={countries => setSettings({ ...settings, languages: settings.languages.map(x => x.code === l.code ? { ...x, countries } : x) })} options={countries.map(c => ({ ...c, disabled: settings.languages.some(x => x.code !== l.code && x.countries.includes(c.value)) }))} /></Card>)}
   <Typography.Paragraph style={{ marginTop: 24 }}>其他国家 / 无法定位时的默认语言</Typography.Paragraph><Select value={settings?.fallback} style={{ width: '100%' }} onChange={fallback => settings && setSettings({ ...settings, fallback })} options={settings?.languages.filter(l => l.enabled).map(l => ({ value: l.code, label: l.name }))} />
  </Drawer>
  <Drawer title="编辑与审核译文" width={640} open={!!entry} onClose={() => setEntry(undefined)} footer={<Space style={{ display: 'flex', justifyContent: 'flex-end' }}><Button onClick={() => setEntry(undefined)}>取消</Button><Button type="primary" loading={busy} onClick={() => void run(async () => { await i18nApi('entry', 'PUT', { id: entry?.id, locale, text, approved }); setEntry(undefined) })}>保存</Button></Space>}>
   <Typography.Paragraph>{entry?.source}</Typography.Paragraph><Typography.Paragraph type="secondary">{entry?.files.join('、')}</Typography.Paragraph><Tabs activeKey={locale} onChange={key => entry && edit(entry, key as Locale)} items={[{ key: 'en', label: 'English' }, { key: 'ja', label: '日本語' }]} /><Input.TextArea rows={8} value={text} onChange={e => { setText(e.target.value); setApproved(false) }} /><Checkbox style={{ marginTop: 16 }} checked={approved} onChange={e => setApproved(e.target.checked)}>已核对语义、术语及界面长度</Checkbox>
  </Drawer>
 </>
}
