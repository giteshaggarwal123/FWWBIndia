import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useEmployees } from '../hooks/useEmployees';
import { useAuth } from '../hooks/useAuth';

type Leave = {
  _id: string;
  employee?: { name: string; employeeId: string };
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: string;
};

const leaveTypes = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Compensatory Off', 'Leave Without Pay'];

export function LeavePage() {
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Leave | null>(null);
  const queryClient = useQueryClient();
  const { approval } = useAuth();
  const { data: employees = [] } = useEmployees();
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['leave'],
    queryFn: async () => {
      const res = await api.get<Leave[]>('/leave');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/leave', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leave'] }); setModal(null); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/leave/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leave'] }); setModal(null); setEditing(null); },
  });
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => api.patch<Leave>(`/leave/${id}`, { status }),
    onSuccess: (res) => {
      const data = res?.data;
      if (!data || !(data as Leave)._id) return;
      queryClient.setQueriesData({ queryKey: ['leave'] }, (old: Leave[] | undefined) => {
        if (!old) return old;
        return old.map((l) => l._id === (data as Leave)._id ? { ...l, ...(data as Leave) } : l);
      });
    },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Leave Management' }]} />
      <div style={{ marginBottom: 24 }}>
        <button type="button" onClick={() => { setEditing(null); setModal('add'); }} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', marginRight: 8 }}>Apply Leave</button>
      </div>
      <DataTable<Leave>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'employee', label: 'Employee', render: (r) => r.employee ? `${(r.employee as { employeeId: string }).employeeId} - ${(r.employee as { name: string }).name}` : '-' },
          { key: 'leaveType', label: 'Leave Type' },
          { key: 'fromDate', label: 'From', render: (r) => r.fromDate ? new Date(r.fromDate).toLocaleDateString() : '' },
          { key: 'toDate', label: 'To', render: (r) => r.toDate ? new Date(r.toDate).toLocaleDateString() : '' },
          { key: 'days', label: 'Days' },
          { key: 'reason', label: 'Reason' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
        actions={(row) => (
          <span>
            <button type="button" onClick={() => { setEditing(row); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
            {row.status === 'pending' && approval?.leave && <button type="button" style={{ marginRight: 8, color: '#276749', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }} onClick={() => updateStatus.mutate({ id: row._id, status: 'approved' })}>Approve</button>}
            {row.status === 'pending' && approval?.leave && <button type="button" style={{ color: '#c53030', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }} onClick={() => updateStatus.mutate({ id: row._id, status: 'rejected' })}>Reject</button>}
          </span>
        )}
      />
      {modal && (
        <Modal title={editing ? 'Edit Leave' : 'Apply Leave'} onClose={() => { setModal(null); setEditing(null); }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const employee = (form.querySelector('[name="employee"]') as HTMLSelectElement)?.value;
              const leaveType = (form.querySelector('[name="leaveType"]') as HTMLSelectElement)?.value;
              const fromDate = (form.querySelector('[name="fromDate"]') as HTMLInputElement)?.value;
              const toDate = (form.querySelector('[name="toDate"]') as HTMLInputElement)?.value;
              const reason = (form.querySelector('[name="reason"]') as HTMLInputElement)?.value || '';
              const status = (form.querySelector('[name="status"]') as HTMLSelectElement)?.value;
              if (!employee || !fromDate || !toDate) return;
              const from = new Date(fromDate);
              const to = new Date(toDate);
              const days = Math.ceil((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1;
              const body: Record<string, unknown> = { employee, leaveType, fromDate: from, toDate: to, days, reason, status: status || 'pending' };
              if (editing) updateMutation.mutate({ id: editing._id, body });
              else createMutation.mutate(body);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label>Employee * <select name="employee" required defaultValue={editing?.employee && typeof editing.employee === 'object' && '_id' in editing.employee ? (editing.employee as { _id: string })._id : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{employees.map((e) => <option key={e._id} value={e._id}>{e.employeeId} - {e.name}</option>)}</select></label>
            <label>Leave Type * <select name="leaveType" required defaultValue={editing?.leaveType} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{leaveTypes.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
            <label>From Date * <input name="fromDate" type="date" required defaultValue={editing?.fromDate ? new Date(editing.fromDate).toISOString().slice(0, 10) : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>To Date * <input name="toDate" type="date" required defaultValue={editing?.toDate ? new Date(editing.toDate).toISOString().slice(0, 10) : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Reason <input name="reason" defaultValue={editing?.reason} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            {editing && <label>Status <select name="status" defaultValue={editing?.status} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}><option value="pending">pending</option><option value="approved">approved</option><option value="rejected">rejected</option></select></label>}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editing ? 'Save' : 'Submit')}</button>
              <button type="button" onClick={() => { setModal(null); setEditing(null); }} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
