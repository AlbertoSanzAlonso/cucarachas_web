import { useState, useEffect } from 'react';
import { Bug, Menu, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Servicios', href: '#servicios' },
    { name: 'Nosotros', href: '#nosotros' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? 'py-3 glass shadow-xl border-b border-white/10' 
        : 'py-6 bg-transparent'
    }`}>
      <div className="container flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-primary-blue p-2 rounded-xl text-white shadow-lg shadow-primary-blue/20">
            <Bug size={24} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-2xl tracking-tighter text-white">CECSA</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary-blue hidden sm:block">Sanidad Ambiental</span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex items-center gap-8 font-semibold">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-white/80 hover:text-primary-blue transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-blue transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>
          
          <a href="#contacto" className="btn btn-primary flex items-center gap-2 group">
            <Phone size={18} className="transition-transform group-hover:rotate-12" />
            <span>Solicitar Presupuesto</span>
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white p-2 glass rounded-lg" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass overflow-hidden border-t border-white/10"
          >
            <div className="container py-8 flex flex-col gap-6 items-center">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsMenuOpen(false)} 
                  className="text-xl font-bold text-white hover:text-primary-blue"
                >
                  {link.name}
                </a>
              ))}
              <a 
                href="#contacto" 
                onClick={() => setIsMenuOpen(false)} 
                className="btn btn-primary w-full max-w-sm"
              >
                Solicitar Presupuesto
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
