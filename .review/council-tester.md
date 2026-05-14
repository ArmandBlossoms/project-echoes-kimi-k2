# Council — Tester Verdict

**Status:** NEEDS-CHANGES

## Issues

### HIGH — Missing `drawingOnCount === voiceIds.length` assertion
- **Quote:** `drawingOnCount: number;` and `voiceIds: string[];` (data model)
- Demo script narrates "drawing on 47 voices" — backing array could silently contain a different count.
- **Fix:** add to `check:seed`: `drawingOnCount === voiceIds.length` for every `PriorityStatement`.

### MEDIUM — `check:seed` not gated as required
- **Fix:** make `check:seed` a required passing step at the close of phase 4 (log exit-code to `.review/seed-check.log`), AND re-run as part of demo-day pre-flight.

### MEDIUM — No automated functional test
- **Fix:** add `scripts/smoke.spec.ts` — a single Playwright happy-path: landing → dashboard → topic click → quick-filter toggle → action page. Run via `bun run smoke`. Include in pre-flight.

### MEDIUM — Cmd+R safety asserted but not tested
- **Fix:** change pre-flight from "known to be safe" to "Test Cmd+R from `/`, `/dashboard`, `/topic/housing`, and `/action` — confirm counter re-ticks and filter state resets cleanly on each."

### MEDIUM — Tile presence not verified pre-flight
- **Fix:** `fetch-tiles` script logs expected count and asserts on stdout; pre-flight runs `fetch-tiles` + wifi-off render test.

### MEDIUM — `excerptVoiceIds` not constrained to be subset of `voiceIds`
- **Fix:** add `check:seed` assertion: every `excerptVoiceId ∈ voiceIds` of the same statement.

### MEDIUM — Pre-flight missing items
- **Fix:** add to laptop pre-flight: browser zoom reset to 100%; autofill disabled or clean profile; devtools closed + F12/Cmd+Opt+I risk noted; backup video file opened and confirmed playable.

### LOW — Bonus "new voice" notification lacks safe fallback
- **Fix:** if implemented, must be covered by smoke.spec and suppressible via `?no-live-tick=1` query param.

## What's strong (don't change)
- Tile decision rationale (offline + licensing — though see architect for vector/raster issue)
- k-anonymity floor of 5 in both seed and UI
- `prefers-reduced-motion` fallback
- Two-tier voice authenticity workflow
- Phase-commit discipline
