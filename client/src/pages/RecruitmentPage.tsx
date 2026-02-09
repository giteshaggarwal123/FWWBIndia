import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

type Job = {
  _id: string;
  title: string;
  department: string;
  location: string;
  postedOn: string;
  applications: number;
  status: string;
};

const departments = ['Programs', 'Finance', 'HR', 'Admin', 'IT'];

export function RecruitmentPage() {
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Job | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['recruitment', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await api.get<Job[]>('/recruitment', { params });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/recruitment', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['recruitment'] }); setModal(null); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/recruitment/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['recruitment'] }); setModal(null); setEditing(null); },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Recruitment' }]} />
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" onClick={() => { setEditing(null); setModal('add'); }} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ New Job Posting</button>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <DataTable<Job>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'title', label: 'Position' },
          { key: 'department', label: 'Department' },
          { key: 'location', label: 'Location' },
          { key: 'postedOn', label: 'Posted On', render: (r) => r.postedOn ? new Date(r.postedOn).toLocaleDateString() : '' },
          { key: 'applications', label: 'Applications' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
        actions={(row) => (
          <button type="button" onClick={() => { setEditing(row); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
        )}
      />
      {modal && (
        <Modal title={editing ? 'Edit Job Posting' : 'New Job Posting'} onClose={() => { setModal(null); setEditing(null); }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const title = (form.querySelector('[name="title"]') as HTMLInputElement)?.value;
              const department = (form.querySelector('[name="department"]') as HTMLSelectElement)?.value;
              const location = (form.querySelector('[name="location"]') as HTMLInputElement)?.value;
              const status = (form.querySelector('[name="status"]') as HTMLSelectElement)?.value;
              if (!title || !department || !location) return;
              const body = { title, department, location, status: status || 'active' };
              if (editing) updateMutation.mutate({ id: editing._id, body });
              else createMutation.mutate({ ...body, applications: 0, status: status || 'active' });
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label>Position * <input name="title" required defaultValue={editing?.title} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Department * <select name="department" required defaultValue={editing?.department} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{departments.map((d) => <option key={d} value={d}>{d}</option>)}</select></label>
            <label>Location * <input name="location" required defaultValue={editing?.location} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            {editing && <label>Status <select name="status" defaultValue={editing?.status} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}><option value="active">Active</option><option value="closed">Closed</option></select></label>}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editing ? 'Save' : 'Post')}</button>
              <button type="button" onClick={() => { setModal(null); setEditing(null); }} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
