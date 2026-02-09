import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../api/client';

type ActivityItem = { name: string; budget?: number; expenses?: number; actualParticipants?: number; expectedParticipants?: number };
type BudgetItem = { head: string; allocated?: number; spent?: number; utilized?: number; utilizationPct?: number };

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get<{
        activityCount: number;
        projectCount: number;
        expenseCount: number;
        employeeCount: number;
        pendingLeave: number;
        totalAllocated?: number;
        totalSpent?: number;
        activities?: ActivityItem[];
        budgetSummary?: BudgetItem[];
        programWiseSummary?: { projectId: string; projectName: string; allocated: number; utilized: number; utilizationPercent: number; activityCount: number }[];
      }>('/dashboard');
      return res.data;
    },
  });

  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await api.get<{
        insuranceRenewals30: number;
        insuranceRenewals60: number;
        insuranceRenewals90: number;
        warrantyExpiring: number;
        travelPending: number;
        adminExpensesThisMonth: number;
        stationeryPending: number;
      }>('/alerts');
      return res.data;
    },
  });

  const budgetChartData = data?.budgetSummary?.map((b) => ({
    name: b.head.length > 35 ? b.head.slice(0, 32) + '...' : b.head,
    allocated: b.allocated ?? 0,
    spent: b.spent ?? 0,
  })) ?? [];

  const activityChartData = data?.activities?.map((a) => ({
    name: a.name?.length > 20 ? a.name.slice(0, 18) + '...' : a.name ?? '',
    budget: a.budget ?? 0,
    expenses: a.expenses ?? 0,
  })) ?? [];

  const utilizationData =
    data?.budgetSummary?.map((b) => {
      const spent = b.spent ?? b.utilized ?? 0;
      const allocated = b.allocated ?? 0;
      const pct = b.utilizationPct ?? (allocated ? Math.round((spent / allocated) * 100) : 0);
      return {
        name: b.head.split('-').pop()?.trim().slice(0, 15) ?? '',
        value: pct,
      };
    }) ?? [];

  const COLORS = ['#2E3192', '#1BADE3', '#38a169', '#d69e2e', '#e53e3e'];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link to="/dashboard" style={{ color: '#2E3192', textDecoration: 'none', fontSize: 14 }}>Home</Link>
        <span style={{ margin: '0 8px', color: '#718096' }}>/</span>
        <span style={{ color: '#4a5568' }}>Dashboard</span>
      </div>
      <p style={{ marginBottom: 24, color: '#4a5568' }}>Welcome to FWWB Management System. Supraja Foundation – FPO Development project overview.</p>
      {isLoading && <p>Loading stats...</p>}
      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Projects</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{data.projectCount}</div>
            </div>
            <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Activities</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{data.activityCount}</div>
            </div>
            <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Total Allocated</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>₹{(data.totalAllocated ?? 0).toLocaleString()}</div>
            </div>
            <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Total Spent</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>₹{(data.totalSpent ?? 0).toLocaleString()}</div>
            </div>
          </div>

          {data.programWiseSummary && data.programWiseSummary.length > 0 && (
            <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>KPIs by program</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px 8px' }}>Program</th>
                    <th style={{ padding: '10px 8px' }}>Allocated</th>
                    <th style={{ padding: '10px 8px' }}>Utilized</th>
                    <th style={{ padding: '10px 8px' }}>Utilization %</th>
                    <th style={{ padding: '10px 8px' }}>Activities</th>
                  </tr>
                </thead>
                <tbody>
                  {data.programWiseSummary.map((p) => (
                    <tr key={p.projectId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 500 }}>{p.projectName || p.projectId}</td>
                      <td style={{ padding: '10px 8px' }}>₹{(p.allocated ?? 0).toLocaleString()}</td>
                      <td style={{ padding: '10px 8px' }}>₹{(p.utilized ?? 0).toLocaleString()}</td>
                      <td style={{ padding: '10px 8px', color: (p.utilizationPercent ?? 0) > 100 ? '#c53030' : '#276749' }}>{p.utilizationPercent ?? 0}%</td>
                      <td style={{ padding: '10px 8px' }}>{p.activityCount ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activityChartData.length > 0 && (
            <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Activity Budget vs Expenses</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `₹${(v / 1000)}k`} />
                  <Tooltip formatter={(v: number | undefined) => `₹${(v ?? 0).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="budget" fill="#2E3192" name="Budget" />
                  <Bar dataKey="expenses" fill="#1BADE3" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: budgetChartData.length ? '1fr 1fr' : '1fr', gap: 24, marginBottom: 24 }}>
            {budgetChartData.length > 0 && (
              <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Budget by Head</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={budgetChartData} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000)}k`} />
                    <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number | undefined) => [`₹${(v ?? 0).toLocaleString()}`, '']} />
                    <Legend />
                    <Bar dataKey="allocated" fill="#2E3192" name="Allocated" />
                    <Bar dataKey="spent" fill="#38a169" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {utilizationData.length > 0 && (
              <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Utilization % by Head</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={utilizationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name} ${value}%`}>
                      {utilizationData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number | undefined) => [`${v ?? 0}%`, 'Utilization']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
      {alerts && (alerts.insuranceRenewals30! > 0 || alerts.warrantyExpiring! > 0 || alerts.travelPending! > 0 || alerts.stationeryPending! > 0 || (alerts.adminExpensesThisMonth ?? 0) > 0) && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <strong style={{ display: 'block', marginBottom: 8 }}>Alerts & reminders</strong>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {alerts.insuranceRenewals30! > 0 && <li>Insurance renewals in 30 days: {alerts.insuranceRenewals30}</li>}
            {alerts.insuranceRenewals60! > 0 && <li>Insurance renewals in 60 days: {alerts.insuranceRenewals60}</li>}
            {alerts.insuranceRenewals90! > 0 && <li>Insurance renewals in 90 days: {alerts.insuranceRenewals90}</li>}
            {alerts.warrantyExpiring! > 0 && <li>Warranty expiring (assets): {alerts.warrantyExpiring}</li>}
            {alerts.travelPending! > 0 && <li>Travel requests pending approval: {alerts.travelPending}</li>}
            {alerts.stationeryPending! > 0 && <li>Stationery requests pending: {alerts.stationeryPending}</li>}
            {(alerts.adminExpensesThisMonth ?? 0) > 0 && <li>Admin expenses approved this month: {alerts.adminExpensesThisMonth}</li>}
          </ul>
          <div style={{ marginTop: 8, fontSize: 13 }}>
            <Link to="/insurance" style={{ marginRight: 12 }}>Insurance</Link>
            <Link to="/assets" style={{ marginRight: 12 }}>Assets</Link>
            <Link to="/travel" style={{ marginRight: 12 }}>Travel</Link>
            <Link to="/stationery">Stationery</Link>
          </div>
        </div>
      )}
    </div>
  );
}
