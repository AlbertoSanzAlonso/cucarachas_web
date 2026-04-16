import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, PenTool, Zap, CheckCircle2 } from 'lucide-react';

const Process = () => {
  const { t } = useTranslation();

  const steps = [
    { id: 'step1', name: t('method.step1_title'), icon: <Search />, desc: t('method.step1_desc') },
    { id: 'step2', name: t('method.step2_title'), icon: <PenTool />, desc: t('method.step2_desc') },
    { id: 'step3', name: t('method.step3_title'), icon: <Zap />, desc: t('method.step3_desc') }
  ];

  return (
    <section className="pt-40 pb-24 bg-white relative z-30" id="process">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-20">
        
        <div className="max-w-3xl mx-auto space-y-4">
           <h2 className="text-4xl md:text-5xl font-black text-primary-blue tracking-tighter uppercase">
             Nuestro proceso de control de plagas
           </h2>
           <div className="w-24 h-1.5 bg-accent-green mx-auto rounded-full"></div>
           <p className="text-secondary-gray/80 text-lg font-light pt-4 italic">
             Metodología científica aplicada para resultados inmediatos.
           </p>
        </div>

        <div className="grid md:grid-cols-3 gap-16 relative">
           {/* Decorative connector line (Desktop only) */}
           <div className="hidden md:block absolute top-[64px] left-[15%] right-[15%] h-0.5 bg-gray-100 z-0"></div>

           {steps.map((step, i) => (
             <div 
               key={step.id} 
               className="flex flex-col items-center justify-start space-y-8 animate-fade-in group relative"
             >
                {/* Visual Step Indicator with circle background */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                   <div 
                     className="absolute inset-0 bg-primary-blue/5 group-hover:bg-accent-green/10 transition-colors duration-500 rounded-full"
                   ></div>
                   
                   <div className="relative z-10 w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-primary-gray group-hover:text-accent-green transition-all duration-500 border border-gray-50 scale-100 group-hover:scale-110">
                      {React.cloneElement(step.icon, { size: 30, strokeWidth: 1.5 })}
                   </div>

                   {/* Step Number Tag */}
                   <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-primary-blue text-white font-black text-xs flex items-center justify-center shadow-lg group-hover:bg-accent-green transition-colors">
                     0{i + 1}
                   </div>
                </div>

                <div className="text-center space-y-4 max-w-xs">
                   <h3 className="text-primary-blue font-black text-xl tracking-tight leading-tight">
                     {step.name}
                   </h3>
                   <p className="text-sm font-medium text-secondary-gray/60 leading-relaxed px-4">
                     {step.desc}
                   </p>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-accent-green opacity-0 group-hover:opacity-100 transition-opacity">
                   <CheckCircle2 size={12} />
                   <span>Certificado ROESB</span>
                </div>
             </div>
           ))}
        </div>

      </div>
    </section>
  );
};

export default Process;
