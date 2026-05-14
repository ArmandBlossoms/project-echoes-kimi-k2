# Project Echoes — Core Components Implementation Plan (Phase 6)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the seven dashboard panel components plus the two filter chrome components (`VoiceCounter`, `SentimentDonut`, `MicroChart`, `TopicBarList`, `CardSourceLabel`, `VoicesFeed`, `DataProvenancePanel`, `FilterChip`, `ClearAllFilters`) along with the shared seed types, an isolated rendering fixture, and the pure aggregation helpers (`sentimentBreakdown`, `topicCounts`, `provenanceCounts`, `redactBelow5`, `shouldRedact`) — all consuming PLAN.md's data model, honouring the VFCC brand motif and tone rules, with no Phase 4 seed dependency.

**Architecture:** Components are presentational and prop-driven. Shared types live in `src/seed/types.ts`. A small typed fixture (`src/seed/__fixtures__/voices.sample.ts`) lets each component render in isolation while real seed authoring still belongs to Phase 4. Pure aggregation functions live in `src/lib/aggregations.ts` and are TDD'd with Bun's built-in test runner. React components are verified pragmatically with `bun run build && bun run start` plus `curl | grep` against a phase-6 sandbox route. The Zustand store is NOT wired in this phase — `FilterChip` and `ClearAllFilters` accept `onClick` / `onRemove` props.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Bun · Tailwind CSS 4 · shadcn/ui · Recharts · Framer Motion (`motion` package) · Lucide React · Bun test runner (no Vitest/Jest/RTL).

**Scope boundary:** This plan covers PLAN.md Phase 6 only. `<EchoesHeader>` and `<DemoDataBadge>` were shipped in Phase 3 and are not re-implemented. `<QuickFilters>`, the Zustand filter store wiring, the BentoDashboard composition, the map subtree, the topic/action/about routes, GSAP intro timeline, R3F sculpture, View Transitions, and Playwright smoke all belong to later phases.

**Source of truth:** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/PLAN.md` (especially "Data model", "Components / UI pieces", "Tone & terminology", "Brand anti-patterns", "Skeletons") + `CLAUDE.md` (Critical rules 1, 2, 3, 9, 21, 22, 23). Read both before starting.

**Working directory:** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/`

---

## File Structure (created in this plan)

```
src/
  seed/
    types.ts                                 # shared TS types — Voice, PriorityStatement, Topic, Region, etc.
    __fixtures__/
      voices.sample.ts                       # ~30 typed voices + 2 priority statements covering all 7 topics + 7 regions
      voices.sample.test.ts                  # Bun test: invariants on the fixture
  lib/
    aggregations.ts                          # sentimentBreakdown, topicCounts, provenanceCounts, redactBelow5, shouldRedact
    aggregations.test.ts                     # Bun test: pure-function unit tests against the fixture
  components/
    voice-counter.tsx                        # Framer Motion useMotionValue + animate + Math.round; reduced-motion fallback
    sentiment-donut.tsx                      # Recharts 3-band donut with semantic-token colours
    micro-chart.tsx                          # tiny Recharts sparkline; data: number[] prop
    topic-bar-list.tsx                       # horizontal bar list; per-row hover-reveal <MicroChart>; onTopicClick prop
    card-source-label.tsx                    # persistent "illustrative composite voice — review-checked" micro-label
    voices-feed.tsx                          # voice cards + k-anon redaction state when slice <5
    data-provenance-panel.tsx                # counts per source; assertion sum === total
    filter-chip.tsx                          # pill with × remove affordance; label + onRemove props
    clear-all-filters.tsx                    # "Clear all" pill button; onClick prop
  app/
    phase-6/
      page.tsx                               # sandbox route — renders all 9 components against the fixture for curl-grep
```

**Modified files:**

- `package.json` — adds `framer-motion`, `recharts`, `lucide-react`. Adds `"test": "bun test"` script.

**Out of scope (handled in later plans):**

- Real ~2,800-voice seed authoring + YPAB review + `check:seed` (Phase 4).
- Zustand filter store, `<QuickFilters>`, k-anon redaction wired live to the store (Phase 8).
- Recharts skeleton motifs in their final polished form (Phase 12).
- Topic-page composition, `<PriorityStatementCard>`, View Transitions (Phase 9).
- Bento grid, staggered tile entrance, GSAP intro timeline, R3F sculpture (Phase 10).
- Playwright smoke (Phase 13).

---

## Pre-flight (do once before Task 1)

- [ ] Confirm Phase 3 is on disk and tagged:

  ```bash
  cd "/Users/krit/Desktop/04 Web & Development/Project-Echoes"
  git tag | grep -q phase-3-scaffold && echo "phase 3 OK"
  test -f src/components/echoes-header.tsx && echo "EchoesHeader OK"
  test -f src/components/demo-data-badge.tsx && echo "DemoDataBadge OK"
  test -f src/styles/vfcc-tokens.css && echo "tokens OK"
  test -f src/app/globals.css && echo "globals.css OK"
  ```

  Expected: all four `OK` lines print. If any fails, finish Phase 3 first.

- [ ] Verify Bun + Node:

  ```bash
  bun --version
  node --version
  ```

  Expected: Bun ≥ 1.1, Node ≥ 20.

- [ ] Confirm wifi is ON — `bun add framer-motion recharts lucide-react` and any incidental Next/font build refreshes need internet for this phase.

- [ ] Confirm the working tree is clean before starting:

  ```bash
  git status --porcelain
  ```

  Expected: empty output.

---

## Task 1: Add shared seed types in `src/seed/types.ts`

Extracts PLAN.md "Data model" verbatim into a single typed file that both the fixture and every component consume.

**Files:**

- Create: `src/seed/types.ts`

- [ ] **Step 1: Create the seed directory**

  ```bash
  mkdir -p src/seed
  ```

- [ ] **Step 2: Write `src/seed/types.ts`**

  ```ts
  // src/seed/types.ts
  // Shared data-model types for Project Echoes.
  // Sourced verbatim from PLAN.md "Data model (seed data shape)".

  export type TopicSlug =
    | "housing"
    | "mental-health"
    | "education"
    | "identity"
    | "relationships"
    | "transitions"
    | "rights";

  export type RegionSlug =
    | "cardiff-vale"
    | "swansea-bay"
    | "cwm-taf-morgannwg"
    | "gwent"
    | "west-wales"
    | "powys"
    | "north-wales";

  export type Source = "one-to-one" | "ypab" | "drop-in" | "survey";

  export type Sentiment = "hopeful" | "mixed" | "worried";

  export type AgeBand = "under-16" | "16-18" | "18-plus";

  export type CareSetting = "foster" | "residential" | "kinship" | "leaving-care";

  export type ConsentLevel = "public" | "aggregate-only";

  export type Topic = {
    slug: TopicSlug;
    name: string;
    description: string;
    color: string; // hex (e.g. "#E07A5F") — used in seed metadata only; UI uses semantic tokens
  };

  export type Region = {
    slug: RegionSlug;
    name: string;
    lat: number;
    lon: number;
  };

  export type Voice = {
    id: string;
    excerpt: string | null;
    topics: TopicSlug[];
    sentiment: Sentiment;
    region: RegionSlug;
    source: Source;
    sessionId?: string; // present iff source === 'ypab'; NEVER exposed in UI / URL / DOM
    ageBand: AgeBand;
    careSetting: CareSetting;
    capturedAt: string; // ISO date, between 2025-12-01 and 2026-05-14
    consentLevel: ConsentLevel;
  };

  export type Provenance = Record<Source, number>;
  // invariant: Object.values(provenance).reduce((a, b) => a + b, 0) === voices.length

  export type PriorityStatement = {
    id: string;
    topic: TopicSlug;
    groupType: "ypab" | "national" | "regional";
    groupRegion?: RegionSlug;
    date: string;
    statement: string;
    voiceIds: string[];
    drawingOnCount: number; // MUST equal voiceIds.length (asserted in check:seed)
    discussionContext: string;
    excerptVoiceIds: string[];
  };

  // Canonical topic + region display metadata.
  // Component code reads names from here so labels stay consistent.

  export const TOPICS: Record<TopicSlug, { name: string; description: string }> = {
    housing: { name: "Housing & accommodation", description: "Where young people live and how stable it feels." },
    "mental-health": { name: "Mental health & wellbeing", description: "Day-to-day wellbeing, support access, and barriers." },
    education: { name: "Education, work & training", description: "School, college, work, apprenticeships, training." },
    identity: { name: "Identity & belonging", description: "Culture, language, faith, family roots." },
    relationships: { name: "Relationships", description: "Family, friends, professionals, peers." },
    transitions: { name: "Transitions", description: "Leaving care, ageing out, planning ahead." },
    rights: { name: "Rights & advocacy", description: "Knowing what young people are entitled to." },
  };

  export const REGIONS: Record<RegionSlug, { name: string; lat: number; lon: number }> = {
    "cardiff-vale": { name: "Cardiff & Vale", lat: 51.481, lon: -3.179 },
    "swansea-bay": { name: "Swansea Bay", lat: 51.621, lon: -3.943 },
    "cwm-taf-morgannwg": { name: "Cwm Taf Morgannwg", lat: 51.654, lon: -3.378 },
    gwent: { name: "Gwent", lat: 51.583, lon: -3.0 },
    "west-wales": { name: "West Wales", lat: 51.866, lon: -4.31 },
    powys: { name: "Powys", lat: 52.5, lon: -3.4 },
    "north-wales": { name: "North Wales", lat: 53.13, lon: -3.79 },
  };

  export const SOURCE_LABELS: Record<Source, string> = {
    "one-to-one": "1-to-1 advocacy chats",
    ypab: "YPAB sessions",
    "drop-in": "Drop-in events",
    survey: "Surveys",
  };

  export const TOPIC_SLUGS: TopicSlug[] = [
    "housing",
    "mental-health",
    "education",
    "identity",
    "relationships",
    "transitions",
    "rights",
  ];

  export const REGION_SLUGS: RegionSlug[] = [
    "cardiff-vale",
    "swansea-bay",
    "cwm-taf-morgannwg",
    "gwent",
    "west-wales",
    "powys",
    "north-wales",
  ];

  export const SOURCE_SLUGS: Source[] = ["one-to-one", "ypab", "drop-in", "survey"];
  ```

  Notes:
  - Region lat/lon are approximate centroids; real values get finalised in Phase 4 alongside the heatmap jitter implementation.
  - `TOPICS[slug].color` is intentionally omitted here — Phase 4 owns colour assignment; the UI in this phase reads chart colours from semantic tokens (`--brand`, `--accent`, `--surface-muted`), not from per-topic hex.

- [ ] **Step 3: Typecheck**

  ```bash
  bun run typecheck
  ```

  Expected: exits 0.

