import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, HelpCircle, ShieldCheck, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = lazy(() => import('../components/Navbar'));
const StatsBar = lazy(() => import('../components/StatsBar'));
const ContactForm = lazy(() => import('../components/ContactForm'));
const Footer = lazy(() => import('../components/Footer'));
const FloatingCTA = lazy(() => import('../components/FloatingCTA'));
import SEO from '../components/SEO';
import { SectionSkeleton } from '../components/Skeleton';

const FAQ = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openId, setOpenId] = useState(null);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    { id: 'all' },
    { id: 'seguretat' },
    { id: 'tecnic' },
    { id: 'preus' },
    { id: 'garantia' }
  ];

  const faqItems = t('faq.items', { returnObjects: true }) || [];

  // Map icons to categories
  const categoryIcons = {
    seguretat: <ShieldCheck size={20} />,
    tecnic: <Zap size={20} />,
    garantia: <ShieldCheck size={20} />,
    preus: <Clock size={20} />,
    default: <HelpCircle size={20} />
  };

  const filteredFaqs = faqItems.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-bg-light">
      <SEO 
        title="FAQ - Preguntes Freqüents | CECSA Barcelona" 
        description="Resol els teus dubtes sobre el control de paneroles, seguretat dels tractaments i preus a Barcelona amb el nostre centre d'ajuda."
        url="/faq"
      />

      <Suspense fallback={<div className="h-20 bg-primary-blue" />}>
        <Navbar />
      </Suspense>

      <main>
        {/* FAQ Hero - Same as Blog Style */}
        <section 
          className="relative pt-32 pb-56 md:pt-40 md:pb-72 bg-primary-blue overflow-hidden z-20"
          style={{ 
            clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)',
          }}
        >
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/assets/blog-hero-technical.png" 
              alt="FAQ CECSA - Control de Plagues" 
              className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-blue via-primary-blue/90 to-primary-blue-hv/80"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20px_20px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[length:40px_40px]"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <span className="inline-block py-2 px-8 glass-dark rounded-full text-white font-black text-[10px] tracking-[0.4em] uppercase border border-white/5 shadow-2xl">
                {t('faq.hero_badge')}
              </span>
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">
                {t('faq.hero_title_main')} <span className="text-accent-green">{t('faq.hero_title_accent')}</span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-white/70 font-light leading-relaxed drop-shadow-lg">
                {t('faq.hero_desc')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters and Search - Same Blog Style */}
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

        {/* FAQ Grid/Accordion */}
        <section className="bg-white pt-32 md:pt-48 pb-80 md:pb-[35rem] relative z-10 -mt-32">
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <div className="space-y-4">
              <AnimatePresence>
                {filteredFaqs.map((faq, idx) => (
                  <motion.div
                    key={faq.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`rounded-[2rem] border transition-all duration-300 ${openId === faq.id ? 'bg-primary-blue border-primary-blue shadow-2xl scale-[1.02]' : 'bg-bg-light border-gray-100'}`}
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left p-8 md:p-10 flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-6">
                        <div className={`p-4 rounded-2xl transition-colors ${openId === faq.id ? 'bg-white/10 text-accent-green' : 'bg-white text-primary-blue shadow-sm'}`}>
                          {categoryIcons[faq.category] || categoryIcons.default}
                        </div>
                        <h3 className={`text-lg md:text-xl font-black leading-tight tracking-tight ${openId === faq.id ? 'text-white' : 'text-primary-blue group-hover:text-primary-blue-hv'}`}>
                          {faq.question}
                        </h3>
                      </div>
                      <ChevronDown 
                        size={24} 
                        className={`transition-transform duration-500 ${openId === faq.id ? 'rotate-180 text-white' : 'text-secondary-gray/30'}`} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {openId === faq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-8 md:px-10 pb-10 flex items-start space-x-6">
                            <div className="w-10 flex-shrink-0" />
                            <p className="text-white/70 leading-relaxed font-light text-lg">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredFaqs.length === 0 && (
                <div className="text-center py-24 space-y-4">
                  <div className="w-20 h-20 bg-primary-blue/5 rounded-full flex items-center justify-center mx-auto text-primary-blue/20">
                    <Search size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-primary-gray">{t('faq.no_results')}</h3>
                  <p className="text-secondary-gray/60">{t('faq.no_results_desc')}</p>
                </div>
              )}
            </div>

            {/* Secondary Contact CTA */}
            <div className="mt-24 p-12 bg-bg-light rounded-[3rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-center md:text-left">
                <h4 className="text-2xl font-black text-primary-blue tracking-tight">{t('faq.cta_title')}</h4>
                <p className="text-secondary-gray/50">{t('faq.cta_desc')}</p>
              </div>
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-primary-blue text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-primary-blue-hv transition-all transform hover:scale-105"
              >
                {t('faq.cta_btn')}
              </button>
            </div>
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

      <Suspense fallback={<footer className="h-64 bg-primary-blue" />}>
        <Footer />
      </Suspense>

      <Suspense fallback={null}>
        <FloatingCTA />
      </Suspense>
    </div>
  );
};

export default FAQ;
