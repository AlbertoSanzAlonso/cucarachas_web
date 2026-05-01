import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';

import Button from '@/components/ui/Button';

// Sub-components
import NavBackground from '@/components/Navbar/NavBackground';
import NavLogo from '@/components/Navbar/NavLogo';
import DesktopMenu from '@/components/Navbar/DesktopMenu';
import DesktopActions from '@/components/Navbar/DesktopActions';
import MobileMenu from '@/components/Navbar/MobileMenu';

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
      <NavBackground isScrolled={isScrolled} />
      
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <NavLogo isScrolled={isScrolled} />

        <DesktopMenu 
          menuItems={menuItems} 
          isScrolled={isScrolled} 
          activeSubmenu={activeSubmenu} 
          setActiveSubmenu={setActiveSubmenu} 
        />

        <DesktopActions 
          isScrolled={isScrolled} 
          i18n={i18n} 
          changeLanguage={changeLanguage} 
        />

        {/* Mobile Toggle */}
        <Button 
          variant="ghost"
          size="icon"
          className="xl:hidden"
          style={{ color: isScrolled ? 'var(--color-primary-blue)' : 'white' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={30} /> : <Menu size={30} />}
        </Button>
      </div>


      <MobileMenu 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
        menuItems={menuItems} 
        mobileExpanded={mobileExpanded} 
        setMobileExpanded={setMobileExpanded} 
        changeLanguage={changeLanguage}
        i18n={i18n}
      />
    </nav>
  );
};

export default Navbar;
