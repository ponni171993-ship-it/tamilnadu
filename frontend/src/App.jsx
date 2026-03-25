import { useState, useEffect } from 'react';
import './App.css';
import { t, getCurrentLanguage } from './translations.js';
import { registerUser } from './api.js';

// Helper function to download data URLs as files
function downloadDataUrl(dataUrl, filename) {
  try {
    // Validate input
    if (!dataUrl || typeof dataUrl !== 'string') {
      throw new Error('Invalid data URL');
    }

    // Check if it's actually a data URL
    if (!dataUrl.startsWith('data:')) {
      throw new Error('Not a data URL');
    }

    // Parse the data URL
    const parts = dataUrl.split(',');
    if (parts.length !== 2) {
      throw new Error('Malformed data URL');
    }

    const header = parts[0]; // e.g., "data:image/png;base64"
    const base64Data = parts[1]; // The actual base64 string

    // Extract MIME type
    const mimeMatch = header.match(/^data:([^;]+)/);
    if (!mimeMatch) {
      throw new Error('Invalid MIME type');
    }
    const mimeString = mimeMatch[1];

    // Decode base64
    const byteString = atob(base64Data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    // Create Blob from ArrayBuffer
    const blob = new Blob([ab], { type: mimeString });
    
    // Create object URL and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error details:', { error, dataUrl: dataUrl?.substring(0, 100) });
    throw new Error(`Failed to download file: ${error.message}`);
  }
}

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', photo: null });
  const [pdfUrl, setPdfUrl] = useState(null);
  const [badgeUrl, setBadgeUrl] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [lang, setLang] = useState(getCurrentLanguage());
  const [forceUpdate, setForceUpdate] = useState(0);

  // Re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => setForceUpdate(prev => prev + 1);
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    // Special handling for phone number input
    if (name === 'phone') {
      // Only allow numbers and limit to 10 digits
      const phoneValue = value.replace(/\D/g, '').slice(0, 10);
      setForm((prev) => ({
        ...prev,
        [name]: phoneValue,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: files ? files[0] : value,
      }));
    }
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (form.name.length < 2 || form.name.length > 50) {
      setError('Name must be between 2 and 50 characters');
      return;
    }
    
    if (form.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError('Please enter a valid Indian mobile number starting with 6, 7, 8, or 9');
      return;
    }
    
    if (!form.photo) {
      setError('Please upload a photo');
      return;
    }
    
    if (form.photo.size > 5 * 1024 * 1024) {
      setError('Photo size must be less than 5MB');
      return;
    }
    
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    setRetryCount(0);
    setUploadStage('uploading');
    
    try {
      const res = await registerUser(form, (percent, loaded, total) => {
        setUploadProgress(percent);
        if (percent < 30) {
          setUploadStage('uploading');
        } else if (percent < 80) {
          setUploadStage('generating');
        } else {
          setUploadStage('processing');
        }
      });
      
      // Validate response data URLs
      if (res.pdf && !res.pdf.startsWith('data:')) {
        console.warn('Invalid PDF URL format:', res.pdf?.substring(0, 100));
        throw new Error('Invalid PDF format received from server');
      }
      if (res.badge && !res.badge.startsWith('data:')) {
        console.warn('Invalid Badge URL format:', res.badge?.substring(0, 100));
        throw new Error('Invalid Badge format received from server');
      }

      setUploadStage('completed');
      setPdfUrl(res.pdf);
      setBadgeUrl(res.badge);
      setRegistrationData(res);
      setShowPopup(false);
      setForm({ name: '', phone: '', photo: null });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setUploadStage('');
    }
  };
    
    
  
  return (
    <div className="container">
      <div className="lang-switch">
        <span>{t('language')}: </span>
        <button
          className={lang === 'ta' ? 'active' : ''}
          onClick={() => {
            setLang('ta');
            localStorage.setItem('language', 'ta');
            window.dispatchEvent(new Event('languagechange'));
          }}
        >
          {t('tamil')}
        </button>
        <button
          className={lang === 'en' ? 'active' : ''}
          onClick={() => {
            setLang('en');
            localStorage.setItem('language', 'en');
            window.dispatchEvent(new Event('languagechange'));
          }}
        >
          {t('english')}
        </button>
      </div>
      <div className="main-btns">
        <button className="main" onClick={() => setShowPopup(true)}>{t('register')}</button>
        {pdfUrl && (
          <>
            <button
              className="main"
              style={{ marginLeft: 16 }}
              onClick={() => {
                try {
                  downloadDataUrl(pdfUrl, 'registration-certificate.pdf');
                } catch (err) {
                  setError(err.message);
                }
              }}
            >
              📄 {t('download')} PDF
            </button>
            {badgeUrl && (
              <button
                className="main"
                style={{ marginLeft: 16 }}
                onClick={() => {
                  try {
                    downloadDataUrl(badgeUrl, 'voting-badge.png');
                  } catch (err) {
                    setError(err.message);
                  }
                }}
              >
                🗳🏷️ {t('download')} Badge
              </button>
            )}
          </>
        )}
      </div>

      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup" onClick={e => e.stopPropagation()}>
            <h2>{t('registerTitle')}</h2>
            <form onSubmit={handleSubmit}>
              <label>
                {t('name')}
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  required 
                  minLength={2}
                  maxLength={50}
                  placeholder="Enter your full name"
                />
              </label>
              <label>
                {t('phone')}
                <input 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  required 
                  type="tel"
                  inputMode="numeric"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  title="Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9"
                  style={{
                    borderColor: form.phone.length === 10 && /^[6-9]/.test(form.phone) ? '#28a745' : 
                               form.phone.length > 0 ? '#dc3545' : '#ccc'
                  }}
                />
                <small style={{ 
                  display: 'block', 
                  marginTop: '4px', 
                  color: form.phone.length === 10 && /^[6-9]/.test(form.phone) ? '#28a745' : 
                         form.phone.length > 0 ? '#dc3545' : '#666',
                  fontSize: '12px'
                }}>
                  {form.phone.length === 0 && 'Enter 10-digit mobile number'}
                  {form.phone.length > 0 && form.phone.length < 10 && `${form.phone.length}/10 digits`}
                  {form.phone.length === 10 && !/^[6-9]/.test(form.phone) && 'Must start with 6, 7, 8, or 9'}
                  {form.phone.length === 10 && /^[6-9]/.test(form.phone) && '✓ Valid mobile number'}
                </small>
              </label>
              <label>
                {t('photo')}
                <input 
                  name="photo" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleChange} 
                  required 
                  title="Upload a clear photo (max 5MB)"
                />
                {form.photo && (
                  <small style={{ 
                    display: 'block', 
                    marginTop: '4px', 
                    color: form.photo.size > 5 * 1024 * 1024 ? '#dc3545' : '#28a745',
                    fontSize: '12px'
                  }}>
                    📄 {form.photo.name} ({formatFileSize(form.photo.size)})
                    {form.photo.size > 5 * 1024 * 1024 && ' - ⚠️ File too large!'}
                  </small>
                )}
                <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
                  Maximum file size: 5MB
                </small>
              </label>
              <div className="popup-actions">
                <button type="submit" disabled={loading}>
                  {loading ? (
                    <span>
                      {uploadStage === 'uploading' && '📤 Uploading...'}
                      {uploadStage === 'generating' && '📄 Generating PDF...'}
                      {uploadStage === 'processing' && '⚙️ Processing...'}
                      {!uploadStage && t('submit') + '...'}
                    </span>
                  ) : (
                    t('submit')
                  )}
                </button>
                <button type="button" onClick={() => setShowPopup(false)} disabled={loading}>
                  {t('close')}
                </button>
              </div>
              
              {/* Progress Indicator */}
              {loading && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '8px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    <span>
                      {uploadStage === 'uploading' && 'Uploading photo...'}
                      {uploadStage === 'generating' && 'Generating certificate...'}
                      {uploadStage === 'processing' && 'Finalizing...'}
                      {uploadStage === 'completed' && '✅ Completed!'}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      backgroundColor: uploadStage === 'completed' ? '#28a745' : '#0078d4',
                      transition: 'width 0.3s ease',
                      borderRadius: '4px'
                    }} />
                  </div>
                  {retryCount > 0 && (
                    <div style={{ 
                      marginTop: '8px', 
                      fontSize: '12px', 
                      color: '#ff9800',
                      textAlign: 'center'
                    }}>
                      🔄 Retry attempt {retryCount}/3
                    </div>
                  )}
                </div>
              )}
              
              {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Success Message */}
      {pdfUrl && badgeUrl && (
        <div className="success-message">
          <h3>{t('registrationSuccess')}</h3>
          <p>{t('downloadInfo')}</p>
          <div className="download-info">
            <div className="download-item">
              <h4>
                <span className="icon">📄</span>
                {t('registrationCertificate')}
              </h4>
              <p>{t('certificateDesc')}</p>
            </div>
            <div className="download-item">
              <h4>
                <span className="icon">🗳️</span>
                {t('votingBadge')}
              </h4>
              <p>{t('badgeDesc')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
