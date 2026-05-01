import React from 'react';
import { Users, Activity, Heart, Scale, HeartPulse, ShieldCheck } from 'lucide-react';

export const getAboutStats = (t) => [
  { icon: <Users />, value: "9", label: t('about_page.stats.workers') },
  { icon: <Activity />, value: t('about_page.stats.success'), label: t('about_page.stats.success_label') },
  { icon: <Heart />, value: t('about_page.stats.experience'), label: t('about_page.stats.experience_label') }
];

export const getAboutSections = (t) => [
  {
    id: "family",
    title: t('about_page.family_title'),
    content: t('about_page.family_desc'),
    icon: <Users className="text-accent-green" size={40} />,
    color: "bg-primary-blue/5",
    image: "/assets/familia-sureda-cecsa-barcelona.webp"
  },
  {
    id: "conscience",
    title: t('about_page.vision_title'),
    content: t('about_page.vision_desc'),
    icon: <Scale className="text-primary-blue" size={40} />,
    color: "bg-accent-green/5",
    image: "/assets/slideshow/certificacion-roesb-cecsa.webp"
  },
  {
    id: "mental-health",
    title: t('about_page.wellness_title'),
    content: t('about_page.wellness_desc'),
    icon: <HeartPulse className="text-accent-green" size={40} />,
    color: "bg-primary-blue/5",
    image: "/assets/slideshow/control-plagas-urbano.webp"
  },
  {
    id: "honesty",
    title: t('about_page.honesty_title'),
    content: t('about_page.honesty_desc'),
    icon: <ShieldCheck className="text-primary-blue" size={40} />,
    color: "bg-accent-green/5",
    image: "/assets/slideshow/tratamiento-sanitario-preventivo.webp"
  }
];
