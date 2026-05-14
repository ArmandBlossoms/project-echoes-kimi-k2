# Project Echoes — Offline Tiles + Basemaps-Assets Self-Hosting Implementation Plan (Phase 5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce `public/wales.pmtiles` (Wales-cropped vector basemap), `public/basemaps-assets/` (self-hosted glyph PBFs + sprite sheets), and `public/basemaps-style.json` (a patched protomaps-themes-base dark style pointing at local paths) so the MapLibre stack in Phase 7 renders fully offline with every label and sprite present.

**Architecture:** Two idempotent TypeScript scripts run by Bun. `scripts/fetch-tiles.ts` shells out to the `pmtiles` CLI to extract a Wales bounding-box subset from a date-pinned Protomaps planet snapshot. `scripts/fetch-assets.ts` does an HTTP fan-out over a known list of glyph ranges and sprite filenames, writes them into `public/basemaps-assets/`, then patches the `protomaps-themes-base` dark style to point at local `/basemaps-assets/...` paths. Both scripts are safe to re-run, support `--force`, and assert sensible output sizes before declaring success.

**Tech Stack:** Bun (runtime + test runner) · TypeScript · `pmtiles` CLI (Go binary, installed via `brew install protomaps/tap/pmtiles`) · `Bun.spawn` for the extract shell-out · `fetch()` for asset downloads · `protomaps-themes-base` npm package (read-only source of style JSON).

**Scope boundary:** This plan covers PLAN.md Phase 5 only. Phase 4 (seed data) is independent and may be done in parallel. Phase 7a (MapLibre wiring) consumes the outputs of this phase but is not started here. The actual map component, the deck.gl overlays, and the building-coverage spot-check all belong to Phase 7.

**Source of truth:** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/PLAN.md` (especially Phase 5 description around line 552, the Map-Stack section, and Critical Rules 5, 14, 19) + `CLAUDE.md`. Read both before starting.

**Working directory:** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/`

---

## File Structure (created/modified in this plan)

```
package.json                          # add scripts: fetch-tiles, fetch-assets
.gitignore                            # ensure public/basemaps-assets/ + public/wales.pmtiles are ignored
scripts/
  fetch-tiles.ts                      # bun run fetch-tiles → public/wales.pmtiles
  fetch-tiles.test.ts                 # bun test — pure-function tests (bbox validator, snapshot URL builder)
  fetch-assets.ts                     # bun run fetch-assets → public/basemaps-assets/ + public/basemaps-style.json
  fetch-assets.test.ts                # bun test — style-JSON patcher pure-function tests
  lib/
    bbox.ts                           # exported pure helpers: parseBbox, validateBbox
    protomaps-snapshot.ts             # exported pure helper: buildSnapshotUrl(date)
    style-patcher.ts                  # exported pure helper: patchStyleForLocalAssets(style, opts)
public/
  wales.pmtiles                       # gitignored output, ~20–50 MB
  basemaps-assets/                    # gitignored output directory
    fonts/<fontstack>/<range>.pbf     # ~4 fontstacks × variable range count
    sprites/v4/light.png
    sprites/v4/light@2x.png
    sprites/v4/light.json
    sprites/v4/light@2x.json
    sprites/v4/dark.png
    sprites/v4/dark@2x.png
    sprites/v4/dark.json
    sprites/v4/dark@2x.json
  basemaps-style.json                 # committed; patched dark style pointing at /basemaps-assets/...
.review/
  phase-5-offline.md                  # short artefact: snapshot date pinned, output sizes, wifi-off result
```

**Out of scope for this plan:**
- The `<WalesMap>` MapLibre component (Phase 7a).
- The deck.gl `HeatmapLayer` / `IconLayer` overlays (Phase 7b).
- The building-coverage spot-check at Cardiff / Swansea / Newport / Wrexham (Phase 7a Critical Rule 18 — done after `wales.pmtiles` exists, but the decision artefact `.review/building-coverage.md` is owned by Phase 7a, not this phase).
- Seed data and `check:seed` (Phase 4).

---

## Pre-flight (do once before Task 1)

- [ ] Verify Phase 3 scaffolding is complete:

  ```bash
  cd "/Users/krit/Desktop/04 Web & Development/Project-Echoes"
  git tag | grep phase-3-scaffold && echo "phase 3 tag OK"
  test -f package.json && echo "package.json OK"
  test -d public && echo "public/ OK"
  test -d scripts || mkdir scripts
  ls scripts
  ```

  Expected: `phase 3 tag OK`, `package.json OK`, `public/ OK`. The `scripts/` directory may already exist from Phase 3 or be empty; create it if missing.

- [ ] Confirm wifi is ON. This phase needs internet for the planet snapshot (multi-GB read, but only the bbox subset is written locally), the four font directories (a few MB each), and the sprite sheet (small).

- [ ] Verify Bun ≥ 1.1, Homebrew available:

  ```bash
  bun --version
  brew --version
  ```

- [ ] Free disk: at least 1 GB free. The Protomaps planet snapshot is streamed and extracted; `pmtiles extract` reads only the bbox range, but temporary buffers can spike.

  ```bash
  df -h "/Users/krit/Desktop/04 Web & Development/Project-Echoes" | tail -1
  ```

---

## Task 1: Install the pmtiles CLI and pin a Protomaps planet snapshot date

The `pmtiles` CLI is a Go binary published by Protomaps. Homebrew tap is the canonical install on macOS. The Protomaps planet builds are dated; we pin one in code so re-runs are reproducible.

**Files:** none modified — install + research only.

- [ ] **Step 1: Install pmtiles via Homebrew**

  ```bash
  brew install protomaps/tap/pmtiles
  ```

  If the tap is not found, fall back to a direct download from the GitHub release page:

  ```bash
  # macOS arm64 fallback (Apple Silicon)
  curl -L -o /tmp/pmtiles.tgz \
    https://github.com/protomaps/go-pmtiles/releases/latest/download/go-pmtiles_Darwin_arm64.tar.gz
  tar -xzf /tmp/pmtiles.tgz -C /tmp
  sudo mv /tmp/pmtiles /usr/local/bin/pmtiles
  ```

  Verify:

  ```bash
  pmtiles version
  ```

  Expected: prints a version line (any 1.x is fine). If `command not found`, do not continue — `Bun.spawn` in Task 3 depends on this binary being on PATH.

- [ ] **Step 2: Discover the latest dated Protomaps planet snapshot**

  Protomaps publishes a dated planet build at `https://build.protomaps.com/YYYYMMDD.pmtiles` (no leading zeros stripped — exact 8-digit date). The index page lists recent builds.

  ```bash
  curl -s https://build.protomaps.com/ | grep -oE '[0-9]{8}\.pmtiles' | sort -u | tail -10
  ```

  Expected: a list of recent dates ending in `.pmtiles`. Pick the **most recent** entry that is older than 24 hours (very fresh builds can be partial uploads).

  Record the chosen date — a string like `20260512`. This is the `PROTOMAPS_SNAPSHOT_DATE` constant pinned in Task 2.

- [ ] **Step 3: Sanity-check the chosen snapshot URL responds**

  Replace `<DATE>` with the date string from Step 2:

  ```bash
  curl -sI "https://build.protomaps.com/<DATE>.pmtiles" | head -3
  ```

  Expected: `HTTP/2 200` (or `HTTP/1.1 200 OK`) and a `content-length` header in the 100+ GB range. The planet snapshot is a single large pmtiles archive — we will not download it whole; `pmtiles extract` does byte-range reads.

