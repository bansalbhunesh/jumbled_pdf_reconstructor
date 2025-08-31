# 🚀 RUN EVERYTHING - PDF Reconstructor

## 🎯 **ONE COMMAND TO RULE THEM ALL**

### Windows Users:
```bash
start-complete.bat
```

### Linux/Mac Users:
```bash
chmod +x start-complete.sh
./start-complete.sh
```

---

## 🔧 **What These Scripts Do Automatically:**

1. ✅ **Check Node.js** (version 18+ required)
2. ✅ **Check npm** availability
3. ✅ **Free up ports** 3000 and 3001 if needed
4. ✅ **Install dependencies** (root + web)
5. ✅ **Create directories** (uploads, runs, cache, etc.)
6. ✅ **Start backend server** on port 3001
7. ✅ **Start frontend** on port 3000
8. ✅ **Test connections** and verify everything works
9. ✅ **Provide clear instructions** for next steps

---

## 🌐 **Access Points After Running:**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Test**: http://localhost:3001/jobs/models/available

---

## 📱 **Test the Application:**

1. **Open**: http://localhost:3000
2. **Upload**: Use `examples/jumbled.pdf` or any PDF
3. **Configure**: Set your preferred options
4. **Process**: Click "Reconstruct PDF"
5. **Monitor**: Watch progress and view results

---

## 🐛 **If Something Goes Wrong:**

### **Port Issues:**
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Linux/Mac
lsof -i :3000
lsof -i :3001
```

### **Dependency Issues:**
```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json
cd web && rm -rf node_modules package-lock.json && cd ..
npm install
cd web && npm install && cd ..
```

### **Manual Start (if scripts fail):**
```bash
# Terminal 1: Backend
npm run api:dev

# Terminal 2: Frontend
cd web && npm run dev
```

---

## 📁 **Project Structure:**
```
├── start-complete.bat      # 🚀 Windows startup script
├── start-complete.sh       # 🚀 Linux/Mac startup script
├── setup.bat              # 📦 Windows setup script
├── setup.sh               # 📦 Linux/Mac setup script
├── src/                   # 🔧 Core processing logic
├── server/                # 🔌 Backend API (NestJS)
├── web/                   # 🌐 Frontend (Next.js)
├── examples/              # 📄 Test PDF files
├── uploads/               # 📤 File uploads
├── runs/                  # 📊 Processing results
└── config.json           # ⚙️ Configuration
```

---

## 🎉 **Success Indicators:**

- ✅ Backend shows: "🚀 PDF Reconstructor API running on http://127.0.0.1:3001"
- ✅ Frontend shows: "Ready - started server on 0.0.0.0:3000"
- ✅ Upload area accepts PDF files
- ✅ Processing options are configurable
- ✅ Jobs can be created and monitored

---

## 🆘 **Still Having Issues?**

1. **Check logs** in both terminal windows
2. **Verify Node.js** version 18+ is installed
3. **Ensure ports** 3000 and 3001 are available
4. **Check file permissions** for uploads/runs directories
5. **Restart services** if needed

---

## 📋 **Quick Commands Reference:**

```bash
# Setup (one-time)
setup.bat                    # Windows
./setup.sh                   # Linux/Mac

# Start everything
start-complete.bat           # Windows
./start-complete.sh          # Linux/Mac

# Manual start
npm run api:dev              # Backend
cd web && npm run dev        # Frontend

# Build for production
npm run api:build            # Backend
cd web && npm run build      # Frontend
```

---

**🎯 The `start-complete.bat` (Windows) or `start-complete.sh` (Linux/Mac) script will handle everything automatically!**
