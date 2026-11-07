# Feature Specification: Core Satellite Tracking & Globe Experience

**Feature Branch**: `001-core-satellite-tracking`

**Created**: 2026-11-07

**Status**: Draft

**Input**: User description: "Project: Satellite Tracker, a real-time 3D globe app for tracking satellites. Principles: Live data only, Globe first, Follow the design, Style rules (mission-control aesthetic), Keep it simple (Phase 1 core features), Desktop first. Reference: docs/features.md."

## Clarifications

### Session 2026-11-07
- Q: What should be the default scope and volume of satellites loaded and tracked on the 3D globe upon startup? → A: Exactly the 10 reference satellites defined in `docs/features.md`: ISS, INSAT-3D, Cartosat-2A, GSAT-30, RISAT-2B, RESOURCESAT-2, GLONASS-M, Meridian, Elektro-L, Resurs-P 4.
- Q: How should clicking the filter buttons ("All", "Weather", "Navigation", "Active", "Country") filter this 10-satellite catalog? → A: Option A: Compound filtering (Row 1 category selection is single-select: "All" / "Weather" / "Navigation"; "Active" operates as an independent toggle to filter operational satellites; "Country" filters by operating nation: India, Russia, International).
- Q: When a satellite is selected and the camera focuses on it, should the camera lock and continuously track the moving satellite, or center once and allow free manual rotation? → A: Option A: Target-Centric Tracking (camera smoothly centers on the satellite and follows its real-time path, while permitting user drag to orbit around it and scroll to zoom).
- Q: How is the active vs. idle/inactive operational status of satellites determined? → A: Operational status MUST be derived dynamically from live tracking metadata (e.g., live SATCAT/ephemeris operational status code) and MUST NOT be hardcoded. Missing status renders strictly as "—".
- Q: Replacement of decayed satellite Kosmos 2542 and naming alignment? → A: Kosmos 2542 is replaced with currently active Russian Earth observation satellite Resurs-P 4 (NORAD 59371, COSPAR 2024-060A, active TLE). Cartosat-2 is renamed to Cartosat-2A everywhere to match active orbital tracking (NORAD 32783).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time 3D Globe & Satellite Observation (Priority: P1)

As an aerospace observer or mission monitor, I want to observe a clean 3D Earth with real satellites moving accurately along their current real-time orbital paths, so that I have an immediate, unencumbered visual overview of active orbital space.

**Why this priority**: The 3D globe visualization with continuous real-time satellite positions is the core identity and primary interface of the application. Everything else builds around this view.

**Independent Test**: Load the application; confirm that a 3D Earth globe slowly rotates against a charcoal background with zero intrusive UI chrome except a single square menu button at top-left. Confirm the 10 target satellites (ISS, INSAT-3D, Cartosat-2A, GSAT-30, RISAT-2B, RESOURCESAT-2, GLONASS-M, Meridian, Elektro-L, Resurs-P 4) appear as discrete points moving across real orbital trajectories calculated continuously from live data feeds. Users can click and drag anywhere on the globe to spin and inspect it from any angle.

**Acceptance Scenarios**:

1. **Given** the application opens in a desktop browser, **When** initial data loading completes, **Then** the primary viewport displays a slowly rotating 3D Earth surrounded by the 10 target satellites moving in real-time positions, with only a small square menu button visible at top-left.
2. **Given** satellites rendered on the globe, **When** observing movement over time, **Then** positions update continuously based on real tracking computations without canned looping or static hardcoded coordinates.
3. **Given** the 3D globe viewport, **When** the user clicks and drags anywhere on the globe, **Then** the globe smoothly rotates to allow inspection from any angle.
4. **Given** telemetry or positional feeds for a satellite have missing fields, **When** displayed, **Then** missing properties show strictly as "—" and never fabricated values.

---

### User Story 2 - Slide-In Mission Control Panel, Search & Filtering (Priority: P2)

As a satellite tracker, I want to open an instrument-style slide-in control panel to search the catalog and filter satellites by category or status, so that I can quickly locate specific spacecraft of interest.

**Why this priority**: Discoverability and catalog inspection allow users to find and select satellites from the tracked catalog.

**Independent Test**: Click the top-left menu button to slide in the control panel. Type a satellite name into the search bar or click filter buttons (All, Weather, Navigation, Active, Country); verify the list updates instantly and displays matching satellites with their live operational status and current altitude.

**Acceptance Scenarios**:

1. **Given** the globe view is active, **When** the user clicks the top-left square menu button, **Then** a control panel slides into view from the left edge with a crisp, fast transition, revealing the search input, category filters, and satellite lists matching the design mockup layout.
2. **Given** the control panel is open, **When** the user types a query (e.g., "ISS") into the search input, **Then** the list filters in real time to show only matching satellites.
3. **Given** filter categories ("All", "Weather", "Navigation") and toggles ("Active", "Country"), **When** clicked, **Then** the selected filters apply compound filtering logic and highlight with amber accents.
4. **Given** the satellite list, **When** rendering satellite rows, **Then** operational status (active vs inactive/idle) is dynamically evaluated from live data feeds (solid amber square for active, hollow square for inactive/idle), never hardcoded.
5. **Given** the control panel is open, **When** the user clicks the square close button ('X') at top-left, **Then** the panel slides out of view, returning the viewport to the clean globe display.

