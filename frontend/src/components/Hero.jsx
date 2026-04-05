import { useState, useEffect } from 'react';
import { ShieldCheck, ChevronRight, Clock, Users, Activity, Bug } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const slides = [
  '/assets/slideshow/control-cucarachas-barcelona.webp',
  '/assets/slideshow/tecnico-fumigacion-cocina.webp',
  '/assets/slideshow/desinsectacion-vivienda.webp',
  '/assets/slideshow/eliminacion-nidos-cucarachas.webp',
  '/assets/slideshow/tratamiento-sanitario-preventivo.webp',
  '/assets/slideshow/control-plagas-urbano.webp',
  '/assets/slideshow/certificacion-roesb-cecsa.webp',
  '/assets/slideshow/servicio-urgencias-24h.webp',
  '/assets/slideshow/fumigacion-locales-barcelona.webp'
];

const Hero = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-bg-light py-20 lg:py-32">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-blue/5 blur-[120px] rounded-full -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-primary-blue/10 blur-[100px] rounded-full -ml-10 -mb-10"></div>

      <div className="container relative z-10 mx-auto px-4">
        {/* FORCED SIDE-BY-SIDE INLINE STYLE - Text Left, Slider Right */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          alignItems: 'center', 
          gap: isMobile ? '3rem' : '5rem',
          justifyContent: 'space-between'
        }}>
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ width: isMobile ? '100%' : '45%', textAlign: 'left' }}
          >
            <div className="flex items-center gap-3 mb-6 bg-white w-fit px-4 py-2 rounded-full shadow-sm border border-primary-blue/10">
              <ShieldCheck className="text-primary-blue" size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary-gray">{t('hero.badge')}</span>
            </div>
            
            <h1 className="font-serif text-5xl lg:text-7xl font-bold text-[#3c3c3b] leading-tight mb-2 tracking-tighter">
              {t('hero.title_main')}
            </h1>
            <h2 className="font-sans text-5xl lg:text-7xl font-black text-primary-blue leading-tight mb-8 tracking-tight">
              {t('hero.title_slogan')}
            </h2>
            
            <p className="text-xl text-text-muted mb-10 max-w-2xl leading-relaxed font-medium">
              {t('hero.desc_p1')} <span className="text-secondary-gray font-black">{t('hero.desc_city')}</span> {t('hero.desc_p2')}
            </p>
            
            <div className="flex flex-wrap gap-5 mb-14">
              <a href="#contacto" className="btn btn-primary px-10 py-5 text-xl font-black shadow-xl" style={{ backgroundColor: '#34d399' }}>
                {t('hero.cta_urgent')} <ChevronRight size={20} />
              </a>
              <a href="#servicios" className="btn btn-secondary px-10 py-5 text-xl font-black flex gap-2 border-2 border-primary-blue text-primary-blue">
                <Bug size={22} /> {t('hero.cta_identify')}
              </a>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 pt-10 border-t border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="text-primary-blue"><Clock size={28} /></div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted leading-none mb-1">{t('hero.stats.intervention')}</p>
                  <p className="text-sm font-black text-secondary-gray uppercase">{t('hero.stats.urgent')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-primary-blue"><Users size={28} /></div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted leading-none mb-1">{t('hero.stats.accre')}</p>
                  <p className="text-sm font-black text-secondary-gray uppercase">{t('hero.stats.senior')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-primary-blue"><Activity size={28} /></div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted leading-none mb-1">{t('hero.stats.guarantee')}</p>
                  <p className="text-sm font-black text-secondary-gray uppercase">{t('hero.stats.cert')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Slider Side - 55% Width with Force Order */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: isMobile ? '100%' : '55%', position: 'relative' }}
          >
            <div className="bg-white p-3 rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden relative">
              <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: '3rem', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={slides[currentSlide]}
                    src={slides[currentSlide]} 
                    alt="CECSA Control de Plagues" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </AnimatePresence>
                
                {/* Visual Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/20 to-transparent pointer-events-none" />
              </div>

              {/* Slider indicators */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-30">
                {slides.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    style={{
                      width: idx === currentSlide ? '40px' : '10px',
                      height: '10px',
                      borderRadius: '999px',
                      background: idx === currentSlide ? '#0080bb' : 'rgba(255,255,255,0.6)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
