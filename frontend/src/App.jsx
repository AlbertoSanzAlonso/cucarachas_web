import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { DashboardSkeleton } from './components/Skeleton';
import './index.css';

// Lazy load pages for maximum performance and code splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const About = lazy(() => import('./pages/About'));
const LegalNotice = lazy(() => import('./pages/LegalNotice'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

/**
 * CECSA - Speed Optimized SPA Router
 * Implements granular code splitting and skeleton-based 'busy' loading states.
 */

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? <Navigate to="/admin" replace /> : children;
};
function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <Suspense fallback={<RootLoader />}>
              <Home />
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
          path="/admin" 
          element={
            <Suspense fallback={<DashboardSkeleton />}>
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            </Suspense>
          } 
        />
      </Routes>
    </Router>
  );
}

const RootLoader = () => (
  <div className="h-screen w-screen flex flex-col items-center justify-center bg-bg-light space-y-8 animate-in fade-in duration-700">
    <div className="relative">
      <div className="w-24 h-24 border-8 border-primary-blue/10 border-t-primary-blue rounded-full animate-spin"></div>
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
