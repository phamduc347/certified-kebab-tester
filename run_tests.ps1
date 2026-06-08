$ErrorActionPreference = 'Stop'

Write-Host "--------------------------------------"
Write-Host "Certified Kebab Tester - Unit Tests"
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
        Write-Host "node_modules nicht gefunden. Installiere Abhaengigkeiten..."
        npm install
        if ($LASTEXITCODE -ne 0) {
            Pop-Location
            exit $LASTEXITCODE
        }
        Write-Host "Installation abgeschlossen."
        Write-Host ""
    }

    Write-Host "Synchronisiere Utilities aus script.js..."
    node helpers/sync-utils.cjs
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        exit $LASTEXITCODE
    }
    Write-Host ""

    # PowerShell-compatible test execution (avoids Unix env assignment in package.json scripts).
    # Zusätzliche Argumente werden an Vitest durchgereicht (z. B. .\run_tests.ps1 tests/unit/utils.test.js).
    $previousNodeOptions = $env:NODE_OPTIONS
    $env:NODE_OPTIONS = '--experimental-require-module'
    try {
        node node_modules/vitest/vitest.mjs run --reporter=verbose --no-color --pool=forks @args
        $testExitCode = $LASTEXITCODE
    }
    finally {
        if ($null -eq $previousNodeOptions) {
            Remove-Item Env:NODE_OPTIONS -ErrorAction SilentlyContinue
        }
        else {
            $env:NODE_OPTIONS = $previousNodeOptions
        }
    }
}
finally {
    Pop-Location
}

if ($testExitCode -ne 0) {
    exit $testExitCode
}
