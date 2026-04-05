import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, ChevronRight, ClipboardCheck, AlertCircle, Home, Beaker } from 'lucide-react';
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
              layoutId={type.id}
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

      {/* Full-Screen Immersive Modal */}
      <AnimatePresence>
        {selectedType && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedType(null)}
              className="absolute inset-0 bg-secondary-gray/95 backdrop-blur-xl"
            />
            
            <motion.div 
              layoutId={selectedType.id}
              className="relative w-full h-full lg:h-[85vh] lg:max-w-6xl lg:rounded-[3rem] bg-white shadow-2xl overflow-hidden z-10 flex flex-col lg:flex-row"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <button 
                onClick={() => setSelectedType(null)}
                className="absolute top-8 right-8 w-14 h-14 rounded-full bg-secondary-gray/10 text-secondary-gray hover:bg-red-500 hover:text-white transition-all z-20 flex items-center justify-center shadow-lg"
              >
                <X size={28} />
              </button>

              <div className="lg:w-1/2 h-[40vh] lg:h-full relative overflow-hidden">
                <img src={selectedType.image} alt={selectedType.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/30 to-transparent" />
              </div>
              
              <div className="lg:w-1/2 p-8 lg:p-20 overflow-y-auto">
                <div className="mb-10">
                  <span className="text-primary-blue/40 font-serif italic text-xl block mb-2">{selectedType.scientificName}</span>
                  <h2 className="text-5xl lg:text-6xl font-black text-secondary-gray mb-6 leading-tight">{selectedType.title}</h2>
                  <div className="h-2 w-24 bg-emerald-400 rounded-full" />
                </div>

                <p className="text-secondary-gray text-xl leading-relaxed mb-12">
                  {selectedType.fullDesc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
                  <div className="flex gap-5 items-start p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                    <Home className="text-primary-blue shrink-0" size={24} />
                    <div>
                      <h4 className="text-xs font-black uppercase text-primary-blue mb-2 tracking-widest">{t('species.habitat')}</h4>
                      <p className="text-base text-secondary-gray font-bold leading-snug">{selectedType.habitat}</p>
                    </div>
                  </div>
                  <div className="flex gap-5 items-start p-6 bg-red-50/50 rounded-[2rem] border border-red-100">
                    <AlertCircle className="text-red-500 shrink-0" size={24} />
                    <div>
                      <h4 className="text-xs font-black uppercase text-red-500 mb-2 tracking-widest">{t('species.impact')}</h4>
                      <p className="text-base text-secondary-gray font-bold leading-snug">{selectedType.impact}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-center pt-10 border-t border-gray-100">
                  <a 
                    href="#contacto" 
                    onClick={() => setSelectedType(null)}
                    className="btn btn-primary w-full sm:w-auto px-10 py-5 text-lg"
                  >
                    <Beaker size={24} className="mr-2" /> {t('species.cta_free')}
                  </a>
                  <span className="text-base text-text-muted font-medium">
                    {t('species.resp_time')}
                  </span>
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


