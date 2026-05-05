const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const langs = ['ca', 'es', 'en'];

// Logical grouping
const groups = {
  common: ['common', 'nav', 'meta', 'cta', 'legal', 'stats_bar'],
  pages: ['hero', 'focus', 'method', 'origen', 'about_page', 'fleet', 'contact', 'faq', 'blog', 'testimonials'],
  services: ['species', 'others', 'sectors_grid', 'species_detail', 'service_detail_page'],
  agent: ['agent']
};

langs.forEach(lang => {
  const file = path.join(localesDir, lang, 'translation.json');
  if (!fs.existsSync(file)) return;
  
  const content = JSON.parse(fs.readFileSync(file, 'utf8'));
  const groupedContent = {
    common: {},
    pages: {},
    services: {},
    agent: {},
    other: {} // Fallback for anything not categorized
  };
  
  Object.keys(content).forEach(key => {
    let assigned = false;
    for (const [group, keys] of Object.entries(groups)) {
      if (keys.includes(key)) {
        groupedContent[group][key] = content[key];
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      groupedContent.other[key] = content[key];
    }
  });
  
  // Write groups to files
  for (const [group, data] of Object.entries(groupedContent)) {
    if (Object.keys(data).length > 0) {
      fs.writeFileSync(path.join(localesDir, lang, `${group}.json`), JSON.stringify(data, null, 2));
    }
  }
  
  // Remove the monolithic file
  fs.unlinkSync(file);
});

// Update i18n.js
const i18nPath = path.join(__dirname, 'src', 'i18n.js');
let i18nContent = `import i18n from 'i18next';
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
    lng: 'ca', // default language
    fallbackLng: 'ca',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
`;

fs.writeFileSync(i18nPath, i18nContent);
console.log('Modularization complete!');
