import { PageInfo } from '../pdf/pdf';

export interface MissingPageInfo {
  expectedPage: number;
  foundPages: number[];
}

export function detectMissingPages(pages: PageInfo[]): MissingPageInfo[] {
  // For now, return empty array (no missing pages detected)
  // In a real implementation, you would analyze page numbers and sequences
  
  return [];
}
