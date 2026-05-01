import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';

const ServiceHero = ({ sector, id, sectorIcons, t }) => {
  return (
    <section className="relative pt-32 pb-48 md:pt-40 md:pb-64 bg-primary-blue text-white overflow-hidden z-20">
       {/* Background Elements */}
       <div className="absolute inset-0 z-0">
          <img 
             src={sector.bg} 
             alt={`${sector.title} - Control de Plagues CECSA`} 
             className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          {/* Clinical Gradient and Patterns */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-blue via-primary-blue/90 to-primary-blue-hv/80"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20px_20px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[length:40px_40px]"></div>
          
          {/* Skewed Bottom Divider */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-bg-light origin-bottom-right -skew-y-3 transform translate-y-24 shadow-[0_-30px_60px_rgba(0,0,0,0.15)]"></div>
       </div>
       
       <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <Link to="/#sectors" className="inline-flex items-center space-x-3 text-white/50 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-6 py-2 rounded-full border border-white/10 mb-12 group">
             <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('service_detail_page.back')}</span>
          </Link>
          
          <div className="flex flex-col lg:flex-row items-center gap-16">
             <div className="lg:w-2/3 space-y-8">
                <div className="inline-flex items-center space-x-3 py-2 px-6 bg-accent-green/20 rounded-full border border-accent-green/30 backdrop-blur-sm">
                   <div className="text-accent-green">
                      {React.cloneElement(sectorIcons[id] || <Users />, { size: 18, strokeWidth: 2.5 })}
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-green">{t('service_detail_page.authorized_label')}</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter drop-shadow-2xl">
                   {sector.title}
                </h1>
                <p className="text-xl md:text-2xl text-white/70 font-light leading-relaxed max-w-2xl italic border-l-2 border-accent-green/30 pl-8">
                   "{sector.desc}"
                </p>
             </div>
             
             <div className="hidden lg:flex lg:w-1/3 justify-end">
                <div className="w-72 h-72 md:w-96 md:h-96 bg-white/5 rounded-[4rem] border border-white/10 flex items-center justify-center text-accent-green/40 backdrop-blur-3xl shadow-2xl relative group/icon">
                   {React.cloneElement(sectorIcons[id] || <Users />, { size: 160, strokeWidth: 0.5, className: "group-hover:scale-110 transition-transform duration-700" })}
                   <div className="absolute inset-0 bg-accent-green/5 rounded-[4rem] animate-pulse"></div>
                </div>
             </div>
          </div>
       </div>
    </section>
  );
};

export default ServiceHero;
