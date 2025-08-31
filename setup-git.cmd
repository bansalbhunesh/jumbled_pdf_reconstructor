@echo off
echo Setting up Git repository for PDF Reconstructor...

REM Check if Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo Git is not installed or not in PATH. Please install Git first.
    pause
    exit /b 1
)

REM Check if we're in a Git repository
if exist ".git" (
    echo Git repository already exists.
) else (
    echo Initializing Git repository...
    git init
)

REM Add all files
echo Adding all files to Git...
git add .

REM Make initial commit
echo Making initial commit...
git commit -m "Initial commit: PDF Reconstructor project

- PDF page analysis and ordering
- Web interface for document reconstruction
- Server-side processing capabilities
- Docker support
- TypeScript/Node.js backend"

echo.
echo Git repository setup complete!
echo.
echo To add a remote origin, run:
echo   git remote add origin YOUR_REPOSITORY_URL
echo.
echo To push to remote, run:
echo   git push -u origin main
echo.
pause
