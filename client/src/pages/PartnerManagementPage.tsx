import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { Link } from 'react-router-dom';

type Partner = {
  _id: string;
  name: string;
  code?: string;
  type?: string;
  location?: string;
  contactEmail?: string;
  status: string;
};

const typeOptions = ['sub-grantee', 'partner', 'implementing'];
const statusOptions = ['active', 'inactive'];

export function PartnerManagementPage() {
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('sub-grantee');
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [status, setStatus] = useState('active');
  const queryClient = useQueryClient();

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const res = await api.get<Partner[]>('/partners');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/partners', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setModal(null);
      resetForm();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.patch(`/partners/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setModal(null);
      setEditing(null);
      resetForm();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/partners/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partners'] }),
  });

  const resetForm = () => {
    setName('');
    setCode('');
    setType('sub-grantee');
    setLocation('');
    setContactEmail('');
    setStatus('active');
  };

  const openAdd = () => {
    setEditing(null);
    resetForm();
    setModal('add');
  };
  const openEdit = (row: Partner) => {
    setEditing(row);
    setName(row.name);
    setCode(row.code ?? '');
    setType(row.type ?? 'sub-grantee');
    setLocation(row.location ?? '');
    setContactEmail(row.contactEmail ?? '');
    setStatus(row.status ?? 'active');
    setModal('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body: Record<string, unknown> = {
      name: name.trim(),
      code: code.trim() || undefined,
      type,
      location: location.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      status,
    };
    if (editing) {
      updateMutation.mutate({ id: editing._id, body });
    } else {
      createMutation.mutate(body);
    }
  };

  const handleDelete = (row: Partner) => {
    if (window.confirm(`Delete partner "${row.name}"? Programs linked to this partner will need to be updated.`)) {
      deleteMutation.mutate(row._id);
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Partner Management' }]} />
      <p style={{ marginBottom: 24, color: '#4a5568' }}>
        Manage implementing partners and sub-grantees. Link partners to <Link to="/programs" style={{ color: '#2E3192' }}>Programs</Link> when creating or editing a program.
      </p>
      <div style={{ marginBottom: 24 }}>
        <button
          type="button"
          onClick={openAdd}
          style={{
            padding: '10px 16px',
            background: '#2E3192',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Add Partner
        </button>
      </div>
      <DataTable<Partner>
        keyField="_id"
        data={partners}
        loading={isLoading}
        columns={[
          { key: 'name', label: 'Partner Name' },
          { key: 'code', label: 'Code', render: (r) => r.code || '—' },
          { key: 'type', label: 'Type', render: (r) => r.type || '—' },
          { key: 'location', label: 'Location', render: (r) => r.location || '—' },
          { key: 'contactEmail', label: 'Email', render: (r) => r.contactEmail || '—' },
          { key: 'status', label: 'Status', render: (r) => <span style={{ color: r.status === 'active' ? '#276749' : '#718096' }}>{r.status}</span> },
        ]}
        actions={(row) => (
          <span>
            <button
              type="button"
              onClick={() => openEdit(row)}
              style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => handleDelete(row)}
              style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
            >
              Delete
            </button>
          </span>
        )}
      />

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={editing ? 'Edit Partner' : 'Add Partner'} onClose={() => { setModal(null); setEditing(null); resetForm(); }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontWeight: 600 }}>
              Partner name *
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Supraja Foundation"
                style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}
              />
            </label>
            <label style={{ fontWeight: 600 }}>
              Code
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SUPRAJA"
                style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}
              />
            </label>
            <label style={{ fontWeight: 600 }}>
              Type
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}
              >
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <label style={{ fontWeight: 600 }}>
              Location
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Nagaland"
                style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}
              />
            </label>
            <label style={{ fontWeight: 600 }}>
              Contact email
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="email@example.com"
                style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}
              />
            </label>
            <label style={{ fontWeight: 600 }}>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending || !name.trim()}
                style={{
                  padding: '10px 20px',
                  background: '#2E3192',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {editing ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => { setModal(null); setEditing(null); resetForm(); }}
                style={{
                  padding: '10px 20px',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
