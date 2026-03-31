import express from 'express';
import passport from 'passport';

const router = express.Router();

/* ────────────────────────────────────────────────────────
 * GET /auth/google
 * Initiates Google OAuth flow — redirects the browser to Google.
 * ──────────────────────────────────────────────────────── */
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

/* ────────────────────────────────────────────────────────
 * GET /auth/google/callback
 * Google redirects here after the user approves (or denies) access.
 * On success  → redirect to frontend dashboard.
 * On failure  → redirect to login with error flag.
 * ──────────────────────────────────────────────────────── */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`,
    session: true,
  }),
  (req, res) => {
    // Successful auth — send user to dashboard
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`);
  }
);

/* ────────────────────────────────────────────────────────
 * GET /auth/me
 * Returns the currently authenticated user (from session).
 * Frontend calls this on every page load to restore user state.
 * ──────────────────────────────────────────────────────── */
router.get('/me', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    return res.json({ user: req.user });
  }
  res.json({ user: null });
});

/* ────────────────────────────────────────────────────────
 * POST /auth/logout
 * Destroy the Passport session and clear the cookie.
 * ──────────────────────────────────────────────────────── */
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });
});

export default router;
