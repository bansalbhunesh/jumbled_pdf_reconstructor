import { PageInfo } from '../pdf/pdf';

export interface OrderResult {
  order: number[];
  confidence: number;
  reasoning: string;
}

export function buildOrder(pages: PageInfo[], embeddings?: any): OrderResult {
  if (!pages || pages.length === 0) {
    return {
      order: [],
      confidence: 0,
      reasoning: 'No pages to analyze'
    };
  }

  let result: OrderResult;

  // If we have embeddings, use AI-powered ordering
  if (embeddings && embeddings.pageEmbeddings && embeddings.pageEmbeddings.size > 0) {
    result = buildOrderWithEmbeddings(pages, embeddings);
  } else {
    // Fallback to content-based ordering
    result = buildOrderWithContent(pages);
  }

  // Validate the order to ensure all indices are valid
  result.order = validateAndFixOrder(result.order, pages.length);
  
  return result;
}

function validateAndFixOrder(order: number[], pageCount: number): number[] {
  // Remove duplicates and invalid indices
  const validOrder = order.filter((index, pos) => 
    index >= 0 && index < pageCount && order.indexOf(index) === pos
  );
  
  // Add any missing indices
  const missingIndices = [];
  for (let i = 0; i < pageCount; i++) {
    if (!validOrder.includes(i)) {
      missingIndices.push(i);
    }
  }
  
  // Combine valid order with missing indices
  return [...validOrder, ...missingIndices];
}

function buildOrderWithEmbeddings(pages: PageInfo[], embeddings: any): OrderResult {
  try {
    console.log('🧠 Using AI embeddings for intelligent page ordering...');
    
    const pageEmbeddings = embeddings.pageEmbeddings;
    const modelName = embeddings.model;
    
    // First, try to detect page numbers and use them for ordering
    const pageNumberOrder = detectPageNumbers(pages);
    if (pageNumberOrder.confidence > 0.7) {
      console.log('📄 Found page numbers, using them for ordering');
      return pageNumberOrder;
    }
    
    // Create similarity matrix between all pages
    const similarities: number[][] = [];
    const pageIndices: number[] = Array.from(pageEmbeddings.keys());
    
    for (let i = 0; i < pageIndices.length; i++) {
      similarities[i] = [];
      for (let j = 0; j < pageIndices.length; j++) {
        if (i === j) {
          similarities[i][j] = 1.0; // Same page
        } else {
          const emb1 = pageEmbeddings.get(pageIndices[i]);
          const emb2 = pageEmbeddings.get(pageIndices[j]);
          similarities[i][j] = cosineSimilarity(emb1, emb2);
        }
      }
    }
    
    // Use improved sequence building that considers document flow
    const order = findOptimalDocumentSequence(pages, similarities, pageIndices);
    
    // Calculate confidence based on document structure analysis
    const confidence = calculateDocumentFlowConfidence(pages, order);
    
    return {
      order: order,
      confidence: confidence,
      reasoning: `AI-powered ordering using ${modelName}. Pages ordered by document flow analysis with confidence ${confidence.toFixed(2)}.`
    };
    
  } catch (error) {
    console.warn('⚠️ AI ordering failed, falling back to content-based ordering:', error);
    return buildOrderWithContent(pages);
  }
}

