# Model Selection Guide 🚀

This guide explains how to use different AI models for page ordering in the PDF Reconstructor application.

## 🎯 **Why You Weren't Able to Run Different Models Before**

The original implementation had these limitations:

1. **Placeholder Embeddings**: Only generated random vectors instead of real AI embeddings
2. **No Model Selection**: Hardcoded to use a single "placeholder" model
3. **Missing Configuration**: No way to specify which transformer model to use
4. **Incomplete Integration**: `@xenova/transformers` was installed but not actually used

## ✨ **What's Fixed Now**

✅ **Real AI Models**: Uses actual transformer models for content analysis  
✅ **Model Selection**: Choose from multiple pre-trained models  
✅ **Configuration**: Set default models via config or API parameters  
✅ **Frontend UI**: Model selection dropdown in the web interface  
✅ **API Support**: Model selection via query parameters  

## 🤖 **Available Models**

### **Fast & Efficient Models**
- **`sentence-transformers/all-MiniLM-L6-v2`** (Default)
  - **Dimensions**: 384
  - **Max Length**: 256 characters
  - **Best for**: Quick processing, English documents
  - **Memory**: Low

- **`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`**
  - **Dimensions**: 384
  - **Max Length**: 256 characters
  - **Best for**: Multilingual documents
  - **Memory**: Low

### **High-Quality Models**
- **`sentence-transformers/all-mpnet-base-v2`**
  - **Dimensions**: 768
  - **Max Length**: 512 characters
  - **Best for**: High accuracy, complex documents
  - **Memory**: Medium

- **`sentence-transformers/LaBSE`**
  - **Dimensions**: 768
  - **Max Length**: 512 characters
  - **Best for**: Multilingual, high accuracy
  - **Memory**: Medium

## 🚀 **How to Use Different Models**

### **Method 1: Web Interface (Recommended)**

1. **Start the application**:
   ```bash
   # Windows
   start-local.bat
   
   # Mac/Linux
   ./start-local.sh
   ```

2. **Open** http://localhost:3000 in your browser

3. **Upload a PDF** and enable "AI Page Ordering"

4. **Select your model** from the dropdown:
   - Models are automatically loaded from the backend
   - Each shows dimensions and max text length
   - Choose based on your needs (speed vs. accuracy)

### **Method 2: API Direct**

```bash
# Use a specific model via API
curl -X POST "http://localhost:3001/jobs?embeddingModel=sentence-transformers/all-mpnet-base-v2" \
  -F "file=@your-document.pdf" \
  -F "emb=true"
```

### **Method 3: Configuration File**

Create `config.json` based on `config.example.json`:

```json
{
  "processing": {
    "embeddingModel": "sentence-transformers/all-mpnet-base-v2",
    "enableModelSelection": true,
    "modelCacheDir": "./.cache/transformers"
  }
}
```

## 🔧 **Model Configuration Options**

### **Query Parameters**
- `embeddingModel`: Model name (e.g., `sentence-transformers/all-MiniLM-L6-v2`)
- `emb`: Enable embeddings (`true`/`false`)

### **Configuration File Options**
- `embeddingModel`: Default model to use
- `enableModelSelection`: Allow model switching
- `modelCacheDir`: Where to store downloaded models

## 📊 **Model Performance Comparison**

| Model | Speed | Accuracy | Memory | Multilingual | Best Use Case |
|-------|-------|----------|---------|--------------|---------------|
| `all-MiniLM-L6-v2` | ⚡⚡⚡ | ⭐⭐⭐ | 💾 | ❌ | Quick processing, English docs |
| `paraphrase-multilingual-MiniLM-L12-v2` | ⚡⚡⚡ | ⭐⭐⭐ | 💾 | ✅ | Multilingual, fast processing |
| `all-mpnet-base-v2` | ⚡⚡ | ⭐⭐⭐⭐ | 💾💾 | ❌ | High accuracy, complex docs |
| `LaBSE` | ⚡⚡ | ⭐⭐⭐⭐⭐ | 💾💾 | ✅ | Best accuracy, multilingual |

## 🧪 **Testing Models**

### **Test Script**
```bash
node test-models.js
```

This will:
- Test each available model
- Generate sample embeddings
- Verify model functionality
- Show available models from API

### **Manual Testing**
1. **Start the server**: `npm run api:dev`
2. **Test API endpoint**: `GET /jobs/models/available`
3. **Process a PDF** with different models
4. **Compare results** in the generated logs

## 🐛 **Troubleshooting**

### **Model Download Issues**
```bash
# Clear model cache
rm -rf ./.cache/transformers

# Check disk space
df -h

# Verify internet connection
curl -I https://huggingface.co
```

### **Memory Issues**
- Use smaller models (384D instead of 768D)
- Process smaller PDFs
- Increase Node.js memory: `node --max-old-space-size=4096`

### **Model Not Found**
```bash
# Check available models
curl http://localhost:3001/jobs/models/available

# Verify model name spelling
# Check HuggingFace model availability
```

## 🔮 **Future Enhancements**

- **Custom Model Upload**: Upload your own trained models
- **Model Fine-tuning**: Adapt models to specific document types
- **Batch Processing**: Process multiple PDFs with different models
- **Model Performance Metrics**: Track accuracy and speed
- **Auto-model Selection**: Choose best model based on document type

## 📚 **Technical Details**

### **How It Works**
1. **Text Extraction**: OCR extracts text from PDF pages
2. **Model Loading**: Selected transformer model is loaded
3. **Embedding Generation**: Text is converted to numerical vectors
4. **Similarity Analysis**: Vectors are compared to find page relationships
5. **Page Ordering**: Graph algorithm determines logical sequence

### **Model Storage**
- **Location**: `./.cache/transformers/`
- **Format**: HuggingFace model files
- **Size**: 50MB - 500MB per model
- **Caching**: Models are downloaded once and reused

### **API Endpoints**
- `GET /jobs/models/available` - List available models
- `POST /jobs?embeddingModel=...` - Process PDF with specific model

## 🎉 **You're All Set!**

Now you can:
- ✅ **Choose different AI models** for page ordering
- ✅ **Compare model performance** and accuracy
- ✅ **Optimize for your use case** (speed vs. quality)
- ✅ **Use multilingual models** for international documents
- ✅ **Configure default models** via config files

The PDF Reconstructor now provides real AI-powered page ordering with multiple model options! 🚀
