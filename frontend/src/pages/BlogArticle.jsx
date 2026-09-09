import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingCTA from '@/components/FloatingCTA';
import SEO from '@/components/SEO';
import MarkdownBody from '@/components/Blog/MarkdownBody';
import { useGetBlogArticleQuery } from '@/store/apis/blogApi';

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

  useEffect(() => {
    window.scrollTo(0, 0);
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
                <div className="rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                </div>
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
      <FloatingCTA />
    </div>
  );
};

export default BlogArticle;
