import * as THREE from 'three';

export function createSelectionReticle(): THREE.LineSegments {
  // A square wireframe reticle (size 1.1 x 1.1 units) centered at (0, 0, 0)
  // Perfectly frames the 0.38 x 0.38 square satellite marker
  const halfSize = 0.55;
  const points: THREE.Vector3[] = [
    // Top border
    new THREE.Vector3(-halfSize, halfSize, 0),
    new THREE.Vector3(halfSize, halfSize, 0),
    // Right border
    new THREE.Vector3(halfSize, halfSize, 0),
    new THREE.Vector3(halfSize, -halfSize, 0),
    // Bottom border
    new THREE.Vector3(halfSize, -halfSize, 0),
    new THREE.Vector3(-halfSize, -halfSize, 0),
    // Left border
    new THREE.Vector3(-halfSize, -halfSize, 0),
    new THREE.Vector3(-halfSize, halfSize, 0),
  ];

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const material = new THREE.LineBasicMaterial({
    color: 0xE8A33D, // Amber accent
    depthTest: false,
    transparent: true,
    opacity: 0.95
  });

  const reticle = new THREE.LineSegments(geometry, material);
  reticle.name = 'SelectionReticle';
  reticle.visible = false;
  reticle.renderOrder = 999; // Always render on top of the satellite dot
  reticle.frustumCulled = false;

  return reticle;
}
