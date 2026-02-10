import { API_BASE_URL } from '../config';
import { getStoredToken } from './client';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/** Download an export (e.g. /export/activities) and share the file. Returns { ok, message }. */
export async function downloadAndShareExport(
  path: string,
  filename: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    const token = await getStoredToken();
    if (!token) return { ok: false, message: 'Not logged in' };
    const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { ok: false, message: `Download failed (${res.status})` };
    const ab = await res.arrayBuffer();
    const bytes = new Uint8Array(ab);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    let base64: string;
    if (typeof btoa !== 'undefined') {
      base64 = btoa(binary);
    } else {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let result = '';
      for (let i = 0; i < bytes.length; i += 3) {
        const a = bytes[i]; const b = bytes[i + 1]; const c = bytes[i + 2];
        result += chars[a >> 2];
        result += chars[((a & 3) << 4) | (b >> 4)];
        result += b !== undefined ? chars[((b & 15) << 2) | (c >> 6)] : '=';
        result += c !== undefined ? chars[c & 63] : '=';
      }
      base64 = result;
    }
    const uri = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) await Sharing.shareAsync(uri, { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', dialogTitle: 'Export Activities' });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Export failed';
    return { ok: false, message: msg };
  }
}
