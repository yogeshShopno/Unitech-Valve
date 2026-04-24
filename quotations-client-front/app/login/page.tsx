'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle,
  Loader2,
  Factory
} from 'lucide-react';
import Image from 'next/image';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Set the token in a cookie so the middleware can access it.
        // This is necessary because the backend cookie might be cross-origin
        // and not automatically sent to the frontend middleware.
        document.cookie = `authToken=${data.token}; path=/; max-age=3600; SameSite=Lax`;
        
        // Use window.location.href for the initial redirect to ensure the browser 
        // properly registers the cookie for the middleware on the next request.
        window.location.href = '/clients';
      } else {
        setError(data.message || 'Invalid credentials');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex bg-surface overflow-hidden">
      {/* Decorative Left Panel */}
      <div className="hidden lg:flex lg:w-3/5 relative bg-primary items-center justify-center overflow-hidden">
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-primary-container)_0%,_transparent_70%)]" />
          <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-on-primary/10" />
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 p-12 text-on-primary max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-on-primary/10 p-3 rounded-xl backdrop-blur-md border border-white/20">
              <Factory className="w-8 h-8 text-on-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Industrial Ledger</h1>
          </div>
          
          <h2 className="text-5xl font-black mb-6 leading-tight tracking-tight">
            Precision Management for <br />
            <span className="text-primary-container">Modern Engineering.</span>
          </h2>
          
          <p className="text-lg text-on-primary/80 mb-10 font-medium leading-relaxed max-w-lg">
            Access your secure portal to manage quotations, track clients, and streamline your engineering workflow with institutional-grade tools.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-primary-dim p-6 rounded-2xl border border-white/10">
              <div className="text-primary-container font-black text-2xl mb-1">99.9%</div>
              <div className="text-xs uppercase tracking-widest font-bold opacity-60">Uptime Reliability</div>
            </div>
            <div className="bg-primary-dim p-6 rounded-2xl border border-white/10">
              <div className="text-primary-container font-black text-2xl mb-1">AES-256</div>
              <div className="text-xs uppercase tracking-widest font-bold opacity-60">Secure Protocol</div>
            </div>
          </div>
        </motion.div>

        {/* Animated Background Image */}
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 -z-0 pointer-events-none"
        >
          <Image
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2070"
            alt="Industrial Background"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </div>

      {/* Login Section */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-surface-container-lowest">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-container text-primary mb-6 shadow-sm"
            >
              <ShieldCheck className="w-8 h-8" />
            </motion.div>
            <h2 className="text-3xl font-black tracking-tight text-on-surface mb-2">Secure Login</h2>
            <p className="text-secondary font-medium">Enter your credentials to access the console</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-secondary group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl text-on-surface font-semibold placeholder:text-secondary/50 focus:outline-none focus:border-primary/30 focus:bg-white transition-all shadow-sm"
                  placeholder="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl text-on-surface font-semibold placeholder:text-secondary/50 focus:outline-none focus:border-primary/30 focus:bg-white transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-error-container/20 border-l-4 border-error p-4 rounded-r-xl"
                >
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-error mr-3 flex-shrink-0" />
                    <p className="text-sm font-bold text-error">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group bg-primary hover:bg-primary-dim text-on-primary py-4 px-6 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-primary/20 flex items-center justify-center overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Authenticating...
                  </motion.div>
                ) : (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    Authorize Access
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-surface-container text-center">
            <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">
              Industrial Ledger &copy; 2023 Digital Foreman Systems
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}