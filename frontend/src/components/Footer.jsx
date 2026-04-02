import { Bug, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer py-20 bg-bg-surface text-secondary-gray">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary-blue p-2 rounded-lg text-white">
                <Bug size={32} />
              </div>
              <span className="text-3xl font-black tracking-tighter uppercase">CECSA</span>
            </div>
            <p className="text-text-muted leading-relaxed">
              Líderes en sanidad ambiental en Barcelona. Restauramos el equilibrio de su entorno con rigor científico y compromiso ético.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-primary-blue hover:text-white transition-all"><Facebook size={20} /></a>
              <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-primary-blue hover:text-white transition-all"><Instagram size={20} /></a>
              <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-primary-blue hover:text-white transition-all"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-secondary-gray">Navegación</h4>
            <ul className="space-y-4 font-bold text-sm">
              <li><a href="#" className="text-text-muted hover:text-primary-blue transition-colors">Inicio</a></li>
              <li><a href="#servicios" className="text-text-muted hover:text-primary-blue transition-colors">Servicios</a></li>
              <li><a href="#nosotros" className="text-text-muted hover:text-primary-blue transition-colors">Sobre Nosotros</a></li>
              <li><a href="#contacto" className="text-text-muted hover:text-primary-blue transition-colors">Contacto</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-secondary-gray">Servicios</h4>
            <ul className="space-y-4 font-bold text-sm">
              <li><a href="#" className="text-text-muted hover:text-primary-blue transition-colors">Desinsectación</a></li>
              <li><a href="#" className="text-text-muted hover:text-primary-blue transition-colors">Desratización</a></li>
              <li><a href="#" className="text-text-muted hover:text-primary-blue transition-colors">Desinfección</a></li>
              <li><a href="#" className="text-text-muted hover:text-primary-blue transition-colors">Control de Plagas HORECA</a></li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-secondary-gray">Legal y Sanidad</h4>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-primary-blue" size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Acreditación Sanitaria <br /> ROESB: 0246-CAT-SB</span>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed">
                Empresa autorizada por el Departament de Salut de la Generalitat de Catalunya.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-text-muted">
            © {new Date().getFullYear()} CECSA Sanidad Ambiental. Todos los derechos reservados.
          </p>
          <div className="flex gap-8 text-[10px] uppercase font-bold tracking-widest text-text-muted">
            <a href="#" className="hover:text-primary-blue transition-colors">Aviso Legal</a>
            <a href="#" className="hover:text-primary-blue transition-colors">Política de Privacidad</a>
            <a href="#" className="hover:text-primary-blue transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
