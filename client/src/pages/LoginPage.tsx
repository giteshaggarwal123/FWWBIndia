import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DEMO_USERS = [
  { type: 'management', label: 'Management', username: 'admin', password: 'demo123', name: 'Admin User' },
  { type: 'program', label: 'Program Team', username: 'program.user', password: 'demo123', name: 'Program User' },
  { type: 'hr', label: 'HR Team', username: 'hr.user', password: 'demo123', name: 'HR User' },
  { type: 'admin', label: 'Admin Team', username: 'admin.user', password: 'demo123', name: 'Admin Team User' },
  { type: 'employee', label: 'Employee', username: 'employee', password: 'demo123', name: 'Employee User' },
];

const DEFAULT_USER = DEMO_USERS[0];

export function LoginPage() {
  const [username, setUsername] = useState(DEFAULT_USER.username);
  const [password, setPassword] = useState(DEFAULT_USER.password);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const selectUser = (u: (typeof DEMO_USERS)[0]) => {
    setUsername(u.username);
    setPassword(u.password);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string; errors?: { msg?: string }[] }; status?: number }; message?: string };
      let msg = axErr?.response?.data?.message;
      if (!msg && Array.isArray(axErr?.response?.data?.errors) && axErr.response.data.errors.length > 0) {
        msg = axErr.response.data.errors.map((e: { msg?: string }) => e.msg).filter(Boolean).join('. ') || 'Invalid input';
      }
      if (!msg) {
        msg = (axErr?.message?.includes('Network') || axErr?.message?.includes('timeout'))
          ? 'Cannot reach server. If using Render free tier, the backend may be waking up—wait 30–60 seconds and try again.'
          : 'Login failed. Check username and password (e.g. admin / demo123).';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
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
      </div>
    </div>
  );
}
