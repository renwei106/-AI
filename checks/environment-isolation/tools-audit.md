# 工具站环境审计与独立依赖发现

先只读检查同级“工具集”源码，再依据根任务捕获的真实生产文件准备独立候选。未改动外仓、未调用模型、未修改线上配置。

## 跨环境修补建议

`tools-production-environment-isolation.patch` 是基于真实生产字节的最小补丁，尚未应用到工具仓库或生产；已删除被它替代的本地版本补丁，避免误用：

- `dist/library-source.js:23-30,110-123`：正式同源图标库失败或为空时，会继续尝试浏览器电脑 `http://127.0.0.1:5175`。补丁只让正式页面尝试同源 API；本地预览仍可尝试原有本机 5175。
- `server/generation-server.mjs:64-70`：开发登录拼接路由及其开发代理前缀仅在显式 local 模式、公开地址也是 loopback 时可用。正式页面 `dist/login.js:2` 原本就使用正式首页，不需要这些开发路由。
- 正式工具主题、运营配置通过自身同源 API 转发（`dist/palette-platform-theme.js:11`、服务 `:58-62`）。后台允许来源中 tool/tools 单复数不一致，没有证据会阻断当前这条同源代理链。

根任务线上只读盘点提供：当前工具 release `/opt/shiyu-tools/releases/20261007150631`。基线完整 SHA256、候选 SHA256、字节数及补丁校验值记录在 `tools-production-candidate-sha256.json`。实际应用前须再次核对线上基线，不能用同级本地工具文件整体覆盖生产文件。

私有候选仅从 `.local/checks/environment-isolation-20261013/tools-production-baseline` 的两份原文件精确替换生成，位于同级 `tools-production-candidate`，没有复制本地工具新功能。`prepare-tools-production-candidate.cjs` 校验生产基线 SHA 后生成补丁；候选不同于既有结果时拒绝覆盖。

`verify-tools-production-candidate.cjs` 的 11 组 fixture 已通过，实际网络请求为 0，未运行服务入口或初始化模型、账户和任务存储。验证包括：原生产图标库真正接受本机假 API 响应的负面复现；候选失败/空库仅尝试同源，成功内容不变，本地仍可使用原 5175；原生产开发登录路由输出 localhost base 的负面复现；候选生产开发路由 404、开发可用、正常生产账号代理保持原行为；专用补丁应用到原字节后完全复现候选 SHA。

## 停用轻间后台影响 AI 创作

根任务线上盘点的 effective `MODEL_ADMIN_URL` 为服务器内部 `http://127.0.0.1:5177`，轻间服务已停止。此变量是活依赖，不是无用配置：

- `generation-server.mjs:28,32`：`permitted()` 每次从 model-management/access-policy 读取白名单；5 秒超时，无缓存；失败返回 false。
- `:97-103`：创作在权限检查返回 false 时改用 `libraryGeneration`，返回 `mode: library`，不会调用 AI。HTTP 200 并不能证明 AI 链路正常。
- `:103`：真正 AI 创作仍须从同一后台读取 runtime 配置；`:46` 每批调用前重新核验白名单。
- 图库、配色、账号代理等不依赖这个 MODEL_ADMIN_URL；不能据此宣称整个工具站不可用，也不能宣称所有工具不受停用影响。

这部分不在上述环境补丁中静默处理。后续需单独评估，把必要只读 model runtime/access-policy 能力放到仍在线的受控服务，保留当前模型标识、密钥存储、流程、提示词、白名单、鉴权与数据，添加调用健康检查；确认影响后再迁移。不能通过指向其他环境、开放白名单、把网络失败当成无权限，或未经授权恢复整套已停用后台来掩盖依赖缺失。
