# Project Echoes — Demo Plan

> Project codename: **Echoes** (English) / **Atseiniau** (Welsh)
> Plan owner: Krit, VFCC
> Plan date: 2026-05-14 (revision 2 — post-council)
> Build location: `/Users/krit/Desktop/04 Web & Development/Project-Echoes/`

---

## Context

Voices From Care Cymru (VFCC) wants to become **the truest live "voice" of the care-experienced community in Wales** — surfacing what young people are saying, feeling and asking for, in near real-time, from every interaction VFCC has with them.

The long-term vision is a public AWS-backed platform where young people's voices (from session notes, surveys, drop-ins, advocacy chats, group sessions and eventually partner organisations) are ingested, analysed for sentiment + topic, and surfaced on an open dashboard. The dashboard feeds the Young People's Advisory Boards (YPAB) and regional groups, who hold discussions whose outputs feed back into the system — closing the loop between voice → insight → action.

This plan covers the **demo / proof-of-concept** only — the artefact Krit uses to pitch:
1. The VFCC **CEO and Board** (internal buy-in)
2. The **AWS Imagine Grant 2026** judging panel (cloud-infrastructure funding for the production build)

The demo runs locally on Krit's laptop with fully seeded data. AWS infrastructure, public hosting, real data pipelines, and Welsh-language NLP are all **post-demo** workstreams — explicitly funded by the grant the demo helps win.

---

## Goal

Build a 6-minute, locally-runnable, beautifully polished web demo that:

1. **Looks like a real product**, not a prototype — board members reach for their phones to photograph the screen.
2. **Tells a clear story** in 6 minutes: voices come in → dashboard surfaces meaning → YPAB acts → loop closes.
3. **Is defensible** when probed: data sources visible, sentiment representation honest, the gap between demo (seeded composite) and production (real AWS pipeline) clearly explained, and every quote/card carries an "illustrative composite" label so a phone-cropped screenshot cannot be misattributed.
4. **Wins the AWS Imagine Grant** when paired with a separate 3-slide pitch deck and AWS architecture diagram.

---

## Critical-path dependencies

External dependencies that, if slow, block the demo regardless of code velocity. Surface on day 1.

| Dependency | Owner | Needed by | Fallback if late |
|---|---|---|---|
| **VFCC safeguarding sign-off** on using real anonymised quotes for fundraising materials, captured as a written artefact at `.review/consent-coverage.md` (naming original consent basis, UK GDPR lawful re-use basis — likely "legitimate interests" with LIA, or fresh consent, and AWS-pitch reuse coverage) | VFCC safeguarding lead | Before voice authoring (phase 4) | Drop to Option B (fully generated) — script reframes accordingly |
| **VFCC data-governance / consent verification** | VFCC data lead | Before voice authoring (phase 4) | Same as above |
| **YPAB reviewer** — paid honorarium, support contact, opt-out, NOT a contributor of any anchor quotes (conflict avoidance), reviewing ~60 quotes (20% of public-tier voices) stratified by topic so mental-health / transitions content is over-sampled | Volunteer YPAB member, identified by name | 3 days before demo | Voice authenticity becomes asserted not evidenced — weakens defensibility, still presentable |
| **Real quote anchor set** (~30–50 anonymised quotes) | Krit + VFCC colleague | Build phase 4 | Fall to Option B |
| **Demo-day venue specs**: projector resolution + aspect ratio (1080p target, 1366×768 fallback, 4:3 risk noted), laptop input (USB-C → HDMI / DisplayPort / VGA confirmed and packed), lighting, audio | Whoever owns the pitch room | 1 week before demo | Last-minute adapter / scaling fixes; possible falling back to recorded video |
| **Demo laptop spec pinned** — exact make/model/year/GPU recorded here. Apple Silicon (M1/M2/M3/M4) handles the full WOW stack trivially. Intel-iGPU MacBooks (≤2019) will likely drop frames on simultaneous 3D buildings + HeatmapLayer + R3F sculpture. Dev/test machine AND demo-day machine must match. Verified via DevTools Performance recording at the close of phase 10 (not only in pre-flight). | Krit | Before phase 10 | Switch to `?perf=safe` mode (see Polish), or default map pitch to 0° and disable R3F rotation; falls further to the recorded video |

If any dependency slips, fall through to the documented fallback. Do not delay the build.

---

## Audience and the 6-minute demo arc

Storyboard this **before any code is written** — actual screen-by-screen mockups in a browser, refined with feedback. Lock the arc in build phase 1.

The exact spoken script lives in `DEMO-SCRIPT.md` (created in phase 13). The narrative below is the structural arc, not the final script.

**Arc shape (to be finalised in the storyboard step):**

| Minute | On screen | Spoken framing (Option A — composite framing) |
|---|---|---|
| 0:00 – 0:45 | Landing / hero — Echoes / Atseiniau brand lockup, single rotating voice quote with per-card "illustrative composite" label, total counter ticking up to seeded total | "This is Echoes. The voices you'll see today are illustrative composites grounded in real VFCC conversations and reviewed by a member of our Young People's Advisory Board. With the grant, they become every real voice, live." |
| 0:45 – 2:00 | Main dashboard — Wales map filling in region by region, sentiment overview, topic bar list, voices feed | "Here's what young people are telling us across Wales — by topic, by region, by source." |
| 2:00 – 3:30 | Click into Housing — sentiment breakdown, time-trend line, regional map filtered to housing, voices feed, "asking for" summary | "Housing — most voices are still hopeful, but you can see the trend dropping the last two months. North Wales is the most concerned region." |
| 3:30 – 4:30 | YPAB priority statement card with linked discussion context expandable | "Last month the South Wales YPAB met about housing. Their priority statement, drawing on 47 voices, was…" |
| 4:30 – 5:30 | Quick filters cascade — age band + care setting + topic | "And the data isn't flat. We can ask: what are 16-to-18-year-olds in residential care saying about education? Here." |
| 5:30 – 6:00 | Close — back to overview, then external slide: AWS production architecture | "What you've seen runs on seeded composite data. With the AWS Imagine Grant, every voice from every interaction is processed in near real-time. Here's the picture." |

**Slot dwell times** (45 / 75 / 90 / 60 / 60 / 30 seconds) leave room for each screen's polish to land.

---

## Confirmed decisions

