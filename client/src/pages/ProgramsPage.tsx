import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useDonors } from '../hooks/useDonors';
import { usePartners } from '../hooks/usePartners';
import { Link } from 'react-router-dom';

type Project = {
  _id: string;
  name: string;
  code?: string;
  donor?: string;
  partner?: string | { _id: string; name?: string; code?: string };
  status: string;
  startDate?: string;
  endDate?: string;
  grantStartDate?: string;
  grantEndDate?: string;
  budgetCeiling?: number;
};

const statusOptions = ['active', 'completed', 'on-hold'];

export function ProgramsPage() {
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [donor, setDonor] = useState('');
  const [partner, setPartner] = useState('');
  const [status, setStatus] = useState('active');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [grantStartDate, setGrantStartDate] = useState('');
  const [grantEndDate, setGrantEndDate] = useState('');
  const [budgetCeiling, setBudgetCeiling] = useState('');
  const queryClient = useQueryClient();

  const { data: donors = [] } = useDonors();
  const { data: partnersList = [] } = usePartners();
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get<Project[]>('/projects');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/projects', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setModal(null);
      resetForm();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.patch(`/projects/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setModal(null);
      setEditing(null);
      resetForm();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const resetForm = () => {
    setName('');
    setCode('');
    setDonor('');
    setPartner('');
    setStatus('active');
    setStartDate('');
    setEndDate('');
    setGrantStartDate('');
    setGrantEndDate('');
    setBudgetCeiling('');
  };

  const openAdd = () => {
    setEditing(null);
    resetForm();
    setModal('add');
  };
  const openEdit = (row: Project) => {
    setEditing(row);
    setName(row.name);
    setCode(row.code ?? '');
    setDonor(row.donor ?? '');
    setPartner(typeof row.partner === 'object' && row.partner?._id ? row.partner._id : (row.partner as string) ?? '');
    setStatus(row.status ?? 'active');
    setStartDate(row.startDate ? row.startDate.slice(0, 10) : '');
    setEndDate(row.endDate ? row.endDate.slice(0, 10) : '');
    setGrantStartDate(row.grantStartDate ? String(row.grantStartDate).slice(0, 10) : '');
    setGrantEndDate(row.grantEndDate ? String(row.grantEndDate).slice(0, 10) : '');
    setBudgetCeiling(row.budgetCeiling != null ? String(row.budgetCeiling) : '');
    setModal('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body: Record<string, unknown> = {
      name: name.trim(),
      code: code.trim() || undefined,
      donor: donor.trim() || undefined,
      partner: partner.trim() || undefined,
      status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      grantStartDate: grantStartDate || undefined,
      grantEndDate: grantEndDate || undefined,
      budgetCeiling: budgetCeiling ? Number(budgetCeiling) : undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing._id, body });
    } else {
      createMutation.mutate(body);
    }
  };

  const handleDelete = (row: Project) => {
    if (window.confirm(`Delete program "${row.name}"? This may affect activities, budget, and forms linked to it.`)) {
      deleteMutation.mutate(row._id);
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Programs' }]} />
      <p style={{ marginBottom: 24, color: '#4a5568' }}>
        Manage FWWB programs (projects). Link a <Link to="/donor-mgmt" style={{ color: '#2E3192' }}>donor</Link> and <Link to="/partners" style={{ color: '#2E3192' }}>partner</Link> when creating or editing. Activities, budget, expenses, and forms are linked to a program.
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
          + Add Program
        </button>
      </div>
      <DataTable<Project>
        keyField="_id"
        data={programs}
        loading={isLoading}
        columns={[
          { key: 'name', label: 'Program Name' },
          { key: 'code', label: 'Code', render: (r) => r.code || '—' },
          { key: 'donor', label: 'Donor', render: (r) => r.donor ? <Link to="/donor-mgmt" style={{ color: '#2E3192', fontSize: 13 }}>{r.donor}</Link> : '—' },
          { key: 'partner', label: 'Partner', render: (r) => (typeof r.partner === 'object' && r.partner?.name) ? <Link to="/partners" style={{ color: '#2E3192', fontSize: 13 }}>{r.partner.name}{r.partner.code ? ` (${r.partner.code})` : ''}</Link> : (r.partner ? String(r.partner) : '—') },
          {
            key: 'startDate',
            label: 'Start',
            render: (r) => (r.startDate ? new Date(r.startDate).toLocaleDateString() : '—'),
          },
          {
            key: 'endDate',
            label: 'End',
            render: (r) => (r.endDate ? new Date(r.endDate).toLocaleDateString() : '—'),
          },
          { key: 'grantStartDate', label: 'Grant start', render: (r) => (r.grantStartDate ? new Date(r.grantStartDate).toLocaleDateString() : '—') },
          { key: 'grantEndDate', label: 'Grant end', render: (r) => (r.grantEndDate ? new Date(r.grantEndDate).toLocaleDateString() : '—') },
          { key: 'budgetCeiling', label: 'Budget ceiling', render: (r) => (r.budgetCeiling != null ? `₹${Number(r.budgetCeiling).toLocaleString()}` : '—') },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
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
        <Modal title={editing ? 'Edit Program' : 'Add Program'} onClose={() => { setModal(null); setEditing(null); resetForm(); }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontWeight: 600 }}>
              Program name *
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Supraja Foundation - FPO Development"
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
              Donor
              <select
                value={donor}
                onChange={(e) => setDonor(e.target.value)}
                style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}
              >
                <option value="">None</option>
                {donors.map((d) => (
                  <option key={d._id} value={d.name}>{d.name}{d.code ? ` (${d.code})` : ''}</option>
                ))}
              </select>
              {donors.length === 0 && <span style={{ fontSize: 12, color: '#718096' }}> Add donors in <Link to="/donor-mgmt">Donor Management</Link>.</span>}
            </label>
            <label style={{ fontWeight: 600 }}>
              Partner
              <select
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}
              >
                <option value="">None</option>
                {partnersList.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}{p.code ? ` (${p.code})` : ''}</option>
                ))}
              </select>
              {partnersList.length === 0 && <span style={{ fontSize: 12, color: '#718096' }}> Add partners in <Link to="/partners">Partner Management</Link>.</span>}
            </label>
            <label style={{ fontWeight: 600 }}>
              Status *
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
            <label style={{ fontWeight: 600 }}>
              Start date
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}
              />
            </label>
            <label style={{ fontWeight: 600 }}>
              End date
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }}
              />
            </label>
            <label style={{ fontWeight: 600 }}>
              Grant start date
              <input type="date" value={grantStartDate} onChange={(e) => setGrantStartDate(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }} />
            </label>
            <label style={{ fontWeight: 600 }}>
              Grant end date
              <input type="date" value={grantEndDate} onChange={(e) => setGrantEndDate(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }} />
            </label>
            <label style={{ fontWeight: 600 }}>
              Budget ceiling (₹)
              <input type="number" min={0} value={budgetCeiling} onChange={(e) => setBudgetCeiling(e.target.value)} placeholder="Optional" style={{ width: '100%', padding: 10, marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 6 }} />
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
