@echo off
echo ========================================
echo    PDF Reconstructor - Complete Setup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not available
    pause
    exit /b 1
)

echo ✅ npm found:
npm --version

REM Check if ports are available
echo.
echo 🔍 Checking port availability...
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 3000 is already in use
    echo Stopping existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

netstat -ano | findstr :3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 3001 is already in use
    echo Stopping existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

echo ✅ Ports 3000 and 3001 are available

REM Check if dependencies are installed
echo.
echo 📦 Checking dependencies...
if not exist "node_modules" (
    echo Installing root dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install root dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Root dependencies found
)

if not exist "web\node_modules" (
    echo Installing web dependencies...
    cd web
    npm install
    cd ..
    if %errorlevel% neq 0 (
        echo ❌ Failed to install web dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Web dependencies found
)

REM Create necessary directories
echo.
echo 📁 Creating necessary directories...
if not exist "uploads" mkdir uploads
if not exist "runs" mkdir runs
if not exist ".tmp" mkdir .tmp
if not exist ".cache" mkdir .cache
if not exist ".cache\transformers" mkdir .cache\transformers

echo ✅ Directories created

REM Start the backend server
echo.
echo 🚀 Starting backend server on port 3001...
start "Backend Server" cmd /k "npm run api:dev"

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 8 /nobreak >nul

REM Test if backend is responding
echo 🔍 Testing backend connection...
curl -s http://localhost:3001/jobs/models/available >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Backend may not be fully started yet, continuing...
) else (
    echo ✅ Backend is responding
)

REM Start the frontend
echo.
echo 🌐 Starting frontend on port 3000...
start "Frontend" cmd /k "cd web && npm run dev"

REM Wait for frontend to start
echo ⏳ Waiting for frontend to start...
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo           🎉 Setup Complete!
echo ========================================
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔌 Backend:  http://localhost:3001
echo.
echo 📋 What to do next:
echo 1. Open http://localhost:3000 in your browser
echo 2. Upload a PDF file from the examples folder
echo 3. Configure processing options
echo 4. Click "Reconstruct PDF"
echo.
echo 📁 Example PDFs available in: examples/
echo 📊 Results will be saved in: runs/[job-id]/
echo.
echo Press any key to close this window...
pause >nul
