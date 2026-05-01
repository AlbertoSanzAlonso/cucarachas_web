import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const FAQHero = () => {
  const { t } = useTranslation();

  return (
    <section 
      className="relative pt-32 pb-56 md:pt-40 md:pb-72 bg-primary-blue overflow-hidden z-20"
      style={{ 
        clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)',
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/blog-hero-technical.png" 
          alt="FAQ CECSA - Control de Plagues" 
          className="w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue via-primary-blue/90 to-primary-blue-hv/80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20px_20px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[length:40px_40px]"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <span className="inline-block py-2 px-8 glass-dark rounded-full text-white font-black text-[10px] tracking-[0.4em] uppercase border border-white/5 shadow-2xl">
            {t('faq.hero_badge')}
          </span>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">
            {t('faq.hero_title_main')} <span className="text-accent-green">{t('faq.hero_title_accent')}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-white/70 font-light leading-relaxed drop-shadow-lg">
            {t('faq.hero_desc')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQHero;
