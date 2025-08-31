@echo off
echo Fixing corrupted Git repository...

REM Remove the corrupted .git directory
echo Removing corrupted .git directory...
rmdir /s /q .git

REM Reinitialize Git properly
echo Reinitializing Git repository...
git init

REM Add all files
echo Adding all files...
git add .

REM Make initial commit
echo Making initial commit...
git commit -m "Initial commit: PDF Reconstructor project"

echo.
echo Git repository fixed and initialized successfully!
echo.
pause
