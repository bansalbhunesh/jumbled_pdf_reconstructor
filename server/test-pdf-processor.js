const { PdfProcessorService } = require('./services/pdf-processor.service');
const path = require('path');

async function testPdfProcessor() {
  console.log('Testing PDF Processor Service...\n');
  
  const processor = new PdfProcessorService();
  
  // Test with a sample PDF if available
  const testPdfPath = path.join(__dirname, '..', 'examples', 'jumbled.pdf');
  
  try {
    if (require('fs').existsSync(testPdfPath)) {
      console.log(`Found test PDF: ${testPdfPath}`);
      
      const outputPath = path.join(__dirname, 'test-output.pdf');
      
      const options = {
        emb: true,
        phash: true,
        embedToc: true,
        autorotate: true,
        ocrLang: 'eng'
      };
      
      console.log('Processing PDF with options:', options);
      console.log('This may take a few minutes...\n');
      
      const result = await processor.processPdf(testPdfPath, outputPath, options);
      
      console.log('\n✅ PDF Processing Completed Successfully!');
      console.log('\nResults:');
      console.log(`- Total Pages: ${result.orderedPages.length}`);
      console.log(`- Duplicate Groups: ${result.duplicates.length}`);
      console.log(`- Missing Pages: ${result.missingPages.length}`);
      console.log(`- TOC Entries: ${result.tableOfContents.length}`);
      console.log(`- Output PDF: ${outputPath}`);
      
      if (result.duplicates.length > 0) {
        console.log('\nDuplicate Pages:');
        result.duplicates.forEach((group, index) => {
          console.log(`  Group ${index + 1}: Pages ${group.map(p => p + 1).join(', ')}`);
        });
      }
      
      if (result.tableOfContents.length > 0) {
        console.log('\nTable of Contents:');
        result.tableOfContents.forEach(entry => {
          const indent = '  '.repeat(entry.level - 1);
          console.log(`${indent}• ${entry.title} (Page ${entry.pageNumber})`);
        });
      }
      
      console.log('\nProcessing Log:');
      result.log.forEach(entry => {
        console.log(`  ${entry}`);
      });
      
    } else {
      console.log('No test PDF found. Please place a PDF file in the examples directory.');
      console.log('You can test the service by uploading a PDF through the web interface.');
    }
    
  } catch (error) {
    console.error('\n❌ Error testing PDF processor:', error.message);
    console.error('\nStack trace:', error.stack);
  }
}

// Run the test
testPdfProcessor().catch(console.error);
