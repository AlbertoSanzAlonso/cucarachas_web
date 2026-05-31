import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BookingContactForm from './BookingContactForm';

const ChatMessage = memo(({ msg, handleSendMessage, handleSlotSelect, handleBookingSubmit, isTyping }) => {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, x: msg.role === 'assistant' ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
    >
      <div className="flex flex-col space-y-4 max-w-[85%]">
        <div className={`p-5 rounded-[2rem] text-left ${msg.role === 'assistant' ? 'bg-white/5 text-white/90 border border-white/5 rounded-tl-none' : 'bg-accent-green text-black font-bold rounded-tr-none shadow-lg'}`}>
          <div className="text-sm md:text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: (msg.content || '').replace(/\*\*(.*?)\*\*/g, '<span class="font-black text-accent-green-hv">$1</span>') }} />
        </div>
        
        {(msg.isInitial || msg.isVerdict) && (
          <div className="flex flex-wrap gap-2 mt-2">
            <button 
              onClick={() => handleSendMessage({ preventDefault: () => {} }, t('agent.verdict.action_schedule'))}
              className="bg-accent-green hover:bg-accent-green-hv text-black border-none rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all shadow-md"
            >
              📅 {t('agent.cta.schedule')}
            </button>
            <button 
              onClick={() => handleSendMessage({ preventDefault: () => {} }, t('agent.verdict.action_budget'))}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all"
            >
              💰 {t('agent.cta.budget')}
            </button>
            <button 
              onClick={() => window.location.href = 'tel:933309169'}
              className="bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center"
            >
              📞 {t('agent.cta.call')}
            </button>
          </div>
        )}


        {msg.slots && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {msg.slots.map(slot => (
              <button 
                key={slot.id ?? `${slot.date}-${slot.time}`}
                onClick={() => handleSlotSelect(slot)}
                className="bg-white/10 hover:bg-accent-green hover:text-black border border-white/10 rounded-xl p-3 text-xs font-bold text-white transition-all text-center backdrop-blur-sm"
              >
                <div className="opacity-60 text-[10px] uppercase mb-1">{slot.date}</div>
                <div>{slot.time}</div>
              </button>
            ))}
          </div>
        )}

        {msg.showBookingForm && msg.selectedSlot && handleBookingSubmit && (
          <BookingContactForm
            slot={msg.selectedSlot}
            onSubmit={handleBookingSubmit}
            disabled={isTyping}
          />
        )}
      </div>
    </motion.div>
  );
});

export default ChatMessage;
