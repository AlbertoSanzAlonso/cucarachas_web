import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Users, Activity, ExternalLink, ArrowRight, HeartPulse, Scale, Globe, Bug } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingCTA from '../components/FloatingCTA';

const About = () => {
  const { t } = useTranslation();

  // Scroll to top on mount and set SEO Title
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `Sobre Nosaltres - CECSA Control de Plagues`;
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
      color: "bg-primary-blue/5"
    },
    {
      id: "conscience",
      title: t('about_page.vision_title'),
      content: t('about_page.vision_desc'),
      icon: <Scale className="text-primary-blue" size={40} />,
      color: "bg-accent-green/5"
    },
    {
      id: "mental-health",
      title: t('about_page.wellness_title'),
      content: t('about_page.wellness_desc'),
      icon: <HeartPulse className="text-accent-green" size={40} />,
      color: "bg-primary-blue/5"
    },
    {
      id: "honesty",
      title: t('about_page.honesty_title'),
      content: t('about_page.honesty_desc'),
      icon: <ShieldCheck className="text-primary-blue" size={40} />,
      color: "bg-accent-green/5"
    }
  ];

  return (
    <div className="min-h-screen bg-bg-light">
      <Navbar />

      <main className="pt-32 pb-0">
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
        <section className="max-w-5xl mx-auto px-6 -mt-32 relative z-20 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        </section>

        {/* Philosophy Blocks */}
        <section className="max-w-7xl mx-auto px-6 space-y-32 mb-40">
           {sections.map((section, i) => (
             <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16 lg:gap-32`}>
                <div className="flex-1 space-y-8">
                   <div className="flex items-center space-x-6">
                      <div className="p-5 rounded-3xl shadow-lg bg-white border border-gray-100">
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
                   <div className={`aspect-square rounded-[4rem] ${section.color} flex items-center justify-center relative overflow-hidden group`}>
                      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_20px_20px,#000_1px,transparent_0)] bg-[length:40px_40px]"></div>
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="text-primary-blue/10 transform transition-all duration-700"
                      >
                         {React.cloneElement(section.icon, { size: 280 })}
                      </motion.div>
                   </div>
                </div>
             </div>
           ))}
        </section>

        {/* Reach Section */}
        <section className="bg-primary-blue pt-32 pb-0 relative overflow-hidden">
           <div className="absolute inset-0 opacity-10">
              <img 
                src="/assets/barcelona-authority.webp" 
                alt="Barcelona" 
                className="w-full h-full object-cover"
              />
           </div>
           <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                 <span className="px-4 py-2 bg-accent-green/20 text-accent-green rounded-full text-xs font-black uppercase tracking-widest">
                    {t('about_page.scope_title')}
                 </span>
                 <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                   {t('about_page.scope_desc')}
                 </h2>
                 <p className="text-xl text-white/60 font-medium">
                   Operem amb protocols de vigilància activa, assegurant que un cop reestablert l'equilibri, aquest es mantingui en el temps.
                 </p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/10 space-y-8">
                 <div className="flex items-center space-x-4">
                    <Globe className="text-accent-green" size={40} />
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Presència</span>
                       <span className="text-2xl font-black text-white">Tota Catalunya</span>
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
        </section>

      </main>

      <Footer className="pt-0" />
      <FloatingCTA />
    </div>
  );
};

export default About;
