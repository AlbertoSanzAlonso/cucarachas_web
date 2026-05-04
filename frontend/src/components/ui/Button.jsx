import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';


const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'default', 
  asChild = false, 
  ...props 
}, ref) => {
  const variants = {
    primary: 'bg-primary-blue text-white hover:bg-primary-blue-hv shadow-[0_4px_15px_rgba(0,128,187,0.3)]',
    accent: 'bg-accent-green text-primary-gray font-black hover:bg-accent-green-hv shadow-[0_4px_15px_rgba(0,0,0,0.1)]',
    outline: 'border border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20',
    ghost: 'bg-transparent hover:bg-white/10 text-white',
    link: 'text-primary-blue underline-offset-4 hover:underline',
  };

  const sizes = {
    default: 'px-6 py-2.5 rounded-full text-sm font-bold',
    lg: 'px-10 py-5 rounded-2xl text-lg font-black',
    sm: 'px-4 py-2 rounded-xl text-xs font-bold',
    icon: 'p-3 rounded-full',
  };

  const Component = motion.button;

  return (
    <Component
      className={cn(
        'inline-flex items-center justify-center uppercase tracking-wider transition-all duration-300 active:scale-95 disabled:pointer-events-none disabled:opacity-50 hover:translate-y-[-2px]',
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export default Button;