| Decision | Choice |
|---|---|
| Demo framing | **Insight → action loop.** Dashboard + YPAB discussions + priority statements feeding back. |
| Sentiment representation | **Topic-tagged.** Each voice has 1–3 topics + a sentiment band (hopeful / mixed / worried). Aggregates show e.g. "Housing: 62% hopeful, 24% mixed, 14% worried." |
| YPAB output format | **Priority statement card** per topic. Group + date + statement quote + voice-references + linked discussion excerpt + per-card "illustrative composite" label. |
| Tech stack | Next.js 15 (App Router) + TypeScript + Tailwind 4 + shadcn/ui (re-themed to VFCC tokens) + Recharts + **MapLibre GL JS** + **`pmtiles`** + **`protomaps-themes-base`** (dark) + **`@deck.gl/mapbox`** + Framer Motion + **GSAP** + **`@react-three/fiber@^9`** (hero only) + **Instrument Sans + Shrikhand + JetBrains Mono** via `next/font/google` + Zustand + Biome. Package manager: Bun. |
| Hosting | **Local-only** for the demo. Public deploy is post-demo work. |
| Welsh-language scope | **EN-only UI for the demo.** Bilingual brand lockup (Echoes · Atseiniau) in the header as a heritage nod. Full Welsh NLP is a post-demo / grant-funded workstream. |
| **Map stack** | **MapLibre GL JS** rendering a single offline `public/wales.pmtiles` (~20–50MB, extracted with `pmtiles extract` from the dated Protomaps planet download) via the `pmtiles` protocol handler. **`protomaps-themes-base` dark flavor** as basemap style. **3D building extrusion** + **`@deck.gl/mapbox` `MapboxOverlay`** for `HeatmapLayer` (sentiment heat surface) and `IconLayer` (region markers). Pitch/bearing/rotate enabled (default pitch 45° on dashboard, 0° on topic pages). Free for non-commercial use with attribution. Glyph PBFs + sprites self-hosted at `public/basemaps-assets/` — see Critical-Rule 19. |
| Data volume | **~2,800 seeded voices** total. ~300 with `consentLevel: 'public'` (full quote shown); ~2,500 with `consentLevel: 'aggregate-only'` (metadata only, no quote — modelling that most contributions are tickbox / aggregate). Matches the opener-counter number; keeps LLM authoring bounded to ~300 quotes. |
| Priority statements count | **Exactly 9.** One per major topic (7) + 2 cross-cutting. Pinned for deterministic seeding. |
| AWS architecture | **Out of demo build scope.** Diagram + narrative is a post-demo workstream. Production NLP plan: **Bedrock (Claude / Titan) for both English and Welsh** via prompt-engineered classification; **Comprehend** as cheaper English-only fallback for high-volume; **SageMaker** reserved for later custom Welsh classifier if Bedrock evaluation shows accuracy gaps. |
| Visual direction | **VFCC Design System** at `~/Desktop/03 Design & Assets/VFCC Design System/` is the primary system — colour, type, motif, tone. Dark theme by default (VFCC warm dark, not generic SaaS dark). Mood-board references for the data-product polish layer: Mental Health Innovations AWS case study; Vercel 2026 dashboard redesign; Linear microinteractions. Browser mockup compare-and-pick in build phase 2 is now scoped to small variations *within* the VFCC visual language, not a free-for-all. |
| Persistent "DEMO DATA" framing | **Required at two levels.** (1) Small pill in the header reading "Sample data — illustrative composite voices". (2) Micro-label on every `<VoicesFeed>` card and every `<PriorityStatementCard>` so a phone-cropped single card still carries the disclaimer. |
| Status indicator | **"6-month composite · Dec 2025 – May 2026"** (not "Live · Today" — that contradicts the composite framing). |

---

## Tech stack (detail)

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Runtime / package manager:** Bun.
  - *HMR caveat:* `bun run dev` works but Turbopack HMR can be flaky. **Fallback: `npm run dev`** — same code, no project changes.
  - *Build caveat:* `bun run build` has documented segfault risk on Next.js 15+. **Fallback: `npm run build`** — pinned as named pre-flight fallback.
- **Styling:** Tailwind CSS 4 (CSS-first config — no `tailwind.config.js`).
- **Component library:** shadcn/ui (official Tailwind 4 support 2026).
  - *Init gotcha:* when `npx shadcn@latest init` asks for the Tailwind config path, **leave it blank** — Tailwind 4 uses CSS-first config; not leaving blank produces "no config found" and the LLM may auto-downgrade to Tailwind 3.
- **Charts:** Recharts (bar, line, area, donut). Same skeleton motif on every chart (see Polish section).
- **Map stack (Apple Maps–quality):**
  - **MapLibre GL JS** as the WebGL vector renderer — full 3D, pitch/bearing/rotate, smooth zoom.
  - **`pmtiles` JS library** to serve a single offline `public/wales.pmtiles` to MapLibre via the protocol handler.
  - **`protomaps-themes-base`** dark style (or a customised fork) as the basemap style JSON. Light, modern, dashboard-friendly.
  - **3D building extrusion** layer rendered via MapLibre's `fill-extrusion` paint type, reading the **`building` (singular) layer** + `height` attribute (`["get", "height"]`) from the PMTiles (OpenMapTiles schema). Looks especially good over Cardiff / Swansea / Newport / Wrexham. **Coverage caveat:** OSM building heights in Wales are patchy — at the start of phase 7, do a quick tile-inspector spot-check on the four target cities. If coverage is too sparse, fall back to abstract `fill-extrusion` over region centroids (uniform height per region, sentiment-weighted opacity).
  - **`@deck.gl/mapbox` + `MapboxOverlay`** to layer deck.gl on top of MapLibre. Used for:
    - `HeatmapLayer` — the sentiment heat surface across Wales (replaces simple region dots as the headline visual).
    - `IconLayer` — for per-region accent markers when zoomed in.
    - `ArcLayer` (optional) — connecting young people to YPAB sessions during the action-loop drill-in.
  - **Pitch + bearing controls** enabled — users can tilt and rotate. Default pitch ~45° on the dashboard map for the macOS feel; level out (pitch 0) on the topic-page filtered view so the data reads cleanly.
  - **Single offline `public/wales.pmtiles`** generated by `bun run fetch-tiles` (wraps `pmtiles extract` against the dated Protomaps planet snapshot, Wales bounding box).
  - **SSR pattern (required):** the map component is loaded via `next/dynamic` with `{ ssr: false }` inside a `'use client'` boundary — MapLibre touches `window`/`HTMLCanvasElement` at import time.
  - **Attribution preserved:** Protomaps + OpenStreetMap attribution rendered in the map UI bottom-right.
