import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { candidateLogin } from './service/api';
import { toast } from 'sonner';

const BackgroundAnimation = () => (
  <div className="absolute inset-0 z-0 overflow-hidden">
    <div className="absolute inset-0 bg-slate-950" />
    <div 
      className="absolute inset-0 opacity-20" 
      style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}
    />
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-blue-500/10 blur-[100px]"
        initial={{ 
          x: Math.random() * 100 + '%', 
          y: Math.random() * 100 + '%',
          scale: 0.5 + Math.random()
        }}
        animate={{
          x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
          y: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
        }}
        transition={{
          duration: 15 + i * 5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear"
        }}
        style={{ width: '400px', height: '400px' }}
      />
    ))}
  </div>
);

const CandidateLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Pass the identifier as both email and username to the backend
      const res = await candidateLogin({ 
        email: identifier, 
        username: identifier, 
        password 
      });
      if (res.success) {
        toast.success(`Welcome back, ${res.data.name}!`);
        // Store user info if needed (already handled by common layout usually but good to be sure)
        localStorage.setItem('token', res.token);
        localStorage.setItem('userType', 'candidate');
        localStorage.setItem('userName', res.data.name);
        
        navigate('/candidate-dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-slate-950 font-jakarta selection:bg-blue-500/30">
      <BackgroundAnimation />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="bg-slate-900/40 backdrop-blur-2xl p-10 rounded-[40px] border border-white/5 shadow-2xl">
          <div className="text-center mb-10">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FiLock className="text-white text-2xl" />
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-3">Portal Login</h1>
              <p className="text-slate-400 font-medium">Enter your email or username</p>
            </motion.div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-4 pointer-events-none uppercase tracking-widest opacity-60">Email or Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <FiMail size={18} />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Email or Username"
                  className="w-full bg-slate-800/50 border border-white/5 text-white pl-12 pr-5 py-4 rounded-3xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-4 pointer-events-none uppercase tracking-widest opacity-60">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <FiLock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border border-white/5 text-white pl-12 pr-14 py-4 rounded-3xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-5 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-3xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 text-sm font-medium">
              Need help? Contact our HR team at{' '}
              <a href="mailto:hr@mabicons.com" className="text-blue-400 hover:text-blue-300 transition-colors">hr@mabicons.com</a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CandidateLogin;
