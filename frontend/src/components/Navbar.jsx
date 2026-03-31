import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Menu, X, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout }              = useAuth();
  const location                      = useLocation();
  const navigate                      = useNavigate();
  const [scrolled,  setScrolled]      = useState(false);
  const [menuOpen,  setMenuOpen]      = useState(false);
  const [dropOpen,  setDropOpen]      = useState(false);
  const dropRef                       = useRef(null);
  const isHome                        = location.pathname === '/';

  if (location.pathname.startsWith('/builder')) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const navBase = isHome && !scrolled
    ? 'bg-transparent'
    : 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBase}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center h-16 gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline flex-shrink-0">
          <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
            <Sparkles size={17} className="text-white" />
          </div>
          <span className={`font-display text-xl font-extrabold transition-colors ${isHome && !scrolled ? 'text-white' : 'text-primary-700'}`}>
            ResumeAI
          </span>
        </Link>

        {/* Desktop Nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {['Features', 'How It Works', 'Templates'].map(l => (
            <a
              key={l}
              href={`/#${l.toLowerCase().replace(/ /g, '-')}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 hover:bg-primary-50 hover:text-primary-700 ${isHome && !scrolled ? 'text-white/80 hover:text-white hover:bg-white/15' : 'text-slate-600'}`}
            >
              {l}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {user ? (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(p => !p)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold text-sm transition-all duration-150 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user.photoURL
                    ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                    : (user.displayName || 'U')[0].toUpperCase()
                  }
                </div>
                <span className="max-w-[110px] truncate">{user.displayName?.split(' ')[0] || 'User'}</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropOpen && (
                <div className="absolute top-[calc(100%+6px)] right-0 bg-white border border-slate-200 rounded-2xl shadow-xl min-w-[180px] overflow-hidden animate-fade-in z-50">
                  <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors no-underline" onClick={() => setDropOpen(false)}>
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <div className="h-px bg-slate-100 mx-2" />
                  <button className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors text-left cursor-pointer" onClick={handleLogout}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 cursor-pointer no-underline ${isHome && !scrolled ? 'text-white/80 hover:bg-white/15 hover:text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                Sign In
              </Link>
              <Link to="/login" className="btn-primary text-sm px-5 py-2.5 rounded-full no-underline">
                <Sparkles size={15} /> Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden ml-auto p-2 rounded-lg transition-colors ${isHome && !scrolled ? 'text-white hover:bg-white/15' : 'text-slate-700 hover:bg-slate-100'}`}
          onClick={() => setMenuOpen(p => !p)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-6 py-4 flex flex-col gap-1 animate-fade-in">
          {['Features', 'How It Works', 'Templates'].map(l => (
            <a key={l} href={`/#${l.toLowerCase().replace(/ /g, '-')}`} className="block py-3 text-slate-700 font-medium border-b border-slate-100 no-underline hover:text-primary-700 transition-colors" onClick={() => setMenuOpen(false)}>
              {l}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/dashboard" className="btn-secondary w-full justify-center no-underline" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button className="btn-ghost w-full justify-center text-red-500 hover:bg-red-50" onClick={handleLogout}>Sign Out</button>
              </>
            ) : (
              <Link to="/login" className="btn-primary w-full justify-center no-underline" onClick={() => setMenuOpen(false)}>
                <Sparkles size={16} /> Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
