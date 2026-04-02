import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BarChart3, FileText, Loader2, Target } from 'lucide-react';
import { getResumeById, updateResume } from '../lib/storage';
import { analyzeAtsScore } from '../lib/gemini';
import { useAuth } from '../context/AuthContext';

export default function UploadedResumeReview() {
  const { id } = useParams();
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const found = await getResumeById(id, user?.uid);
        if (active) setResume(found);
      } catch (error) {
        console.error('Failed to load uploaded resume', error);
        if (active) setResume(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id, user?.uid]);

  const update = async (path, value) => {
    const next = { ...resume, [path]: value };
    setResume(next);
    try {
      const saved = await updateResume(id, next);
      setResume(saved);
    } catch (error) {
      console.error('Failed to save uploaded resume', error);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAnalyze = async () => {
    if (!resume?.atsTarget?.trim()) {
      showToast('Paste a job description to generate an ATS score.', 'error');
      return;
    }
    if (!resume?.rawText?.trim()) {
      showToast('This uploaded resume has no text to analyze.', 'error');
      return;
    }

    setAnalyzing(true);
    try {
      const analysis = await analyzeAtsScore({ resumeText: resume.rawText.trim() }, resume.atsTarget.trim());
      update('atsAnalysis', {
        ...analysis,
        generatedAt: Date.now(),
        jobDescription: resume.atsTarget.trim(),
      });
      showToast('ATS score generated!');
    } catch {
      showToast('ATS analysis failed.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 text-slate-500">
        <Loader2 size={20} className="animate-spin" />
        Loading uploaded resume...
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Resume not found</h1>
          <p className="text-slate-500 mb-6">This uploaded resume could not be found in local storage.</p>
          <Link to="/dashboard" className="btn-primary no-underline px-5 py-3 rounded-xl">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const analysis = resume.atsAnalysis;
  const score = analysis?.score ?? null;
  const isStale = analysis?.jobDescription && analysis.jobDescription !== (resume.atsTarget || '').trim();
  const scoreTone =
    score == null ? 'bg-slate-100 text-slate-500 border-slate-200'
    : score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : score >= 65 ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-red-50 text-red-700 border-red-200';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center gap-4 px-5 h-14 bg-white border-b border-slate-200 sticky top-0 z-10">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors no-underline">
          <ArrowLeft size={15} /> Dashboard
        </Link>
        <div className="font-bold text-sm truncate">{resume.title}</div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-900 text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold uppercase tracking-[0.22em] mb-3">
              <FileText size={13} /> Uploaded Resume
            </div>
            <h1 className="text-2xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{resume.title}</h1>
            <p className="text-sm text-slate-300">Review ATS compatibility for resumes you uploaded instead of building inside the editor.</p>
          </div>
          <div className="p-6">
            <label className="form-label">Resume Text</label>
            <textarea
              className="form-input min-h-[540px] mt-2"
              value={resume.rawText || ''}
              onChange={(e) => update('rawText', e.target.value)}
              placeholder="Uploaded resume text will appear here..."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold uppercase tracking-[0.22em] mb-3">
                    <Target size={13} /> ATS Optimizer
                  </div>
                  <h2 className="text-2xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Generate ATS score</h2>
                  <p className="text-sm text-slate-300">Compare the uploaded resume text against any job description.</p>
                </div>
                <div className={`min-w-[110px] px-4 py-3 rounded-2xl border text-center ${scoreTone}`}>
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] mb-1">ATS Score</div>
                  <div className="text-3xl font-black leading-none">{score ?? '--'}</div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="form-label">Target Job Description</label>
                <textarea
                  className="form-input min-h-[180px]"
                  value={resume.atsTarget || ''}
                  onChange={(e) => update('atsTarget', e.target.value)}
                  placeholder="Paste the job description here..."
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button className="btn-primary rounded-xl px-5 py-3 text-sm" onClick={handleAnalyze} disabled={analyzing}>
                  {analyzing ? <><Loader2 size={15} className="animate-spin" /> Analyzing…</> : <><BarChart3 size={15} /> Generate ATS Score</>}
                </button>
                {analysis?.generatedAt && <span className="text-xs text-slate-500">Last analyzed {new Date(analysis.generatedAt).toLocaleString()}</span>}
                {isStale && <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">Job description changed. Re-run analysis to refresh the score.</span>}
              </div>
            </div>
          </div>

          {analysis && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(analysis.sectionScores || {}).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="text-2xl font-black text-slate-900 leading-none">{value}</div>
                  </div>
                ))}
              </div>
              {analysis.summary && (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">Overview</div>
                  <p className="text-sm text-slate-600 leading-6">{analysis.summary}</p>
                </div>
              )}
              <div className="grid gap-4">
                <InsightList title="Matched Keywords" items={analysis.matchedKeywords} tone="emerald" emptyLabel="No strong keyword matches yet." />
                <InsightList title="Missing Keywords" items={analysis.missingKeywords} tone="amber" emptyLabel="No major keyword gaps detected." />
                <InsightList title="Strengths" items={analysis.strengths} tone="blue" emptyLabel="No strengths returned." />
                <InsightList title="Improvements" items={analysis.improvements} tone="rose" emptyLabel="No improvement suggestions returned." />
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-xl z-50 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-gradient-primary text-white'}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InsightList({ title, items = [], tone, emptyLabel }) {
  const tones = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    rose: 'bg-rose-50 border-rose-200 text-rose-800',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">{title}</div>
      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? items.map((item) => (
          <span key={`${title}-${item}`} className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${tones[tone]}`}>
            {item}
          </span>
        )) : (
          <p className="text-sm text-slate-500">{emptyLabel}</p>
        )}
      </div>
    </div>
  );
}
