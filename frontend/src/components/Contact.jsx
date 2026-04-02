import { Phone, Mail, MapPin, Send, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="contacto" className="py-32 bg-bg-light">
        <div className="container max-w-2xl text-center">
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
    <section id="contacto" className="py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-blue/5 rounded-full blur-[140px] -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-blue/5 rounded-full blur-[140px] -ml-64 -mb-64"></div>

      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row gap-24 items-stretch">
          
          <div className="lg:w-2/5 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-blue-light rounded-full text-secondary-gray text-[10px] font-black uppercase tracking-widest mb-10 w-fit">
              <ShieldCheck size={14} className="text-primary-blue" />
              Compromiso de Calidad Sanitaria
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black text-secondary-gray leading-none mb-10 tracking-tighter">
              Solicite su <span className="text-primary-blue">Presupuesto</span> Técnico
            </h2>
            
            <p className="text-xl text-text-muted mb-12 leading-relaxed">
              Obtenga un diagnóstico preliminar y presupuesto detallado para la eliminación garantizada de plagas.
            </p>

            <div className="space-y-10">
              <div className="flex items-start gap-8 group">
                <div className="w-16 h-16 rounded-[1.5rem] bg-bg-light flex items-center justify-center text-primary-heading group-hover:bg-primary-blue group-hover:text-white transition-all shadow-sm border border-gray-100">
                  <Phone size={28} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Línea de Urgencia 24h</div>
                  <a href="tel:933309169" className="text-3xl font-black text-secondary-gray hover:text-primary-blue transition-colors">933 309 169</a>
                </div>
              </div>

              <div className="flex items-start gap-8 group">
                <div className="w-16 h-16 rounded-[1.5rem] bg-bg-light flex items-center justify-center text-primary-heading group-hover:bg-primary-blue group-hover:text-white transition-all shadow-sm border border-gray-100">
                  <Clock size={28} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Servicio Inmediato</div>
                  <div className="text-2xl font-bold text-secondary-gray">Lunes a Domingo — 24h</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-3/5">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-12 lg:p-20 rounded-[4rem] border border-gray-100 shadow-2xl relative shadow-primary-blue/5"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-secondary-gray uppercase tracking-widest ml-1 block">Nombre Completo</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Nombre y apellidos"
                      className="w-full px-6 py-5 bg-bg-light border border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-blue/10 focus:border-primary-blue transition-all outline-none text-secondary-gray shadow-sm text-base"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-secondary-gray uppercase tracking-widest ml-1 block">Teléfono</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="93x xxx xxx"
                      className="w-full px-6 py-5 bg-bg-light border border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-blue/10 focus:border-primary-blue transition-all outline-none text-secondary-gray shadow-sm text-base"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-secondary-gray uppercase tracking-widest ml-1 block">Correo Electrónico</label>
                  <input 
                    type="email" 
                    required
                    placeholder="email@empresa.com"
                    className="w-full px-6 py-5 bg-bg-light border border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-blue/10 focus:border-primary-blue transition-all outline-none text-secondary-gray shadow-sm text-base"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-secondary-gray uppercase tracking-widest ml-1 block">Tipo de Servicio</label>
                  <select 
                    className="w-full px-6 py-5 bg-bg-light border border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-blue/10 focus:border-primary-blue transition-all outline-none text-secondary-gray shadow-sm text-base appearance-none cursor-pointer"
                  >
                    <option>Desinsectación (Cucarachas, Chinches...)</option>
                    <option>Desratización (Ratones, Ratas)</option>
                    <option>Tratamientos de Madera (Termitas, Carcoma)</option>
                    <option>Otros Servicios</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-secondary-gray uppercase tracking-widest ml-1 block">Descripción del Problema</label>
                  <textarea 
                    rows="4"
                    required
                    placeholder="Detalle la situación..."
                    className="w-full px-6 py-5 bg-bg-light border border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-blue/10 focus:border-primary-blue transition-all outline-none text-secondary-gray shadow-sm text-base resize-none"
                  ></textarea>
                </div>

                <div className="flex items-start gap-4 ml-2">
                  <input type="checkbox" required id="privacy" className="mt-1.5 w-5 h-5 rounded border-gray-300 text-primary-blue focus:ring-primary-blue cursor-pointer" />
                  <label htmlFor="privacy" className="text-sm text-text-muted leading-relaxed">
                    Acepto la <a href="#" className="text-primary-blue underline hover:text-secondary-gray font-bold">política de privacidad</a>.
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full btn btn-primary py-8 text-xl font-black flex items-center justify-center gap-6 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    {isSubmitting ? (
                      <span className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        Solicitar Presupuesto Gratuito
                        <Send size={24} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              <div className="mt-16 pt-10 border-t border-gray-100 grid grid-cols-3 gap-6 opacity-50">
                <div className="text-center">
                  <div className="text-[9px] font-black text-secondary-gray uppercase tracking-[0.2em] mb-1">Privacidad</div>
                  <div className="text-[10px] font-bold">RGPD OK</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] font-black text-secondary-gray uppercase tracking-[0.2em] mb-1">Certificación</div>
                  <div className="text-[10px] font-bold">ROESB 0246</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] font-black text-secondary-gray uppercase tracking-[0.2em] mb-1">Respuesta</div>
                  <div className="text-[10px] font-bold">&lt; 24h</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
