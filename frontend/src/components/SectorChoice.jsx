import { Home, Building2, ChevronRight, Users2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SectorChoice = () => {
  return (
    <section className="relative py-24 bg-bg-dark overflow-hidden">
      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Residential */}
          <motion.div 
            whileHover={{ y: -15 }}
            className="lg:w-1/2 group cursor-pointer glass p-12 md:p-20 rounded-[3rem] border border-white/5 hover:border-primary-blue/30 shadow-2xl transition-all duration-500 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-blue opacity-[0.03] rounded-full blur-3xl -mr-16 -mt-16 group-hover:opacity-10 transition-opacity"></div>
            
            <div className="bg-primary-blue/10 p-6 rounded-2xl w-fit mb-10 group-hover:scale-110 group-hover:bg-primary-blue group-hover:text-white transition-all duration-500 text-primary-blue">
              <Home size={40} />
            </div>
            
            <h3 className="text-4xl font-black text-white mb-6 tracking-tight">Hogares y Particulares</h3>
            <p className="text-muted text-lg mb-10 leading-relaxed max-w-sm">
              Protegemos su hogar y familia con eficiencia discreta. <span className="text-white font-semibold">Técnicos especialistas en Barcelona</span> para desinsectación inmediata de cucarachas y roedores.
            </p>
            
            <a href="#contacto" className="btn btn-primary px-8 py-4 flex items-center gap-3 w-fit group-hover:gap-5 transition-all">
              Soluciones Residenciales <ChevronRight size={20} />
            </a>
          </motion.div>

          {/* Business */}
          <motion.div 
            whileHover={{ y: -15 }}
            className="lg:w-1/2 group cursor-pointer bg-bg-surface p-12 md:p-20 rounded-[3rem] border border-white/5 hover:border-primary-blue/30 shadow-2xl transition-all duration-500 overflow-hidden relative"
          >
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-blue opacity-[0.03] rounded-full blur-3xl -mb-20 -mr-20 group-hover:opacity-10 transition-opacity"></div>

            <div className="bg-primary-blue/10 p-6 rounded-2xl w-fit mb-10 group-hover:scale-110 group-hover:bg-primary-blue group-hover:text-white transition-all duration-500 text-primary-blue">
              <Building2 size={40} />
            </div>
            
            <h3 className="text-4xl font-black text-white mb-6 tracking-tight">Empresas y HORECA</h3>
            <p className="text-muted text-lg mb-10 leading-relaxed max-w-sm">
              Certificados sanitarios oficiales en 24h. <span className="text-white font-semibold">Cumplimiento ROESB</span> garantizado para hostelería, oficinas y comunidades en toda la provincia.
            </p>
            
            <a href="#contacto" className="btn btn-secondary px-8 py-4 flex items-center gap-3 w-fit group-hover:gap-5 transition-all">
              Soluciones para Negocios <ChevronRight size={20} />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SectorChoice;
