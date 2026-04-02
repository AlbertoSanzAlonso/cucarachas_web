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

  const fieldStyle = {
    width: '100%',
    padding: '18px 20px',
    fontSize: '16px',
    color: '#3c3c3b',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '14px',
    outline: 'none',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    transition: 'border-color 200ms, box-shadow 200ms',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
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
            <div className="inline-flex items-center gap-4 px-4 py-2 bg-primary-blue-light rounded-full text-secondary-gray text-[10px] font-black uppercase tracking-widest mb-10 w-fit">
              <ShieldCheck size={14} className="text-primary-blue flex-shrink-0" style={{ marginRight: '8px' }} />
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
                  <a href="tel:933309169" className="text-3xl font-black transition-colors" style={{ textDecoration: 'none', color: '#0080bb' }}>933 309 169</a>
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
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                {/* Name + Phone row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#3c3c3b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre y apellidos"
                      style={fieldStyle}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#3c3c3b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Teléfono</label>
                    <input
                      type="tel"
                      required
                      placeholder="93x xxx xxx"
                      style={fieldStyle}
                    />
                  </div>
                </div>

                {/* Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#3c3c3b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    placeholder="email@empresa.com"
                    style={fieldStyle}
                  />
                </div>

                {/* Service select */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#3c3c3b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Tipo de Servicio</label>
                  <select style={{ ...fieldStyle, appearance: 'none', cursor: 'pointer' }}>
                    <option>Desinsectación (Cucarachas, Chinches...)</option>
                    <option>Desratización (Ratones, Ratas)</option>
                    <option>Tratamientos de Madera (Termitas, Carcoma)</option>
                    <option>Otros Servicios</option>
                  </select>
                </div>

                {/* Textarea */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#3c3c3b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Descripción del Problema</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Detalle la situación..."
                    style={{ ...fieldStyle, resize: 'none', lineHeight: '1.6' }}
                  />
                </div>

                {/* Privacy checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    required
                    id="privacy"
                    style={{ width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0, cursor: 'pointer', accentColor: '#0080bb' }}
                  />
                  <label htmlFor="privacy" style={{ fontSize: '14px', color: '#888', lineHeight: 1.4 }}>
                    Acepto la <a href="#" style={{ color: '#0080bb', fontWeight: 700 }}>política de privacidad</a>.
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    background: '#0080bb',
                    color: 'white',
                    fontWeight: 900,
                    fontSize: '18px',
                    padding: '22px 32px',
                    borderRadius: '16px',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    marginTop: '8px',
                    opacity: isSubmitting ? 0.7 : 1,
                    transition: 'background 200ms, transform 150ms',
                    boxShadow: '0 8px 32px rgba(0,128,187,0.3)',
                  }}
                  onMouseEnter={e => !isSubmitting && (e.currentTarget.style.background = '#006fa3')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#0080bb')}
                >
                  {isSubmitting ? (
                    <span style={{ width: '28px', height: '28px', border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  ) : (
                    <>
                      Solicitar Presupuesto Gratuito
                      <Send size={22} />
                    </>
                  )}
                </button>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </form>

            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
