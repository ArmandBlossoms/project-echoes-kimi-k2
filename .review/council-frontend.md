# Council — Frontend Verdict

**Status:** NEEDS-CHANGES

## Issues

### BLOCKER — Tile stack contradiction (confirms architect + devops)
- OpenFreeMap publishes vector tiles only (MVT/PBF), not raster `{z}/{x}/{y}.png`.
- "dark style" does NOT exist in OpenFreeMap's catalogue — only `liberty / positron / bright`.
- **Fix:** pick one concrete stack and update phase 5 and phase 7:
  - (a) drop react-leaflet, use `react-map-gl/maplibre` with OpenFreeMap style JSON referencing local tile path
  - (b) keep react-leaflet but switch to `protomaps-leaflet` + a single offline Wales `.pmtiles` file
  - (c) keep react-leaflet `TileLayer` with a raster-capable dark provider (e.g. Stadia Maps "Alidade Smooth Dark", verify bulk-offline TOS)

### HIGH — Framer Motion `layoutId` misspecified
- **Fix:** rewrite to "wrap each panel in `<motion.div layout>` inside a single `<LayoutGroup>` — synchronises layout recalculations across panels without requiring shared identity. Reserve `layoutId` for the topic pill/label that genuinely travels between TopicBarList and the drill-in page header."

### HIGH — k-anon assertions not pinned to actual demo paths
- **Fix:** add named test fixture to `check:seed` asserting exact filter combinations used in the 6-min demo script: minimum 16-18 + residential + education (minute 4:30), housing + North Wales (minute 2:00). Generic "all cells ≥5" doesn't prevent those specific on-stage paths hitting "Too few voices".

### MEDIUM — shadcn init Tailwind 4 gotcha
- **Fix:** add to phase 3 instructions: "When shadcn init asks for Tailwind config path, leave it blank — Tailwind 4 uses CSS-first config; not leaving it blank causes 'no config found' error and LLM may downgrade to Tailwind 3."

### MEDIUM — Missing `<FilterChip>` + Clear All
- **Fix:** add `<FilterChip>` (active filter pill with × remove) and a "Clear all" button as named components. Specify that Zustand filter store exposes a `clearAll()` action.

### MEDIUM — Skeleton styles undefined per component
- **Fix:** specify each: donut → circular grey shimmer ring; feed → 3 stacked card-height shimmer bars; map → full-tile grey fill with pulsing opacity; trend line → flat horizontal shimmer line. Without this, each component gets a different skeleton and polish collapses.

### MEDIUM — Map reveal timing too fast
- **Quote:** "A 7-step staggered reveal (~120ms per region)"
- **Fix:** 180–220ms per region. 120ms × 7 = 840ms total reads as flicker, not reveal. "Country waking up" needs each step to register before next fires.

### MEDIUM — "Live · Today" contradicts DEMO DATA pill
- **Fix:** rename to "6-month composite · Dec 2025 – May 2026" (or remove). A board member reading both pills will notice the contradiction.

### LOW — Counter implementation specifics
- **Fix:** "Use Framer Motion's `useMotionValue` + `animate()` + `Math.round` transform, not `setInterval` — the latter produces frame-rate-dependent jank; the former is GPU-synced and stops cleanly."

## What's strong (don't change)
- Critical-path dependency table with fallback tiers
- k-anonymity floor + two-tier voice authenticity workflow
- Git commit per phase
- Network tab offline verification
- 6-minute arc pacing (45/75/90/60/60/30s breakdown lands)
- `DemoDataBadge` rule + `.private/` gitignored anchor file
