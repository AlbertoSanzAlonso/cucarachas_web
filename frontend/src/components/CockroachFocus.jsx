import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ChevronRight } from 'lucide-react';

const CockroachFocus = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-white overflow-hidden" id="services">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        
        {/* Text Section */}
        <div className="space-y-8 animate-fade-in order-2 md:order-1">
          <div className="space-y-4">
             <span className="text-sm font-bold uppercase tracking-[0.3em] text-accent-green">
               Desinsectación Técnica Especializada
             </span>
             <h2 className="text-4xl md:text-5xl font-black text-primary-gray leading-tight tracking-tighter">
               {t('focus.title')}
             </h2>
             <p className="text-lg text-secondary-gray/80 leading-relaxed font-light">
               {t('focus.desc')}
             </p>
          </div>

          <ul className="space-y-4">
            {[
              'Diagnóstico rápido en menos de 24h',
              'Uso de geles de última generación (sin olores)',
              'Garantía por escrito de eliminación total',
              'Seguimiento preventivo tras el tratamiento'
            ].map((item, i) => (
              <li key={i} className="flex items-center space-x-3 group">
                <div className="p-1 bg-accent-green/10 rounded-full group-hover:bg-accent-green/20 transition-colors">
                  <CheckCircle2 size={20} className="text-accent-green" />
                </div>
                <span className="text-secondary-gray font-medium">{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-6">
             <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary-blue text-white font-bold tracking-wide hover:shadow-xl transition-all hover:bg-primary-blue-hv active:scale-95 flex items-center justify-center">
               Conocer Precios
               <ChevronRight size={18} className="ml-2" />
             </button>
             <button className="text-primary-blue font-bold tracking-tight hover:underline">
               Ver casos de éxito en Barcelona
             </button>
          </div>
        </div>

        {/* Image Section - Now 'Transparent' Style */}
        <div className="relative order-1 md:order-2 group flex justify-center">
           <div className="relative z-10 w-full max-w-lg transition-transform duration-700 hover:scale-105 active:scale-95">
             <img 
               src="/assets/cockroach-trap.png" 
               alt="Trampa de Monitoreo CECSA" 
               className="w-full h-auto object-contain mix-blend-multiply"
             />
           </div>
           
           {/* Decorative elements adapted for the transparent look */}
           <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50/50 rounded-full blur-[100px] opacity-70"></div>
           
           <div className="absolute top-0 right-0 px-8 py-4 bg-white shadow-2xl rounded-2xl border border-accent-green/20 animate-bounce z-20">
              <p className="text-[10px] uppercase font-black text-secondary-gray/40 mb-1 tracking-widest leading-none">Eficacia Máxima</p>
              <p className="text-primary-blue font-black text-xl tracking-tighter">+99.8% Éxito</p>
           </div>
        </div>

      </div>
    </section>
  );
};

export default CockroachFocus;
