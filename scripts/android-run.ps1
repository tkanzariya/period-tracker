# Builds the debug app and installs it on the connected phone.
#
# Why the extra variable: on Windows, React Native's C++ build fails when file
# paths pass 260 characters, and "D:\Period Tracker\..." is long enough to
# trigger it. ANDROID_CXX_STAGING_DIR moves just the C++ build output to a
# short folder (see app/plugins/withShortCxxDir.js).
#
# Usage (from anywhere):  powershell -File scripts\android-run.ps1 [-Device <serial>]
param([string]$Device = "RZCY90LRNLA")

$repo = Split-Path -Parent $PSScriptRoot

$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
$env:ANDROID_HOME = "D:\Android\Sdk"
$env:ANDROID_CXX_STAGING_DIR = "D:\c"
$env:PATH = "$env:JAVA_HOME\bin;D:\Android\Sdk\platform-tools;$env:PATH"
# Do not set CI=1 here: it makes the dev server stop watching files, so edits would not reach the phone.

Set-Location (Join-Path $repo "app")
npx expo run:android --device $Device
exit $LASTEXITCODE
