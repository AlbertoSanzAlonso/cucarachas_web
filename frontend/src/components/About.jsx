import { ShieldCheck, Target, Heart, Eye, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const values = [
  { title: 'Excelencia Técnica', desc: 'Protocolos basados en evidencia científica aplicada.', icon: <Target className="text-primary-blue" /> },
  { title: 'Compromiso Ético', desc: 'Actuamos con conciencia ambiental y social.', icon: <Heart className="text-secondary-gray" /> },
  { title: 'Transparencia', desc: 'Certificaciones oficiales y reportes detallados.', icon: <CheckCircle2 className="text-primary-blue" /> }
];

const About = () => {
  return (
    <section id="nosotros" className="bg-bg-light overflow-hidden py-24 lg:py-36">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <p className="text-primary-blue font-black uppercase tracking-[0.3em] text-xs mb-4">Nuestra Filosofía</p>
            <h2 className="text-secondary-gray mb-8">Aceptar para actuar con <span className="text-primary-blue">conciencia</span></h2>
            
            <div className="space-y-6 mb-6">
              <p className="text-lg text-text-muted leading-relaxed">
                Fundada en Barcelona, CECSA nace de la necesidad de elevar los estándares de sanidad ambiental. No solo gestionamos plagas; entendemos el ecosistema urbano para intervenir de forma inteligente y sostenible.
              </p>
              <div className="bg-white p-6 rounded-2xl border-l-4 border-primary-blue shadow-sm italic text-secondary-gray">
                "Nuestra misión es restaurar el equilibrio sanitario en cada espacio, integrando tecnología punta con un profundo respeto por el entorno."
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              {values.slice(0, 2).map((v, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="p-1">{v.icon}</div>
                  <div>
                    <h4 className="font-bold text-secondary-gray mb-1">{v.title}</h4>
                    <p className="text-xs text-text-muted leading-snug">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-5 p-6 glass rounded-2xl border border-white/5">
              <ShieldCheck className="text-primary-blue shrink-0 mr-2" size={40} />
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
