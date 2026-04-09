import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, Zap, Eye, ShieldCheck, ChevronRight } from 'lucide-react';

const Method = () => {
  const { t } = useTranslation();

  const icons = [
    <Search size={48} strokeWidth={2.5} />, 
    <Zap size={48} strokeWidth={2.5} />, 
    <Eye size={48} strokeWidth={2.5} />, 
    <ShieldCheck size={48} strokeWidth={2.5} />
  ];

  return (
    <section className="py-24 lg:py-36 bg-white overflow-hidden">
      <div className="container">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-7xl font-black text-secondary-gray uppercase tracking-tighter leading-none mb-6">
            {t('method.title')}
          </h2>
          <div className="h-2 w-24 bg-primary-blue mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {t('method.steps', { returnObjects: true }).map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative group h-full"
            >
              <div className="h-full bg-bg-light p-10 rounded-[3rem] border border-gray-100 hover:border-primary-blue/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col items-center text-center">
                <div className="text-primary-blue mb-8 group-hover:scale-110 transition-transform duration-500">
                   {icons[idx]}
                </div>
                
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-[10px] font-black text-primary-blue-deep/60 uppercase tracking-widest">PAS {idx + 1}</span>
                  {idx < 3 && <ChevronRight size={18} className="text-primary-blue/20 hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20" />}
                </div>

                <h3 className="text-2xl font-black text-secondary-gray mb-4 uppercase tracking-tight">{step.title}</h3>
                <p className="text-text-muted font-bold leading-relaxed opacity-80">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Method;
