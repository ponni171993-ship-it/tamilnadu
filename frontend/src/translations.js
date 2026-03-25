import { useState } from 'react';

// Simple translation system
const translations = {
  en: {
    language: 'Language',
    tamil: 'Tamil',
    english: 'English',
    register: 'Register Now',
    registerTitle: 'Voter Registration',
    name: 'Full Name',
    phone: 'Phone Number',
    photo: 'Photo Upload',
    submit: 'Submit & Get Badge',
    close: 'Close',
    download: 'Download',
    registrationSuccess: 'Registration Successful!',
    downloadInfo: 'Your certificate and voting badge are ready for download.',
    registrationCertificate: 'Registration Certificate',
    votingBadge: 'Voting Badge',
    certificateDesc: 'Official certificate with your details and photo. Perfect for printing and verification.',
    badgeDesc: 'Show your voting pride with this official Election Commission badge. Perfect for sharing on social media!'
  },
  ta: {
    language: 'மொழி',
    tamil: 'தமிழ்',
    english: 'English',
    register: 'பதிவு',
    registerTitle: 'வாளர் பதிவு',
    name: 'முழுப் பெயர்',
    phone: 'தொடை எண்',
    photo: 'புகைய படமப்',
    submit: 'பதிவு & பேடை பதிவு',
    close: 'மூடு',
    download: 'பதிவி',
    registrationSuccess: 'பதிவு வெற்றா!',
    downloadInfo: 'உங்கள் பதிவு மற்றுவு பதிவுகள் பதிவி பதிவி முன்கள்.',
    registrationCertificate: 'பதிவு சான்பு',
    votingBadge: 'வாளர் பதிவு',
    certificateDesc: 'உங்கள் விவகள் உங்கள் பதிவு மற்றுவு பதிவுகள் பதிவி முன்கள்.',
    badgeDesc: 'இந்திய ஆணையின் ஆணையில் பதிவு பதிவுவையில் இந்திய ஆணையில் பதிவு பதிவுவையில் பதிவி முன்கள்!'
  }
};

export function t(key) {
  const lang = localStorage.getItem('language') || 'en';
  return translations[lang][key] || key;
}

// Force re-render when language changes
export function useLanguage() {
  const [lang, setLang] = useState(getCurrentLanguage());
  
  const changeLanguage = (newLang) => {
    localStorage.setItem('language', newLang);
    setLang(newLang);
    // Trigger re-render by updating a timestamp
    window.dispatchEvent(new Event('languagechange'));
  };
  
  return { lang, changeLanguage };
}

export function getCurrentLanguage() {
  return localStorage.getItem('language') || 'en';
}
