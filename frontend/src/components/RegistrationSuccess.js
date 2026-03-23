import React from 'react';

const RegistrationSuccess = ({ registrationData, onNewRegistration }) => {
  const handleDownloadPDF = () => {
    if (registrationData.pdf) {
      const link = document.createElement('a');
      link.href = registrationData.pdf;
      link.download = `registration-certificate-${registrationData.id}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadBadge = () => {
    if (registrationData.badge) {
      const link = document.createElement('a');
      link.href = registrationData.badge;
      link.download = `voting-badge-${registrationData.id}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShareWhatsApp = () => {
    const shareText = `I'm registered and ready to vote! 🗳️\n\nGet your certificate and badge too!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="registration-success">
      <div className="success-header">
        <h2>🎉 Registration Successful!</h2>
        <p>Your certificate and voting badge are ready for download.</p>
      </div>

      <div className="downloads-section">
        <h3>📄 Download Your Documents</h3>
        <div className="download-grid">
          <div className="download-item">
            <div className="download-preview">
              <h4>📋 Registration Certificate</h4>
              <p>Official certificate with your details and photo</p>
            </div>
            <button 
              onClick={handleDownloadPDF}
              className="download-btn pdf"
              disabled={!registrationData.pdf}
            >
              📥 Download PDF
            </button>
          </div>

          <div className="download-item">
            <div className="download-preview">
              <h4>🗳️ Voting Badge</h4>
              <p>Show your voting pride with this official badge</p>
              {registrationData.badge_style && (
                <span className="badge-style">Style: {registrationData.badge_style}</span>
              )}
            </div>
            <button 
              onClick={handleDownloadBadge}
              className="download-btn badge"
              disabled={!registrationData.badge}
            >
              📥 Download Badge
            </button>
          </div>
        </div>
      </div>

      <div className="share-section">
        <h3>📱 Share Your Achievement</h3>
        <div className="share-buttons">
          <button 
            onClick={handleShareWhatsApp}
            className="share-btn whatsapp"
          >
            💬 Share on WhatsApp
          </button>
          <button 
            onClick={onNewRegistration}
            className="share-btn new-registration"
          >
            ➕ Register Another Person
          </button>
        </div>
      </div>

      <div className="info-section">
        <h4>ℹ️ What's Next?</h4>
        <ul>
          <li>Save your certificate and badge for voting day</li>
          <li>Share your badge to encourage others to vote</li>
          <li>Bring your certificate to the polling station if required</li>
          <li>You can download these files anytime using your phone number</li>
        </ul>
      </div>

      <style jsx>{`
        .registration-success {
          max-width: 800px;
          margin: 20px auto;
          padding: 30px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .success-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .success-header h2 {
          color: #28a745;
          font-size: 32px;
          margin-bottom: 10px;
        }

        .success-header p {
          color: #6c757d;
          font-size: 16px;
        }

        .downloads-section {
          margin-bottom: 30px;
        }

        .downloads-section h3 {
          color: #1e3a8a;
          font-size: 24px;
          margin-bottom: 20px;
          text-align: center;
        }

        .download-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .download-item {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
        }

        .download-preview h4 {
          color: #333;
          font-size: 18px;
          margin-bottom: 8px;
        }

        .download-preview p {
          color: #666;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .badge-style {
          background: #1e3a8a;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .download-btn {
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          margin-top: auto;
          transition: all 0.3s ease;
        }

        .download-btn.pdf {
          background: #007bff;
          color: white;
        }

        .download-btn.badge {
          background: #1e3a8a;
          color: white;
        }

        .download-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .download-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .share-section {
          margin-bottom: 30px;
          text-align: center;
        }

        .share-section h3 {
          color: #25D366;
          font-size: 24px;
          margin-bottom: 20px;
        }

        .share-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .share-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .share-btn.whatsapp {
          background: #25D366;
          color: white;
        }

        .share-btn.new-registration {
          background: #6c757d;
          color: white;
        }

        .share-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .info-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #1e3a8a;
        }

        .info-section h4 {
          color: #1e3a8a;
          margin-bottom: 15px;
        }

        .info-section ul {
          margin: 0;
          padding-left: 20px;
        }

        .info-section li {
          color: #666;
          margin-bottom: 8px;
        }

        @media (max-width: 768px) {
          .registration-success {
            padding: 20px;
            margin: 10px;
          }

          .download-grid {
            grid-template-columns: 1fr;
          }

          .share-buttons {
            flex-direction: column;
            align-items: center;
          }

          .success-header h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default RegistrationSuccess;
