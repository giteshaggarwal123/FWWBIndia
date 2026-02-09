import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { Link } from 'react-router-dom';

export function ESSPage() {
  const { data: profile } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await api.get<{ user: { id: string; username: string; name: string; role: string } }>('/auth/me');
      return res.data;
    },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Employee Self Service' }]} />
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: 600 }}>
        <h2 style={{ marginTop: 0 }}>Employee Self Service</h2>
        {profile?.user && (
          <div style={{ marginBottom: 24, padding: 16, background: '#f7fafc', borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Your profile</h3>
            <p style={{ margin: 0, color: '#4a5568' }}><strong>Name:</strong> {profile.user.name}</p>
            <p style={{ margin: '4px 0 0 0', color: '#4a5568' }}><strong>Username:</strong> {profile.user.username}</p>
            <p style={{ margin: '4px 0 0 0', color: '#4a5568' }}><strong>Role:</strong> {profile.user.role}</p>
          </div>
        )}
        <p style={{ color: '#4a5568', marginBottom: 16 }}>Use the modules below to view and manage your information:</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: 12 }}><Link to="/leave" style={{ color: '#2E3192', textDecoration: 'none', fontWeight: 500 }}>Leave</Link> – Apply and track leave requests</li>
          <li style={{ marginBottom: 12 }}><Link to="/attendance" style={{ color: '#2E3192', textDecoration: 'none', fontWeight: 500 }}>Attendance</Link> – View attendance records</li>
          <li style={{ marginBottom: 12 }}><Link to="/engagement" style={{ color: '#2E3192', textDecoration: 'none', fontWeight: 500 }}>Employee Engagement</Link> – Surveys and feedback</li>
          <li><Link to="/calendar" style={{ color: '#2E3192', textDecoration: 'none', fontWeight: 500 }}>Calendar</Link> – Events and holidays</li>
        </ul>
      </div>
    </div>
  );
}
