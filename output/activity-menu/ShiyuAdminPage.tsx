import { RegistrationRewards } from './RegistrationRewards'
import { ShiyuPageColors } from './ShiyuPageColors'
import { ShiyuPayment } from './ShiyuPayment'
import { ShiyuActivityCenter } from './ShiyuActivityCenter'
import { ShiyuPlatformLibrary } from './ShiyuPlatformLibrary'
import { ShiyuPlatformPicks } from './ShiyuPlatformPicks'
import { ShiyuAvatars } from './ShiyuAvatars'
import { CustomerServiceOutlined, CrownOutlined, DeleteOutlined, EditOutlined, LeftOutlined, PlusOutlined, ProfileOutlined, RightOutlined, ShoppingOutlined, TeamOutlined, UploadOutlined } from '@ant-design/icons'
import { Alert, Avatar, Button, Card, DatePicker, Descriptions, Drawer, Form, Input, InputNumber, Modal, Popconfirm, Radio, Select, Space, Statistic, Switch, Tabs, Tag, Tooltip, Tree, Typography, message } from 'antd'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import dayjs, { type Dayjs } from 'dayjs'
import { AdminTable as Table } from './AdminTable'
import { PhoneNumber } from './PhoneNumber'
import { ShiyuLanguages } from './ShiyuLanguages'
import { ShiyuAgreements } from './ShiyuAgreements'
import { ShiyuResourceMonitoring } from './ShiyuResourceMonitoring'
import { ShiyuFiling } from './ShiyuFiling'
import { ShiyuBaiduIndex } from './ShiyuBaiduIndex'
import { ShiyuOperations } from './ShiyuOperations'
import { ShiyuReleaseControl } from './ShiyuReleaseControl'
import { ShiyuResourceCards } from './ShiyuResourceCards'
import { ShiyuPersonalization } from './ShiyuPersonalization'
import { ShiyuReleaseHistory } from './ShiyuReleaseHistory'
import { InvitationManager } from './InvitationManager'
import { PlanMatrix } from './PlanMatrix'
import { Table as ConfigurableTable } from './ConfigurableTable'
import { activeMember, inMemberDateRange, memberDateLabel, memberExpiryTime } from './membership-display'
const ShiyuAnalytics = lazy(() => import('./ShiyuAnalytics'))

type MemberEvent = { id?: string; time: string; title: string; type: string; amount: number; duration: string; expires: string; source?: 'payment' | 'reward' | 'admin'; action?: string; operator?: string; orderId?: string; rewardId?: string; beforeExpiresAt?: string | null; afterExpiresAt?: string | null; beforePermanent?: boolean; afterPermanent?: boolean; remark?: string }
type CancellationEvent = { at: string; actor: 'user' | 'admin'; operator: string; verification: 'email' | 'phone' | 'wechat' | 'admin-password'; hadMembership: boolean; agreementVersion: string }
type User = { id: string; name: string; phone: string; email?: string; registeredAt: string; lastLoginAt?: string; source: string; spaces: number; status: 'active' | 'silent' | 'canceled'; canceledAt?: string; cancellationEvents?: CancellationEvent[]; currentTheme?: string; member?: boolean; memberExpiresAt?: string | null; blacklisted?: boolean; memberEvents?: MemberEvent[]; membership?: { planId?: string; planName?: string; permanent?: boolean } }
type Member = { id: string; userId?: string; phone?: string; user: string; plan: string; startedAt: string; expiresAt: string; autoRenew: boolean; status: 'valid' | 'expiring' }
type Order = { id: string; userId: string; user: string; planName: string; amount: number; provider: 'alipay' | 'wechat' | 'free'; createdAt: number; paidAt?: number | null; memberExpiresAt?: number | null; days: number; status: 'created' | 'pending' | 'unknown' | 'paid' | 'closed' }
type PlanEntitlement = { key: string; scope: string; name: string; description: string; kind: 'quantity' | 'text'; value: number | string; unit: string; enabled: boolean }
type Plan = { id: string; name: string; cycle: string; days: number; price: number; original: number; tag: string; autoRenew: boolean; enabled: boolean; entitlements: PlanEntitlement[] }
type ShiyuTheme = { id: string; name: string; englishName: string; description: string; accent: string; tone: 'light' | 'dark'; enabled: boolean }
type ShiyuMusic = { id: string; name: string; durationSeconds: number; genre: string; themeIds: string[]; enabled: boolean; fileName: string; source: '内置音乐' | '自定义上传'; createdAt: string }

export function ShiyuAdminPage({ page, onNavigate }: { page: string; onNavigate: (path: string) => void }) {
  if (/\/(activities|activity-records|activity-audit)$/.test(page)) return <main className="shiyu-admin-page"><Tabs activeKey={page} onChange={onNavigate} items={[{ key: '/apps/shiyu/activities', label: '活动配置' }, { key: '/apps/shiyu/activity-records', label: '参与明细' }, { key: '/apps/shiyu/activity-audit', label: '异常与操作记录' }]} /><ShiyuActivityCenter key={page} page={page} onNavigate={onNavigate} /></main>
  if (page.endsWith('/dashboard') || page.includes('/analytics/')) return <Suspense fallback={<Card loading />}><ShiyuAnalytics key={page} page={page} onNavigate={onNavigate} /></Suspense>
  const officialSection = /^\/apps\/shiyu\/page-colors(?:\/(colors|fonts))?$/.exec(page)
  if (officialSection) return <main className="shiyu-admin-page"><ShiyuPageColors section={(officialSection[1] || 'colors') as 'colors' | 'fonts'} /></main>
  if (page.endsWith('/payment')) return <main className="shiyu-admin-page"><ShiyuPayment /></main>
  if (page.endsWith('/member-visual')) return <main className="shiyu-admin-page"><PlanMatrix /></main>
  if (page.endsWith('/avatars')) return <ShiyuAvatars />
  if (page.endsWith('/languages')) return <main className="shiyu-admin-page"><ShiyuLanguages /></main>
  if (page.endsWith('/agreements')) return <ShiyuAgreements />
  if (page.includes('/resource-monitoring/')) return <ShiyuResourceMonitoring section={page.split('/').pop() as 'quotas'|'servers'|'expiries'|'notifications'|'alerts'} />
  if (page.endsWith('/filing')) return <ShiyuFiling />
  if (page.endsWith('/baidu-index')) return <main className="shiyu-admin-page"><ShiyuBaiduIndex /></main>
  if (page.endsWith('/release-control')) return <main className="shiyu-admin-page"><ShiyuReleaseControl /></main>
  if (page.endsWith('/release-history')) return <ShiyuReleaseHistory />
  const personalizationCategory = /^\/apps\/shiyu\/personalization(?:\/(themes|colors|fonts|pet))?$/.exec(page)
  if (personalizationCategory || page === '/apps/shiyu/themes') return <main className="shiyu-admin-page"><ShiyuPersonalization category={(personalizationCategory?.[1] || 'themes') as 'themes' | 'colors' | 'fonts' | 'pet'} /></main>
  if (page.endsWith('/login-and-verification')) return <main className="shiyu-admin-page"><ShiyuOperations section="auth" /></main>
  if (page.endsWith('/feature-flags') || page.endsWith('/notices')) return <main className="shiyu-admin-page"><ShiyuOperations notices={page.endsWith('/notices')} /></main>
  if (page.endsWith('/registration-rewards')) return <main className="shiyu-admin-page"><RegistrationRewards /></main>
  if (page.endsWith('/sharing') || page.endsWith('/invitations')) return <main className="shiyu-admin-page"><Tabs activeKey={page} onChange={onNavigate} items={[{ key: '/apps/shiyu/sharing', label: '活动配置' }, { key: '/apps/shiyu/invitations', label: '奖励明细' }]} /><InvitationManager key={page} details={page.endsWith('/invitations')} /></main>
  const activeTab = page.endsWith('/members') ? 'members' : page.endsWith('/orders') ? 'orders' : /\/(plans|benefits)$/.test(page) ? 'plans' : page.endsWith('/library') ? 'library' : page.endsWith('/platform-picks') ? 'platform-picks' : page.endsWith('/music') ? 'music' : 'users'
  return <main className="shiyu-admin-page">
    {activeTab === 'users' && <UserList />}{activeTab === 'members' && <MemberList />}{activeTab === 'orders' && <OrderList onNavigate={onNavigate} />}{activeTab === 'plans' && <PlanMatrix />}{activeTab === 'library' && <ShiyuPlatformLibrary />}{activeTab === 'platform-picks' && <ShiyuPlatformPicks />}{activeTab === 'music' && <MusicManager />}
  </main>
}

