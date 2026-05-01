import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Phone, X, Send, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const FloatingCTA = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hola! Sóc l\'assistent virtual de CECSA. Com et puc ajudar avui amb el control de plagues?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post('https://api.cucarachasbarcelona.cat/api/chat/', {
        message: userMessage
      }, { withCredentials: true });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ho sento, hi ha hagut un error en la connexió. Pots trucar-nos directament al 933 309 169.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 md:bottom-8 left-0 right-0 z-[100] px-4 md:px-12 xl:px-0 flex justify-center pointer-events-none [@media(max-height:600px)_and_(orientation:landscape)]:bottom-2">
       <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-end justify-end md:justify-between space-y-4 md:space-y-0">
          
          {/* WhatsApp & Chat Column (Left on Desktop) */}
          <div className="flex flex-col items-start space-y-4 pointer-events-auto animate-fade-in animate-slide-up [@media(max-height:600px)_and_(orientation:landscape)]:hidden">
             
             {/* Integrated Chat Widget */}
             <div className="relative">
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      className="absolute bottom-full mb-4 left-0 w-[calc(100vw-2rem)] md:w-96 h-[500px] bg-white rounded-3xl shadow-3xl overflow-hidden border border-gray-100 flex flex-col origin-bottom-left"
                    >
                      {/* Header */}
                      <div className="p-5 bg-primary-blue text-white relative overflow-hidden flex items-center justify-between">
                         <div className="relative z-10 flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
                               <Bot size={22} className="text-accent-green" />
                            </div>
                            <div>
                              <h3 className="font-black text-base leading-tight uppercase tracking-tight">Assistent CECSA</h3>
                              <p className="text-[9px] text-white/60 font-bold uppercase tracking-widest flex items-center">
                                <span className="w-1.5 h-1.5 bg-accent-green rounded-full mr-1.5 animate-pulse"></span>
                                Ètic i Conscient
                              </p>
                            </div>
                         </div>
                         <button onClick={() => setIsOpen(false)} className="relative z-10 p-2 hover:bg-white/10 rounded-lg transition-colors">
                           <X size={20} />
                         </button>
                         <Sparkles className="absolute top-2 right-10 text-white/5 w-16 h-16 -rotate-12" />
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                        {messages.map((msg, i) => (
                          <motion.div initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium shadow-sm ${msg.role === 'user' ? 'bg-primary-blue text-white rounded-tr-none' : 'bg-white text-secondary-gray border border-gray-100 rounded-tl-none'}`}>
                              {msg.content}
                            </div>
                          </motion.div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                             <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-primary-blue/30 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-primary-blue/30 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-primary-blue/30 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                             </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input */}
                      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex items-center space-x-2">
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('chat.placeholder', 'Escriu un missatge...')} className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-blue/20 transition-all outline-none" />
                        <button type="submit" disabled={isLoading} className="p-3 bg-accent-green text-primary-gray rounded-xl hover:bg-accent-green-hv transition-colors disabled:opacity-50">
                          <Send size={18} />
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Chat Trigger Button */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center space-x-3 bg-primary-blue text-white shadow-2xl rounded-2xl p-1.5 pr-4 md:p-2 md:pr-6 border border-blue-400/20 hover:bg-primary-blue-hv transition-all mb-2"
                  style={{ boxShadow: '0 10px 25px rgba(0, 128, 187, 0.3)' }}
                >
                   <div className="p-2 md:p-3 bg-white/20 rounded-xl text-white shadow-lg backdrop-blur-sm">
                      {isOpen ? <X size={18} className="md:w-6 md:h-6" /> : <Bot size={18} className="md:w-6 md:h-6" />}
                   </div>
                   <div className="flex flex-col items-start">
                      <span className="text-[7px] md:text-[10px] uppercase font-bold text-white/50">Agent AI</span>
                      <span className="text-white text-[10px] md:text-sm font-black tracking-tight">{isOpen ? 'Tancar Xat' : 'Xateja amb nosaltres'}</span>
                   </div>
                </motion.button>
             </div>

             {/* WhatsApp Card */}
             <a 
               href="https://wa.me/34933309169" 
               className="group flex items-center space-x-3 md:space-x-4 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-1.5 pr-4 md:p-2 md:pr-6 border border-gray-100 hover:shadow-accent-green/20 transition-all hover:translate-y-[-4px]"
             >
                <div className="p-2 md:p-3 bg-accent-green rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                   <MessageSquare size={18} className="md:w-6 md:h-6" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[7px] md:text-[10px] uppercase font-bold text-secondary-gray/40">WhatsApp</span>
                   <span className="text-secondary-gray text-[10px] md:text-sm font-black tracking-tight">{t('cta.wa_desc', 'Atención por WhatsApp')}</span>
                </div>
             </a>
          </div>

          {/* Core Urgent Floating CTA (Right) */}
          <div className="ml-auto flex flex-col space-y-2 items-end pointer-events-auto [@media(max-height:600px)_and_(orientation:landscape)]:flex-row [@media(max-height:600px)_and_(orientation:landscape)]:items-center [@media(max-height:600px)_and_(orientation:landscape)]:space-y-0 [@media(max-height:600px)_and_(orientation:landscape)]:space-x-2">
             <div className="bg-primary-blue text-white text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 md:px-4 md:py-2 rounded-full shadow-xl animate-bounce [@media(max-height:600px)_and_(orientation:landscape)]:hidden">
                {t('cta.badge', 'Servicio 24h Activo')}
             </div>
             
             <a 
               href="tel:+34933309169" 
               className="flex items-center space-x-3 md:space-x-5 px-4 py-2.5 md:px-8 md:py-5 rounded-full bg-accent-green text-primary-gray font-black text-xs md:text-xl shadow-2xl hover:bg-accent-green-hv hover:translate-y-[-4px] active:scale-95 transition-all group [@media(max-height:600px)_and_(orientation:landscape)]:!w-8 [@media(max-height:600px)_and_(orientation:landscape)]:!h-8 [@media(max-height:600px)_and_(orientation:landscape)]:!p-0 [@media(max-height:600px)_and_(orientation:landscape)]:!justify-center [@media(max-height:600px)_and_(orientation:landscape)]:!space-x-0"
               style={{ 
                 background: 'var(--color-accent-green)', 
                 boxShadow: '0 15px 30px rgba(52, 211, 153, 0.4)'
               }}
             >
                <span className="flex flex-col md:flex-row md:items-center text-left md:text-center space-y-0 [@media(max-height:600px)_and_(orientation:landscape)]:hidden">
                  <span className="md:mr-3 leading-none">{t('cta.call_now', 'LLAMAR')}</span>
                  <span className="text-primary-gray/50 font-medium text-[9px] md:text-xl leading-none">933 309 169</span>
                </span>
                <div className="p-1 md:p-2 bg-white/20 rounded-full group-hover:rotate-12 transition-transform flex items-center justify-center [@media(max-height:600px)_and_(orientation:landscape)]:bg-transparent [@media(max-height:600px)_and_(orientation:landscape)]:p-0">
                   <Phone size={14} className="md:w-6 md:h-6 [@media(max-height:600px)_and_(orientation:landscape)]:!w-3.5 [@media(max-height:600px)_and_(orientation:landscape)]:!h-3.5" fill="currentColor" />
                </div>
             </a>
          </div>

       </div>
    </div>
  );
};

export default FloatingCTA;
