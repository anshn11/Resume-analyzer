import { Link } from 'react-router-dom';
import {
  Sparkles, Zap, Download, Star, ArrowRight, Check,
  Brain, Palette, Shield, LayoutTemplate, ChevronRight
} from 'lucide-react';

const FEATURES = [
  { icon: Brain,          title: 'AI-Powered Writing',   desc: 'Let Gemini AI craft compelling bullet points and summaries that pass ATS filters.' },
  { icon: LayoutTemplate, title: '4 Premium Templates',  desc: 'Classic, Modern, Minimal, and Creative designs by professional resume experts.' },
  { icon: Palette,        title: '10 Accent Colors',     desc: 'Customize your accent color to match your personal brand and industry.' },
  { icon: Download,       title: 'Instant PDF Export',   desc: 'Download a pixel-perfect PDF in one click. Optimized for digital and print.' },
  { icon: Zap,            title: 'Real-Time Preview',    desc: 'See every change live with our side-by-side preview. WYSIWYG.' },
  { icon: Shield,         title: 'Secure & Private',     desc: 'Your data stays on your device. Toggle public or private anytime.' },
];

const STEPS = [
  { num: '01', title: 'Sign in with Google', desc: 'One click authentication. No forms, no passwords, no friction.' },
  { num: '02', title: 'Fill Your Details',   desc: 'Enter your experience, education, and skills with our guided form.' },
  { num: '03', title: 'Let AI Enhance',      desc: 'Click "AI Enhance" to transform your content into recruiter-ready copy.' },
  { num: '04', title: 'Download & Apply',    desc: 'Export as a beautiful PDF and start landing those interviews.' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma',    role: 'Software Engineer @ Google',    avatar: 'PS', text: 'ResumeAI got me 3× more callbacks in a week. The AI bullet points were incredibly specific. Landed my dream job!', rating: 5 },
  { name: 'Rahul Gupta',     role: 'Product Manager @ Microsoft',   avatar: 'RG', text: "I tried many resume builders but this is on another level. The live preview is seamless and templates look premium.", rating: 5 },
  { name: 'Aisha Khan',      role: 'Data Scientist @ Amazon',       avatar: 'AK', text: "As a fresh grad I had no idea how to write my resume. The AI suggestions gave me confidence. My resume looks industry-level.", rating: 5 },
];

const STATS = [
  { value: '50K+', label: 'Resumes Created' },
  { value: '3×',   label: 'More Interviews' },
  { value: '94%',  label: 'Success Rate' },
  { value: 'Free', label: 'Always Free' },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* ── HERO ───────────────────────────────────── */}
      <section className="min-h-screen bg-gradient-hero relative overflow-hidden flex items-center pt-24 pb-20">
        {/* Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-96 h-96 rounded-full bg-purple-500 opacity-20 blur-3xl -top-20 -left-20 animate-float" />
          <div className="absolute w-72 h-72 rounded-full bg-violet-600 opacity-20 blur-3xl -bottom-10 -right-10 animate-float animation-delay-300" />
          <div className="absolute w-48 h-48 rounded-full bg-fuchsia-400 opacity-15 blur-2xl top-1/2 left-2/3 animate-float animation-delay-200" />
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center text-white relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 text-sm font-semibold mb-8 animate-fade-in-up">
            <Sparkles size={14} /> Powered by Google Gemini AI
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 animate-fade-in-up animation-delay-100">
            Build a Resume That<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #c084fc, #a855f7, #7c3aed)' }}>
              Gets You Hired
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
            Create a stunning, ATS-optimized resume in minutes using AI. Choose from premium templates,
            customize colors, and let Gemini AI write compelling content for you.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-12 animate-fade-in-up animation-delay-300">
            <Link to="/login" className="btn-primary text-lg px-8 py-4 rounded-full no-underline shadow-glow-lg">
              <Sparkles size={20} /> Create My Resume — Free
            </Link>
            <a href="#features" className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold bg-white/10 text-white border border-white/25 hover:bg-white/20 transition-all duration-200 no-underline">
              See Features <ArrowRight size={18} />
            </a>
          </div>

          {/* Trust line */}
          <div className="flex items-center justify-center gap-3 text-sm text-white/60 mb-16 animate-fade-in-up animation-delay-400">
            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={15} fill="#f59e0b" stroke="none" />)}</div>
            <span>Trusted by <strong className="text-white">50,000+</strong> job seekers worldwide</span>
          </div>

          {/* Resume mockup */}
          <div className="max-w-lg mx-auto animate-fade-in-up animation-delay-500">
            <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-float text-left" style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.4), 0 0 60px rgba(168,85,247,0.3)' }}>
              {/* Window chrome */}
              <div className="bg-slate-100 px-4 py-3 flex items-center gap-1.5 border-b border-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-slate-400 font-medium">My Resume — ResumeAI</span>
              </div>
              {/* Resume preview */}
              <div className="p-5 bg-gradient-to-r from-primary-50 to-white flex items-center gap-4 border-b border-slate-100">
                <div className="w-14 h-14 rounded-full bg-gradient-primary flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-36 bg-slate-800 rounded-full" />
                  <div className="h-3 w-28 bg-primary-300 rounded-full" />
                  <div className="h-2.5 w-44 bg-slate-200 rounded-full" />
                </div>
                <div className="flex items-center gap-1.5 bg-gradient-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  <Sparkles size={10} /> AI Enhanced
                </div>
              </div>
              <div className="p-5 space-y-2">
                <div className="h-2.5 w-24 bg-primary-200 rounded-full mb-3" />
                <div className="h-2 w-full bg-slate-100 rounded-full" />
                <div className="h-2 w-4/5 bg-slate-100 rounded-full" />
                <div className="h-2 w-full bg-slate-100 rounded-full" />
                <div className="h-2.5 w-20 bg-primary-200 rounded-full mt-3 mb-2" />
                <div className="flex flex-wrap gap-1.5">
                  {['React', 'Node.js', 'Python', 'AWS', 'TypeScript'].map(s => (
                    <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────── */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-black gradient-text mb-1">{s.value}</div>
                <div className="text-sm text-slate-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────── */}
      <section className="py-24 bg-slate-50" id="features">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="badge mb-4 mx-auto inline-flex"><Sparkles size={12} /> Features</div>
            <h2 className="section-title mb-4">
              Everything You Need to<br />
              <span className="gradient-text">Land Your Dream Job</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Professional tools powered by AI to give you the unfair advantage in your job search.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="card group">
                <div className="w-12 h-12 rounded-xl bg-gradient-card border border-primary-200 flex items-center justify-center text-primary-600 mb-5 group-hover:shadow-primary transition-all duration-200">
                  <f.icon size={22} />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────── */}
      <section className="py-24 bg-gradient-hero relative overflow-hidden" id="how-it-works">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-80 h-80 rounded-full bg-purple-500/20 blur-3xl -top-20 -right-20 animate-float" />
          <div className="absolute w-60 h-60 rounded-full bg-violet-500/20 blur-3xl -bottom-10 -left-10 animate-float animation-delay-300" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold mb-4"><Zap size={12} /> Simple Process</div>
            <h2 className="section-title text-white mb-4">From Zero to Hired in<br />4 Easy Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {STEPS.map((s, i) => (
              <div key={i} className="relative bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-7 text-white">
                <div className="text-4xl font-black gradient-text mb-4">{s.num}</div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-white/65 text-sm leading-relaxed">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-white/30 z-10">
                    <ChevronRight size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEMPLATES ──────────────────────────────── */}
      <section className="py-24 bg-white" id="templates">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="badge mb-4 mx-auto inline-flex"><LayoutTemplate size={12} /> Templates</div>
            <h2 className="section-title mb-4">
              Pick a Template That<br />
              <span className="gradient-text">Represents You</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              4 professionally designed templates — each customizable with 10 accent colors.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {[
              { name: 'Classic',  color: 'bg-primary-600', popular: false },
              { name: 'Modern',   color: 'bg-slate-900',   popular: true },
              { name: 'Minimal',  color: 'bg-white border-b-2 border-primary-600', popular: false },
              { name: 'Creative', color: '',               popular: false, gradient: true },
            ].map((t, i) => (
              <div key={t.name} className="group cursor-pointer">
                <div className="border-2 border-slate-200 rounded-xl overflow-hidden aspect-[3/4] group-hover:border-primary-400 group-hover:shadow-primary transition-all duration-200">
                  <div className={`h-8 ${t.gradient ? 'bg-gradient-primary' : t.color}`} />
                  <div className="bg-white p-3 flex flex-col gap-1.5 flex-1">
                    <div className="h-2.5 w-2/3 bg-slate-700 rounded-full" />
                    <div className="h-2 w-1/2 bg-primary-300 rounded-full" />
                    <div className="h-2 w-full bg-slate-100 rounded-full" />
                    <div className="h-2 w-4/5 bg-slate-100 rounded-full" />
                    <div className="h-2 w-full bg-slate-100 rounded-full" />
                    <div className="h-2 w-3/4 bg-slate-100 rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between px-1 pt-3">
                  <span className="font-semibold text-sm">{t.name}</span>
                  {t.popular && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">Popular</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/login" className="btn-primary text-base px-8 py-3 rounded-full no-underline inline-flex">
              Use These Templates Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="badge mb-4 mx-auto inline-flex"><Star size={12} /> Success Stories</div>
            <h2 className="section-title mb-4">
              Join 50,000+ Job Seekers<br />
              <span className="gradient-text">Who Got Hired</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} fill="#f59e0b" stroke="none" />)}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{t.avatar}</div>
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section className="py-24 bg-gradient-hero relative overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-80 h-80 rounded-full bg-purple-500/25 blur-3xl -top-20 -left-20 animate-float" />
          <div className="absolute w-64 h-64 rounded-full bg-violet-500/25 blur-3xl -bottom-10 -right-10 animate-float animation-delay-300" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <Sparkles size={44} className="text-purple-400 mx-auto mb-6 animate-float" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-lg text-white/70 mb-10 leading-relaxed">
            Join 50,000+ professionals who built their resumes with ResumeAI. Free, fast, and powerful.
          </p>
          <Link to="/login" className="btn-primary text-lg px-10 py-4 rounded-full no-underline inline-flex shadow-glow-lg">
            Start Building Now — It's Free <ArrowRight size={19} />
          </Link>
          <p className="flex items-center justify-center gap-3 mt-6 text-sm text-white/50">
            <span className="flex items-center gap-1"><Check size={13} /> No credit card</span>
            <span className="flex items-center gap-1"><Check size={13} /> No sign-up form</span>
            <span className="flex items-center gap-1"><Check size={13} /> Just Google</span>
          </p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center"><Sparkles size={15} className="text-white" /></div>
                <span className="text-white font-bold text-lg">ResumeAI</span>
              </div>
              <p className="text-sm leading-relaxed">AI-powered resume builder for modern professionals.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Product</h4>
              <div className="flex flex-col gap-2 text-sm">
                {['Features', 'Templates', 'How it Works'].map(l => (
                  <a key={l} href={`/#${l.toLowerCase().replace(/ /g, '-')}`} className="hover:text-primary-400 transition-colors no-underline">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Get Started</h4>
              <div className="flex flex-col gap-2 text-sm">
                <Link to="/login" className="hover:text-primary-400 transition-colors no-underline">Sign In with Google</Link>
                <Link to="/dashboard" className="hover:text-primary-400 transition-colors no-underline">Dashboard</Link>
              </div>
            </div>
          </div>
          <div className="pt-6 text-center text-xs text-slate-600">
            © 2025 ResumeAI. Built with ❤️ and AI.
          </div>
        </div>
      </footer>
    </div>
  );
}
