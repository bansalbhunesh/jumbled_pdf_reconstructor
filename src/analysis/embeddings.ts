import { PageInfo } from '../pdf/pdf';
import { pipeline, env } from '@xenova/transformers';

// Configure transformers cache directory
env.cacheDir = './.cache/transformers';

export interface Embeddings {
  pageEmbeddings: Map<number, number[]>;
  model: string;
}

export interface ModelConfig {
  name: string;
  dimension: number;
  maxLength: number;
}

// Available models for different use cases
export const AVAILABLE_MODELS: Record<string, ModelConfig> = {
  'sentence-transformers/all-MiniLM-L6-v2': {
    name: 'all-MiniLM-L6-v2',
    dimension: 384,
    maxLength: 256
  },
  'sentence-transformers/all-mpnet-base-v2': {
    name: 'all-mpnet-base-v2', 
    dimension: 768,
    maxLength: 512
  },
  'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2': {
    name: 'paraphrase-multilingual-MiniLM-L12-v2',
    dimension: 384,
    maxLength: 256
  },
  'sentence-transformers/LaBSE': {
    name: 'LaBSE',
    dimension: 768,
    maxLength: 512
  }
};

export async function computePageEmbeddings(
  pages: PageInfo[], 
  modelName: string = 'sentence-transformers/all-MiniLM-L6-v2'
): Promise<Embeddings> {
  try {
    // Validate model selection
    if (!AVAILABLE_MODELS[modelName]) {
      console.warn(`Model ${modelName} not found, falling back to default`);
      modelName = 'sentence-transformers/all-MiniLM-L6-v2';
    }

    const modelConfig = AVAILABLE_MODELS[modelName];
    console.log(`🤖 Using embedding model: ${modelName} (${modelConfig.dimension}D)`);

    // Initialize the embedding pipeline
    const embedder = await pipeline('feature-extraction', modelName);
    
    const pageEmbeddings = new Map<number, number[]>();
    
    // Process each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      // Extract text content for embedding - use the 'content' property from PageInfo
      let textContent = page.content || '';
      
      // If no text content, skip this page
      if (!textContent.trim()) {
        console.warn(`⚠️ Page ${i + 1} has no text content, skipping embedding`);
        continue;
      }
      
      // Truncate text to model's max length
      const truncatedText = textContent.slice(0, modelConfig.maxLength);
      
      try {
        // Generate embedding
        const output = await embedder(truncatedText, { pooling: 'mean', normalize: true });
        const embedding = Array.from(output.data);
        
        pageEmbeddings.set(i, embedding);
        console.log(`✅ Page ${i + 1}: Generated ${embedding.length}D embedding`);
        
      } catch (error) {
        console.error(`❌ Failed to generate embedding for page ${i + 1}:`, error);
        // Fallback to placeholder embedding
        const fallbackEmbedding = Array.from({ length: modelConfig.dimension }, () => Math.random() - 0.5);
        pageEmbeddings.set(i, fallbackEmbedding);
      }
    }
    
    return {
      pageEmbeddings,
      model: modelName
    };
    
  } catch (error) {
    console.error('❌ Failed to initialize embedding pipeline:', error);
    console.log('🔄 Falling back to placeholder embeddings');
    
    // Fallback to placeholder embeddings
    const fallbackModel = AVAILABLE_MODELS['sentence-transformers/all-MiniLM-L6-v2'];
    const pageEmbeddings = new Map<number, number[]>();
    
    for (let i = 0; i < pages.length; i++) {
      const embedding = Array.from({ length: fallbackModel.dimension }, () => Math.random() - 0.5);
      pageEmbeddings.set(i, embedding);
    }
    
    return {
      pageEmbeddings,
      model: 'placeholder-fallback'
    };
  }
}

// Function to list available models
export function getAvailableModels(): string[] {
  return Object.keys(AVAILABLE_MODELS);
}

// Function to get model info
export function getModelInfo(modelName: string): ModelConfig | null {
  return AVAILABLE_MODELS[modelName] || null;
}
