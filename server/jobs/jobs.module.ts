import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