- **Animation stack:**
  - **Framer Motion (`motion`)** for component-level entrance, hover, counter, and the `<motion.div layout>`-inside-`<LayoutGroup>` topic-click cascade. `layoutId` reserved for the topic chip that genuinely morphs between `<TopicBarList>` and the topic-page header.
  - **View Transitions API (same-document / SPA)** for the route-level drill-in transition (dashboard → topic page) — gives the Apple-style "magic move" feel. Used via Next.js 15 App Router's view-transition support or via direct `document.startViewTransition` calls inside route navigation. **SPA support is wide as of 2026** (Chrome 111+, Safari 18+, Firefox 144+); cross-document MPA support is narrower and we don't use it. **Fallback** (any unsupported browser, feature-detected via `'startViewTransition' in document`): the existing Framer Motion `layoutId` path on the chip + the same `<motion.div layout>` cascade — same intent, no View Transition.
  - **GSAP** for the landing-page intro timeline (the only complex multi-step choreography that's hard to express imperatively with Framer Motion alone) — counter tick, brand reveal, hero copy, the "enter dashboard" CTA pulse.
  - **Counter pattern:** `useMotionValue` + `animate()` + `Math.round` transform; never `setInterval`.
  - **Reduced motion + failure path:** if `prefers-reduced-motion: reduce` is set OR an animation throws, panels swap instantly. Never let an animation failure freeze the demo.
- **Optional 3D hero element (`react-three-fiber@^9` + `@react-three/drei`):** used in ONE place only — the landing-hero `<HeroSculpture>` (a slowly-rotating generative 3D shape driven by aggregate sentiment values). **Pin R3F to v9** — v8 is not React 19 compatible. Bundle cost ~150–200KB gzipped, justified by the WOW landing impression. If `prefers-reduced-motion` is set, the sculpture freezes (no rotation) but still renders. SSR-disabled via `next/dynamic`. **Do not use R3F anywhere else** — overkill for the rest.
- **Fonts (VFCC Design System):**
  - **Display: Shrikhand** (Google Fonts, SIL OFL — chunky, leaning, hand-drawn caps; supports Welsh circumflexes ŵ ŷ) — used on hero, "wow" headlines, the Echoes / Atseiniau lockup.
  - **UI: Instrument Sans** (Google Fonts, variable, SIL OFL — warm humanist sans) — body, headings, buttons, labels.
  - **Mono: JetBrains Mono** (Google Fonts, SIL OFL) — tabular numerics, counter, codes.
  - All three loaded via **`next/font/google`** (downloads at build time, self-hosted on the demo laptop, no runtime CDN call — preserves the offline guarantee). **Never import via `@import url('googleapis...')`** — that's a runtime CDN fetch.
- **Design tokens (VFCC Design System):** the source of truth is `~/Desktop/03 Design & Assets/VFCC Design System/colors_and_type.css`. A copy is placed in the project at `src/styles/vfcc-tokens.css` (so the project is self-contained and version-controlled) and imported from `src/app/globals.css`. **Use semantic tokens (`--brand`, `--fg-1`, `--surface`, `--border-ink`) — never raw palette hex.** Dark mode is `data-theme="dark"` on `<html>`; the project defaults to dark for projector visibility but the same tokens work for light if needed.
- **shadcn/ui re-themed against VFCC tokens:** shadcn ships with its own neutral palette via CSS vars. Map shadcn's vars to VFCC tokens in `globals.css` (e.g. shadcn `--background` → VFCC `--bg`, shadcn `--primary` → VFCC `--brand`, shadcn `--radius` → VFCC `--radius-md`). The shadcn components then render in VFCC brand colours automatically.
- **Icons:** Lucide React.
- **State:** Zustand — single filter store covering topic / region / age band / care setting. **No `persist` middleware** (would break Cmd+R recovery to clean landing). Exposes a `clearAll()` action consumed by the "Clear all" filter button.
- **Seed data:** Strongly-typed TypeScript modules under `src/seed/`. Authored deliberately, version-controlled, integrity- and k-anonymity-checked.
- **Lint/format:** Biome.

**Run commands** (canonical, mirrored in `package.json` and CLAUDE.md):

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:node": "next dev",
    "build": "next build",
    "build:node": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "check:seed": "bun run scripts/check-seed.ts",
    "fetch-tiles": "bun run scripts/fetch-tiles.ts",
    "fetch-assets": "bun run scripts/fetch-assets.ts",
    "smoke": "bunx playwright test scripts/smoke.spec.ts"
  }
}
```

Use `bun run <script>` by default; `npm run <script>` for any script that misbehaves under Bun (dev HMR or build).

**Offline guarantee:** Instrument Sans + Shrikhand + JetBrains Mono are self-hosted via `next/font/google` (downloaded at build time, served from `.next/static/media/`). MapLibre glyph PBFs + sprite sheets are self-hosted at `public/basemaps-assets/` (downloaded by `bun run fetch-assets`). The `public/wales.pmtiles` file is generated before travel and gitignored but **must be physically present on the demo laptop**. No external CDN, font, analytics, or telemetry call at *runtime*. Verified via devtools Network tab pre-flight (no external requests on any route).

**Build-time network requirement (important).** `next/font/google` and the `fetch-tiles` / `fetch-assets` scripts all require **internet access at build time** to download fonts, tiles, and sprite sheets. The workflow is therefore: **build with wifi ON; demo with wifi OFF.** Do not attempt to `bun run build` at the venue without internet — it will silently fail to fetch fonts. The compiled `.next/` output is what runs offline. Run `bun run build && bun run start` before disconnecting wifi for the live demo.

---

## App structure

```
/                          # Landing — hero, voice counter, "enter dashboard" CTA
/dashboard                 # Main dashboard — overview of everything
/topic/[slug]              # Topic deep-dive (housing, mental-health, etc.)
/action                    # YPAB action view — all priority statements grouped by date
/about                     # Methodology / data sources / consent / contact / ICO references
```

`/region/[slug]` is **descoped from the demo** (deferred to v1). Region clicks on the map filter the current view (sticky), they do not navigate.

**Persistent chrome:**
- Top bar: bilingual brand lockup (Echoes · Atseiniau) · "DEMO DATA — illustrative composite voices" pill · global filter strip · "6-month composite · Dec 2025 – May 2026" indicator
- Side nav (collapsible): Dashboard · Topics · Action · About

**Small-screen behaviour:** below 1024px width, render a polite "This dashboard is designed for desktop / projector display. Switch device or rotate to landscape." message instead of a broken layout.

---

## Data model (seed data shape)

```ts
type TopicSlug =
  | 'housing'
  | 'mental-health'
  | 'education'
  | 'identity'
  | 'relationships'
  | 'transitions'
  | 'rights';

type RegionSlug =
  | 'cardiff-vale'
  | 'swansea-bay'
  | 'cwm-taf-morgannwg'
  | 'gwent'
  | 'west-wales'
  | 'powys'
  | 'north-wales';

type Topic = {
  slug: TopicSlug;
  name: string;
  description: string;
  color: string;            // hex, e.g. "#E07A5F"
};

type Region = {
  slug: RegionSlug;
  name: string;
  lat: number;
  lon: number;
};

type Voice = {
  id: string;                                 // ulid
  excerpt: string | null;                     // non-empty iff consentLevel === 'public'
  topics: TopicSlug[];                        // 1 ≤ length ≤ 3, unique
  sentiment: 'hopeful' | 'mixed' | 'worried';
  region: RegionSlug;
  source: 'one-to-one' | 'ypab' | 'drop-in' | 'survey';
  sessionId?: string;                         // present iff source === 'ypab'; NEVER exposed in UI / URL / DOM
  ageBand: 'under-16' | '16-18' | '18-plus';
  careSetting: 'foster' | 'residential' | 'kinship' | 'leaving-care';
  capturedAt: string;                         // ISO date, between 2025-12-01 and 2026-05-14
  consentLevel: 'public' | 'aggregate-only';
};

type Provenance = Record<Voice['source'], number>;
// invariant: sum(values) === voices.length

