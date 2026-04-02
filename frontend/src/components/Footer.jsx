import { Bug, Facebook, Twitter, Instagram, Linkedin, ArrowUp, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer bg-primary-navy text-white pt-20 pb-10">
      <div className="container">
        <div className="bg-white/5 p-10 rounded-3xl border border-white/5 mb-16 hidden lg:flex justify-between items-center">
           <div className="flex items-center gap-4 border-r border-white/10 pr-12">
              <div className="bg-primary-blue p-3 rounded-xl"><MapPin size={24} /></div>
              <div>
                <p className="text-xs uppercase font-bold text-gray-500">Ubicación</p>
                <p className="font-semibold">Calle Rajolers nº 16-18, Barcelona</p>
              </div>
           </div>
           <div className="flex items-center gap-4 border-r border-white/10 pr-12">
              <div className="bg-primary-blue p-3 rounded-xl"><Phone size={24} /></div>
              <div>
                <p className="text-xs uppercase font-bold text-gray-500">Llámanos</p>
                <p className="font-semibold">933 309 169 | 686 371 385</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="bg-primary-blue p-3 rounded-xl"><Mail size={24} /></div>
              <div>
                <p className="text-xs uppercase font-bold text-gray-500">Email</p>
                <p className="font-semibold">info@cecsaddd.com</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Bug className="text-primary-blue" size={32} />
              <span className="font-bold text-2xl uppercase tracking-tighter">CECSA</span>
            </div>
            <p className="text-gray-400">
               CECSA SANIDAD AMBIENTAL: Líderes en prevención y control de plagas con más de 20 años de trayectoria garantizando entornos saludables.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary-blue transition-all"><Facebook size={20} /></a>
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary-blue transition-all"><Instagram size={20} /></a>
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary-blue transition-all"><Linkedin size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-2 inline-block">Servicios</h4>
            <ul className="flex flex-col gap-3 text-gray-400">
              <li><a href="#servicios" className="hover:text-primary-blue">Desinsectación</a></li>
              <li><a href="#servicios" className="hover:text-primary-blue">Desratización</a></li>
              <li><a href="#servicios" className="hover:text-primary-blue">Control de Aves</a></li>
              <li><a href="#servicios" className="hover:text-primary-blue">Madera (Termitas)</a></li>
              <li><a href="#servicios" className="hover:text-primary-blue">Desinfección Certificada</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-2 inline-block">Sectores</h4>
            <ul className="flex flex-col gap-3 text-gray-400">
              <li><a href="#nosotros" className="hover:text-primary-blue">Particulares y Hogares</a></li>
              <li><a href="#" className="hover:text-primary-blue">Hostelería (HORECA)</a></li>
              <li><a href="#" className="hover:text-primary-blue">Comunidades de Vecinos</a></li>
              <li><a href="#contacto" className="hover:text-primary-blue">Administradores de Fincas</a></li>
              <li><a href="#" className="hover:text-primary-blue">Industria Alimentaria</a></li>
            </ul>
          </div>

          <div className="flex flex-col justify-between items-start">
            <div className="text-gray-400">
               <h4 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-2 inline-block">Certificaciones</h4>
               <p className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-2">Registro ROESB</p>
               <p className="text-sm font-semibold text-white mb-4">0246-CAT-SB</p>
               <p className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-2">Entidad Miembro</p>
               <p className="text-sm font-semibold text-white">ADEPAP Catalunya</p>
            </div>
            <button 
              onClick={scrollToTop}
              className="mt-8 bg-white/5 border border-white/10 p-4 rounded-xl text-white shadow-lg flex items-center gap-2 hover:bg-primary-blue transition-all group lg:self-end"
            >
              <ArrowUp size={20} className="group-hover:animate-bounce" /> <span>Volver arriba</span>
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
