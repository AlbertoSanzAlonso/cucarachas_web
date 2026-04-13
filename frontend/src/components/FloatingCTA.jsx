import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Phone } from 'lucide-react';

const FloatingCTA = () => {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-8 left-0 right-0 z-[100] px-6 md:px-0 flex justify-center pointer-events-none">
       <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-end md:items-center justify-end md:justify-between space-y-4 md:space-y-0">
          
          {/* WhatsApp / Direct Contact (Left on Desktop) */}
          <div className="hidden lg:flex items-center space-x-4 pointer-events-auto animate-fade-in animate-slide-up">
             <a 
               href="https://wa.me/34930000000" 
               className="group flex items-center space-x-4 bg-white shadow-2xl rounded-2xl p-2 pr-6 border border-gray-100 hover:shadow-accent-green/20 transition-all hover:translate-y-[-4px]"
             >
                <div className="p-3 bg-accent-green rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                   <MessageSquare size={24} />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] uppercase font-bold text-secondary-gray/40">Consulta rápida</span>
                   <span className="text-secondary-gray font-black tracking-tight underline-offset-4 decoration-accent-green">Atención por WhatsApp</span>
                </div>
             </a>
          </div>

          {/* Core Urgent Floating CTA (Right) */}
          <div className="flex flex-col space-y-3 items-end pointer-events-auto">
             {/* Dynamic Tooltip */}
             <div className="bg-primary-blue text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-xl animate-bounce">
                {t('cta.badge', 'Técnico de Guardia disponible')}
             </div>
             
             <a 
               href="tel:+34930000000" 
               className="flex items-center space-x-5 px-8 py-5 rounded-[2rem] bg-accent-green text-primary-gray font-black text-xl shadow-2xl hover:bg-accent-green-hv hover:translate-y-[-4px] active:scale-95 transition-all group"
               style={{ 
                 background: 'var(--color-accent-green)', 
                 boxShadow: '0 20px 40px rgba(52, 211, 153, 0.3)'
               }}
             >
                <span className="flex items-center">
                  <span className="mr-3">LLAMAR AHORA</span>
                  <span className="text-primary-gray/50 font-medium">930 000 000</span>
                </span>
                <div className="p-2 bg-white/20 rounded-full group-hover:rotate-12 transition-transform">
                   <Phone size={24} fill="currentColor" />
                </div>
             </a>
          </div>

       </div>
    </div>
  );
};

export default FloatingCTA;
