import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { downloadExport } from '../api/export';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { BulkImportModal } from '../components/BulkImportModal';
import { useProjects } from '../hooks/useProjects';
import { useProgramFilter } from '../context/ProgramFilterContext';

type Activity = {
  _id: string;
  activityId: string;
  name: string;
  project?: { _id?: string; name: string };
  budget: number;
  expenses?: number;
  variance?: number;
  billStatus?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  quarter?: string;
  location?: string;
  expectedParticipants?: number;
  actualParticipants?: number;
  achievementRate?: number;
  budgetHead?: string;
  lfaObjectiveRef?: string;
};

const statusOptions = ['planned', 'in-progress', 'completed', 'delayed'];

const PAGE_SIZE = 20;

export function ActivitiesPage() {
  const { selectedProjectId, setSelectedProjectId } = useProgramFilter();
  const [projectFilter, setProjectFilter] = useState(selectedProjectId);
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<'add' | 'edit' | 'import' | null>(null);
  const [editing, setEditing] = useState<Activity | null>(null);
  const queryClient = useQueryClient();
  const { data: projects = [] } = useProjects();
  useEffect(() => {
    setProjectFilter(selectedProjectId);
  }, [selectedProjectId]);
  const onFilterChange = (id: string) => {
    setProjectFilter(id);
    setSelectedProjectId(id);
    setPage(0);
  };
  const { data: activitiesResponse, isLoading } = useQuery({
    queryKey: ['activities', projectFilter, page],
    queryFn: async () => {
      const params: Record<string, string | number> = { limit: PAGE_SIZE, page };
      if (projectFilter) params.project = projectFilter;
      const res = await api.get<{ data?: Activity[]; total?: number } | Activity[]>('/activities', { params });
      const body = res.data;
      if (body && typeof body === 'object' && 'data' in body && Array.isArray((body as { data: Activity[] }).data)) {
        return { data: (body as { data: Activity[] }).data, total: (body as { total: number }).total ?? 0 };
      }
      return { data: Array.isArray(body) ? body : [], total: 0 };
    },
  });
  const activities = activitiesResponse?.data ?? [];
  const total = activitiesResponse?.total ?? (activitiesResponse?.data ? activities.length : 0);
  const totalPages = Math.max(1, Math.ceil((total || activities.length) / PAGE_SIZE));

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/activities', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['activities'] }); setModal(null); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/activities/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['activities'] }); setModal(null); setEditing(null); },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Activities' }]} />
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" onClick={() => { setEditing(null); setModal('add'); }} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
          + Add New Activity
        </button>
        <button type="button" onClick={() => downloadExport('/export/activities', 'Supraja_Activities_Report.xlsx')} style={{ padding: '10px 16px', background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
          Download Excel
        </button>
        <button type="button" onClick={() => setModal('import')} style={{ padding: '10px 16px', background: '#2c5282', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
          Import from Excel
        </button>
        <select value={projectFilter} onChange={(e) => onFilterChange(e.target.value)} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 6, minWidth: 220 }}>
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>
      {total > 0 && (
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ color: '#4a5568', fontSize: 14 }}>Showing {page * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE + PAGE_SIZE, total)} of {total}</span>
          <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 6, cursor: page ? 'pointer' : 'not-allowed', opacity: page ? 1 : 0.6 }}>Previous</button>
          <span style={{ fontSize: 14 }}>Page {page + 1} of {totalPages}</span>
          <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 6, cursor: page < totalPages - 1 ? 'pointer' : 'not-allowed', opacity: page < totalPages - 1 ? 1 : 0.6 }}>Next</button>
        </div>
      )}
      <DataTable<Activity>
        keyField="_id"
        data={activities}
        loading={isLoading}
        columns={[
          { key: 'activityId', label: 'Activity ID' },
          { key: 'name', label: 'Activity Name' },
          { key: 'date', label: 'Date', render: (r) => r.date || r.startDate || '-' },
          { key: 'project', label: 'Project', render: (r) => (r.project && typeof r.project === 'object' && 'name' in r.project ? (r.project as { name: string }).name : '-') },
          { key: 'budgetHead', label: 'Budget Head' },
          { key: 'lfaObjectiveRef', label: 'LFA link', render: (r) => r.lfaObjectiveRef || '-' },
          { key: 'budget', label: 'Budget', render: (r) => `₹${Number(r.budget).toLocaleString()}` },
          { key: 'expenses', label: 'Expenses', render: (r) => r.expenses != null ? `₹${Number(r.expenses).toLocaleString()}` : '-' },
          { key: 'variance', label: 'Variance', render: (r) => r.variance != null ? `₹${Number(r.variance).toLocaleString()}` : '-' },
          { key: 'quarter', label: 'Quarter' },
          { key: 'location', label: 'Location' },
          { key: 'expectedParticipants', label: 'Expected' },
          { key: 'actualParticipants', label: 'Actual' },
          { key: 'achievementRate', label: '% Achieve', render: (r) => r.achievementRate != null ? `${r.achievementRate}%` : '-' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          { key: 'billStatus', label: 'Bill Status', render: (r) => r.billStatus || '-' },
        ]}
        actions={(row) => (
          <span>
            <button type="button" onClick={() => { setEditing(row); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
          </span>
        )}
      />

      {modal === 'import' && (
        <BulkImportModal type="activities" defaultProjectId={projectFilter || undefined} onClose={() => setModal(null)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['activities'] })} />
      )}
      {modal === 'add' && (
        <ActivityForm
          projects={projects}
          onClose={() => setModal(null)}
          onSubmit={(body) => createMutation.mutate(body)}
          loading={createMutation.isPending}
        />
      )}
      {modal === 'edit' && editing && (
        <ActivityForm
          projects={projects}
          initial={editing}
          onClose={() => { setModal(null); setEditing(null); }}
          onSubmit={(body) => updateMutation.mutate({ id: editing._id, body })}
          loading={updateMutation.isPending}
        />
      )}
    </div>
  );
}

