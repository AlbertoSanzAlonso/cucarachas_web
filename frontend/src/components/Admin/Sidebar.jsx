import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  LayoutDashboard, 
  MessageSquare, 
  Mail, 
  Calendar, 
  ExternalLink, 
  Settings, 
  LogOut 
} from 'lucide-react';

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  activeTab, 
  setActiveTab, 
  handleLogout 
}) => {
  const menuItems = [
    { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'calendar', icon: <Calendar size={20} />, label: 'Agenda' },
    { id: 'leads', icon: <MessageSquare size={20} />, label: 'Leads' },
    { id: 'mail', icon: <Mail size={20} />, label: 'Correu' },
  ];

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-primary-blue/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-primary-blue text-white flex flex-col shadow-2xl z-50 transition-transform duration-500 lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 pb-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 font-black text-2xl tracking-tighter">
            <span className="text-white">CEC<span className="text-accent-green">SA</span></span>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded ml-2 font-medium tracking-normal">ADMIN</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {menuItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-white/10 text-white font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <a 
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center space-x-3 px-4 py-3 text-white/60 hover:text-white transition-all rounded-xl cursor-pointer"
          >
            <ExternalLink size={20} />
            <span>Anar a la web</span>
          </a>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-white/60 hover:text-white transition-all rounded-xl">
            <Settings size={20} />
            <span>Configuració</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 transition-all rounded-xl"
          >
            <LogOut size={20} />
            <span>Tancar Sessió</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
