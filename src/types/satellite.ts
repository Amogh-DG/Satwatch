export type OperationalStatus = 'Active' | 'Inactive' | '—';

export type SatelliteCategory = 
  | 'Weather'
  | 'Navigation'
  | 'Communication'
  | 'Earth Observation'
  | 'Space Station'
  | 'Radar Imaging';

export type OperatingCountry = 'India' | 'Russia' | 'International';

export interface Satellite {
  id: string;                      // unique slug, e.g. 'iss', 'insat-3d'
  name: string;                    // display name, e.g. 'ISS', 'Cartosat-2A'
  noradId: string;                 // NORAD catalog ID, e.g. '25544'
  intlDesignator: string;          // International COSPAR ID or '—'
  country: OperatingCountry;       // 'India' | 'Russia' | 'International'
  category: SatelliteCategory;     // functional classification
  launchYear: number | null;       // 4-digit launch year or null
  tleLine1: string;                // 69-character TLE line 1
  tleLine2: string;                // 69-character TLE line 2
  opsStatusCode: string;           // raw SATCAT operational status code from live data
}

export interface PropagatedPosition {
  latitude: number | null;         // degrees [-90, +90]
  longitude: number | null;        // degrees [-180, +180]
  altitudeKm: number | null;       // altitude in kilometers above sea level
  velocityKmS: number | null;      // velocity in km/s
  orbitType: string;               // 'LEO' | 'GEO' | 'MEO' | 'HEO' | '—'
  worldPosition: {
    x: number;
    y: number;
    z: number;
  };
}

export interface OrbitalState extends PropagatedPosition {
  satelliteId: string;
  timestamp: Date;
  trajectoryPoints: Array<{ x: number; y: number; z: number }>;
}

export interface Bookmark {
  satelliteId: string;
  savedAt: number;
}

export interface FilterSelection {
  searchQuery: string;
  category: 'All' | 'Weather' | 'Navigation';
  activeOnly: boolean;
  country: 'All' | 'India' | 'Russia' | 'International';
}

export function getOperationalStatus(opsCode: string): OperationalStatus {
  if (!opsCode) return '—';
  const code = opsCode.trim().toUpperCase();
  if (code === '+' || code === 'P' || code === 'B') return 'Active';
  if (code === '-' || code === 'D') return 'Inactive';
  return '—';
}

