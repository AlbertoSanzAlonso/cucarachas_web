import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const AboutScope = () => {
  const { t } = useTranslation();

  return (
    <section className="max-w-7xl mx-auto px-6 mb-0 pb-12 overflow-hidden">
      <div className="bg-primary-blue py-20 md:py-32 rounded-[3.5rem] md:rounded-[5rem] relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="/assets/barcelona-authority.webp" 
            alt="Barcelona" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-8 md:px-12 relative z-10 grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div className="space-y-6 md:space-y-8 mb-12 lg:mb-0">
            <span className="px-4 py-2 bg-accent-green/20 text-accent-green rounded-full text-xs font-black uppercase tracking-widest">
              {t('about_page.scope_title')}
            </span>
            <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter leading-tight">
              {t('about_page.scope_desc')}
            </h2>
            <p className="text-lg md:text-xl text-white/60 font-medium">
              {t('about_page.scope_detail')}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 space-y-8">
            <div className="flex items-center space-x-4">
              <Globe className="text-accent-green" size={32} />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">Presència</span>
                <span className="text-xl md:text-2xl font-black text-white">Tota Catalunya</span>
              </div>
            </div>
            <ul className="space-y-4">
              {['Barcelona Ciutat', 'Àrea Metropolitana', 'Girona', 'Tarragona', 'Lleida'].map((city, i) => (
                <li key={i} className="flex items-center text-white/80 font-bold space-x-3">
                  <div className="w-2 h-2 rounded-full bg-accent-green"></div>
                  <span>{city}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutScope;
