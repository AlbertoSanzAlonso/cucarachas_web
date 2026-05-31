import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Phone, X, Send, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const FloatingCTA = () => {
  const { t, i18n } = useTranslation();
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const chatConfig = { withCredentials: true };
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages((prev) => {
      const hasUserMessages = prev.some((m) => m.role === 'user');
      if (hasUserMessages) return prev;

      if (prev.length === 0) {
        return [{ role: 'assistant', content: t('agent.welcome_msg_home'), isInitial: true }];
      }

      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{ role: 'assistant', content: t('agent.welcome_msg_home'), isInitial: true }];
      }

      return prev;
    });
  }, [i18n.language, t]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Show hint if the agent has been dismissed (meaning it's in bubble mode)
    const dismissed = localStorage.getItem('cecsa_agent_dismissed');
    if (dismissed && !isOpen) {
      const timer = setTimeout(() => setShowHint(true), 1000);
      
      const handleScroll = () => {
        if (window.scrollY > 100) {
          setShowHint(false);
          window.removeEventListener('scroll', handleScroll);
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isLoading]);

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
      const response = await axios.post(`${apiBase}/api/chat/`, {
        message: userMessage,
        language: i18n.language
      }, chatConfig);

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.reply,
        slots: response.data.slots 
      }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: t('agent.home.connection_error') }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotSelect = async (slot) => {
    const confirmMsg = t('agent.chat.confirm_slot', { date: slot.date, time: slot.time });
    setMessages(prev => [...prev, { role: 'user', content: confirmMsg }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${apiBase}/api/chat/`, {
        message: `Reserva: ${slot.slot_time || slot.date} ${slot.time}`,
        language: i18n.language
      }, chatConfig);

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.reply,
        slots: response.data.slots 
      }]);
    } catch (error) {
      console.error('Error confirming slot:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: t('agent.chat.error') }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="floating-cta" className="fixed bottom-4 md:bottom-8 right-4 md:right-12 z-[100] flex flex-col items-end pointer-events-none [@media(max-height:600px)_and_(orientation:landscape)]:bottom-2">
       <div className="flex flex-col items-end pointer-events-auto">
          
          {/* Integrated Chat Widget */}
          <div className="relative flex flex-col items-end">
             <AnimatePresence>
               {showHint && !isOpen && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10, scale: 0.9 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 10, scale: 0.9 }}
                   className="absolute bottom-full right-0 mb-6 bg-white p-5 rounded-2xl shadow-3xl border border-gray-100 min-w-[250px] pointer-events-auto"
                 >
                   <div className="flex items-center space-x-4">
                     <div className="p-3 bg-primary-blue/5 rounded-xl">
                       <Sparkles size={20} className="text-primary-blue animate-pulse" />
                     </div>
                     <div>
                       <p className="text-xs font-black text-primary-blue uppercase tracking-widest leading-tight">
                         {t('agent.persistent_msg')}
                       </p>
                       <p className="text-[10px] text-gray-400 font-medium mt-1">
                         {t('agent.minimized_hint')}
                       </p>
                     </div>
                   </div>
                   <div className="absolute top-full right-8 w-4 h-4 bg-white border-r border-b border-gray-100 transform rotate-45 -mt-2"></div>
                 </motion.div>
               )}
             </AnimatePresence>

             <AnimatePresence>
               {isOpen && (
                 <motion.div
                   initial={{ opacity: 0, y: 20, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 20, scale: 0.95 }}
                   className="fixed md:relative bottom-28 md:bottom-auto left-4 right-4 md:left-auto md:right-auto md:mb-4 w-auto md:w-[550px] max-w-[calc(100vw-2rem)] md:max-w-[min(550px,calc(100vw-3rem))] h-[80vh] md:h-[750px] md:max-h-[calc(100vh-10rem)] bg-white rounded-[3rem] shadow-3xl overflow-hidden border border-gray-100 flex flex-col origin-bottom-right z-[120]"
                 >
                   {/* Header */}
                   <div className="p-8 bg-primary-blue text-white relative overflow-hidden flex items-center justify-between">
                      <div className="relative z-10 flex items-center space-x-4">
                         <div className="bg-accent-green p-3 rounded-2xl shadow-lg">
                           <Bot size={28} className="text-primary-blue" />
                         </div>
                         <div>
                            <h3 className="font-black text-base uppercase tracking-widest">{t('agent.home.title')}</h3>
                            <p className="text-[10px] opacity-60 font-bold uppercase tracking-tighter">{t('agent.home.subtitle')}</p>
                         </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <a href="https://wa.me/34665147414" target="_blank" rel="noopener noreferrer" className="p-3 hover:bg-white/10 rounded-2xl transition-all text-white/80 hover:text-white" title="WhatsApp">
                          <MessageSquare size={24} />
                        </a>
                        <button onClick={() => { setIsOpen(false); setShowHint(false); }} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                          <X size={24} />
                        </button>
                      </div>
                   </div>

                   {/* Messages */}
                   <div
                     ref={messagesContainerRef}
                     data-lenis-prevent
                     className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 space-y-6 bg-gray-50/50 custom-scrollbar"
                   >
                     {messages.map((msg, i) => (
                       <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                           <div 
                           className={`max-w-[92%] p-6 rounded-[2rem] text-base md:text-xl font-medium shadow-md leading-relaxed ${msg.role === 'user' ? 'bg-primary-blue text-white rounded-tr-none' : 'bg-white text-secondary-gray border border-gray-100 rounded-tl-none'}`}
                           dangerouslySetInnerHTML={{ __html: (msg.content || '').replace(/\*\*(.*?)\*\*/g, '<span class="font-black text-primary-blue">$1</span>') }}
                         />
                         {msg.slots && (
                           <div className="grid grid-cols-2 gap-3 mt-4 w-full max-w-[320px]">
                             {msg.slots.map((slot, idx) => (
                               <button 
                                 key={idx} 
                                 onClick={() => handleSlotSelect(slot)}
                                 className="bg-white hover:bg-accent-green hover:text-primary-blue border border-gray-100 rounded-2xl p-4 text-sm font-black text-secondary-gray transition-all text-center shadow-sm hover:shadow-lg hover:-translate-y-1"
                               >
                                 <div className="opacity-40 text-[10px] uppercase mb-1">{slot.date}</div>
                                 <div>{slot.time}</div>
                               </button>
                             ))}
                           </div>
                         )}
                       </div>
                     ))}
                     {isLoading && <div className="text-xs text-gray-400 animate-pulse font-bold uppercase tracking-widest px-2">{t('agent.home.thinking')}</div>}
                   </div>

                   {/* Input */}
                   <form onSubmit={handleSend} className="p-6 border-t border-gray-100 bg-white">
                     <div className="flex items-center bg-gray-50 rounded-3xl px-6 py-2 border border-gray-200 focus-within:border-primary-blue/30 transition-all shadow-inner">
                       <input
                         ref={inputRef}
                         type="text"
                         value={input}
                         onChange={(e) => setInput(e.target.value)}
                         placeholder={t('agent.home.placeholder')}
                         className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-secondary-gray py-4 px-1 text-base md:text-lg"
                         disabled={isLoading}
                       />
                       <button 
                         type="submit"
                         disabled={isLoading || !input.trim()}
                         className="ml-4 p-4 bg-primary-blue text-white rounded-2xl hover:scale-110 active:scale-95 disabled:bg-gray-200 disabled:scale-100 transition-all shadow-lg"
                       >
                         <Send size={20} />
                       </button>
                     </div>
                   </form>
                 </motion.div>
               )}
             </AnimatePresence>

             {/* Chat Trigger Button (PRO) */}
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => { setIsOpen(!isOpen); setShowHint(false); }}
               className="flex items-center bg-accent-green text-primary-gray shadow-[0_15px_40px_rgba(52,211,153,0.3)] rounded-2xl md:rounded-[2rem] p-3 md:p-4 border border-white/20 transition-all group"
             >
                <div className="bg-primary-blue/10 p-2 md:p-3 rounded-xl group-hover:bg-primary-blue group-hover:text-white transition-colors">
                   {isOpen ? <X size={24} /> : <Bot size={24} />}
                </div>
                {!isOpen && <span className="text-sm md:text-xl font-black ml-3 uppercase tracking-tighter">{t('agent.home.open_chat')}</span>}
                {isOpen && <span className="text-sm md:text-xl font-black ml-3 uppercase tracking-tighter">{t('agent.home.close_chat')}</span>}
             </motion.button>
          </div>

       </div>
    </div>
  );
};

export default FloatingCTA;
