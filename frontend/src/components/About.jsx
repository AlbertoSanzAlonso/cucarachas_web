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
    <section id="nosotros" className="bg-off-white py-24">
      <div className="container flex flex-col md:flex-row items-center gap-16">
        <div className="md:w-1/2">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-blue rounded-2xl transform rotate-3 scale-105 opacity-10"></div>
            <img 
              src="/professional-technician.png" 
              alt="CEC SANIDAD AMBIENTAL - Profesionales" 
              className="relative w-full h-auto rounded-2xl shadow-xl z-10"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl z-20 animate-fade-in">
              <span className="block text-4xl font-bold text-primary-blue mb-1">+20</span>
              <span className="text-sm font-semibold text-text-dark">Años de Exp.</span>
            </div>
          </div>
        </div>
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold text-text-dark mb-6">Nuestra Filosofía</h2>
          <p className="text-lg text-text-gray mb-8">
            En <strong>CECSA SANIDAD AMBIENTAL</strong>, no solo eliminamos plagas; actuamos con conciencia. 
            Nuestra labor no es solo fumigar, sino acompañar y analizar la biología de cada caso para restaurar el equilibrio perdido. 
            Fundados en 2006, combinamos experiencia y rigor científico para proteger la salud pública y el bienestar en cada entorno.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {highlights.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle2 className="text-primary-blue shrink-0" size={24} />
                <span className="font-medium text-text-dark">{item}</span>
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
