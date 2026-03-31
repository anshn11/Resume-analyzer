import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, Zap, Clock, AlertCircle } from 'lucide-react';

const PERKS = [
  { icon: Shield, text: 'Your data stays on your device — no third-party servers' },
  { icon: Zap,    text: 'One click — no forms, no passwords, no friction' },
  { icon: Clock,  text: 'Ready in under 30 seconds' },
];

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const [searchParams]      = useSearchParams();
  const [loading, setLoading] = useState(false);
  const oauthError = searchParams.get('error');

  // If the backend redirected back with ?error=oauth_failed, show it
  const errorMsg = oauthError === 'oauth_failed'
    ? 'Google sign-in failed or was cancelled. Please try again.'
    : null;

  const handleLogin = () => {
    setLoading(true);
    loginWithGoogle(); // redirects browser to /auth/google → Passport → Google
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden flex items-center justify-center px-6 py-20">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full bg-purple-500/25 blur-3xl -top-24 -left-20 animate-float" />
        <div className="absolute w-72 h-72 rounded-full bg-violet-600/20 blur-3xl -bottom-16 -right-16 animate-float animation-delay-300" />
        <div className="absolute w-48 h-48 rounded-full bg-fuchsia-400/15 blur-2xl top-1/2 right-10 animate-float animation-delay-200" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 animate-fade-in-up">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 no-underline mb-8">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
              <Sparkles size={19} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-primary-700" style={{ fontFamily: 'Outfit, sans-serif' }}>NextOffer</span>
          </Link>

          <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Welcome to NextOffer
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Sign in with Google to access your AI-powered resume builder.
            <strong className="text-slate-700"> No registration needed.</strong>
          </p>

          {/* OAuth error */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2.5">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Sign-in Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-semibold text-base hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
          >
            {loading ? (
              <>
                <div className="spinner-dark" />
                <span>Redirecting to Google…</span>
              </>
            ) : (
              <>
                {/* Google SVG logo */}
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400 mt-3">
            Secured by Passport.js + Google OAuth 2.0
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-medium">Why Google?</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Perks */}
          <div className="space-y-3">
            {PERKS.map((p, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                  <p.icon size={15} />
                </div>
                {p.text}
              </div>
            ))}
          </div>
        </div>

        {/* Setup badge */}
        <div className="mt-5 text-center">
        </div>
      </div>
    </div>
  );
}
