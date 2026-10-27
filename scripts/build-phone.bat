@echo off
title Build and install on phone
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-phone.ps1"
echo.
pause
