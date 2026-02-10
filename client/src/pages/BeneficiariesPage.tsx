import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { useProjects } from '../hooks/useProjects';
import { useProgramFilter } from '../context/ProgramFilterContext';
import { Link } from 'react-router-dom';

type BeneficiaryEntry = {
  _id: string;
  project: string | { _id: string; name?: string };
  activity?: string | { _id: string; name?: string };
  type: string;
  category?: string;
  count: number;
  gender?: string;
  ageBand?: string;
  socialCategory?: string;
  state?: string;
  district?: string;
  location?: string;
  period?: string;
  notes?: string;
  recordedAt?: string;
};

const typeOptions = ['individual', 'SHG', 'FPO', 'community', 'other'];
const genderOptions = ['', 'female', 'male', 'other', 'not_specified'];
const ageBandOptions = ['', '0-18', '19-30', '31-45', '46-60', '60+'];
const socialCategoryOptions = ['', 'SC', 'ST', 'OBC', 'General', 'other'];

export function BeneficiariesPage() {
  const { selectedProjectId, setSelectedProjectId } = useProgramFilter();
  const [projectFilter, setProjectFilter] = useState(selectedProjectId);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<BeneficiaryEntry | null>(null);
  const [project, setProject] = useState('');
  const [type, setType] = useState('individual');
  const [category, setCategory] = useState('');
  const [count, setCount] = useState<number>(0);
  const [location, setLocation] = useState('');
  const [period, setPeriod] = useState('');
  const [notes, setNotes] = useState('');
  const [gender, setGender] = useState('');
  const [ageBand, setAgeBand] = useState('');
  const [socialCategory, setSocialCategory] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [activityId, setActivityId] = useState('');
  const queryClient = useQueryClient();
  const { data: projects = [] } = useProjects();
  const { data: activities = [] } = useQuery({
    queryKey: ['activities', project],
    queryFn: async () => {
      const res = await api.get<{ _id: string; name: string; project: string }[] | { data: unknown[] }>('/activities');
      const d = res.data;
      return Array.isArray(d) ? d : (d && typeof d === 'object' && 'data' in d ? (d as { data: { _id: string; name: string; project: string }[] }).data ?? [] : []);
    },
  });
  const activitiesForProject = project ? activities.filter((a) => a.project === project || (typeof a.project === 'object' && (a.project as { _id?: string })?._id === project)) : [];
  useEffect(() => {
    setProjectFilter(selectedProjectId);
  }, [selectedProjectId]);
  const onFilterChange = (id: string) => {
    setProjectFilter(id);
    setSelectedProjectId(id);
  };

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['beneficiaries', projectFilter],
    queryFn: async () => {
      const params = projectFilter ? { project: projectFilter } : {};
      const res = await api.get<BeneficiaryEntry[]>('/beneficiaries', { params });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/beneficiaries', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      setModal(null);
      resetForm();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.patch(`/beneficiaries/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      setModal(null);
      setEditing(null);
      resetForm();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/beneficiaries/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['beneficiaries'] }),
  });

  const resetForm = () => {
    setProject('');
    setType('individual');
    setCategory('');
    setCount(0);
    setLocation('');
    setPeriod('');
    setNotes('');
    setGender('');
    setAgeBand('');
    setSocialCategory('');
    setState('');
    setDistrict('');
    setActivityId('');
  };

  const openAdd = () => {
    setEditing(null);
    resetForm();
    setModal('add');
  };
  const openEdit = (row: BeneficiaryEntry) => {
    setEditing(row);
    const projId = typeof row.project === 'object' && row.project?._id ? row.project._id : (row.project as string);
    setProject(projId);
    setType(row.type ?? 'individual');
    setCategory(row.category ?? '');
    setCount(Number(row.count) ?? 0);
    setLocation(row.location ?? '');
    setPeriod(row.period ?? '');
    setNotes(row.notes ?? '');
    setGender(row.gender ?? '');
    setAgeBand(row.ageBand ?? '');
    setSocialCategory(row.socialCategory ?? '');
    setState(row.state ?? '');
    setDistrict(row.district ?? '');
    const actId = typeof row.activity === 'object' && row.activity?._id ? row.activity._id : (row.activity as string) ?? '';
    setActivityId(actId);
    setModal('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body: Record<string, unknown> = {
      project: project.trim() || undefined,
      activity: activityId.trim() || undefined,
      type,
      category: category.trim() || undefined,
      count: Number(count) || 0,
      gender: gender || undefined,
      ageBand: ageBand || undefined,
      socialCategory: socialCategory || undefined,
      state: state.trim() || undefined,
      district: district.trim() || undefined,
      location: location.trim() || undefined,
      period: period.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing._id, body });
    } else {
      createMutation.mutate(body);
    }
  };

  const handleDelete = (row: BeneficiaryEntry) => {
    if (window.confirm(`Remove this beneficiary/impact entry?`)) deleteMutation.mutate(row._id);
  };

  const projectName = (r: BeneficiaryEntry) => (typeof r.project === 'object' && r.project?.name ? r.project.name : '-');

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Beneficiaries & Impact' }]} />
      <p style={{ marginBottom: 24, color: '#4a5568' }}>
        Track beneficiaries and impact by program. Link to <Link to="/programs" style={{ color: '#2E3192' }}>Programs</Link>. Data can be aggregated from field forms or entered manually.
      </p>
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={openAdd}
          style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
        >
          + Add Entry
        </button>
        <select value={projectFilter} onChange={(e) => onFilterChange(e.target.value)} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">All Programs</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>
      <DataTable<BeneficiaryEntry>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'project', label: 'Program', render: (r) => projectName(r) },
          { key: 'activity', label: 'Activity', render: (r) => (typeof r.activity === 'object' && r.activity?.name ? r.activity.name : r.activity ? String(r.activity) : '—') },
          { key: 'type', label: 'Type' },
          { key: 'category', label: 'Category', render: (r) => r.category || '—' },
          { key: 'count', label: 'Count', render: (r) => String(r.count ?? 0) },
          { key: 'gender', label: 'Gender', render: (r) => r.gender || '—' },
          { key: 'ageBand', label: 'Age', render: (r) => r.ageBand || '—' },
          { key: 'socialCategory', label: 'Social', render: (r) => r.socialCategory || '—' },
          { key: 'state', label: 'State', render: (r) => r.state || '—' },
          { key: 'district', label: 'District', render: (r) => r.district || '—' },
          { key: 'location', label: 'Location', render: (r) => r.location || '—' },
          { key: 'period', label: 'Period', render: (r) => r.period || '—' },
          { key: 'recordedAt', label: 'Recorded', render: (r) => (r.recordedAt ? new Date(r.recordedAt).toLocaleDateString() : '—') },
        ]}
        actions={(row) => (
          <span>
            <button type="button" onClick={() => openEdit(row)} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
            <button type="button" onClick={() => handleDelete(row)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Delete</button>
          </span>
        )}
      />

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={editing ? 'Edit Entry' : 'Add Beneficiary / Impact Entry'} onClose={() => { setModal(null); setEditing(null); resetForm(); }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontWeight: 600 }}>
              Program *
              <select value={project} onChange={(e) => setProject(e.target.value)} required style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}>
                <option value="">Select program</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label style={{ fontWeight: 600 }}>
              Type *
              <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <label style={{ fontWeight: 600 }}>
              Category
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Training - FE & BMS" style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }} />
            </label>
            <label style={{ fontWeight: 600 }}>
              Count *
              <input type="number" min={0} value={count || ''} onChange={(e) => setCount(Number(e.target.value) || 0)} required style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }} />
            </label>
            <label style={{ fontWeight: 600 }}>
              Activity
              <select value={activityId} onChange={(e) => setActivityId(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}>
                <option value="">—</option>
                {(activitiesForProject.length ? activitiesForProject : activities).map((a) => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
            </label>
            <label style={{ fontWeight: 600 }}>
              Gender
              <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}>
                {genderOptions.map((o) => <option key={o || '_'} value={o}>{o || '—'}</option>)}
              </select>
            </label>
            <label style={{ fontWeight: 600 }}>
              Age band
              <select value={ageBand} onChange={(e) => setAgeBand(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}>
                {ageBandOptions.map((o) => <option key={o || '_'} value={o}>{o || '—'}</option>)}
              </select>
            </label>
            <label style={{ fontWeight: 600 }}>
              Social category
              <select value={socialCategory} onChange={(e) => setSocialCategory(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}>
                {socialCategoryOptions.map((o) => <option key={o || '_'} value={o}>{o || '—'}</option>)}
              </select>
            </label>
            <label style={{ fontWeight: 600 }}>
              State
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Gujarat" style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }} />
            </label>
            <label style={{ fontWeight: 600 }}>
              District
              <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Optional" style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }} />
            </label>
            <label style={{ fontWeight: 600 }}>
              Location
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Nagaland" style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }} />
            </label>
            <label style={{ fontWeight: 600 }}>
              Period
              <input type="text" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="e.g. 2024-25 Q2" style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }} />
            </label>
            <label style={{ fontWeight: 600 }}>
              Notes
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }} />
            </label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending || !project.trim()} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                {editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setModal(null); setEditing(null); resetForm(); }} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
