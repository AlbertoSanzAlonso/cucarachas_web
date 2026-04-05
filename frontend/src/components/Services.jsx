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
    <section id="servicios" className="bg-bg-light py-20 relative">
      {/* Visual Anchor Decorator */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-blue/5 rounded-full blur-[100px] pointer-events-none -mr-40 -mt-40 overflow-hidden" />
      
      <div className="container relative z-10 mx-auto px-4">
        {/* Header - Editorial and Clean */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8 text-left">
          <div className="max-w-xl">
            <h2 className="text-secondary-gray mb-4 leading-none font-black tracking-tight text-3xl md:text-5xl uppercase">
              {t('species.title_part1')} <span className="text-primary-blue">{t('species.title_accent')}</span> {t('species.title_city')}
            </h2>
            <p className="text-base text-text-muted leading-relaxed font-bold opacity-80 uppercase tracking-tight">
              {t('species.desc_part1')} <span className="text-secondary-gray font-black">{t('species.desc_brand')}</span> {t('species.desc_part2')}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl shadow-xl border border-blue-50 h-fit self-start md:self-auto uppercase">
            <ClipboardCheck className="text-emerald-500" size={26} />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest leading-none">PROTECCIÓ</span>
              <span className="text-[11px] font-black text-secondary-gray mt-1 leading-none uppercase italic">CERTIFICADA</span>
            </div>
          </div>
        </div>

        {/* Condensed Card Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {cockroachTypes.map((type) => (
            <button 
              key={type.id}
              onClick={() => setSelectedType(type)}
              className="bg-white rounded-[2.5rem] p-7 border border-gray-100 shadow-sm hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 group flex flex-col h-full text-left outline-none hover:ring-2 hover:ring-primary-blue/5"
            >
              <div className="w-full aspect-[16/10] rounded-[1.8rem] overflow-hidden mb-6 relative border border-gray-50 bg-bg-light">
                <img src={type.image} alt={type.title} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-transform duration-1000 group-hover:scale-105" />
              </div>
              <div className="flex flex-col flex-1 pl-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary-primary-blue/60 mb-2 italic">{type.scientificName}</span>
                <h3 className="text-xl font-black text-secondary-gray mb-3 uppercase tracking-tighter leading-none group-hover:text-primary-blue transition-colors">
                  {type.title}
                </h3>
                <p className="text-text-muted mb-6 text-[13px] font-medium opacity-80 leading-relaxed line-clamp-2 italic">
                  {type.shortDesc}
                </p>
                <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary-blue uppercase tracking-widest">VEURE DETALL</span>
                  <ChevronRight size={16} className="text-primary-blue group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* PORTAL-BASED MODAL - ABSOLUTE RATIO CONTROL (UNCOMPRESSED) */}
      {isClient && createPortal(
        <AnimatePresence>
          {selectedType && (
            <motion.div 
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10000000, padding: '1rem'
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
              
              {/* Modal Card - Grid Layout to protect image ratio */}
              <motion.div 
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '56rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '2.5rem',
                  boxShadow: '0 50px 150px rgba(0,0,0,0.4)',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth > 991 ? '1.4fr 1fr' : '1fr', // Imagery wins width
                  maxHeight: '90vh',
                  zIndex: 100
                }}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                onClick={e => e.stopPropagation()}
              >
                {/* Close Trigger Floating */}
                <button 
                  onClick={closeModal}
                  style={{
                    position: 'absolute', top: '1.5rem', left: '1.5rem', // Left side for visual relief
                    width: '3.5rem', height: '3.5rem',
                    borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#3c3c3b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', zIndex: 100,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                >
                  <X size={24} />
                </button>

                {/* Imagery Segment: WIDE ratio (58%) */}
                <div className="h-64 lg:h-full relative overflow-hidden bg-bg-dark">
                   <img src={selectedType.image} alt={selectedType.title} className="w-full h-full object-cover block" />
                   <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Content Segment: NARROW ratio (42%) */}
                <div className="p-8 lg:p-12 overflow-y-auto bg-white flex flex-col items-start text-left scrollbar-hide border-l border-gray-50">
                  <div className="mb-8">
                    <span className="text-primary-blue/60 font-black uppercase tracking-widest text-[9px] block mb-2 italic">{selectedType.scientificName}</span>
                    <h2 className="text-3xl lg:text-5xl font-black text-secondary-gray mb-6 leading-[0.8] tracking-tighter uppercase">{selectedType.title}</h2>
                    <div className="h-1.5 w-12 bg-primary-blue rounded-full" />
                  </div>

                  <p className="text-lg text-secondary-gray/80 font-medium leading-relaxed mb-10 text-left italic">
                    {selectedType.fullDesc}
                  </p>

                  {/* Highlights */}
                  <div className="grid grid-cols-1 gap-4 mb-10 w-full">
                    <div className="p-5 bg-blue-50/40 rounded-3xl border border-blue-100/50 flex items-center gap-4">
                       <div className="p-2 bg-white rounded-xl shadow-sm text-primary-blue">
                         <Home size={20} />
                       </div>
                       <div className="flex flex-col">
                         <h4 className="text-[9px] font-black uppercase text-primary-primary-blue tracking-tighter opacity-100">{t('species.habitat')}</h4>
                         <p className="text-xs text-secondary-gray font-black uppercase tracking-tight">{selectedType.habitat}</p>
                       </div>
                    </div>
                  </div>

                  {/* Final CTAs */}
                  <div className="flex flex-col gap-4 items-center border-t border-gray-100 pt-8 mt-auto w-full">
                    <a 
                      href="#contacto" 
                      onClick={closeModal} 
                      className="btn btn-primary px-10 py-5 text-lg font-black w-full text-center shadow-[0_20px_60px_-10px_rgba(52,211,153,0.3)] bg-emerald-500"
                      style={{ backgroundColor: '#34d399' }}
                    >
                      URGÈNCIA 24H
                    </a>
                    
                    <div className="flex w-full gap-3">
                      <a href="tel:900123456" className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-secondary-gray/5 text-secondary-gray font-black uppercase text-[10px] tracking-widest border border-gray-50">
                        <Phone size={16} /> TRUCAR
                      </a>
                      <a href="https://wa.me/34600000000" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl bg-emerald-50 text-emerald-600 font-black uppercase text-[10px] tracking-widest border border-emerald-50">
                        <MessageCircle size={16} /> CHAT
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
