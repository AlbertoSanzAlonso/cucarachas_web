import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const PestCard = ({ pest, index, onClick, isOpening, t }) => {
  const orderClasses = [
    'order-1', 'order-2', 'order-3', 'order-4',
    'order-6', 'order-7', 'order-8', 'order-9'
  ];

  return (
    <motion.div
      onClick={() => onClick(pest)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`group relative overflow-hidden rounded-[2rem] md:rounded-[3rem] h-auto min-h-[140px] md:aspect-square flex flex-col items-center justify-between [@media(max-height:600px)_and_(orientation:landscape)]:justify-center p-4 md:p-10 transition-all duration-500 hover:shadow-[0_25px_60px_-15px_rgba(0,128,187,0.3)] hover:translate-y-[-8px] cursor-pointer ${pest.darkText ? 'border border-primary-gray/10 bg-white' : ''} ${orderClasses[index]} ${isOpening ? 'cursor-wait opacity-80' : ''} [@media(max-height:600px)_and_(orientation:landscape)]:min-h-[110px] [@media(max-height:600px)_and_(orientation:landscape)]:p-3`}
      style={{ background: pest.color }}
    >
      {/* Category Label */}
      <div className="absolute top-3 left-6 md:top-6 md:left-8 opacity-40 z-20 [@media(max-height:600px)_and_(orientation:landscape)]:top-2 [@media(max-height:600px)_and_(orientation:landscape)]:left-4">
        <span className={`text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] ${pest.darkText ? 'text-primary-blue' : 'text-white'} [@media(max-height:600px)_and_(orientation:landscape)]:text-[6px]`}>
          {index < 4 ? t('species.label_pest') : (
            <>
              <span className="hidden md:inline">{t('species.label_solution')}</span>
              <span className="md:hidden">{t('species.label_solution_short')}</span>
            </>
          )}
        </span>
      </div>

      {/* Technical Pattern for Solutions */}
      {index >= 4 && (
        <div className={`absolute inset-0 opacity-[0.05] pointer-events-none ${pest.darkText ? 'bg-[radial-gradient(var(--color-primary-blue)_1px,transparent_1px)]' : 'bg-[radial-gradient(#fff_1px,transparent_1px)]'} bg-[length:15px_15px]`}></div>
      )}

      {/* Corner Search Icon */}
      <div className="absolute top-3 right-4 md:top-6 md:right-6 opacity-30 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 z-20 [@media(max-height:600px)_and_(orientation:landscape)]:hidden">
        <Search size={16} className={pest.darkText ? 'text-primary-blue' : 'text-white/80'} strokeWidth={3} />
      </div>

      {/* Main Icon */}
      <div className={`mt-2 md:mt-8 transform transition-transform duration-500 group-hover:scale-110 drop-shadow-lg ${pest.darkText ? 'text-primary-blue' : 'text-white'} w-7 h-7 md:w-14 md:h-14 [@media(max-height:600px)_and_(orientation:landscape)]:w-8 [@media(max-height:600px)_and_(orientation:landscape)]:h-8 [@media(max-height:600px)_and_(orientation:landscape)]:mt-0`}>
        {React.cloneElement(pest.icon, {
          size: '100%',
          strokeWidth: 2
        })}
      </div>

      <div className="text-center space-y-1 md:space-y-6 relative z-10 w-full px-1 [@media(max-height:600px)_and_(orientation:landscape)]:space-y-0 [@media(max-height:600px)_and_(orientation:landscape)]:mt-2">
        <h3 className={`font-extrabold text-xs md:text-xl tracking-tight leading-tight break-words hyphens-auto ${pest.darkText ? 'text-primary-blue' : 'text-white'} [@media(max-height:600px)_and_(orientation:landscape)]:text-[10px]`} style={{ hyphens: 'auto' }}>
          {pest.name}
          {pest.scientific && (
            <span className="block text-[7px] md:text-xs font-medium opacity-60 mt-0.5 uppercase tracking-wider [@media(max-height:600px)_and_(orientation:landscape)]:hidden">
              ({pest.scientific})
            </span>
          )}
        </h3>
        <div className="flex justify-center pt-2 [@media(max-height:600px)_and_(orientation:landscape)]:hidden">
          <span className={`text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-300 group-hover:scale-110 ${pest.darkText ? 'text-primary-blue/60' : 'text-white/70'}`}>
            {index < 4 ? t('species_detail.view_pest') : t('species_detail.view_treatment')}
          </span>
        </div>
      </div>

      {/* Background Watermark Icon */}
      <div className={`absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-all duration-700 rotate-12 scale-150 ${pest.darkText ? 'text-primary-blue' : 'text-white'}`}>
        {React.cloneElement(pest.icon, { size: 140 })}
      </div>

      {/* Hover Description Overlay (Floating Glass Style) */}
      <div className="absolute inset-x-4 bottom-4 glass p-4 rounded-xl opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 z-10 pointer-events-none">
        <p className="text-[10px] font-bold text-primary-gray leading-tight text-center">
          {pest.desc}
        </p>
      </div>
    </motion.div>
  );
};

export default PestCard;
