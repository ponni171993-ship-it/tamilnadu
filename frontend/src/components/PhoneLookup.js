import React, { useState } from 'react';
import PDFViewer from './PDFViewer';
import BadgeViewer from './BadgeViewer';

const PhoneLookup = () => {
  const [phone, setPhone] = useState('');
  const [submittedPhone, setSubmittedPhone] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pdf');

  const validatePhone = (phone) => {
    return /^[6-9]\d{9}$/.test(phone);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!phone) {
      setError('Please enter a phone number');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setSubmittedPhone(phone);
  };

  const handleReset = () => {
    setPhone('');
    setSubmittedPhone('');
    setError('');
  };

  return (
    <div className="phone-lookup">
      <h2>PDF Lookup by Phone Number</h2>
      
      {!submittedPhone ? (
        <form onSubmit={handleSubmit} className="lookup-form">
          <div className="form-group">
            <label htmlFor="phone">Phone Number:</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              pattern="[6-9][0-9]{9}"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button type="submit" className="submit-btn">
            Search PDF
          </button>
        </form>
      ) : (
        <div className="results">
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'pdf' ? 'active' : ''}`}
              onClick={() => setActiveTab('pdf')}
            >
              📄 PDF Certificate
            </button>
            <button 
              className={`tab-btn ${activeTab === 'badge' ? 'active' : ''}`}
              onClick={() => setActiveTab('badge')}
            >
              📱 WhatsApp Badge
            </button>
          </div>

          {activeTab === 'pdf' && <PDFViewer phone={submittedPhone} />}
          {activeTab === 'badge' && <BadgeViewer phone={submittedPhone} />}
          
          <button 
            onClick={handleReset}
            className="reset-btn"
          >
            🔍 Search Another Number
          </button>
        </div>
      )}

      <style jsx>{`
        .phone-lookup {
          max-width: 800px;
          margin: 20px auto;
          padding: 20px;
        }

        .lookup-form {
          background-color: #f8f9fa;
          padding: 30px;
          border-radius: 8px;
          border: 1px solid #dee2e6;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #0078d4;
          box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
        }

        .submit-btn, .reset-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
        }

        .submit-btn {
          background-color: #0078d4;
          color: white;
        }

        .reset-btn {
          background-color: #6c757d;
          color: white;
          margin-top: 20px;
        }

        .submit-btn:hover, .reset-btn:hover {
          opacity: 0.8;
        }

        .error-message {
          color: #dc3545;
          margin: 10px 0;
          padding: 10px;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
        }

        .results {
          margin-top: 20px;
        }

        .tabs {
          display: flex;
          margin-bottom: 20px;
          border-bottom: 2px solid #dee2e6;
        }

        .tab-btn {
          padding: 12px 24px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          color: #6c757d;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }

        .tab-btn.active {
          color: #0078d4;
          border-bottom-color: #0078d4;
        }

        .tab-btn:hover {
          color: #0078d4;
        }

        @media (max-width: 768px) {
          .phone-lookup {
            padding: 10px;
          }

          .lookup-form {
            padding: 20px;
          }

          .tabs {
            flex-direction: column;
            border-bottom: none;
          }

          .tab-btn {
            border-bottom: 1px solid #dee2e6;
            border-radius: 0;
          }

          .tab-btn.active {
            border-bottom-color: #0078d4;
            background-color: #f8f9fa;
          }
        }
      `}</style>
    </div>
  );
};

export default PhoneLookup;
