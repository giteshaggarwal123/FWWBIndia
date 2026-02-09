/**
 * Storage that works on web (localStorage) and native (expo-secure-store).
 * expo-secure-store is not available on web and can hang; using localStorage on web fixes login hang.
 */
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

async function getItemWeb(key: string): Promise<string | null> {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

async function setItemWeb(key: string, value: string): Promise<void> {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

async function deleteItemWeb(key: string): Promise<void> {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export async function storageGetItem(key: string): Promise<string | null> {
  if (isWeb) return getItemWeb(key);
  try {
    const { default: SecureStore } = await import('expo-secure-store');
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function storageSetItem(key: string, value: string): Promise<void> {
  if (isWeb) return setItemWeb(key, value);
  try {
    const { default: SecureStore } = await import('expo-secure-store');
    await SecureStore.setItemAsync(key, value);
  } catch {
    /* ignore */
  }
}

export async function storageDeleteItem(key: string): Promise<void> {
  if (isWeb) return deleteItemWeb(key);
  try {
    const { default: SecureStore } = await import('expo-secure-store');
    await SecureStore.deleteItemAsync(key);
  } catch {
    /* ignore */
  }
}
