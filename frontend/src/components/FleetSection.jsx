import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, MapPin, Clock } from 'lucide-react';

const FleetSection = () => {
  const { t } = useTranslation();
  const [currentStyle, setCurrentStyle] = React.useState(0);

  const vanStyles = [
    '/assets/cecasa-van.webp',
    '/assets/cecasa-van-eixample.png',
    '/assets/cecasa-van-park.png',
    '/assets/cecasa-van-modern.png',
    '/assets/cecasa-van-residential.png'
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStyle((prev) => (prev + 1) % vanStyles.length);
    }, 800);
    return () => clearInterval(timer);
  }, [vanStyles.length]);

  return (
    <section className="py-24 md:py-32 relative overflow-visible bg-white">
      {/* Skewed Background - Technical light blue stripe */}
      <div 
        className="absolute inset-0 -skew-y-3 origin-center transform scale-y-110 z-0 bg-[#eef7ff] border-y border-primary-blue/5 shadow-[0_0_50px_rgba(0,0,0,0.02)]" 
      >
         {/* Subtle Technical Pattern */}
         <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20px_20px,var(--color-primary-blue)_1px,transparent_0)] bg-[length:40px_40px]"></div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Visual/Image Side */}
        <div className="relative group perspective-1000">
           <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl transition-transform duration-700 group-hover:rotate-y-6 aspect-square">
             {vanStyles.map((style, i) => (
               <img 
                 key={i}
                 src={style} 
                 alt="CECSA Service Fleet Barcelona" 
                 className={`absolute inset-0 w-full h-full object-cover ${i === currentStyle ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
               />
             ))}
             <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/20 to-transparent opacity-40"></div>
           </div>
           
           {/* Speed Tag */}
           <div className="absolute top-8 left-8 p-4 glass rounded-2xl flex items-center space-x-3 z-20 shadow-xl">
              <div className="p-3 bg-accent-green rounded-xl text-white">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-secondary-gray/50">Tiempo de Respuesta</p>
                <p className="text-primary-blue font-black tracking-tight underline-offset-4 decoration-accent-green">Menos de 2h</p>
              </div>
           </div>
        </div>

        {/* Text Section Side */}
        <div className="space-y-8 lg:pl-12">
          <div className="space-y-4">
             <h2 className="text-4xl md:text-5xl font-black text-primary-blue leading-tight tracking-tighter">
               {t('fleet.title', 'Protegemos tu entorno en cualquier rincón de Catalunya')}
             </h2>
             <p className="text-lg text-secondary-gray/80 leading-relaxed font-light">
               {t('fleet.desc', 'Nuestra flota técnica está distribuida estratégicamente para ofrecer una cobertura inmediata en Barcelona, Girona, Tarragona y Lleida. Cada unidad móvil es un laboratorio técnico avanzado.')}
             </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 pt-4">
             <div className="space-y-3">
                <div className="flex items-center space-x-2 text-primary-blue font-bold">
                   <MapPin size={20} className="text-accent-green" />
                   <span>Provincias</span>
                </div>
                <div className="flex flex-wrap gap-2">
                   {['Barcelona', 'Tarragona', 'Girona', 'Lleida'].map(prov => (
                     <span key={prov} className="px-3 py-1 bg-white rounded-lg text-xs font-bold text-secondary-gray shadow-sm border border-primary-blue/5">
                        {prov}
                     </span>
                   ))}
                </div>
             </div>

             <div className="space-y-3">
                <div className="flex items-center space-x-2 text-primary-blue font-bold">
                   <Truck size={20} className="text-accent-green" />
                   <span>Capacidad</span>
                </div>
                <p className="text-sm font-medium text-secondary-gray/60 italic">
                  Intervenciones simultáneas en múltiples sectores para máxima eficiencia.
                </p>
             </div>
          </div>

          <div className="pt-6">
            <button className="px-10 py-5 rounded-2xl bg-primary-blue text-white font-black text-lg shadow-xl hover:translate-y-[-4px] transition-all duration-300">
               Ver Unidades Disponibles
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FleetSection;
