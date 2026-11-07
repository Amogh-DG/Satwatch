# Implementation Plan: Core Satellite Tracking & Globe Experience

**Branch**: `001-core-satellite-tracking` | **Date**: 2026-11-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-core-satellite-tracking/spec.md` and user tech-stack decisions.

## Summary

Build a high-performance, desktop-first real-time 3D satellite tracker that matches the mission-control visual aesthetics in `design/`. The application renders a wireframe 3D Earth globe using raw Three.js with delicate country border outlines (using locally bundled Natural Earth data via `world-atlas` and `topojson-client`), tracks 10 curated satellites (from `docs/features.md`) using continuous SGP4 orbital propagation via `satellite.js`, dynamically derives operational statuses from live CelesTrak SATCAT records, and provides an instrument-style slide-in control panel for searching, filtering, and bookmarking spacecraft.

---

## Technical Context

**Language/Version**: TypeScript 5.5+  
**Primary Dependencies**:
- `three` (@types/three) — Raw 3D WebGL globe, wireframe graticules, country border line segments, square markers, orbit trails, and raycasting.
- `world-atlas` & `topojson-client` — Local pre-built Natural Earth TopoJSON dataset (`countries-110m.json`) and conversion client. Zero CDN calls.
- `satellite.js` — SGP4/SDP4 propagation engine calculating live geodetic positions and trajectories from TLEs.
- `react` 18+ & `react-dom` — Declarative UI layer for slide-in panel, search, filters, and HUD card.
- `lucide-react` — Hairline iconography (menu, close, star).
- `vite` — Fast dev server and optimized production bundler.
- `tailwindcss` — Utility-first CSS configured with custom mission-control design tokens.

**Storage**: Browser `localStorage` for:
- User bookmarks: `satellite_tracker_saved_ids` (persisting saved satellite slugs).
- Offline TLE & SATCAT cache: `satellite_tracker_telemetry_cache` (with timestamp).

**Testing**: Vitest + Testing Library for data parsing, SGP4 propagation accuracy, status code evaluation, and filter state logic.

**Target Platform**: Desktop modern web browsers (Chrome, Firefox, Safari, Edge) supporting WebGL 2.0.

**Project Type**: Single-page frontend web application (pure client-side; zero custom backend required due to native CelesTrak CORS support).

**Performance Goals**:
- Steady 60 FPS 3D rendering loop with real-time continuous SGP4 recalculations and country border outlines.
- Single GPU draw call for all country border lines (~7,600 line segments).
- <200ms slide-in control panel transition with zero layout thrash.
- <16ms filter/search response times.

**Constraints**:
- Strict mission-control design: 0px border-radius, hairline borders (`1px solid #3A3E40`), no glow/gradients.
- Missing telemetry fields must strictly render as `—`.
- Zero hardcoded satellite positions or operational statuses.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Plan Compliance | Status |
|---|---|---|---|
| **1. Live Data Only** | Continuous SGP4 recalculation from real TLEs; no canned/looped paths; missing data shows `—` | `satellite.js` evaluates $t = \text{now}$ on every tick; CelesTrak SATCAT provides dynamic status; null properties map to `—` | **PASS** |
| **2. Globe First** | Clean default rotating 3D Earth, 1 top-left square menu button, slide-in panel | 100vw/100vh Three.js canvas, sole visible UI button at top-left, off-canvas panel | **PASS** |
| **3. Design Fidelity** | Follow visual reference mockups in `design/` | Raw Three.js replicates wireframe parallels/meridians, country border outlines, and amber square reticle; UI matches `Default-globe.png`, `Panel-open.png`, and `Satellite-selected.png` | **PASS** |
| **4. Style Rules** | Charcoal `#15171A`, panel `#181B1D`, amber `#E8A33D`, text `#E8E4D8` / `#8E918B`, borders `#3A3E40`, IBM Plex Mono + Schibsted Grotesk, 0px radius | CSS design tokens configured in Tailwind and root CSS variables; Google Fonts imported | **PASS** |
| **5. Keep It Simple** | Phase 1 core scope (globe, panel, search, filters, bookmarks, click-to-focus, orbit trail); Phase 2 AI deferred | Search scaffolded with inactive "Describe what to track" link; no backend AI dependencies | **PASS** |
| **6. Desktop First** | Desktop layout validated before mobile adaptations | Viewport, aspect ratios, and layouts designed for desktop displays | **PASS** |

