import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'
import { getPlatformSession } from './platform-access-plugin'
import type { PlanAdminView, PlanCatalog, PlanSnapshot, ShiyuPlan } from './membership/types'
export type { ShiyuPlanEntitlement, ShiyuPlan } from './membership/types'
const require = createRequire(import.meta.url)
const plans = require('./membership/plan-store.cjs') as {
  getCatalog: () => PlanCatalog
  readPublishedPlans: () => ShiyuPlan[]
  readAdminPlans: () => PlanAdminView
  readHistory: () => PlanSnapshot[]
  mutate: (body: Record<string, unknown>, operator: string) => PlanAdminView
}
const fontResources = require('./membership/resources.json') as { fonts: Array<{ id: string; preview?: { file?: string } }> }
const frontRoot = resolve(fileURLToPath(new URL('../导航站/dist/', import.meta.url)))
const trustedWriteOrigins = new Set(['https://admin.shiyubox.com'])
function validWriteOrigin(request: IncomingMessage) {
  const origin = request.headers.origin
  if (!origin) return true
  if (trustedWriteOrigins.has(origin)) return true
  return origin === `http://${request.headers.host}` || origin === `https://${request.headers.host}`
}
function sendJson(response: ServerResponse, status: number, value: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.end(JSON.stringify(value))
}
async function readBody(request: IncomingMessage) {
  let body = ''
  for await (const chunk of request) {
    body += chunk
    if (body.length > 2_000_000) throw new Error('请求内容过大')
  }
  return JSON.parse(body || '{}') as Record<string, unknown>
}
export function shiyuPlanPlugin(): Plugin {
  return { name: 'shiyu-plan-config', configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      const pathname = (request.url || '').split('?')[0]
      if (pathname !== '/api/shiyu/plans' && !pathname.startsWith('/api/shiyu/plans/')) return next()
      try {
        if (request.method === 'GET' && pathname.startsWith('/api/shiyu/plans/font/')) {
          const id = pathname.slice('/api/shiyu/plans/font/'.length)
          const file = fontResources.fonts.find(font => font.id === id)?.preview?.file
          if (!file) return sendJson(response, 404, { message: '字体不存在' })
          const bytes = readFileSync(resolve(frontRoot, file))
          response.setHeader('Content-Type', 'font/woff2'); response.setHeader('Cache-Control', 'public, max-age=86400'); response.setHeader('X-Content-Type-Options', 'nosniff')
          response.end(bytes); return
        }
        if (request.method === 'GET' && pathname === '/api/shiyu/plans') return sendJson(response, 200, { schemaVersion: 2, items: plans.readPublishedPlans() })
        if (request.method === 'GET' && pathname === '/api/shiyu/plans/catalog') return sendJson(response, 200, plans.getCatalog())
        const session = getPlatformSession(request)
        if (!session) return sendJson(response, 401, { message: '登录状态已失效，请重新登录后操作' })
        if (!session.superadmin && !session.applicationIds.includes('shiyu')) return sendJson(response, 403, { message: '当前管理员没有拾隅配置权限' })
        if (request.method === 'GET' && pathname === '/api/shiyu/plans/history') return sendJson(response, 200, { items: plans.readHistory() })
        if (request.method === 'GET' && pathname === '/api/shiyu/plans/admin') return sendJson(response, 200, plans.readAdminPlans())
        if (pathname !== '/api/shiyu/plans/admin' || !['PUT', 'POST'].includes(request.method || '')) return sendJson(response, 405, { message: '请通过套餐管理保存并发布配置' })
        if (!validWriteOrigin(request)) return sendJson(response, 403, { message: '请求来源无效' })
        if (!request.headers['content-type']?.startsWith('application/json')) return sendJson(response, 415, { message: '需要 JSON 请求' })
        const body = await readBody(request)
        if (request.method === 'PUT') body.action = 'save-draft'
        return sendJson(response, 200, plans.mutate(body, session.admin.name || session.admin.account))
      } catch (error) {
        const status = typeof error === 'object' && error && 'status' in error ? Number(error.status) : 400
        return sendJson(response, status, { message: error instanceof Error ? error.message : '套餐配置操作失败' })
      }
    })
  } }
}
