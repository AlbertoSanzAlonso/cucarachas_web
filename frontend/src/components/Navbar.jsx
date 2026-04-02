import { Menu, X } from 'lucide-react';
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
    <header className={`sticky top-0 w-full z-[1000] transition-all duration-300 ${scrolled ? 'bg-primary-blue/95 backdrop-blur-md shadow-md py-2' : 'bg-primary-blue py-4'}`}>
      <div className="container flex justify-between items-center">
        {/* Brand */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="group-hover:scale-105 transition-transform duration-300">
            <img 
              src="/assets/isotipo.png" 
              alt="CECSA Icon" 
              className="h-5 w-auto object-contain" 
              style={{ filter: 'brightness(0) invert(1)' }} 
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xl font-black tracking-tighter text-white leading-none mb-0.5">CECSA</span>
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/90 leading-none">Urban Plagas</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <a 
              key={link.title} 
              href={link.href}
              className="text-sm font-bold text-white/80 hover:text-white transition-colors relative group"
            >
              {link.title}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
            </a>
          ))}
        </nav>

        {/* Contact info & CTA */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex flex-col items-end justify-center">
            <span className="text-[10px] uppercase font-bold text-white/70 tracking-widest leading-none mb-1">Urgencias 24h</span>
            <a href="tel:933309169" className="text-xl font-black text-white hover:text-white/90 transition-colors leading-none">
              933 309 169
            </a>
          </div>
          <a href="#contacto" className="bg-white text-primary-blue hover:bg-gray-100 font-bold px-8 py-3.5 rounded-[2rem] text-xs transition-colors shadow-lg">
            Presupuesto Gratuito
          </a>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-white p-2" onClick={() => setIsOpen(!isOpen)}>
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
            className="lg:hidden bg-primary-blue border-t border-white/10 overflow-hidden"
          >
            <div className="container py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a key={link.title} href={link.href} className="text-lg font-bold text-white/90 hover:text-white" onClick={() => setIsOpen(false)}>
                  {link.title}
                </a>
              ))}
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-2">Urgencias 24h</p>
                <a href="tel:933309169" className="text-2xl font-black text-white mb-6 block">933 309 169</a>
                <a href="#contacto" className="bg-white text-primary-blue font-bold py-4 rounded-[2rem] text-center w-full block hover:bg-gray-100" onClick={() => setIsOpen(false)}>
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
