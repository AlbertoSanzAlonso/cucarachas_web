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
  ArrowRight,
  ExternalLink,
  User as UserIcon,
  Camera,
  Key,
  Check
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetLeadsQuery } from '../store/apis/leadsApi';
import { logout, setCredentials } from '../store/slices/authSlice';
import { insforge } from '../lib/insforge';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    password: '',
    confirmPassword: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Hook up to real data from Redux
  const { data: leads, isLoading, isError } = useGetLeadsQuery();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // Update Auth Password if provided
      if (profileData.password) {
        if (profileData.password !== profileData.confirmPassword) {
          alert("Las contraseñas no coinciden");
          return;
        }
        await insforge.auth.updateUser({ password: profileData.password });
      }

      // Update Profile Name in DB
      const { error } = await insforge.database
        .from('profiles')
        .update({ name: profileData.name })
        .eq('id', user.id);

      if (error) throw error;

      // Update Redux state
      dispatch(setCredentials({
        user: { ...user, name: profileData.name },
        token
      }));

      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
        setIsProfileModalOpen(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el perfil");
    } finally {
      setIsUpdating(false);
    }
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
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

        {activeTab === 'overview' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-8 md:mb-12">
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
                  <p className="text-primary-gray/40 text-[10px] md:text-sm font-bold uppercase tracking-widest mb-1">{item.title}</p>
                  <p className="text-2xl md:text-4xl font-black text-primary-gray tracking-tighter">{item.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Two Column Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Leads */}
              <section className="lg:col-span-2 bg-white rounded-3xl md:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center">
                  <h2 className="text-lg md:text-xl font-black text-primary-gray uppercase tracking-tight">Leads Recents</h2>
                  <button className="text-primary-blue font-bold text-xs md:text-sm hover:underline">Veure tots</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-4 md:px-8 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest">Client</th>
                        <th className="hidden md:table-cell px-8 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest">Plaga</th>
                        <th className="px-4 md:px-8 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest text-center">Estat</th>
                        <th className="px-4 md:px-8 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest"></th>
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
                          <td className="px-4 md:px-8 py-5">
                            <p className="font-bold text-sm md:text-base text-primary-gray leading-none mb-1">{lead.name}</p>
                            <p className="text-[10px] text-primary-gray/40">{lead.created_at || 'Recient'}</p>
                          </td>
                          <td className="hidden md:table-cell px-8 py-5">
                            <span className="text-sm text-primary-gray/70 font-medium">{lead.pest_type || lead.type}</span>
                          </td>
                          <td className="px-4 md:px-8 py-5 text-center">
                            <span className={`text-[9px] md:text-[10px] font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-widest ${
                              lead.status === 'Urgente' || lead.status === 'urgent' ? 'bg-red-100 text-red-600' : 
                              lead.status === 'Pendiente' || lead.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                              lead.status === 'Completado' || lead.status === 'completed' ? 'bg-green-100 text-green-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-4 md:px-8 py-5 text-right">
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
              <section className="bg-white rounded-3xl md:rounded-[3rem] shadow-sm border border-gray-100 flex flex-col">
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
                  <img src="/assets/isotipo.png" alt="CECSA" className="h-6 filter grayscale" />
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

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-primary-gray/20 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="relative w-full max-w-xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden"
            >
               <div className="p-8 md:p-12">
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <h2 className="text-3xl font-black text-primary-gray uppercase tracking-tighter leading-none">Editar Perfil</h2>
                      <p className="text-primary-gray/40 font-bold text-[10px] uppercase tracking-widest mt-2">{user?.role}</p>
                    </div>
                    <button 
                      onClick={() => setIsProfileModalOpen(false)}
                      className="p-3 bg-gray-50 rounded-2xl text-primary-gray/30 hover:text-red-500 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    {/* Avatar Upload Placeholder */}
                    <div className="flex items-center space-x-8 pb-4">
                       <div className="w-24 h-24 rounded-[2rem] bg-primary-blue flex items-center justify-center text-white text-3xl font-black shadow-xl relative group overflow-hidden">
                          {user?.name?.substring(0,2)}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                             <Camera size={24} className="text-white" />
                          </div>
                       </div>
                       <div>
                          <p className="text-sm font-bold text-primary-gray">Foto de perfil</p>
                          <p className="text-xs text-primary-gray/40">S'utilitza per identificar-te en el sistema.</p>
                       </div>
                    </div>

                    <div className="grid md:grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40 ml-4">Nom Complet</label>
                        <div className="relative">
                          <UserIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-gray/20" />
                          <input 
                            type="text" 
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-blue/20 outline-none font-bold text-primary-gray transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-50">
                      <p className="text-xs font-black uppercase tracking-widest text-primary-gray/20">Canviar Contrasenya</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative">
                          <Key size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-gray/20" />
                          <input 
                            type="password" 
                            placeholder="Nova contrasenya"
                            value={profileData.password}
                            onChange={(e) => setProfileData({...profileData, password: e.target.value})}
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-blue/20 outline-none font-bold text-primary-gray text-sm transition-all"
                          />
                        </div>
                        <div className="relative">
                          <Key size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-gray/20" />
                          <input 
                            type="password" 
                            placeholder="Repetir contrasenya"
                            value={profileData.confirmPassword}
                            onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-blue/20 outline-none font-bold text-primary-gray text-sm transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button 
                        type="submit" 
                        disabled={isUpdating}
                        className={`w-full py-5 rounded-2xl ${updateSuccess ? 'bg-accent-green' : 'bg-primary-blue'} text-white font-black text-lg tracking-widest shadow-2xl shadow-primary-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3`}
                      >
                        {isUpdating ? (
                          <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : updateSuccess ? (
                          <>
                            <span>PERFIL ACTUALITZAT</span>
                            <Check size={20} />
                          </>
                        ) : (
                          <>
                            <span>GUARDAR CANVIS</span>
                            <ArrowRight size={20} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
