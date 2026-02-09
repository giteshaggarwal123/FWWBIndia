import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';

type Program = {
  _id: string;
  name: string;
  code?: string;
  donor?: string;
  partner?: { name: string };
  activityCount: number;
  allocated: number;
  utilized: number;
  utilizationPercent: number;
};

export function DonorPortalPage() {
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['donor-portal', 'programs'],
    queryFn: async () => {
      const res = await api.get<Program[]>('/donor-portal/programs');
      return res.data;
    },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Donor Portal' }]} />
      <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', padding: 20, borderRadius: 8, marginBottom: 24, borderLeft: '4px solid #10b981' }}>
        <strong style={{ color: '#047857' }}>View-only access</strong>
        <p style={{ margin: '8px 0 0', color: '#065f46', fontSize: 14 }}>
          View your funded programs, financial utilization, and impact metrics. No access to internal operations.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#718096' }}>Funded Programs</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{programs.length}</div>
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#718096' }}>Total Allocated</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            ₹{(programs.reduce((s, p) => s + (p.allocated || 0), 0) / 100000).toFixed(1)}L
          </div>
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#718096' }}>Total Utilized</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            ₹{(programs.reduce((s, p) => s + (p.utilized || 0), 0) / 100000).toFixed(1)}L
          </div>
        </div>
      </div>
      <DataTable<Program>
        keyField="_id"
        data={programs}
        loading={isLoading}
        columns={[
          { key: 'name', label: 'Program' },
          { key: 'partner', label: 'Partner', render: (r) => (r.partner && typeof r.partner === 'object' && 'name' in r.partner ? (r.partner as { name: string }).name : '-') },
          { key: 'donor', label: 'Donor' },
          { key: 'activityCount', label: 'Activities' },
          { key: 'allocated', label: 'Allocated', render: (r) => `₹${Number(r.allocated || 0).toLocaleString()}` },
          { key: 'utilized', label: 'Utilized', render: (r) => `₹${Number(r.utilized || 0).toLocaleString()}` },
          { key: 'utilizationPercent', label: '% Used', render: (r) => `${r.utilizationPercent || 0}%` },
        ]}
        actions={(row) => (
          <Link to={`/donor-portal/program/${row._id}`} style={{ color: '#2E3192', fontSize: 13 }}>View Details</Link>
        )}
      />
    </div>
  );
}
