import fs from 'fs';
import path from 'path';

export interface Config {
  embeddings: boolean;
  phash: boolean;
  autorotate: boolean;
  ocrLang: string;
  jaccardThreshold: number;
  hammingThreshold: number;
  tmpDir: string;
  debug: boolean;
  // New model configuration options
  embeddingModel: string;
  enableModelSelection: boolean;
  modelCacheDir: string;
}

export function loadConfig(): Config {
  try {
    const configPath = path.resolve(process.cwd(), 'config.json');
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);
      
      // Merge with defaults, allowing config.json to override
      return {
        embeddings: true,
        phash: true,
        autorotate: true,
        ocrLang: 'eng',
        jaccardThreshold: 0.9,
        hammingThreshold: 6,
        tmpDir: '.tmp',
        debug: false,
        embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
        enableModelSelection: true,
        modelCacheDir: './.cache/transformers',
        ...config.processing, // Allow processing section to override
        ...config // Allow root level overrides
      };
    }
  } catch (error) {
    console.warn('Failed to load config.json, using defaults:', error);
  }

  // Default configuration
  return {
    embeddings: true,
    phash: true,
    autorotate: true,
    ocrLang: 'eng',
    jaccardThreshold: 0.9,
    hammingThreshold: 6,
    tmpDir: '.tmp',
    debug: false,
    embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
    enableModelSelection: true,
    modelCacheDir: './.cache/transformers'
  };
}
