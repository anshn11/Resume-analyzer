import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getResumes, createResume, deleteResume } from '../lib/storage';
import { EMPTY_RESUME, TEMPLATES } from '../lib/utils';
import {
  Plus, FileText, Trash2, Pencil, Sparkles,
  Clock, LayoutDashboard
} from 'lucide-react';
import Navbar from '../components/Navbar';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  }
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [resumes, setResumes]     = useState([]);
  const [creating, setCreating]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle]   = useState('');

  useEffect(() => { setResumes(getResumes()); }, []);

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    const r = createResume({
      ...EMPTY_RESUME,
      title:  newTitle.trim(),
      userId: user?.uid || 'local',
    });
    navigate(`/builder/${r.id}`);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    deleteResume(id);
    setResumes(getResumes());
  };

  const timeAgo = (ts) => {
    if (!ts) return '';
    const m = Math.floor((Date.now() - ts) / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 bg-grid-slate-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12 p-8 md:p-12 rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl shadow-slate-200"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-64 h-64 rounded-full bg-primary-500/20 blur-3xl -top-20 -left-20 animate-float" />
            <div className="absolute w-48 h-48 rounded-full bg-violet-600/20 blur-2xl -bottom-10 -right-10 animate-float animation-delay-300" />
          </div>
          
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 text-[10px] font-bold uppercase tracking-widest mb-4"
              >
                <Sparkles size={12} className="text-primary-400" /> Welcome to NextOffer
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Hey, <span className="text-transparent bg-clip-text bg-gradient-primary">{user?.displayName?.split(' ')[0] || 'Professional'}</span> 👋
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-400 text-lg"
              >
                Your career journey continues here. Build, optimize, and manage your resumes with the power of Gemini AI.
              </motion.p>
            </div>
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-base px-8 py-4 rounded-2xl shadow-glow-lg group" 
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> 
              <span>Create New Resume</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {[
            { icon: FileText,       val: resumes.length, label: 'Resumes Created', color: 'bg-primary-50 text-primary-600' },
            { icon: Sparkles,       val: 'Gemini',       label: 'AI Model Active', color: 'bg-violet-50 text-violet-600' },
            { icon: LayoutDashboard,val: 4,              label: 'Premium Templates', color: 'bg-emerald-50 text-emerald-600' },
          ].map((s, i) => (
            <motion.div key={i} variants={itemVariants} className="glass-card rounded-3xl p-6 flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <s.icon size={24} />
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 leading-none mb-1">{s.val}</div>
                <div className="text-sm text-slate-500 font-medium">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Resume Content */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} className="text-primary-500" /> Your Resumes
          </h2>
          <div className="h-px flex-1 bg-slate-200 mx-6 opacity-50" />
        </div>

        {resumes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white group hover:border-primary-300 transition-colors duration-300"
          >
            <div className="w-24 h-24 rounded-3xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-500 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <FileText size={44} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Starting fresh?</h2>
            <p className="text-slate-500 text-lg max-w-sm mx-auto mb-8">
              Create your first AI-optimized resume and stand out from the crowd today.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary px-10 py-4 rounded-2xl" 
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} /> Create My First Resume
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {/* Create New Card */}
            <motion.button
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="flex flex-col items-center justify-center gap-4 min-h-[300px] border-2 border-dashed border-primary-200 rounded-3xl bg-white text-primary-600 font-bold hover:bg-primary-50 hover:border-primary-400 hover:-translate-y-2 transition-all duration-300 group overflow-hidden relative shadow-sm"
              onClick={() => setShowModal(true)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-300">
                <Plus size={32} />
              </div>
              <span className="relative z-10">New Resume</span>
            </motion.button>

            {resumes.map(r => {
              const template = TEMPLATES.find(t => t.id === r.template) || TEMPLATES[0];
              return (
                <motion.div
                  key={r.id}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden cursor-pointer hover:border-primary-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300 group flex flex-col shadow-sm"
                  onClick={() => navigate(`/builder/${r.id}`)}
                >
                  {/* Visual Preview Thumbnail */}
                  <div className="h-44 bg-slate-50 relative overflow-hidden flex items-center justify-center p-6 border-b border-slate-100">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-transparent opacity-50" />
                    <div className="w-full h-full glass-card rounded-xl overflow-hidden shadow-sm scale-95 group-hover:scale-100 transition-transform duration-300 flex flex-col">
                      <div className="h-10 w-full" style={{ background: r.accentColor || '#7c3aed', opacity: 0.8 }} />
                      <div className="p-3 space-y-2">
                        <div className="h-2 w-3/4 bg-slate-800/80 rounded-full" />
                        <div className="h-1.5 w-1/2 bg-slate-200 rounded-full" />
                        <div className="space-y-1 pt-1">
                          <div className="h-1 w-full bg-slate-100 rounded-full" />
                          <div className="h-1 w-full bg-slate-100 rounded-full" />
                          <div className="h-1 w-2/3 bg-slate-100 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors duration-200 truncate mb-1">
                      {r.title}
                    </h3>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary-500 bg-primary-50 px-2 py-0.5 rounded-md">
                        {template.label}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Clock size={12} /> {timeAgo(r.updatedAt)}
                      </span>
                    </div>
                    
                    <div className="flex gap-2.5 mt-auto">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-primary text-xs px-4 py-2.5 rounded-xl flex-1 font-bold tracking-tight shadow-sm"
                        onClick={e => { e.stopPropagation(); navigate(`/builder/${r.id}`); }}
                      >
                        <Pencil size={12} className="mr-1.5" /> Edit Resume
                      </motion.button>
                      <button
                        className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 hover:rotate-12 transition-all duration-200 border border-slate-100"
                        onClick={e => handleDelete(r.id, e)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" 
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md" 
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Create New Resume</h2>
              <p className="text-slate-500 text-sm mb-6">Give your resume a title to get started</p>
              <div className="flex flex-col gap-1.5 mb-6">
                <label className="form-label">Resume Title</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Software Engineer Resume"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleCreate} disabled={creating || !newTitle.trim()}>
                  {creating ? <><div className="spinner" /> Creating…</> : <><Plus size={16} /> Create Resume</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}