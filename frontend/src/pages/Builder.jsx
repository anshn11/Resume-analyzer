import { useState, useEffect, useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getResumeById, updateResume } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { EMPTY_RESUME, EMPTY_EXPERIENCE, EMPTY_EDUCATION, EMPTY_PROJECT, ACCENT_COLORS, TEMPLATES, uid } from '../lib/utils';
import { enhanceSummary, enhanceExperience, suggestSkills, analyzeAtsScore, DEMO_MODE } from '../lib/gemini';
import ResumePreview from '../components/ResumePreview';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Download,
  Save, User, Briefcase, GraduationCap, FolderGit2, Wrench, FileText,
  Plus, Trash2, Check, Loader2, Target, BarChart3
} from 'lucide-react';

const STEPS = [
  { id: 'personal',   label: 'Personal',   icon: User },
  { id: 'summary',    label: 'Summary',    icon: FileText },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education',  label: 'Education',  icon: GraduationCap },
  { id: 'projects',   label: 'Projects',   icon: FolderGit2 },
  { id: 'skills',     label: 'Skills',     icon: Wrench },
];

const SECTION_TIPS = {
  personal:   'Start with your contact info and professional headline',
  summary:    'Write 3–4 sentences that capture your unique value — or let AI write it!',
  experience: 'Add your work history with quantifiable achievements',
  education:  'List your degrees, certifications, and institutions',
  projects:   'Showcase your best projects with links and tech stack',
  skills:     'Add 8–12 relevant technical and soft skills',
};

