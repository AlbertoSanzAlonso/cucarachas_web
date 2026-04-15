import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const stats = [
    { title: 'Tractaments Actius', value: '42', icon: <Activity className="text-accent-green" />, trend: '+12%' },
    { title: 'Leads Pendents', value: '18', icon: <MessageSquare className="text-primary-blue" />, trend: '+5' },
    { title: 'Eficiència Control', value: '98.4%', icon: <Shield className="text-accent-green" />, trend: 'Óptim' },
    { title: 'Equips en Ruta', value: '6', icon: <TrendingUp className="text-primary-blue" />, trend: 'Full' },
  ];

  const recentLeads = [
    { id: 1, name: 'Restaurant El Port', type: 'Cucaracha Alemana', status: 'Inspecionando', time: 'hace 2h' },
    { id: 2, name: 'Comunitat Carrer Balmes', type: 'Cucaracha Americana', status: 'Pendiente', time: 'hace 5h' },
    { id: 3, name: 'Forn de Pa Sant Antoni', type: 'Control Preventivo', status: 'Completado', time: 'ayer' },
    { id: 4, name: 'Apartament Eixample', type: 'Banda Café', status: 'Urgente', time: 'ayer' },
  ];

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
            { id: 'species', icon: <Bug size={20} />, label: 'Espècies' },
            { id: 'leads', icon: <MessageSquare size={20} />, label: 'Leads' },
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
            onClick={() => navigate('/login')}
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
              <h1 className="text-3xl font-black text-primary-gray tracking-tight">Hola, Alberto</h1>
              <p className="text-primary-gray/50 font-medium">Benvingut al teu panell de control sanitari.</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-primary-gray/40 hover:text-primary-blue transition-colors">
              <Bell size={24} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f8fafc]"></span>
            </button>
            <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-bold text-primary-gray">Admin User</p>
                <p className="text-[10px] text-accent-green font-bold uppercase tracking-widest">Director Tècnic</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary-blue flex items-center justify-center text-white font-black text-lg shadow-lg">
                AS
              </div>
            </div>
          </div>
        </header>

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
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <p className="font-bold text-primary-gray">{lead.name}</p>
                        <p className="text-[10px] text-primary-gray/40">{lead.time}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm text-primary-gray/70 font-medium">{lead.type}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                          lead.status === 'Urgente' ? 'bg-red-100 text-red-600' : 
                          lead.status === 'Pendiente' ? 'bg-orange-100 text-orange-600' :
                          lead.status === 'Completado' ? 'bg-green-100 text-green-600' :
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
              {[1, 2, 3].map(i => (
                <div key={i} className="flex space-x-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-accent-green shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                  <div>
                    <p className="text-sm font-bold text-primary-gray">CECSA-Van-0{i} a zona Eixample</p>
                    <p className="text-xs text-primary-gray/40">Inici de servei preventiu en restauració.</p>
                    <p className="text-[10px] font-black text-primary-blue mt-2 uppercase tracking-widest">Actiu ara</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4">
              <div className="bg-primary-blue rounded-[2rem] p-6 text-white text-center">
                <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Resum de la setmana</p>
                <p className="text-2xl font-black tracking-tight">+144.5% eficiencia</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
