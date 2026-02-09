import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';

type AuditEntry = {
  _id: string;
  action: string;
  userId: string;
  userName?: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  createdAt: string;
};

export function AuditLogPage() {
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: async () => {
      const res = await api.get<AuditEntry[]>('/audit');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const handleExport = async () => {
    try {
      const res = await api.get<string>('/audit/export', { params: { format: 'csv' }, responseType: 'text' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit-log.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(`${api.defaults.baseURL || ''}/audit/export?format=csv`, '_blank');
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Audit Log' }]} />
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ margin: 0, color: '#4a5568' }}>
          Recent key actions (who, when, what). Management and HR can view this log.
        </p>
        <button type="button" onClick={handleExport} style={{ padding: '10px 16px', background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Export CSV</button>
      </div>
      <DataTable<AuditEntry>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'createdAt', label: 'When', render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : '—' },
          { key: 'action', label: 'Action' },
          { key: 'userName', label: 'User', render: (r) => r.userName || r.userId || '—' },
          { key: 'entityType', label: 'Entity', render: (r) => r.entityType || '—' },
          { key: 'details', label: 'Details', render: (r) => r.details || r.entityId || '—' },
        ]}
      />
    </div>
  );
}
