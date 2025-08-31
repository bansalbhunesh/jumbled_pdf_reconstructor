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

  // If we have embeddings, use AI-powered ordering
  if (embeddings && embeddings.pageEmbeddings && embeddings.pageEmbeddings.size > 0) {
    return buildOrderWithEmbeddings(pages, embeddings);
  }

  // Fallback to content-based ordering
  return buildOrderWithContent(pages);
}

function buildOrderWithEmbeddings(pages: PageInfo[], embeddings: any): OrderResult {
  try {
    console.log('🧠 Using AI embeddings for intelligent page ordering...');
    
    const pageEmbeddings = embeddings.pageEmbeddings;
    const modelName = embeddings.model;
    
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
    
    // Find the most logical page sequence using similarity analysis
    const order = findOptimalSequence(similarities, pageIndices);
    
    // Calculate confidence based on similarity scores
    const avgSimilarity = calculateAverageSimilarity(similarities, order);
    const confidence = Math.min(avgSimilarity * 1.2, 0.95); // Cap at 95%
    
    return {
      order: order,
      confidence: confidence,
      reasoning: `AI-powered ordering using ${modelName}. Pages ordered by content similarity with confidence ${confidence.toFixed(2)}.`
    };
    
  } catch (error) {
    console.warn('⚠️ AI ordering failed, falling back to content-based ordering:', error);
    return buildOrderWithContent(pages);
  }
}

function buildOrderWithContent(pages: PageInfo[]): OrderResult {
  console.log('📚 Using content analysis for page ordering...');
  
  // Analyze page content for logical patterns
  const pageScores = pages.map((page, index) => {
    const content = page.content.toLowerCase();
    let score = 0;
    
    // Identify page types based on content
    if (content.includes('title') || content.includes('cover')) score += 100;
    if (content.includes('abstract') || content.includes('summary')) score += 90;
    if (content.includes('introduction') || content.includes('intro')) score += 80;
    if (content.includes('table of contents') || content.includes('toc')) score += 70;
    if (content.includes('chapter') || content.includes('section')) score += 60;
    if (content.includes('conclusion') || content.includes('summary')) score += 50;
    if (content.includes('references') || content.includes('bibliography')) score += 40;
    if (content.includes('appendix')) score += 30;
    if (content.includes('index')) score += 20;
    
    // Bonus for pages with numbers (likely content pages)
    if (/\d+/.test(content)) score += 10;
    
    return { index, score, content };
  });
  
  // Sort by score (highest first) to get logical order
  pageScores.sort((a, b) => b.score - a.score);
  const order = pageScores.map(p => p.index);
  
  // Calculate confidence based on how well we can identify page types
  const identifiedPages = pageScores.filter(p => p.score > 0).length;
  const confidence = Math.min(identifiedPages / pages.length * 0.8, 0.7);
  
  return {
    order,
    confidence,
    reasoning: `Content-based ordering. Identified ${identifiedPages}/${pages.length} page types with confidence ${confidence.toFixed(2)}.`
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

function findOptimalSequence(similarities: number[][], pageIndices: number[]): number[] {
  // Use a greedy approach to find the best page sequence
  // Start with the page that has the highest average similarity to others
  const avgSimilarities = pageIndices.map((_, i) => {
    const sum = similarities[i].reduce((acc, val) => acc + val, 0);
    return sum / similarities[i].length;
  });
  
  let startPage = avgSimilarities.indexOf(Math.max(...avgSimilarities));
  const visited = new Set<number>();
  const order: number[] = [];
  
  // Build sequence by finding the most similar unvisited page
  while (order.length < pageIndices.length) {
    order.push(pageIndices[startPage]);
    visited.add(startPage);
    
    if (order.length === pageIndices.length) break;
    
    // Find next best page
    let bestNext = -1;
    let bestSimilarity = -1;
    
    for (let i = 0; i < pageIndices.length; i++) {
      if (!visited.has(i)) {
        const similarity = similarities[startPage][i];
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestNext = i;
        }
      }
    }
    
    if (bestNext === -1) break;
    startPage = bestNext;
  }
  
  return order;
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
