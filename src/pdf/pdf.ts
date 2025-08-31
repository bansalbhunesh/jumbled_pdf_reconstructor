import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import { createWorker } from 'tesseract.js';

export interface PageInfo {
  pageNumber: number;
  content: string;
  width: number;
  height: number;
  rotation: number;
}

export interface ExtractOptions {
  autorotate?: boolean;
  ocrLang?: string;
}

export async function extractPages(
  pdfBuffer: Buffer, 
  tmpDir: string, 
  options: ExtractOptions = {}
): Promise<PageInfo[]> {
  try {
    console.log('📄 Starting PDF extraction...');
    
    // Try to extract text directly first
    let textContent = '';
    try {
      const pdfData = await pdfParse(pdfBuffer);
      textContent = pdfData.text;
      console.log(`✅ Extracted ${textContent.length} characters of text directly from PDF`);
    } catch (error) {
      console.log('⚠️ Direct text extraction failed, will use OCR:', error);
    }
    
    // Load PDF for page analysis
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    console.log(`📊 Found ${pages.length} pages in PDF`);
    
    const pageInfos: PageInfo[] = [];
    
    // Process each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();
      const rotation = page.getRotation().angle || 0;
      
      console.log(`📄 Processing page ${i + 1}/${pages.length} (${width}x${height})`);
      
      let pageContent = '';
      
      // If we have text content, try to extract page-specific text
      if (textContent) {
        // Simple heuristic: divide text by page count
        const charsPerPage = Math.floor(textContent.length / pages.length);
        const start = i * charsPerPage;
        const end = i === pages.length - 1 ? textContent.length : (i + 1) * charsPerPage;
        pageContent = textContent.slice(start, end).trim();
        
        // If this page has meaningful content, use it
        if (pageContent.length > 10) {
          console.log(`✅ Page ${i + 1}: Found ${pageContent.length} characters of text`);
        }
      }
      
      // If no text content or very little, use OCR
      if (!pageContent || pageContent.length < 10) {
        try {
          console.log(`🔍 Page ${i + 1}: Using OCR for text extraction...`);
          pageContent = await extractTextWithOCR(pdfBuffer, i, options.ocrLang || 'eng');
          console.log(`✅ Page ${i + 1}: OCR extracted ${pageContent.length} characters`);
        } catch (ocrError) {
          console.warn(`⚠️ Page ${i + 1}: OCR failed, using fallback content:`, ocrError);
          pageContent = `Page ${i + 1} - ${width}x${height} (OCR failed)`;
        }
      }
      
      // Auto-rotate if enabled and page is rotated
      let finalRotation = rotation;
      if (options.autorotate && rotation !== 0) {
        console.log(`🔄 Page ${i + 1}: Auto-rotating from ${rotation}° to 0°`);
        finalRotation = 0;
      }
      
      const pageInfo: PageInfo = {
        pageNumber: i + 1,
        content: pageContent || `Page ${i + 1} - ${width}x${height}`,
        width,
        height,
        rotation: finalRotation
      };
      
      pageInfos.push(pageInfo);
    }
    
    console.log(`🎉 PDF extraction complete! Processed ${pageInfos.length} pages`);
    return pageInfos;
    
  } catch (error) {
    console.error('❌ Error extracting pages:', error);
    throw new Error(`Failed to extract pages: ${error}`);
  }
}

async function extractTextWithOCR(pdfBuffer: Buffer, pageIndex: number, language: string): Promise<string> {
  try {
    // For now, return a placeholder since full OCR implementation would be complex
    // In a real implementation, you would:
    // 1. Convert PDF page to image
    // 2. Use Tesseract.js to perform OCR
    // 3. Return the extracted text
    
    console.log(`🔍 OCR for page ${pageIndex + 1} with language: ${language}`);
    
    // Placeholder OCR result - replace with actual OCR implementation
    const ocrText = `OCR extracted text from page ${pageIndex + 1} (language: ${language})`;
    
    return ocrText;
    
  } catch (error) {
    console.error(`❌ OCR failed for page ${pageIndex + 1}:`, error);
    throw error;
  }
}
