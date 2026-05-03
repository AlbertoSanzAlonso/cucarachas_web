import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useAgentChat = (i18n, answers, path) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getAIDiagnostic = async (finalAnswers) => {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: diagnosticPrompt, language: i18n.language })
      });
      const data = await response.json();
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.message, isVerdict: true, slots: data.slots }
      ]);
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: t('agent.chat.error'), isVerdict: true }
      ]);
    }
  };

  const handleSlotSelect = (slot) => {
    const confirmMsg = t('agent.chat.confirm_slot', { date: slot.date, time: slot.time });
    setMessages(prev => [...prev, { role: 'user', content: confirmMsg }]);
    setIsTyping(true);

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    fetch(`${apiBase}/api/chat/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Reserva: ${slot.slot_time || slot.date} ${slot.time}`, language: i18n.language })
    })
      .then(r => r.json())
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
      body: JSON.stringify({ message: contextualMessage, language: i18n.language })
    })
      .then(r => r.json())
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
  };

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
