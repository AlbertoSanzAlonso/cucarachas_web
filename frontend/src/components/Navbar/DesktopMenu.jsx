import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const DesktopMenu = ({ menuItems, isScrolled, activeSubmenu, setActiveSubmenu }) => {
  const { t } = useTranslation();

  return (
    <div className="hidden xl:flex items-center space-x-10">
      {menuItems.map((item) => (
        <div 
          key={item.key} 
          className="relative group py-2"
          onMouseEnter={() => item.submenu && setActiveSubmenu(item.key)}
          onMouseLeave={() => setActiveSubmenu(null)}
        >
          <Link 
            to={item.path} 
            className={`text-sm font-semibold uppercase tracking-widest transition-all duration-300 flex items-center space-x-1 ${isScrolled ? 'text-secondary-gray hover:text-primary-blue' : 'text-white/90 hover:text-white'}`}
          >
            <span>{t(item.key)}</span>
            {item.submenu && <ChevronDown size={14} className={`transition-transform duration-300 ${activeSubmenu === item.key ? 'rotate-180' : ''}`} />}
          </Link>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {item.submenu && activeSubmenu === item.key && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-[-20px] pt-4 min-w-[220px]"
              >
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 overflow-hidden">
                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.key}
                      to={sub.path}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-bg-light transition-all group"
                    >
                      <div className="w-1 h-1 bg-accent-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="text-sm font-bold text-primary-gray hover:text-primary-blue transition-colors">
                        {t(sub.key)}
                      </span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default DesktopMenu;