type PriorityStatement = {
  id: string;
  topic: TopicSlug;
  groupType: 'ypab' | 'national' | 'regional';
  groupRegion?: RegionSlug;                   // present iff groupType !== 'national'
  date: string;                               // ISO date
  statement: string;
  voiceIds: string[];                         // unique; all resolve to Voice.id
  drawingOnCount: number;                     // MUST equal voiceIds.length (asserted)
  discussionContext: string;
  excerptVoiceIds: string[];                  // subset of voiceIds; each has consentLevel='public' and non-empty excerpt
};
```

`sessionId` is generated server-side / build-time only and is never rendered in any UI, never appended to URLs, never present in the DOM. If a sessionId is required for analytics in the production version, that's a post-demo concern with separate safeguards.

---

## Seed data plan

### Topics (7)
- Housing & accommodation
- Mental health & wellbeing
- Education, work & training
- Identity & belonging
- Relationships (family, friends, professionals)
- Transitions (leaving care, ageing out)
- Rights & advocacy

### Regions (7) — mapped to NHS Wales health boards
- Cardiff & Vale
- Swansea Bay
- Cwm Taf Morgannwg
- Gwent (Aneurin Bevan)
- West Wales (Hywel Dda)
- Powys
- North Wales (Betsi Cadwaladr)

### Sources (provenance panel)
- 1-to-1 advocacy chats (anonymised)
- YPAB / regional group sessions
- Drop-in events
- Surveys
- *Partner organisations — coming soon* (placeholder)

### Volume + date range
- **2,800 voices** total; **300 `public`** (with quote), **2,500 `aggregate-only`** (metadata only).
- Date range **2025-12-01 – 2026-05-14**.
- Distribution (target percentages — pinned for deterministic seeding and pre-checkable against k-anon floor):
  - Housing & accommodation — 28%
  - Mental health & wellbeing — 24%
  - Education, work & training — 16%
  - Identity & belonging — 10%
  - Relationships — 10%
  - Transitions — 8%
  - Rights & advocacy — 4%
- **9 priority statements** total — one per topic + 2 cross-cutting (e.g. "Identity × Mental health", "Transitions × Housing"). Dated Mar–May 2026.

### k-anonymity safeguard (NON-NEGOTIABLE)

**Floor: every displayable slice must contain ≥ 5 voices.**

**Filter dimensions** (the ones `<QuickFilters>` exposes): **topic × region × ageBand × careSetting** (4 dimensions). The cross-product covers 7 × 7 × 3 × 4 = 588 cells over 2,800 voices — small enough to enumerate.

**Aggregation dimensions** (not directly filterable, but used by certain panels): **source** (`<DataProvenancePanel>` breakdown) and **month bucket** (`<TimeTrendLine>` buckets). These operate on the *currently-filtered* voice set, so they inherit the active-filter k-anon protection — no separate enumeration needed.

What `check:seed` must verify:

1. **All named demo-path fixtures** (pinned list below) — ≥ 5
2. **Every cell in the filter cross-product** (topic × region × ageBand × careSetting) — ≥ 5 OR explicitly marked as "redact in UI"
3. **Every single-dimension rollup** across topic / region / ageBand / careSetting / source / month — ≥ 5 (these are reachable via the side nav and the panel views)
4. **Within each topic page**, the time-trend month buckets and the source breakdown — every visible bar/segment — ≥ 5

The UI honours the same floor at render time: when an active filter resolves to <5 voices in any visible panel, that panel renders the **"Too few voices to display individually — aggregated counts only"** redaction state instead of breaking down.

In the UI, the same check runs at render time on the active filter combination — if the slice resolves to <5 voices, the panel renders the **"Too few voices to display individually — aggregated counts only"** redaction instead of breaking down. This protects against on-stage and post-pitch combinatorial re-identification, and models the production safeguard.

**Pinned on-stage assertions** (named fixtures in `check:seed`):
- (16-18) × (residential) × (education) — minute 4:30 cascade — must hold ≥ 5
- (housing) × (north-wales) — minute 2:00 click — must hold ≥ 5
- Any (region) × (ageBand) × (careSetting) × (topic) used in `DEMO-SCRIPT.md` — must hold ≥ 5

### Voice authenticity — workflow

Two-tier strategy. Default Option A; fall to Option B only if dependencies slip.

**Option A — Real anchor + generated extension (default):**
1. Krit + VFCC colleague pull ~30–50 real anonymised quotes from existing VFCC work.
2. VFCC safeguarding lead signs off `.review/consent-coverage.md`.
3. LLM generates remaining ~250 public-tier quotes in the same register.
4. **Editorial / content-safety filter pass** (see below) on every generated quote.
5. YPAB reviewer (paid honorarium, opt-out, no conflicts) reviews **~60 stratified samples** (~20%, over-sampled in mental-health / transitions) for both authenticity AND safety. Revisions applied.

**Option B — Fully generated + reviewed (fallback):**
1. LLM generates all ~300 public-tier quotes grounded in published care-leaver research + VFCC's tone.
2. Editorial / content-safety filter pass.
3. YPAB review pass as above.
4. Spoken script reframes — "illustrative composites" remains accurate; "real anonymised" claim removed.

### Editorial / content-safety guideline

All seeded public quotes must pass this guideline. Enforced via:
- Author-time exclusion list applied during LLM generation
- A red-flag regex in `check:seed` that fails the build on banned patterns
- YPAB reviewer flags for safety (not just authenticity)

**Excluded content:**
- Self-harm or suicidal-ideation references (Samaritans-style safe messaging applies: no method, no glorification, no minimisation)
- Disclosures of abuse / violence / sexual harm
- Named individuals — workers, foster carers, family members, institutions
- Identifiable institutions (specific home names, schools, care providers)
- Identifiable trauma narratives (specific incidents, dates, locations)
- Stigmatising or pathologising framings of mental health
- Direct attribution of policy failures to identifiable departments / officials
- Anything that, presented out of context, could embarrass or harm the young person whose composite voice it represents

The `check:seed` red-flag list is committed at `src/seed/red-flags.ts` and exported so the production pipeline can inherit it.

---

## Components / UI pieces

Each is a separate, testable unit. File names follow Next.js convention (`kebab-case.tsx`).

**Top-level chrome:**
- `<EchoesHeader>` — bilingual brand lockup + DEMO DATA pill + "6-month composite" indicator + global filter strip
- `<DemoDataBadge>` — persistent "illustrative composite voices" indicator in the chrome
- `<CardSourceLabel>` — small "illustrative composite" micro-label rendered on every `<VoicesFeed>` card and every `<PriorityStatementCard>`

**Filters:**
- `<QuickFilters>` — age band + care setting + region + topic multi-toggles
- `<FilterChip>` — active filter pill with × remove affordance
- `<ClearAllFilters>` — single "Clear all" button bound to Zustand `clearAll()` action

**Landing hero:**
- `<HeroSculpture>` — react-three-fiber v9 3D form. **Primitive:** `IcosahedronGeometry` (detail: 4) wrapped in a custom shader that displaces vertices by Perlin noise. **Material:** `MeshPhysicalMaterial` with `roughness: 0.25`, `metalness: 0.35`, `clearcoat: 0.6`, base colour `--vfcc-red-500`. **Lighting:** one warm fill `<directionalLight color="#ffd27a" intensity={0.8}>`, one cool rim `<directionalLight color="#8cbadb" intensity={0.4}>`, ambient at `0.15`. **Animation:** rotation `0.003 rad/frame` on Y-axis; vertex displacement amplitude bound to `worried%` (`amp = 0.15 + worriedPct * 0.25`); ring radius bound to `hopeful%` (`radius = 1.0 + hopefulPct * 0.4`). Reduced-motion: rotation stops at 0; sculpture still renders. SSR-disabled via `<HeroSculptureWrapper>`. **The one place R3F is used.**
- `<HeroIntroTimeline>` — GSAP timeline. **Beats + easings:** (1) brand lockup fade — `duration: 0.6, ease: 'power3.out'`; (2) `<HeroSculpture>` reveal scale 0.85 → 1 — `duration: 0.8, ease: 'expo.out'`; (3) `<VoiceCounter>` tick — `duration: 1.2, ease: 'expo.out'`; (4) hero copy fade/slide — `duration: 0.4, ease: 'power2.out'`; (5) "Enter dashboard" CTA pulse — `duration: 0.3, ease: 'back.out(2)'`. Total ~1.8s. Never use the GSAP default `power1.inOut` — it reads as generic AI animation.

**Dashboard (Bento-grid layout):**
- `<BentoDashboard>` — CSS Grid layout, **explicit template**:
  ```css
  grid-template-columns: 2.4fr 1.2fr 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "map     map     counter"
    "map     map     donut"
    "topics  voices  provenance";
  ```
  Tiles animate in on first mount: **staggered Framer Motion entrance, 80ms between tiles, each tile `y: 12 → 0, opacity: 0 → 1, ease: [0.22, 1, 0.36, 1]` (custom snappy cubic-bezier — NOT `easeInOut`), per-tile `duration: 0.42`**. Total ~700ms. Hover: tile lifts via increasing `--shadow-offset` from 4→6px and `translate(-1px,-1px)` per VFCC brand motif. Each tile carries the **2px ink border + 4px offset shadow** signature.
- `<VoiceCounter>` — Framer Motion `useMotionValue` + `animate()` ticker (NOT `setInterval`); reads total from seed.
- `<SentimentDonut>` — 3-band donut (hopeful / mixed / worried); animates in.
- `<TopicBarList>` — horizontal bars of voice counts per topic; click to drill in. Each bar has a hover-revealed `<MicroChart>` showing its time-trend sparkline.
- `<MicroChart>` — small inline sparkline (Recharts) rendered on hover-reveal for individual chart segments + voice cards + topic bars. Reinforces "everything has depth".

**The map (the centrepiece WOW moment):**

`<SentimentHeatmap>`, `<RegionMarkers>`, and `<MapControls>` are **composed inside `<WalesMap>`** — never imported from a server component or from any other parent. `<WalesMapWrapper>` is the single SSR-disabled entry point for the whole map subtree.

- `<WalesMap>` — **MapLibre GL JS** rendering `public/wales.pmtiles` via the `pmtiles` protocol handler and a **patched** `protomaps-themes-base` dark style (glyphs + sprites point to local `/basemaps-assets/...`, NOT the remote CDN). **3D building extrusion** layer via `fill-extrusion`:
  - `fill-extrusion-color: '#c8b59e'` (warm neutral facade, Apple-Maps dusk feel)
  - `fill-extrusion-height: ['get', 'height']` (with the centroid-extrusion fallback path if `building`-layer coverage is sparse)
  - `fill-extrusion-base: ['get', 'min_height']` (defaults to 0)
  - `fill-extrusion-opacity: 0.85`
  - MapLibre `setLight({ anchor: 'viewport', color: '#ffd27a', intensity: 0.5 })` — warm directional light that gives the dusk-facade glow.
  - Pitch default 45° on dashboard, 0° on topic pages. Smooth pinch/scroll zoom; tilt + rotate enabled.
- `<SentimentHeatmap>` — `@deck.gl/mapbox` `MapboxOverlay` rendering deck.gl `HeatmapLayer`. **Parameters:**
  - `radiusPixels: 60`
  - `intensity: 1.2`
  - `threshold: 0.03`
  - `colorRange: [[16, 11, 8, 0], [58, 132, 188, 180], [255, 215, 106, 220], [229, 62, 47, 245]]` (VFCC ink → sky → sun → red — heat ramp built from brand tokens)
  - `getPosition: voice => voice._coords` (see "Heatmap data shape" below)
  - `getWeight: voice => voice.sentiment === 'hopeful' ? 1 : voice.sentiment === 'mixed' ? 0.7 : 1.2` (worried weights slightly higher — visualises concern more vividly without lying)
  - Density and colour both reshape when filters change (deck.gl re-tessellates on prop change).
- `<RegionMarkers>` — `IconLayer` (deck.gl) for the 7 region centroids; appears at zoom ≥ 7. Click filters (does not navigate). Staggered 200ms-per-region reveal on first dashboard load.
- `<MapControls>` — pitch-reset, rotate-reset, fly-to-region buttons in the map's bottom-left. Buttons follow the VFCC pill + offset-shadow motif.
- `<WalesMapWrapper>` — `'use client'` boundary using `next/dynamic` with `{ ssr: false }` around `<WalesMap>`. **`<SentimentHeatmap>`, `<RegionMarkers>`, `<MapControls>` MUST NOT be imported anywhere outside `<WalesMap>`.**

### Heatmap data shape

`Voice` records carry a `region: RegionSlug` but no per-voice coordinates. A raw centroid-only heatmap renders as 7 stacked blobs — not a Wales-wide heat surface. So at load time, `lib/heatmap.ts` derives a deterministic `_coords: [lon, lat]` per voice:

```ts
function jitter(voiceId: string, regionLat: number, regionLon: number): [number, number] {
  const seed = hashString(voiceId);            // deterministic
  const dLat = (seedToFloat(seed, 0) - 0.5) * 0.30;   // ~±0.15° N/S
  const dLon = (seedToFloat(seed, 1) - 0.5) * 0.45;   // ~±0.22° E/W
  return [regionLon + dLon, regionLat + dLat];
}
```

The jitter is deterministic (same voice → same coords across reloads) and bounded by the regional area of Wales (no points end up in the sea or in England). The heatmap reads as a continuous surface across populated Wales.

**Other dashboard widgets:**
- `<TimeTrendLine>` — Recharts line chart of sentiment proportions per topic over the seeded date range; tooltips inline.
- `<VoicesFeed>` — anonymous quote cards (excerpt + topic chips + region + age band + source + `<CardSourceLabel>`); k-anon redaction state when slice < 5. **Hover-reveal**: each card expands slightly and shows a tiny `<MicroChart>` of the contributing region's recent sentiment.
- `<DataProvenancePanel>` — honest count per source; derived from `Provenance` type; asserts sum equals total voices.

**Topic / Action views:**
- `<PriorityStatementCard>` — group + date + statement + drawing-on count + expandable discussion context with 2–3 example excerpts + `<CardSourceLabel>`
- `<TopicPageBody>` — composes Donut + TimeTrend + filtered Map + VoicesFeed + PriorityStatementCard. Lives in `components/`; the route at `src/app/topic/[slug]/page.tsx` imports and composes it.
- `<ActionPageBody>` — all 9 priority statements grouped by date

**About:**
- `<AboutPageBody>` — opens with the **VFCC mission verbatim**: *"To improve the lives of care-experienced children and young people in Wales by being their independent voice."* Then: methodology (topic-tagged sentiment), data sources, **consent + ICO 2025 anonymisation guidance** (spectrum-of-identifiability, motivated-intruder test), the demo-vs-production gap, **ICO Children's Code reference + Article 8 UK GDPR + Welsh Government's Care-Experienced Charter**, design system credit, and contact. Tone follows the VFCC content rules (we/you, no "service users", en-dash, "per cent").

**Skeletons** (consistent visual motif across charts; no LLM-invented variants):
- Donut → circular grey shimmer ring at the donut's outer radius
- Topic bar list → 7 stacked bar-height shimmer bars
- Voices feed → 3 stacked card-height shimmer bars with rounded corners
- Wales map → full-tile grey fill with pulsing opacity (no fake dots)
- Time trend line → flat horizontal shimmer line at chart midline
- Sentiment donut tooltip → uses the same skeleton during hover-fetch (if any)

---

## Visual & interaction design

**Primary design system: VFCC Design System** at `~/Desktop/03 Design & Assets/VFCC Design System/`. This is the authoritative source for colour, type, motif, tone, and copy rules — read `README.md` and `SKILL.md` there first. Brand personality: **Fun, Caring, Unconventional, Passionate, Open, Brave, Challenging.** Don't lose the warmth.

Secondary mood-board references (for the "data-product" polish layer on top of the VFCC brand):
- **Mental Health Innovations / Shout / The Mix** AWS case study (proven AWS Imagine Grant winner — data-first design that respects user agency)
- **Vercel 2026 dashboard redesign** (polished, data-dense, not overwhelming)
- **Linear** (generous whitespace, "expensive considered" microinteractions)

What is locked in regardless of visual direction:
- **Bilingual brand lockup** (Echoes · Atseiniau) in Shrikhand display, top-left of every header, 96px minimum, 'V'-width clear zone preserved (per VFCC layout rules)
- **VFCC fonts**: Shrikhand (display) + Instrument Sans (UI) + JetBrains Mono (numerics)
- **VFCC token-driven theming**: ink + cream + brand red/green base; warm honey + sky as accents. **No raw hex in components** — use semantic tokens.
- **Brand motif on every elevated surface**: **2px ink border + 4px offset shadow** on cards, buttons, the DEMO DATA pill, voice cards, priority statement cards, illustration plates. Hover: shadow → 6px, translate `-1px -1px`. Press: shadow → 0 0, translate `+4px +4px` ("lands"). This is the signature — get it right.
- **Dark theme by default** for projector visibility — but VFCC dark (warm `#100b08` background, cream foreground), NOT generic SaaS dark. The cream-on-warm-ink reads editorial, not sterile.
- **Persistent DEMO DATA pill + per-card `<CardSourceLabel>`** (rendered in the brand-motif style — pill radius, offset shadow, ink border)
- **Generous whitespace, large numeric typography** (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 px scale per the system)
- **Lucide icons**, stroke width 1.75 at 24px (one notch heavier than Lucide default for warmth alongside Shrikhand)
- `prefers-reduced-motion` respected throughout

