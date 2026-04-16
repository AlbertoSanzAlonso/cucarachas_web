import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEO = ({ title, description, image, url, type = 'website' }) => {
  const { t, i18n } = useTranslation();
  
  const siteName = 'CECSA | Control de Plagas';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDesc = 'Expertos en control técnico de cucarachas en Barcelona y Catalunya. Desinsectación ética y consciente para hogares, bares, hoteles e industrias.';
  const metaDesc = description || defaultDesc;
  const canonicalUrl = `https://cucarachasbarcelona.cat${url || ''}`;
  const siteImage = image || '/assets/og-image.webp'; // Default OG image

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={canonicalUrl} />
      <html lang={i18n.language} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={siteImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={siteImage} />
    </Helmet>
  );
};

export default SEO;
