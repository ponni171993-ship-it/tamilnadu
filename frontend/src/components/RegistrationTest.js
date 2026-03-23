import React, { useState } from 'react';

const RegistrationTest = () => {
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);

  const testRegistration = async () => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('phone', '9876543210');
      
      // Create a simple test image
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#007bff';
      ctx.fillRect(0, 0, 100, 100);
      
      canvas.toBlob(async (blob) => {
        formData.append('photo', blob, 'test.png');
        
        const response = await fetch('http://localhost:4000/register', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        setResponseData(data);
        setLoading(false);
        
        console.log('Registration Response:', data);
        console.log('Has Badge:', !!data.badge);
        console.log('Badge Style:', data.badge_style);
      });
      
    } catch (error) {
      console.error('Test error:', error);
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (responseData?.pdf) {
      const link = document.createElement('a');
      link.href = responseData.pdf;
      link.download = `registration-certificate.pdf`;
      link.click();
    }
  };

  const handleDownloadBadge = () => {
    if (responseData?.badge) {
      const link = document.createElement('a');
      link.href = responseData.badge;
      link.download = `voting-badge.png`;
      link.click();
    }
  };

  return (
    <div className="registration-test">
      <h2>🧪 Registration Test</h2>
      
      <button onClick={testRegistration} disabled={loading}>
        {loading ? 'Testing...' : 'Test Registration'}
      </button>

      {responseData && (
        <div className="response-data">
          <h3>✅ Registration Response:</h3>
          <div className="response-grid">
            <div className="response-item">
              <h4>📄 PDF Certificate</h4>
              <p>Available: {responseData.pdf ? '✅ Yes' : '❌ No'}</p>
              <p>Path: {responseData.pdf_path}</p>
              <button onClick={handleDownloadPDF} disabled={!responseData.pdf}>
                📥 Download PDF
              </button>
            </div>
            
            <div className="response-item">
              <h4>🗳️ Voting Badge</h4>
              <p>Available: {responseData.badge ? '✅ Yes' : '❌ No'}</p>
              <p>Style: {responseData.badge_style}</p>
              <p>Size: {responseData.badge ? Math.round(responseData.badge.length / 1024) + ' KB' : 'N/A'}</p>
              <button onClick={handleDownloadBadge} disabled={!responseData.badge}>
                📥 Download Badge
              </button>
            </div>
          </div>
          
          <div className="raw-response">
            <h4>📋 Full Response:</h4>
            <pre>{JSON.stringify(responseData, null, 2)}</pre>
          </div>
        </div>
      )}

      <style jsx>{`
        .registration-test {
          max-width: 800px;
          margin: 20px auto;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .response-data {
          margin-top: 20px;
        }

        .response-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }

        .response-item {
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .response-item h4 {
          margin-bottom: 10px;
          color: #333;
        }

        .response-item p {
          margin: 5px 0;
          color: #666;
        }

        button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin: 5px;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .response-grid button {
          background: #007bff;
          color: white;
        }

        .response-grid button:hover:not(:disabled) {
          background: #0056b3;
        }

        .raw-response {
          background: #f1f3f4;
          padding: 15px;
          border-radius: 4px;
          margin-top: 20px;
        }

        .raw-response h4 {
          margin-bottom: 10px;
        }

        .raw-response pre {
          font-size: 12px;
          overflow-x: auto;
          max-height: 300px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default RegistrationTest;
