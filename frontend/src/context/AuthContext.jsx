import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch the current session user from the Passport backend.
   * Called on initial mount — restores auth state from the server-side session cookie.
   */
  const fetchUser = useCallback(async () => {
    try {
      const res  = await fetch('/auth/me', { credentials: 'include' });
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  /**
   * Redirect the browser to the backend Google OAuth initiation route.
   * Passport → Google → /auth/google/callback → redirects back to /dashboard.
   */
  const loginWithGoogle = () => {
    // Full page redirect — Passport handles the entire OAuth dance server-side
    window.location.href = '/auth/google';
  };

  /**
   * POST /auth/logout to destroy the server-side session & cookie,
   * then clear local user state and send to home.
   */
  const logout = async () => {
    try {
      await fetch('/auth/logout', {
        method:      'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore network errors — clear local state regardless
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, fetchUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
