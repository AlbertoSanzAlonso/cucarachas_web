import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ChevronRight, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BlogGrid = ({ articles, t }) => {
  if (articles.length === 0) {
    return (
      <div className="text-center py-24 space-y-4">
        <div className="w-20 h-20 bg-primary-blue/5 rounded-full flex items-center justify-center mx-auto text-primary-blue/20">
          <Search size={40} />
        </div>
        <h3 className="text-xl font-bold text-primary-gray">{t('blog.no_results')}</h3>
        <p className="text-secondary-gray/60">{t('blog.no_results_desc')}</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <AnimatePresence mode="popLayout" initial={false}>
        {articles.map((article, idx) => (
          <motion.article
            key={article.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="group bg-bg-light rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 flex flex-col h-full"
          >
            {/* Image Container */}
            <div className="relative h-64 overflow-hidden">
              <img 
                src={article.image} 
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 flex items-center space-x-2">
                 <span className="py-1 px-3 bg-accent-green text-primary-blue text-[10px] font-black uppercase rounded-full shadow-lg">
                   {article.category}
                 </span>
                 <span className="py-1 px-3 glass text-white text-[10px] font-black uppercase rounded-full">
                   {article.readTime}
                 </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-4 flex-grow flex flex-col">
              <div className="flex items-center space-x-4 text-[10px] font-bold text-secondary-gray/40 uppercase tracking-widest">
                <div className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>{article.date}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User size={12} />
                  <span>{article.author}</span>
                </div>
              </div>

              <h3 className="text-xl font-black text-primary-blue leading-tight tracking-tight group-hover:text-accent-green-hv transition-colors">
                {article.title}
              </h3>

              <p className="text-sm text-secondary-gray/60 leading-relaxed line-clamp-3">
                {article.excerpt}
              </p>

              <div className="pt-6 mt-auto">
                <button className="flex items-center space-x-2 text-xs font-black uppercase tracking-[0.2em] text-primary-blue group/btn">
                  <span>{t('blog.read_more')}</span>
                  <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-2" />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BlogGrid;
