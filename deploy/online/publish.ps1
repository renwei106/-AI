[CmdletBinding()]
param(
  [string]$Server = '39.106.4.85',
  [string]$User = 'root',
  [string]$KeyPath = "$env:USERPROFILE\.ssh\shiyubox_deploy_rsa",
  [string]$AdminRepo = (Join-Path $PSScriptRoot '..\..\..\聚合管理后台'),
  [switch]$SkipBuild
)
$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$adminRoot = (Resolve-Path $AdminRepo).Path
$releaseId = (Get-Date).ToUniversalTime().ToString('yyyyMMddHHmmss')
$adminArchive = Join-Path $env:TEMP "shiyu-admin-$releaseId.tgz"
$frontArchive = Join-Path $env:TEMP "shiyu-front-$releaseId.tgz"
$target = "${User}@${Server}"
if (-not (Test-Path -LiteralPath $KeyPath)) { throw 'SSH private key was not found.' }
foreach ($repo in @($repoRoot, $adminRoot)) {
  & git -C $repo diff HEAD --quiet
  if ($LASTEXITCODE -ne 0) { throw "Commit tracked changes before publishing: $repo" }
}
if (-not $SkipBuild) {
  Push-Location $adminRoot
  try { & pnpm build; if ($LASTEXITCODE -ne 0) { throw 'Admin build failed.' } }
  finally { Pop-Location }
}
$frontCommit = (& git -C $repoRoot rev-parse HEAD).Trim()
$adminCommit = (& git -C $adminRoot rev-parse HEAD).Trim()
try {
  & git -C $adminRoot archive --format=tar.gz -o $adminArchive HEAD
  if ($LASTEXITCODE -ne 0) { throw 'Failed to archive admin source.' }
  & git -C $repoRoot archive --format=tar.gz -o $frontArchive HEAD dist preview.cjs share-server.cjs theme-config-proxy.cjs extension-routes.cjs shiyu-user-proxy.cjs feedback-server.cjs theme-access i18n payments config
  if ($LASTEXITCODE -ne 0) { throw 'Failed to archive frontend source.' }
  & scp.exe -i $KeyPath -o BatchMode=yes $adminArchive $frontArchive (Join-Path $PSScriptRoot 'release.sh') "${target}:/tmp/"
  if ($LASTEXITCODE -ne 0) { throw 'Failed to upload release.' }
  & ssh.exe -i $KeyPath -o BatchMode=yes $target "bash /tmp/release.sh '$releaseId' '$frontCommit' '$adminCommit'"
  if ($LASTEXITCODE -ne 0) { throw 'Online release failed; inspect remote rollback output.' }
  Write-Host "Published: https://shiyubox.com/ ($releaseId)"
} finally {
  Remove-Item -LiteralPath $adminArchive,$frontArchive -Force -ErrorAction SilentlyContinue
}
