import React from 'react';
import { useTranslation } from 'react-i18next';
import { Utensils, Hotel, Users, Factory, ChevronRight } from 'lucide-react';

const SectorGrid = () => {
  const { t } = useTranslation();

  const sectors = [
    { id: 'horeca', name: t('sectors_grid.horeca'), icon: <Utensils /> },
    { id: 'hotels', name: t('sectors_grid.hotels'), icon: <Hotel /> },
    { id: 'comms', name: t('sectors_grid.comms'), icon: <Users /> },
    { id: 'industry', name: t('sectors_grid.industry'), icon: <Factory /> }
  ];

  return (
    <section className="py-24 bg-white" id="sectors">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
        
        <div className="max-w-3xl mx-auto space-y-4">
           <h2 className="text-3xl md:text-5xl font-black text-primary-blue tracking-tight uppercase">
             <span className="inline-block border-b-[8px] md:border-b-[16px] border-accent-green/80 leading-tight pb-1 md:pb-2">
               {t('sectors_grid.title')}
             </span>
           </h2>
           <p className="text-secondary-gray/80 text-lg font-light pt-8">
             {t('sectors_grid.desc')}
           </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
           {sectors.map((sector, i) => (
             <div 
               key={sector.id} 
               className="group p-10 bg-bg-light rounded-[2.5rem] border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:translate-y-[-10px] cursor-pointer relative overflow-hidden"
             >
                {/* Visual Icon with colored circle */}
                <div className="mb-10 mx-auto w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                   <div className="text-primary-blue group-hover:text-accent-green transition-colors duration-500">
                      {React.cloneElement(sector.icon, { size: 40, strokeWidth: 1.5 })}
                   </div>
                </div>

                <div className="space-y-4 text-center">
                   <h3 className="text-primary-blue font-black text-xl tracking-tighter group-hover:text-accent-green transition-colors">
                     {sector.name}
                   </h3>
                   <div className="inline-flex items-center text-[10px] uppercase font-bold tracking-widest text-secondary-gray/40">
                      {t('sectors_grid.cta')} <ChevronRight size={14} className="ml-1" />
                   </div>
                </div>

                {/* Decorative Pattern background */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none">
                   <span className="absolute -bottom-10 -right-10 transform scale-[3] text-primary-blue">
                     {sector.icon}
                   </span>
                </div>
             </div>
           ))}
        </div>

      </div>
    </section>
  );
};

export default SectorGrid;
