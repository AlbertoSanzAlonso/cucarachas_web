import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';

const SectorModal = ({ sector, isOpen, onClose, setImageLoaded }) => {
  const { t } = useTranslation();
  
  if (!sector) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
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
            className="relative w-full max-w-4xl bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto max-h-[92vh] md:max-h-[90vh] z-[210] transform-gpu"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 md:top-6 md:right-6 z-[220] p-2 md:p-3 bg-white/90 backdrop-blur-md hover:bg-white rounded-full transition-colors shadow-lg"
            >
              <X size={20} className="text-primary-gray md:w-6 md:h-6" />
            </button>

            {/* Sidebar / Image Area */}
            <div className="md:w-1/3 h-40 md:h-auto relative overflow-hidden flex flex-col items-center justify-center bg-white">
              <img 
                 src={sector.bg} 
                 alt={sector.name} 
                 onLoad={() => setImageLoaded(true)}
                 className="absolute -inset-y-1 inset-x-0 w-full h-[calc(100%+8px)] object-cover"
              />
              <div className="absolute inset-0 bg-primary-blue/60 z-10"></div>
              
              <div className="relative z-20 flex flex-col items-center">
                <div className="w-20 h-20 md:w-32 md:h-32 rounded-3xl bg-white/10 backdrop-blur-lg shadow-2xl flex items-center justify-center text-white mb-4">
                   {React.cloneElement(sector.icon, { size: 32, strokeWidth: 1.5 })}
                </div>
                <div className="text-center space-y-1">
                   <p className="text-[8px] md:text-[10px] uppercase font-black tracking-[0.3em] text-accent-green">{t('service_detail_page.authorized_label')}</p>
                   <p className="text-white/60 text-[8px] md:text-[10px] font-medium tracking-widest italic">{sector.name}</p>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="md:w-2/3 flex flex-col overflow-y-auto bg-white">
              <div className="my-auto p-4 md:p-12 flex flex-col space-y-3 md:space-y-8">
                <div className="space-y-2 md:space-y-4">
                  <h3 className="text-2xl md:text-5xl font-black text-primary-blue tracking-tighter leading-none pt-1">
                    {sector.name}
                  </h3>
                  <div className="w-16 h-1.5 bg-accent-green rounded-full"></div>
                  <p className="text-xs md:text-lg text-secondary-gray/80 leading-relaxed font-light italic">
                    "{sector.desc}"
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[9px] uppercase font-bold tracking-[0.2em] text-primary-blue/30">{t('service_detail_page.technical_protocol')}</h4>
                  <ul className="grid grid-cols-1 gap-2 md:gap-4">
                    {sector.points?.map((point, idx) => (
                      <motion.li 
                        initial={window.innerWidth < 768 ? { opacity: 1 } : { opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={window.innerWidth < 768 ? { duration: 0 } : { delay: idx * 0.02 }}
                        key={idx} 
                        className="flex items-start space-x-3"
                      >
                         <div className="mt-1 flex-shrink-0 text-accent-green">
                           <ShieldCheck size={16} />
                         </div>
                         <span className="text-[11px] md:text-lg text-secondary-gray font-bold tracking-tight">{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 md:pt-8 flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="primary"
                    className="flex-[1.5] py-3 md:py-4 text-sm md:text-xl rounded-xl md:rounded-2xl shadow-xl group px-4 text-center leading-tight"
                  >
                    <Zap className="mr-2 text-accent-green fill-accent-green/20 group-hover:rotate-12 transition-transform shrink-0 w-5 h-5 md:w-6 md:h-6" />
                    <span>{t('common.cta_free')}</span>
                  </Button>
                  <a 
                    href="tel:+34933309169"
                    className="flex-1 py-3 md:py-4 bg-bg-light border border-gray-200 text-primary-blue font-black text-sm md:text-xl rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors px-4 text-center leading-tight shadow-sm active:scale-95 transition-all"
                  >
                    {t('common.cta_call')}
                  </a>
                </div>

                {/* Saber más link for SEO */}
                <div className="flex justify-center pt-2">
                   <Link 
                     to={`/serveis/${sector.id}`}
                     className="text-[10px] md:text-xs font-black uppercase tracking-widest text-primary-blue/40 hover:text-accent-green transition-colors flex items-center group/link p-2"
                   >
                     {t('common.know_more')}
                     <ChevronRight size={14} className="ml-1 transform group-hover/link:translate-x-1 transition-transform" />
                   </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SectorModal;
