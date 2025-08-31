# PDF Reconstructor

An intelligent PDF page reordering system that uses AI to reconstruct jumbled PDF documents.

## Features

- **AI-Powered Analysis**: Uses advanced OCR and content analysis to understand document structure
- **Smart Page Ordering**: Intelligent algorithms determine logical page flow
- **Duplicate Detection**: Identifies and reports duplicate pages
- **Auto-rotation**: Corrects page orientation automatically
- **Table of Contents**: Generates automatic TOC from detected headings
- **Multiple AI Models**: Support for various embedding models with different capabilities

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Windows 10/11 (for .bat scripts) or Linux/Mac (for shell scripts)

### Setup

1. **Clone and navigate to the project:**
   ```bash
   cd jumbled_pdf_reconstructor
   ```

2. **Run the setup script:**
   - Windows: `setup.bat`
   - Linux/Mac: `chmod +x setup.sh && ./setup.sh`

3. **Start the services:**
   - Windows: `start.bat`
   - Linux/Mac: `chmod +x start.sh && ./start.sh`

### Manual Setup

If you prefer manual setup:

1. **Install dependencies:**
   ```bash
   npm install
   cd web && npm install && cd ..
   ```

2. **Create necessary directories:**
   ```bash
   mkdir -p uploads runs .tmp .cache/transformers
   ```

3. **Start the backend server:**
   ```bash
   npm run api:dev
   ```

4. **In a new terminal, start the frontend:**
   ```bash
   cd web && npm run dev
   ```

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Upload a PDF file (up to 50MB)
3. Configure processing options:
   - **AI Page Ordering**: Use content analysis for logical page flow
   - **Duplicate Detection**: Identify duplicate pages
   - **Auto-rotate**: Correct page orientation
   - **Generate TOC**: Create automatic table of contents
   - **OCR Language**: Select text recognition language
   - **AI Model**: Choose embedding model for analysis
4. Click "Reconstruct PDF" to start processing
5. Monitor progress and view results

## API Endpoints

- `POST /jobs` - Upload and process a PDF
- `GET /jobs/:id` - Get job status and results
- `GET /jobs/:id/files/:name` - Download processed files
- `GET /jobs/models/available` - List available AI models

## Configuration

Edit `config.json` to customize:
- Server ports and CORS settings
- File upload limits
- Processing options
- AI model preferences
- Logging levels

## Project Structure

```
├── src/                    # Core processing logic
│   ├── analysis/          # AI analysis modules
│   ├── pdf/              # PDF processing
│   ├── order/            # Page ordering algorithms
│   └── export/           # Output generation
├── server/                # NestJS backend API
├── web/                   # Next.js frontend
├── uploads/               # Temporary file storage
├── runs/                  # Processing results
└── config.json           # Configuration file
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000 and 3001 are available
2. **Dependencies**: Run `npm install` in both root and web directories
3. **AI models**: First run may download models (check `.cache/transformers`)
4. **File permissions**: Ensure write access to uploads, runs, and cache directories

### Logs

- Backend logs appear in the backend terminal
- Frontend logs appear in the browser console
- Processing logs are saved in `runs/[job-id]/`

## Development

### Backend Development
```bash
npm run api:dev          # Start with hot reload
npm run api:build        # Build for production
npm run api:start        # Start production build
```

### Frontend Development
```bash
cd web
npm run dev             # Start with hot reload
npm run build           # Build for production
npm run start           # Start production build
```

### Testing
```bash
npm test                # Run tests
npm run cli             # Run CLI version
```

## License

This project is licensed under the MIT License.
