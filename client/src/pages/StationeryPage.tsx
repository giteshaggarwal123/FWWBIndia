import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useAuth } from '../hooks/useAuth';

type Stationery = {
  _id: string;
  requestId: string;
  requestedBy?: { name: string; username: string };
  department: string;
  purpose: string;
  items: string;
  quantity: string;
  dateNeeded?: string;
  date: string;
  status: string;
};

const purposes = ['training', 'workshop', 'general'];
const departments = ['Programs', 'Finance', 'HR', 'Admin', 'IT'];

export function StationeryPage() {
  const { approval } = useAuth();
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Stationery | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['stationery', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get<Stationery[]>(`/stationery${params}`);
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/stationery', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['stationery'] }); setModal(null); },
  });
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch<Stationery>(`/stationery/${id}`, { status }),
    onSuccess: (res) => {
      const data = res.data;
      queryClient.setQueriesData({ queryKey: ['stationery'] }, (old: Stationery[] | undefined) => {
        if (!old) return old;
        return old.map((s) => s._id === data._id ? { ...s, ...data } : s);
      });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/stationery/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['stationery'] }); setModal(null); setEditing(null); },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Stationery Request' }]} />
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
        <button type="button" onClick={() => { setEditing(null); setModal('add'); }} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ New Request</button>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">All statuses</option>
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="rejected">rejected</option>
          <option value="fulfilled">fulfilled</option>
        </select>
      </div>
      <DataTable<Stationery>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'requestId', label: 'Request ID' },
          { key: 'requestedBy', label: 'Requested By', render: (r) => r.requestedBy ? (r.requestedBy as { name: string }).name : '-' },
          { key: 'department', label: 'Department' },
          { key: 'purpose', label: 'Purpose' },
          { key: 'items', label: 'Items' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'dateNeeded', label: 'Date Needed', render: (r) => r.dateNeeded ? new Date(r.dateNeeded).toLocaleDateString() : '-' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
        actions={(row) => (
          <span>
            <button type="button" onClick={() => { setEditing(row); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
            {row.status === 'pending' && approval?.stationery && <button type="button" onClick={() => updateStatusMutation.mutate({ id: row._id, status: 'approved' })} style={{ marginRight: 8, color: '#276749', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Approve</button>}
            {row.status === 'pending' && approval?.stationery && <button type="button" onClick={() => updateStatusMutation.mutate({ id: row._id, status: 'rejected' })} style={{ color: '#c53030', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Reject</button>}
          </span>
        )}
      />
      {modal && (
        <Modal title={editing ? 'Edit Stationery Request' : 'New Stationery Request'} onClose={() => { setModal(null); setEditing(null); }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const department = (form.querySelector('[name="department"]') as HTMLSelectElement)?.value;
              const purpose = (form.querySelector('[name="purpose"]') as HTMLSelectElement)?.value;
              const items = (form.querySelector('[name="items"]') as HTMLInputElement)?.value;
              const quantity = (form.querySelector('[name="quantity"]') as HTMLInputElement)?.value;
              const dateNeeded = (form.querySelector('[name="dateNeeded"]') as HTMLInputElement)?.value;
              const status = (form.querySelector('[name="status"]') as HTMLSelectElement)?.value;
              if (!department || !items || !quantity) return;
              const body = { department, purpose: purpose || 'general', items, quantity, dateNeeded: dateNeeded ? new Date(dateNeeded) : undefined, status: status || 'pending' };
              if (editing) updateMutation.mutate({ id: editing._id, body });
              else createMutation.mutate({ requestId: `STN-${Date.now()}`, ...body });
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label>Department * <select name="department" required defaultValue={editing?.department} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{departments.map((d) => <option key={d} value={d}>{d}</option>)}</select></label>
            <label>Purpose <select name="purpose" defaultValue={editing?.purpose} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{purposes.map((p) => <option key={p} value={p}>{p}</option>)}</select></label>
            <label>Items * <input name="items" required placeholder="e.g. Pens, Notepads" defaultValue={editing?.items} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Quantity * <input name="quantity" required placeholder="e.g. 10, 5" defaultValue={editing?.quantity} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Date Needed <input name="dateNeeded" type="date" defaultValue={editing?.dateNeeded ? new Date(editing.dateNeeded).toISOString().slice(0, 10) : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            {editing && <label>Status <select name="status" defaultValue={editing?.status} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}><option value="pending">pending</option><option value="approved">approved</option><option value="rejected">rejected</option><option value="fulfilled">fulfilled</option></select></label>}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editing ? 'Save' : 'Submit')}</button>
              <button type="button" onClick={() => { setModal(null); setEditing(null); }} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
