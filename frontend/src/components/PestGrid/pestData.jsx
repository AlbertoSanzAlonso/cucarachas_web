import React from 'react';
import { Bug, Activity, Zap, ShieldAlert, Thermometer } from 'lucide-react';

export const getPestSpecies = (t) => [
  {
    id: 'germanic',
    name: t('species.germanica'),
    scientific: 'Blattella germanica',
    icon: <Bug />,
    color: 'var(--color-primary-blue)',
    image: '/assets/eliminar-cucaracha-alemana-barcelona.webp',
    imageScale: 1.35,
    zoomScale: 2.7,
    mobileZoomX: -20,
    mobileZoomY: 20,
    desc: t('species.germanica_desc'),
    details: t('species.germanica_details', { returnObjects: true })
  },
  {
    id: 'american',
    name: t('species.americana'),
    scientific: 'Periplaneta americana',
    icon: <Bug />,
    color: 'var(--color-accent-green)',
    image: '/assets/control-cucaracha-americana-catalunya.webp',
    zoomX: 40,
    mobileZoomX: 0,
    mobileZoomY: 20,
    desc: t('species.americana_desc'),
    details: t('species.americana_details', { returnObjects: true })
  },
  {
    id: 'oriental',
    name: t('species.orientalis'),
    scientific: 'Blatta orientalis',
    icon: <Bug />,
    color: '#ffffff',
    image: '/assets/desinsectacion-cucaracha-oriental.webp',
    zoomX: 40,
    mobileZoomX: 0,
    mobileZoomY: 20,
    desc: t('species.orientalis_desc'),
    darkText: true,
    details: t('species.orientalis_details', { returnObjects: true })
  },
  {
    id: 'banded',
    name: t('species.banded'),
    scientific: 'Supella longipalpa',
    icon: <Bug />,
    color: '#111827',
    image: '/assets/eliminar-cucaracha-banda-cafe.webp',
    imageScale: 1,
    zoomX: 40,
    mobileZoomX: 0,
    mobileZoomY: 20,
    desc: t('species.banded_desc'),
    details: t('species.banded_details', { returnObjects: true })
  },
  {
    id: 'disinfect',
    name: t('species.monitor'),
    icon: <Activity />,
    color: '#ffffff',
    image: '/assets/monitoreo-tecnico-cucarachas-barcelona.webp',
    imageScale: 1.25,
    desc: t('species.monitor_desc'),
    darkText: true,
    details: t('species.monitor_details', { returnObjects: true })
  },
  {
    id: 'nests',
    name: t('species.zap'),
    icon: <Zap />,
    color: '#111827',
    image: '/assets/eliminacion-directa-focos-cucarachas.webp',
    imageScale: 1,
    desc: t('species.zap_desc'),
    details: t('species.zap_details', { returnObjects: true })
  },
  {
    id: 'prevent',
    name: t('species.barrier'),
    icon: <ShieldAlert />,
    color: 'var(--color-primary-blue)',
    image: '/assets/barrera-proteccion-plagas-cocina.webp',
    desc: t('species.barrier_desc'),
    details: t('species.barrier_details', { returnObjects: true })
  },
  {
    id: 'urgent',
    name: t('species.thermal'),
    icon: <Thermometer />,
    color: 'var(--color-accent-green)',
    image: "/assets/inspeccion-tecnica-cuina-professional.webp",
    imageScale: 1,
    desc: t('species.thermal_desc'),
    details: t('species.thermal_details', { returnObjects: true })
  }
];
