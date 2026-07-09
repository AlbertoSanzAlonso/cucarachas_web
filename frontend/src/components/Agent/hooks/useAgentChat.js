import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { buildStaticVerdict, hasExtraInfo } from '@/components/Agent/Diagnostic/buildStaticVerdict';
import { shouldShowPostBudgetCTAs } from '@/components/Agent/utils/chatMessageFlags';

export const useAgentChat = (i18n, answers, path) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  const answersRef = useRef(answers);
  const pathRef = useRef(path);
  const messagesRef = useRef(messages);
  const inputValueRef = useRef(inputValue);

  const buildDiagnosticPayload = useCallback(() => {
    const a = answersRef.current;
    if (!a || !Object.keys(a).length) return undefined;
    return {
      path: pathRef.current || 'general',
      who: a.who,
      where: a.where || a.where_empresa || a.where_admin || a.where_comunidad,
      quantity: a.quantity,
      level: a.level,
      since: a.since || a.since_admin || a.since_comunidad,
      urgency: a.urgency || a.sanitary_risk,
      sensitive: a.sensitive,
      certificate: a.certificate,
      business_type: a.business_type,
      sanitary_risk: a.sanitary_risk,
      where_empresa: a.where_empresa,
      gestion_tipo: a.gestion_tipo,
      where_admin: a.where_admin,
      since_admin: a.since_admin,
      volume_admin: a.volume_admin,
      escalate_admin: a.escalate_admin,
      prev_admin: a.prev_admin,
      priority_admin: a.priority_admin,
      advance_admin: a.advance_admin,
      where_comunidad: a.where_comunidad,
      since_comunidad: a.since_comunidad,
      role_comunidad: a.role_comunidad,
      has_admin: a.has_admin,
      which_admin: a.which_admin,
      help_community: a.help_community,
      contact_who: a.contact_who,
      what_if_not: a.what_if_not,
      codigo_postal: a.codigo_postal,
      metros_cuadrados: a.metros_cuadrados,
      extra_info: a.extra_info,
    };
  }, []);

  const buildDiagnosticPrefix = useCallback(() => {
    const payload = buildDiagnosticPayload();
    if (!payload?.where && !payload?.who) return '';
    const zone = payload.where || 'Barcelona';
    return `[Diagnòstic: ${payload.path || 'general'}, zona: ${zone}] `;
  }, [buildDiagnosticPayload]);

  const isSchedulingMessage = (text) => {
    const lower = (text || '').toLowerCase();
    return (
      lower.includes('agendar') ||
      lower.includes('reservar') ||
      lower.includes('cita gratuïta') ||
      lower.includes('cita gratuita') ||
      lower.includes('visita gratuïta') ||
      lower.includes('visita gratuita')
    );
  };

  const callAgentAPI = async (message, { forceDiagnostic = false, booking = null } = {}) => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const diagnostic = buildDiagnosticPayload();
    const response = await fetch(`${apiBase}/api/chat/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        message: message || '',
        language: i18n.language,
        ...(booking ? { booking } : {}),
        ...(forceDiagnostic || isSchedulingMessage(message) || diagnostic ? { diagnostic } : {}),
      })
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  };

  useEffect(() => {
    answersRef.current = answers;
    pathRef.current = path;
  }, [answers, path]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: t('agent.welcome_msg'), isInitial: true }]);
    }
  }, [t, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getAIDiagnostic = useCallback(async (finalAnswers) => {
    setIsTyping(true);

    const showVerdict = (content) => {
      setIsTyping(false);
      setMessages([{ role: 'assistant', content, isVerdict: true }]);
    };

    if (!hasExtraInfo(finalAnswers.extra_info)) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      showVerdict(buildStaticVerdict(pathRef.current, finalAnswers, t));
      return;
    }

    setMessages([{ role: 'assistant', content: t('agent.verdict.intro') }]);

    const diagnosticPrompt = `He completat el diagnòstic interactiu. Aquí tens les meves dades per a un veredicte personalitzat:
    - Tipus de client: ${finalAnswers.who || 'No especificat'}
    - Localització: ${finalAnswers.where || finalAnswers.where_empresa || 'No especificat'}
    - Freqüència/Nivell: ${finalAnswers.quantity || finalAnswers.level || 'No especificat'}
    - Temps des de l'inici: ${finalAnswers.since || 'No especificat'}
    - Urgència: ${finalAnswers.urgency || finalAnswers.sanitary_risk || 'No especificat'}
    - Nens/Mascotes o Certificat: ${finalAnswers.sensitive || finalAnswers.certificate || 'No especificat'}
    - Informació extra: ${finalAnswers.extra_info}
    
    Si us plau, genera un diagnòstic únic, ètic i professional per a aquest cas en aquest idioma: ${i18n.language}.`;

    try {
      const data = await callAgentAPI(diagnosticPrompt, { forceDiagnostic: true });
      showVerdict(data.reply);
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: t('agent.chat.error'), isVerdict: true }
      ]);
    }
  }, [i18n.language, t]);

  const handleSlotSelect = useCallback((slot) => {
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
  }, [t]);

  const handleBookingNameNext = useCallback((name, slot) => {
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
  }, [t]);

  const handleBookingAddressNext = useCallback(({ name, address, slot }) => {
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
  }, [t]);

  const handleBookingEmailNext = useCallback(({ name, email, address, slot }) => {
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
  }, [t]);

  const handleBookingSubmit = useCallback(({ name, email, phone, address, slot }) => {
    const slotTime = slot.slot_time || `${slot.date} ${slot.time}`;
    setMessages(prev => [
      ...prev.map((m) => (m.showBookingForm ? { ...m, showBookingForm: false } : m)),
      { role: 'user', content: phone },
    ]);
    setIsTyping(true);

    callAgentAPI('', {
      booking: { slot_time: slotTime, name, email, phone, address: address || '' },
      forceDiagnostic: true,
    })
      .then((data) => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply || t('agent.chat.error'),
            bookingConfirmed: data.booking_confirmed,
          },
        ]);
      })
      .catch(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: t('agent.chat.error') },
        ]);
      });
  }, [t]);

  const handleSendMessage = useCallback((e, directValue = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const value = directValue || inputValueRef.current;
    if (!value.trim()) return;

    const userMsg = { role: 'user', content: value };
    setMessages(prev => [...prev, userMsg]);
    if (!directValue) setInputValue('');
    setIsTyping(true);

    const prefix = isSchedulingMessage(value) ? buildDiagnosticPrefix() : '';
    const contextualMessage = `${prefix}${value}`;

    callAgentAPI(contextualMessage, { forceDiagnostic: Boolean(prefix) })
      .then(data => {
        setIsTyping(false);
        const reply = data.reply || t('agent.chat.error');
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: reply,
          slots: data.slots?.length ? data.slots.map((s, i) => ({ id: i, ...s })) : null,
          showPostBudgetCTAs: shouldShowPostBudgetCTAs(value, reply),
        }]);
      })
      .catch(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: t('agent.chat.server_error') 
        }]);
      });
  }, [i18n.language, t]);

  return {
    messages,
    setMessages,
    inputValue,
    setInputValue,
    isTyping,
    scrollRef,
    getAIDiagnostic,
    handleSlotSelect,
    handleBookingNameNext,
    handleBookingAddressNext,
    handleBookingEmailNext,
    handleBookingSubmit,
    handleSendMessage
  };
};
