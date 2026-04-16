import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, CheckCircle, X, ShieldCheck, Zap, Phone, MousePointer2, Bug, Target, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OtherServices = () => {
  const { t } = useTranslation();
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedService]);

  const otherServices = [
    { 
      key: 'rodents', 
      label: t('others.rodents'),
      title: t('others.protocols.rodents_title'),
      desc: t('others.protocols.rodents_desc'),
      details: t('others.protocols.rodents_details', { returnObjects: true }),
      image: '/assets/control-roedores-barcelona.png'
    },
    { 
      key: 'termites', 
      label: t('others.termites'),
      title: t('others.protocols.termites_title'),
      desc: t('others.protocols.termites_desc'),
      details: t('others.protocols.termites_details', { returnObjects: true }),
      image: '/assets/control-termitas-barcelona.png'
    },
    { 
      key: 'bedbugs', 
      label: t('others.bedbugs'),
      title: t('others.protocols.bedbugs_title'),
      desc: t('others.protocols.bedbugs_desc'),
      details: t('others.protocols.bedbugs_details', { returnObjects: true }),
      image: '/assets/eliminar-chinches-cama-barcelona.png'
    },
    { 
      key: 'ants', 
      label: t('others.ants'),
      title: t('others.protocols.ants_title'),
      desc: t('others.protocols.ants_desc'),
      details: t('others.protocols.ants_details', { returnObjects: true }),
      image: '/assets/eliminar-hormigas-jardin-barcelona.png'
    },
    { 
      key: 'pigeons', 
      label: t('others.pigeons'),
      title: t('others.protocols.pigeons_title'),
      desc: t('others.protocols.pigeons_desc'),
      details: t('others.protocols.pigeons_details', { returnObjects: true }),
      image: '/assets/control-aves-palomas-barcelona.png'
    }
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
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-blue">{t('others.catalog_label')}</span>
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
                <div 
                  key={service.key} 
                  onClick={() => setSelectedService(service)}
                  className="flex items-center justify-between p-6 rounded-2xl bg-bg-light border border-gray-100 hover:border-accent-green/30 transition-all group cursor-pointer"
                >
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary-blue group-hover:text-accent-green transition-colors">
                         <CheckCircle size={24} strokeWidth={1.5} />
                      </div>
                      <span className="font-bold text-primary-gray tracking-tight md:text-xl">
                        {service.label}
                      </span>
                   </div>
                   <div className="transform translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all font-black text-accent-green text-[10px] tracking-widest uppercase flex items-center">
                      {t('others.view_protocol')}
                      <X className="ml-2 rotate-45" size={14} />
                   </div>
                </div>
              ))}
           </div>

           <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-3 text-secondary-gray/50">
                 <ShieldAlert size={20} />
                 <span className="text-xs font-bold uppercase tracking-widest">{t('others.safety_label')}</span>
              </div>
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-4 rounded-xl bg-primary-blue text-white font-black text-sm tracking-widest shadow-lg hover:shadow-xl transition-all"
              >
                 {t('others.view_all_btn')}
              </button>
           </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-primary-blue/30 backdrop-blur-xl"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative w-full max-w-4xl bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] md:max-h-none"
            >
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-6 right-6 z-20 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg text-primary-gray hover:text-red-500 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="md:w-5/12 relative min-h-[200px] md:min-h-full">
                <img 
                  src={selectedService.image} 
                  alt={selectedService.label}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/40 to-transparent"></div>
              </div>

              <div className="md:w-7/12 p-8 md:p-16 flex flex-col justify-center space-y-8 overflow-y-auto">
                <div className="space-y-4">
                  <h3 className="text-3xl md:text-5xl font-black text-primary-gray leading-tight tracking-tighter">
                    {selectedService.title}
                  </h3>
                  <div className="w-16 h-1.5 bg-accent-green rounded-full"></div>
                  <p className="text-lg text-secondary-gray/80 font-light italic leading-relaxed">
                    "{selectedService.desc}"
                  </p>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-gray/30">{t('species_detail.modal_protocol')}</h4>
                  <ul className="space-y-4">
                    {selectedService.details?.map((detail, idx) => (
                      <motion.li 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + (idx * 0.1) }}
                        className="flex items-start space-x-3"
                      >
                         <ShieldCheck className="text-accent-green shrink-0 mt-1" size={20} />
                         <span className="font-medium text-secondary-gray leading-tight text-sm md:text-base">{detail}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                   <button 
                     onClick={() => {
                        setSelectedService(null);
                        setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 300);
                     }}
                     className="w-full py-5 bg-primary-blue text-white rounded-2xl font-black text-lg tracking-widest shadow-2xl shadow-primary-blue/20 flex items-center justify-center space-x-4 group overflow-hidden relative"
                   >
                     <Zap className="text-accent-green fill-accent-green/20 group-hover:rotate-12 transition-transform" size={24} />
                     <span>{t('common.cta_free')}</span>
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default OtherServices;
