import * as Location from 'expo-location';

export type Coords = { lat: number; lng: number } | null;

/**
 * Request location permission and get current position for geotagging.
 * Returns null if permission denied or location unavailable (e.g. on web without HTTPS).
 */
export async function getCurrentCoords(): Promise<Coords> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5000,
      distanceInterval: 0,
    });
    if (loc?.coords?.latitude != null && loc?.coords?.longitude != null) {
      return { lat: loc.coords.latitude, lng: loc.coords.longitude };
    }
  } catch {
    // Permission denied, timeout, or unsupported (e.g. web in some contexts)
  }
  return null;
}
