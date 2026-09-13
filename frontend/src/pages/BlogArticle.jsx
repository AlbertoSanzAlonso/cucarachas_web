import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, User, ArrowLeft, Clock, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import MarkdownBody from '@/components/Blog/MarkdownBody';
import { useGetBlogArticleQuery } from '@/store/apis/blogApi';
import { scrollToTop } from '@/utils/scrollToAnchor';

const formatDate = (value, language) => {
  if (!value) return '';
  try {
    return new Date(`${value}T12:00:00`).toLocaleDateString(
      language === 'en' ? 'en-GB' : language === 'es' ? 'es-ES' : 'ca-ES',
      { day: 'numeric', month: 'short', year: 'numeric' }
    );
  } catch {
    return value;
  }
};

const BlogArticle = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const { data: article, isLoading, isError } = useGetBlogArticleQuery(slug);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    scrollToTop();
  }, [slug]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.lenis?.stop();
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.lenis?.start();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxOpen]);

  useEffect(() => {
    setLightboxOpen(false);
  }, [slug]);

  return (
    <div className="min-h-screen bg-bg-light">
      {article && (
        <SEO
          title={`${article.title} | CECSA Barcelona`}
          description={article.meta_description || article.excerpt}
          url={`/blog/${article.slug}`}
        />
      )}

      <Navbar />

      <main className="pt-40 md:pt-36 pb-64 md:pb-80">
        <div className="max-w-3xl mx-auto px-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-blue mb-10 hover:text-primary-blue-hv"
          >
            <ArrowLeft size={16} />
            {t('blog.back_to_blog', { defaultValue: 'Tornar al blog' })}
          </Link>

          {isLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-primary-blue/10 rounded-2xl w-3/4" />
              <div className="h-64 bg-primary-blue/5 rounded-[2rem]" />
              <div className="h-4 bg-primary-gray/10 rounded w-full" />
              <div className="h-4 bg-primary-gray/10 rounded w-5/6" />
            </div>
          )}

          {(isError || (!isLoading && !article)) && (
            <div className="text-center py-24 space-y-4">
              <h1 className="text-2xl font-black text-primary-blue">
                {t('blog.article_not_found', { defaultValue: 'Article no trobat' })}
              </h1>
              <Link to="/blog" className="text-primary-blue font-bold underline">
                {t('blog.back_to_blog', { defaultValue: 'Tornar al blog' })}
              </Link>
            </div>
          )}

          {article && (
            <article className="space-y-8">
              <header className="space-y-6">
                <span className="inline-block py-1 px-3 bg-accent-green text-primary-blue text-[10px] font-black uppercase rounded-full">
                  {t(`blog.categories.${article.category}`, { defaultValue: article.category })}
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-primary-blue tracking-tight leading-none">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-secondary-gray/50 uppercase tracking-widest">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(article.published_at, i18n.language)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <User size={12} />
                    {article.author}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} />
                    {article.read_time || `${article.read_time_minutes} min`}
                  </span>
                </div>
              </header>

              {article.image && (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label={t('blog.open_image', { defaultValue: 'Obrir imatge a pantalla completa' })}
                  className="block w-full rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2"
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                </button>
              )}

              <p className="text-lg text-secondary-gray/70 font-light leading-relaxed border-l-4 border-accent-green pl-6">
                {article.excerpt}
              </p>

              <MarkdownBody content={article.body} />
            </article>
          )}
        </div>
      </main>

      <Footer />

      {lightboxOpen &&
        article?.image &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={t('blog.open_image', { defaultValue: 'Obrir imatge a pantalla completa' })}
          >
            <div className="absolute inset-0 bg-slate-900/92 backdrop-blur-sm" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-10 p-3 rounded-full bg-white text-primary-blue shadow-lg hover:bg-accent-green hover:text-white transition-colors cursor-pointer"
              aria-label={t('blog.close_image', { defaultValue: 'Tancar imatge' })}
            >
              <X size={24} strokeWidth={2.5} />
            </button>
            <img
              src={article.image}
              alt={article.title}
              className="relative z-[1] max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
            />
          </div>,
          document.body
        )}
    </div>
  );
};

export default BlogArticle;
