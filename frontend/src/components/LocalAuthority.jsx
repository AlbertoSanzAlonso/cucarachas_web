import { MapPin, Clock, Phone, Navigation } from 'lucide-react';

const LocalAuthority = () => {
  return (
    <section className="bg-white py-24">
      <div className="container overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
             <span className="text-primary-blue font-bold tracking-widest uppercase text-sm mb-4 block">Presencia Local</span>
             <h2 className="text-4xl font-bold text-secondary-gray mb-8">Nuestra Central de Madrid</h2>
             <p className="text-text-gray text-lg mb-8 leading-relaxed">
               Damos cobertura a toda la Comunidad de Madrid desde nuestra central. 
               El clima de la región favorece la proliferación de cucarachas (Blattella germanica y Periplaneta americana). 
               Nuestros técnicos locales conocen cada barrio y zona industrial, garantizando respuestas rápidas y tratamientos adaptados.
             </p>
             
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-light-blue p-3 rounded-full text-primary-blue">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold">Oficina MADRID</h4>
                    <p className="text-text-gray">Calle de la Innovación, 28521 Rivas-Vaciamadrid, Madrid</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-light-blue p-3 rounded-full text-primary-blue">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold">Horario de Atención</h4>
                    <p className="text-text-gray">Lunes a Viernes: 08:00 - 18:30 | Urgencias 24h</p>
                  </div>
                </div>
                <a 
                   href="https://maps.google.com" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 bg-secondary-gray text-white px-6 py-3 rounded-xl hover:bg-primary-blue transition-colors mt-4"
                >
                  <Navigation size={18} /> Cómo llegar
                </a>
             </div>
          </div>
          
          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
             <div className="bg-off-white p-8 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                <span className="text-4xl font-bold text-primary-blue mb-2">100%</span>
                <span className="text-xs uppercase font-bold text-text-gray tracking-tighter">Satisfacción</span>
             </div>
             <div className="bg-off-white p-8 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                <span className="text-4xl font-bold text-primary-blue mb-2">450k+</span>
                <span className="text-xs uppercase font-bold text-text-gray tracking-tighter">Clientes Satisfechos</span>
             </div>
             <div className="bg-off-white p-8 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                <span className="text-4xl font-bold text-primary-blue mb-2">20+</span>
                <span className="text-xs uppercase font-bold text-text-gray tracking-tighter">Años de Exp.</span>
             </div>
             <div className="bg-off-white p-8 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                <span className="text-4xl font-bold text-primary-blue mb-2">ISO</span>
                <span className="text-xs uppercase font-bold text-text-gray tracking-tighter">Certificación Calidad</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalAuthority;
