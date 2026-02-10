import { API_BASE_URL } from '../config';
import * as storage from './storage';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

const REQUEST_TIMEOUT_MS = 15000;

export type User = { id: string; username: string; name: string; role: string; type: string };

let accessToken: string | null = null;

export async function getStoredToken(): Promise<string | null> {
  if (accessToken) return accessToken;
  accessToken = await storage.storageGetItem(ACCESS_TOKEN_KEY);
  return accessToken;
}

export async function setStoredAuth(tokens: { accessToken: string; refreshToken?: string }, user?: User): Promise<void> {
  accessToken = tokens.accessToken;
  await storage.storageSetItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) await storage.storageSetItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  if (user) await storage.storageSetItem(USER_KEY, JSON.stringify(user));
}

export async function getStoredUser(): Promise<User | null> {
  try {
    const raw = await storage.storageGetItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function getStoredRefreshToken(): Promise<string | null> {
  return storage.storageGetItem(REFRESH_TOKEN_KEY);
}

export async function clearStoredAuth(): Promise<void> {
  accessToken = null;
  await storage.storageDeleteItem(ACCESS_TOKEN_KEY);
  await storage.storageDeleteItem(REFRESH_TOKEN_KEY);
  await storage.storageDeleteItem(USER_KEY);
}

export function setAccessToken(token: string) {
  accessToken = token;
}

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    ),
  ]);
}

async function refreshAuth(): Promise<boolean> {
  const refreshToken = await getStoredRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/auth/refresh`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      },
      REQUEST_TIMEOUT_MS
    );
    if (!res.ok) return false;
    const data = await res.json();
    await setStoredAuth(
      { accessToken: data.accessToken, refreshToken: data.refreshToken ?? refreshToken },
      data.user
    );
    return true;
  } catch {
    return false;
  }
}

type RequestOptions = RequestInit & { skipAuth?: boolean };

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data?: T; ok: boolean; status: number }> {
  const { skipAuth, ...init } = options;
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  let token = skipAuth ? null : await getStoredToken();

  const doFetch = (t: string | null) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init.headers as Record<string, string>) };
    if (t) headers.Authorization = `Bearer ${t}`;
    return fetchWithTimeout(url, { ...init, headers }, REQUEST_TIMEOUT_MS);
  };

  let res: Response;
  try {
    res = await doFetch(token);
  } catch (err) {
    return {
      data: undefined,
      ok: false,
      status: 0,
    };
  }
  if (res.status === 401 && !skipAuth && token) {
    const refreshed = await refreshAuth();
    if (refreshed) {
      token = await getStoredToken();
      try {
        res = await doFetch(token);
      } catch {
        return { data: undefined, ok: false, status: 0 };
      }
    }
  }

  const status = res.status;
  const ok = res.ok;
  let data: T | undefined;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text) as T;
    } catch {
      data = undefined;
    }
  }
  return { data, ok, status };
}

/** Upload a file (bill/receipt) for an expense. uri from document picker. */
export async function uploadFile(
  uri: string,
  name: string,
  mimeType: string,
  refModel: string,
  refId: string
): Promise<{ ok: boolean; status: number }> {
  const formData = new FormData();
  (formData as any).append('file', { uri, type: mimeType || 'application/octet-stream', name });
  formData.append('refModel', refModel);
  formData.append('refId', refId);
  const token = await getStoredToken();
  const url = `${API_BASE_URL}/files/upload`;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetchWithTimeout(url, { method: 'POST', body: formData, headers }, REQUEST_TIMEOUT_MS);
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: object, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: object, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
