import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

type Survey = {
  _id: string;
  name: string;
  type: string;
  launchDate: string;
  responses: number;
  totalEmployees: number;
  status: string;
};

export function EngagementPage() {
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Survey | null>(null);
  const queryClient = useQueryClient();
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['engagement'],
    queryFn: async () => {
      const res = await api.get<Survey[]>('/engagement');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/engagement', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['engagement'] }); setModal(null); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/engagement/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['engagement'] }); setModal(null); setEditing(null); },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Employee Engagement' }]} />
      <div style={{ marginBottom: 24 }}>
        <button type="button" onClick={() => { setEditing(null); setModal('add'); }} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ New Survey</button>
      </div>
      <DataTable<Survey>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'name', label: 'Survey Name' },
          { key: 'type', label: 'Type' },
          { key: 'launchDate', label: 'Launch Date', render: (r) => r.launchDate ? new Date(r.launchDate).toLocaleDateString() : '' },
          { key: 'responses', label: 'Responses' },
          { key: 'totalEmployees', label: 'Total Employees' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
        actions={(row) => (
          <button type="button" onClick={() => { setEditing(row); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
        )}
      />
      {modal && (
        <Modal title={editing ? 'Edit Engagement Survey' : 'New Engagement Survey'} onClose={() => { setModal(null); setEditing(null); }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value;
              const type = (form.querySelector('[name="type"]') as HTMLSelectElement)?.value;
              const totalEmployees = (form.querySelector('[name="totalEmployees"]') as HTMLInputElement)?.value;
              const responses = (form.querySelector('[name="responses"]') as HTMLInputElement)?.value;
              const status = (form.querySelector('[name="status"]') as HTMLSelectElement)?.value;
              if (!name) return;
              const body = {
                name,
                type: type || 'annual',
                totalEmployees: Number(totalEmployees) || 0,
                responses: Number(responses) ?? editing?.responses ?? 0,
                status: status || 'active',
              };
              if (editing) updateMutation.mutate({ id: editing._id, body });
              else createMutation.mutate({ ...body, responses: 0 });
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label>Survey Name * <input name="name" required defaultValue={editing?.name} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Type <select name="type" defaultValue={editing?.type} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}><option value="annual">annual</option><option value="pulse">pulse</option><option value="exit">exit</option></select></label>
            <label>Total Employees <input name="totalEmployees" type="number" defaultValue={editing?.totalEmployees ?? 0} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            {editing && <label>Responses <input name="responses" type="number" defaultValue={editing?.responses} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>}
            {editing && <label>Status <select name="status" defaultValue={editing?.status} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}><option value="active">active</option><option value="closed">closed</option></select></label>}
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
