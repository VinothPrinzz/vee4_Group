// src/components/ui/FileDownload.js
import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

const FileDownload = ({ 
  fileName, 
  fileType = 'pdf',
  fileDate,
  onDownload,
  buttonText = 'Download'
}) => {
  return (
    <div className="file-download">
      <div className="file-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      </div>
      <div className="file-info">
        <div className="file-name">{fileName}</div>
        {fileDate && <div className="file-meta">{fileDate}</div>}
      </div>
      <Button variant="outline" size="sm" onClick={onDownload}>
        {buttonText}
      </Button>
    </div>
  );
};

FileDownload.propTypes = {
  fileName: PropTypes.string.isRequired,
  fileType: PropTypes.string,
  fileDate: PropTypes.string,
  onDownload: PropTypes.func.isRequired,
  buttonText: PropTypes.string
};

export default FileDownload;