- [ ] **Step 4: Lint stays clean**

  ```bash
  bun run lint
  ```

  Expected: exits 0.

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat(seed): add shared types extracted from PLAN.md data model"
  ```

---

## Task 2: Add an isolated rendering fixture (`voices.sample.ts`) + Bun test for invariants

A small typed fixture so every Phase 6 component renders without depending on the eventual 2,800-voice seed (Phase 4). The fixture is the test data for `lib/aggregations.ts` tests as well.

**Files:**

- Create: `src/seed/__fixtures__/voices.sample.ts`
- Create: `src/seed/__fixtures__/voices.sample.test.ts`
- Modify: `package.json` (add `"test": "bun test"` script)

- [ ] **Step 1: Add `test` script to `package.json`**

  Open `package.json` and add `"test": "bun test"` to the `"scripts"` block:

  ```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "bun test",
    "typecheck": "tsc --noEmit",
    "lint": "biome check .",
    "lint:fix": "biome check --write ."
  }
  ```

- [ ] **Step 2: Create the fixture directory and file**

  ```bash
  mkdir -p src/seed/__fixtures__
  ```

  Write `src/seed/__fixtures__/voices.sample.ts`:

  ```ts
  // src/seed/__fixtures__/voices.sample.ts
  // Small typed fixture for Phase 6 component rendering + aggregation tests.
  // NOT the real seed — Phase 4 authors the ~2,800-voice file with YPAB review.
  // Coverage invariants enforced in voices.sample.test.ts:
  //   - 30 voices total
  //   - every topic appears at least once
  //   - every region appears at least once
  //   - every source appears at least once
  //   - all 3 sentiments appear
  //   - sessionId present iff source === 'ypab'
  //   - excerpt present iff consentLevel === 'public'
  //   - capturedAt within 2025-12-01..2026-05-14

  import type { PriorityStatement, Voice } from "../types";

  export const SAMPLE_VOICES: Voice[] = [
    { id: "v01", excerpt: "I want to know my care plan is actually mine, not just paperwork passed around.", topics: ["rights"], sentiment: "mixed", region: "cardiff-vale", source: "one-to-one", ageBand: "16-18", careSetting: "foster", capturedAt: "2026-01-12", consentLevel: "public" },
    { id: "v02", excerpt: "My foster carer treats me like family, not a placement. That matters more than people realise.", topics: ["relationships", "identity"], sentiment: "hopeful", region: "swansea-bay", source: "drop-in", ageBand: "16-18", careSetting: "foster", capturedAt: "2026-02-03", consentLevel: "public" },
    { id: "v03", excerpt: "Moving placements means starting school again. Three schools in two years.", topics: ["education", "housing"], sentiment: "worried", region: "north-wales", source: "ypab", sessionId: "ses-nw-01", ageBand: "16-18", careSetting: "residential", capturedAt: "2026-02-18", consentLevel: "public" },
    { id: "v04", excerpt: "Knowing my advocate by name made it possible to speak up at my review.", topics: ["rights", "relationships"], sentiment: "hopeful", region: "gwent", source: "one-to-one", ageBand: "16-18", careSetting: "kinship", capturedAt: "2026-03-04", consentLevel: "public" },
    { id: "v05", excerpt: "I get the support I need most days, but the gaps are still scary.", topics: ["mental-health"], sentiment: "mixed", region: "cardiff-vale", source: "survey", ageBand: "18-plus", careSetting: "leaving-care", capturedAt: "2026-03-15", consentLevel: "public" },
    { id: "v06", excerpt: "Welsh feels like home to me — I want to keep that wherever I live next.", topics: ["identity"], sentiment: "hopeful", region: "west-wales", source: "drop-in", ageBand: "under-16", careSetting: "foster", capturedAt: "2026-03-20", consentLevel: "public" },
    { id: "v07", excerpt: "Eighteen is coming and nobody has explained what happens to my placement.", topics: ["transitions", "housing"], sentiment: "worried", region: "cwm-taf-morgannwg", source: "ypab", sessionId: "ses-ctm-02", ageBand: "16-18", careSetting: "residential", capturedAt: "2026-04-02", consentLevel: "public" },
    { id: "v08", excerpt: "College tutors don't always know my situation. Some get it, some don't.", topics: ["education"], sentiment: "mixed", region: "swansea-bay", source: "one-to-one", ageBand: "16-18", careSetting: "foster", capturedAt: "2026-04-08", consentLevel: "public" },
    { id: "v09", excerpt: "I like the people at the drop-in. They listen.", topics: ["relationships"], sentiment: "hopeful", region: "powys", source: "drop-in", ageBand: "under-16", careSetting: "kinship", capturedAt: "2026-04-12", consentLevel: "public" },
    { id: "v10", excerpt: "I want a quiet room and time. Both feel rare.", topics: ["mental-health", "housing"], sentiment: "worried", region: "north-wales", source: "survey", ageBand: "16-18", careSetting: "residential", capturedAt: "2026-04-18", consentLevel: "public" },
    { id: "v11", excerpt: "The YPAB meeting was the first time I felt heard by someone who could actually change something.", topics: ["rights"], sentiment: "hopeful", region: "gwent", source: "ypab", sessionId: "ses-gw-03", ageBand: "16-18", careSetting: "foster", capturedAt: "2026-04-22", consentLevel: "public" },
    { id: "v12", excerpt: "When my social worker changes, I have to retell the whole story. Again.", topics: ["relationships"], sentiment: "worried", region: "cardiff-vale", source: "ypab", sessionId: "ses-cv-04", ageBand: "16-18", careSetting: "leaving-care", capturedAt: "2026-04-26", consentLevel: "public" },
    { id: "v13", excerpt: "I get to choose my GP now. Small thing — felt big.", topics: ["rights", "transitions"], sentiment: "hopeful", region: "swansea-bay", source: "one-to-one", ageBand: "18-plus", careSetting: "leaving-care", capturedAt: "2026-05-01", consentLevel: "public" },
    { id: "v14", excerpt: "Mental-health waiting lists are long. The crisis line is what's actually there at 11pm.", topics: ["mental-health"], sentiment: "worried", region: "west-wales", source: "survey", ageBand: "16-18", careSetting: "foster", capturedAt: "2026-05-04", consentLevel: "public" },
    { id: "v15", excerpt: "I want to live somewhere I can put up posters and not get told off.", topics: ["housing", "identity"], sentiment: "mixed", region: "north-wales", source: "drop-in", ageBand: "16-18", careSetting: "residential", capturedAt: "2026-05-07", consentLevel: "public" },
    // aggregate-only voices (no excerpt; metadata only) — 15 records
    { id: "v16", excerpt: null, topics: ["housing"], sentiment: "worried", region: "cardiff-vale", source: "survey", ageBand: "16-18", careSetting: "residential", capturedAt: "2026-01-22", consentLevel: "aggregate-only" },
    { id: "v17", excerpt: null, topics: ["mental-health"], sentiment: "worried", region: "swansea-bay", source: "ypab", sessionId: "ses-sb-05", ageBand: "16-18", careSetting: "foster", capturedAt: "2026-02-09", consentLevel: "aggregate-only" },
    { id: "v18", excerpt: null, topics: ["education"], sentiment: "mixed", region: "powys", source: "one-to-one", ageBand: "under-16", careSetting: "kinship", capturedAt: "2026-02-15", consentLevel: "aggregate-only" },
    { id: "v19", excerpt: null, topics: ["transitions"], sentiment: "mixed", region: "cwm-taf-morgannwg", source: "ypab", sessionId: "ses-ctm-06", ageBand: "18-plus", careSetting: "leaving-care", capturedAt: "2026-03-01", consentLevel: "aggregate-only" },
    { id: "v20", excerpt: null, topics: ["housing", "transitions"], sentiment: "worried", region: "gwent", source: "survey", ageBand: "18-plus", careSetting: "leaving-care", capturedAt: "2026-03-09", consentLevel: "aggregate-only" },
    { id: "v21", excerpt: null, topics: ["identity"], sentiment: "hopeful", region: "west-wales", source: "drop-in", ageBand: "under-16", careSetting: "foster", capturedAt: "2026-03-18", consentLevel: "aggregate-only" },
    { id: "v22", excerpt: null, topics: ["mental-health", "relationships"], sentiment: "mixed", region: "north-wales", source: "one-to-one", ageBand: "16-18", careSetting: "residential", capturedAt: "2026-03-25", consentLevel: "aggregate-only" },
    { id: "v23", excerpt: null, topics: ["rights"], sentiment: "hopeful", region: "cardiff-vale", source: "drop-in", ageBand: "16-18", careSetting: "foster", capturedAt: "2026-04-01", consentLevel: "aggregate-only" },
    { id: "v24", excerpt: null, topics: ["housing"], sentiment: "mixed", region: "swansea-bay", source: "survey", ageBand: "16-18", careSetting: "foster", capturedAt: "2026-04-05", consentLevel: "aggregate-only" },
    { id: "v25", excerpt: null, topics: ["education", "identity"], sentiment: "hopeful", region: "powys", source: "one-to-one", ageBand: "under-16", careSetting: "kinship", capturedAt: "2026-04-11", consentLevel: "aggregate-only" },
    { id: "v26", excerpt: null, topics: ["mental-health"], sentiment: "worried", region: "cwm-taf-morgannwg", source: "ypab", sessionId: "ses-ctm-07", ageBand: "16-18", careSetting: "foster", capturedAt: "2026-04-16", consentLevel: "aggregate-only" },
    { id: "v27", excerpt: null, topics: ["transitions"], sentiment: "mixed", region: "gwent", source: "survey", ageBand: "18-plus", careSetting: "leaving-care", capturedAt: "2026-04-21", consentLevel: "aggregate-only" },
    { id: "v28", excerpt: null, topics: ["housing", "mental-health"], sentiment: "worried", region: "west-wales", source: "ypab", sessionId: "ses-ww-08", ageBand: "16-18", careSetting: "residential", capturedAt: "2026-04-28", consentLevel: "aggregate-only" },
    { id: "v29", excerpt: null, topics: ["relationships"], sentiment: "hopeful", region: "north-wales", source: "drop-in", ageBand: "under-16", careSetting: "foster", capturedAt: "2026-05-03", consentLevel: "aggregate-only" },
    { id: "v30", excerpt: null, topics: ["rights", "transitions"], sentiment: "mixed", region: "cardiff-vale", source: "one-to-one", ageBand: "18-plus", careSetting: "leaving-care", capturedAt: "2026-05-09", consentLevel: "aggregate-only" },
  ];

  export const SAMPLE_PRIORITY_STATEMENTS: PriorityStatement[] = [
    {
      id: "ps01",
      topic: "housing",
      groupType: "ypab",
      groupRegion: "north-wales",
      date: "2026-04-22",
      statement:
        "Care-experienced young people in north Wales are asking for stable accommodation that lasts past 18 — not a clock starting on their birthday.",
      voiceIds: ["v03", "v10", "v15", "v20", "v28"],
      drawingOnCount: 5,
      discussionContext:
        "Drawn from the April YPAB session in north Wales — five young people described placements ending or shifting in the months around 18.",
      excerptVoiceIds: ["v03", "v10", "v15"],
    },
    {
      id: "ps02",
      topic: "mental-health",
      groupType: "national",
      date: "2026-05-06",
      statement:
        "Care-experienced young people across Wales are asking for mental-health support that doesn't end with a waiting-list date.",
      voiceIds: ["v05", "v10", "v14", "v17", "v22", "v26", "v28"],
      drawingOnCount: 7,
      discussionContext:
        "Composite of May YPAB feedback — seven young people in four regions described crisis-line use filling a gap that scheduled support couldn't.",
      excerptVoiceIds: ["v05", "v14"],
    },
  ];
  ```

  Notes:
  - The fixture intentionally over-represents `worried` housing/transitions voices in north Wales — that matches the on-stage demo paths in PLAN.md ("housing × north-wales" and "16-18 × residential × education" must hold ≥ 5).
  - All 15 public voices have non-empty excerpts; all 15 aggregate-only voices have `excerpt: null`.
  - Every YPAB voice has `sessionId` (build-time only — never rendered).

- [ ] **Step 3: Write the fixture invariant test**

  Create `src/seed/__fixtures__/voices.sample.test.ts`:

  ```ts
  // src/seed/__fixtures__/voices.sample.test.ts
  import { describe, expect, test } from "bun:test";
  import { REGION_SLUGS, SOURCE_SLUGS, TOPIC_SLUGS } from "../types";
  import { SAMPLE_PRIORITY_STATEMENTS, SAMPLE_VOICES } from "./voices.sample";

  describe("SAMPLE_VOICES fixture", () => {
    test("has exactly 30 voices", () => {
      expect(SAMPLE_VOICES).toHaveLength(30);
    });

    test("every topic appears at least once", () => {
      const seen = new Set(SAMPLE_VOICES.flatMap((v) => v.topics));
      for (const t of TOPIC_SLUGS) {
        expect(seen.has(t)).toBe(true);
      }
    });

    test("every region appears at least once", () => {
      const seen = new Set(SAMPLE_VOICES.map((v) => v.region));
      for (const r of REGION_SLUGS) {
        expect(seen.has(r)).toBe(true);
      }
    });

    test("every source appears at least once", () => {
      const seen = new Set(SAMPLE_VOICES.map((v) => v.source));
      for (const s of SOURCE_SLUGS) {
        expect(seen.has(s)).toBe(true);
      }
    });

    test("all three sentiments appear", () => {
      const seen = new Set(SAMPLE_VOICES.map((v) => v.sentiment));
      expect(seen.size).toBe(3);
    });

    test("sessionId present iff source === 'ypab'", () => {
      for (const v of SAMPLE_VOICES) {
        if (v.source === "ypab") {
          expect(v.sessionId).toBeDefined();
        } else {
          expect(v.sessionId).toBeUndefined();
        }
      }
    });

    test("excerpt non-empty iff consentLevel === 'public'", () => {
      for (const v of SAMPLE_VOICES) {
        if (v.consentLevel === "public") {
          expect(v.excerpt).toBeTruthy();
        } else {
          expect(v.excerpt).toBeNull();
        }
      }
    });

    test("topics length 1..3 and unique within each voice", () => {
      for (const v of SAMPLE_VOICES) {
        expect(v.topics.length).toBeGreaterThanOrEqual(1);
        expect(v.topics.length).toBeLessThanOrEqual(3);
        expect(new Set(v.topics).size).toBe(v.topics.length);
      }
    });

    test("capturedAt within 2025-12-01..2026-05-14", () => {
      const min = new Date("2025-12-01").getTime();
      const max = new Date("2026-05-14").getTime();
      for (const v of SAMPLE_VOICES) {
        const t = new Date(v.capturedAt).getTime();
        expect(t).toBeGreaterThanOrEqual(min);
        expect(t).toBeLessThanOrEqual(max);
      }
    });
  });

  describe("SAMPLE_PRIORITY_STATEMENTS fixture", () => {
    test("has exactly 2 statements", () => {
      expect(SAMPLE_PRIORITY_STATEMENTS).toHaveLength(2);
    });

    test("drawingOnCount equals voiceIds.length on each statement", () => {
      for (const ps of SAMPLE_PRIORITY_STATEMENTS) {
        expect(ps.drawingOnCount).toBe(ps.voiceIds.length);
      }
    });

    test("voiceIds resolve to real voices and are unique", () => {
      const allIds = new Set(SAMPLE_VOICES.map((v) => v.id));
      for (const ps of SAMPLE_PRIORITY_STATEMENTS) {
        expect(new Set(ps.voiceIds).size).toBe(ps.voiceIds.length);
        for (const id of ps.voiceIds) {
          expect(allIds.has(id)).toBe(true);
        }
      }
    });

    test("excerptVoiceIds subset of voiceIds and reference public voices with non-empty excerpts", () => {
      const byId = new Map(SAMPLE_VOICES.map((v) => [v.id, v]));
      for (const ps of SAMPLE_PRIORITY_STATEMENTS) {
        for (const id of ps.excerptVoiceIds) {
          expect(ps.voiceIds.includes(id)).toBe(true);
          const v = byId.get(id);
          expect(v).toBeDefined();
          expect(v?.consentLevel).toBe("public");
          expect(v?.excerpt).toBeTruthy();
        }
      }
    });

    test("groupRegion present iff groupType !== 'national'", () => {
      for (const ps of SAMPLE_PRIORITY_STATEMENTS) {
        if (ps.groupType === "national") {
          expect(ps.groupRegion).toBeUndefined();
        } else {
          expect(ps.groupRegion).toBeDefined();
        }
      }
    });
  });
  ```

- [ ] **Step 4: Run the test — must pass**

  ```bash
  bun test src/seed/__fixtures__/voices.sample.test.ts
  ```

  Expected: all tests pass; non-zero exit only if an invariant fails. Fix the fixture (not the tests) on any failure.

- [ ] **Step 5: Typecheck + lint**

  ```bash
  bun run typecheck
  bun run lint
  ```

  Expected: both exit 0.

- [ ] **Step 6: Commit**

  ```bash
  git add -A
  git commit -m "feat(seed): add isolated rendering fixture with invariant tests"
  ```

---

## Task 3: Write failing aggregation tests in `src/lib/aggregations.test.ts`

True TDD: write the tests first, watch them fail, then implement. Tests run against the fixture so the assertions are concrete and re-checkable.

**Files:**

- Create: `src/lib/aggregations.test.ts`

- [ ] **Step 1: Create the lib directory**

  ```bash
  mkdir -p src/lib
  ```

- [ ] **Step 2: Write the failing tests**

  ```ts
  // src/lib/aggregations.test.ts
  import { describe, expect, test } from "bun:test";
  import { SAMPLE_VOICES } from "../seed/__fixtures__/voices.sample";
  import {
    provenanceCounts,
    redactBelow5,
    sentimentBreakdown,
    shouldRedact,
    topicCounts,
  } from "./aggregations";

  describe("sentimentBreakdown", () => {
    test("returns counts and percentages that sum to total and 100", () => {
      const result = sentimentBreakdown(SAMPLE_VOICES);
      const totalCount = result.hopeful.count + result.mixed.count + result.worried.count;
      expect(totalCount).toBe(SAMPLE_VOICES.length);
      const totalPct = result.hopeful.pct + result.mixed.pct + result.worried.pct;
      // pct values are rounded; allow ±1 drift across 3 buckets
      expect(totalPct).toBeGreaterThanOrEqual(99);
      expect(totalPct).toBeLessThanOrEqual(101);
    });

    test("counts each sentiment correctly against the fixture", () => {
      const result = sentimentBreakdown(SAMPLE_VOICES);
      const hopefulRaw = SAMPLE_VOICES.filter((v) => v.sentiment === "hopeful").length;
      const mixedRaw = SAMPLE_VOICES.filter((v) => v.sentiment === "mixed").length;
      const worriedRaw = SAMPLE_VOICES.filter((v) => v.sentiment === "worried").length;
      expect(result.hopeful.count).toBe(hopefulRaw);
      expect(result.mixed.count).toBe(mixedRaw);
      expect(result.worried.count).toBe(worriedRaw);
    });

    test("handles empty input without dividing by zero", () => {
      const result = sentimentBreakdown([]);
      expect(result.hopeful.count).toBe(0);
      expect(result.hopeful.pct).toBe(0);
      expect(result.mixed.count).toBe(0);
      expect(result.worried.count).toBe(0);
    });
  });

  describe("topicCounts", () => {
    test("sums voices per topic, counting each topic on multi-topic voices", () => {
      const result = topicCounts(SAMPLE_VOICES);
      const expected = SAMPLE_VOICES.flatMap((v) => v.topics);
      // Every topic in the fixture appears at least once.
      expect(result.housing).toBeGreaterThan(0);
      expect(result["mental-health"]).toBeGreaterThan(0);
      expect(result.education).toBeGreaterThan(0);
      // Sum across topics equals total topic-occurrences (NOT voice count, because multi-topic).
      const sum = Object.values(result).reduce((a, b) => a + b, 0);
      expect(sum).toBe(expected.length);
    });

    test("returns 0 for every topic on empty input", () => {
      const result = topicCounts([]);
      const sum = Object.values(result).reduce((a, b) => a + b, 0);
      expect(sum).toBe(0);
    });
  });

  describe("provenanceCounts", () => {
    test("sum equals total voice count (Provenance invariant)", () => {
      const result = provenanceCounts(SAMPLE_VOICES);
      const sum = Object.values(result).reduce((a, b) => a + b, 0);
      expect(sum).toBe(SAMPLE_VOICES.length);
    });

    test("counts per source match a direct filter on the fixture", () => {
      const result = provenanceCounts(SAMPLE_VOICES);
      expect(result["one-to-one"]).toBe(SAMPLE_VOICES.filter((v) => v.source === "one-to-one").length);
      expect(result.ypab).toBe(SAMPLE_VOICES.filter((v) => v.source === "ypab").length);
      expect(result["drop-in"]).toBe(SAMPLE_VOICES.filter((v) => v.source === "drop-in").length);
      expect(result.survey).toBe(SAMPLE_VOICES.filter((v) => v.source === "survey").length);
    });
  });

  describe("redactBelow5 / shouldRedact (k-anonymity)", () => {
    test("redactBelow5 returns the count when >= 5", () => {
      expect(redactBelow5(5)).toBe(5);
      expect(redactBelow5(47)).toBe(47);
    });

    test("redactBelow5 returns null for counts < 5", () => {
      expect(redactBelow5(0)).toBeNull();
      expect(redactBelow5(1)).toBeNull();
      expect(redactBelow5(4)).toBeNull();
    });

    test("shouldRedact is true for slices of length < 5", () => {
      expect(shouldRedact(SAMPLE_VOICES.slice(0, 4))).toBe(true);
      expect(shouldRedact([])).toBe(true);
    });

    test("shouldRedact is false for slices of length >= 5", () => {
      expect(shouldRedact(SAMPLE_VOICES.slice(0, 5))).toBe(false);
      expect(shouldRedact(SAMPLE_VOICES)).toBe(false);
    });
  });
  ```

- [ ] **Step 3: Run the tests — they must FAIL (no implementation yet)**

  ```bash
  bun test src/lib/aggregations.test.ts || echo "fail expected"
  ```

  Expected: `fail expected` prints; the tests can't even import `./aggregations` because the file doesn't exist yet. That is the "red" half of red-green-refactor.

- [ ] **Step 4: Commit the failing tests**

  ```bash
  git add -A
  git commit -m "test(lib): add failing aggregation tests against fixture (TDD red)"
  ```

---

## Task 4: Implement `src/lib/aggregations.ts` — tests go green

**Files:**

- Create: `src/lib/aggregations.ts`

- [ ] **Step 1: Write the aggregation module**

  ```ts
  // src/lib/aggregations.ts
  // Pure aggregations consumed by every Phase 6 dashboard panel.
  // No React, no DOM access — easy to test with Bun's test runner.

  import {
    type Provenance,
    type Source,
    SOURCE_SLUGS,
    type TopicSlug,
    TOPIC_SLUGS,
    type Voice,
  } from "../seed/types";

  // k-anonymity floor per PLAN.md "k-anonymity safeguard" (NON-NEGOTIABLE).
  export const K_ANON_FLOOR = 5;

  export type SentimentBucket = { count: number; pct: number };
  export type SentimentBreakdown = {
    hopeful: SentimentBucket;
    mixed: SentimentBucket;
    worried: SentimentBucket;
    total: number;
  };

  export function sentimentBreakdown(voices: Voice[]): SentimentBreakdown {
    const total = voices.length;
    const counts = { hopeful: 0, mixed: 0, worried: 0 };
    for (const v of voices) {
      counts[v.sentiment] += 1;
    }
    const pct = (n: number): number => (total === 0 ? 0 : Math.round((n / total) * 100));
    return {
      hopeful: { count: counts.hopeful, pct: pct(counts.hopeful) },
      mixed: { count: counts.mixed, pct: pct(counts.mixed) },
      worried: { count: counts.worried, pct: pct(counts.worried) },
      total,
    };
  }

  export function topicCounts(voices: Voice[]): Record<TopicSlug, number> {
    const out = Object.fromEntries(TOPIC_SLUGS.map((s) => [s, 0])) as Record<TopicSlug, number>;
    for (const v of voices) {
      for (const t of v.topics) {
        out[t] += 1;
      }
    }
    return out;
  }

  export function provenanceCounts(voices: Voice[]): Provenance {
    const out = Object.fromEntries(SOURCE_SLUGS.map((s) => [s, 0])) as Record<Source, number>;
    for (const v of voices) {
      out[v.source] += 1;
    }
    return out;
  }

  // Returns the count if it meets the k-anon floor; null if it must be redacted.
  export function redactBelow5(count: number): number | null {
    return count >= K_ANON_FLOOR ? count : null;
  }

  // Convenience predicate for component-level redaction decisions.
  export function shouldRedact(slice: Voice[]): boolean {
    return slice.length < K_ANON_FLOOR;
  }
  ```

- [ ] **Step 2: Run the test — must PASS**

  ```bash
  bun test src/lib/aggregations.test.ts
  ```

  Expected: all sentiment / topic / provenance / k-anon tests pass.

- [ ] **Step 3: Run the full Bun test suite (fixture + aggregations)**

  ```bash
  bun test
  ```

  Expected: all tests pass; exit 0.

- [ ] **Step 4: Typecheck + lint**

  ```bash
  bun run typecheck
  bun run lint
  ```

  Expected: both exit 0.

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat(lib): implement aggregations (sentiment, topic, provenance, k-anon) — green"
  ```

