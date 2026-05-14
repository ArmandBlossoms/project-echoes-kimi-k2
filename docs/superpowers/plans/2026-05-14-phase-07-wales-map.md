# Project Echoes — Wales Map Implementation Plan (Phase 7: 7a + 7b)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the dashboard centrepiece — a MapLibre GL JS map of Wales rendering `public/wales.pmtiles` offline with the patched `protomaps-themes-base` dark style, a 3D building extrusion layer (real OSM heights via Path A, or centroid-extrusion via Path B), and the three deck.gl overlays (`<SentimentHeatmap>`, `<RegionMarkers>`, `<MapControls>`) — all behind a single `next/dynamic ssr:false` boundary.

**Architecture:** One client-only entry point — `<WalesMapWrapper>` — wraps `<WalesMap>` with `next/dynamic({ ssr: false })`. `<WalesMap>` owns the MapLibre instance, registers the `pmtiles://` protocol handler, loads the patched local style JSON, sets warm-light building extrusion, and composes the three deck.gl overlays via a single `MapboxOverlay`. Per-voice heatmap coordinates are derived once at load time by `src/lib/heatmap.ts` (deterministic seeded jitter inside the Wales bounding box) so the heat surface reads continuous, not as seven stacked blobs. The building-extrusion path (A real / B centroid) is decided by a manual `pmtiles serve` spot-check committed to `.review/building-coverage.md` BEFORE any extrusion code lands.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Bun · `maplibre-gl` · `pmtiles` · `protomaps-themes-base` · `@deck.gl/mapbox` (`MapboxOverlay`) · `@deck.gl/aggregation-layers` (`HeatmapLayer`) · `@deck.gl/layers` (`IconLayer`) · VFCC Design System tokens.

**Scope boundary:** This plan covers PLAN.md Phase 7a + 7b only. The Bento composition (Phase 10), the Zustand filter store wiring (Phase 8), the topic-page filtered view (Phase 9), the heatmap fade-in + 3D-buildings rise animations (Phase 10), and the `?perf=safe` escape hatch (Phase 12) are explicitly out of scope.

**Source of truth:** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/PLAN.md` + `CLAUDE.md`. Re-read the Map stack tech-stack section, the `<WalesMap>` / `<SentimentHeatmap>` / `<RegionMarkers>` / `<MapControls>` / `<WalesMapWrapper>` component specs, the "Heatmap data shape" subsection, and Critical Rules 9, 10, 14, 17, 18, 19, 21, 22 before starting.

**Working directory:** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/`

**Phase prerequisites:**
- **Phase 3** (scaffolding) — Next 15 + Bun + Tailwind 4 + shadcn + VFCC tokens shipped at `phase-3-scaffold`.
- **Phase 5** (offline tiles) — `public/wales.pmtiles`, `public/basemaps-assets/`, `public/basemaps-style.json` all present. If missing, stop and run the Phase 5 plan first (Task 1 below verifies this).
- **Phase 6** (core components) — `src/seed/types.ts` (with `Voice`, `Region`, `RegionSlug` exports) and a small fixture at `src/seed/__fixtures__/voices.sample.ts` exist for rendering.

---

## File Structure (created / modified in this plan)

```
src/
  components/
    wales-map.tsx                       # MapLibre client component (uses 'use client'); owns the deck.gl overlay
    wales-map-wrapper.tsx               # 'use client' + next/dynamic ssr:false boundary around <WalesMap>
    sentiment-heatmap.ts                # exports buildSentimentHeatmapLayer(voices) -> deck.gl HeatmapLayer
    region-markers.ts                   # exports buildRegionMarkersLayer(regions, onClick, revealedSlugs) -> IconLayer
    map-controls.tsx                    # pitch-reset / rotate-reset / fly-to-region buttons (brand-motif chrome)
  lib/
    heatmap.ts                          # hashString, seedToFloat, jitter, voicesToCoords pure functions
    heatmap.test.ts                     # bun test — determinism + Wales-bbox + spread
  seed/
    regions.ts                          # the 7 region centroids typed against Region
  app/
    page.tsx                            # landing page renders <WalesMapWrapper> for verification (revertable later)
public/
  pin-marker.svg                        # small VFCC-styled pin sprite for the IconLayer
.review/
  building-coverage.md                  # Path A vs Path B decision document — Phase 7a GATE
```

