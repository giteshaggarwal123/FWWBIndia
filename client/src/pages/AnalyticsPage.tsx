import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';

type ActivityItem = { name: string; budget?: number; expenses?: number; actualParticipants?: number; achievementRate?: number };
type BudgetItem = { head: string; allocated?: number; spent?: number; utilized?: number; utilizationPct?: number; variance?: number };

export function AnalyticsPage() {
  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get<{
        activityCount: number;
        employeeCount?: number;
        totalAllocated?: number;
        totalSpent?: number;
        activities?: ActivityItem[];
        budgetSummary?: BudgetItem[];
      }>('/dashboard');
      return res.data;
    },
  });

  const activities = dashboard?.activities ?? [];
  const budget = dashboard?.budgetSummary ?? [];
  const totalAllocated = dashboard?.totalAllocated ?? 0;
  const totalSpent = dashboard?.totalSpent ?? 0;
  const utilizationPct = totalAllocated ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  const activityChartData = activities.map((a) => ({
    name: (a.name?.slice(0, 18) ?? '') + (a.name && a.name.length > 18 ? '...' : ''),
    participants: a.actualParticipants ?? 0,
    achievement: a.achievementRate ?? 0,
  }));

  const budgetUtilData = budget.map((b) => {
    const spent = b.spent ?? b.utilized ?? 0;
    const allocated = b.allocated ?? 0;
    const pct = b.utilizationPct ?? (allocated ? Math.round((spent / allocated) * 100) : 0);
    return {
      name: b.head.split('-').pop()?.trim().slice(0, 12) ?? '',
      value: pct,
    };
  });

  const COLORS = ['#2E3192', '#1BADE3', '#38a169', '#d69e2e', '#e53e3e'];

  const overBudget = budget.filter((b) => (b.utilizationPct ?? 0) > 100);
  const underBudget = budget.filter((b) => (b.utilizationPct ?? 0) < 80 && (b.utilizationPct ?? 0) > 0);
  const highAchievement = activities.filter((a) => (a.achievementRate ?? 0) >= 150);
  const activityCount = dashboard?.activityCount ?? 0;
  const employeeCount = dashboard?.employeeCount ?? 0;
  const completedActivities = activities.filter((a) => (a as { status?: string }).status === 'completed' || (a.achievementRate ?? 0) >= 100).length;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'AI Insights' }]} />
      <div style={{ background: 'linear-gradient(135deg, #2E3192 0%, #1BADE3 100%)', color: '#fff', padding: 20, borderRadius: 8, marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: 22 }}>AI Insights</h2>
        <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>Data-driven insights and recommendations for your programs</p>
      </div>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Activities</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{dashboard?.activityCount ?? 0}</div>
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Total Allocated</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>₹{(totalAllocated / 100000).toFixed(1)}L</div>
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Total Spent</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>₹{(totalSpent / 100000).toFixed(1)}L</div>
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Overall Utilization</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: utilizationPct > 100 ? '#e53e3e' : '#38a169' }}>{utilizationPct}%</div>
        </div>
      </div>

      {/* AI recommendations */}
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Recommendations</h3>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#4a5568', lineHeight: 1.8 }}>
          {overBudget.length > 0 && (
            <li><strong>Budget:</strong> {overBudget.length} budget head(s) exceed 100% utilization. Review Partner NGOs Meet &amp; Training of Trainers for cost control.</li>
          )}
          {underBudget.length > 0 && (
            <li><strong>Under-utilization:</strong> {underBudget.length} budget head(s) below 80% utilization. Top: {underBudget[0]?.head?.split('-').pop()?.trim() ?? 'N/A'} at {underBudget[0]?.utilizationPct ?? 0}% — consider reallocating or accelerating outreach.</li>
          )}
          {highAchievement.length > 0 && (
            <li><strong>Impact:</strong> {highAchievement.length} activities achieved 150%+ participant targets. Replicate best practices from FE &amp; BMS trainings.</li>
          )}
          <li><strong>Reporting:</strong> {activityCount > 0 ? `${completedActivities} of ${activityCount} activities completed.` : 'No activities yet.'} Quarterly donor report is ready for submission when data is complete.</li>
          <li><strong>Team:</strong> {employeeCount} staff across Programs, Finance, IT &amp; Admin. {employeeCount > 0 ? 'Consider succession planning for key roles.' : 'Add employees to see team insights.'}</li>
        </ul>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {activityChartData.length > 0 && (
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Participants by Activity</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={activityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="participants" fill="#2E3192" name="Participants" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {budgetUtilData.length > 0 && (
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Utilization by Budget Head</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={budgetUtilData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name} ${value}%`}>
                  {budgetUtilData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number | undefined) => [`${v ?? 0}%`, 'Utilization']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {activities.length === 0 && budget.length === 0 && (
        <div style={{ background: '#fff', padding: 40, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center', color: '#718096' }}>
          <p>Connect to your data or run with demo mode to see AI insights and charts.</p>
        </div>
      )}
    </div>
  );
}
