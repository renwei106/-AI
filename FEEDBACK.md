# 捎来回音：用户支持反馈

入口为首页头像下拉菜单中的「捎来回音」，位于「浏览器插件」前面。在当前页打开弹窗，沿用当前主题、字体和明暗模式。其他页面及登录流程保持原样。

## 当前实现

- 反馈类型必选，不预选；选择后显示对应字段。

| 类型 | 提交值 | 必填内容 | 其他字段 |
| --- | --- | --- | --- |
| 想要的功能 | `feature_request` | 期望功能描述 | 图片、联系方式选填，无分类 |
| 使用遇到的问题 | `usage_issue` | 问题分类、问题描述 | 图片、联系方式选填 |
| 感谢与鼓励 | `appreciation` | 想对我们说的话 | 只填写内容 |
| 使用心得 | `experience` | 使用心得 | 只填写内容 |

- 所有描述去掉首尾空白，最多 3000 个 UTF-16 字符。
- 问题分类由服务端配置提供，使用主题浮层菜单，支持选中标记、方向键/Home/End 导航、Enter 选择、Esc 收起和视口内定位。仅问题类依赖分类接口；其他类型在分类服务故障时仍能提交。
- 功能和问题类图片选填，点选、拖入和粘贴均支持；最多 5 张，每张最多 5 MiB；支持 PNG、JPEG、WebP、GIF。支持缩略图、放大预览和移除。浏览器校验可解码性与像素尺寸；服务端检查数量、字节数、Base64 编码和文件签名。
- 功能和问题类联系方式选填，接受联系电话或邮箱，填写后做格式校验。
- 关闭或按 Esc 保留本次页面内的草稿；切换类型保留各自草稿；页面刷新或账号切换清除草稿。隐藏字段不会随当前类型提交。内容与图片不写入浏览器持久存储。
- 只有服务端完成文件写入后才展示成功。反馈编号仍在服务端记录，前台不展示；底部仅保留「每一份回音，都会被认真收下。」。提交期间禁止重复操作；失败保留内容，未修改的重试复用同一提交标识。

## 数据接口

`GET /api/shiyu/feedback/categories` 返回 `{ items: [{ id, name }], limits }`。配置不可用时返回 503，前端展示重试入口。

`POST /api/shiyu/feedback` 接收 JSON：

```json
{
  "submissionId": "UUID v4，每次新反馈生成，未修改内容的重试复用",
  "type": "usage_issue",
  "categoryId": "collection",
  "description": "希望保存收藏后更清楚地看到保存位置。",
  "contact": "user@example.com",
  "images": [{ "name": "screen.png", "dataUrl": "data:image/png;base64,..." }],
  "identity": {
    "signedIn": true,
    "id": "用户 ID",
    "name": "用户姓名",
    "isMember": false,
    "membershipExpiresAt": null,
    "membershipSource": "none"
  },
  "context": { "page": "/", "theme": "base", "mode": "light", "viewport": "1440 × 900" }
}
```

首次成功返回 201；同一提交标识和内容的重试返回 200，反馈编号保持一致。相同标识改换内容或提交已经停用的分类返回 409。其余响应包含 `message`，字段错误返回 400，图片过大返回 413，存储不可用返回 503。

响应为 `{ receipt, createdAt, duplicate }`，不回传图片、联系方式或用户身份。未提供公开的反馈读取接口。

新表单使用上述四个类型。服务端保留旧 `suggestion` / `blocking_bug` 的载荷格式和历史名称，允许已有请求继续重试，不改写旧记录。新问题类型 `usage_issue` 强制分类非空且可用；功能类强制忽略分类，感谢和心得类还会忽略图片与联系方式，防止带入无关字段。

## 分类维护与记录保存

分类配置在 `config/feedback-categories.json`，每项包括 `id`、`name`、`enabled`。数组顺序即前台展示顺序；`enabled: false` 隐藏并禁止新的提交。修改后下次读取立即生效，不需要修改前端或重启。后台维护界面尚未增加。

反馈保存至服务端 `.local-feedback/<submissionId>.json`，已加入 Git 忽略。每条包含完整图片、描述、分类 ID 与提交时的分类名称、问题类型、联系方式、身份快照、来源页面/主题/明暗/视口、服务器读取的 User-Agent、服务器时间、反馈编号和 `status: new`。

写入先使用临时文件，完成同步后再重命名；失败不会返回成功。重复提交校验在服务端执行，并在服务重启后继续有效。适用于当前单 Node 预览进程。

可用环境变量配置：

- `SHIYU_FEEDBACK_DIR`：反馈保存目录，默认本仓库 `.local-feedback`。
- `SHIYU_FEEDBACK_CATEGORIES`：分类配置的绝对路径，默认本仓库 `config/feedback-categories.json`。

当前页面通过本仓库的 `preview.cjs` 保存，不会写入聚合管理后台的用户表，也未增加后台反馈列表。部署时需一起带上 `feedback-server.cjs`、分类配置和前端资源，并把保存目录指向持久化目录；本次未执行部署。

## 身份边界

当前已有登录接口是预览实现，没有正式用户会话。反馈记录的 `id`、`name`、`isMember` 来自当前前端身份，服务端强制记录 `source: client-profile` 和 `verified: false`，不能作为身份认证或会员授权依据。会员来源区分 `membership`、`demo` 和 `none`；未登录时记录访客、空用户 ID 和非会员。

后续接入正式认证时，应从认证会话及会员服务取得这些值，替换客户端身份来源，再标记为可信身份。此变更未改造现有登录、会员或个人资料交互。

## 验证

`node --check dist/feedback.js`、`node --check feedback-server.cjs`、`node --check preview.cjs`。

`node checks/feedback-20260917/verify-api.cjs` 使用独立测试目录，验证分类更新、字段与图片限制、身份来源、重复请求、文件持久化、重启后重试和配置故障。

`node checks/feedback-rules-20260917/verify-api.cjs` 验证四类型填写规则、必选分类、无关字段过滤、分类故障隔离和反馈编号保留。

`node checks/feedback-rules-20260917/verify-ui.cjs` 自动启动并关闭独立的 4321 测试预览，使用测试目录保存数据。验证四类表单切换、各类必填校验、独立草稿、主题分类菜单及键盘/窄屏定位、隐藏字段不提交、失败恢复、四类数据落盘、成功页和菜单顺序。同时与本轮基线比较首页布局。

`checks/feedback-20260917` 中原 UI 脚本和截图为首版记录；新版表单回归使用上述 `feedback-rules-20260917` 脚本。

修改前基线位于 `baselines/feedback-before-20260917`。截图位于 `checks/feedback-20260917`。

本轮修改前基线位于 `baselines/feedback-rules-before-20260917`，本轮截图位于 `checks/feedback-rules-20260917`。