### Brand anti-patterns (NON-NEGOTIABLE)

These are taken from the VFCC Design System. Build will reject any of these on review:

- **No gradients in backgrounds.** Flat colour only.
- **No glassmorphism / frosted cards / translucent buttons.** Only the sticky-nav-on-scroll exception (cream at .85 + 12px backdrop-blur).
- **No pure black (`#000`) or pure white (`#fff`)** as page or text colour. Use `--vfcc-ink` (`#17120f`) and `--vfcc-cream` (`#f7f2ea`).
- **No skeuomorphism, neumorphism, glossy 3D, or generic SaaS dashboard chrome.**
- **No AI-generated faces, bodies, or hand-drawn-style illustrations** mimicking the logo character. Illustrations get commissioned, never generated.
- **No emoji in chrome, headers, charts, or formal copy.** Sparingly OK in YPAB-facing community sections, but this demo is for board + grant judges — keep emoji out entirely.
- **No cards styled as "rounded + left colour bar only".**

### Tone & terminology (NON-NEGOTIABLE)

From the VFCC Design System:

- Always **"care-experienced children and young people"** — never "looked-after children", "LAC", "service users", "care leavers".
- The organisation is **VFCC** (or **Voices From Care Cymru** on first mention) — never "VFCCymru" or "VFC".
- "The care system" — never "the looked-after care system" or "Leaving Care services".
- **First person we, second person you.** "We listen", "you belong here". Avoid distancing third person.
- **En-dash `–`** to separate clauses (not em-dash, not hyphen).
- **"per cent"** in prose, never `%`. `%` is fine in chart labels and tooltips.
- **Dates**: `1 July 2026`, not `1st July` or `01/07/2026`.
- **Times**: `9.00am` / `3.30pm`, never 24-hour.
- **Numbers ≤ 9 spelled out** in prose ("five young people"), except with units (`5mm`, `5 per cent`).
- **CTAs**: short verbs ("Get involved", "Read her story") — never "Click here", "Learn more", "Submit".

