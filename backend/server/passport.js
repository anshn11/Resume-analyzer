import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';

export default function configurePassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
        scope:        ['profile', 'email'],
      },
      (_accessToken, _refreshToken, profile, done) => {
        // Build a lightweight user object from the Google profile
        const user = {
          uid:         profile.id,
          displayName: profile.displayName,
          email:       profile.emails?.[0]?.value || '',
          photoURL:    profile.photos?.[0]?.value || '',
          given_name:  profile.name?.givenName || '',
        };
        return done(null, user);
      }
    )
  );

  // Store the entire user object in the session (no DB lookup needed)
  passport.serializeUser((user, done)   => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
}
