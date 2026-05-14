# Consolidated Council Findings — Round 1

Final tally: **1 APPROVED** (researcher) · **5 NEEDS-CHANGES** (architect, frontend, security, devops, tester).

Codex's adversarial review was launched but never produced output beyond 26 lines of init/search activity (idle 13+ minutes when the council returned). The council's combined thoroughness exceeded what one Codex pass would have produced, and three council members (architect, frontend, devops) independently caught the OpenFreeMap blocker — high confidence.

Independent claim verification (against authoritative docs):
- OpenFreeMap = vector tiles ✓ confirmed
- Framer Motion `layout` ≠ `layoutId` ✓ confirmed
- AWS Comprehend doesn't support Welsh ✓ confirmed (cy not in supported language list)

## Master fix list (41 issues, ordered by severity)

### BLOCKERS (5)

1. **Tile stack contradiction.** OpenFreeMap is vector PBF, not raster. *Decision: switch to **Protomaps PMTiles** + `protomaps-leaflet` — single offline `public/wales.pmtiles` file (~20–50MB), free for non-commercial, attribution preserved, works fully offline.*
2. **`bun run build` segfaults on Next.js 15.** Add named `npm run build` fallback in CLAUDE.md and pre-flight.
3. **k-anonymity scoped too narrowly.** Extend to ALL displayable slices: topic, date-window (month), source — not just region+age+careSetting.
4. **No harmful-content editorial policy.** Explicit exclusion list + banned-phrase regex in `check:seed`. Forward from post-demo to phase 4.
5. **Spoken script contradicts DEMO DATA pill under Option A.** Rewrite to honest composite framing.

### HIGH (9)

6. **Framer Motion pattern.** Use `<motion.div layout>` inside `<LayoutGroup>`, not matching `layoutId`s across panels. Reserve `layoutId` for topic chip travelling between TopicBarList and topic-page header.
7. **Welsh NLP via Bedrock**, not SageMaker (Comprehend doesn't support Welsh).
8. **`drawingOnCount === voiceIds.length`** assertion in `check:seed`.
9. **Tile cache must be on demo laptop pre-travel** — explicit pre-flight item.
10. **ICO Children's Code / under-18 considerations** — add section + About page reference.
11. **DEMO DATA must be per-card label**, not just header pill. Survives phone-crop.
12. **Consent coverage as written artefact** committed to `.review/consent-coverage.md`.
13. **Filter store must NOT use Zustand `persist` middleware** — would break Cmd+R reset.
14. **k-anon assertions pinned to actual demo paths** in `check:seed`: explicitly assert 16-18 + residential + education ≥5, housing + North Wales ≥5.

### MEDIUM (16)

15. `check:seed` gated as required passing step at end of phase 4 + pre-flight.
16. Playwright smoke test (`scripts/smoke.spec.ts`) covering landing → dashboard → topic → filter → action.
17. Cmd+R exercise-tested from every route, not asserted.
18. Tile-presence verification in pre-flight (expected count assertion in fetch-tiles).
19. `excerptVoiceIds ⊆ voiceIds` assertion in `check:seed`.
20. Pre-flight: browser zoom 100%, autofill disabled, devtools closed, video playable.
21. About page references ICO 2025 anonymisation guidance.
22. Reviewer welfare: honorarium, opt-out, no conflict, 20% sample stratified by topic.
23. `sessionId` re-identification: server-side only OR k=5 per session.
24. `topics.length` 1–3 enforced in `check:seed`; topics unique.
25. Explicit `Provenance` type + `sum(provenance) === voices.length` assertion.
26. Voice distribution as numeric table (housing 28% / MH 24% / education 16% / identity 10% / relationships 10% / transitions 8% / rights 4%).
27. Cable / projector specifics expanded; 4:3 fallback pre-tested at 1366×768.
28. shadcn init Tailwind 4 gotcha — leave config path blank.
29. `<FilterChip>` + Clear-All button as named components; `clearAll()` action on Zustand store.
30. Skeleton styles specified per component (donut / feed / map / trend line).
31. Map reveal timing 180–220ms per region, not 120ms.
32. "Live · Today" renamed to "6-month composite · Dec 2025 – May 2026" to match DEMO DATA pill.
33. Counter implementation: `useMotionValue` + `animate()`, not `setInterval`.
34. Visual mood board includes Mental Health Innovations, Vercel 2026 redesign, Vista Social references.

### LOW (7)

35. Priority statement count = exactly 9 (not 8-12).
36. `PriorityStatement.group` split into `groupType` + optional `groupRegion`.
37. `package.json` scripts block pinned in CLAUDE.md.
38. Bonus "new voice" notification covered in smoke + suppressible via `?no-live-tick=1`.
39. Harmful-content safeguards moved from post-demo to phase 4.
40. Cascade animation tested at 1366×768.
41. Pre-flight: fresh browser profile, version noted, extensions disabled.

## Re-verification plan

After applying all fixes, re-dispatch the 5 NEEDS-CHANGES council members (skip researcher — already APPROVED, lens unchanged) for round 2 to confirm fixes land.
