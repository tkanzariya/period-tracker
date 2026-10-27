@echo off
title Try the app in the browser (no phone)
cd /d "%~dp0..\app"
echo Making sample data (fake cycles for testing)...
call node scripts\make-sample-backup.js
echo.
echo Starting the browser version. It opens in your browser in about a minute.
echo To fill it with sample cycles: Settings, then "Bring my information back", then choose
echo   app\sample-data\sample-backup.json
echo Close this window to stop.
echo.
call npx expo start --web --port 8082
pause
