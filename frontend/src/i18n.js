import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationCA from './locales/ca/translation.json';
import translationES from './locales/es/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
  ca: {
    translation: translationCA
  },
  es: {
    translation: translationES
  },
  en: {
    translation: translationEN
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ca', // default language
    fallbackLng: 'ca',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
