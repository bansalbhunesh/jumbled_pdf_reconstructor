import fs from 'fs';
import path from 'path';
import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { JobInfo } from './types';
import { runDirFor, listFiles } from '../storage';

// Import the actual reconstruction pipeline functions
import { extractPages } from '../../src/pdf/pdf';
import { buildOrder } from '../../src/order/order';
import { computePageEmbeddings } from '../../src/analysis/embeddings';
import { generateToc } from '../../src/analysis/toc';
import { findDuplicatePages } from '../../src/analysis/duplicates';
import { detectMissingPages } from '../../src/analysis/missing';
import { 
  exportReorderedPDF, 
  exportReorderedPDFWithToc,
  writeJsonLog,
  writeHtmlReport,
  writeTocJson,
  writeDupMissingJson
} from '../../src/export/export';
import { loadConfig } from '../../src/config';

type RunOptions = {
  emb?: boolean;
  phash?: boolean;
  autorotate?: boolean;
  embedToc?: boolean;
  ocrLang?: string;
  embeddingModel?: string;
};

@Injectable()
export class JobsService {
  private jobs = new Map<string, JobInfo>();
  private config = loadConfig();

  create(filePath: string, options: RunOptions = {}): JobInfo {
    const id = uuid();
    const info: JobInfo = { id, status: 'queued', progress: 0 };
    this.jobs.set(id, info);
    
    console.log(`🎯 Created job ${id} for file: ${filePath}`);
    console.log(`📋 Options:`, options);

    // kick off async processing
    this.process(id, filePath, options).catch(err => {
      console.error(`❌ Job ${id} failed:`, err);
      const j = this.jobs.get(id);
      if (j) {
        j.status = 'failed';
        j.error = err?.message || String(err);
        j.progress = 100;
        this.jobs.set(id, j);
      }
    });

    return info;
  }

  get(id: string) {
    return this.jobs.get(id);
  }