function buildOrderWithContent(pages: PageInfo[]): OrderResult {
  console.log('📚 Using content analysis for page ordering...');
  
  // First, try to detect page numbers
  const pageNumberOrder = detectPageNumbers(pages);
  if (pageNumberOrder.confidence > 0.6) {
    console.log('📄 Found page numbers in content, using them for ordering');
    return pageNumberOrder;
  }
  
  // Analyze page content for logical document structure
  const pageAnalysis = pages.map((page, index) => {
    const content = page.content.toLowerCase();
    const analysis = {
      index,
      content,
      type: 'unknown' as string,
      priority: 0,
      pageNumber: extractPageNumber(content),
      hasChapter: false,
      hasSection: false,
      hasNumbering: false
    };
    
    // Detect page types and assign priorities
    if (content.includes('title') || content.includes('cover') || content.includes('front cover')) {
      analysis.type = 'title';
      analysis.priority = 1000;
    } else if (content.includes('table of contents') || content.includes('toc') || content.includes('contents')) {
      analysis.type = 'toc';
      analysis.priority = 900;
    } else if (content.includes('abstract') || content.includes('executive summary')) {
      analysis.type = 'abstract';
      analysis.priority = 800;
    } else if (content.includes('introduction') || content.includes('intro') || content.includes('overview')) {
      analysis.type = 'introduction';
      analysis.priority = 700;
    } else if (content.includes('chapter') || content.includes('part')) {
      analysis.type = 'chapter';
      analysis.priority = 600;
      analysis.hasChapter = true;
    } else if (content.includes('section') || content.includes('subsection')) {
      analysis.type = 'section';
      analysis.priority = 500;
      analysis.hasSection = true;
    } else if (content.includes('conclusion') || content.includes('summary') || content.includes('ending')) {
      analysis.type = 'conclusion';
      analysis.priority = 200;
    } else if (content.includes('references') || content.includes('bibliography') || content.includes('works cited')) {
      analysis.type = 'references';
      analysis.priority = 100;
    } else if (content.includes('appendix') || content.includes('appendices')) {
      analysis.type = 'appendix';
      analysis.priority = 50;
    } else if (content.includes('index') || content.includes('glossary')) {
      analysis.type = 'index';
      analysis.priority = 10;
    } else {
      // Regular content page
      analysis.type = 'content';
      analysis.priority = 400;
    }
    
    // Check for numbering patterns
    if (/\b\d+\.\d+/.test(content) || /\bchapter\s+\d+/i.test(content) || /\bsection\s+\d+/i.test(content)) {
      analysis.hasNumbering = true;
      analysis.priority += 50;
    }
    
    return analysis;
  });
  
  // Sort by priority and page numbers
  pageAnalysis.sort((a, b) => {
    // First by priority (document structure)
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    // Then by page number if available
    if (a.pageNumber !== null && b.pageNumber !== null) {
      return a.pageNumber - b.pageNumber;
    }
    // Finally by original index as fallback
    return a.index - b.index;
  });
  
  const order = pageAnalysis.map(p => p.index);
  
  // Calculate confidence based on structure detection
  const identifiedTypes = new Set(pageAnalysis.filter(p => p.type !== 'unknown').map(p => p.type));
  const confidence = Math.min(identifiedTypes.size / 8 * 0.8 + 0.2, 0.8);
  
  return {
    order,
    confidence,
    reasoning: `Content-based ordering. Detected ${identifiedTypes.size} document types: ${Array.from(identifiedTypes).join(', ')}. Confidence: ${confidence.toFixed(2)}.`
  };
}

function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0;
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  if (norm1 === 0 || norm2 === 0) return 0;
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

function findOptimalDocumentSequence(pages: PageInfo[], similarities: number[][], pageIndices: number[]): number[] {
  // First, try to identify document structure using content analysis
  const structureAnalysis = analyzeDocumentStructure(pages);
  
  // If we can identify clear structure, use it
  if (structureAnalysis.confidence > 0.6) {
    console.log('📋 Using document structure analysis for ordering');
    return structureAnalysis.order;
  }
  
  // Fallback to improved similarity-based ordering
  return findOptimalSequenceByFlow(pages, similarities, pageIndices);
}

