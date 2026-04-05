import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ClipboardCheck, AlertCircle, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
    <section id="servicios" className="bg-bg-light py-24 lg:py-36 relative">
      {/* Decorative element - Scoped overflow to prevent section clipping */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-blue/5 rounded-full blur-3xl -mr-48 -mt-48" />
      </div>

      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-left">
          <div className="max-w-2xl">
            <h2 className="text-secondary-gray mb-6 leading-tight">
              {t('species.title_part1')} <span className="text-primary-blue">{t('species.title_accent')}</span> {t('species.title_city')}
            </h2>
            <p className="text-lg text-text-muted leading-relaxed">
              {t('species.desc_part1')} <strong>{t('species.desc_brand')}</strong> {t('species.desc_part2')}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <ClipboardCheck className="text-emerald-500" size={24} />
            <span className="text-sm font-bold text-secondary-gray">{t('species.badge')}</span>
          </div>
        </div>

        {/* Species Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {cockroachTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type)}
              className="bg-white rounded-[2.5rem] p-7 border border-gray-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col text-left"
            >
              <div className="w-full h-44 rounded-3xl overflow-hidden mb-6 relative">
                <img 
                  src={type.image} 
                  alt={type.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-blue/70 italic">
                  {type.scientificName}
                </span>
              </div>
              
              <h3 className="text-xl font-black text-secondary-gray mb-3 leading-tight">{type.title}</h3>
              <p className="text-text-muted mb-8 text-xs leading-relaxed line-clamp-2">
                {type.shortDesc}
              </p>
              
              <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between w-full">
                <span className="text-[11px] font-black text-primary-blue uppercase tracking-widest">{t('species.view_sheet')}</span>
                <ChevronRight size={16} className="text-primary-blue group-hover:translate-x-2 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cinematic Immersive Modal - Non-portal fixed overlay with absolute dominance */}
      <AnimatePresence>
        {selectedType && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-10" style={{ pointerEvents: 'auto' }}>
            {/* Ultra-dark backdrop blocking everything behind */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedType(null)}
              className="absolute inset-0 bg-black/98 backdrop-blur-xl cursor-zoom-out"
            />
            
            {/* Modal Card - Focused and Clean */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col lg:flex-row z-[100001] max-h-[90vh]"
            >
              {/* Close Icon */}
              <button 
                onClick={() => setSelectedType(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-secondary-gray/5 text-secondary-gray hover:bg-black hover:text-white transition-all z-[100002] flex items-center justify-center shadow-lg"
              >
                <X size={24} />
              </button>

              <div className="lg:w-1/2 h-[30vh] lg:h-auto relative bg-bg-dark">
                <img src={selectedType.image} alt={selectedType.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              
              <div className="lg:w-1/2 p-8 lg:p-16 overflow-y-auto bg-white flex flex-col items-start text-left">
                <div className="mb-8">
                  <span className="text-primary-blue/60 font-black uppercase tracking-widest text-[11px] block mb-2">{selectedType.scientificName}</span>
                  <h2 className="text-4xl lg:text-5xl font-black text-secondary-gray mb-6 leading-[0.9] tracking-tighter uppercase">{selectedType.title}</h2>
                  <div className="h-2 w-20 bg-primary-blue rounded-full" />
                </div>

                <p className="text-xl text-secondary-gray/80 leading-relaxed mb-10 font-medium">
                  {selectedType.fullDesc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 w-full">
                  <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex flex-col items-start text-left">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-blue mb-4 shadow-sm">
                      <Home size={22} />
                    </div>
                    <h4 className="text-[10px] font-black uppercase text-primary-blue mb-2 tracking-widest">{t('species.habitat')}</h4>
                    <p className="text-base text-secondary-gray font-black leading-tight">{selectedType.habitat}</p>
                  </div>
                  <div className="p-6 bg-red-50/50 rounded-3xl border border-red-100 flex flex-col items-start text-left">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 mb-4 shadow-sm">
                      <AlertCircle size={22} />
                    </div>
                    <h4 className="text-[10px] font-black uppercase text-red-500 mb-2 tracking-widest">{t('species.impact')}</h4>
                    <p className="text-base text-secondary-gray font-black leading-tight">{selectedType.impact}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-center pt-8 border-t border-gray-100 mt-auto w-full">
                  <a 
                    href="#contacto" 
                    onClick={() => setSelectedType(null)}
                    className="btn btn-primary px-12 py-5 text-xl w-full sm:w-auto"
                  >
                    {t('species.cta_free')}
                  </a>
                  <p className="text-xs font-black text-secondary-gray/30 uppercase tracking-widest">
                    {t('species.resp_time')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Services;
