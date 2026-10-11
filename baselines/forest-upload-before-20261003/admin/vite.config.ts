import { shiyuPaymentPlugin } from './shiyu-payment-plugin'
import { shiyuAvatarPlugin } from './shiyu-avatar-plugin'
import { shiyuActivityPlugin } from './shiyu-activity-plugin'
import { createReadStream, statSync } from 'node:fs'
import { extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { platformAccessPlugin } from './platform-access-plugin'
import { experienceTestPlugin } from './experience-test-plugin'
import { platformLogoBridge } from './platform-logo-bridge'
import { shiyuThemePlugin } from './shiyu-theme-plugin'
import { shiyuPlanPlugin } from './shiyu-plan-plugin'
import { shiyuUserPlugin } from './shiyu-user-plugin'
import { shiyuInvitationPlugin } from './shiyu-invitation-plugin'
import { shiyuI18nPlugin } from './shiyu-i18n-plugin'
import { shiyuOperationsPlugin } from './shiyu-operations-plugin'
import { shiyuMusicPlugin } from './shiyu-music-plugin'
import { shiyuMemberVisualPlugin } from './shiyu-member-visual-plugin'
import { feedbackAdminPlugin } from './feedback-admin-plugin'
import { resourceMonitoringPlugin } from './resource-monitoring-plugin'
import { shiyuAnalyticsPlugin } from './shiyu-analytics-plugin'
import { shiyuBaiduIndexPlugin } from './shiyu-baidu-index-plugin'
import { shiyuReleaseHistoryPlugin } from './shiyu-release-history-plugin'

const currentDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)))
const appPreviewDirectory = process.env.QING_TIME_PREVIEW_DIR ? resolve(process.env.QING_TIME_PREVIEW_DIR) : resolve(currentDirectory, '.local/app-preview-not-configured')

function mimeType(path: string) {
  return ({ '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' } as Record<string, string>)[extname(path).toLowerCase()] || 'application/octet-stream'
}

function appPreviewPlugin(): Plugin {
  return { name: 'qing-time-preview', configureServer(server) { server.middlewares.use((request, response, next) => {
    const url = new URL(request.url || '/', `http://${request.headers.host || '127.0.0.1'}`)
    if (url.pathname === '/app-preview') { response.statusCode = 302; response.setHeader('location', '/app-preview/'); response.end(); return }
    if (!url.pathname.startsWith('/app-preview/')) return next()
    const relativePath = decodeURIComponent(url.pathname.slice('/app-preview/'.length) || 'index.html')
    const filePath = resolve(appPreviewDirectory, relativePath)
    if (!filePath.startsWith(`${appPreviewDirectory}${sep}`)) { response.statusCode = 403; response.end(); return }
    try {
      if (!statSync(filePath).isFile()) throw new Error('not a file')
      response.statusCode = 200
      response.setHeader('content-type', mimeType(filePath))
      response.setHeader('Cache-Control', 'no-store')
      createReadStream(filePath).pipe(response)
    } catch { next() }
  }) } }
}

export default defineConfig({
  cacheDir: resolve(currentDirectory, '.local/vite-cache'),
  plugins: [shiyuAvatarPlugin(), shiyuActivityPlugin(), shiyuAnalyticsPlugin(), shiyuBaiduIndexPlugin(), shiyuPaymentPlugin(), platformAccessPlugin(), resourceMonitoringPlugin(), feedbackAdminPlugin(), experienceTestPlugin(), platformLogoBridge(), shiyuThemePlugin(), shiyuPlanPlugin(), shiyuMemberVisualPlugin(), shiyuUserPlugin(), shiyuInvitationPlugin(), shiyuReleaseHistoryPlugin(), shiyuOperationsPlugin(), shiyuI18nPlugin(), shiyuMusicPlugin(), appPreviewPlugin(), react()],
  server: {
    host: '127.0.0.1',
    port: 5175,
    strictPort: true,
    watch: { ignored: ['**/.local/**'] },
    proxy: {
      '/api/configs': 'http://127.0.0.1:5176',
      '/api/mock': 'http://127.0.0.1:5176',
      '/api/category-templates': 'http://127.0.0.1:5176',
      '/api/dev-users': 'http://127.0.0.1:5176',
    },
  },
})
