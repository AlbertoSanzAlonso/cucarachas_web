import { Menu, X, ShieldCheck, Phone, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(window.scrollY / 150, 1);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { title: t('nav.home'), href: '#' },
    { title: t('nav.species'), href: '#servicios' },
    { title: t('nav.about'), href: '#nosotros' },
    { title: t('nav.sectors'), href: '#sectores' },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangMenuOpen(false);
    setIsOpen(false);
  };

  const languages = [
    { code: 'ca', name: 'Català' },
    { code: 'es', name: 'Castellano' },
    { code: 'en', name: 'English' }
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <header
      className="sticky top-0 w-full z-[1000] transition-all duration-300"
      style={{
        background: `rgba(0, 128, 187, ${1 - scrollProgress * 0.20})`,
        backdropFilter: scrollProgress > 0.05 ? `blur(${scrollProgress * 16}px)` : 'none',
        WebkitBackdropFilter: scrollProgress > 0.05 ? `blur(${scrollProgress * 16}px)` : 'none',
        boxShadow: scrollProgress > 0.1 ? `0 4px ${20 * scrollProgress}px rgba(0,0,0,${0.06 + scrollProgress * 0.14})` : 'none',
        padding: scrollProgress > 0.8 ? '10px 0' : '14px 0',
        transition: 'padding 300ms',
      }}
    >
      {/* Top trust bar — only when not scrolled */}
      <AnimatePresence>
        {scrollProgress < 0.5 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              background: 'rgba(0,0,0,0.12)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '5px 0',
              marginBottom: '8px',
            }}
            className="hidden lg:block"
          >
            <div className="container flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={12} style={{ color: '#34d399' }} />
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Empresa autoritzada Generalitat de Catalunya
                  </span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>|</span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                  ROESB: 0246-CAT-SB
                </span>
              </div>
              <div className="flex items-center gap-4">
                 {/* Desktop Language Switcher (Inline) */}
                 <div className="flex items-center gap-3 mr-4">
                   {languages.map(l => (
                     <button 
                      key={l.code}
                      onClick={() => changeLanguage(l.code)}
                      style={{ 
                        fontSize: '9px', 
                        fontWeight: 800, 
                        color: i18n.language === l.code ? '#34d399' : 'rgba(255,255,255,0.5)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                     >
                       {l.code}
                     </button>
                   ))}
                 </div>
                <div className="flex items-center gap-1.5">
                  <Phone size={11} style={{ color: '#34d399' }} />
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                    {t('nav.emergencies')}: <a href="tel:933309169" style={{ color: 'white', textDecoration: 'none', fontWeight: 800 }}>933 309 169</a>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main nav */}
      <div className="container flex justify-between items-center">
        {/* Brand */}
        <a href="#" className="flex items-center group" style={{ textDecoration: 'none', gap: '10px' }}>
          <div
            className="group-hover:scale-105 transition-transform duration-300 flex-shrink-0"
          >
            <img
              src="/assets/isotipo.png"
              alt="CECSA Icon"
              style={{
                height: '60px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontSize: '26px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>CECSA</span>
            <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.15em', color: '#34d399', textTransform: 'uppercase', lineHeight: 1 }}>Control de Plagas</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center" style={{ gap: '40px' }}>
          {navLinks.map((link) => (
            <a
              key={link.title}
              href={link.href}
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.82)',
                textDecoration: 'none',
                letterSpacing: '0.01em',
                transition: 'color 200ms',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.82)'}
            >
              {link.title}
            </a>
          ))}
        </nav>

        {/* CTA area */}
        <div className="hidden lg:flex items-center" style={{ gap: '28px' }}>
          {/* Main Select for languages (Alternative to inline) - Hidden for now as I added inline in trust bar */}
          <div className="hidden items-center gap-3">
             <div className="relative">
                <button 
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700 }}
                >
                  <Globe size={14} /> {currentLang.code.toUpperCase()}
                </button>
             </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1 }}>{t('nav.emergencies')}</span>
            <a
              href="tel:933309169"
              style={{ fontSize: '20px', fontWeight: 900, color: 'white', textDecoration: 'none', lineHeight: 1 }}
            >
              933 309 169
            </a>
          </div>
          <a
            href="#contacto"
            style={{
              background: '#34d399',
              color: '#064e3b',
              fontWeight: 800,
              fontSize: '13px',
              padding: '12px 28px',
              borderRadius: '2rem',
              textDecoration: 'none',
              display: 'inline-block',
              boxShadow: '0 4px 14px rgba(52, 211, 153, 0.35)',
              transition: 'background 200ms, transform 150ms',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#34d399'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {t('nav.cta')}
          </a>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 lg:hidden">
          {/* Mobile Language Switch - Simple text toggle for mobile */}
          <div className="flex gap-2">
            {['ca', 'es', 'en'].map(l => (
              <button 
                key={l}
                onClick={() => i18n.changeLanguage(l)}
                style={{ fontSize: '10px', fontWeight: i18n.language === l ? 900 : 500, color: i18n.language === l ? '#34d399' : 'white', background: 'none', border: 'none' }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Abrir menú"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ background: '#006fa3', borderTop: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
          >
            <div className="container flex flex-col" style={{ gap: '24px', paddingTop: '32px', paddingBottom: '32px', alignItems: 'flex-start' }}>
              {navLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  style={{ fontSize: '18px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}
                  onClick={() => setIsOpen(false)}
                >
                  {link.title}
                </a>
              ))}
              <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>{t('nav.emergencies')}</p>
                <a href="tel:933309169" style={{ fontSize: '26px', fontWeight: 900, color: 'white', display: 'block', marginBottom: '20px', textDecoration: 'none' }}>933 309 169</a>
                <a
                  href="#contacto"
                  style={{
                    background: '#34d399',
                    color: '#064e3b',
                    fontWeight: 800,
                    fontSize: '15px',
                    padding: '16px 0 18px',
                    borderRadius: '2rem',
                    textDecoration: 'none',
                    display: 'block',
                    textAlign: 'center',
                    width: '100%',
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  {t('nav.cta')}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

