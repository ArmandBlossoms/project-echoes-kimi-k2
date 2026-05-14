# Consolidated Findings — Round 2 (WOW upgrade + VFCC brand integration)

The plan was upgraded from the original sleek-dashboard scope to deliver Apple-Maps-quality visuals (MapLibre + 3D buildings + deck.gl heatmap, GSAP intro, R3F hero, View Transitions, Bento). The VFCC Design System was also folded in as the primary brand spec.

A focused 3-agent council pass (architect + frontend + devops) reviewed the WOW upgrade. All returned NEEDS-CHANGES with concrete issues.

## Issues + fix status

### Architect (NEEDS-CHANGES, 1 BLOCKER · 2 HIGH · 2 MEDIUM · 2 LOW)

| # | Severity | Issue | Fix status |
|---|---|---|---|
| A1 | BLOCKER | "Confirmed decisions" table still listed `react-leaflet` + `protomaps-leaflet` | ✅ Rewrote both rows to MapLibre + pmtiles + protomaps-themes-base + @deck.gl/mapbox |
| A2 | HIGH | Heatmap data shape gap — voices have region only, not coords; centroid stacking = 7 blobs not heat surface | ✅ Added deterministic jitter spec (`lib/heatmap.ts`) with seed = voiceId, bounded ±0.15° lat / ±0.22° lon |
| A3 | HIGH | Component listing implied independent imports of `<SentimentHeatmap>` / `<RegionMarkers>` / `<MapControls>` | ✅ Added explicit rule that these compose only inside `<WalesMap>`; `<WalesMapWrapper>` is the single SSR-disabled entry |
| A4 | MEDIUM | Phase 7 bundled a mid-phase decision point (3D coverage gate) | ✅ Split into 7a (map base + coverage gate + written decision in `.review/building-coverage.md`) and 7b (overlays + interactions) |
| A5 | MEDIUM | View Transitions wiring duplicated across phases 9 + 10 | ✅ Owned entirely by phase 9 now; phase 10 explicitly excludes View Transitions |
| A6 | LOW | Bento grid geometry unspecified | ✅ Added explicit `grid-template-areas` |
| A7 | LOW | HeroSculpture spec too vague | ✅ Specified primitive (IcosahedronGeometry), material (MeshPhysicalMaterial), lighting (warm fill + cool rim + ambient), animation parameters, mapping formulas |

### Frontend (NEEDS-CHANGES, 3 HIGH · 3 MEDIUM · 1 LOW)

| # | Severity | Issue | Fix status |
|---|---|---|---|
| F1 | HIGH | BentoDashboard grid not specified | ✅ Same fix as A6 — `grid-template-areas`, fr units |
| F2 | HIGH | HeroSculpture shape/material not specified | ✅ Same fix as A7 — full Three.js + material + lighting spec |
| F3 | HIGH | SentimentHeatmap colorRange not specified | ✅ Added deck.gl HeatmapLayer params: radiusPixels, intensity, threshold, colorRange (VFCC tokens), getWeight |
| F4 | MEDIUM | 3D building extrusion lighting not specified | ✅ Added MapLibre `setLight()` (warm anchor) + `fill-extrusion-color` `#c8b59e` + opacity |
| F5 | MEDIUM | GSAP HeroIntroTimeline easings not specified | ✅ Per-beat duration + easing pinned (power3.out, expo.out, back.out(2)) |
| F6 | MEDIUM | View Transitions morph scope not specified | ✅ Named the 3 elements that carry view-transition-name (chip, donut band, header background) |
| F7 | LOW | Bento entrance easing not specified | ✅ Custom cubic-bezier `[0.22, 1, 0.36, 1]` pinned |

### DevOps (NEEDS-CHANGES, 1 CRITICAL · 1 MEDIUM · 2 LOW)

| # | Severity | Issue | Fix status |
|---|---|---|---|
| D1 | CRITICAL | `protomaps-themes-base` fetches glyph PBFs + sprites from CDN at runtime — offline guarantee silently broken | ✅ Added `bun run fetch-assets` script (downloads glyphs + sprites to `public/basemaps-assets/`, patches style JSON). Added Critical Rule 19 in CLAUDE.md. Added pre-flight assertion that labels render with wifi off. |
| D2 | MEDIUM | Demo laptop GPU spec not pinned | ✅ Added critical-path row for laptop spec; verification gated at end of phase 10 (not only pre-flight) |
| D3 | LOW | No runtime performance escape hatch | ✅ Added `?perf=safe` query-param (skips R3F, pitch 0°, IconLayer instead of HeatmapLayer); smoke-tested |
| D4 | LOW | Tile inspector command not specified | ✅ Spec'd `npx pmtiles serve` + Protomaps PMTiles inspector URL |

### VFCC Design System integration (proactive, not flagged by council)

| # | Change | Fix status |
|---|---|---|
| V1 | Font swap: Geist → Instrument Sans + Shrikhand + JetBrains Mono | ✅ Via `next/font/google` (self-hosted, offline) |
| V2 | Design tokens from `colors_and_type.css` copied to `src/styles/vfcc-tokens.css` | ✅ Spec'd in scaffolding phase 3 |
| V3 | shadcn re-themed against VFCC semantic tokens | ✅ Spec'd in tech stack |
| V4 | Brand motif (2px ink border + 4px offset shadow) on cards/buttons/pills | ✅ Locked into Visual & interaction design + CLAUDE.md Rule 21 |
| V5 | Anti-patterns (no gradients, no glassmorphism, no #000/#fff, no fake illustrations) | ✅ CLAUDE.md Rule 23 |
| V6 | Tone rules ("care-experienced children and young people" etc.) | ✅ CLAUDE.md Rule 22 |
| V7 | Logo top-left, 96px min, 'V'-width clear zone | ✅ Visual & interaction design |
| V8 | VFCC mission verbatim on About page | ✅ AboutPageBody spec |

## What's open

All council issues fixed in-line. The VFCC brand integration is comprehensive but was added in parallel with the council review — a final focused frontend pass is warranted to verify it lands cleanly.
