# PowerShell script to initialize Git repository for PDF Reconstructor

Write-Host "Setting up Git repository for PDF Reconstructor..." -ForegroundColor Green

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git is not installed or not in PATH. Please install Git first." -ForegroundColor Red
    exit 1
}

# Check if we're in a Git repository
if (Test-Path ".git") {
    Write-Host "Git repository already exists." -ForegroundColor Yellow
} else {
    Write-Host "Initializing Git repository..." -ForegroundColor Green
    git init
}

# Add all files
Write-Host "Adding all files to Git..." -ForegroundColor Green
git add .

# Check if there are files to commit
$status = git status --porcelain
if ($status) {
    Write-Host "Making initial commit..." -ForegroundColor Green
    git commit -m "Initial commit: PDF Reconstructor project

- PDF page analysis and ordering
- Web interface for document reconstruction  
- Server-side processing capabilities
- Docker support
- TypeScript/Node.js backend"
    
    Write-Host "Initial commit completed successfully!" -ForegroundColor Green
} else {
    Write-Host "No files to commit. Repository might be empty or all files are ignored." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Git repository setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To add a remote origin, run:" -ForegroundColor Cyan
Write-Host "  git remote add origin YOUR_REPOSITORY_URL" -ForegroundColor White
Write-Host ""
Write-Host "To push to remote, run:" -ForegroundColor Cyan
Write-Host "  git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
