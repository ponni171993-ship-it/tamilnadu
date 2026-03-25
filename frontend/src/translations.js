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
    register: 'இப்பொழுதே பதிவு செய்யுங்கள்',
    registerTitle: 'வாக்காளர் பதிவு',
    name: 'முழு பெயர்',
    phone: 'தொடர்பு எண்',
    photo: 'புகைப்படம் பதிவேற்றம்',
    submit: 'சமர்ப்பித்து பேட்ஜ் பெறுங்கள்',
    close: 'மூடு',
    download: 'பதிவிறக்கம்',
    registrationSuccess: 'பதிவு வெற்றிகரமாக முடிந்தது!',
    downloadInfo: 'உங்கள் சான்றிதழ் மற்றும் வாக்காளர் பேட்ஜ் பதிவிறக்கத்திற்கு தயாராக உள்ளது.',
    registrationCertificate: 'பதிவு சான்றிதழ்',
    votingBadge: 'வாக்காளர் பேட்ஜ்',
    certificateDesc: 'உங்கள் விவரங்கள் மற்றும் புகைப்படத்துடன் கூடிய அதிகாரப்பூர்வ சான்றிதழ். அச்சிடுவதற்கும் சரிபார்ப்பிற்கும் ஏற்றது.',
    badgeDesc: 'இந்த அதிகாரப்பூர்வ தேர்தல் ஆணைய பேட்ஜ் மூலம் உங்கள் வாக்களிப்பு பெருமையை வெளிப்படுத்துங்கள். சமூக ஊடகங்களில் பகிர ஏற்றது!'
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
