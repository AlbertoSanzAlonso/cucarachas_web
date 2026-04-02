import { Bug, Facebook, Instagram, Linkedin, ArrowUp, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-bg-dark pt-24 pb-12 overflow-hidden border-t border-white/5">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary-blue/5 blur-[120px] pointer-events-none"></div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand Info */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary-blue p-2 rounded-lg text-white">
                <Bug size={24} />
              </div>
              <span className="font-bold text-3xl tracking-tighter text-white uppercase">CECSA</span>
            </div>
            <p className="text-muted leading-relaxed max-w-xs">
               Especialistas en la restauración del equilibrio ambiental con más de 20 años de trayectoria en Barcelona. Eficiencia discreta y rigor sanitario.
            </p>
            <div className="flex gap-5">
              {[Facebook, Instagram, Linkedin].map((Icon, idx) => (
                <a 
                  key={idx}
                  href="#" 
                  className="w-10 h-10 flex items-center justify-center rounded-xl glass border border-white/10 hover:bg-primary-blue hover:text-white transition-all duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-primary-blue"></span>
              Servicios
            </h4>
            <ul className="flex flex-col gap-4 text-sm font-semibold">
              {["Desinsectación", "Desratización", "Control de Aves", "Tratamientos Madera", "Desinfección"].map((item) => (
                <li key={item}>
                  <a href="#servicios" className="text-muted hover:text-primary-blue transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-primary-blue transition-colors"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sectors */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-primary-blue"></span>
              Sectores
            </h4>
            <ul className="flex flex-col gap-4 text-sm font-semibold">
              {["Hogares / Particulares", "Hostelería (HORECA)", "Comunidades de Vecinos", "Administradores de Fincas", "Industria Alimentaria"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted hover:text-primary-blue transition-colors flex items-center gap-2">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col justify-between">
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                <span className="w-8 h-[2px] bg-primary-blue"></span>
                Ubicación
              </h4>
              <ul className="flex flex-col gap-6 text-sm">
                <li className="flex items-start gap-4">
                  <MapPin size={20} className="text-primary-blue shrink-0" />
                  <span className="text-muted">Carrer dels Rajolers, 16 <br />08028 Barcelona</span>
                </li>
                <li className="flex items-center gap-4">
                  <Phone size={20} className="text-primary-blue shrink-0" />
                  <span className="text-white font-bold">933 309 169</span>
                </li>
                <li className="flex items-center gap-4">
                  <Mail size={20} className="text-primary-blue shrink-0" />
                  <span className="text-muted">info@cecsaddd.com</span>
                </li>
              </ul>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToTop}
              className="mt-12 w-fit glass px-6 py-3 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:border-primary-blue/50 transition-colors"
            >
              <ArrowUp size={16} /> Volver Arriba
            </motion.button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <p className="text-muted text-xs font-medium">
              © {currentYear} <span className="text-white">CECSA SANIDAD AMBIENTAL</span>. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-3 justify-center md:justify-start">
               <span className="text-[10px] text-primary-blue font-bold tracking-widest">ROESB: 0246-CAT-SB</span>
               <span className="w-1 h-1 bg-white/20 rounded-full"></span>
               <span className="text-[10px] text-muted font-bold uppercase">CIF: B-64287055</span>
            </div>
          </div>

          <div className="flex gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
            <a href="#" className="hover:text-primary-blue transition-colors">Aviso Legal</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
