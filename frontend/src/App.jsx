import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SectorChoice from './components/SectorChoice';
import Services from './components/Services';
import LocalAuthority from './components/LocalAuthority';
import About from './components/About';
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
        <SectorChoice />
        <Services />
        <LocalAuthority />
        <About />
        <Contact />
      </main>
      <Footer />
      <FloatingCTA />
    </div>
  );
}

export default App;
