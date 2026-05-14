# Krit's Independent Adversarial Review (pre-Codex)

Written before seeing Codex's findings so I have an unbiased baseline to compare against. Same categories Codex was briefed on.

---

## BLOCKERS

### B1. CartoDB tiles are NOT offline-capable as written
PLAN.md and CLAUDE.md both promise "fonts and map tiles cached locally — runs offline" but the actual mechanism is missing. CartoDB tiles are normally fetched from `basemaps.cartocdn.com` at runtime — Leaflet's `TileLayer` makes per-tile HTTP calls. To run offline you need to:
1. Pre-download the Wales-area tile set at the zoom levels you'll use
2. Store them in `public/tiles/{z}/{x}/{y}.png`
3. Point `TileLayer` URL to the local path
4. **Verify CartoDB's TOS permits bulk pre-download** (likely needs attribution at minimum; may need permission for redistribution).
**Fix:** add a "tile pre-download script" to the build phases and verify TOS.

### B2. Voice count mismatch — opener says 2,847, seed plan says ~300
PLAN.md line 43 opener: "Right now, 2,847 young people in care across Wales have a voice on this dashboard." But the seed plan says ~300 voices. The opener number must match what the dashboard actually shows, or the demo loses credibility within the first minute.
**Fix:** either seed ~2,847 voices, or pick an opener number that matches actual seed (and is still plausible for VFCC's scale).

### B3. Plan file path is stale inside the plan
PLAN.md line 302 still says: "Plan file (this doc): `/Users/krit/.claude/plans/i-would-like-to-happy-frog.md`". The file has been moved. Self-referential inconsistency.
**Fix:** update to actual path `/Users/krit/Desktop/04 Web & Development/Project-Echoes/PLAN.md`.

---

## HIGH

### H1. shadcn/ui + Tailwind 4 compatibility
shadcn/ui historically targeted Tailwind 3. Tailwind 4 (released early 2025) is a major rewrite with config-via-CSS instead of `tailwind.config.js`. shadcn has been migrating but may still hit friction. **Verify current shadcn install instructions for Tailwind 4 before committing.**

### H2. react-leaflet + Next.js App Router needs SSR-disabled dynamic import
Leaflet uses `window`/`document` at import time. In Next.js App Router this WILL break SSR unless the map component is imported via `next/dynamic` with `{ ssr: false }`. Not called out in CLAUDE.md — vibecoded LLM will hit this on first build.

### H3. Bun + Next.js compatibility risk
Bun's Next.js support is improving but not 100% — some webpack/turbopack features stutter. `bun run dev` for Next has worked but might fall back to internal Node. Worth verifying with a quick scaffold before committing the stack.

### H4. Framer Motion "topic-click cascade" — pattern not specified
Wow moment 3 says "every panel reshapes smoothly with Framer Motion layout animations". This needs a shared `LayoutGroup` wrapping the relevant components, plus matching `layoutId`s. A vibecoded LLM without this guidance will produce uncoordinated animations. **Plan should name the pattern explicitly:** `<LayoutGroup>` + `layoutId` per panel.

### H5. Wales map "regions filling in" animation
Leaflet `Marker`s and `CircleMarker`s aren't naturally Framer-Motion-animatable. The plan implies staggered reveal but doesn't say how. Options: setTimeout reveal in Leaflet (simpler), or custom DivIcon markers wrapped in motion divs (more flexible). **Pick one, document it.**

### H6. Voice authenticity has a critical-path dependency that's not flagged
Option A says "Krit + colleague pull ~30-50 real anonymised quotes from VFCC's work, then I generate ~250 in the same register, YPAB review." This presumes:
1. VFCC's data governance permits reuse of session quotes for fundraising materials
2. Anonymisation has been reviewed
3. Safeguarding lead has signed off
4. A YPAB member is available + willing in the build window
If any of these are slow, the demo can't ship its key claim. **Surface as a critical-path risk with deadline.**

### H7. Consent / safeguarding for seeded "real" quotes
Not addressed at all. Pulling real quotes — even anonymised — for a fundraising demo needs:
- Consent verification (did the original consent cover fundraising materials?)
- Re-identification risk review (e.g. "Powys / 18+ / kinship" might be a small enough cell to identify someone)
- VFCC safeguarding sign-off
**Plan needs an explicit "seeded data ethics gate" before voices are written.**

### H8. On-screen "DEMO DATA" indicator missing
The demo is shown to board + AWS judges who may photograph the screen. Any quote that ends up on a slide deck or social media without a "demo data" frame becomes a misattribution risk. **Add a persistent "[DEMO DATA — COMPOSITE EXAMPLES]" pill in the chrome.**

### H9. Combinatorial re-identification not addressed
Voice schema combines region + age band + care setting + topic + date. In small cells (e.g. Powys / under-16 / residential / housing / May 2026), the combination may identify a single individual even though no name is shown. **Plan needs a "k-anonymity" check on the seed data: no combination of filters should resolve to < N voices.**

---

## MEDIUM

### M1. `/about` page unspecified
Listed in app structure (PLAN.md line 96) but content never described.
**Fix:** spec what's on it (methodology, data sources, consent statement, contact).

### M2. "Search" in top bar — vestigial
Mentioned once (PLAN.md line 100) then never. Either spec what's searchable or drop.

### M3. `/region/[slug]` is "optional" but referenced elsewhere
PLAN.md line 95 says optional drill-down. Line 265 verification says "Click each region on the map → filters apply across panels". Conflict: does map click filter, or navigate to region page? Pick one.

### M4. YPAB "linked discussion" undefined in schema
PLAN.md line 46 says "YPAB priority card + linked discussion". PriorityStatement schema has `statement`, `date`, `group`, `drawingOn`, `voiceIds` — no discussion field. What is "linked discussion" in the demo?

### M5. Voice → group session linkage missing
YPAB sessions are listed as a data source — but if a single session contributes 6-8 voices, they're not linked by sessionId in the schema. The loop-closing narrative needs "this YPAB session's voices fed into this priority statement" — needs explicit linkage in seed data.

### M6. Topic types not fully specified
PLAN.md line 131-132 abbreviates `Topic = { slug, name, description, color }` — types unspecified. Vibecoded LLM may guess. Be explicit (`color: string` — hex format).

### M7. "Action (YPAB)" page in side nav but not built
CLAUDE.md line 101 critical rules say cascading filters, but PLAN.md's app structure doesn't include a YPAB-dedicated page. Either drop the nav item or define the page (e.g. `/action/[slug]` listing priority statements).

### M8. No git commit cadence specified
A 13-phase build via vibecoding without commit checkpoints means bad LLM changes are hard to recover from. **Add: commit after each build phase completes.**

### M9. No `.gitignore` / sensitive data plan
If real anonymised quotes are used (Option A), they should not be in a public git repo without consent. **Either keep them out of git, or document that the repo is private until pitch day.**

### M10. Demo-day projector resolution untested
Plan says "1080p projector" but many boardroom projectors are 1024×768 or 1280×720. **Add minimum resolution test to verification.**

### M11. Topic-click cascade has no graceful degradation
If Framer Motion layout animation fails on demo day, the wow moment turns into a frozen UI. **Add fallback: instant non-animated state change if animation errors.**

### M12. Video backup re-recording cadence not specified
PLAN.md mentions a recorded backup, but doesn't say re-record after last-minute fixes. **State: re-record after dress rehearsal.**

### M13. Demo-day kill switch
What does Krit do if something hangs mid-demo? Refresh? Hard reload? Doesn't say. **Add: F5 / Cmd+R to recover, fallback to the video.**

### M14. No mention of laptop pre-flight (battery, sleep, DND, notifications)
Verification covers offline + 1080p but misses: battery charged, sleep disabled, notifications silenced, brightness adequate, audio (if any) tested.

---

## LOW

### L1. "Memory file to update post-plan-approval" (PLAN.md line 306)
Already done. Remove or mark done.

### L2. Outstanding decisions section duplicates build-phase content
PLAN.md lines 310-316 list decisions already covered in phases 2, 4 of the build order. Consolidate.

### L3. "Geist Sans (free from Vercel)" — Geist also has Geist Mono
Worth listing Geist Mono too — useful for numeric tickers / tabular data.

### L4. Lucide React not version-pinned
Plan lists Lucide React but no version. Vibecoded LLM may install a stale or future version.

### L5. No mention of dev-server port collisions
If something else is on port 3000, Next will auto-bump to 3001. Demo verification should check the actual port.

### L6. Tab title rotates ("Echoes · 2,847 voices today")
Cute but if the count is hardcoded and out of sync with seed, looks unprofessional.

### L7. `<TopicPage>` listed as a component but it's actually a page
Naming convention drift — `<TopicPage>` belongs in `app/topic/[slug]/page.tsx`, not `components/`. Update CLAUDE.md layout.

### L8. Mobile / phone view not designed
"Board demo, not mobile-first" is fine, but if anyone clicks a link Krit shares post-pitch, they'll hit a desktop-only layout. Either design graceful mobile or add a "desktop recommended" notice.

### L9. No mention of Geist license terms in CLAUDE.md
Should attribution be in the footer? Geist is SIL OFL — attribution not required but good practice.

### L10. The seeded date range — "last 6 months" is vague
If demo day is mid-June 2026, the seed should populate Dec 2025 – May 2026. Be explicit so the dates don't get hardcoded once and decay over weeks.

---

## VERDICT (pre-Codex)

Plan is **not ready to vibecode as-is**. Has structural risks (B1–B3 are blockers, H1–H9 are real issues) but no fundamental rework needed. Estimated 30–40 specific fixes before the plan is bulletproof.

Most consequential bucket: **offline guarantee + map tile mechanism (B1) and seed-data voice count consistency (B2)** — these would visibly fail at demo time.

Second bucket: **ethics / safeguarding gaps (H6–H9, M5)** — would not fail visibly but creates real risk to VFCC and to the young people whose words seed the demo.

Third bucket: **stack compatibility (H1–H3) and Framer Motion specifics (H4–H5)** — would slow the vibecoded build down by days if left undocumented.
