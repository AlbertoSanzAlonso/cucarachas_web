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
const StatsBar = lazy(() => import('../components/StatsBar'));
const Process = lazy(() => import('../components/Process'));
const Testimonials = lazy(() => import('../components/Testimonials'));
const ContactForm = lazy(() => import('../components/ContactForm'));
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
        <LazySection Component={FleetSection} />
        <LazySection Component={PestGrid} />
        <LazySection Component={OtherServices} />
        <LazySection Component={SectorGrid} />
        <LazySection Component={OrigenService} />
        <LazySection Component={Testimonials} />
        <LazySection Component={Process} />
        
        {/* Unified Authority Section (Stats + Contact) with Skewed Top */}
        <div className="relative mt-[-100px] z-40">
          <div 
            className="absolute inset-0 -skew-y-3 origin-top-right bg-authority-fixed shadow-[0_-30px_60px_rgba(0,128,187,0.25)] border-t border-white/5"
            style={{ 
              background: 'linear-gradient(135deg, rgba(0, 128, 187, 0.98) 0%, rgba(0, 111, 163, 0.92) 100%), url(/assets/barcelona-authority.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          ></div>
          
          <div className="relative z-10">
            <LazySection Component={StatsBar} />
            <LazySection Component={ContactForm} />
          </div>
        </div>
      </main>
      
      <Footer />
      <FloatingCTA />
    </div>
  );
}

export default Home;
