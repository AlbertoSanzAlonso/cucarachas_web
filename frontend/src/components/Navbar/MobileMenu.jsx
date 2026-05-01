import React from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import Button from '@/components/ui/Button';

const MobileMenu = ({ 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  menuItems, 
  mobileExpanded, 
  setMobileExpanded, 
  changeLanguage,
  i18n
}) => {
  const { t } = useTranslation();

  return (
    <div 
      className={`xl:hidden fixed inset-x-0 mx-auto w-[92%] bg-white transition-all duration-500 rounded-3xl overflow-hidden z-[9999] 
        ${mobileMenuOpen 
          ? 'top-[108px] max-h-screen shadow-2xl pb-10 border border-gray-100 opacity-100 [@media(max-height:600px)_and_(orientation:landscape)]:top-0 [@media(max-height:600px)_and_(orientation:landscape)]:w-full [@media(max-height:600px)_and_(orientation:landscape)]:h-full [@media(max-height:600px)_and_(orientation:landscape)]:max-h-none [@media(max-height:600px)_and_(orientation:landscape)]:rounded-none [@media(max-height:600px)_and_(orientation:landscape)]:overflow-y-auto [@media(max-height:600px)_and_(orientation:landscape)]:overscroll-contain' 
          : 'top-[108px] max-h-0 opacity-0 pointer-events-none [@media(max-height:600px)_and_(orientation:landscape)]:opacity-0 [@media(max-height:600px)_and_(orientation:landscape)]:pointer-events-none'}`}
    >
      {/* Mobile Landscape Close Button */}
      <button 
        className="hidden [@media(max-height:600px)_and_(orientation:landscape)]:flex absolute top-6 right-8 p-3 rounded-full bg-primary-blue/5 text-primary-blue hover:bg-primary-blue/10 transition-colors z-[210] shadow-sm"
        onClick={() => setMobileMenuOpen(false)}
      >
        <X size={24} />
      </button>
      <div className="flex flex-col p-6 space-y-4 [@media(max-height:600px)_and_(orientation:landscape)]:pt-20">
        {menuItems.map((item) => (
          <div key={item.key} className="border-b border-gray-50 last:border-0">
            <div className="flex items-center justify-between py-4">
              <Link 
                to={item.path} 
                onClick={() => setMobileMenuOpen(false)}
                className="text-xl font-bold text-primary-gray uppercase tracking-tighter"
              >
                {t(item.key)}
              </Link>
              {item.submenu && (
                <button 
                  onClick={() => setMobileExpanded(mobileExpanded === item.key ? null : item.key)}
                  className="p-2 text-primary-blue"
                >
                  <ChevronDown className={`transition-transform duration-300 ${mobileExpanded === item.key ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
            
            <AnimatePresence>
              {item.submenu && mobileExpanded === item.key && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden pl-4 pb-4 space-y-3"
                >
                  {item.submenu.map((sub) => (
                    <Link 
                      key={sub.key}
                      to={sub.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-lg font-medium text-secondary-gray/80 italic border-l-2 border-accent-green/30 pl-4 py-1"
                    >
                      {t(sub.key)}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        <div className="pt-4 flex items-center space-x-6">
          <button 
            onClick={() => { changeLanguage('ca'); }} 
            className={`font-bold text-lg ${i18n.language === 'ca' ? 'text-accent-green' : 'text-primary-blue'}`}
          >
            CA
          </button>
          <button 
            onClick={() => { changeLanguage('es'); }} 
            className={`font-bold text-lg ${i18n.language === 'es' ? 'text-accent-green' : 'text-primary-blue'}`}
          >
            ES
          </button>
        </div>
        <Button 
          variant="primary"
          className="w-full py-4 rounded-xl text-lg"
        >
          {t('nav.contact')}
        </Button>
      </div>
    </div>
  );
};


export default MobileMenu;
