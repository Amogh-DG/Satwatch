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
  private squareGeometry: THREE.PlaneGeometry;
  private material: THREE.MeshBasicMaterial;

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
  }

  public updateSatellites(satellites: Satellite[]): void {
    const activeIds = new Set(satellites.map(s => s.id));

    // Remove obsolete markers
    this.markerMap.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        this.group.remove(marker);
        this.markerMap.delete(id);
      }
    });

    // Add new markers
    satellites.forEach(sat => {
      if (!this.markerMap.has(sat.id)) {
        const mesh = new THREE.Mesh(this.squareGeometry, this.material);
        mesh.userData = {
          satelliteId: sat.id,
          satelliteName: sat.name
        };
        const marker = mesh as unknown as MarkerMesh;
        this.group.add(marker);
        this.markerMap.set(sat.id, marker);
      }
    });
  }

  public updatePositions(
    positions: Map<string, PropagatedPosition>,
    camera: THREE.Camera
  ): void {
    this.markerMap.forEach((marker, id) => {
      const pos = positions.get(id);
      if (pos && pos.worldPosition) {
        marker.position.set(pos.worldPosition.x, pos.worldPosition.y, pos.worldPosition.z);
        // Billboard effect: ensure square marker faces the camera
        marker.quaternion.copy(camera.quaternion);
        marker.visible = true;
      } else {
        marker.visible = false;
      }
    });
  }

  public getRaycastTargets(): THREE.Object3D[] {
    return Array.from(this.markerMap.values());
  }

  public dispose(): void {
    this.squareGeometry.dispose();
    this.material.dispose();
  }
}
