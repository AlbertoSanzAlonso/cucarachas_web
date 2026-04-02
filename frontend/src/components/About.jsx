import { CheckCircle2, ShieldCheck, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  const highlights = [
    "Personal especializado (Barcelona / Vallès / Maresme)",
    "Restauración del equilibrio ambiental",
    "Garantía por escrito en cada intervención",
    "Atención inmediata en 24h con certificado",
    "Metodología Científica y Rigor Sanitario",
    "Prevención Post-Tratamiento Permanente"
  ];

  return (
    <section id="nosotros" className="relative bg-bg-card overflow-hidden">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 relative"
          >
            <div className="relative z-10 p-2 glass rounded-[2.5rem] border border-white/10">
              <img 
                src="/assets/professional-technician.png" 
                alt="CEC SANIDAD AMBIENTAL - Profesionales en Barcelona" 
                className="w-full h-auto rounded-[2rem] shadow-2xl"
              />
            </div>
            
            <div className="absolute -bottom-8 -right-8 glass p-8 rounded-2xl border border-white/10 shadow-2xl z-20">
              <div className="text-4xl font-extrabold text-primary-blue mb-1">+20</div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted">Años Liderando</div>
              <div className="text-[10px] text-primary-blue font-bold">Barcelona & Prov.</div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <HeartPulse className="text-primary-blue" size={20} />
              <span className="text-primary-blue font-bold tracking-widest uppercase text-xs">Propósito CECSA</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Aceptar para actuar con conciencia</h2>
            
            <p className="text-lg text-muted mb-10 leading-relaxed italic">
              "Nuestra labor no es solo erradicar, sino comprender. Aceptamos el reto de la convivencia urbana para actuar con la conciencia de restaurar el equilibrio perdido en hogares y empresas de Barcelona."
            </p>
            
            <p className="text-muted mb-12">
              Desde 2006, <strong>CECSA SANIDAD AMBIENTAL</strong> se ha consolidado como la referencia en control de plagas preventivo. No usamos el miedo; usamos la ciencia para proteger su salud y la de los suyos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              {highlights.map((item, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <div className="p-1 rounded-full bg-primary-blue/10 text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-colors">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="font-semibold text-sm text-white/90">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-16 flex items-center gap-8 p-6 glass rounded-2xl border border-white/5">
              <ShieldCheck className="text-primary-blue shrink-0" size={40} />
              <div>
                <div className="text-white font-bold">Certificación ROESB Oficial</div>
                <div className="text-xs text-muted uppercase tracking-tighter">Nº Registro: 0246-CAT-SB</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
