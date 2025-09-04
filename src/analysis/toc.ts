import { PageInfo } from '../pdf/pdf';

export interface TocSection {
  title: string;
  startPageIndex: number;
  endPageIndex: number;
  level: number;
}

export function generateToc(pages: PageInfo[]): { sections: TocSection[] } {
  console.log('📖 Generating intelligent table of contents...');
  
  const sections: TocSection[] = [];
  const usedPages = new Set<number>();
  
  // Analyze each page for headings and structure
  pages.forEach((page, index) => {
    if (usedPages.has(index)) return;
    
    const content = page.content.toLowerCase();
    const lines = page.content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Look for various heading patterns
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length < 3 || trimmedLine.length > 100) continue;
      
      // Pattern 1: Chapter/Section/Part headings
      const chapterMatch = trimmedLine.match(/^(chapter|section|part)\s+(\d+[\.\d]*)\s*[:\.]?\s*(.+)$/i);
      if (chapterMatch) {
        const level = chapterMatch[1].toLowerCase().includes('chapter') ? 1 : 
                     chapterMatch[1].toLowerCase().includes('section') ? 2 : 3;
        const title = chapterMatch[3] || chapterMatch[2];
        
        sections.push({
          title: title,
          startPageIndex: index,
          endPageIndex: index,
          level: level
        });
        usedPages.add(index);
        break;
      }
      
      // Pattern 2: Numbered headings (1. Introduction, 2.1 Overview, etc.)
      const numberedMatch = trimmedLine.match(/^(\d+[\.\d]*)\s*[:\.]?\s*(.+)$/);
      if (numberedMatch && numberedMatch[2].length > 3) {
        const level = (numberedMatch[1].match(/\./g) || []).length + 1;
        const title = numberedMatch[2];
        
        // Skip if it looks like a page number
        if (!/^(page|p\.?)\s*\d+$/i.test(title)) {
          sections.push({
            title: title,
            startPageIndex: index,
            endPageIndex: index,
            level: Math.min(level, 3)
          });
          usedPages.add(index);
          break;
        }
      }
      
      // Pattern 3: ALL CAPS headings (but not too long)
      if (/^[A-Z][A-Z\s]{2,30}$/.test(trimmedLine) && !/^(PAGE|CHAPTER|SECTION|PART)$/i.test(trimmedLine)) {
        sections.push({
          title: trimmedLine,
          startPageIndex: index,
          endPageIndex: index,
          level: 2
        });
        usedPages.add(index);
        break;
      }
      
      // Pattern 4: Title case headings (Title Case Format)
      if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(trimmedLine) && trimmedLine.length > 5 && trimmedLine.length < 50) {
        sections.push({
          title: trimmedLine,
          startPageIndex: index,
          endPageIndex: index,
          level: 2
        });
        usedPages.add(index);
        break;
      }
    }
  });
  
  // If no sections found, create a basic structure based on content analysis
  if (sections.length === 0) {
    console.log('📖 No clear headings found, creating content-based sections...');
    
    let currentSection = '';
    let sectionStart = 0;
    
    pages.forEach((page, index) => {
      const content = page.content.toLowerCase();
      
      // Detect section boundaries based on content
      if (content.includes('introduction') || content.includes('intro')) {
        if (currentSection) {
          sections.push({
            title: currentSection,
            startPageIndex: sectionStart,
            endPageIndex: index - 1,
            level: 1
          });
        }
        currentSection = 'Introduction';
        sectionStart = index;
      } else if (content.includes('conclusion') || content.includes('summary')) {
        if (currentSection) {
          sections.push({
            title: currentSection,
            startPageIndex: sectionStart,
            endPageIndex: index - 1,
            level: 1
          });
        }
        currentSection = 'Conclusion';
        sectionStart = index;
      } else if (content.includes('references') || content.includes('bibliography')) {
        if (currentSection) {
          sections.push({
            title: currentSection,
            startPageIndex: sectionStart,
            endPageIndex: index - 1,
            level: 1
          });
        }
        currentSection = 'References';
        sectionStart = index;
      } else if (!currentSection && index === 0) {
        currentSection = 'Document Start';
        sectionStart = index;
      }
    });
    
    // Add the last section
    if (currentSection) {
      sections.push({
        title: currentSection,
        startPageIndex: sectionStart,
        endPageIndex: pages.length - 1,
        level: 1
      });
    }
  }
  
  // Ensure all pages are covered
  const coveredPages = new Set<number>();
  sections.forEach(section => {
    for (let i = section.startPageIndex; i <= section.endPageIndex; i++) {
      coveredPages.add(i);
    }
  });
  
  // Add any uncovered pages to a general section
  for (let i = 0; i < pages.length; i++) {
    if (!coveredPages.has(i)) {
      sections.push({
        title: `Page ${i + 1}`,
        startPageIndex: i,
        endPageIndex: i,
        level: 3
      });
    }
  }
  
  // Sort sections by start page
  sections.sort((a, b) => a.startPageIndex - b.startPageIndex);
  
  console.log(`📖 Generated TOC with ${sections.length} sections:`, sections.map(s => `${s.title} (pages ${s.startPageIndex + 1}-${s.endPageIndex + 1})`));
  
  return { sections };
}
