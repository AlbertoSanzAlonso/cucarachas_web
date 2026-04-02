import { Phone, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const FloatingCTA = () => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '28px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Phone button — primary call */}
      <motion.a
        href="tel:933309169"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.9 }}
        title="Llamar ahora"
        aria-label="Llamar a CECSA"
        style={{
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: '#0080bb',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,128,187,0.45)',
          textDecoration: 'none',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Ping ring */}
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid rgba(0,128,187,0.35)',
            animation: 'ping 1.8s cubic-bezier(0,0,0.2,1) infinite',
          }}
        />
        <Phone size={24} style={{ position: 'relative', zIndex: 1 }} />
      </motion.a>

      {/* Message / contact button */}
      <motion.a
        href="#contacto"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.9 }}
        title="Solicitar presupuesto"
        aria-label="Solicitar presupuesto"
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: '#34d399',
          color: '#064e3b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 28px rgba(52,211,153,0.40)',
          textDecoration: 'none',
        }}
      >
        <MessageSquare size={22} />
      </motion.a>

      {/* Keyframe for ping — injected once */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default FloatingCTA;
