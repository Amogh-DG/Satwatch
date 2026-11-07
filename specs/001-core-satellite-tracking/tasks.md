---
description: "Task list for Core Satellite Tracking & Globe Experience implementation"
---

# Tasks: Core Satellite Tracking & Globe Experience

**Input**: Design documents from `specs/001-core-satellite-tracking/` (`spec.md`, `plan.md`, `data-model.md`, `contracts/satellite-telemetry-contract.md`, `research.md`, `quickstart.md`).

**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `data-model.md`, `contracts/`, `research.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story in priority order (US1 → US2 → US3 → US4).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- Every task includes explicit target file paths and concrete constraints from the data model and design rules.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, build tools, dependencies, and design tokens.

- [x] T001 Initialize Vite TypeScript React project with `package.json` in repository root
- [x] T002 Install core dependencies: `three`, `@types/three`, `satellite.js`, `lucide-react`, `tailwindcss`, `postcss`, `autoprefixer` in `package.json`
- [x] T003 [P] Configure Tailwind CSS and CSS variables for mission-control palette (`#15171A`, `#181B1D`, `#E8A33D`, `#E8E4D8`, `#8E918B`, `#3A3E40`), hairline borders, and 0px border-radius in `tailwind.config.js` and `src/index.css`
- [x] T004 [P] Import Google Fonts `IBM Plex Mono` (data readouts) and `Schibsted Grotesk` (labels/UI) in `index.html` and configure font families in `tailwind.config.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data types, baseline catalogs, CelesTrak service, SGP4 propagator, and state store.

**⚠️ CRITICAL**: Must complete before user story UI implementation begins.

- [x] T005 [P] Define core TypeScript interfaces and types (`Satellite`, `OrbitalState`, `PropagatedPosition`, `Bookmark`, `FilterSelection`) quoting all validation constraints and enums in `src/types/satellite.ts`
- [x] T006 [P] Create bundled baseline snapshot data for the 10 target satellites (ISS, INSAT-3D, Cartosat-2A, GSAT-30, RISAT-2B, RESOURCESAT-2, GLONASS-M, Meridian, Elektro-L, Resurs-P 4) with NORAD IDs and fallback TLEs in `src/assets/baseline-satellites.json`
- [x] T007 Implement CelesTrak API client fetching live TLEs (`gp.php`) and SATCAT metadata (`satcat/records.php`), evaluating live operational status (`+` → Active, `D`/`-` → Inactive, missing → `—`) without hardcoded statuses in `src/services/celestrak.ts`
- [x] T008 [P] Implement `localStorage` persistence service for user bookmarks (`satellite_tracker_saved_ids`) and telemetry cache with `lastUpdated` timestamp in `src/services/storage.ts`
- [x] T009 Implement real-time SGP4 orbital propagation service via `satellite.js` converting ECI to Geodetic (lat, lon, alt km, velocity km/s) and generating trailing path coordinates in `src/services/propagator.ts`
- [x] T010 Implement global reactive tracker store managing active satellite data, selected satellite, slide panel state, and compound filters in `src/store/useTrackerStore.ts`

**Checkpoint**: Core data services and propagation engine verified; user story UI implementation can begin.

---

## Phase 3: User Story 1 - Real-Time 3D Globe & Satellite Observation (Priority: P1) 🎯 MVP

**Goal**: Render a slowly rotating 3D Earth globe against `#15171A` background with the 10 target satellites moving along real-time SGP4 orbits, draggable from any angle, with the sole visible UI being a square top-left menu button.

**Independent Test**: Load `http://localhost:5173`; verify the wireframe Earth globe rotates smoothly with latitude/longitude graticules in `#3A3E40`, satellites move in real time as amber points (`#E8A33D`), clicking/dragging spins the globe, and only the square menu button is visible at top-left.

