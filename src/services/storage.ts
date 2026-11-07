import { Satellite } from '../types/satellite';

const STORAGE_KEY_BOOKMARKS = 'satellite_tracker_saved_ids';
const STORAGE_KEY_TELEMETRY = 'satellite_tracker_telemetry_cache';

export interface CachedTelemetry {
  satellites: Satellite[];
  lastUpdated: number;
}

export function loadSavedSatelliteIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    if (!raw) return new Set(['iss']); // Default ISS bookmarked per design mockup
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed);
    }
  } catch (err) {
    console.warn('Failed to load bookmarks from localStorage:', err);
  }
  return new Set(['iss']);
}

export function saveSavedSatelliteIds(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(Array.from(ids)));
  } catch (err) {
    console.warn('Failed to persist bookmarks to localStorage:', err);
  }
}

export function loadCachedSatellites(): CachedTelemetry | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TELEMETRY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.satellites) && typeof parsed.lastUpdated === 'number') {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to read telemetry cache from localStorage:', err);
  }
  return null;
}

export function saveCachedSatellites(satellites: Satellite[]): void {
  try {
    const payload: CachedTelemetry = {
      satellites,
      lastUpdated: Date.now()
    };
    localStorage.setItem(STORAGE_KEY_TELEMETRY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to write telemetry cache to localStorage:', err);
  }
}

