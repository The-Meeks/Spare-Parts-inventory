import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from '../components/UI';
import { TrendingUp, ShieldCheck, Zap, PackageSearch, Mail, Lock, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Login: React.FC = () => {
  const { signIn, signInWithEmail, signUp } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        if (!formData.name) throw new Error("Name is required");
        await signUp(formData.email, formData.password, formData.name);
      } else {
        await signInWithEmail(formData.email, formData.password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Illustration & Text */}
        <div className="hidden lg:block space-y-12 pr-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
              <TrendingUp size={32} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Pasbest Ventures</h1>
          </div>
          
          <div className="space-y-8">
            <h2 className="text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Manage your <span className="text-indigo-600">inventory</span> like a pro.
            </h2>
            <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
              The all-in-one system for tracking stock levels, monitoring sales, and calculating profits in real-time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-indigo-600">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Real-time Data</h4>
                <p className="text-sm text-slate-500">Every sale updates your stock instantly across all devices.</p>
              </div>
            </div>
            <div className="flex gap-4">
               <div className="w-10 h-10 shrink-0 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-indigo-600">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Secure Access</h4>
                <p className="text-sm text-slate-500">Role-based permissions keep your sensitive data protected.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-8 md:p-12 border border-slate-100 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <PackageSearch size={180} />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
              Secure portal
            </div>
            
            <h3 className="text-3xl font-black text-slate-900 mb-2">
              {isRegister ? 'Join Us' : 'Welcome Back'}
            </h3>
            <p className="text-slate-500 mb-8">
              {isRegister ? 'Create your staff account and start managing.' : 'Sign in to access your dashboard and manage sales.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <AnimatePresence mode="wait">
                {isRegister && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 mb-4">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input 
                          type="text"
                          required={isRegister}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 focus:bg-white outline-none rounded-2xl py-3.5 pl-12 pr-4 transition-all font-medium text-slate-700"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 focus:bg-white outline-none rounded-2xl py-3.5 pl-12 pr-4 transition-all font-medium text-slate-700"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 focus:bg-white outline-none rounded-2xl py-3.5 pl-12 pr-4 transition-all font-medium text-slate-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full py-4 rounded-2xl text-lg font-black shadow-lg shadow-indigo-200" 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  isRegister ? 'Create Account' : 'Sign In'
                )}
              </Button>
            </form>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>
            
            <button 
              onClick={signIn}
              className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-100 hover:border-indigo-600 hover:bg-slate-50 py-4 rounded-2xl transition-all duration-300 group mb-8"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" />
              <span className="font-bold text-slate-700 group-hover:text-indigo-600">Continue with Google</span>
            </button>

            <p className="text-center text-slate-500 text-sm">
              {isRegister ? 'Already have an account?' : "Don't have an account yet?"} <br />
              <button 
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                }}
                className="font-black text-indigo-600 hover:underline mt-1"
              >
                {isRegister ? 'Sign In Instead' : 'Register as New Member'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
