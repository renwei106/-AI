import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'
import { getPlatformSession } from './platform-access-plugin'
const require = createRequire(import.meta.url)
const { createService } = require('./shiyu-i18n/service.cjs')
const root = resolve(fileURLToPath(new URL('.', import.meta.url)))
const service = createService({ root: process.env.SHIYU_FRONTEND_DIST || resolve(root, '../导航站/dist'), store: resolve(root, '.local/shiyu-i18n.json'), ts: require('typescript') })
export function shiyuI18nPlugin(): Plugin {
 return { name: 'shiyu-i18n', configureServer(server) { server.middlewares.use(async (req, res, next) => {
  const url = new URL(req.url || '/', 'http://localhost'), prefix = '/api/shiyu/i18n/'
  if (!url.pathname.startsWith(prefix)) return next()
  const route = url.pathname.slice(prefix.length)
  const send = (status: number, data: unknown) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(data)) }
  if (!(req.method === 'GET' && ['public', 'asset'].includes(route))) {
   const session = getPlatformSession(req)
   if (!session || (!session.superadmin && !session.applicationIds.includes('shiyu'))) return send(403, { message: '没有拾隅配置权限' })
   if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}` && req.headers.origin !== `https://${req.headers.host}`) return send(403, { message: '请求来源无效' })
  }
  try {
   if (route === 'asset') {
    const data = service.read(), locale = url.searchParams.get('locale'), file = url.searchParams.get('file')
    if (!data.settings.languages.some((l: { code: string; enabled: boolean }) => l.code === locale && l.enabled)) return send(404, { message: '该语言尚未启用' })
    const content = service.asset(locale, file, data)
    if (typeof content !== 'string') return send(404, { message: '语言资源尚未发布' })
    res.setHeader('Content-Type', file?.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(content); return
   }
   let raw = ''; for await (const chunk of req) { raw += chunk; if (raw.length > 200000) throw new Error('请求内容过大') }
   return send(200, await service.action(req.method, route, raw ? JSON.parse(raw) : {}))
  } catch (e) { return send(400, { message: e instanceof Error ? e.message : '操作失败' }) }
 }) } }
}
