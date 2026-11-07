import * as THREE from 'three';
import { EARTH_RADIUS_UNITS } from '../../services/propagator';

export class AltitudeLineManager {
  public group: THREE.Group;
  private line: THREE.Line;
  private groundPoint: THREE.Mesh;
  private lineGeometry: THREE.BufferGeometry;
  private lineMaterial: THREE.LineBasicMaterial;
  private groundGeometry: THREE.PlaneGeometry;
  private groundMaterial: THREE.MeshBasicMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'AltitudeLineGroup';

    // 1. Altitude radial line (2 vertices: surface point to satellite)
    this.lineGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(6); // 2 points * 3 coords
    this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.lineMaterial = new THREE.LineBasicMaterial({
      color: 0xE8A33D, // Amber accent
      transparent: true,
      opacity: 0.9,
      depthTest: false
    });

    this.line = new THREE.Line(this.lineGeometry, this.lineMaterial);
    this.line.renderOrder = 998;
    this.line.frustumCulled = false;
    this.group.add(this.line);

    // 2. Nadir ground marker at Earth's surface directly beneath satellite
    this.groundGeometry = new THREE.PlaneGeometry(0.25, 0.25);
    this.groundMaterial = new THREE.MeshBasicMaterial({
      color: 0x8E918B, // Muted text/hairline color
      side: THREE.DoubleSide,
      depthTest: true
    });
    this.groundPoint = new THREE.Mesh(this.groundGeometry, this.groundMaterial);
    this.groundPoint.renderOrder = 4;
    this.group.add(this.groundPoint);

    this.group.visible = false;
  }

  public update(
    satPosition?: { x: number; y: number; z: number },
    camera?: THREE.Camera
  ): { x: number; y: number; z: number } | null {
    if (!satPosition) {
      this.group.visible = false;
      return null;
    }

    const len = Math.sqrt(
      satPosition.x ** 2 + satPosition.y ** 2 + satPosition.z ** 2
    );
    if (len < 0.001) {
      this.group.visible = false;
      return null;
    }

    // Sub-satellite surface point directly below the satellite
    const surfRatio = EARTH_RADIUS_UNITS / len;
    const surfX = satPosition.x * surfRatio;
    const surfY = satPosition.y * surfRatio;
    const surfZ = satPosition.z * surfRatio;

    // Update line buffer
    const posAttr = this.lineGeometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    // Point 0: Earth surface
    arr[0] = surfX;
    arr[1] = surfY;
    arr[2] = surfZ;

    // Point 1: Satellite position
    arr[3] = satPosition.x;
    arr[4] = satPosition.y;
    arr[5] = satPosition.z;

    posAttr.needsUpdate = true;

    // Position nadir ground marker
    this.groundPoint.position.set(surfX, surfY, surfZ);
    if (camera && this.group.parent) {
      const invParentQuat = this.group.parent.quaternion.clone().invert();
      this.groundPoint.quaternion.copy(invParentQuat.multiply(camera.quaternion));
    }

    this.group.visible = true;

    // Return the midpoint along the line for screen-space label placement
    return {
      x: (surfX + satPosition.x) / 2,
      y: (surfY + satPosition.y) / 2,
      z: (surfZ + satPosition.z) / 2
    };
  }

  public hide(): void {
    this.group.visible = false;
  }

  public dispose(): void {
    this.lineGeometry.dispose();
    this.lineMaterial.dispose();
    this.groundGeometry.dispose();
    this.groundMaterial.dispose();
  }
}