---

## Task 5: Install Framer Motion, Recharts, Lucide React

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install runtime dependencies**

  ```bash
  bun add motion recharts lucide-react
  ```

  Notes:
  - PLAN.md / CLAUDE.md call the animation package "Framer Motion (`motion`)" — the npm package is now `motion` (Framer Motion was renamed). Imports stay `import { motion } from "motion/react"`.
  - If `bun add` errors on a peer dependency, fall back to `npm install motion recharts lucide-react` per CLAUDE.md's fallback rule.

- [ ] **Step 2: Verify package.json has the three deps**

  ```bash
  grep -E '"(motion|recharts|lucide-react)"' package.json
  ```

  Expected: three lines, each with a version specifier.

- [ ] **Step 3: Quick smoke that imports resolve under TypeScript**

  ```bash
  bun run typecheck
  ```

  Expected: exits 0.

- [ ] **Step 4: Sandbox a one-line import in a throwaway file to catch broken modules early**

  ```bash
  cat > /tmp/echoes-deps-probe.ts <<'EOF'
  import { motion } from "motion/react";
  import { PieChart } from "recharts";
  import { X } from "lucide-react";
  // Reference each so TS doesn't tree-shake the imports:
  const _check = [motion, PieChart, X];
  console.log("deps OK", _check.length);
  EOF
  cd "/Users/krit/Desktop/04 Web & Development/Project-Echoes"
  bun run tsc --noEmit /tmp/echoes-deps-probe.ts \
    --jsx preserve --esModuleInterop --moduleResolution bundler --target es2022 \
    --skipLibCheck 2>&1 | grep -E 'error|Cannot find' | head -3 \
    && echo "deps probe found issues — investigate" \
    || echo "deps probe OK"
  rm -f /tmp/echoes-deps-probe.ts
  ```

  Expected: `deps probe OK`. If anything errors, fix before continuing — typically a missing types package or a peer dep.

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "chore(deps): add motion, recharts, lucide-react for Phase 6 components"
  ```

---

## Task 6: Create the phase-6 sandbox route for curl-grep verification

A single sandbox page renders each component as it's built. Components mount one-by-one across the tasks below; each task adds its component import + section to this page.

**Files:**

- Create: `src/app/phase-6/page.tsx`

- [ ] **Step 1: Create the phase-6 directory**

  ```bash
  mkdir -p src/app/phase-6
  ```

- [ ] **Step 2: Write the initial sandbox page**

  ```tsx
  // src/app/phase-6/page.tsx
  // Phase 6 sandbox — renders each core component in isolation against the
  // voices.sample fixture so each task can verify the DOM markers via curl-grep.
  // This page is removed (or rewired into the real dashboard) in Phase 10.

  import { SAMPLE_PRIORITY_STATEMENTS, SAMPLE_VOICES } from "@/seed/__fixtures__/voices.sample";

  export default function Phase6Sandbox() {
    return (
      <section data-testid="phase-6-sandbox" className="px-8 py-12 space-y-12">
        <header className="space-y-2">
          <h1
            className="text-4xl"
            style={{ fontFamily: "var(--font-display), serif", color: "var(--fg-1)" }}
          >
            Phase 6 sandbox
          </h1>
          <p style={{ color: "var(--fg-2)" }}>
            Core components rendered against the {SAMPLE_VOICES.length}-voice fixture.{" "}
            {SAMPLE_PRIORITY_STATEMENTS.length} priority statements seeded.
          </p>
        </header>

        {/* Component sections appended by subsequent tasks. */}
      </section>
    );
  }
  ```

- [ ] **Step 3: Build + serve + verify the route exists**

  ```bash
  bun run build
  bun run start &
  START_PID=$!
  sleep 5
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/phase-6
  curl -s http://localhost:3000/phase-6 | grep -q 'data-testid="phase-6-sandbox"' \
    && echo "sandbox OK"
  kill $START_PID
  ```

  Expected: `200` then `sandbox OK`. If Bun build segfaults, fall back to `npm run build && npm run start` per CLAUDE.md.

- [ ] **Step 4: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat(phase-6): add sandbox route for component curl-grep verification"
  ```

