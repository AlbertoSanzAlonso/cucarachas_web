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

      {/* Immersive Full-Screen Species Experience */}
      <AnimatePresence>
        {selectedType && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] bg-white overflow-y-auto"
          >
            {/* Close Button - Sticky/Fixed */}
            <button 
              onClick={() => setSelectedType(null)}
              className="fixed top-8 right-8 w-16 h-16 rounded-full bg-secondary-gray text-white hover:bg-primary-blue hover:scale-110 transition-all z-[5001] flex items-center justify-center shadow-2xl"
              aria-label="Cerrar detalles"
            >
              <X size={32} />
            </button>

            <div className="flex flex-col lg:flex-row min-h-screen">
              {/* Cinematic Image Side */}
              <div className="lg:w-1/2 h-[50vh] lg:h-screen lg:sticky lg:top-0">
                <img 
                  src={selectedType.image} 
                  alt={selectedType.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent hidden lg:block" />
              </div>
              
              {/* Content Side */}
              <div className="lg:w-1/2 bg-white px-8 py-20 lg:p-24 xl:p-32">
                <div className="max-w-xl mx-auto lg:mx-0">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-[2px] w-12 bg-primary-blue" />
                    <span className="text-primary-blue font-black uppercase tracking-[0.2em] text-xs">
                      {t('species.view_sheet')}
                    </span>
                  </div>

                  <h2 className="text-5xl lg:text-7xl font-black text-secondary-gray mb-4 leading-none tracking-tighter">
                    {selectedType.title}
                  </h2>
                  <p className="text-secondary-gray/40 font-serif italic text-2xl lg:text-3xl mb-12">
                    {selectedType.scientificName}
                  </p>

                  <div className="prose prose-xl text-secondary-gray/80 mb-16 leading-relaxed">
                    {selectedType.fullDesc}
                  </div>

                  {/* Technical Specs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <div className="p-8 bg-bg-light rounded-[2.5rem] border border-gray-100">
                      <div className="w-12 h-12 bg-primary-blue/10 rounded-2xl flex items-center justify-center text-primary-blue mb-6">
                        <Home size={24} />
                      </div>
                      <h4 className="text-xs font-black uppercase text-primary-blue mb-3 tracking-widest">{t('species.habitat')}</h4>
                      <p className="text-lg text-secondary-gray font-bold leading-tight">{selectedType.habitat}</p>
                    </div>
                    <div className="p-8 bg-red-50/30 rounded-[2.5rem] border border-red-50">
                      <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                        <AlertCircle size={24} />
                      </div>
                      <h4 className="text-xs font-black uppercase text-red-500 mb-3 tracking-widest">{t('species.impact')}</h4>
                      <p className="text-lg text-secondary-gray font-bold leading-tight">{selectedType.impact}</p>
                    </div>
                  </div>

                  {/* Final Call to Action Box */}
                  <div className="bg-bg-light rounded-[3rem] p-10 lg:p-14 border border-gray-100 flex flex-col items-center text-center">
                    <h3 className="text-2xl font-black text-secondary-gray mb-4">¿Detecta esta especie?</h3>
                    <p className="text-text-muted mb-10 max-w-sm mx-auto">{t('species.desc_part1')} Intervención técnica profesional garantizada.</p>
                    <a 
                      href="#contacto" 
                      onClick={() => setSelectedType(null)}
                      className="btn btn-primary w-full py-5 text-xl shadow-xl flex gap-3 items-center justify-center"
                    >
                      <Beaker size={24} /> {t('species.cta_free')}
                    </a>
                    <span className="text-sm text-text-muted font-bold mt-6 tracking-wide">
                      {t('species.resp_time')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Services;