---

### User Story 3 - Satellite Selection, Telemetry HUD Card & Orbit Trail (Priority: P3)

As a user tracking a specific spacecraft, I want to select a satellite either by clicking its point on the globe or from the control panel list, so that the view focuses on it, draws its projected orbit trail, and displays a dense mission-control telemetry card.

**Why this priority**: Provides detailed orbital parameters and spatial context for individual satellites without cluttering the primary globe interface.

**Independent Test**: Click any satellite point on the globe or click a satellite name in the control panel list. Verify an amber reticle surrounds the satellite, a smooth camera focus centers on and tracks the satellite, its trailing orbit path appears in amber, and the bottom-right instrument telemetry card appears with live metrics.

**Acceptance Scenarios**:

1. **Given** satellites visible on the globe or listed in the panel, **When** a user clicks on a satellite, **Then** an amber square reticle frames the satellite, an amber orbit trail renders tracing the trajectory it has traveled across the globe, and the camera smoothly refocuses to center on the satellite.
2. **Given** a focused satellite, **When** the satellite moves in real time, **Then** the camera tracks with the satellite while permitting user click-and-drag to orbit around the target and scroll wheel to zoom.
3. **Given** a selected satellite, **When** its telemetry details are displayed, **Then** a bottom-right instrument card appears with square borders, presenting Status (derived live), Altitude, Speed, Orbit type, Position (lat/long coordinates), Launched year, and International Designator.
4. **Given** any metric in the telemetry card (such as Speed or Orbit classification) is unavailable from the data feed, **When** rendered, **Then** the value displays explicitly as "—".
5. **Given** a satellite is currently selected, **When** the user clicks outside or deselects, **Then** the selection reticle, orbit trail, and telemetry card dismiss cleanly.

---

### User Story 4 - Bookmarking & Saved Satellites (Priority: P4)

As a frequent observer, I want to bookmark specific satellites so that I can quickly access my preferred spacecraft under a dedicated "Saved" section.

**Why this priority**: Enhances user workflow by saving frequently monitored satellites across user sessions.

**Independent Test**: Star a satellite from the catalog list or click the "Saved" button inside its telemetry HUD card; confirm the satellite appears under the "Saved" group in the slide-in panel and persists across page reloads.

**Acceptance Scenarios**:

1. **Given** a satellite displayed in the list or in the telemetry card, **When** the user clicks the star icon or "Saved" button, **Then** the satellite is marked as bookmarked (indicated by a solid amber star and amber-highlighted button).
2. **Given** one or more bookmarked satellites (e.g. ISS bookmarked by default in mockup), **When** opening the control panel, **Then** a "Saved" group displays at the top of the list displaying the bookmarked satellites.
3. **Given** bookmarked satellites, **When** the browser session is reloaded, **Then** the bookmarks are restored from local browser storage.
4. **Given** a bookmarked satellite, **When** the user clicks the bookmark button again, **Then** the bookmark is removed and the item is unpinned from the "Saved" group.

---

### Edge Cases

