import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Phone } from 'lucide-react';

const FloatingCTA = () => {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-8 left-0 right-0 z-[100] px-6 md:px-12 xl:px-0 flex justify-center pointer-events-none">
       <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-end md:items-center justify-end md:justify-between space-y-4 md:space-y-0">
          
          {/* WhatsApp / Direct Contact (Left on Desktop) */}
          <div className="hidden lg:flex items-center space-x-4 pointer-events-auto animate-fade-in animate-slide-up">
             <a 
               href="https://wa.me/34933309169" 
               className="group flex items-center space-x-4 bg-white shadow-2xl rounded-2xl p-2 pr-6 border border-gray-100 hover:shadow-accent-green/20 transition-all hover:translate-y-[-4px]"
             >
                <div className="p-3 bg-accent-green rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                   <MessageSquare size={24} />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] uppercase font-bold text-secondary-gray/40">{t('cta.wa_label', 'Consulta rápida')}</span>
                   <span className="text-secondary-gray font-black tracking-tight underline-offset-4 decoration-accent-green">{t('cta.wa_desc', 'Atención por WhatsApp')}</span>
                </div>
             </a>
          </div>

          {/* Core Urgent Floating CTA (Right) */}
          <div className="flex flex-col space-y-2 items-end pointer-events-auto">
             {/* Dynamic Tooltip */}
             <div className="bg-primary-blue text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-xl animate-bounce">
                {t('cta.badge', 'Técnico de Guardia disponible')}
             </div>
             
             <a 
               href="tel:+34933309169" 
               className="flex items-center space-x-3 md:space-x-5 px-5 py-3 md:px-8 md:py-5 rounded-full bg-accent-green text-primary-gray font-black text-sm md:text-xl shadow-2xl hover:bg-accent-green-hv hover:translate-y-[-4px] active:scale-95 transition-all group"
               style={{ 
                 background: 'var(--color-accent-green)', 
                 boxShadow: '0 15px 30px rgba(52, 211, 153, 0.4)'
               }}
             >
                <span className="flex flex-col md:flex-row md:items-center text-left md:text-center space-y-1 md:space-y-0">
                  <span className="md:mr-3 leading-none">{t('cta.call_now', 'LLAMAR AHORA')}</span>
                  <span className="text-primary-gray/50 font-medium text-[10px] md:text-xl leading-none">933 309 169</span>
                </span>
                <div className="p-1.5 md:p-2 bg-white/20 rounded-full group-hover:rotate-12 transition-transform">
                   <Phone size={20} className="md:w-6 md:h-6" fill="currentColor" />
                </div>
             </a>
          </div>

       </div>
    </div>
  );
};

export default FloatingCTA;
