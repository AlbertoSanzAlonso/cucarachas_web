import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, ChevronRight, ClipboardCheck, AlertCircle, Home, Beaker } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Services = () => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState(null);

  // Cockroach species data...
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

      {/* Portal-based Modal for unbreakable stacking context */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedType && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 lg:p-8 pointer-events-auto">
              {/* Ultra-dark immersive backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedType(null)}
                className="absolute inset-0 bg-[#050505]/98 backdrop-blur-md"
              />
              
              {/* Centered Modal Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ type: "spring", damping: 28, stiffness: 250 }}
                className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-[0_40px_120px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col lg:flex-row z-10 max-h-[90vh]"
              >
                {/* Close Trigger */}
                <button 
                  onClick={() => setSelectedType(null)}
                  className="absolute top-6 right-6 w-14 h-14 rounded-full bg-bg-light text-secondary-gray hover:bg-red-500 hover:text-white transition-all z-20 flex items-center justify-center shadow-lg border border-gray-100"
                >
                  <X size={28} />
                </button>

                {/* Left Side: Species Imagery */}
                <div className="lg:w-2/5 h-64 lg:h-auto relative bg-bg-dark">
                  <img src={selectedType.image} alt={selectedType.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
                
                {/* Right Side: Detailed Tech Specs */}
                <div className="lg:w-3/5 p-10 lg:p-16 overflow-y-auto bg-white">
                  <div className="mb-10">
                    <span className="text-primary-blue/60 font-black uppercase tracking-widest text-[10px] block mb-3">{selectedType.scientificName}</span>
                    <h2 className="text-4xl lg:text-6xl font-black text-secondary-gray mb-6 leading-none">{selectedType.title}</h2>
                    <div className="h-1.5 w-20 bg-emerald-500 rounded-full" />
                  </div>

                  <p className="text-xl text-secondary-gray/80 leading-relaxed mb-12 font-medium">
                    {selectedType.fullDesc}
                  </p>

                  {/* Technical Information Blocks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                    <div className="p-8 bg-blue-50/40 rounded-[2.5rem] border border-blue-100/50">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-blue mb-6 shadow-sm">
                        <Home size={24} />
                      </div>
                      <h4 className="text-[11px] font-black uppercase text-primary-blue mb-2 tracking-widest">{t('species.habitat')}</h4>
                      <p className="text-base text-secondary-gray font-black leading-snug">{selectedType.habitat}</p>
                    </div>
                    <div className="p-8 bg-red-50/40 rounded-[2.5rem] border border-red-100/50">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 mb-6 shadow-sm">
                        <AlertCircle size={24} />
                      </div>
                      <h4 className="text-[11px] font-black uppercase text-red-500 mb-2 tracking-widest">{t('species.impact')}</h4>
                      <p className="text-base text-secondary-gray font-black leading-snug">{selectedType.impact}</p>
                    </div>
                  </div>

                  {/* Professional Call to Action */}
                  <div className="flex flex-col sm:flex-row gap-6 items-center pt-10 border-t border-gray-100">
                    <a 
                      href="#contacto" 
                      onClick={() => setSelectedType(null)}
                      className="btn btn-primary w-full sm:w-auto px-12 py-5 text-lg"
                    >
                      {t('species.cta_free')}
                    </a>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-black text-secondary-gray/60 uppercase tracking-widest">
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


