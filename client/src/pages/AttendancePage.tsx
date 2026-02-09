import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useEmployees } from '../hooks/useEmployees';

type Attendance = {
  _id: string;
  employee?: { name: string; employeeId: string };
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
  lat?: number;
  lng?: number;
  checkOutLat?: number;
  checkOutLng?: number;
};

const statuses = ['present', 'absent', 'leave', 'half-day', 'wfh'];

export function AttendancePage() {
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Attendance | null>(null);
  const [empFilter, setEmpFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const queryClient = useQueryClient();
  const { data: employees = [] } = useEmployees();
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['attendance', empFilter, dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (empFilter) params.set('employee', empFilter);
      if (dateFilter) params.set('date', dateFilter);
      const res = await api.get<Attendance[]>(`/attendance?${params}`);
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/attendance', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['attendance'] }); setModal(null); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/attendance/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['attendance'] }); setModal(null); setEditing(null); },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Attendance' }]} />
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" onClick={() => { setEditing(null); setModal('add'); }} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ Mark Attendance</button>
        <select value={empFilter} onChange={(e) => setEmpFilter(e.target.value)} style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">All employees</option>
          {employees.map((e) => <option key={e._id} value={e._id}>{e.employeeId} - {e.name}</option>)}
        </select>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} />
      </div>
      <DataTable<Attendance>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'employee', label: 'Employee', render: (r) => r.employee ? (r.employee as { name: string }).name : '-' },
          { key: 'date', label: 'Date', render: (r) => r.date ? new Date(r.date).toLocaleDateString() : '' },
          { key: 'checkIn', label: 'Check In', render: (r) => r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '-' },
          { key: 'checkOut', label: 'Check Out', render: (r) => r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '-' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          {
            key: 'location',
            label: 'Location',
            render: (r) => {
              const hasIn = r.lat != null && r.lng != null;
              const hasOut = r.checkOutLat != null && r.checkOutLng != null;
              if (!hasIn && !hasOut) return '-';
              const link = (lat: number, lng: number, label: string) => (
                <a key={label} href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, marginRight: 8 }}>{label}</a>
              );
              return (
                <span>
                  {hasIn && link(r.lat!, r.lng!, 'In')}
                  {hasOut && link(r.checkOutLat!, r.checkOutLng!, 'Out')}
                </span>
              );
            },
          },
        ]}
        actions={(row) => (
          <button type="button" onClick={() => { setEditing(row); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
        )}
      />
      {modal && (
        <Modal title={editing ? 'Edit Attendance' : 'Mark Attendance'} onClose={() => { setModal(null); setEditing(null); }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const employee = (form.querySelector('[name="employee"]') as HTMLSelectElement)?.value;
              const date = (form.querySelector('[name="date"]') as HTMLInputElement)?.value;
              const status = (form.querySelector('[name="status"]') as HTMLSelectElement)?.value;
              const checkIn = (form.querySelector('[name="checkIn"]') as HTMLInputElement)?.value;
              const checkOut = (form.querySelector('[name="checkOut"]') as HTMLInputElement)?.value;
              if (!employee || !date || !status) return;
              const body: Record<string, unknown> = { employee, date: new Date(date), status };
              if (checkIn) body.checkIn = new Date(`${date}T${checkIn}`);
              if (checkOut) body.checkOut = new Date(`${date}T${checkOut}`);
              if (editing) updateMutation.mutate({ id: editing._id, body });
              else createMutation.mutate(body);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label>Employee * <select name="employee" required defaultValue={editing?.employee && typeof editing.employee === 'object' && '_id' in editing.employee ? (editing.employee as { _id: string })._id : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{employees.map((e) => <option key={e._id} value={e._id}>{e.employeeId} - {e.name}</option>)}</select></label>
            <label>Date * <input name="date" type="date" required defaultValue={editing?.date ? new Date(editing.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Status * <select name="status" required defaultValue={editing?.status} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
            <label>Check In <input name="checkIn" type="time" defaultValue={editing?.checkIn ? new Date(editing.checkIn).toTimeString().slice(0, 5) : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Check Out <input name="checkOut" type="time" defaultValue={editing?.checkOut ? new Date(editing.checkOut).toTimeString().slice(0, 5) : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editing ? 'Save' : 'Save')}</button>
              <button type="button" onClick={() => { setModal(null); setEditing(null); }} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
