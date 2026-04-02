import { MapPin, Clock, Phone, Navigation } from 'lucide-react';

const LocalAuthority = () => {
  return (
    <section className="bg-white py-24">
      <div className="container overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
             <span className="text-primary-blue font-bold tracking-widest uppercase text-sm mb-4 block">Presencia Local</span>
             <h2 className="text-4xl font-bold text-secondary-gray mb-8">Nuestra Sede Central</h2>
             <p className="text-text-gray text-lg mb-8 leading-relaxed">
               Desde nuestra sede central en Barcelona, CECSA SANIDAD AMBIENTAL coordina servicios especializados de control de plagas en toda la región. 
               Con más de 20 años de trayectoria, combinamos el análisis científico con la acción consciente para restaurar el equilibrio en entornos urbanos y empresariales.
             </p>
             
             <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-light-blue p-3 rounded-full text-primary-blue">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold">Sede Central BARCELONA</h4>
                    <p className="text-text-gray">Calle Rajolers nº 16-18, 08028 Barcelona</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-light-blue p-3 rounded-full text-primary-blue">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold">Horario de Atención</h4>
                    <p className="text-text-gray">L-V: 09:00 - 20:00 | Urgencias 24h</p>
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
          
          <div className="lg:w-1/2 grid grid-cols-2 gap-8">
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
