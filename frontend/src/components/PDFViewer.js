import React, { useState } from 'react';

const PDFViewer = ({ phone }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfInfo, setPdfInfo] = useState(null);

  const fetchPDFInfo = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:4000/pdf-info/${phone}`);
      const data = await response.json();
      
      if (data.success) {
        setPdfInfo(data);
      } else {
        setError(data.error || 'Failed to get PDF information');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (pdfInfo?.pdf?.download_url) {
      window.open(pdfInfo.pdf.download_url, '_blank');
    }
  };

  const handlePreview = () => {
    if (pdfInfo?.pdf?.preview_url) {
      window.open(pdfInfo.pdf.preview_url, '_blank');
    }
  };

  return (
    <div className="pdf-viewer">
      <h3>PDF Options for {phone}</h3>
      
      <button 
        onClick={fetchPDFInfo}
        disabled={loading}
        className="fetch-btn"
      >
        {loading ? 'Loading...' : 'Get PDF Options'}
      </button>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {pdfInfo && (
        <div className="pdf-info">
          <div className="user-info">
            <p><strong>Name:</strong> {pdfInfo.user.name}</p>
            <p><strong>Phone:</strong> {pdfInfo.user.phone}</p>
            <p><strong>Registered:</strong> {new Date(pdfInfo.user.created_at).toLocaleDateString()}</p>
          </div>

          <div className="pdf-actions">
            <button 
              onClick={handlePreview}
              className="preview-btn"
            >
              📄 Preview PDF
            </button>
            
            <button 
              onClick={handleDownload}
              className="download-btn"
            >
              ⬇️ Download PDF
            </button>
          </div>

          <div className="pdf-links">
            <h4>Direct Links:</h4>
            <p><strong>Preview:</strong> 
              <a href={pdfInfo.pdf.preview_url} target="_blank" rel="noopener noreferrer">
                {pdfInfo.pdf.preview_url}
              </a>
            </p>
            <p><strong>Download:</strong> 
              <a href={pdfInfo.pdf.download_url} target="_blank" rel="noopener noreferrer">
                {pdfInfo.pdf.download_url}
              </a>
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        .pdf-viewer {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        .fetch-btn, .preview-btn, .download-btn {
          padding: 10px 20px;
          margin: 5px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .fetch-btn {
          background-color: #0078d4;
          color: white;
        }

        .preview-btn {
          background-color: #28a745;
          color: white;
        }

        .download-btn {
          background-color: #ffc107;
          color: black;
        }

        .fetch-btn:hover, .preview-btn:hover, .download-btn:hover {
          opacity: 0.8;
        }

        .error-message {
          color: red;
          margin-top: 10px;
          padding: 10px;
          background-color: #ffebee;
          border-radius: 4px;
        }

        .pdf-info {
          margin-top: 20px;
        }

        .user-info {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 15px;
        }

        .pdf-actions {
          margin: 15px 0;
        }

        .pdf-links {
          margin-top: 20px;
        }

        .pdf-links a {
          color: #0078d4;
          text-decoration: none;
          word-break: break-all;
        }

        .pdf-links a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default PDFViewer;
