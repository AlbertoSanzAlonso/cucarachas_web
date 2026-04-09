import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Problem from './components/Problem';
import SectorChoice from './components/SectorChoice';
import Services from './components/Services';
import Method from './components/Method';
import LocalAuthority from './components/LocalAuthority';
import About from './components/About';
import OrigenService from './components/OrigenService';
import Contact from './components/Contact';
import Footer from './components/Footer';
import PromotionBar from './components/PromotionBar';
import FloatingCTA from './components/FloatingCTA';

function App() {
  return (
    <div className="app">
      <PromotionBar />
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <About />
        <Method />
        <Services />
        <LocalAuthority />
        <SectorChoice />
        <OrigenService />
        <Contact />
      </main>
      <Footer />
      <FloatingCTA />
    </div>
  );
}

export default App;
