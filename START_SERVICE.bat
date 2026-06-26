@echo off
REM This script starts the Document Share service using Cloudflare Tunnel

echo.
echo ========================================
echo Document Share - Service Starter
echo ========================================
echo.
echo This will open TWO windows:
echo   1. Node server (keeps running)
echo   2. Cloudflare Tunnel (soulioli.com)
echo.
echo Press any key to continue...
pause

REM Start the Node server in a new window
echo Starting Node server...
start "" cmd /k "cd /d %~dp0 && npm start"

REM Give it a moment to start
timeout /t 2 /nobreak

echo Starting Cloudflare Tunnel...
start "" cmd /k "cd /d %~dp0 && cloudflared tunnel run soulioli-tunnel"

echo.
echo ========================================
echo Both services are starting!
echo.
echo Server window: http://localhost:3000
echo Tunnel window: will serve https://soulioli.com

echo Keep both windows open while the tunnel is running.
echo.
echo To STOP: close each window or press Ctrl+C in each window
echo ========================================
echo.
