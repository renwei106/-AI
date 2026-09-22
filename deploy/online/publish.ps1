[CmdletBinding()]
param(
  [string]$Server = '39.106.4.85',
  [string]$User = 'root',
  [string]$KeyPath = "$env:USERPROFILE\.ssh\shiyubox_deploy_rsa",
  [string]$AdminRepo = (Join-Path $PSScriptRoot '..\..\..\聚合管理后台')
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$adminRoot = (Resolve-Path $AdminRepo).Path
$releaseId = (Get-Date).ToUniversalTime().ToString('yyyyMMddHHmmss')
$archive = Join-Path $env:TEMP "shiyu-admin-$releaseId.tar"
$target = "${User}@${Server}"

if (-not (Test-Path -LiteralPath $KeyPath)) { throw "SSH private key was not found: $KeyPath" }
if (-not (Test-Path -LiteralPath (Join-Path $adminRoot 'package.json'))) { throw "Admin repository was not found: $adminRoot" }

Write-Host "[1/4] Building admin..."
Push-Location $adminRoot
try {
  & pnpm build
  if ($LASTEXITCODE -ne 0) { throw 'Admin build failed.' }
  & git diff --quiet
  if ($LASTEXITCODE -ne 0) { throw 'Admin repository has uncommitted changes. Commit them before publishing.' }
  & git archive --format=tar -o $archive HEAD
  if ($LASTEXITCODE -ne 0) { throw 'Failed to archive admin source.' }
} finally { Pop-Location }

try {
  Write-Host "[2/4] Switching admin and preserving server data..."
  & scp.exe -i $KeyPath -o StrictHostKeyChecking=accept-new $archive "${target}:/tmp/shiyu-admin-$releaseId.tar"
  if ($LASTEXITCODE -ne 0) { throw 'Failed to upload admin source.' }
  $remote = @"
set -e
base=/opt/shiyu-admin
old=$(readlink -f $base/current)
release=$base/releases/$releaseId
mkdir -p $release
tar -xf /tmp/shiyu-admin-$releaseId.tar -C $release
if [ -d "$old/node_modules" ]; then ln -s "$old/node_modules" $release/node_modules; fi
if [ -d "$old/.local" ]; then cp -a "$old/.local" $release/.local; fi
mkdir -p $base/releases
ln -sfn /opt/shiyu/current $base/releases/导航站
mkdir -p /opt/shiyu/releases
ln -sfn /opt/shiyu-admin/current /opt/shiyu/releases/聚合管理后台
systemctl stop shiyu-admin.service
if [ -L $base/current ]; then rm $base/current; else mv $base/current $base/previous-$releaseId; fi
ln -s $release $base/current
systemctl start shiyu-admin.service
for i in 1 2 3 4 5 6 7 8 9 10; do curl -fsS http://127.0.0.1:5175/ >/dev/null && break; sleep 1; done
systemctl is-active --quiet shiyu-admin.service
test -f $release/src/ShiyuOperations.tsx
"@
  & ssh.exe -i $KeyPath -o StrictHostKeyChecking=accept-new $target $remote
  if ($LASTEXITCODE -ne 0) { throw 'Admin deployment failed.' }

  Write-Host "[3/4] Publishing frontend..."
  & (Join-Path $repoRoot 'deploy\private-preview\deploy.ps1') -Server $Server -User $User -KeyPath $KeyPath
  if ($LASTEXITCODE -ne 0) { throw 'Frontend deployment failed.' }

  Write-Host "[4/4] Verifying both services..."
  $verify = 'set -e; systemctl is-active --quiet shiyu-admin.service; systemctl is-active --quiet shiyu-preview.service; curl -fsS http://127.0.0.1:4318/ >/dev/null; curl -fsS http://127.0.0.1:4318/api/shiyu/operations | grep -q corner; echo ONLINE_RELEASE=' + $releaseId
  & ssh.exe -i $KeyPath -o StrictHostKeyChecking=accept-new $target $verify
  if ($LASTEXITCODE -ne 0) { throw 'Online verification failed.' }
  Write-Host "Published: http://$Server/"
} finally { Remove-Item -LiteralPath $archive -Force -ErrorAction SilentlyContinue }
