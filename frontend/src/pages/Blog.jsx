import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingCTA from '@/components/FloatingCTA';
import SEO from '@/components/SEO';
import { SectionSkeleton } from '@/components/Skeleton';

import BlogHero from '@/components/Blog/BlogHero';
import BlogFilters from '@/components/Blog/BlogFilters';
import BlogGrid from '@/components/Blog/BlogGrid';
import BlogPagination from '@/components/Blog/BlogPagination';
import BlogFAQBanner from '@/components/Blog/BlogFAQBanner';
import { useGetBlogArticlesQuery } from '@/store/apis/blogApi';

const StatsBar = lazy(() => import('@/components/StatsBar'));
const ContactForm = lazy(() => import('@/components/ContactForm'));

const Blog = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { data: articles = [], isLoading, isError } = useGetBlogArticlesQuery({
    category: activeCategory,
    search: searchTerm.trim() || undefined,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(articles.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedArticles = articles.slice(startIndex, startIndex + itemsPerPage);

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

        <section className="bg-white pt-32 pb-80 md:pb-[35rem] relative z-10 -mt-32">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-96 rounded-[2.5rem] bg-primary-blue/5 animate-pulse" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-24 text-primary-gray/60 font-bold">
                {t('blog.load_error', { defaultValue: "No s'han pogut carregar els articles" })}
              </div>
            ) : (
              <>
                <BlogGrid articles={paginatedArticles} t={t} />
                <BlogPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
              </>
            )}

            <BlogFAQBanner />
          </div>
        </section>

        <div className="relative mt-[-150px] md:mt-[-250px] z-40">
          <div
            className="absolute top-0 left-0 right-0 -bottom-96 -skew-y-3 origin-top-right scale-x-110 shadow-[0_-30px_60px_rgba(0,128,187,0.25)] border-t border-white/5"
            style={{
              background:
                'linear-gradient(135deg, rgba(0, 128, 187, 0.98) 0%, rgba(0, 111, 163, 0.92) 100%), url(/assets/barcelona-authority.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />

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
