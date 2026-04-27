import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/UI';
import { TrendingUp, ShieldCheck, Zap, PackageSearch } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const { signIn } = useAuth();

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
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-8 md:p-16 border border-slate-100 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <PackageSearch size={220} />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
              Secure portal
            </div>
            
            <h3 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h3>
            <p className="text-slate-500 mb-12">Sign in to access your dashboard and manage sales.</p>
            
            <div className="space-y-4">
              <button 
                onClick={signIn}
                className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/50 py-5 rounded-2xl transition-all duration-300 group"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" />
                <span className="font-bold text-slate-700 group-hover:text-indigo-600">Continue with Google Account</span>
              </button>
            </div>

            <p className="text-center mt-12 text-slate-400 text-sm">
              Protected by military-grade encryption. <br />
              Need help? <a href="#" className="font-bold text-indigo-600 hover:underline">Contact Support</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
