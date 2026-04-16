import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Phone, Bug } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav 
      className={`fixed top-4 left-0 right-0 z-[100] mx-auto w-[92%] md:w-[94%] max-w-7xl transition-all duration-500 rounded-full ${mobileMenuOpen ? '' : 'overflow-hidden'} ${isScrolled ? 'py-2 shadow-xl' : 'py-4 shadow-lg'}`}
      style={{
        background: isScrolled ? 'rgba(255, 255, 255, 0.98)' : 'var(--color-primary-blue)',
        backdropFilter: isScrolled ? 'blur(15px)' : 'none',
        border: isScrolled ? `1px solid var(--color-primary-blue-hv, #006fa3)22` : '1px solid rgba(255,255,255,0.2)',
        boxShadow: isScrolled ? '0 10px 30px rgba(0,0,0,0.1)' : '0 10px 40px rgba(0,0,0,0.15)'
      }}
    >
      {/* Floating Icons Pattern (Only visible against blue background) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isScrolled ? 0 : 1 }}
        transition={{ duration: 2, delay: 1 }}
        className="absolute inset-0 pointer-events-none select-none transition-opacity duration-700"
      >
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div 
              key={i} 
              className="absolute text-white"
              initial={{ opacity: 0 }}
              animate={{
                x: [0, i % 2 === 0 ? 30 : -30, 0],
                y: [0, i % 3 === 0 ? -15 : 15, 0],
                scale: [0.8, 1, 0.8],
                opacity: [0, 0.1, 0.1, 0.1, 0]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1 + (i % 5) * 2,
                times: [0, 0.1, 0.5, 0.9, 1]
              }}
              style={{
                top: `${(i * 15) % 100}%`,
                left: `${(i * 27) % 100}%`,
                scale: 0.4 + Math.random(),
              }}
            >
              <Bug size={25 + (i * 5)} />
            </motion.div>
          ))}
        </div>
      </motion.div>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 group cursor-pointer">
          <img 
            src="/assets/isotipo.png" 
            alt="CECSA Logo" 
            className="transition-all duration-500 h-[35px] md:h-[45px]"
            style={{ 
              filter: isScrolled ? 'none' : 'brightness(0) invert(1)',
              opacity: isScrolled ? 1 : 0.9
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="hidden" style={{ color: isScrolled ? 'var(--color-primary-blue)' : 'white' }}>
            <span className="font-black text-2xl tracking-tighter">CEC<span className="text-accent-green">SA</span></span>
          </div>
          <div className="flex flex-col leading-none">
            <span className={`text-xl md:text-2xl font-black tracking-tighter transition-colors duration-500 ${isScrolled ? 'text-primary-blue' : 'text-white'}`}>
              CEC<span className="text-accent-green">SA</span>
            </span>
            <span className={`text-[10px] uppercase tracking-[0.3em] font-medium transition-colors duration-500 ${isScrolled ? 'text-secondary-gray/70' : 'text-white/70'}`}>
              Control de Plagas
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-10">
          {[
            { key: 'nav.services', label: 'Especies' },
            { key: 'nav.sectors', label: 'Sectores' },
            { key: 'nav.process', label: 'Método' },
            { key: 'nav.about', label: 'Sobre CECSA' }
          ].map((item) => (
            <a 
              key={item.key} 
              href={`#${item.key.split('.')[1]}`} 
              className={`text-sm font-semibold uppercase tracking-widest transition-all duration-300 hover:scale-105 ${isScrolled ? 'text-secondary-gray hover:text-primary-blue' : 'text-white/90 hover:text-white'}`}
            >
              {t(item.key, item.label)}
            </a>
          ))}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center space-x-6">
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

          <button 
            className="px-6 py-2.5 rounded-full text-white font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg active:scale-95"
            style={{ 
              background: isScrolled ? 'var(--color-primary-blue)' : 'var(--color-accent-green)',
              color: isScrolled ? 'white' : 'var(--color-secondary-gray)',
              boxShadow: isScrolled ? '0 4px 15px rgba(0,128,187,0.3)' : '0 4px 15px rgba(0,0,0,0.1)'
            }}
          >
            {t('nav.contact', 'Urgencias 24h')}
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 rounded-lg transition-colors"
          style={{ color: isScrolled ? 'var(--color-primary-blue)' : 'white' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`lg:hidden fixed inset-x-0 top-[108px] mx-auto w-[92%] bg-white transition-all duration-500 rounded-3xl overflow-hidden z-[110] ${mobileMenuOpen ? 'max-h-screen shadow-2xl pb-10 border border-gray-100' : 'max-h-0'}`}
      >
        <div className="flex flex-col p-6 space-y-6">
          {[
            { key: 'nav.services', id: 'species' },
            { key: 'nav.sectors', id: 'sectors' },
            { key: 'nav.process', id: 'process' },
            { key: 'nav.about', id: 'about' }
          ].map((item) => (
            <a 
              key={item.key} 
              href={`#${item.id}`} 
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl font-bold text-primary-blue border-b pb-2 border-gray-50 uppercase tracking-tighter"
            >
              {t(item.key)}
            </a>
          ))}
          <div className="pt-4 flex items-center space-x-6">
            <button 
              onClick={() => { changeLanguage('ca'); setMobileMenuOpen(false); }} 
              className={`font-bold text-lg ${i18n.language === 'ca' ? 'text-accent-green' : 'text-primary-blue'}`}
            >
              CA
            </button>
            <button 
              onClick={() => { changeLanguage('es'); setMobileMenuOpen(false); }} 
              className={`font-bold text-lg ${i18n.language === 'es' ? 'text-accent-green' : 'text-primary-blue'}`}
            >
              ES
            </button>
          </div>
          <button 
            className="w-full py-4 rounded-xl text-white font-black text-lg shadow-xl uppercase tracking-widest"
            style={{ background: 'var(--color-primary-blue)' }}
          >
            {t('nav.contact')}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
