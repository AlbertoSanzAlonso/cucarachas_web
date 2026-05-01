import React from 'react';
import { ChevronRight } from 'lucide-react';

const BlogPagination = ({ currentPage, totalPages, setCurrentPage }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-20 flex items-center justify-center space-x-3">
      <button 
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="p-4 rounded-2xl bg-bg-light text-primary-blue disabled:opacity-30 hover:bg-primary-blue hover:text-white transition-all shadow-md group"
      >
        <ChevronRight size={20} className="rotate-180" />
      </button>
      
      <div className="flex items-center space-x-2">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`w-12 h-12 rounded-2xl font-black text-sm transition-all shadow-md ${currentPage === i + 1 ? 'bg-primary-blue text-white scale-110 shadow-primary-blue/30' : 'bg-bg-light text-primary-blue hover:bg-gray-200'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <button 
        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
        className="p-4 rounded-2xl bg-bg-light text-primary-blue disabled:opacity-30 hover:bg-primary-blue hover:text-white transition-all shadow-md group"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default BlogPagination;
