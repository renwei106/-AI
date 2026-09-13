# shiyubox.com 域名与服务器规划

更新时间：2026-09-14  
主域名：`shiyubox.com`  
当前服务器公网 IP：`39.106.4.85`  
服务器系统：Ubuntu 24.04  
服务器规格：2 vCPU / 2 GiB / 40 GiB ESSD

## 1. 总体思路

`shiyubox.com` 建议作为拾隅体系的统一主入口。主站负责品牌首页、产品入口、登录入口和下载/介绍，具体应用和后台放到子域名。

建议结构是：

- 主域名：给用户看的统一入口。
- 应用子域名：给各个前台产品。
- 后台子域名：给 PC 管理后台和业务管理后台。
- API 子域名：后续统一接口、登录、会员、支付、分享等服务。
- 静态资源子域名：后续放图片、图标、上传封面、分享快照等。

## 2. 推荐子域名

第一批建议先创建这些：

| 域名 | 用途 | 当前建议指向 |
| --- | --- | --- |
| `shiyubox.com` | 拾隅总入口 / 品牌首页 | `39.106.4.85` |
| `www.shiyubox.com` | 主站别名 | `39.106.4.85`，后续 301 到主域名 |
| `app.shiyubox.com` | 拾隅用户端主应用 | `39.106.4.85` |
| `admin.shiyubox.com` | PC 聚合管理后台 | `39.106.4.85` |
| `time-admin.shiyubox.com` | 轻时间管理后台 | `39.106.4.85` |
| `space-admin.shiyubox.com` | 轻间 / 轻应用管理后台 | `39.106.4.85` |
| `api.shiyubox.com` | 统一 API 网关 | `39.106.4.85` |
| `account.shiyubox.com` | 登录、账号、会员身份中心 | `39.106.4.85` |
| `share.shiyubox.com` | 分享链接、公开访问页 | `39.106.4.85` |
| `assets.shiyubox.com` | 静态资源、图片、上传文件 | `39.106.4.85` |

第二批可以等产品稳定后再开：

| 域名 | 用途 |
| --- | --- |
| `time.shiyubox.com` | 轻时间前台应用 |
| `box.shiyubox.com` | 轻应用工具箱或统一应用盒子 |
| `yiyu.shiyubox.com` | 如果旧产品“一隅/易抑郁”还要保留，可做历史入口或跳转 |
| `dev.shiyubox.com` | 开发/测试环境 |
| `staging.shiyubox.com` | 预发布环境 |

如果希望更简洁，第一阶段只建 5 个也可以：

```text
shiyubox.com
app.shiyubox.com
admin.shiyubox.com
api.shiyubox.com
share.shiyubox.com
```

业务后台可以先挂在 `admin.shiyubox.com` 下面的路径里：

```text
admin.shiyubox.com/platform
admin.shiyubox.com/time
admin.shiyubox.com/space
```

等服务拆开部署后，再拆成 `time-admin`、`space-admin`。

## 3. DNS 记录建议

在阿里云 DNS 控制台里，先创建 A 记录：

| 主机记录 | 记录类型 | 记录值 | 说明 |
| --- | --- | --- | --- |
| `@` | A | `39.106.4.85` | 主域名 |
| `www` | A | `39.106.4.85` | www 入口 |
| `app` | A | `39.106.4.85` | 用户端应用 |
| `admin` | A | `39.106.4.85` | PC 聚合后台 |
| `api` | A | `39.106.4.85` | API |
| `account` | A | `39.106.4.85` | 账号中心 |
| `share` | A | `39.106.4.85` | 分享页 |
| `assets` | A | `39.106.4.85` | 静态资源 |

如果第一阶段要把两个业务后台独立出来，再加：

| 主机记录 | 记录类型 | 记录值 | 说明 |
| --- | --- | --- | --- |
| `time-admin` | A | `39.106.4.85` | 轻时间后台 |
| `space-admin` | A | `39.106.4.85` | 轻间后台 |

TTL 可以先用默认值。等服务稳定后再根据需要调整。

## 4. 服务器部署建议

当前服务器是 2 核 2G，建议第一阶段用单机部署，结构简单一点：

- Nginx：统一接入域名、HTTPS、反向代理。
- Node.js：跑前台预览服务、后台 Vite 构建产物或 SSR/API。
- PM2 或 systemd：守护 Node 服务。
- Certbot 或 acme.sh：申请 HTTPS 证书。
- Git：拉取代码。
- 防火墙：只开放 80、443、必要的 SSH 端口。

建议不要把 5175、5176、5177 这些开发端口直接暴露到公网。正式访问应由 Nginx 代理：

```text
admin.shiyubox.com -> 127.0.0.1:5175 或构建后的静态后台
time-admin.shiyubox.com -> 127.0.0.1:5176
space-admin.shiyubox.com -> 127.0.0.1:5177
app.shiyubox.com -> 拾隅前台
api.shiyubox.com -> 后端 API
```

生产环境更建议先 build 成静态文件，由 Nginx 托管，不长期运行 Vite dev server。

## 5. 需要你提供的信息

如果要我继续帮你落地服务器和域名，需要这些信息：

1. 阿里云域名 DNS 是否也在阿里云解析。如果不在，需要告诉我 DNS 服务商。
2. 服务器 SSH 登录方式：
   - 公网 IP：目前看到是 `39.106.4.85`
   - SSH 用户名：通常是 `root` 或你创建的普通用户
   - 登录方式：密码或 SSH 私钥
   - SSH 端口：默认是 `22`，如果改过需要说明
3. 阿里云安全组是否已开放：
   - `22`：SSH
   - `80`：HTTP
   - `443`：HTTPS
4. 域名是否已完成备案。
   - 如果服务器在中国大陆，正式用域名访问一般需要备案。
   - 未备案时，HTTPS 证书可以先准备，但公网域名访问可能会被拦截或限制。
5. 你希望第一版上线哪个内容：
   - 只上线拾隅前台
   - 前台 + PC 聚合后台
   - 前台 + 三个后台
6. 代码部署方式：
   - 直接在服务器 `git pull`
   - 手动上传压缩包
   - 后续做 GitHub Actions 自动部署

不要在聊天里直接发明文服务器密码。如果需要我操作，优先用临时 SSH 密钥或一次性密码，并在完成后立刻改掉。

## 6. 第一阶段建议执行顺序

1. 在阿里云 DNS 创建第一批 A 记录。
2. 登录服务器，安装 Nginx、Node.js、Git、PM2。
3. 拉取前台和后台仓库。
4. 先部署 `app.shiyubox.com`，确认拾隅前台能访问。
5. 再部署 `admin.shiyubox.com`，确认 PC 聚合后台能登录。
6. 申请 HTTPS 证书，强制跳转 HTTPS。
7. 再逐步接入 `api`、`share`、`account`。

## 7. 命名建议

对外品牌建议统一叫：

```text
拾隅 ShiyuBox
```

域名 `shiyubox.com` 很适合表达“把喜欢的东西拾起来，放进自己的盒子里”。后续产品线可以这样归属：

- 拾隅空间：收藏与个人空间。
- 拾隅时间：轻时间。
- 拾隅应用盒：轻应用集合。
- 拾隅后台：PC 管理后台。

