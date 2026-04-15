import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bug, Droplets, ShieldAlert, Zap, Search, Fingerprint, Ban, Activity } from 'lucide-react';

const PestGrid = () => {
  const { t } = useTranslation();

  const species = [
    { id: 'germanic', name: t('species.germanica'), icon: <Bug />, color: 'var(--color-primary-blue)', desc: 'La más común en cocinas y viviendas.' },
    { id: 'american', name: t('species.americana'), icon: <Fingerprint />, color: 'var(--color-accent-green)', desc: 'Grande, rojiza y experta en alcantarillado.' },
    { id: 'oriental', name: t('species.orientalis'), icon: <Droplets />, color: '#ffffff', desc: 'Negra y robusta, prefiere zonas frescas.', darkText: true },
    { id: 'banded', name: 'Cucaracha Banda Café', icon: <Bug />, color: '#111827', desc: 'Pequeña, prefiere muebles y techos.' },
    { id: 'disinfect', name: 'Monitoreo', icon: <Activity />, color: '#ffffff', desc: 'Seguimiento continuo', darkText: true },
    { id: 'nests', name: 'Eliminación de Nidos', icon: <Zap />, color: '#111827', desc: 'Localización y sellado termitas.' },
    { id: 'prevent', name: 'Barreras Biológicas', icon: <ShieldAlert />, color: 'var(--color-primary-blue)', desc: 'Tratamientos residuales de larga duración.' },
    { id: 'urgent', name: 'Control Térmico', icon: <Ban />, color: 'var(--color-accent-green)', desc: 'Eliminación por calor sin químicos.' }
  ];

  return (
    <section className="py-24 bg-bg-light" id="species">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
        
        <div className="max-w-3xl mx-auto space-y-4">
           <h2 className="text-4xl md:text-5xl font-black text-primary-blue tracking-tighter">
             {t('species.title')}
           </h2>
           <p className="text-secondary-gray/80 text-lg font-light">
             Soluciones radicales para cada especie. Identificamos el foco y eliminamos la plaga de raíz.
           </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-6">
           {species.map((pest, i) => (
             <div 
               key={pest.id} 
               className={`group relative overflow-hidden rounded-[1rem] md:rounded-[2rem] aspect-square flex flex-col items-center justify-center p-4 md:p-8 transition-all duration-500 hover:shadow-2xl hover:translate-y-[-8px] cursor-pointer ${pest.darkText ? 'border border-primary-gray/10' : ''}`}
               style={{ background: pest.color }}
             >
                 {/* Visual Icon */}
                 <div className={`mb-3 md:mb-6 transform transition-transform duration-500 group-hover:scale-110 drop-shadow-lg ${pest.darkText ? 'text-primary-blue' : 'text-white'}`}>
                    {React.cloneElement(pest.icon, { 
                      size: 32, 
                      strokeWidth: 1.5 
                    })}
                 </div>

                <div className="text-center space-y-1 md:space-y-2 px-2">
                   <h3 className={`font-extrabold text-xs md:text-xl tracking-tight leading-tight transition-all duration-300 ${pest.darkText ? 'text-primary-blue' : 'text-white'}`}>
                     {pest.name}
                     {pest.subName && (
                       <span className="block text-[8px] md:text-sm font-medium opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto transition-all duration-500 overflow-hidden mt-1 px-1">
                         {pest.subName}
                       </span>
                     )}
                   </h3>
                   <span className={`text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em] ${pest.darkText ? 'text-primary-blue/60' : 'text-white/70'}`}>Ver Tratamiento</span>
                </div>

                {/* Hover Description Overlay */}
                <div className="absolute inset-x-4 bottom-4 glass p-4 rounded-xl opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                   <p className="text-[10px] font-bold text-primary-gray leading-tight">
                     {pest.desc}
                   </p>
                </div>
                
                {/* Corner Decoration */}
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                   <Search size={40} className={pest.darkText ? 'text-primary-blue' : 'text-white'} />
                </div>
             </div>
           ))}
        </div>

      </div>
    </section>
  );
};

export default PestGrid;
