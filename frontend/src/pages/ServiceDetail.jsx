import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Mail, Phone, Zap, Utensils, Hotel, Users, Factory } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ServiceDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const sectorIcons = {
    horeca: <Utensils />,
    hotels: <Hotel />,
    comms: <Users />,
    industry: <Factory />
  };

  const sectorData = {
    horeca: { 
      title: t('sectors_grid.horeca'), 
      desc: t('sectors_grid.horeca_desc'),
      points: t('sectors_grid.horeca_points', { returnObjects: true }),
      bg: '/assets/taula-de-cuina-amb-granit-endoftext-.webp'
    },
    hotels: { 
      title: t('sectors_grid.hotels'), 
      desc: t('sectors_grid.hotels_desc'),
      points: t('sectors_grid.hotels_points', { returnObjects: true }),
      bg: '/assets/hotel-bg.webp'
    },
    comms: { 
      title: t('sectors_grid.comms'), 
      desc: t('sectors_grid.comms_desc'),
      points: t('sectors_grid.comms_points', { returnObjects: true }),
      bg: '/assets/hogar-protegido-libre-de-cucarachas.webp'
    },
    industry: { 
      title: t('sectors_grid.industry'), 
      desc: t('sectors_grid.industry_desc'),
      points: t('sectors_grid.industry_points', { returnObjects: true }),
      bg: '/assets/industry-bg.webp'
    }
  };

  const sector = sectorData[id];

  useEffect(() => {
    window.scrollTo(0, 0);
    if (sector) {
      document.title = `${sector.title} - CECSA Control de Plagues`;
    }
  }, [sector]);

  if (!sector) return <div className="min-h-screen flex items-center justify-center font-black text-primary-blue uppercase tracking-widest">{t('service_detail_page.not_found')}</div>;

  return (
    <div className="min-h-screen bg-bg-light">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-52 md:pt-40 pb-20 bg-primary-blue text-white relative overflow-hidden min-h-[500px] md:h-[600px] flex items-start md:items-center">
         <div className="absolute inset-0 z-0">
            <img 
               src={sector.bg} 
               alt={sector.title} 
               className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-blue via-primary-blue/80 to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20px_20px,white_1px,transparent_0)] bg-[length:40px_40px] opacity-10"></div>
         </div>
         
         <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
            <Link to="/#sectors" className="inline-flex items-center space-x-2 text-white/60 hover:text-accent-green transition-colors mb-8 group">
               <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
               <span className="text-xs font-bold uppercase tracking-widest">{t('service_detail_page.back')}</span>
            </Link>
            
            <div className="flex flex-col md:flex-row items-center gap-12">
               <div className="md:w-2/3 space-y-6">
                  <div className="inline-flex items-center space-x-3 py-2 px-4 bg-white/10 rounded-full border border-white/20">
                     <div className="text-accent-green">
                        {React.cloneElement(sectorIcons[id] || <Users />, { size: 20 })}
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest">{t('service_detail_page.authorized_label')}</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter">
                     {sector.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-white/70 font-light leading-relaxed max-w-2xl italic">
                     "{sector.desc}"
                  </p>
               </div>
               
               <div className="hidden md:flex md:w-1/3 justify-center">
                  <div className="w-64 h-64 md:w-80 md:h-80 bg-white/5 rounded-[4rem] border border-white/10 flex items-center justify-center text-accent-green backdrop-blur-3xl shadow-2xl">
                     {React.cloneElement(sectorIcons[id] || <Users />, { size: 120, strokeWidth: 0.5 })}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Content Section */}
      <section className="py-24 max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-16">
         
         {/* Main Technical Details */}
         <div className="lg:col-span-2 space-y-16">
            <div className="space-y-8">
               <h2 className="text-3xl font-black text-primary-gray tracking-tighter uppercase flex items-center">
                  <span className="w-12 h-1.5 bg-accent-green mr-4 rounded-full"></span>
                  {t('service_detail_page.technical_protocol')}
               </h2>
               <div className="grid md:grid-cols-2 gap-6">
                  {sector.points.map((point, i) => (
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                     >
                        <ShieldCheck size={32} className="text-accent-green mb-4 group-hover:scale-110 transition-transform" />
                        <h4 className="text-lg font-black text-primary-gray tracking-tight leading-tight">
                           {point}
                        </h4>
                     </motion.div>
                  ))}
               </div>
            </div>

            <div className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-xl space-y-8">
               <h3 className="text-2xl font-black text-primary-gray tracking-tighter">{t('service_detail_page.why_choose', { sector: sector.title })}</h3>
               <div className="grid md:grid-cols-3 gap-8 text-center">
                  {[
                     { label: t('service_detail_page.benefit1_label'), desc: t('service_detail_page.benefit1_desc') },
                     { label: t('service_detail_page.benefit2_label'), desc: t('service_detail_page.benefit2_desc') },
                     { label: t('service_detail_page.benefit3_label'), desc: t('service_detail_page.benefit3_desc') }
                  ].map((item, i) => (
                     <div key={i} className="space-y-2">
                        <p className="text-accent-green font-black text-xl tracking-tighter">{item.label}</p>
                        <p className="text-xs text-secondary-gray/60 font-medium leading-tight">{item.desc}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Sticky Sidebar CTA */}
         <div className="space-y-8">
            <div className="sticky top-40 bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 text-center space-y-8 overflow-hidden relative group">
               <div className="space-y-2 relative z-10">
                  <h3 className="text-3xl font-black text-primary-gray tracking-tighter leading-none">{t('service_detail_page.active_protection')}</h3>
                  <p className="text-secondary-gray/50 text-xs font-bold uppercase tracking-widest">{t('service_detail_page.free_diagnosis')}</p>
               </div>
               
               <div className="space-y-4 relative z-10">
                  <button className="w-full py-5 px-4 bg-primary-blue text-white font-black text-lg md:text-xl rounded-2xl shadow-xl flex items-center justify-center group/btn leading-tight text-center">
                     <Zap className="mr-2 text-accent-green fill-accent-green/20 group-hover:rotate-12 transition-transform shrink-0 w-6 h-6" />
                     <span>{t('common.cta_free')}</span>
                  </button>
                  <a href="tel:+34933309169" className="w-full py-5 px-4 bg-bg-light border border-gray-200 text-primary-blue font-black text-lg md:text-xl rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-colors text-center">
                     {t('common.cta_call')}
                  </a>
               </div>
               
               <div className="pt-6 border-t border-gray-100 flex items-center justify-center space-x-6 text-primary-gray/20">
                  <Utensils size={24} />
                  <Hotel size={24} />
                  <Factory size={24} />
               </div>
            </div>
         </div>

      </section>

      <Footer />
    </div>
  );
};

export default ServiceDetail;
