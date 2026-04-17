import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, FileText, Scale, MapPin, Mail, Fingerprint } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LegalNotice = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${t('legal.notice_title')} - CECSA Control de Plagues`;
  }, [t]);

  return (
    <div className="min-h-screen bg-bg-light">
      <Navbar />

      <main className="pt-40 md:pt-32 pb-64 md:pb-80">
        <section className="max-w-4xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] p-12 md:p-20 shadow-xl border border-gray-100"
          >
            <div className="flex items-center md:space-x-6 mb-12">
               <div className="hidden md:block p-4 bg-primary-blue/5 text-primary-blue rounded-2xl">
                  <Scale size={40} />
               </div>
               <div>
                  <h1 className="text-4xl md:text-5xl font-black text-primary-gray tracking-tighter">
                    {t('legal.notice_title')}
                  </h1>
                  <div className="w-20 h-1.5 bg-accent-green mt-4 rounded-full"></div>
               </div>
            </div>

            <div className="prose prose-blue max-w-none space-y-12 text-secondary-gray">
               {/* Titularidad */}
               <div className="space-y-6">
                  <h2 className="text-2xl font-black text-primary-blue tracking-tight flex items-center space-x-3">
                     <Shield size={24} className="text-accent-green" />
                     <span>1. Titularitat del Lloc Web</span>
                  </h2>
                  <div className="bg-bg-light p-5 md:p-8 rounded-3xl space-y-4 border border-gray-100">
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                           <span className="text-[10px] font-bold text-primary-gray/40 uppercase tracking-widest block">Raó Social</span>
                           <span className="font-bold text-primary-gray break-words block">{t('legal.company_name')}</span>
                        </div>
                        <div className="space-y-1">
                           <span className="text-[10px] font-bold text-primary-gray/40 uppercase tracking-widest block">CIF / NIF</span>
                           <span className="font-bold text-primary-gray break-words block">{t('legal.cif')}</span>
                        </div>
                        <div className="space-y-1">
                           <span className="text-[10px] font-bold text-primary-gray/40 uppercase tracking-widest block">Domicili Fiscal</span>
                           <span className="font-bold text-primary-gray break-words block leading-relaxed">{t('legal.address')}</span>
                        </div>
                        <div className="space-y-1">
                           <span className="text-[10px] font-bold text-primary-gray/40 uppercase tracking-widest block">Email de contacte</span>
                           <span className="font-bold text-primary-blue break-all block">{t('legal.email')}</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Objecte */}
               <div className="space-y-6">
                  <h2 className="text-2xl font-black text-primary-blue tracking-tight">2. Objecte i Termes d'Ús</h2>
                  <p className="font-light leading-relaxed">
                    El present Avís Legal regula l'accés i l'ús del lloc web de CECSA. El fet d'accedir al lloc web implica l'acceptació plena i sense reserves de totes i cadascuna de les disposicions incloses en aquest Avís Legal.
                  </p>
               </div>

               {/* Responsabilitat */}
               <div className="space-y-6">
                  <h2 className="text-2xl font-black text-primary-blue tracking-tight">3. Responsabilitat dels continguts</h2>
                  <p className="font-light leading-relaxed">
                    CECSA no es fa responsable de l'ús inadequat que es pugui fer dels continguts del seu lloc web, essent responsabilitat exclusiva de la persona que hi accedeix o els utilitza. Tampoc no assumeix cap responsabilitat per la informació continguda en llocs web de tercers als quals es pugui accedir per enllaços o cercadors.
                  </p>
               </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LegalNotice;
