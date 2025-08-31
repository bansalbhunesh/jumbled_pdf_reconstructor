@echo off
echo 🚀 Starting PDF Reconstructor System...
echo ======================================

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Build and start everything
echo 🔨 Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check service status
echo 📊 Checking service status...
docker-compose ps

echo.
echo ✅ PDF Reconstructor System is starting up!
echo.
echo 🌐 Web Interface: http://localhost:3000
echo 🔌 API Server: http://localhost:3001
echo.
echo 📁 Upload your PDF files through the web interface
echo 📊 Monitor jobs and download results
echo.
echo To stop the system, run: docker-compose down
echo To view logs, run: docker-compose logs -f
echo.
pause
