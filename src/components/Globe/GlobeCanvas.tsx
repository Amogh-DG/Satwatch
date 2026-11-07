import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Satellite, PropagatedPosition } from '../../types/satellite';
import { propagateSatellite, REAL_EARTH_RADIUS_KM } from '../../services/propagator';
import { createWireframeEarth } from './WireframeEarth';
import { createCountryBorders } from './CountryBorders';
import { createStarfield } from './Starfield';
import { SatelliteMarkersManager } from './SatelliteMarkers';
import { createSelectionReticle } from './SelectionReticle';
import { OrbitTrailManager } from './OrbitTrail';
import { AltitudeLineManager } from './AltitudeLine';
import { CameraController } from './CameraController';

interface GlobeCanvasProps {
  satellites: Satellite[];
  selectedSatelliteId: string | null;
  onSelectSatellite: (id: string | null) => void;
  onPositionsUpdate?: (positions: Map<string, PropagatedPosition>) => void;
}

export const GlobeCanvas: React.FC<GlobeCanvasProps> = ({
  satellites,
  selectedSatelliteId,
  onSelectSatellite,
  onPositionsUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const altTextRef = useRef<HTMLSpanElement>(null);
  const radiiTextRef = useRef<HTMLSpanElement>(null);

  const satellitesRef = useRef<Satellite[]>(satellites);
  satellitesRef.current = satellites;

  const selectedSatelliteIdRef = useRef<string | null>(selectedSatelliteId);
  selectedSatelliteIdRef.current = selectedSatelliteId;

  const onSelectSatelliteRef = useRef(onSelectSatellite);
  onSelectSatelliteRef.current = onSelectSatellite;

  const onPositionsUpdateRef = useRef(onPositionsUpdate);
  onPositionsUpdateRef.current = onPositionsUpdate;

  // Ref to trigger camera centering on external selection changes (e.g. panel row click)
  const triggerFocusRef = useRef<((id: string | null) => void) | null>(null);

  useEffect(() => {
    if (triggerFocusRef.current) {
      triggerFocusRef.current(selectedSatelliteId);
    }
  }, [selectedSatelliteId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x15171A); // Charcoal

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1.0,
      300
    );
    camera.position.set(0, 0, CameraController.DEFAULT_ZOOM);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // 2. Scene Elements
    const starfield = createStarfield();
    scene.add(starfield);

    // Rotating globe container (contains wireframe Earth + country borders + satellite markers + reticle + orbit trail + altitude line)
    const globePivot = new THREE.Group();
    globePivot.name = 'GlobePivot';
    scene.add(globePivot);

    const wireframeEarth = createWireframeEarth();
    globePivot.add(wireframeEarth);

    const countryBorders = createCountryBorders();
    globePivot.add(countryBorders);

    const markersManager = new SatelliteMarkersManager();
    globePivot.add(markersManager.group);

    // Selection reticle, orbit trail, and relative altitude line
    const reticle = createSelectionReticle();
    globePivot.add(reticle);

    const orbitTrailManager = new OrbitTrailManager();
    globePivot.add(orbitTrailManager.line);

    const altitudeLineManager = new AltitudeLineManager();
    globePivot.add(altitudeLineManager.group);

    // Camera controller for smooth adaptive distance, centering, and tracking
    const cameraController = new CameraController(globePivot, camera);

    // Wire external focus trigger
    let lastKnownPositions = new Map<string, PropagatedPosition>();
    triggerFocusRef.current = (id: string | null) => {
      if (id && lastKnownPositions.has(id)) {
        const pos = lastKnownPositions.get(id);
        if (pos?.worldPosition) {
          cameraController.setSelectedSatellite(id, pos.worldPosition);
        }
      } else {
        cameraController.setSelectedSatellite(id);
      }
    };

    // 3. User Mouse Drag & Click Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let dragDistance = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDragging = true;
      dragDistance = 0;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      dragDistance += Math.abs(deltaX) + Math.abs(deltaY);

      if (selectedSatelliteIdRef.current) {
        // Drag to orbit around the focused spacecraft/Earth
        cameraController.applyUserDrag(deltaX, deltaY);
      } else {
        const rotationSpeed = 0.005;
        globePivot.rotation.y += deltaX * rotationSpeed;
        globePivot.rotation.x += deltaY * rotationSpeed;
        globePivot.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, globePivot.rotation.x));
      }

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      isDragging = false;

      // If user clicked without dragging, perform Raycast selection or empty-space deselection
      if (dragDistance < 6) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1
        );
        raycaster.setFromCamera(mouse, camera);

        const targets = markersManager.getRaycastTargets();
        const intersects = raycaster.intersectObjects(targets, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const satId = hit.userData?.satelliteId as string | undefined;
          if (satId) {
            onSelectSatelliteRef.current(satId);
            const pos = lastKnownPositions.get(satId);
            if (pos?.worldPosition) {
              cameraController.focusPosition(pos.worldPosition);
            }
            return;
          }
        }

        // Clicked outside any satellite marker -> deselect and return to normal globe view
        onSelectSatelliteRef.current(null);
        cameraController.setSelectedSatellite(null);
      }
    };

    // Zoom on mouse wheel with extended clamp range for GEO orbits
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.03;
      const newZ = camera.position.z + e.deltaY * zoomSpeed;
      camera.position.z = Math.max(14, Math.min(160, newZ));
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 4. Resize Handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // 5. Continuous 60 FPS Render & SGP4 Calculation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // SGP4 recalculation from real-time clock
      const now = new Date();
      const currentSatellites = satellitesRef.current;
      markersManager.updateSatellites(currentSatellites);

      const positionsMap = new Map<string, PropagatedPosition>();
      for (let i = 0; i < currentSatellites.length; i++) {
        const sat = currentSatellites[i];
        const pos = propagateSatellite(sat, now);
        positionsMap.set(sat.id, pos);
      }
      lastKnownPositions = positionsMap;

      markersManager.updatePositions(positionsMap, camera);

      // Handle active satellite selection
      const activeSatId = selectedSatelliteIdRef.current;
      let activePosWorld: { x: number; y: number; z: number } | undefined;

      if (activeSatId) {
        const selectedSat = currentSatellites.find((s) => s.id === activeSatId) || null;
        const selectedPos = positionsMap.get(activeSatId);

        if (selectedSat && selectedPos && selectedPos.worldPosition) {
          activePosWorld = selectedPos.worldPosition;

          // Position reticle directly over satellite marker
          reticle.position.set(
            selectedPos.worldPosition.x,
            selectedPos.worldPosition.y,
            selectedPos.worldPosition.z
          );

          // Billboard reticle: face camera flat-on
          const invGlobeQuat = globePivot.quaternion.clone().invert();
          reticle.quaternion.copy(invGlobeQuat.multiply(camera.quaternion));
          reticle.visible = true;

          // Update orbit trail behind satellite
          orbitTrailManager.updateTrail(selectedSat, now, selectedPos.worldPosition);

          // Update relative altitude distance line to Earth surface
          const midPoint = altitudeLineManager.update(selectedPos.worldPosition, camera);

          // Project altitude line midpoint to 2D screen coordinates for HUD badge
          if (midPoint && badgeRef.current && altTextRef.current && radiiTextRef.current) {
            const midVector = new THREE.Vector3(midPoint.x, midPoint.y, midPoint.z);
            midVector.applyMatrix4(globePivot.matrixWorld);
            midVector.project(camera);

            if (midVector.z > 1.0) {
              badgeRef.current.style.display = 'none';
            } else {
              const screenX = ((midVector.x + 1) * window.innerWidth) / 2;
              const screenY = ((-midVector.y + 1) * window.innerHeight) / 2;

              badgeRef.current.style.left = `${screenX}px`;
              badgeRef.current.style.top = `${screenY}px`;
              badgeRef.current.style.display = 'flex';

              const altKm = selectedPos.altitudeKm;
              if (altKm !== null && !isNaN(altKm)) {
                altTextRef.current.textContent = `${Math.round(altKm)} km`;
                radiiTextRef.current.textContent = `${(altKm / REAL_EARTH_RADIUS_KM).toFixed(2)} R⊕`;
              } else {
                altTextRef.current.textContent = '— km';
                radiiTextRef.current.textContent = '— R⊕';
              }
            }
          }
        } else {
          reticle.visible = false;
          orbitTrailManager.hide();
          altitudeLineManager.hide();
          if (badgeRef.current) badgeRef.current.style.display = 'none';
        }
      } else {
        reticle.visible = false;
        orbitTrailManager.hide();
        altitudeLineManager.hide();
        if (badgeRef.current) badgeRef.current.style.display = 'none';
      }

      // Update camera transition and tracking
      cameraController.update(isDragging, activePosWorld);

      if (onPositionsUpdateRef.current) {
        onPositionsUpdateRef.current(positionsMap);
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      markersManager.dispose();
      orbitTrailManager.dispose();
      altitudeLineManager.dispose();
      reticle.geometry.dispose();
      (reticle.material as THREE.Material).dispose();
      countryBorders.geometry.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden bg-charcoal cursor-grab active:cursor-grabbing select-none"
    >
      {/* Floating 3D Mission-Control Altitude & Earth Radii Badge */}
      <div
        ref={badgeRef}
        className="fixed pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2 bg-panel border border-hairline px-2 py-1 items-center space-x-1.5 shadow-xl select-none"
        style={{
          display: 'none',
          borderRadius: 0
        }}
      >
        <span
          ref={altTextRef}
          className="font-mono text-offwhite text-xs font-medium tracking-tight"
        >
          — km
        </span>
        <span className="text-muted/60 text-xs">|</span>
        <span
          ref={radiiTextRef}
          className="font-mono text-amber text-xs font-semibold tracking-tight"
        >
          — R⊕
        </span>
      </div>
    </div>
  );
};
