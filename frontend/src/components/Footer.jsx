import { Bug, Facebook, Twitter, Instagram, Linkedin, ArrowUp, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer bg-primary-navy text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Bug className="text-primary-blue" size={32} />
              <span className="font-bold text-3xl uppercase tracking-tighter">CECSA</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
               CECSA SANIDAD AMBIENTAL: Especialistas en control de plagas con más de 20 años de trayectoria garantizando salud y bienestar.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-white/5 p-3 rounded-full hover:bg-primary-blue transition-all"><Facebook size={20} /></a>
              <a href="#" className="bg-white/5 p-3 rounded-full hover:bg-primary-blue transition-all"><Instagram size={20} /></a>
              <a href="#" className="bg-white/5 p-3 rounded-full hover:bg-primary-blue transition-all"><Linkedin size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-8 text-white border-b-2 border-primary-blue pb-2 inline-block">Servicios</h4>
            <ul className="flex flex-col gap-4 text-gray-400">
              <li><a href="#servicios" className="hover:text-primary-blue transition-colors">Desinsectación</a></li>
              <li><a href="#servicios" className="hover:text-primary-blue transition-colors">Desratización</a></li>
              <li><a href="#servicios" className="hover:text-primary-blue transition-colors">Control de Aves</a></li>
              <li><a href="#servicios" className="hover:text-primary-blue transition-colors">Tratamientos Madera</a></li>
              <li><a href="#servicios" className="hover:text-primary-blue transition-colors">Desinfección</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-8 text-white border-b-2 border-primary-blue pb-2 inline-block">Sectores</h4>
            <ul className="flex flex-col gap-4 text-gray-400">
              <li><a href="#nosotros" className="hover:text-primary-blue transition-colors">Hogares y Particulares</a></li>
              <li><a href="#" className="hover:text-primary-blue transition-colors">Hostelería (HORECA)</a></li>
              <li><a href="#" className="hover:text-primary-blue transition-colors">Comunidades de Vecinos</a></li>
              <li><a href="#contacto" className="hover:text-primary-blue transition-colors">Administradores de Fincas</a></li>
              <li><a href="#" className="hover:text-primary-blue transition-colors">Industria Alimentaria</a></li>
            </ul>
          </div>

          <div className="flex flex-col justify-between items-start">
            <div>
              <h4 className="text-lg font-bold mb-8 text-white border-b-2 border-primary-blue pb-2 inline-block">Contacto</h4>
              <ul className="flex flex-col gap-5 text-gray-400 mb-8">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-primary-blue shrink-0 mt-1" />
                  <span>Calle Rajolers nº 16-18, 08028 Barcelona</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-primary-blue shrink-0" />
                  <span>933 309 169 | 686 371 385</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-primary-blue shrink-0" />
                  <span>info@cecsaddd.com</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={scrollToTop}
              className="bg-white/5 border border-white/10 p-4 rounded-xl text-white shadow-lg flex items-center gap-2 hover:bg-primary-blue transition-all group lg:self-end"
            >
              <ArrowUp size={20} className="group-hover:animate-bounce" /> <span>Volver arriba</span>
            </button>
          </div>
        </div>

        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1">
             <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} CECSA SANIDAD AMBIENTAL. Todos los derechos reservados.
             </p>
             <p className="text-[10px] text-gray-600 uppercase tracking-widest">ROESB: 0246-CAT-SB | CIF: B-64287055</p>
          </div>
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
