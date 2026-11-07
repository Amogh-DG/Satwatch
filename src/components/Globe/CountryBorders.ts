import * as THREE from 'three';
import { mesh } from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';
import { EARTH_RADIUS_UNITS } from '../../services/propagator';

export function createCountryBorders(): THREE.LineSegments {
  // Extract all country borders from local Natural Earth TopoJSON
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const borders = mesh(worldData as any, (worldData as any).objects.countries);

  // Lift lines slightly to 10.03 units (0.3% clearance above surface) to eliminate z-fighting with occluder
  const radius = EARTH_RADIUS_UNITS * 1.003;

  // Calculate total line segment count to allocate typed array exactly once
  let totalSegments = 0;
  for (let i = 0; i < borders.coordinates.length; i++) {
    const line = borders.coordinates[i];
    if (line.length > 1) {
      totalSegments += line.length - 1;
    }
  }

  // 2 vertices per segment, 3 coordinates (x, y, z) per vertex
  const positions = new Float32Array(totalSegments * 6);
  let posIndex = 0;

  for (let i = 0; i < borders.coordinates.length; i++) {
    const line = borders.coordinates[i];
    for (let j = 0; j < line.length - 1; j++) {
      const p1 = line[j];
      const p2 = line[j + 1];

      // Point 1
      const lon1 = (p1[0] * Math.PI) / 180;
      const lat1 = (p1[1] * Math.PI) / 180;
      positions[posIndex++] = radius * Math.cos(lat1) * Math.sin(lon1);
      positions[posIndex++] = radius * Math.sin(lat1);
      positions[posIndex++] = radius * Math.cos(lat1) * Math.cos(lon1);

      // Point 2
      const lon2 = (p2[0] * Math.PI) / 180;
      const lat2 = (p2[1] * Math.PI) / 180;
      positions[posIndex++] = radius * Math.cos(lat2) * Math.sin(lon2);
      positions[posIndex++] = radius * Math.sin(lat2);
      positions[posIndex++] = radius * Math.cos(lat2) * Math.cos(lon2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();

  // Hairline subtle line material, exact same color (#4E5256)
  const material = new THREE.LineBasicMaterial({
    color: 0x4E5256,
    transparent: true,
    opacity: 0.85,
    depthTest: true,
    depthWrite: false
  });

  const borderLines = new THREE.LineSegments(geometry, material);
  borderLines.name = 'CountryBorders';
  borderLines.renderOrder = 1;
  // Disable frustum culling on global planet border mesh to prevent disappearing during rotation/zoom
  borderLines.frustumCulled = false;

  return borderLines;
}
