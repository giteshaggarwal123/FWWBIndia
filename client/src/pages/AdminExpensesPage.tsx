import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { uploadFile } from '../api/upload';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useAuth } from '../hooks/useAuth';

type AdminExpense = {
  _id: string;
  expenseId: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  submittedBy: string;
  status: string;
};

const categories = ['Office Rent', 'Utilities', 'Maintenance', 'Office Supplies', 'Communication', 'Other'];

export function AdminExpensesPage() {
  const { approval } = useAuth();
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<AdminExpense | null>(null);
  const [uploading, setUploading] = useState(false);
  const receiptFileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['admin-expenses'],
    queryFn: async () => {
      const res = await api.get<AdminExpense[]>('/admin-expenses');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post<AdminExpense>('/admin-expenses', body),
  });
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch<AdminExpense>(`/admin-expenses/${id}`, { status }),
    onSuccess: (res) => {
      const data = res.data;
      queryClient.setQueriesData({ queryKey: ['admin-expenses'] }, (old: AdminExpense[] | undefined) => {
        if (!old) return old;
        return old.map((e) => e._id === data._id ? { ...e, ...data } : e);
      });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch<AdminExpense>(`/admin-expenses/${id}`, body),
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Admin Expenses' }]} />
      <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
        <button type="button" onClick={() => { setEditing(null); setModal('add'); }} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ Submit Expense</button>
      </div>
      <DataTable<AdminExpense>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'expenseId', label: 'Expense ID' },
          { key: 'date', label: 'Date', render: (r) => r.date ? new Date(r.date).toLocaleDateString() : '' },
          { key: 'category', label: 'Category' },
          { key: 'description', label: 'Description' },
          { key: 'amount', label: 'Amount', render: (r) => `₹${Number(r.amount).toLocaleString()}` },
          { key: 'submittedBy', label: 'Submitted By' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
        actions={(row) => (
          <span>
            <button type="button" onClick={() => { setEditing(row); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
            {row.status === 'pending' && approval?.adminExpense && <button type="button" onClick={() => updateStatusMutation.mutate({ id: row._id, status: 'approved' })} style={{ marginRight: 8, color: '#276749', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Approve</button>}
            {row.status === 'pending' && approval?.adminExpense && <button type="button" onClick={() => updateStatusMutation.mutate({ id: row._id, status: 'rejected' })} style={{ color: '#c53030', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Reject</button>}
          </span>
        )}
      />
      {modal && (
        <Modal title={editing ? 'Edit Admin Expense' : 'Submit Admin Expense'} onClose={() => { setModal(null); setEditing(null); }}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const category = (form.querySelector('[name="category"]') as HTMLSelectElement)?.value;
              const description = (form.querySelector('[name="description"]') as HTMLInputElement)?.value || '';
              const amount = (form.querySelector('[name="amount"]') as HTMLInputElement)?.value;
              const date = (form.querySelector('[name="date"]') as HTMLInputElement)?.value;
              const status = (form.querySelector('[name="status"]') as HTMLSelectElement)?.value;
              if (!category || !amount || !date) return;
              const body = { category, description, amount: Number(amount), date: new Date(date), status: status || 'pending' };
              try {
                const res = editing
                  ? await updateMutation.mutateAsync({ id: editing._id, body })
                  : await createMutation.mutateAsync({ expenseId: `AEXP-${Date.now()}`, ...body });
                const id = (res as { data?: { _id: string } }).data?._id ?? editing?._id;
                if (id && receiptFileRef.current?.files?.[0]) {
                  setUploading(true);
                  await uploadFile(receiptFileRef.current.files[0], 'AdminExpense', id);
                }
              } finally {
                queryClient.invalidateQueries({ queryKey: ['admin-expenses'] });
                setModal(null);
                setEditing(null);
                setUploading(false);
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label>Category * <select name="category" required defaultValue={editing?.category} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
            <label>Description <input name="description" defaultValue={editing?.description} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Amount (₹) * <input name="amount" type="number" required defaultValue={editing?.amount} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Date * <input name="date" type="date" required defaultValue={editing?.date ? new Date(editing.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Receipt (optional) <input ref={receiptFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ width: '100%', padding: 8 }} /></label>
            {editing && <label>Status <select name="status" defaultValue={editing?.status} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}><option value="pending">pending</option><option value="approved">approved</option><option value="rejected">rejected</option></select></label>}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending || uploading} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{createMutation.isPending || updateMutation.isPending || uploading ? 'Saving...' : (editing ? 'Save' : 'Submit')}</button>
              <button type="button" onClick={() => { setModal(null); setEditing(null); }} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
