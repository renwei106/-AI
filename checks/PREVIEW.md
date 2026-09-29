# 本地统一预览

日常验收统一使用 http://127.0.0.1:4337/ ，启动：

```powershell
node checks/preview-unified.cjs
```

首页半圆菜单、搜索引擎联动和纸张小记都来自仓库同一份 `dist`。本地预览依赖 `127.0.0.1:5175` 的现有服务，只在返回的预览配置里启用常用、小记、待办，不写入运营配置、不发布线上。

旧的小记启动命令 `node checks/preview-memo-paper.cjs` 仍提供 4330，使用相同代码和预览配置。保留旧端口是为了保留该来源的浏览器数据；不同端口的主题偏好和本地小记不能视为同一份存储，不自动覆盖或搬迁。后续验收请固定使用 4337。

不要再运行 `.local/home-semicircle-20260926/review-server.cjs` 的旧代理。4337 现在直接读取本仓库文件，不依赖 4336 中转。普通 `preview.cjs` 保持运营配置原有的模块开关。

## 手机与平板同网验证

先保持上述 4337 预览运行，再启动局域网转发：

```powershell
node checks/preview-home-responsive-lan.cjs
```

手机、平板与电脑连接同一个局域网，访问 `http://电脑的局域网IP:4344/`。该服务直接转发 4337 的同一套页面与本地后台接口，不生成手机版副本，也不发布线上。

电脑需保持开机；网络或 Windows 防火墙需要允许同网设备访问该端口。局域网 IP 会随网络变化。不同 IP/端口的本机偏好与登录 Cookie 独立，不自动迁移旧端口的数据；登录仍使用现有账号服务。

首页适配回归：`node checks/verify-home-responsive.cjs`。截图检查：`node checks/inspect-home-responsive.cjs after`。自动检查使用拦截的本地测试数据，不发送真实验证码或修改用户账号。
