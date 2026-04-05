import { useState } from 'react';
import { X, ChevronRight, ClipboardCheck, AlertCircle, Home, Bug } from 'lucide-react';
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
      {/* Modal - Rendered first to ensure highest priority in some mobile views */}
      {selectedType && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 sm:p-5 md:p-10 bg-black/95" 
          style={{ zIndex: 999999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Backdrop Trigger */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedType(null)}></div>
          
          {/* Modal Card - Floating in center */}
          <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col lg:flex-row z-[1000000] max-h-[92vh]" onClick={e => e.stopPropagation()}>
            {/* Standard Close Trigger */}
            <button 
              onClick={() => setSelectedType(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-secondary-gray/5 text-secondary-gray hover:bg-black hover:text-white transition-all z-50 flex items-center justify-center shadow-lg border border-white"
            >
              <X size={24} />
            </button>

            {/* Content Segment: Image */}
            <div className="lg:w-2/5 h-48 lg:h-auto relative bg-bg-dark shrink-0">
              <img src={selectedType.image} alt={selectedType.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Content Segment: Details */}
            <div className="lg:w-3/5 p-8 lg:p-14 overflow-y-auto bg-white flex flex-col">
              <div className="mb-8">
                <span className="text-primary-blue/60 font-black uppercase tracking-widest text-[10px] block mb-2">{selectedType.scientificName}</span>
                <h2 className="text-3xl lg:text-5xl font-black text-secondary-gray mb-4 leading-none tracking-tighter uppercase">{selectedType.title}</h2>
                <div className="h-1.5 w-16 bg-primary-blue rounded-full" />
              </div>

              <p className="text-lg text-secondary-gray/80 leading-relaxed mb-10 font-medium text-left">
                {selectedType.fullDesc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10 text-left">
                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-blue mb-4 shadow-sm">
                    <Home size={22} />
                  </div>
                  <h4 className="text-[10px] font-black uppercase text-primary-blue mb-1 tracking-widest">{t('species.habitat')}</h4>
                  <p className="text-sm text-secondary-gray font-black leading-snug">{selectedType.habitat}</p>
                </div>
                <div className="p-6 bg-red-50/50 rounded-3xl border border-red-100/50">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 mb-4 shadow-sm">
                    <AlertCircle size={22} />
                  </div>
                  <h4 className="text-[10px] font-black uppercase text-red-500 mb-1 tracking-widest">{t('species.impact')}</h4>
                  <p className="text-sm text-secondary-gray font-black leading-snug">{selectedType.impact}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 items-center pt-8 border-t border-gray-100 mt-auto">
                <a 
                  href="#contacto" 
                  onClick={() => setSelectedType(null)}
                  className="btn btn-primary px-10 py-4 text-base w-full sm:w-auto font-black"
                >
                  SOL·LICITAR AJUDA
                </a>
                <div className="flex items-center gap-3 bg-bg-light px-5 py-2.5 rounded-full border border-gray-50">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
                  <span className="text-[11px] font-black text-secondary-gray/50 uppercase tracking-widest">
                    {t('species.resp_time')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background decoration scoped inside div */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-blue/5 rounded-full blur-[100px] pointer-events-none -mr-48 -mt-48 overflow-hidden" />
      
      <div className="container relative z-10 mx-auto px-4">
        {/* Title Group */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-left">
          <div className="max-w-2xl">
            <h2 className="text-secondary-gray mb-6 leading-tight font-black tracking-tight text-4xl lg:text-5xl">
              {t('species.title_part1')} <span className="text-primary-blue">{t('species.title_accent')}</span> {t('species.title_city')}
            </h2>
            <p className="text-lg text-text-muted leading-relaxed font-medium">
              {t('species.desc_part1')} <span className="text-secondary-gray font-bold">{t('species.desc_brand')}</span> {t('species.desc_part2')}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl shadow-lg border border-blue-50 h-fit self-start md:self-auto">
            <span className="p-3 bg-emerald-50 rounded-2xl text-emerald-500 shadow-sm"><ClipboardCheck size={24} /></span>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">{t('species.badge')}</span>
              <span className="text-xs font-black text-secondary-gray tracking-tight">TÈCNICS CERTIFICATS</span>
            </div>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cockroachTypes.map((type) => (
            <button 
              key={type.id}
              onClick={() => setSelectedType(type)}
              className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer group flex flex-col h-full text-left outline-none"
            >
              <div className="w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-8 relative border border-gray-50 shadow-inner">
                <img 
                  src={type.image} 
                  alt={type.title} 
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col flex-1 pl-1">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-primary-blue/60 mb-2 italic">
                  {type.scientificName}
                </span>
                <h3 className="text-2xl font-black text-secondary-gray mb-4 uppercase tracking-tighter leading-none group-hover:text-primary-blue transition-colors">
                  {type.title}
                </h3>
                <p className="text-text-muted mb-8 text-sm leading-relaxed line-clamp-2 font-medium opacity-80">
                  {type.shortDesc}
                </p>
                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between group-hover:border-primary-blue/10 transition-colors">
                  <span className="text-[11px] font-black text-primary-blue uppercase tracking-widest">{t('species.view_sheet')}</span>
                  <div className="w-11 h-11 rounded-full bg-bg-light flex items-center justify-center text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-all duration-300">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
