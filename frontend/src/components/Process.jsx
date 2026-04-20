import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Search, PenTool, Zap, CheckCircle2, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Process = () => {
  const { t } = useTranslation();
  const [selectedStep, setSelectedStep] = useState(null);

  React.useEffect(() => {
    if (selectedStep) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedStep]);

  const steps = [
    { 
      id: 'step1', 
      name: t('method.step1_title'), 
      icon: <Search />, 
      desc: t('method.step1_desc'),
      image: '/assets/inspeccion-tecnica-cuina-professional.webp',
      details: t('method.step1_details', { returnObjects: true }) || []
    },
    { 
      id: 'step2', 
      name: t('method.step2_title'), 
      icon: <PenTool />, 
      desc: t('method.step2_desc'),
      image: '/assets/servicio-tecnico-plagas-urbano.webp',
      details: t('method.step2_details', { returnObjects: true }) || []
    },
    { 
      id: 'step3', 
      name: t('method.step3_title'), 
      icon: <Zap />, 
      desc: t('method.step3_desc'),
      image: '/assets/monitoreo-tecnico-cucarachas-barcelona.webp',
      details: t('method.step3_details', { returnObjects: true }) || []
    }
  ];

  return (
    <section className="pt-40 pb-24 bg-white relative z-30" id="process">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-20 relative z-10">
        
        <div className="max-w-3xl mx-auto space-y-4">
           <h2 className="text-4xl md:text-5xl font-black text-primary-blue tracking-tighter uppercase">
             {t('method.title')}
           </h2>
           <div className="w-24 h-1.5 bg-accent-green mx-auto rounded-full"></div>
           <p className="text-secondary-gray/80 text-lg font-light pt-4 italic">
             {t('method.desc', 'Metodología científica aplicada para resultados inmediatos.')}
           </p>
        </div>

        <div className="grid md:grid-cols-3 gap-16 relative">
            {/* Decorative connector line (Desktop only) */}
            <div className="hidden md:block absolute top-[64px] left-[15%] right-[15%] h-0.5 bg-gray-100 z-0"></div>
 
            {steps.map((step, i) => (
              <div 
                key={step.id} 
                onClick={() => setSelectedStep(step)}
                className="flex flex-col items-center justify-start space-y-8 animate-fade-in group relative cursor-pointer"
              >
                 {/* Visual Step Indicator with circle background */}
                 <div className="relative w-32 h-32 flex items-center justify-center">
                    <div 
                      className="absolute inset-0 bg-primary-blue/5 group-hover:bg-accent-green/10 transition-colors duration-500 rounded-full scale-100 group-hover:scale-110"
                    ></div>
                    
                    <div className="relative z-10 w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-primary-gray group-hover:text-accent-green transition-all duration-500 border border-gray-50 scale-100 group-hover:scale-110">
                       {React.cloneElement(step.icon, { size: 30, strokeWidth: 1.5 })}
                    </div>
 
                    {/* Step Number Tag */}
                    <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-primary-blue text-white font-black text-xs flex items-center justify-center shadow-lg group-hover:bg-accent-green transition-colors z-20">
                      0{i + 1}
                    </div>
                 </div>
 
                 <div className="text-center space-y-4 max-w-xs transition-transform duration-500 group-hover:-translate-y-2">
                    <h3 className="text-primary-blue font-black text-xl tracking-tight leading-tight">
                      {step.name}
                    </h3>
                    <p className="text-sm font-medium text-secondary-gray/60 leading-relaxed px-4">
                      {step.desc}
                    </p>
                    <div className="pt-2 flex justify-center">
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-accent-green opacity-0 group-hover:opacity-100 transition-opacity">
                        Saber más
                      </span>
                    </div>
                 </div>

                {/* Status Indicator */}
                <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-primary-gray/40 opacity-0 group-hover:opacity-100 transition-opacity mt-4">
                   <CheckCircle2 size={12} className="text-accent-green" />
                   <span>Certificado ROESB</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Step Detail Modal via Portal */}
      {createPortal(
        <AnimatePresence>
          {selectedStep && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedStep(null)}
                className="absolute inset-0 bg-slate-900/90 md:bg-primary-blue/40 md:backdrop-blur-xl"
              />

              <motion.div
                initial={window.innerWidth < 768 ? { opacity: 0, y: 20 } : { scale: 1, opacity: 0, y: 60 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={window.innerWidth < 768 ? { opacity: 0, y: 20 } : { scale: 1, opacity: 0, y: 60 }}
                transition={window.innerWidth < 768 ? { duration: 0.2 } : { type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-5xl bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto max-h-[85vh] md:max-h-[90vh] z-[10000] transform-gpu"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedStep(null)}
                  className="absolute top-3 right-3 md:top-6 md:right-6 z-[10010] p-2 md:p-3 bg-white/90 backdrop-blur-md hover:bg-white rounded-full transition-colors shadow-lg"
                >
                  <X size={20} className="text-primary-gray md:w-6 md:h-6" />
                </button>

                {/* Sidebar / Image area */}
                <div className="md:w-1/2 relative overflow-hidden flex flex-col h-48 md:h-auto">
                  <div 
                    className="relative flex-1 flex items-center justify-center overflow-hidden h-full w-full bg-black/5"
                  >
                    <img
                      src={selectedStep.image}
                      alt={selectedStep.name}
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                    {/* Subtle black gradient instead of blue to make the label readable without altering the image colors much */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                    
                    {/* Label Overlay */}
                    <div className="absolute bottom-6 left-0 w-full flex justify-center z-20">
                      <div className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full border border-white/20 shadow-lg">
                        <p className="text-[8px] md:text-[10px] uppercase font-bold tracking-[0.3em] leading-none flex items-center space-x-2">
                          {React.cloneElement(selectedStep.icon, { size: 12 })}
                          <span>{selectedStep.name}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content area */}
                <div className="md:w-1/2 flex flex-col overflow-y-auto">
                  <div className="my-auto p-6 md:p-16 flex flex-col space-y-4 md:space-y-8">
                    <div className="space-y-2 md:space-y-4">
                      <h3 className="text-2xl md:text-4xl font-black text-primary-gray tracking-tighter leading-tight">
                        {selectedStep.name}
                      </h3>
                      <div className="w-12 md:w-16 h-1 bg-accent-green rounded-full"></div>
                      <p className="text-sm md:text-lg text-secondary-gray/80 leading-relaxed font-light italic">
                        "{selectedStep.desc}"
                      </p>
                    </div>

                    <div className="space-y-3 md:space-y-6 pt-2">
                      <h4 className="text-[8px] md:text-[10px] uppercase font-bold tracking-[0.2em] text-primary-gray/40">
                        Protocolo de actuación
                      </h4>
                      <ul className="space-y-2 md:space-y-4">
                        {Array.isArray(selectedStep.details) && selectedStep.details.map((detail, idx) => (
                          <motion.li
                            initial={window.innerWidth < 768 ? { opacity: 1 } : { opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={window.innerWidth < 768 ? { duration: 0 } : { delay: 0.1 + (idx * 0.05) }}
                            key={idx}
                            className="flex items-start space-x-3"
                          >
                            <div className="mt-0.5 flex-shrink-0 text-accent-green">
                              <ShieldCheck size={16} className="md:w-5 md:h-5" />
                            </div>
                            <span className="text-xs md:text-base text-secondary-gray font-medium leading-snug">{detail}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Modal CTA */}
                    <div className="pt-6 md:pt-10">
                      <button
                        onClick={() => {
                          setSelectedStep(null);
                          setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 300);
                        }}
                        className="w-full py-4 px-6 md:px-8 rounded-xl md:rounded-2xl text-white font-black text-xs md:text-sm shadow-[0_20px_50px_rgba(0,128,187,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider flex items-center justify-center space-x-3 md:space-x-4 group"
                        style={{ background: 'var(--color-primary-blue)' }}
                      >
                        <Zap className="w-4 h-4 md:w-6 md:h-6 text-accent-green fill-accent-green/20 group-hover:rotate-12 transition-transform shrink-0" />
                        <span className="leading-tight truncate">
                          {t('common.cta_free')}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
};

export default Process;
