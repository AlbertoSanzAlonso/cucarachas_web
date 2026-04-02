import { Home, Building2, ArrowRight } from 'lucide-react';

const SectorChoice = () => {
  return (
    <section className="bg-white py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2 group cursor-pointer bg-off-white p-12 rounded-3xl border border-transparent hover:border-primary-blue hover:shadow-2xl transition-all duration-500">
            <div className="bg-primary-blue/10 p-6 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform">
              <Home size={48} className="text-primary-blue" />
            </div>
            <h3 className="text-3xl font-bold text-secondary-gray mb-4">Para tu Hogar</h3>
            <p className="text-text-gray text-lg mb-8">
              Protegemos a tu familia y mascotas. Eliminamos cucarachas, chinches, termitas y roedores de forma rápida y segura.
            </p>
            <a href="#contacto" className="inline-flex items-center gap-2 font-bold text-primary-blue border-b-2 border-primary-blue pb-1">
              Ver Soluciones Residenciales <ArrowRight size={20} />
            </a>
          </div>

          <div className="md:w-1/2 group cursor-pointer bg-secondary-gray p-12 rounded-3xl border border-transparent hover:border-white/10 hover:shadow-2xl transition-all duration-500 text-white">
            <div className="bg-white/10 p-6 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform">
              <Building2 size={48} className="text-primary-blue" />
            </div>
            <h3 className="text-3xl font-bold mb-4 text-white">Para tu Negocio</h3>
            <p className="opacity-80 text-lg mb-8">
              Garantizamos el cumplimiento normativo. Control de plagas preventivo y correctivo para hostelería, oficinas e industria.
            </p>
            <a href="#contacto" className="inline-flex items-center gap-2 font-bold text-primary-blue border-b-2 border-primary-blue pb-1">
              Ver Soluciones para Empresas <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectorChoice;
