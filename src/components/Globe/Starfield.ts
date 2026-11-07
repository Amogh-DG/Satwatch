import * as THREE from 'three';

export function createStarfield(count: number = 400, radius: number = 180): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const opacities = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Generate uniform random points on sphere shell
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = radius * (0.8 + 0.4 * Math.random());

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    opacities[i] = 0.2 + Math.random() * 0.6;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Crisp tiny square star particles
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#8E918B';
    ctx.fillRect(1, 1, 6, 6);
  }
  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.PointsMaterial({
    size: 1.5,
    map: texture,
    transparent: true,
    opacity: 0.6,
    color: 0x8E918B,
    depthWrite: false
  });

  const starfield = new THREE.Points(geometry, material);
  starfield.name = 'Starfield';
  return starfield;
}

