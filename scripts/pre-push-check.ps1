$ErrorActionPreference = 'Stop'

$scriptPath = Join-Path $PSScriptRoot 'validate-site.ps1'
powershell -ExecutionPolicy Bypass -File $scriptPath
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Output 'Pre-push check passed.'


