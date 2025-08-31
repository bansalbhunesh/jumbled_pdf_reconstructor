import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, { 
      logger: ['log', 'error', 'warn', 'debug'] 
    });
    
    // Enable CORS for frontend
    app.enableCors({
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });
    
    const port = process.env.PORT ? Number(process.env.PORT) : 3001;
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
    
    await app.listen(port, host);
    console.log(`🚀 PDF Reconstructor API running on http://${host}:${port}`);
    console.log(`📱 Frontend should be running on http://localhost:3000`);
    console.log(`🔧 CORS enabled for frontend communication`);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
