import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ShieldCheck } from 'lucide-react';

const AgentBubble = ({ onClick, isVisible }) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          className="fixed bottom-8 right-8 z-[90] group"
        >
          {/* Notification Badge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-full right-0 mb-4 px-4 py-2 bg-white text-primary-blue rounded-2xl shadow-xl border border-primary-blue/10 whitespace-nowrap hidden md:block"
          >
            <p className="text-[12px] font-black uppercase tracking-widest flex items-center">
              <span className="w-2 h-2 bg-accent-green rounded-full mr-2 animate-pulse"></span>
              {t('agent.persistent_msg')}
            </p>
            {/* Arrow */}
            <div className="absolute top-full right-6 w-3 h-3 bg-white border-r border-b border-primary-blue/10 rotate-45 -translate-y-1.5"></div>
          </motion.div>

          <button
            onClick={onClick}
            className="relative p-5 bg-primary-blue text-white rounded-full shadow-[0_15px_40px_rgba(0,128,187,0.4)] hover:scale-110 active:scale-95 transition-all group overflow-hidden"
          >
            <div className="relative z-10">
              <ShieldCheck size={32} className="group-hover:hidden" />
              <MessageSquare size={32} className="hidden group-hover:block animate-in zoom-in duration-300" />
            </div>

            {/* Glossy Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>

          {/* Hint text on hover for mobile/small desk */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden lg:block">
            <span className="text-xs font-bold text-primary-gray/60 uppercase tracking-tighter bg-white/80 backdrop-blur px-3 py-1 rounded-lg border border-black/5 whitespace-nowrap">
              {t('agent.minimized_hint')}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgentBubble;
