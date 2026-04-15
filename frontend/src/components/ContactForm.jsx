import React from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Phone, MapPin, Mail, Clock } from 'lucide-react';

const ContactForm = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 relative overflow-hidden" 
      style={{ 
        background: 'linear-gradient(135deg, rgba(0, 128, 187, 0.96) 0%, rgba(0, 111, 163, 0.9) 100%), url(/assets/barcelona_authority.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }} 
      id="contact"
    >
      {/* Decorative Blob background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -z-0" style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">
        
        {/* Text Section */}
        <div className="space-y-12">
           <div className="space-y-6">
              <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter">
                Tu protección <br /> contra plagas, <br /> garantizada.
              </h2>
              <div className="w-32 h-2 bg-accent-green rounded-full"></div>
              <p className="text-xl font-medium text-white/80 leading-relaxed max-w-md italic">
                {t('contact.subtitle', 'Rellena el formulario y un técnico especialista te contactará en menos de 2h para un diagnóstico gratuito.')}
              </p>
           </div>
           
           <div className="grid sm:grid-cols-2 gap-8">
              {[
                { icon: <Phone />, title: 'Teléfono', value: '930 000 000' },
                { icon: <Clock />, title: 'Horario', value: '24h / 7 días' },
                { icon: <MapPin />, title: 'Sede', value: 'Barcelona' },
                { icon: <Mail />, title: 'Email', value: 'hola@cecasa.cat' }
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-4 group">
                   <div className="p-3 bg-white/10 rounded-xl text-accent-green group-hover:bg-white/20 transition-all border border-white/5">
                      {React.cloneElement(item.icon, { size: 24, strokeWidth: 2 })}
                   </div>
                   <div className="flex flex-col">
                      <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/50">{item.title}</p>
                      <p className="font-extrabold text-white tracking-tight">{item.value}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Form Section */}
        <div className="animate-slide-up">
           <form className="glass p-12 rounded-[3.5rem] space-y-6 border-white/40 shadow-2xl">
              <div className="space-y-2">
                 <input 
                   type="text" 
                   placeholder="Nombre y Apellidos" 
                   className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-blue text-primary-gray font-medium placeholder:text-primary-gray/40"
                 />
              </div>
              <div className="space-y-2">
                 <input 
                   type="email" 
                   placeholder="Email de contacto" 
                   className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-blue text-primary-gray font-medium placeholder:text-primary-gray/40"
                 />
              </div>
              <div className="space-y-2">
                 <input 
                   type="tel" 
                   placeholder="Teléfono móvil" 
                   className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-blue text-primary-gray font-medium placeholder:text-primary-gray/40"
                 />
              </div>
              <div className="space-y-2">
                 <textarea 
                   rows="4" 
                   placeholder="Explícanos brevemente tu problema..." 
                   className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-blue text-primary-gray font-medium placeholder:text-primary-gray/40 resize-none"
                 ></textarea>
              </div>
              
              <div className="flex items-center space-x-3 text-[10px] font-bold text-primary-gray/50 uppercase tracking-widest pl-2">
                 <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue" />
                 <span>Acepto la política de protección de datos técnica de CECSA</span>
              </div>

              <button 
                type="submit" 
                className="w-full py-6 rounded-2xl bg-primary-blue text-white font-black text-lg tracking-widest shadow-xl hover:translate-y-[-4px] transition-all flex items-center justify-center group"
              >
                  ENVIAR SOLICITUD
                  <Send size={22} className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
           </form>
           
           {/* Form caption */}
           <div className="mt-8 text-center space-y-2 opacity-60">
              <p className="text-xs font-bold text-accent-green uppercase tracking-widest">Compromiso CECSA</p>
              <p className="text-[10px] text-white font-medium">Privacidad absoluta y respuesta técnica garantizada.</p>
           </div>
        </div>

      </div>
    </section>
  );
};

export default ContactForm;
