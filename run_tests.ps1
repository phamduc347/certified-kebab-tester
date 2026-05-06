$ErrorActionPreference = 'Stop'

Write-Host "--------------------------------------"
Write-Host "🚀 Certified Kebab Tester - Unit Tests"
Write-Host "--------------------------------------"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$testsDir = Join-Path $scriptDir 'tests'

if (-not (Test-Path $testsDir)) {
    Write-Error "Tests-Ordner nicht gefunden: $testsDir"
}

$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) {
    Write-Error "npm wurde nicht gefunden. Bitte Node.js installieren: https://nodejs.org/"
}

Push-Location $testsDir
try {
    if (-not (Test-Path 'node_modules')) {
        Write-Host "📦 node_modules nicht gefunden. Installiere Abhängigkeiten..."
        npm install
        Write-Host "✅ Installation abgeschlossen."
        Write-Host ""
    }

    # Force stable output across terminals/CI by disabling dynamic color/TTY output.
    npm test
}
finally {
    Pop-Location
}
