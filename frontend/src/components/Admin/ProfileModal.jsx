import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, User as UserIcon, Key, Check, ArrowRight } from 'lucide-react';

const ProfileModal = ({ 
  isOpen, 
  onClose, 
  user, 
  profileData, 
  setProfileData, 
  handleUpdateProfile, 
  isUpdating, 
  updateSuccess 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                    onClick={onClose}
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
  );
};

export default ProfileModal;
