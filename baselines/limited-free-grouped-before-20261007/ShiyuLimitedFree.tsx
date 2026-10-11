import { useEffect, useState } from 'react'
import { Alert, Button, Card, Checkbox, DatePicker, Drawer, Form, InputNumber, Select, Space, Switch, Table, Tag, message } from 'antd'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)
import type { PlanCatalog } from '../membership/types'

type Rule = { id: string; key: string; kind: string; enabled: boolean; startsAt: number; endsAt: number; value: string | number | string[]; unlimited?: boolean }
type State = { revision: number; items: Rule[] }
const time = (value: number) => new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
export function ShiyuLimitedFree() {
  const [state, setState] = useState<State>({ revision: 0, items: [] })
  const [catalog, setCatalog] = useState<PlanCatalog>()
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState('')
  const [editing, setEditing] = useState<Rule | null>(), [form] = Form.useForm()
  const key = Form.useWatch('key', form), unlimited = Form.useWatch('unlimited', form)
  const definition = catalog?.items.find(item => item.key === key)
  const [now, setNow] = useState(Date.now())
  async function load() {
    setLoading(true); setError('')
    try {
      const results = await Promise.all(['/api/shiyu/plans/limited-free/admin', '/api/shiyu/plans/catalog'].map(async url => { const r = await fetch(url, { credentials: 'include', cache: 'no-store' }); if (!r.ok) throw Error('限免配置加载失败'); return r.json() }))
      setState(results[0]); setCatalog(results[1])
    } catch (e) { setError(e instanceof Error ? e.message : '限免配置加载失败') } finally { setLoading(false) }
  }
  useEffect(() => { void load(); const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer) }, [])
  function open(rule: Rule | null) {
    setEditing(rule); form.resetFields()
    form.setFieldsValue(rule ? { ...rule, range: [dayjs(rule.startsAt).tz('Asia/Shanghai'), dayjs(rule.endsAt).tz('Asia/Shanghai')] } : { enabled: true, value: 1, unlimited: false, range: [dayjs().tz('Asia/Shanghai'), dayjs().tz('Asia/Shanghai').add(7, 'day')] })
  }
  async function save() {
    let values
    try { values = await form.validateFields() } catch { return }
    setSaving(true)
    try {
      const rule = { ...values, id: editing?.id || crypto.randomUUID(), startsAt: values.range[0].valueOf(), endsAt: values.range[1].valueOf(), value: definition?.kind === 'text' ? '✓' : values.value }
      const items = editing ? state.items.map(item => item.id === editing.id ? rule : item) : [...state.items, rule]
      const r = await fetch('/api/shiyu/plans/limited-free/admin', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revision: state.revision, items }) })
      const data = await r.json(); if (!r.ok) throw Error(data.message || '保存失败')
      setState(data); setEditing(undefined); message.success('限免配置已保存')
    } catch (e) { message.error(e instanceof Error ? e.message : '保存失败') } finally { setSaving(false) }
  }
  const status = (rule: Rule) => !rule.enabled ? '已停用' : now < rule.startsAt ? '未开始' : now >= rule.endsAt ? '已结束' : '进行中'
  return <Card title="限时免费" loading={loading} extra={<Button type="primary" disabled={!!error || !catalog} onClick={() => open(null)}>新增限免</Button>}>
    {error ? <Alert type="error" title={error} action={<Button onClick={() => void load()}>重新加载</Button>} /> : <>
      <Alert type="info" title="限免按权益项生效，适用于所有用户。结束或停用后恢复原有会员权益，沿用会员到期处理。时间统一为北京时间。" style={{ marginBottom: 16 }} />
      <Table<Rule> rowKey="id" dataSource={state.items} pagination={{ pageSize: 10 }} columns={[
        { title: '权益项', render: (_, r) => catalog?.items.find(item => item.key === r.key)?.name || r.key },
        { title: '开放内容 / 额度', render: (_, r) => r.kind === 'selection' ? (r.value as string[]).map(id => catalog?.items.find(item => item.key === r.key)?.options?.find(option => option.id === id)?.name || id).join('、') : r.kind === 'quantity' ? r.unlimited ? '不限量' : `${r.value} ${catalog?.items.find(item => item.key === r.key)?.unit || ''}` : '开放使用' },
        { title: '开始时间', render: (_, r) => time(r.startsAt) }, { title: '结束时间', render: (_, r) => time(r.endsAt) },
        { title: '状态', render: (_, r) => <Tag color={status(r) === '进行中' ? 'green' : undefined}>{status(r)}</Tag> },
        { title: '操作', render: (_, r) => <Button type="link" onClick={() => open(r)}>编辑</Button> },
      ]} />
    </>}
    <Drawer title={editing ? '编辑限免' : '新增限免'} width={560} open={editing !== undefined} onClose={() => !saving && setEditing(undefined)} footer={<Space style={{ display: 'flex', justifyContent: 'flex-end' }}><Button disabled={saving} onClick={() => setEditing(undefined)}>取消</Button><Button type="primary" loading={saving} onClick={() => void save()}>保存</Button></Space>}>
      <Form form={form} layout="vertical" disabled={saving}>
        <Form.Item name="key" label="权益项" rules={[{ required: true, message: '请选择权益项' }]}><Select options={catalog?.items.map(item => ({ value: item.key, label: `${item.scope} · ${item.name}` }))} onChange={next => form.setFieldsValue({ value: catalog?.items.find(item => item.key === next)?.kind === 'quantity' ? 1 : undefined, unlimited: false })} /></Form.Item>
        {definition?.kind === 'selection' && <Form.Item name="value" label="限免资源" rules={[{ required: true, type: 'array', min: 1, message: '请选择限免资源' }]}><Select mode="multiple" options={definition.options?.filter(item => item.enabled !== false).map(item => ({ value: item.id, label: item.name }))} /></Form.Item>}
        {definition?.kind === 'quantity' && <><Form.Item name="value" label={`限免额度（${definition.unit}）`} initialValue={1} rules={[{ required: true, message: '请填写限免额度' }]}><InputNumber min={1} max={1000000} precision={0} disabled={saving || unlimited} /></Form.Item><Form.Item name="unlimited" valuePropName="checked"><Checkbox>不限量</Checkbox></Form.Item></>}
        <Form.Item name="range" label="限免时间（北京时间）" rules={[{ required: true, message: '请选择开始与结束时间' }, { validator: (_, value) => value?.[0] && value?.[1] && value[1].valueOf() > value[0].valueOf() ? Promise.resolve() : Promise.reject(Error('结束时间必须晚于开始时间')) }]}><DatePicker.RangePicker showTime format="YYYY-MM-DD HH:mm:ss" /></Form.Item>
        <Form.Item name="enabled" label="启用限免" valuePropName="checked"><Switch /></Form.Item>
      </Form>
    </Drawer>
  </Card>
}
