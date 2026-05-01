import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getAboutSections } from '@/components/About/aboutData';

const AboutPhilosophy = () => {
  const { t } = useTranslation();
  const sections = getAboutSections(t);

  return (
    <section className="max-w-7xl mx-auto px-6 space-y-32 mb-40">
      {sections.map((section, i) => (
        <div key={section.id} id={section.id} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16 lg:gap-32`}>
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
  );
};

export default AboutPhilosophy;
