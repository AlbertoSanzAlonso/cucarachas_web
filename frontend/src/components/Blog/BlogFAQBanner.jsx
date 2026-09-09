import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BlogFAQBanner = () => {
  const { t } = useTranslation();

  return (
    <div className="mt-32 relative z-50">
      <div className="max-w-5xl mx-auto">
        <div className="bg-primary-blue p-12 md:p-16 rounded-[4rem] relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-green/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-black text-white leading-none">
                {t('blog.faq_banner_title', { defaultValue: 'Tens dubtes específics?' })}
              </h2>
              <p className="text-white/70 font-light leading-relaxed">
                {t('blog.faq_banner_desc', {
                  defaultValue:
                    'Consulta la secció de preguntes freqüents o contacta amb el nostre equip tècnic.',
                })}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/blog/faq"
                  className="px-8 py-4 bg-accent-green text-primary-blue font-black text-xs tracking-widest uppercase rounded-2xl shadow-lg hover:bg-accent-green-hv transition-all text-center"
                >
                  {t('blog.faq_banner_cta', { defaultValue: 'Veure FAQ' })}
                </Link>
                <button
                  type="button"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white/10 text-white font-black text-xs tracking-widest uppercase rounded-2xl border border-white/10 hover:bg-white/20 transition-all"
                >
                  {t('blog.faq_banner_contact', { defaultValue: 'Contactar' })}
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="p-8 bg-white/5 rounded-3xl border border-white/10 rotate-3">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full bg-white/${i === 1 ? '40' : i === 2 ? '20' : '10'} ${
                        i === 1 ? 'w-full' : i === 2 ? 'w-3/4' : 'w-1/2'
                      }`}
                    />
                  ))}
                  <div className="pt-4 flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-accent-green/20" />
                    <div className="w-24 h-8 rounded-full bg-accent-green shadow-xl flex items-center justify-center">
                      <ChevronRight className="text-primary-blue" size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogFAQBanner;
