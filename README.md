# PDF Reconstructor 🚀

An intelligent PDF page reordering tool that analyzes jumbled PDFs and reconstructs them to their logical sequence using AI-powered content analysis.

## ✨ Features

- **📄 PDF Upload & Processing**: Accepts multi-page scanned PDFs
- **🧠 AI-Powered Analysis**: Uses OCR, embeddings, and content analysis
- **🔄 Smart Page Reordering**: Intelligently determines logical page sequence
- **📊 Comprehensive Reports**: Detailed logs, reasoning, and analysis
- **🔍 Duplicate Detection**: Identifies and reports duplicate pages
- **📖 Table of Contents**: Auto-generates TOC from detected sections
- **🌐 Modern Web Interface**: Beautiful, responsive UI for easy use
- **🔌 RESTful API**: Full API for integration and automation

## 🚀 One-Click Startup

### Windows Users
1. **Start Docker Desktop** (make sure it's running)
2. **Double-click** `start.bat`
3. **Wait** for services to start (about 10 seconds)
4. **Open** http://localhost:3000 in your browser

### Mac/Linux Users
1. **Start Docker Desktop** (make sure it's running)
2. **Run** `./start.sh` in terminal
3. **Wait** for services to start (about 10 seconds)
4. **Open** http://localhost:3000 in your browser

## 🐳 Docker Architecture

The system runs in containers:
- **Frontend**: Next.js web app (port 3000)
- **Backend**: NestJS API server (port 3001)
- **Storage**: Persistent volumes for uploads and results

## 📁 What Gets Generated

For each processed PDF, you get:
- `ordered.pdf` - Reconstructed PDF with correct page order
- `log.json` - Processing details and reasoning
- `report.html` - Human-readable analysis report
- `toc.json` - Table of contents data
- `dup_missing.json` - Duplicate and missing page analysis

## 🔧 Manual Commands

### Start Everything
```bash
docker-compose up --build -d
```

### Stop Everything
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Rebuild & Restart
```bash
docker-compose down
docker-compose up --build -d
```

## 🌐 Access Points

- **Web Interface**: http://localhost:3000
- **API Server**: http://localhost:3001
- **API Docs**: http://localhost:3001/jobs

## 📤 API Usage

### Upload PDF
```bash
curl -X POST -F "file=@your-file.pdf" http://localhost:3001/jobs
```

### Check Job Status
```bash
curl http://localhost:3001/jobs/{job-id}
```

### Download Results
```bash
curl http://localhost:3001/jobs/{job-id}/files/{filename}
```

## 🎯 Perfect For

- **Mortgage & Lending**: Process jumbled loan documents
- **Legal Documents**: Reconstruct case files and contracts
- **Academic Papers**: Fix research paper page sequences
- **Business Reports**: Organize scattered business documents
- **Any Multi-Page PDF**: When pages get mixed up during scanning

## 🛠️ System Requirements

- **Docker Desktop** (latest version)
- **4GB RAM** minimum (8GB recommended)
- **2GB disk space** for the application
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🔍 Troubleshooting

### Port Already in Use
```bash
docker-compose down
docker-compose up --build -d
```

### Docker Not Running
- Start Docker Desktop
- Wait for it to fully load
- Run the startup script again

### Build Errors
```bash
docker-compose down
docker system prune -f
docker-compose up --build -d
```

## 📈 Performance

- **Small PDFs** (< 10 pages): 10-30 seconds
- **Medium PDFs** (10-50 pages): 1-3 minutes
- **Large PDFs** (50+ pages): 3-10 minutes

## 🎉 Ready to Use!

Your PDF Reconstructor system is now running with:
- ✅ **Frontend**: Modern web interface
- ✅ **Backend**: Powerful API server
- ✅ **Storage**: Persistent data storage
- ✅ **Networking**: Container communication
- ✅ **One-click startup**: Easy deployment

**Start processing your jumbled PDFs now!** 🚀
