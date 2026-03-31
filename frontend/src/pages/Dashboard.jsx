import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getResumes, createResume, deleteResume } from '../lib/storage';
import { EMPTY_RESUME, TEMPLATES } from '../lib/utils';
import {
  Plus, FileText, Trash2, Pencil, Sparkles,
  Clock, LayoutDashboard
} from 'lucide-react';
import Navbar from '../components/Navbar';

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
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Welcome back, <span className="gradient-text">{user?.displayName?.split(' ')[0] || 'there'}</span> 👋
            </h1>
            <p className="text-slate-500">Manage your resumes and build new ones with AI</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={17} /> New Resume
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: FileText,       val: resumes.length, label: 'Total Resumes' },
            { icon: Sparkles,       val: 'AI',           label: 'Powered' },
            { icon: LayoutDashboard,val: 4,              label: 'Templates' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 hover:border-primary-200 hover:shadow-primary transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                <s.icon size={20} />
              </div>
              <div>
                <div className="text-2xl font-black gradient-text leading-none mb-0.5">{s.val}</div>
                <div className="text-xs text-slate-500 font-medium">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Resume grid */}
        {resumes.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-3xl bg-white">
            <div className="w-20 h-20 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-500 mx-auto mb-5">
              <FileText size={36} />
            </div>
            <h2 className="text-xl font-bold mb-2">No resumes yet</h2>
            <p className="text-slate-500 mb-6">Create your first AI-powered resume in minutes!</p>
            <button className="btn-primary mx-auto" onClick={() => setShowModal(true)}>
              <Plus size={17} /> Create My First Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {/* Create card */}
            <button
              className="flex flex-col items-center justify-center gap-3 min-h-[230px] border-2 border-dashed border-primary-300 rounded-2xl bg-primary-50 text-primary-600 font-semibold text-sm hover:bg-primary-100 hover:border-primary-500 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              onClick={() => setShowModal(true)}
            >
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <Plus size={26} />
              </div>
              New Resume
            </button>

            {resumes.map(r => (
              <div
                key={r.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:border-primary-300 hover:shadow-primary hover:-translate-y-1 transition-all duration-200 group"
                onClick={() => navigate(`/builder/${r.id}`)}
              >
                {/* Thumb */}
                <div className="h-36 relative overflow-hidden" style={{ '--accent': r.accentColor || '#7c3aed' }}>
                  <div className="absolute top-0 left-0 right-0 h-8" style={{ background: r.accentColor || '#7c3aed', opacity: 0.9 }} />
                  <div className="absolute top-10 left-3 right-3 space-y-1.5">
                    <div className="h-2.5 w-3/5 bg-slate-700 rounded-full" />
                    <div className="h-2 w-2/5 rounded-full" style={{ background: r.accentColor || '#7c3aed', opacity: 0.6 }} />
                    <div className="h-1.5 w-4/5 bg-slate-100 rounded-full" />
                    <div className="h-1.5 w-full bg-slate-100 rounded-full" />
                  </div>
                </div>
                {/* Info */}
                <div className="p-3.5">
                  <div className="font-bold text-sm truncate mb-2">{r.title}</div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="badge text-[10px]">{TEMPLATES.find(t => t.id === r.template)?.label || 'Classic'}</span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock size={11} /> {timeAgo(r.updatedAt)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn-primary text-xs px-3 py-1.5 rounded-full flex-1 justify-center"
                      onClick={e => { e.stopPropagation(); navigate(`/builder/${r.id}`); }}
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150"
                      onClick={e => handleDelete(r.id, e)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md animate-fade-in-up" onClick={e => e.stopPropagation()}>
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
          </div>
        </div>
      )}
    </div>
  );
}
