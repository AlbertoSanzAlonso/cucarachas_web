import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Utensils, Hotel, Users, Factory, ChevronRight, X, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const SectorGrid = () => {
  const { t } = useTranslation();
  const [selectedSector, setSelectedSector] = useState(null);
 
  React.useEffect(() => {
    if (selectedSector) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedSector]);

  const sectors = [
    { 
      id: 'horeca', 
      name: t('sectors_grid.horeca'), 
      icon: <Utensils />,
      desc: t('sectors_grid.horeca_desc'),
      points: t('sectors_grid.horeca_points', { returnObjects: true }),
      bg: '/assets/taula-de-cuina-amb-granit-endoftext-.webp'
    },
    { 
      id: 'hotels', 
      name: t('sectors_grid.hotels'), 
      icon: <Hotel />,
      desc: t('sectors_grid.hotels_desc'),
      points: t('sectors_grid.hotels_points', { returnObjects: true }),
      bg: '/assets/hotel-bg.webp'
    },
    { 
      id: 'comms', 
      name: t('sectors_grid.comms'), 
      icon: <Users />,
      desc: t('sectors_grid.comms_desc'),
      points: t('sectors_grid.comms_points', { returnObjects: true }),
      bg: '/assets/hogar-protegido-libre-de-cucarachas.webp'
    },
    { 
      id: 'industry', 
      name: t('sectors_grid.industry'), 
      icon: <Factory />,
      desc: t('sectors_grid.industry_desc'),
      points: t('sectors_grid.industry_points', { returnObjects: true }),
      bg: '/assets/industry-bg.webp'
    }
  ];

  return (
    <section className="py-32 md:py-40 bg-white" id="sectors">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
        
        <div className="max-w-3xl mx-auto space-y-4">
           <h2 className="text-3xl md:text-5xl font-black text-primary-blue tracking-tight uppercase">
             <span className="inline-block border-b-[8px] md:border-b-[16px] border-accent-green/80 leading-tight pb-1 md:pb-2">
               {t('sectors_grid.title')}
             </span>
           </h2>
           <p className="text-secondary-gray/80 text-lg font-light pt-8">
             {t('sectors_grid.desc')}
           </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           {sectors.map((sector, i) => (
             <div 
               key={sector.id} 
               onClick={() => setSelectedSector(sector)}
               className="group p-10 bg-bg-light rounded-[2.5rem] border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:translate-y-[-10px] cursor-pointer relative overflow-hidden"
             >
                {/* Background Image Watermark */}
                <div className="absolute inset-0 opacity-[0.15] group-hover:opacity-[0.25] transition-opacity duration-500 z-0">
                   <img 
                     src={sector.bg} 
                     alt="" 
                     className="w-full h-full object-cover"
                   />
                </div>

                {/* Content Container to ensure stacking over background */}
                <div className="relative z-10 w-full h-full flex flex-col items-center">
                  {/* Visual Icon with colored circle */}
                  <div className="mb-10 mx-auto w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                     <div className="text-primary-blue group-hover:text-accent-green transition-colors duration-500">
                        {React.cloneElement(sector.icon, { size: 40, strokeWidth: 1.5 })}
                     </div>
                  </div>

                  <div className="space-y-4 text-center">
                     <h3 className="text-primary-blue font-black text-xl tracking-tighter group-hover:text-accent-green transition-colors">
                       {sector.name}
                     </h3>
                     <div className="inline-flex items-center text-[10px] uppercase font-bold tracking-widest text-secondary-gray/40">
                        {t('sectors_grid.cta')} <ChevronRight size={14} className="ml-1" />
                     </div>
                  </div>
                </div>

                {/* Decorative Pattern background */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none z-0">
                   <span className="absolute -bottom-10 -right-10 transform scale-[3] text-primary-blue">
                     {sector.icon}
                   </span>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Sector Detail Modal */}
      <AnimatePresence>
        {selectedSector && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSector(null)}
              className="absolute inset-0 bg-slate-900/90 md:bg-primary-blue/40 md:backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ scale: 1, opacity: 0, y: 60 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1, opacity: 0, y: 60 }}
              className="relative w-full max-w-4xl bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto max-h-[92vh] md:max-h-[90vh] z-[210] transform-gpu"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <button 
                onClick={() => setSelectedSector(null)}
                className="absolute top-4 right-4 z-40 p-2 bg-white/90 rounded-full shadow-lg hover:bg-bg-light transition-colors"
              >
                <X size={20} className="text-primary-blue" />
              </button>
 
              {/* Sidebar / Image Area */}
              <div className="md:w-1/3 min-h-[160px] md:min-h-full relative overflow-hidden flex flex-col items-center justify-center">
                <img 
                   src={selectedSector.bg} 
                   alt={selectedSector.name} 
                   className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary-blue/60"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 md:w-32 md:h-32 rounded-3xl bg-white/10 backdrop-blur-lg shadow-2xl flex items-center justify-center text-white mb-4">
                     {React.cloneElement(selectedSector.icon, { size: 32, strokeWidth: 1.5 })}
                  </div>
                  <div className="text-center space-y-1">
                     <p className="text-[8px] md:text-[10px] uppercase font-black tracking-[0.3em] text-accent-green">Sector Autorizado</p>
                     <p className="text-white/60 text-[8px] md:text-[10px] font-medium tracking-widest italic">{selectedSector.name}</p>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="md:w-2/3 p-6 md:p-12 flex flex-col justify-center space-y-4 md:space-y-8 overflow-y-auto bg-white">
                <div className="space-y-2 md:space-y-4">
                  <h3 className="text-2xl md:text-5xl font-black text-primary-blue tracking-tighter leading-[0.9]">
                    {selectedSector.name}
                  </h3>
                  <div className="w-16 h-1.5 bg-accent-green rounded-full"></div>
                  <p className="text-xs md:text-lg text-secondary-gray/80 leading-relaxed font-light italic">
                    "{selectedSector.desc}"
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[9px] uppercase font-bold tracking-[0.2em] text-primary-blue/30">Protocolos del Plan Sanitario</h4>
                  <ul className="grid grid-cols-1 gap-2 md:gap-4">
                    {selectedSector.points?.map((point, idx) => (
                      <motion.li 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
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
                  <button 
                    className="flex-[1.5] py-3 md:py-4 bg-primary-blue text-white font-black text-sm md:text-xl rounded-xl md:rounded-2xl shadow-xl hover:translate-y-[-4px] transition-all flex items-center justify-center group px-4 text-center leading-tight"
                  >
                    <Zap className="mr-2 text-accent-green fill-accent-green/20 group-hover:rotate-12 transition-transform shrink-0 w-5 h-5 md:w-6 md:h-6" />
                    <span>{t('common.cta_free')}</span>
                  </button>
                  <a 
                    href="tel:+34933309169"
                    className="flex-1 py-3 md:py-4 bg-bg-light border border-gray-200 text-primary-blue font-black text-sm md:text-xl rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors px-4 text-center leading-tight"
                  >
                    {t('common.cta_call')}
                  </a>
                </div>

                {/* Saber más link for SEO */}
                <div className="flex justify-center pt-2">
                   <Link 
                     to={`/serveis/${selectedSector.id}`}
                     className="text-[10px] md:text-xs font-black uppercase tracking-widest text-primary-blue/40 hover:text-accent-green transition-colors flex items-center group/link p-2"
                   >
                     {t('common.know_more')}
                     <ChevronRight size={14} className="ml-1 transform group-hover/link:translate-x-1 transition-transform" />
                   </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default SectorGrid;
