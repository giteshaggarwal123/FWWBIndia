/**
 * API base URL. For physical device use your machine's IP (e.g. http://192.168.1.5:5000/api).
 * Android emulator: http://10.0.2.2:5000/api
 * iOS simulator: http://localhost:5000/api
 */
import { Platform } from 'react-native';

const getDefaultApiUrl = () => {
  if (__DEV__) {
    return Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
  }
  return 'https://your-production-api.com/api';
};

export const API_BASE_URL = getDefaultApiUrl();