  private async process(id: string, filePath: string, options: RunOptions) {
    const job = this.jobs.get(id);
    if (!job) return;
    
    console.log(`🚀 Starting to process job ${id}`);
    
    try {
      job.status = 'running';
      job.progress = 5;
      this.jobs.set(id, job);
      console.log(`📊 Job ${id} progress: 5%`);

      const runDir = runDirFor(id);
      console.log(`📁 Created run directory: ${runDir}`);
      
      // Step 1: Extract pages and analyze content
      console.log(`📄 Extracting pages from PDF...`);
      const pdfBuffer = fs.readFileSync(filePath);
      
      // Use the actual PDF extraction logic
      const pages = await extractPages(pdfBuffer, this.config.tmpDir || './.tmp', {
        autorotate: options.autorotate ?? this.config.autorotate,
        ocrLang: options.ocrLang || this.config.ocrLang
      });
      
      console.log(`📊 Extracted ${pages.length} pages from PDF`);
      
      job.progress = 25;
      this.jobs.set(id, job);
      console.log(`📊 Job ${id} progress: 25%`);

      // Step 2: Generate embeddings if enabled
      let embeddings;
      if (options.emb ?? this.config.embeddings) {
        console.log(`🧠 Generating AI embeddings for page analysis...`);
        const modelName = options.embeddingModel || this.config.embeddingModel || 'sentence-transformers/all-MiniLM-L6-v2';
        console.log(`🤖 Using embedding model: ${modelName}`);
        
        try {
          embeddings = await computePageEmbeddings(pages, modelName);
          console.log(`✅ Generated embeddings for ${embeddings.pageEmbeddings.size} pages`);
        } catch (error) {
          console.warn(`⚠️ Embedding generation failed, continuing without AI analysis:`, error);
        }
      }
      
      job.progress = 45;
      this.jobs.set(id, job);
      console.log(`📊 Job ${id} progress: 45%`);

      // Step 3: Analyze and determine page order
      console.log(`🧠 Analyzing page content and determining order...`);
      const orderResult = buildOrder(pages, embeddings);
      
      console.log(`📋 Determined page order:`, orderResult.order.map(i => i + 1));
      console.log(`🎯 Confidence: ${orderResult.confidence.toFixed(2)}`);
      console.log(`💭 Reasoning: ${orderResult.reasoning}`);
      
      job.progress = 60;
      this.jobs.set(id, job);
      console.log(`📊 Job ${id} progress: 60%`);

      // Step 4: Generate analysis reports
      console.log(`📊 Generating analysis reports...`);
      
      // Generate TOC
      const toc = generateToc(pages);
      console.log(`📖 Generated TOC with ${toc.sections.length} sections`);
      
      // Find duplicates if enabled
      let duplicates: any[] = [];
      if (options.phash ?? this.config.phash) {
        try {
          duplicates = await findDuplicatePages(pages, {
            jaccardThreshold: this.config.jaccardThreshold,
            imagePdfPath: filePath,
            autorotate: options.autorotate ?? this.config.autorotate,
            hammingThreshold: this.config.hammingThreshold
          });
          console.log(`🔍 Found ${duplicates.length} duplicate groups`);
        } catch (error) {
          console.warn(`⚠️ Duplicate detection failed:`, error);
        }
      }
      
      // Detect missing pages
      const missing = detectMissingPages(pages);
      console.log(`❓ Detected ${missing.length} potentially missing pages`);
      
      job.progress = 75;
      this.jobs.set(id, job);
      console.log(`📊 Job ${id} progress: 75%`);

      // Step 5: Create reconstructed PDF
      console.log(`🔨 Creating reconstructed PDF...`);
      const outputPdfPath = path.join(runDir, 'ordered.pdf');
      
      if (options.embedToc && toc.sections.length > 0) {
        // Create TOC items with page numbers
        // Note: We need to pass 0-based indices for the export function
        const tocItems = toc.sections.map(section => ({
          title: section.title,
          page: section.startPageIndex // This is already 0-based
        }));
        
        await exportReorderedPDFWithToc(pdfBuffer, orderResult.order, outputPdfPath, tocItems);
        console.log(`📄 Created PDF with TOC: ${outputPdfPath}`);
      } else {
        await exportReorderedPDF(pdfBuffer, orderResult.order, outputPdfPath);
        console.log(`📄 Created reconstructed PDF: ${outputPdfPath}`);
      }
      
      job.progress = 90;
      this.jobs.set(id, job);
      console.log(`📊 Job ${id} progress: 90%`);

      // Step 6: Generate all output files
      console.log(`📊 Generating output files...`);
      
      // Write JSON log
      const logPath = path.join(runDir, 'log.json');
      writeJsonLog(orderResult, pages, logPath);
      console.log(`📊 Created log file: ${logPath}`);
      
      // Write HTML report
      const reportPath = path.join(runDir, 'report.html');
      writeHtmlReport(orderResult, reportPath);
      console.log(`📊 Created HTML report: ${reportPath}`);
      
      // Write TOC JSON
      const tocPath = path.join(runDir, 'toc.json');
      writeTocJson(toc, tocPath);
      console.log(`📊 Created TOC file: ${tocPath}`);
      
      // Write duplicates and missing pages
      const dupMissingPath = path.join(runDir, 'dup_missing.json');
      writeDupMissingJson(duplicates, missing, dupMissingPath);
      console.log(`📊 Created duplicates/missing file: ${dupMissingPath}`);
      
      // Finalize job
      const files = listFiles(runDir);
      job.status = 'succeeded';
      job.progress = 100;
      job.files = files;
      job.mainOutput = 'ordered.pdf';
      this.jobs.set(id, job);
      
      console.log(`🎉 Job ${id} completed successfully!`);
      console.log(`📁 Output files:`, files);
      
    } catch (error) {
      console.error(`❌ Job ${id} failed:`, error);
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
      job.progress = 100;
      this.jobs.set(id, job);
      throw error;
    }
  }

  private analyzePageOrder(pageContents: Array<{ pageNum: number; text: string; content: string; width: number; height: number }>) {
    // This method is no longer used - replaced with actual reconstruction logic
    return pageContents;
  }
}
