import { useState, useEffect, useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getResumeById, updateResume } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { EMPTY_RESUME, EMPTY_EXPERIENCE, EMPTY_EDUCATION, EMPTY_PROJECT, ACCENT_COLORS, TEMPLATES, uid } from '../lib/utils';
import { enhanceSummary, enhanceExperience, suggestSkills, DEMO_MODE } from '../lib/gemini';
import ResumePreview from '../components/ResumePreview';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Download,
  Save, User, Briefcase, GraduationCap, FolderGit2, Wrench, FileText,
  Plus, Trash2, Check, Loader2
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
  const [resume, setResume]       = useState(null);
  const [step, setStep]           = useState(0);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [loading, setLoading]     = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast]         = useState(null);
  const [panel, setPanel]         = useState('form'); // 'form' | 'preview'
  const autoSaveRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    const r = getResumeById(id);
    if (r) {
      setResume(r);
    } else {
      setResume({ 
        ...EMPTY_RESUME, 
        id, 
        title: 'New Resume', 
        userId: user?.uid || 'local', 
        createdAt: Date.now(), 
        updatedAt: Date.now() 
      });
    }
    setLoading(false);
  }, [id, user?.uid]);

  // Auto-save after 1.5s of inactivity
  useEffect(() => {
    if (!resume) return;
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(doSave, 1500);
    return () => clearTimeout(autoSaveRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume]);

  const doSave = () => {
    if (!resume) return;
    setSaving(true);
    updateResume(id, resume);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
    setAiLoading(true);
    try {
      const res = await enhanceSummary(resume.summary, resume.personalInfo?.jobTitle);
      update('summary', res);
      showToast(DEMO_MODE ? '✨ Demo AI enhancement applied!' : '✨ Summary enhanced by Gemini AI!');
    } catch { showToast('AI enhancement failed.', 'error'); }
    finally   { setAiLoading(false); }
  };

  const handleAiExperience = async (idx) => {
    const exp = resume.experience[idx];
    setAiLoading(true);
    try {
      const res = await enhanceExperience(exp.description, exp.jobTitle, exp.company);
      update('experience', resume.experience.map((e, i) => i === idx ? { ...e, description: res } : e));
      showToast('✨ Experience enhanced!');
    } catch { showToast('AI failed.', 'error'); }
    finally  { setAiLoading(false); }
  };

  const handleAiSkills = async () => {
    setAiLoading(true);
    try {
      const suggestions = await suggestSkills(resume.personalInfo?.jobTitle, resume.skills);
      update('skills', [...new Set([...resume.skills, ...suggestions])]);
      showToast(`✨ Added ${suggestions.length} AI-suggested skills!`);
    } catch { showToast('AI failed.', 'error'); }
    finally  { setAiLoading(false); }
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
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* ── Builder Header ─────────────────────── */}
      <header className="flex items-center gap-4 px-5 h-14 bg-white border-b border-slate-200 flex-shrink-0 z-20">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors no-underline flex-shrink-0">
          <ArrowLeft size={15} /> Dashboard
        </Link>
        <div className="flex-1 flex items-center justify-center gap-3 min-w-0">
          <span className="font-bold text-sm truncate max-w-xs">{resume.title}</span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            {saving ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : saved ? <><Check size={12} className="text-emerald-500" /> Saved</> : null}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {DEMO_MODE && (
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200">Demo Mode</span>
          )}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-secondary text-xs px-3.5 py-2 rounded-full" onClick={doSave}>
            <Save size={13} /> Save
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary text-xs px-3.5 py-2 rounded-full" onClick={handleDownload}>
            <Download size={13} /> Download PDF
          </motion.button>
        </div>
      </header>

      {/* ── Step bar ───────────────────────────── */}
      <div className="flex items-center gap-1 px-4 py-2.5 bg-white border-b border-slate-200 overflow-x-auto flex-shrink-0 scrollbar-hide">
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
      <div className="md:hidden flex bg-white border-b border-slate-200 p-2 gap-2 flex-shrink-0">
        {['form', 'preview'].map(p => (
          <button key={p} onClick={() => setPanel(p)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${panel === p ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'}`}
          >
            {p === 'form' ? 'Edit' : 'Preview'}
          </button>
        ))}
      </div>

      {/* ── Main body ──────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Form panel */}
        <div className={`w-full md:w-[480px] md:flex-shrink-0 flex flex-col bg-white border-r border-slate-200 overflow-y-auto ${panel === 'form' ? 'flex' : 'hidden md:flex'}`}>
          {/* Template & color */}
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 space-y-3">
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
          <div className="px-5 py-6 flex-1 relative overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div 
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-600 flex-shrink-0">
                    <StepIcon size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold mb-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>{STEPS[step].label}</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">{SECTION_TIPS[STEPS[step].id]}</p>
                  </div>
                </div>

                {STEPS[step].id === 'personal'   && <PersonalForm   resume={resume} update={update} />}
                {STEPS[step].id === 'summary'    && <SummaryForm    resume={resume} update={update} onAi={handleAiSummary}        aiLoading={aiLoading} />}
                {STEPS[step].id === 'experience' && <ExperienceForm resume={resume} update={update} onAi={handleAiExperience}     aiLoading={aiLoading} />}
                {STEPS[step].id === 'education'  && <EducationForm  resume={resume} update={update} />}
                {STEPS[step].id === 'projects'   && <ProjectsForm   resume={resume} update={update} />}
                {STEPS[step].id === 'skills'     && <SkillsForm     resume={resume} update={update} onAi={handleAiSkills}         aiLoading={aiLoading} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Prev / Next */}
          <div className="flex justify-between items-center px-5 py-4 border-t border-slate-100 bg-white flex-shrink-0">
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
        <div className={`flex-1 overflow-y-auto bg-slate-300 ${panel === 'preview' ? 'flex' : 'hidden md:flex'} flex-col items-center py-8 px-6`}>
          <div className="w-full max-w-[794px] bg-white shadow-2xl shadow-black/20 rounded-sm" ref={previewRef} id="resume-pdf-preview">
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
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
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

function ExperienceForm({ resume, update, onAi, aiLoading }) {
  const exps = resume.experience || [];
  const add  = () => update('experience', [...exps, { ...EMPTY_EXPERIENCE, id: uid() }]);
  const rm   = (i) => update('experience', exps.filter((_,j)=>j!==i));
  const set  = (i, k, v) => update('experience', exps.map((e,j)=>j===i?{...e,[k]:v}:e));

  return (
    <div className="space-y-3">
      {exps.length === 0 && <EmptySection icon={Briefcase} label="No experience added yet" onAdd={add} addLabel="Add Experience" />}
      {exps.map((exp,i)=>(
        <div key={exp.id||i} className="border border-slate-200 rounded-xl p-4 focus-within:border-primary-300 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">{i+1}</span><span className="font-semibold text-sm truncate">{exp.jobTitle||exp.company||'Experience'}</span></div>
            <div className="flex gap-2">
              <button className="ai-btn" onClick={()=>onAi(i)} disabled={aiLoading}>{aiLoading?<><Loader2 size={11} className="animate-spin"/>Writing…</>:<><Sparkles size={11}/>AI</>}</button>
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
        <div key={edu.id||i} className="border border-slate-200 rounded-xl p-4 focus-within:border-primary-300 transition-colors space-y-3">
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
        <div key={proj.id||i} className="border border-slate-200 rounded-xl p-4 focus-within:border-primary-300 transition-colors space-y-3">
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
