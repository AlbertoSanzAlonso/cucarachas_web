import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShieldCheck, Zap, Clock, HelpCircle, Search } from 'lucide-react';

const FAQAccordion = ({ filteredFaqs, openId, toggleFaq, t }) => {
  const categoryIcons = {
    seguretat: <ShieldCheck size={20} />,
    tecnic: <Zap size={20} />,
    garantia: <ShieldCheck size={20} />,
    preus: <Clock size={20} />,
    default: <HelpCircle size={20} />
  };

  if (filteredFaqs.length === 0) {
    return (
      <div className="text-center py-24 space-y-4">
        <div className="w-20 h-20 bg-primary-blue/5 rounded-full flex items-center justify-center mx-auto text-primary-blue/20">
          <Search size={40} />
        </div>
        <h3 className="text-xl font-bold text-primary-gray">{t('faq.no_results')}</h3>
        <p className="text-secondary-gray/60">{t('faq.no_results_desc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {filteredFaqs.map((faq, idx) => (
          <motion.div
            key={faq.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-[2rem] border transition-all duration-300 ${openId === faq.id ? 'bg-primary-blue border-primary-blue shadow-2xl scale-[1.02]' : 'bg-bg-light border-gray-100'}`}
          >
            <button
              onClick={() => toggleFaq(faq.id)}
              className="w-full text-left p-8 md:p-10 flex items-center justify-between group"
            >
              <div className="flex items-center space-x-6">
                <div className={`p-4 rounded-2xl transition-colors ${openId === faq.id ? 'bg-white/10 text-accent-green' : 'bg-white text-primary-blue shadow-sm'}`}>
                  {categoryIcons[faq.category] || categoryIcons.default}
                </div>
                <h3 className={`text-lg md:text-xl font-black leading-tight tracking-tight ${openId === faq.id ? 'text-white' : 'text-primary-blue group-hover:text-primary-blue-hv'}`}>
                  {faq.question}
                </h3>
              </div>
              <ChevronDown 
                size={24} 
                className={`transition-transform duration-500 ${openId === faq.id ? 'rotate-180 text-white' : 'text-secondary-gray/30'}`} 
              />
            </button>
            
            <AnimatePresence>
              {openId === faq.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-8 md:px-10 pb-10 flex items-start space-x-6">
                    <div className="w-10 flex-shrink-0" />
                    <p className="text-white/70 leading-relaxed font-light text-lg">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FAQAccordion;
