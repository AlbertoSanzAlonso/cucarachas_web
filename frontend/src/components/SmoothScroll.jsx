import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * SmoothScroll component
 * Integrates Lenis for smooth scrolling and connects it with GSAP ScrollTrigger.
 */
const SmoothScroll = ({ children }) => {
  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Update ScrollTrigger on every scroll event
    lenis.on('scroll', ScrollTrigger.update);

    // Sync Lenis with GSAP's ticker
    const updateRaf = (time) => {
      lenis.raf(time * 1000);
    };
    
    gsap.ticker.add(updateRaf);

    // Disable lag smoothing for GSAP to keep it in sync with Lenis
    gsap.ticker.lagSmoothing(0);

    // Store lenis in window for potential global access
    window.lenis = lenis;

    return () => {
      lenis.destroy();
      gsap.ticker.remove(updateRaf);
      window.lenis = null;
    };
  }, []);

  return children;
};

export default SmoothScroll;
