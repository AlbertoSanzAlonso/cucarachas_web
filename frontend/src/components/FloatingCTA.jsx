import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Phone } from 'lucide-react';

const FloatingCTA = () => {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-4 md:bottom-8 left-0 right-0 z-[100] px-4 md:px-12 xl:px-0 flex justify-center pointer-events-none [@media(max-height:600px)_and_(orientation:landscape)]:bottom-2">
       <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-end justify-end md:justify-between space-y-4 md:space-y-0">
          
          {/* WhatsApp / Direct Contact (Left on Desktop) */}
          <div className="flex items-center space-x-4 pointer-events-auto animate-fade-in animate-slide-up [@media(max-height:600px)_and_(orientation:landscape)]:hidden">
             <a 
               href="https://wa.me/34933309169" 
               className="group flex items-center space-x-3 md:space-x-4 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-1.5 pr-4 md:p-2 md:pr-6 border border-gray-100 hover:shadow-accent-green/20 transition-all hover:translate-y-[-4px]"
             >
                <div className="p-2 md:p-3 bg-accent-green rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                   <MessageSquare size={18} className="md:w-6 md:h-6" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[7px] md:text-[10px] uppercase font-bold text-secondary-gray/40">WhatsApp</span>
                   <span className="text-secondary-gray text-[10px] md:text-sm font-black tracking-tight">{t('cta.wa_desc', 'Atención')}</span>
                </div>
             </a>
          </div>

          {/* Core Urgent Floating CTA (Right) */}
          <div className="flex flex-col space-y-2 items-end pointer-events-auto [@media(max-height:600px)_and_(orientation:landscape)]:flex-row [@media(max-height:600px)_and_(orientation:landscape)]:items-center [@media(max-height:600px)_and_(orientation:landscape)]:space-y-0 [@media(max-height:600px)_and_(orientation:landscape)]:space-x-2">
             {/* Dynamic Tooltip (Normal) */}
             <div className="bg-primary-blue text-white text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 md:px-4 md:py-2 rounded-full shadow-xl animate-bounce [@media(max-height:600px)_and_(orientation:landscape)]:hidden">
                {t('cta.badge', 'Servicio 24h Activo')}
             </div>
             
             {/* Landscape Thin Line Alternative */}
             <div className="hidden [@media(max-height:600px)_and_(orientation:landscape)]:block text-primary-blue text-[10px] font-black uppercase tracking-widest bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                {t('cta.badge', 'Servicio 24h Activo')}
             </div>
             
             <a 
               href="tel:+34933309169" 
               className="flex items-center space-x-3 md:space-x-5 px-4 py-2.5 md:px-8 md:py-5 rounded-full bg-accent-green text-primary-gray font-black text-xs md:text-xl shadow-2xl hover:bg-accent-green-hv hover:translate-y-[-4px] active:scale-95 transition-all group [@media(max-height:600px)_and_(orientation:landscape)]:!w-10 [@media(max-height:600px)_and_(orientation:landscape)]:!h-10 [@media(max-height:600px)_and_(orientation:landscape)]:!p-0 [@media(max-height:600px)_and_(orientation:landscape)]:!justify-center"
               style={{ 
                 background: 'var(--color-accent-green)', 
                 boxShadow: '0 15px 30px rgba(52, 211, 153, 0.4)'
               }}
             >
                <span className="flex flex-col md:flex-row md:items-center text-left md:text-center space-y-0 [@media(max-height:600px)_and_(orientation:landscape)]:hidden">
                  <span className="md:mr-3 leading-none">{t('cta.call_now', 'LLAMAR')}</span>
                  <span className="text-primary-gray/50 font-medium text-[9px] md:text-xl leading-none">933 309 169</span>
                </span>
                <div className="p-1 md:p-2 bg-white/20 rounded-full group-hover:rotate-12 transition-transform [@media(max-height:600px)_and_(orientation:landscape)]:bg-transparent [@media(max-height:600px)_and_(orientation:landscape)]:p-0">
                   <Phone size={14} className="md:w-6 md:h-6 [@media(max-height:600px)_and_(orientation:landscape)]:w-4 [@media(max-height:600px)_and_(orientation:landscape)]:h-4" fill="currentColor" />
                </div>
             </a>
          </div>

       </div>
    </div>
  );
};

export default FloatingCTA;
