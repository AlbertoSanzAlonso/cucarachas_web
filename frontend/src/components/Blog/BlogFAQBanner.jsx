import React from 'react';
import { ChevronRight } from 'lucide-react';

const BlogFAQBanner = () => {
  return (
    <div className="mt-32 relative z-50">
      <div className="max-w-5xl mx-auto">
        <div className="bg-primary-blue p-12 md:p-16 rounded-[4rem] relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-green/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-black text-white leading-none">
                ¿Tienes dudas específicas?
              </h2>
              <p className="text-white/70 font-light leading-relaxed">
                Consulta nuestra sección de preguntas frecuentes para resolver tus inquietudes de forma inmediata o contacta con nuestros técnicos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-accent-green text-primary-blue font-black text-xs tracking-widest uppercase rounded-2xl shadow-lg hover:bg-accent-green-hv transition-all">
                  Ver FAQ
                </button>
                <button 
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="px-8 py-4 bg-white/10 text-white font-black text-xs tracking-widest uppercase rounded-2xl border border-white/10 hover:bg-white/20 transition-all"
                >
                  Contactar
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="p-8 bg-white/5 rounded-3xl border border-white/10 rotate-3">
                 <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-2 rounded-full bg-white/${i === 1 ? '40' : (i === 2 ? '20' : '10')} w-${i === 1 ? 'full' : (i === 2 ? '3/4' : '1/2')}`}></div>
                    ))}
                    <div className="pt-4 flex items-center justify-between">
                       <div className="w-10 h-10 rounded-full bg-accent-green/20"></div>
                       <div className="w-24 h-8 rounded-full bg-accent-green shadow-xl"></div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogFAQBanner;
