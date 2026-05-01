import React from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FAQFilters = ({ searchTerm, setSearchTerm, activeCategory, setActiveCategory }) => {
  const { t } = useTranslation();

  const categories = [
    { id: 'all' },
    { id: 'seguretat' },
    { id: 'tecnic' },
    { id: 'preus' },
    { id: 'garantia' }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 -mt-32 md:-mt-40 relative z-40 mb-12">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-white p-6 rounded-[2.5rem] shadow-2xl border border-gray-100/50 backdrop-blur-xl">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 w-full lg:w-auto px-2 justify-center lg:justify-start">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-3 lg:px-8 lg:py-4 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-primary-blue text-white shadow-xl scale-105' : 'bg-bg-light text-secondary-gray/40 hover:text-primary-blue hover:bg-white border border-transparent hover:border-gray-200'}`}
            >
              {t(`faq.categories.${cat.id}`)}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-gray/30" size={20} />
          <input 
            type="text" 
            placeholder={t('faq.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-8 py-5 bg-bg-light rounded-full border-none focus:ring-2 focus:ring-primary-blue/20 text-sm font-semibold text-primary-gray"
          />
        </div>
      </div>
    </section>
  );
};

export default FAQFilters;
