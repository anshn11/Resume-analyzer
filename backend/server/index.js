import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import mongoose from 'mongoose';
import configurePassport from './passport.js';
import aiRoutes from './routes/ai.js';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resumes.js';

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

// ── Session ───────────────────────────────────────────
app.use(
  session({
    secret:            process.env.SESSION_SECRET || 'nextoffer-dev-secret-change-in-prod',
    resave:            false,
    saveUninitialized: false,
    cookie: {
      secure:   false,   // HTTP in dev
      httpOnly: true,
      sameSite: 'lax',
      maxAge:   7 * 24 * 60 * 60 * 1000,  // 7 days
      // Do NOT set domain — let the browser scope it to whatever host sent the request
    },
  })
);

// ── Passport ─────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── Routes ────────────────────────────────────────────────

// Gemini AI proxy routes
app.use('/api/ai', aiRoutes);
app.use('/api/resumes', resumeRoutes);

app.use('/auth', authRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', message: 'Auth server running' }));

// ── MongoDB ───────────────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('\n❌  MONGODB_URI is not set in .env  — add it and restart.\n');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB             →  Connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const hasGoogleCreds = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID';
  const hasMongoUri    = !!process.env.MONGODB_URI;
  console.log(`\n🚀 Auth server running  →  http://localhost:${PORT}`);
  console.log(`📡 CORS allowed origin  →  ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🗄️  MongoDB Atlas        →  ${hasMongoUri ? 'URI set ✓' : '⚠️  MONGODB_URI missing'}`);
  if (hasGoogleCreds) {
    console.log(`✅ Google OAuth         →  Ready`);
    console.log(`   Callback URL         →  ${process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback'}`);
  } else {
    console.log(`⚠️  Google OAuth         →  Not configured (set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env)`);
  }
  console.log('');
});
