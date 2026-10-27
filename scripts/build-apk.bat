@echo off
title Build the app file (APK)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-apk.ps1"
echo.
pause