- **Telemetry Feed Delay or Network Failure**: If live satellite orbital elements fail to fetch, the system falls back to cached/bundled baseline ephemerides for the 10 target satellites while continuing continuous real-time SGP4 propagation without freezing.
- **Incomplete Orbital Elements or Status**: If a satellite's live feed lacks specific parameters (e.g., missing velocity or operational status code), the system cleanly renders "—" without crashing or assuming a hardcoded state.
- **Rapid Navigation and Deselection**: Rapidly clicking between multiple satellites updates the reticle, orbit trail, and telemetry card synchronously without race conditions or orphaned orbit trails.
- **Window Resizing**: Resizing the desktop browser maintains 3D aspect ratio, globe centering, and panel docking without visual clipping or distortion.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render a 3D Earth globe as the primary viewport, rotating slowly by default and draggable from any angle.
- **FR-002**: System MUST retrieve live satellite tracking data (TLEs or orbital state vectors) from a live data source and continuously calculate satellite positions in real time for exactly the 10 target satellites defined in `docs/features.md`: ISS, INSAT-3D, Cartosat-2A, GSAT-30, RISAT-2B, RESOURCESAT-2, GLONASS-M, Meridian, Elektro-L, and Resurs-P 4.
- **FR-003**: System MUST NOT use canned looped animations, static coordinates, or hardcoded mock trajectories for satellite tracking.
- **FR-004**: System MUST derive satellite active/idle operational status dynamically from live tracking data feeds (SATCAT records) and MUST NOT hardcode operational status in application source code.
- **FR-005**: System MUST display any missing or unavailable telemetry attribute strictly as "—" (em dash).
- **FR-006**: System MUST provide a slide-in control panel accessible exclusively via a small square menu button at the top-left corner of the viewport.
- **FR-007**: System MUST maintain zero visible UI overlays on the default globe screen other than the top-left square menu button.
- **FR-008**: System MUST provide real-time search within the control panel filtering the 10 satellites by name or international designator.
- **FR-009**: System MUST provide compound categorical filtering within the control panel: Row 1 category selection ("All", "Weather", "Navigation") is single-select; "Active" functions as an independent toggle to filter out inactive spacecraft; "Country" filters by launching nation (India, Russia, International).
- **FR-010**: System MUST render the satellite list showing active status indicator (solid amber square for active, hollow square for inactive/idle), satellite name, current altitude, and bookmark action for each entry.
- **FR-011**: System MUST support selecting a satellite by clicking its point on the 3D globe or its list row in the control panel.
- **FR-012**: System MUST frame the selected satellite with an amber square reticle and smoothly focus the camera to track it while allowing user orbital rotation and zoom.
- **FR-013**: System MUST render the projected/traveled orbit trail of the selected satellite in amber along its computed trajectory.
- **FR-014**: System MUST display a bottom-right telemetry HUD card for the selected satellite containing: Name, Live Status, Altitude, Speed, Orbit classification, Position (latitude/longitude), Launch year, International Designator, and Bookmark toggle.
- **FR-015**: System MUST persist bookmarked satellites in local browser storage and display them in a dedicated "Saved" section at the top of the control panel list.
- **FR-016**: System MUST strictly adhere to the mission-control visual theme: charcoal background `#15171A`, panel background `#181B1D`, amber accent `#E8A33D`, off-white text `#E8E4D8`, muted text `#8E918B`, and hairline borders `#3A3E40`.
- **FR-017**: System MUST use `IBM Plex Mono` for numerical and telemetry data and `Schibsted Grotesk` for labels, titles, and UI instructions.
- **FR-018**: System MUST use strictly square corners (zero rounded cards) and hairline borders with no decorative gradients, glows, or glassmorphism.
- **FR-019**: System MUST animate only the globe rotation, real-time satellite motion, and the fast control panel slide transition; all other elements remain static.
- **FR-020**: System MUST display a placeholder entry point for "Describe what to track" below the search bar to prepare for Phase 2 AI discovery without implementing Phase 2 AI logic in the current release.

### Key Entities

- **Satellite**: Represents an orbital object in the 10-satellite fleet. Contains identifier, standard name, international designator (COSPAR ID), NORAD catalog number, operational status (dynamically evaluated from live data as Active, Inactive, or unknown), launch year, country/agency (India, Russia, International), and category tags (Weather, Navigation, Communication, Earth Observation, Space Station).
- **Orbital State & Telemetry**: Dynamic real-time calculations representing current latitude, longitude, altitude (km), orbital velocity (km/s), orbit type (LEO, GEO, MEO, HEO), and computed projected trajectory coordinates.
- **Bookmark**: Persistent record of user-saved satellites containing satellite identifier, display name, and timestamp saved.
- **Filter State**: Current user selection across search query, primary category ("All" | "Weather" | "Navigation"), active-only boolean toggle, and country filter.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Globe and real-time satellite rendering maintains 60 FPS on standard desktop hardware while continuously calculating real-time orbits for the 10 reference spacecraft.
- **SC-002**: Opening or closing the slide-in control panel completes in under 200 milliseconds with zero visible lag or stutter.
- **SC-003**: Search queries and category filter clicks filter the satellite catalog in under 16 milliseconds.
- **SC-004**: Selecting a satellite initiates camera reticle framing, trajectory rendering, and telemetry card presentation within 100 milliseconds.
- **SC-005**: 100% of telemetry fields with unavailable data render as "—" without displaying "NaN", "undefined", or blank white space.
- **SC-006**: Operational status is verified against live tracking feed records for 100% of rendered satellites; zero hardcoded operational statuses exist in the codebase.
- **SC-007**: Bookmarked satellites reliably reload from persistence across 100% of tested browser refresh cycles.
- **SC-008**: 100% compliance with defined design tokens (hex colors, fonts, hairline border widths, and square corners) matching the visual reference screenshots.

## Assumptions

- **Target Viewport**: The application is designed desktop-first; responsive mobile adaptations are explicitly sequenced for a subsequent milestone.
- **Tracking Data Source**: Live orbital parameters and operational status codes will be sourced from standard public satellite ephemerides / TLE / SATCAT sources (such as CelesTrak) with standard orbital propagation calculations.
- **Local Persistence**: User bookmarks are stored locally in the browser (`localStorage`) without requiring user account creation or backend database authentication for Phase 1.
- **Phase 2 Boundary**: The "Describe what to track" link serves as an inactive/scaffolded UI entry point in accordance with the reference design, deferring natural-language AI recommendation querying to Phase 2.
