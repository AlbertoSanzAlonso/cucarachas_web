import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Zap, ArrowRight, Bug } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Hero = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    "/assets/tecnico-identificando-foco-cucarachas.webp",
    "/assets/especialista-sanitario-cecsa-barcelona.webp",
    "/assets/hogar-protegido-libre-de-cucarachas.webp"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full pt-28 md:pt-32 pb-12 overflow-hidden flex justify-center">
      {/* Contained Floating Hero Box - No touching edges */}
      <div 
        className="relative min-h-[500px] md:min-h-[600px] xl:min-h-[75vh] w-[92%] md:w-[94%] max-w-[1700px] flex items-center rounded-[3rem] md:rounded-[5rem] shadow-2xl overflow-hidden group"
        style={{ 
          background: 'linear-gradient(135deg, var(--color-primary-blue) 0%, var(--color-primary-blue-hv) 60%, #004d70 100%)'
        }}
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute inset-0 pointer-events-none select-none overflow-hidden"
        >
          {[...Array(20)].map((_, i) => {
            const rotation = (i * 45) % 360;
            return (
              <motion.div 
                key={i} 
                className="absolute text-white"
                initial={{ opacity: 0 }}
                animate={{
                  x: [0, i % 2 === 0 ? 60 : -60, 0],
                  y: [0, i % 3 === 0 ? -60 : 60, 0],
                  rotate: [rotation, rotation + (i % 2 === 0 ? 20 : -20), rotation],
                  scale: [0.8, 1, 0.8],
                  opacity: [0, 0.1, 0.1, 0.1, 0]
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1 + (i % 4) * 3,
                  times: [0, 0.1, 0.5, 0.9, 1]
                }}
                style={{
                  top: `${5 + (i * 7) % 90}%`,
                  left: `${5 + (i * 13) % 90}%`,
                  scale: 0.6 + Math.random() * 1.2,
                }}
              >
                <Bug size={40 + (i * 5)} />
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Modern Accent Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        {/* Content Container (Now inside the bounded box) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 xl:py-20 grid xl:grid-cols-2 gap-16 items-center">
          
          {/* Text Side */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center space-x-3 px-6 py-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm transition-all hover:bg-white/15">
              <span className="flex h-2 w-2 rounded-full bg-accent-green animate-ping"></span>
              <span className="text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
                {t('hero.badge')}
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl xl:text-6xl font-black text-white leading-[1.1] tracking-tighter">
                {t('hero.title')}
              </h1>
              <p className="max-w-xl text-lg md:text-xl text-white/85 font-light leading-relaxed tracking-wide">
                {t('hero.desc')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <button 
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-accent-green text-primary-gray font-black text-lg uppercase tracking-wider shadow-2xl transition-all duration-300 hover:bg-accent-green-hv hover:translate-y-[-4px] active:scale-95 group"
              >
                <span className="flex items-center justify-center">
                   {t('common.cta_free')}
                  <ArrowRight size={22} className="ml-3 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
              
              <button className="flex items-center space-x-3 px-8 py-4 text-white font-bold transition-all hover:opacity-80">
                <span className="p-3 bg-white/10 rounded-full">
                  <ShieldCheck size={24} className="text-accent-green" />
                </span>
                <span className="text-sm uppercase tracking-widest leading-none">
                   {t('common.certified')}
                </span>
              </button>
            </div>

            {/* Social Proof Pills */}
            <div className="flex items-center space-x-8 pt-8 opacity-60 border-t border-white/10">
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-black text-white">+12.000</span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-white/70">
                   {t('hero.services_count')}
                </span>
              </div>
              <div className="flex flex-col border-l border-white/20 pl-8">
                <span className="text-2xl md:text-3xl font-black text-white">4.9/5</span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-white/70">Google Reviews</span>
              </div>
            </div>
          </div>

          {/* Visual/Image Side - Slider Implementation */}
          <div className="relative hidden xl:block animate-slide-up">
             <div className="relative z-10 transform translate-x-10 translate-y-10">
                <div 
                  className="aspect-square rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-4 border-white/20 relative rotate-3 hover:rotate-0 transition-all duration-700"
                  style={{ 
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                   {/* Image Slider */}
                   <div className="absolute inset-0">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={slides[currentSlide]}
                          src={slides[currentSlide]}
                          initial={{ opacity: 0, scale: 1.2 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.1 }}
                          transition={{ duration: 2.5, ease: [0.4, 0, 0.2, 1] }}
                          alt="CECSA Control de Plagas"
                          className="w-full h-full object-cover"
                        />
                      </AnimatePresence>
                      {/* Darkening Overlay for better text readability and depth */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary-blue/30 to-transparent"></div>
                   </div>
                   
                   {/* Technical Insight Card - Maintaining over the images */}
                   <div className="absolute bottom-12 left-12 right-12 p-8 glass rounded-3xl animate-fade-in z-20">
                      <div className="flex items-center space-x-4">
                        <div className="hidden md:flex p-3 bg-primary-blue rounded-2xl text-white">
                          <Zap size={28} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-black text-primary-gray/50 mb-1">
                             {t('hero.active_system')}
                          </p>
                          <motion.p 
                            key={currentSlide}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-primary-blue font-black tracking-tight text-xl"
                          >
                            {currentSlide === 0 ? t('hero.slider_1') : currentSlide === 1 ? t('hero.slider_2') : t('hero.slider_3')}
                          </motion.p>
                        </div>
                      </div>
                   </div>

                   {/* Slider Progress Indicators */}
                   <div className="absolute top-12 left-12 right-12 flex space-x-2 z-20">
                      {slides.map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-1 flex-grow rounded-full transition-all duration-500 ${i === currentSlide ? 'bg-accent-green' : 'bg-white/30'}`}
                        ></div>
                      ))}
                   </div>
                </div>
             </div>
             
             {/* Decorative Blobs */}
             <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent-green/20 rounded-full blur-[100px] animate-pulse"></div>
             <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary-blue-hv/30 rounded-full blur-[100px] animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
