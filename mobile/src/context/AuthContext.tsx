import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from '../api/client';
import * as api from '../api/client';

type AuthState = { user: User | null; permissions: string[]; loading: boolean };

const AuthContext = createContext<{
  user: User | null;
  permissions: string[];
  hasPermission: (key: string) => boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, permissions: [], loading: true });

  const hasPermission = useCallback((key: string) => state.permissions.includes(key), [state.permissions]);

  const refreshUser = useCallback(async () => {
    const user = await api.getStoredUser();
    const token = await api.getStoredToken();
    let permissions: string[] = [];
    if (token) {
      const res = await api.api.get<{ permissions: string[] }>('/auth/permissions');
      if (res.ok && res.data?.permissions) permissions = res.data.permissions;
    }
    setState((s) => ({ ...s, user: token ? user : null, permissions, loading: false }));
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const user = await api.getStoredUser();
      const token = await api.getStoredToken();
      let permissions: string[] = [];
      if (token) {
        const res = await api.api.get<{ permissions: string[] }>('/auth/permissions');
        if (res.ok && res.data?.permissions) permissions = res.data.permissions;
      }
      if (mounted) setState({ user: token ? user : null, permissions, loading: false });
    })();
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { data, ok, status } = await api.api.post<{ user: User; accessToken: string; refreshToken?: string }>(
      '/auth/login',
      { username, password },
      { skipAuth: true }
    );
    if (!ok || !data?.accessToken || !data.user) {
      const message =
        (data as { message?: string })?.message ||
        (status === 401 ? 'Invalid username or password' : status === 0 ? 'Network error or timeout. Is the backend running on port 5000?' : 'Login failed');
      return { ok: false, message };
    }
    await api.setStoredAuth(
      { accessToken: data.accessToken, refreshToken: data.refreshToken },
      data.user
    );
    let permissions: string[] = [];
    const permRes = await api.api.get<{ permissions: string[] }>('/auth/permissions');
    if (permRes.ok && permRes.data?.permissions) permissions = permRes.data.permissions;
    setState({ user: data.user, permissions, loading: false });
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await api.clearStoredAuth();
    setState({ user: null, permissions: [], loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, hasPermission, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
