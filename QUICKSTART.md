# 🚀 Quick Start - PDF Reconstructor

Get your PDF Reconstructor app running in 5 minutes!

## ⚡ Super Quick Start (Windows)

1. **Double-click** `start-local.bat`
2. **Wait** for both services to start
3. **Open** http://localhost:3000 in your browser
4. **Upload** a PDF and test!

## ⚡ Super Quick Start (Mac/Linux)

1. **Open terminal** in this folder
2. **Run**: `chmod +x start-local.sh && ./start-local.sh`
3. **Wait** for both services to start
4. **Open** http://localhost:3000 in your browser
5. **Upload** a PDF and test!

## 🔧 Manual Setup (if scripts don't work)

### Step 1: Install Dependencies
```bash
npm install
cd web && npm install && cd ..
```

### Step 2: Build the Server
```bash
npm run api:build
```

### Step 3: Start the API Server
```bash
npm run api:start
```
**Keep this terminal open!**

### Step 4: Start the Web Frontend (new terminal)
```bash
cd web
npm run dev
```

### Step 5: Test the App
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001

## 🧪 Test Everything Works

1. **Upload a PDF** (any PDF file)
2. **Check the job status** page
3. **Download the reconstructed PDF**
4. **View the analysis report**

## 🚨 Common Issues & Fixes

### "Port already in use"
- **Solution**: Close other apps using ports 3000/3001
- **Alternative**: Kill processes: `npx kill-port 3000 3001`

### "Module not found"
- **Solution**: Run `npm install` in both root and web folders

### "CORS error"
- **Solution**: Make sure both services are running on correct ports

### "Upload failed"
- **Solution**: Check that `uploads/` and `runs/` folders exist

## 📱 What You'll See

- **Beautiful web interface** for uploading PDFs
- **Real-time job progress** tracking
- **Downloadable results** including:
  - Reconstructed PDF
  - Analysis report
  - Table of contents
  - Processing logs

## 🎯 Next Steps

- **Customize processing options** in the web interface
- **Upload different types of PDFs** to test
- **Check the server logs** for detailed processing info
- **Explore the generated reports** and analysis files

## 🆘 Need Help?

1. **Check the console logs** in both terminal windows
2. **Verify ports are free**: `netstat -an | findstr :3000` (Windows) or `lsof -i :3000` (Mac/Linux)
3. **Restart both services** if needed
4. **Check file permissions** for uploads and runs folders

---

**🎉 You're all set!** Your PDF Reconstructor is now running locally and ready to process PDFs!
