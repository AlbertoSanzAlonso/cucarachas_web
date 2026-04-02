import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section id="inicio" className="hero-section relative overflow-hidden bg-off-white pt-32 pb-20">
      <div className="container flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 animate-fade-in">
          <h1 className="text-primary-blue font-bold text-5xl leading-tight mb-6">
            Cecsa: Expertos en <span className="text-secondary-gray">Control de Plagas</span> de Cucarachas
          </h1>
          <p className="text-text-gray text-xl mb-8">
            Soluciones eficaces, seguras y profesionales para eliminar cualquier plaga en tu hogar o negocio. 
            Más de 20 años de experiencia garantizando espacios libres de insectos.
          </p>
          <div className="flex gap-4">
            <a href="#contacto" className="btn btn-primary flex items-center gap-2">
              Pide Presupuesto Gratis <ArrowRight size={20} />
            </a>
            <a href="#servicios" className="btn btn-secondary">Ver Servicios</a>
          </div>
        </div>
        <div className="md:w-1/2 relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="hero-image-wrapper">
             <img src="/hero.png" alt="Pest Control Hero" className="w-full h-auto rounded-2xl shadow-2xl" />
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-primary-blue opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-20 w-80 h-80 bg-secondary-gray opacity-5 rounded-full blur-3xl"></div>
    </section>
  );
};

export default Hero;
