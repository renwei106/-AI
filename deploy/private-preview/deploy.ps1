[CmdletBinding()]
param(
  [string]$Server = '39.106.4.85',
  [string]$User = 'root',
  [string]$KeyPath = "$env:USERPROFILE\.ssh\shiyubox_deploy_rsa"
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$releaseId = (Get-Date).ToUniversalTime().ToString('yyyyMMddHHmmss')
$archive = Join-Path $env:TEMP "shiyu-preview-$releaseId.tgz"
$target = "${User}@${Server}"

if (-not (Test-Path -LiteralPath $KeyPath)) {
  throw "SSH private key was not found: $KeyPath"
}

Push-Location $repoRoot
try {
  & tar.exe -czf $archive dist preview.cjs share-server.cjs
  if ($LASTEXITCODE -ne 0) { throw 'Failed to build the deployment archive.' }

  & scp.exe -i $KeyPath -o StrictHostKeyChecking=accept-new $archive "${target}:/tmp/shiyu-preview.tgz"
  if ($LASTEXITCODE -ne 0) { throw 'Failed to upload the deployment archive.' }

  & scp.exe -i $KeyPath -o StrictHostKeyChecking=accept-new (Join-Path $PSScriptRoot 'install.sh') "${target}:/tmp/shiyu-install.sh"
  if ($LASTEXITCODE -ne 0) { throw 'Failed to upload the installer.' }

  & ssh.exe -i $KeyPath -o StrictHostKeyChecking=accept-new $target "sudo bash /tmp/shiyu-install.sh '$releaseId'"
  if ($LASTEXITCODE -ne 0) { throw 'Remote installation failed.' }
}
finally {
  Pop-Location
  Remove-Item -LiteralPath $archive -Force -ErrorAction SilentlyContinue
}

Write-Host "Deployment complete: $releaseId"
