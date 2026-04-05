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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-bg-light py-20 lg:py-32">
      {/* Abstract background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-blue/5 blur-[120px] rounded-full -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-primary-blue/10 blur-[100px] rounded-full -ml-10 -mb-10"></div>

      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-1/2"
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
            
            <p className="text-lg lg:text-xl text-text-muted mb-10 max-w-2xl leading-relaxed">
              {t('hero.desc_p1')} <span className="text-secondary-gray font-bold">{t('hero.desc_city')}</span> {t('hero.desc_p2')}
            </p>
            
            <div className="flex flex-wrap gap-5 mb-12">
              <a href="#contacto" className="btn btn-primary shadow-xl">
                {t('hero.cta_urgent')} <ChevronRight size={20} />
              </a>
              <a href="#servicios" className="btn btn-secondary flex gap-2">
                <Bug size={18} /> {t('hero.cta_identify')}
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-gray-200/50">
              {/* Stats items... */}
              <div className="flex items-center gap-3">
                <div className="text-primary-blue"><Clock size={24} /></div>
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest text-muted">{t('hero.stats.intervention')}</p>
                  <p className="text-sm font-black text-secondary-gray">{t('hero.stats.urgent')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-primary-blue"><Users size={24} /></div>
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest text-muted">{t('hero.stats.accre')}</p>
                  <p className="text-sm font-black text-secondary-gray">{t('hero.stats.senior')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-primary-blue"><Activity size={24} /></div>
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest text-muted">{t('hero.stats.guarantee')}</p>
                  <p className="text-sm font-black text-secondary-gray">{t('hero.stats.cert')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:w-1/2 relative"
          >
            {/* Structural Anchor for Slider - Robust Aspect Ratio */}
            <div className="relative z-10 bg-white p-3 rounded-[3.5rem] shadow-2xl border border-gray-100 w-full overflow-hidden">
              <div className="relative w-full rounded-[2.8rem] overflow-hidden bg-bg-light" style={{ aspectRatio: '4/5', flexShrink: 0 }}>
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={slides[currentSlide]}
                    src={slides[currentSlide]} 
                    alt="CECSA Control de Plagues" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 w-full h-full"
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                </AnimatePresence>

              </div>

              {/* Slider indicators - Guaranteed bottom alignment within the outer frame */}
              <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6 z-30">
                {slides.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    style={{
                      width: idx === currentSlide ? '32px' : '10px',
                      height: '10px',
                      borderRadius: '999px',
                      background: idx === currentSlide ? '#0080bb' : 'rgba(0,0,0,0.2)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    aria-label={`Ir a diapositiva ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Visual highlight element */}
            <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-primary-blue/10 rounded-full blur-[110px] -z-0"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


