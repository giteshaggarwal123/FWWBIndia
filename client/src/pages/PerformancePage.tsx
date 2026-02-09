import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useEmployees } from '../hooks/useEmployees';
import { useUsers } from '../hooks/useUsers';

type Review = {
  _id: string;
  employee?: { name: string; employeeId: string; designation?: string };
  reviewer?: { name: string };
  period: string;
  status: string;
  rating?: number;
};

export function PerformancePage() {
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Review | null>(null);
  const queryClient = useQueryClient();
  const { data: employees = [] } = useEmployees();
  const { data: users = [] } = useUsers();
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['performance'],
    queryFn: async () => {
      const res = await api.get<Review[]>('/performance');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/performance', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['performance'] }); setModal(null); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/performance/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['performance'] }); setModal(null); setEditing(null); },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Performance' }]} />
      <div style={{ marginBottom: 24 }}>
        <button type="button" onClick={() => { setEditing(null); setModal('add'); }} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ New Review</button>
      </div>
      <DataTable<Review>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'employee', label: 'Employee', render: (r) => r.employee ? (r.employee as { name: string }).name : '-' },
          { key: 'period', label: 'Period' },
          { key: 'reviewer', label: 'Reviewer', render: (r) => r.reviewer ? (r.reviewer as { name: string }).name : '-' },
          { key: 'rating', label: 'Rating', render: (r) => r.rating ?? '-' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
        actions={(row) => (
          <button type="button" onClick={() => { setEditing(row); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
        )}
      />
      {modal && (
        <Modal title={editing ? 'Edit Performance Review' : 'New Performance Review'} onClose={() => { setModal(null); setEditing(null); }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const employee = (form.querySelector('[name="employee"]') as HTMLSelectElement)?.value;
              const period = (form.querySelector('[name="period"]') as HTMLInputElement)?.value;
              const reviewer = (form.querySelector('[name="reviewer"]') as HTMLSelectElement)?.value;
              const rating = (form.querySelector('[name="rating"]') as HTMLInputElement)?.value;
              const status = (form.querySelector('[name="status"]') as HTMLSelectElement)?.value;
              if (!employee || !period || !reviewer) return;
              const body: Record<string, unknown> = { employee, period, reviewer, status: status || 'pending' };
              if (rating) body.rating = Number(rating);
              if (editing) updateMutation.mutate({ id: editing._id, body });
              else createMutation.mutate(body);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label>Employee * <select name="employee" required defaultValue={editing?.employee && typeof editing.employee === 'object' && '_id' in editing.employee ? (editing.employee as { _id: string })._id : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{employees.map((e) => <option key={e._id} value={e._id}>{e.employeeId} - {e.name}</option>)}</select></label>
            <label>Period * <input name="period" required placeholder="e.g. Q1 2024" defaultValue={editing?.period} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Reviewer * <select name="reviewer" required defaultValue={editing?.reviewer && typeof editing.reviewer === 'object' && '_id' in editing.reviewer ? (editing.reviewer as { _id: string })._id : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}</select></label>
            <label>Rating <input name="rating" type="number" min={1} max={5} defaultValue={editing?.rating} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            {editing && <label>Status <select name="status" defaultValue={editing?.status} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}><option value="pending">pending</option><option value="completed">completed</option></select></label>}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editing ? 'Save' : 'Create')}</button>
              <button type="button" onClick={() => { setModal(null); setEditing(null); }} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
