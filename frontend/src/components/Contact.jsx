import { useState } from 'react';
import axios from 'axios';
import { Send, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';

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
      await axios.post('http://localhost:8000/api/contacts/', formData);
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  return (
    <section id="contacto" className="bg-white py-24">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/3">
            <h2 className="text-4xl font-bold text-primary-navy mb-6">Contacta con Cecsa</h2>
            <p className="text-lg text-text-gray mb-10">
              ¿Preocupado por una plaga de cucarachas? Solicita un presupuesto sin compromiso y un técnico contactará contigo para darte una solución inmediata.
            </p>
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-light-blue p-3 rounded-xl text-olive-green">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-primary-navy">Llámanos</h4>
                  <p className="text-text-gray">+34 900 123 456</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-light-blue p-3 rounded-xl text-olive-green">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-primary-navy">Email</h4>
                  <p className="text-text-gray">info@cecsaplagas.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-light-blue p-3 rounded-xl text-olive-green">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-primary-navy">Ubicación</h4>
                  <p className="text-text-gray">Calle de la Limpieza, 12, 28001 Madrid</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-2/3 bg-off-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            {status === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="bg-olive-green p-4 rounded-full text-white mb-6">
                  <CheckCircle size={48} />
                </div>
                <h3 className="text-3xl font-bold text-primary-navy mb-4">¡Mensaje Enviado!</h3>
                <p className="text-lg text-text-gray mb-8">Gracias por contactar con Cecsa. Un técnico experto en control de plagas se pondrá en contacto contigo en breve.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="btn btn-primary"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="font-semibold text-primary-navy ml-1">Nombre</label>
                    <input 
                      type="text" 
                      id="name" 
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Tu nombre completo"
                      className="p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-olive-green transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="font-semibold text-primary-navy ml-1">Teléfono</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="Tu número de contacto"
                      className="p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-olive-green transition-all"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="font-semibold text-primary-navy ml-1">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="compañia@email.com"
                    className="p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-olive-green transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="font-semibold text-primary-navy ml-1">Mensaje o Plaga detectada</label>
                  <textarea 
                    id="message" 
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="4"
                    placeholder="Cuéntanos sobre tu problema..."
                    className="p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-olive-green transition-all"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="btn btn-primary flex items-center justify-center gap-2 mt-4 py-4"
                >
                  {status === 'loading' ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                  ) : (
                    <>Enviar Solicitud <Send size={18} /></>
                  )}
                </button>
                {status === 'error' && (
                  <p className="text-red-500 text-center font-medium">Hubo un error al enviar el mensaje. Inténtelo de nuevo.</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
