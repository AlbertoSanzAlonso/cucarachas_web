import React from 'react';
import { Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/ui/Button';
import { useGetCompanyQuery } from '@/store/apis/companyApi';

const DesktopActions = ({ isScrolled, i18n, changeLanguage }) => {
  const { t } = useTranslation();
  const lang = i18n.language?.startsWith('es') ? 'es' : 'ca';
  const { data: company } = useGetCompanyQuery(lang);
  const phoneTel = company?.phone_tel || '+34933309169';
  const phoneLabel = company?.phone || '933 309 169';
  const whatsappUrl = company?.whatsapp_url || 'https://wa.me/34681033305';

  return (
    <div className="hidden xl:flex items-center space-x-6">
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
        href={`tel:${phoneTel}`}
        className="flex items-center space-x-2 font-bold transition-all hover:opacity-80"
        style={{ color: isScrolled ? 'var(--color-primary-blue)' : 'white' }}
      >
        <Phone size={18} className="text-accent-green" />
        <span>{phoneLabel}</span>
      </a>

      <Button
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant={isScrolled ? 'primary' : 'accent'}
        className="px-6 py-2.5"
      >
        {t('nav.contact', 'Urgencias 24h')}
      </Button>
    </div>
  );
};

export default DesktopActions;
