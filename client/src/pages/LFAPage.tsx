import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { useProjects } from '../hooks/useProjects';
import { useProgramFilter } from '../context/ProgramFilterContext';
import { Link } from 'react-router-dom';

type LFAProgressEntry = { period: string; actual: number; notes?: string };
type LFAObjective = { title: string; indicators?: string; target?: string; baseline?: string; frequency?: string; progressEntries?: LFAProgressEntry[]; outcomes?: unknown[] };
type LFA = { _id?: string; project: string; goal: string; objectives: LFAObjective[] };

export function LFAPage() {
  const { selectedProjectId, setSelectedProjectId } = useProgramFilter();
  const [projectId, setProjectId] = useState(selectedProjectId);
  const [goal, setGoal] = useState('');
  const [objectives, setObjectives] = useState<LFAObjective[]>([]);
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();
  const { data: projects = [] } = useProjects();
  useEffect(() => {
    setProjectId(selectedProjectId);
  }, [selectedProjectId]);
  const onProgramChange = (id: string) => {
    setProjectId(id);
    setSelectedProjectId(id);
  };

  const { data: lfa, isLoading, isError, error } = useQuery({
    queryKey: ['lfa', projectId],
    queryFn: async () => {
      const res = await api.get<LFA>(`/lfa/project/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
  });

  const updateMutation = useMutation({
    mutationFn: (body: { goal: string; objectives: LFAObjective[] }) =>
      api.put(`/lfa/project/${projectId}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lfa', projectId] });
      setEditing(false);
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: { goal: string; objectives: LFAObjective[] }) =>
      api.post(`/lfa/project/${projectId}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lfa', projectId] });
      setEditing(false);
    },
  });

  useEffect(() => {
    if (lfa) {
      setGoal(lfa.goal);
      setObjectives(Array.isArray(lfa.objectives) ? lfa.objectives.map((o) => ({ ...o })) : []);
    } else if (projectId && !isLoading) {
      setGoal('');
      setObjectives([]);
    }
  }, [projectId, lfa?._id, isLoading]);

  const handleLoad = () => {
    if (lfa) {
      setGoal(lfa.goal);
      setObjectives(Array.isArray(lfa.objectives) ? [...lfa.objectives] : []);
    }
    setEditing(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (lfa?._id) {
      updateMutation.mutate({ goal, objectives });
    } else {
      createMutation.mutate({ goal, objectives });
    }
  };

  const addObjective = () => {
    setObjectives([...objectives, { title: '', indicators: '' }]);
    setEditing(true);
  };
  const removeObjective = (i: number) => {
    setObjectives(objectives.filter((_, idx) => idx !== i));
    setEditing(true);
  };
  const updateObjective = (i: number, field: 'title' | 'indicators' | 'target' | 'baseline' | 'frequency', value: string) => {
    const next = [...objectives];
    next[i] = { ...next[i], [field]: value };
    setObjectives(next);
    setEditing(true);
  };
  const addProgressEntry = (objIndex: number) => {
    const next = [...objectives];
    const entries = next[objIndex].progressEntries ?? [];
    next[objIndex] = { ...next[objIndex], progressEntries: [...entries, { period: new Date().toISOString().slice(0, 7), actual: 0, notes: '' }] };
    setObjectives(next);
    setEditing(true);
  };
  const removeProgressEntry = (objIndex: number, entryIndex: number) => {
    const next = [...objectives];
    const entries = [...(next[objIndex].progressEntries ?? [])];
    entries.splice(entryIndex, 1);
    next[objIndex] = { ...next[objIndex], progressEntries: entries };
    setObjectives(next);
    setEditing(true);
  };
  const updateProgressEntry = (objIndex: number, entryIndex: number, field: 'period' | 'actual' | 'notes', value: string | number) => {
    const next = [...objectives];
    const entries = [...(next[objIndex].progressEntries ?? [])];
    entries[entryIndex] = { ...entries[entryIndex], [field]: value };
    next[objIndex] = { ...next[objIndex], progressEntries: entries };
    setObjectives(next);
    setEditing(true);
  };

  const is404 = isError && (error as { response?: { status?: number } })?.response?.status === 404;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Logical Framework (LFA)' }]} />
      <p style={{ marginBottom: 24, color: '#4a5568' }}>
        Define project goal and objectives (Logical Framework) per program. Link to <Link to="/programs" style={{ color: '#2E3192' }}>Programs</Link>.
      </p>

      <div style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 600 }}>
          Program
          <select
            value={projectId}
            onChange={(e) => { onProgramChange(e.target.value); setGoal(''); setObjectives([]); setEditing(false); }}
            style={{ marginLeft: 8, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, minWidth: 280 }}
          >
            <option value="">Select a program</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}{p.code ? ` (${p.code})` : ''}</option>
            ))}
          </select>
        </label>
        {projectId && is404 && (
          <span style={{ color: '#718096', fontSize: 14 }}>No LFA yet for this program. Click Edit and Save to create one.</span>
        )}
      </div>

      {!projectId && (
        <div style={{ padding: 24, background: '#f7fafc', borderRadius: 8, color: '#4a5568' }}>Select a program to view or edit its Logical Framework.</div>
      )}

      {projectId && isLoading && <div style={{ padding: 24, color: '#4a5568' }}>Loading LFA...</div>}

      {projectId && !isLoading && (lfa || is404) && (
        <div style={{ maxWidth: 900 }}>
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Goal</label>
              <textarea
                value={goal}
                onChange={(e) => { setGoal(e.target.value); setEditing(true); }}
                placeholder="Overall project goal"
                rows={2}
                style={{ width: '100%', padding: 12, border: '1px solid #e2e8f0', borderRadius: 6 }}
              />
            </div>

            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontWeight: 600 }}>Objectives</label>
              <button type="button" onClick={addObjective} style={{ padding: '8px 14px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                + Add objective
              </button>
            </div>

            {objectives.length === 0 && !editing && (
              <div style={{ padding: 16, background: '#f7fafc', borderRadius: 6, color: '#718096' }}>No objectives defined. Click Edit and add objectives.</div>
            )}

            {objectives.map((obj, i) => (
              <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: 16, marginBottom: 12, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      value={obj.title}
                      onChange={(e) => updateObjective(i, 'title', e.target.value)}
                      placeholder="Objective title"
                      style={{ width: '100%', padding: 8, marginBottom: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}
                    />
                    <input
                      type="text"
                      value={obj.indicators ?? ''}
                      onChange={(e) => updateObjective(i, 'indicators', e.target.value)}
                      placeholder="Indicators"
                      style={{ width: '100%', padding: 8, marginBottom: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <input type="text" value={obj.target ?? ''} onChange={(e) => updateObjective(i, 'target', e.target.value)} placeholder="Target" style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} />
                      <input type="text" value={obj.baseline ?? ''} onChange={(e) => updateObjective(i, 'baseline', e.target.value)} placeholder="Baseline" style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} />
                      <input type="text" value={obj.frequency ?? ''} onChange={(e) => updateObjective(i, 'frequency', e.target.value)} placeholder="Frequency (e.g. Quarterly)" style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>Progress entries</div>
                      {(obj.progressEntries ?? []).map((pe, ei) => (
                        <div key={ei} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                          <input type="month" value={pe.period} onChange={(e) => updateProgressEntry(i, ei, 'period', e.target.value)} style={{ padding: 6, border: '1px solid #e2e8f0', borderRadius: 6 }} />
                          <input type="number" value={pe.actual} onChange={(e) => updateProgressEntry(i, ei, 'actual', Number(e.target.value))} placeholder="Actual" style={{ width: 80, padding: 6, border: '1px solid #e2e8f0', borderRadius: 6 }} />
                          <input type="text" value={pe.notes ?? ''} onChange={(e) => updateProgressEntry(i, ei, 'notes', e.target.value)} placeholder="Notes" style={{ flex: 1, minWidth: 100, padding: 6, border: '1px solid #e2e8f0', borderRadius: 6 }} />
                          <button type="button" onClick={() => removeProgressEntry(i, ei)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>Remove</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addProgressEntry(i)} style={{ padding: '6px 12px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>+ Add progress</button>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeObjective(i)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Remove</button>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button
                type="submit"
                disabled={updateMutation.isPending || createMutation.isPending}
                style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
              >
                {lfa?._id ? 'Update' : 'Create'} LFA
              </button>
              <button
                type="button"
                onClick={handleLoad}
                style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {projectId && !isLoading && !lfa && !is404 && isError && (
        <div style={{ padding: 24, color: '#e53e3e' }}>Failed to load LFA. Check your permission (Programs, Activities, Monitoring, or Reports).</div>
      )}
    </div>
  );
}
