# Test Files for PDF Reconstructor

This directory contains test PDF files to validate the PDF reconstruction functionality.

## Available Test Files

### 1. `jumbled.pdf` ✅
- **Type**: Multi-page document with shuffled pages
- **Pages**: 6 pages
- **Content**: Mixed text and layout content
- **Status**: Tested and working

### 2. `Loan-Agreement-Shuffled-Scanned.pdf` 📋
- **Type**: Scanned loan agreement document
- **Content**: Legal document with multiple sections
- **Use Case**: Test OCR and content-based ordering
- **Note**: Please add the actual PDF file here

### 3. `ordered.pdf` 📄
- **Type**: Output file from reconstruction
- **Content**: Reconstructed version of jumbled.pdf
- **Generated**: Automatically by the system

## How to Test

1. **Upload any PDF** through the web interface
2. **Select processing options**:
   - Enable AI embeddings for intelligent ordering
   - Choose OCR language if needed
   - Enable duplicate detection if desired
3. **Watch the reconstruction** in real-time
4. **Download results**:
   - `ordered.pdf` - Reconstructed document
   - `report.html` - Detailed analysis report
   - `log.json` - Processing log with confidence scores

## Expected Results

- **Page Order**: Intelligently determined using AI content analysis
- **Confidence Score**: Shows how certain the system is about the ordering
- **Processing Time**: Varies based on document size and complexity
- **Output Quality**: High-quality reconstructed PDF with proper page sequence

## Adding Your Own Test Files

1. Place your PDF files in this `examples/` directory
2. Use the web interface to upload and process them
3. Compare the reconstructed output with the original
4. Check the confidence scores and reasoning provided
