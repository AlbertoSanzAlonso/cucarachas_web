import { CheckCircle2 } from 'lucide-react';

const About = () => {
  const highlights = [
    "Personal especializado y certificado",
    "Tratamientos respetuosos con el medio ambiente",
    "Garantía por escrito en todos los servicios",
    "Atención inmediata en menos de 24 horas",
    "Presupuestos sin compromiso",
    "Seguimiento post-tratamiento"
  ];

  return (
    <section id="nosotros" className="bg-light-blue py-24">
      <div className="container flex flex-col md:flex-row items-center gap-16">
        <div className="md:w-1/2">
          <div className="relative">
            <div className="absolute inset-0 bg-olive-green rounded-2xl transform rotate-3 scale-105 opacity-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1581578731522-6582fe001713?auto=format&fit=crop&q=80&w=800" 
              alt="Professional Pest Control" 
              className="relative w-full h-auto rounded-2xl shadow-xl z-10"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl z-20 animate-fade-in">
              <span className="block text-4xl font-bold text-olive-green mb-1">+20</span>
              <span className="text-sm font-semibold text-primary-navy">Años de Exp.</span>
            </div>
          </div>
        </div>
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold text-primary-navy mb-6">Por qué elegir Cecsa</h2>
          <p className="text-lg text-text-gray mb-8">
            En Cecsa, entendemos que una plaga de cucarachas no es solo un problema estético, sino un riesgo para la salud y la reputación de su negocio. Nuestro enfoque se basa en la prevención, el control y el mantenimiento, utilizando tecnología de vanguardia y productos de alta eficacia.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {highlights.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle2 className="text-olive-green shrink-0" size={24} />
                <span className="font-medium text-primary-navy">{item}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-primary mt-10">Conoce nuestra historia</button>
        </div>
      </div>
    </section>
  );
};

export default About;
