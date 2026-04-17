import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = lazy(() => import('../components/Navbar'));
const OrigenService = lazy(() => import('../components/OrigenService'));
const StatsBar = lazy(() => import('../components/StatsBar'));
const ContactForm = lazy(() => import('../components/ContactForm'));
const Footer = lazy(() => import('../components/Footer'));
const FloatingCTA = lazy(() => import('../components/FloatingCTA'));
import SEO from '../components/SEO';
import { SectionSkeleton } from '../components/Skeleton';

const Blog = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Scroll to top on load or page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'prevencion', label: 'Prevención' },
    { id: 'tecnico', label: 'Técnico' },
    { id: 'curiosidades', label: 'Curiosidades' },
    { id: 'salud', label: 'Salud Ambiental' }
  ];

  const articles = [
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
      image: '/assets/barcelona-view.webp',
      readTime: '10 min'
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchTerm]);

  return (
    <div className="min-h-screen bg-bg-light">
      <SEO 
        title="Blog de Control de Plagas | CECSA Barcelona" 
        description="Artículos técnicos, consejos de prevención y curiosidades sobre el control de cucarachas y salud ambiental en Barcelona."
      />

      <Suspense fallback={<div className="h-20 bg-primary-blue" />}>
        <Navbar />
      </Suspense>

      <main className="pt-32 pb-24">
        {/* Blog Hero */}
        <section className="max-w-7xl mx-auto px-6 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <span className="inline-block py-2 px-6 glass rounded-full text-primary-blue font-black text-[10px] tracking-[0.3em] uppercase">
              Actualidad y Conocimiento
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-primary-blue tracking-tighter leading-none">
              Blog <span className="text-accent-green">Consciente</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-secondary-gray/80 font-light leading-relaxed">
              Explora nuestros artículos sobre desinsectación técnica, bienestar ambiental y protocolos éticos en el corazón de Barcelona.
            </p>
          </motion.div>
        </section>

        {/* Filters and Search */}
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-white p-4 rounded-[2.5rem] shadow-xl border border-gray-100">
            {/* Categories */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar w-full lg:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-primary-blue text-white shadow-lg' : 'bg-bg-light text-secondary-gray/60 hover:text-primary-blue'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-gray/30" size={20} />
              <input 
                type="text" 
                placeholder="Buscar artículo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-bg-light rounded-full border-none focus:ring-2 focus:ring-primary-blue/20 text-sm font-semibold text-primary-gray"
              />
            </div>
          </div>
        </section>

        {/* Articles Grid - White Background covering gaps */}
        <section className="bg-white pt-24 pb-80 md:pb-[35rem] relative z-20">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout" initial={false}>
                {paginatedArticles.map((article, idx) => (
                  <motion.article
                    key={article.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="group bg-bg-light rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 flex flex-col h-full"
                  >
                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/40 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 flex items-center space-x-2">
                         <span className="py-1 px-3 bg-accent-green text-primary-blue text-[10px] font-black uppercase rounded-full shadow-lg">
                           {article.category}
                         </span>
                         <span className="py-1 px-3 glass text-white text-[10px] font-black uppercase rounded-full">
                           {article.readTime}
                         </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-4 flex-grow flex flex-col">
                      <div className="flex items-center space-x-4 text-[10px] font-bold text-secondary-gray/40 uppercase tracking-widest">
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>{article.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User size={12} />
                          <span>{article.author}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-black text-primary-blue leading-tight tracking-tight group-hover:text-accent-green-hv transition-colors">
                        {article.title}
                      </h3>

                      <p className="text-sm text-secondary-gray/60 leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>

                      <div className="pt-6 mt-auto">
                        <button className="flex items-center space-x-2 text-xs font-black uppercase tracking-[0.2em] text-primary-blue group/btn">
                          <span>Seguir leyendo</span>
                          <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-2" />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-20 flex items-center justify-center space-x-3">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-4 rounded-2xl bg-bg-light text-primary-blue disabled:opacity-30 hover:bg-primary-blue hover:text-white transition-all shadow-md group"
                >
                  <ChevronRight size={20} className="rotate-180" />
                </button>
                
                <div className="flex items-center space-x-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-12 h-12 rounded-2xl font-black text-sm transition-all shadow-md ${currentPage === i + 1 ? 'bg-primary-blue text-white scale-110 shadow-primary-blue/30' : 'bg-bg-light text-primary-blue hover:bg-gray-200'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-4 rounded-2xl bg-bg-light text-primary-blue disabled:opacity-30 hover:bg-primary-blue hover:text-white transition-all shadow-md group"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {filteredArticles.length === 0 && (
              <div className="text-center py-24 space-y-4">
                <div className="w-20 h-20 bg-primary-blue/5 rounded-full flex items-center justify-center mx-auto text-primary-blue/20">
                  <Search size={40} />
                </div>
                <h3 className="text-xl font-bold text-primary-gray">No hemos encontrado artículos</h3>
                <p className="text-secondary-gray/60">Prueba con otros términos o categorías</p>
              </div>
            )}
            {/* FAQ Prompt Banner - Moved inside for better layering */}
            <div className="mt-32 relative z-50">
              <div className="max-w-5xl mx-auto">
                <div className="bg-primary-blue p-12 md:p-16 rounded-[4rem] relative overflow-hidden shadow-2xl border border-white/10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent-green/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      <h2 className="text-3xl md:text-4xl font-black text-white leading-none">
                        ¿Tienes dudas específicas?
                      </h2>
                      <p className="text-white/70 font-light leading-relaxed">
                        Consulta nuestra sección de preguntas frecuentes para resolver tus inquietudes de forma inmediata o contacta con nuestros técnicos.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button className="px-8 py-4 bg-accent-green text-primary-blue font-black text-xs tracking-widest uppercase rounded-2xl shadow-lg hover:bg-accent-green-hv transition-all">
                          Ver FAQ
                        </button>
                        <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-white/10 text-white font-black text-xs tracking-widest uppercase rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
                          Contactar
                        </button>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="p-8 bg-white/5 rounded-3xl border border-white/10 rotate-3">
                         <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                              <div key={i} className={`h-2 rounded-full bg-white/${i === 1 ? '40' : (i === 2 ? '20' : '10')} w-${i === 1 ? 'full' : (i === 2 ? '3/4' : '1/2')}`}></div>
                            ))}
                            <div className="pt-4 flex items-center justify-between">
                               <div className="w-10 h-10 rounded-full bg-accent-green/20"></div>
                               <div className="w-24 h-8 rounded-full bg-accent-green shadow-xl"></div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Unified Authority Section (Stats + Contact) - Same as Home */}
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

export default Blog;
