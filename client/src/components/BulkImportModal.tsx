import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Modal } from './Modal';
import { useProjects } from '../hooks/useProjects';

type PreviewRow = Record<string, unknown>;

type Props = {
  type: 'activities' | 'expenses';
  defaultProjectId?: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export function BulkImportModal({ type, defaultProjectId = '', onClose, onSuccess }: Props) {
  const [preview, setPreview] = useState<{ sheetName: string; rows: PreviewRow[] } | null>(null);
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: projects = [] } = useProjects();

  const parseMutation = useMutation({
    mutationFn: async (base64: string) => {
      const res = await api.post<{ sheetName: string; rows: PreviewRow[] }>('/bulk-import/parse-excel', { base64 });
      return res.data ?? { sheetName: '', rows: [] };
    },
    onSuccess: (data) => {
      setPreview(data);
      setError('');
    },
    onError: (e: { response?: { data?: { message?: string } }; message?: string }) => {
      setError(e.response?.data?.message || e.message || 'Failed to parse Excel');
    },
  });

  const importMutation = useMutation({
    mutationFn: async ({ projectId: pid, rows }: { projectId: string; rows: PreviewRow[] }) => {
      if (type === 'activities') {
        const res = await api.post<{ count: number; ids: string[] }>('/bulk-import/activities', { projectId: pid, sheet: 'Sheet1', rows });
        return res.data ?? { count: 0, ids: [] };
      }
      const res = await api.post<{ count: number; ids: string[] }>('/bulk-import/expenses', { projectId: pid, rows });
      return res.data ?? { count: 0, ids: [] };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setError('');
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onSuccess?.();
      onClose();
      alert(`Imported ${data?.count ?? 0} record(s) successfully.`);
    },
    onError: (e: { response?: { data?: { message?: string } }; message?: string }) => {
      setError(e.response?.data?.message || e.message || 'Import failed');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setPreview(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes('base64,') ? result.split('base64,')[1] : btoa(result);
      parseMutation.mutate(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleImport = () => {
    if (!projectId || !preview?.rows?.length) {
      setError('Select a program and ensure preview has rows.');
      return;
    }
    importMutation.mutate({ projectId, rows: preview.rows });
  };

  const title = type === 'activities' ? 'Import activities from Excel' : 'Import expenses from Excel';

  return (
    <Modal title={title} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!preview ? (
          <>
            <label style={{ fontWeight: 600 }}>Excel file (.xlsx, .xls)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6, width: '100%' }}
            />
            {parseMutation.isPending && <p style={{ color: '#718096' }}>Parsing...</p>}
          </>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: 14 }}>Sheet: <strong>{preview.sheetName}</strong> · {preview.rows.length} row(s)</p>
            <label style={{ fontWeight: 600 }}>Program</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 6, width: '100%' }}>
              <option value="">Select program</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <div style={{ overflowX: 'auto', maxHeight: 280, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 6 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f7fafc' }}>
                    {preview.rows[0] && Object.keys(preview.rows[0] as object).map((k) => (
                      <th key={k} style={{ padding: 6, textAlign: 'left', border: '1px solid #e2e8f0' }}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, 20).map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((v, j) => (
                        <td key={j} style={{ padding: 4, border: '1px solid #e2e8f0' }}>{String(v ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.rows.length > 20 && <p style={{ margin: 8, fontSize: 12, color: '#718096' }}>Showing first 20 of {preview.rows.length} rows.</p>}
            </div>
            {error && <p style={{ color: '#c53030', margin: 0, fontSize: 14 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                onClick={handleImport}
                disabled={importMutation.isPending || !projectId}
                style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
              >
                {importMutation.isPending ? 'Importing...' : `Import ${preview.rows.length} row(s)`}
              </button>
              <button type="button" onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ padding: '10px 16px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                Change file
              </button>
            </div>
          </>
        )}
        {error && !preview && <p style={{ color: '#c53030', margin: 0 }}>{error}</p>}
      </div>
    </Modal>
  );
}
