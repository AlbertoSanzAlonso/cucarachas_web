import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section id="inicio" className="hero-section relative overflow-hidden bg-off-white pt-32 pb-32">
      <div className="container flex flex-col md:flex-row items-center gap-12 mb-16">
        <div className="md:w-1/2 animate-fade-in">
          <h1 className="text-primary-blue font-bold text-5xl leading-tight mb-4">
            Expertos en <span className="text-secondary-gray">Control de Plagas</span> en Barcelona
          </h1>
          <p className="text-text-gray text-lg mb-8 leading-relaxed">
            Soluciones avanzadas para eliminar cucarachas y otras plagas urbanas. 
            <strong> Llevamos más de 20 años protegiendo hogares y negocios </strong> en toda la provincia de Barcelona con resultados 100% garantizados.
          </p>
          <div className="flex flex-wrap gap-4 mb-16">
            <a href="#contacto" className="btn btn-primary flex items-center gap-2">
              Pide Presupuesto Gratis <ArrowRight size={20} />
            </a>
            <a href="#servicios" className="btn btn-secondary">Ver Servicios</a>
          </div>

          <div className="flex flex-wrap items-center gap-8 py-6 border-t border-secondary-gray/10">
             <div className="flex items-center gap-2 text-sm font-semibold text-secondary-gray uppercase">
               <span className="bg-primary-blue text-white p-1 rounded">24h</span> Servicio Urgente
             </div>
             <div className="flex items-center gap-2 text-sm font-semibold text-secondary-gray uppercase">
               <span className="text-primary-blue">✔</span> Garantía Escrita
             </div>
             <div className="flex items-center gap-2 text-sm font-semibold text-secondary-gray uppercase">
               <span className="text-primary-blue">✔</span> Técnicos Certificados
             </div>
          </div>
        </div>
        <div className="md:w-1/2 relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="hero-image-wrapper">
             <img src="/hero.png" alt="Control de Plagas en Barcelona" className="w-full h-auto rounded-2xl shadow-2xl" />
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
