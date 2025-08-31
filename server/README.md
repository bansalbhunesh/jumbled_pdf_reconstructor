# PDF Reconstructor - Backend Service

This is the backend service for the PDF Reconstructor application, which intelligently reorders jumbled PDF pages using AI-powered content analysis.

## 🚀 Features

- **Page Content Analysis**: Uses OCR to extract text from PDF pages
- **Intelligent Page Ordering**: Determines logical page flow using content similarity
- **Duplicate Detection**: Identifies duplicate pages using perceptual hashing
- **Table of Contents Generation**: Automatically creates TOC based on detected headings
- **Auto-rotation**: Corrects page orientation issues
- **Comprehensive Reporting**: Generates detailed HTML reports and logs

## 🏗️ Architecture

### Core Components

1. **PdfProcessorService** (`services/pdf-processor.service.js`)
   - Main PDF processing logic
   - Page extraction and analysis
   - OCR processing with Tesseract.js
   - Content similarity analysis
   - PDF reconstruction

2. **JobsService** (`jobs/jobs.service.new.js`)
   - Job management and queuing
   - Progress tracking
   - Output file generation
   - HTML report generation

3. **Storage Service** (`storage.js`)
   - File management
   - Output directory handling

## 📦 Dependencies

```bash
npm install pdf-parse pdf-lib tesseract.js sharp
```

### Key Libraries

- **pdf-parse**: PDF text extraction
- **pdf-lib**: PDF manipulation and reconstruction
- **tesseract.js**: OCR processing
- **sharp**: Image processing for perceptual hashing

## 🔧 Configuration

The service accepts the following processing options:

```typescript
interface ProcessingOptions {
  emb: boolean;        // Use AI embeddings for page ordering
  phash: boolean;      // Enable perceptual hashing for duplicate detection
  embedToc: boolean;   // Generate and embed table of contents
  autorotate: boolean; // Auto-correct page orientation
  ocrLang: string;     // OCR language (e.g., 'eng', 'spa', 'fra')
}
```

## 🚀 Usage

### 1. Start the Server

```bash
cd server
npm start
```

### 2. Upload a PDF

Send a POST request to `/jobs` with:
- PDF file in multipart form data
- Processing options as query parameters

### 3. Monitor Progress

Check job status at `/jobs/{id}` to see:
- Processing progress
- Current status
- Error messages (if any)

### 4. Download Results

When complete, download:
- `ordered.pdf` - Reconstructed PDF
- `report.html` - Detailed HTML report
- `log.json` - Processing log
- `toc.json` - Table of contents data
- `dup_missing.json` - Duplicate and missing page info
- `reasoning.txt` - Page ordering explanation

## 🧪 Testing

Test the PDF processor directly:

```bash
cd server
node test-pdf-processor.js
```

This will process a sample PDF and show detailed results.

## 📊 Output Files

### ordered.pdf
The reconstructed PDF with pages in the correct order.

### report.html
Beautiful HTML report showing:
- Page order determination
- Duplicate page groups
- Missing pages
- Table of contents
- Processing log
- Reasoning for page ordering

### log.json
Structured JSON with processing details:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "originalFile": "input.pdf",
  "processingResult": { ... },
  "summary": {
    "totalPages": 10,
    "duplicatesFound": 2,
    "missingPages": 0,
    "tocEntries": 5
  }
}
```

### toc.json
Table of contents structure:
```json
[
  {
    "title": "Introduction",
    "pageNumber": 1,
    "level": 1
  },
  {
    "title": "Chapter 1",
    "pageNumber": 3,
    "level": 1
  }
]
```

### dup_missing.json
Duplicate and missing page information:
```json
{
  "duplicates": [[0, 5], [2, 7]],
  "missingPages": []
}
```

## 🔍 How It Works

### 1. Page Extraction
- Loads PDF and extracts all pages
- Converts each page to image for OCR processing

### 2. Content Analysis
- Performs OCR on each page using specified language
- Generates perceptual hashes for duplicate detection
- Analyzes text content for heading patterns

### 3. Page Ordering
- Uses content similarity analysis to determine logical flow
- Identifies introductory pages (abstract, introduction, etc.)
- Builds page sequence based on content relationships

### 4. Duplicate Detection
- Groups pages by perceptual hash
- Identifies pages with identical or very similar content
- Reports duplicate groups for user review

### 5. PDF Reconstruction
- Creates new PDF with pages in determined order
- Applies any necessary rotations
- Embeds table of contents if requested

### 6. Report Generation
- Creates comprehensive HTML report
- Generates JSON logs for programmatic access
- Provides reasoning for page ordering decisions

## 🐛 Troubleshooting

### Common Issues

1. **OCR Failures**
   - Ensure Tesseract.js is properly installed
   - Check OCR language support
   - Verify PDF has readable text/images

2. **Memory Issues**
   - Large PDFs may require more memory
   - Consider processing in batches for very large files

3. **Page Ordering Issues**
   - Enable embeddings for better ordering
   - Check OCR quality and text extraction
   - Review content similarity thresholds

### Debug Mode

Enable detailed logging by setting:
```bash
export DEBUG=pdf-processor:*
```

## 🔮 Future Enhancements

- **AI Embeddings**: Integrate with OpenAI/Claude for better content understanding
- **Machine Learning**: Train models on document structure patterns
- **Batch Processing**: Handle multiple PDFs simultaneously
- **Cloud Integration**: Support for cloud storage providers
- **API Rate Limiting**: Protect against abuse
- **Webhook Support**: Notify external systems of job completion

## 📝 License

This project is licensed under the MIT License.
