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
};

const departments = ['Management', 'Programs', 'Finance', 'IT', 'Administration', 'HR'];

export function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Employee | null>(null);
  const queryClient = useQueryClient();
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees', search, dept],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (dept) params.department = dept;
      const res = await api.get<Employee[]>('/employees', { params });
      return res.data;
    },
  });

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
        <select value={dept} onChange={(e) => setDept(e.target.value)} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <DataTable<Employee>
        keyField="_id"
        data={employees}
        loading={isLoading}
        columns={[
          { key: 'employeeId', label: 'Emp ID' },
          { key: 'name', label: 'Name' },
          { key: 'designation', label: 'Designation' },
          { key: 'department', label: 'Department' },
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
          <EmployeeForm onClose={() => setModal(null)} onSubmit={(body) => createMutation.mutate(body)} loading={createMutation.isPending} />
        </Modal>
      )}
      {modal === 'edit' && editing && (
        <Modal title="Edit Employee" onClose={() => { setModal(null); setEditing(null); }}>
          <EmployeeForm initial={editing} onClose={() => { setModal(null); setEditing(null); }} onSubmit={(body) => updateMutation.mutate({ id: editing._id, body })} loading={updateMutation.isPending} />
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
}: {
  initial?: Employee;
  onClose: () => void;
  onSubmit: (body: Record<string, unknown>) => void;
  loading: boolean;
}) {
  const [employeeId, setEmployeeId] = useState(initial?.employeeId ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [department, setDepartment] = useState(initial?.department ?? 'Programs');
  const [designation, setDesignation] = useState(initial?.designation ?? '');
  const [location, setLocation] = useState(initial?.location ?? 'Head Office - Ahmedabad');
  const [status, setStatus] = useState(initial?.status ?? 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ employeeId, name, email, department, designation, location, status });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label>Employee ID * <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      <label>Name * <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      <label>Email * <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      <label>Department * <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{departments.map((d) => <option key={d} value={d}>{d}</option>)}</select></label>
      <label>Designation * <input value={designation} onChange={(e) => setDesignation(e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      <label>Location <input value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
      {initial && <label>Status <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}><option value="active">Active</option><option value="inactive">Inactive</option><option value="resigned">Resigned</option></select></label>}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save'}</button>
        <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
      </div>
    </form>
  );
}
