# CLAUDE.md — Project Echoes

This file provides guidance to Claude Code when working in this repository.

## What this project is

**Project Echoes** (English) / **Atseiniau** (Welsh) — a demo / proof-of-concept of a live sentiment dashboard surfacing voices from Wales' care-experienced community.

The demo is a fundraising artefact, not a production product. It exists to:

1. Pitch the VFCC CEO and Board (internal buy-in)
2. Win the **AWS Imagine Grant 2026** (which funds the production AWS-backed version)

Runs locally on Krit's laptop, fully seeded data, ~6-minute presentation flow.

## Status

**Planning stage (2026-05-14, revision 2 post-council).** PLAN.md is the source of truth. No code scaffolded yet — first step is the 6-minute storyboard + visual direction lock via the browser visual companion.

Update this section as the build progresses (scaffolded / wow moments wired / polish pass / dress rehearsal).

## Source of truth

- **`PLAN.md`** — the full plan. Read this first before anything substantive.
- **`DEMO-SCRIPT.md`** (build phase 13) — the exact 6-minute spoken script Krit reads on stage.
- **`.review/`** — review notes, consolidated findings, consent coverage artefact.

## Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Runtime / package manager:** Bun.
  - HMR fallback: `npm run dev` (Bun + Next 15 Turbopack HMR can be flaky)
  - **Build fallback:** `npm run build` (Bun + Next 15 build can segfault — pinned fallback, named in pre-flight)
- **Styling:** Tailwind CSS 4 (CSS-first config — no `tailwind.config.js`)
- **Components:** shadcn/ui. **When `npx shadcn@latest init` asks for the Tailwind config path, leave it blank** — Tailwind 4 is CSS-first; not leaving blank produces "no config found" and the LLM may auto-downgrade to Tailwind 3.
- **Charts:** Recharts. Skeleton motifs are consistent across charts (spec in PLAN.md).
- **Map stack:** **MapLibre GL JS** (WebGL vector renderer, 3D-capable) + **`pmtiles`** protocol handler against a single offline `public/wales.pmtiles` (Protomaps planetiles snapshot, Wales bounding box) + **`protomaps-themes-base`** dark flavor. **3D building extrusion** via `fill-extrusion` paint type on the `building` (singular) layer with `["get", "height"]`. **`@deck.gl/mapbox`** `MapboxOverlay` for the sentiment `HeatmapLayer` and region `IconLayer`. Pitch/bearing/rotate enabled. **NOT** `react-leaflet` (2D-only), **NOT** OpenFreeMap as a raster source (vector tiles), **NOT** CartoDB (TOS).
- **Animation stack:**
  - **Framer Motion (`motion`)** for component entrance, hover, counter, and the `<motion.div layout>`-inside-`<LayoutGroup>` topic-click cascade.
  - `layoutId` is reserved for the topic chip morphing between `<TopicBarList>` and the topic-page header — used as the fallback path when View Transitions API is unsupported.
  - **View Transitions API** (same-document / SPA) for the dashboard → topic-page drill-in "magic move". Feature-detected via `'startViewTransition' in document`; fall back to the Framer Motion `layoutId` chip-morph if unsupported.
  - **GSAP** for the landing-page `<HeroIntroTimeline>` multi-step choreography (brand reveal → counter tick → hero copy → CTA pulse).
  - Counter: `useMotionValue` + `animate()` + `Math.round` transform — never `setInterval`.
- **3D hero (one place only):** `@react-three/fiber@^9` + `@react-three/drei` for the landing-hero `<HeroSculpture>` — a slowly-rotating generative shape. SSR-disabled. Pin R3F to v9 (v8 not React-19 compatible). Do not use R3F anywhere else.
- **Fonts (VFCC Design System):** Instrument Sans (UI) + Shrikhand (display) + JetBrains Mono (numerics) via `next/font/google` — downloads at build time, served from `.next/static/media/`, no runtime CDN call. **Never** `@import url('googleapis.com/...')`.
- **Icons:** Lucide React.
- **State:** Zustand. Single filter store. **No `persist` middleware** (would break Cmd+R reset). Exposes `clearAll()`.
- **Lint/format:** Biome.

## Dev commands (canonical — mirrored in `package.json`)