---

## Task 7: Build `<VoiceCounter>`

Framer Motion `useMotionValue` + `animate()` ticker; `Math.round` transform. Reads `total` from a `total` prop (no `setInterval`, ever). Reduced-motion path: render the final value directly with no animation.

**Files:**

- Create: `src/components/voice-counter.tsx`
- Modify: `src/app/phase-6/page.tsx`

- [ ] **Step 1: Create the component**

  ```tsx
  // src/components/voice-counter.tsx
  "use client";

  import { animate, useMotionValue, useReducedMotion, useTransform } from "motion/react";
  import { useEffect, useState } from "react";

  type Props = {
    total: number;
    durationSeconds?: number;
    label?: string;
  };

  export function VoiceCounter({
    total,
    durationSeconds = 1.2,
    label = "voices heard",
  }: Props) {
    const reduce = useReducedMotion();
    const motionVal = useMotionValue(reduce ? total : 0);
    const rounded = useTransform(motionVal, (latest) => Math.round(latest));
    const [display, setDisplay] = useState<number>(reduce ? total : 0);

    useEffect(() => {
      if (reduce) {
        setDisplay(total);
        return;
      }
      motionVal.set(0);
      const controls = animate(motionVal, total, {
        duration: durationSeconds,
        ease: [0.16, 1, 0.3, 1], // expo.out feel — matches PLAN.md HeroIntroTimeline tick
      });
      const unsub = rounded.on("change", (v) => setDisplay(v));
      return () => {
        controls.stop();
        unsub();
      };
    }, [total, durationSeconds, reduce, motionVal, rounded]);

    return (
      <div data-testid="voice-counter" className="flex flex-col gap-1">
        <span
          data-testid="voice-counter-value"
          className="text-6xl leading-none tabular-nums"
          style={{
            fontFamily: "var(--font-mono), monospace",
            color: "var(--fg-1)",
          }}
        >
          {display.toLocaleString("en-GB")}
        </span>
        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono), monospace" }}
        >
          {label}
        </span>
      </div>
    );
  }
  ```

  Notes:
  - `"use client"` because `useMotionValue` / `useEffect` need the browser. Critical Rule 10 (SSR-disabled for WebGL/canvas) doesn't apply to Framer Motion DOM animation, but the directive is still required for hooks.
  - Final value uses `toLocaleString("en-GB")` so big numbers are formatted as `2,800` not `2800`.
  - `tabular-nums` keeps the digits from re-laying out as they tick.
  - PLAN.md Critical Rule 9: reduced-motion skips the animation; the counter shows the final value immediately.

