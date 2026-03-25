$ErrorActionPreference = "SilentlyContinue"

$workspacePath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$lockFile = Join-Path $workspacePath ".next\dev\lock"

$processPatterns = @(
  "next dev",
  "uvicorn app.main:app",
  $workspacePath
)

function Stop-DevProcessByPort {
  param(
    [int]$Port
  )

  $connections = Get-NetTCPConnection -State Listen -LocalPort $Port | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($pid in $connections) {
    if (-not $pid) { continue }

    $proc = Get-CimInstance Win32_Process -Filter "ProcessId = $pid"
    if (-not $proc) { continue }

    $cmd = [string]$proc.CommandLine
    if (-not $cmd) { continue }

    $matchesWorkspace = $false
    foreach ($pattern in $processPatterns) {
      if ($cmd -like "*$pattern*") {
        $matchesWorkspace = $true
        break
      }
    }

    if ($matchesWorkspace) {
      Write-Host "[cleanup] Stopping PID $pid on port $Port"
      Stop-Process -Id $pid -Force
    }
  }
}

Stop-DevProcessByPort -Port 3000
Stop-DevProcessByPort -Port 3001
Stop-DevProcessByPort -Port 8000

if (Test-Path $lockFile) {
  Write-Host "[cleanup] Removing stale Next.js lock: $lockFile"
  Remove-Item -Path $lockFile -Force
}

Write-Host "[cleanup] Dev cleanup complete."