**Out of scope for this plan** (handled in later phases, called out so the engineer doesn't drift):

- Bento-grid composition (Phase 10).
- Heatmap fade-in animation + 3D buildings rising from height 0 → real height (Phase 10 — wow moment 3).
- `?perf=safe` query-param escape hatch (Phase 12 polish).
- Filter store wiring — region click is exposed via an `onRegionClick` callback prop in this plan, but the Zustand `filters` store is wired in Phase 8.
- Topic-page filtered view (Phase 9).
- Playwright smoke for the map container (Phase 13).

---

## Pre-flight (do once before Task 1)

- [ ] Working directory and Phase 3 tag are correct:

  ```bash
  cd "/Users/krit/Desktop/04 Web & Development/Project-Echoes"
  git tag --list | grep phase-3-scaffold
  ```

  Expected: `phase-3-scaffold` listed. If not, run the Phase 3 plan first.

- [ ] Wifi ON for this phase — `bun add` and the first production build need internet.

---

## Task 1: Pre-flight — verify Phase 5 outputs exist

**Files:** none modified — verification only.

- [ ] **Step 1: Verify the offline tile + assets are in place**

  ```bash
  test -f "public/wales.pmtiles" && echo "wales.pmtiles OK" || echo "wales.pmtiles MISSING"
  test -d "public/basemaps-assets" && echo "basemaps-assets dir OK" || echo "basemaps-assets dir MISSING"
  test -f "public/basemaps-style.json" && echo "style JSON OK" || echo "style JSON MISSING"
  ```

  Expected: all three `OK` lines print.

- [ ] **Step 2: If any is missing, STOP and run Phase 5 plan first**

  If any line above prints `MISSING`, do not proceed. The Phase 5 plan (`docs/superpowers/plans/2026-05-14-phase-05-offline-tiles.md`) produces these. Pause and run that plan, then restart this one.

- [ ] **Step 3: Verify the style JSON points at local `/basemaps-assets/` paths, not the CDN**

  ```bash
  grep -E '"(glyphs|sprite)"' public/basemaps-style.json
  ```

  Expected: both `glyphs` and `sprite` values start with `"/basemaps-assets/..."`. If either starts with `"https://protomaps.github.io/..."`, the patching step from Phase 5 was missed — fix in Phase 5 plan before continuing (Critical Rule 19).

- [ ] **Step 4: Verify Phase 6 seed types exist**

  ```bash
  test -f "src/seed/types.ts" && echo "types OK" || echo "types MISSING"
  test -f "src/seed/__fixtures__/voices.sample.ts" && echo "fixture OK" || echo "fixture MISSING"
  ```

  Expected: both `OK`. If either is missing, the Phase 6 plan must produce them before this plan can run.

- [ ] **Step 5: Verify the fixture exports a small voice array against the expected shape**

  ```bash
  grep -E '^export const (sampleVoices|VOICES_SAMPLE)' src/seed/__fixtures__/voices.sample.ts
  ```

  Expected: at least one matching export. Adjust the import names in later tasks to whatever Phase 6 actually exports (e.g., `sampleVoices`).

- [ ] **Step 6: No commit (verification-only task).**

---

## Task 2: Install Phase 7 dependencies

**Files:**
- Modify: `package.json`, `bun.lockb`

- [ ] **Step 1: Install MapLibre + pmtiles + protomaps-themes-base**

  ```bash
  bun add maplibre-gl pmtiles protomaps-themes-base
  ```

  Expected: all three resolve. `maplibre-gl` ≥ 4.x; `pmtiles` ≥ 3.x; `protomaps-themes-base` ≥ 4.x.

- [ ] **Step 2: Install the deck.gl trio used by the overlays**

  ```bash
  bun add @deck.gl/core @deck.gl/mapbox @deck.gl/layers @deck.gl/aggregation-layers
  ```

  Expected: all four resolve. The deck.gl mono-versioned modules must agree — if `bun` resolves mixed versions, pin them all to the same minor with `bun add @deck.gl/core@^9 @deck.gl/mapbox@^9 @deck.gl/layers@^9 @deck.gl/aggregation-layers@^9`.

- [ ] **Step 3: Install `@types/geojson` for the centroid-extrusion fallback path types**

  ```bash
  bun add -d @types/geojson
  ```

  (Used in Task 13 if Path B is chosen.)

- [ ] **Step 4: Verify the install didn't break the existing build**

  ```bash
  bun run typecheck
  bun run lint
  ```

  Expected: both exit 0.

- [ ] **Step 5: Commit**

  ```bash
  git add package.json bun.lockb
  git commit -m "chore(deps): add maplibre-gl + pmtiles + protomaps-themes-base + deck.gl trio for phase 7"
  ```

---

## Task 3: Author `src/seed/regions.ts` — the 7 region centroids

PLAN.md regions map to NHS Wales health boards. The centroids below are coarse — they sit on the main population centre of each board area, far enough from the coast that jittered heatmap points stay on land. The `Region` type is imported from `src/seed/types.ts` (Phase 6 output).

**Files:**
- Create: `src/seed/regions.ts`

- [ ] **Step 1: Create the regions file**

  ```ts
  // src/seed/regions.ts
  import type { Region } from "./types";

  /**
   * 7 NHS Wales health-board regions, with centroids picked to sit on each board's
   * main population centre. Coordinates are [lat, lon] in WGS84.
   *
   * Used by:
   *  - <RegionMarkers> deck.gl IconLayer for the per-region accent markers
   *  - <MapControls> fly-to-region action
   *  - src/lib/heatmap.ts jitter() — every voice's _coords are derived from its region's centroid
   */
  export const REGIONS: readonly Region[] = [
    { slug: "cardiff-vale",       name: "Cardiff & Vale",       lat: 51.4816, lon: -3.1791 },
    { slug: "swansea-bay",        name: "Swansea Bay",          lat: 51.6214, lon: -3.9436 },
    { slug: "cwm-taf-morgannwg",  name: "Cwm Taf Morgannwg",    lat: 51.6486, lon: -3.3700 },
    { slug: "gwent",              name: "Gwent",                lat: 51.5842, lon: -3.0091 },
    { slug: "west-wales",         name: "West Wales",           lat: 51.8800, lon: -4.3100 },
    { slug: "powys",              name: "Powys",                lat: 52.3000, lon: -3.4000 },
    { slug: "north-wales",        name: "North Wales",          lat: 53.1800, lon: -3.4800 },
  ];

  export const REGIONS_BY_SLUG: Readonly<Record<Region["slug"], Region>> = Object.freeze(
    Object.fromEntries(REGIONS.map((r) => [r.slug, r])) as Record<Region["slug"], Region>,
  );
  ```

  Notes:
  - The 7 slugs MUST match PLAN.md's `RegionSlug` enum exactly: `cardiff-vale`, `swansea-bay`, `cwm-taf-morgannwg`, `gwent`, `west-wales`, `powys`, `north-wales`. If TS complains, the `Region` type from `src/seed/types.ts` is missing a slug — fix Phase 6 output, not this file.
  - These centroids are inside the Wales bounding box `[-5.50, 51.30, -2.60, 53.50]` so the jittered points (±0.15° N/S, ±0.22° E/W) stay over land.

- [ ] **Step 2: Typecheck**

  ```bash
  bun run typecheck
  ```

  Expected: exit 0.

- [ ] **Step 3: Lint**

  ```bash
  bun run lint
  ```

  Expected: exit 0.

- [ ] **Step 4: Commit**

  ```bash
  git add src/seed/regions.ts
  git commit -m "feat(seed): add 7 NHS-Wales health-board region centroids (typed against Region)"
  ```

---

## Task 4: Write failing tests for `src/lib/heatmap.ts`

TDD pass 1 — write the test file with skeletons for `hashString`, `seedToFloat`, `jitter`, `voicesToCoords`. Tests will fail because the implementations don't exist yet.

**Files:**
- Create: `src/lib/heatmap.ts` (empty skeleton — exports stub functions that throw)
- Create: `src/lib/heatmap.test.ts`

- [ ] **Step 1: Create the skeleton lib file (so imports resolve, but every call throws)**

  ```ts
  // src/lib/heatmap.ts
  import type { Region, Voice } from "@/seed/types";

  /**
   * Heatmap geometry helpers — pure, deterministic, no DOM, no MapLibre, no deck.gl.
   *
   * Voices carry a region slug but no coordinates. To render a continuous heat surface
   * (not 7 stacked blobs on the centroids), every voice gets a deterministic jittered
   * coord inside its region's bounding-ish area, derived from a hash of voice.id.
   *
   * The Wales bounding box `[-5.50, 51.30, -2.60, 53.50]` (W, S, E, N) is enforced by
   * the jitter amplitudes — any voice with a region centroid inside the bbox stays
   * inside the bbox after jittering.
   */

  export function hashString(_input: string): number {
    throw new Error("hashString: not implemented");
  }

  export function seedToFloat(_seed: number, _channel: number): number {
    throw new Error("seedToFloat: not implemented");
  }

  export function jitter(_voiceId: string, _regionLat: number, _regionLon: number): [number, number] {
    throw new Error("jitter: not implemented");
  }

  export type VoiceWithCoords = Voice & { readonly _coords: readonly [number, number] };

  export function voicesToCoords(
    _voices: readonly Voice[],
    _regions: readonly Region[],
  ): readonly VoiceWithCoords[] {
    throw new Error("voicesToCoords: not implemented");
  }

  export const WALES_BBOX = {
    west: -5.5,
    south: 51.3,
    east: -2.6,
    north: 53.5,
  } as const;
  ```

- [ ] **Step 2: Create the test file**

  ```ts
  // src/lib/heatmap.test.ts
  import { describe, expect, test } from "bun:test";
  import {
    WALES_BBOX,
    hashString,
    jitter,
    seedToFloat,
    voicesToCoords,
  } from "./heatmap";
  import type { Region, Voice } from "@/seed/types";

  const SAMPLE_REGION: Region = {
    slug: "cardiff-vale",
    name: "Cardiff & Vale",
    lat: 51.4816,
    lon: -3.1791,
  };

  describe("hashString", () => {
    test("is deterministic — same input yields same output", () => {
      expect(hashString("voice-001")).toBe(hashString("voice-001"));
      expect(hashString("")).toBe(hashString(""));
    });

    test("different inputs yield different outputs (across 1000 voice ids)", () => {
      const seen = new Set<number>();
      for (let i = 0; i < 1000; i += 1) {
        seen.add(hashString(`voice-${i.toString().padStart(4, "0")}`));
      }
      // Allow ≤ 5 collisions over 1000 inputs — vanishingly unlikely for FNV-1a 32-bit.
      expect(seen.size).toBeGreaterThanOrEqual(995);
    });
  });

  describe("seedToFloat", () => {
    test("returns a value in [0, 1)", () => {
      for (let i = 0; i < 1000; i += 1) {
        const seed = hashString(`v-${i}`);
        for (let channel = 0; channel < 3; channel += 1) {
          const value = seedToFloat(seed, channel);
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThan(1);
        }
      }
    });

    test("different channels yield different values for the same seed", () => {
      const seed = hashString("voice-001");
      expect(seedToFloat(seed, 0)).not.toBe(seedToFloat(seed, 1));
    });

    test("is deterministic for a given (seed, channel)", () => {
      const seed = hashString("voice-001");
      expect(seedToFloat(seed, 0)).toBe(seedToFloat(seed, 0));
    });
  });

  describe("jitter", () => {
    test("returns [lon, lat] (NOT [lat, lon]) — deck.gl convention", () => {
      const [lon, lat] = jitter("voice-001", SAMPLE_REGION.lat, SAMPLE_REGION.lon);
      // Cardiff sits at lon -3.18, lat 51.48 → lon should be roughly -3, lat roughly 51.
      expect(lon).toBeLessThan(0);
      expect(lat).toBeGreaterThan(0);
    });

    test("is deterministic — same voiceId + centroid yields same coords", () => {
      const a = jitter("voice-001", SAMPLE_REGION.lat, SAMPLE_REGION.lon);
      const b = jitter("voice-001", SAMPLE_REGION.lat, SAMPLE_REGION.lon);
      expect(a[0]).toBe(b[0]);
      expect(a[1]).toBe(b[1]);
    });

    test("bounded — every jittered coord (across 1000 voices, 7 regions) lies inside Wales bbox", () => {
      const regions: Array<[number, number]> = [
        [51.4816, -3.1791], // cardiff
        [51.6214, -3.9436], // swansea
        [51.6486, -3.37],   // cwm-taf
        [51.5842, -3.0091], // gwent
        [51.88, -4.31],     // west
        [52.3, -3.4],       // powys
        [53.18, -3.48],     // north
      ];
      for (let i = 0; i < 1000; i += 1) {
        const [rLat, rLon] = regions[i % regions.length];
        const [lon, lat] = jitter(`voice-${i}`, rLat, rLon);
        expect(lon).toBeGreaterThanOrEqual(WALES_BBOX.west);
        expect(lon).toBeLessThanOrEqual(WALES_BBOX.east);
        expect(lat).toBeGreaterThanOrEqual(WALES_BBOX.south);
        expect(lat).toBeLessThanOrEqual(WALES_BBOX.north);
      }
    });

    test("spread — 1000 jittered coords around one centroid don't all collapse to the centroid", () => {
      const seenLats = new Set<number>();
      const seenLons = new Set<number>();
      for (let i = 0; i < 1000; i += 1) {
        const [lon, lat] = jitter(`voice-${i}`, SAMPLE_REGION.lat, SAMPLE_REGION.lon);
        seenLats.add(Math.round(lat * 1000));
        seenLons.add(Math.round(lon * 1000));
      }
      // Expect substantial spread — at least 100 distinct rounded lat values and 100 rounded lon values.
      expect(seenLats.size).toBeGreaterThan(100);
      expect(seenLons.size).toBeGreaterThan(100);
    });
  });

  describe("voicesToCoords", () => {
    test("enriches every voice with _coords matching its region centroid jitter", () => {
      const regions: Region[] = [SAMPLE_REGION];
      const voices: Voice[] = [
        {
          id: "voice-001",
          excerpt: null,
          topics: ["housing"],
          sentiment: "hopeful",
          region: "cardiff-vale",
          source: "drop-in",
          ageBand: "16-18",
          careSetting: "foster",
          capturedAt: "2026-01-01",
          consentLevel: "aggregate-only",
        },
      ];
      const enriched = voicesToCoords(voices, regions);
      expect(enriched).toHaveLength(1);
      const expected = jitter("voice-001", SAMPLE_REGION.lat, SAMPLE_REGION.lon);
      expect(enriched[0]._coords[0]).toBe(expected[0]);
      expect(enriched[0]._coords[1]).toBe(expected[1]);
    });

    test("throws if a voice references a region slug not in the regions array", () => {
      const voices: Voice[] = [
        {
          id: "voice-002",
          excerpt: null,
          topics: ["housing"],
          sentiment: "hopeful",
          region: "powys",
          source: "drop-in",
          ageBand: "16-18",
          careSetting: "foster",
          capturedAt: "2026-01-01",
          consentLevel: "aggregate-only",
        },
      ];
      expect(() => voicesToCoords(voices, [SAMPLE_REGION])).toThrow();
    });
  });
  ```

- [ ] **Step 3: Run the tests — they must FAIL with "not implemented"**

  ```bash
  bun test src/lib/heatmap.test.ts
  ```

  Expected: all tests fail. Confirm the failure messages all say `not implemented` (not e.g. `module not found` — the latter would mean the import paths are wrong).

- [ ] **Step 4: Commit the failing tests**

  ```bash
  git add src/lib/heatmap.ts src/lib/heatmap.test.ts
  git commit -m "test(heatmap): failing tests for hashString + seedToFloat + jitter + voicesToCoords"
  ```

---

## Task 5: Implement `hashString` (FNV-1a 32-bit)

**Files:**
- Modify: `src/lib/heatmap.ts`

- [ ] **Step 1: Replace the `hashString` stub with FNV-1a 32-bit**

  In `src/lib/heatmap.ts`, replace:

  ```ts
  export function hashString(_input: string): number {
    throw new Error("hashString: not implemented");
  }
  ```

  with:

  ```ts
  /**
   * FNV-1a 32-bit hash. Deterministic, fast, no dependencies. Output is in [0, 2^32).
   */
  export function hashString(input: string): number {
    let hash = 0x811c9dc5; // FNV offset basis (32-bit)
    for (let i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      // Multiply by FNV prime (16777619) using Math.imul to stay in 32-bit signed range,
      // then convert back to unsigned with `>>> 0`.
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }
  ```

- [ ] **Step 2: Run the hashString tests — they must pass**

  ```bash
  bun test src/lib/heatmap.test.ts -t "hashString"
  ```

  Expected: both `hashString` describe-block tests pass.

- [ ] **Step 3: Commit**

  ```bash
  git add src/lib/heatmap.ts
  git commit -m "feat(heatmap): implement FNV-1a 32-bit hashString"
  ```

---

## Task 6: Implement `seedToFloat`

A channel-mixed 32-bit linear congruential step turning a seed + channel index into a float in `[0, 1)`. Two different channels off the same seed must yield different floats so latitude and longitude jitters are uncorrelated.

**Files:**
- Modify: `src/lib/heatmap.ts`

- [ ] **Step 1: Replace the `seedToFloat` stub**

  ```ts
  /**
   * Mix `seed` with `channel` index, then normalise to [0, 1).
   * Two different channels off the same seed yield uncorrelated floats — used so
   * latitude jitter and longitude jitter don't end up on the same diagonal.
   *
   * Uses two LCG-style multiplications with distinct prime multipliers per channel.
   */
  export function seedToFloat(seed: number, channel: number): number {
    // Mix the channel into the seed with a channel-specific prime.
    const channelPrimes = [0x9e3779b1, 0x85ebca77, 0xc2b2ae3d];
    const prime = channelPrimes[channel % channelPrimes.length];
    let mixed = Math.imul(seed ^ (channel + 1), prime);
    // One extra avalanche step so neighbouring seeds don't produce neighbouring outputs.
    mixed ^= mixed >>> 16;
    mixed = Math.imul(mixed, 0x7feb352d);
    mixed ^= mixed >>> 15;
    return ((mixed >>> 0) % 0x100000000) / 0x100000000;
  }
  ```

- [ ] **Step 2: Run the seedToFloat tests**

  ```bash
  bun test src/lib/heatmap.test.ts -t "seedToFloat"
  ```

  Expected: all three `seedToFloat` tests pass.

- [ ] **Step 3: Commit**

  ```bash
  git add src/lib/heatmap.ts
  git commit -m "feat(heatmap): implement seedToFloat (channel-mixed 32-bit avalanche)"
  ```

---

## Task 7: Implement `jitter`

Builds on `hashString` + `seedToFloat`. PLAN.md gives the exact amplitudes — copy them verbatim.

**Files:**
- Modify: `src/lib/heatmap.ts`

- [ ] **Step 1: Replace the `jitter` stub**

  ```ts
  /**
   * Deterministic per-voice coordinate jitter. Returns [lon, lat] (deck.gl convention).
   *
   * Amplitudes (from PLAN.md "Heatmap data shape"):
   *   dLat ~ ±0.15° N/S (0.30° total spread)
   *   dLon ~ ±0.22° E/W (0.45° total spread)
   *
   * Combined with the 7 region centroids (all inside Wales), the jittered output
   * stays inside the Wales bbox `[-5.50, 51.30, -2.60, 53.50]`.
   */
  export function jitter(
    voiceId: string,
    regionLat: number,
    regionLon: number,
  ): [number, number] {
    const seed = hashString(voiceId);
    const dLat = (seedToFloat(seed, 0) - 0.5) * 0.30;
    const dLon = (seedToFloat(seed, 1) - 0.5) * 0.45;
    return [regionLon + dLon, regionLat + dLat];
  }
  ```

- [ ] **Step 2: Run the jitter tests**

  ```bash
  bun test src/lib/heatmap.test.ts -t "jitter"
  ```

  Expected: all four `jitter` tests pass (return-shape, determinism, bounded, spread).

  If "bounded" fails, the centroid for the failing region is too close to the bbox edge — either tighten that region's centroid in `src/seed/regions.ts` or note the constraint here. Don't loosen the bbox.

- [ ] **Step 3: Commit**

  ```bash
  git add src/lib/heatmap.ts
  git commit -m "feat(heatmap): implement deterministic per-voice jitter (PLAN.md amplitudes)"
  ```

---

## Task 8: Implement `voicesToCoords`

The aggregate transform — runs once at load time on the seed and produces an enriched list deck.gl consumes via `getPosition`.

**Files:**
- Modify: `src/lib/heatmap.ts`

- [ ] **Step 1: Replace the `voicesToCoords` stub**

  ```ts
  /**
   * Enriches every voice with a deterministic [lon, lat] derived from its region's centroid.
   * Throws if a voice references a region slug that isn't in the regions array — fail loud,
   * never silently drop a voice from the heatmap.
   */
  export function voicesToCoords(
    voices: readonly Voice[],
    regions: readonly Region[],
  ): readonly VoiceWithCoords[] {
    const lookup = new Map(regions.map((r) => [r.slug, r]));
    return voices.map((voice) => {
      const region = lookup.get(voice.region);
      if (!region) {
        throw new Error(
          `voicesToCoords: voice "${voice.id}" references region "${voice.region}" which is not in the regions array`,
        );
      }
      const coords = jitter(voice.id, region.lat, region.lon);
      return { ...voice, _coords: coords } as VoiceWithCoords;
    });
  }
  ```

- [ ] **Step 2: Run the full heatmap test suite**

  ```bash
  bun test src/lib/heatmap.test.ts
  ```

  Expected: all tests pass.

- [ ] **Step 3: Run the project-wide typecheck and lint to catch any drift**

  ```bash
  bun run typecheck
  bun run lint
  ```

  Expected: both exit 0.

- [ ] **Step 4: Commit**

  ```bash
  git add src/lib/heatmap.ts
  git commit -m "feat(heatmap): implement voicesToCoords (region lookup + jitter + fail-loud)"
  ```

---

## Task 9: Scaffold `<WalesMapWrapper>` — the `next/dynamic ssr:false` boundary

Per Critical Rule 10 + the explicit PLAN.md rule, the entire WebGL subtree (`<WalesMap>` and its three deck.gl children) must be loaded behind a single `next/dynamic({ ssr: false })` boundary. Any server component that wants to render the map imports `<WalesMapWrapper>` — never `<WalesMap>` directly.

**Files:**
- Create: `src/components/wales-map-wrapper.tsx`

- [ ] **Step 1: Create the wrapper**

  ```tsx
  // src/components/wales-map-wrapper.tsx
  "use client";

  import dynamic from "next/dynamic";

  /*
   * <WalesMapWrapper> is the ONLY entry point to the map subtree.
   *
   * Critical Rule 10 (PLAN.md): MapLibre, deck.gl overlays, and any WebGL surface
   * touch `window` and `HTMLCanvasElement` at import time. They MUST NOT be
   * imported from a server component.
   *
   * Rule from the <WalesMap> spec: <SentimentHeatmap>, <RegionMarkers>, and
   * <MapControls> are composed INSIDE <WalesMap> — they MUST NOT be imported
   * directly from any other parent.
   *
   * Server components import <WalesMapWrapper>. <WalesMapWrapper> imports <WalesMap>
   * via next/dynamic with { ssr: false }. <WalesMap> imports the three overlays
   * internally. That's the only path.
   */

  const WalesMap = dynamic(
    () => import("./wales-map").then((mod) => mod.WalesMap),
    {
      ssr: false,
      loading: () => (
        <div
          data-testid="wales-map-skeleton"
          aria-label="Loading Wales map"
          style={{
            width: "100%",
            height: "100%",
            minHeight: 480,
            background: "var(--surface-muted, #1a1310)",
            border: "2px solid var(--border-ink)",
            boxShadow: "var(--shadow-offset)",
            borderRadius: "var(--radius-md, 0.75rem)",
          }}
        />
      ),
    },
  );

  export type WalesMapWrapperProps = {
    /** Default pitch — 45 on dashboard, 0 on topic pages. Honour prefers-reduced-motion → forced to 0. */
    initialPitch?: 0 | 45;
    /** Region click handler (filter — does NOT navigate). Phase 8 wires this to the Zustand store. */
    onRegionClick?: (regionSlug: string) => void;
  };

  export function WalesMapWrapper(props: WalesMapWrapperProps) {
    return <WalesMap {...props} />;
  }
  ```

- [ ] **Step 2: Typecheck and lint**

  ```bash
  bun run typecheck
  bun run lint
  ```

  Expected: both exit 0. Typecheck will error on the `./wales-map` import — Task 10 creates it. That's fine; expected at this stage.

  If typecheck blocks the commit, add a temporary stub:

  ```tsx
  // src/components/wales-map.tsx (TEMPORARY STUB — Task 10 replaces this)
  "use client";
  export function WalesMap(_props: { initialPitch?: 0 | 45; onRegionClick?: (s: string) => void }) {
    return <div data-testid="wales-map-stub" style={{ minHeight: 480 }}>WalesMap stub</div>;
  }
  ```

  Then re-run `bun run typecheck` → exit 0.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/wales-map-wrapper.tsx src/components/wales-map.tsx
  git commit -m "feat(map): scaffold <WalesMapWrapper> next/dynamic ssr:false boundary (+ <WalesMap> stub)"
  ```

---

## Task 10: Implement `<WalesMap>` — MapLibre instance with pmtiles + patched style + warm light

This is the core. MapLibre instance mounts on a ref'd div, registers the `pmtiles://` protocol handler, loads `/basemaps-style.json`, and configures pitch + warm directional light. The 3D building extrusion layer is added in Task 12 (after the building-coverage gate in Task 11 closes).

**Files:**
- Modify: `src/components/wales-map.tsx` (replace the stub)

- [ ] **Step 1: Replace the stub with the full MapLibre implementation**

  ```tsx
  // src/components/wales-map.tsx
  "use client";

  import { useEffect, useRef, useState } from "react";
  import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
  import { Protocol } from "pmtiles";
  import "maplibre-gl/dist/maplibre-gl.css";

  type WalesMapProps = {
    initialPitch?: 0 | 45;
    onRegionClick?: (regionSlug: string) => void;
  };

  /**
   * Wales centre — used as the initial map centre. Coordinates are [lon, lat].
   */
  const WALES_CENTRE: [number, number] = [-3.7, 52.1];
  const INITIAL_ZOOM = 7.2;

  export function WalesMap({
    initialPitch = 45,
    onRegionClick: _onRegionClick,
  }: WalesMapProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const [styleLoaded, setStyleLoaded] = useState(false);

    // Honour prefers-reduced-motion — force pitch to 0 if set (Critical Rule 9).
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pitch = reducedMotion ? 0 : initialPitch;

    useEffect(() => {
      if (!containerRef.current || mapRef.current) return;

      // Register the pmtiles:// protocol handler exactly once per page load.
      // MapLibre tolerates re-registration with the same scheme, but we guard anyway.
      const protocol = new Protocol();
      maplibregl.addProtocol("pmtiles", protocol.tile);

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: "/basemaps-style.json",
        center: WALES_CENTRE,
        zoom: INITIAL_ZOOM,
        pitch,
        bearing: 0,
        attributionControl: false, // Added explicitly below with the required text.
        antialias: true, // Smoother building edges at 45° pitch.
      });

      mapRef.current = map;

      map.addControl(
        new maplibregl.AttributionControl({
          compact: false,
          customAttribution:
            '<a href="https://protomaps.com" target="_blank" rel="noopener">Protomaps</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
        }),
        "bottom-right",
      );

      map.on("load", () => {
        // Warm directional light — gives the dusk-facade glow on 3D buildings.
        map.setLight({
          anchor: "viewport",
          color: "#ffd27a",
          intensity: 0.5,
        });
        setStyleLoaded(true);
      });

      return () => {
        map.remove();
        mapRef.current = null;
        // Note: do not removeProtocol on unmount — other map instances may be alive.
      };
    }, [pitch]);

    return (
      <div
        data-testid="wales-map-container"
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: 480,
          border: "2px solid var(--border-ink)",
          boxShadow: "var(--shadow-offset)",
          borderRadius: "var(--radius-md, 0.75rem)",
          overflow: "hidden",
        }}
      >
        {/* MapLibre mounts here. Overlay + control children land in later tasks. */}
        <div hidden data-style-loaded={styleLoaded ? "true" : "false"} />
      </div>
    );
  }
  ```

- [ ] **Step 2: Wire `<WalesMapWrapper>` into the landing page for verification**

  Open `src/app/page.tsx` and add the map (keep the existing landing copy above; reposition during Phase 10 Bento composition):

  ```tsx
  import { WalesMapWrapper } from "@/components/wales-map-wrapper";

  export default function Page() {
    return (
      <section className="px-8 py-16">
        <h1
          className="text-6xl leading-tight"
          style={{
            fontFamily: "var(--font-display), serif",
            color: "var(--fg-1)",
          }}
        >
          Voices of care-experienced Wales.
        </h1>
        <p
          className="mt-6 max-w-prose text-lg"
          style={{ color: "var(--fg-2)" }}
        >
          Echoes surfaces what care-experienced children and young people across
          Wales are telling Voices From Care Cymru — by topic, by region, by
          source — and what the Young People&apos;s Advisory Boards are asking
          for in response.
        </p>
        <div style={{ marginTop: 48, height: 520 }}>
          <WalesMapWrapper initialPitch={45} />
        </div>
      </section>
    );
  }
  ```

- [ ] **Step 3: Build and serve**

  ```bash
  bun run build
  ```

  Expected: build exits 0. Fall back to `npm run build` if Bun segfaults.

  ```bash
  bun run start &
  START_PID=$!
  sleep 5
  curl -s http://localhost:3000 | grep -q 'wales-map-skeleton\|wales-map-container' && echo "map mount point in DOM"
  kill $START_PID
  ```

  Expected: `map mount point in DOM`. The skeleton variant is what curl will see (SSR-disabled — actual map renders client-side after hydration).

- [ ] **Step 4: Manual browser smoke**

  ```bash
  bun run start
  ```

  Open `http://localhost:3000`. Verify:
  - The map renders (vector basemap visible) with a 2px ink border + 4px offset shadow around it.
  - Pitch is ~45° (you can see perspective on the basemap — though no buildings yet, that's Task 12/13).
  - Bottom-right shows the Protomaps · OpenStreetMap attribution.
  - DevTools Network tab → ZERO external requests once the page has finished loading. If you see `protomaps.github.io/basemaps-assets/...` requests, Task 1 step 3 missed the patched style JSON — go fix Phase 5, then re-run this task.
  - DevTools Console → no errors.

  Stop the server (Ctrl+C).

- [ ] **Step 5: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

  Expected: both exit 0.

- [ ] **Step 6: Commit**

  ```bash
  git add src/components/wales-map.tsx src/app/page.tsx
  git commit -m "feat(map): mount MapLibre with pmtiles protocol + patched local style + warm setLight"
  ```

---

## Task 11: Building-coverage gate — Path A vs Path B decision (PHASE 7A CLOSE)

**This is the gate. No 3D-extrusion task below opens until this task closes with a committed `.review/building-coverage.md`.** (Critical Rule 18.)

**Files:**
- Create: `.review/building-coverage.md`

- [ ] **Step 1: Start the pmtiles tile server (separate terminal)**

  ```bash
  npx pmtiles serve public/wales.pmtiles
  ```

  Expected: server boots on port 8080. Leave it running for the inspection.

- [ ] **Step 2: Open the Protomaps PMTiles inspector**

  In a browser, open `https://protomaps.github.io/PMTiles/`. In the URL field at the top, paste `http://localhost:8080/wales.pmtiles` and press Enter.

  (If the inspector fails to load because of CORS, kill `pmtiles serve` and re-run with `--cors '*'`: `npx pmtiles serve public/wales.pmtiles --cors '*'`. Re-paste the URL.)

- [ ] **Step 3: Inspect the `building` (singular) layer at four cities, zoom 14+**

  Zoom and pan to each in turn. The inspector shows the active layers and per-feature attributes — click any building polygon to see its properties.

  Postcodes given as visual anchors:

  - **Cardiff** — pan to ~CF10 (city centre, around Cardiff Castle / Queen Street). Zoom to 14 or 15.
  - **Swansea** — pan to ~SA1 (city centre / marina). Zoom to 14 or 15.
  - **Newport** — pan to ~NP19 (city centre / Newport Castle). Zoom to 14 or 15.
  - **Wrexham** — pan to ~LL11 (town centre / St Giles' Church). Zoom to 14 or 15.

  For each city:
  - Confirm the `building` (singular) layer exists.
  - Click 5–10 buildings. Note whether `height` is a populated number (e.g. `12`, `18`, `25`) or `null` / missing.
  - Rough percentage with populated heights: <30% sparse → Path B; ≥30% → Path A is viable.

- [ ] **Step 4: Stop the tile server**

  ```bash
  # Ctrl+C in the terminal running pmtiles serve
  ```

- [ ] **Step 5: Write the decision to `.review/building-coverage.md`**

  Create the file with the structure below. Fill in the observations honestly.

  ```markdown
  # Building-coverage decision — Phase 7a gate

  **Inspected:** 2026-05-14 (update if re-run)
  **Inspector:** https://protomaps.github.io/PMTiles/ against `http://localhost:8080/wales.pmtiles`
  **Source pmtiles:** `public/wales.pmtiles` (extracted by `bun run fetch-tiles` from Protomaps planet snapshot YYYY-MM-DD)

  ## Spot-check results

  | City     | Postcode | Buildings inspected | With populated `height` | % populated |
  |----------|----------|---------------------|--------------------------|-------------|
  | Cardiff  | CF10     | 10                  | <FILL IN>                | <FILL IN>%  |
  | Swansea  | SA1      | 10                  | <FILL IN>                | <FILL IN>%  |
  | Newport  | NP19     | 10                  | <FILL IN>                | <FILL IN>%  |
  | Wrexham  | LL11     | 10                  | <FILL IN>                | <FILL IN>%  |

  ## Decision

  **Path:** <Path A — real OSM heights> | <Path B — centroid extrusion fallback>

  **Rationale:** <One-sentence explanation. Path A if ≥30% of inspected buildings have populated `height`. Path B otherwise.>

  ## What this means for Task 12 / 13

  - If **Path A**: implement Task 12 (`fill-extrusion-height: ['get', 'height']` on the `building` layer). Skip Task 13.
  - If **Path B**: skip Task 12. Implement Task 13 (centroid extrusion — circle polygons of radius 4km around each `Region.lat/lon`, height `baseHeight: 200 + voiceCount * 0.1`, sentiment-weighted opacity, z-order below heatmap).

  ## Re-evaluation triggers

  Re-run this gate if:
  - `public/wales.pmtiles` is regenerated from a newer Protomaps planet snapshot (OSM coverage improves over time — Path B may flip to Path A).
  - The demo script (Phase 13) adds a city not on the inspected list (extend the spot-check to that city).
  ```

- [ ] **Step 6: Commit the decision — Phase 7a closes here**

  ```bash
  git add .review/building-coverage.md
  git commit -m "docs(review): commit Phase 7a building-coverage decision (Path A / Path B)"
  git tag phase-7a-coverage-gate
  ```

  Until this commit exists, do NOT proceed to Task 12 or Task 13. Task 14 onwards depends on whichever path was chosen here.

---

## Task 12: Path A only — implement real-height `fill-extrusion` layer

**Skip this task if Task 11 chose Path B. Proceed directly to Task 13 instead.**

**Files:**
- Modify: `src/components/wales-map.tsx`

- [ ] **Step 1: Add the `fill-extrusion` layer inside the `map.on("load")` callback**

  In `src/components/wales-map.tsx`, replace the `map.on("load", ...)` block with:

  ```ts
  map.on("load", () => {
    // Warm directional light — gives the dusk-facade glow on 3D buildings.
    map.setLight({
      anchor: "viewport",
      color: "#ffd27a",
      intensity: 0.5,
    });

    // 3D building extrusion — Path A (real OSM heights).
    // PLAN.md exact values; see `.review/building-coverage.md` for the path decision.
    // The source-layer name is "building" (singular) per the OpenMapTiles / Protomaps schema.
    // Insert ABOVE any label layer so labels remain on top, but BELOW deck.gl overlays
    // (those get added by MapboxOverlay later and sit on a higher canvas).
    map.addLayer({
      id: "wales-buildings-3d",
      type: "fill-extrusion",
      source: "protomaps", // The source ID in the patched basemaps-style.json — verify if this differs.
      "source-layer": "buildings",
      minzoom: 13,
      paint: {
        "fill-extrusion-color": "#c8b59e",
        "fill-extrusion-height": ["coalesce", ["get", "height"], 8],
        "fill-extrusion-base": ["coalesce", ["get", "min_height"], 0],
        "fill-extrusion-opacity": 0.85,
      },
    });

    setStyleLoaded(true);
  });
  ```

  Notes:
  - `source` must match the source ID inside `public/basemaps-style.json`. Open that file and grep — it'll be something like `"protomaps"` or `"protomaps-source"`. Set the `source:` value here to match.
  - `source-layer` name in the Protomaps schema is `"buildings"` (plural) in the style JSON, but the underlying tile layer name is `"building"` (singular). The style JSON's layer references handle the translation; for `addLayer` you reference the **tile layer name as written in the pmtiles**, which is `"buildings"` for Protomaps. If the layer doesn't render after this task, swap to `"building"` and rebuild — one of the two will be correct.
  - `coalesce` on `height` falls back to 8 metres for buildings without populated heights — keeps the extrusion looking visually plausible during the demo.

- [ ] **Step 2: Build and verify in browser**

  ```bash
  bun run build
  bun run start
  ```

  Open `http://localhost:3000`. Zoom into Cardiff (zoom 14+, pan to the city centre). Verify:
  - 3D buildings rise visibly with warm facade colour `#c8b59e`.
  - Buildings catch light differently as you drag-rotate (Ctrl+drag or right-click drag).
  - No console errors.

  If buildings don't appear, check:
  - DevTools Console for layer-add errors (likely `source-layer` name mismatch → swap `"buildings"` ↔ `"building"`).
  - DevTools Network for failing tile fetches (should not happen — pmtiles are local).
  - Zoom level — extrusion is `minzoom: 13`; you must be at z13+ to see buildings.

  Stop the server.

- [ ] **Step 3: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

  Expected: both exit 0.

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/wales-map.tsx
  git commit -m "feat(map): 3D building extrusion (Path A — real OSM heights, warm facade #c8b59e)"
  ```

---

## Task 13: Path B only — implement centroid-extrusion fallback

**Skip this task if Task 11 chose Path A.** Path B replaces real OSM building heights with seven large circular polygons (one per region centroid), each extruded to a height proportional to that region's voice count, with opacity weighted by aggregate sentiment.

**Files:**
- Modify: `src/components/wales-map.tsx`

- [ ] **Step 1: Add a helper that builds the GeoJSON FeatureCollection for the 7 region circles**

  At the top of `src/components/wales-map.tsx` (above `WalesMap`), add:

  ```ts
  import type { FeatureCollection, Polygon } from "geojson";
  import type { Voice } from "@/seed/types";
  import { REGIONS } from "@/seed/regions";

  /**
   * Generates a circle polygon of `radiusKm` around `[lat, lon]`, approximated by
   * `steps` vertices. Used for the Path B centroid-extrusion fallback.
   */
  function regionCircle(
    lat: number,
    lon: number,
    radiusKm: number,
    steps = 64,
  ): number[][] {
    const earthRadiusKm = 6371;
    const ring: number[][] = [];
    for (let i = 0; i < steps; i += 1) {
      const theta = (i / steps) * 2 * Math.PI;
      const dLat = (radiusKm / earthRadiusKm) * (180 / Math.PI) * Math.cos(theta);
      const dLon =
        ((radiusKm / earthRadiusKm) * (180 / Math.PI) * Math.sin(theta)) /
        Math.cos((lat * Math.PI) / 180);
      ring.push([lon + dLon, lat + dLat]);
    }
    ring.push(ring[0]); // close the ring
    return ring;
  }

  /**
   * Builds the FeatureCollection of region-extrusion polygons.
   * height = 200 + voiceCount * 0.1 (PLAN.md Path B formula).
   * opacityWeight ∈ [0, 1] is sentiment-weighted: hopeful-heavy → lower opacity, worried-heavy → higher.
   */
  function buildRegionExtrusionFC(voices: readonly Voice[]): FeatureCollection<Polygon> {
    const byRegion = new Map<
      string,
      { count: number; worried: number; mixed: number; hopeful: number }
    >();
    for (const v of voices) {
      const slot = byRegion.get(v.region) ?? { count: 0, worried: 0, mixed: 0, hopeful: 0 };
      slot.count += 1;
      slot[v.sentiment] += 1;
      byRegion.set(v.region, slot);
    }
    return {
      type: "FeatureCollection",
      features: REGIONS.map((r) => {
        const stats = byRegion.get(r.slug) ?? { count: 0, worried: 0, mixed: 0, hopeful: 0 };
        const opacityWeight =
          stats.count === 0
            ? 0.3
            : 0.3 + (stats.worried * 1.2 + stats.mixed * 0.7 + stats.hopeful * 0.4) / (stats.count * 1.2);
        return {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [regionCircle(r.lat, r.lon, 4)],
          },
          properties: {
            region: r.slug,
            height: 200 + stats.count * 0.1,
            opacityWeight: Math.min(opacityWeight, 1),
          },
        };
      }),
    };
  }
  ```

- [ ] **Step 2: Accept a `voices` prop and wire the FC into the map's `on("load")` callback**

  In `src/components/wales-map.tsx`, extend the props and replace `map.on("load", ...)`:

  ```tsx
  type WalesMapProps = {
    initialPitch?: 0 | 45;
    onRegionClick?: (regionSlug: string) => void;
    voices?: readonly Voice[];
  };

  // ... inside WalesMap, after pitch derivation:
  const voicesRef = useRef(props.voices ?? []);
  voicesRef.current = props.voices ?? [];

  // ... inside useEffect, replace map.on("load", ...):
  map.on("load", () => {
    map.setLight({
      anchor: "viewport",
      color: "#ffd27a",
      intensity: 0.5,
    });

    const fc = buildRegionExtrusionFC(voicesRef.current);
    map.addSource("region-extrusion", { type: "geojson", data: fc });
    map.addLayer({
      id: "wales-region-extrusion",
      type: "fill-extrusion",
      source: "region-extrusion",
      paint: {
        "fill-extrusion-color": "#c8b59e",
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": ["get", "opacityWeight"],
      },
    });

    setStyleLoaded(true);
  });
  ```

  And update the wrapper to accept and forward voices:

  ```tsx
  // src/components/wales-map-wrapper.tsx — extend WalesMapWrapperProps
  export type WalesMapWrapperProps = {
    initialPitch?: 0 | 45;
    onRegionClick?: (regionSlug: string) => void;
    voices?: readonly Voice[];
  };
  ```

  And pass voices through in the wrapper's body: `return <WalesMap {...props} />;` (unchanged — spread covers it).

- [ ] **Step 3: Pipe sample voices into the landing page**

  Open `src/app/page.tsx` and pass the fixture:

  ```tsx
  import { sampleVoices } from "@/seed/__fixtures__/voices.sample";
  // ...
  <WalesMapWrapper initialPitch={45} voices={sampleVoices} />
  ```

  (Adjust the import name if Phase 6 named the fixture differently.)

- [ ] **Step 4: Build + serve + verify**

  ```bash
  bun run build && bun run start
  ```

  Open `http://localhost:3000`. Verify:
  - Seven warm circular extrusions rise over Wales — one per region centroid, ~4km radius.
  - Opacity varies by region per the sentiment weighting.
  - Buildings layer (real heights) is NOT visible — confirms Path B replaced Path A.
  - No console errors.

  Stop the server.

- [ ] **Step 5: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

  Expected: both exit 0.

- [ ] **Step 6: Commit**

  ```bash
  git add src/components/wales-map.tsx src/components/wales-map-wrapper.tsx src/app/page.tsx
  git commit -m "feat(map): 3D centroid extrusion (Path B fallback — circle polygons, sentiment-weighted opacity)"
  ```

---

## Task 14: Build `<SentimentHeatmap>` deck.gl `HeatmapLayer` builder

PLAN.md specifies the heatmap is a **layer function** that returns a deck.gl `HeatmapLayer` — not a React component. It's composed inside `<WalesMap>` via `MapboxOverlay`. The exact parameter values are verbatim from PLAN.md.

**Files:**
- Create: `src/components/sentiment-heatmap.ts`

- [ ] **Step 1: Create the heatmap-layer builder**

  ```ts
  // src/components/sentiment-heatmap.ts
  import { HeatmapLayer } from "@deck.gl/aggregation-layers";
  import type { VoiceWithCoords } from "@/lib/heatmap";

  /**
   * Builds the deck.gl HeatmapLayer for the sentiment heat surface.
   *
   * Exact parameter values from PLAN.md "Map stack" → <SentimentHeatmap>:
   *   radiusPixels: 60
   *   intensity: 1.2
   *   threshold: 0.03
   *   colorRange: VFCC ink → sky → sun → red
   *   getWeight: worried 1.2 > hopeful 1.0 > mixed 0.7
   *
   * Re-tessellates automatically when `voices` reference changes (deck.gl prop diff).
   */
  export function buildSentimentHeatmapLayer(
    voices: readonly VoiceWithCoords[],
  ): HeatmapLayer<VoiceWithCoords> {
    return new HeatmapLayer<VoiceWithCoords>({
      id: "sentiment-heatmap",
      data: voices as VoiceWithCoords[],
      getPosition: (voice) => [voice._coords[0], voice._coords[1]],
      getWeight: (voice) =>
        voice.sentiment === "hopeful" ? 1 : voice.sentiment === "mixed" ? 0.7 : 1.2,
      radiusPixels: 60,
      intensity: 1.2,
      threshold: 0.03,
      colorRange: [
        [16, 11, 8, 0],
        [58, 132, 188, 180],
        [255, 215, 106, 220],
        [229, 62, 47, 245],
      ],
      pickable: false,
    });
  }
  ```

- [ ] **Step 2: Lint + typecheck**

  ```bash
  bun run typecheck
  bun run lint
  ```

  Expected: both exit 0. (If `colorRange` types complain, cast each tuple: `[16, 11, 8, 0] as [number, number, number, number]`.)

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/sentiment-heatmap.ts
  git commit -m "feat(map): buildSentimentHeatmapLayer (PLAN.md VFCC colorRange + weights)"
  ```

---

## Task 15: Build `<RegionMarkers>` deck.gl `IconLayer` builder

**Files:**
- Create: `src/components/region-markers.ts`
- Create: `public/pin-marker.svg`

- [ ] **Step 1: Create the SVG pin sprite**

  Write `public/pin-marker.svg`:

  ```xml
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48" width="32" height="48">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 32 16 32s16-20 16-32C32 7.16 24.84 0 16 0z" fill="#e53e2f" stroke="#17120f" stroke-width="2"/>
    <circle cx="16" cy="16" r="6" fill="#f7f2ea"/>
  </svg>
  ```

  (VFCC brand-red pin with cream centre and ink stroke — matches the brand palette without using raw VFCC tokens at runtime since deck.gl IconLayer reads pixel sprites.)

- [ ] **Step 2: Create the IconLayer builder**

  ```ts
  // src/components/region-markers.ts
  import { IconLayer } from "@deck.gl/layers";
  import type { Region } from "@/seed/types";

  type IconAtlasEntry = {
    x: number;
    y: number;
    width: number;
    height: number;
    anchorY: number;
    mask: false;
  };

  const ICON_MAPPING: Record<string, IconAtlasEntry> = {
    pin: { x: 0, y: 0, width: 32, height: 48, anchorY: 48, mask: false },
  };

  /**
   * Builds the deck.gl IconLayer for per-region accent markers.
   *
   * Visibility: `visible` ramps with zoom in <WalesMap> — only mounted at z ≥ 7
   *   (handled by the caller passing `visible` based on current zoom).
   *
   * Reveal stagger (first-load only): the caller passes `revealedSlugs` — initially
   *   an empty Set, then each region slug is added every 200ms. Markers whose
   *   slug isn't in revealedSlugs render with opacity 0.
   *
   * Reduced motion: caller passes the full set immediately (no stagger).
   *
   * Click → onClick(regionSlug). Does NOT navigate (PLAN.md region click → filter rule).
   */
  export function buildRegionMarkersLayer(
    regions: readonly Region[],
    onClick: (slug: string) => void,
    revealedSlugs: ReadonlySet<string>,
  ): IconLayer<Region> {
    return new IconLayer<Region>({
      id: "region-markers",
      data: regions as Region[],
      pickable: true,
      iconAtlas: "/pin-marker.svg",
      iconMapping: ICON_MAPPING,
      getIcon: () => "pin",
      sizeUnits: "pixels",
      getSize: 40,
      getPosition: (r) => [r.lon, r.lat],
      getColor: (r) => (revealedSlugs.has(r.slug) ? [255, 255, 255, 255] : [255, 255, 255, 0]),
      updateTriggers: {
        getColor: revealedSlugs,
      },
      onClick: (info) => {
        if (info.object) onClick((info.object as Region).slug);
      },
    });
  }
  ```

- [ ] **Step 3: Typecheck + lint**

  ```bash
  bun run typecheck
  bun run lint
  ```

  Expected: both exit 0.

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/region-markers.ts public/pin-marker.svg
  git commit -m "feat(map): buildRegionMarkersLayer IconLayer + brand-red pin sprite"
  ```

---

## Task 16: Build `<MapControls>` — pitch / rotate reset + fly-to-region (brand-motif chrome)

VFCC pill + 2px ink border + 4px offset shadow; hover lifts to 6px + `translate(-1px, -1px)`; press lands at 0 0 + `translate(+4px, +4px)`. Strings are short verbs (Critical Rule 22).

**Files:**
- Create: `src/components/map-controls.tsx`

- [ ] **Step 1: Create the controls component**

  ```tsx
  // src/components/map-controls.tsx
  "use client";

  import type { Map as MapLibreMap } from "maplibre-gl";
  import { REGIONS } from "@/seed/regions";

  type MapControlsProps = {
    getMap: () => MapLibreMap | null;
    defaultPitch: 0 | 45;
  };

  const BUTTON_BASE: React.CSSProperties = {
    border: "2px solid var(--border-ink)",
    background: "var(--surface)",
    color: "var(--fg-1)",
    boxShadow: "var(--shadow-offset)",
    padding: "0.5rem 1rem",
    borderRadius: 9999,
    fontFamily: "var(--font-ui), system-ui, sans-serif",
    fontSize: "0.85rem",
    cursor: "pointer",
    userSelect: "none",
  };

  export function MapControls({ getMap, defaultPitch }: MapControlsProps) {
    function resetPitch() {
      getMap()?.easeTo({ pitch: defaultPitch, duration: 400 });
    }
    function resetBearing() {
      getMap()?.easeTo({ bearing: 0, duration: 400 });
    }
    function flyToRegion(slug: string) {
      const region = REGIONS.find((r) => r.slug === slug);
      if (!region) return;
      getMap()?.flyTo({
        center: [region.lon, region.lat],
        zoom: 9.5,
        pitch: defaultPitch,
        duration: 900,
        essential: true,
      });
    }

    return (
      <div
        data-testid="map-controls"
        style={{
          position: "absolute",
          left: 16,
          bottom: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 10,
        }}
      >
        <button type="button" style={BUTTON_BASE} onClick={resetPitch}>
          Reset pitch
        </button>
        <button type="button" style={BUTTON_BASE} onClick={resetBearing}>
          Reset rotation
        </button>
        <select
          aria-label="Fly to region"
          style={{ ...BUTTON_BASE, padding: "0.5rem 0.75rem" }}
          defaultValue=""
          onChange={(e) => {
            const slug = e.target.value;
            if (slug) flyToRegion(slug);
            e.currentTarget.value = "";
          }}
        >
          <option value="" disabled>
            Fly to region
          </option>
          {REGIONS.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
  ```

  Notes:
  - The hover/press transitions are tightened in the Polish phase. This task ships the steady-state brand motif; pressed/hover states inherit `:hover` / `:active` defaults from the browser plus the box-shadow swap done globally via VFCC tokens (consistent with how `<DemoDataBadge>` is styled in Phase 3).
  - All copy is short-verb form ("Reset pitch", "Reset rotation", "Fly to region"). No "Click here", no "Submit".

- [ ] **Step 2: Typecheck + lint**

  ```bash
  bun run typecheck
  bun run lint
  ```

  Expected: both exit 0.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/map-controls.tsx
  git commit -m "feat(map): <MapControls> pill + offset-shadow buttons (Reset pitch / Reset rotation / Fly to region)"
  ```

---

## Task 17: Compose the three overlays inside `<WalesMap>` via `MapboxOverlay`

This is the integration point. The deck.gl overlay is created once when the map loads, the two layer builders are called every render with current props, and `<MapControls>` is rendered as a sibling DOM element above the map canvas.

**Files:**
- Modify: `src/components/wales-map.tsx`

- [ ] **Step 1: Wire deck.gl overlay + region-reveal stagger + the controls**

  Open `src/components/wales-map.tsx` and replace the entire file with the integrated version:

  ```tsx
  "use client";

  import { useEffect, useMemo, useRef, useState } from "react";
  import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
  import { Protocol } from "pmtiles";
  import { MapboxOverlay } from "@deck.gl/mapbox";
  import "maplibre-gl/dist/maplibre-gl.css";
  import type { Voice } from "@/seed/types";
  import { REGIONS } from "@/seed/regions";
  import { voicesToCoords } from "@/lib/heatmap";
  import { buildSentimentHeatmapLayer } from "./sentiment-heatmap";
  import { buildRegionMarkersLayer } from "./region-markers";
  import { MapControls } from "./map-controls";

  type WalesMapProps = {
    initialPitch?: 0 | 45;
    onRegionClick?: (regionSlug: string) => void;
    voices?: readonly Voice[];
  };

  const WALES_CENTRE: [number, number] = [-3.7, 52.1];
  const INITIAL_ZOOM = 7.2;

  export function WalesMap({
    initialPitch = 45,
    onRegionClick,
    voices = [],
  }: WalesMapProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const overlayRef = useRef<MapboxOverlay | null>(null);
    const [styleLoaded, setStyleLoaded] = useState(false);
    const [revealedSlugs, setRevealedSlugs] = useState<ReadonlySet<string>>(new Set());

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pitch: 0 | 45 = reducedMotion ? 0 : initialPitch;

    // Derive heatmap coords once per voices reference change.
    const voicesWithCoords = useMemo(
      () => voicesToCoords(voices, REGIONS),
      [voices],
    );

    // Region-marker reveal stagger — instant if reduced-motion, otherwise 200ms/region.
    useEffect(() => {
      if (reducedMotion) {
        setRevealedSlugs(new Set(REGIONS.map((r) => r.slug)));
        return;
      }
      const timers: ReturnType<typeof setTimeout>[] = [];
      REGIONS.forEach((r, i) => {
        const t = setTimeout(() => {
          setRevealedSlugs((prev) => new Set([...prev, r.slug]));
        }, 200 * i);
        timers.push(t);
      });
      return () => timers.forEach(clearTimeout);
    }, [reducedMotion]);

    // Mount MapLibre exactly once.
    useEffect(() => {
      if (!containerRef.current || mapRef.current) return;

      const protocol = new Protocol();
      maplibregl.addProtocol("pmtiles", protocol.tile);

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: "/basemaps-style.json",
        center: WALES_CENTRE,
        zoom: INITIAL_ZOOM,
        pitch,
        bearing: 0,
        attributionControl: false,
        antialias: true,
      });

      mapRef.current = map;

      map.addControl(
        new maplibregl.AttributionControl({
          compact: false,
          customAttribution:
            '<a href="https://protomaps.com" target="_blank" rel="noopener">Protomaps</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
        }),
        "bottom-right",
      );

      map.on("load", () => {
        map.setLight({
          anchor: "viewport",
          color: "#ffd27a",
          intensity: 0.5,
        });

        // Path A or Path B is wired by Task 12 / 13. The fill-extrusion layer added there
        // sits at the bottom of the layer stack; the deck.gl overlay below sits on top.

        const overlay = new MapboxOverlay({
          interleaved: false,
          layers: [],
        });
        map.addControl(overlay as unknown as maplibregl.IControl);
        overlayRef.current = overlay;

        setStyleLoaded(true);
      });

      return () => {
        overlayRef.current = null;
        map.remove();
        mapRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- pitch captured at mount; reset via MapControls
    }, []);

    // Push current layer set into the overlay on every relevant prop change.
    useEffect(() => {
      const overlay = overlayRef.current;
      if (!overlay || !styleLoaded) return;
      const heat = buildSentimentHeatmapLayer(voicesWithCoords);
      const markers = buildRegionMarkersLayer(
        REGIONS,
        (slug) => onRegionClick?.(slug),
        revealedSlugs,
      );
      overlay.setProps({ layers: [heat, markers] });
    }, [voicesWithCoords, revealedSlugs, styleLoaded, onRegionClick]);

    return (
      <div
        data-testid="wales-map-container"
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: 480,
          border: "2px solid var(--border-ink)",
          boxShadow: "var(--shadow-offset)",
          borderRadius: "var(--radius-md, 0.75rem)",
          overflow: "hidden",
        }}
      >
        {styleLoaded ? (
          <MapControls getMap={() => mapRef.current} defaultPitch={pitch} />
        ) : null}
      </div>
    );
  }
  ```

  Notes:
  - **Path A / Path B note**: the building-extrusion layer added in Task 12 or Task 13 is omitted from this rewrite for brevity — copy that block back in from whichever task closed in your build. If you came here from Task 12, the `map.addLayer({ id: "wales-buildings-3d", ... })` call goes inside `map.on("load", () => { ... })` after `setLight`. If from Task 13, the `addSource` + `addLayer` for `region-extrusion` go in the same spot, and the `voicesRef` + helper functions get reintroduced.
  - `interleaved: false` keeps the deck.gl overlay on its own canvas above the MapLibre canvas — simpler, fewer z-order surprises, and matches what PLAN.md describes.

- [ ] **Step 2: Re-add the Path A or Path B extrusion block from Task 12 / 13**

  Open `src/components/wales-map.tsx`. Inside `map.on("load", () => { ... })`, after `map.setLight(...)` and before `const overlay = new MapboxOverlay(...)`, paste the building-extrusion block from whichever Task (12 or 13) closed earlier in your build:
  - If Path A: the `map.addLayer({ id: "wales-buildings-3d", ... })` block.
  - If Path B: the `map.addSource("region-extrusion", ...)` + `map.addLayer({ id: "wales-region-extrusion", ... })` block plus the `buildRegionExtrusionFC` import and the `voicesRef` ref pattern from Task 13.

  Commit the merged file as one unit in Step 4.

- [ ] **Step 3: Build + serve + verify all overlays compose**

  ```bash
  bun run build && bun run start
  ```

  Open `http://localhost:3000`. Verify:
  - Map renders.
  - Building extrusion visible (Path A real buildings at zoom 14+ over Cardiff, or Path B circles over Wales).
  - Sentiment heatmap surface visible across Wales (warm reds and yellows over high-density regions, cool sky where sparse).
  - 7 region pin markers appear in a 200ms-staggered sequence over ~1.4s.
  - `<MapControls>` visible bottom-left: "Reset pitch", "Reset rotation", "Fly to region" dropdown.
  - Click a region marker → no navigation (currently `onRegionClick` is undefined). Click "Fly to region" → map flies. Click "Reset pitch" → pitch animates to default. Click "Reset rotation" → bearing returns to 0.
  - DevTools Console → no errors.
  - DevTools Network → zero external requests after initial page load.

  Stop the server.

