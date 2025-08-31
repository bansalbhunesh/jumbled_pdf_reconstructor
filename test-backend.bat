@echo off
echo 🧪 Testing Backend Server
echo =========================
echo.

echo 🔍 Checking if server can start...
echo.

REM Check if dist-server exists
if not exist "dist-server" (
    echo ❌ Server not built yet. Building first...
    call npm run api:build
    if errorlevel 1 (
        echo ❌ Build failed!
        pause
        exit /b 1
    )
)

echo.
echo 🚀 Starting server in test mode...
echo 💡 This will show you any startup errors
echo.

REM Start the server and show output
npm run api:start

echo.
echo 💡 If you see error messages above, that's what's preventing the server from starting
echo 💡 If you see "running on http://127.0.0.1:3001", the server is working
echo.
pause
