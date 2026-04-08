import { CheckCircle2, ChevronRight, Truck, SprayCan, PaintBucket, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const OrigenService = () => {
  const { t } = useTranslation();

  const steps = [
    { icon: <Trash2 size={24} />, text: t('origen.steps.0') },
    { icon: <Truck size={24} />, text: t('origen.steps.1') },
    { icon: <PaintBucket size={24} />, text: t('origen.steps.2') },
    { icon: <SprayCan size={24} />, text: t('origen.steps.3') },
  ];

  return (
    <section id="origen" className="py-24 lg:py-36 bg-white overflow-hidden border-t border-gray-100">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-accent-green-light rounded-full text-accent-green-dark text-[10px] font-black uppercase tracking-widest mb-6">
              <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
              {t('origen.badge')}
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-black text-secondary-gray mb-8 leading-[1.1] tracking-tighter uppercase">
              {t('origen.title')}
            </h2>
            
            <p className="text-xl text-primary-blue font-bold mb-8 leading-relaxed italic">
              "{t('origen.slogan')}"
            </p>

            <p className="text-lg text-text-muted mb-10 leading-relaxed font-medium">
              {t('origen.desc')}
            </p>

            <div className="bg-bg-light p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10">
              <h4 className="text-secondary-gray font-black uppercase text-sm tracking-widest mb-6 flex items-center gap-3">
                <ChevronRight className="text-primary-blue" size={18} />
                {t('origen.process_title')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-blue border border-gray-50 group-hover:scale-110 transition-transform">
                      {step.icon}
                    </div>
                    <span className="text-xs font-bold text-secondary-gray uppercase tracking-tight leading-snug">
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-text-muted font-bold leading-relaxed border-l-4 border-accent-green pl-6 italic opacity-80 mb-8">
              {t('origen.guarantee')}
            </p>

            <div className="bg-accent-green-light px-8 py-6 rounded-[2rem] border border-accent-green/20">
               <p className="text-accent-green-dark text-[13px] font-bold italic leading-relaxed text-left">
                 "{t('origen.goal')}"
               </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 self-stretch flex"
          >
            <div className="relative z-10 bg-white p-3 rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden w-full">
               <img 
                 src="/assets/recovery_service.png" 
                 alt="Recuperació Integral d'Habitatges" 
                 className="w-full h-full rounded-[2.8rem] object-cover"
                 style={{ minHeight: '100%', objectPosition: 'center' }}
               />
            </div>
            
            {/* Background design */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-accent-green/5 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary-blue/5 rounded-full blur-[80px] -z-10"></div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default OrigenService;
