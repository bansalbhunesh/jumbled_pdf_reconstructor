"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const storage_1 = require("../storage");
// Import your existing pipeline pieces
const pdf_1 = require("../../src/pdf/pdf");
const order_1 = require("../../src/order/order");
const export_1 = require("../../src/export/export");
const toc_1 = require("../../src/analysis/toc");
const duplicates_1 = require("../../src/analysis/duplicates");
const missing_1 = require("../../src/analysis/missing");
const embeddings_1 = require("../../src/analysis/embeddings");
const config_1 = require("../../src/config");
let JobsService = class JobsService {
    constructor() {
        this.jobs = new Map();
        this.cfg = (0, config_1.loadConfig)();
    }
    create(filePath, options = {}) {
        const id = (0, uuid_1.v4)();
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
        if (!job)
            return;
        job.status = 'running';
        job.progress = 2;
        this.jobs.set(id, job);
        const runDir = (0, storage_1.runDirFor)(id);
        const inBuf = fs_1.default.readFileSync(filePath);
        const useEmb = options.emb ?? !!this.cfg.embeddings;
        const usePhash = options.phash ?? !!this.cfg.phash;
        const autorotate = options.autorotate ?? !!this.cfg.autorotate;
        const ocrLang = options.ocrLang || this.cfg.ocrLang || 'eng';
        // 1) Extract
        const pages = await (0, pdf_1.extractPages)(inBuf, this.cfg.tmpDir || './.tmp', { autorotate, ocrLang });
        job.progress = 25;
        this.jobs.set(id, job);
        // 2) Embeddings (optional)
        let embeds;
        if (useEmb) {
            // Get model from options or config
            const modelName = options.embeddingModel || this.cfg.embeddingModel || 'sentence-transformers/all-MiniLM-L6-v2';
            console.log(`🤖 Using embedding model: ${modelName}`);
            embeds = await (0, embeddings_1.computePageEmbeddings)(pages, modelName);
        }
        job.progress = 45;
        this.jobs.set(id, job);
        // 3) Order
        const result = (0, order_1.buildOrder)(pages, embeds);
        job.progress = 60;
        this.jobs.set(id, job);
        // 4) ToC + dup/missing
        const toc = (0, toc_1.generateToc)(pages);
        const dups = await (0, duplicates_1.findDuplicatePages)(pages, {
            jaccardThreshold: this.cfg.jaccardThreshold ?? 0.92,
            imagePdfPath: usePhash ? filePath : undefined,
            autorotate,
            hammingThreshold: this.cfg.hammingThreshold ?? 5
        });
        const missing = (0, missing_1.detectMissingPages)(pages);
        // 5) Write outputs into runDir
        const outPdf = path_1.default.join(runDir, 'ordered.pdf');
        const logJson = path_1.default.join(runDir, 'log.json');
        const reportHtml = path_1.default.join(runDir, 'report.html');
        const tocJson = path_1.default.join(runDir, 'toc.json');
        const dupmissJson = path_1.default.join(runDir, 'dup_missing.json');
        if (options.embedToc && toc.sections.length > 0) {
            const idxToNew = new Map();
            result.order.forEach((origIdx, pos) => idxToNew.set(origIdx, pos + 1));
            const tocItems = toc.sections.map(s => ({
                title: s.title,
                page: idxToNew.get(s.startPageIndex) ?? 1
            }));
            await (0, export_1.exportReorderedPDFWithToc)(inBuf, result.order, outPdf, tocItems);
        }
        else {
            await (0, export_1.exportReorderedPDF)(inBuf, result.order, outPdf);
        }
        (0, export_1.writeJsonLog)(result, pages, logJson);
        (0, export_1.writeHtmlReport)(result, reportHtml);
        (0, export_1.writeTocJson)(toc, tocJson);
        (0, export_1.writeDupMissingJson)(dups, missing, dupmissJson);
        job.progress = 95;
        this.jobs.set(id, job);
        // 6) finalize
        const files = (0, storage_1.listFiles)(runDir);
        job.status = 'succeeded';
        job.progress = 100;
        job.files = files;
        this.jobs.set(id, job);
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)()
], JobsService);
