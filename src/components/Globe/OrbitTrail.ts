import * as THREE from 'three';
import { Satellite } from '../../types/satellite';
import { generateTrailingOrbit } from '../../services/propagator';

export class OrbitTrailManager {
  public line: THREE.Line;
  private geometry: THREE.BufferGeometry;
  private material: THREE.LineBasicMaterial;
  private maxPoints: number = 120;

  constructor() {
    this.geometry = new THREE.BufferGeometry();
    // Allocate fixed buffer for 120 points
    const positions = new Float32Array(this.maxPoints * 3);
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.material = new THREE.LineBasicMaterial({
      color: 0xE8A33D, // Amber accent
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });

    this.line = new THREE.Line(this.geometry, this.material);
    this.line.name = 'OrbitTrail';
    this.line.visible = false;
    this.line.renderOrder = 2;
    this.line.frustumCulled = false;
  }

  public updateTrail(satellite: Satellite | null, currentDate: Date = new Date()): void {
    if (!satellite || !satellite.tleLine1 || !satellite.tleLine2) {
      this.line.visible = false;
      return;
    }

    // Determine trail duration based on orbital period (LEO ~90m, MEO ~12h, GEO ~24h)
    let durationMinutes = 90;
    if (satellite.category === 'Navigation') durationMinutes = 360; // MEO
    if (satellite.category === 'Communication') durationMinutes = 720; // GEO / MEO

    const trailPoints = generateTrailingOrbit(satellite, currentDate, durationMinutes, this.maxPoints - 1);
    if (trailPoints.length < 2) {
      this.line.visible = false;
      return;
    }

    const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < trailPoints.length; i++) {
      array[i * 3] = trailPoints[i].x;
      array[i * 3 + 1] = trailPoints[i].y;
      array[i * 3 + 2] = trailPoints[i].z;
    }

    this.geometry.setDrawRange(0, trailPoints.length);
    posAttr.needsUpdate = true;
    this.line.visible = true;
  }

  public hide(): void {
    this.line.visible = false;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

