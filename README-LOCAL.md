# PDF Reconstructor - Local Development Setup

This guide will help you run the PDF Reconstructor application locally without Docker.

## Prerequisites

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)

## Quick Start

### Option 1: Using the startup script (Recommended)

#### On Windows:
```bash
start-local.bat
```

#### On macOS/Linux:
```bash
chmod +x start-local.sh
./start-local.sh
```

### Option 2: Manual startup

1. **Install dependencies:**
   ```bash
   npm install
   cd web && npm install && cd ..
   ```

2. **Build the server:**
   ```bash
   npm run api:build
   ```

3. **Start the API server (in one terminal):**
   ```bash
   npm run api:start
   ```

4. **Start the web frontend (in another terminal):**
   ```bash
   cd web
   npm run dev
   ```

## What the app does

The PDF Reconstructor is an intelligent application that:

1. **Uploads PDFs** - Accepts PDF files up to 50MB
2. **Analyzes content** - Uses AI-powered analysis to understand document structure
3. **Reorders pages** - Intelligently determines the correct page sequence
4. **Generates reports** - Creates detailed analysis, TOC, and processing logs
5. **Downloads results** - Provides the reconstructed PDF and analysis files

## Architecture

- **Frontend**: Next.js React app running on port 3000
- **Backend**: NestJS API server running on port 3001
- **Storage**: Local file system for uploads and job results

## API Endpoints

- `POST /jobs` - Upload PDF and create reconstruction job
- `GET /jobs/:id` - Get job status and progress
- `GET /jobs/:id/files/:name` - Download job result files

## Troubleshooting

### Common Issues

1. **Port already in use:**
   - Change the port in `server/main.ts` (line 25)
   - Change the port in `web/package.json` scripts

2. **CORS errors:**
   - Ensure the frontend is running on `http://localhost:3000`
   - Check CORS configuration in `server/main.ts`

3. **File upload fails:**
   - Check that the `uploads/` directory exists
   - Ensure proper file permissions

4. **Job processing fails:**
   - Check that the `runs/` directory exists
   - Look at server console logs for detailed error messages

### Logs

- **API Server**: Check the terminal running `npm run api:start`
- **Web Frontend**: Check the terminal running `npm run dev` in the web directory

## Development

### Project Structure

```
pdf-reconstructor/
├── server/           # NestJS backend API
│   ├── jobs/        # Job processing logic
│   ├── main.ts      # Server entry point
│   └── app.module.ts
├── web/             # Next.js frontend
│   ├── pages/       # React pages
│   ├── components/  # Reusable components
│   └── package.json
├── uploads/         # Uploaded PDF files
├── runs/            # Job output files
└── package.json     # Root dependencies
```

### Adding Features

1. **Backend**: Add new endpoints in `server/jobs/jobs.controller.ts`
2. **Frontend**: Add new pages in `web/pages/` or components in `web/components/`
3. **Processing**: Extend the job service in `server/jobs/jobs.service.ts`

## Production Deployment

For production deployment, consider:
- Using environment variables for configuration
- Setting up proper logging and monitoring
- Implementing authentication and rate limiting
- Using cloud storage for file uploads
- Setting up a production database for job tracking

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all dependencies are installed
3. Ensure ports 3000 and 3001 are available
4. Check file permissions for uploads and runs directories