---

## Country Borders & Geographic Outlines Evaluation

### Dataset & Boundary Depiction
- **Dataset**: Natural Earth 1:110m cultural country boundaries via `world-atlas/countries-110m.json` (~107 KB bundled locally).
- **Processing**: `topojson.mesh(world, world.objects.countries)` extracts border line segments converted directly to 3D Cartesian coordinates on the globe ($r = 10.01$).
- **Rendering Architecture**: All ~7,650 line segments are merged into a single `THREE.LineSegments` geometry, requiring exactly 1 draw call in WebGL and maintaining solid 60 FPS performance.
- **Styling**: Rendered in a delicate hairline line material (`#4E5256`, slightly lighter than the `#3A3E40` graticule lines) with zero fills, ensuring land outlines are recognizable without cluttering the satellite tracking display.
- **India's Boundaries in Natural Earth 110m**: Natural Earth represents de facto international boundaries (including the Line of Control in the northern sector). The border encompasses mainland India from ~8.0°N to ~35.5°N and ~68.2°E to ~97.4°E.

---

## 3D Engine Evaluation: Raw Three.js vs globe.gl

### Selected: **Raw Three.js**

### Why Raw Three.js was Chosen over globe.gl:
1. **Visual Match with `design/Default-globe.png`**:
   - The reference design depicts a minimalist, dark wireframe globe with latitude parallels and longitude meridians rendered in `#3A3E40` hairline lines, surrounded by celestial background dots.
   - `globe.gl` is designed around textured photographic Earth spheres, geoJSON borders, and glowing volumetric arcs. Stripping globe.gl's shaders and defaults to achieve the flat wireframe aesthetic requires complex overrides. Raw Three.js allows building the exact wireframe geometry and country border outlines cleanly.
2. **Marker & Reticle Customization**:
   - The design calls for strict square amber markers and an amber square framing reticle (`#E8A33D`) with zero glow or blur. Raw Three.js points/instanced quads provide exact 1:1 control over fragment shaders and pixel-crisp square markers.
3. **Orbit Trail Precision**:
   - The orbit trail is a continuous Keplerian/SGP4 trajectory curve drawn behind the satellite. Raw Three.js `Line` or `Line2` directly accepts 3D world points computed from SGP4.
4. **Bundle Efficiency & Independence**:
   - Raw Three.js introduces zero transitive D3/GIS baggage, maintaining a fast initial load and clean build.
5. **Dynamic Camera Framing & Relative Altitude Distance**:
   - **Adaptive Camera Distance**: Camera distance $z_{\text{cam}}$ scales dynamically with satellite orbital altitude so the Earth (radius $10.0$) remains completely visible in the viewport:
     - LEO (ISS, $r \approx 10.66$): $z_{\text{cam}} \approx 25$ (tight view, Earth fills majority of frame).
     - MEO (GLONASS-M, $r \approx 40$): $z_{\text{cam}} \approx 62$ (wide view, Earth comfortably centered).
     - GEO (INSAT-3D, GSAT-30, $r \approx 66$): $z_{\text{cam}} \approx 96$ (ultra-wide view, Earth and geostationary orbit in full view).
   - **Continuous Centering & Deselection Return**: Camera keeps satellite centered as it moves, while drag-to-orbit and scroll-to-zoom still work. Deselection smoothly transitions back to default `(0, 0, 28)`.
   - **Altitude Distance Line & Earth Radii Metric**:
     - Thin hairline line from satellite position to the sub-satellite surface point directly below it on Earth.
     - Screen-space/billboarded mission-control badge along the line showing altitude and Earth radii distance ($R_\oplus = \text{altKm} / 6371.0$, e.g. "0.07 R⊕").
     - Telemetry card displays the identical Earth radii figure.

---

## Data Source & CORS Verification

CelesTrak endpoints were empirically verified during planning:
1. **CORS Headers**: CelesTrak explicitly returns `Access-Control-Allow-Origin: *` when the browser sends an `Origin` header. Direct browser `fetch()` calls succeed without requiring a custom proxy backend.
2. **Endpoint Behavior**:
   - TLE Ephemerides: `https://celestrak.org/NORAD/elements/gp.php?CATNR={noradId}&FORMAT=json`
   - SATCAT Metadata (Launch Date, Operational Status, International Designator): `https://celestrak.org/satcat/records.php?CATNR={noradId}&FORMAT=json`