The demo-script copy and every label / button / empty-state string in the UI must follow these rules.

### The "wow" moments (specifically engineered in)

1. **Landing hero — `<HeroIntroTimeline>` (GSAP).** First 1.8s on the landing page: bilingual brand lockup fades in word-by-word; `<HeroSculpture>` slow-rotates into view; `<VoiceCounter>` ticks 0 → seeded total (`useMotionValue` + `Math.round`); hero copy types in; CTA button pulses once. GSAP timeline orchestrates the lot.
2. **3D HeroSculpture (R3F).** A generative 3D shape (ring of vertices displaced by aggregate sentiment) rotates slowly on the hero. Subtle, not flashy. Driven by real seed values so it changes if the data does.
3. **Wales heat-map reveal.** First time the dashboard loads, the `<SentimentHeatmap>` overlay fades in from zero opacity over ~1.2s while the map's 3D buildings rise from flat (animated `fill-extrusion-height` from 0 → real height). Reads as "the country materialising".
4. **Region markers cascade.** Right after the heat map settles, the 7 `<RegionMarkers>` pulse in at 200ms staggered — anchors the eye after the diffuse heat.
5. **Bento tiles staggered entrance.** Around the map, the 6–7 surrounding Bento tiles (counter, donut, topic bar list, voices feed, provenance, time-trend) staggered-in with a Framer Motion entrance — each tile rises 12px and fades to opaque, 80ms between tiles. ~700ms total.
6. **Topic-click cascade with View Transitions.** Click a topic on the dashboard. **Elements with `view-transition-name`:** the topic chip (`vt-topic-chip-${slug}`); the topic colour band on the dashboard donut (`vt-topic-donut-${slug}`); the topic-page header background (`vt-topic-header-${slug}`). **Elements WITHOUT** `view-transition-name`: every panel, the map, the voices feed, the chrome — these stay in place visually and reshape with Framer Motion `<motion.div layout>` inside `<LayoutGroup>`. The View Transition handles just the three branded surfaces that genuinely move; the LayoutGroup handles the rest. Total <600ms. **Fallback** (no View Transitions support, feature-detected): the Framer Motion `layoutId` path on the chip + the same layout cascade — same intent, no morph.
7. **Map pitch/rotate microinteraction.** Hover the map, the cursor changes; drag-rotate works smoothly. On the close (minute 5:30), the spoken script can include "you can even just play with it" — Krit literally rotates the map for two seconds, 3D buildings catch the light differently, board members notice.
8. **(Bonus, if time)** A "new voice just in" notification ticks in occasionally from a seeded queue. Required if shipped: **must be covered by `scripts/smoke.spec.ts` + must be suppressible via `?no-live-tick=1`** for a safe demo fallback.

All seven WOW moments respect `prefers-reduced-motion`:
- The hero timeline collapses to a static first frame
- 3D sculpture freezes (still renders, no rotation)
- Heat map appears at full opacity instantly; buildings render at full height instantly
- Region markers appear all at once
- Bento tiles render at final opacity instantly
- View Transition is skipped; instant route transition
- Map pitch defaults to 0° (flat) instead of 45°

---

## Polish checklist

- Custom favicon (Echoes mark)
- Tab title: stable `"Echoes — Voices of care-experienced Wales"` (no rotation — cosmetic and brittle)
- Loading skeleton per spec on every chart (one shared visual motif)
- Empty states designed (never just "no data")
- Keyboard nav works (visible focus rings; tab order sensible)
- Tooltips on every chart segment with sample sizes (`n = 47`)
- No console errors when devtools is open
- Page-to-page transitions feel deliberate (Next.js `loading.tsx` + Suspense + View Transitions for the drill-in)
- Fullscreen / presentation mode works (`document.documentElement.requestFullscreen()`)
- All fonts self-hosted; `public/wales.pmtiles` present locally; R3F three.js assets bundled (no CDN)
- Build optimised for projector at **1080p target** AND tested at **1366×768 fallback** AND the topic-click cascade specifically retested at 1366×768
- **60fps target hit on every wow moment** on the demo laptop — counter, hero sculpture rotation, heat-map fade, 3D buildings rise, Bento entrance, View Transition, map pitch/rotate. Test with DevTools Performance recording the dashboard load (should show a clean 60fps frame chart) and a topic drill-in (should show <16ms frame times throughout).
- `prefers-reduced-motion` honoured throughout (every WOW moment has a documented reduced-motion fallback in the Visual & interaction design section)
- DEMO DATA pill + per-card `<CardSourceLabel>` visible on every route
- View Transitions feature-detected; Framer Motion fallback path tested in at least one unsupported browser (Firefox <144 if reachable, otherwise simulate via feature flag)
- Map attribution (Protomaps + OpenStreetMap) visible bottom-right
- **`?perf=safe` query-param escape hatch.** A single URL switch that: (a) skips the `<HeroSculpture>` R3F render (renders a static SVG/PNG fallback instead); (b) forces map pitch to 0° and disables 3D extrusion; (c) replaces `<SentimentHeatmap>` with `<RegionMarkers>` only. One URL, no code changes on stage, zero visible disruption if invoked when the laptop turns out to be slower than expected. Smoke-tested in phase 13.

---

## Build phases

Make a git commit at the end of every phase. The phase-by-phase implementation plan is written by the `writing-plans` skill at the start of the build.

