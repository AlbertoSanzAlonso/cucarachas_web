import React from 'react';
import { motion } from 'framer-motion';
import { Bug } from 'lucide-react';

const NavBackground = ({ isScrolled }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: isScrolled ? 0 : 1 }}
      transition={{ duration: 2, delay: 1 }}
      className="absolute inset-0 pointer-events-none select-none transition-opacity duration-700"
    >
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div 
            key={i} 
            className="absolute text-white"
            initial={{ opacity: 0 }}
            animate={{
              x: [0, i % 2 === 0 ? 30 : -30, 0],
              y: [0, i % 3 === 0 ? -15 : 15, 0],
              scale: [0.8, 1, 0.8],
              opacity: [0, 0.1, 0.1, 0.1, 0]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1 + (i % 5) * 2,
              times: [0, 0.1, 0.5, 0.9, 1]
            }}
            style={{
              top: `${(i * 15) % 100}%`,
              left: `${(i * 27) % 100}%`,
              scale: 0.4 + Math.random(),
            }}
          >
            <Bug size={25 + (i * 5)} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default NavBackground;