export default function Builder() {
  const previewRef = useRef();
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [resume, setResume]       = useState(null);
  const [step, setStep]           = useState(0);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [loading, setLoading]     = useState(true);
  const [aiTask, setAiTask]       = useState(null);
  const [toast, setToast]         = useState(null);
  const [panel, setPanel]         = useState('form'); // 'form' | 'preview'
  const autoSaveRef  = useRef(null);
  const isSavingRef   = useRef(false); // True while a save is in-flight
  const pendingSaveRef = useRef(false); // True if a change arrived during a save
  const resumeRef     = useRef(resume); // Always points to the latest resume state

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return; // Wait for auth before loading
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const r = await getResumeById(id, user?.uid);
        if (!active) return;
        if (r) {
          setResume(r);
        } else {
          // Resume not found in DB — treat as brand-new (just created)
          setResume({ 
            ...EMPTY_RESUME, 
            id, 
            title: 'New Resume', 
            userId: user?.uid || 'local', 
            createdAt: Date.now(), 
            updatedAt: Date.now() 
          });
        }
      } catch (error) {
        console.error('Failed to load resume', error);
        if (!active) return;
        // Session expired or not authenticated — redirect to login
        if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
          navigate('/login', { replace: true });
          return;
        }
        // Other error (network etc.) — show a blank resume so user isn't blocked
        setResume({ 
          ...EMPTY_RESUME, 
          id, 
          title: 'New Resume', 
          userId: user?.uid || 'local', 
          createdAt: Date.now(), 
          updatedAt: Date.now() 
        });
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id, user?.uid]);

  // Keep resumeRef in sync so doSave always sends the latest data
  useEffect(() => { resumeRef.current = resume; }, [resume]);

  // Auto-save after 1.5s of inactivity
  // No isSavingRef check here — doSave handles concurrency internally
  useEffect(() => {
    if (!resume) return;
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(doSave, 1500);
    return () => clearTimeout(autoSaveRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume]);

  const doSave = async () => {
    if (!resumeRef.current) return;

    // If already saving, mark a pending save and let the current one finish
    if (isSavingRef.current) {
      pendingSaveRef.current = true;
      return;
    }

    isSavingRef.current  = true;
    pendingSaveRef.current = false;
    setSaving(true);

    try {
      // Always save the LATEST state via resumeRef (not the stale closure value)
      await updateResume(id, resumeRef.current);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save resume', error);
      // Session expired — redirect to login so user can re-authenticate
      if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
        showToast('Session expired. Please sign in again.', 'error');
        setTimeout(() => navigate('/login', { replace: true }), 1500);
        return;
      }
      showToast('Failed to save resume. Check your connection.', 'error');
    } finally {
      setSaving(false);
      isSavingRef.current = false;

      // If a change arrived while we were saving, save again now
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        doSave();
      }
    }
  };

  const update = useCallback((path, value) => {
    setResume(prev => {
      const next = { ...prev };
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleAiSummary = async () => {
    setAiTask('summary');
    try {
      const res = await enhanceSummary(resume.summary, resume.personalInfo?.jobTitle);
      update('summary', res);
      showToast(DEMO_MODE ? '✨ Demo AI enhancement applied!' : '✨ Summary enhanced by Gemini AI!');
    } catch { showToast('AI enhancement failed.', 'error'); }
    finally   { setAiTask(null); }
  };

  const handleAiExperience = async (idx) => {
    const exp = resume.experience[idx];
    setAiTask(`experience-${idx}`);
    try {
      const res = await enhanceExperience(exp.description, exp.jobTitle, exp.company);
      update('experience', resume.experience.map((e, i) => i === idx ? { ...e, description: res } : e));
      showToast('✨ Experience enhanced!');
    } catch { showToast('AI failed.', 'error'); }
    finally  { setAiTask(null); }
  };

  const handleAiSkills = async () => {
    setAiTask('skills');
    try {
      const suggestions = await suggestSkills(resume.personalInfo?.jobTitle, resume.skills);
      update('skills', [...new Set([...resume.skills, ...suggestions])]);
      showToast(`✨ Added ${suggestions.length} AI-suggested skills!`);
    } catch { showToast('AI failed.', 'error'); }
    finally  { setAiTask(null); }
  };

  const handleAtsAnalysis = async () => {
    if (!resume.atsTarget?.trim()) {
      showToast('Paste a job description to generate an ATS score.', 'error');
      return;
    }

    setAiTask('ats');
    try {
      const analysis = await analyzeAtsScore(resume, resume.atsTarget.trim());
      update('atsAnalysis', {
        ...analysis,
        generatedAt: Date.now(),
        jobDescription: resume.atsTarget.trim(),
      });
      showToast('ATS score generated!');
    } catch {
      showToast('ATS analysis failed.', 'error');
    } finally {
      setAiTask(null);
    }
  };

  const handleDownload = async () => {
    try {
      // Ensure preview is visible before capturing
      if (panel !== 'preview') {
        setPanel('preview');
        // Wait for the panel to render and DOM to update
        await new Promise(resolve => setTimeout(resolve, 700));
      }
      const input = previewRef.current;
      if (!input) {
        console.error('Resume preview ref is null', { previewRef });
        showToast('Resume preview not found. Try again.', 'error');
        return;
      }
      if (!input.offsetWidth || !input.offsetHeight) {
        console.error('Resume preview is not visible or has no size', { input });
        showToast('Resume preview is not visible. Try again.', 'error');
        return;
      }
      showToast('Generating PDF...', 'success');
      const canvas = await html2canvas(input, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const imgData = canvas.toDataURL('image/png');
      // Use the actual pixel size of the resume preview for the PDF
      const pxToPt = 0.75; // 1px = 0.75pt
      const pdfWidth = canvas.width * pxToPt;
      const pdfHeight = canvas.height * pxToPt;
      const pdf = new jsPDF({ orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait', unit: 'pt', format: [pdfWidth, pdfHeight] });
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${resume.title || 'resume'}.pdf`);
      showToast('📄 PDF downloaded!');
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('Failed to generate PDF. See console for details.', 'error');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center gap-4 text-slate-400">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" 
      />
      Loading resume…
    </div>
  );
  if (!resume) return null;

  const StepIcon = STEPS[step].icon;

  return (
    <div className="builder-shell min-h-screen md:h-screen flex flex-col overflow-hidden">
      {/* ── Builder Header ─────────────────────── */}
      <header className="builder-topbar flex flex-wrap md:flex-nowrap items-center gap-3 px-4 md:px-5 py-3 md:py-0 md:h-16 flex-shrink-0 z-20">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors no-underline flex-shrink-0">
          <ArrowLeft size={15} /> Dashboard
        </Link>
        <div className="flex-1 min-w-0 flex items-center md:justify-center gap-3">
          <span className="font-bold text-sm md:text-base truncate max-w-[16rem] md:max-w-xs">{resume.title}</span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            {saving ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : saved ? <><Check size={12} className="text-emerald-500" /> Saved</> : null}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
          {DEMO_MODE && (
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200">Demo Mode</span>
          )}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-secondary text-xs px-3.5 py-2 rounded-full flex-1 md:flex-none" onClick={doSave}>
            <Save size={13} /> Save
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary text-xs px-3.5 py-2 rounded-full flex-1 md:flex-none" onClick={handleDownload}>
            <Download size={13} /> Download PDF
          </motion.button>
        </div>
      </header>

      {/* ── Step bar ───────────────────────────── */}
      <div className="builder-stepbar flex items-center gap-1 px-3 md:px-4 py-2.5 overflow-x-auto flex-shrink-0 scrollbar-hide">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.button
              key={s.id}
              onClick={() => setStep(i)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer border ${
                i === step
                  ? 'bg-primary-50 text-primary-700 border-primary-300'
                  : i < step
                  ? 'text-emerald-600 border-transparent hover:bg-emerald-50'
                  : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-primary-600'
              }`}
            >
              <Icon size={13} />
              {s.label}
            </motion.button>
          );
        })}
      </div>

      {/* ── Mobile panel toggle ─────────────────── */}
      <div className="md:hidden flex bg-white/90 border-b border-slate-200 p-2 gap-2 flex-shrink-0 backdrop-blur-sm">
        {['form', 'preview'].map(p => (
          <button key={p} onClick={() => setPanel(p)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${panel === p ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'}`}
          >
            {p === 'form' ? 'Edit' : 'Preview'}
          </button>
        ))}
      </div>

      {/* ── Main body ──────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Form panel */}
        <div className={`w-full md:w-[520px] xl:w-[560px] md:flex-shrink-0 flex flex-col bg-white/92 border-r border-slate-200 overflow-y-auto backdrop-blur-sm ${panel === 'form' ? 'flex' : 'hidden md:flex'}`}>
          {/* Template & color */}
          <div className="px-4 md:px-5 py-4 border-b border-slate-100 bg-white/75 backdrop-blur-sm space-y-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Template</div>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => update('template', t.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer ${resume.template === t.id ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300 hover:text-primary-600'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Accent Color</div>
              <div className="flex flex-wrap gap-2">
                {ACCENT_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => update('accentColor', c.value)}
                    title={c.label}
                    className={`w-6 h-6 rounded-full transition-all duration-150 cursor-pointer hover:scale-110 ${resume.accentColor === c.value ? 'scale-110 ring-2 ring-offset-2 ring-primary-600' : ''}`}
                    style={{ background: c.value }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Section content */}
          <div className="px-4 md:px-5 py-5 md:py-6 flex-1 relative overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div 
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="builder-section-intro flex items-start gap-4 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-600 flex-shrink-0 shadow-sm">
                    <StepIcon size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold mb-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>{STEPS[step].label}</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">{SECTION_TIPS[STEPS[step].id]}</p>
                  </div>
                </div>

                {STEPS[step].id === 'personal'   && <PersonalForm   resume={resume} update={update} />}
                {STEPS[step].id === 'summary'    && <SummaryForm    resume={resume} update={update} onAi={handleAiSummary}        aiLoading={aiTask === 'summary'} />}
                {STEPS[step].id === 'experience' && <ExperienceForm resume={resume} update={update} onAi={handleAiExperience}     aiTask={aiTask} />}
                {STEPS[step].id === 'education'  && <EducationForm  resume={resume} update={update} />}
                {STEPS[step].id === 'projects'   && <ProjectsForm   resume={resume} update={update} />}
                {STEPS[step].id === 'skills'     && <SkillsForm     resume={resume} update={update} onAi={handleAiSkills}         aiLoading={aiTask === 'skills'} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Prev / Next */}
          <div className="flex justify-between items-center gap-3 px-4 md:px-5 py-4 border-t border-slate-100 bg-white/90 flex-shrink-0 backdrop-blur-sm">
            <button className="btn-secondary text-sm px-5 py-2.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed" onClick={() => setStep(p => Math.max(0, p - 1))} disabled={step === 0}>
              <ChevronLeft size={15} /> Previous
            </button>
            {step < STEPS.length - 1 ? (
              <button className="btn-primary text-sm px-5 py-2.5 rounded-full" onClick={() => setStep(p => p + 1)}>
                Next <ChevronRight size={15} />
              </button>
            ) : (
              <button className="btn-primary text-sm px-5 py-2.5 rounded-full" onClick={handleDownload}>
                <Download size={15} /> Download PDF
              </button>
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div className={`builder-preview-panel flex-1 overflow-y-auto ${panel === 'preview' ? 'flex' : 'hidden md:flex'} flex-col items-center py-5 md:py-8 px-4 md:px-6 gap-6`}>
          <ATSPanel
            resume={resume}
            update={update}
            onAnalyze={handleAtsAnalysis}
            aiLoading={aiTask === 'ats'}
          />
          <div className="builder-preview-frame w-full max-w-[794px]" ref={previewRef} id="resume-pdf-preview">
            <ResumePreview resume={resume} />
          </div>
        </div>
      </div>

      {/* Toast */}
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

/* ══ Section Forms ════════════════════════════════════ */

function FormGrid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function FG({ label, full, children }) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? 'col-span-2' : ''}`}>
      {label && <label className="form-label">{label}</label>}
      {children}
    </div>
  );
}

function PersonalForm({ resume, update }) {
  const info = resume.personalInfo || {};
  const set  = (k, v) => update(`personalInfo.${k}`, v);
  return (
    <FormGrid>
      <FG label="Full Name" full><input className="form-input" placeholder="Ansh Nautiyal" value={info.fullName||''} onChange={e=>set('fullName',e.target.value)} /></FG>
      <FG label="Professional Title" full><input className="form-input" placeholder="Full Stack Developer" value={info.jobTitle||''} onChange={e=>set('jobTitle',e.target.value)} /></FG>
      <FG label="Email"><input type="email" className="form-input" placeholder="you@email.com" value={info.email||''} onChange={e=>set('email',e.target.value)} /></FG>
      <FG label="Phone"><input className="form-input" placeholder="+91 98765 43210" value={info.phone||''} onChange={e=>set('phone',e.target.value)} /></FG>
      <FG label="Location"><input className="form-input" placeholder="New Delhi, India" value={info.location||''} onChange={e=>set('location',e.target.value)} /></FG>
      <FG label="Website"><input className="form-input" placeholder="https://yoursite.com" value={info.website||''} onChange={e=>set('website',e.target.value)} /></FG>
      <FG label="LinkedIn"><input className="form-input" placeholder="linkedin.com/in/yourname" value={info.linkedin||''} onChange={e=>set('linkedin',e.target.value)} /></FG>
      <FG label="GitHub"><input className="form-input" placeholder="github.com/yourname" value={info.github||''} onChange={e=>set('github',e.target.value)} /></FG>
    </FormGrid>
  );
}

function SummaryForm({ resume, update, onAi, aiLoading }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="form-label">Professional Summary</label>
        <button className="ai-btn" onClick={onAi} disabled={aiLoading}>
          {aiLoading ? <><Loader2 size={12} className="animate-spin" /> Writing…</> : <><Sparkles size={12} /> AI Enhance</>}
        </button>
      </div>
      <textarea className="form-input min-h-[140px]" placeholder="Write a brief summary, or click AI Enhance to generate one!" value={resume.summary||''} onChange={e=>update('summary',e.target.value)} />
      <p className="text-xs text-slate-400">💡 A great summary is 3–4 sentences long. Click AI Enhance for instant magic.</p>
    </div>
  );
}

function ExperienceForm({ resume, update, onAi, aiTask }) {
  const exps = resume.experience || [];
  const add  = () => update('experience', [...exps, { ...EMPTY_EXPERIENCE, id: uid() }]);
  const rm   = (i) => update('experience', exps.filter((_,j)=>j!==i));
  const set  = (i, k, v) => update('experience', exps.map((e,j)=>j===i?{...e,[k]:v}:e));

  return (
    <div className="space-y-3">
      {exps.length === 0 && <EmptySection icon={Briefcase} label="No experience added yet" onAdd={add} addLabel="Add Experience" />}
      {exps.map((exp,i)=>(
        <div key={exp.id||i} className="builder-card border border-slate-200 rounded-2xl p-4 focus-within:border-primary-300 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">{i+1}</span><span className="font-semibold text-sm truncate">{exp.jobTitle||exp.company||'Experience'}</span></div>
            <div className="flex gap-2">
              <button className="ai-btn" onClick={()=>onAi(i)} disabled={Boolean(aiTask)}>{aiTask===`experience-${i}`?<><Loader2 size={11} className="animate-spin"/>Writing…</>:<><Sparkles size={11}/>AI</>}</button>
              <button className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer" onClick={()=>rm(i)}><Trash2 size={13}/></button>
            </div>
          </div>
          <FormGrid>
            <FG label="Job Title"><input className="form-input" placeholder="Software Engineer" value={exp.jobTitle||''} onChange={e=>set(i,'jobTitle',e.target.value)}/></FG>
            <FG label="Company"><input className="form-input" placeholder="Google" value={exp.company||''} onChange={e=>set(i,'company',e.target.value)}/></FG>
            <FG label="Location"><input className="form-input" placeholder="Bangalore" value={exp.location||''} onChange={e=>set(i,'location',e.target.value)}/></FG>
            <FG label="Start Date"><input type="month" className="form-input" value={exp.startDate||''} onChange={e=>set(i,'startDate',e.target.value)}/></FG>
            <FG label="End Date"><input type="month" className="form-input" value={exp.endDate||''} disabled={exp.current} onChange={e=>set(i,'endDate',e.target.value)}/></FG>
            <FG full><label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer mt-1"><input type="checkbox" className="accent-primary-600 w-4 h-4" checked={exp.current||false} onChange={e=>set(i,'current',e.target.checked)}/> Currently working here</label></FG>
            <FG label="Description" full><textarea className="form-input min-h-[90px]" placeholder="• Led development of key features..." value={exp.description||''} onChange={e=>set(i,'description',e.target.value)}/></FG>
          </FormGrid>
        </div>
      ))}
      {exps.length>0 && <button className="btn-secondary text-sm flex items-center gap-1.5" onClick={add}><Plus size={15}/> Add Another Experience</button>}
    </div>
  );
}

function EducationForm({ resume, update }) {
  const edus = resume.education || [];
  const add  = () => update('education', [...edus, { ...EMPTY_EDUCATION, id: uid() }]);
  const rm   = (i) => update('education', edus.filter((_,j)=>j!==i));
  const set  = (i, k, v) => update('education', edus.map((e,j)=>j===i?{...e,[k]:v}:e));

  return (
    <div className="space-y-3">
      {edus.length === 0 && <EmptySection icon={GraduationCap} label="No education added yet" onAdd={add} addLabel="Add Education" />}
      {edus.map((edu,i)=>(
        <div key={edu.id||i} className="builder-card border border-slate-200 rounded-2xl p-4 focus-within:border-primary-300 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">{i+1}</span><span className="font-semibold text-sm">{edu.degree||edu.institution||'Education'}</span></div>
            <button className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer" onClick={()=>rm(i)}><Trash2 size={13}/></button>
          </div>
          <FormGrid>
            <FG label="Degree" full><input className="form-input" placeholder="B.Tech in Computer Science" value={edu.degree||''} onChange={e=>set(i,'degree',e.target.value)}/></FG>
            <FG label="Institution"><input className="form-input" placeholder="IIT Delhi" value={edu.institution||''} onChange={e=>set(i,'institution',e.target.value)}/></FG>
            <FG label="Location"><input className="form-input" placeholder="New Delhi" value={edu.location||''} onChange={e=>set(i,'location',e.target.value)}/></FG>
            <FG label="Start Date"><input type="month" className="form-input" value={edu.startDate||''} onChange={e=>set(i,'startDate',e.target.value)}/></FG>
            <FG label="End Date"><input type="month" className="form-input" value={edu.endDate||''} onChange={e=>set(i,'endDate',e.target.value)}/></FG>
            <FG label="GPA / Score"><input className="form-input" placeholder="8.5/10" value={edu.gpa||''} onChange={e=>set(i,'gpa',e.target.value)}/></FG>
          </FormGrid>
        </div>
      ))}
      {edus.length>0 && <button className="btn-secondary text-sm flex items-center gap-1.5" onClick={add}><Plus size={15}/> Add Another Education</button>}
    </div>
  );
}

function ProjectsForm({ resume, update }) {
  const projs = resume.projects || [];
  const add   = () => update('projects', [...projs, { ...EMPTY_PROJECT, id: uid() }]);
  const rm    = (i) => update('projects', projs.filter((_,j)=>j!==i));
  const set   = (i, k, v) => update('projects', projs.map((p,j)=>j===i?{...p,[k]:v}:p));

  return (
    <div className="space-y-3">
      {projs.length === 0 && <EmptySection icon={FolderGit2} label="No projects added yet" onAdd={add} addLabel="Add Project" />}
      {projs.map((proj,i)=>(
        <div key={proj.id||i} className="builder-card border border-slate-200 rounded-2xl p-4 focus-within:border-primary-300 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">{i+1}</span><span className="font-semibold text-sm">{proj.name||'Project'}</span></div>
            <button className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer" onClick={()=>rm(i)}><Trash2 size={13}/></button>
          </div>
          <FormGrid>
            <FG label="Project Name" full><input className="form-input" placeholder="AI Resume Builder" value={proj.name||''} onChange={e=>set(i,'name',e.target.value)}/></FG>
            <FG label="Live Link"><input className="form-input" placeholder="https://myproject.com" value={proj.link||''} onChange={e=>set(i,'link',e.target.value)}/></FG>
            <FG label="GitHub"><input className="form-input" placeholder="github.com/user/project" value={proj.github||''} onChange={e=>set(i,'github',e.target.value)}/></FG>
            <FG label="Technologies" full><input className="form-input" placeholder="React, Node.js, MongoDB" value={proj.technologies||''} onChange={e=>set(i,'technologies',e.target.value)}/></FG>
            <FG label="Description" full><textarea className="form-input min-h-[70px]" placeholder="What this project does and your key contributions..." value={proj.description||''} onChange={e=>set(i,'description',e.target.value)}/></FG>
          </FormGrid>
        </div>
      ))}
      {projs.length>0 && <button className="btn-secondary text-sm flex items-center gap-1.5" onClick={add}><Plus size={15}/> Add Another Project</button>}
    </div>
  );
}

function SkillsForm({ resume, update, onAi, aiLoading }) {
  const [input, setInput] = useState('');
  const skills = resume.skills || [];

  const addSkill = () => {
    const t = input.trim();
    if (!t || skills.includes(t)) { setInput(''); return; }
    update('skills', [...skills, t]);
    setInput('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="form-label">Skills</label>
        <button className="ai-btn" onClick={onAi} disabled={aiLoading}>
          {aiLoading ? <><Loader2 size={12} className="animate-spin"/>Suggesting…</> : <><Sparkles size={12}/>AI Suggest Skills</>}
        </button>
      </div>
      <div className="flex gap-2">
        <input className="form-input flex-1" placeholder="Type a skill and press Enter…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSkill())} />
        <button className="btn-primary px-4 py-2 rounded-xl text-sm" onClick={addSkill} disabled={!input.trim()}><Plus size={15}/></button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map(s=>(
          <span key={s} className="tag cursor-pointer hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors" onClick={()=>update('skills',skills.filter(sk=>sk!==s))}>
            {s} <span className="ml-0.5 text-current opacity-60">×</span>
          </span>
        ))}
        {skills.length===0 && <p className="text-xs text-slate-400">Add skills above or click AI Suggest.</p>}
      </div>
      <p className="text-xs text-slate-400">💡 Add 8–12 skills including both technical and soft skills.</p>
    </div>
  );
}

function ATSPanel({ resume, update, onAnalyze, aiLoading }) {
  const analysis = resume.atsAnalysis;
  const isStale = analysis?.jobDescription && analysis.jobDescription !== (resume.atsTarget || '').trim();
  const score = analysis?.score ?? null;
  const scoreTone =
    score == null ? 'bg-slate-100 text-slate-500 border-slate-200'
    : score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : score >= 65 ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-red-50 text-red-700 border-red-200';

  return (
    <div className="w-full max-w-[794px] bg-white/96 border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-900/5 overflow-hidden backdrop-blur-sm">
      <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold uppercase tracking-[0.22em] mb-3">
              <Target size={13} /> ATS Optimizer
            </div>
            <h3 className="text-2xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Generate your ATS score</h3>
            <p className="text-sm text-slate-300 max-w-2xl">Paste a job description to compare this resume against the target role and uncover the quickest ATS wins.</p>
          </div>
          <div className={`min-w-[110px] px-4 py-3 rounded-2xl border text-center ${scoreTone}`}>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] mb-1">ATS Score</div>
            <div className="text-3xl font-black leading-none">{score ?? '--'}</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="space-y-2">
          <label className="form-label">Target Job Description</label>
          <textarea
            className="form-input min-h-[160px]"
            placeholder="Paste the job description here to generate an ATS match score..."
            value={resume.atsTarget || ''}
            onChange={(e) => update('atsTarget', e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary rounded-xl px-5 py-3 text-sm" onClick={onAnalyze} disabled={aiLoading}>
            {aiLoading ? <><Loader2 size={15} className="animate-spin" /> Analyzing…</> : <><BarChart3 size={15} /> Generate ATS Score</>}
          </button>
          {analysis?.generatedAt && (
            <span className="text-xs text-slate-500">
              Last analyzed {new Date(analysis.generatedAt).toLocaleString()}
            </span>
          )}
          {isStale && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              Job description changed. Re-run analysis to refresh the score.
            </span>
          )}
        </div>

        {analysis && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {Object.entries(analysis.sectionScores || {}).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-2xl font-black text-slate-900 leading-none">{value}</div>
                </div>
              ))}
            </div>

            {analysis.summary && (
              <div className="rounded-2xl border border-slate-200 px-4 py-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">Overview</div>
                <p className="text-sm text-slate-600 leading-6">{analysis.summary}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <InsightList title="Matched Keywords" items={analysis.matchedKeywords} tone="emerald" emptyLabel="No strong keyword matches yet." />
              <InsightList title="Missing Keywords" items={analysis.missingKeywords} tone="amber" emptyLabel="No major keyword gaps detected." />
              <InsightList title="Strengths" items={analysis.strengths} tone="blue" emptyLabel="No strengths returned." />
              <InsightList title="Improvements" items={analysis.improvements} tone="rose" emptyLabel="No improvement suggestions returned." />
            </div>
          </div>
        )}
      </div>
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
    <div className="rounded-2xl border border-slate-200 p-4">
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

// eslint-disable-next-line no-unused-vars
function EmptySection({ icon: Icon, label, onAdd, addLabel }) {
  return (
    <div className="text-center py-12 flex flex-col items-center gap-3 text-slate-400">
      <Icon size={30} className="text-primary-300" />
      <p className="text-sm">{label}</p>
      <button className="btn-secondary text-xs px-4 py-2 rounded-full" onClick={onAdd}><Plus size={13}/> {addLabel}</button>
    </div>
  );
}
