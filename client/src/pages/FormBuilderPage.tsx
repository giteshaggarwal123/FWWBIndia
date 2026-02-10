import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { useProgramFilter } from '../context/ProgramFilterContext';
import { useAuth } from '../hooks/useAuth';

type FormField = { key: string; label: string; type: string; required?: boolean; options?: string[] };
type Form = {
  _id: string;
  title: string;
  description?: string;
  fields: FormField[];
  status: string;
  createdBy?: { name: string };
  project?: { _id?: string; name: string };
};
type Submission = { _id: string; data: Record<string, unknown>; submittedBy?: { name: string }; createdAt: string };

const FIELD_TYPES = ['text', 'number', 'date', 'select', 'textarea'];

export function FormBuilderPage() {
  const { hasPermission } = useAuth();
  const canAccess = hasPermission('form-builder');
  const { selectedProjectId } = useProgramFilter();
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [submissionsView, setSubmissionsView] = useState(false);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const queryClient = useQueryClient();

  const { data: allForms = [], isLoading } = useQuery({
    queryKey: ['forms'],
    queryFn: async () => {
      const res = await api.get<Form[]>('/forms');
      return res.data ?? [];
    },
    enabled: canAccess,
  });

  const forms = useMemo(() => {
    if (!selectedProjectId) return allForms;
    return allForms.filter((f) => (f.project as { _id?: string })?._id === selectedProjectId);
  }, [allForms, selectedProjectId]);

  const formId = selectedForm?._id != null ? String(selectedForm._id) : null;
  const { data: submissions = [], isLoading: submissionsLoading, isError: submissionsError } = useQuery({
    queryKey: ['form-submissions', formId],
    queryFn: async () => {
      if (!formId) return [];
      const res = await api.get(`/forms/submissions/${encodeURIComponent(formId)}`);
      const raw = res?.data;
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === 'object' && Array.isArray((raw as { submissions?: unknown }).submissions)) return (raw as { submissions: unknown[] }).submissions;
      return [];
    },
    enabled: canAccess && !!formId && submissionsView,
  });

  const createMutation = useMutation({
    mutationFn: (body: { title: string; description?: string; fields: FormField[]; status: string }) =>
      api.post('/forms', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      setModal(null);
      setFormTitle('');
      setFormDesc('');
      setFormFields([]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Form> }) => api.patch(`/forms/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      setModal(null);
      setEditingForm(null);
    },
  });

  const openCreate = () => {
    setFormTitle('');
    setFormDesc('');
    setFormFields([]);
    setEditingForm(null);
    setModal('create');
  };

  const openEdit = (f: Form) => {
    setFormTitle(f.title);
    setFormDesc(f.description ?? '');
    setFormFields(f.fields?.length ? [...f.fields] : []);
    setEditingForm(f);
    setModal('edit');
  };

  const addField = () => {
    setFormFields((prev) => [
      ...prev,
      { key: `field_${Date.now()}`, label: 'New field', type: 'text', required: false },
    ]);
  };

  const updateField = (idx: number, upd: Partial<FormField>) => {
    setFormFields((prev) => prev.map((f, i) => (i === idx ? { ...f, ...upd } : f)));
  };

  const removeField = (idx: number) => {
    setFormFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!formTitle.trim()) return;
    const body = {
      title: formTitle.trim(),
      description: formDesc.trim() || undefined,
      fields: formFields,
      status: 'active',
    };
    if (editingForm) {
      updateMutation.mutate({ id: editingForm._id, body });
    } else {
      createMutation.mutate(body);
    }
  };

  if (!canAccess) {
    return (
      <div style={{ padding: 48, textAlign: 'center', background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 12px', color: '#2d3748' }}>Access denied</h2>
        <p style={{ margin: 0, color: '#718096' }}>You do not have permission to access Form Builder (Data Collection).</p>
        <Link to="/dashboard" style={{ display: 'inline-block', marginTop: 20, color: '#2E3192', fontWeight: 600 }}>Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Form Builder' }]} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <p style={{ margin: 0, color: '#4a5568' }}>
          Create forms for field teams to collect data from the ground. Forms can be filled via the mobile app or shared link.
        </p>
        <button
          type="button"
          onClick={openCreate}
          style={{
            padding: '10px 20px',
            background: '#2E3192',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          + New form
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, minHeight: 400 }}>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: 16 }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Forms</h3>
          {isLoading && <p style={{ color: '#718096' }}>Loading...</p>}
          {!isLoading && forms.length === 0 && (
            <p style={{ color: '#718096', fontSize: 14 }}>No forms yet. Create one to collect data from the field.</p>
          )}
          {forms.map((f) => (
            <div
              key={f._id}
              onClick={() => { setSelectedForm(f); setSubmissionsView(false); }}
              style={{
                padding: '12px 14px',
                borderRadius: 8,
                marginBottom: 8,
                background: selectedForm?._id === f._id ? '#e8ecf7' : '#f8f9fa',
                cursor: 'pointer',
                border: selectedForm?._id === f._id ? '1px solid #2E3192' : '1px solid transparent',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: '#718096' }}>{f.fields?.length ?? 0} fields</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: 24 }}>
          {!selectedForm && (
            <div style={{ textAlign: 'center', color: '#718096', padding: 48 }}>
              Select a form from the list or create a new one.
            </div>
          )}
          {selectedForm && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>{selectedForm.title}</h2>
                  {selectedForm.description && (
                    <p style={{ margin: 0, fontSize: 14, color: '#718096' }}>{selectedForm.description}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setSubmissionsView(false)}
                    style={{
                      padding: '8px 16px',
                      background: !submissionsView ? '#2E3192' : '#e2e8f0',
                      color: !submissionsView ? '#fff' : '#4a5568',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    Fields
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmissionsView(true)}
                    style={{
                      padding: '8px 16px',
                      background: submissionsView ? '#2E3192' : '#e2e8f0',
                      color: submissionsView ? '#fff' : '#4a5568',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    Submissions
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(selectedForm)}
                    style={{
                      padding: '8px 16px',
                      background: '#fff',
                      border: '1px solid #2E3192',
                      color: '#2E3192',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
              {!submissionsView && (
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>Fields</h4>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {selectedForm.fields?.map((fd, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>
                        {fd.label} ({fd.type}) {fd.required && '*'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {submissionsView && (
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>Submissions ({submissions.length})</h4>
                  {submissionsLoading && <p style={{ color: '#718096' }}>Loading submissions…</p>}
                  {submissionsError && <p style={{ color: '#e53e3e' }}>Could not load submissions. Please refresh or try again.</p>}
                  {!submissionsLoading && !submissionsError && submissions.length === 0 && (
                    <p style={{ color: '#718096' }}>No submissions yet. Field workers can submit via the mobile app.</p>
                  )}
                  {!submissionsLoading && submissions.map((s) => (
                    <div
                      key={s._id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 12,
                        background: '#f8f9fa',
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#718096', marginBottom: 8 }}>
                        By {typeof s.submittedBy === 'object' && s.submittedBy?.name ? s.submittedBy.name : '—'} ·{' '}
                        {new Date(s.createdAt).toLocaleString()}
                      </div>
                      <pre style={{ margin: 0, fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {JSON.stringify(s.data, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {(modal === 'create' || modal === 'edit') && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setModal(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              maxWidth: 520,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0' }}>{editingForm ? 'Edit form' : 'New form'}</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Beneficiary survey"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>Description (optional)</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Brief description for field team"
                rows={2}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 600 }}>Fields</label>
                <button
                  type="button"
                  onClick={addField}
                  style={{
                    padding: '6px 12px',
                    background: '#2E3192',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  + Add field
                </button>
              </div>
              {formFields.map((fd, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 100px 80px 32px',
                    gap: 8,
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <input
                    type="text"
                    value={fd.label}
                    onChange={(e) => updateField(i, { label: e.target.value })}
                    placeholder="Label"
                    style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}
                  />
                  <select
                    value={fd.type}
                    onChange={(e) => updateField(i, { type: e.target.value })}
                    style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={!!fd.required}
                      onChange={(e) => updateField(i, { required: e.target.checked })}
                    />
                    Required
                  </label>
                  <input
                    type="text"
                    value={fd.key}
                    onChange={(e) => updateField(i, { key: e.target.value })}
                    placeholder="key"
                    style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeField(i)}
                    style={{ background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', padding: 6 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setModal(null)}
                style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!formTitle.trim() || createMutation.isPending || updateMutation.isPending}
                style={{
                  padding: '10px 20px',
                  background: '#2E3192',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                {editingForm ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
