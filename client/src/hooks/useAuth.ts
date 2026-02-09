import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  type: string;
}

export interface ApprovalPermissions {
  leave: boolean;
  expenseVerify: boolean;
  expenseApprove: boolean;
  adminExpense: boolean;
  travel: boolean;
  stationery?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [approval, setApproval] = useState<ApprovalPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      setPermissions([]);
      setApproval(null);
      setLoading(false);
      return;
    }
    try {
      const [meRes, permRes] = await Promise.all([
        api.get<{ user: User }>('/auth/me'),
        api.get<{ permissions: string[]; approval?: ApprovalPermissions }>('/auth/permissions'),
      ]);
      setUser(meRes.data.user);
      setPermissions(permRes.data.permissions || []);
      setApproval(permRes.data.approval ?? null);
    } catch {
      setUser(null);
      setPermissions([]);
      setApproval(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (username: string, password: string) => {
      const { data } = await api.post<{ user: User; accessToken: string }>('/auth/login', { username, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      await loadUser();
    },
    [loadUser]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore – clear local state regardless */
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      setPermissions([]);
      setApproval(null);
      window.location.href = '/login';
    }
  }, []);

  const hasPermission = useCallback(
    (moduleKey: string) => permissions.includes(moduleKey),
    [permissions]
  );

  return { user, permissions, approval, loading, login, logout, loadUser, hasPermission };
}
