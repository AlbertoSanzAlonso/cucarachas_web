import { ShieldCheck, Phone, ChevronRight, Activity, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-bg-light py-20 lg:py-32">
      {/* Abstract background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-blue/5 blur-[120px] rounded-full -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-primary-blue/10 blur-[100px] rounded-full -ml-10 -mb-10"></div>

      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-3/5"
          >
            <div className="flex items-center gap-3 mb-6 bg-white w-fit px-4 py-2 rounded-full shadow-sm border border-primary-blue/10">
              <ShieldCheck className="text-primary-blue" size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary-gray">Acreditación Sanitaria ROESB: 0246-CAT-SB</span>
            </div>
            
            <h1 className="font-serif text-5xl lg:text-7xl font-bold text-secondary-gray leading-[1.1] mb-8 tracking-tighter">
              Control de Plagas <br />
              <span className="text-primary-blue font-sans font-black">Científico y Consciente</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-text-muted mb-10 max-w-2xl leading-relaxed">
              Restauramos el equilibrio de su entorno con precisión técnica y total discreción. Especialistas en <span className="text-secondary-gray font-bold underline decoration-primary-blue/30">Barcelona</span> para hogares, empresas y sector alimentario.
            </p>
            
            <div className="flex flex-wrap gap-5 mb-12">
              <a href="#contacto" className="btn btn-primary shadow-xl">
                Pedir Presupuesto Gratuito <ChevronRight size={20} />
              </a>
              <a href="#servicios" className="btn btn-secondary">
                Ver todos los servicios
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="text-primary-blue"><Clock size={24} /></div>
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest text-muted">Respuesta</p>
                  <p className="text-sm font-black text-secondary-gray">Menos de 24h</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-primary-blue"><Users size={24} /></div>
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest text-muted">Experiencia</p>
                  <p className="text-sm font-black text-secondary-gray">+20 Años</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-primary-blue"><Activity size={24} /></div>
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest text-muted">Eficacia</p>
                  <p className="text-sm font-black text-secondary-gray">100% Garantizada</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:w-2/5 relative"
          >
            <div className="relative z-10 bg-white p-4 rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden transform lg:rotate-3">
               <img 
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800" 
                alt="Sanitary Pest Control Service" 
                className="w-full h-auto rounded-[2.5rem]"
                loading="eager"
               />
               <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/50 shadow-xl">
                 <p className="text-[10px] font-black uppercase text-primary-blue mb-1">Empresa Certificada</p>
                 <p className="text-lg font-bold text-secondary-gray leading-tight">Garantía Sanitaria <br /> CECSA PROTECT</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
