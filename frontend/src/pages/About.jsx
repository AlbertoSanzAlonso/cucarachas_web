import React, { useEffect, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingCTA from '@/components/FloatingCTA';
import SEO from '@/components/SEO';
import { SectionSkeleton } from '@/components/Skeleton';

// Modular Sections
import AboutHero from '@/components/About/AboutHero';
import AboutStats from '@/components/About/AboutStats';
import AboutPhilosophy from '@/components/About/AboutPhilosophy';
import AboutScope from '@/components/About/AboutScope';

const OtherServices = lazy(() => import('@/components/OtherServices'));
const Process = lazy(() => import('@/components/Process'));

const LazySection = ({ Component, fallback = <SectionSkeleton /> }) => (
  <Suspense fallback={fallback}>
    <Component />
  </Suspense>
);

const About = () => {
  const { t } = useTranslation();
  const location = useLocation();

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
    <div className="min-h-screen bg-bg-light">
      <SEO 
        title={t('nav.about')} 
        description={t('about_page.hero_subtitle')} 
        url="/sobre-cecsa"
      />
      <Navbar />

      <main className="pt-40 md:pt-32 pb-0">
        <AboutHero />
        <AboutStats />
        <AboutPhilosophy />
        <AboutScope />

        {/* Lazy loaded shared components */}
        <LazySection Component={Process} />
        <div>
           <LazySection Component={OtherServices} />
        </div>
      </main>

      <Footer />
      <FloatingCTA />
    </div>
  );
};

export default About;
