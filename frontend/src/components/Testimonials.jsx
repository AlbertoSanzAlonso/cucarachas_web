import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Quote, ChevronLeft, ChevronRight, User } from 'lucide-react';

const Testimonials = () => {
  const { t } = useTranslation();

  const reviews = [
    { id: 'rev1', name: 'Jordi Fernández', text: 'Tenía un problema grave de cucarachas en mi cocina. Vinieron el mismo día y en solo 24h no quedaba rastro. El técnico fue muy profesional y discreto.', source: 'Google', city: 'Barcelona' },
    { id: 'rev2', name: 'Marta Solà', text: 'Servicio excelente para nuestra comunidad de vecinos. El seguimiento después del tratamiento fue clave. Totalmente recomendables.', source: 'Google', city: 'Girona' },
    { id: 'rev3', name: 'Ramon Quesada', text: 'Muy rápidos y eficaces. Los geles que usan no huelen nada y pudimos estar en casa sin problemas. Una tranquilidad total.', source: 'Google', city: 'Tarragona' },
    { id: 'rev4', name: 'Alba Miró', text: 'Impecable. Profesionalidad de principio a fin. Me explicaron todo el proceso antes de empezar y los resultados han sido inmejorables.', source: 'Google', city: 'Barcelona' }
  ];

  return (
    <section className="py-32 md:py-48 bg-bg-light" id="testimonials">
      <div className="max-w-7xl mx-auto px-6 space-y-20">
        
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 pb-10 border-b border-gray-200">
           <div className="space-y-4 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black text-primary-gray tracking-tighter">
                {t('testimonials.title', 'Particulares satisfechos con nuestro servicio')}
              </h2>
              <p className="text-secondary-gray/80 text-lg font-light">
                 La confianza de nuestros clientes es lo que nos define como referentes en el sector.
              </p>
           </div>
           
           <div className="flex flex-col items-end space-y-3">
              <div className="flex items-center space-x-2">
                 {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="#facc15" className="text-yellow-400" />)}
                 <span className="text-2xl font-black text-primary-blue ml-2">4.9/5</span>
              </div>
              <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-[0.2em] text-secondary-gray/40">
                 <img src='https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_"G"_logo.svg' alt="Google" className="w-4 h-4" />
                 <span>Basado en 450+ opiniones</span>
              </div>
           </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
           {reviews.map((rev, i) => (
             <div 
               key={rev.id} 
               className="group flex flex-col justify-between p-8 bg-white rounded-[2rem] border border-gray-100 shadow-xl transition-all duration-500 hover:shadow-2xl hover:translate-y-[-8px] relative overflow-hidden h-full"
             >
                {/* Quote Icon Background */}
                <div className="absolute top-4 right-4 text-primary-blue/5 -z-0">
                   <Quote size={80} fill="currentColor" />
                </div>

                <div className="space-y-6 relative z-10">
                   <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#facc15" className="text-yellow-400" />)}
                   </div>
                   
                   <p className="text-sm font-medium text-secondary-gray/70 leading-relaxed italic line-clamp-4 group-hover:line-clamp-none transition-all duration-500">
                     "{rev.text}"
                   </p>
                </div>

                <div className="pt-8 flex items-center relative z-10 border-t border-gray-50 mt-auto">
                   <div className="flex flex-col">
                      <h4 className="font-black text-primary-blue tracking-tighter leading-none">{rev.name}</h4>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-secondary-gray/40 mt-1">{rev.city} · {rev.source} Review</p>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Navigation Buttons (Desktop Only Show as indicators) */}
        <div className="flex justify-center space-x-4 pt-4">
           <div className="w-12 h-1.5 bg-accent-green rounded-full"></div>
           <div className="w-4 h-1.5 bg-gray-200 rounded-full"></div>
           <div className="w-4 h-1.5 bg-gray-200 rounded-full"></div>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
