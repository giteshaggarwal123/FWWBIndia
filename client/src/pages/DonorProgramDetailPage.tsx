import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';

type ProgramDetail = {
  project: { name: string; code?: string; donor?: string; partner?: { name: string } };
  activities: { activityId: string; name: string; budget: number; status: string }[];
  budgets: { head: string; allocated: number; utilized: number }[];
  expenses: { expenseId: string; amount: number; category: string; status: string }[];
  summary: { allocated: number; utilized: number; utilizationPercent: number };
};

export function DonorProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['donor-portal', 'program', id],
    queryFn: async () => {
      const res = await api.get<ProgramDetail>(`/donor-portal/programs/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  if (!id) return <div>Invalid program</div>;
  if (isLoading || !data) return <div>Loading...</div>;

  const { project, activities, budgets, expenses, summary } = data;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Donor Portal', path: '/donor-portal' },
          { label: project.name },
        ]}
      />
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 8 }}>{project.name}</h2>
        <p style={{ color: '#718096', fontSize: 14 }}>
          Partner: {(project.partner && typeof project.partner === 'object' && 'name' in project.partner) ? (project.partner as { name: string }).name : '-'} &nbsp;|&nbsp; Donor: {project.donor || '-'}
        </p>
        <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
          <div>Allocated: ₹{(summary.allocated || 0).toLocaleString()}</div>
          <div>Utilized: ₹{(summary.utilized || 0).toLocaleString()}</div>
          <div><strong>{summary.utilizationPercent || 0}%</strong> utilized</div>
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Budget heads</h3>
        <DataTable
          keyField="head"
          data={budgets}
          columns={[
            { key: 'head', label: 'Head' },
            { key: 'allocated', label: 'Allocated', render: (r) => `₹${Number(r.allocated).toLocaleString()}` },
            { key: 'utilized', label: 'Utilized', render: (r) => `₹${Number(r.utilized).toLocaleString()}` },
          ]}
        />
      </div>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Activities</h3>
        <DataTable
          keyField="activityId"
          data={activities}
          columns={[
            { key: 'activityId', label: 'ID' },
            { key: 'name', label: 'Activity' },
            { key: 'budget', label: 'Budget', render: (r) => `₹${Number(r.budget).toLocaleString()}` },
            { key: 'status', label: 'Status' },
          ]}
        />
      </div>
      <div>
        <h3 style={{ marginBottom: 12 }}>Expenses</h3>
        <DataTable
          keyField="expenseId"
          data={expenses}
          columns={[
            { key: 'expenseId', label: 'ID' },
            { key: 'category', label: 'Category' },
            { key: 'amount', label: 'Amount', render: (r) => `₹${Number(r.amount).toLocaleString()}` },
            { key: 'status', label: 'Status' },
          ]}
        />
      </div>
    </div>
  );
}
