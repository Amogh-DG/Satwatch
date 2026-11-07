import * as THREE from 'three';
import { EARTH_RADIUS_UNITS } from '../../services/propagator';

export function createWireframeEarth(): THREE.Group {
  const earthGroup = new THREE.Group();
  earthGroup.name = 'WireframeEarth';

  const radius = EARTH_RADIUS_UNITS;
  const segments = 128;

  // Dark inner occlusion sphere to provide depth (back lines appear subtly dimmed)
  const innerGeometry = new THREE.SphereGeometry(radius * 0.990, 64, 64);
  const innerMaterial = new THREE.MeshBasicMaterial({
    color: 0x15171A,
    transparent: true,
    opacity: 0.90,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: 2,
    polygonOffsetUnits: 2
  });
  const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial);
  innerSphere.renderOrder = 0;
  earthGroup.add(innerSphere);

  // Line materials
  const graticuleMaterial = new THREE.LineBasicMaterial({
    color: 0x3A3E40,
    transparent: true,
    opacity: 0.65
  });

  const equatorMaterial = new THREE.LineBasicMaterial({
    color: 0x4A4E50,
    transparent: true,
    opacity: 0.85
  });

  // 1. Latitude parallels (every 15 degrees from -75 to +75)
  const latitudes = [-75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75];
  latitudes.forEach(latDeg => {
    const phi = (latDeg * Math.PI) / 180;
    const rParallel = radius * Math.cos(phi);
    const yParallel = radius * Math.sin(phi);

    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(
        rParallel * Math.sin(theta),
        yParallel,
        rParallel * Math.cos(theta)
      ));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const isEquator = latDeg === 0;
    const line = new THREE.Line(geometry, isEquator ? equatorMaterial : graticuleMaterial);
    earthGroup.add(line);
  });

  // 2. Longitude meridians (every 15 degrees around Earth, 12 full loops)
  const meridianCount = 12; // 24 halves = 12 full loops
  for (let m = 0; m < meridianCount; m++) {
    const lonDeg = (m / meridianCount) * 180;
    const theta = (lonDeg * Math.PI) / 180;

    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = radius * Math.sin(angle) * Math.sin(theta);
      const y = radius * Math.cos(angle);
      const z = radius * Math.sin(angle) * Math.cos(theta);
      points.push(new THREE.Vector3(x, y, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, graticuleMaterial);
    earthGroup.add(line);
  }

  return earthGroup;
}

