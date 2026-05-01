import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Shield, Activity, ArrowRight } from 'lucide-react';

const WebmailAccess = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-[calc(100vh-200px)] flex flex-col"
    >
      <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col flex-1 items-center justify-center text-center p-12">
         <div className="w-24 h-24 bg-primary-blue/5 rounded-full flex items-center justify-center mb-8">
            <Mail size={48} className="text-primary-blue" />
         </div>
         
         <h2 className="text-3xl font-black text-primary-gray mb-4 uppercase tracking-tighter">Accés Segur al Webmail</h2>
         
         <p className="text-primary-gray/50 max-w-md mx-auto mb-10 leading-relaxed font-medium">
           Per protocols de seguretat del servidor de correu de **DonDominio**, l'accés s'ha de realitzar en una finestra independent protegida.
         </p>

         <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl mb-12">
            <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex items-start space-x-4">
               <div className="p-3 bg-white rounded-xl text-accent-green shadow-sm">
                  <Shield size={20} />
               </div>
               <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary-gray/30 mb-1">Seguretat</p>
                  <p className="text-xs font-bold text-primary-gray">Sessió encriptada SSL/TLS amb el domini cecsa.cat</p>
               </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex items-start space-x-4">
               <div className="p-3 bg-white rounded-xl text-primary-blue shadow-sm">
                  <Activity size={20} />
               </div>
               <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary-gray/30 mb-1">Estat</p>
                  <p className="text-xs font-bold text-primary-gray">Servidor actiu i optimitzat per a gestió massiva</p>
               </div>
            </div>
         </div>

         <a 
          href="https://webmail.dondominio.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-4 bg-primary-blue text-white px-12 py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary-blue/30 hover:scale-105 active:scale-95 transition-all group"
         >
           <span>OBRIR CORREU CORPORATIU</span>
           <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
         </a>

         <div className="mt-12 flex items-center space-x-4 opacity-20">
            <img src="/assets/isotipo.png" alt="CECSA" className="h-6 filter grayscale" />
            <div className="h-4 w-[1px] bg-primary-gray"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol de Comunicació CECSA</p>
         </div>
      </div>
    </motion.div>
  );
};

export default WebmailAccess;
