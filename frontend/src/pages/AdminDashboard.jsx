import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Bug, 
  TrendingUp, 
  Calendar, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  MessageSquare, 
  ChevronRight,
  Shield,
  Activity,
  Bell,
  X,
  Mail,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetLeadsQuery } from '../store/apis/leadsApi';
import { logout } from '../store/slices/authSlice';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Hook up to real data from Redux
  const { data: leads, isLoading, isError } = useGetLeadsQuery();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const stats = [
    { title: 'Tractaments Actius', value: '--', icon: <Activity className="text-accent-green" />, trend: '...' },
    { title: 'Leads Pendents', value: leads?.length || '0', icon: <MessageSquare className="text-primary-blue" />, trend: 'Actual' },
    { title: 'Eficiència Control', value: '--', icon: <Shield className="text-accent-green" />, trend: '...' },
    { title: 'Equips en Ruta', value: '--', icon: <TrendingUp className="text-primary-blue" />, trend: '...' },
  ];

  const recentLeads = [];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
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

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-primary-blue text-white flex flex-col shadow-2xl z-50 transition-transform duration-500 lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 pb-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 font-black text-2xl tracking-tighter">
            <span className="text-white">CEC</span><span className="text-accent-green">SA</span>
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
          {[
            { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
            { id: 'leads', icon: <MessageSquare size={20} />, label: 'Leads' },
            { id: 'mail', icon: <Mail size={20} />, label: 'Correu' },
            { id: 'calendar', icon: <Calendar size={20} />, label: 'Agenda' },
          ].map((item) => (
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-primary-blue"
            >
              <LayoutDashboard size={24} />
            </button>
            <div className="hidden md:block">
              <h1 className="text-3xl font-black text-primary-gray tracking-tight tracking-tight uppercase">Hola, {user?.name || 'Marc'}</h1>
              <p className="text-primary-gray/50 font-medium">Benvingut al teu panell de control sanitari de CECSA.</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-primary-gray/40 hover:text-primary-blue transition-colors">
              <Bell size={24} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f8fafc]"></span>
            </button>
            <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-bold text-primary-gray">{user?.name || 'Marc'}</p>
                <p className="text-[10px] text-accent-green font-bold uppercase tracking-widest">{user?.role || 'Director Tècnic'}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary-blue flex items-center justify-center text-white font-black text-lg shadow-lg uppercase">
                {user?.name?.substring(0,2) || 'AS'}
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'overview' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              {stats.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-primary-blue/5 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-primary-blue/5 transition-colors">
                      {item.icon}
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${item.trend.includes('+') ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {item.trend}
                    </span>
                  </div>
                  <p className="text-primary-gray/40 text-sm font-bold uppercase tracking-widest mb-1">{item.title}</p>
                  <p className="text-4xl font-black text-primary-gray tracking-tighter">{item.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Two Column Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Leads */}
              <section className="lg:col-span-2 bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                  <h2 className="text-xl font-black text-primary-gray uppercase tracking-tight">Leads Recents</h2>
                  <button className="text-primary-blue font-bold text-sm hover:underline">Veure tots</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest">Client</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest">Plaga / Servei</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest">Estat</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest">Accions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {isLoading ? (
                        <tr><td colSpan="4" className="text-center py-10 text-primary-gray/40 font-bold uppercase tracking-widest animate-pulse">Carregant dades sanitàries...</td></tr>
                      ) : isError ? (
                        <tr><td colSpan="4" className="text-center py-10 text-red-500 font-bold">Error al connectar amb el sistema de control.</td></tr>
                      ) : leads?.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-10 text-primary-gray/40">No hi ha leads pendents.</td></tr>
                      ) : leads?.slice(0, 4).map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-8 py-5">
                            <p className="font-bold text-primary-gray">{lead.name}</p>
                            <p className="text-[10px] text-primary-gray/40">{lead.created_at || 'Recient'}</p>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-sm text-primary-gray/70 font-medium">{lead.pest_type || lead.type}</span>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                              lead.status === 'Urgente' || lead.status === 'urgent' ? 'bg-red-100 text-red-600' : 
                              lead.status === 'Pendiente' || lead.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                              lead.status === 'Completado' || lead.status === 'completed' ? 'bg-green-100 text-green-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <button className="p-2 hover:bg-primary-blue/5 rounded-xl text-primary-blue transition-colors">
                              <ChevronRight size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Activity Feed */}
              <section className="bg-white rounded-[3rem] shadow-sm border border-gray-100 flex flex-col">
                <div className="p-8 border-b border-gray-50">
                  <h2 className="text-xl font-black text-primary-gray uppercase tracking-tight">Activitat Flota</h2>
                </div>
                <div className="p-8 space-y-8 flex-1">
                   <div className="flex flex-col items-center justify-center h-full text-center opacity-30 py-10">
                      <TrendingUp size={32} className="mb-4" />
                      <p className="text-xs font-bold uppercase tracking-widest">Sense activitat de flota registrada</p>
                   </div>
                </div>
                <div className="p-4">
                  <div className="bg-primary-blue rounded-[2rem] p-6 text-white text-center">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Resum de la setmana</p>
                    <p className="text-2xl font-black tracking-tight">+144.5% eficiencia</p>
                  </div>
                </div>
              </section>
            </div>
          </>
        ) : activeTab === 'mail' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[calc(100vh-200px)] flex flex-col"
          >
            <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col flex-1 items-center justify-center text-center p-12">
               <div className="w-24 h-24 bg-primary-blue/5 rounded-full flex items-center justify-center mb-8">
                  <Mail size={48} className="text-primary-blue" />
               </div>
               
               <h2 className="text-3xl font-black text-primary-gray mb-4 uppercase tracking-tighter">Accés Segur al Webmail</h2>
               
               <p className="text-primary-gray/50 max-w-md mx-auto mb-10 leading-relaxed font-medium">
                 Per protocols de seguretat del servidor de correu de **DonDominio**, l'accés s'ha de realitzar en una finestra independent protegida.
               </p>

               <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl mb-12">
                  <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex items-start space-x-4">
                     <div className="p-3 bg-white rounded-xl text-accent-green shadow-sm">
                        <Shield size={20} />
                     </div>
                     <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary-gray/30 mb-1">Seguretat</p>
                        <p className="text-xs font-bold text-primary-gray">Sessió encriptada SSL/TLS amb el domini cecsa.cat</p>
                     </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex items-start space-x-4">
                     <div className="p-3 bg-white rounded-xl text-primary-blue shadow-sm">
                        <Activity size={20} />
                     </div>
                     <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary-gray/30 mb-1">Estat</p>
                        <p className="text-xs font-bold text-primary-gray">Servidor actiu i optimitzat per a gestió massiva</p>
                     </div>
                  </div>
               </div>

               <a 
                href="https://webmail.dondominio.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-4 bg-primary-blue text-white px-12 py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary-blue/30 hover:scale-105 active:scale-95 transition-all group"
               >
                 <span>OBRIR CORREU CORPORATIU</span>
                 <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
               </a>

               <div className="mt-12 flex items-center space-x-4 opacity-20">
                  <img src="/public/assets/isotipo.png" alt="CECSA" className="h-6 filter grayscale" />
                  <div className="h-4 w-[1px] bg-primary-gray"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol de Comunicació CECSA</p>
               </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-6 bg-gray-100 rounded-full mb-6">
               <LayoutDashboard size={48} className="text-primary-gray/20" />
            </div>
            <h2 className="text-2xl font-black text-primary-gray uppercase tracking-tight">Secció en Desenvolupament</h2>
            <p className="text-primary-gray/40 font-medium">Estem treballant en el protocol d'aquesta secció.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
