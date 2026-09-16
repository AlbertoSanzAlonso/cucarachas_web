import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LayoutDashboard,
  Mail,
  Calendar,
  FileText,
  ExternalLink,
  Settings,
  LogOut,
  Users,
  Wrench,
  ContactRound,
  Newspaper,
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  collapsed,
  setCollapsed,
  activeTab,
  setActiveTab,
  handleLogout,
}) => {
  const menuItems = [
    { id: 'ops', icon: <Bot size={20} />, label: 'Assistent' },
    { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'calendar', icon: <Calendar size={20} />, label: 'Agenda' },
    { id: 'clients', icon: <ContactRound size={20} />, label: 'Clients' },
    { id: 'technicians', icon: <Users size={20} />, label: 'Tècnics' },
    { id: 'services', icon: <Wrench size={20} />, label: 'Serveis' },
    { id: 'blog', icon: <Newspaper size={20} />, label: 'Blog' },
    { id: 'presupuestos', icon: <FileText size={20} />, label: 'Pressupostos' },
    { id: 'mail', icon: <Mail size={20} />, label: 'Correu' },
  ];

  const isActive = (id) => {
    if (id === 'clients') return activeTab === 'clients' || activeTab === 'leads';
    return activeTab === id;
  };

  /** Collapse solo en lg+; móvil mantiene drawer completo. */
  const itemClass = (active) =>
    [
      'w-full flex items-center rounded-xl transition-all duration-300',
      'space-x-3 px-4 py-3',
      collapsed && 'lg:space-x-0 lg:justify-center lg:px-0',
      active
        ? 'bg-white/10 text-white font-bold'
        : 'text-white/60 hover:text-white hover:bg-white/5',
    ]
      .filter(Boolean)
      .join(' ');

  const labelClass = [
    'overflow-hidden whitespace-nowrap transition-opacity duration-200',
    collapsed && 'lg:hidden lg:opacity-0 lg:w-0',
  ]
    .filter(Boolean)
    .join(' ');

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

      <aside
        className={[
          'fixed inset-y-0 left-0 w-72 bg-primary-blue text-white flex flex-col shadow-2xl z-50',
          'transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'lg:w-[72px]' : 'lg:w-72',
        ].join(' ')}
      >
        <div
          className={[
            'flex items-center justify-between border-b border-white/10 px-6 py-6',
            collapsed && 'lg:justify-center lg:px-2 lg:py-5',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div
            className={[
              'flex items-center space-x-2 font-black text-2xl tracking-tighter overflow-hidden whitespace-nowrap',
              'transition-opacity duration-200',
              collapsed && 'lg:hidden lg:opacity-0 lg:w-0',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="text-white">
              CEC<span className="text-accent-green">SA</span>
            </span>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded ml-2 font-medium tracking-normal">
              ADMIN
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Tancar menú"
          >
            <X size={24} />
          </button>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white shrink-0"
            aria-label={collapsed ? 'Obrir menú lateral' : 'Plegar menú lateral'}
            title={collapsed ? 'Expandir' : 'Plegar'}
          >
            {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        <nav
          className={[
            'flex-1 py-6 space-y-1 overflow-y-auto px-4',
            collapsed && 'lg:px-2',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              title={item.label}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={itemClass(isActive(item.id))}
            >
              <span className="shrink-0 flex items-center justify-center">{item.icon}</span>
              <span className={labelClass}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div
          className={[
            'border-t border-white/10 space-y-1 py-4 px-4',
            collapsed && 'lg:px-2',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Anar a la web"
            className={itemClass(false)}
          >
            <ExternalLink size={20} className="shrink-0" />
            <span className={labelClass}>Anar a la web</span>
          </a>
          <button type="button" title="Configuració" className={itemClass(false)}>
            <Settings size={20} className="shrink-0" />
            <span className={labelClass}>Configuració</span>
          </button>
          <button
            type="button"
            title="Tancar Sessió"
            onClick={handleLogout}
            className={[
              'w-full flex items-center rounded-xl transition-all duration-300',
              'space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-white/5',
              collapsed && 'lg:space-x-0 lg:justify-center lg:px-0',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <LogOut size={20} className="shrink-0" />
            <span className={labelClass}>Tancar Sessió</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
