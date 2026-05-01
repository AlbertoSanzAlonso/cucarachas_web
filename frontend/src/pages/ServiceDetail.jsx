import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Utensils, Hotel, Users, Factory } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

// Modular Sections
import ServiceHero from '@/components/ServiceDetail/ServiceHero';
import ServiceContent from '@/components/ServiceDetail/ServiceContent';
import ServiceSidebar from '@/components/ServiceDetail/ServiceSidebar';

const ServiceDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const sectorIcons = {
    horeca: <Utensils />,
    hotels: <Hotel />,
    comms: <Users />,
    industry: <Factory />
  };

  const sectorData = {
    horeca: { 
      title: t('sectors_grid.horeca'), 
      desc: t('sectors_grid.horeca_desc'),
      points: t('sectors_grid.horeca_points', { returnObjects: true }),
      bg: '/assets/taula-de-cuina-amb-granit-endoftext-.webp'
    },
    hotels: { 
      title: t('sectors_grid.hotels'), 
      desc: t('sectors_grid.hotels_desc'),
      points: t('sectors_grid.hotels_points', { returnObjects: true }),
      bg: '/assets/hotel-bg.webp'
    },
    comms: { 
      title: t('sectors_grid.comms'), 
      desc: t('sectors_grid.comms_desc'),
      points: t('sectors_grid.comms_points', { returnObjects: true }),
      bg: '/assets/hogar-protegido-libre-de-cucarachas.webp'
    },
    industry: { 
      title: t('sectors_grid.industry'), 
      desc: t('sectors_grid.industry_desc'),
      points: t('sectors_grid.industry_points', { returnObjects: true }),
      bg: '/assets/industry-bg.webp'
    }
  };

  const sector = sectorData[id];

  const serviceSchema = sector ? {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": sector.title,
    "description": sector.desc,
    "provider": {
      "@type": "LocalBusiness",
      "name": "CECSA Control de Plagas",
      "url": "https://cucarachasbarcelona.cat"
    },
    "areaServed": "Barcelona, Catalunya",
    "serviceType": "Control de Plagas / Desinsectación"
  } : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!sector) return (
    <div className="min-h-screen flex items-center justify-center font-black text-primary-blue uppercase tracking-widest">
      {t('service_detail_page.not_found')}
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-light">
      <SEO 
        title={sector.title} 
        description={sector.desc} 
        url={`/serveis/${id}`}
        schemaData={serviceSchema}
      />
      
      <Navbar />
      
      <main>
        <ServiceHero 
          sector={sector} 
          id={id} 
          sectorIcons={sectorIcons} 
          t={t} 
        />

        {/* Layout Section */}
        <section className="pt-24 pb-48 md:pb-64 max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-16">
          <ServiceContent 
            sector={sector} 
            t={t} 
          />
          
          <ServiceSidebar 
            id={id} 
            sectorData={sectorData} 
            sectorIcons={sectorIcons} 
            t={t} 
          />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ServiceDetail;
