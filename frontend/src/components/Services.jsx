import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ClipboardCheck, AlertCircle, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Services = () => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cockroachTypes = [
    {
      id: 'germanica',
      title: t('species.germanica.title'),
      scientificName: 'Blattella germanica',
      shortDesc: t('species.germanica.shortDesc'),
      fullDesc: t('species.germanica.fullDesc'),
      image: '/assets/cucarachas/germanica/1.webp',
      habitat: t('species.germanica.habitat'),
      impact: t('species.germanica.impact')
    },
    {
      id: 'americana',
      title: t('species.americana.title'),
      scientificName: 'Periplaneta americana',
      shortDesc: t('species.americana.shortDesc'),
      fullDesc: t('species.americana.fullDesc'),
      image: '/assets/cucarachas/americana/1.webp',
      habitat: t('species.americana.habitat'),
      impact: t('species.americana.impact')
    },
    {
      id: 'oriental',
      title: t('species.oriental.title'),
      scientificName: 'Blatta orientalis',
      shortDesc: t('species.oriental.shortDesc'),
      fullDesc: t('species.oriental.fullDesc'),
      image: '/assets/cucarachas/oriental/1.webp',
      habitat: t('species.oriental.habitat'),
      impact: t('species.oriental.impact')
    }
  ];

  const closeModal = () => setSelectedType(null);

  return (
    <section id="servicios" className="bg-bg-light py-24 lg:py-36 relative">
      <div className="container relative z-10 mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
          <div className="max-w-2xl text-left">
            <h2 className="text-secondary-gray mb-8 leading-tight font-black tracking-tighter text-4xl lg:text-5xl">
              {t('species.title_part1')} <span className="text-primary-blue">{t('species.title_accent')}</span> {t('species.title_city')}
            </h2>
            <p className="text-xl text-text-muted leading-relaxed font-medium">
              {t('species.desc_part1')} <strong>{t('species.desc_brand')}</strong> {t('species.desc_part2')}
            </p>
          </div>
          <div className="flex items-center gap-5 bg-white px-8 py-5 rounded-[2rem] shadow-xl border border-blue-50 h-fit">
            <span className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
              <ClipboardCheck size={28} />
            </span>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-emerald-600/70 uppercase tracking-[0.2em]">{t('species.badge')}</span>
              <span className="text-sm font-black text-secondary-gray tracking-tight">PROTECCIÓ ACTIVA</span>
            </div>
          </div>
        </div>

        {/* Species Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cockroachTypes.map((type) => (
            <div 
              key={type.id}
              onClick={() => setSelectedType(type)}
              className="bg-white rounded-[3.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all duration-500 cursor-pointer group flex flex-col h-full ring-1 ring-gray-50 hover:ring-primary-blue/10"
            >
              <div className="w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-8 relative border border-gray-50 bg-bg-light">
                <img 
                  src={type.image} 
                  alt={type.title} 
                  className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
              </div>
              
              <div className="flex flex-col flex-1 text-left">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-primary-blue/60 mb-3 italic">
                  {type.scientificName}
                </span>
                <h3 className="text-2xl font-black text-secondary-gray mb-4 leading-none tracking-tight uppercase group-hover:text-primary-blue transition-colors">
                  {type.title}
                </h3>
                <p className="text-text-muted mb-8 text-sm leading-relaxed line-clamp-3 font-medium">
                  {type.shortDesc}
                </p>
                
                <div className="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[11px] font-black text-primary-blue uppercase tracking-[0.2em]">{t('species.view_sheet')}</span>
                  <div className="w-12 h-12 rounded-full bg-bg-light flex items-center justify-center text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-all duration-300">
                    <ChevronRight size={22} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PORTAL AT THE BODY LEVEL TO ESCAPE ANY PARENT STACKING CONTEXT */}
      {isMounted && createPortal(
        <AnimatePresence>
          {selectedType && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 md:p-10 pointer-events-auto">
              {/* Ultra-dark Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
                className="absolute inset-0 bg-[#000000]/95 backdrop-blur-xl cursor-zoom-out"
              />
              
              {/* Floating Modal Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-5xl bg-white rounded-[3.5rem] shadow-[0_50px_150px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col lg:flex-row z-10 max-h-[92vh] lg:h-[82vh]"
              >
                {/* Close Button */}
                <button 
                  onClick={closeModal}
                  className="absolute top-6 right-6 w-14 h-14 rounded-full bg-secondary-gray/5 text-secondary-gray hover:bg-black hover:text-white transition-all z-20 flex items-center justify-center shadow-lg border border-white"
                >
                  <X size={28} />
                </button>

                {/* Left Side: Image */}
                <div className="lg:w-2/5 h-48 lg:h-auto relative bg-bg-dark shrink-0">
                  <img src={selectedType.image} alt={selectedType.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent lg:bg-gradient-to-r" />
                </div>
                
                {/* Right Side: Info Content */}
                <div className="lg:w-3/5 p-8 lg:p-14 overflow-y-auto bg-white flex flex-col items-start text-left scrollbar-hide">
                  <div className="mb-10 text-left">
                    <span className="text-primary-blue/60 font-black uppercase tracking-widest text-[11px] block mb-2">{selectedType.scientificName}</span>
                    <h2 className="text-4xl lg:text-5xl font-black text-secondary-gray mb-6 leading-none tracking-tighter uppercase">{selectedType.title}</h2>
                    <div className="h-2 w-20 bg-primary-blue rounded-full" />
                  </div>

                  <p className="text-xl text-secondary-gray/80 leading-relaxed mb-10 font-medium text-left">
                    {selectedType.fullDesc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 w-full">
                    <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100 flex flex-col items-start text-left">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-blue mb-4 shadow-sm">
                        <Home size={26} />
                      </div>
                      <h4 className="text-[10px] font-black uppercase text-primary-blue mb-2 tracking-widest">{t('species.habitat')}</h4>
                      <p className="text-lg text-secondary-gray font-black leading-tight">{selectedType.habitat}</p>
                    </div>
                    <div className="p-8 bg-red-50/50 rounded-3xl border border-red-100 flex flex-col items-start text-left">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-500 mb-4 shadow-sm">
                        <AlertCircle size={26} />
                      </div>
                      <h4 className="text-[10px] font-black uppercase text-red-500 mb-2 tracking-widest">{t('species.impact')}</h4>
                      <p className="text-lg text-secondary-gray font-black leading-tight">{selectedType.impact}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 items-center pt-8 border-t border-gray-100 mt-auto w-full">
                    <a 
                      href="#contacto" 
                      onClick={closeModal}
                      className="btn btn-primary px-12 py-5 text-xl w-full sm:w-auto font-black shadow-2xl"
                    >
                      SOL·LICITAR TRACTAMENT
                    </a>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                      <span className="text-xs font-black text-secondary-gray/40 uppercase tracking-widest">
                        {t('species.resp_time')}
                      </span>
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

export default Services;
