import { Home, Building2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SectorChoice = () => {
  return (
    <section id="sectores" className="py-24 bg-white">
      <div className="container">
        <div className="mb-20">
          <h2 className="text-4xl lg:text-5xl font-black text-secondary-gray leading-none mb-6">
            Soluciones para <span className="text-primary-blue">cada entorno</span>
          </h2>
          <p className="text-text-muted text-lg max-w-2xl leading-relaxed">
            Entendemos que cada espacio requiere un protocolo específico. Diseñamos planes personalizados para garantizar la máxima seguridad sanitaria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Residential */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="flex flex-col bg-bg-light rounded-[2.5rem] p-10 lg:p-16 border border-gray-100 shadow-sm transition-all group"
          >
            <div className="text-primary-blue mb-10 group-hover:scale-110 transition-transform duration-300">
              <Home size={52} />
            </div>
            <h3 className="text-3xl font-black text-secondary-gray mb-6 leading-tight uppercase">Hogares y <br /> Particulares</h3>
            <p className="text-text-muted text-lg mb-10 leading-relaxed font-bold opacity-80 uppercase tracking-tight">
              Protegemos su hogar y su familia con eficiencia y total discreción. Técnicos especializados en Barcelona para desinsectación inmediata de cocinas y baños.
            </p>
            <div className="mt-auto">
              <a href="#contacto" className="btn btn-primary px-8">Solicite información</a>
            </div>
          </motion.div>

          {/* Business */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="flex flex-col bg-secondary-gray text-white rounded-[2.5rem] p-10 lg:p-16 shadow-2xl transition-all group"
          >
            <div className="text-primary-blue mb-10 group-hover:scale-110 transition-transform duration-300">
              <Building2 size={52} />
            </div>
            <h3 className="text-3xl font-black text-white mb-6 leading-tight uppercase">Empresa y <br /> Hostelería</h3>
            <p className="text-white/80 text-lg mb-10 leading-relaxed font-bold uppercase tracking-tight">
              Certificados oficiales en 24h. Cumplimiento ROESB garantizado para hostelería, oficinas y comunidades. Auditorías de sanidad ambiental según normativa RITE.
            </p>
            <div className="mt-auto">
              <a href="#contacto" className="btn btn-primary px-8">Planes para empresas</a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SectorChoice;
