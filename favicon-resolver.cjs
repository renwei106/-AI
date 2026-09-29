const dns = require('node:dns').promises
const net = require('node:net')

const cache = new Map()
const json = (res, status, value) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, max-age=3600', 'X-Content-Type-Options': 'nosniff' }); res.end(JSON.stringify(value)) }
const privateIPv4 = value => { const p = value.split('.').map(Number); return p[0] === 10 || p[0] === 127 || p[0] === 0 || p[0] === 169 && p[1] === 254 || p[0] === 172 && p[1] >= 16 && p[1] <= 31 || p[0] === 192 && p[1] === 168 }
const privateAddress = value => net.isIPv4(value) ? privateIPv4(value) : net.isIPv6(value) && (/^(::1|fc|fd|fe8|fe9|fea|feb)/i.test(value) || value.startsWith('::ffff:') && privateIPv4(value.slice(7)))

async function publicURL(raw) {
  const url = new URL(raw)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port && !['80', '443'].includes(url.port)) throw new Error('网址无效')
  const addresses = await dns.lookup(url.hostname, { all: true })
  if (!addresses.length || addresses.some(item => privateAddress(item.address))) throw new Error('网址不可访问')
  return url
}

function iconFromHTML(html, pageURL) {
  const tags = String(html).match(/<link\b[^>]*>/gi) || []
  for (const tag of tags) {
    const rel = tag.match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1] || ''
    if (!/(^|\s)(icon|apple-touch-icon|apple-touch-icon-precomposed)(\s|$)/i.test(rel)) continue
    const href = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]
    if (!href) continue
    try { const icon = new URL(href, pageURL); if (['http:', 'https:'].includes(icon.protocol)) return icon.href } catch {}
  }
  return new URL('/favicon.ico', pageURL).href
}

async function resolveFavicon(raw) {
  let page = await publicURL(raw)
  const key = page.origin
  if (cache.has(key)) return cache.get(key)
  for (let redirects = 0; redirects < 4; redirects++) {
    const response = await fetch(page, { redirect: 'manual', headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'Shiyu-Favicon-Resolver/1.0' }, signal: AbortSignal.timeout(5000) })
    if ([301, 302, 303, 307, 308].includes(response.status)) { page = await publicURL(new URL(response.headers.get('location') || '', page).href); continue }
    const length = Number(response.headers.get('content-length') || 0)
    if (!response.ok || length > 1_000_000) break
    const html = (await response.text()).slice(0, 1_000_000), icon = iconFromHTML(html, page.href)
    cache.set(key, icon); return icon
  }
  const fallback = new URL('/favicon.ico', page).href
  cache.set(key, fallback); return fallback
}

async function handler(req, res) {
  const request = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`)
  if (request.pathname !== '/api/shiyu/favicon') return false
  if (req.method !== 'GET') { json(res, 405, { message: '只支持读取' }); return true }
  try { json(res, 200, { icon: await resolveFavicon(request.searchParams.get('url') || '') }) }
  catch { json(res, 400, { message: '暂时无法识别该网址的 Logo' }) }
  return true
}

module.exports = { handler, iconFromHTML, privateAddress }
