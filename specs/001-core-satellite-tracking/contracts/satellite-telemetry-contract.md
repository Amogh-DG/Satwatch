# Interface & Telemetry Contracts: Core Satellite Tracking

**Feature**: `001-core-satellite-tracking`  
**Date**: 2026-11-07  
**Status**: Draft

## 1. Upstream Telemetry Ingestion Contract

### Source Endpoint
Live orbital parameters and SATCAT metadata are fetched from CelesTrak's General Perturbations (GP) API and SATCAT API:
```text
GET https://celestrak.org/NORAD/elements/gp.php?CATNR={noradId}&FORMAT=json
GET https://celestrak.org/satcat/records.php?CATNR={noradId}&FORMAT=json
```

Target IDs:
`25544` (ISS), `39216` (INSAT-3D), `32783` (Cartosat-2A), `45026` (GSAT-30), `44233` (RISAT-2B), `37387` (RESOURCESAT-2), `40001` (GLONASS-M), `40296` (Meridian), `41105` (Elektro-L), `59371` (Resurs-P 4).

### Response Schema (JSON array)
```json
[
  {
    "OBJECT_NAME": "ISS (ZARYA)",
    "OBJECT_ID": "1998-067A",
    "NORAD_CAT_ID": 25544,
    "OPS_STATUS_CODE": "+",
    "EPOCH": "2026-11-07T08:14:22.000000",
    "MEAN_MOTION": 15.498421,
    "ECCENTRICITY": 0.0006241,
    "INCLINATION": 51.6415,
    "RA_OF_ASC_NODE": 128.4521,
    "ARG_OF_PERICENTER": 74.2184,
    "MEAN_ANOMALY": 286.1102,
    "TLE_LINE1": "1 25544U 98067A   ...",
    "TLE_LINE2": "2 25544  51.6415 ..."
  }
]
```

### Ingestion & Dynamic Status Rules
1. `OPS_STATUS_CODE`:
   - `"+"` $\rightarrow$ `"Active"`
   - `"-"` or `"D"` $\rightarrow$ `"Inactive"`
   - `null` / empty $\rightarrow$ `"—"`
2. If network request fails or is blocked:
   - System transparently falls back to cached/bundled baseline TLEs.
   - Status codes are evaluated dynamically from the SATCAT records.
   - Zero hardcoded runtime coordinates; SGP4 propagates live coordinates using current system clock.

---

## 2. Orbital Propagation Service Contract

```typescript
export interface PropagatedPosition {
  latitude: number | null;     // degrees [-90, +90]
  longitude: number | null;    // degrees [-180, +180]
  altitudeKm: number | null;   // kilometers above ground
  velocityKmS: number | null;  // kilometers per second
  orbitType: string;           // "LEO" | "GEO" | "MEO" | "HEO" | "—"
  worldPosition: {
    x: number;
    y: number;
    z: number;
  };
}

export interface SatelliteOrbitTrail {
  satelliteId: string;
  points: Array<{ x: number; y: number; z: number }>;
}

export interface OrbitPropagator {
  /**
   * Propagates a satellite's state to the exact current timestamp.
   */
  propagate(satellite: SatelliteRecord, date: Date): PropagatedPosition;

  /**
   * Generates trailing historical orbital coordinates for a satellite.
   * @param durationMinutes Length of trailing path in minutes (e.g. 45-90 min)
   * @param steps Number of interpolation points
   */
  generateTrail(satellite: SatelliteRecord, date: Date, durationMinutes: number, steps: number): SatelliteOrbitTrail;
}
```

---

## 3. UI Control State Contract

```typescript
export interface AppUIState {
  isPanelOpen: boolean;
  selectedSatelliteId: string | null;
  savedSatelliteIds: Set<string>;
  filterState: {
    searchQuery: string;
    category: "All" | "Weather" | "Navigation";
    activeOnly: boolean;
    country: "All" | "India" | "Russia" | "International";
  };
}

export interface UIActions {
  openPanel(): void;
  closePanel(): void;
  togglePanel(): void;
  selectSatellite(id: string | null): void;
  toggleBookmark(id: string): void;
  setSearchQuery(query: string): void;
  setCategory(category: "All" | "Weather" | "Navigation"): void;
  toggleActiveOnly(): void;
  setCountry(country: "All" | "India" | "Russia" | "International"): void;
}
```
