import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ta: {
    translation: {
      register: 'பதிவு',
      download: 'பதிவிறக்கு',
      name: 'பெயர்',
      phone: 'தொலைபேசி எண்',
      photo: 'புகைப்படம் பதிவேற்று',
      submit: 'சமர்ப்பிக்கவும்',
      close: 'மூடு',
      language: 'மொழி',
      tamil: 'தமிழ்',
      english: 'ஆங்கிலம்',
      registerTitle: 'பதிவு படிவம்',
    },
  },
  en: {
    translation: {
      register: 'Register',
      download: 'Download',
      name: 'Name',
      phone: 'Phone Number',
      photo: 'Upload Photo',
      submit: 'Submit',
      close: 'Close',
      language: 'Language',
      tamil: 'Tamil',
      english: 'English',
      registerTitle: 'Registration Form',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ta',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
