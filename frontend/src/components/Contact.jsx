import { Phone, Mail, MapPin, Send, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1280); // Swap to 3 columns on XL
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const fieldStyle = {
    width: '100%',
    padding: '16px 20px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#3c3c3b',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    outline: 'none',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'all 200ms ease',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  if (submitted) {
    return (
      <section id="contacto" className="py-32 bg-bg-light">
        <div className="container max-w-2xl text-center mx-auto">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-16 rounded-[4rem] shadow-2xl border border-primary-blue/10"
          >
            <div className="w-24 h-24 bg-primary-blue/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary-blue">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl font-black text-secondary-gray mb-4">¡Solicitud Recibida!</h2>
            <p className="text-text-muted text-lg mb-10 leading-relaxed">
              Un técnico especialista de CECSA revisará su caso y le contactará en menos de <span className="text-secondary-gray font-bold">24 horas laborables</span>.
            </p>
            <button 
              onClick={() => setSubmitted(false)} 
              className="btn btn-primary px-12 py-5"
            >
              Volver al Formulario
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="contacto" className="py-24 lg:py-40 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-blue/5 rounded-full blur-[140px] -mr-64 -mt-64"></div>
      
      <div className="container relative z-10 mx-auto px-4">
        {/* TRIPLE COLUMN LAYOUT: Info Left - Form Center - Technician Right */}
        <div className="flex flex-col xl:flex-row gap-16 xl:gap-20 items-stretch">
          
          {/* Left Column: Info Hub (25%) */}
          <div className="xl:w-1/4 flex flex-col justify-center text-left">
            <div className="inline-flex items-center gap-4 px-4 py-2 bg-primary-blue/5 rounded-full text-secondary-gray text-[10px] font-black uppercase tracking-widest mb-10 w-fit border border-primary-blue/10">
              <ShieldCheck size={16} className="text-primary-blue" />
              Compromís de Qualitat
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-black text-secondary-gray leading-[0.8] mb-8 tracking-tighter uppercase transition-all">
              Sol·liciteu el seu <span className="text-primary-blue">Pressupost</span> Gratuït
            </h2>
            
            <p className="text-lg text-text-muted mb-12 leading-relaxed font-medium">
              Obtenga un diagnóstico preliminar y un plan de acción detallado para la eliminación garantizada de plagas.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-bg-light flex items-center justify-center text-primary-heading group-hover:bg-primary-blue group-hover:text-white transition-all shadow-sm border border-gray-100">
                  <Phone size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Línia d'Urgència 24h</div>
                  <a href="tel:933309169" className="text-2xl lg:text-3xl font-black transition-colors" style={{ textDecoration: 'none', color: '#0080bb' }}>933 309 169</a>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-bg-light flex items-center justify-center text-primary-heading group-hover:bg-primary-blue group-hover:text-white transition-all shadow-sm border border-gray-100">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Atenció Immediata</div>
                  <div className="text-xl lg:text-2xl font-bold text-secondary-gray">Dilluns a Diumenge — 24h</div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Conversion Form (50%) */}
          <div className="xl:w-2/4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 lg:p-16 rounded-[4rem] border border-gray-100 shadow-2xl relative shadow-primary-blue/5 overflow-hidden"
            >
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 900, color: '#3c3c3b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Nom Complet</label>
                    <input type="text" required placeholder="Josep García..." style={fieldStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 900, color: '#3c3c3b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Telèfon Directe</label>
                    <input type="tel" required placeholder="600 000 000" style={fieldStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 900, color: '#3c3c3b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Correu Electrònic</label>
                  <input type="email" required placeholder="email@exemple.com" style={fieldStyle} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 900, color: '#3c3c3b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Servei Requerit</label>
                  <select style={{ ...fieldStyle, appearance: 'none', cursor: 'pointer' }}>
                    <option>Desinsectació (Cucarachas, Chchinches...)</option>
                    <option>Desratització (Ratas, Ratolins)</option>
                    <option>Sanitització i Prevenció</option>
                    <option>Altres Serveis Industrials</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 900, color: '#3c3c3b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Descripció del Problema</label>
                  <textarea rows="3" required placeholder="Expliqueu-nos com us podem ajudar..." style={{ ...fieldStyle, resize: 'none', lineHeight: '1.6' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                  <input type="checkbox" required id="privacy" style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0080bb' }} />
                  <label htmlFor="privacy" style={{ fontSize: '13px', color: '#888', fontWeight: 500 }}>Acepto la <a href="#" style={{ color: '#0080bb', fontWeight: 700 }}>política de privacidad</a>.</label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full py-5 text-xl font-black flex items-center justify-center gap-4 mt-4"
                  style={{ backgroundColor: '#0080bb', border: 'none', boxShadow: '0 10px 40px rgba(0,128,187,0.3)' }}
                >
                  {isSubmitting ? (
                    <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Enviar Sol·licitud <Send size={22} /></>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Right Column: Authentic Technician Asset (25%) */}
          <div className="hidden xl:flex xl:w-1/4 flex-col justify-end pb-12">
             <motion.div 
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="relative"
               style={{ perspective: '1000px' }}
             >
                <div className="relative rounded-[3.5rem] overflow-hidden shadow-2xl border border-gray-100 bg-bg-light transform hover:rotate-y-6 transition-transform duration-700">
                   <img 
                     src="/assets/Tècnics de CECSA a Barcelona.webp" 
                     alt="Tècnics de CECSA a Barcelona" 
                     className="w-full h-auto grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/30 to-transparent"></div>
                </div>

                <div className="absolute -bottom-8 -left-8 bg-emerald-500 text-white p-6 rounded-[2rem] shadow-xl z-20 border-4 border-white">
                   <div className="flex flex-col items-start gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none opacity-80">EXPERTS A</span>
                      <span className="text-xl font-black leading-none uppercase italic">BARCELONA</span>
                   </div>
                </div>
                
                {/* Visual Accent */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-blue/5 rounded-full blur-[80px]" />
             </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