function analyzeDocumentStructure(pages: PageInfo[]): { order: number[], confidence: number } {
  const pageAnalysis = pages.map((page, index) => {
    const content = page.content.toLowerCase();
    const pageNumber = extractPageNumber(content);
    
    return {
      index,
      content,
      pageNumber,
      isTitle: content.includes('title') || content.includes('cover'),
      isToc: content.includes('table of contents') || content.includes('toc'),
      isAbstract: content.includes('abstract') || content.includes('summary'),
      isIntro: content.includes('introduction') || content.includes('intro'),
      isChapter: content.includes('chapter') || content.includes('part'),
      isConclusion: content.includes('conclusion') || content.includes('ending'),
      isReferences: content.includes('references') || content.includes('bibliography'),
      isAppendix: content.includes('appendix'),
      isIndex: content.includes('index')
    };
  });
  
  // Try to order by page numbers first
  const pagesWithNumbers = pageAnalysis.filter(p => p.pageNumber !== null);
  if (pagesWithNumbers.length >= pages.length * 0.7) {
    const orderedByNumbers = pageAnalysis
      .sort((a, b) => {
        if (a.pageNumber === null && b.pageNumber === null) return a.index - b.index;
        if (a.pageNumber === null) return 1;
        if (b.pageNumber === null) return -1;
        return a.pageNumber - b.pageNumber;
      })
      .map(p => p.index);
    
    return { order: orderedByNumbers, confidence: 0.9 };
  }
  
  // Order by document structure - ensure no duplicates
  const usedIndices = new Set<number>();
  const structureOrder: number[] = [];
  
  // Helper function to add pages if not already used
  const addPages = (pages: typeof pageAnalysis) => {
    pages.forEach(p => {
      if (!usedIndices.has(p.index)) {
        structureOrder.push(p.index);
        usedIndices.add(p.index);
      }
    });
  };
  
  // Add pages in logical document order
  addPages(pageAnalysis.filter(p => p.isTitle));
  addPages(pageAnalysis.filter(p => p.isToc));
  addPages(pageAnalysis.filter(p => p.isAbstract));
  addPages(pageAnalysis.filter(p => p.isIntro));
  addPages(pageAnalysis.filter(p => p.isChapter));
  addPages(pageAnalysis.filter(p => !p.isTitle && !p.isToc && !p.isAbstract && !p.isIntro && !p.isChapter && !p.isConclusion && !p.isReferences && !p.isAppendix && !p.isIndex));
  addPages(pageAnalysis.filter(p => p.isConclusion));
  addPages(pageAnalysis.filter(p => p.isReferences));
  addPages(pageAnalysis.filter(p => p.isAppendix));
  addPages(pageAnalysis.filter(p => p.isIndex));
  
  // Add any remaining pages that weren't categorized
  pageAnalysis.forEach(p => {
    if (!usedIndices.has(p.index)) {
      structureOrder.push(p.index);
    }
  });
  
  const identifiedStructures = pageAnalysis.filter(p => p.isTitle || p.isToc || p.isAbstract || p.isIntro || p.isChapter || p.isConclusion || p.isReferences || p.isAppendix || p.isIndex).length;
  const confidence = Math.min(identifiedStructures / pages.length * 0.8, 0.7);
  
  return { order: structureOrder, confidence };
}

function findOptimalSequenceByFlow(pages: PageInfo[], similarities: number[][], pageIndices: number[]): number[] {
  // Find pages that are likely to be at the beginning (title, abstract, intro)
  const startCandidates = pageIndices.filter(i => {
    const content = pages[i].content.toLowerCase();
    return content.includes('title') || content.includes('abstract') || content.includes('introduction') || content.includes('cover');
  });
  
  // Find pages that are likely to be at the end (conclusion, references, appendix)
  const endCandidates = pageIndices.filter(i => {
    const content = pages[i].content.toLowerCase();
    return content.includes('conclusion') || content.includes('references') || content.includes('appendix') || content.includes('bibliography');
  });
  
  let startPage = 0;
  if (startCandidates.length > 0) {
    // Choose the start candidate with highest average similarity to other pages
    const startSimilarities = startCandidates.map(i => {
      const idx = pageIndices.indexOf(i);
      const sum = similarities[idx].reduce((acc, val, j) => j !== idx ? acc + val : acc, 0);
      return sum / (similarities[idx].length - 1);
    });
    startPage = pageIndices.indexOf(startCandidates[startSimilarities.indexOf(Math.max(...startSimilarities))]);
  } else {
    // Fallback: find page with highest average similarity
    const avgSimilarities = pageIndices.map((_, i) => {
      const sum = similarities[i].reduce((acc, val) => acc + val, 0);
      return sum / similarities[i].length;
    });
    startPage = avgSimilarities.indexOf(Math.max(...avgSimilarities));
  }
  
  const visited = new Set<number>();
  const order: number[] = [];
  
  // Build sequence considering document flow
  while (order.length < pageIndices.length) {
    order.push(pageIndices[startPage]);
    visited.add(startPage);
    
    if (order.length === pageIndices.length) break;
    
    // Find next page considering both similarity and document flow
    let bestNext = -1;
    let bestScore = -1;
    
    for (let i = 0; i < pageIndices.length; i++) {
      if (!visited.has(i)) {
        const similarity = similarities[startPage][i];
        const pageIndex = pageIndices[i];
        const content = pages[pageIndex].content.toLowerCase();
        
        // Boost score for pages that should come next in document flow
        let flowBonus = 0;
        if (content.includes('chapter') || content.includes('section')) flowBonus += 0.1;
        if (content.includes('conclusion') && order.length > pageIndices.length * 0.7) flowBonus += 0.2;
        if (content.includes('references') && order.length > pageIndices.length * 0.8) flowBonus += 0.3;
        
        const score = similarity + flowBonus;
        if (score > bestScore) {
          bestScore = score;
          bestNext = i;
        }
      }
    }
    
    if (bestNext === -1) break;
    startPage = bestNext;
  }
  
  return order;
}

