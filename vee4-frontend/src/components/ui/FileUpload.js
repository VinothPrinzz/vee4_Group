// src/components/ui/FileUpload.js
import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

const FileUpload = ({
  accept = '.pdf',
  maxSize = 10, // MB
  onChange,
  placeholder = 'Drag and drop your file here or click to browse',
  supportedFormats = 'PDF only',
  icon = null,
  showPreview = true,
  multiple = false,
  value = null
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const inputRef = useRef(null);
  const dropAreaRef = useRef(null);
  
  // Initialize files if value is provided
  useEffect(() => {
    if (value) {
      if (Array.isArray(value)) {
        setFiles(value);
      } else if (value instanceof File) {
        setFiles([value]);
      }
    }
  }, [value]);
  
  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Simulate upload progress for demo purposes
  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };
  
  // Validate file
  const validateFile = (file) => {
    // Check if file type matches the accept attribute
    const fileType = file.type;
    const acceptTypes = accept.split(',').map(type => type.trim());
    
    const isTypeValid = acceptTypes.some(type => {
      // Handle wildcards like "image/*"
      if (type.endsWith('/*')) {
        const category = type.split('/')[0];
        return fileType.startsWith(`${category}/`);
      }
      // Handle specific types or extensions
      return type === fileType || 
        (type.startsWith('.') && file.name.endsWith(type));
    });
    
    if (!isTypeValid) {
      setError(`Invalid file type. ${supportedFormats} are supported.`);
      return false;
    }
    
    // Check file size (convert maxSize from MB to bytes)
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds the ${maxSize}MB limit.`);
      return false;
    }
    
    return true;
  };
  
  // Process uploaded files
  const processFiles = (fileList) => {
    const validFiles = [];
    setError('');
    
    // Convert FileList to array
    const filesArray = Array.from(fileList);
    
    // Validate each file
    for (const file of filesArray) {
      if (validateFile(file)) {
        validFiles.push(file);
      } else {
        // Stop on first invalid file
        return;
      }
    }
    
    if (validFiles.length > 0) {
      // Update state with valid files
      const newFiles = multiple ? [...files, ...validFiles] : [validFiles[0]];
      setFiles(newFiles);
      
      // Simulate upload progress
      simulateProgress();
      
      // Call onChange callback with the new files
      onChange(multiple ? newFiles : newFiles[0]);
    }
  };
  
  // Handle file input change
  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };
  
  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };
  
  // Handle click on the upload area
  const handleClick = () => {
    inputRef.current.click();
  };
  
  // Remove a file from the list
  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onChange(multiple ? newFiles : newFiles[0] || null);
  };
  
  // File type icon based on file extension
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M9 15H7v-2h2v2z"></path>
            <path d="M13 15h-2v-2h2v2z"></path>
            <path d="M17 15h-2v-2h2v2z"></path>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        );
    }
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const defaultIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  );
  
  return (
    <div className="file-upload-container">
      {/* Upload Area */}
      <div 
        ref={dropAreaRef}
        className={`upload-area ${dragActive ? 'active' : ''} ${files.length ? 'has-files' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="upload-content">
          <div className="upload-icon">
            {icon || defaultIcon}
          </div>
          
          <div className="upload-text">
            {files.length === 0 ? (
              <>
                <p>{placeholder}</p>
                <p className="upload-description">
                  Supported format: {supportedFormats}. Max size: {maxSize}MB
                </p>
              </>
            ) : (
              <p>Click or drag to add more files</p>
            )}
          </div>
          
          {error && <p className="upload-error">{error}</p>}
          
          <input 
            type="file"
            ref={inputRef}
            style={{ display: 'none' }}
            accept={accept}
            onChange={handleChange}
            multiple={multiple}
          />
          
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="upload-button"
          >
            Browse Files
          </Button>
        </div>
      </div>
      
      {/* File Preview Area */}
      {showPreview && files.length > 0 && (
        <div className="file-preview-container">
          <h4 className="file-preview-title">Uploaded Files</h4>
          
          <div className="file-preview-list">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="file-preview-item">
                <div className="file-preview-icon">
                  {getFileIcon(file.name)}
                </div>
                
                <div className="file-preview-details">
                  <div className="file-preview-name">{file.name}</div>
                  <div className="file-preview-size">{formatFileSize(file.size)}</div>
                  
                  {uploadProgress < 100 && (
                    <div className="file-preview-progress">
                      <div 
                        className="file-preview-progress-bar" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                
                <button 
                  className="file-preview-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  aria-label="Remove file"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

FileUpload.propTypes = {
  accept: PropTypes.string,
  maxSize: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  supportedFormats: PropTypes.string,
  icon: PropTypes.node,
  showPreview: PropTypes.bool,
  multiple: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.instanceOf(File),
    PropTypes.arrayOf(PropTypes.instanceOf(File))
  ])
};

export default FileUpload;