import { MapPin, Clock, Navigation, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const LocalAuthority = () => {
  const stats = [
    { label: "Satisfacción", value: "100%", sub: "Garantía Escrita" },
    { label: "Clientes", value: "450k+", sub: "En toda España" },
    { label: "Experiencia", value: "20+", sub: "Años en el Sector" },
    { label: "Sanidad", value: "ROESB", sub: "0246-CAT-SB" }
  ];

  return (
    <section className="relative py-24 bg-bg-dark overflow-hidden">
      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
             <span className="text-primary-blue font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Autoridad Sanitaria Local</span>
             <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Compromiso con Barcelona</h2>
             <p className="text-muted text-lg mb-10 leading-relaxed">
               Desde nuestra sede central en el corazón de Barcelona, coordinamos intervenciones discretas y eficientes. 
               Entendemos los desafíos específicos de barrios como el <span className="text-white font-semibold">Eixample, Sants o Gràcia</span>, y zonas como el <span className="text-white font-semibold">Vallès y el Maresme</span>.
             </p>
             
             <div className="space-y-8 mb-12">
                <div className="flex items-start gap-6">
                  <div className="bg-primary-blue/10 p-4 rounded-xl text-primary-blue border border-primary-blue/20">
                    <MapPin size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xl">Sede Central BARCELONA</h4>
                    <p className="text-muted">Carrer dels Rajolers, 16-18, 08028 Barcelona</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="bg-primary-blue/10 p-4 rounded-xl text-primary-blue border border-primary-blue/20">
                    <Clock size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xl">Operativa 24/7</h4>
                    <p className="text-muted">Atención continuada para urgencias y servicios preventivos.</p>
                  </div>
                </div>
             </div>

             <a 
                href="https://goo.gl/maps/example" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary px-8 py-4 flex items-center gap-3 w-fit"
             >
               <Navigation size={20} /> Cómo llegar a CECSA
             </a>
          </motion.div>
          
          <div className="lg:w-1/2 grid grid-cols-2 gap-6 md:gap-10">
             {stats.map((stat, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass p-10 rounded-[2rem] border border-white/5 flex flex-col items-center text-center group hover:border-primary-blue/30 transition-colors"
                >
                   <span className="text-4xl md:text-5xl font-black text-primary-blue mb-2 group-hover:scale-110 transition-transform">
                    {stat.value}
                   </span>
                   <span className="text-[10px] uppercase font-bold text-muted tracking-[0.2em] mb-1">
                    {stat.label}
                   </span>
                   <span className="text-[9px] text-primary-blue font-bold uppercase tracking-tighter">
                    {stat.sub}
                   </span>
                </motion.div>
             ))}
          </div>
        </div>
      </div>
      
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-blue/5 rounded-full blur-[120px] pointer-events-none"></div>
    </section>
  );
};

export default LocalAuthority;
