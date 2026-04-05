import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, ChevronRight, ClipboardCheck, AlertCircle, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Portal component to ensure we mount to the body only on client-side
const SpeciesPortal = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
};

const Services = () => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState(null);

  const cockroachTypes = [
    {
      id: 'germanica',
      title: t('species.germanica.title'),
      scientificName: 'Blattella germanica',
      shortDesc: t('species.germanica.shortDesc'),
      fullDesc: t('species.germanica.fullDesc'),
      image: '/assets/cucarachas/germanica/1.webp',
      habitat: t('species.germanica.habitat'),
      impact: t('species.germanica.impact'),
      colorTheme: 'blue'
    },
    {
      id: 'americana',
      title: t('species.americana.title'),
      scientificName: 'Periplaneta americana',
      shortDesc: t('species.americana.shortDesc'),
      fullDesc: t('species.americana.fullDesc'),
      image: '/assets/cucarachas/americana/1.webp',
      habitat: t('species.americana.habitat'),
      impact: t('species.americana.impact'),
      colorTheme: 'emerald'
    },
    {
      id: 'oriental',
      title: t('species.oriental.title'),
      scientificName: 'Blatta orientalis',
      shortDesc: t('species.oriental.shortDesc'),
      fullDesc: t('species.oriental.fullDesc'),
      image: '/assets/cucarachas/oriental/1.webp',
      habitat: t('species.oriental.habitat'),
      impact: t('species.oriental.impact'),
      colorTheme: 'purple'
    }
  ];

  return (
    <section id="servicios" className="bg-bg-light py-24 lg:py-36 relative overflow-hidden">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-blue/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
      
      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-secondary-gray mb-6 leading-tight">
              {t('species.title_part1')} <span className="text-primary-blue">{t('species.title_accent')}</span> {t('species.title_city')}
            </h2>
            <p className="text-lg text-text-muted leading-relaxed">
              {t('species.desc_part1')} <strong>{t('species.desc_brand')}</strong> {t('species.desc_part2')}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <ClipboardCheck className="text-emerald-500" />
            <span className="text-sm font-bold text-secondary-gray">{t('species.badge')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {cockroachTypes.map((type) => (
            <motion.div 
              key={type.id}
              onClick={() => setSelectedType(type)}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="w-full h-40 rounded-2xl overflow-hidden mb-6 relative">
                <img 
                  src={type.image} 
                  alt={type.title} 
                  className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-blue/60 italic">
                  {type.scientificName}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-secondary-gray mb-3">{type.title}</h3>
              <p className="text-text-muted mb-6 text-xs leading-relaxed line-clamp-2">
                {type.shortDesc}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                <span className="text-[10px] font-black text-primary-blue uppercase tracking-widest">{t('species.view_sheet')}</span>
                <ChevronRight size={14} className="text-primary-blue group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <SpeciesPortal>
        <AnimatePresence>
          {selectedType && (
            <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 lg:p-8" style={{ pointerEvents: 'auto' }}>
              {/* Massive Dark Blur Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedType(null)}
                className="absolute inset-0 bg-black/95 backdrop-blur-xl cursor-zoom-out"
              />
              
              {/* Cinematic Centered Modal */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col lg:flex-row z-10 max-h-[90vh]"
              >
                {/* Standard Close Button */}
                <button 
                  onClick={() => setSelectedType(null)}
                  className="absolute top-6 right-6 w-12 h-12 rounded-full bg-secondary-gray/10 text-secondary-gray hover:bg-red-500 hover:text-white transition-all z-20 flex items-center justify-center shadow-lg"
                >
                  <X size={24} />
                </button>

                {/* Left side Image */}
                <div className="lg:w-2/5 h-48 lg:h-auto relative bg-secondary-gray/5 overflow-hidden">
                  <img src={selectedType.image} alt={selectedType.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                {/* Right side Info */}
                <div className="lg:w-3/5 p-8 lg:p-14 overflow-y-auto bg-white flex flex-col">
                  <div className="mb-8">
                    <span className="text-primary-blue font-black uppercase tracking-widest text-[10px] block mb-2">{selectedType.scientificName}</span>
                    <h2 className="text-3xl lg:text-5xl font-black text-secondary-gray mb-4 leading-[0.9]">{selectedType.title}</h2>
                    <div className="h-1.5 w-16 bg-primary-blue rounded-full" />
                  </div>

                  <p className="text-lg text-secondary-gray/80 leading-relaxed mb-10 font-medium">
                    {selectedType.fullDesc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                    <div className="p-6 bg-blue-50/40 rounded-3xl border border-blue-100/50">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-blue mb-4 shadow-sm">
                        <Home size={20} />
                      </div>
                      <h4 className="text-[10px] font-black uppercase text-primary-blue mb-1 tracking-widest">{t('species.habitat')}</h4>
                      <p className="text-sm text-secondary-gray font-bold line-clamp-2">{selectedType.habitat}</p>
                    </div>
                    <div className="p-6 bg-red-50/40 rounded-3xl border border-red-100/50">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 mb-4 shadow-sm">
                        <AlertCircle size={20} />
                      </div>
                      <h4 className="text-[10px] font-black uppercase text-red-500 mb-1 tracking-widest">{t('species.impact')}</h4>
                      <p className="text-sm text-secondary-gray font-bold line-clamp-2">{selectedType.impact}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5 items-center pt-8 border-t border-gray-100 mt-auto">
                    <a 
                      href="#contacto" 
                      onClick={() => setSelectedType(null)}
                      className="btn btn-primary w-full sm:w-auto px-10 py-4 text-base"
                    >
                      {t('species.cta_free')}
                    </a>
                    <span className="text-[11px] font-black text-secondary-gray/40 uppercase tracking-widest">
                      {t('species.resp_time')}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </SpeciesPortal>
    </section>
  );
};

export default Services;
