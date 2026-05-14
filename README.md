# Project Echoes / Atseiniau

A live sentiment dashboard surfacing the voices of care-experienced children and young people across Wales — built for the **AWS Imagine Grant 2026** pitch.

This is a **6-minute demo artefact**, not a production product. It runs fully offline on a laptop with seeded illustrative-composite data.

## What you will see

- **Landing:** bilingual brand lockup, 3D generative hero sculpture, voice counter ticking to 2,800 composite voices
- **Dashboard:** Bento-grid overview — Wales heat-map with 3D buildings, sentiment donut, topic bars, voice feed
- **Topic drill-in:** click Housing (or any of 7 topics) for filtered sentiment + trend + regional map
- **Priority statements:** YPAB outputs with linked discussion context
- **Quick-filter cascade:** age band × care setting × topic — "what are 16-to-18-year-olds in residential care saying about education?"

## Tech stack

Next.js 15 (App Router) · TypeScript · Bun · Tailwind CSS 4 · shadcn/ui · Recharts · MapLibre GL JS + pmtiles + protomaps-themes-base · @deck.gl/mapbox (HeatmapLayer + IconLayer) · Framer Motion · GSAP · @react-three/fiber v9 (hero only) · Zustand · Biome

## Build status

See [`PROGRESS.md`](./PROGRESS.md) for the phase-by-phase tracker. 

Source of truth: [`PLAN.md`](./PLAN.md) · Developer conventions: [`CLAUDE.md`](./CLAUDE.md)

## License / data

All seed data in `src/seed/` is illustrative composite — reviewed for authenticity and safety. Real anonymised anchor quotes (Option A) live in `.private/` (gitignored). See `PLAN.md` for the full voice-authenticity workflow and k-anonymity safeguards.
