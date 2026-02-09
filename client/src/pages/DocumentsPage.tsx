import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { useProjects } from '../hooks/useProjects';
import { useDonors } from '../hooks/useDonors';
import { useProgramFilter } from '../context/ProgramFilterContext';

type DocRow = {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  refModel?: string;
  refId?: string;
  createdAt: string;
};

const API_BASE = '';

export function DocumentsPage() {
  const { selectedProjectId, setSelectedProjectId } = useProgramFilter();
  const [refModel, setRefModel] = useState('Project');
  const [refId, setRefId] = useState(selectedProjectId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: projects = [] } = useProjects();
  const { data: donors = [] } = useDonors();
  useEffect(() => {
    if (refModel === 'Project') setRefId(selectedProjectId);
  }, [selectedProjectId, refModel]);
  const onProjectFilterChange = (id: string) => {
    setRefId(id);
    setSelectedProjectId(id);
  };

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['files', refModel, refId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (refModel) params.refModel = refModel;
      if (refId) params.refId = refId;
      const res = await api.get<DocRow[]>('/files', { params });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`${API_BASE}/api/files/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const input = fileInputRef.current;
    if (!input?.files?.length) return;
    const formData = new FormData();
    formData.append('file', input.files[0]);
    if (refModel) formData.append('refModel', refModel);
    if (refId) formData.append('refId', refId);
    uploadMutation.mutate(formData);
  };

  const downloadUrl = (id: string) => `${API_BASE}/api/files/${id}`;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Documents' }]} />
      <p style={{ marginBottom: 24, color: '#4a5568' }}>
        Upload and list documents. Tag by program or donor for easier retrieval.
      </p>
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleUpload} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            ref={fileInputRef}
            type="file"
            required
            style={{ padding: 8 }}
          />
          <select value={refModel} onChange={(e) => { setRefModel(e.target.value); setRefId(''); }} style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
            <option value="">Tag type</option>
            <option value="Project">Program</option>
            <option value="Donor">Donor</option>
          </select>
          {refModel === 'Project' && (
            <select value={refId} onChange={(e) => onProjectFilterChange(e.target.value)} style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
              <option value="">Select program</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          )}
          {refModel === 'Donor' && (
            <select value={refId} onChange={(e) => setRefId(e.target.value)} style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
              <option value="">Select donor</option>
              {donors.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          )}
          <button type="submit" disabled={uploadMutation.isPending} style={{ padding: '8px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
            {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
          </button>
        </form>
        <select value={refModel} onChange={(e) => setRefModel(e.target.value)} style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">Filter: All</option>
          <option value="Project">Program</option>
          <option value="Donor">Donor</option>
        </select>
        {refModel && (
          <select value={refId} onChange={(e) => refModel === 'Project' ? onProjectFilterChange(e.target.value) : setRefId(e.target.value)} style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
            <option value="">All</option>
            {refModel === 'Project' && projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            {refModel === 'Donor' && donors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        )}
      </div>
      <DataTable<DocRow>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'originalName', label: 'File' },
          { key: 'refModel', label: 'Tag type', render: (r) => r.refModel || '—' },
          { key: 'refId', label: 'Tag id', render: (r) => r.refId || '—' },
          { key: 'size', label: 'Size', render: (r) => (r.size ? `${(r.size / 1024).toFixed(1)} KB` : '—') },
          { key: 'createdAt', label: 'Uploaded', render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleString() : '—') },
        ]}
        actions={(row) => (
          <a href={downloadUrl(row._id)} download target="_rel" rel="noopener noreferrer" style={{ color: '#2E3192', fontSize: 13 }}>Download</a>
        )}
      />
    </div>
  );
}
