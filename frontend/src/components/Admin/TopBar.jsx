import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Bell,
  User as UserIcon,
  LogOut,
  ContactRound,
  Sun,
  Moon,
} from 'lucide-react';
import { normalizeLead, formatLeadDate } from '@/utils/leadDisplay';
import {
  getAdminUserKey,
  getReadLeadIds,
  markLeadAsRead,
  markLeadsAsRead,
} from '@/utils/adminNotifications';

const TopBar = ({ 
  user, 
  leads,
  setSidebarOpen, 
  profileDropdownOpen, 
  setProfileDropdownOpen, 
  setIsProfileModalOpen, 
  setActiveTab,
  onSelectLead,
  onViewAllLeads,
  handleLogout,
  isDark,
  toggleTheme,
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userKey = getAdminUserKey(user);
  const [readLeadIds, setReadLeadIds] = useState(() => getReadLeadIds(userKey));

  useEffect(() => {
    setReadLeadIds(getReadLeadIds(userKey));
  }, [userKey]);

  const unreadLeads = useMemo(() => {
    const normalized = (leads || []).map(normalizeLead).filter(Boolean);
    return normalized
      .filter((lead) => lead.crmStatus === 'lead' && !readLeadIds.has(String(lead.id)))
      .slice(0, 5);
  }, [leads, readLeadIds]);

  const pendingCount = unreadLeads.length;

  const openLead = (leadId) => {
    setReadLeadIds(markLeadAsRead(userKey, leadId, readLeadIds));
    setNotificationsOpen(false);
    onSelectLead(leadId);
  };

  const handleViewAllLeads = () => {
    setReadLeadIds(
      markLeadsAsRead(
        userKey,
        unreadLeads.map((lead) => lead.id),
        readLeadIds,
      ),
    );
    setNotificationsOpen(false);
    onViewAllLeads();
  };

  return (
    <header className="flex justify-between items-center mb-12">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 bg-admin-card rounded-xl shadow-sm border border-admin-border text-primary-blue"
        >
          <LayoutDashboard size={24} />
        </button>
        <div className="hidden md:block">
          <h1 className="text-xl md:text-3xl font-black text-admin-text tracking-tight uppercase">Hola, {user?.name || user?.email || 'Admin'}</h1>
          <p className="text-xs md:text-base text-admin-text-muted font-medium whitespace-nowrap overflow-hidden text-ellipsis">Benvingut al teu panell de control sanitari.</p>
        </div>
      </div>
      <div className="flex items-center space-x-4 md:space-x-6">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-admin-text-muted hover:text-primary-blue transition-colors"
          aria-label={isDark ? 'Canviar a mode dia' : 'Canviar a mode nit'}
          title={isDark ? 'Mode dia' : 'Mode nit'}
        >
          {isDark ? <Sun size={22} /> : <Moon size={22} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-admin-text-muted hover:text-primary-blue transition-colors"
            aria-label="Notificacions"
          >
            <Bell size={24} />
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-admin-page" />
            )}
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-4 z-20 w-80 max-w-[calc(100vw-2rem)] right-0 max-md:-right-20 bg-admin-card rounded-[2rem] shadow-2xl border border-admin-border p-4"
                >
                  <div className="p-3 border-b border-admin-border mb-2 flex justify-between items-center">
                    <p className="font-black text-admin-text uppercase tracking-tight text-sm">Notificacions</p>
                    {pendingCount > 0 && (
                      <span className="text-[10px] font-black px-2 py-1 rounded-full bg-red-100 text-red-600">
                        {pendingCount}
                      </span>
                    )}
                  </div>

                  {pendingCount === 0 ? (
                    <p className="text-sm text-admin-text-muted font-medium px-3 py-6 text-center">
                      No hi ha notificacions noves.
                    </p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {unreadLeads.map((lead) => (
                        <button
                          key={lead.id}
                          onClick={() => openLead(lead.id)}
                          className="w-full flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-primary-blue/5 transition-all text-left"
                        >
                          <div className="p-2 bg-primary-blue/10 rounded-xl text-primary-blue shrink-0">
                            <ContactRound size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-admin-text truncate">{lead.name}</p>
                            <p className="text-[10px] text-admin-text-muted truncate">{lead.email}</p>
                            <p className="text-[10px] text-admin-text-muted mt-0.5">{formatLeadDate(lead.createdAt)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {pendingCount > 0 && (
                    <button
                      onClick={handleViewAllLeads}
                      className="w-full mt-2 px-4 py-3 text-primary-blue font-bold text-sm hover:bg-primary-blue/5 rounded-xl transition-all"
                    >
                      Veure tots els clients
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="relative flex items-center space-x-3 pl-4 md:pl-6 border-l border-admin-border">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-admin-text">{user?.name || user?.email}</p>
            <p className="text-[10px] text-accent-green font-bold uppercase tracking-widest">{user?.role || 'Administrador'}</p>
          </div>
          
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="w-12 h-12 rounded-2xl bg-primary-blue flex items-center justify-center text-white font-black text-lg shadow-lg uppercase shrink-0 hover:scale-105 active:scale-95 transition-all outline-none"
          >
            {(user?.name || user?.email || 'AD').substring(0, 2)}
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
                  className="absolute right-0 top-full mt-4 w-64 bg-admin-card rounded-[2rem] shadow-2xl border border-admin-border p-4 z-20"
                >
                  <div className="p-4 border-b border-admin-border mb-2">
                    <p className="font-black text-admin-text uppercase tracking-tight">{user?.name || user?.email}</p>
                    <p className="text-[10px] text-admin-text-muted font-bold uppercase tracking-widest">{user?.email}</p>
                  </div>
                  <button 
                    onClick={() => { setIsProfileModalOpen(true); setProfileDropdownOpen(false); }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-admin-text-muted hover:text-primary-blue hover:bg-primary-blue/5 transition-all rounded-xl font-bold text-sm"
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
