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
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Pequeño timeout para esperar a que la animación de apertura termine
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de connexió. Truca al 933 309 169.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 md:bottom-8 left-0 right-0 z-[100] px-4 md:px-12 xl:px-0 flex justify-center pointer-events-none [@media(max-height:600px)_and_(orientation:landscape)]:bottom-2">
       <div className="max-w-7xl mx-auto w-full flex items-end justify-between md:items-end">
          
          {/* LEFT SIDE: Chat & WhatsApp */}
          <div className="flex flex-col items-start space-y-2 pointer-events-auto animate-fade-in animate-slide-up w-[45%] md:w-auto">
             
             {/* Integrated Chat Widget */}
             <div className="relative w-full">
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      className="fixed md:absolute bottom-20 md:bottom-full left-4 right-4 md:left-0 md:right-auto md:mb-4 md:w-96 h-[75vh] md:h-[500px] bg-white rounded-3xl shadow-3xl overflow-hidden border border-gray-100 flex flex-col origin-bottom z-[120]"
                    >
                      {/* Header */}
                      <div className="p-4 bg-primary-blue text-white relative overflow-hidden flex items-center justify-between">
                         <div className="relative z-10 flex items-center space-x-2">
                            <Bot size={18} className="text-accent-green" />
                            <h3 className="font-black text-xs uppercase">Assistent CECSA</h3>
                         </div>
                         <button onClick={() => setIsOpen(false)} className="relative z-10 p-1 hover:bg-white/10 rounded-lg">
                           <X size={18} />
                         </button>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] p-3 rounded-2xl text-[11px] font-medium shadow-sm ${msg.role === 'user' ? 'bg-primary-blue text-white rounded-tr-none' : 'bg-white text-secondary-gray border border-gray-100 rounded-tl-none'}`}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {isLoading && <div className="text-[10px] text-gray-400 animate-pulse">Pensant...</div>}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input */}
                      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white">
                        <div className="flex items-center bg-gray-50 rounded-full px-4 py-1 border border-gray-200 focus-within:border-primary-blue transition-colors">
                          <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('cta.chat_placeholder') || "Escriu un missatge..."}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-secondary-gray py-2 px-1 text-[11px]"
                            disabled={isLoading}
                          />
                          <button 
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="ml-2 p-2 text-primary-blue hover:text-blue-700 disabled:text-gray-300 transition-colors"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Chat Trigger Button (Mini) */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center bg-primary-blue text-white shadow-xl rounded-xl p-1.5 md:p-2 border border-blue-400/20 w-full md:w-auto"
                >
                   <div className="bg-white/20 p-1.5 md:p-2 rounded-lg">
                      {isOpen ? <X size={16} /> : <Bot size={16} />}
                   </div>
                   {!isOpen && <span className="text-[9px] md:text-sm font-black ml-2 uppercase tracking-tighter">Xat AI</span>}
                   {isOpen && <span className="text-[9px] md:text-sm font-black ml-2 uppercase tracking-tighter">Tancar</span>}
                </motion.button>
             </div>

             {/* WhatsApp Card (Mini) */}
             <a 
               href="https://wa.me/34933309169" 
               className="flex items-center bg-white/95 backdrop-blur-md shadow-xl rounded-xl p-1.5 md:p-2 border border-gray-100 w-full md:w-auto"
             >
                <div className="bg-accent-green p-1.5 md:p-2 rounded-lg text-white shadow-sm">
                   <MessageSquare size={16} />
                </div>
                <div className="flex flex-col ml-2 overflow-hidden">
                   <span className="text-[6px] md:text-[8px] uppercase font-bold text-secondary-gray/40">WhatsApp</span>
                   <span className="text-secondary-gray text-[9px] md:text-xs font-black truncate">Atenció</span>
                </div>
             </a>
          </div>

          {/* RIGHT SIDE: Call & Status */}
          <div className="flex flex-col items-end space-y-2 pointer-events-auto w-[45%] md:w-auto">
             <div className="bg-primary-blue text-white text-[7px] md:text-[9px] font-black uppercase tracking-widest px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg">
                {t('cta.badge', '24h Actiu')}
             </div>
             
             <a 
               href="tel:+34933309169" 
               className="flex items-center justify-center space-x-2 w-full md:w-auto px-3 py-3 md:px-6 md:py-4 rounded-xl bg-accent-green text-primary-gray shadow-xl transition-all active:scale-95"
               style={{ background: 'var(--color-accent-green)' }}
             >
                <div className="flex flex-col items-end md:items-center">
                  <span className="text-[9px] md:text-sm font-black uppercase leading-none">Trucar</span>
                  <span className="text-primary-gray/60 font-bold text-[8px] md:text-xs leading-none mt-0.5">933 309 169</span>
                </div>
                <div className="bg-white/20 p-1 rounded-full flex items-center justify-center">
                   <Phone size={14} className="md:w-5 md:h-5" fill="currentColor" />
                </div>
             </a>
          </div>

       </div>
    </div>
  );
};

export default FloatingCTA;
