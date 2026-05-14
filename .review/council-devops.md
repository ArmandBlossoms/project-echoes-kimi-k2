# Council — DevOps Verdict

**Status:** NEEDS-CHANGES

## Issues

### BLOCKER — OpenFreeMap vector tiles vs raster mismatch
(Confirms architect's finding.)
- **Fix:** either (a) Protomaps `pmtiles extract` to pull Wales-clipped `.pmtiles`, serve from `public/wales.pmtiles`, render via `protomaps-leaflet` or `maplibre-gl` inside Leaflet — OR (b) use a raster tile source (OSM Carto self-scraped via compliant tool) for the `{z}/{x}/{y}.png` path.

### BLOCKER — `bun run build` segfaults on Next.js 15
- **Reality:** `bun run build` has documented recurring segfault issues on Next.js 15+ across multiple Bun versions, in the build-finalization step.
- **Fix:** add `npm run build` (Node) as named fallback in pre-flight. CLAUDE.md mentions HMR fallback to npm dev; same fallback needs to apply to `build`.

### HIGH — Tile cache must be present pre-travel
- **Fix:** explicit callout in pre-flight: `public/tiles/` (or `public/wales.pmtiles`) **must be present on the demo laptop before travel**. The fetch script needs internet — may not be available at the venue. Currently only implicit via gitignore comment.

### MEDIUM — Cable / projector specifics
- **Quote:** "Adapter / HDMI cable for the projector input format confirmed" (single line)
- **Fix:** list specific cable for Krit's MacBook (USB-C to HDMI / DisplayPort / VGA). Pack night before. Note: if 4:3 projector, pre-test 1366×768.

### MEDIUM — Zustand persist middleware check
- **Fix:** explicit: filter store must NOT use Zustand `persist` middleware — would cause hard-refresh recovery to land in filtered state instead of clean opening. Document and verify.

### LOW — Cascade animation at 1366×768
- **Fix:** specifically test Framer Motion topic-click cascade at the 1366×768 fallback resolution — element dimensions can cause different reflow.

### LOW — Browser profile + version + extensions
- **Fix:** pre-flight: fresh browser profile or private window. Note Chrome/Firefox version. Disable extensions (some ad-blockers interfere with localhost).

## What's strong (don't change)
- Animation fallback architecture (`prefers-reduced-motion` + error boundary)
- DEMO DATA pill
- k-anonymity floor
- Two-tier voice-authoring strategy
- Recorded video backup with re-record-after-final-fixes
- Phase-gated commit discipline
- `bun run check:seed` integrity script
- `<WalesMap>` SSR-disable pattern
- Mobile fallback message
