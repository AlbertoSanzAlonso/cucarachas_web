import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, ArrowRight, Sparkles, ShieldCheck, AlertTriangle, Bot, Home, Building2, Users, ChevronLeft, Send, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';

const AgentHeroModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
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
    return text;
  };

  const handleAnswer = (key, value) => {
    if (value === 'chat_direct') {
      setIsFinished(true);
      setMessages([{ role: 'assistant', content: "Hola! Sóc el recepcionista de CECSA. Com puc ajudar-te avui? Pots preguntar-me sobre els nostres serveis, preus o qualsevol dubte que tinguis sobre el control de plagues." }]);
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
      setMessages([{ role: 'assistant', content: getVerdictText() }]);
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
      body: JSON.stringify({ message: `Reserva: ${slot.slotTime || slot.date} ${slot.time}` })
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    // Enviar contexto del diagnóstico en el primer mensaje de chat
    const contextualMessage = messages.length <= 1
      ? `[Diagnòstic: ${path || 'general'}, zona: ${answers.where || answers.where_empresa || 'no especificada'}] ${inputValue}`
      : inputValue;

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

  const getProfile = () => {
    const urgency = answers.urgency === 'yes' || answers.sanitary_risk === 'urgent' || answers.level === 'grave' || answers.level === 'closure';
    const moderate = answers.quantity === 'several' || answers.level === 'frequent';
    if (urgency) return 1;
    if (moderate) return 2;
    return 3;
  };

  const renderParticularFlow = () => {
    switch (step) {
      case 2:
        return [
          { id: 'cocina', label: 'Cuina' },
          { id: 'bano', label: 'Bany' },
          { id: 'dormitorio', label: 'Dormitori' },
          { id: 'salon', label: 'Saló' },
          { id: 'garaje', label: 'Garatge / Traster' },
          { id: 'toda', label: 'Tota la casa' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('where', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      case 3:
        return [
          { id: 'one', label: 'Només una o dues' },
          { id: 'several', label: 'Diverses al dia' },
          { id: 'many', label: 'Moltes cada nit' },
          { id: 'nests', label: 'He trobat nius / cries' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('quantity', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      case 4:
        return [
          { id: 'today', label: 'Avui mateix' },
          { id: 'days', label: 'Fa uns dies' },
          { id: 'weeks', label: 'Fa setmanes' },
          { id: 'months', label: 'Fa mesos' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('since', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      case 5:
        return [
          { id: 'yes', label: 'Sí, necessito ajuda avui' },
          { id: 'week', label: 'Aquesta setmana' },
          { id: 'budget', label: 'Només vull pressupost' },
          { id: 'info', label: 'Vull informació primer' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('urgency', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      case 6:
        return [
          { id: 'yes', label: 'Sí' },
          { id: 'no', label: 'No' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('sensitive', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      default: return null;
    }
  };

  const renderEmpresaFlow = () => {
    switch (step) {
      case 2:
        return [
          { id: 'restaurante', label: 'Restaurant / Bar' },
          { id: 'hotel', label: 'Hotel' },
          { id: 'oficina', label: 'Oficina' },
          { id: 'tienda', label: 'Botiga' },
          { id: 'nave', label: 'Nau Industrial' },
          { id: 'comunidad', label: 'Comunitat / Finca' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('business_type', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      case 3:
        return [
          { id: 'urgent', label: 'Sí, urgent' },
          { id: 'soon', label: 'Pròximament' },
          { id: 'no', label: 'No' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('sanitary_risk', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      case 4:
        return [
          { id: 'cocina', label: 'Cuina' },
          { id: 'almacen', label: 'Magatzem' },
          { id: 'clientes', label: 'Zona clients' },
          { id: 'baños', label: 'Banys' },
          { id: 'exterior', label: 'Exterior' },
          { id: 'varias', label: 'Diverses zones' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('where_empresa', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      case 5:
        return [
          { id: 'puntual', label: 'Avistaments puntuals' },
          { id: 'frequent', label: 'Freqüent' },
          { id: 'grave', label: 'Greu' },
          { id: 'closure', label: 'Tancament imminent' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('level', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      case 6:
        return [
          { id: 'yes', label: 'Sí' },
          { id: 'no', label: 'No' },
          { id: 'unknown', label: 'No ho sé' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('certificate', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      default: return null;
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return [
        { id: 'particular', label: 'Particular / Habitatge', icon: Home },
        { id: 'empresa', label: 'Empresa / Negoci', icon: Building2 },
        { id: 'comunidad', label: 'Comunitat de veïns', icon: Users },
        { id: 'admin', label: 'Administració / Local públic', icon: Building2 },
        { id: 'unknown', label: 'No ho sé', icon: AlertTriangle },
        { id: 'chat_direct', label: 'Tinc preguntes / Consultar Agent', icon: MessageSquare, primary: true }
      ].map(opt => (
        <button key={opt.id} onClick={() => handleAnswer('who', opt.id)} className={`flex items-center p-5 rounded-2xl border transition-all group text-left min-w-[260px] ${opt.primary ? 'bg-accent-green text-black border-accent-green' : 'bg-white/5 hover:bg-white/10 text-white border-white/10'}`}>
          <opt.icon size={20} className={`mr-4 ${opt.primary ? 'text-black' : 'text-accent-green'}`} />
          <span className="font-bold">{opt.label}</span>
        </button>
      ));
    }
    
    if (path === 'particular') return renderParticularFlow();
    if (path === 'empresa') return renderEmpresaFlow();
    
    return (
      <div className="w-full max-w-xs">
        <Button variant="accent" onClick={() => setIsFinished(true)} className="w-full">
          Finalitzar Diagnòstic
        </Button>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-start justify-center pt-8 bg-black/40 backdrop-blur-md overflow-y-auto">
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative h-[calc(100vh-4rem)] w-[92%] md:w-[94%] max-w-[1700px] overflow-hidden rounded-[3rem] md:rounded-[5rem] shadow-[0_0_100px_rgba(0,128,187,0.3)] flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--color-primary-blue) 0%, var(--color-primary-blue-hv) 60%, #004d70 100%)' }}>
          
          {/* Animated Background Icons */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
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

          <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10 overflow-hidden text-center w-full">
            
            {/* Isotype */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className={`${isFinished ? 'mb-2 scale-50' : 'mb-10'} transition-all relative group`}
            >
              <img src="/assets/isotipo.png" alt="CECSA" className="w-24 h-24 md:w-36 md:h-36 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
              <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-0 bg-white/20 rounded-full blur-[60px] -z-10" />
            </motion.div>

            <div className="max-w-4xl mx-auto w-full flex flex-col items-center h-full max-h-[75vh]">
              {!isFinished ? (
                <>
                  <div className="flex items-center justify-center space-x-6 w-full max-w-sm mb-6">
                    {step > 1 && (
                      <button onClick={handleBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white/60 hover:text-white transition-all">
                        <ChevronLeft size={20} />
                      </button>
                    )}
                    <div className="flex space-x-2 flex-grow">
                      {[1, 2, 3, 4, 5, 6].map((s) => (
                        <div key={s} className={`h-1 flex-grow rounded-full transition-all duration-500 ${s <= step ? 'bg-accent-green shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-white/20'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-center justify-center space-x-2 bg-accent-green/10 px-3 py-1.5 rounded-full border border-accent-green/20 mb-4 mx-auto w-fit">
                      <Bot size={14} className="text-accent-green" />
                      <span className="text-[9px] font-black text-accent-green uppercase tracking-[0.2em]">Pas {step} de 6 — Diagnòstic Tècnic</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter mb-4 leading-tight">
                      {step === 1 ? 'Qui necessita el servei?' : 
                       path === 'particular' ? 
                        (step === 2 ? 'On has vist paneroles?' : step === 3 ? 'Quantes n\'has vist?' : step === 4 ? 'Des de quan passa?' : step === 5 ? 'És urgent?' : 'Hi ha nens o mascotes?') :
                       path === 'empresa' ?
                        (step === 2 ? 'Quin tipus de negoci ets?' : step === 3 ? 'Hi ha inspecció sanitària?' : step === 4 ? 'On apareix el problema?' : step === 5 ? 'Nivell del problema' : 'Necessites certificat?') :
                        'Explica\'ns més'}
                    </h2>
                  </div>
                  <div className={`grid gap-3 max-w-3xl mx-auto w-full ${step === 6 ? 'grid-cols-1 max-w-xs' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {renderStep()}
                  </div>
                </>
              ) : (
                <div className="w-full max-w-3xl flex flex-col h-full overflow-hidden">
                  <div className="flex items-center justify-center space-x-2 bg-accent-green/10 px-4 py-2 rounded-full border border-accent-green/20 mb-4 mx-auto animate-bounce">
                    <Bot size={16} className="text-accent-green" />
                    <span className="text-xs font-black text-accent-green uppercase tracking-[0.2em]">Bio-Assistent connectat</span>
                  </div>

                  <div className="flex-1 flex flex-col rounded-[3rem] border border-white/10 bg-black/20 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
                      {messages.map((msg, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: msg.role === 'assistant' ? -10 : 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={i} 
                          className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className="flex flex-col space-y-4 max-w-[85%]">
                            <div className={`p-5 rounded-[2rem] text-left ${msg.role === 'assistant' ? 'bg-white/5 text-white/90 border border-white/5 rounded-tl-none' : 'bg-accent-green text-black font-bold rounded-tr-none shadow-lg'}`}>
                              <div className="text-sm md:text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<span class="font-black text-accent-green-hv">$1</span>') }} />
                            </div>
                            
                            {msg.slots && (
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {msg.slots.map(slot => (
                                  <button 
                                    key={slot.id} 
                                    onClick={() => handleSlotSelect(slot)}
                                    className="bg-white/10 hover:bg-accent-green hover:text-black border border-white/10 rounded-xl p-3 text-xs font-bold text-white transition-all text-center backdrop-blur-sm"
                                  >
                                    <div className="opacity-60 text-[10px] uppercase mb-1">{slot.date}</div>
                                    <div>{slot.time}</div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
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
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-white/5 border-t border-white/10">
                      <form onSubmit={handleSendMessage} className="relative flex items-center">
                        <input 
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Fes-me qualsevol pregunta sobre el veredicte..."
                          className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-14 text-white placeholder:text-white/30 focus:outline-none focus:border-accent-green/50 transition-all"
                        />
                        <button type="submit" className="absolute right-2 p-3 bg-accent-green text-black rounded-full hover:bg-accent-green-hv transition-all shadow-lg">
                          <Send size={18} />
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Button variant="accent" size="lg" className="w-full sm:w-auto px-10 py-4 font-black uppercase tracking-widest text-sm">Trucar Ara</Button>
                    <button onClick={onClose} className="text-white/40 hover:text-white text-xs font-black uppercase tracking-widest transition-colors py-2 px-6">Tancar Diàleg</button>
                  </div>
                </div>
              )}
            </div>

            {!isFinished && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full flex justify-center px-6">
                 <button onClick={onClose} className="group flex items-center space-x-3 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl transition-all border border-white/5 backdrop-blur-sm">
                   <span className="text-white/60 group-hover:text-white text-[10px] font-black tracking-[0.2em] uppercase">Saltar i anar a la web</span>
                   <ArrowRight size={14} className="text-white/40 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                 </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AgentHeroModal;