```bash
bun run dev         # start dev server at http://localhost:3000 (fall back to npm run dev if HMR flakes)
bun run build       # production build (fall back to npm run build if Bun segfaults — pinned fallback)
bun run typecheck   # tsc --noEmit
bun run lint        # biome check .
bun run lint:fix    # biome check --write .
bun run check:seed  # seed-data integrity + k-anonymity (gated at end of phase 4 + pre-flight)
bun run fetch-tiles # extract Wales pmtiles from Protomaps planet → public/wales.pmtiles
bun run smoke       # Playwright happy-path: landing → dashboard → topic → filter → action
```

All assets must work fully offline by demo day. Verify via devtools Network tab → zero external requests on every route.

## Layout (target structure)

```
src/
  app/                          # Next.js App Router (no src/pages/)
    page.tsx                    # landing
    dashboard/page.tsx          # main dashboard
    topic/[slug]/page.tsx       # topic deep-dive (composes <TopicPageBody>)
    action/page.tsx             # YPAB action view (9 priority statements grouped by date)
    about/page.tsx              # methodology / sources / consent / ICO refs / contact
    layout.tsx                  # global chrome (header with DEMO DATA pill + composite indicator)
  components/                   # presentational
    echoes-header.tsx
    demo-data-badge.tsx
    card-source-label.tsx       # the per-card "illustrative composite" micro-label
    hero-intro-timeline.tsx     # GSAP timeline for landing
    hero-sculpture.tsx          # R3F v9 generative 3D shape (SSR-disabled)
    hero-sculpture-wrapper.tsx  # next/dynamic ssr:false around hero-sculpture
    bento-dashboard.tsx         # Bento-grid composition of dashboard tiles
    quick-filters.tsx
    filter-chip.tsx
    clear-all-filters.tsx
    voice-counter.tsx           # useMotionValue + animate(), not setInterval
    sentiment-donut.tsx
    topic-bar-list.tsx
    micro-chart.tsx             # inline hover-revealed sparkline
    wales-map.tsx               # MapLibre GL + pmtiles + 3D buildings; client-only
    wales-map-wrapper.tsx       # next/dynamic ssr:false around wales-map (+ overlay + controls)
    sentiment-heatmap.tsx       # deck.gl HeatmapLayer overlay via MapboxOverlay
    region-markers.tsx          # deck.gl IconLayer for region centroids
    map-controls.tsx            # pitch / rotate reset, fly-to-region
    time-trend-line.tsx
    voices-feed.tsx             # renders <CardSourceLabel> on every quote card
    data-provenance-panel.tsx
    priority-statement-card.tsx # renders <CardSourceLabel>
    topic-page-body.tsx
    action-page-body.tsx
    about-page-body.tsx
  seed/                         # typed seed data
    topics.ts
    regions.ts
    voices.ts                   # ~2,800 records; 300 public + 2,500 aggregate-only
    priority-statements.ts      # exactly 9 records
    red-flags.ts                # editorial / content-safety banned patterns
  store/
    filters.ts                  # Zustand (no persist) + clearAll() action
  lib/                          # date helpers, aggregations, k-anonymity check
scripts/
  check-seed.ts                 # bun run check:seed
  fetch-tiles.ts                # bun run fetch-tiles → public/wales.pmtiles
  smoke.spec.ts                 # Playwright happy-path
public/
  wales.pmtiles                 # gitignored, generated, ~20–50MB
  favicon.ico
.review/                        # review notes + consent-coverage.md + seed-check.log
.private/                       # gitignored: real anonymised anchor quotes (Option A only)
PLAN.md
DEMO-SCRIPT.md
CLAUDE.md
```

**No `src/pages/`** — App Router only. **`<TopicPageBody>` lives in `components/`, the route at `app/topic/[slug]/page.tsx` composes it.**

## Critical rules (non-negotiable)

1. **Voice authenticity.** Default: real-quote anchor (~30–50) + LLM extension (~250) + editorial/content-safety pass + YPAB review of ~60 stratified samples (20%, over-sampled on mental-health/transitions). Fallback (Option B) if safeguarding sign-off is late. The YPAB reviewer is paid, can opt out, is NOT a contributor of any anchor quote (conflict avoidance), and reviews for both **authenticity** AND **safety**.

2. **DEMO DATA framing at two levels.** Header pill ("Sample data — illustrative composite voices") AND per-card `<CardSourceLabel>` on every `<VoicesFeed>` card and every `<PriorityStatementCard>`. A phone-cropped single card must still carry the disclaimer.

