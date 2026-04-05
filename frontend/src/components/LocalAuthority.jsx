import { motion } from 'framer-motion';
import { ShieldCheck, Crosshair, HelpCircle, Award, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LocalAuthority = () => {
  const { t } = useTranslation();

  const stats = [
    { icon: <ShieldCheck size={28} />, label: t('authority.stats.years'), val: '+20', color: 'text-primary-blue' },
    { icon: <Crosshair size={28} />, label: t('authority.stats.services'), val: '15k', color: 'text-primary-blue' },
    { icon: <Users size={28} />, label: t('authority.stats.experts'), val: '12', color: 'text-primary-blue' }
  ];

  return (
    <section className="bg-white py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary-blue-light/5 blur-[120px] rounded-full -ml-32 -mt-32"></div>
      
      <div className="container relative z-10 mx-auto px-4">
        {/* DESKTOP FORCED SIDE-BY-SIDE: Stats Left, Image Right */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
          
          {/* Left Column: Stats and Content (40%) */}
          <div className="w-full lg:w-[42%] text-left">
            <div className="bg-primary-blue/5 border border-primary-blue/10 px-4 py-2 rounded-full w-fit mb-8 flex items-center gap-3">
              <Award className="text-primary-blue" size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#3c3c3b]">AUTORITAT SANITÀRIA</span>
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-black text-secondary-gray leading-[0.9] tracking-tighter uppercase mb-2">
              Lideratge <span className="text-primary-blue">Local</span> a <span className="text-primary-blue">Barcelona</span>
            </h2>
            <p className="text-lg text-text-muted font-bold opacity-80 uppercase tracking-tight mb-12 italic">
               Servint des de fa dècades a barris com l'Eixample, Gràcia i Sant Cugat del Vallès.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-6">
              {stats.map((stat, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex items-center gap-6 hover:shadow-xl hover:shadow-primary-blue/5 transition-all duration-300 group"
                >
                  <div className="p-4 bg-bg-light rounded-[1.8rem] text-primary-heading group-hover:bg-primary-blue group-hover:text-white transition-colors duration-300 flex-shrink-0">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-3xl font-black text-secondary-gray leading-none mb-1">{stat.val}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted leading-none">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Illustrative Image (58%) */}
          <div className="w-full lg:w-[58%] relative">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="relative rounded-[4rem] overflow-hidden shadow-2xl border border-gray-100 bg-bg-light"
             >
                <img 
                  src="/assets/barcelona_authority.webp" 
                  alt="Barcelona Skyline" 
                  className="w-full h-auto grayscale-[0.3] hover:grayscale-0 transition-all duration-1000 transform hover:scale-105"
                />
                
                {/* Visual Accent */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/20 to-transparent pointer-events-none"></div>
                
                <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/50 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="p-3 bg-secondary-gray text-white rounded-2xl">
                       <CheckCircle2 size={24} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#3c3c3b] opacity-60 leading-none mb-1">PROXIMITAT I</span>
                        <span className="text-lg font-black text-[#3c3c3b] uppercase leading-none">EQUIP TÈCNIC DIRECTE</span>
                     </div>
                   </div>
                   <div className="hidden sm:flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary-gray">Actiu Avui</span>
                   </div>
                </div>
             </motion.div>
             
             {/* Floating Badge */}
             <div className="absolute -top-6 -right-6 bg-primary-blue text-white p-6 rounded-full shadow-2xl font-black text-xs uppercase tracking-widest leading-tight z-20 border-4 border-white">
                ROESB<br/>
                0234-CAT
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const Users = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

export default LocalAuthority;
