import { useEffect, useState } from 'react'
import { Alert, Button, Card, Checkbox, Drawer, Input, Space, Switch, Tabs, Tag, Typography, message } from 'antd'
import { i18nApi } from './ShiyuLanguages'
type Kind = 'announcement' | 'update'
type Text = { title: string; body: string; approved?: boolean }
type Draft = { enabled: boolean; revision: string; translations: Record<string, Text> }
type Notice = { id: string; draft: Draft; published?: Draft; createdAt?: string; publishedAt?: string; history?: { published: Draft; publishedAt?: string }[] }
const labels = { 'zh-CN': '简体中文', en: 'English', ja: '日本語' }
export function ShiyuNotices() {
 const [notices, setNotices] = useState<Record<Kind, Notice[]>>({ announcement: [], update: [] }), [enabled, setEnabled] = useState<string[]>(['zh-CN']), [active, setActive] = useState<Kind>('announcement'), [current, setCurrent] = useState<Record<Kind, string | undefined>>({ announcement: undefined, update: undefined }), [editing, setEditing] = useState<Kind>(), [editingId, setEditingId] = useState(''), [draft, setDraft] = useState<Draft>(), [locale, setLocale] = useState('zh-CN'), [busy, setBusy] = useState(false)
 const load = async () => { const [data, announcements, updates] = await Promise.all([i18nApi('admin'), i18nApi('notices/announcement/items'), i18nApi('notices/update/items')]); setEnabled(data.settings.languages.filter((l: { enabled: boolean }) => l.enabled).map((l: { code: string }) => l.code)); setNotices({ announcement: announcements.items, update: updates.items }); setCurrent({ announcement: data.notices.announcement?.currentId || announcements.items.find((n: Notice) => n.published?.revision === announcements.currentRevision)?.id, update: data.notices.update?.currentId || updates.items.find((n: Notice) => n.published?.revision === updates.currentRevision)?.id }) }
 useEffect(() => { void load().catch(e => message.error(e.message)) }, [])
 const run = async (fn: () => Promise<void>) => { setBusy(true); try { await fn(); await load() } catch (e) { message.error(e instanceof Error ? e.message : '操作失败') } finally { setBusy(false) } }
 const save = async () => { const next: Notice = await i18nApi(`notices/${editing}/items/${editingId}`, 'PUT', draft); setDraft(next.draft); return next }
 const change = (part: Partial<Text>) => { if (!draft) return; setDraft({ ...draft, translations: { ...draft.translations, [locale]: { ...(draft.translations[locale] || { title: '', body: '' }), ...part } } }) }
 return <>
  <div className="shiyu-page-heading"><div><Typography.Title level={3}>公告与更新</Typography.Title><Typography.Paragraph type="secondary">维护中文原稿，一键生成英文与日文，审核后同步前台。</Typography.Paragraph></div></div>
  <Alert type="info" showIcon message={`当前启用 ${enabled.length} 种语言：${enabled.map(l => labels[l as keyof typeof labels]).join('、')}。发布时会校验所有已启用语言；保存草稿不会影响前台。`} style={{ marginBottom: 20 }} />
  <Tabs activeKey={active} onChange={key => setActive(key as Kind)} items={[{ key: 'announcement', label: '全局公告' }, { key: 'update', label: '版本更新' }]} />
  <Card title={active === 'announcement' ? '全局公告' : '版本更新'} extra={<Button type="primary" loading={busy} onClick={() => void run(async () => { const item: Notice = await i18nApi(`notices/${active}/items`, 'POST'); setEditing(active); setEditingId(item.id); setDraft(structuredClone(item.draft)); setLocale('zh-CN') })}>{active === 'announcement' ? '新增公告' : '新增版本更新'}</Button>} styles={{ body: { padding: 16 } }}>
   <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>{active === 'announcement' ? '弹窗直接展示详情，同一公告确认后不再重复提醒。' : '轻量提示新版本，用户点击后查看更新详情。'}</Typography.Paragraph>
   {!notices[active].length && <Typography.Paragraph type="secondary">暂无记录，点击右上角新增。</Typography.Paragraph>}
   <Space orientation="vertical" size={12} style={{ width: '100%' }}>{[...notices[active]].sort((a, b) => Number(b.id === current[active]) - Number(a.id === current[active]) || (Date.parse(b.publishedAt || b.createdAt || '') || 0) - (Date.parse(a.publishedAt || a.createdAt || '') || 0)).map(item => {
    const content = item.published || item.draft, text = content.translations['zh-CN'], changed = !!item.published && JSON.stringify(item.draft) !== JSON.stringify(item.published)
    return <div key={item.id} style={{ padding: '12px 16px', background: 'var(--admin-bg, rgba(128,128,128,.06))', borderRadius: 10 }}>
     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}><Space wrap><Typography.Text strong>{text?.title || '未命名草稿'}</Typography.Text><Tag>{content.revision || '未填写编号'}</Tag><Tag color={item.published ? item.id === current[active] ? 'green' : 'default' : 'orange'}>{item.published ? item.id === current[active] ? content.enabled ? '最新发布' : '当前未启用' : '历史发布' : '草稿'}</Tag>{changed && <Tag color="orange">有未发布修改</Tag>}</Space><Button type="primary" size="small" onClick={() => { setEditing(active); setEditingId(item.id); setDraft(structuredClone(item.draft)); setLocale('zh-CN') }}>编辑内容</Button></div>
     <Typography.Paragraph ellipsis={{ rows: 2, expandable: true, symbol: '展开' }} style={{ whiteSpace: 'pre-wrap', marginBottom: 6 }}>{text?.body || '编辑中文及对应语言内容，审核后发布。'}</Typography.Paragraph>
     <Typography.Text type="secondary" style={{ fontSize: 12 }}>{item.publishedAt ? '发布时间：' + new Date(item.publishedAt).toLocaleString() : '尚未发布'}</Typography.Text>
     {item.history?.map((entry, index) => <div key={index} style={{ borderTop: '1px solid var(--admin-border, rgba(128,128,128,.2))', paddingTop: 10, marginTop: 10 }}><Space><Typography.Text strong>{entry.published.translations['zh-CN']?.title}</Typography.Text><Tag>{entry.published.revision}</Tag><Tag>历史发布</Tag></Space><Typography.Paragraph ellipsis={{ rows: 2, expandable: true, symbol: '展开' }} style={{ whiteSpace: 'pre-wrap', margin: '6px 0' }}>{entry.published.translations['zh-CN']?.body}</Typography.Paragraph></div>)}
    </div>
   })}</Space>
  </Card>
  <Drawer title={editing === 'announcement' ? '编辑全局公告' : '编辑版本更新'} width={620} open={!!editing} onClose={() => setEditing(undefined)} footer={<Space style={{ display: 'flex', justifyContent: 'flex-end' }}><Button disabled={busy} onClick={() => setEditing(undefined)}>取消</Button><Button loading={busy} onClick={() => void run(async () => { await save(); message.success('草稿已保存') })}>保存草稿</Button><Button type="primary" loading={busy} onClick={() => void run(async () => { await save(); await i18nApi(`notices/${editing}/items/${editingId}/publish`, 'POST'); message.success('已发布并同步前台'); setEditing(undefined) })}>发布到前台</Button></Space>}>
   {draft && <Space orientation="vertical" size={18} style={{ width: '100%' }}>
    <Space><span>启用通知</span><Switch checked={draft.enabled} onChange={value => setDraft({ ...draft, enabled: value })} /></Space>
    <label>{editing === 'announcement' ? '公告编号' : '版本号'}<Input value={draft.revision} maxLength={40} onChange={e => setDraft({ ...draft, revision: e.target.value })} /></label>
    <Typography.Paragraph type="secondary">自动翻译已停用，请在各语言 Tab 中填写并审核译文。</Typography.Paragraph>
    <Tabs activeKey={locale} onChange={setLocale} items={Object.entries(labels).map(([key, label]) => ({ key, label: `${label}${enabled.includes(key) ? '' : ' · 未启用'}` }))} />
    <label>标题<Input value={draft.translations[locale]?.title || ''} maxLength={160} onChange={e => change({ title: e.target.value, approved: false })} /></label>
    <label>详情<Input.TextArea rows={10} value={draft.translations[locale]?.body || ''} maxLength={12000} onChange={e => change({ body: e.target.value, approved: false })} /></label>
    {locale !== 'zh-CN' && <Checkbox checked={draft.translations[locale]?.approved || false} onChange={e => change({ approved: e.target.checked })}>已核对该语言的内容</Checkbox>}
    <Card size="small" title="内容预览"><Typography.Title level={5}>{draft.translations[locale]?.title}</Typography.Title><p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{draft.translations[locale]?.body}</p></Card>
   </Space>}
  </Drawer>
 </>
}