3. **k-anonymity floor of 5 on every displayable slice.** Filter dimensions exposed by `<QuickFilters>` are **topic × region × ageBand × careSetting** (4 dimensions, 588-cell cross-product). Aggregation dimensions used by panels (**source** in the provenance panel, **month** in the time-trend) operate on the currently-filtered voice set and inherit the floor. `check:seed` enumerates: every cell in the filter cross-product ≥5; every single-dimension rollup across all 6 dimensions ≥5; every named demo-path fixture (16-18 × residential × education; housing × north-wales; plus any in `DEMO-SCRIPT.md`) ≥5; every per-topic time-trend month bucket and source segment ≥5. The UI renders the "Too few voices to display individually" redaction state when a live slice falls below 5.

4. **Editorial / content-safety guideline applies to every public quote.** Excluded: self-harm / suicidal-ideation refs (Samaritans safe-messaging), abuse/violence disclosures, named individuals or institutions, identifiable trauma narratives, stigmatising mental-health framings, anything that out-of-context could embarrass or harm the young person whose composite voice it represents. Enforced by author-time exclusion list, `check:seed` red-flag regex, and YPAB safety review.

5. **Demo runs offline at RUNTIME, but builds online.** `next/font/google` and the `fetch-tiles` / `fetch-assets` scripts download fonts, tiles, and sprites at build time and embed them locally. Once built, no runtime CDN call. **Build with wifi ON; demo with wifi OFF.** Never attempt `bun run build` at the venue — fonts will silently fail to download. Verified by Network tab pre-flight (zero external runtime requests on every route, including with the map fully interactive).

6. **English-only UI for the demo.** Bilingual brand lockup (Echoes · Atseiniau) in the header. Welsh-language NLP / full bilingual UI is post-demo (Bedrock-powered, see PLAN.md).

7. **No AWS code in the demo build.** Post-demo workstream. Production NLP plan: **Bedrock (Claude / Titan) primary for English AND Welsh**; Comprehend as English-only fallback for high volume; SageMaker reserved for custom Welsh classifier if needed. (Comprehend does NOT support Welsh.)

8. **Anonymisation defaults.** Voices tagged only with region + age band + care setting + topic + date + source. `sessionId` (where present on YPAB-source voices) **must never appear in UI, URL, or DOM** — server-side / build-time only.

9. **`prefers-reduced-motion` respected throughout.** Every animation has an instant-swap fallback. If layout animations throw, panels swap instantly. Never let an animation failure freeze the demo.

10. **All WebGL/canvas components SSR-disabled.** MapLibre, deck.gl overlays, and react-three-fiber all touch `window`/`HTMLCanvasElement` at import time. `<WalesMap>`, `<SentimentHeatmap>`, `<HeroSculpture>` are client-only; `<WalesMapWrapper>` is the `next/dynamic ssr:false` boundary for the map stack. R3F components use the same pattern. Never import these from a server component.

11. **Topic-click cascade pattern.** Wrap each dashboard panel in `<motion.div layout>` inside a single `<LayoutGroup>`. Use `layoutId` only for the topic chip that genuinely morphs between `<TopicBarList>` and the topic-page header. The topic-page drill-in itself uses View Transitions API (`document.startViewTransition`) feature-detected — falls back to the Framer Motion `layoutId` chip-morph when unsupported. Do not put matching `layoutId`s across structurally unrelated panels — that's not what `layoutId` does.

12. **Commit at the end of every build phase.** Recovery from a bad vibecoded change should never be more than one git revert away.

13. **`.private/` is gitignored.** Real anonymised anchor quotes (Option A) live there. Never committed to a public repo without explicit VFCC safeguarding sign-off captured in `.review/consent-coverage.md`.

14. **`public/wales.pmtiles` must be present on the demo laptop before travel.** The fetch-tiles script needs internet — may not be available at the venue.

15. **Filter store has no `persist` middleware.** Cmd+R must reset filter state cleanly from any route.

16. **Demo runs against the production build, not `next dev`.** On-demand compilation under `next dev` produces multi-second white screens on first route click and risks the Next.js dev error overlay covering the screen. Pre-flight uses `bun run build && bun run start` (or `npm` fallback). Wifi is explicitly OFF during the live demo.

17. **60fps target on every WOW moment.** The hero intro timeline, 3D sculpture rotation, heat-map fade-in, 3D-buildings rise, Bento tile entrance, View Transition drill-in, and map pitch/rotate must all hit ≥58fps (≤17ms/frame) on the demo laptop. Verify via devtools Performance recording in pre-flight. If a wow moment struggles, the fix is to reduce its scope (e.g. default map pitch to 0°), not to ship a janky demo.