- [ ] **Step 4: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

  Expected: both exit 0.

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/wales-map.tsx
  git commit -m "feat(map): compose <SentimentHeatmap> + <RegionMarkers> + <MapControls> via MapboxOverlay inside <WalesMap>"
  ```

---

## Task 18: Reduced-motion path verified end-to-end

PLAN.md and Critical Rule 9: `prefers-reduced-motion: reduce` → pitch defaults to 0°, region-marker stagger collapses to all-at-once, heatmap fade-in is instant (heatmap fade itself is Phase 10 — for this task, verify the pitch-0° and no-stagger behaviour are wired correctly).

**Files:** none modified — verification only (the wiring was added in Task 17).

- [ ] **Step 1: Verify the pitch + reveal logic exists in `wales-map.tsx`**

  ```bash
  grep -n "reducedMotion" src/components/wales-map.tsx
  ```

  Expected output includes the `reducedMotion = window.matchMedia(...)` line, the `pitch = reducedMotion ? 0 : initialPitch` line, and the `if (reducedMotion) setRevealedSlugs(new Set(...))` early return inside the reveal effect.

- [ ] **Step 2: Manual browser verification — emulate reduced motion**

  ```bash
  bun run start
  ```

  Open `http://localhost:3000` in Chrome. Open DevTools → Rendering tab (Cmd+Shift+P → "Show Rendering") → "Emulate CSS media feature prefers-reduced-motion" → set to `reduce`. Hard reload (Cmd+Shift+R).

  Verify:
  - Map mounts at pitch 0 (flat — no perspective).
  - All 7 region pin markers appear simultaneously (no 200ms stagger).
  - No console errors.

  Switch back to "no preference" and hard reload. Verify pitch returns to 45° and the stagger reappears.

  Stop the server.

