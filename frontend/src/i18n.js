import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// CA
import commonCA from './locales/ca/common.json';
import pagesCA from './locales/ca/pages.json';
import servicesCA from './locales/ca/services.json';
import agentCA from './locales/ca/agent.json';

// ES
import commonES from './locales/es/common.json';
import pagesES from './locales/es/pages.json';
import servicesES from './locales/es/services.json';
import agentES from './locales/es/agent.json';

// EN
import commonEN from './locales/en/common.json';
import pagesEN from './locales/en/pages.json';
import servicesEN from './locales/en/services.json';
import agentEN from './locales/en/agent.json';

const resources = {
  ca: {
    translation: { ...commonCA, ...pagesCA, ...servicesCA, ...agentCA }
  },
  es: {
    translation: { ...commonES, ...pagesES, ...servicesES, ...agentES }
  },
  en: {
    translation: { ...commonEN, ...pagesEN, ...servicesEN, ...agentEN }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // Sin `lng` fijo: LanguageDetector lee localStorage (i18nextLng) al recargar.
    fallbackLng: 'ca',
    supportedLngs: ['ca', 'es', 'en'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
