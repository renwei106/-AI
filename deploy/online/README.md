# 拾隅线上发布

发布按实际改动模块确定，遵循项目 `AGENTS.md` 的版本确认、上线记录、永久备份与生产稳定性规则。网站静态资源、便捷工具页面或浏览器插件的改动，使用 `release-front-only.sh`，只重启网站服务 `shiyu-preview`。

管理后台、工具站、其他应用、共享配置、支付与登录回调须先核对影响；未受本次改动影响的服务不重启。发布内容及版本号需取得用户明确文字确认，已有本次授权不重复询问。

## 网站与插件发布

1. 只读核对线上当前版本链接、正式插件版本、后台上线历史与关键服务状态。版本以前述真实状态为基线，按用户确认递增；不得回改历史、重用已经记录的版本或以试用插件版本替代正式版本。
2. 检查本次全部改动，完成受影响页面与交互回归、插件构建及登录态/快捷键验证，提交代码并核对 Git 远端。生产包仅连接正式域名；本地、测试接口与账号不得混入生产。
3. 从最终 Git 提交生成完整源码归档，而非仅保存增量文件或固定路径白名单。将完整归档、正式插件安装包与 CRX、本次增量包、SHA256 清单、发布记录和部署脚本永久保存到 `D:\拾隅发布永久备份\版本号-发布时间`。清单记录版本、完整 commit、文件大小与 SHA256；逐文件核对复制前后校验值，任何备份或校验失败均停止发布。永久备份不自动删除。
   Windows 上使用 `git -c core.autocrlf=false archive`，让包内文本保持 Git 提交的实际字节。上传前将增量包解压到隔离目录，逐文件比对包内 SHA256 与提交清单；不得仅校验工作目录，或把换行转换导致的不一致当作可忽略错误。
4. 发布前检查可用内存、swap、CPU/系统负载、磁盘空间与 inode、SSH 响应、当前链接，以及 Nginx 和各相关服务是否 active。资源不足、服务异常或 SSH 明显迟缓时停止发布，先恢复运行状态。`release-front-only.sh` 会在准备新版本前再次执行资源与服务检查，并持有部署锁。
5. 准备并上传以下文件，其中 `<id>` 是同一个 14 位 UTC 发布时间标识：

   - `/tmp/shiyu-front-delta-<id>.tgz`：本次受影响的生产文件；
   - `/tmp/shiyu-front-<id>.sha256`：文件路径相对于新 release 根目录，覆盖所有增量文件和新插件包；
   - `/tmp/shiyu-release-<id>.json`：已确认的网站记录，可包含独立的 `extensionRecord`；
   - `/tmp/release-front-only.sh` 与 `/tmp/release-state.mjs`。

6. 脚本从线上当前版本复制完整基线，再解压增量、核对 SHA256 和代码语法、验证网站及插件版本。新版本完全准备后，`release-state.mjs prepare` 先备份生产配置、账号 JSON 与支付数据库，再向拾隅 PC 管理后台“配置中心 → 上线记录”追加本次记录。网站和插件分别记录时间、版本、性质与概要；仅网站改动时只追加网站记录。历史只允许追加，不用本地种子覆盖，发布失败也不删除既有记录。
7. 原子切换网站 current 链接，只重启 `shiyu-preview`。必须按下面的限时命令执行，保留独立回滚预算：

```bash
timeout --signal=TERM --kill-after=100s 240s bash /tmp/release-front-only.sh '<id>'
```

发布总超时为 240 秒；服务重启限时 35 秒、单次健康检查限时 20 秒。切换后的失败或超时会停止后续发布，在独立 90 秒预算内恢复上一个版本、重启网站服务，验证本机端口和外部 HTTPS，并输出 `ROLLBACK_VERIFIED`；回滚失败或超时会明确报错。外层 `--kill-after=100s` 给回滚留出时间，不能缩短到会截断回滚的数值。

发布成功必须同时满足：Nginx 与相关服务为 active、本机网站与外部 HTTPS 页面可访问、官网/空间/世界/插件/快捷启动入口检查通过、版本与记录一致、`RELEASE_COMMIT` 与发布 commit 一致、文件 SHA256 及生产配置保护检查通过。上传、解压、构建或重启命令结束均不等于发布成功。

### 发布记录格式