- [ ] **Step 3: No code change → no commit.** (Document the verification result in the Definition of Done section at the bottom of this plan, not as a commit.)

---

## Task 19: Performance recording — 60fps target verification

Critical Rule 17: ≥58fps (≤17ms/frame) on the dashboard map. This task captures a DevTools Performance recording of the landing-page map and notes the result.

**Files:** none modified — verification only.

- [ ] **Step 1: Start production server**

  ```bash
  bun run build && bun run start
  ```

  Fall back to npm if Bun segfaults.

- [ ] **Step 2: Open the landing page, ready DevTools Performance tab**

  Open `http://localhost:3000` in Chrome. Open DevTools → Performance tab. Click the gear icon → set CPU throttling to "No throttling", Network to "No throttling".

- [ ] **Step 3: Record a typical interaction**

  Click Record. Within the recording window:
  1. Wait for region markers to finish their reveal stagger.
  2. Drag-rotate the map (right-click drag, or Ctrl+drag) for ~3 seconds — this exercises 3D building extrusion + heatmap re-render at every frame.
  3. Click "Fly to region" → Cardiff & Vale. Watch the flyTo animation.
  4. Click "Reset pitch". Click "Reset rotation".

  Stop recording.

- [ ] **Step 4: Inspect the frame chart**

  Look at the FPS line at the top of the Performance flame chart:
  - Sustained ≥ 58fps during drag-rotate, fly-to, and reset.
  - Long task warnings (red triangles in the Main thread row): note any > 50ms.
  - Frame times in the bottom-axis: most should be ≤ 17ms.

