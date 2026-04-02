import { Phone, Clock, ShieldCheck } from 'lucide-react';

const PromotionBar = () => {
  return (
    <div className="bg-secondary-gray text-white text-[10px] md:text-xs py-4 border-b border-white/5 relative z-[60]">
      <div className="container flex justify-between items-center px-6">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 group cursor-default">
            <Clock size={12} className="text-primary-blue animate-pulse" />
            <span className="text-white/80 group-hover:text-white transition-colors">Urgencias 24h</span>
          </span>
          <a href="tel:933309169" className="hidden sm:flex items-center gap-2 group">
            <Phone size={12} className="text-primary-blue" />
            <span className="text-white/90 group-hover:text-primary-blue transition-colors font-bold tracking-widest">933 309 169</span>
          </a>
        </div>
        <div className="flex items-center gap-6 font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px]">
          <span className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-primary-blue" />
            <span className="hidden md:inline">Acreditación Sanitaria</span> ROESB
          </span>
        </div>
      </div>
    </div>
  );
};

export default PromotionBar;
