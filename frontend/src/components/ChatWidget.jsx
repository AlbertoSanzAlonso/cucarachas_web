import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import axios from 'axios';

const ChatWidget = () => {
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
    <>
      {/* Botón Flotante */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-28 right-6 md:bottom-36 md:right-10 z-[110] w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-primary-blue text-white rounded-full shadow-2xl hover:bg-primary-blue-hv transition-all group overflow-hidden"
        style={{ boxShadow: '0 15px 35px rgba(0, 128, 187, 0.4)' }}
      >
        <div className="flex items-center justify-center w-full h-full">
           {isOpen ? <X size={32} /> : <MessageSquare size={32} className="[@media(max-height:600px)_and_(orientation:landscape)]:w-6 [@media(max-height:600px)_and_(orientation:landscape)]:h-6" />}
        </div>
        {!isOpen && (
           <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-primary-blue px-3 py-1 rounded-lg text-xs font-black shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity hidden md:block border border-blue-50">
             {t('chat.help', 'Necessites ajuda?')}
           </span>
        )}
      </motion.button>

      {/* Ventana de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-4 md:bottom-32 md:right-8 z-[110] w-[calc(100vw-2rem)] md:w-96 h-[500px] bg-white rounded-3xl shadow-3xl overflow-hidden border border-gray-100 flex flex-col [@media(max-height:600px)_and_(orientation:landscape)]:h-[80vh] [@media(max-height:600px)_and_(orientation:landscape)]:bottom-4"
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
               
               <button 
                 onClick={() => setIsOpen(false)}
                 className="relative z-10 p-2 hover:bg-white/10 rounded-lg transition-colors"
               >
                 <X size={20} />
               </button>

               {/* Decoración fondo */}
               <Sparkles className="absolute top-2 right-10 text-white/5 w-16 h-16 -rotate-12" />
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary-blue text-white rounded-tr-none' 
                      : 'bg-white text-secondary-gray border border-gray-100 rounded-tl-none'
                  }`}>
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
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chat.placeholder', 'Escriu un missatge...')}
                className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-blue/20 transition-all outline-none"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="p-3 bg-accent-green text-primary-gray rounded-xl hover:bg-accent-green-hv transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
