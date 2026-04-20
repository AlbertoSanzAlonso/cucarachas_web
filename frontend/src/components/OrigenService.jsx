import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Trash2, Brush, Sparkles, ShieldCheck, Quote } from 'lucide-react';

const OrigenService = () => {
  const { t } = useTranslation();

  const services = [
    { icon: <Trash2 />, text: t('origen.step1', 'Desallotjament de mobiliari i residus') },
    { icon: <Sparkles />, text: t('origen.step2', 'Neteja profunda i recuperació de l’espai') },
    { icon: <Brush />, text: t('origen.step3', 'Pintura i adequació estètica') },
    { icon: <ShieldCheck />, text: t('origen.step4', 'Desinsectació i desinfecció professional') }
  ];

  return (
    <section className="relative overflow-visible pt-32 pb-48 md:pt-40 md:pb-64 z-40" id="origin">
      {/* Skewed Background - The blue stripe (Matches StatsBar style) */}
      <div 
        className="absolute inset-0 skew-y-3 origin-center transform scale-x-110 scale-y-110 z-0 shadow-[0_-20px_50px_rgba(0,128,187,0.15),0_40px_80px_rgba(0,128,187,0.25)]" 
        style={{ background: 'var(--color-primary-blue)' }}
      >
         {/* Subtle Background Pattern inside skewed area */}
         <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20px_20px,#fff_1px,transparent_0)] bg-[length:40px_40px]"></div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid xl:grid-cols-2 gap-16 items-center relative z-10 text-white">
        
        {/* Left Side: Content */}
        <div className="space-y-10 animate-fade-in">
          <div className="space-y-6 text-center xl:text-left flex flex-col items-center xl:items-start">
            <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-white/10 border border-white/20">
               <span className="flex h-2 w-2 rounded-full bg-accent-green"></span>
               <span className="text-[10px] uppercase font-bold tracking-[0.2em]">{t('origen.title')}</span>
            </div>
            <h2 className="text-3xl md:text-5xl xl:text-6xl font-black text-white leading-tight tracking-tighter">
              {t('origen.subtitle')}
            </h2>
            <p className="text-lg text-white/70 font-light leading-relaxed max-w-xl">
              {t('origen.desc')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-4">
            {services.map((service, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                 <div className="p-3 bg-accent-green/20 rounded-xl text-accent-green group-hover:scale-110 transition-transform">
                   {React.cloneElement(service.icon, { size: 24 })}
                 </div>
                 <span className="text-sm font-bold tracking-tight">{service.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-6 relative">
             <div className="p-8 border-l-4 border-accent-green bg-white/5 rounded-r-3xl italic">
                <Quote size={40} className="text-accent-green/20 absolute top-4 right-8 mb-4 rotate-180" />
                <p className="text-lg text-white font-light leading-relaxed relative z-10">
                  "{t('origen.quote')}"
                </p>
             </div>
          </div>
        </div>

        {/* Right Side: Visual Context/Image */}
        <div className="relative group">
           <div className="relative z-10 rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white/10 aspect-[4/5] bg-bg-light/10">
              <img 
                src="/assets/inspeccion-plagas-cocina-profesional.webp" 
                alt="Inspecció de Plagues CECSA" 
                className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-blue-hv/40 to-transparent"></div>
              
              <div className="absolute bottom-12 left-12 right-12 p-8 glass rounded-3xl text-primary-gray animate-pulse">
                 <p className="text-[10px] uppercase font-black text-primary-gray/40 mb-2 tracking-widest leading-none">Status de Recuperación</p>
                 <p className="text-primary-blue font-black text-2xl tracking-tighter">100% Habitable</p>
              </div>
           </div>
           
           {/* Decorative Blobs */}
           <div className="absolute -top-10 -right-10 w-64 h-64 bg-accent-green/20 rounded-full blur-[80px] animate-pulse"></div>
           <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary-blue/30 rounded-full blur-[80px]"></div>
        </div>

      </div>
    </section>
  );
};

export default OrigenService;
