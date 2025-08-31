import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { LoadingSpinner, Notification, FilePreview } from '../components';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Processing options state
  const [options, setOptions] = useState({
    emb: true,
    phash: true,
    autorotate: true,
    embedToc: true,
    ocrLang: 'eng'
  });
  
  const router = useRouter();

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Please select a PDF file';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 50MB';
    }
    return null;
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setError(null);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validationError = validateFile(droppedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFile(droppedFile);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleOptionChange = (key: string, value: boolean | string) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const submit = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Build query string with options
      const queryParams = new URLSearchParams({
        emb: options.emb.toString(),
        phash: options.phash.toString(),
        autorotate: options.autorotate.toString(),
        embedToc: options.embedToc.toString(),
        ocrLang: options.ocrLang
      });

      const response = await fetch(`http://localhost:3001/jobs?${queryParams}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      setJobId(result.id);
      setUploadProgress(100);
      
      // Redirect to job page after a short delay
      setTimeout(() => {
        router.push(`/jobs/${result.id}`);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      clearInterval(progressInterval);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">PDF Reconstructor</h1>
                <p className="text-sm text-gray-600">Intelligent PDF page reordering with AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                Documentation
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Reconstruct Your Jumbled PDF
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload a PDF with pages out of order and let our AI intelligently reconstruct it 
            using advanced OCR, content analysis, and page ordering algorithms.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Upload Your PDF
            </h3>
            <p className="text-gray-600">
              Drag and drop your PDF file here, or click to browse
            </p>
          </div>

          {!file ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
              onDrop={onDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your PDF here
              </p>
              <p className="text-gray-500 mb-4">
                or click to browse files
              </p>
              <p className="text-sm text-gray-400">
                Supports PDF files up to 50MB
              </p>
            </div>
          ) : (
            <FilePreview 
              file={file} 
              onRemove={() => setFile(null)}
              className="mx-auto max-w-md"
            />
          )}

          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Processing Options */}
        {file && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Processing Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.emb}
                    onChange={(e) => handleOptionChange('emb', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">AI Page Ordering</span>
                    <p className="text-xs text-gray-500">Use content analysis to determine logical page flow</p>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.phash}
                    onChange={(e) => handleOptionChange('phash', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Duplicate Detection</span>
                    <p className="text-xs text-gray-500">Identify and report duplicate pages</p>
                  </div>
                </label>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.embedToc}
                    onChange={(e) => handleOptionChange('embedToc', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Generate Table of Contents</span>
                    <p className="text-xs text-gray-500">Create automatic TOC from detected headings</p>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.autorotate}
                    onChange={(e) => handleOptionChange('autorotate', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Auto-rotate Pages</span>
                    <p className="text-xs text-gray-500">Correct page orientation automatically</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OCR Language
              </label>
              <select 
                value={options.ocrLang}
                onChange={(e) => handleOptionChange('ocrLang', e.target.value)}
                className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="eng">English</option>
                <option value="spa">Spanish</option>
                <option value="fra">French</option>
                <option value="deu">German</option>
                <option value="ita">Italian</option>
                <option value="por">Portuguese</option>
                <option value="rus">Russian</option>
                <option value="jpn">Japanese</option>
                <option value="kor">Korean</option>
                <option value="chi_sim">Chinese (Simplified)</option>
                <option value="chi_tra">Chinese (Traditional)</option>
                <option value="ara">Arabic</option>
              </select>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {file && (
          <div className="text-center">
            <button
              onClick={submit}
              disabled={isUploading}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isUploading ? (
                <>
                  <LoadingSpinner size="sm" color="white" className="mr-3" />
                  Processing PDF... {uploadProgress}%
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Reconstruct PDF
                </>
              )}
            </button>
          </div>
        )}

        {/* Notifications */}
        {error && (
          <Notification
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mt-8"
          />
        )}

        {jobId && (
          <Notification
            type="success"
            message="Job created successfully! Redirecting to job page..."
            className="mt-8"
          />
        )}

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-600 text-sm">
              Advanced OCR and content analysis to understand your document structure
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Page Ordering</h3>
            <p className="text-gray-600 text-sm">
              Intelligent algorithms determine the logical flow of your document
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Reports</h3>
            <p className="text-gray-600 text-sm">
              Detailed analysis with reasoning, TOC, and duplicate detection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
