/**
 * API base URL. For physical device use your machine's IP (e.g. http://192.168.1.5:5000/api).
 * Android emulator: http://10.0.2.2:5000/api
 * iOS simulator: http://localhost:5000/api
 * Production: set EXPO_PUBLIC_API_URL in .env or EAS env (e.g. https://api.yoursite.com/api).
 */
import { Platform } from 'react-native';

const getDefaultApiUrl = (): string => {
  const envUrl = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) return envUrl.trim();
  if (__DEV__) {
    return Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
  }
  return 'https://fwwbindia.onrender.com/api';
};

export const API_BASE_URL = getDefaultApiUrl();

/** Web portal URL for "Open in browser" links. Set EXPO_PUBLIC_WEB_PORTAL_URL in production (e.g. https://app.yoursite.com). */
export const WEB_PORTAL_URL = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_WEB_PORTAL_URL) || (__DEV__ ? 'http://localhost:5173' : 'https://fwwb-india.vercel.app');
