import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { useAuth } from '../hooks/useAuth';

export function ApprovalsPage() {
  const { approval } = useAuth();

  const { data: leaveList = [] } = useQuery({
    queryKey: ['leave', 'pending'],
    queryFn: async () => {
      const res = await api.get<{ _id: string }[]>('/leave', { params: { status: 'pending' } });
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!approval?.leave,
  });
  const { data: expenseList = [] } = useQuery({
    queryKey: ['expenses', 'pending'],
    queryFn: async () => {
      const res = await api.get<{ _id: string; status: string }[]>('/expenses');
      return Array.isArray(res.data) ? res.data.filter((e) => e.status === 'submitted' || e.status === 'verified') : [];
    },
    enabled: !!(approval?.expenseVerify || approval?.expenseApprove),
  });
  const { data: adminExpenseList = [] } = useQuery({
    queryKey: ['admin-expenses', 'pending'],
    queryFn: async () => {
      const res = await api.get<{ _id: string }[]>('/admin-expenses', { params: { status: 'pending' } });
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!approval?.adminExpense,
  });
  const { data: travelList = [] } = useQuery({
    queryKey: ['travel', 'pending'],
    queryFn: async () => {
      const res = await api.get<{ _id: string }[]>('/travel', { params: { status: 'pending' } });
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!approval?.travel,
  });
  const { data: stationeryList = [] } = useQuery({
    queryKey: ['stationery', 'pending'],
    queryFn: async () => {
      const res = await api.get<{ _id: string }[]>('/stationery', { params: { status: 'pending' } });
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!approval?.stationery,
  });

  const hasAnyApproval = approval && (approval.leave || approval.expenseVerify || approval.expenseApprove || approval.adminExpense || approval.travel || approval.stationery);

  if (!hasAnyApproval) {
    return (
      <div>
        <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Pending Approvals' }]} />
        <p style={{ color: '#718096', marginTop: 16 }}>You do not have approval permissions for any module.</p>
      </div>
    );
  }

  const cards: { label: string; count: number; path: string; description: string }[] = [];
  if (approval?.leave) {
    cards.push({ label: 'Leave requests', count: leaveList.length, path: '/leave', description: 'Pending leave' });
  }
  if (approval?.expenseVerify || approval?.expenseApprove) {
    cards.push({ label: 'Program expenses', count: expenseList.length, path: '/expenses', description: 'To verify or approve' });
  }
  if (approval?.adminExpense) {
    cards.push({ label: 'Admin expenses', count: adminExpenseList.length, path: '/admin-expenses', description: 'Pending approval' });
  }
  if (approval?.travel) {
    cards.push({ label: 'Travel requests', count: travelList.length, path: '/travel', description: 'Pending approval' });
  }
  if (approval?.stationery) {
    cards.push({ label: 'Stationery requests', count: stationeryList.length, path: '/stationery', description: 'Pending approval' });
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Pending Approvals' }]} />
      <p style={{ color: '#4a5568', marginBottom: 24 }}>Summary of items awaiting your approval. Open each module to take action.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {cards.map((c) => (
          <Link
            key={c.path}
            to={c.path}
            style={{
              padding: 20,
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ fontSize: 14, color: '#718096', marginBottom: 4 }}>{c.description}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#2E3192', marginBottom: 4 }}>{c.count}</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
