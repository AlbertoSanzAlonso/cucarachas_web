import { useState } from 'react';
import axios from 'axios';
import { Send, Phone, Mail, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      // NOTE: Update the URL to your Supabase/Backend production endpoint if needed
      await axios.post('http://localhost:8000/api/contacts/', formData);
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  return (
    <section id="contacto" className="relative py-24 bg-bg-dark overflow-hidden">
      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-2/5"
          >
            <span className="text-primary-blue font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Presupuesto sin compromiso</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Hablemos de su tranquilidad</h2>
            <p className="text-muted text-lg mb-12 leading-relaxed">
              ¿Ha detectado una plaga? Solicite una inspección técnica gratuita. Nuestros expertos en <span className="text-white font-semibold">Barcelona</span> le darán respuesta en menos de 24 horas.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-center gap-6 p-6 glass rounded-2xl border border-white/5 hover:border-primary-blue/30 transition-colors group">
                <div className="bg-primary-blue/10 p-4 rounded-xl text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-all">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white uppercase text-xs tracking-widest mb-1">Central Barcelona</h4>
                  <p className="text-xl font-bold text-white/90">933 309 169</p>
                </div>
              </div>

              <div className="flex items-center gap-6 p-6 glass rounded-2xl border border-white/5 hover:border-primary-blue/30 transition-colors group">
                <div className="bg-primary-blue/10 p-4 rounded-xl text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-all">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white uppercase text-xs tracking-widest mb-1">Email Oficial</h4>
                  <p className="text-lg font-bold text-white/90">info@cecsaddd.com</p>
                </div>
              </div>

              <div className="flex items-center gap-6 p-6 glass rounded-2xl border border-white/5 hover:border-primary-blue/30 transition-colors group">
                <div className="bg-primary-blue/10 p-4 rounded-xl text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-all">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white uppercase text-xs tracking-widest mb-1">Sede Central</h4>
                  <p className="text-muted">Carrer dels Rajolers, 16, 08028 BCN</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 flex items-center gap-4 text-primary-blue font-bold px-6 py-4 glass rounded-xl border border-primary-blue/20">
              <ShieldCheck size={24} />
              <div className="text-[10px] uppercase tracking-widest">Acreditación Sanitaria ROESB: 0246-CAT-SB</div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-3/5"
          >
            <div className="glass p-10 md:p-14 rounded-[3rem] border border-white/10 shadow-2xl relative">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-10"
                  >
                    <div className="w-24 h-24 bg-primary-blue text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-primary-blue/40">
                      <CheckCircle size={48} />
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-6">Solicitud Recibida</h3>
                    <p className="text-muted text-lg mb-10 max-w-md">
                      Gracias por confiar en CECSA. Un técnico especialista en su zona contactará con usted en breve para restaurar el equilibrio de su espacio.
                    </p>
                    <button 
                      onClick={() => setStatus('idle')}
                      className="btn btn-secondary"
                    >
                      Realizar otra consulta
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit} 
                    className="flex flex-col gap-10"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="flex flex-col gap-3">
                        <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted ml-1">Nombre Completo</label>
                        <input 
                          type="text" 
                          id="name" 
                          name="name"
                          autoComplete="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="p. ej. Marc Pérez García…"
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted ml-1">Teléfono de Contacto</label>
                        <input 
                          type="tel" 
                          id="phone" 
                          name="phone"
                          autoComplete="tel"
                          inputMode="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          placeholder="600 000 000…"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted ml-1">Correo Electrónico</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email"
                        autoComplete="email"
                        spellCheck={false}
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="usuario@dominio.com…"
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-muted ml-1">Detalle del Problema / Plaga Detectada</label>
                      <textarea 
                        id="message" 
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="4"
                        placeholder="Describa brevemente la situación o el tipo de plaga observado…"
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={status === 'loading'}
                      className="btn btn-primary py-5 text-lg flex items-center justify-center gap-3 w-full"
                    >
                      {status === 'loading' ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>Enviar Solicitud Técnica <Send size={20} /></>
                      )}
                    </button>
                    
                    {status === 'error' && (
                      <p className="text-red-400 text-center font-bold text-sm bg-red-400/10 py-3 rounded-lg border border-red-400/20">
                        Error en el envío. Por favor, contacte directamente vía telefónica.
                      </p>
                    )}
                    
                    <p className="text-[10px] text-muted text-center tracking-tight">
                      Al enviar, acepta nuestra política de privacidad conforme al RGPD para la gestión de su solicitud técnica.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
