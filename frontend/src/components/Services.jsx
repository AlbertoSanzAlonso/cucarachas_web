import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ClipboardCheck, AlertCircle, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Services = () => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
    <section id="servicios" className="bg-bg-light py-24 lg:py-32 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-blue/5 rounded-full blur-[120px] pointer-events-none -mr-48 -mt-48 overflow-hidden" />
      
      <div className="container relative z-10 mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-left">
          <div className="max-w-2xl">
            <h2 className="text-secondary-gray mb-6 leading-tight font-black tracking-tight text-3xl md:text-5xl uppercase">
              {t('species.title_part1')} <span className="text-primary-blue">{t('species.title_accent')}</span> {t('species.title_city')}
            </h2>
            <p className="text-lg text-text-muted leading-relaxed font-bold opacity-80 uppercase tracking-tight">
              {t('species.desc_part1')} <span className="text-secondary-gray font-black">{t('species.desc_brand')}</span> {t('species.desc_part2')}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl shadow-xl border border-blue-50 h-fit self-start md:self-auto uppercase">
            <ClipboardCheck className="text-emerald-500" size={28} />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest leading-none">{t('species.badge')}</span>
              <span className="text-xs font-black text-secondary-gray leading-none mt-1">PROTECCIÓ ACTIVA</span>
            </div>
          </div>
        </div>

        {/* Species Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cockroachTypes.map((type) => (
            <button 
              key={type.id}
              onClick={() => setSelectedType(type)}
              className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-500 cursor-pointer group flex flex-col h-full text-left outline-none"
            >
              <div className="w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-8 relative border border-gray-50 bg-bg-light mix-blend-multiply">
                <img 
                   src={type.image} 
                   alt={type.title} 
                   className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-blue/60 mb-2 italic">
                  {type.scientificName}
                </span>
                <h3 className="text-2xl font-black text-secondary-gray mb-4 uppercase tracking-tighter leading-none group-hover:text-primary-blue transition-colors">
                  {type.title}
                </h3>
                <p className="text-text-muted mb-8 text-sm leading-relaxed font-medium opacity-80">
                  {type.shortDesc}
                </p>
                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[11px] font-black text-primary-blue uppercase tracking-widest">DETALLS TÈCNICS</span>
                  <div className="w-12 h-12 rounded-full bg-bg-light flex items-center justify-center text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-all duration-300">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* PORTAL-BASED FLOATING MODAL - GUARANTEED FRONT-LAYER PLACEMENT */}
      {isClient && selectedType && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 sm:p-8 md:p-12 z-[10000000]" 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Backdrop - High density blur */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-2xl cursor-zoom-out" 
            onClick={closeModal} 
          />
          
          {/* Modal Card - Floating exactly in center */}
          <div 
            className="relative w-full max-w-4xl bg-white rounded-[3.5rem] shadow-[0_60px_180px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col lg:flex-row z-[20] max-h-[92vh] lg:h-[82vh]" 
            onClick={e => e.stopPropagation()}
          >
            {/* Standard Close Trigger */}
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-secondary-gray/5 text-secondary-gray hover:bg-black hover:text-white transition-all z-50 flex items-center justify-center border border-white/20 active:scale-95 shadow-lg"
            >
              <X size={24} />
            </button>

            {/* Side A: Imagery (50%) */}
            <div className="lg:w-1/2 h-56 lg:h-auto relative bg-secondary-gray/5 shrink-0 overflow-hidden">
               <img src={selectedType.image} alt={selectedType.title} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r" />
            </div>

            {/* Side B: Information Content (50%) */}
            <div className="lg:w-1/2 p-10 lg:p-16 overflow-y-auto bg-white flex flex-col items-start text-left scrollbar-hide">
              <div className="mb-10">
                <span className="text-primary-blue/60 font-black uppercase tracking-widest text-[10px] block mb-3 leading-none italic">{selectedType.scientificName}</span>
                <h2 className="text-4xl lg:text-5xl font-black text-secondary-gray mb-6 leading-[0.8] tracking-tighter uppercase">{selectedType.title}</h2>
                <div className="h-1.5 w-16 bg-primary-blue rounded-full" />
              </div>

              <p className="text-xl text-secondary-gray font-medium opacity-80 leading-relaxed mb-12 text-left">
                {selectedType.fullDesc}
              </p>

              {/* Technical Indicators */}
              <div className="grid grid-cols-1 gap-6 mb-12 w-full">
                <div className="p-6 bg-blue-50/40 rounded-[2.5rem] border border-blue-100/50 flex flex-col items-start gap-3">
                   <div className="flex items-center gap-3">
                      <div className="p-3 bg-white rounded-2xl shadow-sm text-primary-blue">
                        <Home size={22} />
                      </div>
                      <h4 className="text-[11px] font-black uppercase text-primary-blue tracking-widest">{t('species.habitat')}</h4>
                   </div>
                   <p className="text-lg text-secondary-gray font-black leading-tight tracking-tight uppercase">{selectedType.habitat}</p>
                </div>
                <div className="p-6 bg-red-50/40 rounded-[2.5rem] border border-red-100/50 flex flex-col items-start gap-3">
                   <div className="flex items-center gap-3">
                      <div className="p-3 bg-white rounded-2xl shadow-sm text-red-500">
                        <AlertCircle size={22} />
                      </div>
                      <h4 className="text-[11px] font-black uppercase text-red-500 tracking-widest">{t('species.impact')}</h4>
                   </div>
                   <p className="text-lg text-secondary-gray font-black leading-tight tracking-tight uppercase">{selectedType.impact}</p>
                </div>
              </div>

              {/* Interaction Footer */}
              <div className="flex flex-col sm:flex-row gap-8 items-center pt-10 border-t border-gray-100 mt-auto w-full">
                <a 
                  href="#contacto" 
                  onClick={closeModal}
                  className="btn btn-primary px-16 py-5 text-xl font-black w-full text-center shadow-[0_20px_60px_-10px_rgba(0,128,187,0.4)]"
                >
                  PRESUPUESTO GRATUÏT
                </a>
                <div className="flex items-center gap-4 bg-bg-light px-8 py-3.5 rounded-full border border-gray-50">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]" />
                  <span className="text-[11px] font-black text-secondary-gray/40 uppercase tracking-widest">
                    RESPOSTA EN 24H
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default Services;