- [ ] **Step 5: Document the result in `.review/building-coverage.md`**

  Append to `.review/building-coverage.md`:

  ```markdown

  ## Performance recording (Task 19)

  **Recorded:** 2026-05-14
  **Browser:** Chrome <version>
  **Laptop:** <make/model — Apple Silicon Mxx>

  | Interaction      | Sustained FPS | Frame-time p95 | Notes |
  |------------------|---------------|----------------|-------|
  | Idle (post-load) | <fill in>     | <fill in>      |       |
  | Drag-rotate      | <fill in>     | <fill in>      |       |
  | flyTo Cardiff    | <fill in>     | <fill in>      |       |
  | Reset pitch      | <fill in>     | <fill in>      |       |

  **Pass / Fail:** <fill in — pass if sustained ≥ 58fps>

  **Fallback if fail:** Polish phase wires `?perf=safe` (default pitch 0°, no R3F, region markers instead of heatmap). For Phase 7 we only flag this; the implementation lives in Phase 12.
  ```

  Stop the server.

- [ ] **Step 6: Commit the perf note**

  ```bash
  git add .review/building-coverage.md
  git commit -m "docs(review): record Phase 7 60fps performance verification"
  ```

---

## Task 20: Phase-7 close — full build + lint + typecheck + tag

