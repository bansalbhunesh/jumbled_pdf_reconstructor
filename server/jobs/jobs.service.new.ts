import fs from 'fs';
import path from 'path';
import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { JobInfo } from './types';
import { runDirFor, listFiles } from '../storage';
import { PdfProcessorService } from '../services/pdf-processor.service';

type RunOptions = {
  emb?: boolean;
  phash?: boolean;
  autorotate?: boolean;
  embedToc?: boolean;
  ocrLang?: string;
};

@Injectable()
export class JobsService {
  private jobs = new Map<string, JobInfo>();
  private pdfProcessor = new PdfProcessorService();

  create(filePath: string, options: RunOptions = {}): JobInfo {
    const id = uuid();
    const info: JobInfo = { id, status: 'queued', progress: 0 };
    this.jobs.set(id, info);

    // kick off async processing
    this.process(id, filePath, options).catch(err => {
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
    
    try {
      job.status = 'running';
      job.progress = 5;
      this.jobs.set(id, job);

      const runDir = runDirFor(id);
      
      // Ensure output directory exists
      if (!fs.existsSync(runDir)) {
        fs.mkdirSync(runDir, { recursive: true });
      }

      // Update progress
      job.progress = 10;
      this.jobs.set(id, job);

      // Process options
      const processingOptions = {
        emb: options.emb ?? true,
        phash: options.phash ?? true,
        embedToc: options.embedToc ?? true,
        autorotate: options.autorotate ?? true,
        ocrLang: options.ocrLang || 'eng'
      };

      // Update progress
      job.progress = 20;
      this.jobs.set(id, job);

      // Process the PDF using our new service
      const outputPath = path.join(runDir, 'ordered.pdf');
      const result = await this.pdfProcessor.processPdf(filePath, outputPath, processingOptions);

      // Update progress
      job.progress = 80;
      this.jobs.set(id, job);

      // Generate additional output files
      await this.generateOutputFiles(runDir, result, filePath);

      // Update progress
      job.progress = 95;
      this.jobs.set(id, job);

      // Finalize job
      const files = listFiles(runDir);
      job.status = 'succeeded';
      job.progress = 100;
      job.files = files;
      this.jobs.set(id, job);

    } catch (error) {
      console.error(`Job ${id} failed:`, error);
      job.status = 'failed';
      job.error = (error as Error)?.message || String(error);
      job.progress = 100;
      this.jobs.set(id, job);
    }
  }

  private async generateOutputFiles(runDir: string, result: any, originalFilePath: string) {
    try {
      // Generate log JSON
      const logData = {
        timestamp: new Date().toISOString(),
        originalFile: path.basename(originalFilePath),
        processingResult: result,
        summary: {
          totalPages: result.orderedPages.length,
          duplicatesFound: result.duplicates.length,
          missingPages: result.missingPages.length,
          tocEntries: result.tableOfContents.length
        }
      };

      fs.writeFileSync(
        path.join(runDir, 'log.json'), 
        JSON.stringify(logData, null, 2)
      );

      // Generate HTML report
      const htmlReport = this.generateHtmlReport(result);
      fs.writeFileSync(
        path.join(runDir, 'report.html'), 
        htmlReport
      );

      // Generate TOC JSON
      fs.writeFileSync(
        path.join(runDir, 'toc.json'), 
        JSON.stringify(result.tableOfContents, null, 2)
      );

      // Generate duplicates and missing pages JSON
      const dupMissingData = {
        duplicates: result.duplicates,
        missingPages: result.missingPages
      };
      fs.writeFileSync(
        path.join(runDir, 'dup_missing.json'), 
        JSON.stringify(dupMissingData, null, 2)
      );

      // Generate reasoning text file
      fs.writeFileSync(
        path.join(runDir, 'reasoning.txt'), 
        result.reasoning
      );

    } catch (error) {
      console.error('Error generating output files:', error);
    }
  }

  private generateHtmlReport(result: any): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Reconstruction Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .duplicate-group { background: #fff3cd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .missing-page { background: #f8d7da; padding: 10px; margin: 5px 0; border-radius: 5px; }
        .toc-entry { margin: 5px 0; }
        .toc-level-1 { font-weight: bold; }
        .toc-level-2 { margin-left: 20px; }
        .toc-level-3 { margin-left: 40px; }
        .log-entry { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 3px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="header">
        <h1>PDF Reconstruction Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Pages:</strong> ${result.orderedPages.length}</p>
    </div>

    <div class="section">
        <h2>Page Order</h2>
        <p><strong>Determined Order:</strong> ${result.orderedPages.map((p: number) => p + 1).join(' → ')}</p>
    </div>

    ${result.duplicates.length > 0 ? `
    <div class="section">
        <h2>Duplicate Pages Detected</h2>
        ${result.duplicates.map((group: number[], index: number) => `
            <div class="duplicate-group">
                <strong>Group ${index + 1}:</strong> Pages ${group.map((p: number) => p + 1).join(', ')}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${result.missingPages.length > 0 ? `
    <div class="section">
        <h2>Missing Pages</h2>
        ${result.missingPages.map((page: number) => `
            <div class="missing-page">Page ${page + 1}</div>
        `).join('')}
    </div>
    ` : ''}

    ${result.tableOfContents.length > 0 ? `
    <div class="section">
        <h2>Table of Contents</h2>
        ${result.tableOfContents.map((entry: any) => `
            <div class="toc-entry toc-level-${entry.level}">
                • ${entry.title} (Page ${entry.pageNumber})
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section">
        <h2>Processing Log</h2>
        ${result.log.map((entry: string) => `
            <div class="log-entry">${entry}</div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Reasoning</h2>
        <pre style="white-space: pre-wrap; background: #f8f9fa; padding: 20px; border-radius: 5px;">${result.reasoning}</pre>
    </div>
</body>
</html>
    `;
  }
}