function UserList() {
  const [selected, setSelected] = useState<User | null>(null)
  const [userItems, setUserItems] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState('')
  const [keyword, setKeyword] = useState('')
  const [member, setMember] = useState<string>()
  const [registeredRange, setRegisteredRange] = useState<any[]>()
  const [loginRange, setLoginRange] = useState<any[]>()
  const [submitted, setSubmitted] = useState<{ phone: string; keyword: string; member?: string; registeredRange?: any[]; loginRange?: any[] }>({ phone: '', keyword: '' })
  useEffect(() => {
    fetch('/api/shiyu/users', { credentials: 'include' })
      .then(async (response) => { if (!response.ok) throw new Error('用户数据加载失败'); return response.json() as Promise<{ items: User[] }> })
      .then((data) => setUserItems(data.items))
      .catch((error) => message.error(error instanceof Error ? error.message : '用户数据加载失败'))
      .finally(() => setLoading(false))
  }, [])
  const memberOf = activeMember
  const lastLoginOf = (user: User) => user.lastLoginAt || (user.name === '林知屿' ? '2026-09-16 10:24' : user.name === '周听澜' ? '2026-09-15 22:18' : '2026-09-08 15:32')
  const inRange = (value: string, range?: any[]) => !range?.[0] || !range?.[1] || (value.slice(0, 10) >= range[0].format('YYYY-MM-DD') && value.slice(0, 10) <= range[1].format('YYYY-MM-DD'))
  const filteredUsers = userItems.filter((user) => (!submitted.phone || user.phone.includes(submitted.phone)) && (!submitted.keyword || `${user.name}${user.phone}${user.id}`.toLowerCase().includes(submitted.keyword.toLowerCase())) && (!submitted.member || (submitted.member === 'member') === memberOf(user)) && inRange(user.registeredAt, submitted.registeredRange) && inRange(lastLoginOf(user), submitted.loginRange))
  const updateUser = (next: User) => { setUserItems((items) => items.map((item) => item.id === next.id ? next : item)); setSelected((current) => current?.id === next.id ? next : current) }
  const searchFilters = () => setSubmitted({ phone, keyword, member, registeredRange, loginRange })
  const resetFilters = () => { setKeyword(''); setPhone(''); setMember(undefined); setRegisteredRange(undefined); setLoginRange(undefined); setSubmitted({ phone: '', keyword: '' }) }
  const filterControls = <Space className="shiyu-user-filters" wrap size={16}><div className="shiyu-filter-item global-search"><span>全局搜索</span><Input allowClear placeholder="昵称、手机号、用户 ID" value={keyword} onChange={(event) => setKeyword(event.target.value)} /></div><div className="shiyu-filter-item"><span>手机号</span><Input allowClear placeholder="输入手机号" value={phone} onChange={(event) => setPhone(event.target.value)} /></div><div className="shiyu-filter-item"><span>注册时间</span><DatePicker.RangePicker value={registeredRange as any} placeholder={['开始时间', '结束时间']} onChange={(value) => setRegisteredRange(value as any[])} /></div><div className="shiyu-filter-item"><span>会员状态</span><Select allowClear placeholder="全部用户" value={member} onChange={setMember} options={[{ value: 'member', label: '是会员' }, { value: 'non-member', label: '非会员' }]} /></div><div className="shiyu-filter-item"><span>最后登录时间</span><DatePicker.RangePicker value={loginRange as any} placeholder={['开始时间', '结束时间']} onChange={(value) => setLoginRange(value as any[])} /></div><Button type="primary" onClick={searchFilters}>搜索</Button><Button onClick={resetFilters}>重置</Button></Space>
  return <><Card className="shiyu-filter-card" title="筛选条件">{filterControls}</Card><Card title={`用户 · 共 ${filteredUsers.length} 位`}><ConfigurableTable loading={loading} configKey="ShiyuUsers" fixedKeys={['user', 'actions']} rowKey="id" dataSource={filteredUsers} columns={[{ title: '用户', key: 'user', render: (_, row) => <Space><Avatar>{row.name.slice(0, 1)}</Avatar>{row.name}{activeMember(row) && <Tag icon={<CrownOutlined />}>会员</Tag>}</Space> }, { title: '手机号/邮箱', key: 'contact', render: (_, row) => row.email ? <Space direction="vertical" size={0}><span>{row.email}</span>{row.phone && <Tooltip title={<div><div>手机号：{row.phone}</div><div>邮箱：{row.email}</div></div>}><Typography.Text type="secondary" aria-label="查看手机号和邮箱" tabIndex={0} style={{ cursor: 'help', lineHeight: 1 }}>…</Typography.Text></Tooltip>}</Space> : row.phone ? <PhoneNumber value={row.phone} /> : <Typography.Text type="secondary">—</Typography.Text> }, { title: '注册时间', dataIndex: 'registeredAt' }, { title: '来源', dataIndex: 'source' }, { title: '空间数', dataIndex: 'spaces' }, { title: '状态', dataIndex: 'status', render: (_, row) => row.canceledAt ? <Tag>已注销</Tag> : row.blacklisted ? <Tag color="red">已拉黑</Tag> : <Tag color={row.status === 'active' ? 'green' : 'default'}>{row.status === 'active' ? '活跃' : '沉默'}</Tag> }, { title: '操作', key: 'actions', render: (_, row) => <Button type="link" onClick={() => setSelected(row)}>用户详情</Button> }]} /></Card><Drawer title="用户详情" width={1040} open={Boolean(selected)} onClose={() => setSelected(null)}>{selected && <UserDetail user={selected} onUserChanged={updateUser} />}</Drawer></>
}

function UserCancellationActions({ user, onChanged }: { user: User; onChanged: (user: User) => void }) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const close = () => { if (!saving) { setOpen(false); setPassword('') } }
  const submit = async () => {
    if (!password || saving) return
    setSaving(true)
    try {
      const response = await fetch(`/api/shiyu/users/${encodeURIComponent(user.id)}/cancel`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      const result = await response.json() as { user?: User; message?: string }
      if (!response.ok || !result.user) throw Error(result.message || '注销失败')
      onChanged(result.user)
      message.success('用户已注销')
      setSaving(false); setOpen(false); setPassword('')
    } catch (error) { message.error(error instanceof Error ? error.message : '注销失败'); setSaving(false) }
  }
  return <><Button danger onClick={() => setOpen(true)}>注销用户</Button><Drawer title="注销用户" width={440} open={open} onClose={close} footer={<Space style={{ display: 'flex', justifyContent: 'flex-end' }}><Button onClick={close} disabled={saving}>取消</Button><Button type="primary" loading={saving} disabled={!password} onClick={() => void submit()}>确认注销</Button></Space>}>
    <Alert type="warning" showIcon message={`将注销用户 ${user.id}`} description="用户将无法再次登录；邮箱、手机号、微信绑定和个人空间会清除，会员权益立即失效。用户 ID、订单与注销记录保留供后台核对。" />
    <Typography.Paragraph style={{ marginTop: 20 }}>请再次输入当前管理员的登录密码。</Typography.Paragraph>
    <Input.Password autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} onPressEnter={() => void submit()} placeholder="管理员登录密码" />
  </Drawer></>
}

