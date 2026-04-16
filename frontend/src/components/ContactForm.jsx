import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Phone, MapPin, Mail, Clock, CheckCircle2 } from 'lucide-react';
import { useCreateLeadMutation } from '../store/apis/leadsApi';

const ContactForm = () => {
  const { t } = useTranslation();
  const [createLead, { isLoading, isSuccess }] = useCreateLeadMutation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createLead({
        ...formData,
        status: 'pendent', // Por defecto
        type: 'Cucarachas (Web)'
      }).unwrap();
      
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error('Error enviant el lead:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section className="py-24 relative overflow-visible z-10 -mt-20" 
      id="contact"
    >
      {/* Decorative Blob background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -z-0" style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">
        
        {/* Text Section */}
        <div className="space-y-12">
           <div className="space-y-6">
              <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter"
                  dangerouslySetInnerHTML={{ __html: t('contact.title', 'Tu protección <br /> contra plagas, <br /> garantizada.') }}
              />
              <div className="w-32 h-2 bg-accent-green rounded-full"></div>
              <p className="text-xl font-medium text-white/80 leading-relaxed max-w-md italic">
                {t('contact.subtitle')}
              </p>
           </div>
           
           <div className="grid sm:grid-cols-2 gap-8">
              {[
                { icon: <Phone />, title: t('contact.phone_label'), value: '933 309 169' },
                { icon: <Clock />, title: t('contact.schedule_label'), value: t('contact.schedule_value') },
                { icon: <MapPin />, title: t('contact.sede_label'), value: 'Barcelona' },
                { icon: <Mail />, title: t('contact.email_label'), value: 'info@cucarachasbarcelona.cat' }
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
           <form onSubmit={handleSubmit} className="glass p-12 rounded-[3.5rem] space-y-6 border-white/40 shadow-2xl">
              <div className="space-y-2">
                 <input 
                   name="name"
                   value={formData.name}
                   onChange={handleChange}
                   type="text" 
                   placeholder={t('contact.name_placeholder')}
                   required
                   className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-blue text-primary-gray font-medium placeholder:text-primary-gray/40"
                 />
              </div>
              <div className="space-y-2">
                 <input 
                   name="email"
                   value={formData.email}
                   onChange={handleChange}
                   type="email" 
                   placeholder={t('contact.email_placeholder')}
                   required
                   className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-blue text-primary-gray font-medium placeholder:text-primary-gray/40"
                 />
              </div>
              <div className="space-y-2">
                 <input 
                   name="phone"
                   value={formData.phone}
                   onChange={handleChange}
                   type="tel" 
                   placeholder={t('contact.phone_placeholder')}
                   required
                   className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-blue text-primary-gray font-medium placeholder:text-primary-gray/40"
                 />
              </div>
              <div className="space-y-2">
                 <textarea 
                   name="message"
                   value={formData.message}
                   onChange={handleChange}
                   rows="4" 
                   placeholder={t('contact.message_placeholder')}
                   required
                   className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-blue text-primary-gray font-medium placeholder:text-primary-gray/40 resize-none"
                 ></textarea>
              </div>
              
              <div className="flex items-center space-x-3 text-[10px] font-bold text-primary-gray/50 uppercase tracking-widest pl-2">
                 <input type="checkbox" required className="w-4 h-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue" />
                 <span>{t('contact.privacy_consent')}</span>
              </div>

              <button 
                type="submit" 
                disabled={isLoading || isSuccess}
                className={`w-full py-6 rounded-2xl ${isSuccess ? 'bg-accent-green' : 'bg-primary-blue'} text-white font-black text-lg tracking-widest shadow-xl hover:translate-y-[-4px] transition-all flex items-center justify-center group`}
              >
                 {isLoading ? (
                   <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                 ) : isSuccess ? (
                   <>
                     <span>{t('contact.success_btn')}</span>
                     <CheckCircle2 size={22} className="ml-3" />
                   </>
                 ) : (
                   <>
                     <span>{t('contact.submit_btn')}</span>
                     <Send size={22} className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                   </>
                 )}
              </button>
           </form>
           
           {/* Form caption */}
           <div className="mt-8 text-center space-y-2 opacity-60">
              <p className="text-xs font-bold text-accent-green uppercase tracking-widest">{t('contact.commitment_label')}</p>
              <p className="text-[10px] text-white font-medium">{t('contact.commitment_value')}</p>
           </div>
        </div>

      </div>
    </section>
  );
};

export default ContactForm;
