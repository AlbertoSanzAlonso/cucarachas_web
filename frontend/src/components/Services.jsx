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
    <section id="servicios" className="bg-bg-light py-24 lg:py-32 relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-blue/5 rounded-full blur-[100px] pointer-events-none -mr-40 -mt-40 overflow-hidden" />
      
      <div className="container relative z-10 mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-left">
          <div className="max-w-2xl">
            <h2 className="text-secondary-gray mb-6 leading-tight font-black tracking-tight text-4xl lg:text-5xl uppercase">
              {t('species.title_part1')} <span className="text-primary-blue">{t('species.title_accent')}</span> {t('species.title_city')}
            </h2>
            <p className="text-lg text-text-muted leading-relaxed font-bold opacity-80 uppercase tracking-tight">
              {t('species.desc_part1')} <span className="text-secondary-gray font-black">{t('species.desc_brand')}</span> {t('species.desc_part2')}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl shadow-xl border border-blue-50 h-fit self-start md:self-auto uppercase">
            <ClipboardCheck className="text-emerald-500" size={26} />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest leading-none">PROTOCOL</span>
              <span className="text-[11px] font-black text-secondary-gray mt-1 uppercase">SANI-CLEAN</span>
            </div>
          </div>
        </div>

        {/* RESTORED PREMIUM SINGLE-ROW GRID (BEFORE RECENT CONDENSING) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cockroachTypes.map((type) => (
            <button 
              key={type.id}
              onClick={() => setSelectedType(type)}
              className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all duration-500 cursor-pointer group flex flex-col h-full text-left outline-none hover:ring-2 hover:ring-primary-blue/5"
            >
              <div className="w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-8 relative border border-gray-50 bg-bg-light">
                <img src={type.image} alt={type.title} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-transform duration-1000 group-hover:scale-105" />
              </div>
              <div className="flex flex-col flex-1 pl-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-primary-blue/60 mb-2 italic">{type.scientificName}</span>
                <h3 className="text-2xl font-black text-secondary-gray mb-4 uppercase tracking-tighter leading-none group-hover:text-primary-blue transition-colors">{type.title}</h3>
                <p className="text-text-muted mb-8 text-sm leading-relaxed font-medium opacity-80 line-clamp-2">{type.shortDesc}</p>
                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[11px] font-black text-primary-blue uppercase tracking-widest">VEURE DETALL</span>
                  <div className="w-12 h-12 rounded-full bg-bg-light flex items-center justify-center text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-all duration-300 shadow-sm">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* BALANCED 1:1 MODAL DETAIL (MAINTAINED AS REQUESTED) */}
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
                  maxWidth: '52rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '3rem',
                  boxShadow: '0 60px 180px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth > 991 ? '1.4fr 1fr' : '1fr',
                  maxHeight: '90vh',
                  zIndex: 100
                }}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={closeModal}
                  style={{
                    position: 'absolute', top: '1.5rem', left: '1.5rem',
                    width: '3.5rem', height: '3.5rem',
                    borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#3c3c3b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', zIndex: 100,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                >
                  <X size={24} />
                </button>

                <div className="h-64 lg:h-full relative overflow-hidden bg-bg-dark">
                   <img src={selectedType.image} alt={selectedType.title} className="w-full h-full object-cover block" />
                   <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <div className="p-8 lg:p-14 overflow-y-auto bg-white flex flex-col items-start text-left scrollbar-hide border-l border-gray-50">
                  <div className="mb-10">
                    <span className="text-primary-blue font-black uppercase tracking-widest text-[10px] block mb-3 italic">{selectedType.scientificName}</span>
                    <h2 className="text-4xl lg:text-5xl font-black text-secondary-gray mb-8 leading-[0.8] tracking-tighter uppercase">{selectedType.title}</h2>
                    <div className="h-1.5 w-16 bg-primary-blue rounded-full" />
                  </div>

                  <p className="text-xl text-secondary-gray font-medium opacity-80 leading-relaxed mb-14 text-left italic">
                    {selectedType.fullDesc}
                  </p>

                  <div className="grid grid-cols-1 gap-6 mb-14 w-full">
                    <div className="p-6 bg-blue-50/40 rounded-[2.5rem] border border-blue-100 flex flex-col items-start gap-3">
                       <div className="flex items-center gap-3">
                          <div className="p-3 bg-white rounded-2xl shadow-sm text-primary-primary-blue">
                            <Home size={22} />
                          </div>
                          <h4 className="text-[11px] font-black uppercase text-primary-primary-blue tracking-widest">{t('species.habitat')}</h4>
                       </div>
                       <p className="text-lg text-secondary-gray font-black tracking-tight uppercase leading-tight">{selectedType.habitat}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 items-center border-t border-gray-100 pt-10 mt-auto w-full">
                    <a 
                      href="#contacto" 
                      onClick={closeModal} 
                      className="btn btn-primary px-16 py-6 text-2xl font-black w-full text-center shadow-[0_20px_60px_-10px_rgba(52,211,153,0.3)] bg-emerald-500 hover:bg-emerald-600 !border-none"
                      style={{ backgroundColor: '#34d399' }}
                    >
                      URGÈNCIA 24H
                    </a>
                    
                    <div className="flex w-full gap-4">
                      <a href="tel:900123456" className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-secondary-gray/5 text-secondary-gray font-black uppercase text-xs tracking-widest border border-gray-100 hover:bg-gray-100 transition-colors">
                        <Phone size={20} /> TRUCAR
                      </a>
                      <a href="https://wa.me/34600000000" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 text-emerald-600 font-black uppercase text-xs tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-colors">
                        <MessageCircle size={20} /> CHAT
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
