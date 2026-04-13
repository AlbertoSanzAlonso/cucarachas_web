import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bug, Droplets, ShieldAlert, Zap, Search, Fingerprint, Ban, ZapOff } from 'lucide-react';

const PestGrid = () => {
  const { t } = useTranslation();

  const species = [
    { id: 'germanic', name: t('species.germanica'), icon: <Bug />, color: '#7ad1ff', desc: 'La más común en cocinas y viviendas.' },
    { id: 'american', name: t('species.americana'), icon: <Fingerprint />, color: '#4a74cc', desc: 'Grande, rojiza y experta en alcantarillado.' },
    { id: 'oriental', name: t('species.orientalis'), icon: <Droplets />, color: '#b5d444', desc: 'Negra y robusta, prefiere zonas frescas.' },
    { id: 'banded', name: 'Cucaracha Banda Café', icon: <Bug />, color: '#a0b52a', desc: 'Pequeña, prefiere muebles y techos.' },
    { id: 'disinfect', name: 'Desinfección COVID/Virus', icon: <Droplets />, color: '#f7931e', desc: 'Nebulización técnica en locales.' },
    { id: 'nests', name: 'Eliminación de Nidos', icon: <Zap />, color: '#e54d4d', desc: 'Localización y sellado termitas.' },
    { id: 'prevent', name: 'Barreras Biológicas', icon: <ShieldAlert />, color: '#f06292', desc: 'Tratamientos residuales de larga duración.' },
    { id: 'urgent', name: 'Control Térmico', icon: <Ban />, color: '#d81b60', desc: 'Eliminación por calor sin químicos.' }
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           {species.map((pest, i) => (
             <div 
               key={pest.id} 
               className="group relative overflow-hidden rounded-[2rem] aspect-square flex flex-col items-center justify-center p-8 transition-all duration-500 hover:shadow-2xl hover:translate-y-[-8px] cursor-pointer"
               style={{ background: pest.color }}
             >
                {/* Visual Icon */}
                <div className="mb-6 transform transition-transform duration-500 group-hover:scale-110 text-white drop-shadow-lg">
                   {React.cloneElement(pest.icon, { size: 48, strokeWidth: 1.5 })}
                </div>

                <div className="text-center space-y-2">
                   <h3 className="text-white font-extrabold text-lg md:text-xl tracking-tight leading-tight">
                     {pest.name}
                   </h3>
                   <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/70">Ver Tratamiento</span>
                </div>

                {/* Hover Description Overlay */}
                <div className="absolute inset-x-4 bottom-4 glass p-4 rounded-xl opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                   <p className="text-[10px] font-bold text-primary-gray leading-tight">
                     {pest.desc}
                   </p>
                </div>
                
                {/* Corner Decoration */}
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                   <Search size={40} className="text-white" />
                </div>
             </div>
           ))}
        </div>

      </div>
    </section>
  );
};

export default PestGrid;
