# PowerShell script to collect backend and frontend test and coverage reports into reports/

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$ReportsDir = Join-Path $ProjectRoot "reports"

Write-Host "Creating reports directories in $ReportsDir..."
New-Item -ItemType Directory -Force -Path (Join-Path $ReportsDir "backend-tests") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $ReportsDir "backend-coverage") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $ReportsDir "frontend-coverage") | Out-Null

# 1. Copy backend surefire reports
$SurefireDir = Join-Path $ProjectRoot "backend\target\surefire-reports"
if (Test-Path $SurefireDir) {
    Write-Host "Copying backend Surefire test reports..."
    Copy-Item -Path "$SurefireDir\*.txt" -Destination (Join-Path $ReportsDir "backend-tests") -Force -ErrorAction SilentlyContinue
    Copy-Item -Path "$SurefireDir\*.xml" -Destination (Join-Path $ReportsDir "backend-tests") -Force -ErrorAction SilentlyContinue
}

# 2. Copy backend jacoco coverage
$JacocoDir = Join-Path $ProjectRoot "backend\target\site\jacoco"
if (Test-Path $JacocoDir) {
    Write-Host "Copying backend JaCoCo coverage reports..."
    Copy-Item -Path "$JacocoDir\*" -Destination (Join-Path $ReportsDir "backend-coverage") -Recurse -Force -ErrorAction SilentlyContinue
}

# 3. Copy frontend coverage
$FrontendCoverageDir = Join-Path $ProjectRoot "coverage"
if (Test-Path $FrontendCoverageDir) {
    Write-Host "Copying frontend Vitest coverage reports..."
    Copy-Item -Path "$FrontendCoverageDir\*" -Destination (Join-Path $ReportsDir "frontend-coverage") -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Test reports collection complete! See $ReportsDir"
