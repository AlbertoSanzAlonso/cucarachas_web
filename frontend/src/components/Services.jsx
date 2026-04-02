import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bug, Thermometer, ShieldCheck, ChevronRight, FlaskConical, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  {
    title: 'Desinsectación',
    desc: 'Eliminación radical de cucarachas, chinches y hormigas mediante geles de última generación y cebado técnico.',
    icon: <Bug size={32} />,
    color: 'bg-blue-50 text-primary-blue'
  },
  {
    title: 'Desratización',
    desc: 'Control integral de roedores en infraestructuras y viviendas. Sistemas de monitorización y exclusión física.',
    icon: <FlaskConical size={32} />,
    color: 'bg-green-50 text-green-600'
  },
  {
    title: 'Desinfección',
    desc: 'Tratamientos virucidas y bactericidas de alto espectro. Certificados oficiales para locales y comunidades.',
    icon: <Thermometer size={32} />,
    color: 'bg-purple-50 text-purple-600'
  },
  {
    title: 'Control de Termitas',
    desc: 'Diagnóstico por radar y eliminación de colonias mediante sistemas de cebado biológico no invasivos.',
    icon: <ShieldCheck size={32} />,
    color: 'bg-amber-50 text-amber-600'
  }
];

const Services = () => {
  return (
    <section id="servicios" className="bg-bg-light py-24 lg:py-36">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-secondary-gray mb-6">Servicios de <span className="text-primary-blue">Control Sanitario</span></h2>
            <p className="text-lg text-text-muted">
              Aplicamos protocolos científicos y tecnología de vanguardia para garantizar espacios libres de plagas en toda el Área Metropolitana de Barcelona.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
            <ClipboardCheck className="text-primary-blue" />
            <span className="text-sm font-bold text-secondary-gray">Certificados Oficiales ROESB</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -10 }}
              className="card-premium flex flex-col items-start"
            >
              <div className={`p-4 rounded-2xl mb-8 ${service.color}`}>
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-secondary-gray mb-4">{service.title}</h3>
              <p className="text-text-muted mb-8 text-sm leading-relaxed">
                {service.desc}
              </p>
              <a href="#contacto" className="mt-auto flex items-center gap-2 text-primary-blue font-bold text-xs uppercase tracking-widest hover:gap-4 transition-all">
                Más información <ChevronRight size={16} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