1. **Storyboard the 6 minutes** — browser mockups of each demo screen, refined with feedback. Lock the arc.
2. **Visual direction lock** — 2–3 high-fidelity browser mockups (hybrid / sleek-dark / VFCC-warm), Krit picks. Mood-board references applied.
3. **Scaffolding** — Next.js + bun + Tailwind 4 (CSS-config) + shadcn init (config path blank) + `next/font/google` for **Instrument Sans + Shrikhand + JetBrains Mono** + Biome + base layout. **Copy `~/Desktop/03 Design & Assets/VFCC Design System/colors_and_type.css` to `src/styles/vfcc-tokens.css`**, import from `src/app/globals.css`, map shadcn CSS vars to VFCC semantic tokens, set `<html data-theme="dark">` default. **Copy `~/Desktop/03 Design & Assets/VFCC Design System/assets/vfcc-logo-full.png` to `public/vfcc-logo.png`**. Build the brand lockup (Shrikhand "Echoes · Atseiniau" with logo mark, top-left, 96px min, 'V'-width clear zone). Build the DEMO DATA pill with the 2px ink border + 4px offset shadow signature motif.
4. **Seed data authoring + safety + integrity** — topics, regions, ~2,800 voices (Option A or B), 9 priority statements. **Editorial/content-safety pass + k-anonymity check (incl. named demo-path fixtures) + YPAB review pass + `check:seed` exit-code logged to `.review/seed-check.log` — all gating this phase's close.**
5. **Offline tile generation + basemaps-assets self-hosting** — two outputs from the same phase:
   - `bun run fetch-tiles` runs `pmtiles extract` against the dated Protomaps planet snapshot (pinned URL in the script, e.g. `https://build.protomaps.com/YYYYMMDD.pmtiles` — lock the most recent build before the demo) with the Wales bounding box (approx `-5.50, 51.30, -2.60, 53.50`). Writes `public/wales.pmtiles`. Logs expected size (~20–50MB) + tile-count assertion.
   - **`bun run fetch-assets`** downloads the `protomaps-themes-base` glyph PBFs (`https://protomaps.github.io/basemaps-assets/fonts/{Noto Sans Regular, Noto Sans Italic, Noto Sans Medium, Noto Sans Bold}/{ranges}.pbf`) and the sprite sheet (`https://protomaps.github.io/basemaps-assets/sprites/v4/...`) into `public/basemaps-assets/`. Then **patches the style JSON** so `glyphs` → `"/basemaps-assets/fonts/{fontstack}/{range}.pbf"` and `sprite` → `"/basemaps-assets/sprites/v4/light"` (or the dark variant). Without this, MapLibre quietly fetches glyphs from the CDN at runtime and the offline guarantee is silently broken.
   - Verified by wifi-off render — every label visible, every icon visible, devtools Network tab clean.
6. **Core components** — header (with DEMO DATA pill + composite indicator), counter, donut, topic bar list, voices feed (with `<CardSourceLabel>`), provenance panel, FilterChip + ClearAll.
7a. **Map base stack + building coverage gate** — MapLibre GL JS via `<WalesMapWrapper>` (`next/dynamic ssr:false`). `pmtiles` protocol handler against `public/wales.pmtiles`. Patched `protomaps-themes-base` dark style (glyphs + sprites → local `/basemaps-assets/`). **Building-coverage spot-check:**
   ```bash
   npx pmtiles serve public/wales.pmtiles                     # local tile server, port 8080
   # Then open https://protomaps.github.io/PMTiles/ in browser, paste http://localhost:8080/wales.pmtiles,
   # zoom to 14+ over Cardiff (CF10), Swansea (SA1), Newport (NP19), Wrexham (LL11).
   # Inspect the `building` (singular) layer for `height` attribute population.
   ```
   Write the decision to `.review/building-coverage.md`: Path A (real OSM heights — go ahead with `fill-extrusion-height: ['get', 'height']`) vs Path B (sparse — fall back to centroid extrusion: circle polygons of radius 4km around each `Region.lat/lon`, height `baseHeight: 200 + voiceCount * 0.1`, sentiment-weighted opacity, z-order below heatmap). Phase doesn't close until that decision is committed.
