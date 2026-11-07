<!--
SYNC IMPACT REPORT
- Version Change: Uninitialized -> 1.0.0
- Added Sections:
  * Core Principles (1. Live Data Only, 2. Globe-First Interface, 3. Design Fidelity, 4. Mission-Control Aesthetic & Style Rules, 5. Simplicity & Phased Scope, 6. Desktop-First Delivery)
  * Additional Technical Constraints & Standards
  * Development Workflow & Quality Gates
  * Governance
- Modified Principles: N/A (Initial ratification)
- Removed Sections: N/A
- Deferred Items / Follow-ups:
  * design/ folder screenshots referenced in Principle 3 to be verified/added when available.
  * Phase 2 features (AI recommendation search) deferred until Phase 1 core functionality is validated.
-->

# Satellite Tracker Constitution

## Core Principles

### 1. Live Data Only
Satellite positions MUST originate from a real tracking data source (such as live TLEs / orbital propagation) and MUST be continuously recalculated in real time. Hardcoded satellite coordinates, mocked orbital paths, and looped canned animations are strictly prohibited in runtime tracking modes. If data for a satellite or telemetry property is unavailable, it MUST be displayed explicitly as "—" (em dash) and NEVER as a fabricated, assumed, or placeholder value.

### 2. Globe-First Interface
The default and primary view MUST be a slowly rotating 3D Earth globe with satellites rendered and moving in real time. The default globe view MUST be completely clean and free of visible UI overlays, with the sole exception of a single, small square menu button positioned at top left. Telemetry displays, search, inspection data, filters, and all auxiliary controls MUST live inside a slide-in control panel activated via this button.

### 3. Design Fidelity
Visual implementation MUST strictly adhere to the reference mockups and screenshots in the `design/` directory as the definitive visual authority. Layouts, element proportions, data densities, and interaction mechanics MUST align with these visual assets.

### 4. Mission-Control Aesthetic & Style Rules
The interface MUST reflect a mission-control instrument appearance governed by the following strict rules:
- **Color Palette**: Background MUST use charcoal `#15171A`; control panel MUST use `#181B1D`; accents MUST use amber `#E8A33D`; primary data and body text MUST use off-white `#E8E4D8`; secondary text MUST use muted `#8E918B`; structural borders MUST use hairline `#3A3E40`.
- **Typography**: MUST use `IBM Plex Mono` for all data displays (names, altitudes, coordinates, metrics) and `Schibsted Grotesk` for labels, headers, and UI copy.
- **Look**: Instruments style with strictly square corners (zero rounded cards or elements), crisp hairline borders, and dense informational tables. Gradients, glow effects, and glassmorphism are strictly prohibited.
- **Motion**: Globe rotation and satellite orbital motion are the ONLY continuous animations permitted. The control panel MUST use a simple, fast slide transition. No other elements or transitions shall animate.

### 5. Simplicity & Phased Scope
Development MUST follow a disciplined, phased roadmap.
- **Phase 1 (Core Scope)**: Delivery MUST focus exclusively on core features: 3D globe rendering, slide-in control panel, satellite search, list view, categorical filters, bookmarks, click-to-focus camera targeting, and orbital trail rendering.
- **Phase 2 (Deferred Scope)**: AI recommendation search and secondary intelligence enhancements are explicitly deferred and MUST NOT be incorporated into the initial build.

### 6. Desktop-First Delivery
System architecture, responsive behavior, and interface layouts MUST be designed and implemented desktop-first. Mobile and alternate viewport optimizations MUST only be addressed after the desktop version is complete, stable, and verified against design standards.

## Additional Technical Constraints & Standards
- Real-time orbital propagation and rendering calculations MUST run efficiently to preserve smooth globe interaction on standard desktop hardware.
- Real-time positional updates MUST be decoupled from UI control state to prevent unnecessary DOM re-renders and maintain responsiveness.

## Development Workflow & Quality Gates
- All components and views MUST undergo verification against the style rules and design reference assets before being considered complete.
- Telemetry interfaces MUST be validated against missing or intermittent data feeds to ensure the "—" null-state contract is reliably preserved.

## Governance
This constitution is the supreme architectural and visual guideline for Satellite Tracker and supersedes contradictory ad-hoc conventions. All pull requests, feature specifications, and implementations MUST adhere to these principles. Amendments require formal documentation, version increment, and rationale review.

**Version**: 1.0.0 | **Ratified**: 2026-11-07 | **Last Amended**: 2026-11-07
