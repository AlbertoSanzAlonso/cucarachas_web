import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetCompanyQuery } from '@/store/apis/companyApi';
import {
  ArrowLeft,
  MessageCircle,
  Search,
  ShieldCheck,
  UtensilsCrossed,
} from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const HospitalityService = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('es') ? 'es' : 'ca';
  const { data: company } = useGetCompanyQuery(lang);
  const whatsappUrl = company?.whatsapp_url || 'https://wa.me/34681033305';
  const whatsappBase = whatsappUrl.split('?')[0];
  const whatsappHref = `${whatsappBase}?text=${encodeURIComponent(t('hospitality_page.whatsapp_prefill'))}`;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: t('hospitality_page.seo_title'),
    description: t('hospitality_page.seo_desc'),
    provider: {
      '@type': 'LocalBusiness',
      name: 'CECSA Control de Plagas',
      url: 'https://cucarachasbarcelona.cat',
      telephone: '+34933309169',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Barcelona',
        addressCountry: 'ES',
      },
    },
    areaServed: 'Barcelona, Catalunya',
    serviceType: 'Control de cucaracha alemana en hostelería',
    offers: {
      '@type': 'Offer',
      price: '1100',
      priceCurrency: 'EUR',
      description: t('hospitality_page.price_label'),
    },
  };

  return (
    <div className="min-h-screen bg-bg-light">
      <SEO
        title={t('hospitality_page.seo_title')}
        description={t('hospitality_page.seo_desc')}
        url="/servei-panerola-alemana-hostaleria"
        image="/assets/inspeccion-plagas-cocina-profesional.webp"
        schemaData={schema}
      />
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-48 md:pt-40 md:pb-56 overflow-hidden text-white z-20">
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/inspeccion-plagas-cocina-profesional.webp"
              alt=""
              className="w-full h-full object-cover opacity-40 mix-blend-overlay"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, rgba(0, 77, 112, 0.97) 0%, rgba(0, 128, 187, 0.9) 55%, rgba(0, 111, 163, 0.85) 100%)',
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20px_20px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[length:40px_40px]" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-bg-light origin-bottom-right -skew-y-3 translate-y-24" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <Link
              to="/#hostaleria"
              className="inline-flex items-center gap-3 text-white/50 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-5 py-2 rounded-full border border-white/10 mb-10 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {t('hospitality_page.back')}
              </span>
            </Link>

            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent-green/15 border border-accent-green/30 mb-8">
              <UtensilsCrossed size={16} className="text-accent-green" strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-accent-green">
                {t('hospitality_page.badge')}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tighter mb-8 text-white">
              {t('hospitality_page.hero_title')}
            </h1>

            <p className="text-lg md:text-xl text-white/75 font-light leading-relaxed max-w-3xl">
              {t('hospitality_page.hero_lead')}
            </p>
          </div>
        </section>

        {/* Problem */}
        <section className="relative z-10 max-w-4xl mx-auto px-6 pt-8 md:pt-12 pb-16 md:pb-20">
          <div className="space-y-6 text-secondary-gray/85 text-lg leading-relaxed font-light">
            <p>{t('hospitality_page.problem_p1')}</p>
            <p>{t('hospitality_page.problem_p2')}</p>
            <p className="text-xl md:text-2xl font-bold text-primary-blue tracking-tight border-l-4 border-accent-green pl-6 py-1">
              {t('hospitality_page.problem_emphasis')}
            </p>
          </div>
        </section>

        {/* Solution */}
        <section className="bg-white py-16 md:py-24 border-y border-primary-blue/5">
          <div className="max-w-4xl mx-auto px-6 space-y-10">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black text-primary-blue tracking-tighter">
                {t('hospitality_page.solution_title')}
              </h2>
              <p className="text-lg text-secondary-gray/80 font-light leading-relaxed">
                {t('hospitality_page.solution_p1')}
              </p>
              <p className="text-lg text-secondary-gray/80 font-light leading-relaxed">
                {t('hospitality_page.solution_p2')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex gap-4 p-6 rounded-2xl bg-bg-light border border-primary-blue/5">
                <div className="shrink-0 p-3 rounded-xl bg-accent-green/15 text-accent-green">
                  <Search size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-black text-primary-blue mb-1 tracking-tight">
                    {t('hospitality_page.approach_q')}
                  </p>
                  <p className="text-sm text-secondary-gray/70 leading-relaxed">
                    {t('hospitality_page.approach_a')}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-6 rounded-2xl bg-bg-light border border-primary-blue/5">
                <div className="shrink-0 p-3 rounded-xl bg-accent-green/15 text-accent-green">
                  <ShieldCheck size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-black text-primary-blue mb-1 tracking-tight">
                    {t('hospitality_page.followup_title')}
                  </p>
                  <p className="text-sm text-secondary-gray/70 leading-relaxed">
                    {t('hospitality_page.followup_desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Offer */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <div
              className="rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden"
              style={{
                background:
                  'linear-gradient(145deg, var(--primary-blue) 0%, var(--primary-blue-hv) 100%)',
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20px_20px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[length:36px_36px] opacity-50" />
              <div className="relative z-10 space-y-6">
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-accent-green">
                  {t('hospitality_page.offer_badge')}
                </p>
                <h2 className="text-2xl md:text-4xl font-black tracking-tighter leading-tight text-white">
                  {t('hospitality_page.offer_title')}
                </h2>
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-4xl md:text-5xl font-black text-accent-green tracking-tighter">
                    {t('hospitality_page.price')}
                  </span>
                  <span className="text-white/60 font-medium">{t('hospitality_page.price_label')}</span>
                </div>
                <p className="text-white/75 font-light leading-relaxed text-lg max-w-2xl">
                  {t('hospitality_page.offer_desc')}
                </p>
                <p className="text-white font-medium leading-relaxed border-l-4 border-accent-green pl-5">
                  {t('hospitality_page.offer_commitment')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="pb-24 md:pb-32">
          <div className="max-w-4xl mx-auto px-6 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black text-primary-blue tracking-tighter">
                {t('hospitality_page.contact_title')}
              </h2>
              <p className="text-lg text-secondary-gray/80 font-light leading-relaxed">
                {t('hospitality_page.contact_desc')}
              </p>
              <p className="text-lg font-bold text-secondary-gray tracking-tight">
                {t('hospitality_page.contact_ethic')}
              </p>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black uppercase tracking-wider text-sm transition-all duration-300 hover:translate-y-[-2px] active:scale-95"
              style={{
                background: 'var(--accent-green)',
                color: 'var(--secondary-gray)',
                boxShadow: '0 12px 40px rgba(52, 211, 153, 0.35)',
              }}
            >
              <MessageCircle size={20} strokeWidth={2.5} />
              {t('hospitality_page.whatsapp_cta')}
            </a>

            <p className="pt-8 text-sm text-secondary-gray/50 font-medium tracking-wide">
              {t('hospitality_page.footer_brand')}
              <br />
              {t('hospitality_page.footer_line')}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HospitalityService;
