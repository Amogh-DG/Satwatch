import * as satellite from 'satellite.js';
import { Satellite, PropagatedPosition } from '../types/satellite';

export const EARTH_RADIUS_UNITS = 10.0;
export const REAL_EARTH_RADIUS_KM = 6371.0;

// Cache satrec objects to avoid reparsing 60 times a second
const satrecCache = new Map<string, satellite.SatRec | null>();

export function getSatRec(sat: Satellite): satellite.SatRec | null {
  const cacheKey = `${sat.id}_${sat.tleLine1}_${sat.tleLine2}`;
  if (satrecCache.has(cacheKey)) {
    return satrecCache.get(cacheKey) || null;
  }

  if (!sat.tleLine1 || !sat.tleLine2) {
    satrecCache.set(cacheKey, null);
    return null;
  }

  try {
    const satrec = satellite.twoline2satrec(sat.tleLine1.trim(), sat.tleLine2.trim());
    satrecCache.set(cacheKey, satrec);
    return satrec;
  } catch (err) {
    console.warn(`Failed to parse TLE for ${sat.name}:`, err);
    satrecCache.set(cacheKey, null);
    return null;
  }
}

export function latLonAltToWorld(
  latDeg: number,
  lonDeg: number,
  altKm: number
): { x: number; y: number; z: number } {
  // Scale altitude relative to Earth radius units
  // For visual clarity on Earth (like in design/Default-globe.png):
  // We clamp scale so LEO sits just above surface and GEO orbits gracefully
  const r = EARTH_RADIUS_UNITS * (1 + altKm / REAL_EARTH_RADIUS_KM);

  const phi = (latDeg * Math.PI) / 180;
  const theta = (lonDeg * Math.PI) / 180;

  // Cartesian coordinates where Y is up (North Pole)
  const x = r * Math.cos(phi) * Math.sin(theta);
  const y = r * Math.sin(phi);
  const z = r * Math.cos(phi) * Math.cos(theta);

  return { x, y, z };
}

export function determineOrbitType(altKm: number | null): string {
  if (altKm === null || isNaN(altKm)) return '—';
  if (altKm < 2000) return 'LEO';
  if (altKm >= 2000 && altKm < 35000) return 'MEO';
  if (altKm >= 35000 && altKm <= 36500) return 'GEO';
  return 'HEO';
}

export function propagateSatellite(sat: Satellite, date: Date = new Date()): PropagatedPosition {
  const satrec = getSatRec(sat);

  if (!satrec) {
    return {
      latitude: null,
      longitude: null,
      altitudeKm: null,
      velocityKmS: null,
      orbitType: '—',
      worldPosition: { x: 0, y: 0, z: 0 }
    };
  }

  try {
    const positionAndVelocity = satellite.propagate(satrec, date);

    if (!positionAndVelocity || !positionAndVelocity.position || typeof positionAndVelocity.position === 'boolean') {
      return {
        latitude: null,
        longitude: null,
        altitudeKm: null,
        velocityKmS: null,
        orbitType: '—',
        worldPosition: { x: 0, y: 0, z: 0 }
      };
    }

    const posEci = positionAndVelocity.position as satellite.EciVec3<number>;
    const velEci = positionAndVelocity.velocity as satellite.EciVec3<number> | undefined;

    const gmst = satellite.gstime(date);
    const geodetic = satellite.eciToGeodetic(posEci, gmst);

    const latDeg = satellite.degreesLat(geodetic.latitude);
    const lonDeg = satellite.degreesLong(geodetic.longitude);
    const altKm = geodetic.height;

    let velocityKmS: number | null = null;
    if (velEci && typeof velEci.x === 'number') {
      velocityKmS = Math.sqrt(velEci.x ** 2 + velEci.y ** 2 + velEci.z ** 2);
    }

    const worldPos = latLonAltToWorld(latDeg, lonDeg, altKm);

    return {
      latitude: latDeg,
      longitude: lonDeg,
      altitudeKm: altKm,
      velocityKmS,
      orbitType: determineOrbitType(altKm),
      worldPosition: worldPos
    };
  } catch (err) {
    console.warn(`Propagation error for ${sat.name}:`, err);
    return {
      latitude: null,
      longitude: null,
      altitudeKm: null,
      velocityKmS: null,
      orbitType: '—',
      worldPosition: { x: 0, y: 0, z: 0 }
    };
  }
}

/**
 * Generates historical trajectory points tracing the orbit path traveled.
 */
export function generateTrailingOrbit(
  sat: Satellite,
  currentDate: Date = new Date(),
  durationMinutes: number = 90,
  steps: number = 60
): Array<{ x: number; y: number; z: number }> {
  const points: Array<{ x: number; y: number; z: number }> = [];
  const satrec = getSatRec(sat);
  if (!satrec) return points;

  const currentMs = currentDate.getTime();
  const stepMs = (durationMinutes * 60 * 1000) / steps;

  for (let i = steps; i >= 0; i--) {
    const sampleDate = new Date(currentMs - i * stepMs);
    try {
      const posAndVel = satellite.propagate(satrec, sampleDate);
      if (posAndVel && posAndVel.position && typeof posAndVel.position !== 'boolean') {
        const posEci = posAndVel.position as satellite.EciVec3<number>;
        const gmst = satellite.gstime(sampleDate);
        const geodetic = satellite.eciToGeodetic(posEci, gmst);
        const lat = satellite.degreesLat(geodetic.latitude);
        const lon = satellite.degreesLong(geodetic.longitude);
        const alt = geodetic.height;
        points.push(latLonAltToWorld(lat, lon, alt));
      }
    } catch {
      // Ignore individual point computation errors
    }
  }

  return points;
}

