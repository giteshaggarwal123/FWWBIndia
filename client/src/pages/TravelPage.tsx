import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { uploadFile } from '../api/upload';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useEmployees } from '../hooks/useEmployees';
import { useAuth } from '../hooks/useAuth';

type Travel = {
  _id: string;
  requestId: string;
  employee?: { name: string; employeeId: string };
  purposeOfTravel?: string;
  from: string;
  to: string;
  travelDate: string;
  mode: string;
  estimatedCost: number;
  status: string;
};

const modes = ['flight', 'train', 'bus', 'car'];

export function TravelPage() {
  const { approval } = useAuth();
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Travel | null>(null);
  const [uploading, setUploading] = useState(false);
  const ticketFileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: employees = [] } = useEmployees();
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['travel'],
    queryFn: async () => {
      const res = await api.get<Travel[]>('/travel');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/travel', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['travel'] }); setModal(null); },
  });
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch<Travel>(`/travel/${id}`, { status }),
    onSuccess: (res) => {
      const data = res.data;
      queryClient.setQueriesData({ queryKey: ['travel'] }, (old: Travel[] | undefined) => {
        if (!old) return old;
        return old.map((t) => t._id === data._id ? { ...t, ...data } : t);
      });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/travel/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['travel'] }); setModal(null); setEditing(null); },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Travel Booking' }]} />
      <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
        <button type="button" onClick={() => { setEditing(null); setModal('add'); }} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ New Travel Request</button>
      </div>
      <DataTable<Travel>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'requestId', label: 'Request ID' },
          { key: 'employee', label: 'Employee', render: (r) => r.employee ? (r.employee as { name: string }).name : '-' },
          { key: 'purposeOfTravel', label: 'Purpose' },
          { key: 'from', label: 'From - To', render: (r) => `${r.from} - ${r.to}` },
          { key: 'travelDate', label: 'Travel Date', render: (r) => r.travelDate ? new Date(r.travelDate).toLocaleDateString() : '' },
          { key: 'mode', label: 'Mode' },
          { key: 'estimatedCost', label: 'Est. Cost', render: (r) => `₹${Number(r.estimatedCost).toLocaleString()}` },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
        actions={(row) => (
          <span>
            <button type="button" onClick={() => { setEditing(row); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
            {row.status === 'pending' && approval?.travel && <button type="button" onClick={() => updateStatusMutation.mutate({ id: row._id, status: 'approved' })} style={{ marginRight: 8, color: '#276749', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Approve</button>}
            {row.status === 'pending' && approval?.travel && <button type="button" onClick={() => updateStatusMutation.mutate({ id: row._id, status: 'rejected' })} style={{ color: '#c53030', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Reject</button>}
          </span>
        )}
      />
      {modal && (
        <Modal title={editing ? 'Edit Travel Request' : 'New Travel Request'} onClose={() => { setModal(null); setEditing(null); }}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const employee = (form.querySelector('[name="employee"]') as HTMLSelectElement)?.value;
              const purposeOfTravel = (form.querySelector('[name="purposeOfTravel"]') as HTMLInputElement)?.value || '';
              const from = (form.querySelector('[name="from"]') as HTMLInputElement)?.value;
              const to = (form.querySelector('[name="to"]') as HTMLInputElement)?.value;
              const travelDate = (form.querySelector('[name="travelDate"]') as HTMLInputElement)?.value;
              const mode = (form.querySelector('[name="mode"]') as HTMLSelectElement)?.value;
              const estimatedCost = (form.querySelector('[name="estimatedCost"]') as HTMLInputElement)?.value;
              if (!employee || !from || !to || !travelDate || !mode) return;
              const body = { employee, purposeOfTravel, from, to, travelDate: new Date(travelDate), mode, estimatedCost: Number(estimatedCost) || 0 };
              const file = ticketFileRef.current?.files?.[0];
              try {
                let travelId: string;
                if (editing) {
                  await updateMutation.mutateAsync({ id: editing._id, body });
                  travelId = editing._id;
                } else {
                  const res = await createMutation.mutateAsync({ requestId: `TR-${Date.now()}`, ...body });
                  travelId = (res as { data?: { _id: string } }).data?._id ?? '';
                }
                if (file && travelId) {
                  setUploading(true);
                  const fileDoc = await uploadFile(file, 'TravelRequest', travelId);
                  await api.patch(`/travel/${travelId}`, { ticketAttachmentId: fileDoc._id });
                }
                queryClient.invalidateQueries({ queryKey: ['travel'] });
                setModal(null);
                setEditing(null);
              } catch (err) {
                console.error(err);
              } finally {
                setUploading(false);
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label>Employee * <select name="employee" required defaultValue={editing?.employee && typeof editing.employee === 'object' && '_id' in editing.employee ? (editing.employee as { _id: string })._id : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{employees.map((e) => <option key={e._id} value={e._id}>{e.employeeId} - {e.name}</option>)}</select></label>
            <label>Purpose of Travel <input name="purposeOfTravel" defaultValue={editing?.purposeOfTravel} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>From * <input name="from" required defaultValue={editing?.from} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>To * <input name="to" required defaultValue={editing?.to} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Travel Date * <input name="travelDate" type="date" required defaultValue={editing?.travelDate ? new Date(editing.travelDate).toISOString().slice(0, 10) : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Mode * <select name="mode" required defaultValue={editing?.mode} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{modes.map((m) => <option key={m} value={m}>{m}</option>)}</select></label>
            <label>Estimated Cost (₹) <input name="estimatedCost" type="number" defaultValue={editing?.estimatedCost ?? 0} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Ticket / Invoice (optional) <input ref={ticketFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ width: '100%', padding: 8 }} /></label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending || uploading} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{createMutation.isPending || updateMutation.isPending || uploading ? 'Saving...' : (editing ? 'Save' : 'Submit')}</button>
              <button type="button" onClick={() => { setModal(null); setEditing(null); }} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
