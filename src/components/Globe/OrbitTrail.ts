import * as THREE from 'three';
import { Satellite } from '../../types/satellite';
import { generateTrailingOrbit } from '../../services/propagator';

export class OrbitTrailManager {
  public line: THREE.Line;
  private geometry: THREE.BufferGeometry;
  private material: THREE.LineBasicMaterial;
  private maxPoints: number = 120;
  private lastSatelliteId: string | null = null;
  private lastUpdateMs: number = 0;
  private cachedPoints: Array<{ x: number; y: number; z: number }> = [];

  constructor() {
    this.geometry = new THREE.BufferGeometry();
    // Allocate fixed buffer for maxPoints
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

  public updateTrail(
    satellite: Satellite | null,
    currentDate: Date = new Date(),
    livePosition?: { x: number; y: number; z: number }
  ): void {
    if (!satellite || !satellite.tleLine1 || !satellite.tleLine2) {
      this.line.visible = false;
      this.lastSatelliteId = null;
      return;
    }

    const nowMs = currentDate.getTime();
    const isNewSat = this.lastSatelliteId !== satellite.id;
    // Recompute historical orbital points at most once per second or immediately upon satellite change
    const shouldRecompute = isNewSat || nowMs - this.lastUpdateMs > 1000;

    if (shouldRecompute) {
      this.lastSatelliteId = satellite.id;
      this.lastUpdateMs = nowMs;

      // Determine trail duration based on orbital period (LEO ~90m, MEO ~12h, GEO ~24h)
      let durationMinutes = 45; // ~half an orbit for LEO
      if (satellite.category === 'Navigation') durationMinutes = 240; // MEO
      if (satellite.category === 'Communication') durationMinutes = 720; // GEO

      this.cachedPoints = generateTrailingOrbit(
        satellite,
        currentDate,
        durationMinutes,
        this.maxPoints - 1
      );
    }

    if (this.cachedPoints.length < 2) {
      this.line.visible = false;
      return;
    }

    const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    const count = this.cachedPoints.length;
    for (let i = 0; i < count; i++) {
      array[i * 3] = this.cachedPoints[i].x;
      array[i * 3 + 1] = this.cachedPoints[i].y;
      array[i * 3 + 2] = this.cachedPoints[i].z;
    }

    // Connect the leading edge point seamlessly to the live satellite marker position
    if (livePosition && count > 0) {
      array[(count - 1) * 3] = livePosition.x;
      array[(count - 1) * 3 + 1] = livePosition.y;
      array[(count - 1) * 3 + 2] = livePosition.z;
    }

    this.geometry.setDrawRange(0, count);
    posAttr.needsUpdate = true;
    this.line.visible = true;
  }

  public hide(): void {
    this.line.visible = false;
    this.lastSatelliteId = null;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
