# Builds a standalone app file (APK) with live progress. No phone needed.
# Double-click scripts\build-apk.bat to run this.
#
# The APK has the app's code inside it, so it installs and runs on its own
# (copy it to a phone, or send it to Drashti). Result: dist\CycleSaathi-v<version>.apk
#
# Why it builds from a copy at D:\cs: Windows cannot create folders whose full path is over
# 248 characters, and React Native's C++ build repeats the project's whole path inside its own
# folders. "D:\Period Tracker\..." is just too long for the release build, so the project is
# copied to the short path D:\cs first (only changed files are copied after the first time).
param([switch]$NoOpen)   # -NoOpen: do not open the folder at the end
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$app = Join-Path $repo 'app'
$mirror = 'D:\cs'
$mApp = Join-Path $mirror 'app'

$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot'
$env:ANDROID_HOME = 'D:\Android\Sdk'
$env:ANDROID_CXX_STAGING_DIR = 'D:\c'   # C++ build output on a short path too
$env:PATH = "$env:JAVA_HOME\bin;D:\Android\Sdk\platform-tools;$env:PATH"

function Copy-Changed($from, $to, $excludeDirs) {
  # robocopy exit codes 0-7 all mean "fine"; 8 or more means a real error.
  robocopy $from $to /MIR /XD $excludeDirs /XF build.log /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { Write-Host "Copy failed ($from)." -ForegroundColor Red; exit 1 }
}

# Sign with our own release key when it is on this PC (kept outside the repo, see READ-ME-FIRST.txt there).
$signing = 'D:\CycleSaathi-keys\signing.env'
if (Test-Path $signing) {
  Get-Content $signing | ForEach-Object { if ($_ -match '^([A-Z_]+)=(.*)$') { Set-Item "env:$($Matches[1])" $Matches[2] } }
  Write-Host 'Signing with the Cycle Saathi release key.' -ForegroundColor Green
} else {
  Write-Host 'No release key found on this PC: signing with the test key (fine for testing only).' -ForegroundColor Yellow
}

Write-Host 'Step 1 of 3: copying the project to a short path (first time a few minutes, later seconds)...' -ForegroundColor Cyan
New-Item -ItemType Directory -Force $mApp | Out-Null
Copy-Changed $app $mApp @('node_modules', 'android', '.expo', '.tmp', 'dist', 'sample-data')
Copy-Changed (Join-Path $app 'node_modules') (Join-Path $mApp 'node_modules') @()

Set-Location $mApp
# Re-generate the Android project when anything that shapes it has changed (app.json, plugins, icons, packages).
$watch = @('app.json', 'package.json') + (Get-ChildItem plugins -Filter *.js | ForEach-Object { "plugins\$($_.Name)" }) + (Get-ChildItem assets -Filter *.png | ForEach-Object { "assets\$($_.Name)" })
$fingerprint = ($watch | ForEach-Object { (Get-FileHash $_ -Algorithm SHA1).Hash }) -join ''
$stamp = Join-Path $mirror '.android-fingerprint'
$old = if (Test-Path $stamp) { Get-Content $stamp -Raw } else { '' }
if (-not (Test-Path 'android') -or $old -ne $fingerprint) {
  Write-Host 'Step 2 of 3: preparing the Android project (about 30 seconds)...' -ForegroundColor Cyan
  npx expo prebuild --platform android --clean --no-install
  if ($LASTEXITCODE -ne 0) { Write-Host 'Preparing failed.' -ForegroundColor Red; exit 1 }
  Set-Content $stamp $fingerprint -NoNewline
} else {
  Write-Host 'Step 2 of 3: Android project is up to date.' -ForegroundColor Cyan
}

$gradlew = Join-Path $mApp 'android\gradlew.bat'
# Stop leftover build helpers from earlier runs: they hold several GB of memory, and when the PC
# runs low the C++ compiler crashes. (Both locations, in case the phone build ran earlier.)
& $gradlew -p (Join-Path $mApp 'android') --stop 2>&1 | Out-Null
$phoneGradle = Join-Path $app 'android\gradlew.bat'
if (Test-Path $phoneGradle) { & $phoneGradle -p (Join-Path $app 'android') --stop 2>&1 | Out-Null }

Write-Host ''
Write-Host 'Step 3 of 3: building the app file. Watch the percentage bar and the task name at the bottom.' -ForegroundColor Cyan
Write-Host 'Typical time on this PC: about 8 minutes the first time, about 3 minutes after that.' -ForegroundColor Cyan
Write-Host ''
$clock = [Diagnostics.Stopwatch]::StartNew()
& (Join-Path $mApp 'android\gradlew.bat') -p (Join-Path $mApp 'android') app:assembleRelease -x lint -x test
if ($LASTEXITCODE -ne 0) {
  Write-Host ''
  Write-Host 'BUILD FAILED. Scroll up for the line that says "What went wrong".' -ForegroundColor Red
  exit 1
}
$clock.Stop()
# Free the memory the build helper was holding.
& $gradlew -p (Join-Path $mApp 'android') --stop 2>&1 | Out-Null

$apk = Get-ChildItem (Join-Path $mApp 'android\app\build\outputs\apk\release') -Filter *.apk | Select-Object -First 1
$version = (Get-Content (Join-Path $app 'app.json') -Raw | ConvertFrom-Json).expo.version
$dist = Join-Path $repo 'dist'
New-Item -ItemType Directory -Force $dist | Out-Null
$target = Join-Path $dist "CycleSaathi-v$version.apk"
Copy-Item $apk.FullName $target -Force

Write-Host ''
Write-Host ("DONE in {0:m\:ss}. App file: {1}  ({2:N1} MB)" -f $clock.Elapsed, $target, ((Get-Item $target).Length / 1MB)) -ForegroundColor Green
[console]::beep(880, 300)
if (-not $NoOpen) { explorer.exe "/select,`"$target`"" }
