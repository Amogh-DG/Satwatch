import * as THREE from 'three';

export class CameraController {
  private globePivot: THREE.Group;
  private camera: THREE.PerspectiveCamera;
  private selectedSatelliteId: string | null = null;
  private isTransitioning: boolean = false;
  private targetRotX: number = 0;
  private targetRotY: number = 0;
  private targetZoomZ: number = 28;
  private userDragOffsetX: number = 0;
  private userDragOffsetY: number = 0;

  // Default normal globe view distance
  public static readonly DEFAULT_ZOOM = 28;

  constructor(globePivot: THREE.Group, camera: THREE.PerspectiveCamera) {
    this.globePivot = globePivot;
    this.camera = camera;
  }

  public setSelectedSatellite(
    satelliteId: string | null,
    position?: { x: number; y: number; z: number }
  ): void {
    const wasDifferent = this.selectedSatelliteId !== satelliteId;
    this.selectedSatelliteId = satelliteId;

    if (!satelliteId) {
      // Returning to normal default globe view
      this.targetZoomZ = CameraController.DEFAULT_ZOOM;
      this.targetRotX = 0;
      this.userDragOffsetX = 0;
      this.userDragOffsetY = 0;
      this.isTransitioning = true;
      return;
    }

    if (wasDifferent || this.userDragOffsetX !== 0 || this.userDragOffsetY !== 0) {
      this.userDragOffsetX = 0;
      this.userDragOffsetY = 0;
      if (position) {
        this.focusPosition(position);
      }
    }
  }

  /**
   * Calculates the optimal camera distance so the entire Earth (diameter 20)
   * stays completely visible in the frame while keeping the satellite centered.
   * - LEO (r ~ 10.66, e.g. ISS) -> zoom ~ 25.5 (tight, dramatic Earth framing)
   * - MEO (r ~ 40, e.g. GLONASS-M) -> zoom ~ 62 (wide view, Earth comfortably centered)
   * - GEO (r ~ 66, e.g. INSAT-3D) -> zoom ~ 95 (ultra-wide view, whole Earth & orbit in view)
   */
  public calculateTargetZoom(radialDistance: number): number {
    return Math.max(
      25.5,
      radialDistance + 15 + Math.max(0, radialDistance - 10) * 0.22
    );
  }

  public focusPosition(position: { x: number; y: number; z: number }): void {
    const len = Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2);
    if (len < 0.001) return;

    const ux = position.x / len;
    const uy = position.y / len;
    const uz = position.z / len;

    // Calculate rotation to align satellite position with +Z (directly facing camera)
    this.targetRotY = -Math.atan2(ux, uz);
    this.targetRotX = Math.asin(Math.max(-0.99, Math.min(0.99, uy)));
    this.targetRotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.targetRotX));

    // Adaptive camera pull-back / move-in based on orbital altitude
    this.targetZoomZ = this.calculateTargetZoom(len);
    this.isTransitioning = true;
  }

  public applyUserDrag(deltaX: number, deltaY: number): void {
    const speed = 0.005;
    this.userDragOffsetY += deltaX * speed;
    this.userDragOffsetX += deltaY * speed;
    this.userDragOffsetX = Math.max(
      -Math.PI / 2.2,
      Math.min(Math.PI / 2.2, this.userDragOffsetX)
    );
  }

  public update(isDragging: boolean, livePosition?: { x: number; y: number; z: number }): void {
    if (isDragging) {
      this.isTransitioning = false;
      return;
    }

    if (this.selectedSatelliteId && livePosition) {
      const len = Math.sqrt(livePosition.x ** 2 + livePosition.y ** 2 + livePosition.z ** 2);
      if (len > 0.001) {
        const ux = livePosition.x / len;
        const uy = livePosition.y / len;
        const uz = livePosition.z / len;

        const baseRotY = -Math.atan2(ux, uz);
        const baseRotX = Math.asin(Math.max(-0.99, Math.min(0.99, uy)));

        this.targetRotY = baseRotY + this.userDragOffsetY;
        this.targetRotX = Math.max(
          -Math.PI / 2.2,
          Math.min(Math.PI / 2.2, baseRotX + this.userDragOffsetX)
        );
      }
    }

    if (this.isTransitioning) {
      // Shortest angle difference for Y rotation
      let diffY = (this.targetRotY - this.globePivot.rotation.y) % (2 * Math.PI);
      if (diffY > Math.PI) diffY -= 2 * Math.PI;
      if (diffY < -Math.PI) diffY += 2 * Math.PI;

      const diffX = this.targetRotX - this.globePivot.rotation.x;
      const diffZ = this.targetZoomZ - this.camera.position.z;

      const lerpRot = 0.08;
      const lerpZoom = 0.06;

      this.globePivot.rotation.y += diffY * lerpRot;
      this.globePivot.rotation.x += diffX * lerpRot;
      this.camera.position.z += diffZ * lerpZoom;

      if (
        Math.abs(diffY) < 0.002 &&
        Math.abs(diffX) < 0.002 &&
        Math.abs(diffZ) < 0.1
      ) {
        this.globePivot.rotation.y = this.targetRotY;
        this.globePivot.rotation.x = this.targetRotX;
        this.camera.position.z = this.targetZoomZ;
        this.isTransitioning = false;
      }
    } else if (this.selectedSatelliteId) {
      // Smooth continuous tracking as satellite orbits
      let diffY = (this.targetRotY - this.globePivot.rotation.y) % (2 * Math.PI);
      if (diffY > Math.PI) diffY -= 2 * Math.PI;
      if (diffY < -Math.PI) diffY += 2 * Math.PI;

      const diffX = this.targetRotX - this.globePivot.rotation.x;

      this.globePivot.rotation.y += diffY * 0.1;
      this.globePivot.rotation.x += diffX * 0.1;
    } else {
      // Slow ambient rotation only when no satellite is focused
      this.globePivot.rotation.y += 0.0004;
    }
  }
}