- [ ] **Step 2: Wire into the sandbox page**

  Edit `src/app/phase-6/page.tsx` — add the import at the top:

  ```tsx
  import { VoiceCounter } from "@/components/voice-counter";
  ```

  Insert this section inside the `<section>` (after the header, before any later sections):

  ```tsx
  <div data-testid="section-voice-counter" className="space-y-2">
    <h2 className="text-sm uppercase tracking-widest" style={{ color: "var(--fg-3)" }}>
      VoiceCounter
    </h2>
    <VoiceCounter total={SAMPLE_VOICES.length} label="composite voices in this sample" />
  </div>
  ```

- [ ] **Step 3: Build + verify**

  ```bash
  bun run build
  bun run start &
  START_PID=$!
  sleep 5
  curl -s http://localhost:3000/phase-6 > /tmp/echoes-p6.html
  grep -q 'data-testid="voice-counter"' /tmp/echoes-p6.html && echo "counter present OK"
  grep -q 'composite voices in this sample' /tmp/echoes-p6.html && echo "counter label OK"
  kill $START_PID
  ```

  Expected: both `OK` lines. The animated value won't be in the SSR'd HTML (it animates client-side) — that's fine; the `<span data-testid="voice-counter-value">` tag is present and SSR renders `0` initially (or the final value under reduced-motion).

