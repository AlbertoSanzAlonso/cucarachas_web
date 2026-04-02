import { Phone, Mail, MapPin, Send, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  const [status, setStatus] = useState('idle');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <section id="contacto" className="bg-bg-light py-24">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Info Side */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-2/5"
          >
            <p className="text-primary-blue font-black uppercase tracking-[0.3em] text-xs mb-4">Contacto Directo</p>
            <h2 className="text-secondary-gray mb-8 text-4xl md:text-5xl font-bold">Solicite su <span className="text-primary-blue">Presupuesto</span></h2>
            <p className="text-lg text-text-muted mb-12">
              Atención inmediata para urgencias y servicios programados en toda el Área Metropolitana de Barcelona. Respuesta garantizada en menos de 24h.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-all">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Teléfono 24h</p>
                  <a href="tel:933309169" className="text-xl font-black text-secondary-gray hover:text-primary-blue transition-colors">933 309 169</a>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-all">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Email Oficial</p>
                  <a href="mailto:info@cecsasanidad.com" className="text-xl font-black text-secondary-gray hover:text-primary-blue transition-colors underline decoration-primary-blue/30">info@cecsasanidad.com</a>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-all">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Sede Central</p>
                  <p className="text-lg font-bold text-secondary-gray">Carrer dels Rajolers, 16-18 <br /> 08028 Barcelona</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-white rounded-2xl border border-primary-blue/10 shadow-sm flex items-center gap-4">
              <ShieldCheck className="text-primary-blue" size={32} />
              <div>
                <p className="text-xs font-black text-secondary-gray uppercase tracking-widest">Garantía Certificada</p>
                <p className="text-xs text-text-muted">Cumplimiento estricto del ROESB</p>
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-3/5"
          >
            <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-2xl border border-gray-50">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondary-gray uppercase tracking-widest ml-1">Nombre Completo</label>
                    <input type="text" placeholder="Ej. Juan Pérez…" required className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondary-gray uppercase tracking-widest ml-1">Teléfono</label>
                    <input type="tel" placeholder="Ej. 600 000 000…" required className="w-full" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-secondary-gray uppercase tracking-widest ml-1">Correo Electrónico</label>
                  <input type="email" placeholder="Ej. juan@empresa.com…" required className="w-full" spellCheck="false" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-secondary-gray uppercase tracking-widest ml-1">Consulta</label>
                  <textarea placeholder="Cuéntenos su caso para un presupuesto exacto…" rows="4" className="w-full"></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'sending'}
                  className="btn btn-primary w-full py-5 text-sm shadow-2xl group"
                >
                  {status === 'success' ? '¡Mensaje Enviado!' : 'Solicitar Presupuesto Gratuito'}
                  <Send size={20} className={`transition-transform ${status === 'sending' ? 'animate-pulse' : 'group-hover:translate-x-2'}`} />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