function ActivityForm({
  projects,
  initial,
  onClose,
  onSubmit,
  loading,
}: {
  projects: { _id: string; name: string }[];
  initial?: Activity;
  onClose: () => void;
  onSubmit: (body: Record<string, unknown>) => void;
  loading: boolean;
}) {
  const [activityId, setActivityId] = useState(initial?.activityId ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [project, setProject] = useState(initial?.project && typeof initial.project === 'object' && '_id' in initial.project ? (initial.project as { _id: string })._id : projects[0]?._id ?? '');
  const [budget, setBudget] = useState(initial?.budget ?? 0);
  const [startDate, setStartDate] = useState(initial?.startDate ?? '');
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');
  const [status, setStatus] = useState(initial?.status ?? 'planned');
  const [quarter, setQuarter] = useState(initial?.quarter ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [expectedParticipants, setExpectedParticipants] = useState(initial?.expectedParticipants ?? '');
  const [actualParticipants, setActualParticipants] = useState(initial?.actualParticipants ?? '');
  const [budgetHead, setBudgetHead] = useState(initial?.budgetHead ?? '');
  const [lfaObjectiveRef, setLfaObjectiveRef] = useState(initial?.lfaObjectiveRef ?? '');
  const { data: budgetHeads = [] } = useQuery({
    queryKey: ['budget-heads', project],
    queryFn: async () => {
      if (!project) return [];
      const res = await api.get<string[]>('/budget/heads', { params: { project } });
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!project,
  });
  type LfaDoc = { objectives?: { title?: string; outcomes?: { title?: string; outputs?: { title?: string }[] }[] }[] };
  const { data: lfaDoc } = useQuery({
    queryKey: ['lfa', project],
    queryFn: async () => {
      if (!project) return null;
      const res = await api.get<LfaDoc>(`/lfa/project/${project}`);
      return res.data ?? null;
    },
    enabled: !!project,
  });
  const lfaOptions: string[] = [];
  if (lfaDoc?.objectives) {
    for (const obj of lfaDoc.objectives) {
      if (obj.title) lfaOptions.push(obj.title);
      for (const out of obj.outcomes ?? []) {
        if (out.title) lfaOptions.push(`Outcome: ${out.title}`);
        for (const op of out.outputs ?? []) {
          if (op.title) lfaOptions.push(`Output: ${op.title}`);
        }
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      activityId: activityId || `ACT-${Date.now()}`,
      name,
      project,
      budget: Number(budget) || 0,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status,
      quarter: quarter || undefined,
      location: location || undefined,
      expectedParticipants: expectedParticipants ? Number(expectedParticipants) : undefined,
      actualParticipants: actualParticipants ? Number(actualParticipants) : undefined,
      budgetHead: budgetHead || undefined,
      lfaObjectiveRef: lfaObjectiveRef || undefined,
    });
  };

  return (
    <Modal title={initial ? 'Edit Activity' : 'Add Activity'} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>Activity ID <input value={activityId} onChange={(e) => setActivityId(e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
        <label>Name <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
        <label>Project
          <select value={project} onChange={(e) => setProject(e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
            {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </label>
        <label>Budget (₹) <input type="number" value={budget || ''} onChange={(e) => setBudget(Number(e.target.value) || 0)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
        <label>Budget Head (from program budget)
          <select value={budgetHead} onChange={(e) => setBudgetHead(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
            <option value="">— Select —</option>
            {budgetHeads.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
            {budgetHead && !budgetHeads.includes(budgetHead) && <option value={budgetHead}>{budgetHead}</option>}
          </select>
          <input value={budgetHead} onChange={(e) => setBudgetHead(e.target.value)} placeholder="Or type custom head" style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6, marginTop: 4 }} />
        </label>
        <label>LFA objective / output
          <select value={lfaObjectiveRef} onChange={(e) => setLfaObjectiveRef(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
            <option value="">— Select —</option>
            {lfaOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <label>Start Date <input value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} placeholder="e.g. 10-Oct" /></label>
        <label>End Date <input value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} placeholder="e.g. 12-Oct" /></label>
        <label>Quarter <input value={quarter} onChange={(e) => setQuarter(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
        <label>Location <input value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
        <label>Expected Participants <input type="number" value={expectedParticipants} onChange={(e) => setExpectedParticipants(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
        <label>Actual Participants <input type="number" value={actualParticipants} onChange={(e) => setActualParticipants(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
        <label>Status
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