- [x] T011 [P] [US1] Create top-left square menu button (`#181B1D`, hairline border `#3A3E40`, square corners, hamburger icon) in `src/components/Common/MenuButton.tsx`
- [x] T012 [P] [US1] Build procedural 3D wireframe Earth graticule geometry (latitude parallels, longitude meridians, equator ring in `#3A3E40` line material) matching `design/Default-globe.png` in `src/components/Globe/WireframeEarth.ts`
- [x] T013 [P] [US1] Implement 3D celestial starfield background points in `src/components/Globe/Starfield.ts`
- [x] T014 [US1] Implement 3D satellite markers rendering real-time positions of the 10 satellites as crisp amber squares (`#E8A33D`) with raycasting click detection in `src/components/Globe/SatelliteMarkers.ts`
- [x] T015 [US1] Assemble Three.js scene, WebGL renderer, animation loop (slow ambient rotation), camera controls (drag-to-orbit), and resize handling in `src/components/Globe/GlobeCanvas.tsx`
- [x] T016 [US1] Connect `GlobeCanvas`, live CelesTrak ingestion, real-time SGP4 propagation loop, and `MenuButton` in `src/App.tsx`

**Checkpoint**: User Story 1 (MVP) is fully functional and delivers an ambient 3D real-time globe.

---

## Phase 4: User Story 2 - Slide-In Mission Control Panel, Search & Filtering (Priority: P2)

**Goal**: Provide a slide-in drawer from the left edge containing search, compound filters (`All`, `Weather`, `Navigation`, `Active`, `Country`), Phase 2 teaser link ("Describe what to track"), and dense satellite list with dynamic live status indicators and altitudes.

**Independent Test**: Click top-left menu button; panel slides in within 200ms. Search for "INSAT" filters list instantly; toggle "Weather" or "Active"; verify active satellites show filled amber squares and altitudes in km.

- [ ] T017 [P] [US2] Implement search bar with square hairline borders and Phase 2 "Describe what to track" teaser link in `src/components/Panel/SearchBar.tsx`
- [ ] T018 [P] [US2] Implement compound filter button group (Row 1 single-select: `All`, `Weather`, `Navigation`; Row 2 independent toggles: `Active`, `Country`) with amber active borders in `src/components/Panel/FilterGroup.tsx`
- [ ] T019 [P] [US2] Implement satellite list item row displaying dynamic operational status square (filled amber for active, hollow for inactive/idle), name in bold off-white, altitude in `IBM Plex Mono` (or `— km`), and bookmark star in `src/components/Panel/SatelliteRow.tsx`
- [ ] T020 [US2] Implement scrollable satellite catalog list container grouping by "Saved" and "All satellites" with hairline dividers in `src/components/Panel/SatelliteList.tsx`
- [ ] T021 [US2] Assemble slide-in control panel drawer with fast slide transition (`200ms cubic-bezier(0.16, 1, 0.3, 1)`), close 'X' button, and integration into `src/components/Panel/ControlPanel.tsx`
- [ ] T022 [US2] Wire control panel drawer opening/closing and filter synchronization into `src/App.tsx`

**Checkpoint**: User Story 2 is functional; users can search, filter, and inspect the catalog without affecting globe performance.

---

## Phase 5: User Story 3 - Satellite Selection, Telemetry HUD Card & Orbit Trail (Priority: P3)

**Goal**: Selecting a satellite (on globe or in panel) smoothly focuses camera tracking, frames it with an amber square reticle, draws its historical amber orbit trail across the globe, and displays the bottom-right mission-control telemetry card.

**Independent Test**: Click `ISS` in the list or on the globe. Camera smoothly centers on ISS and tracks it; amber square reticle frames ISS; amber trajectory trail draws along its path; bottom-right card appears with Status (`Active`), Altitude, Speed, Orbit (`LEO`), Position, Launched (`1998`), and Designator (`1998-067A`). Clicking outside dismisses them.