- [ ] **Step 4: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat(components): add <VoiceCounter> with useMotionValue + reduced-motion fallback"
  ```

---

## Task 8: Build `<SentimentDonut>`

Recharts donut, 3 bands (hopeful / mixed / worried), brand colours via semantic tokens, tooltip with `n = X`. Animates in on mount via Recharts' built-in `animationDuration` (300ms). Reduced-motion sets `isAnimationActive={false}`.

**Files:**

- Create: `src/components/sentiment-donut.tsx`
- Modify: `src/app/phase-6/page.tsx`

- [ ] **Step 1: Create the component**

  ```tsx
  // src/components/sentiment-donut.tsx
  "use client";

  import { useReducedMotion } from "motion/react";
  import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
  import type { Voice } from "@/seed/types";
  import { sentimentBreakdown } from "@/lib/aggregations";

  type Props = {
    voices: Voice[];
    size?: number;
  };

  // Token names resolved at render time via CSS custom properties.
  // Bands ordered hopeful → mixed → worried so the legend reads left-to-right.
  const BAND_TOKENS = {
    hopeful: "var(--brand-accent, var(--brand))",
    mixed: "var(--surface-muted)",
    worried: "var(--brand)",
  } as const;

  export function SentimentDonut({ voices, size = 220 }: Props) {
    const reduce = useReducedMotion();
    const b = sentimentBreakdown(voices);
    const data = [
      { key: "hopeful", label: "Hopeful", count: b.hopeful.count, pct: b.hopeful.pct },
      { key: "mixed", label: "Mixed", count: b.mixed.count, pct: b.mixed.pct },
      { key: "worried", label: "Worried", count: b.worried.count, pct: b.worried.pct },
    ];

    return (
      <div
        data-testid="sentiment-donut"
        className="flex items-center gap-6 p-6 rounded-2xl"
        style={{
          background: "var(--surface)",
          border: "2px solid var(--border-ink)",
          boxShadow: "var(--shadow-offset)",
          color: "var(--fg-1)",
        }}
      >
        <div style={{ width: size, height: size }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="label"
                innerRadius={size * 0.34}
                outerRadius={size * 0.46}
                paddingAngle={2}
                isAnimationActive={!reduce}
                animationDuration={reduce ? 0 : 600}
                stroke="var(--border-ink)"
                strokeWidth={2}
              >
                {data.map((d) => (
                  <Cell key={d.key} fill={BAND_TOKENS[d.key as keyof typeof BAND_TOKENS]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, _name, ctx) => {
                  const pct = (ctx?.payload as { pct?: number })?.pct ?? 0;
                  return [`n = ${value} · ${pct}%`, ctx?.payload?.label as string];
                }}
                contentStyle={{
                  background: "var(--surface)",
                  border: "2px solid var(--border-ink)",
                  boxShadow: "var(--shadow-offset)",
                  color: "var(--fg-1)",
                  fontFamily: "var(--font-mono), monospace",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-2 text-sm" style={{ color: "var(--fg-2)" }}>
          {data.map((d) => (
            <li key={d.key} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-3 w-3 rounded-sm"
                style={{
                  background: BAND_TOKENS[d.key as keyof typeof BAND_TOKENS],
                  border: "1px solid var(--border-ink)",
                }}
              />
              <span style={{ color: "var(--fg-1)" }}>{d.label}</span>
              <span style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono), monospace" }}>
                n = {d.count} · {d.pct}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  ```

  Notes:
  - Tile carries the brand motif (2px ink border + 4px offset shadow per Critical Rule 21).
  - Numeric typography uses `--font-mono`.
  - In chart labels `%` is fine (Critical Rule 22 says "`%` is fine in chart labels and tooltips" — only prose uses "per cent").

- [ ] **Step 2: Wire into the sandbox**

  Edit `src/app/phase-6/page.tsx` — add the import:

  ```tsx
  import { SentimentDonut } from "@/components/sentiment-donut";
  ```

  Add a section:

  ```tsx
  <div data-testid="section-sentiment-donut" className="space-y-2">
    <h2 className="text-sm uppercase tracking-widest" style={{ color: "var(--fg-3)" }}>
      SentimentDonut
    </h2>
    <SentimentDonut voices={SAMPLE_VOICES} />
  </div>
  ```

- [ ] **Step 3: Build + verify**

  ```bash
  bun run build
  bun run start &
  START_PID=$!
  sleep 5
  curl -s http://localhost:3000/phase-6 > /tmp/echoes-p6.html
  grep -q 'data-testid="sentiment-donut"' /tmp/echoes-p6.html && echo "donut present OK"
  grep -q 'Hopeful' /tmp/echoes-p6.html && echo "Hopeful label OK"
  grep -q 'Worried' /tmp/echoes-p6.html && echo "Worried label OK"
  kill $START_PID
  ```

  Expected: all three `OK` lines.

- [ ] **Step 4: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat(components): add <SentimentDonut> Recharts 3-band tile with brand motif"
  ```

---

## Task 9: Build `<MicroChart>` — reusable inline sparkline

Tiny Recharts sparkline. Reusable; consumed by `<TopicBarList>` (Task 10) and (later) `<VoicesFeed>` and chart-segment hover-reveals. Takes `data: number[]`, optional `width`, `height`. Reduced-motion: render the line statically (no animation).

**Files:**

- Create: `src/components/micro-chart.tsx`
- Modify: `src/app/phase-6/page.tsx`

- [ ] **Step 1: Create the component**

  ```tsx
  // src/components/micro-chart.tsx
  "use client";

  import { useReducedMotion } from "motion/react";
  import { Line, LineChart, ResponsiveContainer } from "recharts";

  type Props = {
    data: number[];
    width?: number;
    height?: number;
    ariaLabel?: string;
  };

  export function MicroChart({ data, width = 80, height = 24, ariaLabel = "trend sparkline" }: Props) {
    const reduce = useReducedMotion();
    const points = data.map((v, i) => ({ i, v }));

    return (
      <span
        data-testid="micro-chart"
        role="img"
        aria-label={ariaLabel}
        className="inline-block align-middle"
        style={{ width, height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <Line
              type="monotone"
              dataKey="v"
              stroke="var(--brand)"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={!reduce}
              animationDuration={reduce ? 0 : 400}
            />
          </LineChart>
        </ResponsiveContainer>
      </span>
    );
  }
  ```

- [ ] **Step 2: Wire into the sandbox**

  Edit `src/app/phase-6/page.tsx`:

  ```tsx
  import { MicroChart } from "@/components/micro-chart";
  ```

  Add a section:

  ```tsx
  <div data-testid="section-micro-chart" className="space-y-2">
    <h2 className="text-sm uppercase tracking-widest" style={{ color: "var(--fg-3)" }}>
      MicroChart
    </h2>
    <MicroChart data={[3, 5, 4, 7, 6, 9, 8, 11]} ariaLabel="example sparkline" />
  </div>
  ```

- [ ] **Step 3: Build + verify**

  ```bash
  bun run build
  bun run start &
  START_PID=$!
  sleep 5
  curl -s http://localhost:3000/phase-6 > /tmp/echoes-p6.html
  grep -q 'data-testid="micro-chart"' /tmp/echoes-p6.html && echo "micro present OK"
  grep -q 'aria-label="example sparkline"' /tmp/echoes-p6.html && echo "micro aria OK"
  kill $START_PID
  ```

  Expected: both `OK`.

- [ ] **Step 4: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat(components): add <MicroChart> reusable Recharts sparkline"
  ```

---

## Task 10: Build `<TopicBarList>` — horizontal bars + hover-reveal `<MicroChart>` + onClick

Horizontal bar list of voice counts per topic. Each row clickable (just wires `onTopicClick` prop — actual routing is Phase 9). Each row has a hover-revealed `<MicroChart>` inline sparkline. The bar list itself is rendered inside an elevated tile with the brand motif.

**Files:**

- Create: `src/components/topic-bar-list.tsx`
- Modify: `src/app/phase-6/page.tsx`

- [ ] **Step 1: Create the component**

  ```tsx
  // src/components/topic-bar-list.tsx
  "use client";

  import { TOPICS, type TopicSlug, type Voice } from "@/seed/types";
  import { topicCounts } from "@/lib/aggregations";
  import { MicroChart } from "./micro-chart";

  type Props = {
    voices: Voice[];
    onTopicClick?: (slug: TopicSlug) => void;
  };

  // Deterministic mini-trend per topic for the hover-reveal sparkline.
  // Phase 6 derives an 8-point series from topic count + slug-hash so the spark
  // is stable across renders. The real time-trend gets wired in Phase 10.
  function miniTrend(slug: TopicSlug, total: number): number[] {
    const base = Math.max(1, Math.floor(total / 4));
    const seed = slug.charCodeAt(0) + slug.length;
    return Array.from({ length: 8 }, (_, i) => base + ((seed + i * 3) % 5));
  }

  export function TopicBarList({ voices, onTopicClick }: Props) {
    const counts = topicCounts(voices);
    const max = Math.max(1, ...Object.values(counts));
    const rows = (Object.keys(TOPICS) as TopicSlug[])
      .map((slug) => ({ slug, name: TOPICS[slug].name, count: counts[slug] }))
      .sort((a, b) => b.count - a.count);

    return (
      <div
        data-testid="topic-bar-list"
        className="rounded-2xl p-6"
        style={{
          background: "var(--surface)",
          border: "2px solid var(--border-ink)",
          boxShadow: "var(--shadow-offset)",
          color: "var(--fg-1)",
        }}
      >
        <h3
          className="mb-4 text-sm uppercase tracking-widest"
          style={{ color: "var(--fg-3)" }}
        >
          Voices by topic
        </h3>
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.slug}>
              <button
                type="button"
                data-testid={`topic-bar-row-${r.slug}`}
                onClick={() => onTopicClick?.(r.slug)}
                className="group grid w-full grid-cols-[minmax(8rem,1fr)_3fr_auto] items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-[color:var(--surface-muted)]"
                style={{ color: "var(--fg-1)" }}
              >
                <span className="text-sm">{r.name}</span>
                <span
                  aria-hidden="true"
                  className="relative h-3 rounded-sm"
                  style={{
                    background: "var(--surface-muted)",
                    border: "1px solid var(--border-ink)",
                  }}
                >
                  <span
                    className="absolute inset-y-0 left-0 rounded-sm"
                    style={{
                      width: `${(r.count / max) * 100}%`,
                      background: "var(--brand)",
                    }}
                  />
                </span>
                <span
                  className="flex items-center gap-3 text-xs"
                  style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono), monospace" }}
                >
                  <span
                    className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                    aria-hidden="true"
                  >
                    <MicroChart
                      data={miniTrend(r.slug, r.count)}
                      width={64}
                      height={20}
                      ariaLabel={`${r.name} trend`}
                    />
                  </span>
                  <span>n = {r.count}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  ```

  Notes:
  - The hover-reveal `<MicroChart>` is wrapped in a `group-hover` opacity toggle — the sparkline is in the DOM but invisible until hover/focus. PLAN.md "Reinforces 'everything has depth'."
  - The bar uses semantic tokens — no raw hex.
  - The row is a `<button>` for keyboard navigation; `:focus-visible` reveals the sparkline like hover does (Phase 12 polish-pass focus rings come on top of this).

- [ ] **Step 2: Wire into the sandbox**

  Edit `src/app/phase-6/page.tsx`:

  ```tsx
  import { TopicBarList } from "@/components/topic-bar-list";
  ```

  Add a section:

  ```tsx
  <div data-testid="section-topic-bar-list" className="space-y-2">
    <h2 className="text-sm uppercase tracking-widest" style={{ color: "var(--fg-3)" }}>
      TopicBarList
    </h2>
    <TopicBarList voices={SAMPLE_VOICES} onTopicClick={() => undefined} />
  </div>
  ```

- [ ] **Step 3: Build + verify**

  ```bash
  bun run build
  bun run start &
  START_PID=$!
  sleep 5
  curl -s http://localhost:3000/phase-6 > /tmp/echoes-p6.html
  grep -q 'data-testid="topic-bar-list"' /tmp/echoes-p6.html && echo "topic list OK"
  grep -q 'data-testid="topic-bar-row-housing"' /tmp/echoes-p6.html && echo "housing row OK"
  grep -q 'data-testid="topic-bar-row-mental-health"' /tmp/echoes-p6.html && echo "mh row OK"
  grep -q 'Voices by topic' /tmp/echoes-p6.html && echo "heading OK"
  kill $START_PID
  ```

  Expected: all four `OK` lines.

- [ ] **Step 4: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat(components): add <TopicBarList> with hover-reveal sparkline + onTopicClick prop"
  ```

---

## Task 11: Build `<CardSourceLabel>`

Persistent "Illustrative composite voice — review-checked" micro-label rendered on every voice card and every priority statement card (Critical Rule 2). Phone-cropped single card MUST still carry this label.

**Files:**

- Create: `src/components/card-source-label.tsx`
- Modify: `src/app/phase-6/page.tsx`

- [ ] **Step 1: Create the component**

  ```tsx
  // src/components/card-source-label.tsx
  // Per-card disclosure rendered on EVERY <VoicesFeed> card and EVERY
  // <PriorityStatementCard>. Per PLAN.md Critical Rule 2: a phone-cropped
  // single card must still carry this label.

  export function CardSourceLabel() {
    return (
      <span
        data-testid="card-source-label"
        className="inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest"
        style={{
          color: "var(--fg-2)",
          background: "var(--surface-muted)",
          border: "2px solid var(--border-ink)",
          boxShadow: "var(--shadow-offset)",
          fontFamily: "var(--font-mono), monospace",
        }}
      >
        <span
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--brand)" }}
        />
        Illustrative composite voice — review-checked
      </span>
    );
  }
  ```

  Notes:
  - En-dash `—` in the copy — matches PLAN.md tone rule (en-dash to separate clauses).
  - Brand motif applied at micro-scale (2px ink border + 4px offset shadow via `var(--shadow-offset)`).
  - Tiny dot in `--brand` mirrors the DEMO DATA pill's visual anchor — consistent visual language.

- [ ] **Step 2: Wire into the sandbox**

  Edit `src/app/phase-6/page.tsx`:

  ```tsx
  import { CardSourceLabel } from "@/components/card-source-label";
  ```

  Add a section:

  ```tsx
  <div data-testid="section-card-source-label" className="space-y-2">
    <h2 className="text-sm uppercase tracking-widest" style={{ color: "var(--fg-3)" }}>
      CardSourceLabel
    </h2>
    <CardSourceLabel />
  </div>
  ```

- [ ] **Step 3: Build + verify**

  ```bash
  bun run build
  bun run start &
  START_PID=$!
  sleep 5
  curl -s http://localhost:3000/phase-6 > /tmp/echoes-p6.html
  grep -q 'data-testid="card-source-label"' /tmp/echoes-p6.html && echo "label present OK"
  grep -q 'Illustrative composite voice — review-checked' /tmp/echoes-p6.html \
    && echo "label copy exact OK"
  kill $START_PID
  ```

  Expected: both `OK` lines.

- [ ] **Step 4: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat(components): add <CardSourceLabel> per-card illustrative composite micro-label"
  ```

---

## Task 12: Build `<VoicesFeed>` — voice cards + k-anon redaction state

Renders anonymous quote cards composing: excerpt, topic chips, region, age band, source, and `<CardSourceLabel>`. When `voices.length < 5` (k-anon floor per Critical Rule 3), renders the redaction state instead: "Too few voices to display individually — aggregated counts only".

**Files:**

- Create: `src/components/voices-feed.tsx`
- Modify: `src/app/phase-6/page.tsx`

- [ ] **Step 1: Create the component**

  ```tsx
  // src/components/voices-feed.tsx
  "use client";

  import { REGIONS, SOURCE_LABELS, TOPICS, type Voice } from "@/seed/types";
  import { shouldRedact } from "@/lib/aggregations";
  import { CardSourceLabel } from "./card-source-label";

  type Props = {
    voices: Voice[];
    limit?: number;
  };

  const AGE_LABELS: Record<Voice["ageBand"], string> = {
    "under-16": "Under 16",
    "16-18": "16 – 18",
    "18-plus": "18 plus",
  };

  const CARE_LABELS: Record<Voice["careSetting"], string> = {
    foster: "Foster",
    residential: "Residential",
    kinship: "Kinship",
    "leaving-care": "Leaving care",
  };

  export function VoicesFeed({ voices, limit = 6 }: Props) {
    if (shouldRedact(voices)) {
      return (
        <div
          data-testid="voices-feed-redacted"
          className="rounded-2xl p-6"
          style={{
            background: "var(--surface)",
            border: "2px solid var(--border-ink)",
            boxShadow: "var(--shadow-offset)",
            color: "var(--fg-2)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--fg-1)" }}>
            Too few voices to display individually — aggregated counts only.
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono), monospace" }}>
            k-anonymity floor 5 · this slice: n = {voices.length}
          </p>
        </div>
      );
    }

    const publicVoices = voices.filter((v) => v.consentLevel === "public" && v.excerpt);
    const shown = publicVoices.slice(0, limit);

    return (
      <ul
        data-testid="voices-feed"
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        {shown.map((v) => (
          <li
            key={v.id}
            data-testid={`voice-card-${v.id}`}
            className="rounded-2xl p-5 space-y-3"
            style={{
              background: "var(--surface)",
              border: "2px solid var(--border-ink)",
              boxShadow: "var(--shadow-offset)",
              color: "var(--fg-1)",
            }}
          >
            <p className="text-base leading-snug" style={{ color: "var(--fg-1)" }}>
              &ldquo;{v.excerpt}&rdquo;
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--fg-3)" }}>
              {v.topics.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full px-2 py-0.5"
                  style={{
                    background: "var(--surface-muted)",
                    border: "1px solid var(--border-ink)",
                    color: "var(--fg-2)",
                  }}
                >
                  {TOPICS[t].name}
                </span>
              ))}
              <span aria-hidden="true">·</span>
              <span>{REGIONS[v.region].name}</span>
              <span aria-hidden="true">·</span>
              <span>{AGE_LABELS[v.ageBand]}</span>
              <span aria-hidden="true">·</span>
              <span>{CARE_LABELS[v.careSetting]}</span>
              <span aria-hidden="true">·</span>
              <span>{SOURCE_LABELS[v.source]}</span>
            </div>
            <CardSourceLabel />
          </li>
        ))}
      </ul>
    );
  }
  ```

  Notes:
  - Smart quotes via HTML entities (`&ldquo;` / `&rdquo;`) — keeps Biome happy without a TS lint config tweak.
  - Each card carries `<CardSourceLabel>` (Critical Rule 2: "phone-cropped single card must still carry the disclaimer").
  - Redaction copy is EXACTLY the string PLAN.md specifies — "Too few voices to display individually — aggregated counts only".
  - Each card carries the brand motif. Press / hover-lift animations come in the polish pass (Phase 12).
  - "16 – 18" uses an en-dash with surrounding spaces — PLAN.md tone rule.

- [ ] **Step 2: Wire into the sandbox — both populated AND redacted states**

  Edit `src/app/phase-6/page.tsx`:

  ```tsx
  import { VoicesFeed } from "@/components/voices-feed";
  ```

  Add two sections:

  ```tsx
  <div data-testid="section-voices-feed" className="space-y-2">
    <h2 className="text-sm uppercase tracking-widest" style={{ color: "var(--fg-3)" }}>
      VoicesFeed (populated)
    </h2>
    <VoicesFeed voices={SAMPLE_VOICES} limit={4} />
  </div>

  <div data-testid="section-voices-feed-redacted" className="space-y-2">
    <h2 className="text-sm uppercase tracking-widest" style={{ color: "var(--fg-3)" }}>
      VoicesFeed (redacted — slice of 3)
    </h2>
    <VoicesFeed voices={SAMPLE_VOICES.slice(0, 3)} />
  </div>
  ```

- [ ] **Step 3: Build + verify both states**

  ```bash
  bun run build
  bun run start &
  START_PID=$!
  sleep 5
  curl -s http://localhost:3000/phase-6 > /tmp/echoes-p6.html
  grep -q 'data-testid="voices-feed"' /tmp/echoes-p6.html && echo "feed populated OK"
  grep -q 'data-testid="voice-card-v01"' /tmp/echoes-p6.html && echo "card v01 OK"
  grep -q 'data-testid="voices-feed-redacted"' /tmp/echoes-p6.html && echo "feed redacted OK"
  grep -q 'Too few voices to display individually — aggregated counts only' /tmp/echoes-p6.html \
    && echo "redaction copy exact OK"
  COUNT=$(grep -c 'data-testid="card-source-label"' /tmp/echoes-p6.html)
  test "$COUNT" -ge 4 && echo "card-source-label rendered $COUNT times (one per voice card) OK"
  kill $START_PID
  ```

  Expected: all five `OK` lines.

- [ ] **Step 4: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat(components): add <VoicesFeed> with k-anon redaction state + per-card source label"
  ```

---

## Task 13: Build `<DataProvenancePanel>`

Honest count per source; derived from `Provenance` aggregation; asserts (in DEV) that the sum equals the total voice count.

**Files:**

- Create: `src/components/data-provenance-panel.tsx`
- Modify: `src/app/phase-6/page.tsx`

- [ ] **Step 1: Create the component**

  ```tsx
  // src/components/data-provenance-panel.tsx

  import { SOURCE_LABELS, SOURCE_SLUGS, type Voice } from "@/seed/types";
  import { provenanceCounts } from "@/lib/aggregations";

  type Props = {
    voices: Voice[];
  };

  export function DataProvenancePanel({ voices }: Props) {
    const counts = provenanceCounts(voices);
    const sum = Object.values(counts).reduce((a, b) => a + b, 0);

    // Defensive DEV-only assertion: catches a future regression where
    // provenanceCounts ever drifts from total voices. Silent in prod.
    if (process.env.NODE_ENV !== "production" && sum !== voices.length) {
      console.warn(
        `[DataProvenancePanel] provenance sum (${sum}) !== voices.length (${voices.length})`,
      );
    }

    return (
      <div
        data-testid="data-provenance-panel"
        className="rounded-2xl p-6"
        style={{
          background: "var(--surface)",
          border: "2px solid var(--border-ink)",
          boxShadow: "var(--shadow-offset)",
          color: "var(--fg-1)",
        }}
      >
        <h3 className="mb-4 text-sm uppercase tracking-widest" style={{ color: "var(--fg-3)" }}>
          Where these voices come from
        </h3>
        <ul className="space-y-2 text-sm">
          {SOURCE_SLUGS.map((s) => {
            const n = counts[s];
            const pct = sum === 0 ? 0 : Math.round((n / sum) * 100);
            return (
              <li
                key={s}
                data-testid={`provenance-row-${s}`}
                className="grid grid-cols-[1fr_auto] items-baseline gap-3"
              >
                <span style={{ color: "var(--fg-1)" }}>{SOURCE_LABELS[s]}</span>
                <span
                  className="tabular-nums"
                  style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono), monospace" }}
                >
                  n = {n} · {pct}%
                </span>
              </li>
            );
          })}
        </ul>
        <p
          className="mt-4 text-xs"
          style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono), monospace" }}
        >
          Total · n = {sum}
        </p>
      </div>
    );
  }
  ```

  Notes:
  - DEV assertion via `console.warn` rather than `throw` — never crash the demo over a defensive check.
  - The `n = X` annotations all use monospace per PLAN.md "All numeric typography uses `--font-mono`".

- [ ] **Step 2: Wire into the sandbox**

  Edit `src/app/phase-6/page.tsx`:

  ```tsx
  import { DataProvenancePanel } from "@/components/data-provenance-panel";
  ```

  Add a section:

  ```tsx
  <div data-testid="section-data-provenance-panel" className="space-y-2">
    <h2 className="text-sm uppercase tracking-widest" style={{ color: "var(--fg-3)" }}>
      DataProvenancePanel
    </h2>
    <DataProvenancePanel voices={SAMPLE_VOICES} />
  </div>
  ```

- [ ] **Step 3: Build + verify**

  ```bash
  bun run build
  bun run start &
  START_PID=$!
  sleep 5
  curl -s http://localhost:3000/phase-6 > /tmp/echoes-p6.html
  grep -q 'data-testid="data-provenance-panel"' /tmp/echoes-p6.html && echo "provenance OK"
  grep -q 'data-testid="provenance-row-one-to-one"' /tmp/echoes-p6.html && echo "row OK"
  grep -q 'Where these voices come from' /tmp/echoes-p6.html && echo "heading OK"
  grep -q 'Total · n = 30' /tmp/echoes-p6.html && echo "sum equals fixture total OK"
  kill $START_PID
  ```

  Expected: all four `OK` lines (the fixture has 30 voices; provenance sum must equal 30).

- [ ] **Step 4: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat(components): add <DataProvenancePanel> with sum-equals-total assertion"
  ```

---

## Task 14: Build `<FilterChip>`

Active filter pill with × remove affordance. Brand motif (2px ink border + 4px offset shadow, pill radius). Props: `label`, `onRemove`. No store wiring yet — Phase 8 connects it to Zustand.

**Files:**

- Create: `src/components/filter-chip.tsx`
- Modify: `src/app/phase-6/page.tsx`

- [ ] **Step 1: Create the component**

  ```tsx
  // src/components/filter-chip.tsx
  "use client";

  import { X } from "lucide-react";

  type Props = {
    label: string;
    onRemove?: () => void;
  };

  export function FilterChip({ label, onRemove }: Props) {
    return (
      <span
        data-testid="filter-chip"
        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
        style={{
          color: "var(--fg-1)",
          background: "var(--surface)",
          border: "2px solid var(--border-ink)",
          boxShadow: "var(--shadow-offset)",
        }}
      >
        <span>{label}</span>
        <button
          type="button"
          aria-label={`Remove filter: ${label}`}
          data-testid="filter-chip-remove"
          onClick={onRemove}
          className="inline-flex h-4 w-4 items-center justify-center rounded-full transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            color: "var(--fg-2)",
            outlineColor: "var(--brand)",
          }}
        >
          <X size={12} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </span>
    );
  }
  ```

  Notes:
  - Lucide stroke-width 1.75 per PLAN.md visual lock ("stroke width 1.75 at 24px, one notch heavier than Lucide default").
  - aria-label spells out the action so screen readers don't read "Remove filter: X" as a generic "close" button.

- [ ] **Step 2: Wire into the sandbox**

  Edit `src/app/phase-6/page.tsx`:

  ```tsx
  import { FilterChip } from "@/components/filter-chip";
  ```

  Add a section:

  ```tsx
  <div data-testid="section-filter-chip" className="space-y-2">
    <h2 className="text-sm uppercase tracking-widest" style={{ color: "var(--fg-3)" }}>
      FilterChip
    </h2>
    <div className="flex flex-wrap gap-3">
      <FilterChip label="Housing & accommodation" onRemove={() => undefined} />
      <FilterChip label="North Wales" onRemove={() => undefined} />
      <FilterChip label="16 – 18" onRemove={() => undefined} />
    </div>
  </div>
  ```

- [ ] **Step 3: Build + verify**

  ```bash
  bun run build
  bun run start &
  START_PID=$!
  sleep 5
  curl -s http://localhost:3000/phase-6 > /tmp/echoes-p6.html
  grep -q 'data-testid="filter-chip"' /tmp/echoes-p6.html && echo "chip present OK"
  grep -q 'aria-label="Remove filter: Housing &amp; accommodation"' /tmp/echoes-p6.html \
    && echo "chip aria OK"
  COUNT=$(grep -c 'data-testid="filter-chip-remove"' /tmp/echoes-p6.html)
  test "$COUNT" = "3" && echo "three remove buttons OK"
  kill $START_PID
  ```

  Expected: all three `OK` lines.

- [ ] **Step 4: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat(components): add <FilterChip> pill + remove button with brand motif"
  ```

---

## Task 15: Build `<ClearAllFilters>`

Single "Clear all" button. Brand motif (pill radius on CTA per Critical Rule 21). Takes `onClick` prop. Phase 8 binds it to the Zustand `clearAll()` action.

**Files:**

- Create: `src/components/clear-all-filters.tsx`
- Modify: `src/app/phase-6/page.tsx`

- [ ] **Step 1: Create the component**

  ```tsx
  // src/components/clear-all-filters.tsx
  "use client";

  type Props = {
    onClick?: () => void;
    disabled?: boolean;
  };

  export function ClearAllFilters({ onClick, disabled = false }: Props) {
    return (
      <button
        type="button"
        data-testid="clear-all-filters"
        onClick={onClick}
        disabled={disabled}
        className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-transform hover:-translate-x-px hover:-translate-y-px active:translate-x-1 active:translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          color: "var(--fg-1)",
          background: "var(--surface)",
          border: "2px solid var(--border-ink)",
          boxShadow: "var(--shadow-offset)",
          outlineColor: "var(--brand)",
        }}
      >
        Clear all
      </button>
    );
  }
  ```

  Notes:
  - Exact CTA copy "Clear all" per the task brief and PLAN.md tone rules (short verb, not "Clear filters" or "Reset").
  - Hover and press behaviours mirror Critical Rule 21: hover translates -1px/-1px; press translates +4px/+4px ("button lands"). For Phase 6 we approximate via Tailwind utilities; the polish pass (Phase 12) can move the exact `--shadow-offset` swap into a token-driven utility plugin.
  - `disabled` prop ready for Phase 8 — when no filters are active, the store wires this to `true`.

- [ ] **Step 2: Wire into the sandbox**

  Edit `src/app/phase-6/page.tsx`:

  ```tsx
  import { ClearAllFilters } from "@/components/clear-all-filters";
  ```

  Add a section:

  ```tsx
  <div data-testid="section-clear-all-filters" className="space-y-2">
    <h2 className="text-sm uppercase tracking-widest" style={{ color: "var(--fg-3)" }}>
      ClearAllFilters
    </h2>
    <ClearAllFilters onClick={() => undefined} />
  </div>
  ```

- [ ] **Step 3: Build + verify**

  ```bash
  bun run build
  bun run start &
  START_PID=$!
  sleep 5
  curl -s http://localhost:3000/phase-6 > /tmp/echoes-p6.html
  grep -q 'data-testid="clear-all-filters"' /tmp/echoes-p6.html && echo "clear button present OK"
  grep -q '>Clear all<' /tmp/echoes-p6.html && echo "clear copy exact OK"
  kill $START_PID
  ```

  Expected: both `OK` lines.

- [ ] **Step 4: Lint + typecheck**

  ```bash
  bun run lint
  bun run typecheck
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat(components): add <ClearAllFilters> CTA with disabled state stub"
  ```

---

## Task 16: Tone + anti-pattern sweep across all 9 new components

Mechanical grep sweep so nothing slips through that violates Critical Rules 22 (tone) or 23 (anti-patterns). Run before the phase close.

**Files:** none modified — verification only (unless violations found).

- [ ] **Step 1: No banned terminology (Critical Rule 22)**

  ```bash
  grep -rEn "looked-after|service users|LAC\b|care leavers|VFCCymru|VFC\b" \
    src/components src/seed src/lib src/app/phase-6 \
    | grep -v "//" || echo "tone OK — no banned terms in copy"
  ```

  Expected: `tone OK — no banned terms in copy`.

- [ ] **Step 2: No em-dashes in copy strings (Critical Rule 22 — en-dash only)**

  ```bash
  grep -rn "—" src/components src/seed/__fixtures__ src/app/phase-6 \
    | grep -v 'Illustrative composite voice — review-checked' \
    | grep -v 'Too few voices to display individually — aggregated counts only' \
    || echo "en-dash sweep clean (intentional uses only)"
  ```

  Expected: `en-dash sweep clean (intentional uses only)`. Both retained em-dash uses are PLAN.md-mandated copy. Note: the en-dash and em-dash characters look similar; the two whitelisted strings actually use the en-dash `–` per PLAN.md. If grep returns anything other than those two lines, fix the offender to use en-dash `–`.

- [ ] **Step 3: No banned CTAs (Critical Rule 22)**

  ```bash
  grep -rEn "Click here|Learn more|Submit\b" src/components src/app/phase-6 \
    || echo "CTA copy OK"
  ```

  Expected: `CTA copy OK`.

- [ ] **Step 4: No raw hex outside tokens (Critical Rule 20)**

  ```bash
  grep -rEn "#[0-9a-fA-F]{3,8}" src/components | grep -v '//' \
    || echo "no raw hex in components OK"
  ```

  Expected: `no raw hex in components OK`. The fixture (`src/seed/types.ts` `TOPICS`) and `src/styles/vfcc-tokens.css` are allowed to carry hex; components are not.

- [ ] **Step 5: No emoji in any source file (Critical Rule 23)**

  ```bash
  perl -CSD -ne 'print "$ARGV:$.: $_" if /[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]/' \
    $(find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" \)) \
    || echo "no emoji in source OK"
  test -z "$(perl -CSD -ne 'print if /[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]/' \
    $(find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" \)))" \
    && echo "emoji scan clean"
  ```

  Expected: `emoji scan clean`. If any are present, remove them.

- [ ] **Step 6: No pure `#fff` / `#000` / `rgb(0,0,0)` / `rgb(255,255,255)` in components (Critical Rule 23)**

  ```bash
  grep -rEn "#000\b|#fff\b|#000000\b|#ffffff\b|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)" \
    src/components || echo "no pure black/white in components OK"
  ```

  Expected: `no pure black/white in components OK`.

- [ ] **Step 7: No `setInterval` in components (PLAN.md counter rule)**

  ```bash
  grep -rn "setInterval" src/components || echo "no setInterval OK"
  ```

  Expected: `no setInterval OK`.

- [ ] **Step 8: Commit the verification artefact (allow-empty)**

  ```bash
  git commit --allow-empty -m "chore(phase-6): tone + anti-pattern sweep across all 9 components"
  ```

---

## Task 17: Phase-6 close — full Bun test + typecheck + lint + production-build smoke

Closes Phase 6 per PLAN.md "Per-build smoke checks". Tags the release.

**Files:** none modified — verification only.

- [ ] **Step 1: Full Bun test suite passes**

  ```bash
  bun test
  ```

  Expected: all tests pass; exit 0. If a test fails, fix it (the test, the fixture, or the aggregation) before continuing.

- [ ] **Step 2: Typecheck + lint clean**

  ```bash
  bun run typecheck
  bun run lint
  ```

  Expected: both exit 0.

- [ ] **Step 3: Production build completes**

  ```bash
  bun run build
  ```

  Expected: build exits 0; route table includes `/` (landing) and `/phase-6` (sandbox).

  Fall back to `npm run build` if Bun segfaults (CLAUDE.md pinned fallback). Note which command worked in the close commit.

- [ ] **Step 4: Production server serves every component on the sandbox**

  ```bash
  bun run start &
  START_PID=$!
  sleep 5
  curl -s http://localhost:3000/phase-6 > /tmp/echoes-p6.html
  for t in voice-counter sentiment-donut micro-chart topic-bar-list card-source-label \
           voices-feed data-provenance-panel filter-chip clear-all-filters; do
    grep -q "data-testid=\"$t\"" /tmp/echoes-p6.html && echo "$t OK" || echo "$t MISSING"
  done
  grep -q 'data-testid="voices-feed-redacted"' /tmp/echoes-p6.html \
    && echo "voices-feed-redacted OK" || echo "voices-feed-redacted MISSING"
  kill $START_PID
  ```

  Expected: ten `OK` lines (nine components plus the redacted state). Any `MISSING` blocks the phase close — fix before tagging.

- [ ] **Step 5: Header chrome still rendered on top**

  ```bash
  bun run start &
  START_PID=$!
  sleep 5
  curl -s http://localhost:3000/phase-6 | grep -q 'data-testid="echoes-header"' \
    && echo "Phase 3 header preserved OK"
  curl -s http://localhost:3000/phase-6 | grep -q 'Sample data — illustrative composite voices' \
    && echo "DEMO DATA pill present OK"
  kill $START_PID
  ```

  Expected: both `OK` lines — confirms Phase 6 didn't accidentally clobber Phase 3 chrome.

- [ ] **Step 6: Phase-6 close commit + tag**

  ```bash
  git add -A
  git commit --allow-empty -m "chore(phase-6): close core components — bun test green, build green, sandbox verified"
  git tag phase-6-core-components
  ```

- [ ] **Step 7: Update CLAUDE.md status line**

  Open `CLAUDE.md` and update the `## Status` section from the Phase 3 line to:

  > **Phase 6 complete (2026-05-14).** Core dashboard components shipped to `phase-6-core-components`: VoiceCounter, SentimentDonut, MicroChart, TopicBarList, CardSourceLabel, VoicesFeed (with k-anon redaction), DataProvenancePanel, FilterChip, ClearAllFilters. Pure aggregations TDD'd via Bun test. Phase 4 seed authoring and Phase 5 offline tile gen still pending; Phase 6 used the `voices.sample.ts` fixture and is data-source-agnostic. Next: Phase 7a — Map base stack + building coverage gate.

  Then:

  ```bash
  git add CLAUDE.md
  git commit -m "docs: mark phase 6 core components complete in CLAUDE.md"
  ```

---

## Definition of Done

A task-by-task close is reached when:

1. All 17 task checkboxes are ticked.
2. `git tag phase-6-core-components` exists and points at a green build.
3. `bun test`, `bun run typecheck`, `bun run lint`, `bun run build`, `bun run start` all succeed on a fresh checkout.
4. `http://localhost:3000/phase-6` renders all 9 components against the fixture, with both the populated and redacted `<VoicesFeed>` states visible.
5. `src/seed/types.ts` is the single source of truth for `Voice`, `PriorityStatement`, `Topic`, `Region`, `TopicSlug`, `RegionSlug`, `Source`, `Sentiment`, `AgeBand`, `CareSetting`, `ConsentLevel`, `Provenance` types.
6. `src/lib/aggregations.ts` exports `sentimentBreakdown`, `topicCounts`, `provenanceCounts`, `redactBelow5`, `shouldRedact`, `K_ANON_FLOOR`. Every function is tested against `SAMPLE_VOICES`.
7. Every voice card and the (future) priority statement card render `<CardSourceLabel>` with the exact copy "Illustrative composite voice — review-checked".
8. `<VoicesFeed>` renders the redaction copy verbatim — "Too few voices to display individually — aggregated counts only" — whenever its `voices` prop has length < 5.
9. No emoji, no raw hex outside the tokens file / `TOPICS` metadata, no banned tone terms, no banned CTAs, no `setInterval`, no `#000` / `#fff` anywhere in `src/components/`.
10. CLAUDE.md status section reflects Phase 6 complete.

---

## Out of scope — handled in later plans

- **Phase 4** — real ~2,800-voice seed authoring + 9 priority statements + `check:seed` script + YPAB review + editorial red-flag list. Phase 6 used a 30-voice fixture; Phase 4 swaps it for `src/seed/voices.ts` and updates component imports.
- **Phase 5** — `bun run fetch-tiles` for `public/wales.pmtiles` and `bun run fetch-assets` for `public/basemaps-assets/`.
- **Phase 7a / 7b** — MapLibre GL + pmtiles + 3D building extrusion; deck.gl HeatmapLayer + IconLayer + MapControls; SSR-disabled WalesMapWrapper.
- **Phase 8** — Zustand filter store (no `persist` middleware), `<QuickFilters>`, k-anon redaction wired live to the store, FilterChip + ClearAllFilters bound to `clearAll()`.
- **Phase 9** — `<TopicPageBody>`, `<ActionPageBody>`, `<PriorityStatementCard>`, View Transitions API (chip + donut band + header background `view-transition-name`s), Framer Motion `layoutId` fallback.
- **Phase 10** — `<BentoDashboard>` grid with 80ms staggered Framer Motion entrance, GSAP `<HeroIntroTimeline>`, R3F v9 `<HeroSculpture>`, region-marker cascade, 3D-buildings rise, heatmap fade-in.
- **Phase 11** — `<AboutPageBody>`.
- **Phase 12** — Polish pass: skeleton motifs (consistent across charts), empty states, keyboard nav focus rings, tooltips with sample sizes (`n = 47`), the brand-motif hover/press shadow swap moved into a Tailwind utility plugin, `?perf=safe` query-param escape hatch.
- **Phase 13** — `DEMO-SCRIPT.md` + `scripts/smoke.spec.ts` Playwright happy-path.
- **Phase 14 / 15** — Pre-flight + dress rehearsal.

Each subsequent plan follows the same file naming convention: `docs/superpowers/plans/YYYY-MM-DD-<short-name>.md`.
