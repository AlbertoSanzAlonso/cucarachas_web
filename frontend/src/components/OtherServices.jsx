import React from 'react';
import { useTranslation } from 'react-i18next';
import { MousePointer2, ShieldAlert, Bug, Target, Twitter, CheckCircle } from 'lucide-react';

const OtherServices = () => {
  const { t } = useTranslation();

  const otherServices = [
    { key: 'rodents', label: t('others.rodents') },
    { key: 'termites', label: t('others.termites') },
    { key: 'bedbugs', label: t('others.bedbugs') },
    { key: 'ants', label: t('others.ants') },
    { key: 'pigeons', label: t('others.pigeons') }
  ];

  return (
    <section className="py-24 bg-white" id="others">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Image Side */}
        <div className="relative group overflow-hidden rounded-[3rem] shadow-2xl border border-gray-100 order-2 lg:order-1">
           <img 
              src="/assets/urban-pests.webp" 
              alt="Control de Plagas Urbanas CECSA" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/30 to-transparent"></div>
           
           <div className="absolute top-8 left-8 py-2 px-6 glass rounded-full flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-accent-green animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-blue">Catálogo de Especies</span>
           </div>
        </div>

        {/* Text Side */}
        <div className="space-y-12 order-1 lg:order-2">
           <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-black text-primary-gray leading-tight tracking-tighter">
                {t('others.title')}
              </h2>
              <p className="text-lg text-secondary-gray/80 font-light leading-relaxed">
                {t('others.desc')}
              </p>
           </div>

           <div className="space-y-4">
              {otherServices.map((service, i) => (
                <div key={service.key} className="flex items-center justify-between p-6 rounded-2xl bg-bg-light border border-gray-100 hover:border-accent-green/30 transition-all group cursor-default">
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary-blue group-hover:text-accent-green transition-colors">
                         <CheckCircle size={24} strokeWidth={1.5} />
                      </div>
                      <span className="font-bold text-primary-gray tracking-tight md:text-xl">
                        {service.label}
                      </span>
                   </div>
                   <div className="transform translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all font-black text-accent-green text-xs tracking-widest uppercase">
                      Ver Protocolo
                   </div>
                </div>
              ))}
           </div>

           <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-3 text-secondary-gray/50">
                 <ShieldAlert size={20} />
                 <span className="text-xs font-bold uppercase tracking-widest">Protocolos de seguridad total</span>
              </div>
              <button className="px-10 py-4 rounded-xl bg-primary-blue text-white font-black text-sm tracking-widest shadow-lg hover:shadow-xl transition-all">
                 VER TODOS LOS SERVICIOS
              </button>
           </div>
        </div>

      </div>
    </section>
  );
};

export default OtherServices;
