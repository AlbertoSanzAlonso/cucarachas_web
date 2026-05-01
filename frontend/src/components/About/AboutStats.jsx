import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getAboutStats } from '@/components/About/aboutData';

const AboutStats = () => {
  const { t } = useTranslation();
  const [activeStat, setActiveStat] = useState(0);
  const stats = getAboutStats(t);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [stats.length]);

  return (
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
  );
};

export default AboutStats;
