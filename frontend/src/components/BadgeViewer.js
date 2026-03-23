import React, { useState } from 'react';

const BadgeViewer = ({ phone }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [badgeInfo, setBadgeInfo] = useState(null);

  const fetchBadgeInfo = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:4000/badge-info/${phone}`);
      const data = await response.json();
      
      if (data.success) {
        setBadgeInfo(data);
      } else {
        setError(data.error || 'Failed to get badge information');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppShare = (shareUrl) => {
    window.open(shareUrl, '_blank');
  };

  const handleDownloadBadge = (badgeUrl, type) => {
    const link = document.createElement('a');
    link.href = badgeUrl;
    link.download = `badge-${phone}-${type}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="badge-viewer">
      <h3>📱 WhatsApp Badge Options</h3>
      
      <button 
        onClick={fetchBadgeInfo}
        disabled={loading}
        className="fetch-btn"
      >
        {loading ? 'Loading...' : 'Get Badge Options'}
      </button>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {badgeInfo && (
        <div className="badge-info">
          <div className="user-info">
            <p><strong>Name:</strong> {badgeInfo.user.name}</p>
            <p><strong>Phone:</strong> {badgeInfo.user.phone}</p>
            <p><strong>Registered:</strong> {new Date(badgeInfo.user.created_at).toLocaleDateString()}</p>
          </div>

          <div className="badge-previews">
            <h4>Badge Previews:</h4>
            
            {/* WhatsApp Style Badges */}
            <div className="badge-section">
              <h5>📱 WhatsApp Style Badges</h5>
              <div className="badge-grid">
                <div className="badge-item">
                  <h6>Full Badge (for Status)</h6>
                  <img 
                    src={badgeInfo.badges.whatsapp_full_url} 
                    alt="WhatsApp Full Badge"
                    className="badge-image"
                  />
                  <div className="badge-actions">
                    <button 
                      onClick={() => handleDownloadBadge(badgeInfo.badges.whatsapp_full_url, 'whatsapp-full')}
                      className="download-btn"
                    >
                      ⬇️ Download
                    </button>
                    <button 
                      onClick={() => handleWhatsAppShare(badgeInfo.badges.status_share_url)}
                      className="whatsapp-btn"
                    >
                      📱 Share to Status
                    </button>
                  </div>
                </div>

                <div className="badge-item">
                  <h6>Simple Badge (for Chat)</h6>
                  <img 
                    src={badgeInfo.badges.whatsapp_simple_url} 
                    alt="WhatsApp Simple Badge"
                    className="badge-image simple"
                  />
                  <div className="badge-actions">
                    <button 
                      onClick={() => handleDownloadBadge(badgeInfo.badges.whatsapp_simple_url, 'whatsapp-simple')}
                      className="download-btn"
                    >
                      ⬇️ Download
                    </button>
                    <button 
                      onClick={() => handleWhatsAppShare(badgeInfo.badges.whatsapp_share_url)}
                      className="whatsapp-btn"
                    >
                      💬 Share in Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Voting Style Badges */}
            <div className="badge-section">
              <h5>🗳️ Voting Style Badges (New Design)</h5>
              <div className="badge-grid">
                <div className="badge-item">
                  <h6>Full Voting Badge</h6>
                  <img 
                    src={badgeInfo.badges.voting_full_url} 
                    alt="Voting Full Badge"
                    className="badge-image"
                  />
                  <div className="badge-actions">
                    <button 
                      onClick={() => handleDownloadBadge(badgeInfo.badges.voting_full_url, 'voting-full')}
                      className="download-btn"
                    >
                      ⬇️ Download
                    </button>
                    <button 
                      onClick={() => handleWhatsAppShare(badgeInfo.badges.voting_share_url)}
                      className="whatsapp-btn"
                    >
                      🗳️ Share Voting Badge
                    </button>
                  </div>
                </div>

                <div className="badge-item">
                  <h6>Simple Voting Badge</h6>
                  <img 
                    src={badgeInfo.badges.voting_simple_url} 
                    alt="Voting Simple Badge"
                    className="badge-image simple"
                  />
                  <div className="badge-actions">
                    <button 
                      onClick={() => handleDownloadBadge(badgeInfo.badges.voting_simple_url, 'voting-simple')}
                      className="download-btn"
                    >
                      ⬇️ Download
                    </button>
                    <button 
                      onClick={() => handleWhatsAppShare(badgeInfo.badges.voting_share_url)}
                      className="whatsapp-btn"
                    >
                      🗳️ Share Voting Badge
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="share-options">
            <h4>Quick Share Options:</h4>
            <div className="share-buttons">
              <button 
                onClick={() => handleWhatsAppShare(badgeInfo.badges.whatsapp_share_url)}
                className="share-btn primary"
              >
                📱 Share Registration + Badge
              </button>
              <button 
                onClick={() => handleWhatsAppShare(badgeInfo.badges.voting_share_url)}
                className="share-btn voting"
              >
                🗳️ Share Voting Badge
              </button>
              <button 
                onClick={() => handleWhatsAppShare(badgeInfo.badges.status_share_url)}
                className="share-btn secondary"
              >
                📱 Share Badge Only
              </button>
            </div>
          </div>

          <div className="direct-links">
            <h4>Direct Links:</h4>
            <div className="link-list">
              <p><strong>Full Badge:</strong> 
                <a href={badgeInfo.badges.full_badge_url} target="_blank" rel="noopener noreferrer">
                  View Badge
                </a>
              </p>
              <p><strong>Simple Badge:</strong> 
                <a href={badgeInfo.badges.simple_badge_url} target="_blank" rel="noopener noreferrer">
                  View Badge
                </a>
              </p>
              <p><strong>PDF Preview:</strong> 
                <a href={badgeInfo.pdf.preview_url} target="_blank" rel="noopener noreferrer">
                  View Certificate
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .badge-viewer {
          max-width: 800px;
          margin: 20px auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #f9f9f9;
        }

        .fetch-btn {
          padding: 12px 24px;
          background-color: #25D366;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          margin-bottom: 20px;
        }

        .fetch-btn:hover {
          background-color: #128C7E;
        }

        .error-message {
          color: red;
          margin: 10px 0;
          padding: 10px;
          background-color: #ffebee;
          border-radius: 4px;
        }

        .badge-info {
          margin-top: 20px;
        }

        .user-info {
          background-color: white;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          border-left: 4px solid #25D366;
        }

        .badge-previews {
          margin: 20px 0;
        }

        .badge-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 15px;
        }

        .badge-item {
          background-color: white;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }

        .badge-section {
          margin-bottom: 30px;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #1e3a8a;
        }

        .badge-section h5 {
          color: #1e3a8a;
          margin-bottom: 15px;
          font-size: 18px;
        }

        .badge-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin-bottom: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .badge-image.simple {
          max-width: 200px;
          max-height: 200px;
        }

        .badge-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .download-btn, .whatsapp-btn, .share-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          text-decoration: none;
          display: inline-block;
        }

        .download-btn {
          background-color: #007bff;
          color: white;
        }

        .whatsapp-btn {
          background-color: #25D366;
          color: white;
        }

        .share-btn.primary {
          background-color: #25D366;
          color: white;
          padding: 12px 20px;
          font-size: 16px;
        }

        .share-btn.voting {
          background-color: #1e3a8a;
          color: white;
          padding: 12px 20px;
          font-size: 16px;
        }

        .share-btn.secondary {
          background-color: #128C7E;
          color: white;
          padding: 12px 20px;
          font-size: 16px;
        }

        .download-btn:hover, .whatsapp-btn:hover, .share-btn:hover {
          opacity: 0.8;
        }

        .share-options {
          margin: 30px 0;
          background-color: white;
          padding: 20px;
          border-radius: 8px;
        }

        .share-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 15px;
        }

        .direct-links {
          margin-top: 20px;
          background-color: white;
          padding: 15px;
          border-radius: 8px;
        }

        .link-list a {
          color: #007bff;
          text-decoration: none;
          margin-left: 10px;
        }

        .link-list a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .badge-grid {
            grid-template-columns: 1fr;
          }

          .share-buttons {
            flex-direction: column;
            align-items: center;
          }

          .badge-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default BadgeViewer;
