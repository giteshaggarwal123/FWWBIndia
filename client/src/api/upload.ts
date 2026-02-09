/** Upload a file to /api/files/upload. Returns the created file doc { _id, ... }. */
export async function uploadFile(
  file: File,
  refModel: string,
  refId: string
): Promise<{ _id: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('refModel', refModel);
  formData.append('refId', refId);
  const token = localStorage.getItem('accessToken');
  const res = await fetch('/api/files/upload', {
    method: 'POST',
    credentials: 'include',
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}
