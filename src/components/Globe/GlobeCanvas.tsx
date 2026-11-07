import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Satellite, PropagatedPosition } from '../../types/satellite';
import { propagateSatellite } from '../../services/propagator';
import { createWireframeEarth } from './WireframeEarth';
import { createCountryBorders } from './CountryBorders';
import { createStarfield } from './Starfield';
import { SatelliteMarkersManager } from './SatelliteMarkers';

interface GlobeCanvasProps {
  satellites: Satellite[];
  selectedSatelliteId: string | null;
  onSelectSatellite: (id: string | null) => void;
  onPositionsUpdate?: (positions: Map<string, PropagatedPosition>) => void;
}

export const GlobeCanvas: React.FC<GlobeCanvasProps> = ({
  satellites,
  selectedSatelliteId: _selectedSatelliteId,
  onSelectSatellite,
  onPositionsUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const satellitesRef = useRef<Satellite[]>(satellites);
  satellitesRef.current = satellites;

  const onSelectSatelliteRef = useRef(onSelectSatellite);
  onSelectSatelliteRef.current = onSelectSatellite;

  const onPositionsUpdateRef = useRef(onPositionsUpdate);
  onPositionsUpdateRef.current = onPositionsUpdate;

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
    camera.position.set(0, 3, 28);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // 2. Scene Elements
    const starfield = createStarfield();
    scene.add(starfield);

    // Rotating globe container (contains wireframe Earth + real-time satellite markers)
    const globePivot = new THREE.Group();
    globePivot.name = 'GlobePivot';
    scene.add(globePivot);

    const wireframeEarth = createWireframeEarth();
    globePivot.add(wireframeEarth);

    const countryBorders = createCountryBorders();
    globePivot.add(countryBorders);

    const markersManager = new SatelliteMarkersManager();
    globePivot.add(markersManager.group);

    // 3. User Mouse Drag Interaction (Spin Globe)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let dragDistance = 0;

    const onMouseDown = (e: MouseEvent) => {
      // Only handle primary left click
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

      // Rotate globePivot directly around world axes
      const rotationSpeed = 0.005;
      globePivot.rotation.y += deltaX * rotationSpeed;
      globePivot.rotation.x += deltaY * rotationSpeed;

      // Clamp X rotation so it doesn't flip upside down
      globePivot.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, globePivot.rotation.x));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      isDragging = false;

      // If user clicked without dragging, perform Raycast satellite selection
      if (dragDistance < 5) {
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
            return;
          }
        }

        // Clicked outside any satellite
        onSelectSatelliteRef.current(null);
      }
    };

    // Zoom on wheel
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.02;
      const newZ = camera.position.z + e.deltaY * zoomSpeed;
      // Clamp zoom distance
      camera.position.z = Math.max(14, Math.min(55, newZ));
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

      // Ambient slow rotation when not actively dragging
      if (!isDragging) {
        globePivot.rotation.y += 0.0004;
      }

      // Continuous SGP4 recalculation from real-time clock
      const now = new Date();
      const currentSatellites = satellitesRef.current;
      markersManager.updateSatellites(currentSatellites);

      const positionsMap = new Map<string, PropagatedPosition>();
      for (let i = 0; i < currentSatellites.length; i++) {
        const sat = currentSatellites[i];
        const pos = propagateSatellite(sat, now);
        positionsMap.set(sat.id, pos);
      }

      markersManager.updatePositions(positionsMap, camera);

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
      className="fixed inset-0 w-full h-full overflow-hidden bg-charcoal cursor-grab active:cursor-grabbing"
    />
  );
};
