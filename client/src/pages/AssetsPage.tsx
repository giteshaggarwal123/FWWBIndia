import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useEmployees } from '../hooks/useEmployees';

type Asset = {
  _id: string;
  assetNumber: string;
  name: string;
  category: string;
  type: string;
  purchasedDate?: string;
  warrantyExpiry?: string;
  cost?: number;
  assignedTo?: { name: string; employeeId: string };
  status: string;
  location?: string;
};

const categories = ['IT', 'Furniture', 'Equipment', 'Vehicle', 'Other'];
const assetTypes = ['it', 'non-it'];

export function AssetsPage() {
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const queryClient = useQueryClient();
  const { data: employees = [] } = useEmployees();
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['assets', typeFilter],
    queryFn: async () => {
      const params = typeFilter ? `?type=${typeFilter}` : '';
      const res = await api.get<Asset[]>(`/assets${params}`);
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/assets', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['assets'] }); setModal(null); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/assets/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['assets'] }); setModal(null); setEditing(null); },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Assets' }]} />
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
        <button type="button" onClick={() => { setEditing(null); setModal('add'); }} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ Add Asset</button>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">All types</option>
          {assetTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <DataTable<Asset>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'assetNumber', label: 'Asset No.' },
          { key: 'name', label: 'Name' },
          { key: 'category', label: 'Category' },
          { key: 'type', label: 'Type' },
          { key: 'purchasedDate', label: 'Purchased', render: (r) => r.purchasedDate ? new Date(r.purchasedDate).toLocaleDateString() : '-' },
          { key: 'warrantyExpiry', label: 'Warranty', render: (r) => r.warrantyExpiry ? new Date(r.warrantyExpiry).toLocaleDateString() : '-' },
          { key: 'cost', label: 'Cost', render: (r) => r.cost != null ? `₹${Number(r.cost).toLocaleString()}` : '-' },
          { key: 'assignedTo', label: 'Assigned To', render: (r) => r.assignedTo ? (r.assignedTo as { name: string }).name : '-' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
        actions={(row) => (
          <button type="button" onClick={() => { setEditing(row); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
        )}
      />
      {modal && (
        <Modal title={editing ? 'Edit Asset' : 'Add Asset'} onClose={() => { setModal(null); setEditing(null); }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const assetNumber = (form.querySelector('[name="assetNumber"]') as HTMLInputElement)?.value;
              const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value;
              const category = (form.querySelector('[name="category"]') as HTMLSelectElement)?.value;
              const type = (form.querySelector('[name="type"]') as HTMLSelectElement)?.value;
              const purchasedDate = (form.querySelector('[name="purchasedDate"]') as HTMLInputElement)?.value;
              const warrantyExpiry = (form.querySelector('[name="warrantyExpiry"]') as HTMLInputElement)?.value;
              const cost = (form.querySelector('[name="cost"]') as HTMLInputElement)?.value;
              const assignedTo = (form.querySelector('[name="assignedTo"]') as HTMLSelectElement)?.value;
              const location = (form.querySelector('[name="location"]') as HTMLInputElement)?.value;
              if (!assetNumber || !name || !category || !type) return;
              const body = {
                assetNumber, name, category, type,
                purchasedDate: purchasedDate ? new Date(purchasedDate) : undefined,
                warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : undefined,
                cost: cost ? Number(cost) : undefined,
                assignedTo: assignedTo || undefined,
                location: location || undefined,
                status: editing?.status ?? 'active',
              };
              if (editing) updateMutation.mutate({ id: editing._id, body });
              else createMutation.mutate({ ...body, status: 'active' });
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label>Asset Number * <input name="assetNumber" required defaultValue={editing?.assetNumber} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Name * <input name="name" required defaultValue={editing?.name} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Category * <select name="category" required defaultValue={editing?.category} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
            <label>Type * <select name="type" required defaultValue={editing?.type} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{assetTypes.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
            <label>Purchased Date <input name="purchasedDate" type="date" defaultValue={editing?.purchasedDate ? new Date(editing.purchasedDate).toISOString().slice(0, 10) : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Warranty Expiry <input name="warrantyExpiry" type="date" defaultValue={editing?.warrantyExpiry ? new Date(editing.warrantyExpiry).toISOString().slice(0, 10) : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Cost (₹) <input name="cost" type="number" defaultValue={editing?.cost} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Assigned To <select name="assignedTo" defaultValue={(editing?.assignedTo && typeof editing.assignedTo === 'object' && '_id' in editing.assignedTo) ? (editing.assignedTo as { _id: string })._id : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}><option value="">—</option>{employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}</select></label>
            <label>Location <input name="location" defaultValue={editing?.location} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
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
