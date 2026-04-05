import { useState } from 'react';
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
    <section id="servicios" className="bg-bg-light py-24 lg:py-32 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-blue/5 rounded-full blur-[120px] pointer-events-none -mr-48 -mt-48 overflow-hidden" />
      
      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-left">
          <div className="max-w-2xl">
            <h2 className="text-secondary-gray mb-6 leading-tight font-black tracking-tight text-3xl md:text-5xl">
              {t('species.title_part1')} <span className="text-primary-blue">{t('species.title_accent')}</span> {t('species.title_city')}
            </h2>
            <p className="text-lg text-text-muted leading-relaxed font-bold opacity-80">
              {t('species.desc_part1')} <span className="text-secondary-gray font-black underline decoration-primary-blue/20">{t('species.desc_brand')}</span> {t('species.desc_part2')}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl shadow-xl border border-blue-50 h-fit self-start md:self-auto">
            <ClipboardCheck className="text-emerald-500" size={28} />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">{t('species.badge')}</span>
              <span className="text-xs font-black text-secondary-gray">CERTIFICAT ROESB</span>
            </div>
          </div>
        </div>

        {/* Grid Control */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cockroachTypes.map((type) => (
            <button 
              key={type.id}
              onClick={() => setSelectedType(type)}
              className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer group flex flex-col h-full text-left outline-none hover:ring-2 hover:ring-primary-blue/10"
            >
              <div className="w-full aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 relative border border-gray-50 bg-bg-light">
                <img 
                  src={type.image} 
                  alt={type.title} 
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col flex-1 pl-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-blue/60 mb-2 italic">
                  {type.scientificName}
                </span>
                <h3 className="text-2xl font-black text-secondary-gray mb-3 leading-none group-hover:text-primary-blue transition-colors">
                  {type.title}
                </h3>
                <p className="text-text-muted mb-6 text-sm leading-relaxed font-medium line-clamp-2">
                  {type.shortDesc}
                </p>
                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[11px] font-black text-primary-blue uppercase tracking-widest">VEURE FITXA</span>
                  <ChevronRight size={18} className="text-primary-blue group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* COMPACT FLOATING MODAL - FAILSAFE RENDER */}
      {selectedType && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 sm:p-8 z-[9999999]" 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Dark Backdrop */}
          <div className="absolute inset-0 bg-black/98 backdrop-blur-xl cursor-zoom-out" onClick={() => setSelectedType(null)} />
          
          {/* Modal Card - Smaller & Side-by-Side */}
          <div 
            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-[0_50px_150px_rgba(0,0,0,1)] overflow-hidden flex flex-col md:flex-row z-[10] max-h-[90vh]" 
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedType(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-secondary-gray/5 text-secondary-gray hover:bg-black hover:text-white transition-all z-50 flex items-center justify-center border border-white active:scale-95 shadow-sm"
            >
              <X size={20} />
            </button>

            {/* Side 1: Image (50%) */}
            <div className="md:w-1/2 h-48 md:h-auto relative bg-bg-dark shrink-0">
              <img src={selectedType.image} alt={selectedType.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:bg-gradient-to-r" />
            </div>
            
            {/* Side 2: Content (50%) */}
            <div className="md:w-1/2 p-10 lg:p-14 overflow-y-auto bg-white flex flex-col items-start text-left scrollbar-hide">
              <div className="mb-8">
                <span className="text-primary-blue/60 font-black uppercase tracking-widest text-[10px] block mb-2">{selectedType.scientificName}</span>
                <h2 className="text-3xl lg:text-4xl font-black text-secondary-gray mb-4 leading-tight uppercase tracking-tight">{selectedType.title}</h2>
                <div className="h-1.5 w-14 bg-primary-blue rounded-full" />
              </div>

              <div className="text-lg text-secondary-gray opacity-80 leading-relaxed mb-10 font-medium overflow-y-auto">
                {selectedType.fullDesc}
              </div>

              {/* Quick Details */}
              <div className="grid grid-cols-1 gap-4 mb-10 w-full">
                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex flex-col items-start gap-3">
                  <div className="flex items-center gap-3">
                    <Home size={18} className="text-primary-blue" />
                    <h4 className="text-[10px] font-black uppercase text-primary-blue tracking-widest leading-none">{t('species.habitat')}</h4>
                  </div>
                  <p className="text-sm text-secondary-gray font-black leading-snug">{selectedType.habitat}</p>
                </div>
                <div className="p-5 bg-red-50/50 rounded-2xl border border-red-100/50 flex flex-col items-start gap-3">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={18} className="text-red-500" />
                    <h4 className="text-[10px] font-black uppercase text-red-500 tracking-widest leading-none">{t('species.impact')}</h4>
                  </div>
                  <p className="text-sm text-secondary-gray font-black leading-snug">{selectedType.impact}</p>
                </div>
              </div>

              {/* Action */}
              <div className="flex flex-col sm:flex-row gap-6 items-center pt-8 border-t border-gray-100 mt-auto w-full">
                <a 
                  href="#contacto" 
                  onClick={() => setSelectedType(null)}
                  className="btn btn-primary px-8 py-3.5 text-sm font-black w-full text-center"
                >
                  SOL·LICITAR AJUDA
                </a>
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-secondary-gray/30 uppercase tracking-widest leading-none">
                    {t('species.resp_time')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Services;
