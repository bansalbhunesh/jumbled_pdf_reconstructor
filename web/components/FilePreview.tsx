import React from 'react';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  className?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove, className = '' }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') {
      return (
        <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H8z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H8z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {getFileIcon(file.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
          <p className="text-xs text-gray-400 capitalize">
            {file.type.replace('application/', '').toUpperCase()}
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={onRemove}
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
