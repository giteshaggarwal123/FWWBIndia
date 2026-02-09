import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';

type UserRow = {
  _id: string;
  username: string;
  name: string;
  role: string;
  type: string;
};

export function UserManagementPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get<UserRow[]>('/users');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'User Management' }]} />
      <p style={{ marginBottom: 24, color: '#4a5568' }}>
        View users and their roles. When database is connected, management can create users and assign roles. Demo mode shows predefined users only.
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
        ]}
      />
    </div>
  );
}