7b. **Map overlays + interaction** — `@deck.gl/mapbox` `MapboxOverlay` on top of the MapLibre map: `<SentimentHeatmap>` (HeatmapLayer with VFCC colorRange + jittered coords), `<RegionMarkers>` (IconLayer, staggered 200ms reveal), `<MapControls>` (pitch/rotate reset, fly-to-region — VFCC pill+offset-shadow style). Pitch default 45° on dashboard / 0° on topic pages. Region click → filter (no navigation).
8. **Filter state** — Zustand store (no `persist` middleware), quick filters cascade across every panel, k-anon redaction state wired into every panel. Heatmap re-derives + re-renders on filter change.
9. **Topic page + Action page + View Transitions** — composes above + priority statement cards. **View Transitions API wired here in full** (chip + donut band + header background carry `view-transition-name`; feature-detected; Framer Motion `layoutId` fallback). This phase owns the route-level drill-in animation end-to-end.
10. **Bento + wow moments + intro timeline** — `<BentoDashboard>` grid + 80ms staggered tile entrance. `<HeroIntroTimeline>` (GSAP, named easings). `<HeroSculpture>` (R3F v9, exact material/lighting/mapping). `<SentimentHeatmap>` fade-in + 3D-buildings rise on first map load. Region markers cascade. Counter + reduced-motion + error fallbacks all verified. **Does NOT touch View Transitions** (owned by phase 9).
11. **About page** — methodology, sources, consent, ICO 2025 + Children's Code + Welsh Charter references, demo-vs-production gap.
12. **Polish pass** — skeletons (spec'd per chart), empty states, transitions, favicon, keyboard nav, focus rings, tooltips, reduced-motion paths.
13. **Demo script doc + smoke test** — `DEMO-SCRIPT.md` with exact 6-min spoken script; `scripts/smoke.spec.ts` Playwright happy-path: landing → dashboard → topic click → quick-filter toggle → action page. **Smoke also asserts:** the `<WalesMap>` renders a visible map container (the most fragile integration); the `<DemoDataBadge>` text is present on every route; the `<VoiceCounter>` reaches a non-zero value. **After `DEMO-SCRIPT.md` is finalised, re-run `bun run check:seed`** to verify every on-stage named slice in the script holds ≥ 5.
14. **Pre-flight + recorded backup** — full offline test (Network tab empty) at 1080p and 1366×768; Cmd+R safety exercise-tested from every route; recorded video backup of clean run-through.
15. **Dress rehearsal** — Krit runs full 6 minutes end-to-end twice; tighten anything that doesn't land; **re-record video backup after final fixes.**

---

## Verification

### Per-build smoke checks
- `bun run dev` boots cleanly at `http://localhost:3000` (or `npm run dev` if Bun HMR misbehaves)
- `public/wales.pmtiles` AND `public/basemaps-assets/` both present; `bun run fetch-tiles` + `bun run fetch-assets` complete and idempotent
- With wifi disabled, the dashboard map renders **with labels and sprites** (catches the CDN-glyph regression)
- `bun run build` completes (or `npm run build` if Bun segfaults — pinned fallback)
- `bun run typecheck` passes
- `bun run lint` clean
- `bun run check:seed` passes (gated — non-zero exit blocks phase 4 close)
- `bun run smoke` passes (Playwright happy-path)
- No console errors with devtools open on any route

### Seed-data integrity (automated, in `bun run check:seed`)
- For every `PriorityStatement`: `drawingOnCount === voiceIds.length`
- Every `voiceIds[]` element resolves to a real `Voice.id`; `voiceIds` is unique
- Every `excerptVoiceIds[]` element is in the same statement's `voiceIds[]` AND resolves to a `Voice` with `consentLevel === 'public'` AND non-empty `excerpt`
- For every `Voice`: `1 ≤ topics.length ≤ 3` AND topics are unique
- For every `Voice`: `excerpt` non-empty iff `consentLevel === 'public'`
- For every `Voice` with `source === 'ypab'`: `sessionId` present; otherwise absent
- For every `PriorityStatement`: if `groupType` is `'ypab'` or `'regional'`, `groupRegion` is present; if `'national'`, `groupRegion` is absent
- `Provenance` aggregation: `sum(provenance) === voices.length`
- All `Voice.capturedAt` ∈ `[2025-12-01, 2026-05-14]`
- k-anonymity: every (topic, region, ageBand, careSetting, source, month) cell has ≥ 5 voices OR is excluded from the displayable slice set (and the UI renders the redaction state for it)
- Named demo-path fixtures hold ≥ 5: (16-18 × residential × education), (housing × north-wales), and any others listed in `DEMO-SCRIPT.md`
- Editorial red-flag regex returns zero matches on every public excerpt

### Functional verification (manual, in browser)
- Landing → dashboard transition smooth, counter ticks 0 → seeded total
- Click each of the 7 topics → drill-in works, panels populate, layout cascade completes <600ms
- Click each region on the map → filter applies, no navigation
- Toggle each quick-filter combination → all panels recompute; cells <5 show redaction, never break
- FilterChip × removes individual filters; ClearAll resets the store
- Priority statement cards render on each topic page with linked discussion + per-card `<CardSourceLabel>`
- Voices feed cards render with all metadata tags + `<CardSourceLabel>`
- Provenance panel sums to total voice count
- About page references render (ICO links etc.)
- Map renders with wifi disabled

### Demo-day pre-flight (must pass within 24h of demo)
- `bun run check:seed` clean; `bun run smoke` green
- **Production build served — run with wifi ON.** `bun run build && bun run start` (fall back to `npm run build && npm run start` if Bun segfaults). `next/font/google` and the seed/tile scripts need internet at build time to fetch fonts and assets. Build first, THEN turn wifi off. The demo MUST run against the compiled `.next/` output, NOT against `next dev`. On-demand compilation under `next dev` produces multi-second white screens on first route-click and risks the Next.js error overlay covering the screen.
- Disconnect wifi → full demo runs against the production server; devtools Network tab → zero external requests on every route
- Tested at 1080p (target) AND 1366×768 (fallback) — typography readable; topic-click cascade specifically re-tested at 1366×768
- **Performance recording** — open devtools Performance tab, record the landing → dashboard load, then a topic drill-in. Frame chart must show ≥58fps sustained (≤17ms/frame). If GPU is struggling, drop pitch to 0° on the dashboard default to reduce 3D rendering cost.
- **Tile coverage** — confirm 3D buildings render visibly in Cardiff / Swansea / Newport / Wrexham at zoom 14+. If sparse, fall back to centroid extrusion path was wired in phase 7.
- `public/wales.pmtiles` present; size matches expected (logged in `fetch-tiles.ts`); map renders offline
- Cmd+R exercise-tested from `/`, `/dashboard`, `/topic/housing`, `/action`, `/about` — counter re-ticks where applicable; filter state resets cleanly; no `persist` middleware in Zustand store
- Full 6-min script run twice end-to-end without stumbling
- Recorded video backup current (re-recorded after final fixes)
- Backup video opened and confirmed playable before closing the laptop the night before

### Laptop pre-flight (morning of)
- Battery ≥ 80%; power cable packed; **specific cable for projector input** (USB-C → HDMI / DisplayPort / VGA — confirmed against venue spec) packed
- **`bun run build && bun run start`** (or `npm` fallback) is the command used; verify `http://localhost:3000` is being served by `next start`, NOT `next dev`
- **Wifi OFF** (or full airplane mode) for the duration of the presentation — eliminates background traffic, OS update prompts, notification surfaces; also re-verifies the offline guarantee
- Sleep / display-off disabled for the duration
- Do Not Disturb on; notifications silenced
- Screen brightness max; HiDPI scaling sensible for projector
- **Fresh browser profile or private window** (no autofill / extensions interfering)
- Browser zoom reset to 100%
- Devtools closed; F12 / Cmd+Opt+I risk noted (don't shortcut accidentally)
- Browser version pinned + known-working (Chrome/Firefox latest stable as of the morning)
- `http://localhost:3000` open in a fresh fullscreen window
- Backup video file on the desktop, double-clickable, confirmed playable
- Cmd+R / F5 confirmed safe from every route (exercised in pre-flight)

---

## Post-demo workstreams (out of demo build scope)

1. **3-slide pitch deck** — WHY (problem) · WHAT (live demo) · HOW (AWS architecture diagram). Companion to the live demo.
2. **AWS production architecture diagram** — the "what the grant funds" picture:
   - Intake: API Gateway + Lambda for VFCC staff entries; eventual Kinesis for partner orgs at scale
   - **NLP: Amazon Bedrock (Claude / Titan) primary for both English and Welsh sentiment + topic via prompt-engineered classification. Amazon Comprehend as cheaper English-only fallback for high-volume. SageMaker reserved for a later custom Welsh classifier if Bedrock evaluation shows accuracy gaps.**
   - Storage: DynamoDB for voices + RDS/Aurora for structured aggregates; S3 for raw inputs
   - Serving: API Gateway + Lambda → Next.js frontend on Amplify / CloudFront
   - Observability: CloudWatch + QuickSight for internal analytics
3. **Welsh-language NLP** — full bilingual UI + Welsh sentiment / topic classification via Bedrock; grant-funded.
4. **Real intake pipeline** — replacing seed data with real (consented, anonymised) VFCC interactions. Includes consent capture, anonymisation layer, formal safeguarding review process.
5. **Public hosting** — Cloudflare Pages / Amplify deploy with custom domain (e.g. `echoes.vfcc.cymru`).
6. **Partner organisation onboarding** — schema + intake for other charities / Welsh Government / local authorities.
7. **Accessibility audit** — WCAG 2.2 AA minimum before any public deploy.
8. **Safeguarding review (formal)** — extends the demo-phase editorial safeguards into a full review of consent, anonymisation, harmful-content, complaint/withdrawal processes.
9. **Ethics + governance framework** — published policy on how voices are captured, processed, surfaced, corrected, withdrawn.
10. **Region deep-dive (`/region/[slug]`)** — descoped from demo; lands in v1.

---

## Critical files / locations

- **This plan:** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/PLAN.md`
- **Project conventions:** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/CLAUDE.md`
- **Demo script (build phase 13):** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/DEMO-SCRIPT.md`
- **Seed data (build phase 4):** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/src/seed/`
- **Seed integrity check (build phase 4):** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/scripts/check-seed.ts`
- **Red-flag list (build phase 4):** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/src/seed/red-flags.ts`
- **Tile fetch script (build phase 5):** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/scripts/fetch-tiles.ts`
- **Playwright smoke (build phase 13):** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/scripts/smoke.spec.ts`
- **Consent coverage artefact:** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/.review/consent-coverage.md`
- **Council review notes:** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/.review/`

---

## Repo hygiene

- `.gitignore`: `node_modules/`, `.next/`, `public/wales.pmtiles` (large; regenerated by fetch-tiles), `.private/` (real anchor quotes — never public), any `*.env*` files.
- If Option A is used, the **real anchor file** lives in `.private/anchors.ts` and is **never committed**. The published seed in `src/seed/voices.ts` is the demo-safe derived version (composite voices passed editorial + YPAB review).
- **`.private/` retention rule:** delete the real anchor file from the demo laptop within **30 days post-demo** (logged in `.review/consent-coverage.md`). The composite seed in `src/seed/voices.ts` is the durable artefact; the real quotes were a transient input to authoring and should not linger.

---

## Outstanding decisions for build kickoff

1. **Visual direction** — settled in phase 2 (browser mockups, mood-board referenced).
2. **Voice sourcing strategy** — Option A vs B, determined by whether safeguarding sign-off + anchor pull complete in time.
3. **Named YPAB reviewer** — who, paid by what mechanism, supported by whom.

---

## Skills to use during the build

- **`brainstorming`** — the 6-minute storyboard (phase 1).
- **`frontend-design`** — visual direction lock (phase 2), component design (phases 6–9), polish pass (phase 12).
- **`/architect`** — post-demo AWS architecture diagram + 3-slide deck.
- **`tester`** — `check:seed` script (phase 4), Playwright smoke (phase 13), pre-flight (phase 14).
- **`writing-plans`** — converts this plan to a step-by-step implementation plan at build kickoff.
- **`/security`** — light audit pass before any public deploy (post-demo).
- **`refactor`** — only if a component grows too dense during polish.
- **`claude-api`** — not for the demo; for wiring real sentiment classification in production (Bedrock).
