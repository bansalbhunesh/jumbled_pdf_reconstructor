@echo off
echo Setting up PDF Reconstructor...

REM Install root dependencies
echo Installing root dependencies...
npm install

REM Install web dependencies
echo Installing web dependencies...
cd web
npm install
cd ..

REM Create necessary directories
echo Creating necessary directories...
if not exist "uploads" mkdir uploads
if not exist "runs" mkdir runs
if not exist ".tmp" mkdir .tmp
if not exist ".cache" mkdir .cache
if not exist ".cache\transformers" mkdir .cache\transformers

echo.
echo Setup complete! Run start.bat to start the services.
pause
