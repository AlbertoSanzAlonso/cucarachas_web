import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, UserCheck, ShieldCheck, Zap } from 'lucide-react';

const StatsBar = () => {
  const { t } = useTranslation();

  const stats = [
    { id: 'years', value: '+15', label: 'Años de Experiencia', icon: <Calendar /> },
    { id: 'services', value: '12k+', label: 'Servicios de Plagas', icon: <UserCheck /> },
    { id: 'guarantee', value: '100%', label: 'Garantía de Éxito', icon: <ShieldCheck /> },
    { id: 'response', value: '<2h', label: 'Tiempo de Respuesta', icon: <Zap /> }
  ];

  return (
    <section className="relative overflow-visible pt-56 pb-48 md:pt-80 md:pb-60 z-20">
      {/* Upper white part to hide the parent background */}
      <div 
        className="absolute top-0 left-0 right-0 h-[700px] bg-white z-0 -translate-y-[85%] -skew-y-3 origin-top-right optimize-gpu" 
      ></div>

      {/* Skewed Background Hole - The blue stripe stripe placeholder */}
      <div 
        className="absolute inset-0 -skew-y-3 origin-center transform scale-y-125 z-0 overflow-hidden optimize-gpu" 
      >
         {/* Subtle Background Pattern */}
         <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20px_20px,#fff_1px,transparent_0)] bg-[length:40px_40px]"></div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
           {stats.map((stat, i) => (
             <div 
               key={stat.id} 
               className="flex flex-col items-center justify-center text-center space-y-4 animate-fade-in group cursor-default"
             >
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-accent-green mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:bg-white/15 border border-white/5">
                   {React.cloneElement(stat.icon, { size: 32, strokeWidth: 2 })}
                </div>
                
                <div className="space-y-1">
                   <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter transition-all duration-300">
                     {stat.value}
                   </h4>
                   <p className="text-[10px] md:text-xs uppercase font-bold tracking-[0.2em] text-white/50 group-hover:text-accent-green transition-colors">
                     {stat.label}
                   </p>
                </div>
                
                {/* Decorative bar */}
                <div className="w-12 h-1 bg-accent-green/30 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