- [ ] **Step 4: Note the snapshot date for Task 2**

  Write the chosen date string somewhere temporary (a sticky note, terminal scrollback) — Task 2 hard-codes it into `scripts/fetch-tiles.ts`. The exact date used for the demo will also be recorded in `.review/phase-5-offline.md` at the close of this phase.

---

## Task 2: Create the `bbox` and `protomaps-snapshot` pure-function helpers

Pure helpers, no I/O. They live under `scripts/lib/` so Bun's test runner can exercise them without network access.

**Files:**
- Create: `scripts/lib/bbox.ts`
- Create: `scripts/lib/protomaps-snapshot.ts`

- [ ] **Step 1: Create `scripts/lib/bbox.ts`**

  ```ts
  // scripts/lib/bbox.ts
  // Bounding-box helpers for the Wales tile extract.

  export type Bbox = readonly [number, number, number, number];
  // Convention: [west, south, east, north] — same order as pmtiles extract --bbox.

  // Wales bounding box pinned by PLAN.md Phase 5.
  export const WALES_BBOX: Bbox = [-5.5, 51.3, -2.6, 53.5];

  export function parseBbox(input: string): Bbox {
    const parts = input.split(",").map((s) => Number.parseFloat(s.trim()));
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
      throw new Error(
        `Bbox must be four comma-separated numbers (west,south,east,north). Got: ${input}`,
      );
    }
    const [w, s, e, n] = parts as [number, number, number, number];
    validateBbox([w, s, e, n]);
    return [w, s, e, n] as const;
  }

  export function validateBbox(bbox: Bbox): void {
    const [w, s, e, n] = bbox;
    if (w < -180 || w > 180) throw new Error(`west out of range: ${w}`);
    if (e < -180 || e > 180) throw new Error(`east out of range: ${e}`);
    if (s < -90 || s > 90) throw new Error(`south out of range: ${s}`);
    if (n < -90 || n > 90) throw new Error(`north out of range: ${n}`);
    if (w >= e) throw new Error(`west must be < east: ${w} >= ${e}`);
    if (s >= n) throw new Error(`south must be < north: ${s} >= ${n}`);
  }

  export function bboxToCliArg(bbox: Bbox): string {
    return bbox.join(",");
  }
  ```

- [ ] **Step 2: Create `scripts/lib/protomaps-snapshot.ts`**

  Replace `<DATE>` in the `DEFAULT_SNAPSHOT_DATE` constant with the date string chosen in Task 1, Step 2. The constant is what makes re-runs reproducible.

  ```ts
  // scripts/lib/protomaps-snapshot.ts
  // Builds the dated Protomaps planet snapshot URL.
  // The date is pinned here so re-runs are reproducible. Update before the demo if a
  // newer dated build is desired; the value is also recorded in .review/phase-5-offline.md.

  // PIN THE SNAPSHOT DATE HERE. Format: YYYYMMDD.
  // Discovered via: curl -s https://build.protomaps.com/ | grep -oE '[0-9]{8}\.pmtiles'
  export const DEFAULT_SNAPSHOT_DATE = "<DATE>";

  const SNAPSHOT_BASE = "https://build.protomaps.com";

  export function buildSnapshotUrl(date: string = DEFAULT_SNAPSHOT_DATE): string {
    if (!/^\d{8}$/.test(date)) {
      throw new Error(`Snapshot date must be YYYYMMDD (8 digits). Got: ${date}`);
    }
    return `${SNAPSHOT_BASE}/${date}.pmtiles`;
  }
  ```

- [ ] **Step 3: Verify both files compile clean**

  ```bash
  bun run typecheck
  ```

  Expected: exit 0.

- [ ] **Step 4: Commit**

  ```bash
  git add scripts/lib/bbox.ts scripts/lib/protomaps-snapshot.ts
  git commit -m "feat(phase-5): add bbox + protomaps-snapshot pure helpers"
  ```

---

## Task 3: Write Bun tests for `bbox` and `protomaps-snapshot` (TDD)

Bun's built-in test runner — no Vitest/Jest install.

**Files:**
- Create: `scripts/fetch-tiles.test.ts`

