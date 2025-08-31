@echo off
echo 🚀 Starting PDF Reconstructor...
echo ================================

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
    pause
    exit /b 1
)

echo.
echo 🚀 Starting API server...
start "API Server" cmd /k "npm run api:start"

echo.
echo ⏳ Waiting 5 seconds for API to start...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Starting web frontend...
cd web
start "Web Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ⏳ Waiting 5 seconds for web to start...
timeout /t 5 /nobreak >nul

echo.
echo ✅ PDF Reconstructor is starting!
echo.
echo 🌐 Open your browser and go to: http://localhost:3000
echo 🔌 API server is running on: http://localhost:3001
echo.
echo 📁 Upload a PDF to test the system!
echo.
echo 💡 Close the command windows to stop the services
echo.
pause
