import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ClipboardCheck, AlertCircle, Home, Phone, MessageCircle } from 'lucide-react';
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
    <section id="servicios" className="bg-bg-light py-20 lg:py-28 relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-blue/5 rounded-full blur-[100px] pointer-events-none -mr-40 -mt-40 overflow-hidden" />
      
      <div className="container relative z-10 mx-auto px-4">
        {/* Condensed Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8 text-left">
          <div className="max-w-2xl">
            <h2 className="text-secondary-gray mb-4 leading-none font-black tracking-tight text-3xl md:text-5xl uppercase">
              {t('species.title_part1')} <span className="text-primary-blue">{t('species.title_accent')}</span> {t('species.title_city')}
            </h2>
            <p className="text-lg text-text-muted leading-relaxed font-bold opacity-80 uppercase tracking-tight">
              {t('species.desc_part1')} <span className="text-secondary-gray font-black">{t('species.desc_brand')}</span> {t('species.desc_part2')}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl shadow-xl border border-blue-50 h-fit self-start md:self-auto uppercase">
            <ClipboardCheck className="text-emerald-500" size={26} />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest leading-none">PROTOCOL</span>
              <span className="text-[11px] font-black text-secondary-gray mt-1">SANI-CLEAN</span>
            </div>
          </div>
        </div>

        {/* Catalog Grid - Single Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {cockroachTypes.map((type) => (
            <button 
              key={type.id}
              onClick={() => setSelectedType(type)}
              className="bg-white rounded-[2.5rem] p-6 lg:p-8 border border-gray-100 shadow-sm hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12)] transition-all duration-500 cursor-pointer group flex flex-col h-full text-left outline-none"
            >
              <div className="w-full aspect-[16/10] rounded-[2rem] overflow-hidden mb-6 relative border border-gray-50 bg-bg-light mix-blend-multiply">
                <img src={type.image} alt={type.title} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-transform duration-1000 group-hover:scale-105" />
              </div>
              <div className="flex flex-col flex-1 pl-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary-primary-blue/60 mb-2 italic">{type.scientificName}</span>
                <h3 className="text-xl font-black text-secondary-gray mb-3 uppercase tracking-tighter leading-none group-hover:text-primary-blue transition-colors">{type.title}</h3>
                <p className="text-text-muted mb-6 text-[13px] leading-relaxed font-medium opacity-80 line-clamp-2">{type.shortDesc}</p>
                <div className="mt-auto pt-5 border-t border-gray-50/80 flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary-primary-blue uppercase tracking-widest">VEURE FITXA</span>
                  <div className="w-9 h-9 rounded-full bg-bg-light flex items-center justify-center text-primary-primary-blue group-hover:bg-primary-primary-blue group-hover:text-white transition-all duration-300">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* FIXED-RATIO BALANCED MODAL (NO COMPRESSION) */}
      {isClient && createPortal(
        <AnimatePresence>
          {selectedType && (
            <motion.div 
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10000000, padding: '1.5rem'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                style={{
                  position: 'absolute', inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.75)',
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  cursor: 'zoom-out'
                }}
                onClick={closeModal} 
              />
              
              <motion.div 
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '52rem', // More focused vertical/square impact
                  backgroundColor: '#ffffff',
                  borderRadius: '2.5rem',
                  boxShadow: '0 60px 180px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: window.innerWidth > 768 ? 'row' : 'column',
                  maxHeight: '90vh',
                  zIndex: 100
                }}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={e => e.stopPropagation()}
              >
                {/* Close Button High Authority */}
                <button 
                  onClick={closeModal}
                  style={{
                    position: 'absolute', top: '1.2rem', right: '1.2rem',
                    width: '3rem', height: '3rem',
                    borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#3c3c3b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', zIndex: 100
                  }}
                >
                  <X size={20} />
                </button>

                {/* Left: Standard Ratio Image (50%) - FIXED BALANCED WIDTH */}
                <div 
                  className="md:w-1/2 h-56 md:h-auto overflow-hidden bg-secondary-gray/5 shrink-0" 
                  style={{ aspectRatio: window.innerWidth > 768 ? 'auto' : '16/10' }}
                >
                   <img src={selectedType.image} alt={selectedType.title} className="w-full h-full object-cover" />
                </div>

                {/* Right: Condensed Text side (50%) */}
                <div className="md:w-1/2 p-8 lg:p-12 overflow-y-auto bg-white flex flex-col items-start text-left scrollbar-hide">
                  <div className="mb-8">
                    <span className="text-primary-blue font-black uppercase tracking-widest text-[9px] block mb-2 italic">{selectedType.scientificName}</span>
                    <h2 className="text-3xl lg:text-4xl font-black text-secondary-gray mb-4 leading-[0.8] tracking-tighter uppercase">{selectedType.title}</h2>
                    <div className="h-1.5 w-12 bg-primary-blue rounded-full" />
                  </div>

                  <p className="text-lg text-secondary-gray font-medium opacity-80 leading-relaxed mb-10 italic">
                    {selectedType.fullDesc}
                  </p>

                  <div className="grid grid-cols-1 gap-4 mb-10 w-full">
                    <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col items-start gap-1">
                        <h4 className="text-[9px] font-black uppercase text-primary-primary-blue tracking-widest">{t('species.habitat')}</h4>
                        <p className="text-[13px] text-secondary-gray font-bold tracking-tight uppercase leading-snug">{selectedType.habitat}</p>
                    </div>
                  </div>

                  {/* CTAs Power Segment */}
                  <div className="flex flex-col gap-4 items-center border-t border-gray-100 pt-8 mt-auto w-full">
                    <a 
                      href="#contacto" 
                      onClick={closeModal} 
                      className="btn btn-primary px-10 py-4 text-base font-black w-full text-center shadow-[0_20px_60px_-10px_rgba(52,211,153,0.3)] bg-emerald-500 hover:bg-emerald-600 !border-none"
                      style={{ backgroundColor: '#34d399' }}
                    >
                      SOL·LICITAR AJUDA
                    </a>
                    
                    <div className="flex w-full gap-3">
                      <a href="tel:900123456" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary-gray/5 text-secondary-gray font-black uppercase text-[9px] tracking-widest border border-gray-100">
                        <Phone size={14} /> {t('hero.cta_call')}
                      </a>
                      <a href="https://wa.me/34600000000" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 text-emerald-600 font-black uppercase text-[9px] tracking-widest border border-emerald-100">
                        <MessageCircle size={14} /> WHATSAPP
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
};

export default Services;
