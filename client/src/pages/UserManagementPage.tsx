import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';

type UserRow = {
  _id: string;
  username: string;
  name: string;
  role: string;
  type: string;
  employee?: { _id: string; name: string; employeeId: string } | null;
};

type EmployeeOption = { _id: string; name: string; employeeId: string };

export function UserManagementPage() {
  const [modal, setModal] = useState<UserRow | null>(null);
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get<UserRow[]>('/users');
      return Array.isArray(res.data) ? res.data : [];
    },
  });
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const res = await api.get<EmployeeOption[] | { data: EmployeeOption[]; total: number }>('/employees', { params: {} });
      const d = res.data;
      if (Array.isArray(d)) return d;
      if (d && typeof d === 'object' && 'data' in d && Array.isArray((d as { data: unknown[] }).data)) return (d as { data: EmployeeOption[] }).data;
      return [];
    },
  });
  const updateUserMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/users/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); },
  });
  const linkEmployeeMutation = useMutation({
    mutationFn: ({ userId, employeeId }: { userId: string; employeeId: string | null }) =>
      api.patch(`/users/${userId}/link-employee`, { employeeId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'User Management' }]} />
      <p style={{ marginBottom: 24, color: '#4a5568' }}>
        View users and their roles. When database is connected, management can create users and assign roles. Link a user to an employee for attendance and leave.
      </p>
      <DataTable<UserRow>
        keyField="_id"
        data={users}
        loading={isLoading}
        columns={[
          { key: 'username', label: 'Username' },
          { key: 'name', label: 'Name' },
          { key: 'role', label: 'Role (display)' },
          { key: 'type', label: 'Type (permissions)' },
          { key: 'employee', label: 'Linked employee', render: (r) => (r.employee ? `${r.employee.name} (${r.employee.employeeId})` : '—') },
        ]}
        actions={(row) => (
          <button type="button" onClick={() => setModal(row)} style={{ color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
        )}
      />
      {modal && (
        <Modal title="Edit user & link employee" onClose={() => setModal(null)}>
          <UserEditForm
            user={modal}
            employees={employees}
            onClose={() => setModal(null)}
            onSaveUser={(body) => updateUserMutation.mutate({ id: modal._id, body })}
            onLinkEmployee={(employeeId) => linkEmployeeMutation.mutate({ userId: modal._id, employeeId })}
            saving={updateUserMutation.isPending || linkEmployeeMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
}

const ROLE_TYPES = ['management', 'program', 'hr', 'admin', 'employee', 'donor'] as const;

function UserEditForm({
  user,
  employees,
  onClose,
  onSaveUser,
  onLinkEmployee,
  saving,
}: {
  user: UserRow;
  employees: EmployeeOption[];
  onClose: () => void;
  onSaveUser: (body: Record<string, unknown>) => void;
  onLinkEmployee: (employeeId: string | null) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [type, setType] = useState(user.type);
  const [linkEmployeeId, setLinkEmployeeId] = useState<string>(user.employee?._id ?? '');
  const isDemoUser = user._id.startsWith('demo-');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoUser) {
      return; // Edit & link require database; form is disabled below
    }
    onSaveUser({ name, role, type });
    onLinkEmployee(linkEmployeeId || null);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {isDemoUser && (
        <p style={{ padding: 12, background: '#fef3c7', borderRadius: 6, fontSize: 14, color: '#92400e', margin: 0 }}>
          User edit and link to employee require a connected database. In demo mode only viewing is available.
        </p>
      )}
      <label>Name <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} disabled={isDemoUser} /></label>
      <label>Role (display) <input value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} disabled={isDemoUser} /></label>
      <label>Type (permissions)
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} disabled={isDemoUser}>
          {ROLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label>Link to employee
        <select value={linkEmployeeId} onChange={(e) => setLinkEmployeeId(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} disabled={isDemoUser}>
          <option value="">— None —</option>
          {employees.map((e) => <option key={e._id} value={e._id}>{e.name} ({e.employeeId})</option>)}
        </select>
      </label>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="submit" disabled={saving || isDemoUser} style={{ padding: '10px 20px', background: isDemoUser ? '#cbd5e0' : '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: isDemoUser ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
        <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
      </div>
    </form>
  );
}
