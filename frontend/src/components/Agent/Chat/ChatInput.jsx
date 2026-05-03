import React from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ inputValue, setInputValue, onSendMessage }) => {
  return (
    <div className="p-4 bg-white/5 border-t border-white/10">
      <form onSubmit={onSendMessage} className="relative flex items-center">
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
  );
};

export default ChatInput;
