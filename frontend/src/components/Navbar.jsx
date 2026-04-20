import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Phone, Bug, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const menuItems = [
    { 
      key: 'nav.sectors', 
      path: '/#sectors',
      submenu: [
        { key: 'nav.residential', path: '/#species' },
        { key: 'nav.commercial', path: '/#sectors' }
      ]
    },
    { 
      key: 'nav.blog', 
      path: '/blog',
      submenu: [
        { key: 'nav.articles', path: '/blog' },
        { key: 'nav.faq', path: '/blog/faq' }
      ]
    },
    { 
      key: 'nav.about', 
      path: '/sobre-cecsa',
      submenu: [
        { key: 'nav.us', path: '/sobre-cecsa' },
        { key: 'nav.process', path: '/sobre-cecsa#process' }
      ]
    }
  ];

  return (
    <nav 
      className={`fixed top-4 left-0 right-0 z-[100] mx-auto w-[92%] md:w-[94%] max-w-7xl transition-all duration-500 rounded-full ${(mobileMenuOpen || activeSubmenu) ? '' : 'overflow-hidden'} ${isScrolled ? 'py-4 shadow-xl' : 'py-4 shadow-lg'} [@media(max-height:600px)_and_(orientation:landscape)]:!absolute [@media(max-height:600px)_and_(orientation:landscape)]:!top-2 [@media(max-height:600px)_and_(orientation:landscape)]:!py-2`}
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

        {/* Desktop Navigation */}
        <div className="hidden xl:flex items-center space-x-10">
          {menuItems.map((item) => (
            <div 
              key={item.key} 
              className="relative group py-2"
              onMouseEnter={() => item.submenu && setActiveSubmenu(item.key)}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <Link 
                to={item.path} 
                className={`text-sm font-semibold uppercase tracking-widest transition-all duration-300 flex items-center space-x-1 ${isScrolled ? 'text-secondary-gray hover:text-primary-blue' : 'text-white/90 hover:text-white'}`}
              >
                <span>{t(item.key)}</span>
                {item.submenu && <ChevronDown size={14} className={`transition-transform duration-300 ${activeSubmenu === item.key ? 'rotate-180' : ''}`} />}
              </Link>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {item.submenu && activeSubmenu === item.key && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-[-20px] pt-4 min-w-[220px]"
                  >
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 overflow-hidden">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.key}
                          to={sub.path}
                          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-bg-light transition-all group"
                        >
                          <div className="w-1 h-1 bg-accent-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <span className="text-sm font-bold text-primary-gray hover:text-primary-blue transition-colors">
                            {t(sub.key)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Desktop Action Buttons */}
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
          className="xl:hidden p-2 rounded-lg transition-colors"
          style={{ color: isScrolled ? 'var(--color-primary-blue)' : 'white' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`xl:hidden fixed inset-x-0 mx-auto w-[92%] bg-white transition-all duration-500 rounded-3xl overflow-hidden z-[110] 
          ${mobileMenuOpen 
            ? 'top-[72px] md:top-[100px] max-h-screen shadow-2xl pb-10 border border-gray-100 opacity-100 [@media(max-height:600px)_and_(orientation:landscape)]:top-0 [@media(max-height:600px)_and_(orientation:landscape)]:w-full [@media(max-height:600px)_and_(orientation:landscape)]:h-full [@media(max-height:600px)_and_(orientation:landscape)]:max-h-none [@media(max-height:600px)_and_(orientation:landscape)]:rounded-none [@media(max-height:600px)_and_(orientation:landscape)]:z-[200] [@media(max-height:600px)_and_(orientation:landscape)]:overflow-y-auto [@media(max-height:600px)_and_(orientation:landscape)]:overscroll-contain' 
            : 'top-[72px] md:top-[100px] max-h-0 opacity-0 pointer-events-none md:pointer-events-auto md:opacity-100 [@media(max-height:600px)_and_(orientation:landscape)]:opacity-0 [@media(max-height:600px)_and_(orientation:landscape)]:pointer-events-none'}`}
      >
        {/* Mobile Landscape Close Button */}
        <button 
          className="hidden [@media(max-height:600px)_and_(orientation:landscape)]:flex absolute top-6 right-8 p-3 rounded-full bg-primary-blue/5 text-primary-blue hover:bg-primary-blue/10 transition-colors z-[210] shadow-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X size={24} />
        </button>
        <div className="flex flex-col p-6 space-y-4 [@media(max-height:600px)_and_(orientation:landscape)]:pt-20">
          {menuItems.map((item) => (
            <div key={item.key} className="border-b border-gray-50 last:border-0">
              <div className="flex items-center justify-between py-4">
                <Link 
                  to={item.path} 
                  onClick={() => !item.submenu && setMobileMenuOpen(false)}
                  className="text-xl font-bold text-primary-gray uppercase tracking-tighter"
                >
                  {t(item.key)}
                </Link>
                {item.submenu && (
                  <button 
                    onClick={() => setMobileExpanded(mobileExpanded === item.key ? null : item.key)}
                    className="p-2 text-primary-blue"
                  >
                    <ChevronDown className={`transition-transform duration-300 ${mobileExpanded === item.key ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
              
              <AnimatePresence>
                {item.submenu && mobileExpanded === item.key && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-4 pb-4 space-y-3"
                  >
                    {item.submenu.map((sub) => (
                      <Link 
                        key={sub.key}
                        to={sub.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-lg font-medium text-secondary-gray/80 italic border-l-2 border-accent-green/30 pl-4 py-1"
                      >
                        {t(sub.key)}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <div className="pt-4 flex items-center space-x-6">
            <button 
              onClick={() => { changeLanguage('ca'); }} 
              className={`font-bold text-lg ${i18n.language === 'ca' ? 'text-accent-green' : 'text-primary-blue'}`}
            >
              CA
            </button>
            <button 
              onClick={() => { changeLanguage('es'); }} 
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
