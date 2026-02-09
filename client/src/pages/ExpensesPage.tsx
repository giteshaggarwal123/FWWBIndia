import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { uploadFile } from '../api/upload';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { BulkImportModal } from '../components/BulkImportModal';
import { useProjects } from '../hooks/useProjects';
import { useProgramFilter } from '../context/ProgramFilterContext';
import { useAuth } from '../hooks/useAuth';

type Expense = {
  _id: string;
  expenseId: string;
  project?: { _id: string; name: string };
  activity?: { _id: string; name: string };
  amount: number;
  category: string;
  description: string;
  date: string;
  submittedBy?: { name: string };
  status: string;
};

export function ExpensesPage() {
  const { approval } = useAuth();
  const { selectedProjectId, setSelectedProjectId } = useProgramFilter();
  const [projectFilter, setProjectFilter] = useState(selectedProjectId);
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'import' | null>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [uploading, setUploading] = useState(false);
  const billFileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: projects = [] } = useProjects();
  useEffect(() => {
    setProjectFilter(selectedProjectId);
  }, [selectedProjectId]);
  const onFilterChange = (id: string) => {
    setProjectFilter(id);
    setSelectedProjectId(id);
  };
  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const res = await api.get<{ _id: string; name: string; project: string }[]>('/activities');
      return res.data;
    },
  });
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['expenses', projectFilter, statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (projectFilter) params.project = projectFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get<Expense[]>('/expenses', { params });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post<Expense>('/expenses', body),
  });
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch<Expense>(`/expenses/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch<Expense>(`/expenses/${id}`, body),
  });

  const handleExpenseSubmit = async (body: Record<string, unknown>) => {
    try {
      const res = editing
        ? await updateMutation.mutateAsync({ id: editing._id, body })
        : await createMutation.mutateAsync(body);
      const id = (res as { data?: { _id: string } }).data?._id ?? editing?._id;
      if (id && billFileRef.current?.files?.[0]) {
        setUploading(true);
        await uploadFile(billFileRef.current.files[0], 'Expense', id);
      }
    } finally {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setModal(null);
      setEditing(null);
      setUploading(false);
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Expenses & Bills' }]} />
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setModal('add')} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ Add Expense</button>
        <button type="button" onClick={() => setModal('import')} style={{ padding: '10px 16px', background: '#2c5282', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Import from Excel</button>
        <select value={projectFilter} onChange={(e) => onFilterChange(e.target.value)} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="verified">Verified</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="settled">Settled</option>
        </select>
      </div>
      <DataTable<Expense>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'expenseId', label: 'ID' },
          { key: 'project', label: 'Project', render: (r) => (r.project && typeof r.project === 'object' && 'name' in r.project ? (r.project as { name: string }).name : '-') },
          { key: 'category', label: 'Category' },
          { key: 'budgetHead', label: 'Budget head', render: (r) => (r as { budgetHead?: string }).budgetHead || '—' },
          { key: 'description', label: 'Description' },
          { key: 'amount', label: 'Amount', render: (r) => `₹${Number(r.amount).toLocaleString()}` },
          { key: 'date', label: 'Date', render: (r) => r.date ? new Date(r.date).toLocaleDateString() : '' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
        actions={(row) => (
          <span>
            <button type="button" onClick={() => { setEditing(row); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
            {row.status === 'submitted' && approval?.expenseVerify && <button type="button" onClick={() => updateStatusMutation.mutate({ id: row._id, status: 'verified' })} style={{ marginRight: 8, color: '#276749', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Verify</button>}
            {['submitted', 'verified'].includes(row.status) && approval?.expenseApprove && <button type="button" onClick={() => updateStatusMutation.mutate({ id: row._id, status: 'approved' })} style={{ marginRight: 8, color: '#276749', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Approve</button>}
            {['submitted', 'verified'].includes(row.status) && approval?.expenseApprove && <button type="button" onClick={() => updateStatusMutation.mutate({ id: row._id, status: 'rejected' })} style={{ color: '#c53030', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Reject</button>}
          </span>
        )}
      />
      {modal === 'import' && (
        <BulkImportModal type="expenses" defaultProjectId={projectFilter || undefined} onClose={() => setModal(null)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['expenses'] })} />
      )}
      {modal === 'add' && (
        <Modal title="Add Expense" onClose={() => setModal(null)}>
          <ExpenseForm
            projects={projects}
            activities={activities}
            initial={null}
            onClose={() => setModal(null)}
            onSubmit={handleExpenseSubmit}
            loading={createMutation.isPending || uploading}
            billFileRef={billFileRef}
          />
        </Modal>
      )}
      {modal === 'edit' && editing && (
        <Modal title="Edit Expense" onClose={() => { setModal(null); setEditing(null); }}>
          <ExpenseForm
            projects={projects}
            activities={activities}
            initial={editing}
            onClose={() => { setModal(null); setEditing(null); }}
            onSubmit={handleExpenseSubmit}
            loading={updateMutation.isPending || uploading}
            billFileRef={billFileRef}
          />
        </Modal>
      )}
    </div>
  );
}

function ExpenseForm({
  projects,
  activities,
  initial,
  onClose,
  onSubmit,
  loading,
  billFileRef,
}: {
  projects: { _id: string; name: string }[];
  activities: { _id: string; name: string; project: string }[];
  initial: Expense | null;
  onClose: () => void;
  onSubmit: (body: Record<string, unknown>) => void | Promise<void>;
  loading: boolean;
  billFileRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const pid = initial?.project && typeof initial.project === 'object' && '_id' in initial.project ? (initial.project as { _id: string })._id : (initial?.project as string) ?? '';
  const aid = initial?.activity && typeof initial.activity === 'object' && '_id' in initial.activity ? (initial.activity as { _id: string })._id : (initial?.activity as string) ?? '';
  const [project, setProject] = useState((pid || projects[0]?._id) ?? '');
  const [activity, setActivity] = useState(aid);
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'Training');
  const [budgetHead, setBudgetHead] = useState((initial as { budgetHead?: string })?.budgetHead ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [date, setDate] = useState(initial?.date ? new Date(initial.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body: Record<string, unknown> = {
      project,
      activity: activity || undefined,
      amount: Number(amount) || 0,
      category,
      budgetHead: budgetHead.trim() || undefined,
      description,
      date: new Date(date),
    };
    if (!initial) body.expenseId = `EXP-${Date.now()}`;
    void onSubmit(body);
  };

  const getProjectId = (a: { project?: string | { _id?: string } }) =>
    a.project && typeof a.project === 'object' && '_id' in a.project
      ? (a.project as { _id: string })._id
      : typeof a.project === 'string'
        ? a.project
        : null;
  const filteredActivities = activities.filter((a) => getProjectId(a) === project);

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label>Project *
        <select value={project} onChange={(e) => { setProject(e.target.value); setActivity(''); }} required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </label>
      <label>Activity
        <select value={activity} onChange={(e) => setActivity(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">—</option>
          {filteredActivities.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
      </label>
      <label>Category * <input value={category} onChange={(e) => setCategory(e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      <label>Budget head (for utilization) <input value={budgetHead} onChange={(e) => setBudgetHead(e.target.value)} placeholder="Match budget line head" style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      <label>Amount (₹) * <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      <label>Description <input value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      <label>Date * <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      {billFileRef && <label>Bill / Receipt (optional) <input ref={billFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ width: '100%', padding: 8 }} /></label>}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save'}</button>
        <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
      </div>
    </form>
  );
}
