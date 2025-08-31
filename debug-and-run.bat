@echo off
echo 🔍 PDF Reconstructor - Debug & Run Script
echo =========================================
echo.

echo 📋 Checking system requirements...
echo.

REM Check Node.js
echo 🔍 Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is NOT installed!
    echo 💡 Please install Node.js from https://nodejs.org
    echo 📥 Download the LTS version and restart your computer
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js: %%i
)

REM Check npm
echo.
echo 🔍 Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is NOT installed!
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo ✅ npm: %%i
)

echo.
echo 📁 Checking project structure...
if not exist "package.json" (
    echo ❌ package.json not found! Are you in the right directory?
    pause
    exit /b 1
) else (
    echo ✅ package.json found
)

if not exist "server" (
    echo ❌ server folder not found!
    pause
    exit /b 1
) else (
    echo ✅ server folder found
)

if not exist "web" (
    echo ❌ web folder not found!
    pause
    exit /b 1
) else (
    echo ✅ web folder found
)

echo.
echo 🔌 Checking port availability...
netstat -an | findstr :3000 >nul 2>&1
if not errorlevel 1 (
    echo ❌ Port 3000 is already in use!
    echo 💡 Close other applications using port 3000
    echo 🔍 Run: netstat -an ^| findstr :3000 to see what's using it
    pause
    exit /b 1
) else (
    echo ✅ Port 3000 is available
)

netstat -an | findstr :3001 >nul 2>&1
if not errorlevel 1 (
    echo ❌ Port 3001 is already in use!
    echo 💡 Close other applications using port 3001
    echo 🔍 Run: netstat -an ^| findstr :3001 to see what's using it
    pause
    exit /b 1
) else (
    echo ✅ Port 3001 is available
)

echo.
echo 📦 Installing root dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install root dependencies
    echo 💡 Check your internet connection and try again
    pause
    exit /b 1
) else (
    echo ✅ Root dependencies installed successfully
)

echo.
echo 🌐 Installing web dependencies...
cd web
call npm install
cd ..
if errorlevel 1 (
    echo ❌ Failed to install web dependencies
    echo 💡 Check your internet connection and try again
    pause
    exit /b 1
) else (
    echo ✅ Web dependencies installed successfully
)

echo.
echo 🔨 Building server...
call npm run api:build
if errorlevel 1 (
    echo ❌ Failed to build server
    echo 💡 Check the error messages above
    pause
    exit /b 1
) else (
    echo ✅ Server built successfully
)

echo.
echo 🚀 Starting API server...
start "API Server - Debug" cmd /k "echo 🚀 API Server Starting... && npm run api:start"

echo.
echo ⏳ Waiting 10 seconds for API server to start...
timeout /t 10 /nobreak >nul

echo.
echo 🔍 Testing API server...
curl -s http://localhost:3001 >nul 2>&1
if errorlevel 1 (
    echo ❌ API server is not responding on port 3001
    echo 💡 Check the API Server window for error messages
    echo 🔍 The server might need more time to start
) else (
    echo ✅ API server is responding on port 3001
)

echo.
echo 🌐 Starting web frontend...
cd web
start "Web Frontend - Debug" cmd /k "echo 🌐 Web Frontend Starting... && npm run dev"
cd ..

echo.
echo ⏳ Waiting 10 seconds for web frontend to start...
timeout /t 10 /nobreak >nul

echo.
echo 🔍 Testing web frontend...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ❌ Web frontend is not responding on port 3000
    echo 💡 Check the Web Frontend window for error messages
    echo 🔍 The frontend might need more time to start
) else (
    echo ✅ Web frontend is responding on port 3000
)

echo.
echo 📊 Final Status Check...
echo.
echo 🔌 API Server Status:
netstat -an | findstr :3001
echo.
echo 🌐 Web Frontend Status:
netstat -an | findstr :3000

echo.
echo 🎉 Setup Complete! Check the command windows above.
echo.
echo 📱 If everything is working:
echo    🌐 Open http://localhost:3000 in your browser
echo    🔌 API is running on http://localhost:3001
echo.
echo 🆘 If you see errors:
echo    1. Check both command windows for error messages
echo    2. Copy and paste the error messages here
echo    3. Make sure no other apps are using ports 3000/3001
echo.
echo 💡 To stop services: Close the command windows
echo.
pause
