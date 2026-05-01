import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SectorCard = ({ sector, onClick, isOpening }) => {
  const { t } = useTranslation();
  
  return (
    <div 
      onClick={() => onClick(sector)}
      className={`group p-10 bg-bg-light rounded-[2.5rem] border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:translate-y-[-10px] cursor-pointer relative overflow-hidden ${isOpening ? 'cursor-wait opacity-80' : ''}`}
    >
      {/* Background Image Watermark */}
      <div className="absolute inset-0 opacity-[0.15] group-hover:opacity-[0.25] transition-opacity duration-500 z-0">
        <img 
          src={sector.bg} 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Container to ensure stacking over background */}
      <div className="relative z-10 w-full h-full flex flex-col items-center">
        {/* Visual Icon with colored circle */}
        <div className="mb-10 mx-auto w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
          <div className="text-primary-blue group-hover:text-accent-green transition-colors duration-500">
            {React.cloneElement(sector.icon, { size: 40, strokeWidth: 1.5 })}
          </div>
        </div>

        <div className="space-y-4 text-center">
          <h3 className="text-primary-blue font-black text-xl tracking-tighter group-hover:text-accent-green transition-colors">
            {sector.name}
          </h3>
          <Link 
            to={`/serveis/${sector.id}`}
            onClick={(e) => e.stopPropagation()} 
            className="inline-flex items-center text-[10px] uppercase font-bold tracking-widest text-secondary-gray/40 hover:text-accent-green transition-colors relative z-20"
          >
            {t('sectors_grid.cta')} <ChevronRight size={14} className="ml-1" />
          </Link>
        </div>
      </div>

      {/* Decorative Pattern background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none z-0">
        <span className="absolute -bottom-10 -right-10 transform scale-[3] text-primary-blue">
          {sector.icon}
        </span>
      </div>
    </div>
  );
};

export default SectorCard;
