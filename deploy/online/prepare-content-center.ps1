param([string]$ReleaseId)
$ErrorActionPreference='Stop'
$frontRoot=(Get-Location).Path
$adminRoot='D:\系统文件\文档\ChatGPT\聚合管理后台'
$backup=Join-Path 'D:\拾隅发布永久备份' "V1.2.14-$ReleaseId"
New-Item -ItemType Directory -Path $backup | Out-Null
$frontCommit=(& git rev-parse HEAD).Trim()
$adminCommit=(& git --git-dir="$adminRoot/.git" --work-tree=$adminRoot rev-parse HEAD).Trim()
$now=(Get-Date).ToUniversalTime().ToString('o')
$record=@{id=[guid]::NewGuid().ToString();target='website';version='V1.2.14';previousVersion='V1.2.13';releasedAt=$now;createdAt=$now;changeType='change';operator='Codex（用户确认发布及版本递增）';commit=$frontCommit;adminCommit=$adminCommit;summary='统一真实订单列表与主题样式；精简网址卡片、移除跟随主题和棱光拾景；整合后台内容中心的主题、网址样式、世界资源与工具配置，统一开关、弹窗、排序和保存；网址资源复用分组目录，多期公告与更新管理；适配登录及新增配置页面窄屏。保留线上账号、订单、公告、配置和 UP 主数据，只重启网站与后台，不更新插件或工具站。'}
$record | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $backup "shiyu-release-$ReleaseId.json") -Encoding utf8NoBOM
& git -c core.autocrlf=false archive --format=tar.gz -o (Join-Path $backup 'frontend-complete.tgz') HEAD
if($LASTEXITCODE){throw 'Frontend complete archive failed'}
& git --git-dir="$adminRoot/.git" --work-tree=$adminRoot -c core.autocrlf=false archive --format=tar.gz -o (Join-Path $backup 'admin-complete.tgz') HEAD
if($LASTEXITCODE){throw 'Admin complete archive failed'}
$frontFiles=@(& git diff-tree --no-commit-id --name-only -r --diff-filter=ACM HEAD)
$adminFiles=@(& git --git-dir="$adminRoot/.git" --work-tree=$adminRoot diff-tree --no-commit-id --name-only -r --diff-filter=ACM HEAD)
& git -c core.autocrlf=false archive --format=tar.gz -o (Join-Path $backup "shiyu-front-delta-$ReleaseId.tgz") HEAD -- @frontFiles
if($LASTEXITCODE){throw 'Frontend delta failed'}
& git --git-dir="$adminRoot/.git" --work-tree=$adminRoot -c core.autocrlf=false archive --format=tar.gz -o (Join-Path $backup "shiyu-admin-delta-$ReleaseId.tgz") HEAD -- @adminFiles
if($LASTEXITCODE){throw 'Admin delta failed'}
foreach($kind in @('front','admin')){
 $stage=Join-Path $backup "verify-$kind"
 New-Item -ItemType Directory -Path $stage | Out-Null
 & tar.exe -xzf (Join-Path $backup "shiyu-$kind-delta-$ReleaseId.tgz") -C $stage
 if($LASTEXITCODE){throw 'Archive verification extraction failed'}
 $files=if($kind -eq 'front'){$frontFiles}else{$adminFiles}
 $sums=@(foreach($file in $files){$hash=(Get-FileHash -LiteralPath (Join-Path $stage $file) -Algorithm SHA256).Hash.ToLower();"$hash  $file"})
 [IO.File]::WriteAllText((Join-Path $backup "shiyu-$kind-$ReleaseId.sha256"),($sums -join "`n")+"`n",[Text.UTF8Encoding]::new($false))
}
foreach($file in @('release-front-only.sh','release-state.mjs','release-content-center.sh')){Copy-Item -LiteralPath (Join-Path $frontRoot "deploy/online/$file") -Destination $backup}
$manifest=@{version='V1.2.14';releaseId=$ReleaseId;frontCommit=$frontCommit;adminCommit=$adminCommit;files=@(Get-ChildItem -LiteralPath $backup -File | ForEach-Object{@{name=$_.Name;sha256=(Get-FileHash -LiteralPath $_.FullName).Hash;bytes=$_.Length}})}
$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $backup 'manifest.json') -Encoding utf8NoBOM
Write-Output $backup
