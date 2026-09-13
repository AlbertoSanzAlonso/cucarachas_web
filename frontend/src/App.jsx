import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardSkeleton } from '@/components/Skeleton';
import AgentHeroModal from '@/components/Agent/AgentHeroModal';
import SmoothScroll from '@/components/SmoothScroll';
import { scrollToTop } from '@/utils/scrollToAnchor';
import './index.css';

const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const LeadBookingsPage = lazy(() => import('@/pages/LeadBookingsPage'));
const About = lazy(() => import('@/pages/About'));
const LegalNotice = lazy(() => import('@/pages/LegalNotice'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const ServiceDetail = lazy(() => import('@/pages/ServiceDetail'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogArticle = lazy(() => import('@/pages/BlogArticle'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const HospitalityService = lazy(() => import('@/pages/HospitalityService'));
const FloatingCTA = lazy(() => import('@/components/FloatingCTA'));

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? <Navigate to="/admin" replace /> : children;
};

function App() {
  const [isAgentOpen, setIsAgentOpen] = React.useState(() => {
    return !localStorage.getItem('cecsa_agent_dismissed');
  });

  const handleCloseAgent = () => {
    setIsAgentOpen(false);
    localStorage.setItem('cecsa_agent_dismissed', 'true');
  };

  React.useEffect(() => {
    if (isAgentOpen) {
      document.body.classList.add('agent-open');
      window.scrollTo(0, 0);
      window.lenis?.stop();
    } else {
      document.body.classList.remove('agent-open');
      window.lenis?.start();
    }
    return () => {
      document.body.classList.remove('agent-open');
      window.lenis?.start();
    };
  }, [isAgentOpen]);

  return (
    <Router>
      <AppContent
        isAgentOpen={isAgentOpen}
        handleCloseAgent={handleCloseAgent}
        handleOpenAgent={() => setIsAgentOpen(true)}
      />
    </Router>
  );
}

function AppContent({ isAgentOpen, handleCloseAgent, handleOpenAgent }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');
  const showAgentModal = isAgentOpen && location.pathname === '/' && !isAdminRoute;

  // Lenis no respeta window.scrollTo; al cambiar de ruta hay que ir al top vía su API.
  React.useEffect(() => {
    if (location.hash) return;
    scrollToTop();
  }, [location.pathname]);

  return (
    <SmoothScroll>
      <AnimatePresence mode="popLayout">
        {showAgentModal && (
          <AgentHeroModal key="agent-modal" isOpen={isAgentOpen} onClose={handleCloseAgent} />
        )}
      </AnimatePresence>

      <motion.div
        key="main-content"
        initial={false}
        animate={{ opacity: showAgentModal ? 0 : 1 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{ pointerEvents: showAgentModal ? 'none' : 'auto' }}
      >
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<RootLoader />}>
                <Home openAgent={handleOpenAgent} isAgentOpen={isAgentOpen} />
              </Suspense>
            }
          />
          <Route
            path="/sobre-cecsa"
            element={
              <Suspense fallback={<RootLoader />}>
                <About />
              </Suspense>
            }
          />
          <Route
            path="/avis-legal"
            element={
              <Suspense fallback={<RootLoader />}>
                <LegalNotice />
              </Suspense>
            }
          />
          <Route
            path="/privacitat"
            element={
              <Suspense fallback={<RootLoader />}>
                <PrivacyPolicy />
              </Suspense>
            }
          />
          <Route
            path="/serveis/:id"
            element={
              <Suspense fallback={<RootLoader />}>
                <ServiceDetail />
              </Suspense>
            }
          />
          <Route
            path="/servei-panerola-alemana-hostaleria"
            element={
              <Suspense fallback={<RootLoader />}>
                <HospitalityService />
              </Suspense>
            }
          />
          <Route
            path="/login"
            element={
              <Suspense fallback={<RootLoader />}>
                <PublicRoute>
                  <Login />
                </PublicRoute>
              </Suspense>
            }
          />
          <Route
            path="/admin/leads/:leadId/cites"
            element={
              <Suspense fallback={<DashboardSkeleton />}>
                <ProtectedRoute>
                  <LeadBookingsPage />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<DashboardSkeleton />}>
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/blog"
            element={
              <Suspense fallback={<RootLoader />}>
                <Blog />
              </Suspense>
            }
          />
          <Route
            path="/blog/faq"
            element={
              <Suspense fallback={<RootLoader />}>
                <FAQ />
              </Suspense>
            }
          />
          <Route
            path="/blog/:slug"
            element={
              <Suspense fallback={<RootLoader />}>
                <BlogArticle />
              </Suspense>
            }
          />
          <Route
            path="/preguntes-frequents"
            element={
              <Suspense fallback={<RootLoader />}>
                <FAQ />
              </Suspense>
            }
          />
          <Route
            path="/faq"
            element={
              <Suspense fallback={<RootLoader />}>
                <FAQ />
              </Suspense>
            }
          />
        </Routes>
      </motion.div>

      {/* Una sola instancia: la conversación no se reinicia al cambiar de ruta */}
      {!isAdminRoute && !showAgentModal && (
        <Suspense fallback={null}>
          <FloatingCTA />
        </Suspense>
      )}
    </SmoothScroll>
  );
}

const RootLoader = () => (
  <div className="h-screen w-screen flex flex-col items-center justify-center bg-bg-light space-y-8 animate-in fade-in duration-700">
    <div className="relative">
      <div className="w-24 h-24 border-8 border-primary-blue/10 border-t-primary-blue rounded-full animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center font-black text-primary-gray/20">CECSA</div>
    </div>
    <div className="text-center space-y-2">
      <h2 className="text-primary-blue font-black text-2xl tracking-tighter animate-pulse uppercase">
        Iniciant <span className="text-accent-green">Protocol</span>
      </h2>
      <p className="text-[10px] text-primary-gray/40 font-bold uppercase tracking-[0.3em]">Càrrega Segura de Recursos</p>
    </div>
  </div>
);

export default App;
