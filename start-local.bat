@echo off
echo 🚀 Starting PDF Reconstructor System (Local Development)...
echo ==========================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Install dependencies if needed
echo 📦 Installing dependencies...
call npm install
cd web && call npm install && cd ..

REM Build the server
echo 🔨 Building server...
call npm run api:build

REM Start the API server in a new window
echo 🚀 Starting API server on port 3001...
start "PDF Reconstructor API" cmd /k "npm run api:start"

REM Wait for API server to start
echo ⏳ Waiting for API server to start...
timeout /t 5 /nobreak >nul

REM Start the web frontend in a new window
echo 🌐 Starting web frontend on port 3000...
cd web && start "PDF Reconstructor Web" cmd /k "npm run dev" && cd ..

REM Wait for web frontend to start
echo ⏳ Waiting for web frontend to start...
timeout /t 5 /nobreak >nul

echo.
echo ✅ PDF Reconstructor System is running!
echo.
echo 🌐 Web Interface: http://localhost:3000
echo 🔌 API Server: http://localhost:3001
echo.
echo 📁 Upload your PDF files through the web interface
echo 📊 Monitor jobs and download results
echo.
echo Close the command windows to stop the services
echo.
pause
