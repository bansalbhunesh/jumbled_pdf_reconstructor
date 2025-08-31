"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsController = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const jobs_service_1 = require("./jobs.service");
const storage_1 = require("../storage");
let JobsController = class JobsController {
    constructor(jobs) {
        this.jobs = jobs;
    }
    create(file, emb, phash, autorotate, embedToc, ocrLang) {
        if (!file)
            throw new Error('No file uploaded (field name must be "file")');
        const info = this.jobs.create(path_1.default.resolve(file.path), {
            emb: emb === 'true',
            phash: phash === 'true',
            autorotate: autorotate === 'true',
            embedToc: embedToc === 'true',
            ocrLang: ocrLang || 'eng',
        });
        return info;
    }
    get(id) {
        const j = this.jobs.get(id);
        if (!j)
            throw new common_1.NotFoundException('job not found');
        return j;
    }
    async file(id, name, res) {
        const dir = (0, storage_1.runDirFor)(id);
        const filePath = path_1.default.join(dir, name);
        if (!fs_1.default.existsSync(filePath))
            throw new common_1.NotFoundException('file not found');
        res.download(filePath);
    }
};
exports.JobsController = JobsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => cb(null, 'uploads'),
            filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
        })
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)('emb')),
    __param(2, (0, common_1.Query)('phash')),
    __param(3, (0, common_1.Query)('autorotate')),
    __param(4, (0, common_1.Query)('embedToc')),
    __param(5, (0, common_1.Query)('ocrLang')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "get", null);
__decorate([
    (0, common_1.Get)(':id/files/:name'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('name')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "file", null);
exports.JobsController = JobsController = __decorate([
    (0, common_1.Controller)('jobs'),
    __metadata("design:paramtypes", [jobs_service_1.JobsService])
], JobsController);
