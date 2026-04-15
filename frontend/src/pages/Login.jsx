import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      navigate('/admin');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20px_20px,var(--color-primary-blue)_1px,transparent_0)] bg-[length:40px_40px]"></div>
      </div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-blue/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-green/5 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-primary-blue/10 p-12 border border-white relative z-10">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center space-x-2 font-black text-3xl tracking-tighter text-primary-blue mb-2">
              <span>CEC</span><span className="text-accent-green">SA</span>
            </div>
            <p className="text-primary-gray/40 text-xs font-bold uppercase tracking-[0.2em]">Sistema de Control Sanitari</p>
          </div>

          <h1 className="text-2xl font-black text-primary-gray mb-8 text-center">Accés Professional</h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40 ml-4">Correu Electrònic</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary-gray/20 group-focus-within:text-primary-blue transition-colors">
                  <User size={20} />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-primary-gray font-medium focus:ring-2 focus:ring-primary-blue/20 transition-all outline-none"
                  placeholder="admin@cecsa.cat"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40 ml-4">Contrasenya</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary-gray/20 group-focus-within:text-primary-blue transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-12 text-primary-gray font-medium focus:ring-2 focus:ring-primary-blue/20 transition-all outline-none"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-primary-gray/20 hover:text-primary-blue transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pr-2">
              <a href="#" className="text-[10px] font-bold text-primary-blue hover:underline uppercase tracking-widest">He oblidat la contrasenya</a>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-blue text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 group relative overflow-hidden"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>ACCEDIR AL PANELL</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-center space-x-3 opacity-40">
            <ShieldCheck size={20} className="text-accent-green" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Sessió Protegida per CECSA-Security</p>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-primary-gray/40">
          &copy; 2026 CECSA Control de Plagues S.L. · Barcelona
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
