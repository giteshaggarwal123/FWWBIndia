import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { downloadExport } from '../api/export';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { useProjects } from '../hooks/useProjects';
import { useProgramFilter } from '../context/ProgramFilterContext';

type BudgetRow = {
  _id: string;
  project?: { name: string };
  head: string;
  allocated: number;
  utilized?: number;
  spent?: number;
  variance?: number;
  variancePct?: number;
  utilizationPct?: number;
  activities?: number;
  financialYear?: string;
};

export function BudgetPage() {
  const { selectedProjectId, setSelectedProjectId } = useProgramFilter();
  const [projectFilter, setProjectFilter] = useState(selectedProjectId);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<BudgetRow | null>(null);
  const [fyFilter, setFyFilter] = useState('');
  const queryClient = useQueryClient();
  const { data: projects = [] } = useProjects();
  const { data: fyList = [] } = useQuery({
    queryKey: ['settings', 'financial-years'],
    queryFn: async () => {
      const res = await api.get<string[]>('/settings/financial-years');
      return Array.isArray(res.data) ? res.data : [];
    },
  });
  useEffect(() => {
    setProjectFilter(selectedProjectId);
  }, [selectedProjectId]);
  const onFilterChange = (id: string) => {
    setProjectFilter(id);
    setSelectedProjectId(id);
  };
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['budget', projectFilter, fyFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (projectFilter) params.project = projectFilter;
      if (fyFilter) params.financialYear = fyFilter;
      const res = await api.get<BudgetRow[]>('/budget', { params });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/budget', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['budget'] }); setModal(null); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/budget/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['budget'] }); setModal(null); setEditing(null); },
  });

  const spent = (r: BudgetRow) => r.spent ?? r.utilized ?? 0;
  const utilPct = (r: BudgetRow) => r.utilizationPct ?? (r.allocated ? Math.round((spent(r) / r.allocated) * 100) : 0);

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Budget' }]} />
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" onClick={() => { setEditing(null); setModal('add'); }} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Add Budget</button>
        <button type="button" onClick={() => downloadExport('/export/budget', 'Supraja_Budget_Report.xlsx')} style={{ padding: '10px 16px', background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Download Excel</button>
        <select value={projectFilter} onChange={(e) => onFilterChange(e.target.value)} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select value={fyFilter} onChange={(e) => setFyFilter(e.target.value)} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">All FY</option>
          {fyList.map((fy) => <option key={fy} value={fy}>{fy}</option>)}
        </select>
      </div>
      <DataTable<BudgetRow>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'project', label: 'Project', render: (r) => (r.project && typeof r.project === 'object' && 'name' in r.project ? (r.project as { name: string }).name : '-') },
          { key: 'head', label: 'Budget Head' },
          { key: 'allocated', label: 'Allocated', render: (r) => `₹${Number(r.allocated).toLocaleString()}` },
          { key: 'spent', label: 'Spent', render: (r) => `₹${Number(spent(r)).toLocaleString()}` },
          { key: 'variance', label: 'Variance', render: (r) => r.variance != null ? `₹${Number(r.variance).toLocaleString()}` : '-' },
          { key: 'variancePct', label: 'Variance %', render: (r) => r.variancePct != null ? `${r.variancePct}%` : '-' },
          { key: 'utilization', label: 'Utilization %', render: (r) => `${utilPct(r)}%` },
          { key: 'activities', label: 'Activities', render: (r) => r.activities ?? '-' },
          { key: 'financialYear', label: 'FY', render: (r) => r.financialYear ?? '-' },
        ]}
        actions={(row) => (
          <button type="button" onClick={() => { setEditing(row); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
        )}
      />
      {modal && (
        <Modal title={editing ? 'Edit Budget' : 'Add Budget'} onClose={() => { setModal(null); setEditing(null); }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const project = (form.querySelector('[name="project"]') as HTMLSelectElement)?.value;
              const head = (form.querySelector('[name="head"]') as HTMLInputElement)?.value;
              const allocated = (form.querySelector('[name="allocated"]') as HTMLInputElement)?.value;
              const utilized = (form.querySelector('[name="utilized"]') as HTMLInputElement)?.value;
              const financialYear = (form.querySelector('[name="financialYear"]') as HTMLInputElement)?.value || '2024-25';
              if (project && head) {
                const body = { project, head, allocated: Number(allocated) || 0, utilized: Number(utilized) || 0, financialYear };
                if (editing) updateMutation.mutate({ id: editing._id, body });
                else createMutation.mutate(body);
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label>Project * <select name="project" required defaultValue={(editing?.project && typeof editing.project === 'object' && '_id' in editing.project) ? (editing.project as { _id: string })._id : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></label>
            <label>Budget Head * <input name="head" required defaultValue={editing?.head} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Allocated (₹) * <input name="allocated" type="number" required defaultValue={editing?.allocated ?? 0} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Utilized (₹) <input name="utilized" type="number" defaultValue={editing?.utilized ?? editing?.spent ?? 0} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Financial Year <input name="financialYear" defaultValue={editing?.financialYear ?? '2024-25'} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => { setModal(null); setEditing(null); }} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
