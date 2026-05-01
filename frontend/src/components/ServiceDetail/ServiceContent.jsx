import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const ServiceContent = ({ sector, t }) => {
  return (
    <div className="lg:col-span-2 space-y-16">
      <div className="space-y-8">
         <h2 className="text-3xl font-black text-primary-gray tracking-tighter uppercase flex items-center">
            <span className="w-12 h-1.5 bg-accent-green mr-4 rounded-full"></span>
            {t('service_detail_page.technical_protocol')}
         </h2>
         <div className="grid md:grid-cols-2 gap-6">
            {sector.points.map((point, i) => (
               <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
               >
                  <ShieldCheck size={32} className="text-accent-green mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-lg font-black text-primary-gray tracking-tight leading-tight">
                     {point}
                  </h4>
               </motion.div>
            ))}
         </div>
      </div>

      <div className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-xl space-y-8">
         <h3 className="text-2xl font-black text-primary-gray tracking-tighter">{t('service_detail_page.why_choose', { sector: sector.title })}</h3>
         <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
               { label: t('service_detail_page.benefit1_label'), desc: t('service_detail_page.benefit1_desc') },
               { label: t('service_detail_page.benefit2_label'), desc: t('service_detail_page.benefit2_desc') },
               { label: t('service_detail_page.benefit3_label'), desc: t('service_detail_page.benefit3_desc') }
            ].map((item, i) => (
               <div key={i} className="space-y-2">
                  <p className="text-accent-green font-black text-xl tracking-tighter">{item.label}</p>
                  <p className="text-xs text-secondary-gray/60 font-medium leading-tight">{item.desc}</p>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default ServiceContent;
