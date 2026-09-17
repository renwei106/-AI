import { useEffect, useState } from 'react'
import { Alert, Button, Card, Checkbox, Col, Drawer, Input, Row, Space, Switch, Tabs, Tag, Typography, message } from 'antd'
import { i18nApi } from './ShiyuLanguages'
type Kind = 'announcement' | 'update'
type Text = { title: string; body: string; approved?: boolean }
type Draft = { enabled: boolean; revision: string; translations: Record<string, Text> }
type Notice = { draft: Draft; published?: Draft }
const labels = { 'zh-CN': '简体中文', en: 'English', ja: '日本語' }
const empty = (): Notice => ({ draft: { enabled: false, revision: '', translations: { 'zh-CN': { title: '', body: '', approved: true } } } })
export function ShiyuNotices() {
 const [notices, setNotices] = useState<Record<Kind, Notice>>({ announcement: empty(), update: empty() }), [enabled, setEnabled] = useState<string[]>(['zh-CN']), [editing, setEditing] = useState<Kind>(), [draft, setDraft] = useState<Draft>(), [locale, setLocale] = useState('zh-CN'), [busy, setBusy] = useState(false)
 const load = async () => { const data = await i18nApi('admin'); setEnabled(data.settings.languages.filter((l: { enabled: boolean }) => l.enabled).map((l: { code: string }) => l.code)); setNotices({ announcement: data.notices.announcement || empty(), update: data.notices.update || empty() }) }
 useEffect(() => { void load().catch(e => message.error(e.message)) }, [])
 const run = async (fn: () => Promise<void>) => { setBusy(true); try { await fn(); await load() } catch (e) { message.error(e instanceof Error ? e.message : '操作失败') } finally { setBusy(false) } }
 const save = async () => { const next: Notice = await i18nApi(`notices/${editing}`, 'PUT', draft); setDraft(next.draft); return next }
 const change = (part: Partial<Text>) => { if (!draft) return; setDraft({ ...draft, translations: { ...draft.translations, [locale]: { ...(draft.translations[locale] || { title: '', body: '' }), ...part } } }) }
 return <>
  <div className="shiyu-page-heading"><div><Typography.Title level={3}>公告与更新</Typography.Title><Typography.Paragraph type="secondary">维护中文原稿，一键生成英文与日文，审核后同步前台。</Typography.Paragraph></div></div>
  <Alert type="info" showIcon message={`当前启用 ${enabled.length} 种语言：${enabled.map(l => labels[l as keyof typeof labels]).join('、')}。发布时会校验所有已启用语言；保存草稿不会影响前台。`} style={{ marginBottom: 20 }} />
  <Row gutter={[20, 20]}>{(['announcement', 'update'] as Kind[]).map(kind => <Col xs={24} xl={12} key={kind}><Card title={kind === 'announcement' ? '全局公告' : '版本更新'} extra={<Space><Tag>{kind === 'announcement' ? '强提醒' : '弱提醒'}</Tag><Button type="primary" onClick={() => { setEditing(kind); setDraft(structuredClone(notices[kind].draft)); setLocale('zh-CN') }}>编辑内容</Button></Space>}>
   <Typography.Paragraph type="secondary">{kind === 'announcement' ? '弹窗直接展示详情，同一公告确认后不再重复提醒。' : '轻量提示新版本，用户点击后查看更新详情。'}</Typography.Paragraph>
   <div style={{ padding: 20, background: 'var(--admin-bg, rgba(128,128,128,.06))', borderRadius: 12, minHeight: 164 }}><Typography.Title level={5}>{notices[kind].published?.translations['zh-CN']?.title || '尚未发布'}</Typography.Title><Typography.Paragraph ellipsis={{ rows: 3 }}>{notices[kind].published?.translations['zh-CN']?.body || '编辑中文及对应语言内容，审核后发布。'}</Typography.Paragraph></div><Tag style={{ marginTop: 20 }} color={notices[kind].published?.enabled ? 'green' : 'default'}>{notices[kind].published?.enabled ? '已发布' : '未启用'}</Tag>
  </Card></Col>)}</Row>
  <Drawer title={editing === 'announcement' ? '编辑全局公告' : '编辑版本更新'} width={620} open={!!editing} onClose={() => setEditing(undefined)} footer={<Space style={{ display: 'flex', justifyContent: 'flex-end' }}><Button disabled={busy} onClick={() => setEditing(undefined)}>取消</Button><Button loading={busy} onClick={() => void run(async () => { await save(); message.success('草稿已保存') })}>保存草稿</Button><Button type="primary" loading={busy} onClick={() => void run(async () => { await save(); await i18nApi(`notices/${editing}/publish`, 'POST'); message.success('已发布并同步前台'); setEditing(undefined) })}>发布到前台</Button></Space>}>
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
