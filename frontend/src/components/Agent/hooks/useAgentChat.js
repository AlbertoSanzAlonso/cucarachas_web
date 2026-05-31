import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

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
      where: a.where || a.where_empresa,
      quantity: a.quantity || a.level,
      since: a.since,
      urgency: a.urgency || a.sanitary_risk,
      sensitive: a.sensitive || a.certificate,
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

  const callAgentAPI = async (message, { forceDiagnostic = false } = {}) => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const diagnostic = buildDiagnosticPayload();
    const response = await fetch(`${apiBase}/api/chat/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        message,
        language: i18n.language,
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
    setMessages([{ role: 'assistant', content: t('agent.verdict.intro') }]);

    const diagnosticPrompt = `He completat el diagnòstic interactiu. Aquí tens les meves dades per a un veredicte personalitzat:
    - Tipus de client: ${finalAnswers.who || 'No especificat'}
    - Localització: ${finalAnswers.where || finalAnswers.where_empresa || 'No especificat'}
    - Freqüència/Nivell: ${finalAnswers.quantity || finalAnswers.level || 'No especificat'}
    - Temps des de l'inici: ${finalAnswers.since || 'No especificat'}
    - Urgència: ${finalAnswers.urgency || finalAnswers.sanitary_risk || 'No especificat'}
    - Nens/Mascotes o Certificat: ${finalAnswers.sensitive || finalAnswers.certificate || 'No especificat'}
    - Informació extra: ${finalAnswers.extra_info || 'Cap'}
    
    Si us plau, genera un diagnòstic únic, ètic i professional per a aquest cas en aquest idioma: ${i18n.language}.`;

    try {
      const data = await callAgentAPI(diagnosticPrompt, { forceDiagnostic: true });
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply, isVerdict: true, slots: data.slots }
      ]);
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
    setMessages(prev => [...prev, { role: 'user', content: confirmMsg }]);
    setIsTyping(true);

    callAgentAPI(`Reserva: ${slot.slot_time || slot.date} ${slot.time}`)
      .then(data => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.reply || t('agent.chat.confirmed', { date: slot.date, time: slot.time }),
          slots: data.slots?.length ? data.slots : null
        }]);
      })
      .catch(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'assistant', content: t('agent.chat.confirmed', { date: slot.date, time: slot.time }) }]);
      });
  }, [i18n.language, t]);

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
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.reply || t('agent.chat.error'),
          slots: data.slots?.length ? data.slots.map((s, i) => ({ id: i, ...s })) : null
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
    handleSendMessage
  };
};
