import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import ScrollArea from '@/components/ui/ScrollArea';

// Sub-components
import DiagnosticFlow from './Diagnostic/DiagnosticFlow';
import ChatMessage from './Chat/ChatMessage';
import ChatInput from './Chat/ChatInput';

import { useAgentChat } from './hooks/useAgentChat';

const AgentHeroModal = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [path, setPath] = useState(null); 
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  const {
    messages,
    setMessages,
    inputValue,
    setInputValue,
    isTyping,
    scrollRef,
    getAIDiagnostic,
    handleSlotSelect,
    handleSendMessage
  } = useAgentChat(i18n, answers, path);

  const handleAnswer = (key, value, isSilent = false) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    if (isSilent) return;

    if (value === 'chat_direct') {
      setIsFinished(true);
      setMessages([{ role: 'assistant', content: t('agent.welcome_msg') }]);
      return;
    }

    if (key === 'who') {
      setPath(value === 'particular' ? 'particular' : 'empresa');
      setStep(2);
      return;
    }

    if (key === 'finish') {
      setIsFinished(true);
      getAIDiagnostic(newAnswers);
      return;
    }

    if (step < 7) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ca' ? 'es' : 'ca';
    i18n.changeLanguage(nextLang);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-4 bg-black/40 backdrop-blur-md"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0.9, y: 20 }} 
          className="relative w-full md:w-[94%] max-w-[1700px] h-[98%] md:h-full md:max-h-[94vh] rounded-[2rem] md:rounded-[5rem] shadow-[0_0_100px_rgba(0,128,187,0.3)] flex flex-col items-center overflow-visible" 
          style={{ background: 'linear-gradient(135deg, var(--color-primary-blue) 0%, var(--color-primary-blue-hv) 60%, #004d70 100%)' }}
        >
          {/* Language Switcher */}
          <div className="absolute top-6 right-6 md:top-12 md:right-12 z-[100]">
            <button 
              onClick={toggleLanguage}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-white text-[10px] md:text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
            >
              {i18n.language === 'ca' ? 'ES' : 'CA'}
            </button>
          </div>

          {/* Background Icons */}
          <div className="absolute inset-0 pointer-events-none opacity-40 rounded-[2rem] md:rounded-[5rem] overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-white"
                animate={{
                  y: [0, -40, 0],
                  x: [0, (i % 2 === 0 ? 20 : -20), 0],
                  rotate: [0, 20, 0],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  top: `${(i * 15) % 100}%`,
                  left: `${(i * 25) % 100}%`,
                }}
              >
                <Bug size={80 + (i * 20)} />
              </motion.div>
            ))}
          </div>

          <div className="flex-1 flex flex-col items-center w-full p-1 md:p-6 relative z-10 text-center min-h-0">
            {/* Logo */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className={`${isFinished ? 'mb-0 scale-[0.3] md:scale-[0.4] mt-0 md:-mt-12' : 'mb-1 mt-1 md:mt-0'} transition-all relative group flex-shrink-0`}
            >
              <img src="/assets/isotipo.png" alt="CECSA" className="w-32 h-32 md:w-64 md:h-64 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
              <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-0 bg-white/20 rounded-full blur-[100px] -z-10" />
            </motion.div>

            {/* Content Container */}
            <div className={`max-w-4xl mx-auto w-full flex-1 flex flex-col items-center ${isFinished ? 'mt-2 md:-mt-16' : 'mt-2 md:-mt-12'} min-h-0`}>
              {!isFinished ? (
                <div className="flex flex-col items-center space-y-4 md:space-y-12 w-full">
                  <DiagnosticFlow 
                    step={step}
                    path={path}
                    handleAnswer={handleAnswer}
                    handleBack={handleBack}
                  />

                  <div className="mt-2 md:mt-4 flex justify-center w-full flex-shrink-0">
                    <button onClick={onClose} className="group flex items-center space-x-3 bg-white/5 hover:bg-white/10 px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl transition-all border border-white/5 backdrop-blur-sm">
                      <span className="text-white/60 group-hover:text-white text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">{t('agent.skip')}</span>
                      <ArrowRight size={14} className="text-white/40 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-3xl flex-1 flex flex-col px-1 md:px-8 pb-2 md:pb-4 min-h-0">
                  <div className="flex-1 flex flex-col rounded-[2rem] md:rounded-[3rem] border border-white/10 bg-black/20 backdrop-blur-3xl shadow-2xl overflow-hidden relative min-h-0">
                    <ScrollArea ref={scrollRef} className="flex-1 p-4 md:p-8 space-y-6">
                      {messages.map((msg, i) => (
                        <ChatMessage 
                          key={i}
                          msg={msg}
                          handleSendMessage={handleSendMessage}
                          handleSlotSelect={handleSlotSelect}
                          setInputValue={setInputValue}
                        />
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white/5 p-4 rounded-full flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      )}
                    </ScrollArea>

                    <ChatInput 
                      inputValue={inputValue}
                      setInputValue={setInputValue}
                      onSendMessage={handleSendMessage}
                    />
                  </div>

                  <div className="mt-3 md:mt-6 flex flex-col sm:flex-row gap-2 md:gap-4 justify-center items-center flex-shrink-0">
                    <Button variant="accent" size="lg" onClick={() => window.location.href = 'tel:933309169'} className="w-full sm:w-auto px-10 md:px-12 py-3 md:py-4 font-black uppercase tracking-widest text-xs md:text-sm shadow-[0_0_20px_rgba(52,211,153,0.3)]">{t('agent.cta.call')}</Button>
                    <button onClick={onClose} className="text-white/40 hover:text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] transition-colors py-2 px-6">{t('agent.close')}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AgentHeroModal;
