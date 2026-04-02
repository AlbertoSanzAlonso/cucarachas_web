import { Bug, Phone, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { title: 'Inicio', href: '#' },
    { title: 'Servicios', href: '#servicios' },
    { title: 'Sobre Nosotros', href: '#nosotros' },
    { title: 'Sectores', href: '#sectores' },
  ];

  return (
    <header className={`sticky top-0 w-full z-[1000] transition-all duration-300 ${scrolled ? 'glass py-2' : 'bg-white py-4 shadow-sm'}`}>
      <div className="container flex justify-between items-center">
        {/* Brand */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="bg-primary-blue p-2 rounded-lg text-white group-hover:rotate-12 transition-transform">
            <Bug size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-secondary-gray leading-none">CECSA</span>
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-primary-blue">Sanidad Ambiental</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <a 
              key={link.title} 
              href={link.href}
              className="text-sm font-bold text-secondary-gray hover:text-primary-blue transition-colors relative group"
            >
              {link.title}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-blue transition-all group-hover:w-full"></span>
            </a>
          ))}
        </nav>

        {/* Contact info & CTA */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex flex-col items-end justify-center">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest leading-none mb-1">Urgencias 24h</span>
            <a href="tel:933309169" className="text-xl font-black text-secondary-gray hover:text-primary-blue transition-colors leading-none">
              933 309 169
            </a>
          </div>
          <a href="#contacto" className="btn btn-primary px-8 py-3.5 text-xs">
            Presupuesto Gratuito
          </a>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-secondary-gray p-2" onClick={() => setIsOpen(!isOpen)}>
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
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="container py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a key={link.title} href={link.href} className="text-lg font-bold text-secondary-gray" onClick={() => setIsOpen(false)}>
                  {link.title}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Urgencias 24h</p>
                <a href="tel:933309169" className="text-2xl font-black text-secondary-gray mb-6 block">933 309 169</a>
                <a href="#contacto" className="btn btn-primary w-full" onClick={() => setIsOpen(false)}>
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
