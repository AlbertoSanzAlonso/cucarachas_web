import React from 'react';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Linkedin, Phone, MapPin, Mail, ChevronRight, Globe } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  const links = [
    { title: 'Servicios', items: ['Control de Cucarachas', 'Desinsectación Técnica', 'Desinfección COVID', 'Control Térmico'] },
    { title: 'Sectores', items: ['Restauración - HORECA', 'Hoteles y Resorts', 'Comunidades de Vecinos', 'Industria Alimentaria'] },
    { title: 'Compañía', items: ['Sobre CECSA', 'Nuestra Filosofía', 'Casos de Éxito', 'Contacto Directo'] },
    { title: 'Legal', items: ['Política de Privacidad', 'Aviso Legal', 'Cookies', 'Certificación ROESB'] }
  ];

  return (
    <footer className="pt-24 pb-12 relative overflow-hidden text-white" style={{ background: '#0a1a2f' }}>
      
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20px_20px,#fff_1px,transparent_0)] bg-[length:40px_40px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-20">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
           
           {/* Brand Branding */}
           <div className="flex flex-col space-y-8 max-w-sm">
              <div className="flex items-center space-x-3">
                 <img 
                    src="/assets/isotipo.png" 
                    alt="CECSA Logo" 
                    className="h-[40px] md:h-[50px] brightness(10) invert"
                    style={{ filter: 'brightness(0) invert(1)' }}
                 />
                 <div className="flex flex-col leading-none">
                    <span className="text-2xl md:text-3xl font-black tracking-tighter text-white">
                      CEC<span className="text-accent-green">SA</span>
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-white/50">
                      Control de Plagas
                    </span>
                 </div>
              </div>
              <p className="text-lg font-light text-white/70 leading-relaxed italic border-l-2 border-accent-green pl-6">
                "Nuestra filosofía técnica prioriza el equilibrio sanitario y la eficacia total con un enfoque ético y consciente."
              </p>
              
              <div className="flex items-center space-x-4">
                 {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                   <a key={i} href="#" className="p-3 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-accent-green hover:bg-white/10 transition-all">
                      <Icon size={20} />
                   </a>
                 ))}
              </div>
           </div>

           {/* Quick Links Grid */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-24">
              {links.map((group, i) => (
                <div key={i} className="flex flex-col space-y-6">
                   <h4 className="text-sm font-black uppercase tracking-[0.2em] text-accent-green">
                     {group.title}
                   </h4>
                   <ul className="flex flex-col space-y-4">
                      {group.items.map((item, j) => (
                        <li key={j}>
                           <a href="#" className="text-sm font-medium text-white/50 hover:text-white transition-colors flex items-center group">
                              <ChevronRight size={14} className="mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent-green" />
                              {item}
                           </a>
                        </li>
                      ))}
                   </ul>
                </div>
              ))}
           </div>

        </div>

        {/* Bottom Contact Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 pt-16 border-t border-white/10">
           
           <div className="grid sm:grid-cols-3 gap-8 w-full md:w-auto">
              {[
                { icon: <Phone />, title: 'Urgencias 24h', value: '930 000 000' },
                { icon: <Mail />, title: 'Email Soporte', value: 'hola@cecasa.cat' },
                { icon: <Globe />, title: 'Presencia Física', value: 'Barcelona' }
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-4">
                   <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center">
                      {React.cloneElement(item.icon, { size: 24, strokeWidth: 1.5 })}
                   </div>
                   <div className="flex flex-col">
                      <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30">{item.title}</p>
                      <p className="font-black text-white tracking-tighter text-lg">{item.value}</p>
                   </div>
                </div>
              ))}
           </div>

           {/* Certification Badges */}
           <div className="flex items-center space-x-8 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
              <div className="flex flex-col items-center">
                 <div className="w-16 h-16 bg-white/10 rounded-full mb-2"></div>
                 <span className="text-[8px] uppercase font-bold tracking-widest">A-256 ROESB</span>
              </div>
              <div className="flex flex-col items-center">
                 <div className="w-16 h-16 bg-white/10 rounded-full mb-2"></div>
                 <span className="text-[8px] uppercase font-bold tracking-widest">ISO 9001:2015</span>
              </div>
           </div>

        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 opacity-30 text-[10px] font-bold uppercase tracking-widest text-center md:text-left">
           <p>© {new Date().getFullYear()} CECSA Control de Plagas S.L. · Todos los derechos reservados.</p>
           <p className="flex items-center space-x-4">
              <a href="#" className="hover:text-white transition-colors">GDPR Compliant</a>
              <span>·</span>
              <a href="#" className="hover:text-white transition-colors">Sitemap</a>
           </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
