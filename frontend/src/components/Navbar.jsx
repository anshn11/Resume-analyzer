import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isTransparent = location.pathname === '/';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      isTransparent ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/" className="flex items-center gap-2.5 no-underline group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isTransparent ? 'bg-white/10 border border-white/20' : 'bg-gradient-primary shadow-primary'
            }`}>
              <Sparkles size={20} className="text-white" />
            </div>
            <span className={`text-xl font-black tracking-tight ${isTransparent ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
              NextOffer
            </span>
          </Link>
        </motion.div>

        <div className="flex items-center gap-2 md:gap-4">
          {!user ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/login" className={`btn-primary text-sm px-6 py-2.5 rounded-xl no-underline bg-gradient-primary text-white shadow-primary hover:shadow-lg transition-all duration-300 ${
                isTransparent ? '' : ''
              }`}>
                Sign In
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div whileHover={{ y: -2 }}>
                <Link to="/dashboard" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold no-underline transition-colors ${
                  isTransparent ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-50'
                }`}>
                  <LayoutDashboard size={18} />
                  <span className="hidden md:inline">Dashboard</span>
                </Link>
              </motion.div>
              
              <div className="h-8 w-px bg-slate-200 mx-2 opacity-30" />

              <motion.button 
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={logout}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isTransparent ? 'text-white hover:bg-white/10' : 'text-slate-400 hover:bg-red-50 hover:text-red-500'
                }`}
                title="Logout"
              >
                <LogOut size={18} />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
