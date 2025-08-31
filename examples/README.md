# Test Files for PDF Reconstructor

This directory contains test files to demonstrate and validate the PDF Reconstructor system.

## 📄 **Available Test Files**

### **1. Loan-Agreement-Shuffled-Scanned.pdf**
- **Type**: Legal document with shuffled pages
- **Purpose**: Test complex document reconstruction
- **Challenge**: Legal documents have specific logical flow requirements
- **Expected**: System should identify contract sections and order them logically

### **2. jumbled.pdf**
- **Type**: General document with mixed-up pages
- **Purpose**: Basic functionality testing
- **Challenge**: Standard page ordering based on content
- **Expected**: Pages should be ordered by content similarity

### **3. ordered.pdf**
- **Type**: Correctly ordered version of jumbled.pdf
- **Purpose**: Reference for validation
- **Use**: Compare with reconstruction results to verify accuracy

## 🧪 **Testing Scenarios**

### **Basic Functionality**
1. Upload `jumbled.pdf`
2. Use default settings
3. Compare result with `ordered.pdf`
4. Verify page order accuracy

### **Advanced Features**
1. Upload `Loan-Agreement-Shuffled-Scanned.pdf`
2. Enable all processing options:
   - AI Page Ordering
   - Duplicate Detection
   - Auto-rotation
   - TOC Generation
3. Test different AI models
4. Verify comprehensive output

### **Edge Cases**
1. **Empty pages**: Test handling of blank pages
2. **Mixed languages**: Test OCR with different languages
3. **Large files**: Test performance with bigger documents
4. **Poor quality scans**: Test OCR fallback mechanisms

## 📊 **Expected Results**

### **Accuracy Metrics**
- **Simple documents**: 90-95% accuracy
- **Complex documents**: 85-90% accuracy
- **Poor quality scans**: 70-80% accuracy

### **Processing Times**
- **Small documents** (1-5 pages): 5-15 seconds
- **Medium documents** (6-20 pages): 15-45 seconds
- **Large documents** (20+ pages): 45+ seconds

## 🔍 **Validation Checklist**

- [ ] **Page Order**: Pages are in logical sequence
- [ ] **Content Integrity**: No content lost during processing
- [ ] **TOC Generation**: Table of contents is accurate
- [ ] **Duplicate Detection**: Identifies any duplicate pages
- [ ] **Report Quality**: HTML report shows clear reasoning
- [ ] **Performance**: Processing time is reasonable

## 📝 **Adding Your Own Test Files**

To add more test files:

1. **Place PDF files** in this directory
2. **Update this README** with file descriptions
3. **Test thoroughly** before submission
4. **Document any special characteristics** or challenges

### **Recommended Test File Types**
- **Academic papers** with complex structure
- **Technical manuals** with numbered sections
- **Multi-language documents** for OCR testing
- **Very large documents** for performance testing
- **Poor quality scans** for robustness testing

## 🚀 **Quick Test Commands**

```bash
# Test the API endpoint
curl http://localhost:3001/jobs/models/available

# Test file upload (replace with actual file path)
curl -X POST "http://localhost:3001/jobs?emb=true&embedToc=true" \
  -F "file=@examples/jumbled.pdf"
```

## 📈 **Performance Benchmarking**

Use these files to benchmark:
- **Processing speed** across different document sizes
- **Memory usage** with various AI models
- **Accuracy** with different document types
- **Scalability** as document complexity increases

---

**These test files ensure your PDF Reconstructor works reliably across various scenarios!**
