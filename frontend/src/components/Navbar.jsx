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
    <header className={`sticky top-0 w-full z-[1000] transition-all duration-300 ${scrolled ? 'bg-primary-blue/95 backdrop-blur-md shadow-md py-3' : 'bg-primary-blue py-5'}`}>
      <div className="container flex justify-between items-center">
        {/* Brand */}
        <a href="#" className="flex items-center gap-4 group no-underline">
          <div className="group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
            <img 
              src="/assets/isotipo.png" 
              alt="CECSA Icon" 
              style={{ 
                height: '40px', 
                width: 'auto', 
                objectFit: 'contain', 
                filter: 'brightness(0) invert(1)' 
              }} 
            />
          </div>
          <div className="flex flex-col justify-center gap-0.5">
            <span className="text-2xl font-black tracking-tighter text-white leading-tight">CECSA</span>
            <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-emerald-400 leading-tight">Urban Plagas</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-12">
          {navLinks.map((link) => (
            <a 
              key={link.title} 
              href={link.href}
              className="text-[15px] font-bold text-white/80 hover:text-white transition-colors no-underline"
            >
              {link.title}
            </a>
          ))}
        </nav>

        {/* Contact info & CTA */}
        <div className="hidden lg:flex items-center gap-10">
          <div className="flex flex-col items-end justify-center gap-1">
            <span className="text-[10px] uppercase font-bold text-white/70 tracking-widest leading-none">Urgencias 24h</span>
            <a href="tel:933309169" className="text-xl font-black text-white hover:text-white/90 transition-colors leading-tight no-underline">
              933 309 169
            </a>
          </div>
          <a href="#contacto" className="bg-white text-primary-blue hover:bg-gray-100 font-bold px-8 py-3.5 rounded-[2rem] text-sm transition-colors shadow-lg no-underline inline-block">
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
            <div className="container py-8 flex flex-col gap-8">
              {navLinks.map((link) => (
                <a key={link.title} href={link.href} className="text-lg font-bold text-white/90 hover:text-white no-underline" onClick={() => setIsOpen(false)}>
                  {link.title}
                </a>
              ))}
              <div className="pt-6 border-t border-white/10">
                <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-3">Urgencias 24h</p>
                <a href="tel:933309169" className="text-2xl font-black text-white mb-6 block no-underline">933 309 169</a>
                <a href="#contacto" className="bg-white text-primary-blue font-bold py-4 rounded-[2rem] text-center w-full block hover:bg-gray-100 no-underline" onClick={() => setIsOpen(false)}>
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
