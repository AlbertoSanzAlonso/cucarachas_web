import { Menu, X, ShieldCheck, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { title: 'Inicio', href: '#' },
    { title: 'Servicios', href: '#servicios' },
    { title: 'Sobre Nosotros', href: '#nosotros' },
    { title: 'Sectores', href: '#sectores' },
  ];

  return (
    <header
      className="sticky top-0 w-full z-[1000] transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(0, 128, 187, 0.97)'
          : '#0080bb',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.18)' : '0 2px 8px rgba(0,0,0,0.08)',
        padding: scrolled ? '10px 0' : '14px 0',
      }}
    >
      {/* Top trust bar — only when not scrolled */}
      <AnimatePresence>
        {!scrolled && (
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
          >
            <div className="container flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={12} style={{ color: '#34d399' }} />
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Empresa autorizada Generalitat de Catalunya
                  </span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>|</span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                  ROESB: 0246-CAT-SB
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={11} style={{ color: '#34d399' }} />
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  Urgencias 24h: <a href="tel:933309169" style={{ color: 'white', textDecoration: 'none', fontWeight: 800 }}>933 309 169</a>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main nav */}
      <div className="container flex justify-between items-center">
        {/* Brand */}
        <a href="#" className="flex items-center group" style={{ textDecoration: 'none', gap: '14px' }}>
          <div
            className="group-hover:scale-105 transition-transform duration-300"
            style={{ flexShrink: 0 }}
          >
            <img
              src="/assets/isotipo.png"
              alt="CECSA Icon"
              style={{
                height: '80px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '22px', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>CECSA</span>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', color: '#34d399', textTransform: 'uppercase', lineHeight: 1 }}>Urban Plagas</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1 }}>Urgencias 24h</span>
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
            Presupuesto Gratuito
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2"
          style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir menú"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
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
              <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Urgencias 24h</p>
                <a href="tel:933309169" style={{ fontSize: '26px', fontWeight: 900, color: 'white', display: 'block', marginBottom: '20px', textDecoration: 'none' }}>933 309 169</a>
                <a
                  href="#contacto"
                  style={{
                    background: '#34d399',
                    color: '#064e3b',
                    fontWeight: 800,
                    fontSize: '15px',
                    padding: '14px 0',
                    borderRadius: '2rem',
                    textDecoration: 'none',
                    display: 'block',
                    textAlign: 'center',
                    width: '100%',
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  Presupuesto Gratuito
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
