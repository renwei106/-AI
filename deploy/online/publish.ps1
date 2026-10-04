[CmdletBinding()]
param(
  [string]$Server = '39.106.4.85',
  [string]$User = 'root',
  [string]$KeyPath = "$env:USERPROFILE\.ssh\shiyubox_deploy_rsa",
  [string]$AdminRepo = (Join-Path $PSScriptRoot '..\..\..\聚合管理后台'),
  [string]$ToolsRepo = (Join-Path $PSScriptRoot '..\..\..\工具集'),
  [Parameter(Mandatory=$true)][string]$ReleaseRecord,
  [string]$BackupRoot = 'D:\拾隅发布永久备份',
  [switch]$SkipBuild
)
$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$adminRoot = (Resolve-Path $AdminRepo).Path
$toolsRoot = (Resolve-Path $ToolsRepo).Path
$recordFile = (Resolve-Path $ReleaseRecord).Path
$record = Get-Content -LiteralPath $recordFile -Raw -Encoding utf8 | ConvertFrom-Json
if ($record.target -ne 'website' -or $record.version -notmatch '^V\d+\.\d+\.\d+$') { throw 'A confirmed website release record is required.' }
$releaseId = (Get-Date).ToUniversalTime().ToString('yyyyMMddHHmmss')
$adminArchive = Join-Path $env:TEMP "shiyu-admin-$releaseId.tgz"
$frontArchive = Join-Path $env:TEMP "shiyu-front-$releaseId.tgz"
$toolsArchive = Join-Path $env:TEMP "shiyu-tools-$releaseId.tgz"
$target = "${User}@${Server}"
if (-not (Test-Path -LiteralPath $KeyPath)) { throw 'SSH private key was not found.' }
foreach ($repo in @($repoRoot, $adminRoot, $toolsRoot)) {
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
$toolsCommit = (& git -C $toolsRoot rev-parse HEAD).Trim()
try {
  & git -C $adminRoot archive --format=tar.gz -o $adminArchive HEAD
  if ($LASTEXITCODE -ne 0) { throw 'Failed to archive admin source.' }
  & git -C $repoRoot archive --format=tar.gz -o $frontArchive HEAD dist preview.cjs share-server.cjs theme-config-proxy.cjs extension-routes.cjs shiyu-user-proxy.cjs avatar-catalog-proxy.cjs forest-companion-assets.cjs favicon-resolver.cjs feedback-server.cjs theme-access i18n payments config
  if ($LASTEXITCODE -ne 0) { throw 'Failed to archive frontend source.' }
  & git -C $toolsRoot archive --format=tar.gz -o $toolsArchive HEAD dist server
  if ($LASTEXITCODE -ne 0) { throw 'Failed to archive tools source.' }
  # Permanent local archive must succeed before anything is uploaded.
  $backupDir = Join-Path $BackupRoot "$($record.version)-$releaseId"
  if (Test-Path -LiteralPath $backupDir) { throw 'Permanent backup directory already exists.' }
  New-Item -ItemType Directory -Path $backupDir -ErrorAction Stop | Out-Null
  foreach ($file in @($adminArchive, $frontArchive, $toolsArchive, $recordFile, (Join-Path $PSScriptRoot 'release.sh'), (Join-Path $PSScriptRoot 'release-state.mjs'))) {
    $destination = Join-Path $backupDir (Split-Path $file -Leaf)
    Copy-Item -LiteralPath $file -Destination $destination -ErrorAction Stop
    if ((Get-FileHash -LiteralPath $file).Hash -ne (Get-FileHash -LiteralPath $destination).Hash) { throw 'Permanent backup checksum mismatch.' }
  }
  @{ releaseId=$releaseId; version=$record.version; frontCommit=$frontCommit; adminCommit=$adminCommit; toolsCommit=$toolsCommit; files=@(Get-ChildItem -LiteralPath $backupDir -File | ForEach-Object { @{name=$_.Name;sha256=(Get-FileHash -LiteralPath $_.FullName).Hash;bytes=$_.Length} }) } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $backupDir 'manifest.json') -Encoding utf8
  & scp.exe -i $KeyPath -o BatchMode=yes $recordFile "${target}:/tmp/shiyu-release-$releaseId.json"
  if ($LASTEXITCODE -ne 0) { throw 'Failed to upload release record.' }
  & scp.exe -i $KeyPath -o BatchMode=yes $adminArchive $frontArchive $toolsArchive (Join-Path $PSScriptRoot 'release.sh') (Join-Path $PSScriptRoot 'release-state.mjs') "${target}:/tmp/"
  if ($LASTEXITCODE -ne 0) { throw 'Failed to upload release.' }
  & ssh.exe -i $KeyPath -o BatchMode=yes $target "bash /tmp/release.sh '$releaseId' '$frontCommit' '$adminCommit' '$toolsCommit'"
  if ($LASTEXITCODE -ne 0) { throw 'Online release failed; inspect remote rollback output.' }
  # Run retention separately: cleanup failure must never roll back a healthy release.
  & scp.exe -i $KeyPath -o BatchMode=yes (Join-Path $PSScriptRoot 'retain-releases.mjs') "${target}:/tmp/retain-releases.mjs"
  if ($LASTEXITCODE -ne 0) { throw 'Website published, but retention script upload failed.' }
  & ssh.exe -i $KeyPath -o BatchMode=yes $target "node /tmp/retain-releases.mjs '$releaseId' `$(cat /opt/shiyu/current/PREVIOUS_RELEASE) --apply"
  if ($LASTEXITCODE -ne 0) { throw 'Website published, but historical cleanup needs attention. Permanent local backup is safe.' }
  Write-Host "Published: https://shiyubox.com/ ($releaseId)"
} finally {
  Remove-Item -LiteralPath $adminArchive,$frontArchive,$toolsArchive -Force -ErrorAction SilentlyContinue
}
