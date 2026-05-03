import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ChatMessage = ({ msg, handleSendMessage, handleSlotSelect, setInputValue }) => {
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
            <a 
              href="https://wa.me/34933309169"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#128C7E] text-white border-none rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center"
            >
              <svg className="w-3 h-3 mr-2 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          </div>
        )}

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
  );
};

export default ChatMessage;
