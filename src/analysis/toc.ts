import { PageInfo } from '../pdf/pdf';

export interface TocSection {
  title: string;
  startPageIndex: number;
  endPageIndex: number;
  level: number;
}

export function generateToc(pages: PageInfo[]): { sections: TocSection[] } {
  console.log('📖 Generating enhanced intelligent table of contents...');
  
  const sections: TocSection[] = [];
  const usedPages = new Set<number>();
  
  // Enhanced content analysis for better TOC generation
  const analyzePageContent = (content: string, index: number) => {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const contentLower = content.toLowerCase();
    
    // Look for various heading patterns with improved detection
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      if (trimmedLine.length < 3 || trimmedLine.length > 120) continue;
      
      // Pattern 1: Enhanced Chapter/Section/Part headings with better regex
      const chapterMatch = trimmedLine.match(/^(chapter|section|part|article|appendix)\s+(\d+[\.\d]*[a-z]?)\s*[:\.\-]?\s*(.+)$/i);
      if (chapterMatch) {
        const type = chapterMatch[1].toLowerCase();
        const level = type.includes('chapter') ? 1 : 
                     type.includes('section') ? 2 : 
                     type.includes('part') ? 1 : 
                     type.includes('appendix') ? 3 : 2;
        const title = chapterMatch[3].trim();
        
        if (title.length > 2) {
          sections.push({
            title: `${chapterMatch[1]} ${chapterMatch[2]}: ${title}`,
            startPageIndex: index,
            endPageIndex: index,
            level: level
          });
          usedPages.add(index);
          return true;
        }
      }
      
      // Pattern 2: Enhanced numbered headings with better validation
      const numberedMatch = trimmedLine.match(/^(\d+[\.\d]*[a-z]?)\s*[:\.\-]?\s*(.+)$/);
      if (numberedMatch && numberedMatch[2].length > 3) {
        const level = (numberedMatch[1].match(/\./g) || []).length + 1;
        const title = numberedMatch[2].trim();
        
        // Skip if it looks like a page number or date
        if (!/^(page|p\.?)\s*\d+$/i.test(title) && 
            !/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(title) &&
            !/^\d{4}-\d{2}-\d{2}$/.test(title)) {
          sections.push({
            title: title,
            startPageIndex: index,
            endPageIndex: index,
            level: Math.min(level, 3)
          });
          usedPages.add(index);
          return true;
        }
      }
      
      // Pattern 3: Enhanced ALL CAPS headings with better filtering
      if (/^[A-Z][A-Z\s\-]{2,40}$/.test(trimmedLine) && 
          !/^(PAGE|CHAPTER|SECTION|PART|TABLE OF CONTENTS|TOC|INDEX)$/i.test(trimmedLine) &&
          !/^\d+$/.test(trimmedLine)) {
        sections.push({
          title: trimmedLine,
          startPageIndex: index,
          endPageIndex: index,
          level: 2
        });
        usedPages.add(index);
        return true;
      }
      
      // Pattern 4: Enhanced Title case headings with better validation
      if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*(\s+[a-z]+)*$/.test(trimmedLine) && 
          trimmedLine.length > 5 && trimmedLine.length < 60 &&
          !/^(Page|Chapter|Section|Part)\s+\d+$/i.test(trimmedLine)) {
        sections.push({
          title: trimmedLine,
          startPageIndex: index,
          endPageIndex: index,
          level: 2
        });
        usedPages.add(index);
        return true;
      }
      
      // Pattern 5: Bullet point or list item headings
      const bulletMatch = trimmedLine.match(/^[\-\*\•]\s*(.+)$/);
      if (bulletMatch && bulletMatch[1].length > 5 && bulletMatch[1].length < 50) {
        const title = bulletMatch[1].trim();
        if (/^[A-Z]/.test(title)) {
          sections.push({
            title: title,
            startPageIndex: index,
            endPageIndex: index,
            level: 3
          });
          usedPages.add(index);
          return true;
        }
      }
      
      // Pattern 6: Underlined or emphasized headings (lines followed by dashes/equals)
      if (i < lines.length - 1) {
        const nextLine = lines[i + 1].trim();
        if ((/^[-=]{3,}$/.test(nextLine) || /^_{3,}$/.test(nextLine)) && 
            trimmedLine.length > 5 && trimmedLine.length < 50) {
          sections.push({
            title: trimmedLine,
            startPageIndex: index,
            endPageIndex: index,
            level: 2
          });
          usedPages.add(index);
          return true;
        }
      }
    }
    return false;
  };
  
  // Analyze each page for headings and structure
  pages.forEach((page, index) => {
    if (usedPages.has(index)) return;
    analyzePageContent(page.content, index);
  });
  
  // Enhanced fallback: create intelligent structure based on content analysis
  if (sections.length === 0) {
    console.log('📖 No clear headings found, creating enhanced content-based sections...');
    
    let currentSection = '';
    let sectionStart = 0;
    const contentKeywords = {
      title: ['title', 'cover', 'front page', 'document title'],
      toc: ['table of contents', 'contents', 'toc', 'index'],
      abstract: ['abstract', 'summary', 'executive summary', 'overview'],
      intro: ['introduction', 'intro', 'background', 'purpose', 'objective'],
      method: ['methodology', 'method', 'approach', 'procedure', 'process'],
      result: ['results', 'findings', 'analysis', 'data', 'outcome'],
      discussion: ['discussion', 'analysis', 'interpretation', 'implications'],
      conclusion: ['conclusion', 'conclusions', 'summary', 'final thoughts'],
      references: ['references', 'bibliography', 'citations', 'sources'],
      appendix: ['appendix', 'appendices', 'additional', 'supplementary']
    };
    
    pages.forEach((page, index) => {
      const content = page.content.toLowerCase();
      
      // Enhanced section detection with multiple keywords
      let detectedSection = '';
      let sectionLevel = 1;
      
      for (const [sectionType, keywords] of Object.entries(contentKeywords)) {
        if (keywords.some(keyword => content.includes(keyword))) {
          detectedSection = sectionType.charAt(0).toUpperCase() + sectionType.slice(1);
          sectionLevel = sectionType === 'title' || sectionType === 'toc' ? 1 : 
                        sectionType === 'appendix' ? 3 : 2;
          break;
        }
      }
      
      // If we found a new section, close the previous one
      if (detectedSection && detectedSection !== currentSection) {
        if (currentSection) {
          sections.push({
            title: currentSection,
            startPageIndex: sectionStart,
            endPageIndex: index - 1,
            level: 1
          });
        }
        currentSection = detectedSection;
        sectionStart = index;
      } else if (!currentSection && index === 0) {
        // Analyze first page to determine if it's a title page
        const firstPageContent = content;
        if (firstPageContent.length < 500 || 
            contentKeywords.title.some(keyword => firstPageContent.includes(keyword))) {
          currentSection = 'Title Page';
        } else {
          currentSection = 'Document Content';
        }
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
  
  // Enhanced page coverage and intelligent grouping
  const coveredPages = new Set<number>();
  sections.forEach(section => {
    for (let i = section.startPageIndex; i <= section.endPageIndex; i++) {
      coveredPages.add(i);
    }
  });
  
  // Group uncovered pages intelligently
  const uncoveredPages: number[] = [];
  for (let i = 0; i < pages.length; i++) {
    if (!coveredPages.has(i)) {
      uncoveredPages.push(i);
    }
  }
  
  // Group consecutive uncovered pages into logical sections
  if (uncoveredPages.length > 0) {
    let groupStart = uncoveredPages[0];
    let groupEnd = uncoveredPages[0];
    
    for (let i = 1; i < uncoveredPages.length; i++) {
      if (uncoveredPages[i] === groupEnd + 1) {
        // Consecutive page, extend group
        groupEnd = uncoveredPages[i];
      } else {
        // Gap found, create section for previous group
        if (groupEnd - groupStart >= 2) {
          sections.push({
            title: `Content Section (Pages ${groupStart + 1}-${groupEnd + 1})`,
            startPageIndex: groupStart,
            endPageIndex: groupEnd,
            level: 2
          });
        } else {
          sections.push({
            title: `Page ${groupStart + 1}`,
            startPageIndex: groupStart,
            endPageIndex: groupEnd,
            level: 3
          });
        }
        groupStart = uncoveredPages[i];
        groupEnd = uncoveredPages[i];
      }
    }
    
    // Add the last group
    if (groupEnd - groupStart >= 2) {
      sections.push({
        title: `Content Section (Pages ${groupStart + 1}-${groupEnd + 1})`,
        startPageIndex: groupStart,
        endPageIndex: groupEnd,
        level: 2
      });
    } else {
      sections.push({
        title: `Page ${groupStart + 1}`,
        startPageIndex: groupStart,
        endPageIndex: groupEnd,
        level: 3
      });
    }
  }
  
  // Sort sections by start page and optimize structure
  sections.sort((a, b) => a.startPageIndex - b.startPageIndex);
  
  // Post-process: merge small sections and improve hierarchy
  const optimizedSections: TocSection[] = [];
  let i = 0;
  
  while (i < sections.length) {
    const current = sections[i];
    
    // If this is a single page section and the next section is also small, consider merging
    if (current.endPageIndex === current.startPageIndex && 
        i + 1 < sections.length && 
        sections[i + 1].endPageIndex === sections[i + 1].startPageIndex &&
        sections[i + 1].startPageIndex === current.endPageIndex + 1) {
      
      // Merge small consecutive sections
      optimizedSections.push({
        title: `Content Section (Pages ${current.startPageIndex + 1}-${sections[i + 1].endPageIndex + 1})`,
        startPageIndex: current.startPageIndex,
        endPageIndex: sections[i + 1].endPageIndex,
        level: 2
      });
      i += 2; // Skip both sections
    } else {
      optimizedSections.push(current);
      i++;
    }
  }
  
  console.log(`📖 Generated enhanced TOC with ${optimizedSections.length} sections:`, 
    optimizedSections.map(s => `${s.title} (pages ${s.startPageIndex + 1}-${s.endPageIndex + 1})`));
  
  return { sections: optimizedSections };
}