- [ ] **Step 1: Write the failing tests**

  ```ts
  // scripts/fetch-tiles.test.ts
  import { describe, expect, test } from "bun:test";
  import { WALES_BBOX, bboxToCliArg, parseBbox, validateBbox } from "./lib/bbox";
  import {
    DEFAULT_SNAPSHOT_DATE,
    buildSnapshotUrl,
  } from "./lib/protomaps-snapshot";

  describe("bbox", () => {
    test("WALES_BBOX matches PLAN.md spec", () => {
      expect(WALES_BBOX).toEqual([-5.5, 51.3, -2.6, 53.5]);
    });

    test("parseBbox accepts a valid comma string", () => {
      expect(parseBbox("-5.5,51.3,-2.6,53.5")).toEqual([-5.5, 51.3, -2.6, 53.5]);
    });

    test("parseBbox tolerates whitespace", () => {
      expect(parseBbox(" -5.5 , 51.3 , -2.6 , 53.5 ")).toEqual([
        -5.5, 51.3, -2.6, 53.5,
      ]);
    });

    test("parseBbox rejects wrong arity", () => {
      expect(() => parseBbox("-5.5,51.3,-2.6")).toThrow();
    });

    test("parseBbox rejects non-numeric", () => {
      expect(() => parseBbox("a,b,c,d")).toThrow();
    });

    test("validateBbox rejects west >= east", () => {
      expect(() => validateBbox([10, 50, 5, 55])).toThrow(/west must be < east/);
    });

    test("validateBbox rejects south >= north", () => {
      expect(() => validateBbox([0, 60, 1, 50])).toThrow(
        /south must be < north/,
      );
    });

    test("validateBbox rejects out-of-range longitude", () => {
      expect(() => validateBbox([-200, 0, 1, 1])).toThrow(/west out of range/);
    });

    test("validateBbox rejects out-of-range latitude", () => {
      expect(() => validateBbox([0, -91, 1, 1])).toThrow(/south out of range/);
    });

    test("bboxToCliArg formats for pmtiles CLI", () => {
      expect(bboxToCliArg(WALES_BBOX)).toBe("-5.5,51.3,-2.6,53.5");
    });
  });

  describe("protomaps snapshot URL", () => {
    test("DEFAULT_SNAPSHOT_DATE is a YYYYMMDD string", () => {
      expect(DEFAULT_SNAPSHOT_DATE).toMatch(/^\d{8}$/);
    });

    test("buildSnapshotUrl returns the expected shape", () => {
      expect(buildSnapshotUrl("20260512")).toBe(
        "https://build.protomaps.com/20260512.pmtiles",
      );
    });

    test("buildSnapshotUrl rejects malformed dates", () => {
      expect(() => buildSnapshotUrl("2026-05-12")).toThrow();
      expect(() => buildSnapshotUrl("20260")).toThrow();
      expect(() => buildSnapshotUrl("abcdefgh")).toThrow();
    });

    test("buildSnapshotUrl defaults to DEFAULT_SNAPSHOT_DATE when omitted", () => {
      expect(buildSnapshotUrl()).toBe(
        `https://build.protomaps.com/${DEFAULT_SNAPSHOT_DATE}.pmtiles`,
      );
    });
  });
  ```

- [ ] **Step 2: Run the tests**

  ```bash
  bun test scripts/fetch-tiles.test.ts
  ```

  Expected: all tests pass (the helpers were already implemented in Task 2). If a test fails, the helper is wrong — fix the helper, not the test.

- [ ] **Step 3: Lint + typecheck stay clean**

  ```bash
  bun run lint
  bun run typecheck
  ```

  Expected: both exit 0.

- [ ] **Step 4: Commit**

  ```bash
  git add scripts/fetch-tiles.test.ts
  git commit -m "test(phase-5): bun tests for bbox + protomaps-snapshot helpers"
  ```

---

## Task 4: Build `scripts/fetch-tiles.ts` — extract Wales pmtiles via the CLI

The script: (1) checks idempotency, (2) shells out to `pmtiles extract` with the pinned URL + Wales bbox, (3) asserts output file size + tile count.

**Files:**
- Create: `scripts/fetch-tiles.ts`
- Modify: `package.json` (add `fetch-tiles` script)

- [ ] **Step 1: Create `scripts/fetch-tiles.ts`**

  ```ts
  // scripts/fetch-tiles.ts
  // Extracts a Wales-cropped subset of the dated Protomaps planet snapshot into
  // public/wales.pmtiles. Idempotent: re-running is a no-op when the output is
  // already present and passes a sanity-check. Use --force to override.

  import { existsSync, statSync } from "node:fs";
  import { resolve } from "node:path";
  import { WALES_BBOX, bboxToCliArg } from "./lib/bbox";
  import {
    DEFAULT_SNAPSHOT_DATE,
    buildSnapshotUrl,
  } from "./lib/protomaps-snapshot";

  const PROJECT_ROOT = resolve(import.meta.dir, "..");
  const OUTPUT_PATH = resolve(PROJECT_ROOT, "public/wales.pmtiles");
  // Wales pmtiles is expected at ~20–50 MB per PLAN.md. Anything under this
  // floor is almost certainly a truncated extract.
  const MIN_EXPECTED_BYTES = 5 * 1024 * 1024; // 5 MB defensive floor
  const MAX_EXPECTED_BYTES = 200 * 1024 * 1024; // 200 MB ceiling (warn)

  const argv = process.argv.slice(2);
  const force = argv.includes("--force");

  async function main(): Promise<void> {
    const url = buildSnapshotUrl();
    console.log(`[fetch-tiles] snapshot URL: ${url}`);
    console.log(`[fetch-tiles] bbox        : ${bboxToCliArg(WALES_BBOX)}`);
    console.log(`[fetch-tiles] output      : ${OUTPUT_PATH}`);
    console.log(`[fetch-tiles] snapshot date pinned: ${DEFAULT_SNAPSHOT_DATE}`);

    if (existsSync(OUTPUT_PATH) && !force) {
      const size = statSync(OUTPUT_PATH).size;
      if (size >= MIN_EXPECTED_BYTES) {
        console.log(
          `[fetch-tiles] output already present (${formatMb(size)}) — skipping. Use --force to overwrite.`,
        );
        await assertTileCount(OUTPUT_PATH);
        return;
      }
      console.log(
        `[fetch-tiles] output present but only ${formatMb(size)} — below floor; refetching.`,
      );
    }

    await ensurePmtilesCli();

    console.log("[fetch-tiles] extract starting — this can take several minutes...");
    const started = Date.now();

    const proc = Bun.spawn(
      [
        "pmtiles",
        "extract",
        url,
        OUTPUT_PATH,
        "--bbox",
        bboxToCliArg(WALES_BBOX),
      ],
      { stdout: "inherit", stderr: "inherit" },
    );
    const exitCode = await proc.exited;
    if (exitCode !== 0) {
      throw new Error(`pmtiles extract failed with exit code ${exitCode}`);
    }

    const elapsed = ((Date.now() - started) / 1000).toFixed(1);
    console.log(`[fetch-tiles] extract complete in ${elapsed}s`);

    if (!existsSync(OUTPUT_PATH)) {
      throw new Error(`pmtiles extract reported success but ${OUTPUT_PATH} is missing`);
    }
    const size = statSync(OUTPUT_PATH).size;
    console.log(`[fetch-tiles] output size  : ${formatMb(size)}`);

    if (size < MIN_EXPECTED_BYTES) {
      throw new Error(
        `output ${formatMb(size)} is below the ${formatMb(MIN_EXPECTED_BYTES)} floor — probable truncation`,
      );
    }
    if (size > MAX_EXPECTED_BYTES) {
      console.warn(
        `[fetch-tiles] WARNING: output ${formatMb(size)} exceeds ${formatMb(MAX_EXPECTED_BYTES)} — bbox may be wrong`,
      );
    }

    await assertTileCount(OUTPUT_PATH);
    console.log("[fetch-tiles] done.");
  }

  async function ensurePmtilesCli(): Promise<void> {
    const proc = Bun.spawn(["pmtiles", "version"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const exitCode = await proc.exited;
    if (exitCode !== 0) {
      throw new Error(
        "pmtiles CLI not found on PATH. Install with: brew install protomaps/tap/pmtiles",
      );
    }
    const version = (await new Response(proc.stdout).text()).trim();
    console.log(`[fetch-tiles] pmtiles CLI : ${version}`);
  }

  async function assertTileCount(path: string): Promise<void> {
    const proc = Bun.spawn(["pmtiles", "show", path], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const exitCode = await proc.exited;
    if (exitCode !== 0) {
      throw new Error("pmtiles show failed — output file may be corrupt");
    }
    const output = await new Response(proc.stdout).text();
    // pmtiles show reports tile counts in its summary lines; we just confirm
    // the binary parses the file and reports something non-trivial.
    const tileLine = output
      .split("\n")
      .find((line) => /tiles/i.test(line)) ?? "(tile-count line not found)";
    console.log(`[fetch-tiles] ${tileLine.trim()}`);
    if (output.length < 50) {
      throw new Error("pmtiles show produced suspiciously short output");
    }
  }

  function formatMb(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  main().catch((err: unknown) => {
    console.error("[fetch-tiles] FAILED:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
  ```

- [ ] **Step 2: Add the `fetch-tiles` script to `package.json`**

  Open `package.json` and add the script entry (preserve existing scripts — merge):

  ```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "fetch-tiles": "bun run scripts/fetch-tiles.ts",
    "fetch-assets": "bun run scripts/fetch-assets.ts"
  }
  ```

  (The `fetch-assets` entry is added now even though the script is created in Task 7 — keeps the scripts block consistent. If lint complains about a missing target file before Task 7, ignore it until then.)

- [ ] **Step 3: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

  Expected: both exit 0.

- [ ] **Step 4: Commit**

  ```bash
  git add scripts/fetch-tiles.ts package.json
  git commit -m "feat(phase-5): scripts/fetch-tiles.ts — Wales pmtiles extract"
  ```

---

## Task 5: Run `bun run fetch-tiles` end-to-end

Heavy network step. Expect 1–10 minutes depending on the Protomaps origin and the engineer's bandwidth.

**Files:**
- Creates: `public/wales.pmtiles` (gitignored)

- [ ] **Step 1: Run the fetch**

  ```bash
  bun run fetch-tiles
  ```

  Expected console output (illustrative):

  ```
  [fetch-tiles] snapshot URL: https://build.protomaps.com/20260512.pmtiles
  [fetch-tiles] bbox        : -5.5,51.3,-2.6,53.5
  [fetch-tiles] output      : /Users/krit/.../public/wales.pmtiles
  [fetch-tiles] snapshot date pinned: 20260512
  [fetch-tiles] pmtiles CLI : pmtiles version 1.x.x
  [fetch-tiles] extract starting — this can take several minutes...
  [fetch-tiles] extract complete in 187.4s
  [fetch-tiles] output size  : 34.7 MB
  [fetch-tiles] tiles: ...
  [fetch-tiles] done.
  ```

  Expected: exit 0, output size in the 5–200 MB band (typically 20–50 MB per PLAN.md).

  If the extract fails partway, re-run — `pmtiles extract` is resumable in some versions but for safety pass `--force` after a failure:

  ```bash
  bun run fetch-tiles --force
  ```

- [ ] **Step 2: Verify the output file**

  ```bash
  test -f public/wales.pmtiles && echo "wales.pmtiles OK"
  ls -lh public/wales.pmtiles
  pmtiles show public/wales.pmtiles | head -20
  ```

  Expected: file exists, size 5–200 MB, `pmtiles show` prints a summary (bounds, zoom range, tile count, metadata) without errors.

- [ ] **Step 3: Idempotency check**

  ```bash
  bun run fetch-tiles
  ```

  Expected: prints `output already present (XX.X MB) — skipping. Use --force to overwrite.` Exits 0 in under a few seconds.

- [ ] **Step 4: Confirm `.gitignore` already excludes the output**

  ```bash
  git status public/wales.pmtiles
  ```

  Expected: the file does not appear in `git status` (Phase 3 added `public/wales.pmtiles` to `.gitignore`). If it does appear, append to `.gitignore`:

  ```bash
  printf '\npublic/wales.pmtiles\n' >> .gitignore
  git add .gitignore
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit --allow-empty -m "chore(phase-5): wales.pmtiles generated locally (gitignored)"
  ```

  (Empty commit OK — the artefact itself is gitignored; this commit just records that the engineer ran the step.)

---

## Task 6: Create the style-patcher pure helper + Bun tests

The patcher rewrites `glyphs` and `sprite` URLs in a protomaps-themes-base style JSON from the CDN to local `/basemaps-assets/...`. Pure function — given a style object and options, return a new style object. No I/O.

**Files:**
- Create: `scripts/lib/style-patcher.ts`
- Create: `scripts/fetch-assets.test.ts`

- [ ] **Step 1: Create `scripts/lib/style-patcher.ts`**

  ```ts
  // scripts/lib/style-patcher.ts
  // Rewrites the protomaps-themes-base style JSON so MapLibre resolves glyphs
  // and sprites from the local /basemaps-assets/ path instead of the
  // protomaps.github.io CDN. Without this patch, MapLibre quietly fetches font
  // PBFs from the CDN at runtime — silently breaking the offline guarantee.

  // Loose shape: we only touch glyphs + sprite; everything else passes through.
  export interface MaplibreStyleLike {
    version?: number;
    glyphs?: string;
    sprite?: string | Array<{ id: string; url: string }>;
    [key: string]: unknown;
  }

  export interface PatchOptions {
    // The sprite variant we care about for the demo. PLAN.md picks the dark flavor.
    spriteVariant: "dark" | "light";
    // Optional override; defaults to "/basemaps-assets". Must be a server-rooted path.
    localBase?: string;
  }

  const CDN_HOST = "protomaps.github.io/basemaps-assets";

  export function patchStyleForLocalAssets(
    style: MaplibreStyleLike,
    opts: PatchOptions,
  ): MaplibreStyleLike {
    const base = opts.localBase ?? "/basemaps-assets";
    if (!base.startsWith("/")) {
      throw new Error(`localBase must be server-rooted (start with '/'): ${base}`);
    }

    const patched: MaplibreStyleLike = { ...style };

    if (typeof patched.glyphs === "string" && patched.glyphs.includes(CDN_HOST)) {
      patched.glyphs = `${base}/fonts/{fontstack}/{range}.pbf`;
    }

    // sprite may be a string OR an array of { id, url } since MapLibre 3.x.
    if (typeof patched.sprite === "string") {
      patched.sprite = `${base}/sprites/v4/${opts.spriteVariant}`;
    } else if (Array.isArray(patched.sprite)) {
      patched.sprite = patched.sprite.map((entry) => ({
        ...entry,
        url: `${base}/sprites/v4/${opts.spriteVariant}`,
      }));
    } else {
      // No sprite field — inject one so MapLibre finds our local sprite sheet.
      patched.sprite = `${base}/sprites/v4/${opts.spriteVariant}`;
    }

    return patched;
  }
  ```

- [ ] **Step 2: Create `scripts/fetch-assets.test.ts`**

  ```ts
  // scripts/fetch-assets.test.ts
  import { describe, expect, test } from "bun:test";
  import { patchStyleForLocalAssets } from "./lib/style-patcher";

  describe("patchStyleForLocalAssets", () => {
    test("rewrites a CDN glyphs URL to local path", () => {
      const input = {
        version: 8,
        glyphs:
          "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
        sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/dark",
      };
      const out = patchStyleForLocalAssets(input, { spriteVariant: "dark" });
      expect(out.glyphs).toBe("/basemaps-assets/fonts/{fontstack}/{range}.pbf");
      expect(out.sprite).toBe("/basemaps-assets/sprites/v4/dark");
    });

    test("uses the requested sprite variant", () => {
      const out = patchStyleForLocalAssets(
        { version: 8, glyphs: "https://protomaps.github.io/basemaps-assets/x" },
        { spriteVariant: "light" },
      );
      expect(out.sprite).toBe("/basemaps-assets/sprites/v4/light");
    });

    test("handles missing sprite by injecting one", () => {
      const out = patchStyleForLocalAssets(
        { version: 8, glyphs: "https://protomaps.github.io/basemaps-assets/x" },
        { spriteVariant: "dark" },
      );
      expect(out.sprite).toBe("/basemaps-assets/sprites/v4/dark");
    });

    test("handles array-form sprite (MapLibre 3.x)", () => {
      const out = patchStyleForLocalAssets(
        {
          version: 8,
          glyphs: "https://protomaps.github.io/basemaps-assets/x",
          sprite: [
            { id: "default", url: "https://protomaps.github.io/basemaps-assets/sprites/v4/dark" },
          ],
        },
        { spriteVariant: "dark" },
      );
      expect(out.sprite).toEqual([
        { id: "default", url: "/basemaps-assets/sprites/v4/dark" },
      ]);
    });

    test("does not mutate the input style", () => {
      const input = {
        version: 8,
        glyphs:
          "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
        sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/dark",
      };
      patchStyleForLocalAssets(input, { spriteVariant: "dark" });
      expect(input.glyphs).toBe(
        "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
      );
      expect(input.sprite).toBe(
        "https://protomaps.github.io/basemaps-assets/sprites/v4/dark",
      );
    });

    test("rejects localBase that is not server-rooted", () => {
      expect(() =>
        patchStyleForLocalAssets(
          { version: 8, glyphs: "https://protomaps.github.io/basemaps-assets/x" },
          { spriteVariant: "dark", localBase: "basemaps-assets" },
        ),
      ).toThrow(/server-rooted/);
    });

    test("preserves unrelated style fields", () => {
      const out = patchStyleForLocalAssets(
        {
          version: 8,
          glyphs: "https://protomaps.github.io/basemaps-assets/x",
          sources: { protomaps: { type: "vector", url: "pmtiles://wales.pmtiles" } },
          layers: [{ id: "background", type: "background" }],
        },
        { spriteVariant: "dark" },
      );
      expect(out.version).toBe(8);
      expect(out.sources).toEqual({
        protomaps: { type: "vector", url: "pmtiles://wales.pmtiles" },
      });
      expect(out.layers).toEqual([{ id: "background", type: "background" }]);
    });
  });
  ```

- [ ] **Step 3: Run the tests**

  ```bash
  bun test scripts/fetch-assets.test.ts
  ```

  Expected: all 7 tests pass.

- [ ] **Step 4: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

  Expected: both exit 0.

- [ ] **Step 5: Commit**

  ```bash
  git add scripts/lib/style-patcher.ts scripts/fetch-assets.test.ts
  git commit -m "feat(phase-5): style-patcher pure helper + bun tests"
  ```

---

## Task 7: Create `scripts/fetch-assets.ts` skeleton — install the source npm package and wire CLI flags

The script needs the unpatched protomaps-themes-base style JSON as its input. The cleanest source is the published npm package, which exports a `layers()` builder and a `noOp` style template. We install it as a dev dependency.

**Files:**
- Create: `scripts/fetch-assets.ts` (skeleton only — fan-out implementations in Tasks 8–9)
- Modify: `package.json` (add `protomaps-themes-base` dev dependency)

- [ ] **Step 1: Install protomaps-themes-base**

  ```bash
  bun add -d protomaps-themes-base
  ```

  Verify it landed:

  ```bash
  bun pm ls | grep protomaps-themes-base
  ```

  Expected: a single entry, version 4.x.

- [ ] **Step 2: Create `scripts/fetch-assets.ts` skeleton**

  ```ts
  // scripts/fetch-assets.ts
  // Downloads the MapLibre glyph PBFs + sprite sheets for protomaps-themes-base
  // into public/basemaps-assets/, then writes a patched style JSON to
  // public/basemaps-style.json with glyphs + sprite URLs pointing at the local
  // paths. Idempotent: re-running skips files that already exist on disk.
  // Use --force to redownload everything.

  import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
  import { dirname, resolve } from "node:path";
  import { patchStyleForLocalAssets } from "./lib/style-patcher";

  const PROJECT_ROOT = resolve(import.meta.dir, "..");
  const ASSETS_DIR = resolve(PROJECT_ROOT, "public/basemaps-assets");
  const STYLE_OUT = resolve(PROJECT_ROOT, "public/basemaps-style.json");
  const CDN_BASE = "https://protomaps.github.io/basemaps-assets";

  // The four fontstacks the protomaps-themes-base dark style references.
  const FONTSTACKS = [
    "Noto Sans Regular",
    "Noto Sans Italic",
    "Noto Sans Medium",
    "Noto Sans Bold",
  ] as const;

  // Sprite variants we download. We patch the style to point at "dark" but
  // include "light" too — cheap and lets us flip the variant without re-running.
  const SPRITE_VARIANTS = ["light", "dark"] as const;
  const SPRITE_SUFFIXES = [".png", "@2x.png", ".json", "@2x.json"] as const;

  // Glyph PBFs are 256-character unicode ranges. Most fonts cover Latin (0–255),
  // Latin Extended (256–767), and a long tail. We try a generous span and accept
  // 404s for unused ranges. The patched style requests by range as MapLibre
  // pans; only the ranges we actually try to fetch in this script are
  // available offline, so cover all common scripts the demo might touch.
  const GLYPH_RANGES: Array<{ start: number; end: number }> = (() => {
    const ranges: Array<{ start: number; end: number }> = [];
    for (let start = 0; start <= 65535; start += 256) {
      ranges.push({ start, end: start + 255 });
    }
    return ranges;
  })();

  const argv = process.argv.slice(2);
  const force = argv.includes("--force");

  async function main(): Promise<void> {
    console.log(`[fetch-assets] assets dir : ${ASSETS_DIR}`);
    console.log(`[fetch-assets] style out  : ${STYLE_OUT}`);
    console.log(`[fetch-assets] force      : ${force}`);

    mkdirSync(ASSETS_DIR, { recursive: true });

    await downloadGlyphs();
    await downloadSprites();
    await writePatchedStyle();

    console.log("[fetch-assets] done.");
  }

  // ------- implemented in Task 8 -------
  async function downloadGlyphs(): Promise<void> {
    throw new Error("Not implemented yet — Task 8");
  }

  // ------- implemented in Task 9 -------
  async function downloadSprites(): Promise<void> {
    throw new Error("Not implemented yet — Task 9");
  }

  // ------- implemented in Task 10 -------
  async function writePatchedStyle(): Promise<void> {
    throw new Error("Not implemented yet — Task 10");
  }

  // ------- shared helpers used by all three -------
  async function downloadIfMissing(
    url: string,
    outPath: string,
  ): Promise<"downloaded" | "skipped" | "missing"> {
    if (existsSync(outPath) && !force) {
      const size = statSync(outPath).size;
      if (size > 0) return "skipped";
    }
    const res = await fetch(url);
    if (res.status === 404) return "missing";
    if (!res.ok) {
      throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`);
    }
    const buf = await res.arrayBuffer();
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, new Uint8Array(buf));
    return "downloaded";
  }

  main().catch((err: unknown) => {
    console.error(
      "[fetch-assets] FAILED:",
      err instanceof Error ? err.message : err,
    );
    process.exit(1);
  });

  // Re-export constants so subsequent tasks can edit + test against them.
  export {
    ASSETS_DIR,
    CDN_BASE,
    FONTSTACKS,
    GLYPH_RANGES,
    SPRITE_SUFFIXES,
    SPRITE_VARIANTS,
    STYLE_OUT,
    downloadIfMissing,
  };
  ```

  Notes:
  - The three placeholder functions deliberately throw so a half-implemented run is loud, not silent. Tasks 8, 9, 10 fill them in.
  - The `protomaps-themes-base` package is installed but not yet imported — Task 10 imports its style template.

- [ ] **Step 3: Confirm the skeleton compiles and the three placeholders throw**

  ```bash
  bun run typecheck
  bun run fetch-assets 2>&1 | head -10 || true
  ```

  Expected: typecheck passes; the run prints the `assets dir` / `style out` / `force` header lines, then fails with `Not implemented yet — Task 8`. Exit code 1.

- [ ] **Step 4: Commit**

  ```bash
  git add scripts/fetch-assets.ts package.json bun.lock
  git commit -m "feat(phase-5): fetch-assets.ts skeleton + protomaps-themes-base dep"
  ```

  (If your repo uses `bun.lockb` binary form rather than `bun.lock`, the file name differs — `git add -A` captures it either way.)

---

## Task 8: Implement glyph PBF download fan-out

Each fontstack has up to ~256 range files of the form `0-255.pbf`, `256-511.pbf`, ..., `65280-65535.pbf`. The CDN returns 404 for ranges the font does not cover — that is the correct signal to skip.

**Files:**
- Modify: `scripts/fetch-assets.ts` (implement `downloadGlyphs`)

- [ ] **Step 1: Replace the placeholder `downloadGlyphs` in `scripts/fetch-assets.ts`**

  Find the existing block:

  ```ts
  // ------- implemented in Task 8 -------
  async function downloadGlyphs(): Promise<void> {
    throw new Error("Not implemented yet — Task 8");
  }
  ```

  Replace with:

  ```ts
  async function downloadGlyphs(): Promise<void> {
    console.log(`[fetch-assets] glyphs: ${FONTSTACKS.length} fontstacks`);

    for (const fontstack of FONTSTACKS) {
      const fontDir = resolve(ASSETS_DIR, "fonts", fontstack);
      mkdirSync(fontDir, { recursive: true });

      const encodedFontstack = encodeURIComponent(fontstack);
      let downloaded = 0;
      let skipped = 0;
      let missing = 0;

      // Sequential per fontstack — keeps the run readable and avoids CDN rate
      // limits. The full enumeration is ~256 HEAD/GETs per fontstack; runtime
      // is dominated by the slowest GET, not the count.
      for (const range of GLYPH_RANGES) {
        const fileName = `${range.start}-${range.end}.pbf`;
        const url = `${CDN_BASE}/fonts/${encodedFontstack}/${fileName}`;
        const outPath = resolve(fontDir, fileName);
        const result = await downloadIfMissing(url, outPath);
        if (result === "downloaded") downloaded += 1;
        else if (result === "skipped") skipped += 1;
        else missing += 1;
      }

      const total = downloaded + skipped;
      console.log(
        `[fetch-assets]   ${fontstack}: ${total} files present (${downloaded} new, ${skipped} cached, ${missing} not covered by font)`,
      );
      if (total === 0) {
        throw new Error(
          `No glyph ranges fetched for fontstack '${fontstack}'. CDN may be down or the fontstack name is wrong.`,
        );
      }
    }
  }
  ```

  Notes:
  - `encodeURIComponent` escapes the space in `"Noto Sans Regular"` → `Noto%20Sans%20Regular`.
  - Sequential download keeps the log readable. Total runtime is a few minutes; acceptable for a build-time script. If parallelism is wanted later, a `Promise.all` in batches of 8 is the obvious knob — out of scope for this phase.
  - The `total === 0` guard catches the most common silent failure: the fontstack name has changed upstream and every URL 404s.

- [ ] **Step 2: Confirm typecheck still passes**

  ```bash
  bun run typecheck
  ```

- [ ] **Step 3: Smoke-run just the glyph step (sprites + style writer still placeholders)**

  We expect the run to download glyphs successfully, then fail at the next placeholder. That's the right signal.

  ```bash
  bun run fetch-assets 2>&1 | tee /tmp/echoes-fetch-assets.log | tail -40
  ```

  Expected (illustrative):
  ```
  [fetch-assets]   Noto Sans Regular: 12 files present (12 new, 0 cached, 244 not covered by font)
  [fetch-assets]   Noto Sans Italic: 9 files present (...)
  ...
  [fetch-assets] FAILED: Not implemented yet — Task 9
  ```

  Then verify on disk:

  ```bash
  find public/basemaps-assets/fonts -name '*.pbf' | wc -l
  ```

  Expected: > 30 PBF files across the four fontstacks (the exact count depends on which unicode ranges Noto Sans actually covers; ~10–60 is normal).

- [ ] **Step 4: Idempotency check**

  ```bash
  bun run fetch-assets 2>&1 | grep -E '(cached|new)' | head -5
  ```

  Expected: every line shows `(0 new, N cached, ...)` — files already present are skipped.

- [ ] **Step 5: Lint stays clean**

  ```bash
  bun run lint
  ```

- [ ] **Step 6: Commit**

  ```bash
  git add scripts/fetch-assets.ts
  git commit -m "feat(phase-5): fetch-assets glyph PBF fan-out (4 fontstacks × ranges)"
  ```

---

## Task 9: Implement sprite sheet download

8 files: 2 variants × 4 suffixes (`.png`, `@2x.png`, `.json`, `@2x.json`). All required for retina + non-retina rendering.

**Files:**
- Modify: `scripts/fetch-assets.ts` (implement `downloadSprites`)

- [ ] **Step 1: Replace the placeholder `downloadSprites`**

  Find:

  ```ts
  // ------- implemented in Task 9 -------
  async function downloadSprites(): Promise<void> {
    throw new Error("Not implemented yet — Task 9");
  }
  ```

  Replace with:

  ```ts
  async function downloadSprites(): Promise<void> {
    const spriteDir = resolve(ASSETS_DIR, "sprites/v4");
    mkdirSync(spriteDir, { recursive: true });

    let downloaded = 0;
    let skipped = 0;

    for (const variant of SPRITE_VARIANTS) {
      for (const suffix of SPRITE_SUFFIXES) {
        const fileName = `${variant}${suffix}`;
        const url = `${CDN_BASE}/sprites/v4/${fileName}`;
        const outPath = resolve(spriteDir, fileName);
        const result = await downloadIfMissing(url, outPath);
        if (result === "downloaded") downloaded += 1;
        else if (result === "skipped") skipped += 1;
        else throw new Error(`sprite ${url} returned 404 — expected to exist`);
      }
    }

    console.log(
      `[fetch-assets] sprites: ${downloaded + skipped} files (${downloaded} new, ${skipped} cached)`,
    );
  }
  ```

  Notes:
  - Sprites are mandatory (unlike glyph ranges, which can legitimately 404). A 404 here is a real error.

- [ ] **Step 2: Re-run and confirm sprites download, style step still fails**

  ```bash
  bun run fetch-assets 2>&1 | tail -20
  ```

  Expected: sprite line `sprites: 8 files (8 new, 0 cached)` followed by `FAILED: Not implemented yet — Task 10`. Exit code 1.

  Verify on disk:

  ```bash
  ls public/basemaps-assets/sprites/v4
  ```

  Expected: `dark.json  dark.png  dark@2x.json  dark@2x.png  light.json  light.png  light@2x.json  light@2x.png` (8 files).

- [ ] **Step 3: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

  Expected: both exit 0.

- [ ] **Step 4: Commit**

  ```bash
  git add scripts/fetch-assets.ts
  git commit -m "feat(phase-5): fetch-assets sprite sheet downloads (light + dark, 8 files)"
  ```

---

## Task 10: Implement style-JSON writer (uses the Task 6 patcher)

Loads the protomaps-themes-base dark style template, runs it through `patchStyleForLocalAssets`, and writes the result to `public/basemaps-style.json` — which is the URL MapLibre will load in Phase 7.

**Files:**
- Modify: `scripts/fetch-assets.ts` (implement `writePatchedStyle`, import the package)

- [ ] **Step 1: Inspect what protomaps-themes-base exports**

  The package's API has shifted across versions; confirm the shape before importing.

  ```bash
  bun pm ls | grep protomaps-themes-base
  cat node_modules/protomaps-themes-base/package.json | grep -E '"(main|module|exports)"'
  ls node_modules/protomaps-themes-base/dist 2>/dev/null || ls node_modules/protomaps-themes-base
  ```

  As of v4.x the package typically exports a `layers(sourceName, variant)` function returning an array of MapLibre layer specs, plus a `noOp` style template. The pattern below assumes that shape; if `bun pm ls` shows a major version > 5, double-check the README at `node_modules/protomaps-themes-base/README.md` and adapt the import call below.

- [ ] **Step 2: Replace the placeholder `writePatchedStyle`**

  Add this import to the top of `scripts/fetch-assets.ts`, just below the existing imports:

  ```ts
  import * as protomaps from "protomaps-themes-base";
  ```

  Replace the placeholder:

  ```ts
  // ------- implemented in Task 10 -------
  async function writePatchedStyle(): Promise<void> {
    throw new Error("Not implemented yet — Task 10");
  }
  ```

  with:

  ```ts
  async function writePatchedStyle(): Promise<void> {
    // Build the base style. protomaps-themes-base v4+ exposes a layers()
    // builder and a noOp style template; we compose them, then patch the
    // result so glyphs + sprite point at local paths.
    //
    // Source name "protomaps" is the conventional id; Phase 7a's MapLibre
    // wiring will declare a vector source with the same id pointing at
    // pmtiles://wales.pmtiles.

    const variant = "dark";
    const sourceName = "protomaps";

    const baseStyle = {
      version: 8 as const,
      glyphs: `${CDN_BASE}/fonts/{fontstack}/{range}.pbf`,
      sprite: `${CDN_BASE}/sprites/v4/${variant}`,
      sources: {
        [sourceName]: {
          type: "vector" as const,
          // Phase 7a replaces this URL with `pmtiles://${origin}/wales.pmtiles`
          // at runtime via the pmtiles protocol handler. For this build-time
          // step the value is a placeholder — MapLibre never loads this file
          // directly off disk; Phase 7a does the protocol-handler wiring.
          url: "pmtiles:///wales.pmtiles",
          attribution:
            '<a href="https://protomaps.com">Protomaps</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        },
      },
      layers:
        typeof (protomaps as { layers?: unknown }).layers === "function"
          ? (protomaps as { layers: (s: string, v: string) => unknown[] }).layers(
              sourceName,
              variant,
            )
          : [],
    };

    if (!Array.isArray(baseStyle.layers) || baseStyle.layers.length === 0) {
      throw new Error(
        "protomaps-themes-base did not return any layers — check the package version and its README at node_modules/protomaps-themes-base/README.md.",
      );
    }

    const patched = patchStyleForLocalAssets(baseStyle, {
      spriteVariant: variant,
    });

    writeFileSync(STYLE_OUT, `${JSON.stringify(patched, null, 2)}\n`);
    console.log(
      `[fetch-assets] style written: ${STYLE_OUT} (${baseStyle.layers.length} layers, sprite=${variant})`,
    );
  }
  ```

- [ ] **Step 3: Run end-to-end**

  ```bash
  bun run fetch-assets
  ```

  Expected:
  - All four glyph fontstacks report `(0 new, N cached, M not covered by font)` (because Task 8 already populated them).
  - Sprites report `8 files (0 new, 8 cached)`.
  - `style written: .../public/basemaps-style.json (NN layers, sprite=dark)`.
  - Exit 0.

- [ ] **Step 4: Verify the patched style**

  ```bash
  test -f public/basemaps-style.json && echo "style OK"
  grep -E '"glyphs":|"sprite":' public/basemaps-style.json | head -5
  ```

  Expected:
  ```
  "glyphs": "/basemaps-assets/fonts/{fontstack}/{range}.pbf",
  "sprite": "/basemaps-assets/sprites/v4/dark",
  ```

  No `protomaps.github.io` substrings in the glyphs or sprite values:

  ```bash
  grep -E '(glyphs|sprite)' public/basemaps-style.json | grep -c protomaps.github.io || echo "0"
  ```

  Expected: `0`.

- [ ] **Step 5: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

  Expected: both exit 0.

- [ ] **Step 6: Commit**

  ```bash
  git add scripts/fetch-assets.ts public/basemaps-style.json
  git commit -m "feat(phase-5): write patched dark style to public/basemaps-style.json"
  ```

  Note: `public/basemaps-style.json` IS committed (it's small, deterministic, and Phase 7a needs it). Only `public/basemaps-assets/` and `public/wales.pmtiles` are gitignored.

---

## Task 11: Ensure `public/basemaps-assets/` is gitignored

`public/wales.pmtiles` was added to `.gitignore` in Phase 3. Confirm `public/basemaps-assets/` is also ignored. Phase 3's plan attempted to add it; verify and add if missing.

**Files:**
- Modify (if needed): `.gitignore`

- [ ] **Step 1: Check current state**

  ```bash
  grep -E '^public/basemaps-assets|^public/wales.pmtiles' .gitignore || echo "missing entries"
  ```

  Expected: both lines appear. If `missing entries`, append them:

  ```bash
  printf '\npublic/basemaps-assets/\npublic/wales.pmtiles\n' >> .gitignore
  ```

- [ ] **Step 2: Confirm git is not tracking anything in `public/basemaps-assets/`**

  ```bash
  git status public/basemaps-assets/ public/wales.pmtiles
  ```

  Expected: no entries listed (both paths are ignored).

- [ ] **Step 3: Commit if `.gitignore` was modified**

  ```bash
  git diff --quiet .gitignore || (git add .gitignore && git commit -m "chore(phase-5): gitignore public/basemaps-assets/")
  ```

---

## Task 12: Add a small integration sanity-check — patched style references resolve on the dev server

Boot `next dev`, fetch the patched style, and verify a sample glyph PBF + the dark sprite PNG return 200 from the local server. This is the cheap version of "MapLibre will find these files" without standing up MapLibre itself.

**Files:** none modified — verification only.

- [ ] **Step 1: Boot the dev server**

  ```bash
  bun run dev &
  DEV_PID=$!
  sleep 6
  ```

- [ ] **Step 2: Confirm the style JSON is served**

  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/basemaps-style.json
  ```

  Expected: `200`.

- [ ] **Step 3: Confirm the dark sprite PNG is served**

  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/basemaps-assets/sprites/v4/dark.png
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/basemaps-assets/sprites/v4/dark@2x.png
  ```

  Expected: both `200`.

- [ ] **Step 4: Confirm at least one glyph PBF is served**

  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" \
    'http://localhost:3000/basemaps-assets/fonts/Noto%20Sans%20Regular/0-255.pbf'
  ```

  Expected: `200`. (If `0-255.pbf` was not downloaded for that fontstack, try `256-511.pbf` — whichever range is present per the Task 8 fan-out.)

- [ ] **Step 5: Confirm the style references only local paths**

  ```bash
  curl -s http://localhost:3000/basemaps-style.json \
    | grep -E '"glyphs"|"sprite"' | head -5
  ```

  Expected: every printed line has a path starting with `/basemaps-assets/...`. Zero `protomaps.github.io` references.

- [ ] **Step 6: Stop the dev server**

  ```bash
  kill $DEV_PID
  ```

---

## Task 13: Offline-render dry run — manual wifi-off check

The closest we can get without Phase 7's MapLibre component: run the production build, disable wifi, hit the patched style + a sample glyph + a sprite. If those serve over a wifi-off connection, MapLibre in Phase 7 will too. Documenting the result in `.review/phase-5-offline.md` is part of the phase close.

**Files:**
- Create: `.review/phase-5-offline.md`

- [ ] **Step 1: Production build**

  ```bash
  bun run build
  ```

  Expected: build exits 0. If Bun segfaults (documented risk in PLAN.md), fall back:

  ```bash
  npm run build
  ```

- [ ] **Step 2: Start the production server**

  ```bash
  bun run start &
  START_PID=$!
  sleep 5
  ```

- [ ] **Step 3: Disable wifi**

  Manually: macOS menu bar → Wi-Fi → Turn Off. Or `networksetup -setairportpower en0 off` (require sudo on some configs).

  Confirm:

  ```bash
  ping -c 2 -W 2 1.1.1.1 || echo "wifi off — good"
  ```

  Expected: ping fails (or times out), then prints `wifi off — good`.

- [ ] **Step 4: Hit the local assets — they must still serve**

  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/basemaps-style.json
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/basemaps-assets/sprites/v4/dark.png
  curl -s -o /dev/null -w "%{http_code}\n" \
    'http://localhost:3000/basemaps-assets/fonts/Noto%20Sans%20Regular/0-255.pbf'
  ```

  Expected: three `200`s.

- [ ] **Step 5: DevTools Network-tab check (manual)**

  Open `http://localhost:3000/` in a browser. Open DevTools → Network tab → reload. Filter by "External" or sort by Domain. Confirm: no requests to `protomaps.github.io`, `fonts.googleapis.com`, `fonts.gstatic.com`, or any other external CDN.

  This check is a stand-in for the proper Phase 7 verification — once MapLibre is wired the same check must be repeated with the map actually rendering.

- [ ] **Step 6: Re-enable wifi and stop the server**

  ```bash
  kill $START_PID
  # Re-enable wifi via menu bar OR:
  # networksetup -setairportpower en0 on
  ```

- [ ] **Step 7: Write `.review/phase-5-offline.md`**

  ```bash
  mkdir -p .review
  ```

  Create `.review/phase-5-offline.md` with the following content (replace the bracketed values from your run):

  ```markdown
  # Phase 5 — Offline tiles + basemaps-assets verification

  Date run: 2026-05-14
  Engineer: Krit

  ## Pinned Protomaps snapshot

  - Snapshot date: `[YYYYMMDD from scripts/lib/protomaps-snapshot.ts DEFAULT_SNAPSHOT_DATE]`
  - Snapshot URL: `https://build.protomaps.com/[YYYYMMDD].pmtiles`

  ## Outputs

  - `public/wales.pmtiles`: `[XX.X] MB` (target band 20–50 MB; defensive floor 5 MB).
  - `public/basemaps-assets/fonts/`: 4 fontstacks (Noto Sans Regular, Italic, Medium, Bold). Total PBF count: `[N]`.
  - `public/basemaps-assets/sprites/v4/`: 8 files (light + dark, .png/@2x.png/.json/@2x.json).
  - `public/basemaps-style.json`: patched dark style; `glyphs` and `sprite` point at `/basemaps-assets/...`; zero CDN references.

  ## Wifi-off check

  - `bun run build` succeeded with wifi ON.
  - `bun run start` boots cleanly.
  - With wifi disabled:
    - `GET /basemaps-style.json` → 200.
    - `GET /basemaps-assets/sprites/v4/dark.png` → 200.
    - `GET /basemaps-assets/fonts/Noto%20Sans%20Regular/0-255.pbf` → 200.
    - DevTools Network tab on `/` shows zero external requests.

  ## Notes / follow-ups for Phase 7a

  - Building-coverage spot-check at Cardiff (CF10), Swansea (SA1), Newport (NP19), Wrexham (LL11) is owed by Phase 7a per PLAN.md Critical Rule 18. Tooling: `npx pmtiles serve public/wales.pmtiles` + the inspector at https://protomaps.github.io/PMTiles/.
  - Phase 7a must replace the placeholder `pmtiles:///wales.pmtiles` source URL in `public/basemaps-style.json` with the real protocol-handler URL once the MapLibre map mounts.
  ```

- [ ] **Step 8: Commit**

  ```bash
  git add .review/phase-5-offline.md
  git commit -m "docs(phase-5): record offline verification artefact"
  ```

---

## Task 14: Phase-5 close — final sanity sweep + tag

**Files:** none modified — verification + tag only.

- [ ] **Step 1: Re-run both fetch scripts idempotently — both must short-circuit**

  ```bash
  bun run fetch-tiles
  bun run fetch-assets
  ```

  Expected: both exit 0 in under 10 seconds. `fetch-tiles` prints `output already present (XX.X MB) — skipping.` `fetch-assets` reports every file as cached.

- [ ] **Step 2: Re-run Bun tests**

  ```bash
  bun test scripts/fetch-tiles.test.ts scripts/fetch-assets.test.ts
  ```

  Expected: all tests pass (12+ tests across both files).

- [ ] **Step 3: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

  Expected: both exit 0.

- [ ] **Step 4: Production build remains green**

  ```bash
  bun run build
  ```

  Expected: build exits 0. Fall back to `npm run build` if Bun segfaults.

- [ ] **Step 5: Phase-5 close commit + tag**

  ```bash
  git add -A
  git commit --allow-empty -m "chore(phase-5): close offline tiles + basemaps-assets self-hosting"
  git tag phase-5-offline-tiles
  ```

- [ ] **Step 6: Update CLAUDE.md status line**

  Open `CLAUDE.md` and update the `## Status` paragraph to reflect Phase 5 complete:

  > **Phase 5 complete (2026-05-14).** Offline tile pipeline shipped: `public/wales.pmtiles` (Wales bbox extract) + `public/basemaps-assets/` (self-hosted glyph PBFs + sprite sheets) + `public/basemaps-style.json` (patched protomaps-themes-base dark style). Tag: `phase-5-offline-tiles`. Wifi-off check passes for the patched style + a sample PBF + the dark sprite. Next: Phase 6 core components, then Phase 7a MapLibre wiring (consumes these outputs).

  ```bash
  git add CLAUDE.md
  git commit -m "docs: mark phase 5 offline tiles complete in CLAUDE.md"
  ```

---

## Definition of Done

Phase 5 closes when all of the following hold:

1. All 14 task checkboxes are ticked.
2. `git tag phase-5-offline-tiles` exists and points at a green build.
3. `public/wales.pmtiles` exists on disk, size ≥ 5 MB (target 20–50 MB), and `pmtiles show public/wales.pmtiles` reports valid metadata + tile count.
4. `public/basemaps-assets/fonts/` contains four fontstack directories (Noto Sans Regular/Italic/Medium/Bold) with at least one PBF each. `public/basemaps-assets/sprites/v4/` contains all eight sprite files (light + dark × .png / @2x.png / .json / @2x.json).
5. `public/basemaps-style.json` exists, contains `"glyphs": "/basemaps-assets/fonts/{fontstack}/{range}.pbf"` and `"sprite": "/basemaps-assets/sprites/v4/dark"`, references the `protomaps` source, has a non-empty `layers` array, and contains zero `protomaps.github.io` substrings.
6. `bun run fetch-tiles` is idempotent — a second invocation completes in under 10 s without re-downloading.
7. `bun run fetch-assets` is idempotent — a second invocation reports every file cached.
8. `bun test scripts/fetch-tiles.test.ts scripts/fetch-assets.test.ts` — all pure-function tests pass.
9. `bun run typecheck` and `bun run lint` exit 0.
10. With wifi disabled, `bun run start` serves `/basemaps-style.json`, `/basemaps-assets/sprites/v4/dark.png`, and a sample glyph PBF — all 200. DevTools Network tab on `/` shows zero external requests.
11. `.review/phase-5-offline.md` is committed and records: pinned snapshot date, output sizes, wifi-off result.
12. `CLAUDE.md` Status section reflects Phase 5 complete.

---

## Out of scope — handled in later plans

- `<WalesMap>` MapLibre component + `pmtiles` protocol handler wiring (Phase 7a).
- `@deck.gl/mapbox` `HeatmapLayer` + `IconLayer` overlays (Phase 7b).
- The Cardiff / Swansea / Newport / Wrexham building-coverage spot-check + `.review/building-coverage.md` decision (Phase 7a, Critical Rule 18).
- Replacing the placeholder `pmtiles:///wales.pmtiles` source URL in `public/basemaps-style.json` with the real protocol-handler URL — Phase 7a, alongside the MapLibre mount.
- Seed data + `check:seed` (Phase 4 — independent of this phase).
- Playwright smoke that asserts the map container renders (Phase 13).
- Pre-flight wifi-off check with the full map rendered including labels and 3D buildings (Phase 14).

Each subsequent plan follows the same file naming convention: `docs/superpowers/plans/YYYY-MM-DD-<short-name>.md`.
