import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { downloadExport } from '../api/export';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

type Employee = {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  location: string;
  status: string;
  reportingTo?: { _id: string; name: string } | string;
  employeeType?: string;
};

const departments = ['Management', 'Programs', 'Finance', 'IT', 'Administration', 'HR'];
const employeeTypes = ['full-time', 'part-time', 'consultant', 'contract'];
const PAGE_SIZE = 20;

export function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Employee | null>(null);
  const queryClient = useQueryClient();
  const { data: employeesResponse, isLoading } = useQuery({
    queryKey: ['employees', search, dept, page],
    queryFn: async () => {
      const params: Record<string, string | number> = { limit: PAGE_SIZE, page };
      if (search) params.search = search;
      if (dept) params.department = dept;
      const res = await api.get<{ data?: Employee[]; total?: number } | Employee[]>('/employees', { params });
      const body = res.data;
      if (body && typeof body === 'object' && 'data' in body && Array.isArray((body as { data: Employee[] }).data)) {
        return { data: (body as { data: Employee[] }).data, total: (body as { total: number }).total ?? 0 };
      }
      return { data: Array.isArray(body) ? body : [], total: 0 };
    },
  });
  const employees = employeesResponse?.data ?? [];
  const total = employeesResponse?.total ?? (employeesResponse?.data ? employees.length : 0);
  const totalPages = Math.max(1, Math.ceil((total || employees.length) / PAGE_SIZE));

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/employees', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); setModal(null); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/employees/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); setModal(null); setEditing(null); },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Employee Management' }]} />
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => { setEditing(null); setModal('add'); }} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ Add Employee</button>
        <button type="button" onClick={() => downloadExport('/export/employees', 'FWWB_Team_Members.xlsx')} style={{ padding: '10px 16px', background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Download Excel</button>
        <input type="text" placeholder="Search by name, ID, department..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 6, minWidth: 260 }} />
        <select value={dept} onChange={(e) => { setDept(e.target.value); setPage(0); }} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
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
      <DataTable<Employee>
        keyField="_id"
        data={employees}
        loading={isLoading}
        columns={[
          { key: 'employeeId', label: 'Emp ID' },
          { key: 'name', label: 'Name' },
          { key: 'designation', label: 'Designation' },
          { key: 'department', label: 'Department' },
          { key: 'reportingTo', label: 'Reports to', render: (r) => (r.reportingTo && typeof r.reportingTo === 'object' && r.reportingTo.name) || (typeof r.reportingTo === 'string' ? r.reportingTo : '—') },
          { key: 'employeeType', label: 'Type', render: (r) => r.employeeType || '—' },
          { key: 'email', label: 'Email' },
          { key: 'location', label: 'Location' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
        actions={(row) => (
          <span>
            <button type="button" onClick={() => { setEditing(row); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
          </span>
        )}
      />
      {modal === 'add' && (
        <Modal title="Add Employee" onClose={() => setModal(null)}>
          <EmployeeForm employees={employees} onClose={() => setModal(null)} onSubmit={(body) => createMutation.mutate(body)} loading={createMutation.isPending} />
        </Modal>
      )}
      {modal === 'edit' && editing && (
        <Modal title="Edit Employee" onClose={() => { setModal(null); setEditing(null); }}>
          <EmployeeForm initial={editing} employees={employees} onClose={() => { setModal(null); setEditing(null); }} onSubmit={(body) => updateMutation.mutate({ id: editing._id, body })} loading={updateMutation.isPending} />
        </Modal>
      )}
    </div>
  );
}

function EmployeeForm({
  initial,
  onClose,
  onSubmit,
  loading,
  employees,
}: {
  initial?: Employee;
  onClose: () => void;
  onSubmit: (body: Record<string, unknown>) => void;
  loading: boolean;
  employees: Employee[];
}) {
  const [employeeId, setEmployeeId] = useState(initial?.employeeId ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [department, setDepartment] = useState(initial?.department ?? 'Programs');
  const [designation, setDesignation] = useState(initial?.designation ?? '');
  const [location, setLocation] = useState(initial?.location ?? 'Head Office - Ahmedabad');
  const [status, setStatus] = useState(initial?.status ?? 'active');
  const reportingToId = initial?.reportingTo && typeof initial.reportingTo === 'object' ? initial.reportingTo._id : (typeof initial?.reportingTo === 'string' ? initial.reportingTo : '');
  const [reportingTo, setReportingTo] = useState(reportingToId);
  const [employeeType, setEmployeeType] = useState(initial?.employeeType ?? 'full-time');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body: Record<string, unknown> = { employeeId, name, email, department, designation, location, status, employeeType };
    body.reportingTo = reportingTo || null;
    onSubmit(body);
  };

  const reportingOptions = employees.filter((e) => e._id !== initial?._id);

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label>Employee ID * <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      <label>Name * <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      <label>Email * <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      <label>Department * <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{departments.map((d) => <option key={d} value={d}>{d}</option>)}</select></label>
      <label>Designation * <input value={designation} onChange={(e) => setDesignation(e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      <label>Reports to <select value={reportingTo} onChange={(e) => setReportingTo(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
        <option value="">— None —</option>
        {reportingOptions.map((e) => <option key={e._id} value={e._id}>{e.name} ({e.employeeId})</option>)}
      </select></label>
      <label>Employee type <select value={employeeType} onChange={(e) => setEmployeeType(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{employeeTypes.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
      <label>Location <input value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      {initial && <label>Status <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}><option value="active">Active</option><option value="inactive">Inactive</option><option value="resigned">Resigned</option></select></label>}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save'}</button>
        <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
      </div>
    </form>
  );
}
