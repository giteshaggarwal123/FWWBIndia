import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { Link } from 'react-router-dom';

type Donor = {
  _id: string;
  name: string;
  code?: string;
  type?: string;
  contactPerson?: string;
  contactEmail?: string;
  address?: string;
  status: string;
  reportingFrequency?: string;
  agreementAttachmentId?: { _id: string; originalName?: string };
  programCount?: number;
};

type Grant = {
  _id: string;
  donor: string | { _id: string; name?: string };
  project: string | { _id: string; name?: string };
  amount: number;
  periodStart: string;
  periodEnd: string;
  status: string;
  notes?: string;
};

const typeOptions = ['institutional', 'individual', 'foundation', 'government'];
const statusOptions = ['active', 'inactive'];

export function DonorManagementPage() {
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Donor | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('institutional');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('active');
  const [reportingFrequency, setReportingFrequency] = useState('');
  const [grantsDonorId, setGrantsDonorId] = useState<string | null>(null);
  const [grantModal, setGrantModal] = useState(false);
  const [grantProject, setGrantProject] = useState('');
  const [grantAmount, setGrantAmount] = useState('');
  const [grantPeriodStart, setGrantPeriodStart] = useState('');
  const [grantPeriodEnd, setGrantPeriodEnd] = useState('');
  const queryClient = useQueryClient();

  const { data: donors = [], isLoading } = useQuery({
    queryKey: ['donors'],
    queryFn: async () => {
      const res = await api.get<Donor[]>('/donors');
      return Array.isArray(res.data) ? res.data : [];
    },
  });
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get<{ _id: string; name: string }[]>('/projects');
      return Array.isArray(res.data) ? res.data : [];
    },
  });
  const { data: grantsForDonor = [], isLoading: grantsLoading } = useQuery({
    queryKey: ['grants', grantsDonorId],
    queryFn: async () => {
      if (!grantsDonorId) return [];
      const res = await api.get<Grant[]>('/grants', { params: { donor: grantsDonorId } });
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!grantsDonorId,
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/donors', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      setModal(null);
      resetForm();
    },
  });
  const createGrantMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/grants', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grants'] });
      setGrantModal(false);
      setGrantProject('');
      setGrantAmount('');
      setGrantPeriodStart('');
      setGrantPeriodEnd('');
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.patch(`/donors/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      setModal(null);
      setEditing(null);
      resetForm();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/donors/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['donors'] }),
  });

  const resetForm = () => {
    setName('');
    setCode('');
    setType('institutional');
    setContactPerson('');
    setContactEmail('');
    setAddress('');
    setStatus('active');
    setReportingFrequency('');
  };

  const openAdd = () => {
    setEditing(null);
    resetForm();
    setModal('add');
  };
  const openEdit = (row: Donor) => {
    setEditing(row);
    setName(row.name);
    setCode(row.code ?? '');
    setType(row.type ?? 'institutional');
    setContactPerson(row.contactPerson ?? '');
    setContactEmail(row.contactEmail ?? '');
    setAddress(row.address ?? '');
    setStatus(row.status ?? 'active');
    setReportingFrequency(row.reportingFrequency ?? '');
    setModal('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body: Record<string, unknown> = {
      name: name.trim(),
      code: code.trim() || undefined,
      type,
      contactPerson: contactPerson.trim() || undefined,
      reportingFrequency: reportingFrequency.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      address: address.trim() || undefined,
      status,
    };
    if (editing) {
      updateMutation.mutate({ id: editing._id, body });
    } else {
      createMutation.mutate(body);
    }
  };

  const handleDelete = (row: Donor) => {
    if (window.confirm(`Delete donor "${row.name}"? Programs linked to this donor will keep the donor name as text.`)) {
      deleteMutation.mutate(row._id);
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Donor Management' }]} />
      <p style={{ marginBottom: 24, color: '#4a5568' }}>
        Manage donors and funders. Link donors to <Link to="/programs" style={{ color: '#2E3192' }}>Programs</Link> when creating or editing a program. Donors appear in the <Link to="/donor-portal" style={{ color: '#2E3192' }}>Donor Portal</Link> view.
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
          + Add Donor
        </button>
      </div>
      <DataTable<Donor>
        keyField="_id"
        data={donors}
        loading={isLoading}
        columns={[
          { key: 'name', label: 'Donor Name' },
          { key: 'code', label: 'Code', render: (r) => r.code || '—' },
          { key: 'type', label: 'Type', render: (r) => r.type || '—' },
          { key: 'contactPerson', label: 'Contact', render: (r) => r.contactPerson || '—' },
          { key: 'contactEmail', label: 'Email', render: (r) => r.contactEmail || '—' },
          { key: 'reportingFrequency', label: 'Reporting', render: (r) => r.reportingFrequency || '—' },
          { key: 'programCount', label: 'Programs', render: (r) => (r.programCount != null ? String(r.programCount) : '—') },
          { key: 'status', label: 'Status', render: (r) => <span style={{ color: r.status === 'active' ? '#276749' : '#718096' }}>{r.status}</span> },
        ]}
        actions={(row) => (
          <span>
            <button type="button" onClick={() => { setGrantsDonorId(row._id); }} style={{ marginRight: 8, color: '#1BADE3', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Grants</button>
            <button type="button" onClick={() => openEdit(row)} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
            <button type="button" onClick={() => handleDelete(row)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Delete</button>
          </span>
        )}
      />

      {grantsDonorId && (
        <div style={{ marginTop: 24, padding: 20, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Grants (pledge / funding)</h3>
          <p style={{ marginBottom: 12, fontSize: 14, color: '#4a5568' }}>Donor: {donors.find((d) => d._id === grantsDonorId)?.name ?? grantsDonorId}</p>
          <button type="button" onClick={() => setGrantModal(true)} style={{ marginBottom: 12, padding: '8px 14px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ Add Grant</button>
          {grantsLoading && <p style={{ margin: 0 }}>Loading grants...</p>}
          {!grantsLoading && grantsForDonor.length === 0 && <p style={{ margin: 0, color: '#718096' }}>No grants yet. Add a grant to track amount and period per program.</p>}
          {!grantsLoading && grantsForDonor.length > 0 && (
            <DataTable<Grant>
              keyField="_id"
              data={grantsForDonor}
              columns={[
                { key: 'project', label: 'Program', render: (r) => (r.project && typeof r.project === 'object' && 'name' in r.project ? (r.project as { name: string }).name : '-') },
                { key: 'amount', label: 'Amount', render: (r) => `₹${Number(r.amount).toLocaleString()}` },
                { key: 'periodStart', label: 'From', render: (r) => r.periodStart ? new Date(r.periodStart).toLocaleDateString() : '-' },
                { key: 'periodEnd', label: 'To', render: (r) => r.periodEnd ? new Date(r.periodEnd).toLocaleDateString() : '-' },
                { key: 'status', label: 'Status' },
              ]}
            />
          )}
          <button type="button" onClick={() => setGrantsDonorId(null)} style={{ marginTop: 12, padding: '6px 12px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Close</button>
        </div>
      )}

      {grantModal && grantsDonorId && (
        <Modal title="Add Grant" onClose={() => { setGrantModal(false); setGrantProject(''); setGrantAmount(''); setGrantPeriodStart(''); setGrantPeriodEnd(''); }}>
          <form onSubmit={(e) => { e.preventDefault(); if (grantProject && grantAmount && grantPeriodStart && grantPeriodEnd) createGrantMutation.mutate({ donor: grantsDonorId, project: grantProject, amount: Number(grantAmount), periodStart: grantPeriodStart, periodEnd: grantPeriodEnd, status: 'active' }); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontWeight: 600 }}>Program * <select value={grantProject} onChange={(e) => setGrantProject(e.target.value)} required style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}>
              <option value="">Select program</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select></label>
            <label style={{ fontWeight: 600 }}>Amount (₹) * <input type="number" min={0} value={grantAmount} onChange={(e) => setGrantAmount(e.target.value)} required placeholder="e.g. 500000" style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label style={{ fontWeight: 600 }}>Period start * <input type="date" value={grantPeriodStart} onChange={(e) => setGrantPeriodStart(e.target.value)} required style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label style={{ fontWeight: 600 }}>Period end * <input type="date" value={grantPeriodEnd} onChange={(e) => setGrantPeriodEnd(e.target.value)} required style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={createGrantMutation.isPending || !grantProject || !grantAmount || !grantPeriodStart || !grantPeriodEnd} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Create</button>
              <button type="button" onClick={() => { setGrantModal(false); setGrantProject(''); setGrantAmount(''); setGrantPeriodStart(''); setGrantPeriodEnd(''); }} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={editing ? 'Edit Donor' : 'Add Donor'} onClose={() => { setModal(null); setEditing(null); resetForm(); }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontWeight: 600 }}>
              Donor name *
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. FWWB / Donor"
                style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}
              />
            </label>
            <label style={{ fontWeight: 600 }}>
              Code
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. FWWB"
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
              Contact person
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Name"
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
              Address
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Optional"
                rows={2}
                style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}
              />
            </label>
            <label style={{ fontWeight: 600 }}>
              Reporting frequency
              <select value={reportingFrequency} onChange={(e) => setReportingFrequency(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}>
                <option value="">—</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half-yearly">Half-yearly</option>
                <option value="annual">Annual</option>
              </select>
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