网站记录使用后台字段 `id`、`target: website`、`version`、`releasedAt`、`changeType`、`summary`、`createdAt`、`operator`，并附 `previousVersion` 与 40 位小写 Git SHA `commit`。版本格式为 `V主版本.次版本.补丁版本`；未明确指定前两位时，只递增补丁版本 1。

插件涉及改动时，在同一 JSON 的 `extensionRecord` 中使用对应字段及 `target: extension`。网站、插件的版本分别校验，正式插件的 manifest、`release.json`、展示文案、下载链接和包内内容须一致。只重新发布网页时，不更改无改动的插件版本。Firefox 未签名包保持私有，不能作为正式可安装包公开。

`release-state.mjs` 保留生产数据与配置，不修改 Nginx、证书或支付回调。本流程不设置 `initializeEnglish`；语言初始化是另行评估与确认的发布事项。

## 验证后的历史清理

清理与切换分开执行，仅在网站发布并验证成功后使用 `retain-front-releases.mjs`：先限时 dry-run，检查输出的候删目录与引用阻塞，再执行 `--apply`。只保留当前及上一个网站版本；不得删除永久本地备份、上线历史或业务备份。

清理脚本扫描 `/opt` 和 `/etc/systemd/system` 的软链接与服务定义引用。清理前还须核对实际服务 `WorkingDirectory`、`ExecStart`、进程 cwd、其他 systemd 配置位置与环境/脚本中的路径，防止遗漏已解析的历史目录引用。

发现共享账号数据、配置、密钥或依赖仍位于候删版本时，保留该目录，先迁移到稳定 shared 路径、保留权限与内容并校验相关服务，再重新检查。不得强删或跳过引用保护；清理失败不会回滚已经健康的网站，需明确记录清理暂缓原因。

## 配套环境隔离发布

`release-environment.sh` 与 `release-environment.cjs` 用于**网站账户代理、后台来源校验及工具生产小补丁确实同时受影响**的一次配套发布。它不替代单模块流程，不构建、安装依赖、迁移业务配置、发布插件或调整隧道。输入是独立、经过审阅并绑定 SHA256 的计划；ID、旧版本路径、目标路径、commit、版本、两个上线记录和三个增量清单均由计划明确给出。

先在本地以 `node --test deploy/online/release-environment.test.cjs deploy/online/release-environment-vm.test.cjs` 验证计划边界、顺序和失败恢复，VM 测试执行真实引擎对完整虚拟 Linux 主机的成功和失败恢复，不连接任何服务。计划参考 `environment-release-plan.example.json`。将审核后的计划、脚本、三个只含普通文件的增量包及逐文件 SHA256 清单上传至 `/opt/shiyu/backups/environment-isolation-<id>/`，由具有生产操作授权的发布人员依次运行：

```bash
bash /opt/shiyu/backups/environment-isolation-<id>/release-environment.sh preflight /opt/shiyu/backups/environment-isolation-<id>/plan.json <plan-sha256>
# 将输出 baselineSha256 写入已审阅计划，再重新计算 plan SHA。
bash /opt/shiyu/backups/environment-isolation-<id>/release-environment.sh prepare /opt/shiyu/backups/environment-isolation-<id>/plan.json <new-plan-sha256>
# 将三个完整代码/运行包及依赖永久备份、核对 SHA，然后补齐 preparedSha256、
# permanentBackupVerified、permanentRuntimeDependenciesVerified、permanentBackupPackages。
bash /opt/shiyu/backups/environment-isolation-<id>/release-environment.sh publish /opt/shiyu/backups/environment-isolation-<id>/plan.json <final-plan-sha256>
```

`preflight` 只读线上运行资源、状态、版本、链接、配置指纹与公开健康接口，仅在服务器私有证据目录写入快照；不会切换或重启服务。要求可用内存至少 768 MiB、负载低于 4、磁盘剩余超过 2 GiB、inode 使用低于 90%。网站、后台、工具与 Nginx 必须正常；已暂停的轻时间和轻间必须继续 inactive/disabled。记录当前 PID、unit SHA、Nginx SHA 和配置指纹，后续发现漂移即停止。

`prepare` 从线上各自当前完整版本复制到新目录，再施加审核增量。后台 dist 仅在确认其为准备目录中的真实子目录后替换；`.local`、mocks、依赖及共享链接保留。工具包严格限制为 `dist/library-source.js` 与 `server/generation-server.mjs`，同时核对线上修改前字节指纹。后台使用准备后的后台和网站目录运行正式 `verify-release-gate.mjs`，禁止 candidate/dirty/server-only 包。包内必须包含 manifest、fixture 证明、环境契约、四份捕获 schema、动态 CJS 附件和门禁脚本；网站须包含被证明绑定的代理及 `dist/environment-policy-data.js`。

