import { ApartmentOutlined, AuditOutlined, CrownOutlined, DashboardOutlined, ExperimentOutlined, HomeOutlined, MessageOutlined, MoonOutlined, ProfileOutlined, SettingOutlined, ShoppingOutlined, SunOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Badge, Button, Card, Dropdown, Form, Input, Modal, Space, Spin, Tag, Typography, message, type MenuProps } from 'antd'
import { useEffect, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { AdminFrame, useAdminSession, useApplications, usePendingFeedbackCount, type Application } from '../packages/admin-ui'
import { ApplicationLogo, LogoManager, useApplicationLogos, useAppDetails } from './ApplicationLogos'
import { SystemPage } from './SystemPage'
import { ExperienceTestPage } from './ExperienceTestPage'
import { ShiyuAppearance } from './ShiyuAppearance'
import { ShiyuAdminPage } from './ShiyuAdminPage'
import { FeedbackPage } from './FeedbackPage'
import { useApplicationOrder } from './useApplicationOrder'
import { analyticsHome, analyticsModules, isAnalyticsDetail } from './analytics-navigation'

const navigate = (path: string) => { history.pushState({}, '', path); dispatchEvent(new PopStateEvent('popstate')) }

export function App() {
  useApplicationLogos()
  const session = useAdminSession('gateway')
  const applications = useApplications()
  const [path, setPath] = useState(location.pathname)
  useEffect(() => { const handler = () => setPath(location.pathname); addEventListener('popstate', handler); return () => removeEventListener('popstate', handler) }, [])
  useEffect(() => {
    if (!session.active || !path.startsWith('/apps/') || path.startsWith('/apps/shiyu')) return
    const appId = path.split('/')[2]
    const target = applications.find((item) => item.id === appId)
    if (!target) return
    const targetUrl = new URL(target.url)
    const next = `${targetUrl.origin}${path}`
    if (next !== location.href) location.replace(next)
  }, [applications, path, session.active])
  if (session.loading) return <main className="page-loading"><Spin /></main>
  if (!session.active) return <LoginPage onLogin={session.login} />
  if (path.startsWith('/system/') && !session.applicationIds.includes('platform')) { location.replace('/applications'); return <main className="page-loading"><Spin /></main> }
  if (path.startsWith('/apps/shiyu') && !session.applicationIds.includes('shiyu')) { location.replace('/applications'); return <main className="page-loading"><Spin /></main> }
  if (path === '/' || path === '/login' || path === '/applications') return <ApplicationCenter applications={applications} accountId={session.admin?.id || session.admin?.account || 'default'} />
  if (path === '/system/feedback') return <AdminFrame appId="platform" title="用户问题反馈" selected={path} items={[]} onNavigate={navigate} onLogout={session.logout}><FeedbackPage applications={applications} /></AdminFrame>
  if (path.startsWith('/apps/shiyu')) {
    const shiyuItems: MenuProps['items'] = [
      { key: analyticsHome.path, icon: <HomeOutlined />, label: analyticsHome.label },
      { key: 'analytics-center', className: 'analytics-menu', icon: <DashboardOutlined />, label: '数据中心', children: analyticsModules.map(({path: key, label}) => ({key, label})) },
      { key: 'user-center', icon: <TeamOutlined />, label: '用户中心', children: [
        { key: '/apps/shiyu/users', label: '用户列表' },
        { key: '/apps/shiyu/members', label: '会员列表' },
      ] },
      { key: 'member-center', icon: <CrownOutlined />, label: '会员中心', children: [
        { key: '/apps/shiyu/plans', label: '套餐与权益' },
      ] },
      { key: 'trade-center', icon: <ShoppingOutlined />, label: '交易中心', children: [
        { key: '/apps/shiyu/orders', label: '订单列表' },
      ] },
      { key: 'content-center', icon: <ApartmentOutlined />, label: '内容中心', children: [
        { key: 'content-theme', label: '主题板块', children: [
          { key: '/apps/shiyu/personalization/themes', label: '主题' },
          { key: '/apps/shiyu/personalization/colors', label: '配色' },
          { key: '/apps/shiyu/personalization/fonts', label: '字体' },
          { key: '/apps/shiyu/personalization/pet', label: '宠物' },
          { key: '/apps/shiyu/music', label: '音乐' },
          { key: '/apps/shiyu/avatars', label: '头像' },
        ] },
        { key: 'content-space', label: '空间板块', children: [
          { key: '/apps/shiyu/library', label: '新手礼包' },
        ] },
        { key: 'content-world', label: '世界板块', children: [
          { key: '/apps/shiyu/platform-picks', label: '精选 UP 主' },
        ] },
        { key: 'content-official-theme', label: '官方主题', children: [
          { key: '/apps/shiyu/page-colors/colors', label: '平台配色' },
          { key: '/apps/shiyu/page-colors/fonts', label: '平台字体' },
        ] },
      ] },
      { key: 'config-center', icon: <SettingOutlined />, label: '配置中心', children: [
        { key: '/apps/shiyu/feature-flags', label: '功能模块' }, { key: '/apps/shiyu/login-and-verification', label: '登录与验证' }, { key: '/apps/shiyu/languages', label: '语言与翻译库' }, { key: '/apps/shiyu/release-control', label: '上线控制' }, { key: '/apps/shiyu/release-history', label: '上线记录' },
      ] },
      { key: 'operation-center', icon: <ProfileOutlined />, label: '运营中心', children: [
        { key: '/apps/shiyu/notices', label: '公告与更新' }, { key: '/apps/shiyu/agreements', label: '协议内容' }, { key: '/apps/shiyu/copy', label: '前台文案' }, { key: '/apps/shiyu/filing', label: '备案信息' }, { key: '/apps/shiyu/baidu-index', label: '百度收录' },
      ] },
      { key: 'activity-center', icon: <ProfileOutlined />, label: '活动中心', children: [
        { key: '/apps/shiyu/activities', label: '会员活动' }, { key: '/apps/shiyu/sharing', label: '邀请奖励' }, { key: '/apps/shiyu/registration-rewards', label: '新用户注册奖励' },
      ] },
      { key: 'resource-monitoring', icon: <DashboardOutlined />, label: '资源监控', children: [
        { key: '/apps/shiyu/resource-monitoring/quotas', label: '额度' }, { key: '/apps/shiyu/resource-monitoring/servers', label: '云服务' }, { key: '/apps/shiyu/resource-monitoring/expiries', label: '到期' }, { key: '/apps/shiyu/resource-monitoring/notifications', label: '通知' }, { key: '/apps/shiyu/resource-monitoring/alerts', label: '告警' },
      ] },
    ]
    return <ShiyuAppearance><AdminFrame appId="shiyu" title={path === analyticsHome.path ? '首页' : isAnalyticsDetail(path) ? '数据中心' : '日常管理'} activeGroupKey={isAnalyticsDetail(path) ? 'analytics-center' : undefined} selected={{'/apps/shiyu/invitations':'/apps/shiyu/sharing','/apps/shiyu/activity-records':'/apps/shiyu/activities','/apps/shiyu/activity-audit':'/apps/shiyu/activities','/apps/shiyu/themes':'/apps/shiyu/personalization/themes','/apps/shiyu/personalization':'/apps/shiyu/personalization/themes','/apps/shiyu/benefits':'/apps/shiyu/plans','/apps/shiyu/payment':'/apps/shiyu/orders','/apps/shiyu/page-colors':'/apps/shiyu/page-colors/colors','/apps/shiyu/member-visual':'/apps/shiyu/plans'}[path]||path} items={shiyuItems} onNavigate={navigate} onLogout={session.logout}><ShiyuAdminPage page={path} onNavigate={navigate} /></AdminFrame></ShiyuAppearance>
  }
  const menuItems: MenuProps['items'] = [
    { key: '/system/roles', icon: <TeamOutlined />, label: '角色与应用权限' },
    { key: '/system/admins', icon: <UserOutlined />, label: '管理员账号' },
    { key: '/system/applications', icon: <SettingOutlined />, label: '应用入口配置' },
    { key: '/system/experience-tests', icon: <ExperimentOutlined />, label: '体验测试' },
    { key: '/system/audits', icon: <AuditOutlined />, label: '操作审计' },
  ]
  const title = path === '/system/admins' ? '管理员账号' : path === '/system/applications' ? '应用入口配置' : path === '/system/experience-tests' ? '体验测试' : path === '/system/audits' ? '操作审计' : '角色与应用权限'
  return <AdminFrame appId="platform" title={title} selected={path} items={menuItems} onNavigate={navigate} onLogout={session.logout}>{path === '/system/experience-tests' ? <ExperienceTestPage applications={applications} /> : <SystemPage page={path} />}</AdminFrame>
}

function LoginPage({ onLogin }: { onLogin: (account: string, password: string) => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  const submit = async (values: { account: string; password: string }) => {
    setBusy(true)
    try { await onLogin(values.account, values.password); navigate('/applications') } catch (error) { message.error(error instanceof Error ? error.message : '登录失败') } finally { setBusy(false) }
  }
  return <main className="login-page"><section className="login-visual"><span className="brand-mark">拾</span><div><strong>拾隅聚合管理后台</strong><p>统一管理应用入口、后台账号、角色与权限。</p></div><div className="login-orb orb-one" /><div className="login-orb orb-two" /></section><Card className="login-card"><Tag color="green">开发 Mock</Tag><Typography.Title level={2}>管理员登录</Typography.Title><Typography.Paragraph type="secondary">一次登录后进入当前账号已获授权的业务后台。</Typography.Paragraph><Form layout="vertical" onFinish={submit} initialValues={{ account: 'admin' }}><Form.Item name="account" label="管理员账号" rules={[{ required: true, message: '请输入管理员账号。' }]}><Input autoComplete="username" /></Form.Item><Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码。' }]}><Input.Password autoComplete="current-password" /></Form.Item><Button loading={busy} htmlType="submit" type="primary" size="large" block>登录</Button></Form><Typography.Text type="secondary" className="login-tip">本地预览：admin / 123456</Typography.Text></Card></main>
}

function ThemeRope() {
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>(() => (localStorage.getItem('admin-theme-mode') as 'light' | 'dark' | 'system') || 'system')
  const [systemDark, setSystemDark] = useState(false)
  useEffect(() => { const media = matchMedia('(prefers-color-scheme: dark)'); const sync = () => setSystemDark(media.matches); sync(); media.addEventListener('change', sync); return () => media.removeEventListener('change', sync) }, [])
  const dark = mode === 'dark' || (mode === 'system' && systemDark)
  useEffect(() => { document.body.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('admin-theme-mode', mode) }, [dark, mode])
  return <Dropdown trigger={['click']} menu={{ selectable: true, selectedKeys: [mode], items: [{ key: 'light', icon: <SunOutlined />, label: '日间模式' }, { key: 'dark', icon: <MoonOutlined />, label: '夜间模式' }, { key: 'system', label: '跟随主题' }], onClick: ({ key }) => setMode(key as 'light' | 'dark' | 'system') }}><button type="button" className="theme-rope-trigger" aria-label="切换主题"><i /><span>{dark ? <MoonOutlined /> : <SunOutlined />}</span></button></Dropdown>
}

function ApplicationCenter({ applications, accountId }: { applications: Application[]; accountId: string }) {
  const order = useApplicationOrder(applications, accountId)
  const pendingFeedback = usePendingFeedbackCount(accountId)
  return <main className="application-center compact-application-center"><header className="center-header"><div className="brand-lockup"><span className="brand-mark" style={{ background: 'transparent' }}><ApplicationLogo app="platform" size={42} /></span><div><strong>拾隅</strong><small>聚合管理后台</small></div></div><Space size={12}><Badge count={pendingFeedback} overflowCount={99} size="small" offset={[-2, 4]}><Button type="text" icon={<MessageOutlined />} onClick={() => navigate('/system/feedback')}>用户问题反馈</Button></Badge><ThemeRope /><Tag color="green">已授权 {applications.length} 个应用</Tag><Avatar style={{ background: '#2f7d62' }}>管</Avatar></Space></header><section className="center-hero"><span className="center-kicker">WORKSPACE</span><Typography.Title>选择一个应用，开始管理</Typography.Title><Typography.Paragraph>各应用独立维护业务代码；入口、管理员与应用权限在这里集中配置。</Typography.Paragraph></section><section className={`app-card-grid${order.activeId ? ' is-reordering' : ''}`} onClickCapture={order.onClickCapture}>{order.orderedApplications.map((application) => <ApplicationCard key={application.id} application={application} order={order} />)}</section></main>
}

function ApplicationCard({ application, order }: { application: Application; order: ReturnType<typeof useApplicationOrder> }) {
  const app = application.id as 'qing-time' | 'qing-space' | 'platform' | 'shiyu'
  const details = useAppDetails(app)
  const position = details?.position || (app === 'qing-time' ? '时间管理与生活记录' : app === 'qing-space' ? '网页工具与创作空间' : app === 'shiyu' ? '用户会员与订单运营' : '聚合配置与权限治理')
  const description = details?.description || application.description
  const action = app === 'platform' ? '进入配置' : app === 'shiyu' ? '进入日常管理' : `进入${application.name}`
  const [qrOpen, setQrOpen] = useState(false)
  const openApplication = () => location.assign(application.url)
  const openFrontend = () => {
    if (application.frontend?.type === 'link' && application.frontend.url) window.open(application.frontend.url, '_blank', 'noopener,noreferrer')
    if (application.frontend?.type === 'app') setQrOpen(true)
  }
  const openFromCard = (event: MouseEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.target as Node)) return
    if ((event.target as HTMLElement).closest('button,a,input,textarea,select,[role="button"]')) return
    openApplication()
  }
  const openFromKeyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    openApplication()
  }
  const frontend = application.frontend?.type && application.frontend.type !== 'none' ? application.frontend : undefined
  return <><article {...order.getCardProps(app)} className={`compact-app compact-app-${app}${order.activeId === app ? ' is-reordering' : ''}`} role="link" tabIndex={0} onClick={openFromCard} onKeyDown={openFromKeyboard}><div className="compact-app-top"><ApplicationLogo app={app} size={72} />{['qing-time', 'qing-space', 'platform', 'shiyu'].includes(app) && <LogoManager app={app} position={position} description={description} />}</div><span className="compact-app-position">{position}</span><Typography.Title level={3}>{application.name}</Typography.Title><p className="compact-app-description">{description}</p><div className="compact-app-links"><Button className="compact-app-enter" type="text" onClick={openApplication}>{action}<span aria-hidden="true">↗</span></Button>{frontend && <Button className="compact-app-enter" type="text" onClick={openFrontend}>访问前台应用<span aria-hidden="true">↗</span></Button>}</div></article><Modal title={`${application.name} · 访问前台应用`} open={qrOpen} footer={null} onCancel={() => setQrOpen(false)} centered><div className="app-qr-dialog"><Typography.Paragraph type="secondary">使用手机扫描二维码，打开{application.name}。</Typography.Paragraph>{application.frontend?.qrCode ? <img src={application.frontend.qrCode} alt={`${application.name}前台应用二维码`} /> : <Typography.Text type="secondary">二维码尚未配置</Typography.Text>}</div></Modal></>
}
