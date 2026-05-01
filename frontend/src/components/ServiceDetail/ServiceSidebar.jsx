import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Users } from 'lucide-react';

const ServiceSidebar = ({ id, sectorData, sectorIcons, t }) => {
  return (
    <div className="space-y-8">
      <div className="sticky top-40 space-y-8">
         <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 text-center space-y-8 overflow-hidden relative group">
            {/* Background Operadora (Very Subtle) */}
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none group-hover:opacity-[0.12] transition-opacity duration-700">
               <img 
                  src="/assets/atencion-cliente-cucarachas-barcelona.png" 
                  alt="Atenció al client CECSA Control de Plagues" 
                  className="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-1000"
               />
            </div>
            <div className="space-y-2 relative z-10">
               <h3 className="text-3xl font-black text-primary-gray tracking-tighter leading-none">{t('service_detail_page.active_protection')}</h3>
               <p className="text-secondary-gray/50 text-xs font-bold uppercase tracking-widest">{t('service_detail_page.free_diagnosis')}</p>
            </div>
            
            <div className="space-y-4 relative z-10">
               <button 
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full py-5 px-4 bg-primary-blue text-white font-black text-lg md:text-xl rounded-2xl shadow-xl flex items-center justify-center group/btn leading-tight text-center"
               >
                  <Zap className="mr-2 text-accent-green fill-accent-green/20 group-hover:rotate-12 transition-transform shrink-0 w-6 h-6" />
                  <span>{t('common.cta_free')}</span>
               </button>
               <a href="tel:+34933309169" className="w-full py-5 px-4 bg-bg-light border border-gray-200 text-primary-blue font-black text-lg md:text-xl rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-colors text-center">
                  {t('common.cta_call')}
               </a>
            </div>
         </div>

         {/* Other Sectors Navigation for SEO and UX */}
         <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-blue/40 border-b border-gray-100 pb-4">
               {t('sectors_grid.title')}
            </h4>
            <div className="space-y-3">
               {Object.keys(sectorData).map((key) => (
                  <Link 
                     key={key} 
                     to={`/serveis/${key}`}
                     className={`flex items-center space-x-3 p-3 rounded-2xl transition-all ${id === key ? 'bg-primary-blue/5 text-primary-blue font-black' : 'hover:bg-bg-light text-secondary-gray'}`}
                  >
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${id === key ? 'bg-primary-blue text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {React.cloneElement(sectorIcons[key] || <Users />, { size: 16 })}
                     </div>
                     <span className="text-sm">{sectorData[key].title}</span>
                  </Link>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default ServiceSidebar;
