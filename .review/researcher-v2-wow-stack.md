# Researcher: WOW Stack Verification

Verdicts on the upgraded map + visual stack (post-original-council, in response to user's WOW-ambition pivot).

## Summary

| Claim | Verdict | Notes |
|---|---|---|
| MapLibre GL JS + Protomaps PMTiles offline | TRUE | Canonical setup: `maplibregl.addProtocol('pmtiles', protocol.tile)` + `pmtiles://` URLs. `protomaps-themes-base` ships a `dark` flavor. |
| 3D buildings from PMTiles | TRUE-WITH-CAVEATS | Layer is `building` (singular). `height` + `min_height` attributes exist via OpenMapTiles schema. **Welsh OSM coverage is patchy** — spot-check Cardiff/Swansea/Newport/Wrexham buildings with a tile inspector before committing. |
| deck.gl HeatmapLayer on MapLibre | TRUE | `@deck.gl/mapbox` + `MapboxOverlay` is the canonical 2026 pattern. Syncs pitch/bearing. WebGL2 (standard). |
| View Transitions API in 2026 | TRUE-WITH-CAVEATS | Same-document (SPA): Chrome 111+, Safari 18+, Firefox 144+ — widely supported. Cross-document (MPA): Chrome 126+, Safari 18.2+, Firefox 144 NOT YET. Use SPA pattern; feature-detect with `'startViewTransition' in document`. |
| react-three-fiber for hero | TRUE-WITH-CAVEATS | **Must use R3F v9** (not v8) for React 19 + Next.js 15. ~150-200KB gzipped. SSR-disabled via `next/dynamic`. |

## Plan adjustments

1. **Building layer name**: use `building` (singular), not `buildings`. Reference attribute via `["get", "height"]`.
2. **Verify building coverage before phase 7 starts**: a quick `pmtiles convert` + inspector check against Cardiff/Swansea/Newport/Wrexham. If coverage is too sparse, fall back to abstract extrusion using region centroids instead.
3. **View Transitions**: target SPA-style only (App Router internal navigation). Feature-detect; fallback is the existing Framer Motion `layoutId` path.
4. **R3F**: pin to `@react-three/fiber@^9` and `@react-three/drei@latest`. Document in `package.json`.
