import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function checkBackendHealth(): Promise<boolean> {
  try {
    const url = `${API_BASE.replace(/\/$/, '')}/health`;
    const res = await fetch(url, { method: 'GET', credentials: 'include', signal: AbortSignal.timeout(15000) });
    return res.ok;
  } catch {
    return false;
  }
}

const DEMO_USERS = [
  { type: 'management', label: 'Management', username: 'admin', password: 'demo123', name: 'Admin User' },
  { type: 'program', label: 'Program Team', username: 'program.user', password: 'demo123', name: 'Program User' },
  { type: 'hr', label: 'HR Team', username: 'hr.user', password: 'demo123', name: 'HR User' },
  { type: 'admin', label: 'Admin Team', username: 'admin.user', password: 'demo123', name: 'Admin Team User' },
  { type: 'employee', label: 'Employee', username: 'employee', password: 'demo123', name: 'Employee User' },
];

const DEFAULT_USER = DEMO_USERS[0];

const LOGIN_RETRIES = 3;
const RETRY_DELAY_MS = 8000;

export function LoginPage() {
  const [username, setUsername] = useState(DEFAULT_USER.username);
  const [password, setPassword] = useState(DEFAULT_USER.password);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendReady, setBackendReady] = useState<boolean | null>(null);
  const [checkingBackend, setCheckingBackend] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  const checkHealth = useCallback(async () => {
    setCheckingBackend(true);
    const ok = await checkBackendHealth();
    setBackendReady(ok);
    setCheckingBackend(false);
    return ok;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      while (!cancelled) {
        const ok = await checkBackendHealth();
        if (cancelled) return;
        setBackendReady(ok);
        setCheckingBackend(false);
        if (ok) return;
        await new Promise((r) => setTimeout(r, 5000));
      }
    };
    poll();
    return () => { cancelled = true; };
  }, []);

  const selectUser = (u: (typeof DEMO_USERS)[0]) => {
    setUsername(u.username);
    setPassword(u.password);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let lastErr: unknown;
    for (let attempt = 0; attempt < LOGIN_RETRIES; attempt++) {
      try {
        await login(username, password);
        navigate('/dashboard', { replace: true });
        return;
      } catch (err: unknown) {
        lastErr = err;
        const axErr = err as { message?: string };
        const isNetwork = axErr?.message?.includes('Network') || axErr?.message?.includes('timeout');
        if (isNetwork && attempt < LOGIN_RETRIES - 1) {
          setError(`Connecting... (attempt ${attempt + 1}/${LOGIN_RETRIES}, retrying in ${RETRY_DELAY_MS / 1000}s)`);
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          setError('');
          continue;
        }
        break;
      }
    }
    const axErr = lastErr as { response?: { data?: { message?: string; errors?: { msg?: string }[] }; status?: number }; message?: string };
    let msg = axErr?.response?.data?.message;
    if (!msg && Array.isArray(axErr?.response?.data?.errors) && axErr.response.data.errors.length > 0) {
      msg = axErr.response.data.errors.map((e: { msg?: string }) => e.msg).filter(Boolean).join('. ') || 'Invalid input';
    }
    if (!msg) {
      msg = (axErr?.message?.includes('Network') || axErr?.message?.includes('timeout'))
        ? 'Cannot reach server. Backend may be waking up. Click Retry below to check again.'
        : 'Login failed. Check username and password (e.g. admin / demo123).';
    }
    setError(msg);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #2E3192 0%, #1BADE3 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, marginBottom: 40 }}>
          <img
            src="/fwwb-logo2.webp"
            alt="FWWB Logo"
            style={{ maxWidth: 320, maxHeight: 200, objectFit: 'contain', background: 'transparent', padding: 8, border: '2px solid rgba(255,255,255,0.3)', borderRadius: 8 }}
          />
        </div>
        <h1 style={{ fontSize: 48, marginBottom: 16, textAlign: 'center' }}>FWWB India</h1>
        <p style={{ fontSize: 28, fontWeight: 600, marginBottom: 12, textAlign: 'center', opacity: 0.95 }}>Integrated Management System</p>
        <p style={{ fontSize: 18, textAlign: 'center', marginBottom: 8, opacity: 0.9 }}>Friends of Women&apos;s World Banking</p>
        <p style={{ fontSize: 14, textAlign: 'center', opacity: 0.9 }}>Empowering Millions of Indian Women</p>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 40,
          maxWidth: 500,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/fwwb-logo.png" alt="FWWB Logo" style={{ maxWidth: 200, maxHeight: 80, objectFit: 'contain' }} />
        </div>
        <h2 style={{ color: '#2d3748', marginBottom: 8, textAlign: 'center' }}>Welcome Back</h2>

        {checkingBackend || !backendReady ? (
          <div style={{ padding: 24, textAlign: 'center', background: '#f7fafc', borderRadius: 8, marginBottom: 24 }}>
            <p style={{ color: '#4a5568', marginBottom: 12 }}>
              {checkingBackend ? 'Connecting to server...' : 'Server is starting up (free tier may take 30–60 seconds)'}
            </p>
            {!checkingBackend && (
              <button
                type="button"
                onClick={() => { setCheckingBackend(true); checkHealth().then((ok) => { setBackendReady(ok); setCheckingBackend(false); }); }}
                style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
              >
                Retry connection
              </button>
            )}
          </div>
        ) : (
          <>
        <p style={{ color: '#718096', fontSize: 13, marginBottom: 24, textAlign: 'center' }}>Select your role and sign in to continue</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 24 }}>
          {DEMO_USERS.map((u) => (
            <button
              key={u.type}
              type="button"
              onClick={() => selectUser(u)}
              style={{
                padding: 12,
                border: `2px solid ${username === u.username ? '#2E3192' : '#e2e8f0'}`,
                borderRadius: 6,
                background: username === u.username ? '#edf2f7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: 13,
              }}
            >
              {u.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              style={{ width: '100%', padding: 10, border: '1px solid #e2e8f0', borderRadius: 6 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{ width: '100%', padding: 10, border: '1px solid #e2e8f0', borderRadius: 6 }}
            />
          </div>
          {error && <p style={{ color: '#e53e3e', marginBottom: 12, fontSize: 14 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 12,
              background: '#2E3192',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#718096' }}>
            101, Sakar-I, Opp. Gandhigram Railway Station<br />
            Ashram Road, Ahmedabad 380 009, Gujarat, India
          </p>
        </form>
          </>
        )}
      </div>
    </div>
  );
}
