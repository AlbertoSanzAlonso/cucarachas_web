import React, { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';

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

function Home() {
  const { t } = useTranslation();

  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center text-primary-blue font-black text-3xl tracking-tighter animate-pulse">CEC<span className="text-accent-green">SA</span>...</div>}>
      <div className="flex flex-col min-h-screen bg-bg-light overflow-x-hidden selection:bg-accent-green/30">
        
        {/* Navigation Layer */}
        <Navbar />

        {/* Presentation Layer */}
        <Hero />
        
        {/* Specialized Content Layer */}
        <CockroachFocus />
        
        {/* Social Proof Layer */}
        <Testimonials />
        
        {/* Operational Scope Layer */}
        <FleetSection />
        
        {/* Services & Sectors Layer */}
        <PestGrid />
        <OtherServices />
        <SectorGrid />
        
        {/* Premium Layer */}
        <OrigenService />
        
        {/* Methodology Layer */}
        <Process />
        
        {/* Authority & Trust Layer */}
        <StatsBar />
        
        {/* Lead Generation Layer */}
        <ContactForm />
        
        {/* Footer Layer */}
        <Footer />
        
        {/* Interaction Layer */}
        <FloatingCTA />

      </div>
    </Suspense>
  );
}

export default Home;
