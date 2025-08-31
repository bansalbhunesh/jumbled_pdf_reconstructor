@echo off
echo Starting PDF Reconstructor...

REM Start the backend server
echo Starting backend server on port 3001...
start "Backend Server" cmd /k "npm run api:dev"

REM Wait a moment for backend to start
timeout /t 5 /nobreak > nul

REM Start the frontend
echo Starting frontend on port 3000...
start "Frontend" cmd /k "cd web && npm run dev"

echo.
echo Services are starting up...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
