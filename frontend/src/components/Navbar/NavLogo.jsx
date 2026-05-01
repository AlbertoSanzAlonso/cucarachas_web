import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NavLogo = ({ isScrolled }) => {
  const { t } = useTranslation();

  return (
    <Link to="/" className="flex items-center space-x-3 group cursor-pointer border-none bg-transparent p-0">
      <img 
        src="/assets/isotipo.png" 
        alt="CECSA Logo" 
        className="transition-all duration-500 h-[45px] md:h-[60px] [@media(max-height:600px)_and_(orientation:landscape)]:!h-[32px]"
        style={{ 
          filter: isScrolled ? 'invert(27%) sepia(97%) saturate(2770%) hue-rotate(180deg) brightness(96%) contrast(101%)' : 'brightness(0) invert(1)',
          opacity: isScrolled ? 1 : 0.9
        }}
      />
      <div className="flex flex-col leading-none">
        <span className={`text-xl md:text-2xl font-black tracking-tighter transition-colors duration-500 ${isScrolled ? 'text-primary-blue' : 'text-white'} [@media(max-height:600px)_and_(orientation:landscape)]:!text-lg`}>
          CEC<span className="text-accent-green">SA</span>
        </span>
        <span className={`text-[10px] uppercase tracking-[0.3em] font-medium transition-colors duration-500 ${isScrolled ? 'text-secondary-gray/70' : 'text-white/70'} [@media(max-height:600px)_and_(orientation:landscape)]:hidden`}>
          {t('common.pest_control')}
        </span>
      </div>
    </Link>
  );
};

export default NavLogo;
