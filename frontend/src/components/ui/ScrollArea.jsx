import React, { forwardRef } from 'react';

const ScrollArea = forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-lenis-prevent
      className={`min-h-0 overflow-y-auto overscroll-y-contain custom-scrollbar ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export default ScrollArea;