**Files:** none modified — verification + tag only.

- [ ] **Step 1: Production build completes**

  ```bash
  bun run build
  ```

  Expected: build exits 0. Falls back to `npm run build` if Bun segfaults.

- [ ] **Step 2: Production server serves the map page**

  ```bash
  bun run start &
  START_PID=$!
  sleep 5
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
  curl -s http://localhost:3000 | grep -qE 'wales-map-(skeleton|container)' && echo "map mount in DOM"
  kill $START_PID
  ```

  Expected: `200`, then `map mount in DOM`. Note: because `<WalesMap>` is SSR-disabled, the curl-grep only finds the loading skeleton or the container DIV — the actual MapLibre canvas is client-rendered after hydration. Manual browser open is the real test (steps below).

- [ ] **Step 3: Lint + typecheck final pass**

  ```bash
  bun run lint
  bun run typecheck
  ```

  Expected: both exit 0.

- [ ] **Step 4: Offline guarantee re-verified (manual one-time)**

  ```bash
  bun run start
  ```

  Open `http://localhost:3000` in a browser. Open DevTools → Network tab. **Disable wifi** (macOS top-right wifi → Off). Hard reload (Cmd+Shift+R). Verify:
  - Map renders.
  - Region markers reveal.
  - Heatmap surface renders.
  - Building extrusion renders (Path A or Path B per Task 11).
  - DevTools Network → zero requests to external hosts. If you see `fonts.googleapis.com`, `protomaps.github.io`, or any other external host, an asset isn't self-hosted — go back to Phase 5 and fix.

  Re-enable wifi. Stop the server.

