import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, Zap, Clock, AlertCircle } from 'lucide-react';

const PERKS = [
  { icon: Shield, text: 'Your data stays on your device — no third-party servers' },
  { icon: Zap,    text: 'One click — no forms, no passwords, no friction' },
  { icon: Clock,  text: 'Ready in under 30 seconds' },
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const [searchParams]      = useSearchParams();
  const [loading, setLoading] = useState(false);
  const oauthError = searchParams.get('error');

  const errorMsg = oauthError === 'oauth_failed'
    ? 'Google sign-in failed or was cancelled. Please try again.'
    : null;

  const handleLogin = () => {
    setLoading(true);
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden flex items-center justify-center px-6 py-20">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.25, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute w-96 h-96 rounded-full bg-purple-500 blur-3xl -top-24 -left-20" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.2, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute w-72 h-72 rounded-full bg-violet-600 blur-3xl -bottom-16 -right-16" 
        />
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-12 border border-white/20">
          <motion.div variants={itemVariants}>
            <Link to="/" className="flex items-center gap-2.5 no-underline mb-8">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
                <Sparkles size={19} className="text-white" />
              </div>
              <span className="text-xl font-extrabold text-primary-700" style={{ fontFamily: 'Outfit, sans-serif' }}>NextOffer</span>
            </Link>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-3xl font-extrabold mb-2 text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Welcome to NextOffer
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-slate-500 text-sm leading-relaxed mb-8"
          >
            Sign in with Google to access your AI-powered resume builder.
            <strong className="text-slate-700"> No registration needed.</strong>
          </motion.p>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2.5"
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-700 font-bold text-base hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 shadow-sm disabled:opacity-60 cursor-pointer mb-8"
          >
            {loading ? (
              <><div className="spinner-dark" /><span>Redirecting…</span></>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </motion.button>

          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Why NextOffer?</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <div className="space-y-4">
            {PERKS.map((p, i) => (
              <motion.div key={i} variants={itemVariants} className="flex items-center gap-4 text-sm text-slate-600 font-medium">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0 shadow-sm">
                  <p.icon size={18} />
                </div>
                {p.text}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
