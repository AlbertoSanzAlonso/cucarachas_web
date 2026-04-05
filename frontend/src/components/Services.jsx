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

  return (
    <section id="servicios" className="bg-bg-light py-24 lg:py-36 relative">
      {/* Decorative Blur - Scoped to avoid clipping the modal */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-blue/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none overflow-hidden" />
      
      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
          <div className="max-w-2xl text-left">
            <h2 className="text-secondary-gray mb-8 leading-tight font-black tracking-tighter text-5xl">
              {t('species.title_part1')} <span className="text-primary-blue underline decoration-primary-blue/30 underline-offset-8">{t('species.title_accent')}</span> {t('species.title_city')}
            </h2>
            <p className="text-xl text-text-muted leading-relaxed font-medium">
              {t('species.desc_part1')} <span className="text-secondary-gray font-bold tracking-tight">{t('species.desc_brand')}</span> {t('species.desc_part2')}
            </p>
          </div>
          <div className="flex items-center gap-5 bg-white px-8 py-5 rounded-[2rem] shadow-xl border border-blue-50">
            <ClipboardCheck className="text-emerald-500" size={32} />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-emerald-600/70 uppercase tracking-[0.2em]">{t('species.badge')}</span>
              <span className="text-sm font-black text-secondary-gray tracking-tight">SOLUCIÓ DEFINITIVA</span>
            </div>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {cockroachTypes.map((type) => (
            <button 
              key={type.id}
              onClick={() => setSelectedType(type)}
              className="bg-white rounded-[4rem] p-10 border border-gray-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-500 cursor-pointer group flex flex-col h-full text-left outline-none hover:ring-2 hover:ring-primary-blue/20"
            >
              <div className="w-full aspect-square rounded-[3.5rem] overflow-hidden mb-8 relative bg-bg-light border border-gray-100">
                <img 
                  src={type.image} 
                  alt={type.title} 
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-blue/60 mb-4 italic">
                  {type.scientificName}
                </span>
                <h3 className="text-3xl font-black text-secondary-gray mb-6 leading-[0.9] tracking-tighter uppercase group-hover:text-primary-blue transition-colors">
                  {type.title}
                </h3>
                <p className="text-text-muted mb-8 text-base leading-relaxed font-medium line-clamp-2">
                  {type.shortDesc}
                </p>
                
                <div className="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[12px] font-black text-primary-blue uppercase tracking-[0.2em]">{t('species.view_sheet')}</span>
                  <div className="w-14 h-14 rounded-full bg-bg-light flex items-center justify-center text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-all duration-300 shadow-sm">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* FAILSAFE FLOATING MODAL - No Portal to ensure 100% React render reliability */}
      <AnimatePresence>
        {selectedType && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 lg:p-12">
            {/* Ultra-dark backdrop blocking the entire back layer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedType(null)}
              className="absolute inset-0 bg-black/98 backdrop-blur-2xl cursor-zoom-out"
            />
            
            {/* Cinematic Floating Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-6xl bg-white rounded-[4rem] shadow-[0_50px_150px_rgba(0,0,0,1)] overflow-hidden flex flex-col lg:flex-row z-50 max-h-[92vh] lg:h-[82vh]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedType(null)}
                className="absolute top-8 right-8 w-16 h-16 rounded-full bg-secondary-gray/5 text-secondary-gray hover:bg-black hover:text-white transition-all z-[100] flex items-center justify-center shadow-xl border border-white active:scale-95"
              >
                <X size={32} />
              </button>

              {/* Imagery Section */}
              <div className="lg:w-2/5 h-64 lg:h-auto relative bg-bg-dark shrink-0">
                <img src={selectedType.image} alt={selectedType.title} className="w-full h-full object-cover grayscale-[0.1]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:bg-gradient-to-r" />
              </div>
              
              {/* Content Section */}
              <div className="lg:w-3/5 p-10 lg:p-20 overflow-y-auto bg-white flex flex-col items-start text-left scrollbar-hide">
                <div className="mb-14">
                  <span className="text-primary-blue/60 font-black uppercase tracking-[0.3em] text-[12px] block mb-4 italic">{selectedType.scientificName}</span>
                  <h2 className="text-5xl lg:text-8xl font-black text-secondary-gray mb-10 leading-[0.8] tracking-tighter uppercase">{selectedType.title}</h2>
                  <div className="h-2.5 w-24 bg-primary-blue rounded-full" />
                </div>

                <div className="prose prose-2xl text-secondary-gray font-medium mb-16 opacity-90 leading-relaxed text-left">
                  {selectedType.fullDesc}
                </div>

                {/* Specs Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-16 w-full">
                  <div className="p-10 bg-blue-50/40 rounded-[3.5rem] border border-blue-100/50 flex flex-col items-start shadow-sm transform hover:scale-[1.02] transition-transform">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary-blue mb-6 shadow-sm ring-1 ring-blue-50">
                      <Home size={32} />
                    </div>
                    <h4 className="text-[13px] font-black uppercase text-primary-blue mb-3 tracking-[0.2em]">{t('species.habitat')}</h4>
                    <p className="text-2xl text-secondary-gray font-black leading-tight">{selectedType.habitat}</p>
                  </div>
                  <div className="p-10 bg-red-50/40 rounded-[3.5rem] border border-red-100/50 flex flex-col items-start shadow-sm transform hover:scale-[1.02] transition-transform">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-500 mb-6 shadow-sm ring-1 ring-red-50">
                      <AlertCircle size={32} />
                    </div>
                    <h4 className="text-[13px] font-black uppercase text-red-500 mb-3 tracking-[0.2em]">{t('species.impact')}</h4>
                    <p className="text-2xl text-secondary-gray font-black leading-tight">{selectedType.impact}</p>
                  </div>
                </div>

                {/* Technical Footnote */}
                <div className="flex flex-col sm:flex-row gap-10 items-center pt-14 border-t border-gray-100 mt-auto w-full">
                  <a 
                    href="#contacto" 
                    onClick={() => setSelectedType(null)}
                    className="btn btn-primary px-20 py-8 text-3xl font-black w-full text-center shadow-[0_30px_60px_-15px_rgba(52,211,153,0.5)] transform hover:scale-105 active:scale-95 transition-all"
                  >
                    {t('species.cta_free')}
                  </a>
                  <div className="flex items-center gap-5 bg-emerald-50 px-8 py-4 rounded-full border border-emerald-100">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_#10b981]" />
                    <span className="text-[13px] font-black text-emerald-900 uppercase tracking-[0.15em]">
                      {t('species.resp_time')}
                    </span>
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

export default Services;
