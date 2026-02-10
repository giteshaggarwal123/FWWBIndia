import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useEmployees } from '../hooks/useEmployees';

type Template = { _id: string; name: string; category: string; usageCount: number; body?: string; variables?: string };
type Generated = {
  _id: string;
  letterId: string;
  template?: { name: string; category: string; _id?: string };
  employee?: { name: string; employeeId: string };
  letterType: string;
  status: string;
  generatedBy?: { name: string };
  createdAt: string;
};

async function downloadTemplate(id: string, name: string) {
  const res = await api.get<string>(`/letters/templates/${id}/download`, { responseType: 'text' });
  const blob = new Blob([res.data], { type: 'application/vnd.ms-word;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(name || 'template').replace(/[^a-zA-Z0-9.-]/g, '_')}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadGenerated(id: string, letterId: string) {
  const res = await api.get<string>(`/letters/generated/${id}/download`, { responseType: 'text' });
  const blob = new Blob([res.data], { type: 'application/vnd.ms-word;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Letter_${(letterId || 'export').replace(/[^a-zA-Z0-9.-]/g, '_')}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

export function LettersPage() {
  const [tab, setTab] = useState<'templates' | 'generated'>('generated');
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null);
  const [viewContent, setViewContent] = useState<string>('');
  const [viewTitle, setViewTitle] = useState<string>('');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editingGenerated, setEditingGenerated] = useState<Generated | null>(null);
  const queryClient = useQueryClient();
  const { data: employees = [] } = useEmployees();
  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ['letters', 'templates'],
    queryFn: async () => {
      const res = await api.get<Template[]>('/letters/templates');
      return Array.isArray(res.data) ? res.data : [];
    },
  });
  const { data: generated = [], isLoading: loadingGenerated } = useQuery({
    queryKey: ['letters', 'generated'],
    queryFn: async () => {
      const res = await api.get<Generated[]>('/letters/generated');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/letters/templates', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['letters'] }); setModal(null); setEditingTemplate(null); },
  });
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/letters/templates/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['letters'] }); setModal(null); setEditingTemplate(null); },
  });
  const createGeneratedMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/letters/generated', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['letters'] }); setModal(null); setEditingGenerated(null); },
  });
  const updateGeneratedMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/letters/generated/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['letters'] }); setModal(null); setEditingGenerated(null); },
  });

  const isLoading = tab === 'templates' ? loadingTemplates : loadingGenerated;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Letter Generation' }]} />
      <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
        <button type="button" onClick={() => setTab('templates')} style={{ padding: '10px 16px', background: tab === 'templates' ? '#2E3192' : '#e2e8f0', color: tab === 'templates' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Templates</button>
        <button type="button" onClick={() => setTab('generated')} style={{ padding: '10px 16px', background: tab === 'generated' ? '#2E3192' : '#e2e8f0', color: tab === 'generated' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Generated Letters</button>
        <button type="button" onClick={() => { setEditingTemplate(null); setEditingGenerated(null); setModal('add'); }} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}>{tab === 'templates' ? '+ New Template' : '+ Generate Letter'}</button>
      </div>
      {tab === 'templates' && (
        <DataTable<Template>
          keyField="_id"
          data={templates}
          loading={isLoading}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'category', label: 'Category' },
            { key: 'usageCount', label: 'Usage Count' },
            { key: 'body', label: 'Preview', render: (r) => (r.body ? (r.body.slice(0, 50) + (r.body.length > 50 ? '…' : '')) : '—') },
          ]}
          actions={(row) => (
            <span>
              <button type="button" onClick={() => { setViewTitle(row.name); setViewContent(row.body || '(No content)'); setModal('view'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>View</button>
              <button type="button" onClick={() => downloadTemplate(row._id, row.name)} style={{ marginRight: 8, color: '#276749', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Download</button>
              <button type="button" onClick={() => { setEditingTemplate(row); setEditingGenerated(null); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
            </span>
          )}
        />
      )}
      {tab === 'generated' && (
        <DataTable<Generated>
          keyField="_id"
          data={generated}
          loading={isLoading}
          columns={[
            { key: 'letterId', label: 'Letter ID' },
            { key: 'template', label: 'Template', render: (r) => r.template ? (r.template as { name: string }).name : '-' },
            { key: 'employee', label: 'Employee', render: (r) => r.employee ? (r.employee as { name: string }).name : '-' },
            { key: 'letterType', label: 'Type' },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            { key: 'createdAt', label: 'Generated', render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '' },
          ]}
          actions={(row) => (
            <span>
              <button type="button" onClick={async () => { try { const r = await api.get<{ content: string }>(`/letters/generated/${row._id}/view`); setViewTitle(`${row.letterId} - ${row.letterType}`); setViewContent(r.data?.content ?? '(No content)'); setModal('view'); } catch { setViewTitle(row.letterId); setViewContent('(Unable to load content)'); setModal('view'); } }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>View</button>
              <button type="button" onClick={() => downloadGenerated(row._id, row.letterId)} style={{ marginRight: 8, color: '#276749', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Download</button>
              <button type="button" onClick={() => { setEditingGenerated(row); setEditingTemplate(null); setModal('edit'); }} style={{ marginRight: 8, color: '#2E3192', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Edit</button>
            </span>
          )}
        />
      )}
      {modal === 'view' && (
        <Modal title={viewTitle} onClose={() => { setModal(null); setViewContent(''); setViewTitle(''); }}>
          <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 14, maxHeight: '70vh', overflow: 'auto', padding: '8px 0' }}>{viewContent}</div>
        </Modal>
      )}
      {(modal === 'add' || modal === 'edit') && tab === 'templates' && (
        <Modal title={editingTemplate ? 'Edit Template' : 'New Template'} onClose={() => { setModal(null); setEditingTemplate(null); }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value;
              const category = (form.querySelector('[name="category"]') as HTMLInputElement)?.value;
              const body = (form.querySelector('[name="body"]') as HTMLTextAreaElement)?.value;
              if (!name || !category) return;
              const payload = { name, category, body: body || '', variables: editingTemplate?.variables ?? '' };
              if (editingTemplate) updateTemplateMutation.mutate({ id: editingTemplate._id, body: payload });
              else createTemplateMutation.mutate(payload);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label>Name * <input name="name" required defaultValue={editingTemplate?.name} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Category * <input name="category" required defaultValue={editingTemplate?.category} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Body <textarea name="body" rows={4} defaultValue={editingTemplate?.body} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{createTemplateMutation.isPending || updateTemplateMutation.isPending ? 'Saving...' : (editingTemplate ? 'Save' : 'Save')}</button>
              <button type="button" onClick={() => { setModal(null); setEditingTemplate(null); }} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
      {(modal === 'add' || modal === 'edit') && tab === 'generated' && (
        <Modal title={editingGenerated ? 'Edit Letter' : 'Generate Letter'} onClose={() => { setModal(null); setEditingGenerated(null); }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const template = (form.querySelector('[name="template"]') as HTMLSelectElement)?.value;
              const employee = (form.querySelector('[name="employee"]') as HTMLSelectElement)?.value;
              const letterType = (form.querySelector('[name="letterType"]') as HTMLInputElement)?.value;
              const status = (form.querySelector('[name="status"]') as HTMLSelectElement)?.value;
              if (!template || !employee || !letterType) return;
              const body = { template, employee, letterType, status: status || 'pending' };
              if (editingGenerated) updateGeneratedMutation.mutate({ id: editingGenerated._id, body });
              else createGeneratedMutation.mutate({ letterId: `LTR-${Date.now()}`, ...body });
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label>Template * <select name="template" required defaultValue={editingGenerated?.template && typeof editingGenerated.template === 'object' && '_id' in editingGenerated.template ? (editingGenerated.template as { _id: string })._id : (editingGenerated as { template?: string })?.template} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{templates.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}</select></label>
            <label>Employee * <select name="employee" required defaultValue={editingGenerated?.employee && typeof editingGenerated.employee === 'object' && '_id' in editingGenerated.employee ? (editingGenerated.employee as { _id: string })._id : (editingGenerated as { employee?: string })?.employee} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}</select></label>
            <label>Letter Type * <input name="letterType" required placeholder="e.g. Experience, NOC" defaultValue={editingGenerated?.letterType} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            {editingGenerated && <label>Status <select name="status" defaultValue={editingGenerated?.status} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}><option value="pending">pending</option><option value="sent">sent</option></select></label>}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={createGeneratedMutation.isPending || updateGeneratedMutation.isPending} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{createGeneratedMutation.isPending || updateGeneratedMutation.isPending ? 'Saving...' : (editingGenerated ? 'Save' : 'Generate')}</button>
              <button type="button" onClick={() => { setModal(null); setEditingGenerated(null); }} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
