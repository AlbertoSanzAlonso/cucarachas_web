import React, { useState, useRef, useEffect, useCallback, startTransition, useMemo } from 'react';
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
import CalEmbed from './Chat/CalEmbed';

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
    handleBookingNameNext,
    handleBookingSubmit,
    handleSendMessage
  } = useAgentChat(i18n, answers, path);

  const handleAnswer = useCallback((key, value, isSilent = false) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    if (isSilent) return;

    if (value === 'chat_direct') {
      setIsFinished(true);
      setMessages([{ role: 'assistant', content: t('agent.welcome_msg') }]);
      return;
    }

    if (key === 'who') {
      const nextPath = ['particular', 'empresa', 'comunidad', 'admin'].includes(value) ? value : 'empresa';
      setPath(nextPath);
      startTransition(() => {
        setStep(2);
      });
      return;
    }

    if (key === 'finish') {
      setIsFinished(true);
      getAIDiagnostic(newAnswers);
      return;
    }

    let nextStep = step + 1;

    if (path === 'comunidad') {
      const currentRole = newAnswers.role_comunidad;
      const hasAdmin = newAnswers.has_admin;
      const contactWho = newAnswers.contact_who;

      if (step === 4) {
        if (currentRole === 'administrador') {
          nextStep = 9; // Skip directly to what_if_not
        } else {
          nextStep = 5; // has_admin
        }
      } else if (step === 5) {
        if (currentRole === 'vecino') {
          if (value === 'yes') nextStep = 6; // which_admin
          else nextStep = 7; // help_community
        } else if (currentRole === 'presidente' || currentRole === 'junta') {
          if (value === 'yes') nextStep = 8; // contact_who
          else nextStep = 9; // what_if_not
        }
      } else if (step === 6) {
        if (currentRole === 'vecino') nextStep = 7; // help_community
        else nextStep = 9; // what_if_not
      } else if (step === 7) {
        nextStep = 9; // what_if_not
      } else if (step === 8) {
        if (value === 'con_admin' || value === 'ambos') nextStep = 6; // which_admin
        else nextStep = 9; // what_if_not
      }
    }

    let maxSteps = 7;
    if (path === 'admin') maxSteps = 10;
    if (path === 'comunidad') maxSteps = 10;

    if (nextStep <= maxSteps) {
      startTransition(() => {
        setStep(nextStep);
      });
    } else {
      setIsFinished(true);
      getAIDiagnostic(newAnswers);
    }
  }, [answers, step, path, t, setMessages, getAIDiagnostic]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      startTransition(() => {
        setStep(step - 1);
      });
    }
  }, [step]);

  const toggleLanguage = useCallback(() => {
    startTransition(() => {
      const nextLang = i18n.language === 'ca' ? 'es' : 'ca';
      i18n.changeLanguage(nextLang);
    });
  }, [i18n]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }} 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-bg-light"
      data-lenis-prevent
      style={{ touchAction: 'manipulation' }}
    >
      <motion.div 
        layoutId={window.innerWidth < 768 ? undefined : "hero-box"}
        className="relative w-[96%] md:w-[94%] max-w-[1700px] h-[85vh] md:h-[85vh] rounded-[2.5rem] md:rounded-[5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-center overflow-hidden" 
        style={{ 
          background: 'linear-gradient(135deg, var(--color-primary-blue) 0%, var(--color-primary-blue-hv) 60%, #004d70 100%)',
          zIndex: 201,
          willChange: 'transform, opacity',
          borderRadius: window.innerWidth < 768 ? '2.5rem' : undefined
        }}
        transition={{ 
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1]
        }}
      >
        <style>{`
          @media (max-height:900px) {
            .agent-hero-modal-logo {
              width: 100px !important;
              height: 100px !important;
              margin-top: 0 !important;
            }
            .agent-hero-modal-logo img {
              width: 100px !important;
              height: 100px !important;
            }
            .agent-hero-modal-content {
              padding-top: 0.5rem !important;
              padding-bottom: 0.5rem !important;
            }
            .agent-hero-content-container {
              margin-top: 0 !important;
            }
            .diagnostic-title-container {
              margin-bottom: 0.5rem !important;
            }
            .diagnostic-title-container h2 {
              font-size: 1.5rem !important;
            }
            .diagnostic-btn {
              padding: 0.75rem !important;
              min-height: 50px !important;
            }
          }
          @media (max-height:700px) {
            .agent-hero-modal-logo {
              width: 80px !important;
              height: 80px !important;
            }
            .agent-hero-modal-logo img {
              width: 80px !important;
              height: 80px !important;
            }
            .diagnostic-btn {
              padding: 0.5rem !important;
            }
          }
        `}</style>

        {/* Language Switcher */}
        <div className="absolute top-6 right-6 md:top-12 md:right-12 z-[100]">
          <button 
            onClick={toggleLanguage}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-white text-[10px] md:text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
          >
            {i18n.language === 'ca' ? 'ES' : 'CA'}
          </button>
        </div>

        {useMemo(() => (
          <div className="absolute inset-0 pointer-events-none opacity-20 md:opacity-40 rounded-[2rem] md:rounded-[5rem] overflow-hidden">
            {[...Array(window.innerWidth < 768 ? 4 : 8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-white"
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ 
                  duration: 10 + i, 
                  repeat: Infinity, 
                  ease: "linear"
                }}
                style={{
                  top: `${(i * 25) % 100}%`,
                  left: `${(i * 30) % 100}%`,
                  willChange: 'transform, opacity'
                }}
              >
                <Bug size={60 + (i * 20)} />
              </motion.div>
            ))}
          </div>
        ), [])}

        <div className="agent-hero-modal-content flex-1 flex flex-col items-center w-full p-1 md:p-6 relative z-10 text-center min-h-0">
          {/* Logo */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={`agent-hero-modal-logo ${isFinished ? 'mb-0 scale-[0.3] md:scale-[0.4] mt-0 md:-mt-12' : 'mb-1 mt-1 md:mt-0'} transition-all relative group flex-shrink-0`}
          >
            <img src="/assets/isotipo.png" alt="CECSA" className="w-32 h-32 md:w-64 md:h-64 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-0 bg-white/20 rounded-full blur-[100px] -z-10" style={{ willChange: 'transform, opacity' }} />
          </motion.div>

          {/* Content Container */}
          <div className={`agent-hero-content-container max-w-4xl mx-auto w-full flex-1 flex flex-col items-center ${isFinished ? 'mt-2 md:-mt-16 overflow-hidden' : 'mt-2 md:mt-2 overflow-y-auto'} min-h-0 pb-4 custom-scrollbar`}>
            {!isFinished ? (
              <div className="flex flex-col items-center space-y-4 md:space-y-12 w-full">
                <DiagnosticFlow 
                  step={step}
                  path={path}
                  answers={answers}
                  handleAnswer={handleAnswer}
                  handleBack={handleBack}
                />

                <div className="mt-2 md:mt-4 flex justify-center w-full flex-shrink-0">
                  <motion.button 
                    onClick={onClose} 
                    className="group flex items-center space-x-3 bg-white hover:bg-white/90 px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl transition-all border border-white shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
                  >
                    <span className="text-primary-blue text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">{t('agent.skip')}</span>
                    <ArrowRight size={14} className="text-primary-blue transition-all transform group-hover:translate-x-1" />
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-3xl flex-1 flex flex-col px-1 md:px-8 pb-2 md:pb-4 min-h-0">
                <div className="flex-1 flex flex-col rounded-[2rem] md:rounded-[3rem] border border-white/10 bg-black/30 backdrop-blur-xl shadow-2xl overflow-hidden relative min-h-0">
                  <ScrollArea ref={scrollRef} className="flex-1 min-h-0 p-4 md:p-8 space-y-6">
                    {messages.map((msg, i) => (
                      <ChatMessage 
                        key={i}
                        msg={msg}
                        handleSendMessage={handleSendMessage}
                        handleSlotSelect={handleSlotSelect}
                        handleBookingNameNext={handleBookingNameNext}
                        handleBookingSubmit={handleBookingSubmit}
                        isTyping={isTyping}
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

        {/* Calendar Modal Overlay */}
        <AnimatePresence>
          {messages.some(m => m.showCalendar) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[150] flex items-center justify-center p-4 md:p-12 bg-primary-blue/20 backdrop-blur-xl rounded-[2rem] md:rounded-[5rem]"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-4xl h-[85vh] md:h-[700px] rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col"
              >
                <div className="p-4 md:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                  <div className="text-left">
                    <h3 className="text-lg md:text-2xl font-black text-primary-gray uppercase tracking-tight">
                      {i18n.language.startsWith('es') ? 'Elige tu horario' : 'Tria el teu horari'}
                    </h3>
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary-gray/40">
                      {i18n.language.startsWith('es') ? 'Inspección gratuita CECSA' : 'Inspecció gratuïta CECSA'}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setMessages(prev => prev.map(m => ({ ...m, showCalendar: false })));
                    }}
                    className="bg-primary-gray/5 hover:bg-red-50 text-primary-gray/40 hover:text-red-500 px-4 py-2 md:p-4 rounded-xl md:rounded-2xl transition-all font-black text-[10px] md:text-xs uppercase tracking-widest"
                  >
                    {i18n.language.startsWith('es') ? 'CERRAR' : 'TANCAR'}
                  </button>
                </div>
                <div className="flex-1 bg-white overflow-hidden relative">
                  <CalEmbed language={i18n.language.startsWith('es') ? 'es' : 'ca'} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default AgentHeroModal;
