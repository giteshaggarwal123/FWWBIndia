import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { downloadExport } from '../api/export';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { useProjects } from '../hooks/useProjects';
import { useProgramFilter } from '../context/ProgramFilterContext';

type Report = {
  _id: string;
  name: string;
  type: string;
  project?: { name: string };
  periodStart?: string;
  periodEnd?: string;
  dueDate?: string;
  format: string;
  generatedBy?: { name: string };
  createdAt: string;
};

const REPORT_TYPES = ['Quarterly', 'Donor', 'Annual', 'Summary', 'Budget', 'Activity'] as const;

export function ReportsPage() {
  const { selectedProjectId, setSelectedProjectId } = useProgramFilter();
  const [projectFilter, setProjectFilter] = useState(selectedProjectId);
  const [typeFilter, setTypeFilter] = useState('');
  const [modal, setModal] = useState(false);
  const queryClient = useQueryClient();
  const { data: projects = [] } = useProjects();
  useEffect(() => {
    setProjectFilter(selectedProjectId);
  }, [selectedProjectId]);
  const onFilterChange = (id: string) => {
    setProjectFilter(id);
    setSelectedProjectId(id);
  };
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['reports', projectFilter, typeFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (projectFilter) params.project = projectFilter;
      if (typeFilter) params.type = typeFilter;
      const res = await api.get<Report[]>('/reports', { params });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/reports', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reports'] }); setModal(false); },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Reports' }]} />
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" onClick={() => setModal(true)} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ Generate Report</button>
        <button type="button" onClick={() => downloadExport('/export/activities', 'Supraja_Activities_Report.xlsx')} style={{ padding: '10px 16px', background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Download Activities (Excel)</button>
        <button type="button" onClick={() => downloadExport('/export/budget', 'Supraja_Budget_Report.xlsx')} style={{ padding: '10px 16px', background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Download Budget (Excel)</button>
        <button type="button" onClick={() => downloadExport('/export/employees', 'FWWB_Team_Members.xlsx')} style={{ padding: '10px 16px', background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Download Team (Excel)</button>
        <button type="button" onClick={() => downloadExport('/export/submissions', 'Form_Submissions.xlsx')} style={{ padding: '10px 16px', background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Download Submissions (Excel)</button>
        <button type="button" onClick={() => downloadExport('/export/monitoring', 'Monitoring_Entries.xlsx')} style={{ padding: '10px 16px', background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Download Monitoring (Excel)</button>
        <select value={projectFilter} onChange={(e) => onFilterChange(e.target.value)} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">All types</option>
          {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <DataTable<Report>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'name', label: 'Report Name' },
          { key: 'type', label: 'Type' },
          { key: 'project', label: 'Project', render: (r) => (r.project && typeof r.project === 'object' && 'name' in r.project ? (r.project as { name: string }).name : '-') },
          { key: 'periodStart', label: 'From', render: (r) => r.periodStart ? new Date(r.periodStart).toLocaleDateString() : '-' },
          { key: 'periodEnd', label: 'To', render: (r) => r.periodEnd ? new Date(r.periodEnd).toLocaleDateString() : '-' },
          { key: 'dueDate', label: 'Due Date', render: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '-' },
          { key: 'format', label: 'Format' },
          { key: 'generatedBy', label: 'Generated By', render: (r) => (r.generatedBy && typeof r.generatedBy === 'object' && 'name' in r.generatedBy ? (r.generatedBy as { name: string }).name : '-') },
        ]}
        actions={(row) => {
          const ext = (row.format === 'excel' || row.format === 'csv') ? 'xlsx' : 'xlsx';
          const filename = `${(row.name || 'Report').replace(/[^a-zA-Z0-9-_ ]/g, '_')}.${ext}`;
          const pathByType: Record<string, string> = {
            Summary: '/export/activities',
            Budget: '/export/budget',
            Activity: '/export/activities',
            Donor: '/export/activities',
          };
          const path = pathByType[row.type] || '/export/activities';
          return (
            <button type="button" onClick={() => downloadExport(path, filename)} style={{ padding: '6px 12px', background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>Download</button>
          );
        }}
      />
      {modal && (
        <Modal title="Generate Report" onClose={() => setModal(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value || 'Report';
              const type = (form.querySelector('[name="type"]') as HTMLSelectElement)?.value || 'Summary';
              const project = (form.querySelector('[name="project"]') as HTMLSelectElement)?.value || undefined;
              const format = (form.querySelector('[name="format"]') as HTMLSelectElement)?.value || 'pdf';
              const periodStart = (form.querySelector('[name="periodStart"]') as HTMLInputElement)?.value;
              const periodEnd = (form.querySelector('[name="periodEnd"]') as HTMLInputElement)?.value;
              const dueDate = (form.querySelector('[name="dueDate"]') as HTMLInputElement)?.value;
              createMutation.mutate({
                name, type, project, format,
                periodStart: periodStart ? new Date(periodStart) : new Date(),
                periodEnd: periodEnd ? new Date(periodEnd) : new Date(),
                dueDate: dueDate ? new Date(dueDate) : undefined,
              });
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label>Report Name * <input name="name" required placeholder="e.g. Q4 2024 Summary" style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Report type <select name="type" style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
            <label>Project <select name="project" style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}><option value="">All</option>{projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></label>
            <label>Period From <input name="periodStart" type="date" defaultValue={new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Period To <input name="periodEnd" type="date" defaultValue={new Date().toISOString().slice(0, 10)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Due Date (e.g. for donor reports) <input name="dueDate" type="date" style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Format <select name="format" style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}><option>pdf</option><option>excel</option><option>word</option><option>csv</option></select></label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={createMutation.isPending} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{createMutation.isPending ? 'Generating...' : 'Generate'}</button>
              <button type="button" onClick={() => setModal(false)} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
