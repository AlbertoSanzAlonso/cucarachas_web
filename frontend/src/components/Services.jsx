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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {cockroachTypes.map((type) => (
            <motion.div 
              key={type.id}
              layoutId={type.id}
              onClick={() => setSelectedType(type)}
              whileHover={{ y: -10 }}
              className="card-premium flex flex-col items-start cursor-pointer group"
            >
              <div className="w-full h-56 rounded-2xl overflow-hidden mb-8 relative">
                <img 
                  src={type.image} 
                  alt={type.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <span className="text-white text-sm font-bold flex items-center gap-2">
                    {t('species.view_sheet')} <ChevronRight size={16} />
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="p-2 bg-blue-50 text-primary-blue rounded-lg">
                  <Bug size={20} />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-text-dim italic">
                  {type.scientificName}
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-secondary-gray mb-4">{type.title}</h3>
              <p className="text-text-muted mb-8 text-sm leading-relaxed">
                {type.shortDesc}
              </p>
              
              <div className="mt-auto pt-6 border-t border-gray-100 w-full flex items-center justify-between">
                <span className="text-xs font-bold text-primary-blue">{t('species.more_info')}</span>
                <div className="w-8 h-8 rounded-full bg-bg-light flex items-center justify-center text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-colors">
                  <ChevronRight size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal Detail */}
      <AnimatePresence>
        {selectedType && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedType(null)}
              className="fixed inset-0 bg-secondary-gray/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
            />
            <motion.div 
              layoutId={selectedType.id}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white rounded-[2rem] shadow-2xl z-[1001] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button 
                onClick={() => setSelectedType(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-secondary-gray hover:bg-red-50 hover:text-red-500 transition-colors z-10 flex items-center justify-center border border-gray-100 shadow-lg"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden">
                <div className="lg:w-2/5 h-64 lg:h-auto relative">
                  <img src={selectedType.image} alt={selectedType.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/40 to-transparent" />
                </div>
                
                <div className="lg:w-3/5 p-10 lg:p-16 overflow-y-auto">
                  <div className="mb-8">
                    <span className="text-secondary-gray/40 font-serif italic text-lg block mb-2">{selectedType.scientificName}</span>
                    <h2 className="text-4xl font-black text-secondary-gray mb-4">{selectedType.title}</h2>
                    <div className="h-1 w-20 bg-emerald-400 rounded-full" />
                  </div>

                  <p className="text-secondary-gray text-lg leading-relaxed mb-10">
                    {selectedType.fullDesc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                    <div className="flex gap-4 items-start p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <Home className="text-primary-blue shrink-0" size={20} />
                      <div>
                        <h4 className="text-xs font-bold uppercase text-primary-blue mb-1">{t('species.habitat')}</h4>
                        <p className="text-sm text-secondary-gray font-medium">{selectedType.habitat}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 bg-red-50/50 rounded-2xl border border-red-100">
                      <AlertCircle className="text-red-500 shrink-0" size={20} />
                      <div>
                        <h4 className="text-xs font-bold uppercase text-red-500 mb-1">{t('species.impact')}</h4>
                        <p className="text-sm text-secondary-gray font-medium">{selectedType.impact}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 items-center pt-8 border-t border-gray-100">
                    <a 
                      href="#contacto" 
                      onClick={() => setSelectedType(null)}
                      className="btn btn-primary"
                    >
                      <Beaker size={20} /> {t('species.cta_free')}
                    </a>
                    <span className="text-sm text-text-muted hidden sm:inline-block">
                      {t('species.resp_time')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Services;