准备阶段生成完整代码/运行包及 SHA；包不下载真实 `.local`、反馈数据、mocks、`.env`、密钥或 creator 数据。保留的共享依赖链接、私有配置路径和恢复约束进入证据；共享依赖实际内容也必须有永久归档，不能仅备份一个指向服务器的链接。真实账号/业务 JSON 与支付 SQLite 的受保护快照只留服务器，数据库使用 SQLite 在线备份接口并检查完整性。发布和回滚都不会自动用旧业务数据覆盖新的用户写入。

`publish` 在任何版本切换之前，限时短停唯一后台历史写入进程，**一次原子追加网站、后台两条已确认记录**，并在 finally 恢复旧后台及验证健康。随后严格按“网站 → 后台 → 工具”切换，每次仅重启当前服务并验证本机端口、外部 HTTPS、进程 cwd、文件字节、版本及记录后才进入下一步。新网站保留 Origin，兼容旧后台；后台加强校验时新网站已就绪。网站和后台使用最小独立 drop-in 明确 `SHIYU_ENV=production` 与 `NODE_ENV=production`，且核对运行进程实际身份。工具不伪造独立数字版本，以本次网站版本的工具模块补丁记录。

工作阶段总预算 660 秒，单服务重启不超过 45 秒，单 HTTP 请求不超过 8 秒，shell 在 720 秒触发 TERM，另留 240 秒 kill-after 保护恢复。失败立即停止后续服务，以独立 210 秒预算按“工具 → 后台 → 网站”的已触及范围逆序恢复，避免旧网站丢失 Origin 与新后台混搭。只恢复本次拥有的版本指针和环境 drop-in；第三方修改不会被覆盖，历史不会删除。回滚仍必须通过 active、本机、外部及 cwd 验证；失败留私有 failure.json，不能宣称上线成功。

发布脚本不删除历史目录。成功证据列出每个模块的当前、上个版本与更早候选；随后按项目要求单独检查永久归档、共享数据/依赖引用和其他服务 cwd/ExecStart，再清理无引用历史。被引用目录继续保留，不将清理失败变成健康发布的回滚理由。工具 AI 服务现有依赖状态必须另行说明；工具首页 HTTP 200 不能证明模型生成正常。

## 三端历史流程

旧 `publish.ps1` 与 `release.sh` 已无绕过地退役：入口在读取发布记录、解析仓库、构建、上传、切换版本或操作服务之前直接拒绝。当前文件只保留退役提示与退出；旧实现可查 Git 历史，不能再直接执行，也没有环境变量恢复开关。

后台发布必须使用 `build:production` 产生的完整 bundle 和 `production-verification.json`，执行不带 `--candidate` 的 `verify-release-gate.mjs`。门禁同时绑定后台运行时、动态 CJS 附件、配套网站账户代理及生成环境数据文件的 SHA、两仓 commit 和源码是否已提交。涉及网站代理时必须同时准备并验收配套网站包；网站和后台启动环境显式为 `SHIYU_ENV=production`、`NODE_ENV=production`。不得仅替换后台而漏掉仍会丢失 Origin 的旧网站代理，也不得用只有后台直连的测试替代真实网站代理链验证。

仅网站发布仍按本文件的目标模块流程执行，先核对实际改动与共享接口依赖；本次账户代理与后台来源检查属于配套改动，应一起列入发布清单。任何发布仍需独立的版本确认、上线记录、永久备份、限时逐服务健康验证与回滚保护。

`publish.ps1`、`release.sh` 和 `retain-releases.mjs` 是原三端发布流程，不再作为默认发布入口。原实现会同步切换并同时重启网站、管理后台和工具站，缺少当前规则要求的完整超时与逐服务恢复保护，不能直接沿用。

只有三端实际都涉及本次改动、共享服务/配置/接口/回调与环境差异已经逐项评估、用户已批准对应范围与版本时，才可参考原流程；执行前必须补齐资源预检、逐服务重启与验证、总超时和受验证的回滚。不能因一个网站或插件改动调用原脚本重启三端。

正式首页：`https://shiyubox.com/`。后台：`https://admin.shiyubox.com/`。工具站：`https://tool.shiyubox.com/`。
