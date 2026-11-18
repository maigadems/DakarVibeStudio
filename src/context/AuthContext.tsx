import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken, setUnauthorizedHandler } from '../lib/api';
import type { Role, User } from '../lib/types';

interface Session { token: string; user: User }

interface AuthValue {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { first_name: string; last_name: string; email: string; password: string; phone?: string }) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  applySession: (s: Session) => User;
  refresh: () => Promise<void>;
  logout: () => void;
  setUser: (u: User) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export const homeFor = (role?: Role) =>
  role === 'admin' || role === 'super_admin' ? '/admin/dashboard' : role === 'engineer' ? '/ingenieur' : '/mon-espace';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!getToken()) {
      setReady(true);
      return;
    }
    api<{ user: User }>('/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, [logout]);

  const applySession = useCallback((s: Session) => {
    setToken(s.token);
    setUser(s.user);
    return s.user;
  }, []);

  const value = useMemo<AuthValue>(() => ({
    user,
    ready,
    applySession,
    logout,
    setUser,
    login: async (email, password) => applySession(await api<Session>('/auth/login', { method: 'POST', body: { email, password }, auth: false })),
    register: async (data) => applySession(await api<Session>('/auth/register', { method: 'POST', body: data, auth: false })),
    loginWithGoogle: async (credential) => applySession(await api<Session>('/auth/google', { method: 'POST', body: { credential }, auth: false })),
    refresh: async () => setUser((await api<{ user: User }>('/auth/me')).user)
  }), [user, ready, applySession, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth hors AuthProvider');
  return ctx;
};
