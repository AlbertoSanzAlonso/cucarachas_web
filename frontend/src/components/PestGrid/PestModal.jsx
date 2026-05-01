import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Zap, Eye, ZoomIn, ZoomOut } from 'lucide-react';

const PestModal = ({ pest, onClose, t }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (pest) {
      document.body.style.overflow = 'hidden';
      setIsRevealed(false);
      setIsZoomed(false);
      setImageLoaded(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [pest]);

  if (!pest) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 overflow-hidden [@media(max-height:600px)_and_(orientation:landscape)]:p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/90 md:bg-primary-blue/40 md:backdrop-blur-xl"
        />

        <motion.div
          initial={window.innerWidth < 768 ? { opacity: 0, y: 20 } : { scale: 1, opacity: 0, y: 60 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={window.innerWidth < 768 ? { opacity: 0, y: 20 } : { scale: 1, opacity: 0, y: 60 }}
          transition={window.innerWidth < 768 ? { duration: 0.2 } : { type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-5xl bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto max-h-[85vh] md:max-h-[90vh] z-[210] transform-gpu ${pest.scientific ? '[@media(max-height:600px)_and_(orientation:landscape)]:flex-row' : ''} [@media(max-height:600px)_and_(orientation:landscape)]:rounded-none [@media(max-height:600px)_and_(orientation:landscape)]:max-w-none [@media(max-height:600px)_and_(orientation:landscape)]:h-full [@media(max-height:600px)_and_(orientation:landscape)]:max-h-none`}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 md:top-6 md:right-6 z-[220] p-2 md:p-3 bg-white/90 backdrop-blur-md hover:bg-white rounded-full transition-colors shadow-lg"
          >
            <X size={20} className="text-primary-gray md:w-6 md:h-6" />
          </button>

          {/* Sidebar / Image area */}
          <div className={`md:w-1/2 relative overflow-hidden flex flex-col ${['nests', 'prevent', 'urgent'].includes(pest.id) ? 'h-40 md:h-auto' : 'bg-white pt-6 pb-4'} ${pest.scientific ? '[@media(max-height:600px)_and_(orientation:landscape)]:w-1/2' : '[@media(max-height:600px)_and_(orientation:landscape)]:hidden'}`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20px_20px,var(--color-primary-blue)_1px,transparent_0)] bg-[length:40px_40px]"></div>
            </div>

            {/* Main Content (Image) with Reveal/Zoom Logic */}
            <div 
              className={`relative flex-1 flex items-center justify-center overflow-hidden cursor-pointer group/reveal ${['nests', 'prevent', 'urgent'].includes(pest.id) ? 'h-full w-full' : 'p-6 md:p-16'}`}
              onClick={() => {
                if (pest.scientific) {
                  if (!isRevealed) {
                    setIsRevealed(true);
                  } else {
                    setIsZoomed(!isZoomed);
                  }
                }
              }}
            >
              <motion.img
                src={pest.image}
                alt={pest.name}
                onLoad={() => setImageLoaded(true)}
                initial={{ scale: pest.imageScale || 1, x: 0, y: 0, filter: 'blur(30px)' }}
                animate={{ 
                  filter: (pest.scientific && !isRevealed) ? 'blur(30px)' : 'blur(0px)',
                  scale: isZoomed ? (pest.zoomScale || 2.5) : (pest.imageScale || 1),
                  x: isZoomed ? (window.innerWidth < 768 ? (pest.mobileZoomX || 0) : (pest.zoomX || 0)) : 0,
                  y: isZoomed ? (window.innerWidth < 768 ? (pest.mobileZoomY || 0) : 0) : 0
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`${['nests', 'prevent', 'urgent'].includes(pest.id) ? 'absolute inset-0 w-full h-full object-cover z-0' : 'w-full max-w-[120px] md:max-w-[400px] h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative z-10'}`}
              />
              
              {/* Sensitivity Overlay */}
              {pest.scientific && !isRevealed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm"
                >
                   <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary-blue text-white flex items-center justify-center shadow-2xl mb-4 animate-bounce">
                      <Eye size={32} />
                   </div>
                   <div className="bg-white/90 px-4 py-2 rounded-full border border-primary-blue/20 shadow-xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary-blue">
                         {t('species_detail.reveal_image')}
                      </p>
                   </div>
                </motion.div>
              )}

              {/* Zoom Action Overlay */}
              {pest.scientific && isRevealed && (
                <div className="absolute top-4 left-4 z-30 opacity-0 group-hover/reveal:opacity-100 transition-opacity">
                   <div className="bg-white/80 backdrop-blur-md p-2 rounded-xl text-primary-blue border border-primary-blue/10 shadow-lg flex items-center space-x-2">
                      {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                      <span className="text-[8px] font-black uppercase tracking-widest mr-2">{isZoomed ? t('species_detail.zoom_out') : t('species_detail.zoom_in')}</span>
                   </div>
                </div>
              )}

              {/* Label Overlay */}
              <div className={`absolute bottom-4 left-0 w-full flex justify-center z-20 transition-opacity ${isZoomed ? 'opacity-0' : 'opacity-100'}`}>
                <div className={`${['nests', 'prevent', 'urgent'].includes(pest.id) ? 'bg-primary-blue/60 backdrop-blur-md text-white' : 'text-accent-green bg-white/80 shadow-sm'} px-4 py-1.5 rounded-full`}>
                  <p className="text-[8px] md:text-[10px] uppercase font-bold tracking-[0.3em] leading-none">
                    {t('species_detail.modal_certified')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className={`md:w-1/2 flex flex-col overflow-y-auto ${pest.scientific ? '[@media(max-height:600px)_and_(orientation:landscape)]:w-1/2' : '[@media(max-height:600px)_and_(orientation:landscape)]:w-full'}`}>
            <div className={`my-auto p-5 md:p-16 flex flex-col space-y-3 md:space-y-8 ${!pest.scientific ? '[@media(max-height:600px)_and_(orientation:landscape)]:flex-row [@media(max-height:600px)_and_(orientation:landscape)]:space-y-0 [@media(max-height:600px)_and_(orientation:landscape)]:space-x-6 [@media(max-height:600px)_and_(orientation:landscape)]:p-6' : '[@media(max-height:600px)_and_(orientation:landscape)]:p-4 [@media(max-height:600px)_and_(orientation:landscape)]:space-y-2'}`}>
              {/* Left Column for non-species landscape */}
              <div className={!pest.scientific ? 'space-y-1 md:space-y-4 [@media(max-height:600px)_and_(orientation:landscape)]:w-1/2 [@media(max-height:600px)_and_(orientation:landscape)]:flex [@media(max-height:600px)_and_(orientation:landscape)]:flex-col [@media(max-height:600px)_and_(orientation:landscape)]:justify-center' : 'space-y-1 md:space-y-4'}>
                <h3 className="text-2xl md:text-5xl font-black text-primary-gray tracking-tighter leading-none pt-1">
                  {pest.name}
                </h3>
                <div className="w-12 md:w-16 h-1 bg-accent-green rounded-full"></div>
                <p className="text-[11px] md:text-lg text-secondary-gray/80 leading-relaxed font-light italic">
                  "{pest.desc}"
                </p>
              </div>

              {/* Right Column for non-species landscape */}
              <div className={!pest.scientific ? 'flex flex-col [@media(max-height:600px)_and_(orientation:landscape)]:w-1/2 [@media(max-height:600px)_and_(orientation:landscape)]:justify-between' : 'space-y-2 md:space-y-6'}>
                <div className={!pest.scientific ? 'space-y-2 md:space-y-6 [@media(max-height:600px)_and_(orientation:landscape)]:pt-0' : 'space-y-2 md:space-y-6'}>
                <h4 className="text-[7px] md:text-[10px] uppercase font-bold tracking-[0.2em] text-primary-gray/40">
                  {t('species_detail.modal_protocol')}
                </h4>
                <ul className="space-y-1.5 md:space-y-4">
                  {pest.details?.map((detail, idx) => (
                    <motion.li
                      initial={window.innerWidth < 768 ? { opacity: 1 } : { opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={window.innerWidth < 768 ? { duration: 0 } : { delay: 0.1 + (idx * 0.02) }}
                      key={idx}
                      className="flex items-start space-x-3"
                    >
                      <div className="mt-0.5 flex-shrink-0 text-accent-green">
                        <ShieldCheck size={16} className="md:w-5 md:h-5" />
                      </div>
                      <span className="text-[10px] md:text-base text-secondary-gray font-medium leading-tight">{detail}</span>
                    </motion.li>
                  ))}
                </ul>
                </div>

                {/* Modal CTA */}
                <div className={`pt-2 md:pt-8 ${!pest.scientific ? '[@media(max-height:600px)_and_(orientation:landscape)]:pt-4' : ''}`}>
                  <button
                    onClick={() => {
                      onClose();
                      setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 300);
                    }}
                    className={`w-full py-4 px-6 md:px-8 rounded-xl md:rounded-2xl text-white font-black text-xs md:text-lg shadow-[0_20px_50px_rgba(0,128,187,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-tighter flex items-center justify-center space-x-3 md:space-x-4 group ${pest.scientific ? '[@media(max-height:600px)_and_(orientation:landscape)]:py-2 [@media(max-height:600px)_and_(orientation:landscape)]:mt-2' : ''}`}
                    style={{ background: 'var(--color-primary-blue)' }}
                  >
                    <Zap className="w-5 h-5 md:w-8 md:h-8 text-accent-green fill-accent-green/20 group-hover:rotate-12 transition-transform shrink-0" />
                    <span className="leading-tight truncate">
                      {t('common.cta_free')}
                    </span>
                  </button>
                  <div className={`hidden md:flex justify-center items-center space-x-4 mt-6 ${pest.scientific ? '[@media(max-height:600px)_and_(orientation:landscape)]:hidden' : ''}`}>
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                          <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Expert" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[10px] text-primary-gray/40 font-bold uppercase tracking-widest leading-none">
                        {t('species_detail.modal_tech_available')}
                      </p>
                      <p className="text-[10px] text-accent-green font-black uppercase tracking-widest">
                        {t('species_detail.modal_status_available')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PestModal;
