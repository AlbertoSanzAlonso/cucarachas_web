import { ArrowRight, ShieldCheck, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-blue opacity-10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-blue-deep opacity-10 rounded-full blur-[100px]"></div>
      
      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:w-1/2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary-blue animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-primary-blue">ROESB: 0246-CAT-SB</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 text-white text-gradient">
              Control de Plagas <br />
              <span className="text-white">en Barcelona</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted mb-10 leading-relaxed max-w-xl">
              Restauramos el equilibrio de su entorno con <span className="text-white font-semibold">eficiencia discreta</span>. 
              Especialistas en desinsectación de cucarachas para hogares y negocios en toda el Área Metropolitana.
            </p>
            
            <div className="flex flex-wrap gap-5 mb-12">
              <a href="#contacto" className="btn btn-primary px-10 py-5 text-lg flex items-center gap-3">
                Presupuesto Gratuito <ArrowRight size={22} />
              </a>
              <a href="#servicios" className="btn btn-secondary px-10 py-5 text-lg">
                Nuestros Servicios
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-primary-blue" size={24} />
                <span className="text-sm font-bold uppercase tracking-tight text-text-dim">Garantía Escrita</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-primary-blue" size={24} />
                <span className="text-sm font-bold uppercase tracking-tight text-text-dim">Atención 24h</span>
              </div>
              <div className="flex items-center gap-3">
                <Award className="text-primary-blue" size={24} />
                <span className="text-sm font-bold uppercase tracking-tight text-text-dim">Técnicos Certificados</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="lg:w-1/2 relative"
          >
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src="/assets/hero.png" 
                alt="Control de Plagas Profesional en Barcelona" 
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/60 to-transparent"></div>
            </div>
            
            {/* Floating Stats Card */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 glass p-6 rounded-2xl border border-white/10 shadow-2xl z-20 backdrop-blur-3xl hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary-blue/20 p-3 rounded-xl">
                  <ShieldCheck className="text-primary-blue" size={32} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">+20 Años</div>
                  <div className="text-xs text-muted uppercase tracking-wider">Liderazgo en el sector</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
