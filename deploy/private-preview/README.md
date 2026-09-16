# 拾隅私有预览部署

备案完成前，服务器通过 `4318` 端口提供页面，轻量服务器防火墙仅允许指定的公网 IP 访问，不向其他来源开放。

## 一次性准备

1. 在阿里云安全组入方向开放 TCP 22，来源限制为当前使用者的公网 IPv4 `/32`。
2. 将本机 `~/.ssh/shiyubox_deploy_rsa.pub` 的 RSA 公钥绑定到轻量应用服务器，或加入服务器登录账户的 `~/.ssh/authorized_keys`。

## 部署当前版本

在 PowerShell 中运行：

```powershell
& '.\deploy\private-preview\deploy.ps1'
```

脚本会把 `dist`、`preview.cjs` 和 `share-server.cjs` 上传到独立版本目录，并用 systemd 启动。分享数据保存在 `/opt/shiyu/shared/.local-shares`，后续部署不会覆盖。

## 打开私有预览

在 PowerShell 中运行：

```powershell
& '.\deploy\private-preview\open-preview.ps1'
```

浏览器会打开 `http://127.0.0.1:4320/`。关闭脚本窗口后，SSH 隧道随即断开。
