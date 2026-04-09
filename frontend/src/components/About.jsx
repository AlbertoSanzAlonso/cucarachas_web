import { ShieldCheck, Target, Heart, Eye, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const values = [
  { title: 'Excelencia Técnica', desc: 'Protocolos basados en evidencia científica aplicada.', icon: <Target className="text-primary-blue" /> },
  { title: 'Compromiso Ético', desc: 'Actuamos con conciencia ambiental y social.', icon: <Heart className="text-secondary-gray" /> },
  { title: 'Transparencia', desc: 'Certificaciones oficiales y reportes detallados.', icon: <CheckCircle2 className="text-primary-blue" /> }
];

const About = () => {
  const { t } = useTranslation();

  const values = [
    { title: t('about.excelence_title'), desc: t('about.excelence_desc'), icon: <Target size={32} className="text-primary-blue" /> },
    { title: t('about.ethics_title'), desc: t('about.ethics_desc'), icon: <Heart size={32} className="text-secondary-gray" /> },
  ];

  return (
    <section id="nosotros" className="bg-bg-light overflow-hidden py-24 lg:py-36">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Side: Image Authority */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 relative"
          >
            <div className="relative z-10 bg-white p-3 rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden">
              <img 
                src="/assets/Tècnics de CECSA a Barcelona.webp" 
                alt="Tècnics de CECSA realitzant una inspecció a Barcelona" 
                className="w-full h-auto rounded-[2.8rem] object-cover"
                style={{ aspectRatio: '3/2', objectPosition: 'center' }}
              />
              {/* Authority badge over image */}
              <div className="absolute top-10 right-10 bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl shadow-lg border border-white/20 z-20 hidden md:flex items-center gap-3">
                 <ShieldCheck className="text-accent-green" size={24} />
                 <div className="flex flex-col text-left">
                   <span className="text-[10px] font-black uppercase text-secondary-gray tracking-widest leading-none">{t('about.cert_title')}</span>
                   <span className="text-[11px] font-black text-primary-heading text-primary-blue leading-none mt-1">ROESB: 0246-CAT-SB</span>
                 </div>
              </div>
           </div>
           {/* Background accent */}
           <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary-blue/5 rounded-full blur-[100px] -z-10"></div>
         </motion.div>

         {/* Right Side: Solución Content */}
         <motion.div 
           initial={{ opacity: 0, x: 40 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           className="lg:w-1/2"
         >
           <p className="text-primary-blue font-black uppercase tracking-[0.3em] text-[10px] mb-4 bg-primary-blue/5 w-fit px-4 py-1.5 rounded-full">{t('about.badge')}</p>
           <h2 className="text-3xl md:text-5xl font-black text-secondary-gray mb-8 leading-[1.12] tracking-tight uppercase">
             {t('about.title_part1')}
             <span className="text-primary-blue block md:inline">{t('about.title_accent')}</span>
           </h2>
            
            <div className="space-y-6 mb-10 text-left">
              <p className="text-lg text-text-muted leading-relaxed font-bold opacity-80 uppercase tracking-tight">
                {t('about.desc')}
              </p>
              
              <div className="bg-white p-8 rounded-[2.5rem] border-l-4 border-primary-blue shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <p className="font-black text-xs uppercase tracking-widest text-primary-blue mb-6 border-b border-primary-blue/10 pb-4 inline-block">{t('about.steps_title')}</p>
                  <ul className="space-y-4">
                    {t('about.steps', { returnObjects: true }).map((step, i) => (
                      <li key={i} className="flex items-center gap-4 text-xs font-black text-secondary-gray uppercase tracking-tight">
                        <CheckCircle2 size={18} className="text-accent-green shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-8 text-primary-blue font-black tracking-tight text-sm uppercase italic">{t('about.hook')}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              {values.map((v, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="p-0 transition-transform duration-300 group-hover:scale-110 shrink-0">{v.icon}</div>
                  <div>
                    <h4 className="font-black text-secondary-gray mb-1 uppercase text-sm tracking-tight">{v.title}</h4>
                    <p className="text-xs text-text-muted font-bold leading-snug opacity-80 uppercase leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;
