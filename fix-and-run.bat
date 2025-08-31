@echo off
echo 🔧 PDF Reconstructor - Fix & Run
echo ================================
echo.

echo 📋 Checking and fixing issues...
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found! Please run this from the pdf-reconstructor folder
    pause
    exit /b 1
)

REM Kill any existing processes on our ports
echo 🔌 Freeing up ports...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🌐 Installing web dependencies...
cd web
call npm install
cd ..
if errorlevel 1 (
    echo ❌ Failed to install web dependencies
    pause
    exit /b 1
)

echo.
echo 🔨 Building server...
call npm run api:build
if errorlevel 1 (
    echo ❌ Failed to build server
    echo 💡 Check the error messages above
    pause
    exit /b 1
)

echo.
echo 🚀 Starting API server...
start "API Server" cmd /k "cd /d %CD% && npm run api:start"

echo.
echo ⏳ Waiting for API server to start...
timeout /t 8 /nobreak >nul

echo.
echo 🌐 Starting web frontend...
cd web
start "Web Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ⏳ Waiting for web frontend to start...
timeout /t 8 /nobreak >nul

echo.
echo 📊 Checking service status...
echo.
echo Port 3001 (API):
netstat -an | findstr :3001
echo.
echo Port 3000 (Web):
netstat -an | findstr :3000

echo.
echo 🎉 Services should now be running!
echo.
echo 📱 Open your browser and go to: http://localhost:3000
echo 🔌 API is running on: http://localhost:3001
echo.
echo 💡 If you see "LISTENING" status above, the services are running
echo 💡 If you see nothing, check the command windows for error messages
echo.
echo 🆘 Troubleshooting:
echo    1. Check both command windows for error messages
echo    2. Make sure no other apps are using ports 3000/3001
echo    3. Try refreshing your browser
echo.
pause
