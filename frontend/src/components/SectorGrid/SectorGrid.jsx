import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Utensils, Hotel, Users, Factory } from 'lucide-react';

import SectorCard from '@/components/SectorGrid/SectorCard';
import SectorModal from '@/components/SectorGrid/SectorModal';

const SectorGrid = () => {
  const { t } = useTranslation();
  const [selectedSector, setSelectedSector] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const sectors = [
    { 
      id: 'horeca', 
      name: t('sectors_grid.horeca'), 
      icon: <Utensils />,
      desc: t('sectors_grid.horeca_desc'),
      points: t('sectors_grid.horeca_points', { returnObjects: true }),
      bg: '/assets/taula-de-cuina-amb-granit-endoftext-.webp'
    },
    { 
      id: 'hotels', 
      name: t('sectors_grid.hotels'), 
      icon: <Hotel />,
      desc: t('sectors_grid.hotels_desc'),
      points: t('sectors_grid.hotels_points', { returnObjects: true }),
      bg: '/assets/hotel-bg.webp'
    },
    { 
      id: 'comms', 
      name: t('sectors_grid.comms'), 
      icon: <Users />,
      desc: t('sectors_grid.comms_desc'),
      points: t('sectors_grid.comms_points', { returnObjects: true }),
      bg: '/assets/hogar-protegido-libre-de-cucarachas.webp'
    },
    { 
      id: 'industry', 
      name: t('sectors_grid.industry'), 
      icon: <Factory />,
      desc: t('sectors_grid.industry_desc'),
      points: t('sectors_grid.industry_points', { returnObjects: true }),
      bg: '/assets/industry-bg.webp'
    }
  ];

  useEffect(() => {
    if (selectedSector) {
      document.body.style.overflow = 'hidden';
      setImageLoaded(true);
    } else {
      document.body.style.overflow = 'unset';
      setImageLoaded(false);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedSector]);

  useEffect(() => {
    sectors.forEach(sector => {
      const img = new Image();
      img.src = sector.bg;
    });
  }, [sectors]);

  const handleSectorClick = (sector) => {
    if (isOpening) return;
    setIsOpening(true);
    const img = new Image();
    img.src = sector.bg;
    const finalize = () => {
      setSelectedSector(sector);
      setIsOpening(false);
    };
    if (img.complete) finalize();
    else {
      img.onload = finalize;
      img.onerror = finalize;
    }
  };

  return (
    <section className="py-32 md:py-40 bg-white" id="sectors">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
        
        <div className="max-w-3xl mx-auto space-y-4">
           <h2 className="text-3xl md:text-5xl font-black text-primary-blue tracking-tight uppercase">
             <span className="inline-block border-b-[8px] md:border-b-[16px] border-accent-green/80 leading-tight pb-1 md:pb-2">
               {t('sectors_grid.title')}
             </span>
           </h2>
           <p className="text-secondary-gray/80 text-lg font-light pt-8">
             {t('sectors_grid.desc')}
           </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           {sectors.map((sector) => (
             <SectorCard 
               key={sector.id}
               sector={sector}
               onClick={handleSectorClick}
               isOpening={isOpening}
             />
           ))}
        </div>
      </div>

      <SectorModal 
        sector={selectedSector}
        isOpen={!!selectedSector}
        onClose={() => setSelectedSector(null)}
        setImageLoaded={setImageLoaded}
      />
    </section>
  );
};

export default SectorGrid;
