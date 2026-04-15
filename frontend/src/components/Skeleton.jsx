import React from 'react';

export const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200/50 rounded-2xl ${className}`}></div>
);

export const DashboardSkeleton = () => (
  <div className="p-12 space-y-12 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
      <div className="space-y-4">
        <Skeleton className="w-48 h-10" />
        <Skeleton className="w-72 h-4" />
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-32 h-10" />
      </div>
    </div>
    
    <div className="grid grid-cols-4 gap-8">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40" />)}
    </div>

    <div className="grid grid-cols-3 gap-8">
      <Skeleton className="col-span-2 h-96" />
      <Skeleton className="h-96" />
    </div>
  </div>
);

export const SectionSkeleton = () => (
  <div className="py-24 max-w-7xl mx-auto px-6 space-y-12">
    <div className="space-y-4 flex flex-col items-center">
      <Skeleton className="w-64 h-12" />
      <Skeleton className="w-24 h-2" />
      <Skeleton className="w-96 h-4" />
    </div>
    <div className="grid grid-cols-4 gap-8">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-square" />)}
    </div>
  </div>
);
