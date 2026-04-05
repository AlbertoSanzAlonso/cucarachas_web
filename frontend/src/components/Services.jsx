import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ClipboardCheck, AlertCircle, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// 100% Reliable Client-Side Portal
const Portal = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
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
              {t('species.title_part1')} <span className="text-primary-blue underline decoration-primary-blue/30 underline-offset-8">{t('species.title_accent')}</span> {t('species.title_city')}
            </h2>
            <p className="text-xl text-text-muted leading-relaxed font-medium">
              {t('species.desc_part1')} <span className="text-secondary-gray font-bold tracking-tight">{t('species.desc_brand')}</span> {t('species.desc_part2')}
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

      {/* FLOATING MODAL VIA PORTAL TO BREAK ALL STACKING CONTEXTS */}
      {selectedType && (
        <Portal>
          <div 
            className="fixed inset-0 z-[500000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-6 lg:p-12 cursor-pointer"
            onClick={closeModal}
          >
            {/* Modal Card - Floating in the center */}
            <div 
              className="relative w-full max-w-6xl bg-white rounded-[4rem] shadow-[0_50px_150px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col lg:flex-row z-[500001] max-h-[95vh] lg:h-[80vh] cursor-default animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Internal Close Trigger */}
              <button 
                className="absolute top-8 right-8 w-14 h-14 rounded-full bg-secondary-gray/10 text-secondary-gray hover:bg-black hover:text-white transition-all z-[500002] flex items-center justify-center border border-white/20" 
                onClick={closeModal}
              >
                <X size={28} />
              </button>
              
              {/* Modal Image Section */}
              <div className="lg:w-2/5 h-56 lg:h-auto relative bg-bg-dark shrink-0">
                <img src={selectedType.image} alt={selectedType.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r" />
              </div>

              {/* Modal Content - Scrollable Info */}
              <div className="lg:w-3/5 p-10 lg:p-20 overflow-y-auto flex flex-col items-start text-left bg-white">
                <div className="mb-12">
                  <span className="text-primary-blue/50 font-serif italic text-2xl lg:text-3xl block mb-3 leading-none italic">{selectedType.scientificName}</span>
                  <h2 className="text-5xl lg:text-7xl font-black text-secondary-gray mb-8 leading-none tracking-tighter uppercase">{selectedType.title}</h2>
                  <div className="h-2 w-24 bg-primary-blue rounded-full" />
                </div>

                <div className="prose prose-xl text-secondary-gray font-medium mb-16 max-w-none">
                  <p className="leading-relaxed opacity-85 text-xl">{selectedType.fullDesc}</p>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16 w-full">
                  <div className="p-8 bg-blue-50/20 rounded-[3rem] border border-blue-100/50 flex flex-col items-start">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-blue mb-6 shadow-sm border border-blue-50">
                      <Home size={30} />
                    </div>
                    <h4 className="text-[12px] font-black uppercase text-primary-blue mb-3 tracking-[0.2em]">{t('species.habitat')}</h4>
                    <p className="text-xl text-secondary-gray font-black leading-tight tracking-tight">{selectedType.habitat}</p>
                  </div>
                  <div className="p-8 bg-red-50/20 rounded-[3rem] border border-red-100/50 flex flex-col items-start">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-500 mb-6 shadow-sm border border-red-50">
                      <AlertCircle size={30} />
                    </div>
                    <h4 className="text-[12px] font-black uppercase text-red-500 mb-3 tracking-[0.2em]">{t('species.impact')}</h4>
                    <p className="text-xl text-secondary-gray font-black leading-tight tracking-tight">{selectedType.impact}</p>
                  </div>
                </div>

                {/* Call to Action Section */}
                <div className="flex flex-col sm:flex-row gap-8 items-center pt-10 border-t border-gray-100 mt-auto w-full">
                  <a 
                    href="#contacto" 
                    onClick={closeModal}
                    className="btn btn-primary px-16 py-6 text-2xl font-black w-full text-center"
                  >
                    PRESUPUEST GRATUÏT
                  </a>
                  <div className="flex items-center gap-4 bg-bg-light px-8 py-4 rounded-full border border-gray-50">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_#10b981]" />
                    <span className="text-[12px] font-black text-secondary-gray/50 uppercase tracking-[0.1em]">
                      RESPOSTA EN 24H
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </section>
  );
};

export default Services;
