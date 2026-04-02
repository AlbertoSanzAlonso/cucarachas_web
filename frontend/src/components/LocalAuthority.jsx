import { MapPin, ShieldCheck, Users, Award, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Años en Barcelona', value: '+20', icon: <Award className="text-primary-blue" /> },
  { label: 'Servicios Realizados', value: '15k', icon: <CheckCircle2 className="text-primary-blue" /> },
  { label: 'Técnicos Expertos', value: '12', icon: <Users className="text-primary-blue" /> }
];

const LocalAuthority = () => {
  return (
    <section className="bg-white py-24">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-blue-light rounded-full text-secondary-gray text-[10px] font-black uppercase tracking-widest mb-6">
              <MapPin size={14} className="text-primary-blue" />
              Liderazgo Local en Barcelona
            </div>
            
            <h2 className="text-secondary-gray mb-8">Autoridad Sanitaria en el <span className="text-primary-blue">Área Metropolitana</span></h2>
            
            <p className="text-lg text-text-muted mb-10 leading-relaxed">
              En CECSA, no solo eliminamos plagas; restauramos la seguridad sanitaria de su entorno. Somos la empresa de referencia para comunidades y negocios en <span className="text-secondary-gray font-bold">Eixample, Gràcia, y Sant Cugat</span>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-bg-light p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                  <div className="flex justify-center mb-4">{stat.icon}</div>
                  <div className="text-3xl font-black text-secondary-gray">{stat.value}</div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:w-1/2 relative"
          >
            <div className="glass rounded-[3rem] p-4 shadow-2xl relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1464938837314-84f1486d4818?auto=format&fit=crop&q=80&w=800" 
                alt="Barcelona Skyline Sanitary Control" 
                className="rounded-[2.5rem] w-full h-[400px] object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-[280px]">
                <ShieldCheck className="text-primary-blue mb-4" size={40} />
                <p className="text-sm font-bold text-secondary-gray leading-snug">Empresa autorizada por la Generalitat de Catalunya</p>
                <p className="text-[10px] font-black text-primary-blue mt-2 uppercase tracking-widest">ROESB: 0246-CAT-SB</p>
              </div>
            </div>
            {/* Background design */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-blue/5 rounded-full blur-[80px]"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LocalAuthority;
