import React from 'react';
import StatsBar from './StatsBar';
import ContactForm from './ContactForm';

/**
 * AuthoritySection - Unified Trust & Conversion block
 * Includes skewed transition, stats bar, and contact form.
 * Centered on the "CECSA Sanitary Premium Clean" brand identity.
 */
const AuthoritySection = () => {
  return (
    <div className="relative mt-[-100px] z-40" id="contact">
      {/* Skewed Background Transition */}
      <div 
        className="absolute inset-0 -skew-y-3 origin-top-right scale-x-110 bg-authority-fixed shadow-[0_-30px_60px_rgba(0,128,187,0.25)] border-t border-white/5 pointer-events-none"
        style={{ 
          background: 'linear-gradient(135deg, rgba(0, 128, 187, 0.98) 0%, rgba(0, 111, 163, 0.92) 100%), url(/assets/barcelona-authority.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
      
      {/* Content Layer */}
      <div className="relative z-10">
        <StatsBar />
        <ContactForm />
      </div>
    </div>
  );
};

export default AuthoritySection;
