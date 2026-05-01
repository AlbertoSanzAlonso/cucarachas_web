import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Bell, User as UserIcon, LogOut } from 'lucide-react';

const TopBar = ({ 
  user, 
  setSidebarOpen, 
  profileDropdownOpen, 
  setProfileDropdownOpen, 
  setIsProfileModalOpen, 
  handleLogout 
}) => {
  return (
    <header className="flex justify-between items-center mb-12">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-primary-blue"
        >
          <LayoutDashboard size={24} />
        </button>
        <div className="hidden md:block">
          <h1 className="text-xl md:text-3xl font-black text-primary-gray tracking-tight uppercase">Hola, {user?.name || 'Marc'}</h1>
          <p className="text-xs md:text-base text-primary-gray/50 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Benvingut al teu panell de control sanitari.</p>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <button className="relative p-2 text-primary-gray/40 hover:text-primary-blue transition-colors">
          <Bell size={24} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f8fafc]"></span>
        </button>
        <div className="relative flex items-center space-x-3 pl-6 border-l border-gray-200">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-primary-gray">{user?.name || 'Marc'}</p>
            <p className="text-[10px] text-accent-green font-bold uppercase tracking-widest">{user?.role || 'Director Tècnic'}</p>
          </div>
          
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="w-12 h-12 rounded-2xl bg-primary-blue flex items-center justify-center text-white font-black text-lg shadow-lg uppercase shrink-0 hover:scale-105 active:scale-95 transition-all outline-none"
          >
            {user?.name?.substring(0,2) || 'AS'}
          </button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {profileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-4 w-64 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-4 z-20"
                >
                  <div className="p-4 border-b border-gray-50 mb-2">
                    <p className="font-black text-primary-gray uppercase tracking-tight">{user?.name}</p>
                    <p className="text-[10px] text-primary-gray/40 font-bold uppercase tracking-widest">{user?.email}</p>
                  </div>
                  <button 
                    onClick={() => { setIsProfileModalOpen(true); setProfileDropdownOpen(false); }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-primary-gray/70 hover:text-primary-blue hover:bg-primary-blue/5 transition-all rounded-xl font-bold text-sm"
                  >
                    <UserIcon size={18} />
                    <span>Editar Perfil</span>
                  </button>
                  <button 
                     onClick={handleLogout}
                     className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-all rounded-xl font-bold text-sm"
                  >
                    <LogOut size={18} />
                    <span>Tancar Sessió</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
