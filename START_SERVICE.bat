@echo off
REM This script starts the Document Share service
REM It will open two terminals: one for the server, one for ngrok

echo.
echo ========================================
echo Document Share - Service Starter
echo ========================================
echo.
echo This will open TWO windows:
echo   1. Node server (keeps running)
echo   2. ngrok tunnel (for friend access)
echo.
echo Press any key to continue...
pause

REM Start the Node server in a new window
echo Starting Node server...
start cmd /k "cd /d e:\Github\soulioli.com && npm start"

REM Give it a moment to start
timeout /t 2 /nobreak

REM Start ngrok in another new window
echo Starting ngrok tunnel...
start cmd /k "ngrok http 3000"

echo.
echo ========================================
echo Both services are starting!
echo.
echo Server window: http://localhost:3000
echo.
echo In the ngrok window, look for the line:
echo   Forwarding: https://xxxxx.ngrok.io
echo.
echo Copy that URL and share it with friends.
echo.
echo To STOP: Press Ctrl+C in each window
echo ========================================
echo.
