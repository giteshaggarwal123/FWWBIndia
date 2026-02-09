import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { useProjects } from '../hooks/useProjects';
import { useProgramFilter } from '../context/ProgramFilterContext';

type Entry = {
  _id: string;
  entryId: string;
  project?: { name: string };
  activity?: { name: string };
  location?: string;
  date: string;
  notes: string;
  expectedParticipants?: number;
  actualParticipants?: number;
  collectedBy?: { name: string };
};

export function MonitoringPage() {
  const { selectedProjectId, setSelectedProjectId } = useProgramFilter();
  const [projectFilter, setProjectFilter] = useState(selectedProjectId);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Entry | null>(null);
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
    queryKey: ['monitoring', projectFilter],
    queryFn: async () => {
      const params = projectFilter ? { project: projectFilter } : {};
      const res = await api.get<Entry[]>('/monitoring', { params });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/monitoring', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['monitoring'] }); setModal(null); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/monitoring/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['monitoring'] }); setModal(null); setEditing(null); },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Monitoring' }]} />
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => { setEditing(null); setModal('add'); }} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ Add Monitoring Entry</button>
        <select value={projectFilter} onChange={(e) => onFilterChange(e.target.value)} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>
      <DataTable<Entry>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'entryId', label: 'Entry ID' },
          { key: 'project', label: 'Project', render: (r) => (r.project && typeof r.project === 'object' && 'name' in r.project ? (r.project as { name: string }).name : '-') },
          { key: 'location', label: 'Location' },
          { key: 'date', label: 'Date', render: (r) => r.date ? new Date(r.date).toLocaleDateString() : '' },
          { key: 'expectedParticipants', label: 'Expected' },
          { key: 'actualParticipants', label: 'Actual' },
          { key: 'notes', label: 'Notes' },
        ]}
        actions={(row) => (
          <button type="button" onClick={() => { setEditing(row); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
        )}
      />
      {modal && (
        <Modal title={editing ? 'Edit Monitoring Entry' : 'Add Monitoring Entry'} onClose={() => { setModal(null); setEditing(null); }}>
          <MonitoringForm
            projects={projects}
            activities={activities}
            initial={editing}
            onClose={() => { setModal(null); setEditing(null); }}
            onSubmit={(body) => editing ? updateMutation.mutate({ id: editing._id, body }) : createMutation.mutate(body)}
            loading={createMutation.isPending || updateMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
}

function MonitoringForm({
  projects,
  activities,
  initial,
  onClose,
  onSubmit,
  loading,
}: {
  projects: { _id: string; name: string }[];
  activities: { _id: string; name: string; project: string }[];
  initial?: Entry | null;
  onClose: () => void;
  onSubmit: (body: Record<string, unknown>) => void;
  loading: boolean;
}) {
  const projId = initial?.project && typeof initial.project === 'object' && '_id' in initial.project ? (initial.project as { _id: string })._id : '';
  const actId = initial?.activity && typeof initial.activity === 'object' && '_id' in initial.activity ? (initial.activity as { _id: string })._id : '';
  const [project, setProject] = useState((projId || projects[0]?._id) ?? '');
  const [activity, setActivity] = useState(actId);
  const [location, setLocation] = useState(initial?.location ?? '');
  const [date, setDate] = useState(initial?.date ? new Date(initial.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [expectedParticipants, setExpectedParticipants] = useState(String(initial?.expectedParticipants ?? ''));
  const [actualParticipants, setActualParticipants] = useState(String(initial?.actualParticipants ?? ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      entryId: initial?.entryId ?? `MON-${Date.now()}`,
      project,
      activity: activity || undefined,
      location: location || undefined,
      date: new Date(date),
      notes,
      expectedParticipants: expectedParticipants ? Number(expectedParticipants) : undefined,
      actualParticipants: actualParticipants ? Number(actualParticipants) : undefined,
    });
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
      <label>Project * <select value={project} onChange={(e) => { setProject(e.target.value); setActivity(''); }} required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></label>
      <label>Activity <select value={activity} onChange={(e) => setActivity(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}><option value="">—</option>{filteredActivities.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}</select></label>
      <label>Location <input value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      <label>Date * <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      <label>Expected Participants <input type="number" value={expectedParticipants} onChange={(e) => setExpectedParticipants(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      <label>Actual Participants <input type="number" value={actualParticipants} onChange={(e) => setActualParticipants(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      <label>Notes <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save'}</button>
        <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
      </div>
    </form>
  );
}
