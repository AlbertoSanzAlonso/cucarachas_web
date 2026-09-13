import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, Bot, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import BookingContactForm from '@/components/Agent/Chat/BookingContactForm';
import SlotPicker from '@/components/Agent/Chat/SlotPicker';
import { shouldShowPostBudgetCTAs } from '@/components/Agent/utils/chatMessageFlags';
import { useGetCompanyQuery } from '@/store/apis/companyApi';
import {
  homeChatHasUserTurns,
  loadHomeChatState,
  saveHomeChatState,
} from '@/utils/homeChatStorage';

/** Icono monochrome WhatsApp (currentColor) — misma escala que Lucide en la cabecera. */
const WhatsAppIcon = ({ size = 22, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const FloatingCTA = () => {
  const { t, i18n } = useTranslation();
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const chatConfig = { withCredentials: true };
  const lang = i18n.language?.startsWith('es') ? 'es' : 'ca';
  const { data: company } = useGetCompanyQuery(lang);
  const phoneTel = company?.phone_tel || '+34933309169';
  const phoneLabel = company?.phone || '933 309 169';
  const whatsappUrl = company?.whatsapp_url || 'https://wa.me/34681033305';
  const [isOpen, setIsOpen] = useState(() => Boolean(loadHomeChatState()?.isOpen));
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [messages, setMessages] = useState(() => loadHomeChatState()?.messages || []);
  /** Caja del chat anclada al visualViewport (móvil + teclado iOS/Android). */
  const [mobileViewportBox, setMobileViewportBox] = useState(null);

  useEffect(() => {
    saveHomeChatState({ messages, isOpen });
  }, [messages, isOpen]);

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
  const messagePointerRef = useRef(false);

  const hasTextSelection = () => {
    const selection = window.getSelection();
    return Boolean(selection && selection.type === 'Range' && selection.toString().length > 0);
  };

  const focusChatInput = () => {
    // No robar el foco mientras el usuario selecciona o tiene texto marcado
    if (hasTextSelection()) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  /** Clic en la ventana (excepto campos de reserva/mapa) → escritura lista hasta cerrar */
  const handleChatMouseDown = (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (
      target.closest(
        'input, textarea, select, [contenteditable="true"], .leaflet-container, [data-chat-interactive]'
      )
    ) {
      messagePointerRef.current = false;
      return;
    }
    // Permitir seleccionar texto de los mensajes sin forzar el foco al input
    if (target.closest('[data-chat-message]')) {
      messagePointerRef.current = true;
      return;
    }
    messagePointerRef.current = false;
    if (target.closest('button, a, label')) {
      requestAnimationFrame(focusChatInput);
      return;
    }
    // Evita que el clic quite el foco del input al pulsar fondo vacío
    e.preventDefault();
    focusChatInput();
  };

  const handleChatMouseUp = () => {
    if (!messagePointerRef.current) return;
    messagePointerRef.current = false;
    // Clic simple en burbuja → volver a escribir; si hay selección, no interferir
    requestAnimationFrame(focusChatInput);
  };

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

  const scrollChatToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  // Al abrir o al llegar mensajes nuevos: ir al final (no al saludo inicial)
  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    scrollChatToBottom();
    const raf = requestAnimationFrame(scrollChatToBottom);
    // Tras montaje AnimatePresence + animación de apertura
    const t1 = setTimeout(scrollChatToBottom, 50);
    const t2 = setTimeout(scrollChatToBottom, 320);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Pequeño timeout para esperar a que la animación de apertura termine
      const timer = setTimeout(focusChatInput, 300);
      return () => clearTimeout(timer);
    }
    setIsExpanded(false);
  }, [isOpen]);

  // Tras respuesta del agente, recuperar escritura (sin robar el formulario de reserva)
  useEffect(() => {
    if (!isOpen || isLoading) return undefined;
    const timer = requestAnimationFrame(() => {
      const active = document.activeElement;
      if (
        active instanceof Element &&
        active !== inputRef.current &&
        active.closest('input, textarea, select, [contenteditable="true"], .leaflet-container')
      ) {
        return;
      }
      focusChatInput();
    });
    return () => cancelAnimationFrame(timer);
  }, [isOpen, isLoading]);

  useEffect(() => {
    if (!isExpanded) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsExpanded(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isExpanded]);

  // Móvil: el chat debe vivir dentro del visualViewport (no 80vh del layout viewport).
  // En iOS Safari el teclado reduce visualViewport sin actualizar vh correctamente.
  useLayoutEffect(() => {
    if (!isOpen) {
      setMobileViewportBox(null);
      return undefined;
    }

    const syncMobileViewport = () => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      const vv = window.visualViewport;
      if (!isMobile || !vv) {
        setMobileViewportBox(null);
        return;
      }

      const inset = 8;
      setMobileViewportBox({
        top: Math.round(vv.offsetTop + inset),
        left: Math.round(inset),
        width: Math.round(Math.max(0, vv.width - inset * 2)),
        height: Math.round(Math.max(240, vv.height - inset * 2)),
      });
    };

    syncMobileViewport();
    const vv = window.visualViewport;
    vv?.addEventListener('resize', syncMobileViewport);
    vv?.addEventListener('scroll', syncMobileViewport);
    window.addEventListener('resize', syncMobileViewport);
    window.addEventListener('orientationchange', syncMobileViewport);

    const previousOverflow = document.body.style.overflow;
    if (window.matchMedia('(max-width: 767px)').matches) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      vv?.removeEventListener('resize', syncMobileViewport);
      vv?.removeEventListener('scroll', syncMobileViewport);
      window.removeEventListener('resize', syncMobileViewport);
      window.removeEventListener('orientationchange', syncMobileViewport);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const closeChat = () => {
    setIsOpen(false);
    setIsExpanded(false);
    setShowHint(false);
    setMobileViewportBox(null);
  };

  const sendMessage = async (userMessage) => {
    if (!userMessage.trim() || isLoading) return;

    const preserveCase = homeChatHasUserTurns(messages);
    setMessages(prev => [...prev, { role: 'user', content: userMessage.trim() }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${apiBase}/api/chat/`, {
        message: userMessage.trim(),
        language: i18n.language,
        source: 'home',
        preserve_case: preserveCase,
      }, { ...chatConfig, timeout: 60000 });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.reply,
        slots: response.data.slots,
        showPostBudgetCTAs: shouldShowPostBudgetCTAs(userMessage.trim(), response.data.reply),
      }]);
    } catch (error) {
      console.error('Error in chat:', error);
      const fallback =
        error?.response?.data?.reply ||
        t('agent.home.connection_error');
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    requestAnimationFrame(focusChatInput);
    await sendMessage(userMessage);
    focusChatInput();
  };

  const handleQuickAction = (text) => {
    sendMessage(text);
    requestAnimationFrame(focusChatInput);
  };

  const handleSlotSelect = (slot) => {
    const confirmMsg = t('agent.chat.confirm_slot', { date: slot.date, time: slot.time });
    setMessages(prev => [
      ...prev,
      { role: 'user', content: confirmMsg },
      {
        role: 'assistant',
        content: t('agent.booking.ask_name'),
        showBookingForm: true,
        bookingStep: 'name',
        selectedSlot: slot,
      },
    ]);
  };

  const handleBookingNameNext = (name, slot) => {
    setMessages(prev => [
      ...prev.map((m) => (m.showBookingForm ? { ...m, showBookingForm: false } : m)),
      { role: 'user', content: name },
      {
        role: 'assistant',
        content: t('agent.booking.ask_address', { name }),
        showBookingForm: true,
        bookingStep: 'address',
        bookingName: name,
        selectedSlot: slot,
      },
    ]);
  };

  const handleBookingAddressNext = ({ name, address, slot }) => {
    setMessages(prev => [
      ...prev.map((m) => (m.showBookingForm ? { ...m, showBookingForm: false } : m)),
      { role: 'user', content: address },
      {
        role: 'assistant',
        content: t('agent.booking.ask_email', { name }),
        showBookingForm: true,
        bookingStep: 'email',
        bookingName: name,
        bookingAddress: address,
        selectedSlot: slot,
      },
    ]);
  };

  const handleBookingEmailNext = ({ name, email, address, slot }) => {
    setMessages(prev => [
      ...prev.map((m) => (m.showBookingForm ? { ...m, showBookingForm: false } : m)),
      { role: 'user', content: email },
      {
        role: 'assistant',
        content: t('agent.booking.ask_phone', { name }),
        showBookingForm: true,
        bookingStep: 'phone',
        bookingName: name,
        bookingAddress: address,
        bookingEmail: email,
        selectedSlot: slot,
      },
    ]);
  };

  const handleBookingSubmit = async ({ name, email, phone, address, slot }) => {
    const slotTime = slot.slot_time || `${slot.date} ${slot.time}`;
    setMessages(prev => [
      ...prev.map((m) => (m.showBookingForm ? { ...m, showBookingForm: false } : m)),
      { role: 'user', content: phone },
    ]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${apiBase}/api/chat/`,
        {
          message: '',
          language: i18n.language,
          source: 'home',
          preserve_case: true,
          booking: { slot_time: slotTime, name, email, phone, address: address || '' },
        },
        chatConfig
      );

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.reply,
          slots: response.data.slots?.length ? response.data.slots : null,
        },
      ]);
    } catch (error) {
      console.error('Error confirming booking:', error);
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
                   layout={!mobileViewportBox}
                   initial={{ opacity: 0, y: 20, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 20, scale: 0.95 }}
                   transition={{ layout: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
                   onMouseDown={handleChatMouseDown}
                   onMouseUp={handleChatMouseUp}
                   style={
                     mobileViewportBox
                       ? {
                           position: 'fixed',
                           top: mobileViewportBox.top,
                           left: mobileViewportBox.left,
                           width: mobileViewportBox.width,
                           height: mobileViewportBox.height,
                           bottom: 'auto',
                           right: 'auto',
                           maxWidth: 'none',
                           maxHeight: 'none',
                           zIndex: 120,
                         }
                       : undefined
                   }
                   className={`bg-white shadow-3xl overflow-hidden border border-gray-100 flex flex-col origin-bottom-right ${
                     isExpanded
                       ? 'fixed inset-4 md:inset-6 w-auto h-auto max-w-none max-h-none rounded-[2rem] z-[130]'
                       : mobileViewportBox
                         ? 'rounded-2xl z-[120]'
                         : 'fixed md:relative bottom-28 md:bottom-auto left-4 right-4 md:left-auto md:right-auto md:mb-4 w-auto md:w-[550px] max-w-[calc(100vw-2rem)] md:max-w-[min(550px,calc(100vw-3rem))] h-[min(80dvh,80vh)] md:h-[750px] md:max-h-[calc(100vh-10rem)] rounded-[3rem] z-[120]'
                   }`}
                 >
                   {/* Header */}
                   <div
                     className="p-4 md:p-8 text-white relative overflow-hidden flex items-center justify-between shrink-0"
                     style={{ background: 'var(--primary-blue)' }}
                   >
                      <div className="relative z-10 flex items-center space-x-3 md:space-x-4 min-w-0">
                         <div
                           className="p-2.5 md:p-3 rounded-2xl shadow-lg shrink-0"
                           style={{ background: 'var(--accent-green)' }}
                         >
                           <Bot size={24} className="md:w-7 md:h-7" style={{ color: 'var(--primary-blue)' }} />
                         </div>
                         <div className="min-w-0">
                            <h3 className="font-black text-sm md:text-base uppercase tracking-widest truncate">{t('agent.home.title')}</h3>
                            <p className="text-[10px] opacity-60 font-bold uppercase tracking-tighter">{t('agent.home.subtitle')}</p>
                         </div>
                      </div>
                      <div className="flex items-center space-x-1 md:space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsExpanded((prev) => !prev)}
                          className="hidden md:inline-flex p-3 hover:bg-white/10 rounded-2xl transition-all text-white/80 hover:text-white"
                          title={isExpanded ? t('agent.home.collapse_chat') : t('agent.home.expand_chat')}
                          aria-label={isExpanded ? t('agent.home.collapse_chat') : t('agent.home.expand_chat')}
                        >
                          {isExpanded ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
                        </button>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 md:p-3 hover:bg-white/10 rounded-2xl transition-all text-white/80 hover:text-white"
                          title="WhatsApp"
                          aria-label="WhatsApp"
                        >
                          <WhatsAppIcon size={22} className="md:w-6 md:h-6" />
                        </a>
                        <button
                          type="button"
                          onClick={closeChat}
                          className="p-2.5 md:p-3 hover:bg-white/10 rounded-2xl transition-all"
                          aria-label={t('agent.home.close_chat')}
                        >
                          <X size={22} className="md:w-6 md:h-6" />
                        </button>
                      </div>
                   </div>

                   {/* Messages */}
                   <div
                     ref={messagesContainerRef}
                     data-lenis-prevent
                     className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 md:p-6 space-y-4 md:space-y-6 bg-gray-50/50 custom-scrollbar"
                   >
                     {messages.map((msg, i) => (
                       <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                           <div
                           data-chat-message
                           className={`max-w-[92%] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-base md:text-xl font-medium shadow-md leading-relaxed select-text ${msg.role === 'user' ? 'bg-primary-blue text-white rounded-tr-none' : 'bg-white text-secondary-gray border border-gray-100 rounded-tl-none'}`}
                           dangerouslySetInnerHTML={{ __html: (msg.content || '').replace(/\*\*(.*?)\*\*/g, '<span class="font-black text-primary-blue">$1</span>') }}
                         />
                         {msg.isInitial && (
                           <div className="flex flex-wrap gap-2 mt-4 max-w-[92%]">
                             <button
                               type="button"
                               onClick={() => handleQuickAction(t('agent.verdict.action_schedule'))}
                               disabled={isLoading}
                               className="bg-accent-green hover:bg-accent-green-hv text-primary-gray border-none rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
                             >
                               📅 {t('agent.cta.schedule')}
                             </button>
                             <button
                               type="button"
                               onClick={() => handleQuickAction(t('agent.verdict.action_budget'))}
                               disabled={isLoading}
                               className="bg-white hover:bg-gray-50 text-secondary-gray border border-gray-200 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
                             >
                               💰 {t('agent.cta.budget')}
                             </button>
                             <button
                               type="button"
                               onClick={() => window.location.href = `tel:${phoneTel.replace('+', '')}`}
                               className="bg-white hover:bg-gray-50 text-secondary-gray/80 border border-gray-200 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all"
                             >
                               📞 {t('agent.cta.call')}
                             </button>
                           </div>
                         )}
                         {msg.showPostBudgetCTAs && (
                           <div className="flex flex-col gap-2 mt-4 max-w-[92%]">
                             <div className="flex flex-wrap gap-2">
                               <button
                                 type="button"
                                 onClick={() => handleQuickAction(t('agent.verdict.action_schedule'))}
                                 disabled={isLoading}
                                 className="bg-accent-green hover:bg-accent-green-hv text-primary-gray border-none rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
                               >
                                 📅 {t('agent.cta.schedule')}
                               </button>
                               <button
                                 type="button"
                                 onClick={() => window.location.href = `tel:${phoneTel.replace('+', '')}`}
                                 className="bg-white hover:bg-gray-50 text-secondary-gray/80 border border-gray-200 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all"
                               >
                                 📞 {t('agent.cta.call')}
                               </button>
                             </div>
                             <p className="text-secondary-gray/50 text-[11px] md:text-xs leading-relaxed px-1">
                               {t('agent.chat.post_budget_hint')}
                             </p>
                           </div>
                         )}
                         {msg.slots && (
                           <div className="mt-4 w-full max-w-[320px]" data-chat-interactive>
                             <SlotPicker
                               slots={msg.slots}
                               onSlotSelect={handleSlotSelect}
                               variant="light"
                             />
                           </div>
                         )}
                         {msg.showBookingForm && msg.selectedSlot && (
                           <div data-chat-interactive>
                             <BookingContactForm
                               variant="light"
                               slot={msg.selectedSlot}
                               step={msg.bookingStep || 'name'}
                               bookingName={msg.bookingName}
                               bookingAddress={msg.bookingAddress}
                               bookingEmail={msg.bookingEmail}
                               onNameNext={(name) => handleBookingNameNext(name, msg.selectedSlot)}
                               onAddressNext={handleBookingAddressNext}
                               onEmailNext={handleBookingEmailNext}
                               onSubmit={handleBookingSubmit}
                               disabled={isLoading}
                             />
                           </div>
                         )}
                       </div>
                     ))}
                     {isLoading && <div className="text-xs text-gray-400 animate-pulse font-bold uppercase tracking-widest px-2">{t('agent.home.thinking')}</div>}
                   </div>

                   {/* Input */}
                   <form onSubmit={handleSend} className="p-3 md:p-6 border-t border-gray-100 bg-white shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-6">
                     <div className="flex items-center bg-gray-50 rounded-2xl md:rounded-3xl px-4 md:px-6 py-1.5 md:py-2 border border-gray-200 focus-within:border-primary-blue/30 transition-all shadow-inner">
                       <input
                         ref={inputRef}
                         type="text"
                         value={input}
                         onChange={(e) => setInput(e.target.value)}
                         placeholder={t('agent.home.placeholder')}
                         className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-secondary-gray py-3 md:py-4 px-1 text-base md:text-lg"
                       />
                       <button 
                         type="submit"
                         disabled={isLoading || !input.trim()}
                         className="ml-3 md:ml-4 p-3 md:p-4 bg-primary-blue text-white rounded-xl md:rounded-2xl hover:scale-110 active:scale-95 disabled:bg-gray-200 disabled:scale-100 transition-all shadow-lg"
                       >
                         <Send size={20} />
                       </button>
                     </div>
                   </form>
                 </motion.div>
               )}
             </AnimatePresence>

             {/* Chat Trigger Button (PRO) — en móvil con chat abierto se oculta (cierre en header) */}
             {!(isOpen && isExpanded) && (
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => {
                 if (isOpen) {
                   closeChat();
                 } else {
                   setIsOpen(true);
                   setShowHint(false);
                 }
               }}
               className={`items-center shadow-[0_15px_40px_rgba(52,211,153,0.3)] rounded-2xl md:rounded-[2rem] p-3 md:p-4 border border-white/20 transition-all group ${
                 isOpen ? 'hidden md:flex' : 'flex'
               }`}
               style={{ background: 'var(--accent-green)', color: 'var(--secondary-gray)' }}
             >
                <div className="p-2 md:p-3 rounded-xl bg-primary-blue/10 group-hover:bg-primary-blue group-hover:text-white transition-colors">
                   {isOpen ? <X size={24} /> : <Bot size={24} />}
                </div>
                {!isOpen && <span className="text-sm md:text-xl font-black ml-3 uppercase tracking-tighter">{t('agent.home.open_chat')}</span>}
                {isOpen && <span className="text-sm md:text-xl font-black ml-3 uppercase tracking-tighter">{t('agent.home.close_chat')}</span>}
             </motion.button>
             )}
          </div>

       </div>
    </div>
  );
};

export default FloatingCTA;