- [ ] **Step 5: Phase-7 close commit + tag**

  ```bash
  git add -A
  git commit --allow-empty -m "chore(phase-7): close Wales map — base stack + overlays + perf verified offline"
  git tag phase-7-wales-map
  ```

- [ ] **Step 6: Update `CLAUDE.md` Status section**

  Open `CLAUDE.md` and update the `## Status` paragraph to reflect Phase 7 complete. Example:

  > **Wales map shipped (Phase 7 complete, 2026-05-14).** MapLibre + pmtiles + protomaps-themes-base (patched local) + 3D buildings (Path <A|B>) + deck.gl `<SentimentHeatmap>` + `<RegionMarkers>` + `<MapControls>` all wired inside `<WalesMapWrapper>` at `phase-7-wales-map`. Offline guarantee re-verified, 60fps on demo laptop. Next: Phase 8 — Zustand filter store + k-anon redaction wiring.

  ```bash
  git add CLAUDE.md
  git commit -m "docs: mark phase 7 wales-map complete in CLAUDE.md"
  ```

---

## Definition of Done for this plan

A task-by-task close is reached when:

1. All 20 task checkboxes are ticked (Tasks 12 OR 13 — not both — per the Task 11 gate decision).
2. `git tag phase-7-wales-map` exists and points at a green build.
3. `git tag phase-7a-coverage-gate` exists and points at the `.review/building-coverage.md` commit.
4. `bun run dev`, `bun run build && bun run start`, `bun run typecheck`, `bun run lint`, and `bun test src/lib/heatmap.test.ts` all pass on a fresh checkout.
5. `http://localhost:3000` against the production build shows:
   - The MapLibre vector basemap rendered from `public/wales.pmtiles`.
   - Building extrusion visible (Path A real buildings OR Path B centroid circles per `.review/building-coverage.md`).
   - Sentiment heatmap surface drawn across Wales with the PLAN.md `colorRange`.
   - 7 region pin markers revealed with a 200ms stagger (or instant under `prefers-reduced-motion: reduce`).
   - `<MapControls>` bottom-left: "Reset pitch", "Reset rotation", "Fly to region".
   - Protomaps + OpenStreetMap attribution bottom-right.
   - DEMO DATA pill still present in `<EchoesHeader>` (chrome inherited from Phase 3).
