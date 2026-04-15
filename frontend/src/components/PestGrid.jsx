import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bug, Droplets, ShieldAlert, Zap, Search, Fingerprint, Ban, Activity, X, ShieldCheck, Thermometer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PestGrid = () => {
  const { t } = useTranslation();
  const [selectedPest, setSelectedPest] = useState(null);

  const species = [
    { 
      id: 'germanic', 
      name: t('species.germanica'), 
      scientific: 'Blattella germanica',
      icon: <Bug />, 
      color: 'var(--color-primary-blue)', 
      image: '/assets/cucaracha-alemana-nobg.png',
      imageScale: 1.35,
      desc: t('species.germanica_desc'),
      details: t('species.germanica_details', { returnObjects: true })
    },
    { 
      id: 'american', 
      name: t('species.americana'), 
      scientific: 'Periplaneta americana',
      icon: <Bug />, 
      color: 'var(--color-accent-green)', 
      image: '/assets/cucaracha-americana-nobg.png',
      desc: t('species.americana_desc'),
      details: t('species.americana_details', { returnObjects: true })
    },
    { 
      id: 'oriental', 
      name: t('species.orientalis'), 
      scientific: 'Blatta orientalis',
      icon: <Bug />, 
      color: '#ffffff', 
      image: '/assets/cucaracha-oriental-nobg.png',
      desc: t('species.orientalis_desc'),
      darkText: true,
      details: t('species.orientalis_details', { returnObjects: true })
    },
    { 
      id: 'banded', 
      name: t('species.banded'), 
      scientific: 'Supella longipalpa',
      icon: <Bug />, 
      color: '#111827', 
      image: '/assets/cucaracha-bandancafe-white-removebg-preview.png',
      imageScale: 1,
      desc: t('species.banded_desc'),
      details: t('species.banded_details', { returnObjects: true })
    },
    { id: 'disinfect', name: t('species.monitor'), icon: <Activity />, color: 'var(--color-primary-blue)', desc: 'Seguimiento preventivo con feromonas.' },
    { id: 'nests', name: t('species.zap'), icon: <Zap />, color: 'var(--color-accent-green)', desc: 'Localización precisa y eliminación de nidos.' },
    { id: 'prevent', name: t('species.barrier'), icon: <ShieldAlert />, color: '#ffffff', desc: 'Tratamientos residuales de larga duración.', darkText: true },
    { id: 'urgent', name: t('species.thermal'), icon: <Thermometer />, color: '#111827', desc: 'Eliminación ecológica por calor sin químicos.' }
  ];

  return (
    <section className="py-24 bg-bg-light relative overflow-hidden" id="species">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-16 relative z-10">
        
        <div className="max-w-3xl mx-auto space-y-4">
           <h2 className="text-4xl md:text-5xl font-black text-primary-gray tracking-tighter uppercase">
             {t('species.title')}
           </h2>
           <div className="w-24 h-1.5 bg-accent-green mx-auto rounded-full"></div>
           <p className="text-secondary-gray/80 text-lg font-light pt-4 italic">
             Identificación precisa y protocolos de eliminación radical por especie.
           </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
           {species.map((pest, i) => (
             <motion.div 
               key={pest.id} 
               onClick={() => pest.image && setSelectedPest(pest)}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               viewport={{ once: true }}
               className={`group relative overflow-hidden rounded-[2rem] md:rounded-[3rem] aspect-square flex flex-col items-center justify-between p-4 md:p-10 transition-all duration-500 hover:shadow-[0_25px_60px_-15px_rgba(0,128,187,0.3)] hover:translate-y-[-8px] cursor-pointer ${pest.darkText ? 'border border-primary-gray/10 bg-white' : ''}`}
               style={{ background: pest.color }}
             >
                 {/* Corner Search Icon */}
                 <div className="absolute top-6 right-6 opacity-30 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                    <Search size={24} className={pest.darkText ? 'text-primary-blue' : 'text-white/80'} strokeWidth={3} />
                 </div>

                 {/* Main Icon */}
                 <div className={`mt-6 md:mt-8 transform transition-transform duration-500 group-hover:scale-110 drop-shadow-lg ${pest.darkText ? 'text-primary-blue' : 'text-white'} w-10 h-10 md:w-14 md:h-14`}>
                    {React.cloneElement(pest.icon, { 
                      size: '100%', 
                      strokeWidth: 2 
                    })}
                 </div>

                <div className="text-center space-y-3 md:space-y-6 relative z-10 w-full px-2">
                   <h3 className={`font-extrabold text-[12px] md:text-xl tracking-tight leading-tight break-words hyphens-auto ${pest.darkText ? 'text-primary-blue' : 'text-white'}`} style={{ hyphens: 'auto' }}>
                     {pest.name}
                     {pest.scientific && (
                       <span className="block text-[8px] md:text-xs font-medium opacity-60 mt-0.5 uppercase tracking-wider">
                         ({pest.scientific})
                       </span>
                     )}
                   </h3>
                   
                   <div className="flex justify-center pt-2">
                     <span className={`text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-300 group-hover:scale-110 ${pest.darkText ? 'text-primary-blue/60' : 'text-white/70'}`}>
                       VER TRATAMIENTO
                     </span>
                   </div>
                </div>

                {/* Background Watermark Icon */}
                <div className={`absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-all duration-700 rotate-12 scale-150 ${pest.darkText ? 'text-primary-blue' : 'text-white'}`}>
                   {React.cloneElement(pest.icon, { size: 140 })}
                </div>

                {/* Hover Description Overlay (Floating Glass Style) */}
                <div className="absolute inset-x-4 bottom-4 glass p-4 rounded-xl opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 z-10 pointer-events-none">
                   <p className="text-[10px] font-bold text-primary-gray leading-tight text-center">
                     {pest.desc}
                   </p>
                </div>
             </motion.div>
           ))}
        </div>
      </div>

      {/* Species Detail Modal */}
      <AnimatePresence>
        {selectedPest && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPest(null)}
              className="absolute inset-0 bg-primary-blue/40 backdrop-blur-xl"
            />
            
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                className="relative w-full max-w-5xl bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto max-h-[85vh] md:max-h-[90vh] z-[210]"
              >
                {/* Close Button - Fixed relative to modal top */}
                <button 
                  onClick={() => setSelectedPest(null)}
                  className="absolute top-3 right-3 md:top-6 md:right-6 z-[220] p-2 md:p-3 bg-white/90 backdrop-blur-md hover:bg-white rounded-full transition-colors shadow-lg border border-gray-100"
                >
                  <X size={20} className="text-primary-gray md:w-6 md:h-6" />
                </button>

                {/* Sidebar / Image area */}
                <div className="md:w-1/2 bg-white p-6 md:p-16 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-gray-100 min-h-[200px] md:min-h-[300px]">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20px_20px,var(--color-primary-blue)_1px,transparent_0)] bg-[length:40px_40px]"></div>
                  </div>
                  
                  <motion.img 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: selectedPest.imageScale || 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    src={selectedPest.image} 
                    alt={selectedPest.name} 
                    className="w-full max-w-[240px] md:max-w-[400px] h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative z-10"
                  />
                  
                  <div className="mt-4 md:mt-8 text-center space-y-1 relative z-10">
                     <p className="text-[8px] md:text-[10px] uppercase font-bold tracking-[0.3em] text-accent-green">Certificado Entomológico</p>
                     <p className="text-secondary-gray/40 text-[10px] md:text-xs italic">{selectedPest.scientific}</p>
                  </div>
                </div>

                {/* Content area */}
                <div className="md:w-1/2 p-6 md:p-16 flex flex-col justify-center space-y-6 md:space-y-8 overflow-y-auto">
                  <div className="space-y-3 md:space-y-4">
                     <h3 className="text-3xl md:text-5xl font-black text-primary-gray tracking-tighter leading-[0.9]">
                       {selectedPest.name}
                     </h3>
                     <div className="w-20 h-1.5 bg-accent-green rounded-full"></div>
                     <p className="text-sm md:text-lg text-secondary-gray/80 leading-relaxed font-light italic">
                       "{selectedPest.desc}"
                     </p>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                     <h4 className="text-[8px] md:text-[10px] uppercase font-bold tracking-[0.2em] text-primary-gray/40">Protocolo de Actuación</h4>
                     <ul className="space-y-3 md:space-y-4">
                        {selectedPest.details?.map((detail, idx) => (
                          <motion.li 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + (idx * 0.1) }}
                            key={idx} 
                            className="flex items-start space-x-3"
                          >
                             <div className="mt-1 flex-shrink-0 text-accent-green">
                                <ShieldCheck size={18} className="md:w-5 md:h-5" />
                             </div>
                             <span className="text-xs md:text-base text-secondary-gray font-medium leading-tight">{detail}</span>
                          </motion.li>
                        ))}
                     </ul>
                  </div>

                  <div className="pt-4 md:pt-6 space-y-3 md:space-y-4">
                     <button className="w-full py-4 md:py-6 rounded-2xl bg-primary-blue text-white font-black text-base md:text-lg tracking-widest shadow-xl hover:shadow-primary-blue/20 transition-all flex items-center justify-center group active:scale-95">
                        SOLICITAR TRATAMIENTO
                        <Zap size={18} className="ml-2 md:ml-3 text-accent-green md:w-5 md:h-5" />
                     </button>
                     <p className="text-center text-[8px] md:text-[10px] font-bold text-secondary-gray/30 tracking-widest uppercase">
                       Disponibilidad 24h · Respuesta Técnica
                     </p>
                  </div>
                </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PestGrid;