- [ ] T023 [P] [US3] Implement 3D amber square framing reticle (`#E8A33D`) locked to the selected satellite position in `src/components/Globe/SelectionReticle.ts`
- [ ] T024 [P] [US3] Implement dynamic amber orbit trail line (`#E8A33D`, hairline width, no glow) tracing SGP4 calculated trajectory points in `src/components/Globe/OrbitTrail.ts`
- [ ] T025 [US3] Implement smooth camera transition and target-centric tracking controller (lerping camera center to satellite while allowing user drag/zoom) in `src/components/Globe/CameraController.ts`
- [ ] T026 [P] [US3] Implement bottom-right instrument telemetry card (`#181B1D`, hairline border `#3A3E40`, square corners, dense table: Status, Altitude, Speed, Orbit, Position, Launched, Designator, and Saved toggle) in `src/components/HUD/TelemetryCard.tsx`
- [ ] T027 [US3] Integrate reticle, orbit trail, camera tracking, and telemetry HUD card dismissal on background click in `src/components/Globe/GlobeCanvas.tsx` and `src/App.tsx`

**Checkpoint**: User Story 3 is fully operational; users can track and inspect spacecraft in detail.

---

## Phase 6: User Story 4 - Bookmarking & Saved Satellites (Priority: P4)

**Goal**: Allow bookmarking satellites via the star icon in the list or the "Saved" button in the HUD card, persisting to `localStorage` and pinning saved spacecraft to the "Saved" section at the top of the control panel.

**Independent Test**: Star `INSAT-3D`; confirm it appears under "Saved" in the panel and its HUD button shows "Saved" with amber border. Refresh browser; verify `INSAT-3D` remains bookmarked. Click star again; verify bookmark is unpinned.

- [ ] T028 [US4] Implement bookmark toggle handler connecting `SatelliteRow` star button and `TelemetryCard` "Saved" button to tracker store in `src/store/useTrackerStore.ts`
- [ ] T029 [US4] Connect store bookmark updates to persistent `localStorage` serialization and hydration in `src/services/storage.ts`
- [ ] T030 [US4] Update `SatelliteList.tsx` to render the "Saved" group pinned above "All satellites" matching `design/Panel-open.png`

**Checkpoint**: User Story 4 is complete; bookmarks persist across reload cycles.

---

## Phase 7: Polish & Verification

**Purpose**: Cross-cutting validation against design screenshots and quality checklist.

- [ ] T031 [P] Verify visual styling against `design/Default-globe.png`, `design/Panel-open.png`, and `design/Satellite-selected.png` (hairline borders `#3A3E40`, 0px border-radius, exact hex colors, typography) in `src/index.css`
- [ ] T032 Verify live data integrity: ensure zero hardcoded positions/statuses and confirm unavailable fields render strictly as `—`
- [ ] T033 Execute quickstart end-to-end verification scenarios A through E from `specs/001-core-satellite-tracking/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Complete.
- **Phase 2 (Foundational)**: Complete.
- **Phase 3 (User Story 1 - MVP)**: Complete.
- **Phase 4 (User Story 2)**: Ready to implement.
- **Phase 5 (User Story 3)**: Ready to implement.
- **Phase 6 (User Story 4)**: Ready to implement.
- **Phase 7 (Polish)**: Ready after user stories.

### Implementation Strategy: MVP First

1. **Step 1**: Complete Phase 1 (Setup) and Phase 2 (Foundational) — ✓ COMPLETED
2. **Step 2**: Implement Phase 3 (User Story 1) $\rightarrow$ **Deliver MVP** — ✓ COMPLETED
3. **Step 3**: Implement Phase 4 (User Story 2) $\rightarrow$ Search, compound filters, and drawer
4. **Step 4**: Implement Phase 5 (User Story 3) $\rightarrow$ Click-to-focus camera tracking, reticle, orbit trail, and HUD card
5. **Step 5**: Implement Phase 6 (User Story 4) $\rightarrow$ Bookmarks and persistent "Saved" section
6. **Step 6**: Validate against `quickstart.md` scenarios and visual design screenshots.
