[CmdletBinding()]
param(
  [string]$Server = '39.106.4.85',
  [string]$User = 'root',
  [string]$KeyPath = "$env:USERPROFILE\.ssh\shiyubox_deploy_rsa",
  [int]$LocalPort = 4320
)

$ErrorActionPreference = 'Stop'
$target = "${User}@${Server}"

if (-not (Test-Path -LiteralPath $KeyPath)) {
  throw "SSH private key was not found: $KeyPath"
}

$arguments = @(
  '-NT',
  '-L', "${LocalPort}:127.0.0.1:4318",
  '-i', $KeyPath,
  '-o', 'ExitOnForwardFailure=yes',
  '-o', 'ServerAliveInterval=30',
  '-o', 'ServerAliveCountMax=3',
  $target
)

$tunnel = Start-Process -FilePath 'ssh.exe' -ArgumentList $arguments -WindowStyle Hidden -PassThru
try {
  $ready = $false
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 250
    if ($tunnel.HasExited) {
      throw "SSH tunnel exited unexpectedly with code $($tunnel.ExitCode)."
    }
    if (Test-NetConnection -ComputerName '127.0.0.1' -Port $LocalPort -InformationLevel Quiet -WarningAction SilentlyContinue) {
      $ready = $true
      break
    }
  }
  if (-not $ready) { throw 'The private preview tunnel did not become ready.' }

  Start-Process "http://127.0.0.1:${LocalPort}/"
  Write-Host "Private preview is open at http://127.0.0.1:${LocalPort}/"
  Write-Host 'Keep this window open. Press Ctrl+C to close the private tunnel.'
  Wait-Process -Id $tunnel.Id
}
finally {
  if (-not $tunnel.HasExited) {
    Stop-Process -Id $tunnel.Id -Force
  }
}
