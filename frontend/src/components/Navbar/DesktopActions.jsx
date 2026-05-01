import React from 'react';
import { Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/ui/Button';

const DesktopActions = ({ isScrolled, i18n, changeLanguage }) => {
  const { t } = useTranslation();

  return (
    <div className="hidden xl:flex items-center space-x-6">
      {/* Language Switcher */}
      <div className="flex items-center space-x-2 border-r pr-6 border-white/20">
        {['ca', 'es'].map((lng) => (
          <button 
            key={lng} 
            onClick={() => changeLanguage(lng)}
            className={`text-xs font-bold uppercase cursor-pointer transition-colors ${i18n.language === lng ? 'text-accent-green' : (isScrolled ? 'text-secondary-gray/60 hover:text-primary-blue' : 'text-white/60 hover:text-white')}`}
          >
            {lng}
          </button>
        ))}
      </div>

      <a 
        href="tel:+34933309169"
        className="flex items-center space-x-2 font-bold transition-all hover:opacity-80"
        style={{ color: isScrolled ? 'var(--color-primary-blue)' : 'white' }}
      >
        <Phone size={18} className="text-accent-green" />
        <span>933 309 169</span>
      </a>

      <Button 
        variant={isScrolled ? 'primary' : 'accent'}
        className="px-6 py-2.5"
      >
        {t('nav.contact', 'Urgencias 24h')}
      </Button>
    </div>
  );
};


export default DesktopActions;