function UserManagementActions({ user, onChanged, compact = false }: { user: User; onChanged: (user: User) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'permanent' | 'date' | 'cancel'>('date')
  const [expiresAt, setExpiresAt] = useState<Dayjs | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [planChoices, setPlanChoices] = useState<Array<{ id: string; name: string }>>([])
  const [planId, setPlanId] = useState<string>()
  const [plansLoading, setPlansLoading] = useState(false)
  const [planError, setPlanError] = useState('')
  const currentMembership = activeMember(user) ? (user.memberExpiresAt === '永久' ? '永久会员' : `会员有效期至 ${memberDateLabel(user.memberExpiresAt)}`) : '非会员'
  const actionLabel = mode === 'cancel' ? '取消会员' : user.member ? '修改会员信息' : '开通会员'
  const submitLabel = confirming ? mode === 'cancel' ? '确认取消会员' : user.member ? '确认修改' : '确认开通' : '下一步'
  const openMemberSettings = () => {
    const permanent = Boolean(user.member && (user.membership?.permanent || user.memberExpiresAt === '永久'))
    const date = !permanent && user.memberExpiresAt ? dayjs(user.memberExpiresAt) : null
    setMode(permanent ? 'permanent' : 'date')
    setExpiresAt(date?.isValid() ? date : null)
    setConfirming(false)
    setOpen(true)
    setPlanId(user.membership?.planId)
    setPlansLoading(true)
    setPlanError('')
    fetch('/api/shiyu/plans', { cache: 'no-store' }).then(async response => {
      if (!response.ok) throw Error('权益方案加载失败，请关闭后重试')
      const data = await response.json()
      const choices = (data.items || []).filter((item: { id: string; enabled?: boolean }) => item.id !== 'free' && item.enabled !== false)
      if (user.membership?.planId && !choices.some((item: { id: string }) => item.id === user.membership!.planId)) choices.unshift({ id: user.membership.planId, name: '保留当前权益方案（已下线）' })
      setPlanChoices(choices)
      setPlanId(user.membership?.planId || choices[0]?.id)
      if (!choices.length) setPlanError('暂无已上线会员方案，请先在“套餐与权益”中上线方案')
    }).catch(error => setPlanError(error.message)).finally(() => setPlansLoading(false))
  }
  const update = async (body: Record<string, unknown>) => {
    const response = await fetch(`/api/shiyu/users/${encodeURIComponent(user.id)}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const result = await response.json() as { user?: User; message?: string }
    if (!response.ok || !result.user) throw new Error(result.message || '用户配置失败')
    onChanged(result.user)
    return result.user
  }
  const saveMember = async () => {
    if (saving) return
    if (mode !== 'cancel' && (plansLoading || planError || !planId)) {
      message.warning(planError || '请选择会员权益方案')
      return
    }
    if (mode === 'date' && (!expiresAt || !expiresAt.isValid())) {
      setConfirming(false)
      message.warning('请选择会员截止日期')
      return
    }
    if (mode === 'date' && expiresAt!.endOf('day').valueOf() < Date.now()) {
      setConfirming(false)
      message.warning('会员截止日期不能早于今天')
      return
    }
    if (!confirming) { setConfirming(true); return }
    setSaving(true)
    try {
      await update(mode === 'cancel' ? { action: 'cancel-member' } : { action: 'member', planId, permanent: mode === 'permanent', expiresAt: mode === 'date' ? expiresAt!.format('YYYY-MM-DD') : undefined })
      setOpen(false)
      setConfirming(false)
      message.success(mode === 'cancel' ? '已取消会员，并写入会员变动记录' : user.member ? '会员信息已更新，并写入会员变动记录' : '已开通会员，并写入会员变动记录')
    } catch (error) {
      message.error(error instanceof Error ? error.message : '会员配置失败')
    } finally {
      setSaving(false)
    }
  }
  const toggleBlacklist = () => Modal.confirm({
    title: user.blacklisted ? '解除拉黑该用户？' : '拉黑该用户？',
    content: user.blacklisted ? '解除后，该用户可重新登录拾隅。' : '拉黑后，该用户将无法登录拾隅。',
    okText: user.blacklisted ? '解除拉黑' : '确认拉黑',
    okButtonProps: { danger: !user.blacklisted },
    cancelText: '取消',
    onOk: async () => {
      try { await update({ action: 'blacklist', blacklisted: !user.blacklisted }); message.success(user.blacklisted ? '已解除拉黑' : '已拉黑') }
      catch (error) { message.error(error instanceof Error ? error.message : '用户配置失败'); throw error }
    },
  })
  return <>
    <Button type={compact ? 'link' : 'primary'} onClick={openMemberSettings}>会员设置</Button>
    <Button type="link" danger={!user.blacklisted} onClick={toggleBlacklist}>{user.blacklisted ? '解除拉黑' : '拉黑'}</Button>
    <Modal title={confirming ? `确认${actionLabel} · ${user.name}` : `会员设置 · ${user.name}`} open={open} onCancel={() => { if (!saving) setOpen(false) }} closable={!saving} keyboard={!saving} maskClosable={!saving} footer={<Space><Button disabled={saving} onClick={() => confirming ? setConfirming(false) : setOpen(false)}>{confirming ? '返回修改' : '取消'}</Button><Button type="primary" danger={confirming && mode === 'cancel'} loading={saving} aria-label={submitLabel} aria-busy={saving} onClick={saveMember}>{submitLabel}</Button></Space>}>
      <Descriptions size="small" column={1} items={[{ key: 'member', label: '当前会员状态', children: currentMembership }]} />
      {confirming ? <>
        <Typography.Paragraph>本次操作：<Typography.Text strong>{mode === 'cancel' ? '取消会员，恢复为非会员' : mode === 'permanent' ? '设置为永久会员' : `会员有效期至 ${expiresAt?.format('YYYY-MM-DD')}`}</Typography.Text></Typography.Paragraph>
        {mode !== 'cancel' && <Typography.Paragraph>权益方案：{planChoices.find(item => item.id === planId)?.name}</Typography.Paragraph>}
        <Typography.Paragraph type="secondary">{mode === 'cancel' ? '确认后立即取消会员权益，已有收藏和历史会员记录保留；此操作不会自动退款。' : '确认后立即生效，并新增一条管理员会员变动记录，不产生支付订单。'}</Typography.Paragraph>
      </> : <Form layout="vertical">
        <Form.Item label="会员设置">
          <Radio.Group value={mode} onChange={(event) => setMode(event.target.value)}><Radio value="date">指定截止日期</Radio><Radio value="permanent">永久会员</Radio>{user.member && <Radio value="cancel">取消会员</Radio>}</Radio.Group>
        </Form.Item>
        {mode === 'date' && <Form.Item label="截止日期" required><DatePicker value={expiresAt} onChange={setExpiresAt} placeholder="选择会员截止日期" disabledDate={(date) => date.endOf('day').valueOf() < Date.now()} /></Form.Item>}
        {mode !== 'cancel' && <Form.Item label="会员权益方案" required extra="只使用所选方案的权益；会员时长以上方设置为准。"><Select loading={plansLoading} value={planId} onChange={setPlanId} options={planChoices.map(item => ({ value: item.id, label: item.name }))} placeholder="选择权益方案" />{planError && <Typography.Text type="danger">{planError}</Typography.Text>}</Form.Item>}
        <Typography.Paragraph type="secondary">{mode === 'cancel' ? '下一步将再次确认取消会员，确认前不会更改当前会员状态。' : '设置有效期后，下一步确认并生效。'}</Typography.Paragraph>
      </Form>}
    </Modal>
  </>
}

function UserDetail({ user, onUserChanged }: { user: User; onUserChanged: (user: User) => void }) {
  const [tab, setTab] = useState('active')
  const events = user.memberEvents || []
  const opens = [2, 0, 4, 1, 6, 3, 5, 0, 2, 7, 4, 1, 3, 8, 2, 0, 5, 3, 6, 1, 4, 2, 7, 3, 1, 5, 0, 4, 2, 6]
  const dates = Array.from({ length: 30 }, (_, index) => `09-${String(index + 1).padStart(2, '0')}`)
  const activity = <Card title="最近 30 天打开次数"><div style={{ display: 'flex', alignItems: 'end', height: 210, gap: 3, borderBottom: '1px solid #edf0f2' }}>{opens.map((count, index) => <div key={dates[index]} title={`${dates[index]}：打开 ${count} 次`} style={{ flex: 1, minWidth: 8, height: `${count ? Math.max(14, count * 11) : 3}%`, background: count ? '#8b6bd6' : '#e8e4f5', borderRadius: '4px 4px 0 0' }} />)}</div><Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>柱状图表示用户当天打开前台的次数：柱越高，说明当天打开次数越多；柱越低，说明打开次数越少。悬停柱子可查看日期与次数。</Typography.Paragraph></Card>
  return <div className="shiyu-user-detail"><Card size="small" title="基础信息" extra={<Space>{!user.canceledAt && <><UserManagementActions user={user} onChanged={onUserChanged} /><UserCancellationActions user={user} onChanged={onUserChanged} /></>}</Space>}><Space align="start"><Avatar size={64}>{user.name.slice(0, 1)}</Avatar><Descriptions column={2} items={[{ key: 'id', label: '用户 ID', children: user.id }, { key: 'state', label: '状态', children: user.canceledAt ? <Tag>已注销</Tag> : <Tag color="green">正常</Tag> }, { key: 'name', label: '昵称', children: user.name }, { key: 'phone', label: '手机号', children: user.phone ? <PhoneNumber key={user.id} value={user.phone} /> : '未绑定' }, { key: 'email', label: '邮箱', children: user.email || '未绑定' }, { key: 'registered', label: '注册时间', children: user.registeredAt }, { key: 'last', label: '最近登录时间', children: user.lastLoginAt || '—' }, { key: 'spaces', label: '空间数量', children: `${user.spaces} 个` }, { key: 'theme', label: '当前主题', children: user.currentTheme || '—' }, { key: 'member-mark', label: '会员标识', children: activeMember(user) ? <Tag color="purple">会员</Tag> : <Tag>非会员</Tag> }, ...(activeMember(user) ? [{ key: 'member-expires', label: '会员截止到期时间', children: memberDateLabel(user.memberExpiresAt) }] : []), ...(user.canceledAt ? [{ key: 'canceled', label: '注销时间', children: dayjs(user.canceledAt).format('YYYY-MM-DD HH:mm:ss') }] : [])]} /></Space></Card><Tabs activeKey={tab} onChange={setTab} items={[{ key: 'active', label: '活跃状态', children: activity }, { key: 'space', label: '空间信息', children: <Card title="空间层级"><Typography.Paragraph type="secondary">空间 → 场景 → 分组 → 网址</Typography.Paragraph><Tree showLine defaultExpandAll treeData={user.canceledAt ? [] : [{ key: 'space-1', title: '🗂️ 我的日常收藏', children: [{ key: 'scene-1', title: '🎬 每日使用', children: [{ key: 'group-1', title: '📁 常用工具', children: [{ key: 'link-1', title: '🔗 Google' }, { key: 'link-2', title: '🔗 ChatGPT' }] }] }] }]} /></Card> }, { key: 'member', label: '会员信息', children: <Card title="会员时间变动记录"><Descriptions column={2} items={[{ key: 'status', label: '会员状态', children: activeMember(user) ? <Tag color="green">已开通</Tag> : <Tag>未开通</Tag> }, { key: 'current', label: '当前有效期至', children: memberDateLabel(user.memberExpiresAt) }]} /><MemberEventList events={events} /></Card> }, { key: 'cancellation', label: '注销记录', children: <Card title="注销记录"><ConfigurableTable<CancellationEvent> configKey="ShiyuUserCancellationEvents" rowKey={event => event.at} dataSource={user.cancellationEvents || []} pagination={false} columns={[{ title: '时间', dataIndex: 'at', render: value => dayjs(value).format('YYYY-MM-DD HH:mm:ss') }, { title: '发起人', dataIndex: 'operator' }, { title: '验证方式', dataIndex: 'verification', render: value => ({ email: '邮箱验证码', phone: '短信验证码', wechat: '微信扫码', 'admin-password': '管理员密码' })[value as CancellationEvent['verification']] }, { title: '注销前会员', dataIndex: 'hadMembership', render: value => value ? '是' : '否' }]} /></Card> }]} /></div>
}

function MemberEventList({ events }: { events: MemberEvent[] }) {
  const [selected, setSelected] = useState<MemberEvent | null>(null)
  const sourceName = (event: MemberEvent) => event.source === 'admin' ? '管理员设置' : event.source === 'payment' ? '用户付费' : event.source === 'reward' ? '活动奖励' : event.type || '历史记录'
  const expiryLabel = (value: string | null | undefined, permanent?: boolean) => permanent ? '永久有效' : value ? memberDateLabel(value, true) : '非会员'
  return <>
    <ConfigurableTable<MemberEvent> configKey="ShiyuMemberEvents" fixedKeys={['title', 'actions']} rowKey={item => item.id || `${item.time}-${item.title}`} dataSource={events} pagination={{ pageSize: 10 }} columns={[
      { title: '时间', dataIndex: 'time', render: value => memberDateLabel(value, true) },
      { title: '事件', dataIndex: 'title' },
      { title: '来源', key: 'source', render: (_, row) => <Tag color={row.source === 'reward' ? 'green' : row.source === 'payment' ? 'blue' : 'default'}>{sourceName(row)}</Tag> },
      { title: '支付金额', dataIndex: 'amount', render: (value, row) => row.source === 'payment' || row.type === '付费' ? `¥ ${Number(value || 0).toFixed(2)}` : '—' },
      { title: '时长变动', dataIndex: 'duration' },
      { title: '变更后有效期', key: 'expires', render: (_, row) => row.action === 'cancel' || row.expires === '已取消' ? '已取消' : expiryLabel(row.afterExpiresAt ?? row.expires, row.afterPermanent) },
      { title: '操作人', dataIndex: 'operator', render: value => value || '—' },
      { title: '操作', key: 'actions', render: (_, row) => <Button type="link" onClick={() => setSelected(row)}>查看明细</Button> },
    ]} />
    <Drawer title="会员变动明细" width={560} open={Boolean(selected)} onClose={() => setSelected(null)}>
      {selected && <Descriptions column={1} items={[
        { key: 'id', label: '记录编号', children: selected.id || '历史记录' },
        { key: 'time', label: '发生时间', children: memberDateLabel(selected.time, true) },
        { key: 'title', label: '变动内容', children: selected.title },
        { key: 'source', label: '来源', children: sourceName(selected) },
        { key: 'operator', label: '操作人', children: selected.operator || '—' },
        { key: 'before', label: '变更前有效期', children: selected.beforeExpiresAt === undefined ? '历史记录未保存' : expiryLabel(selected.beforeExpiresAt, selected.beforePermanent) },
        { key: 'after', label: '变更后有效期', children: selected.action === 'cancel' || selected.expires === '已取消' ? '已取消' : expiryLabel(selected.afterExpiresAt ?? selected.expires, selected.afterPermanent) },
        { key: 'duration', label: '时长变动', children: selected.duration },
        { key: 'order', label: '关联订单', children: selected.orderId || '—' },
        { key: 'reward', label: '关联奖励', children: selected.rewardId || '—' },
        { key: 'remark', label: '备注', children: selected.remark || '—' },
      ]} />}
    </Drawer>
  </>
}

function memberRowFor(user: User, index: number): Member {
  const event = user.memberEvents?.[0]
  const expiresAt = user.memberExpiresAt || ''
  const expiresTime = memberExpiryTime(expiresAt)
  const daysLeft = Number.isFinite(expiresTime) ? (expiresTime - Date.now()) / 86_400_000 : Number.POSITIVE_INFINITY
  return {
    id: `M-${user.id}-${index}`,
    userId: user.id,
    phone: user.phone,
    user: user.name,
    plan: user.membership?.planName || (user.membership?.planId ? '会员权益方案' : event?.type === '活动赠送' ? '活动会员' : '管理员开通'),
    startedAt: memberDateLabel(user.memberEvents?.find(item => item.action === 'grant')?.time || event?.time || user.registeredAt).replaceAll('/', '-'),
    expiresAt,
    autoRenew: false,
    status: daysLeft >= 0 && daysLeft <= 7 ? 'expiring' : 'valid',
  }
}

function MemberList() {
  const [selected, setSelected] = useState<Member | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userItems, setUserItems] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState('')
  const [startedRange, setStartedRange] = useState<any[]>()
  const [expiresRange, setExpiresRange] = useState<any[]>()
  const [renew, setRenew] = useState<string>()
  const [plan, setPlan] = useState<string>()
  const [submitted, setSubmitted] = useState<{ phone: string; startedRange?: any[]; expiresRange?: any[]; renew?: string; plan?: string }>({ phone: '' })
  useEffect(() => {
    fetch('/api/shiyu/users', { credentials: 'include' })
      .then(async (response) => { if (!response.ok) throw new Error('会员数据加载失败'); return response.json() as Promise<{ items: User[] }> })
      .then((data) => setUserItems(data.items))
      .catch((error) => message.error(error instanceof Error ? error.message : '会员数据加载失败'))
      .finally(() => setLoading(false))
  }, [])
  const memberItems = userItems.filter(activeMember).map(memberRowFor)
  const phoneOf = (member: Member) => member.phone || userItems.find((user) => user.id === member.userId || user.name === member.user)?.phone || '未绑定'
  const inRange = (value: string, range?: any[]) => inMemberDateRange(value, range?.[0]?.format('YYYY-MM-DD'), range?.[1]?.format('YYYY-MM-DD'))
  const filtered = memberItems.filter((item) => (!submitted.phone || phoneOf(item).includes(submitted.phone)) && inRange(item.startedAt, submitted.startedRange) && inRange(item.expiresAt, submitted.expiresRange) && (!submitted.renew || String(item.autoRenew) === submitted.renew) && (!submitted.plan || item.plan === submitted.plan))
  const finite = memberItems.filter((item) => item.expiresAt !== '永久').length
  const permanent = memberItems.filter((item) => item.expiresAt === '永久').length
  const expiring = memberItems.filter((item) => item.status === 'expiring').length
  const reset = () => { setPhone(''); setStartedRange(undefined); setExpiresRange(undefined); setRenew(undefined); setPlan(undefined); setSubmitted({ phone: '' }) }
  const userOf = (item: Member): User => userItems.find((user) => user.id === item.userId || user.name === item.user) || { id: `U-${item.id.slice(1)}`, name: item.user, phone: phoneOf(item), registeredAt: item.startedAt, source: '会员开通', spaces: 0, status: item.status === 'valid' ? 'active' : 'silent' }
  return <>
    <Space className="shiyu-member-stats" size={16} wrap>{[['当前会员总数', memberItems.length], ['有效期会员', finite], ['永久会员', permanent], ['近 7 天即将到期', expiring]].map(([label, value]) => <Card key={String(label)} size="small"><Statistic title={label} value={value} /></Card>)}</Space>
    <Card className="shiyu-filter-card" title="筛选条件"><Space className="shiyu-user-filters" wrap size={16}><div className="shiyu-filter-item"><span>手机号</span><Input allowClear placeholder="输入手机号" value={phone} onChange={(event) => setPhone(event.target.value)} /></div><div className="shiyu-filter-item"><span>会员开通时间</span><DatePicker.RangePicker value={startedRange as any} placeholder={['开始时间', '结束时间']} onChange={(value) => setStartedRange(value as any[])} /></div><div className="shiyu-filter-item"><span>会员截止时间</span><DatePicker.RangePicker value={expiresRange as any} placeholder={['开始时间', '结束时间']} onChange={(value) => setExpiresRange(value as any[])} /></div><div className="shiyu-filter-item"><span>连续续费</span><Select allowClear placeholder="全部" value={renew} onChange={setRenew} options={[{ value: 'true', label: '已开启' }, { value: 'false', label: '未开启' }]} /></div><div className="shiyu-filter-item"><span>套餐类型</span><Select allowClear placeholder="全部套餐" value={plan} onChange={setPlan} options={[...new Set(memberItems.map(item => item.plan))].map(value => ({ value, label: value }))} /></div><Button type="primary" onClick={() => setSubmitted({ phone, startedRange, expiresRange, renew, plan })}>搜索</Button><Button onClick={reset}>重置</Button></Space></Card>
    <Card title={`会员 · 共 ${filtered.length} 位`}><ConfigurableTable loading={loading} configKey="ShiyuMembers" fixedKeys={['user', 'actions']} rowKey="id" dataSource={filtered} columns={[{ title: '会员用户', key: 'user', dataIndex: 'user' }, { title: '手机号', key: 'phone', render: (_, item) => <PhoneNumber value={phoneOf(item)} /> }, { title: '套餐', dataIndex: 'plan' }, { title: '开通时间', dataIndex: 'startedAt' }, { title: '有效期至', dataIndex: 'expiresAt', render: (value) => memberDateLabel(value) }, { title: '连续续费', dataIndex: 'autoRenew', render: (value) => <Tag color={value ? 'purple' : 'default'}>{value ? '已开启' : '未开启'}</Tag> }, { title: '状态', dataIndex: 'status', render: (value) => <Tag color={value === 'valid' ? 'green' : 'orange'}>{value === 'valid' ? '有效' : '即将到期'}</Tag> }, { title: '操作', key: 'actions', render: (_, item) => <Button type="link" onClick={() => setSelected(item)}>会员详情</Button> }]} /></Card>
    <Drawer title="会员详情" width={880} open={Boolean(selected)} onClose={() => setSelected(null)}>{selected && <MemberDetail member={selected} user={userOf(selected)} onOpenUser={() => setSelectedUser(userOf(selected))} />}</Drawer>
    <Drawer title="用户详情" width={1040} open={Boolean(selectedUser)} onClose={() => setSelectedUser(null)}>{selectedUser && <UserDetail user={selectedUser} onUserChanged={(next) => { setSelectedUser(next); setUserItems(items => items.map(item => item.id === next.id ? next : item)); setSelected(activeMember(next) ? memberRowFor(next, 0) : null) }} />}</Drawer>
  </>
}

function MemberDetail({ member, user, onOpenUser }: { member: Member; user: User; onOpenUser: () => void }) {
  return <div className="shiyu-member-detail">
    <Card size="small" title="会员基础信息" extra={<Button type="link" onClick={onOpenUser}>查看用户详情</Button>}>
      <Space align="start" size={20}>
        <Avatar size={64}>{member.user.slice(0, 1)}</Avatar>
        <Descriptions column={2} items={[
          { key: 'member-id', label: '会员编号', children: member.id },
          { key: 'user', label: '会员用户', children: user.name },
          { key: 'phone', label: '手机号', children: <PhoneNumber key={user.id} value={user.phone} /> },
          { key: 'plan', label: '当前套餐', children: member.plan },
          { key: 'started', label: '开通时间', children: member.startedAt },
          { key: 'expires', label: '有效期至', children: memberDateLabel(member.expiresAt) },
          { key: 'renew', label: '连续续费', children: <Tag color={member.autoRenew ? 'purple' : 'default'}>{member.autoRenew ? '已开启' : '未开启'}</Tag> },
          { key: 'status', label: '会员状态', children: <Tag color={member.status === 'valid' ? 'green' : 'orange'}>{member.status === 'valid' ? '有效' : '即将到期'}</Tag> },
        ]} />
      </Space>
    </Card>
  </div>
}

function OrderList({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [items, setItems] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<string>()
  const [provider, setProvider] = useState<string>()
  const [query, setQuery] = useState<{ keyword: string; status?: string; provider?: string }>({ keyword: '' })
  const [selected, setSelected] = useState<Order | null>(null)
  const states: Record<string, string> = { created: '待支付', pending: '待支付', unknown: '结果待确认', paid: '已支付', closed: '已取消', expired: '已取消（超时）' }
  const load = async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/shiyu/payment-orders', { credentials: 'include', cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw Error(data.message || '订单加载失败')
      setItems(data.items || [])
    } catch (cause) { setError(cause instanceof Error ? cause.message : '订单加载失败') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])
  const filtered = items.filter(item => (!query.keyword || `${item.id} ${item.user} ${item.userId} ${item.planName}`.toLowerCase().includes(query.keyword.toLowerCase())) && (!query.status || item.status === query.status) && (!query.provider || item.provider === query.provider))
  return <>
    <Card className="shiyu-filter-card" title="筛选条件"><Space className="shiyu-user-filters" wrap size={16}>
      <div className="shiyu-filter-item global-search"><span>关键词</span><Input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="订单号、用户、套餐" allowClear /></div>
      <div className="shiyu-filter-item"><span>订单状态</span><Select value={status} onChange={setStatus} allowClear placeholder="全部状态" options={Object.entries(states).map(([value, label]) => ({ value, label }))} /></div>
      <div className="shiyu-filter-item"><span>支付方式</span><Select value={provider} onChange={setProvider} allowClear placeholder="全部方式" options={[{ value: 'alipay', label: '支付宝' }, { value: 'wechat', label: '微信支付' }, { value: 'free', label: '零元领取' }]} /></div>
      <Button type="primary" onClick={() => setQuery({ keyword: keyword.trim(), status, provider })}>搜索</Button><Button onClick={() => { setKeyword(''); setStatus(undefined); setProvider(undefined); setQuery({ keyword: '' }) }}>重置</Button>
    </Space></Card>
    {error && <Alert type="error" title={error} action={<Button onClick={load}>重试</Button>} />}
    <Card title={`订单 · 共 ${filtered.length} 笔`} extra={<Space><Button onClick={load} loading={loading}>刷新</Button><Button type="primary" onClick={() => onNavigate('/apps/shiyu/payment')}>支付配置</Button></Space>}><ConfigurableTable<Order> loading={loading} configKey="ShiyuPaymentOrders" fixedKeys={['id', 'actions']} rowKey="id" dataSource={filtered} columns={[
      { title: '订单号', dataIndex: 'id' }, { title: '用户', dataIndex: 'user' }, { title: '套餐', dataIndex: 'planName' },
      { title: '金额', dataIndex: 'amount', render: value => `¥ ${(Number(value) / 100).toFixed(2)}` },
      { title: '支付方式', dataIndex: 'provider', render: value => value === 'free' ? '零元领取' : value === 'alipay' ? '支付宝' : '微信支付' },
      { title: '支付时间', dataIndex: 'paidAt', render: value => memberDateLabel(value, true) },
      { title: '状态', dataIndex: 'status', render: value => <Tag color={value === 'paid' ? 'green' : value === 'closed' ? 'default' : 'orange'}>{states[value] || value}</Tag> },
      { title: '操作', key: 'actions', render: (_, row) => <Button type="link" onClick={() => setSelected(row)}>订单详情</Button> },
    ]} /></Card>
    <Drawer title="订单详情" width={580} open={Boolean(selected)} onClose={() => setSelected(null)}>{selected && <Descriptions column={1} items={[
      { key: 'id', label: '订单号', children: selected.id }, { key: 'user', label: '用户', children: selected.user }, { key: 'uid', label: '用户 ID', children: selected.userId },
      { key: 'plan', label: '套餐', children: selected.planName }, { key: 'days', label: '购买时长', children: `${selected.days} 天` }, { key: 'amount', label: '支付金额', children: `¥ ${(selected.amount / 100).toFixed(2)}` },
      { key: 'provider', label: '支付方式', children: selected.provider === 'free' ? '零元领取' : selected.provider === 'alipay' ? '支付宝' : '微信支付' }, { key: 'status', label: '状态', children: states[selected.status] },
      { key: 'created', label: '创建时间', children: memberDateLabel(selected.createdAt, true) }, { key: 'paid', label: '支付时间', children: memberDateLabel(selected.paidAt, true) },
      { key: 'expires', label: '本次入账后有效期', children: memberDateLabel(selected.memberExpiresAt, true) },
    ]} />}</Drawer>
  </>
}

function PlanManager() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [activeId, setActiveId] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingBenefits, setEditingBenefits] = useState(false)
  const [benefitDraft, setBenefitDraft] = useState<PlanEntitlement[]>([])
  const [editingPlan, setEditingPlan] = useState<string | 'new'>()
  const [planForm] = Form.useForm<Plan>()
  const railRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetch('/api/shiyu/plans', { credentials: 'include' })
      .then(async (response) => { if (!response.ok) throw new Error('会员套餐加载失败'); return response.json() as Promise<{ items: Plan[] }> })
      .then((data) => { setPlans(data.items); setActiveId((current) => current && data.items.some((item) => item.id === current) ? current : data.items[0]?.id) })
      .catch((error) => message.error(error instanceof Error ? error.message : '会员套餐加载失败'))
      .finally(() => setLoading(false))
  }, [])

  const activePlan = plans.find((plan) => plan.id === activeId) || plans[0]
  const writePlans = async (next: Plan[], success: string) => {
    setSaving(true)
    try {
      const response = await fetch('/api/shiyu/plans', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: next }) })
      const data = await response.json() as { items?: Plan[]; message?: string }
      if (!response.ok || !data.items) throw new Error(data.message || '会员套餐保存失败')
      setPlans(data.items)
      message.success(success)
      return data.items
    } catch (error) {
      message.error(error instanceof Error ? error.message : '会员套餐保存失败')
      return undefined
    } finally {
      setSaving(false)
    }
  }
  const choosePlan = (id: string) => {
    if (editingBenefits) return message.warning('请先保存或取消当前套餐的权益编辑')
    setActiveId(id)
  }
  const togglePlan = async (id: string, enabled: boolean) => {
    const next = plans.map((plan) => plan.id === id ? { ...plan, enabled } : plan)
    await writePlans(next, enabled ? '套餐已上架' : '套餐已下架')
  }
  const startBenefitEdit = () => {
    if (!activePlan) return
    setBenefitDraft(activePlan.entitlements.map((item) => ({ ...item })))
    setEditingBenefits(true)
  }
  const updateBenefit = (key: string, patch: Partial<PlanEntitlement>) => setBenefitDraft((items) => items.map((item) => item.key === key ? { ...item, ...patch } : item))
  const saveBenefits = async () => {
    if (!activePlan) return
    const next = plans.map((plan) => plan.id === activePlan.id ? { ...plan, entitlements: benefitDraft } : plan)
    const saved = await writePlans(next, `${activePlan.name}的权益配置已保存并生效`)
    if (saved) setEditingBenefits(false)
  }
  const openPlanEditor = (plan?: Plan) => {
    setEditingPlan(plan?.id || 'new')
    planForm.setFieldsValue(plan || { name: '', cycle: '一个月 30 天', days: 30, price: 0, original: 0, tag: '新套餐', autoRenew: false } as Plan)
  }
  const savePlanDetails = async () => {
    const values = await planForm.validateFields()
    if (editingPlan === 'new') {
      const template = plans.find((plan) => plan.id === 'monthly') || plans.find((plan) => plan.id !== 'free') || plans[0]
      if (!template) return
      const id = `custom-${Date.now()}`
      const nextPlan: Plan = { id, name: values.name, cycle: values.cycle, days: Number(values.days), price: Number(values.price), original: Number(values.original), tag: values.tag, autoRenew: Boolean(values.autoRenew), enabled: true, entitlements: template.entitlements.map((item) => ({ ...item })) }
      const saved = await writePlans([...plans, nextPlan], '新套餐已保存并生效')
      if (saved) { setActiveId(id); setEditingPlan(undefined) }
      return
    }
    const next = plans.map((plan) => plan.id === editingPlan ? { ...plan, name: values.name, cycle: values.cycle, days: Number(values.days), price: Number(values.price), original: Number(values.original), tag: values.tag, autoRenew: Boolean(values.autoRenew) } : plan)
    const saved = await writePlans(next, '套餐信息已保存并生效')
    if (saved) setEditingPlan(undefined)
  }
  const scrollRail = (direction: number) => railRef.current?.scrollBy({ left: direction * 300, behavior: 'smooth' })

  if (loading) return <Card loading />
  if (!activePlan) return <Card><Typography.Text type="secondary">暂无会员套餐</Typography.Text></Card>
  const rows = editingBenefits ? benefitDraft : activePlan.entitlements
  const included = activePlan.entitlements.filter((item) => item.enabled).length
  const columns = [
    { title: '权益范围', dataIndex: 'scope', width: 150, render: (value: string) => <Tag className="plan-scope-tag">{value}</Tag> },
    { title: '包含项目', dataIndex: 'name', width: 260, render: (_: string, row: PlanEntitlement) => <span className="plan-benefit-name"><strong>{row.name}</strong><small>{row.description}</small></span> },
    { title: '是否包含', dataIndex: 'enabled', width: 130, render: (value: boolean, row: PlanEntitlement) => editingBenefits ? <Switch checked={value} checkedChildren="包含" unCheckedChildren="不含" onChange={(checked) => updateBenefit(row.key, { enabled: checked })} /> : <Tag color={value ? 'green' : 'default'}>{value ? '已包含' : '不包含'}</Tag> },
    { title: '包含数量 / 内容', dataIndex: 'value', render: (value: number | string, row: PlanEntitlement) => editingBenefits ? row.kind === 'quantity' ? <Space size={8}><InputNumber min={0} value={Number(value)} onChange={(next) => updateBenefit(row.key, { value: Number(next || 0) })} /><Typography.Text type="secondary">{row.unit}</Typography.Text></Space> : <Input value={String(value)} maxLength={40} onChange={(event) => updateBenefit(row.key, { value: event.target.value })} /> : row.enabled ? <strong className="plan-benefit-value">{value}{row.kind === 'quantity' ? ` ${row.unit}` : ''}</strong> : <Typography.Text type="secondary">—</Typography.Text> },
  ]

  return <section className="plan-manager shiyu-plan-manager">
    <div className="plan-toolbar">
      <div><Typography.Title level={4}>会员套餐</Typography.Title><Typography.Paragraph type="secondary">选择上方套餐，查看并配置该套餐对应的权益范围、数量与具体内容。修改保存后才会生效。</Typography.Paragraph></div>
      <Space><Button icon={<LeftOutlined />} aria-label="向左浏览套餐" onClick={() => scrollRail(-1)} /><Button icon={<RightOutlined />} aria-label="向右浏览套餐" onClick={() => scrollRail(1)} /><Button type="primary" icon={<PlusOutlined />} onClick={() => openPlanEditor()}>新增套餐</Button></Space>
    </div>
    <div className="shiyu-plan-rail" ref={railRef}>
      {plans.map((plan) => {
        const quota = plan.entitlements.filter((item) => item.kind === 'quantity').slice(0, 4)
        return <article key={plan.id} role="button" tabIndex={0} aria-pressed={activePlan.id === plan.id} className={`shiyu-plan-card ${activePlan.id === plan.id ? 'is-selected' : ''} ${plan.enabled ? '' : 'is-offline'}`} onClick={() => choosePlan(plan.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choosePlan(plan.id) } }}>
          <div className="shiyu-plan-card-top"><Tag color={plan.enabled ? 'green' : 'default'}>{plan.enabled ? '已上架' : '已下架'}</Tag><small>{plan.tag}</small></div>
          <h3>{plan.name}</h3><div className="shiyu-plan-price"><strong>¥{plan.price}</strong><span>{plan.cycle}</span></div>
          {plan.original > plan.price ? <del>原价 ¥{plan.original}</del> : <span className="plan-price-placeholder">标准价格</span>}
          <div className="shiyu-plan-quota">{quota.map((item) => <span key={item.key}>{item.name}<b>{item.value}</b></span>)}</div>
          <div className="shiyu-plan-card-foot"><span>{activePlan.id === plan.id ? '当前查看' : '查看配置'}</span><span onClick={(event) => event.stopPropagation()}><Switch size="small" checked={plan.enabled} disabled={saving || editingBenefits} onChange={(checked) => void togglePlan(plan.id, checked)} /></span></div>
        </article>
      })}
    </div>
    <Card className="shiyu-plan-detail" title={<span className="shiyu-plan-detail-title"><span><strong>{activePlan.name}</strong><small>权益配置 · {included} / {activePlan.entitlements.length} 项已包含</small></span><Tag color={activePlan.enabled ? 'green' : 'default'}>{activePlan.enabled ? '上架中' : '已下架'}</Tag></span>} extra={editingBenefits ? <Space><Button onClick={() => setEditingBenefits(false)}>取消</Button><Button type="primary" loading={saving} onClick={() => void saveBenefits()}>保存并生效</Button></Space> : <Space><Button icon={<EditOutlined />} onClick={() => openPlanEditor(activePlan)}>编辑套餐</Button><Button type="primary" icon={<EditOutlined />} onClick={startBenefitEdit}>编辑权益内容</Button></Space>}>
      <div className="shiyu-plan-summary"><span><small>套餐周期</small><strong>{activePlan.cycle}</strong></span><span><small>售价</small><strong>¥ {activePlan.price}</strong></span><span><small>有效天数</small><strong>{activePlan.days ? `${activePlan.days} 天` : '长期'}</strong></span><span><small>续费方式</small><strong>{activePlan.autoRenew ? '自动续费' : '单次购买'}</strong></span></div>
      {editingBenefits && <div className="shiyu-plan-edit-note">当前为编辑草稿。调整“是否包含”、数量或内容后，点击“保存并生效”才会更新正式配置。</div>}
      <ConfigurableTable<PlanEntitlement> configKey="shiyu-plan-entitlements" fixedKeys={['name']} rowKey="key" pagination={false} dataSource={rows} columns={columns} scroll={{ x: 860 }} />
    </Card>
    <Drawer title={editingPlan === 'new' ? '新增会员套餐' : `编辑套餐 · ${activePlan.name}`} width={520} open={Boolean(editingPlan)} onClose={() => setEditingPlan(undefined)} extra={<Space><Button onClick={() => setEditingPlan(undefined)}>取消</Button><Button type="primary" loading={saving} onClick={() => void savePlanDetails()}>保存并生效</Button></Space>}>
      <Form form={planForm} layout="vertical" requiredMark="optional">
        <Form.Item name="name" label="套餐名称" rules={[{ required: true, message: '请输入套餐名称' }]}><Input maxLength={20} placeholder="例如：季度会员" /></Form.Item>
        <div className="shiyu-plan-form-grid"><Form.Item name="cycle" label="展示周期" rules={[{ required: true, message: '请输入展示周期' }]}><Input placeholder="例如：三个月 90 天" /></Form.Item><Form.Item name="days" label="有效天数" rules={[{ required: true, message: '请输入有效天数' }]}><InputNumber min={0} precision={0} /></Form.Item></div>
        <div className="shiyu-plan-form-grid"><Form.Item name="price" label="售价" rules={[{ required: true, message: '请输入售价' }]}><InputNumber min={0} precision={2} prefix="¥" /></Form.Item><Form.Item name="original" label="原价" rules={[{ required: true, message: '请输入原价' }]}><InputNumber min={0} precision={2} prefix="¥" /></Form.Item></div>
        <Form.Item name="tag" label="套餐标签" rules={[{ required: true, message: '请输入套餐标签' }]}><Input maxLength={16} placeholder="例如：限时优惠" /></Form.Item>
        <Form.Item name="autoRenew" label="连续续费" valuePropName="checked"><Switch checkedChildren="自动续费" unCheckedChildren="单次购买" /></Form.Item>
        {editingPlan === 'new' && <Typography.Paragraph type="secondary">新套餐会复制月度会员的权益项目作为初始配置。保存后，可在下方列表逐项调整。</Typography.Paragraph>}
      </Form>
    </Drawer>
  </section>
}

function MusicManager() {
  const [items, setItems] = useState<ShiyuMusic[]>([])
  const [themes, setThemes] = useState<ShiyuTheme[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updating, setUpdating] = useState(false)
  const mutation = useRef(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ShiyuMusic>()
  const [audioFile, setAudioFile] = useState<File>()
  const [form] = Form.useForm<{ name: string; duration: string; genre: string; themeIds: string[] }>()

  const load = async () => {
    setLoading(true)
    try {
      const [musicResponse, themeResponse] = await Promise.all([
        fetch('/api/shiyu/music', { credentials: 'include' }),
        fetch('/api/shiyu/themes', { credentials: 'include' }),
      ])
      if (!musicResponse.ok) throw new Error('音乐资源加载失败')
      const musicData = await musicResponse.json() as { items: ShiyuMusic[] }
      const themeData = themeResponse.ok ? await themeResponse.json() as { items: ShiyuTheme[] } : { items: [] }
      setItems(musicData.items)
      setThemes(themeData.items)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '音乐资源加载失败')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void load() }, [])

  const formatDuration = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const parseDuration = (value: string) => {
    const matched = /^\s*(\d{1,3}):(\d{2})\s*$/.exec(value)
    if (!matched || Number(matched[2]) > 59) return undefined
    return Number(matched[1]) * 60 + Number(matched[2])
  }
  const fileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('音乐文件读取失败'))
    reader.readAsDataURL(file)
  })
  const beginCreate = () => {
    setEditing(undefined)
    setAudioFile(undefined)
    form.resetFields()
    form.setFieldsValue({ themeIds: [] })
    setOpen(true)
  }
  const beginEdit = (item: ShiyuMusic) => {
    setEditing(item)
    setAudioFile(undefined)
    form.setFieldsValue({ name: item.name, duration: formatDuration(item.durationSeconds), genre: item.genre, themeIds: item.themeIds })
    setOpen(true)
  }
  const chooseFile = (file?: File) => {
    setAudioFile(file)
    if (!file) return
    if (!form.getFieldValue('name')) form.setFieldValue('name', file.name.replace(/\.[^.]+$/, ''))
    const url = URL.createObjectURL(file)
    const audio = new Audio(url)
    audio.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(audio.duration)) form.setFieldValue('duration', formatDuration(Math.round(audio.duration)))
      URL.revokeObjectURL(url)
    }, { once: true })
    audio.addEventListener('error', () => URL.revokeObjectURL(url), { once: true })
  }
  const save = async () => {
    try {
      const values = await form.validateFields()
      const durationSeconds = parseDuration(values.duration)
      if (!durationSeconds) return message.warning('音乐时长请按“分:秒”填写，例如 03:28')
      if (!editing && !audioFile) return message.warning('请选择需要上传的音乐文件')
      setSaving(true)
      const body: Record<string, unknown> = { name: values.name.trim(), durationSeconds, genre: values.genre.trim(), themeIds: values.themeIds || [] }
      if (audioFile) {
        body.fileName = audioFile.name
        body.mimeType = audioFile.type || 'audio/mpeg'
        body.fileData = await fileAsDataUrl(audioFile)
      }
      const response = await fetch(editing ? `/api/shiyu/music/${encodeURIComponent(editing.id)}` : '/api/shiyu/music', { method: editing ? 'PUT' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await response.json() as { item?: ShiyuMusic; message?: string }
      if (!response.ok || !data.item) throw new Error(data.message || '音乐保存失败')
      setItems((current) => editing ? current.map((item) => item.id === data.item!.id ? data.item! : item) : [data.item!, ...current])
      setOpen(false)
      message.success(editing ? '音乐信息已保存' : '音乐已上传')
    } catch (error) {
      if (error instanceof Error) message.error(error.message)
    } finally {
      setSaving(false)
    }
  }
  const setEnabled = async (item: ShiyuMusic, enabled: boolean) => {
    if (mutation.current) return
    mutation.current = true; setUpdating(true)
    try {
      const response = await fetch(`/api/shiyu/music/${encodeURIComponent(item.id)}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled }) })
      const data = await response.json() as { item?: ShiyuMusic; message?: string }
      if (!response.ok || !data.item) throw new Error(data.message || '上下架状态保存失败')
      setItems((current) => current.map((value) => value.id === data.item!.id ? data.item! : value))
      message.success(enabled ? '音乐已上架' : '音乐已下架')
    } catch (error) { message.error(error instanceof Error ? error.message : '上下架状态保存失败') } finally { mutation.current = false; setUpdating(false) }
  }
  const reorder = (order: string[]) => setItems(current => order.map(id => current.find(item => item.id === id)!).filter(Boolean))
  const saveOrder = async (order: string[], previous: string[]) => {
    if (mutation.current) { reorder(previous); return }
    mutation.current = true; setUpdating(true)
    try {
      const response = await fetch('/api/shiyu/music/order', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order }) })
      const result = await response.json() as { items?: ShiyuMusic[]; message?: string }
      if (!response.ok || !result.items) throw new Error(result.message || '音乐排序保存失败')
      setItems(result.items); message.success('音乐顺序已保存')
    } catch (error) { reorder(previous); message.error(error instanceof Error ? error.message : '音乐排序保存失败') }
    finally { mutation.current = false; setUpdating(false) }
  }
  const themeName = (id: string) => themes.find((theme) => theme.id === id)?.name || id
  return <>
    <Card title={`音乐资源 · 共 ${items.length} 首`} extra={<Button type="primary" icon={<UploadOutlined />} disabled={updating || loading} onClick={beginCreate}>上传音乐</Button>}>
      <Typography.Paragraph type="secondary">长按卡片拖动排序；使用开关启用或关闭；悬停后可编辑。顺序和启用状态自动保存。</Typography.Paragraph>
      {loading ? <Typography.Paragraph type="secondary">正在加载音乐…</Typography.Paragraph> : !items.length ? <Typography.Paragraph type="secondary">暂无音乐，上传一首开始吧。</Typography.Paragraph> : <ShiyuResourceCards label="音乐资源" editLabel="编辑" disabled={updating || saving} items={items.map(item => ({ id: item.id, name: item.name, enabled: item.enabled,
        preview: <div className="resource-music-preview"><CustomerServiceOutlined /><span>{formatDuration(item.durationSeconds)}</span></div>,
        detail: <div className="resource-music-detail"><span>{item.genre}</span><Space size={[4, 4]} wrap>{item.themeIds.length ? item.themeIds.map(id => <Tag key={id}>{themeName(id)}</Tag>) : <Tag>全部主题</Tag>}</Space><span className="resource-music-meta">{item.source} · {item.fileName}</span><span className="resource-music-meta">{item.createdAt}</span></div>,
      }))} onToggle={id => { const item = items.find(item => item.id === id); if (item) void setEnabled(item, !item.enabled) }} onEdit={id => { const item = items.find(item => item.id === id); if (item) beginEdit(item) }} onReorder={reorder} onReorderEnd={(order, previous) => void saveOrder(order, previous)} />}

    </Card>
    <Drawer title={editing ? `编辑音乐 · ${editing.name}` : '上传音乐'} width={560} open={open} onClose={() => setOpen(false)} footer={<div className="shiyu-drawer-actions"><Button onClick={() => setOpen(false)}>取消</Button><Button type="primary" loading={saving} onClick={() => { void save() }}>保存并生效</Button></div>}>
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item label={editing ? '更换音乐文件（可选）' : '音乐文件'} required={!editing}><label className="shiyu-audio-picker"><UploadOutlined /><span>{audioFile?.name || (editing ? '不更换现有文件' : '选择本地音乐文件')}</span><input type="file" accept="audio/*" onChange={(event) => chooseFile(event.target.files?.[0])} /></label><Typography.Text type="secondary">支持常见音频格式，单个文件不超过 30 MB。</Typography.Text></Form.Item>
        <Form.Item name="name" label="音乐名称" rules={[{ required: true, whitespace: true, message: '请输入音乐名称' }]}><Input maxLength={40} placeholder="例如：晨雾" /></Form.Item>
        <Form.Item name="duration" label="音乐时长" rules={[{ required: true, message: '请输入音乐时长' }]}><Input placeholder="例如：03:28" addonAfter="分:秒" /></Form.Item>
        <Form.Item name="genre" label="音乐风格" rules={[{ required: true, whitespace: true, message: '请输入音乐风格' }]}><Input maxLength={30} placeholder="例如：轻音乐、氛围、爵士" /></Form.Item>
        <Form.Item name="themeIds" label="适用主题"><Select mode="multiple" allowClear placeholder="不选择则适用于全部主题" options={themes.map((theme) => ({ value: theme.id, label: theme.name }))} /></Form.Item>
      </Form>
    </Drawer>
  </>
}
