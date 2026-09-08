import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    authService.getSession().then(({ session: initialSession }) => {
      setSession(initialSession);
      setUser(initialSession?.user || null);
      setLoading(false);
    });

    // Listen to Supabase auth state events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.)
    const subscription = authService.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);
    });

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email, password) => {
    const result = await authService.signIn(email, password);
    if (result.session) {
      setSession(result.session);
      setUser(result.user);
    }
    return result;
  };

  const signUp = async (params) => {
    const result = await authService.signUp(params);
    if (result.session) {
      setSession(result.session);
      setUser(result.user);
    }
    return result;
  };

  const signOut = async () => {
    const result = await authService.signOut();
    setSession(null);
    setUser(null);
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