3. **10 Target Satellite Catalog Mapping**:
   - **ISS**: NORAD `25544` | COSPAR `1998-067A` | Launch `1998-11-20` | Status: `+` (Active)
   - **INSAT-3D**: NORAD `39216` | COSPAR `2013-038B` | Launch `2013-07-25` | Status: `+` (Active)
   - **Cartosat-2A**: NORAD `32783` | COSPAR `2008-021A` | Launch `2008-04-28` | Status: `+` (Active)
   - **GSAT-30**: NORAD `45026` | COSPAR `2020-005A` | Launch `2020-01-16` | Status: `+` (Active)
   - **RISAT-2B**: NORAD `44233` | COSPAR `2019-028A` | Launch `2019-05-22` | Status: `+` (Active)
   - **RESOURCESAT-2**: NORAD `37387` | COSPAR `2011-015A` | Launch `2011-04-20` | Status: `+` (Active)
   - **GLONASS-M**: NORAD `40001` (COSMOS 2500) | COSPAR `2014-032A` | Launch `2014-06-14` | Status: `+` (Active)
   - **Meridian**: NORAD `40296` (MERIDIAN 7) | COSPAR `2014-069A` | Launch `2014-10-30` | Status: `+` (Active)
   - **Elektro-L**: NORAD `41105` (ELEKTRO-L 2) | COSPAR `2015-074A` | Launch `2015-12-11` | Status: `+` (Active)
   - **Resurs-P 4**: NORAD `59371` | COSPAR `2024-060A` | Launch `2024-03-31` | Status: `+` (Active)

---

## Project Structure

### Documentation (`specs/001-core-satellite-tracking/`)
```text
specs/001-core-satellite-tracking/
├── plan.md              # This plan
├── research.md          # Technical decisions & rationale
├── data-model.md        # Entities, types, and persistence contracts
├── contracts/
│   └── satellite-telemetry-contract.md
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── quickstart.md        # Run & validation instructions
```

### Source Code Layout (`src/`)
```text
src/
├── assets/              # Static assets, fallback baseline TLEs
├── components/
│   ├── Globe/
│   │   ├── GlobeCanvas.tsx       # Three.js canvas container & render loop
│   │   ├── WireframeEarth.ts     # Procedural latitude/longitude graticules
│   │   ├── CountryBorders.ts     # Procedural country border outlines from world-atlas
│   │   ├── SatelliteMarkers.ts   # Square amber points & selection reticle
│   │   ├── OrbitTrail.ts         # Trailing trajectory curve line
│   │   └── CameraController.ts   # Click-to-focus and target-centric tracking
│   ├── Panel/
│   │   ├── ControlPanel.tsx      # Slide-in drawer container
│   │   ├── SearchBar.tsx         # Search input & Phase 2 teaser link
│   │   ├── FilterGroup.tsx       # Compound category & criteria filter buttons
│   │   ├── SatelliteList.tsx     # Scrollable catalog table
│   │   └── SatelliteRow.tsx      # Status icon, name, altitude, bookmark star
│   ├── HUD/
│   │   └── TelemetryCard.tsx     # Bottom-right instrument card for selected satellite
│   └── Common/
│       └── MenuButton.tsx        # Top-left square menu / close button
├── services/
│   ├── celestrak.ts              # Live CelesTrak API client (TLE + SATCAT)
│   ├── propagator.ts             # SGP4 satellite.js calculation wrapper
│   └── storage.ts                # LocalStorage bookmark and telemetry caching
├── store/
│   └── useTrackerStore.ts        # App state (selected sat, panel open, filters, bookmarks)
├── types/
│   └── satellite.ts              # Core TypeScript interfaces & enums
├── App.tsx                       # Main layout orchestrator
├── index.css                     # Design tokens, fonts, reset, square borders
└── main.tsx                      # Vite React entry point
```

---

## Complexity Tracking

> **No Constitution Violations detected.** Architecture strictly complies with all principles.

| Aspect | Decision | Justification |
|---|---|---|
| **No Backend Proxy** | Direct browser `fetch()` | Verified that CelesTrak returns `Access-Control-Allow-Origin: *`. A custom proxy backend would violate Principle 5 (Keep It Simple). |
| **Raw Three.js** | Custom wireframe globe + country borders | Avoids heavyweight GIS overhead and cleanly achieves the exact mission-control design in `design/Default-globe.png`. |
