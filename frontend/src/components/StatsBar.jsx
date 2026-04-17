import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, UserCheck, ShieldCheck, Zap } from 'lucide-react';

const StatsBar = () => {
  const { t } = useTranslation();

  const stats = [
    { id: 'years', value: '+15', label: t('stats_bar.years'), icon: <Calendar /> },
    { id: 'services', value: '12k+', label: t('stats_bar.services'), icon: <UserCheck /> },
    { id: 'guarantee', value: '100%', label: t('stats_bar.guarantee'), icon: <ShieldCheck /> },
    { id: 'response', value: '<2h', label: t('stats_bar.response'), icon: <Zap /> }
  ];

  return (
    <section className="relative overflow-visible py-32 md:py-48 z-20">


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
