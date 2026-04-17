import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, CheckCircle, Database, HelpCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${t('legal.privacy_title')} - CECSA Control de Plagues`;
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
               <div className="hidden md:block p-4 bg-accent-green/5 text-accent-green rounded-2xl">
                  <ShieldCheck size={40} />
               </div>
               <div>
                  <h1 className="text-4xl md:text-5xl font-black text-primary-gray tracking-tighter">
                    {t('legal.privacy_title')}
                  </h1>
                  <div className="w-20 h-1.5 bg-primary-blue mt-4 rounded-full"></div>
               </div>
            </div>

            <div className="prose prose-blue max-w-none space-y-12 text-secondary-gray">
               {/* Intro */}
               <div className="space-y-6">
                  <h2 className="text-2xl font-black text-primary-blue tracking-tight flex items-center space-x-3">
                     <Lock size={24} className="text-accent-green" />
                     <span>1. Compromís amb la Privacitat</span>
                  </h2>
                  <p className="font-light leading-relaxed">
                    A CECSA ens prenem molt seriosament la protecció de les dades personals. En compliment del Reglament General de Protecció de Dades (RGPD) i la LOPDGDD, t'informem sobre com tractem la informació que ens proporciones.
                  </p>
               </div>

               {/* Responsable */}
               <div className="bg-bg-light p-5 md:p-8 rounded-3xl border border-gray-100 space-y-4">
                  <h3 className="font-black text-primary-gray uppercase tracking-widest text-xs">Responsable del Tractament</h3>
                  <div className="space-y-2 text-sm">
                     <p className="font-bold break-words">{t('legal.company_name')}</p>
                     <p className="break-words">NIF: {t('legal.cif')}</p>
                     <p className="break-words leading-relaxed">{t('legal.address')}</p>
                     <p className="text-primary-blue font-bold break-all">{t('legal.email')}</p>
                  </div>
               </div>

               {/* Finalitat */}
               <div className="space-y-6">
                  <h2 className="text-2xl font-black text-primary-blue tracking-tight">2. Finalitat del Tractament</h2>
                  <p className="font-light leading-relaxed">
                    Les dades proporcionades a través dels nostres formularis de contacte o pressupost s'utilitzen exclusivament per a:
                  </p>
                  <ul className="grid md:grid-cols-2 gap-4">
                     {[
                       "Gestió de consultes i pressupostos",
                       "Prestació del servei de control de plagues",
                       "Facturació i gestió administrativa",
                       "Compliment d'obligacions legals"
                     ].map((item, i) => (
                       <li key={i} className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-sm font-medium italic">
                          <CheckCircle size={18} className="text-accent-green" />
                          <span>{item}</span>
                       </li>
                     ))}
                  </ul>
               </div>

               {/* Conservació */}
               <div className="space-y-6 text-sm bg-primary-blue/5 p-8 rounded-3xl">
                  <h2 className="text-xl font-black text-primary-gray tracking-tight">3. Conservació de les Dades</h2>
                  <p className="font-light leading-relaxed opacity-80 italic">
                    Les dades personals es conservaran mentre es mantingui la relació comercial o durant els anys necessaris per complir amb les obligacions legals.
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

export default PrivacyPolicy;
