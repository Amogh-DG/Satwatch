import * as THREE from 'three';
import { Satellite, PropagatedPosition } from '../../types/satellite';

export interface MarkerMesh extends THREE.Mesh {
  userData: {
    satelliteId: string;
    satelliteName: string;
    [key: string]: unknown;
  };
}

export class SatelliteMarkersManager {
  public group: THREE.Group;
  private markerMap: Map<string, MarkerMesh> = new Map();
  private hitProxyMap: Map<string, THREE.Mesh> = new Map();
  private squareGeometry: THREE.PlaneGeometry;
  private hitGeometry: THREE.PlaneGeometry;
  private material: THREE.MeshBasicMaterial;
  private hitMaterial: THREE.MeshBasicMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'SatelliteMarkers';

    // 0.38 x 0.38 square marker in world space
    this.squareGeometry = new THREE.PlaneGeometry(0.38, 0.38);
    this.material = new THREE.MeshBasicMaterial({
      color: 0xE8A33D, // Amber accent
      side: THREE.DoubleSide,
      depthTest: true
    });

    // Invisible hit proxy: 1.4 x 1.4 units for forgiving raycast clicks
    this.hitGeometry = new THREE.PlaneGeometry(1.4, 1.4);
    this.hitMaterial = new THREE.MeshBasicMaterial({
      visible: false,
      side: THREE.DoubleSide
    });
  }

  public updateSatellites(satellites: Satellite[]): void {
    const activeIds = new Set(satellites.map(s => s.id));

    // Remove obsolete markers and hit proxies
    this.markerMap.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        this.group.remove(marker);
        this.markerMap.delete(id);
      }
    });

    this.hitProxyMap.forEach((hitProxy, id) => {
      if (!activeIds.has(id)) {
        this.group.remove(hitProxy);
        this.hitProxyMap.delete(id);
      }
    });

    // Add new markers & hit proxies
    satellites.forEach(sat => {
      if (!this.markerMap.has(sat.id)) {
        const mesh = new THREE.Mesh(this.squareGeometry, this.material);
        mesh.userData = {
          satelliteId: sat.id,
          satelliteName: sat.name
        };
        mesh.renderOrder = 3;
        const marker = mesh as unknown as MarkerMesh;
        this.group.add(marker);
        this.markerMap.set(sat.id, marker);

        // Hit proxy for raycasting
        const hitMesh = new THREE.Mesh(this.hitGeometry, this.hitMaterial);
        hitMesh.userData = {
          satelliteId: sat.id,
          satelliteName: sat.name
        };
        this.group.add(hitMesh);
        this.hitProxyMap.set(sat.id, hitMesh);
      }
    });
  }

  public updatePositions(
    positions: Map<string, PropagatedPosition>,
    camera: THREE.Camera
  ): void {
    // Calculate inverse quaternion of globePivot so markers always billboard directly facing camera
    const invParentQuat = this.group.parent
      ? this.group.parent.quaternion.clone().invert()
      : new THREE.Quaternion();
    const billboardQuat = invParentQuat.multiply(camera.quaternion);

    this.markerMap.forEach((marker, id) => {
      const pos = positions.get(id);
      const hitProxy = this.hitProxyMap.get(id);

      if (pos && pos.worldPosition) {
        marker.position.set(pos.worldPosition.x, pos.worldPosition.y, pos.worldPosition.z);
        marker.quaternion.copy(billboardQuat);
        marker.visible = true;

        if (hitProxy) {
          hitProxy.position.copy(marker.position);
          hitProxy.quaternion.copy(billboardQuat);
        }
      } else {
        marker.visible = false;
        if (hitProxy) {
          hitProxy.position.set(0, -9999, 0);
        }
      }
    });
  }

  public getRaycastTargets(): THREE.Object3D[] {
    return Array.from(this.hitProxyMap.values());
  }

  public dispose(): void {
    this.squareGeometry.dispose();
    this.hitGeometry.dispose();
    this.material.dispose();
    this.hitMaterial.dispose();
  }
}
