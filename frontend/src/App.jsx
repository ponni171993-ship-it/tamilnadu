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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await registerUser(form);
      setPdfUrl('http://localhost:4000' + res.pdf);
      setShowPopup(false);
      setForm({ name: '', phone: '', photo: null });
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
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
          <a
            href={pdfUrl}
            className="main"
            style={{ marginLeft: 16 }}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('download')}
          </a>
        )}
      </div>

      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup" onClick={e => e.stopPropagation()}>
            <h2>{t('registerTitle')}</h2>
            <form onSubmit={handleSubmit}>
              <label>
                {t('name')}
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label>
                {t('phone')}
                <input name="phone" value={form.phone} onChange={handleChange} required pattern="[0-9]{10}" />
              </label>
              <label>
                {t('photo')}
                <input name="photo" type="file" accept="image/*" onChange={handleChange} required />
              </label>
              <div className="popup-actions">
                <button type="submit" disabled={loading}>{loading ? t('submit') + '...' : t('submit')}</button>
                <button type="button" onClick={() => setShowPopup(false)}>{t('close')}</button>
              </div>
              {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
