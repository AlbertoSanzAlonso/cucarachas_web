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

  const closeModal = () => setSelectedType(null);

  return (
    <section id="servicios" className="bg-bg-light py-24 lg:py-36 relative overflow-hidden">
      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl text-left">
            <h2 className="text-secondary-gray mb-6 leading-tight font-black">
              {t('species.title_part1')} <span className="text-primary-blue">{t('species.title_accent')}</span> {t('species.title_city')}
            </h2>
            <p className="text-lg text-text-muted leading-relaxed">
              {t('species.desc_part1')} <strong>{t('species.desc_brand')}</strong> {t('species.desc_part2')}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
            <ClipboardCheck className="text-emerald-500" size={24} />
            <span className="text-sm font-black text-secondary-gray uppercase tracking-widest">{t('species.badge')}</span>
          </div>
        </div>

        {/* Species Selectors - Robust Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {cockroachTypes.map((type) => (
            <div 
              key={type.id}
              onClick={() => setSelectedType(type)}
              className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group flex flex-col text-left"
            >
              <div className="w-full h-44 rounded-3xl overflow-hidden mb-6 relative">
                <img 
                  src={type.image} 
                  alt={type.title} 
                  className="w-full h-full object-cover grayscale-[0.2] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-blue/70 mb-2 italic">
                {type.scientificName}
              </span>
              <h3 className="text-xl font-black text-secondary-gray mb-3 leading-none">{type.title}</h3>
              <p className="text-text-muted mb-8 text-xs leading-relaxed line-clamp-2">
                {type.shortDesc}
              </p>
              <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[11px] font-black text-primary-blue uppercase tracking-widest">{t('species.view_sheet')}</span>
                <ChevronRight size={18} className="text-primary-blue group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simplified High-Reliability Modal - Directly Following User Pattern */}
      {selectedType && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-xl"
          onClick={closeModal}
        >
          {/* Modal Container with StopPropagation */}
          <div 
            className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col lg:flex-row z-[100000] max-h-[95vh] lg:max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Close Trigger */}
            <button 
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-secondary-gray/10 text-secondary-gray hover:bg-black hover:text-white transition-all z-[100001] flex items-center justify-center shadow-md border border-white/20" 
              onClick={closeModal}
            >
              <X size={24} />
            </button>
            
            {/* Modal "Body" - Visual Content */}
            <div className="lg:w-2/5 h-48 lg:h-auto relative bg-bg-dark shrink-0">
              <img src={selectedType.image} alt={selectedType.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Modal "Body" - Text Details */}
            <div className="lg:w-3/5 p-8 lg:p-16 overflow-y-auto flex flex-col items-start text-left bg-white">
              <div className="mb-10 text-left">
                <span className="text-primary-blue/60 font-black uppercase tracking-widest text-[11px] block mb-3">{selectedType.scientificName}</span>
                <h2 className="text-4xl lg:text-6xl font-black text-secondary-gray mb-6 leading-none tracking-tighter uppercase">{selectedType.title}</h2>
                <div className="h-2 w-20 bg-primary-blue rounded-full" />
              </div>

              <div className="prose prose-lg text-secondary-gray font-medium mb-12">
                <p className="leading-relaxed opacity-80">{selectedType.fullDesc}</p>
              </div>

              {/* Specs Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 w-full">
                <div className="p-8 bg-bg-light rounded-[2rem] border border-gray-100 flex flex-col items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-blue mb-4 shadow-sm border border-gray-100">
                    <Home size={22} />
                  </div>
                  <h4 className="text-[11px] font-black uppercase text-primary-blue mb-2 tracking-widest">{t('species.habitat')}</h4>
                  <p className="text-lg text-secondary-gray font-black leading-tight">{selectedType.habitat}</p>
                </div>
                <div className="p-8 bg-red-50/50 rounded-[2rem] border border-red-100 flex flex-col items-start text-left">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 mb-4 shadow-sm border border-red-100">
                    <AlertCircle size={22} />
                  </div>
                  <h4 className="text-[11px] font-black uppercase text-red-500 mb-2 tracking-widest">{t('species.impact')}</h4>
                  <p className="text-lg text-secondary-gray font-black leading-tight">{selectedType.impact}</p>
                </div>
              </div>

              {/* Footer Section */}
              <div className="flex flex-col sm:flex-row gap-6 items-center pt-10 border-t border-gray-100 mt-auto w-full">
                <a 
                  href="#contacto" 
                  onClick={closeModal}
                  className="btn btn-primary px-12 py-5 text-xl font-black w-full justify-center"
                >
                  {t('species.cta_free')}
                </a>
                <div className="flex items-center gap-3 ml-auto sm:ml-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                  <span className="text-[11px] font-black text-secondary-gray/40 uppercase tracking-[0.2em]">
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
