import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShieldCheck, Users, Activity, ExternalLink, ArrowRight, HeartPulse, Scale, Globe, Bug } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingCTA from '../components/FloatingCTA';
import SEO from '../components/SEO';
import { SectionSkeleton } from '../components/Skeleton';

const OtherServices = lazy(() => import('../components/OtherServices'));

const LazySection = ({ Component, fallback = <SectionSkeleton /> }) => (
  <Suspense fallback={fallback}>
    <Component />
  </Suspense>
);

const About = () => {
  const { t } = useTranslation();
  const [activeStat, setActiveStat] = useState(0);

  // Scroll to top and Auto-rotate stats for mobile
  useEffect(() => {
    window.scrollTo(0, 0);

    const timer = setInterval(() => {
      setActiveStat((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { icon: <Users />, value: "9", label: t('about_page.stats.workers') },
    { icon: <Activity />, value: t('about_page.stats.success'), label: t('about_page.stats.success_label') },
    { icon: <Heart />, value: t('about_page.stats.experience'), label: t('about_page.stats.experience_label') }
  ];

  const sections = [
    {
      id: "family",
      title: t('about_page.family_title'),
      content: t('about_page.family_desc'),
      icon: <Users className="text-accent-green" size={40} />,
      color: "bg-primary-blue/5",
      image: "/assets/familia-sureda-cecsa-barcelona.webp"
    },
    {
      id: "conscience",
      title: t('about_page.vision_title'),
      content: t('about_page.vision_desc'),
      icon: <Scale className="text-primary-blue" size={40} />,
      color: "bg-accent-green/5",
      image: "/assets/slideshow/certificacion-roesb-cecsa.webp"
    },
    {
      id: "mental-health",
      title: t('about_page.wellness_title'),
      content: t('about_page.wellness_desc'),
      icon: <HeartPulse className="text-accent-green" size={40} />,
      color: "bg-primary-blue/5",
      image: "/assets/slideshow/control-plagas-urbano.webp"
    },
    {
      id: "honesty",
      title: t('about_page.honesty_title'),
      content: t('about_page.honesty_desc'),
      icon: <ShieldCheck className="text-primary-blue" size={40} />,
      color: "bg-accent-green/5",
      image: "/assets/slideshow/tratamiento-sanitario-preventivo.webp"
    }
  ];

  return (
    <div className="min-h-screen bg-bg-light">
      <SEO 
        title={t('nav.about')} 
        description={t('about_page.hero_subtitle')} 
        url="/sobre-cecsa"
      />
      <Navbar />

      <main className="pt-40 md:pt-32 pb-0">
        {/* Page Hero */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="relative rounded-[4rem] overflow-hidden bg-primary-blue h-[600px] flex items-center shadow-2xl">
            <div className="absolute inset-0 z-0">
               <img 
                 src="/assets/tecnics-cecsa.webp" 
                 alt="Tècnics de CECSA" 
                 className="w-full h-full object-cover opacity-60 mix-blend-overlay"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-primary-blue via-primary-blue/80 to-transparent"></div>
               
               {/* Floating Bugs Effect */}
               <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                  {[...Array(15)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      className="absolute text-white"
                      initial={{ opacity: 0 }}
                      animate={{
                        x: [0, i % 2 === 0 ? 50 : -50, 0],
                        y: [0, i % 3 === 0 ? -30 : 30, 0],
                        rotate: [i * 20, i * 20 + 10, i * 20],
                        opacity: [0, 0.15, 0.15, 0]
                      }}
                      transition={{
                        duration: 10 + i,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.5
                      }}
                      style={{
                        top: `${(i * 12) % 100}%`,
                        left: `${(i * 18) % 100}%`,
                        scale: 0.5 + Math.random() * 0.5,
                      }}
                    >
                      <Bug size={30 + (i * 2)} strokeWidth={1} />
                    </motion.div>
                  ))}
               </div>
            </div>
            
            <div className="relative z-10 p-12 md:p-24 max-w-3xl space-y-8">
               <motion.span 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-accent-green font-black uppercase tracking-[0.4em] text-sm"
               >
                 {t('nav.about')}
               </motion.span>
               <motion.h1 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter"
               >
                 {t('about_page.hero_title')}
               </motion.h1>
               <motion.p 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="text-xl md:text-2xl text-white/70 font-light leading-relaxed italic border-l-4 border-accent-green pl-8"
               >
                 "{t('about_page.hero_subtitle')}"
               </motion.p>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="max-w-5xl mx-auto px-6 -mt-16 md:-mt-32 relative z-20 mb-32">
          {/* Desktop View (Grid) */}
          <div className="hidden md:grid grid-cols-3 gap-8">
             {stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="bg-white p-10 rounded-3xl shadow-xl flex flex-col items-center text-center space-y-4 border border-gray-100 hover:translate-y-[-10px] transition-all"
                >
                   <div className="p-4 bg-primary-blue/5 text-primary-blue rounded-2xl">
                      {React.cloneElement(stat.icon, { size: 32 })}
                   </div>
                   <div className="space-y-1">
                      <span className="text-4xl font-black text-primary-gray tracking-tighter block">{stat.value}</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-primary-gray/40">{stat.label}</span>
                   </div>
                </motion.div>
             ))}
          </div>

          {/* Mobile View (Auto-rotating Single Container) */}
          <div className="md:hidden relative h-48">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeStat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0 bg-white p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center text-center space-y-4 border border-gray-100"
              >
                 <div className="p-3 bg-primary-blue/5 text-primary-blue rounded-xl">
                    {React.cloneElement(stats[activeStat].icon, { size: 24 })}
                 </div>
                 <div className="space-y-1">
                    <span className="text-3xl font-black text-primary-gray tracking-tighter block">{stats[activeStat].value}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-gray/40">{stats[activeStat].label}</span>
                 </div>
                 
                 {/* Dot Indicators */}
                 <div className="flex space-x-2 pt-2">
                    {stats.map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeStat === i ? 'bg-primary-blue w-4' : 'bg-gray-200'}`}
                      />
                    ))}
                 </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Philosophy Blocks */}
        <section className="max-w-7xl mx-auto px-6 space-y-32 mb-40">
           {sections.map((section, i) => (
             <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16 lg:gap-32`}>
                <div className="flex-1 space-y-8">
                   <div className="flex items-center space-x-6">
                      <div className="hidden md:block p-5 rounded-3xl shadow-lg bg-white border border-gray-100">
                         {section.icon}
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-primary-gray tracking-tighter leading-none">
                        {section.title}
                      </h2>
                   </div>
                   <p className="text-xl md:text-2xl font-light text-secondary-gray leading-relaxed text-justify">
                      {section.content}
                   </p>
                   <div className="w-24 h-2 bg-accent-green rounded-full"></div>
                </div>
                <div className="flex-1 w-full lg:w-auto">
                    <div className={`aspect-square rounded-[4rem] ${section.color} flex items-center justify-center relative overflow-hidden group shadow-2xl transition-all duration-500`}>
                       {section.image ? (
                         <div className="absolute inset-0 z-0 bg-slate-100">
                           <img 
                             src={section.image} 
                             alt={section.title} 
                             className="w-full h-full object-cover opacity-10 group-hover:scale-110 transition-transform duration-700 contrast-[0.8] grayscale" 
                           />
                           <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent"></div>
                         </div>
                       ) : (
                         <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_20px_20px,#000_1px,transparent_0)] bg-[length:40px_40px]"></div>
                       )}
                       <motion.div 
                         whileHover={{ scale: 1.1, rotate: 5 }}
                         className={`transform transition-all duration-700 relative z-10 ${i % 2 === 0 ? 'text-accent-green' : 'text-primary-blue'} ${section.image ? 'drop-shadow-sm' : 'opacity-10'}`}
                       >
                          {React.cloneElement(section.icon, { 
                            size: undefined, 
                            className: `w-32 h-32 md:w-56 md:h-56 lg:w-64 lg:h-64 ${section.image ? '' : 'lg:w-96 lg:h-96'}`
                          })}
                       </motion.div>
                   </div>
                </div>
             </div>
           ))}
        </section>

        {/* Reach Section */}
        <section className="max-w-7xl mx-auto px-6 mb-0 pb-12 overflow-hidden">
           <div className="bg-primary-blue py-20 md:py-32 rounded-[3.5rem] md:rounded-[5rem] relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-10">
                 <img 
                   src="/assets/barcelona-authority.webp" 
                   alt="Barcelona" 
                   className="w-full h-full object-cover"
                 />
              </div>
              <div className="max-w-7xl mx-auto px-8 md:px-12 relative z-10 grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                 <div className="space-y-6 md:space-y-8 mb-12 lg:mb-0">
                    <span className="px-4 py-2 bg-accent-green/20 text-accent-green rounded-full text-xs font-black uppercase tracking-widest">
                       {t('about_page.scope_title')}
                    </span>
                    <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                      {t('about_page.scope_desc')}
                    </h2>
                    <p className="text-lg md:text-xl text-white/60 font-medium">
                      {t('about_page.scope_detail')}
                    </p>
                 </div>
                 <div className="bg-white/5 backdrop-blur-xl p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 space-y-8">
                    <div className="flex items-center space-x-4">
                       <Globe className="text-accent-green" size={32} />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">Presència</span>
                          <span className="text-xl md:text-2xl font-black text-white">Tota Catalunya</span>
                       </div>
                    </div>
                    <ul className="space-y-4">
                       {['Barcelona Ciutat', 'Àrea Metropolitana', 'Girona', 'Tarragona', 'Lleida'].map((city, i) => (
                         <li key={i} className="flex items-center text-white/80 font-bold space-x-3">
                            <div className="w-2 h-2 rounded-full bg-accent-green"></div>
                            <span>{city}</span>
                         </li>
                       ))}
                    </ul>
                 </div>
              </div>
           </div>
        </section>

        {/* Otros Servicios */}
        <div>
           <LazySection Component={OtherServices} />
        </div>
      </main>

      <Footer />
      <FloatingCTA />
    </div>
  );
};

export default About;
