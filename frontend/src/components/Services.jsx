import { useState, useEffect } from 'react';
import axios from 'axios';
import * as LucideIcons from 'lucide-react';

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
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-green"></div>
    </div>
  );

  return (
    <section id="servicios" className="bg-white">
      <div className="container">
        <h2 className="section-title">Nuestros Servicios</h2>
        <div className="services-grid mt-12">
          {services.map((service) => {
            const IconComponent = LucideIcons[service.icon] || LucideIcons.Bug;
            return (
              <div 
                key={service.id} 
                className="service-card p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                style={{ borderTop: `4px solid ${service.color}` }}
              >
                <div 
                  className="icon-wrapper mb-6 p-4 rounded-xl inline-flex"
                  style={{ backgroundColor: `${service.color}15`, color: service.color }}
                >
                  <IconComponent size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-primary-navy">{service.title}</h3>
                <p className="text-text-gray">{service.description}</p>
                <a href="#contacto" className="inline-flex items-center gap-2 mt-6 font-semibold text-olive-green hover:gap-3 transition-all">
                  Saber más <LucideIcons.ArrowRight size={18} />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
