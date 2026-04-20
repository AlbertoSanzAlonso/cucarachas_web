import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bug, Droplets, ShieldAlert, Zap, Search, Fingerprint, Ban, Activity, X, ShieldCheck, Thermometer, Phone, Eye, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PestGrid = () => {
  const { t } = useTranslation();
  const [selectedPest, setSelectedPest] = useState(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  React.useEffect(() => {
    if (selectedPest) {
      document.body.style.overflow = 'hidden';
      setIsRevealed(false);
      setIsZoomed(false);
      setImageLoaded(false);
    } else {
      document.body.style.overflow = 'unset';
      setImageLoaded(false);
      setIsRevealed(false);
      setIsZoomed(false);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedPest]);

  const handlePestClick = (pest) => {
    if (isOpening) return;
    setIsOpening(true);
    
    // Check if hero image is ready
    const img = new Image();
    img.src = pest.image;
    
    const finalize = () => {
      setSelectedPest(pest);
      setIsOpening(false);
    };

    if (img.complete) {
      finalize();
    } else {
      img.onload = finalize;
      img.onerror = finalize; // Don't block forever if error
    }
  };

  // Preload all species images on mount to ensure instant loading in modals
  React.useEffect(() => {
    species.forEach(pest => {
      const img = new Image();
      img.src = pest.image;
    });
  }, []);

  const species = [
    {
      id: 'germanic',
      name: t('species.germanica'),
      scientific: 'Blattella germanica',
      icon: <Bug />,
      color: 'var(--color-primary-blue)',
      image: '/assets/eliminar-cucaracha-alemana-barcelona.webp',
      imageScale: 1.35,
      zoomScale: 2.7,
      mobileZoomX: -20,
      mobileZoomY: 20,
      desc: t('species.germanica_desc'),
      details: t('species.germanica_details', { returnObjects: true })
    },
    {
      id: 'american',
      name: t('species.americana'),
      scientific: 'Periplaneta americana',
      icon: <Bug />,
      color: 'var(--color-accent-green)',
      image: '/assets/control-cucaracha-americana-catalunya.webp',
      zoomX: 40,
      mobileZoomX: 0,
      mobileZoomY: 20,
      desc: t('species.americana_desc'),
      details: t('species.americana_details', { returnObjects: true })
    },
    {
      id: 'oriental',
      name: t('species.orientalis'),
      scientific: 'Blatta orientalis',
      icon: <Bug />,
      color: '#ffffff',
      image: '/assets/desinsectacion-cucaracha-oriental.webp',
      zoomX: 40,
      mobileZoomX: 0,
      mobileZoomY: 20,
      desc: t('species.orientalis_desc'),
      darkText: true,
      details: t('species.orientalis_details', { returnObjects: true })
    },
    {
      id: 'banded',
      name: t('species.banded'),
      scientific: 'Supella longipalpa',
      icon: <Bug />,
      color: '#111827',
      image: '/assets/eliminar-cucaracha-banda-cafe.webp',
      imageScale: 1,
      zoomX: 40,
      mobileZoomX: 0,
      mobileZoomY: 20,
      desc: t('species.banded_desc'),
      details: t('species.banded_details', { returnObjects: true })
    },
    {
      id: 'disinfect',
      name: t('species.monitor'),
      icon: <Activity />,
      color: '#ffffff',
      image: '/assets/monitoreo-tecnico-cucarachas-barcelona.webp',
      imageScale: 1.25,
      desc: t('species.monitor_desc'),
      darkText: true,
      details: t('species.monitor_details', { returnObjects: true })
    },
    {
      id: 'nests',
      name: t('species.zap'),
      icon: <Zap />,
      color: '#111827',
      image: '/assets/eliminacion-directa-focos-cucarachas.webp',
      imageScale: 1,
      desc: t('species.zap_desc'),
      details: t('species.zap_details', { returnObjects: true })
    },
    {
      id: 'prevent',
      name: t('species.barrier'),
      icon: <ShieldAlert />,
      color: 'var(--color-primary-blue)',
      image: '/assets/barrera-proteccion-plagas-cocina.webp',
      desc: t('species.barrier_desc'),
      details: t('species.barrier_details', { returnObjects: true })
    },
    {
      id: 'urgent',
      name: t('species.thermal'),
      icon: <Thermometer />,
      color: 'var(--color-accent-green)',
      image: "/assets/inspeccion-tecnica-cuina-professional.webp",
      imageScale: 1,
      desc: t('species.thermal_desc'),
      details: t('species.thermal_details', { returnObjects: true })
    }
  ];

  return (
    <section className="py-24 bg-bg-light relative overflow-hidden" id="species">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-16 relative z-10">

        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-primary-gray tracking-tighter uppercase">
            {t('species.title')}
          </h2>
          <div className="w-24 h-1.5 bg-accent-green mx-auto rounded-full"></div>
          <p className="text-secondary-gray/80 text-lg font-light pt-4 italic">
            Identificación precisa y protocolos de eliminación radical por especie.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {species.map((pest, i) => {
            const orderClasses = [
              'order-1', 'order-2', 'order-3', 'order-4',
              'order-6', 'order-7', 'order-8', 'order-9'
            ];
            
            return (
              <React.Fragment key={pest.id}>
                {i === 4 && (
                  <div className="col-span-2 lg:col-span-4 order-5 flex items-center justify-center py-4 px-12 md:px-0">
                    <div className="h-px bg-gradient-to-r from-transparent via-primary-blue/10 to-transparent flex-1"></div>
                    <div className="mx-6 flex items-center space-x-2 opacity-40">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-green"></div>
                      <div className="w-1 h-1 rounded-full bg-accent-green/50"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-green"></div>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-primary-blue/10 to-transparent flex-1"></div>
                  </div>
                )}
                <motion.div
                  onClick={() => handlePestClick(pest)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`group relative overflow-hidden rounded-[2rem] md:rounded-[3rem] h-auto min-h-[160px] md:aspect-square flex flex-col items-center justify-between p-5 md:p-10 transition-all duration-500 hover:shadow-[0_25px_60px_-15px_rgba(0,128,187,0.3)] hover:translate-y-[-8px] cursor-pointer ${pest.darkText ? 'border border-primary-gray/10 bg-white' : ''} ${orderClasses[i]} ${isOpening ? 'cursor-wait opacity-80' : ''}`}
                  style={{ background: pest.color }}
                >
                  {/* Category Label */}
                  <div className="absolute top-3 left-6 md:top-6 md:left-8 opacity-40 z-20">
                    <span className={`text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] ${pest.darkText ? 'text-primary-blue' : 'text-white'}`}>
                      {i < 4 ? t('species.label_pest') : (
                        <>
                          <span className="hidden md:inline">{t('species.label_solution')}</span>
                          <span className="md:hidden">{t('species.label_solution_short')}</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Technical Pattern for Solutions */}
                  {i >= 4 && (
                    <div className={`absolute inset-0 opacity-[0.05] pointer-events-none ${pest.darkText ? 'bg-[radial-gradient(var(--color-primary-blue)_1px,transparent_1px)]' : 'bg-[radial-gradient(#fff_1px,transparent_1px)]'} bg-[length:15px_15px]`}></div>
                  )}

                  {/* Corner Search Icon */}
                  <div className="absolute top-3 right-4 md:top-6 md:right-6 opacity-30 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 z-20">
                    <Search size={20} className={pest.darkText ? 'text-primary-blue' : 'text-white/80'} strokeWidth={3} />
                  </div>

                  {/* Main Icon */}
                  <div className={`mt-2 md:mt-8 transform transition-transform duration-500 group-hover:scale-110 drop-shadow-lg ${pest.darkText ? 'text-primary-blue' : 'text-white'} w-8 h-8 md:w-14 md:h-14`}>
                    {React.cloneElement(pest.icon, {
                      size: '100%',
                      strokeWidth: 2
                    })}
                  </div>

                  <div className="text-center space-y-1 md:space-y-6 relative z-10 w-full px-1">
                    <h3 className={`font-extrabold text-sm md:text-xl tracking-tight leading-tight break-words hyphens-auto ${pest.darkText ? 'text-primary-blue' : 'text-white'}`} style={{ hyphens: 'auto' }}>
                      {pest.name}
                      {pest.scientific && (
                        <span className="block text-[7px] md:text-xs font-medium opacity-60 mt-0.5 uppercase tracking-wider">
                          ({pest.scientific})
                        </span>
                      )}
                    </h3>
                    <div className="flex justify-center pt-2">
                      <span className={`text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-300 group-hover:scale-110 ${pest.darkText ? 'text-primary-blue/60' : 'text-white/70'}`}>
                        {i < 4 ? t('species_detail.view_pest') : t('species_detail.view_treatment')}
                      </span>
                    </div>
                  </div>

                  {/* Background Watermark Icon */}
                  <div className={`absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-all duration-700 rotate-12 scale-150 ${pest.darkText ? 'text-primary-blue' : 'text-white'}`}>
                    {React.cloneElement(pest.icon, { size: 140 })}
                  </div>

                  {/* Hover Description Overlay (Floating Glass Style) */}
                  <div className="absolute inset-x-4 bottom-4 glass p-4 rounded-xl opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 z-10 pointer-events-none">
                    <p className="text-[10px] font-bold text-primary-gray leading-tight text-center">
                      {pest.desc}
                    </p>
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Species Detail Modal */}
      <AnimatePresence>
        {selectedPest && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPest(null)}
              className="absolute inset-0 bg-slate-900/90 md:bg-primary-blue/40 md:backdrop-blur-xl"
            />

            <motion.div
              initial={window.innerWidth < 768 ? { opacity: 0, y: 20 } : { scale: 1, opacity: 0, y: 60 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={window.innerWidth < 768 ? { opacity: 0, y: 20 } : { scale: 1, opacity: 0, y: 60 }}
              transition={window.innerWidth < 768 ? { duration: 0.2 } : { type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto max-h-[85vh] md:max-h-[90vh] z-[210] transform-gpu"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              {/* Close Button - Fixed relative to modal top */}
              <button
                onClick={() => setSelectedPest(null)}
                className="absolute top-3 right-3 md:top-6 md:right-6 z-[220] p-2 md:p-3 bg-white/90 backdrop-blur-md hover:bg-white rounded-full transition-colors shadow-lg"
              >
                <X size={20} className="text-primary-gray md:w-6 md:h-6" />
              </button>

              {/* Sidebar / Image area */}
              <div className={`md:w-1/2 relative overflow-hidden flex flex-col ${['nests', 'prevent', 'urgent'].includes(selectedPest.id) ? 'h-40 md:h-auto' : 'bg-white pt-6 pb-4'}`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20px_20px,var(--color-primary-blue)_1px,transparent_0)] bg-[length:40px_40px]"></div>
                </div>

                {/* Main Content (Image) with Reveal/Zoom Logic */}
                <div 
                  className={`relative flex-1 flex items-center justify-center overflow-hidden cursor-pointer group/reveal ${['nests', 'prevent', 'urgent'].includes(selectedPest.id) ? 'h-full w-full' : 'p-6 md:p-16'}`}
                  onClick={() => {
                    if (selectedPest.scientific) {
                      if (!isRevealed) {
                        setIsRevealed(true);
                      } else {
                        setIsZoomed(!isZoomed);
                      }
                    }
                  }}
                >
                  <motion.img
                    src={selectedPest.image}
                    alt={selectedPest.name}
                    onLoad={() => setImageLoaded(true)}
                    initial={{ scale: selectedPest.imageScale || 1, x: 0, y: 0, filter: 'blur(30px)' }}
                    animate={{ 
                      filter: (selectedPest.scientific && !isRevealed) ? 'blur(30px)' : 'blur(0px)',
                      scale: isZoomed ? (selectedPest.zoomScale || 2.5) : (selectedPest.imageScale || 1),
                      x: isZoomed ? (window.innerWidth < 768 ? (selectedPest.mobileZoomX || 0) : (selectedPest.zoomX || 0)) : 0,
                      y: isZoomed ? (window.innerWidth < 768 ? (selectedPest.mobileZoomY || 0) : 0) : 0
                    }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={`${['nests', 'prevent', 'urgent'].includes(selectedPest.id) ? 'absolute inset-0 w-full h-full object-cover z-0' : 'w-full max-w-[120px] md:max-w-[400px] h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative z-10'}`}
                  />
                  
                  {/* Sensitivity Overlay */}
                  {selectedPest.scientific && !isRevealed && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm"
                    >
                       <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary-blue text-white flex items-center justify-center shadow-2xl mb-4 animate-bounce">
                          <Eye size={32} />
                       </div>
                       <div className="bg-white/90 px-4 py-2 rounded-full border border-primary-blue/20 shadow-xl">
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary-blue">
                             {t('species_detail.reveal_image')}
                          </p>
                       </div>
                    </motion.div>
                  )}

                  {/* Zoom Action Overlay */}
                  {selectedPest.scientific && isRevealed && (
                    <div className="absolute top-4 left-4 z-30 opacity-0 group-hover/reveal:opacity-100 transition-opacity">
                       <div className="bg-white/80 backdrop-blur-md p-2 rounded-xl text-primary-blue border border-primary-blue/10 shadow-lg flex items-center space-x-2">
                          {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                          <span className="text-[8px] font-black uppercase tracking-widest mr-2">{isZoomed ? t('species_detail.zoom_out') : t('species_detail.zoom_in')}</span>
                       </div>
                    </div>
                  )}

                  {/* Label Overlay */}
                  <div className={`absolute bottom-4 left-0 w-full flex justify-center z-20 transition-opacity ${isZoomed ? 'opacity-0' : 'opacity-100'}`}>
                    <div className={`${['nests', 'prevent', 'urgent'].includes(selectedPest.id) ? 'bg-primary-blue/60 backdrop-blur-md text-white' : 'text-accent-green bg-white/80 shadow-sm'} px-4 py-1.5 rounded-full`}>
                      <p className="text-[8px] md:text-[10px] uppercase font-bold tracking-[0.3em] leading-none">
                        {t('species_detail.modal_certified')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content area */}
              <div className="md:w-1/2 flex flex-col overflow-y-auto">
                <div className="my-auto p-5 md:p-16 flex flex-col space-y-3 md:space-y-8">
                  <div className="space-y-1 md:space-y-4">
                    <h3 className="text-2xl md:text-5xl font-black text-primary-gray tracking-tighter leading-none pt-1">
                      {selectedPest.name}
                    </h3>
                    <div className="w-12 md:w-16 h-1 bg-accent-green rounded-full"></div>
                    <p className="text-[11px] md:text-lg text-secondary-gray/80 leading-relaxed font-light italic">
                      "{selectedPest.desc}"
                    </p>
                  </div>

                  <div className="space-y-2 md:space-y-6">
                    <h4 className="text-[7px] md:text-[10px] uppercase font-bold tracking-[0.2em] text-primary-gray/40">
                      {t('species_detail.modal_protocol')}
                    </h4>
                    <ul className="space-y-1.5 md:space-y-4">
                      {selectedPest.details?.map((detail, idx) => (
                        <motion.li
                          initial={window.innerWidth < 768 ? { opacity: 1 } : { opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={window.innerWidth < 768 ? { duration: 0 } : { delay: 0.1 + (idx * 0.02) }}
                          key={idx}
                          className="flex items-start space-x-3"
                        >
                          <div className="mt-0.5 flex-shrink-0 text-accent-green">
                            <ShieldCheck size={16} className="md:w-5 md:h-5" />
                          </div>
                          <span className="text-[10px] md:text-base text-secondary-gray font-medium leading-tight">{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Modal CTA */}
                  <div className="pt-2 md:pt-8">
                    <button
                      onClick={() => {
                        setSelectedPest(null);
                        setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 300);
                      }}
                      className="w-full py-4 px-6 md:px-8 rounded-xl md:rounded-2xl text-white font-black text-xs md:text-lg shadow-[0_20px_50px_rgba(0,128,187,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-tighter flex items-center justify-center space-x-3 md:space-x-4 group"
                      style={{ background: 'var(--color-primary-blue)' }}
                    >
                      <Zap className="w-5 h-5 md:w-8 md:h-8 text-accent-green fill-accent-green/20 group-hover:rotate-12 transition-transform shrink-0" />
                      <span className="leading-tight truncate">
                        {t('common.cta_free')}
                      </span>
                    </button>
                    <div className="hidden md:flex justify-center items-center space-x-4 mt-6">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Expert" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[10px] text-primary-gray/40 font-bold uppercase tracking-widest leading-none">
                          {t('species_detail.modal_tech_available')}
                        </p>
                        <p className="text-[10px] text-accent-green font-black uppercase tracking-widest">
                          {t('species_detail.modal_status_available')}
                        </p>
                      </div>
                    </div>
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

export default PestGrid;
