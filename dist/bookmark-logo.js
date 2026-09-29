(function () {
  'use strict'
  const valid = value => typeof value === 'string' && (/^https?:\/\//i.test(value) || /^data:image\/(?:png|jpeg|webp);base64,/i.test(value) || value.startsWith('icon:') || /^assets\/site-icons\//i.test(value))
  const needs = item => !valid(item[3])
  const items = () => [...(data || []).flatMap(space => space.scenes.flatMap(scene => scene.groups.flatMap(group => group.items))), ...(prefs.extensionInbox || []).map(entry => entry.item)].filter(Array.isArray)
  const pending = new Map()
  async function resolve(item) {
    if (!needs(item)) return false
    let page
    try { page = new URL(item[1]); if (!['http:', 'https:'].includes(page.protocol)) return false } catch { return false }
    let task = pending.get(page.origin)
    if (!task) {
      task = fetch('/api/shiyu/favicon?url=' + encodeURIComponent(page.href), { cache: 'force-cache' }).then(response => response.ok ? response.json() : null).then(value => valid(value?.icon) ? value.icon : page.origin + '/favicon.ico').catch(() => page.origin + '/favicon.ico')
      pending.set(page.origin, task)
    }
    item[3] = await task
    return true
  }
  async function hydrate() {
    const missing = items().filter(needs)
    if (!missing.length) return
    let changed = false
    for (let index = 0; index < missing.length; index += 4) changed = (await Promise.all(missing.slice(index, index + 4).map(resolve))).some(Boolean) || changed
    if (!changed) return
    persist()
    if (!document.querySelector('dialog[open]')) render()
    document.querySelectorAll('#space-later-drawer .later-item').forEach(row => {
      const href = row.querySelector('a')?.href, item = missing.find(entry => entry[1] === href)
      if (item) row.querySelector('i').innerHTML = bookmarkMark(item)
    })
  }
  const schedule = () => setTimeout(hydrate, 0)
  addEventListener('shiyu-extension-change', schedule)
  addEventListener('shiyu-account-state', schedule)
  addEventListener('shiyu-session-ready', schedule)
  const saveBeforeLogos = savePending
  savePending = function () { saveBeforeLogos(); schedule() }
  if (document.readyState === 'complete') schedule()
  else addEventListener('load', schedule, { once: true })
  window.ShiyuBookmarkLogos = Object.freeze({ hydrate })
})()
