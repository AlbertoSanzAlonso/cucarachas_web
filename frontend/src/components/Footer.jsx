import { Bug, Facebook, Twitter, Instagram, Linkedin, ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer bg-primary-navy text-white pt-20 pb-10">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Bug className="text-primary-blue" size={32} />
              <span className="font-bold text-2xl">Cecsa</span>
            </div>
            <p className="text-gray-400">
              Líderes en control de plagas y desinfección con más de 20 años de experiencia protegiendo hogares y negocios.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary-blue transition-all"><Facebook size={20} /></a>
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary-blue transition-all"><Twitter size={20} /></a>
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary-blue transition-all"><Instagram size={20} /></a>
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary-blue transition-all"><Linkedin size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-2 inline-block">Servicios</h4>
            <ul className="flex flex-col gap-3 text-gray-400">
              <li><a href="#servicios" className="hover:text-primary-blue">Control de Cucarachas</a></li>
              <li><a href="#servicios" className="hover:text-primary-blue">Desratización</a></li>
              <li><a href="#servicios" className="hover:text-primary-blue">Desinsectación</a></li>
              <li><a href="#servicios" className="hover:text-primary-blue">Control de Aves</a></li>
              <li><a href="#servicios" className="hover:text-primary-blue">Desinfección</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-2 inline-block">Empresa</h4>
            <ul className="flex flex-col gap-3 text-gray-400">
              <li><a href="#nosotros" className="hover:text-primary-blue">Sobre Nosotros</a></li>
              <li><a href="#" className="hover:text-primary-blue">Preguntas Frecuentes</a></li>
              <li><a href="#" className="hover:text-primary-blue">Blog</a></li>
              <li><a href="#contacto" className="hover:text-primary-blue">Contacto</a></li>
              <li><a href="#" className="hover:text-primary-blue">Política de Privacidad</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-2 inline-block">Contacto</h4>
            <ul className="flex flex-col gap-4 text-gray-400">
              <li className="flex items-center gap-2">Madrid, España</li>
              <li className="flex items-center gap-2">+34 900 123 456</li>
              <li className="flex items-center gap-2">info@cecsaplagas.com</li>
            </ul>
            <button 
              onClick={scrollToTop}
              className="mt-8 bg-primary-blue p-4 rounded-xl text-white shadow-lg flex items-center gap-2 hover:bg-primary-blue-hover transition-all"
            >
              <ArrowUp size={20} /> <span>Volver arriba</span>
            </button>
          </div>
        </div>

        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Cecsa - Control de Plagas. Todos los derechos reservados.
          </p>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-white">Aviso Legal</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
