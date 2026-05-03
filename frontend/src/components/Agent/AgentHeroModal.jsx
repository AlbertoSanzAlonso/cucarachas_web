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

const AgentHeroModal = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [path, setPath] = useState(null); 
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getVerdictText = () => {
    const urgency = answers.urgency === 'yes' || answers.sanitary_risk === 'urgent' || answers.level === 'grave' || answers.level === 'closure';
    const moderate = answers.quantity === 'several' || answers.level === 'frequent';
    const profile = urgency ? 1 : moderate ? 2 : 3;
    
    const where = answers.where || answers.where_empresa;
    const qty = answers.quantity || answers.level;
    
    let text = "";
    if (path === 'particular') {
      text = `D'acord, he analitzat el teu cas detalladament. Has indicat la presència de paneroles a la zona de **${where}** amb una freqüència de **${qty === 'one' ? 'un o dos avistaments' : qty === 'several' ? 'diversos avistaments diaris' : 'alta activitat'}**. `;
      if (profile === 1) text += "El meu veredicte és clar: **necessites una intervenció urgent**. Una infestació activa en zones crítiques pot propagar-se ràpidament si no s'actua en les primeres 24-48 hores.";
      else if (profile === 2) text += "El meu veredicte és que **recomanem una inspecció tècnica**. Sembla un focus localitzat, però és vital eliminar-lo abans que s'estableixi una colònia permanent.";
      else text += "El meu veredicte és activar un **Pla de Prevenció Bio-Conscient**. El teu entorn encara és segur, però cal segellar accessos per evitar entrades externes.";
    } else {
      text = `He avaluat la situació del teu negoci. L'activitat detectada a **${where}** representa un risc per a l'operativa i la salut. `;
      if (profile === 1) text += "El meu veredicte és **intervenció immediata**. Donat el nivell d'activitat i el risc sanitari, cal una acció professional avui mateix per evitar tancaments o sancions.";
      else text += "El meu veredicte és una **inspecció tècnica programada**. Cal auditar els punts crítics i establir un certificat de control de plagues segons normativa.";
    }

    text += "\n\n🎁 **OFERTA ESPECIAL**: Per haver completat el diagnòstic, t'oferim una **PRIMERA VISITA D'INSPECCIÓ TOTALMENT GRATUÏTA** a Barcelona i rodalies.";
    text += "\n\nSi tens qualsevol dubte, pots escriure la teva pregunta a sota o triar una opció:";
    
    return text;
  };

  const handleAnswer = (key, value) => {
    if (value === 'chat_direct') {
      setIsFinished(true);
      setMessages([{ role: 'assistant', content: "Hola! Sóc el recepcionista de CECSA. Com puc ajudar-te avui? Pots preguntar-me sobre els nostres serveis, preus o qualsevol dubte que tinguis sobre el control de plagues." }]);
      return;
    }

    if (key === 'finish') {
      setIsFinished(true);
      setMessages([{ role: 'assistant', content: "D'acord, he pres nota de tot. Com puc ajudar-te ara?", isInitial: true }]);
      return;
    }

    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    
    if (step === 1) {
      if (value === 'particular') setPath('particular');
      else if (value === 'empresa') setPath('empresa');
      else setPath('otro');
    }

    if (step === 6) {
      setIsFinished(true);
      setMessages([{ 
        role: 'assistant', 
        content: getVerdictText(),
        isInitial: true 
      }]);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSlotSelect = (slot) => {
    const confirmMsg = `Vull la cita el ${slot.date} a les ${slot.time}`;
    setMessages(prev => [...prev, { role: 'user', content: confirmMsg }]);
    setIsTyping(true);

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    fetch(`${apiBase}/api/chat/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Reserva: ${slot.slot_time || slot.date} ${slot.time}` })
    })
      .then(r => r.json())
      .then(data => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.reply || `Perfecte! He bloquejat la teva cita per **${slot.date} a les ${slot.time}**. Rebràs un correu de confirmació. Necessites res més?`,
          slots: data.slots?.length ? data.slots : null
        }]);
      })
      .catch(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'assistant', content: `Cita registrada per **${slot.date} a les ${slot.time}**. Et confirmarem per correu.` }]);
      });
  };

  const handleSendMessage = (e, directValue = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const value = directValue || inputValue;
    if (!value.trim()) return;

    const userMsg = { role: 'user', content: value };
    setMessages(prev => [...prev, userMsg]);
    if (!directValue) setInputValue('');
    setIsTyping(true);

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const contextualMessage = messages.length <= 1
      ? `[Diagnòstic: ${path || 'general'}, zona: ${answers.where || answers.where_empresa || 'no especificada'}] ${value}`
      : value;

    fetch(`${apiBase}/api/chat/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: contextualMessage })
    })
      .then(r => r.json())
      .then(data => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.reply || 'Ho sento, hi ha hagut un problema. Pots trucar-nos al 933 309 169.',
          slots: data.slots?.length ? data.slots.map((s, i) => ({ id: i, ...s })) : null
        }]);
      })
      .catch(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'En aquest moment no puc connectar amb el servidor. Truca\'ns al **933 309 169** per a assistència immediata.' 
        }]);
      });
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

          <div className="flex-1 flex flex-col items-center w-full p-3 md:p-6 relative z-10 text-center min-h-0">
            {/* Logo */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className={`${isFinished ? 'mb-0 scale-[0.3] md:scale-[0.4] mt-0 md:-mt-12' : 'mb-2'} transition-all relative group flex-shrink-0`}
            >
              <img src="/assets/isotipo.png" alt="CECSA" className="w-24 h-24 md:w-80 md:h-80 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
              <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-0 bg-white/20 rounded-full blur-[100px] -z-10" />
            </motion.div>

            {/* Content Container */}
            <div className={`max-w-4xl mx-auto w-full flex-1 flex flex-col items-center ${isFinished ? 'mt-2 md:-mt-16' : '-mt-10'} min-h-0`}>
              {!isFinished ? (
                <div className="flex flex-col items-center justify-center flex-1 w-full">
                  <DiagnosticFlow 
                    step={step}
                    path={path}
                    handleAnswer={handleAnswer}
                    handleBack={handleBack}
                  />

                  <div className="mt-8 flex justify-center w-full flex-shrink-0">
                    <button onClick={onClose} className="group flex items-center space-x-3 bg-white/5 hover:bg-white/10 px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl transition-all border border-white/5 backdrop-blur-sm">
                      <span className="text-white/60 group-hover:text-white text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">Saltar i anar a la web</span>
                      <ArrowRight size={14} className="text-white/40 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-3xl flex-1 flex flex-col px-1 md:px-8 pb-2 md:pb-4">
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
                    <Button variant="accent" size="lg" onClick={() => window.location.href = 'tel:933309169'} className="w-full sm:w-auto px-10 md:px-12 py-3 md:py-4 font-black uppercase tracking-widest text-xs md:text-sm shadow-[0_0_20px_rgba(52,211,153,0.3)]">Trucar Ara</Button>
                    <button onClick={onClose} className="text-white/40 hover:text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] transition-colors py-2 px-6">Tancar Diàleg</button>
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
