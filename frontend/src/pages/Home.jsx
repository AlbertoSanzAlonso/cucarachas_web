import React, { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Lazy load components for performance
const Navbar = lazy(() => import('../components/Navbar'));
const Hero = lazy(() => import('../components/Hero'));
const CockroachFocus = lazy(() => import('../components/CockroachFocus'));
const FleetSection = lazy(() => import('../components/FleetSection'));
const PestGrid = lazy(() => import('../components/PestGrid'));
const SectorGrid = lazy(() => import('../components/SectorGrid'));
const OrigenService = lazy(() => import('../components/OrigenService'));
const OtherServices = lazy(() => import('../components/OtherServices'));
const Process = lazy(() => import('../components/Process'));
const AuthoritySection = lazy(() => import('../components/AuthoritySection'));
const Testimonials = lazy(() => import('../components/Testimonials'));
const Footer = lazy(() => import('../components/Footer'));
const FloatingCTA = lazy(() => import('../components/FloatingCTA'));

import SEO from '../components/SEO';
import { SectionSkeleton } from '../components/Skeleton';

// Optimized Section Components with Granular Suspense
const LazySection = ({ Component, fallback = <SectionSkeleton /> }) => (
  <Suspense fallback={fallback}>
    <Component />
  </Suspense>
);

function Home() {
  const { t } = useTranslation();
  const location = useLocation();

  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "CECSA Control de Plagas",
    "image": "https://cucarachasbarcelona.cat/assets/og-image.webp",
    "@id": "https://cucarachasbarcelona.cat",
    "url": "https://cucarachasbarcelona.cat",
    "telephone": "+34933309169",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "C/ Rajolers 16, Local 1",
      "addressLocality": "Barcelona",
      "postalCode": "08028",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 41.378415,
      "longitude": 2.128523
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "08:00",
      "closes": "19:00"
    },
    "sameAs": [
      "https://www.facebook.com/cecsaddd/",
      "https://www.instagram.com/tecnicoplagas/",
      "https://www.linkedin.com/company/desinfecciones-cecsa-sll/"
    ]
  };

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen bg-bg-light overflow-x-hidden selection:bg-accent-green/30">
      <SEO schemaData={homeSchema} />
      <Navbar />
      
      <main>
        <LazySection Component={Hero} fallback={<div className="h-[80vh] bg-gray-100 animate-pulse" />} />
        <LazySection Component={CockroachFocus} />
        <LazySection Component={Testimonials} />
        <LazySection Component={FleetSection} />
        <LazySection Component={PestGrid} />
        <LazySection Component={SectorGrid} />
        <LazySection Component={OtherServices} />
        <LazySection Component={OrigenService} />
        <LazySection Component={Process} />
        
        <LazySection Component={AuthoritySection} />
      </main>
      
      <Footer />
      <FloatingCTA />
    </div>
  );
}

export default Home;
