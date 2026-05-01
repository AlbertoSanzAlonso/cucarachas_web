import React from 'react';
import { cn } from '@/lib/utils';

const Badge = ({ className, children, variant = 'default', pulse = false, ...props }) => {
  const variants = {
    default: 'border-white/25 bg-white/10 text-white',
    accent: 'border-accent-green/25 bg-accent-green/10 text-accent-green',
    outline: 'border-primary-blue/20 bg-primary-blue/5 text-primary-blue',
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center space-x-3 px-4 py-1.5 rounded-full border backdrop-blur-sm transition-all",
        variants[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="flex h-2 w-2 rounded-full bg-accent-green animate-ping"></span>
      )}
      <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
        {children}
      </span>
    </div>
  );
};

export default Badge;
