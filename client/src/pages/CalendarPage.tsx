import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

type Event = {
  _id: string;
  title: string;
  type: string;
  date: string;
  location?: string;
  participants?: string;
  status: string;
};

const eventTypes = ['event', 'holiday', 'birthday', 'anniversary'];
const statuses = ['planned', 'confirmed', 'cancelled'];

export function CalendarPage() {
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Event | null>(null);
  const queryClient = useQueryClient();
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['calendar'],
    queryFn: async () => {
      const res = await api.get<Event[]>('/calendar');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/calendar', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['calendar'] }); setModal(null); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/calendar/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['calendar'] }); setModal(null); setEditing(null); },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'HR Calendar & Events' }]} />
      <div style={{ marginBottom: 24 }}>
        <button type="button" onClick={() => { setEditing(null); setModal('add'); }} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ Add Event</button>
      </div>
      <DataTable<Event>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'type', label: 'Type' },
          { key: 'date', label: 'Date', render: (r) => r.date ? new Date(r.date).toLocaleDateString() : '' },
          { key: 'location', label: 'Location' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
        actions={(row) => (
          <button type="button" onClick={() => { setEditing(row); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
        )}
      />
      {modal && (
        <Modal title={editing ? 'Edit Calendar Event' : 'Add Calendar Event'} onClose={() => { setModal(null); setEditing(null); }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const title = (form.querySelector('[name="title"]') as HTMLInputElement)?.value;
              const type = (form.querySelector('[name="type"]') as HTMLSelectElement)?.value;
              const date = (form.querySelector('[name="date"]') as HTMLInputElement)?.value;
              const location = (form.querySelector('[name="location"]') as HTMLInputElement)?.value;
              const participants = (form.querySelector('[name="participants"]') as HTMLInputElement)?.value;
              const status = (form.querySelector('[name="status"]') as HTMLSelectElement)?.value;
              if (!title || !date) return;
              const body = {
                title,
                type: type || 'event',
                date: new Date(date),
                location: location || undefined,
                participants: participants || undefined,
                status: status || 'confirmed',
              };
              if (editing) updateMutation.mutate({ id: editing._id, body });
              else createMutation.mutate(body);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label>Title * <input name="title" required defaultValue={editing?.title} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Type <select name="type" defaultValue={editing?.type} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
            <label>Date * <input name="date" type="date" required defaultValue={editing?.date ? new Date(editing.date).toISOString().slice(0, 10) : ''} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Location <input name="location" defaultValue={editing?.location} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Participants <input name="participants" defaultValue={editing?.participants} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Status <select name="status" defaultValue={editing?.status} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editing ? 'Save' : 'Add')}</button>
              <button type="button" onClick={() => { setModal(null); setEditing(null); }} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
