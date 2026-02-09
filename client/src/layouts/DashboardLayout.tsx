import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProgramFilter, PROGRAM_FILTER_PATHS } from '../context/ProgramFilterContext';
import { useProjects } from '../hooks/useProjects';
import { NAV_SECTIONS } from '../config/nav';

export function DashboardLayout() {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const showProgramFilter = PROGRAM_FILTER_PATHS.some((p) => location.pathname === p || location.pathname.startsWith(p + '/'));
  const { selectedProjectId, setSelectedProjectId } = useProgramFilter();
  const { data: projects = [] } = useProjects();

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: 240,
          background: 'linear-gradient(180deg, #2E3192 0%, #1e2266 100%)',
          color: '#fff',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 16 }}>
          <img src="/fwwb-logo.png" alt="FWWB" style={{ maxWidth: '100%', height: 48, objectFit: 'contain', display: 'block', marginBottom: 8 }} />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>FWWB India</h2>
          <div style={{ fontSize: 13, color: '#1BADE3', marginTop: 4, fontWeight: 500 }}>Management System</div>
        </div>
        <div style={{ fontSize: 12, padding: '6px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: 6, marginBottom: 24 }}>
          {user?.role || 'User'}
        </div>
        <nav style={{ flex: 1, overflowY: 'auto' }}>
          {NAV_SECTIONS.map((section) => {
            const links = section.modules.filter((m) => hasPermission(m.key));
            if (links.length === 0) return null;
            return (
              <div key={section.title} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.8, marginBottom: 8 }}>
                  {section.title}
                </div>
                {links.map((m) => (
                  <NavLink
                    key={m.key}
                    to={m.path}
                    style={({ isActive }) => ({
                      display: 'block',
                      color: '#fff',
                      padding: '10px 12px',
                      borderRadius: 6,
                      marginBottom: 4,
                      textDecoration: 'none',
                      background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                    })}
                  >
                    {m.label}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>
      </aside>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {showProgramFilter && (
          <div style={{ padding: '10px 24px', background: '#edf2f7', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 600, color: '#2d3748' }}>Program:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: 6, minWidth: 280, fontSize: 14 }}
            >
              <option value="">All programs</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <span style={{ fontSize: 13, color: '#718096' }}>Data below is filtered by this program.</span>
          </div>
        )}
        <header
          style={{
            padding: '16px 24px',
            background: '#fff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>
            {NAV_SECTIONS.flatMap((s) => s.modules).find((m) => m.path === location.pathname)?.label || 'Dashboard'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 14, color: '#4a5568' }}>{user?.name}</span>
            <span style={{ fontSize: 12, color: '#718096' }}>{user?.role}</span>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                background: '#fff',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Logout
            </button>
          </div>
        </header>
        <main style={{ flex: 1, overflow: 'auto', padding: 24, background: '#f8f9fa' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