18. **Map building coverage is verified before phase 7 lands.** Spot-check `wales.pmtiles` with `npx pmtiles serve public/wales.pmtiles` + the Protomaps PMTiles inspector at https://protomaps.github.io/PMTiles/ over Cardiff (CF10), Swansea (SA1), Newport (NP19), Wrexham (LL11) at zoom 14+ — confirm the `building` (singular) layer has `height` attribute population. Decision written to `.review/building-coverage.md` (Path A — real heights, OR Path B — centroid-extrusion fallback). Phase 7a doesn't close until that decision is committed.

19. **MapLibre glyph PBFs + sprite sheets are self-hosted at `public/basemaps-assets/`, never CDN.** `protomaps-themes-base` style JSON references `https://protomaps.github.io/basemaps-assets/...` by default; `bun run fetch-assets` downloads them locally and patches the style JSON to point at `/basemaps-assets/...`. Without this, MapLibre fetches font glyphs from the CDN at runtime and the entire offline guarantee is silently broken at demo time (labels disappear).

20. **VFCC Design System is the authoritative brand spec.** Source: `~/Desktop/03 Design & Assets/VFCC Design System/`. Project copy of tokens: `src/styles/vfcc-tokens.css` (imported from `globals.css`). **Always use semantic tokens** (`--brand`, `--fg-1`, `--surface`, `--border-ink`, `--shadow-offset`) — never raw palette hex. Fonts via `next/font/google`: Instrument Sans, Shrikhand, JetBrains Mono. Logo top-left, 96 px min, 'V'-width clear zone.

21. **Brand motif on every elevated surface: 2 px ink border + 4 px offset shadow.** Cards, buttons, the DEMO DATA pill, voice cards, priority cards, illustration plates, `<MapControls>` buttons. Hover: shadow → 6 px, `translate(-1px, -1px)`. Press: shadow → 0 0, `translate(+4px, +4px)` (button "lands"). Pill radius on CTAs, lg (20 px) on cards. Don't mix on one screen. **Use the semantic token `var(--shadow-offset)` — it automatically swaps from ink (light theme) to cream (dark theme) per the VFCC tokens. Never hard-code the shadow colour.**

22. **VFCC tone is non-negotiable.** Always "care-experienced children and young people" — never "looked-after", "LAC", "service users", "care leavers". The organisation is "VFCC" (or "Voices From Care Cymru" on first mention). "We" speaks as VFCC, "you" addresses young people. En-dash `–` not em-dash. "Per cent" in prose, not `%`. Dates `1 July 2026`. Times `9.00am`. CTAs are short verbs ("Get involved"), never "Click here" / "Learn more" / "Submit".

23. **Brand anti-patterns rejected on review:** no gradients in backgrounds; no glassmorphism / frosted cards; no pure black (`#000`) or pure white (`#fff`); no skeuomorphism / neumorphism / glossy SaaS 3D; no AI-generated faces or hand-drawn-style illustrations of young people; no emoji in formal copy / chrome / charts; no "rounded card with a coloured bar on the left" pattern.

## Skills to use

- **`brainstorming`** — 6-minute storyboard (phase 1).
- **`frontend-design`** — visual direction lock (phase 2), components (phases 6–9), polish pass (phase 12).
- **`/architect`** — post-demo AWS architecture + 3-slide pitch deck.
- **`tester`** — `check:seed` script + Playwright smoke + pre-flight.
- **`writing-plans`** — converts PLAN.md to a step-by-step implementation plan at build kickoff.
- **`/security`** — light audit pass before any public deploy (post-demo).
- **`refactor`** — only if a component grows too dense during polish.
- **`claude-api`** — not for the demo; for production sentiment classification (Bedrock).

## Audience and pitch context

The screen will be projected in a boardroom in front of:

- **The VFCC CEO and Board** — care-experienced young people are not abstract to them. Some may have lived experience themselves. Tone matters. Don't reduce voices to data points. Respect over slickness when they trade off.
- **AWS Imagine Grant 2026 judges** — they need to see a credible product that the grant can scale. Polish and technical defensibility matter.

Trade-offs that favour respect over slickness — preferring "voices", "young people", "what they're asking for" over "engagement", "users", "retention" — win.

## Who is the user

Krit (Kritsana Misuk) — VFCC tech developer. Prefers plain language over jargon, end-product polish over fast scaffolding, and direct recommendations over open-ended question chains.
