import { useState } from 'react';
import { api } from '../api/client';

type Props = {
  refModel?: string;
  refId?: string;
  onUploaded?: (id: string) => void;
  label?: string;
};

export function FileUpload({ refModel, refId, onUploaded, label = 'Upload file' }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setError('');
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      if (refModel) form.append('refModel', refModel);
      if (refId) form.append('refId', refId);
      const res = await api.post<{ _id: string }>('/files/upload', form);
      if (res.data?._id) onUploaded?.(res.data._id);
      setFile(null);
    } catch (err: unknown) {
      setError(err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response: { data: { message: string } } }).response.data.message
        : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        style={{ marginRight: 8 }}
      />
      <button type="submit" disabled={!file || loading} style={{ padding: '8px 12px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Uploading...' : label}
      </button>
      {error && <p style={{ color: '#c53030', fontSize: 13, marginTop: 8 }}>{error}</p>}
    </form>
  );
}
