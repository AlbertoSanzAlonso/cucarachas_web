import { Phone, Clock } from 'lucide-react';

const PromotionBar = () => {
  return (
    <div className="bg-secondary-gray text-white text-xs md:text-sm py-2">
      <div className="container flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Clock size={14} className="text-primary-blue" />
            L-V: 09:00 - 20:00 | Urgencias 24h
          </span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <Phone size={14} className="text-primary-blue" />
            Atención: 933 309 169 | 686 371 385
          </span>
        </div>
        <div className="flex items-center gap-4 font-bold uppercase tracking-wider">
          <span>Garantía 100%</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">Presupuesto sin compromiso</span>
        </div>
      </div>
    </div>
  );
};

export default PromotionBar;
