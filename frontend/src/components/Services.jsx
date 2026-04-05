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
    <section id="servicios" className="bg-bg-light py-24 lg:py-36 relative">
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
                <img src={type.image} alt={type.title} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-transform duration-1000 group-hover:scale-110" />
              </div>
              <div className="flex flex-col flex-1 pl-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-blue/60 mb-2 italic">{type.scientificName}</span>
                <h3 className="text-2xl font-black text-secondary-gray mb-4 uppercase tracking-tighter leading-none group-hover:text-primary-blue transition-colors">{type.title}</h3>
                <p className="text-text-muted mb-8 text-sm leading-relaxed font-medium opacity-80">{type.shortDesc}</p>
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

      {/* PORTAL-BASED FLOATING MODAL WITH TRANSITIONS & CTAs */}
      {isClient && createPortal(
        <AnimatePresence>
          {selectedType && (
            <motion.div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000000,
                padding: '2rem'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="modal-portal"
            >
              {/* Backdrop - Softened density with elegant blur */}
              <motion.div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.75)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  cursor: 'zoom-out'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal} 
              />
              
              {/* Modal Card - Side-by-Side with Spring Entrance */}
              <motion.div 
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '60rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '2.5rem',
                  boxShadow: '0 60px 180px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: window.innerWidth > 1024 ? 'row' : 'column',
                  maxHeight: '90vh',
                  zIndex: 100
                }}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.1 }}
                onClick={e => e.stopPropagation()}
              >
                {/* Close Button */}
                <button 
                  onClick={closeModal}
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    width: '3.5rem',
                    height: '3.5rem',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(60,60,59,0.05)',
                    color: '#3c3c3b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    zIndex: 100,
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.9)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(60,60,59,0.05)'}
                  onMouseDown={(e) => e.currentTarget.style.scale = '0.9'}
                  onMouseUp={(e) => e.currentTarget.style.scale = '1'}
                >
                  <X size={24} />
                </button>

                {/* Side A: Imagery */}
                <div className="lg:w-1/2 h-56 lg:h-auto relative bg-secondary-gray/5 shrink-0 overflow-hidden">
                   <img src={selectedType.image} alt={selectedType.title} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r" />
                </div>

                {/* Side B: Content */}
                <div className="lg:w-1/2 p-10 lg:p-14 overflow-y-auto bg-white flex flex-col items-start text-left scrollbar-hide">
                  <div className="mb-8">
                    <span className="text-primary-blue/60 font-black uppercase tracking-widest text-[10px] block mb-3 italic">{selectedType.scientificName}</span>
                    <h2 className="text-3xl lg:text-5xl font-black text-secondary-gray mb-5 leading-[0.8] tracking-tighter uppercase">{selectedType.title}</h2>
                    <div className="h-1.5 w-16 bg-primary-blue rounded-full" />
                  </div>

                  <p className="text-xl text-secondary-gray font-medium opacity-80 leading-relaxed mb-12">
                    {selectedType.fullDesc}
                  </p>

                  {/* High Performance Indicators */}
                  <div className="grid grid-cols-1 gap-6 mb-12 w-full">
                    <div className="p-6 bg-blue-50/40 rounded-[2.5rem] border border-blue-100/50 flex flex-col items-start gap-2">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl shadow-sm text-primary-blue">
                            <Home size={20} />
                          </div>
                          <h4 className="text-[10px] font-black uppercase text-primary-blue tracking-widest">{t('species.habitat')}</h4>
                       </div>
                       <p className="text-base text-secondary-gray font-black tracking-tight uppercase leading-tight">{selectedType.habitat}</p>
                    </div>
                  </div>

                  {/* Interaction Power CTAs */}
                  <div className="flex flex-col gap-6 items-center border-t border-gray-100 pt-10 mt-auto w-full">
                    <a 
                      href="#contacto" 
                      onClick={closeModal} 
                      className="btn btn-primary px-16 py-5 text-xl font-black w-full text-center shadow-[0_20px_60px_-10px_rgba(52,211,153,0.5)] bg-emerald-500 hover:bg-emerald-600 !border-none"
                      style={{ backgroundColor: '#34d399' }}
                    >
                      SOL·LICITAR TRACTAMENT URGENT
                    </a>
                    
                    <div className="flex w-full gap-4">
                      <a 
                        href="tel:900123456" 
                        className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-primary-blue/5 text-primary-blue font-black uppercase text-xs border border-primary-blue/10 hover:bg-primary-blue/10 transition-colors"
                      >
                        <Phone size={18} /> {t('hero.cta_call')}
                      </a>
                      <a 
                        href="https://wa.me/34600000000" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-emerald-50 text-emerald-600 font-black uppercase text-xs border border-emerald-100 hover:bg-emerald-100 transition-colors"
                      >
                        <MessageCircle size={18} /> WHATSAPP
                      </a>
                    </div>

                    <div className="flex items-center gap-3 opacity-60">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]" />
                      <span className="text-[11px] font-black text-secondary-gray uppercase tracking-widest italic">RESPOSTA EN 24H</span>
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
