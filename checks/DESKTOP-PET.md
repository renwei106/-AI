# 全局桌面宠物

## 范围与基线

- 导航站基线：`4dc9aee81ccaf4a70a3b6be60e42bbdc3f06fdc5`。
- 工具集基线：`bf950d6`，在对应仓库单独保留修改。
- 原「我的一隅」、各主题页面、账号页面和应用内操作入口继续保留。
- 当前改动仅在本地，未修改线上配置、数据或发布资源。

## 文件与接入

- `dist/desktop-pet.js`：三款 SVG 造型、动作、菜单布局、拖拽、位置与设置保存。`ShiyuDesktopPet.mount(adapter)` 只创建一个实例。
- `dist/desktop-pet.css`：宠物独立样式，使用项目 `--accent` 及语义派生色。
- `dist/desktop-pet-host.js`：拾隅的页面、子应用、个性化设置、登录校验适配。
- 工具集的同名 `desktop-pet-host.js`：连接现有轻应用路由、登录会话和离开编辑页确认；共享核心文件与导航站完全一致。
- 修改宠物造型或核心逻辑后运行 `node checks/sync-desktop-pet.cjs --write` 同步两个本地前端。两个 host 文件各自维护，不能相互覆盖。

适配接口：`apps()` 返回可用入口的 id、label 和 icon；`context()` 返回当前位置；`authorize()` 在受保护操作前校验当前产品会话；`navigate()` 调用既有跳转；`host()` 与 `blocked()` 管理内容层及编辑弹窗；`openSettings()` 打开全局宠物设置。

站内切页保持同一个 DOM 实例。整页或跨应用跳转会在目标文档挂载组件并恢复设置；不会创建浏览器或操作系统之外的全局悬浮窗口。

## 位置与登录

- `shiyu-desktop-pet-v1` 独立保存于本机，与主题、空间和业务数据分离。
- `shiyu_pet_v1` 仅包含位置、造型、大小、动作强度、启用状态和校验过的首页来源地址；没有用户身份、会话、收藏内容或认证凭据。
- 正式域名在 `shiyubox.com` 自有子域间共享这些外观设置；本地同主机不同端口通过 cookie 同步。在不同顶级域名、不同设备或禁止本机存储时，不承诺同一坐标同步。
- 窗口尺寸变化临时按相对位置适配并防止越界，拖动松手或主动重置时才改写保存位置。
- 四角菜单向页面内部展开为约 90° 扇形；贴边时略微收拢端点，按按钮实际尺寸调整半径，避开其他入口、宠物和设置按钮。仅在视口确实无法容纳时使用原有紧凑布局。
- 宠物展示和拖动公开可用。拾隅空间、世界、应用与宠物设置使用 `ShiyuAccountSession.verify()` 重新检查服务端会话，不能只凭本地 `signed` 放行。
- 会话明确过期时进入原登录窗口；服务异常时停止受保护跳转。世界准入、模块启用和主题体验限制继续有效。
- 轻应用校验其自身 `/api/auth/session`；跨产品跳转由目标产品再次检查会话，不传递或复制登录凭据。
- 登录、确认和编辑弹窗期间宠物暂停操作；图谱和全屏应用内容页中保留可用。

## 验证

在本地预览启动后：

```powershell
$env:SHIYU_PREVIEW_URL='http://127.0.0.1:4341/'
node checks/verify-desktop-pet.cjs
node checks/verify-desktop-pet-corners.cjs
node checks/verify-desktop-pet-integration.cjs
node checks/sync-desktop-pet.cjs
```

测试 API 均由内存 fixture 截获，不写真实账号或后台数据。截图放在 `.local/desktop-pet/`。

覆盖：拖动时只移动宠物、刷新与换主题的位置保持、四边四角展开、菜单完整入口、键盘和触屏尺寸、三款造型、关闭再开启、空间/世界/应用互跳、图谱层、独立轻应用位置延续、原有离开确认、访客/会话过期/会话服务异常拦截，以及同主题、同视口的旧页面截图对照。

角落回归额外覆盖正常动效下的三种大小 × 四个拖动极限位置，检查扇形角度、按钮完整显示、互不重叠和实际点击命中，验证端点悬停路径、角落跳转、刷新恢复及窄屏动效。已复现并修复小号宠物在右下极限位置误用方形布局的问题；修复前文件保存在 `.local/desktop-pet/corner-baseline-20260928-092005/`，同页面、主题和视口的截图位于 `.local/desktop-pet/corner-before-small-upper-left.png` 与 `corner-after-small-upper-left.png`。

旧 `tests/account-session-ui.cjs` 当前仍查找 `[data-account-tab="password"]`，与现有邮箱登录界面不符，不能把该脚本未跑完称为通过；本次没有为了测试改动登录界面。

## 发布前

导航站新增静态资源与预览路由，工具集新增静态资源与一次挂载调用；会话与业务 API 地址不变。两个前端独立打包，需一起核对共享核心版本、域名、cookie 范围、实际应用地址与登录/回跳行为。本地通过不代表生产验证完成，上线仍需单独说明具体影响并取得确认。
