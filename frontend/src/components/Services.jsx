import { useState, useEffect } from 'react';
import axios from 'axios';
import * as LucideIcons from 'lucide-react';
import { motion } from 'framer-motion';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/services/');
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-40">
      <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <section id="servicios" className="relative bg-bg-dark">
      <div className="container">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-primary-blue font-bold tracking-[0.3em] uppercase text-xs mb-4">Soluciones Integrales</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Servicios de Control</h2>
          <p className="text-muted max-w-2xl">
            Aplicamos el rigor científico y la acción consciente para restaurar el equilibrio en Barcelona y su área metropolitana. 
            Cumplimiento estricto del ROESB en cada intervención.
          </p>
        </div>

        <div className="discovery-grid">
          {services.map((service, index) => {
            const IconComponent = LucideIcons[service.icon] || LucideIcons.Bug;
            return (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-mager group"
                style={{ '--primary-blue': service.color }}
              >
                <div 
                  className="w-16 h-16 flex items-center justify-center rounded-2xl mb-8 transition-transform group-hover:scale-110 duration-500"
                  style={{ backgroundColor: `${service.color}15`, color: service.color }}
                >
                  <IconComponent size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-primary-blue transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted mb-8 line-clamp-3">
                  {service.description}
                </p>
                <a 
                  href="#contacto" 
                  className="inline-flex items-center gap-2 font-bold text-sm uppercase tracking-widest text-primary-blue group-hover:gap-4 transition-all"
                >
                  Más información <LucideIcons.ChevronRight size={16} />
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
