import React from 'react';
import { motion } from 'framer-motion';
import { Bug } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AboutHero = () => {
  const { t } = useTranslation();

  return (
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
  );
};

export default AboutHero;
