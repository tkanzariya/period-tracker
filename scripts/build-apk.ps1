# Builds a standalone app file (APK) with live progress. No phone needed.
# Double-click scripts\build-apk.bat to run this.
#
# The APK has the app's code inside it, so it installs and runs on its own
# (copy it to a phone, or send it to Drashti). Result: dist\CycleSaathi-v<version>.apk
param([switch]$NoOpen)   # -NoOpen: do not open the folder at the end
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$app = Join-Path $repo 'app'

$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot'
$env:ANDROID_HOME = 'D:\Android\Sdk'
$env:ANDROID_CXX_STAGING_DIR = 'D:\cx'   # keeps C++ build paths short (Windows 260-character limit)
$env:PATH = "$env:JAVA_HOME\bin;D:\Android\Sdk\platform-tools;$env:PATH"

Set-Location $app
if (-not (Test-Path 'android')) {
  Write-Host 'Step 1 of 2: preparing the Android project (about 20 seconds)...' -ForegroundColor Cyan
  npx expo prebuild --platform android --no-install
  if ($LASTEXITCODE -ne 0) { Write-Host 'Preparing failed.' -ForegroundColor Red; exit 1 }
}

Write-Host ''
Write-Host 'Building the app file. Watch the percentage bar and the task name at the bottom.' -ForegroundColor Cyan
Write-Host 'Typical time on this PC: about 8 minutes the first time, about 3 minutes after that.' -ForegroundColor Cyan
Write-Host ''
$clock = [Diagnostics.Stopwatch]::StartNew()
& (Join-Path $app 'android\gradlew.bat') -p (Join-Path $app 'android') app:assembleRelease -x lint -x test
if ($LASTEXITCODE -ne 0) {
  Write-Host ''
  Write-Host 'BUILD FAILED. Scroll up for the line that says "What went wrong".' -ForegroundColor Red
  exit 1
}
$clock.Stop()

$apk = Get-ChildItem (Join-Path $app 'android\app\build\outputs\apk\release') -Filter *.apk | Select-Object -First 1
$version = (Get-Content (Join-Path $app 'app.json') -Raw | ConvertFrom-Json).expo.version
$dist = Join-Path $repo 'dist'
New-Item -ItemType Directory -Force $dist | Out-Null
$target = Join-Path $dist "CycleSaathi-v$version.apk"
Copy-Item $apk.FullName $target -Force

Write-Host ''
Write-Host ("DONE in {0:m\:ss}. App file: {1}  ({2:N1} MB)" -f $clock.Elapsed, $target, ((Get-Item $target).Length / 1MB)) -ForegroundColor Green
[console]::beep(880, 300)
if (-not $NoOpen) { explorer.exe "/select,`"$target`"" }
