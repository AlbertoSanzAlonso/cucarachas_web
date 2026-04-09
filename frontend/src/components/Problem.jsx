import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';

const Problem = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-bg-surface overflow-hidden">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-8"
          >
            <div className="text-red-500 mb-2 group-hover:scale-110 transition-transform duration-300">
              <ShieldAlert size={52} />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-secondary-gray leading-tight tracking-tighter uppercase">
              {t('problem.title')} <br />
              <span className="text-primary-blue">{t('problem.subtitle')}</span>
            </h2>

            <p className="text-xl md:text-2xl text-text-muted font-medium italic opacity-90 max-w-2xl leading-relaxed">
              {t('problem.desc')}
            </p>

            <div className="mt-8 p-10 bg-white rounded-[3rem] shadow-xl border border-blue-50 relative group overflow-hidden">
               <div className="relative z-10">
                 <p className="text-xl md:text-2xl text-secondary-gray font-black uppercase tracking-tight leading-relaxed">
                   {t('problem.hook')}
                 </p>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-blue/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
