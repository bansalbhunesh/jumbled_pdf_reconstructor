import fs from 'fs';
import path from 'path';
import { Controller, Get, Post, Param, Res, UploadedFile, UseInterceptors, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { JobsService } from './jobs.service';
import { runDirFor } from '../storage';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { 
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const timestamp = Date.now();
        const originalName = file.originalname;
        cb(null, `${timestamp}-${originalName}`);
      }
    })
  }))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Query('emb') emb?: string,
    @Query('phash') phash?: string,
    @Query('autorotate') autorotate?: string,
    @Query('embedToc') embedToc?: string,
    @Query('ocrLang') ocrLang?: string,
    @Query('embeddingModel') embeddingModel?: string,
  ) {
    console.log('📤 File upload received:', file?.originalname);
    console.log('📋 Query parameters:', { emb, phash, autorotate, embedToc, ocrLang, embeddingModel });
    
    if (!file) throw new Error('No file uploaded (field name must be "file")');
    
    try {
      console.log('🎯 Creating job for file:', file.path);
      const info = this.jobs.create(path.resolve(file.path), {
        emb: emb === 'true',
        phash: phash === 'true',
        autorotate: autorotate === 'true',
        embedToc: embedToc === 'true',
        ocrLang: ocrLang || 'eng',
        embeddingModel: embeddingModel,
      });
      console.log('✅ Job created successfully:', info);
      return info;
    } catch (error) {
      console.error('❌ Failed to create job:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Failed to create job: ${errorMessage}`);
    }
  }

  @Get(':id')
  get(@Param('id') id: string) {
    const j = this.jobs.get(id);
    if (!j) throw new NotFoundException('job not found');
    return j;
  }

  @Get(':id/files/:name')
  async file(@Param('id') id: string, @Param('name') name: string, @Res() res: Response) {
    const dir = runDirFor(id);
    const filePath = path.join(dir, name);
    if (!fs.existsSync(filePath)) throw new NotFoundException('file not found');
    res.download(filePath);
  }

  @Get('models/available')
  getAvailableModels() {
    const { getAvailableModels, getModelInfo } = require('../../src/analysis/embeddings');
    const models = getAvailableModels();
    const modelDetails = models.map((name: string) => ({
      name,
      ...getModelInfo(name)
    }));
    return {
      models: modelDetails,
      count: models.length,
      default: 'sentence-transformers/all-MiniLM-L6-v2'
    };
  }
}
