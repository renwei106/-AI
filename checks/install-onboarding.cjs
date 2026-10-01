// One-time, exact replacements with a separately preserved pre-change baseline.
const fs=require('node:fs');
function edit(file,changes){let text=fs.readFileSync(file,'utf8');for(const [before,after]of changes){if(!text.includes(before))throw Error(file+' missing '+before.slice(0,100));text=text.replace(before,after);}fs.writeFileSync(file,text);}
edit('dist/index.html', [['<script src="account-surfaces.js" defer></script>','<script src="account-surfaces.js" defer></script><link rel="stylesheet" href="onboarding.css"><script src="onboarding.js"></script>']]);
edit('preview.cjs', [["const routes={","const routes={\n  '/onboarding.js':'onboarding.js','/onboarding.css':'onboarding.css',"]]);
edit('dist/feature-config.js', [
  ['const incoming={access:next.access||{},','const incoming={onboarding:next.onboarding||{enabled:false},world:next.world||{},access:next.access||{},'],
  ['{allowed:access,category,option,label,','{onboarding:()=>config?.onboarding,worldAvailable:()=>config?.world?.enabled===true&&config?.world?.eligible!==false&&access(\'world\'),allowed:access,category,option,label,']
]);
edit('dist/v4.js', [
  ['const done=()=>prefs.workspaceGuideDoneV1===true;','const done=()=>window.ShiyuOnboarding?.ownsWorkspace()||prefs.workspaceGuideDoneV1===true;'],
  ['if (!pending || !requiresGuide || !accountId()) return;','if (window.ShiyuOnboarding?.ownsWorkspace() || !pending || !requiresGuide || !accountId()) return;'],
  ["if (requiresGuide && (!prefs.workspaceGuideDoneV1 || prefs.welcomeGiftGuideDoneFor !== guideKey())) return;","if (window.ShiyuOnboarding ? !window.ShiyuOnboarding.giftMayShow() : requiresGuide && (!prefs.workspaceGuideDoneV1 || prefs.welcomeGiftGuideDoneFor !== guideKey())) return;"],
  ["document.body.classList.contains('workspace-guide-active') || document.querySelector('dialog[open]')","document.body.classList.contains('workspace-guide-active') || document.body.classList.contains('sy-tour-active') || document.querySelector('dialog[open]')"]
]);
const admin='../聚合管理后台/';
edit(admin+'shiyu-user-plugin.ts', [
  ["import { createRequire } from 'node:module'","import { initialOnboarding, updateOnboarding, type OnboardingState } from './shiyu-onboarding'\nimport { createRequire } from 'node:module'"],
  ['  cornerUiHints?: { closeGuideAcknowledgedAt?: string }','  onboarding?: OnboardingState\n  cornerUiHints?: { closeGuideAcknowledgedAt?: string }'],
  ["        if (url.pathname === '/api/shiyu/auth/corner-guide') {",`        if (url.pathname === '/api/shiyu/auth/onboarding') {
          const user = sessionUser(request)
          if (!user) return sendJson(response, 401, { message: '请先登录' })
          if (request.method === 'GET') return sendJson(response, 200, { userId: user.id, onboarding: user.onboarding || initialOnboarding() })
          if (request.method !== 'POST') return sendJson(response, 405, { message: '不支持该操作' })
          try {
            const body = await readBody(request)
            if (body.userId !== user.id) return sendJson(response, 409, { code: 'ACCOUNT_SESSION_MISMATCH', message: '登录账号已切换，请刷新后重试' })
            const users = readUsers(), current = users.find(item => item.id === user.id)
            if (!current) return sendJson(response, 401, { message: '登录状态已失效' })
            try { current.onboarding = updateOnboarding(current.onboarding || initialOnboarding(), body) }
            catch (error) { return sendJson(response, 409, { userId: current.id, onboarding: current.onboarding || initialOnboarding(), message: error instanceof Error ? error.message : '引导状态无效' }) }
            writeUsers(users)
            return sendJson(response, 200, { userId: current.id, onboarding: current.onboarding })
          } catch { return sendJson(response, 400, { message: '引导状态保存失败' }) }
        }

        if (url.pathname === '/api/shiyu/auth/corner-guide') {`]
]);
// Only newly created accounts receive the pending welcome marker (all three signup paths).
{const file=admin+'shiyu-user-plugin.ts';let text=fs.readFileSync(file,'utf8');const needle="welcomeGift: { version: catalog.version, grantedAt: createdAt } }";if(text.split(needle).length!==4)throw Error('expected 3 registration paths');text=text.split(needle).join("welcomeGift: { version: catalog.version, grantedAt: createdAt }, onboarding: initialOnboarding(true) }");fs.writeFileSync(file,text);}
edit(admin+'shiyu-operations-plugin.ts', [
  ["import type { IncomingMessage, ServerResponse } from 'node:http'","import { normalizeOnboardingConfig } from './shiyu-onboarding'\nimport type { IncomingMessage, ServerResponse } from 'node:http'"],
  ['const fallback = { platformTheme:', 'const fallback = { onboarding: normalizeOnboardingConfig(null), platformTheme:'],
  ['return { platformTheme: normalizePlatformTheme(value.platformTheme,','return { onboarding: normalizeOnboardingConfig(value.onboarding), platformTheme: normalizePlatformTheme(value.platformTheme,'],
  ['sendJson(response,200,{platformTheme:current.platformTheme,','sendJson(response,200,{onboarding:current.onboarding,platformTheme:current.platformTheme,'],
  ['as { platformTheme?: unknown;', 'as { onboarding?: unknown; platformTheme?: unknown;'],
  ['const platformTheme = body.platformTheme',`const onboarding = body.onboarding === undefined ? current.onboarding : normalizeOnboardingConfig(body.onboarding)
          if (body.onboarding !== undefined && (!body.onboarding || typeof body.onboarding !== 'object' || Array.isArray(body.onboarding) || Object.entries(body.onboarding).some(([key, value]) => !['enabled','welcome','home','space'].includes(key) || typeof value !== 'boolean'))) throw new Error('新手引导配置无效')
          const platformTheme = body.platformTheme`],
  ['JSON.stringify({ platformTheme, membershipColor,','JSON.stringify({ onboarding, platformTheme, membershipColor,'],
  ['sendJson(response, 200, { platformTheme, platformThemeTokens:','sendJson(response, 200, { onboarding, platformTheme, platformThemeTokens:']
]);
edit(admin+'src/ShiyuOperations.tsx', [
  ["import { ShiyuNotices } from './ShiyuNotices'","import { ShiyuOnboardingConfig } from './ShiyuOnboardingConfig'\nimport { ShiyuNotices } from './ShiyuNotices'"],
  ['  {!authSection && <>','  {!authSection && <>\n   <ShiyuOnboardingConfig />']
]);
console.log('Installed onboarding frontend, configuration and account state hooks.');
