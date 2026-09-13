import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, UtensilsCrossed } from 'lucide-react';

const HospitalityCTA = () => {
  const { t } = useTranslation();

  return (
    <section
      id="hostaleria"
      className="relative py-20 md:py-28 overflow-hidden"
      aria-labelledby="hospitality-cta-title"
    >
      <div className="absolute inset-0">
        <img
          src="/assets/inspeccion-plagas-cocina-profesional.webp"
          alt=""
          className="w-full h-full object-cover scale-105"
          loading="lazy"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(0, 77, 112, 0.96) 0%, rgba(0, 128, 187, 0.88) 48%, rgba(0, 111, 163, 0.72) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20px_20px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[length:40px_40px] opacity-60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7 space-y-7 text-white">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <UtensilsCrossed size={16} className="text-accent-green" strokeWidth={2.5} />
              <span className="text-[10px] uppercase font-black tracking-[0.25em] text-accent-green">
                {t('hospitality_cta.badge')}
              </span>
            </div>

            <h2
              id="hospitality-cta-title"
              className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-black leading-[0.95] tracking-tighter max-w-3xl text-white"
            >
              {t('hospitality_cta.title')}
            </h2>

            <p className="text-lg md:text-xl text-white/75 font-light leading-relaxed max-w-2xl">
              {t('hospitality_cta.desc')}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-2">
              <Link
                to="/servei-panerola-alemana-hostaleria"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-sm transition-all duration-300 hover:translate-y-[-2px] active:scale-95"
                style={{
                  background: 'var(--accent-green)',
                  color: 'var(--secondary-gray)',
                  boxShadow: '0 12px 40px rgba(52, 211, 153, 0.35)',
                }}
              >
                {t('hospitality_cta.cta')}
                <ArrowRight size={18} strokeWidth={2.5} />
              </Link>

              <div className="flex items-baseline gap-2 text-white">
                <span className="text-3xl md:text-4xl font-black tracking-tighter text-white">
                  {t('hospitality_cta.price')}
                </span>
                <span className="text-sm font-medium text-white/70">
                  {t('hospitality_cta.price_note')}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-[2rem] overflow-hidden border border-white/15 shadow-2xl aspect-[4/3] group">
              <img
                src="/assets/cucaracha-en-la-cuina-nocturna.webp"
                alt={t('hospitality_cta.image_alt')}
                className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#004d70]/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-accent-green mb-2">
                  {t('hospitality_cta.highlight_label')}
                </p>
                <p className="text-white font-bold text-lg leading-snug">
                  {t('hospitality_cta.highlight')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HospitalityCTA;
