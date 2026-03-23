import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';
import { registerUser } from './api';

function App() {
  const { t, i18n } = useTranslation();
  const [showPopup, setShowPopup] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', photo: null });
  const [lang, setLang] = useState(i18n.language);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [badgeUrl, setBadgeUrl] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [uploadStage, setUploadStage] = useState(''); // 'uploading', 'generating', 'completed'

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
      
      setUploadStage('completed');
      setPdfUrl(res.pdf);
      setBadgeUrl(res.badge);
      setRegistrationData(res);
      setShowPopup(false);
      setForm({ name: '', phone: '', photo: null });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setUploadStage('');
    }
  };

  const switchLang = (lng) => {
    i18n.changeLanguage(lng);
    setLang(lng);
  };

  return (
    <div className="container">
      <div className="lang-switch">
        <span>{t('language')}: </span>
        <button
          className={lang === 'ta' ? 'active' : ''}
          onClick={() => switchLang('ta')}
        >
          {t('tamil')}
        </button>
        <button
          className={lang === 'en' ? 'active' : ''}
          onClick={() => switchLang('en')}
        >
          {t('english')}
        </button>
      </div>
      <div className="main-btns">
        <button className="main" onClick={() => setShowPopup(true)}>{t('register')}</button>
        {pdfUrl && (
          <>
            <a
              href={pdfUrl}
              className="main"
              style={{ marginLeft: 16 }}
              download="registration-certificate.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              📄 {t('download')} PDF
            </a>
            {badgeUrl && (
              <a
                href={badgeUrl}
                className="main"
                style={{ marginLeft: 16 }}
                download="voting-badge.png"
                target="_blank"
                rel="noopener noreferrer"
              >
                🗳️ Download Badge
              </a>
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
          <h3>🎉 Registration Successful!</h3>
          <p>Your certificate and voting badge are ready for download.</p>
          <div className="download-info">
            <div className="download-item">
              <h4>
                <span className="icon">📄</span>
                Registration Certificate
              </h4>
              <p>Official certificate with your details and photo. Perfect for printing and verification.</p>
            </div>
            <div className="download-item">
              <h4>
                <span className="icon">🗳️</span>
                Voting Badge
              </h4>
              <p>Show your voting pride with this official Election Commission badge. Perfect for sharing on social media!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
