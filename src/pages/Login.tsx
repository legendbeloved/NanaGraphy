import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Lock, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { isAdminUser } from '../services/supabaseAdmin';
import { storage } from '../services/storageService';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        setSuccessMessage('Account created! Please manually assign the admin role in your Supabase Dashboard before logging in.');
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        const user = data.user;
        if (!isAdminUser(user)) {
          await supabase.auth.signOut();
          setErrorMessage('This account is not authorized to access the admin dashboard.');
          return;
        }

        storage.login();
        navigate('/admin', { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (isSignUp ? 'Sign up failed.' : 'Login failed.'));
    } finally {
      setIsLoading(false);
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
          <h1 className="text-4xl font-display">{isSignUp ? 'Create Admin' : 'Admin Portal'}</h1>
          <p className="text-sm font-light opacity-60 uppercase tracking-widest">NanaGraphy Management</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {errorMessage ? (
            <div className="px-6 py-4 bg-red-500/10 text-red-600 rounded-2xl text-sm">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="px-6 py-4 bg-emerald-500/10 text-emerald-600 rounded-2xl text-sm">
              {successMessage}
            </div>
          ) : null}

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
            disabled={isLoading}
            className="w-full py-4 bg-ink text-cream rounded-full font-medium hover:scale-105 transition-transform shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            <span>{isLoading ? (isSignUp ? 'Signing Up...' : 'Signing In...') : (isSignUp ? 'Sign Up' : 'Sign In')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center space-y-4">
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setErrorMessage(null); setSuccessMessage(null); }}
            className="text-xs opacity-70 hover:opacity-100 transition-opacity"
            type="button"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an admin account? Sign Up'}
          </button>
          
          <div className="pt-2">
            <button 
              onClick={() => navigate('/')}
              className="text-xs opacity-50 hover:opacity-100 transition-opacity uppercase tracking-widest"
              type="button"
            >
              Return to Site
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
