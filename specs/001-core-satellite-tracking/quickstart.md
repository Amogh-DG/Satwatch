# Quickstart & Verification Guide: Core Satellite Tracking

**Feature**: `001-core-satellite-tracking`  
**Date**: 2026-11-07  
**Status**: Ready

This guide outlines prerequisites, setup commands, execution procedures, and verification test cases to validate the feature end-to-end.

---

## 1. Prerequisites

- **Node.js**: v20+ (tested with v24.19.0)
- **Package Manager**: npm (v10+)
- **Browser**: Modern desktop browser (Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari) with WebGL enabled.

---

## 2. Setup & Installation

From the project root:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The Vite dev server will start at `http://localhost:5173`. Open this URL in your desktop browser.

---

## 3. End-to-End Verification Scenarios

### Scenario A: Ambient Globe & Clean Default View
1. Open `http://localhost:5173`.
2. **Verify**:
   - The background is charcoal `#15171A`.
   - A minimalist 3D wireframe Earth globe is slowly rotating in the center with latitude parallels and longitude meridians.
   - Satellites appear as square amber dots (`#E8A33D`) moving across the globe in real time.
   - The ONLY visible UI element is a small square button at the top-left with a hamburger icon and hairline border.
   - Zero gradients, glowing atmospheres, or rounded corners are visible.

### Scenario B: Draggable Globe Inspection
1. Click and drag anywhere on the globe.
2. **Verify**:
   - The globe smoothly rotates to follow your mouse drag, allowing inspection from any angle.
   - Releasing the mouse resumes smooth slow ambient rotation (or stays positioned at the user angle).

### Scenario C: Slide-In Control Panel, Search & Filter
1. Click the top-left square menu button.
2. **Verify**:
   - A dark panel (`#181B1D`) slides in from the left within 200ms.
   - The top-left button transforms into a square close 'X' button.
   - The search input displays "Search satellites".
   - Below search is the amber link "Describe what to track".
   - Category buttons (`All`, `Weather`, `Navigation`) and criteria buttons (`Active`, `Country`) are present with hairline borders.
   - The satellite list displays the 10 target satellites (`ISS`, `INSAT-3D`, `Cartosat-2A`, `GSAT-30`, `RISAT-2B`, `RESOURCESAT-2`, `GLONASS-M`, `Meridian`, `Elektro-L`, `Resurs-P 4`) with live status squares, names, altitudes (`km` or `—`), and bookmark stars.
3. Type `INSAT` in the search bar:
   - Only `INSAT-3D` is visible in the list.
4. Clear search and click `Weather`:
   - Only weather satellites (`INSAT-3D`, `Elektro-L`) are displayed.
5. Click `Country` $\rightarrow$ `Russia`:
   - Russian satellites (`GLONASS-M`, `Meridian`, `Elektro-L`, `Resurs-P 4`) are displayed.

### Scenario D: Satellite Focus, Orbit Trail & Telemetry HUD Card
1. Click `ISS` in the list (or click the ISS amber dot on the globe).
2. **Verify**:
   - An amber square reticle frames the ISS.
   - An amber orbit trail curves along the trajectory traveled across the globe.
   - The camera smoothly focuses on the ISS and tracks with it.
   - A telemetry card appears at bottom-right with:
     - Name: `ISS`
     - Status: `Active` (derived from live SATCAT data)
     - Altitude: live numeric value + `km`
     - Speed: live numeric value + `km/s`
     - Orbit: `LEO`
     - Position: live `lat, lon`
     - Launched: `1998`
     - Designator: `1998-067A`
     - `Saved` toggle button.
3. Click anywhere on the empty background or click the selected satellite again:
   - The reticle, trail, and HUD card dismiss cleanly.

### Scenario E: Bookmarking & Persistence
1. Click the star icon next to `INSAT-3D` in the list (or the `Saved` button on its HUD card).
2. **Verify**:
   - The star turns solid amber.
   - `INSAT-3D` appears under the "Saved" header section at the top of the panel.
3. Refresh the browser page (`F5`).
4. Re-open the control panel:
   - **Verify**: `INSAT-3D` remains under the "Saved" section.
