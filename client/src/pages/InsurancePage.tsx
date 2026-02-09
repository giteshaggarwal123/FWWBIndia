import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';

type Policy = {
  _id: string;
  policyNumber: string;
  type: string;
  provider: string;
  startDate: string;
  endDate: string;
  sumInsured?: number;
  premium?: number;
  status: string;
};

const policyTypes = ['medical', 'group-accident', 'vehicle', 'fire-safety', 'd-and-o'];

export function InsurancePage() {
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Policy | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const queryClient = useQueryClient();
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['insurance', typeFilter],
    queryFn: async () => {
      const params = typeFilter ? `?type=${typeFilter}` : '';
      const res = await api.get<Policy[]>(`/insurance${params}`);
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/insurance', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['insurance'] }); setModal(null); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/insurance/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['insurance'] }); setModal(null); setEditing(null); },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Insurance' }]} />
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
        <button type="button" onClick={() => { setEditing(null); setModal('add'); }} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ Add Policy</button>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">All types</option>
          {policyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <DataTable<Policy>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'policyNumber', label: 'Policy No.' },
          { key: 'type', label: 'Type' },
          { key: 'provider', label: 'Provider' },
          { key: 'startDate', label: 'Start', render: (r) => r.startDate ? new Date(r.startDate).toLocaleDateString() : '' },
          { key: 'endDate', label: 'End', render: (r) => r.endDate ? new Date(r.endDate).toLocaleDateString() : '' },
          { key: 'sumInsured', label: 'Sum Insured', render: (r) => r.sumInsured != null ? `₹${Number(r.sumInsured).toLocaleString()}` : '-' },
          { key: 'premium', label: 'Premium', render: (r) => r.premium != null ? `₹${Number(r.premium).toLocaleString()}` : '-' },
          { key: 'status', label: 'Status' },
        ]}
        actions={(row) => (
          <button type="button" onClick={() => { setEditing(row); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
        )}
      />
      {modal && (
        <Modal title={editing ? 'Edit Insurance Policy' : 'Add Insurance Policy'} onClose={() => { setModal(null); setEditing(null); }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const policyNumber = (form.querySelector('[name="policyNumber"]') as HTMLInputElement)?.value;
              const type = (form.querySelector('[name="type"]') as HTMLSelectElement)?.value;
              const provider = (form.querySelector('[name="provider"]') as HTMLInputElement)?.value;
              const startDate = (form.querySelector('[name="startDate"]') as HTMLInputElement)?.value;
              const endDate = (form.querySelector('[name="endDate"]') as HTMLInputElement)?.value;
              const sumInsured = (form.querySelector('[name="sumInsured"]') as HTMLInputElement)?.value;
              const premium = (form.querySelector('[name="premium"]') as HTMLInputElement)?.value;
              if (!policyNumber || !type || !provider || !startDate || !endDate) return;
              const body = {
                policyNumber, type, provider,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                sumInsured: sumInsured ? Number(sumInsured) : undefined,
                premium: premium ? Number(premium) : undefined,
                status: editing?.status ?? 'active',
              };
              if (editing) updateMutation.mutate({ id: editing._id, body });
              else createMutation.mutate({ ...body, status: 'active' });
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label>Policy Number * <input name="policyNumber" required defaultValue={editing?.policyNumber} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Type * <select name="type" required defaultValue={editing?.type} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{policyTypes.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
            <label>Provider * <input name="provider" required defaultValue={editing?.provider} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Start Date * <input name="startDate" type="date" required defaultValue={editing?.startDate ? new Date(editing.startDate).toISOString().slice(0, 10) : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>End Date * <input name="endDate" type="date" required defaultValue={editing?.endDate ? new Date(editing.endDate).toISOString().slice(0, 10) : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Sum Insured (₹) <input name="sumInsured" type="number" defaultValue={editing?.sumInsured} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Premium (₹) <input name="premium" type="number" defaultValue={editing?.premium} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editing ? 'Save' : 'Add')}</button>
              <button type="button" onClick={() => { setModal(null); setEditing(null); }} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
