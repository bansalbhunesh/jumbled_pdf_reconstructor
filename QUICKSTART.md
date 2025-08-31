# Quick Start Guide - PDF Reconstructor

## 🚀 Get Everything Running in 5 Minutes

### Step 1: Setup (One-time)
```bash
# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh
./setup.sh
```

### Step 2: Start Services
```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

### Step 3: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 🔧 Manual Setup (if scripts don't work)

### 1. Install Dependencies
```bash
# Root dependencies
npm install

# Web dependencies
cd web
npm install
cd ..
```

### 2. Create Directories
```bash
mkdir -p uploads runs .tmp .cache/transformers
```

### 3. Start Backend Server
```bash
npm run api:dev
```

### 4. Start Frontend (new terminal)
```bash
cd web
npm run dev
```

## 📱 Test the Application

1. **Open**: http://localhost:3000
2. **Upload**: Use one of the example PDFs in the `examples/` folder
3. **Configure**: Set your preferred options
4. **Process**: Click "Reconstruct PDF"
5. **Monitor**: Watch the progress and view results

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### AI Models Not Loading
- First run will download models (check `.cache/transformers/`)
- Ensure you have internet connection
- Models are ~100-500MB each

## 📁 Project Structure
```
├── src/                    # Core logic
├── server/                 # Backend API
├── web/                    # Frontend
├── uploads/                # File uploads
├── runs/                   # Results
├── examples/               # Test PDFs
└── config.json            # Configuration
```

## 🎯 What Happens When You Upload

1. **File Upload** → Stored in `uploads/`
2. **PDF Analysis** → Text extraction + OCR
3. **AI Processing** → Content embeddings + ordering
4. **Reconstruction** → New PDF with correct order
5. **Output** → Results saved in `runs/[job-id]/`

## 🔍 Monitor Progress

- **Backend logs**: Check the backend terminal
- **Frontend logs**: Browser console (F12)
- **Job status**: API endpoint `/jobs/:id`
- **Files**: Check `runs/[job-id]/` directory

## ✅ Success Indicators

- Backend shows: "🚀 PDF Reconstructor API running on http://127.0.0.1:3001"
- Frontend shows: "Ready - started server on 0.0.0.0:3000"
- Upload area accepts PDF files
- Processing options are configurable
- Jobs can be created and monitored

## 🆘 Still Having Issues?

1. **Check logs** in both terminals
2. **Verify ports** are available (3000, 3001)
3. **Ensure Node.js** version 18+ is installed
4. **Check file permissions** for uploads/runs directories
5. **Restart services** if needed

---

**Need help?** Check the main README.md for detailed documentation.