6. With wifi off, the map reloads cleanly with zero external network requests.
7. Performance recording in `.review/building-coverage.md` shows sustained ≥58fps during drag-rotate, flyTo, and pitch/rotate reset.
8. `CLAUDE.md` Status section reflects Phase 7 complete.

---

## Out of scope — handled in later plans

- **Heatmap fade-in animation + 3D-buildings rise from 0 → real height** (PLAN.md Phase 10 wow moment 3) — Phase 10 plan.
- **Bento-grid composition** placing the map next to the donut, counter, topic bars, voices feed, and provenance panel — Phase 10 plan.
- **Zustand filter store wiring** of `onRegionClick` — Phase 8 plan. (`<WalesMapWrapper>` already exposes the prop; Phase 8 supplies the handler.)
- **Topic-page filtered view** (pitch 0°, filtered voice set fed into the same map) — Phase 9 plan.
- **View Transitions API drill-in** from dashboard → topic page — Phase 9 plan.
- **`?perf=safe` query-param escape hatch** (skip R3F, force pitch 0°, swap heatmap for markers-only) — Phase 12 plan.
- **Playwright smoke** asserting the map container is in the DOM on every route — Phase 13 plan.

Each subsequent plan follows the same file-naming convention: `docs/superpowers/plans/YYYY-MM-DD-<short-name>.md`.
