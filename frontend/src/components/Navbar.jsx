import { useState, useEffect } from 'react';
import { Bug, Menu, X, Phone } from 'lucide-react';

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

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container flex justify-between items-center">
        <div className="flex items-center gap-2 text-text-dark">
          <Bug className="text-secondary-gray" size={32} />
          <span className={`font-bold text-2xl ${isScrolled ? 'text-text-dark' : 'text-text-dark'}`}>Cecsa</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-medium">
          <a href="#inicio" className="hover:text-primary-blue text-text-dark">Inicio</a>
          <a href="#servicios" className="hover:text-primary-blue text-text-dark">Servicios</a>
          <a href="#nosotros" className="hover:text-primary-blue text-text-dark">Nosotros</a>
          <a href="#contacto" className="btn btn-primary flex items-center gap-2">
            <Phone size={18} />
            <span>Pide Presupuesto</span>
          </a>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-text-dark" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white absolute top-full left-0 w-full shadow-lg p-6 flex flex-col gap-4">
          <a href="#inicio" onClick={() => setIsMenuOpen(false)} className="text-lg">Inicio</a>
          <a href="#servicios" onClick={() => setIsMenuOpen(false)} className="text-lg">Servicios</a>
          <a href="#nosotros" onClick={() => setIsMenuOpen(false)} className="text-lg">Nosotros</a>
          <a href="#contacto" onClick={() => setIsMenuOpen(false)} className="btn btn-primary text-center">Pide Presupuesto</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

// Add some Tailwind-like classes to compensate for vanilla CSS if needed
// or just use pure vanilla. I'll stick to clear class names if I didn't use Tailwind.
// Wait, I didn't install Tailwind, I'll use vanilla classes.
