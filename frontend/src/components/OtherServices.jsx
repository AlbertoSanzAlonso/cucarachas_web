import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, CheckCircle, X, ShieldCheck, Zap, Phone, MousePointer2, Bug, Target, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OtherServices = () => {
  const { t } = useTranslation();
  const [selectedService, setSelectedService] = useState(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
      setImageLoaded(true);
    } else {
      document.body.style.overflow = 'unset';
      setImageLoaded(false);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedService]);

  const handleServiceClick = (service) => {
    if (isOpening) return;
    setIsOpening(true);
    const img = new Image();
    img.src = service.image;
    const finalize = () => {
      setSelectedService(service);
      setIsOpening(false);
    };
    if (img.complete) finalize();
    else {
      img.onload = finalize;
      img.onerror = finalize;
    }
  };

  useEffect(() => {
    otherServices.forEach(service => {
      const img = new Image();
      img.src = service.image;
    });
  }, []);

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
    <section className="pt-24 pb-32 md:pb-48 bg-bg-light" id="others">
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
                  onClick={() => handleServiceClick(service)}
                  className={`flex items-center justify-between p-6 rounded-2xl bg-white border border-gray-100 hover:border-accent-green/30 transition-all group cursor-pointer ${isOpening ? 'cursor-wait opacity-80' : ''}`}
                >
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-bg-light shadow-sm flex items-center justify-center text-primary-blue group-hover:text-accent-green transition-colors">
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
              className="absolute inset-0 bg-primary-blue/30 md:backdrop-blur-xl"
            />

            <motion.div
              initial={window.innerWidth < 768 ? { opacity: 0, y: 20 } : { scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={window.innerWidth < 768 ? { opacity: 0, y: 20 } : { scale: 0.9, opacity: 0, y: 50 }}
              transition={window.innerWidth < 768 ? { duration: 0.2 } : { duration: 0.3 }}
              className="relative w-full max-w-4xl bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] md:max-h-none"
            >
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-3 right-3 md:top-6 md:right-6 z-[220] p-2 md:p-3 bg-white/90 backdrop-blur-md hover:bg-white rounded-full transition-colors shadow-lg"
              >
                <X size={20} className="text-primary-gray md:w-6 md:h-6" />
              </button>

              <div className="md:w-5/12 relative h-40 md:h-auto overflow-hidden bg-white">
                <img 
                  src={selectedService.image} 
                  alt={selectedService.label}
                  onLoad={() => setImageLoaded(true)}
                  className="absolute -inset-y-1 inset-x-0 w-full h-[calc(100%+8px)] object-cover"
                />
                <div className="absolute inset-0 bg-primary-blue/30 z-10"></div>
              </div>

              <div className="md:w-7/12 flex flex-col overflow-y-auto bg-white">
                <div className="my-auto p-6 md:p-16 flex flex-col space-y-5 md:space-y-8">
                  <div className="space-y-2 md:space-y-4">
                    <h3 className="text-2xl md:text-5xl font-black text-primary-gray leading-none pt-1 tracking-tighter">
                      {selectedService.title}
                    </h3>
                    <div className="w-12 md:w-16 h-1 md:h-1.5 bg-accent-green rounded-full"></div>
                    <p className="text-sm md:text-lg text-secondary-gray/80 font-light italic leading-relaxed">
                      "{selectedService.desc}"
                    </p>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-gray/30">{t('species_detail.modal_protocol')}</h4>
                    <ul className="space-y-2 md:space-y-4">
                      {selectedService.details?.map((detail, idx) => (
                        <motion.li 
                          key={idx}
                          initial={window.innerWidth < 768 ? { opacity: 1 } : { opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={window.innerWidth < 768 ? { duration: 0 } : { delay: 0.1 + (idx * 0.1) }}
                          className="flex items-start space-x-3"
                        >
                           <ShieldCheck className="text-accent-green shrink-0 mt-0.5" size={18} />
                           <span className="font-medium text-secondary-gray leading-tight text-xs md:text-base">{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 md:pt-4">
                     <button 
                       onClick={() => {
                          setSelectedService(null);
                          setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 300);
                       }}
                       className="w-full py-4 md:py-5 px-6 md:px-8 bg-primary-blue text-white rounded-xl md:rounded-2xl font-black text-xs md:text-lg tracking-widest shadow-2xl shadow-primary-blue/20 flex items-center justify-center space-x-3 md:space-x-4 group overflow-hidden relative"
                     >
                       <Zap className="text-accent-green fill-accent-green/20 group-hover:rotate-12 transition-transform shrink-0 w-4 h-4 md:w-6 md:h-6" />
                       <span className="leading-tight truncate">{t('common.cta_free')}</span>
                     </button>
                  </div>
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
