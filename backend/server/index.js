import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import configurePassport from './passport.js';
import aiRoutes from './routes/ai.js';
import authRoutes from './routes/auth.js';

// ── App ──────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3001;

// ── Passport config ──────────────────────────────────────
configurePassport();

// ── CORS ─────────────────────────────────────────────────
// Allow the Vite dev server to send credentialed requests
app.use(
  cors({
    origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,  // required for session cookies
  })
);

app.use(express.json());

// ── Session ───────────────────────────────────────────────
app.use(
  session({
    secret:            process.env.SESSION_SECRET || 'resumeai-dev-secret-change-in-prod',
    resave:            false,
    saveUninitialized: false,
    cookie: {
      secure:   false,              // set to true in production (HTTPS)
      httpOnly: true,
      sameSite: 'lax',
      maxAge:   7 * 24 * 60 * 60 * 1000,  // 7 days
    },
  })
);

// ── Passport ─────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── Routes ────────────────────────────────────────────────

// Gemini AI proxy routes
app.use('/api/ai', aiRoutes);

app.use('/auth', authRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', message: 'Auth server running' }));

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  const hasGoogleCreds = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID';
  console.log(`\n🚀 Auth server running  →  http://localhost:${PORT}`);
  console.log(`📡 CORS allowed origin  →  ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  if (hasGoogleCreds) {
    console.log(`✅ Google OAuth         →  Ready`);
    console.log(`   Callback URL         →  ${process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback'}`);
  } else {
    console.log(`⚠️  Google OAuth         →  Not configured (set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env)`);
  }
  console.log('');
});