function calculateDocumentFlowConfidence(pages: PageInfo[], order: number[]): number {
  // Analyze the logical flow of the ordered pages
  let flowScore = 0;
  let totalChecks = 0;
  
  for (let i = 0; i < order.length - 1; i++) {
    const currentPage = pages[order[i]];
    const nextPage = pages[order[i + 1]];
    const currentContent = currentPage.content.toLowerCase();
    const nextContent = nextPage.content.toLowerCase();
    
    // Check for logical transitions
    if (currentContent.includes('introduction') && nextContent.includes('chapter')) {
      flowScore += 1;
    } else if (currentContent.includes('chapter') && nextContent.includes('chapter')) {
      flowScore += 0.8;
    } else if (currentContent.includes('conclusion') && nextContent.includes('references')) {
      flowScore += 1;
    } else if (currentContent.includes('references') && nextContent.includes('appendix')) {
      flowScore += 1;
    } else if (!currentContent.includes('title') && !currentContent.includes('toc') && !nextContent.includes('title') && !nextContent.includes('toc')) {
      // Regular content pages should flow naturally
      flowScore += 0.5;
    }
    totalChecks++;
  }
  
  return Math.min(flowScore / totalChecks, 0.9);
}

function detectPageNumbers(pages: PageInfo[]): OrderResult {
  console.log('🔍 Detecting page numbers in content...');
  
  const pageNumbers = pages.map((page, index) => {
    const pageNumber = extractPageNumber(page.content);
    console.log(`📄 Page ${index + 1}: ${pageNumber ? `Found page number ${pageNumber}` : 'No page number detected'}`);
    if (pageNumber) {
      console.log(`   Content preview: "${page.content.substring(0, 100)}..."`);
    }
    return {
      index,
      pageNumber,
      content: page.content
    };
  });
  
  const pagesWithNumbers = pageNumbers.filter(p => p.pageNumber !== null);
  
  console.log(`📊 Page number detection results: ${pagesWithNumbers.length}/${pages.length} pages have detectable numbers`);
  
  if (pagesWithNumbers.length < pages.length * 0.5) {
    console.log('⚠️ Insufficient page numbers found for reliable ordering');
    return {
      order: pages.map((_, i) => i),
      confidence: 0,
      reasoning: 'Insufficient page numbers found for reliable ordering'
    };
  }
  
  // Sort by page numbers
  const sortedPages = pageNumbers.sort((a, b) => {
    if (a.pageNumber === null && b.pageNumber === null) return a.index - b.index;
    if (a.pageNumber === null) return 1;
    if (b.pageNumber === null) return -1;
    return a.pageNumber - b.pageNumber;
  });
  
  const order = sortedPages.map(p => p.index);
  const confidence = Math.min(pagesWithNumbers.length / pages.length, 0.95);
  
  console.log(`✅ Page number ordering: [${order.map(i => i + 1).join(', ')}]`);
  console.log(`🎯 Confidence: ${confidence.toFixed(2)}`);
  
  return {
    order,
    confidence,
    reasoning: `Page number-based ordering. Found ${pagesWithNumbers.length}/${pages.length} pages with numbers. Confidence: ${confidence.toFixed(2)}.`
  };
}

