const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');
const { runDirFor, listFiles } = require('../storage');
const { extractPages } = require('../../src/pdf/pdf');
const { computePageEmbeddings } = require('../../src/analysis/embeddings');
const { buildOrder } = require('../../src/order/order');
const { generateToc } = require('../../src/analysis/toc');
const { findDuplicatePages } = require('../../src/analysis/duplicates');
const { detectMissingPages } = require('../../src/analysis/missing');
const { exportReorderedPDF, exportReorderedPDFWithToc, writeJsonLog, writeHtmlReport, writeTocJson, writeDupMissingJson } = require('../../src/export/export');

class JobsService {
  constructor() {
    this.jobs = new Map();
  }

  create(filePath, options = {}) {
    const id = uuid();
    const info = { id, status: 'queued', progress: 0 };
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

  get(id) {
    return this.jobs.get(id);
  }

  async process(id, filePath, options) {
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

      // Process the PDF using improved logic
      const outputPath = path.join(runDir, 'ordered.pdf');
      
      // Read PDF buffer
      const pdfBuffer = fs.readFileSync(filePath);
      
      // Step 1: Extract pages
      console.log(`📄 Extracting pages from PDF...`);
      const pages = await extractPages(pdfBuffer, './.tmp', {
        autorotate: processingOptions.autorotate,
        ocrLang: processingOptions.ocrLang
      });
      
      job.progress = 30;
      this.jobs.set(id, job);

      // Step 2: Compute embeddings (optional)
      let embeddings;
      if (processingOptions.emb) {
        console.log(`🤖 Computing page embeddings...`);
        const modelName = 'sentence-transformers/all-MiniLM-L6-v2';
        embeddings = await computePageEmbeddings(pages, modelName);
      }
      
      job.progress = 50;
      this.jobs.set(id, job);

      // Step 3: Determine page order using improved algorithm
      console.log(`🧠 Analyzing page content and determining order...`);
      const orderResult = buildOrder(pages, embeddings);
      
      console.log(`📋 Determined page order:`, orderResult.order.map(i => i + 1));
      console.log(`🎯 Confidence: ${orderResult.confidence.toFixed(2)}`);
      console.log(`💭 Reasoning: ${orderResult.reasoning}`);
      
      job.progress = 70;
      this.jobs.set(id, job);

      // Step 4: Generate analysis reports
      console.log(`📊 Generating analysis reports...`);
      
      // Generate TOC
      const toc = generateToc(pages);
      console.log(`📖 Generated TOC with ${toc.sections.length} sections`);
      
      // Find duplicates if enabled
      let duplicates = [];
      if (processingOptions.phash) {
        try {
          duplicates = await findDuplicatePages(pages, {
            jaccardThreshold: 0.92,
            imagePdfPath: filePath,
            autorotate: processingOptions.autorotate,
            hammingThreshold: 5
          });
          console.log(`🔍 Found ${duplicates.length} duplicate groups`);
        } catch (error) {
          console.warn(`⚠️ Duplicate detection failed:`, error);
        }
      }
      
      // Detect missing pages
      const missing = detectMissingPages(pages);
      console.log(`❓ Detected ${missing.length} potentially missing pages`);
      
      job.progress = 80;
      this.jobs.set(id, job);

      // Step 5: Create reconstructed PDF
      console.log(`🔨 Creating reconstructed PDF...`);
      
      if (processingOptions.embedToc && toc.sections.length > 0) {
        // Create TOC items with page numbers
        const tocItems = toc.sections.map(section => ({
          title: section.title,
          page: section.startPageIndex // This is already 0-based
        }));
        
        await exportReorderedPDFWithToc(pdfBuffer, orderResult.order, outputPath, tocItems);
        console.log(`📄 Created PDF with TOC: ${outputPath}`);
      } else {
        await exportReorderedPDF(pdfBuffer, orderResult.order, outputPath);
        console.log(`📄 Created reconstructed PDF: ${outputPath}`);
      }
      
      // Create result object compatible with the old interface
      const result = {
        orderedPages: orderResult.order,
        duplicates,
        missingPages: missing,
        tableOfContents: toc.sections,
        reasoning: orderResult.reasoning,
        log: [`Page order determined: ${orderResult.order.join(' -> ')}`]
      };

      // Update progress
      job.progress = 80;
      this.jobs.set(id, job);

      // Generate additional output files
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
      job.error = error?.message || String(error);
      job.progress = 100;
      this.jobs.set(id, job);
    }
  }

}

module.exports = { JobsService };
