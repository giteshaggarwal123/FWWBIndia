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
  documentType?: string;
  tags?: string[];
  createdAt: string;
};

const API_BASE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
const DOCUMENT_TYPES = ['proposal', 'agreement', 'report', 'audit', 'fcra', 'other'];

export function DocumentsPage() {
  const { selectedProjectId, setSelectedProjectId } = useProgramFilter();
  const [refModel, setRefModel] = useState('Project');
  const [refId, setRefId] = useState(selectedProjectId);
  const [documentType, setDocumentType] = useState('');
  const [tagsFilter, setTagsFilter] = useState('');
  const [uploadDocType, setUploadDocType] = useState('other');
  const [uploadTags, setUploadTags] = useState('');
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
    queryKey: ['files', refModel, refId, documentType, tagsFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (refModel) params.refModel = refModel;
      if (refId) params.refId = refId;
      if (documentType) params.documentType = documentType;
      if (tagsFilter) params.tags = tagsFilter;
      const res = await api.get<DocRow[]>('/files', { params });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const base = API_BASE || (typeof window !== 'undefined' ? window.location.origin : '');
      const res = await fetch(`${base}/api/files/upload`, {
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
    formData.append('documentType', uploadDocType);
    if (uploadTags.trim()) formData.append('tags', uploadTags.trim());
    uploadMutation.mutate(formData);
  };

  const downloadUrl = (id: string) => {
    const base = API_BASE || (typeof window !== 'undefined' ? window.location.origin : '');
    return `${base}/api/files/${id}`;
  };

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
          <select value={uploadDocType} onChange={(e) => setUploadDocType(e.target.value)} style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
            {DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input type="text" value={uploadTags} onChange={(e) => setUploadTags(e.target.value)} placeholder="Tags (comma-separated, e.g. FCRA, FY24-25)" style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6, minWidth: 220 }} />
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
        <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <option value="">All types</option>
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input type="text" value={tagsFilter} onChange={(e) => setTagsFilter(e.target.value)} placeholder="Filter by tags (comma-separated)" style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6, minWidth: 200 }} />
      </div>
      <DataTable<DocRow>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'originalName', label: 'File' },
          { key: 'documentType', label: 'Type', render: (r) => r.documentType || '—' },
          { key: 'refModel', label: 'Tag type', render: (r) => r.refModel || '—' },
          { key: 'refId', label: 'Tag id', render: (r) => r.refId || '—' },
          { key: 'tags', label: 'Tags', render: (r) => (Array.isArray(r.tags) ? r.tags.join(', ') : '—') },
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
