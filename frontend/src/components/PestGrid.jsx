import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPestSpecies } from '@/components/PestGrid/pestData';
import PestCard from '@/components/PestGrid/PestCard';
import PestModal from '@/components/PestGrid/PestModal';

const PestGrid = () => {
  const { t } = useTranslation();
  const [selectedPest, setSelectedPest] = useState(null);
  const [isOpening, setIsOpening] = useState(false);
  const species = getPestSpecies(t);

  const handlePestClick = (pest) => {
    if (isOpening) return;
    setIsOpening(true);
    
    // Check if hero image is ready
    const img = new Image();
    img.src = pest.image;
    
    const finalize = () => {
      setSelectedPest(pest);
      setIsOpening(false);
    };

    if (img.complete) {
      finalize();
    } else {
      img.onload = finalize;
      img.onerror = finalize; // Don't block forever if error
    }
  };

  // Preload all species images on mount to ensure instant loading in modals
  useEffect(() => {
    species.forEach(pest => {
      const img = new Image();
      img.src = pest.image;
    });
  }, []);

  return (
    <section className="pt-12 md:pt-16 pb-24 bg-bg-light relative overflow-hidden" id="species">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-16 relative z-10">

        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-primary-gray tracking-tighter uppercase">
            {t('species.title')}
          </h2>
          <div className="w-24 h-1.5 bg-accent-green mx-auto rounded-full"></div>
          <p className="text-secondary-gray/80 text-lg font-light pt-4 italic">
            Identificación precisa y protocolos de eliminación radical por especie.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 [@media(max-height:600px)_and_(orientation:landscape)]:grid-cols-4">
          {species.map((pest, i) => (
            <React.Fragment key={pest.id}>
              {i === 4 && (
                <div className="col-span-2 lg:col-span-4 [@media(max-height:600px)_and_(orientation:landscape)]:col-span-4 order-5 flex items-center justify-center py-4 px-12 md:px-0">
                  <div className="h-px bg-gradient-to-r from-transparent via-primary-blue/10 to-transparent flex-1"></div>
                  <div className="mx-6 flex items-center space-x-2 opacity-40">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-green"></div>
                    <div className="w-1 h-1 rounded-full bg-accent-green/50"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-green"></div>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-primary-blue/10 to-transparent flex-1"></div>
                </div>
              )}
              <PestCard 
                pest={pest}
                index={i}
                onClick={handlePestClick}
                isOpening={isOpening}
                t={t}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      <PestModal 
        pest={selectedPest}
        onClose={() => setSelectedPest(null)}
        t={t}
      />
    </section>
  );
};

export default PestGrid;