function extractPageNumber(content: string): number | null {
  // Split content into lines to analyze positioning
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Look for page numbers at the bottom middle of the page (last few lines)
  const bottomLines = lines.slice(-3); // Check last 3 lines for page numbers
  const middleLines = lines.slice(Math.floor(lines.length * 0.4), Math.floor(lines.length * 0.6)); // Check middle section
  
  // Enhanced patterns for page number detection
  const bottomMiddlePatterns = [
    // Most common patterns first
    /^page\s+(\d+)$/i,              // "Page 1", "Page 2"
    /^page\s*(\d+)$/i,              // "Page1", "Page2"
    /\bpage\s+(\d+)\b/i,            // "Page 1" anywhere in line
    /\bpage\s*(\d+)\b/i,            // "Page1" anywhere in line
    
    // P. patterns
    /^p\.\s*(\d+)$/i,               // "P. 1", "P. 2"
    /^p\s*(\d+)$/i,                 // "P 1", "P 2"
    /\bp\.\s*(\d+)\b/i,             // "P. 1" anywhere in line
    /\bp\s*(\d+)\b/i,               // "P 1" anywhere in line
    
    // Standalone numbers (common in footers)
    /^(\d+)$/,                      // Just "1", "2", "3"
    /^(\d{1,3})$/,                  // 1-3 digit numbers
    
    // Numbers with separators (common in footers)
    /-+\s*(\d+)\s*-+/i,            // --- 1 ---
    /\|\s*(\d+)\s*\|/i,            // | 1 |
    /\.+\s*(\d+)\s*\.+/i,          // ... 1 ...
    /_+\s*(\d+)\s*_+/i,            // ___ 1 ___
    
    // Page X of Y patterns
    /page\s+(\d+)\s+of\s+\d+/i,    // "Page 1 of 5"
    /p\.\s*(\d+)\s*of\s*\d+/i,     // "P. 1 of 5"
    
    // Roman numerals
    /\bpage\s+([ivxlcdm]+)/i,       // "Page I", "Page II"
    /\bp\.\s*([ivxlcdm]+)/i,        // "P. I", "P. II"
  ];
  
  // Check bottom lines first (highest priority for page numbers)
  console.log(`📄 Analyzing page content for page numbers. Total lines: ${lines.length}`);
  console.log(`📄 Bottom lines to check:`, bottomLines);
  
  for (const line of bottomLines) {
    console.log(`📄 Checking bottom line: "${line}"`);
    for (let i = 0; i < bottomMiddlePatterns.length; i++) {
      const pattern = bottomMiddlePatterns[i];
      const match = line.match(pattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > 0 && num < 10000) {
          console.log(`📄 ✅ Found page number ${num} in bottom section with pattern ${i}: "${line}"`);
          return num;
        }
      }
    }
  }
  
  // Check middle lines as secondary option
  console.log(`📄 Middle lines to check:`, middleLines);
  for (const line of middleLines) {
    console.log(`📄 Checking middle line: "${line}"`);
    for (let i = 0; i < bottomMiddlePatterns.length; i++) {
      const pattern = bottomMiddlePatterns[i];
      const match = line.match(pattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > 0 && num < 10000) {
          console.log(`📄 ✅ Found page number ${num} in middle section with pattern ${i}: "${line}"`);
          return num;
        }
      }
    }
  }
  
  // Fallback to search entire content
  console.log(`📄 No page number found in bottom/middle, searching entire content...`);
  const fallbackPatterns = [
    /\bpage\s+(\d+)/i,
    /\bp\.\s*(\d+)/i,
    /page\s*(\d+)/i,
    /\bp\s*(\d+)/i,
    /^(\d+)$/m,
    /\b(\d+)\s*$/m,
    /^(\d+)\s*$/m,
    /-+\s*(\d+)\s*-+/i,
    /\|\s*(\d+)\s*\|/i,
    /\.+\s*(\d+)\s*\.+/i,
    /\bpage\s+([ivxlcdm]+)/i,
    /\bp\.\s*([ivxlcdm]+)/i,
    /^(\d{1,3})$/m,
    /\b(\d{1,3})\s*$/m,
  ];
  
  for (let i = 0; i < fallbackPatterns.length; i++) {
    const pattern = fallbackPatterns[i];
    const match = content.match(pattern);
    if (match) {
      let num: number;
      
      // Handle Roman numerals
      if (i >= 10 && i <= 11) { // Roman numeral patterns
        num = romanToNumber(match[1].toLowerCase());
        if (num === 0) continue; // Invalid Roman numeral
      } else {
        num = parseInt(match[1], 10);
      }
      
      // Reasonable page number range
      if (num > 0 && num < 10000) {
        console.log(`📄 ✅ Found page number ${num} in fallback search with pattern ${i}: "${match[0]}"`);
        return num;
      }
    }
  }
  
  console.log(`📄 ❌ No page number detected in content`);
  return null;
}

function romanToNumber(roman: string): number {
  const romanMap: { [key: string]: number } = {
    'i': 1, 'v': 5, 'x': 10, 'l': 50, 'c': 100, 'd': 500, 'm': 1000
  };
  
  let result = 0;
  let prev = 0;
  
  for (let i = roman.length - 1; i >= 0; i--) {
    const current = romanMap[roman[i]];
    if (current === undefined) return 0; // Invalid Roman numeral
    
    if (current < prev) {
      result -= current;
    } else {
      result += current;
    }
    prev = current;
  }
  
  return result;
}

function calculateAverageSimilarity(similarities: number[][], order: number[]): number {
  if (order.length < 2) return 1.0;
  
  let totalSimilarity = 0;
  let count = 0;
  
  for (let i = 0; i < order.length - 1; i++) {
    const page1 = order[i];
    const page2 = order[i + 1];
    totalSimilarity += similarities[page1][page2];
    count++;
  }
  
  return count > 0 ? totalSimilarity / count : 0;
}
