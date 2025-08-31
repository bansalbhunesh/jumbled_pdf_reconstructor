@echo off
echo 🔍 Testing PDF Reconstructor Connections
echo ======================================
echo.

echo 🔌 Testing API Server (Port 3001)...
curl -s http://localhost:3001 >nul 2>&1
if errorlevel 1 (
    echo ❌ API Server is NOT responding on port 3001
    echo 💡 Make sure the API server is running
) else (
    echo ✅ API Server is responding on port 3001
)

echo.
echo 🌐 Testing Web Frontend (Port 3000)...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ❌ Web Frontend is NOT responding on port 3000
    echo 💡 Make sure the web frontend is running
) else (
    echo ✅ Web Frontend is responding on port 3000
)

echo.
echo 📊 Port Status Check:
echo.
echo Port 3001 (API):
netstat -an | findstr :3001
echo.
echo Port 3000 (Web):
netstat -an | findstr :3000

echo.
echo 💡 If you see "LISTENING" status, the services are running
echo 💡 If you see nothing, the services are not running
echo.
pause
