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

  useEffect(() => {
    document.title = "Cecsa - Control de Plagues a Barcelona | Ètic i Conscient";
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
      <Navbar />

      <LazySection Component={Hero} fallback={<div className="h-[80vh] bg-gray-100 animate-pulse" />} />
      <LazySection Component={CockroachFocus} />
      <LazySection Component={Testimonials} />
      <LazySection Component={FleetSection} />
      <LazySection Component={PestGrid} />
      <LazySection Component={OtherServices} />
      <LazySection Component={SectorGrid} />
      <LazySection Component={OrigenService} />
      <LazySection Component={Process} />
      <LazySection Component={StatsBar} />
      <LazySection Component={ContactForm} />
      
      <Footer />
      <FloatingCTA />
    </div>
  );
}

export default Home;
