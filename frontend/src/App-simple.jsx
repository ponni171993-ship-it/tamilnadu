import { useState } from 'react';
import './App.css';

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    setForm({ ...form, photo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadStage('uploading');

    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('phone', form.phone);
      data.append('photo', form.photo);

      // Simulate API call
      setTimeout(() => {
        setRegistrationData({
          name: form.name,
          phone: form.phone,
          pdfUrl: '#',
          badgeUrl: '#'
        });
        setLoading(false);
        setUploadStage('completed');
      }, 2000);

    } catch (err) {
      setError('Registration failed. Please try again.');
      setLoading(false);
      setUploadStage('');
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🗳️ Tamil Nadu Voting Registration</h1>
          <p>Register to get your voting badge and certificate</p>
        </header>

        <button className="register-btn" onClick={() => setShowPopup(true)}>
          📝 Register Now
        </button>

        {showPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <div className="popup-header">
                <h2>📝 Voter Registration</h2>
                <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="registration-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="Enter your phone number"
                    pattern="[0-9]{10}"
                  />
                </div>

                <div className="form-group">
                  <label>Photo Upload</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    required
                  />
                  {form.photo && (
                    <div className="photo-preview">
                      <img src={URL.createObjectURL(form.photo)} alt="Preview" />
                    </div>
                  )}
                </div>

                {uploadStage && (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p>{uploadStage === 'uploading' ? 'Uploading...' : 'Processing...'}</p>
                  </div>
                )}

                {error && (
                  <div className="error-message">
                    ❌ {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Processing...' : '🚀 Register & Get Badge'}
                </button>
              </form>
            </div>
          </div>
        )}

        {registrationData && (
          <div className="success-message">
            <h2>🎉 Registration Successful!</h2>
            <div className="download-info">
              <div className="download-item">
                <h4>📄 PDF Certificate</h4>
                <p>Your official voting certificate</p>
                <button className="download-btn">
                  📥 Download PDF
                </button>
              </div>
              <div className="download-item">
                <h4>🏷️ Voting Badge</h4>
                <p>Your personalized voting badge</p>
                <button className="download-btn">
                  📥 Download Badge
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
