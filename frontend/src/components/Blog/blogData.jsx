import React from 'react';

export const getBlogCategories = () => [
  { id: 'all' },
  { id: 'prevencion' },
  { id: 'tecnico' },
  { id: 'curiosidades' },
  { id: 'salud' }
];

export const getBlogArticles = () => [
  {
    id: 1,
    title: 'Cómo identificar nidos de cucarachas en la cocina',
    excerpt: 'Las cucarachas son expertas en ocultarse. Aprende a detectar los puntos críticos antes de que se conviertan en una plaga incontrolable.',
    category: 'prevencion',
    date: '15 Abr 2026',
    author: 'Equipo Técnico CECSA',
    image: '/assets/cockroach-focus.webp',
    readTime: '5 min'
  },
  {
    id: 2,
    title: 'Control de plagas en la industria alimentaria: IFS y BRC',
    excerpt: 'Descubre los estándares más estrictos de seguridad alimentaria y cómo CECSA ayuda a las empresas a cumplirlos con éxito.',
    category: 'tecnico',
    date: '12 Abr 2026',
    author: 'Dirección Técnica',
    image: '/assets/barcelona-authority.webp',
    readTime: '8 min'
  },
  {
    id: 3,
    title: 'Higiene vs. Plagas: El mito de las cocinas limpias',
    excerpt: '¿Es cierto que las cucarachas solo aparecen en lugares sucios? Desmontamos uno de los mitos más comunes de la desinsectación.',
    category: 'curiosidades',
    date: '08 Abr 2026',
    author: 'Biología Aplicada',
    image: '/assets/service-hero.webp',
    readTime: '4 min'
  },
  {
    id: 4,
    title: 'Nueva flota eléctrica: Compromiso Ético y Ecológico',
    excerpt: 'En CECSA seguimos evolucionando. Te presentamos nuestra nueva flota de vehículos 100% eléctricos para una Barcelona más limpia.',
    category: 'salud',
    date: '05 Abr 2026',
    author: 'Sostenibilidad',
    image: '/assets/fleet-1.webp',
    readTime: '3 min'
  },
  {
    id: 5,
    title: 'Tratamientos de barrera: Prevención a largo plazo',
    excerpt: 'Por qué los tratamientos anuales de mantenimiento son la mejor inversión para tu comunidad de vecinos.',
    category: 'prevencion',
    date: '02 Abr 2026',
    author: 'Área Operativa',
    image: '/assets/urban-pests.webp',
    readTime: '6 min'
  },
  {
    id: 6,
    title: 'Protocolo Origen: Recuperación de viviendas',
    excerpt: 'Un vistazo profundo a cómo transformamos viviendas afectadas por infestaciones críticas en espacios seguros.',
    category: 'tecnico',
    date: '28 Mar 2026',
    author: 'Equipo Social',
    image: '/assets/barcelona-authority.webp',
    readTime: '10 min'
  }
];
