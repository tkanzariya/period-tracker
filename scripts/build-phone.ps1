# Builds the test version, installs it on the connected phone, and starts the live-reload server.
# Double-click scripts\build-phone.bat to run this. Needs the phone connected with USB debugging on.
# You only need this when native things change (new libraries, app.json, icons). For normal
# screen and wording changes the phone reloads by itself, with no rebuild.
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$app = Join-Path $repo 'app'

$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot'
$env:ANDROID_HOME = 'D:\Android\Sdk'
$env:ANDROID_CXX_STAGING_DIR = 'D:\c'
$adb = 'D:\Android\Sdk\platform-tools'
$env:PATH = "$env:JAVA_HOME\bin;$adb;$env:PATH"

$devices = & "$adb\adb.exe" devices | Select-String -Pattern '\tdevice$'
if (-not $devices) {
  Write-Host 'I cannot see your phone.' -ForegroundColor Red
  Write-Host '  1. Unlock the phone.  2. Unplug and replug the USB cable.  3. Tap Allow on "Allow USB debugging?".' -ForegroundColor Yellow
  exit 1
}

Set-Location $app
if (-not (Test-Path 'android')) {
  Write-Host 'Step 1 of 3: preparing the Android project (about 20 seconds)...' -ForegroundColor Cyan
  npx expo prebuild --platform android --no-install
  if ($LASTEXITCODE -ne 0) { Write-Host 'Preparing failed.' -ForegroundColor Red; exit 1 }
}

Write-Host ''
Write-Host 'Step 2 of 3: building and installing. Watch the percentage bar at the bottom.' -ForegroundColor Cyan
& (Join-Path $app 'android\gradlew.bat') -p (Join-Path $app 'android') app:installDebug -x lint -x test
if ($LASTEXITCODE -ne 0) {
  Write-Host 'BUILD FAILED. Scroll up for the line that says "What went wrong".' -ForegroundColor Red
  exit 1
}

Write-Host ''
Write-Host 'Step 3 of 3: starting the live-reload server and opening the app on the phone.' -ForegroundColor Green
Write-Host 'Keep this window open while you test. Close it when you are done.' -ForegroundColor Green
npx expo start --dev-client --android --port 8081
