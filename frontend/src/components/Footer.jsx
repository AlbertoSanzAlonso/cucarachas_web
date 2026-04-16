import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Phone, MapPin, Mail, ChevronRight, Calendar, Globe } from 'lucide-react';

const Footer = ({ className = "" }) => {
  const { t } = useTranslation();

  const links = [
    { 
      title: 'Servicios', 
      items: [
        { label: 'Control de Cucarachas', path: '/#species' },
        { label: 'Desinsectación Técnica', path: '/#species' },
        { label: 'Sectores Críticos', path: '/#sectors' }
      ] 
    },
    { 
      title: 'Compañía', 
      items: [
        { label: 'Sobre CECSA', path: '/sobre-cecsa' },
        { label: 'Nuestro Método', path: '/#process' },
        { label: 'Contacto', path: '/#contact' }
      ] 
    },
    { 
      title: 'Legal', 
      items: [
        { label: 'Política de Privacidad', path: '/privacitat' },
        { label: 'Aviso Legal', path: '/avis-legal' }
      ] 
    }
  ];

  return (
    <footer className={`pt-24 pb-12 relative overflow-hidden text-white ${className}`} style={{ background: '#0a1a2f' }}>
      
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
                      {t('common.pest_control')}
                    </span>
                 </div>
              </div>
              <p className="text-lg font-light text-white/70 leading-relaxed italic border-l-2 border-accent-green pl-6">
                "Nuestra filosofía técnica prioriza el equilibrio sanitario y la eficacia total con un enfoque ético y consciente."
              </p>
              
              <div className="flex items-center space-x-4">
                  {[
                    { Icon: Facebook, href: 'https://www.facebook.com/cecsaddd/' },
                    { Icon: Instagram, href: 'https://www.instagram.com/tecnicoplagas/' },
                    { Icon: Linkedin, href: 'https://www.linkedin.com/company/desinfecciones-cecsa-sll/' }
                  ].map((item, i) => (
                    <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-accent-green hover:bg-white/10 transition-all">
                       <item.Icon size={20} />
                    </a>
                  ))}
               </div>
           </div>

           {/* Quick Links Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-16">
               {links.map((column, i) => (
                 <div key={i} className="flex flex-col space-y-6">
                    <h4 className="text-white font-black text-sm uppercase tracking-[0.2em]">
                       {column.title}
                    </h4>
                    <ul className="space-y-4">
                       {column.items.map((link, j) => (
                         <li key={j}>
                            <Link 
                              to={link.path} 
                              className="text-white/50 hover:text-accent-green text-sm font-medium transition-colors flex items-center group"
                            >
                               <ChevronRight size={14} className="mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                               {link.label}
                            </Link>
                         </li>
                       ))}
                    </ul>
                 </div>
               ))}
            </div>

        </div>

        {/* Bottom Contact Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 pt-16 border-t border-white/10">
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
              {[
                { icon: <Phone />, title: 'Urgencias 24h', value: '933 309 169' },
                { icon: <Mail />, title: 'Email Soporte', value: 'info@cucarachasbarcelona.cat' },
                { icon: <MapPin />, title: 'Sede Central', value: 'C/ Rajolers 16, Local 1, 08028 BCN' },
                { icon: <Calendar />, title: 'Horarios', value: 'Lun - Ven, 9:00 - 20:00h' }
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-4">
                   <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center shrink-0">
                      {React.cloneElement(item.icon, { size: 24, strokeWidth: 1.5 })}
                   </div>
                   <div className="flex flex-col">
                      <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 whitespace-nowrap">{item.title}</p>
                      <p className="font-black text-white tracking-tighter text-sm md:text-md">{item.value}</p>
                   </div>
                </div>
              ))}
           </div>

           {/* Certification Badges */}
           <div className="flex items-center space-x-6 md:space-x-10">
              <div className="flex flex-col items-center group/badge">
                 <div 
                   className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full mb-3 shadow-xl border border-white/10 overflow-hidden transition-transform duration-500 group-hover/badge:scale-110"
                   style={{
                     backgroundImage: 'url(/assets/certificaciones-cecsa.png)',
                     backgroundSize: '200% 100%',
                     backgroundPosition: '100% center', // ROESB is on the right in the generated image
                     backgroundRepeat: 'no-repeat'
                   }}
                 ></div>
                 <span className="text-[7px] md:text-[8px] uppercase font-black tracking-widest text-white/40 group-hover/badge:text-accent-green transition-colors">A-256 ROESB</span>
              </div>
              <div className="flex flex-col items-center group/badge">
                 <div 
                   className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full mb-3 shadow-xl border border-white/10 overflow-hidden transition-transform duration-500 group-hover/badge:scale-110 flex items-center justify-center p-4"
                 >
                    <img 
                      src="/assets/iso-9001-2015.png" 
                      alt="ISO 9001:2015 Certification" 
                      className="w-full h-full object-contain"
                    />
                 </div>
                 <span className="text-[7px] md:text-[8px] uppercase font-black tracking-widest text-white/40 group-hover/badge:text-accent-green transition-colors">ISO 9001:2015</span>
              </div>
           </div>

        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 opacity-30 text-[10px] font-bold uppercase tracking-widest text-center md:text-left">
           <p>© {new Date().getFullYear()} Desinfecciones Cecsa S.L. · CIF: B64287055 · Barcelona</p>
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
