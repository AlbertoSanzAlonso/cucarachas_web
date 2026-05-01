import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingCTA from '@/components/FloatingCTA';
import SEO from '@/components/SEO';
import { SectionSkeleton } from '@/components/Skeleton';

// Modular Sections
import BlogHero from '@/components/Blog/BlogHero';
import BlogFilters from '@/components/Blog/BlogFilters';
import BlogGrid from '@/components/Blog/BlogGrid';
import BlogPagination from '@/components/Blog/BlogPagination';
import BlogFAQBanner from '@/components/Blog/BlogFAQBanner';
import { getBlogArticles } from '@/components/Blog/blogData';

const OrigenService = lazy(() => import('@/components/OrigenService'));
const StatsBar = lazy(() => import('@/components/StatsBar'));
const ContactForm = lazy(() => import('@/components/ContactForm'));

const Blog = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const articles = getBlogArticles();

  // Scroll to top on load or page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchTerm]);

  return (
    <div className="min-h-screen bg-bg-light">
      <SEO 
        title="Blog de Control de Plagas | CECSA Barcelona" 
        description="Artículos técnicos, consejos de prevención y curiosidades sobre el control de cucarachas y salud ambiental en Barcelona."
        url="/blog"
      />

      <Navbar />

      <main>
        <BlogHero />

        <BlogFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        {/* Articles Grid Section */}
        <section className="bg-white pt-32 pb-80 md:pb-[35rem] relative z-10 -mt-32">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <BlogGrid articles={paginatedArticles} t={t} />

            <BlogPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />

            <BlogFAQBanner />
          </div>
        </section>

        {/* Unified Authority Section (Stats + Contact) */}
        <div className="relative mt-[-150px] md:mt-[-250px] z-40">
          <div 
            className="absolute top-0 left-0 right-0 -bottom-96 -skew-y-3 origin-top-right scale-x-110 shadow-[0_-30px_60px_rgba(0,128,187,0.25)] border-t border-white/5"
            style={{ 
              background: 'linear-gradient(135deg, rgba(0, 128, 187, 0.98) 0%, rgba(0, 111, 163, 0.92) 100%), url(/assets/barcelona-authority.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          ></div>
          
          <div className="relative z-10">
            <Suspense fallback={<SectionSkeleton />}>
              <StatsBar />
            </Suspense>
            <Suspense fallback={<SectionSkeleton />}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingCTA />
    </div>
  );
};

export default Blog;
