import React, { forwardRef } from 'react';

const ScrollArea = forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div 
      ref={ref}
      className={`overflow-y-auto custom-scrollbar ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
});

export default ScrollArea;
