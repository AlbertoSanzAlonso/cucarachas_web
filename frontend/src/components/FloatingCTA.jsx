import { Phone, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const FloatingCTA = () => {
  return (
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col gap-5">
      <motion.a 
        href="tel:933309169" 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className="bg-primary-blue text-white w-16 h-16 rounded-full shadow-[0_20px_50px_rgba(0,128,187,0.3)] flex items-center justify-center relative overflow-hidden group"
        title="Llamar ahora…"
      >
        <span className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform rounded-full"></span>
        <Phone size={28} className="relative z-10" />
        <span className="absolute w-full h-full rounded-full border-4 border-primary-blue/30 animate-ping"></span>
      </motion.a>

      <motion.a 
        href="#contacto" 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className="bg-white text-bg-dark w-16 h-16 rounded-full shadow-2xl flex items-center justify-center group overflow-hidden border border-white/10"
        title="Pedir Presupuesto…"
      >
        <MessageSquare size={28} />
      </motion.a>
    </div>
  );
};

export default FloatingCTA;
