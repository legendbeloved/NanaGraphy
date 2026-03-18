import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Lock, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storageService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock auth
    if (email === 'admin@nanagraphy.com' && password === 'admin') {
      storage.login();
      navigate('/admin');
    } else {
      alert('Invalid credentials. Use admin@nanagraphy.com / admin');
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center bg-sand/10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass dark:glass-dark p-12 rounded-[3rem] shadow-2xl space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-ink text-cream rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Camera className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-display">Admin Portal</h1>
          <p className="text-sm font-light opacity-60 uppercase tracking-widest">NanaGraphy Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nanagraphy.com"
                className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-ink text-cream rounded-full font-medium hover:scale-105 transition-transform shadow-xl flex items-center justify-center space-x-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-xs opacity-50 hover:opacity-100 transition-opacity uppercase tracking-widest"
          >
            Return to Site
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
