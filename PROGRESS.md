# Project Echoes — Build Progress Tracker

> Source of truth: `PLAN.md`
> Conventions: `CLAUDE.md`
> This tracker is updated after every commit.

---

## Phase Status

| Phase | Name | Status | Commit / Tag |
|-------|------|--------|--------------|
| 1 | 6-minute storyboard | ⏳ Not started | — |
| 2 | Visual direction lock | ⏳ Not started | — |
| 3 | Scaffolding (Next.js + Tailwind 4 + shadcn + VFCC tokens) | ✅ Complete | `phase-3-scaffold` |
| 4 | Seed data authoring + safety + integrity | ⏳ Not started | — |
| 5 | Offline tile generation + basemaps-assets self-hosting | ⏳ Not started | — |
| 6 | Core components | ⏳ Not started | — |
| 7a | Map base stack + building coverage gate | ⏳ Not started | — |
| 7b | Map overlays + interaction | ⏳ Not started | — |
| 8 | Filter state (Zustand) | ⏳ Not started | — |
| 9 | Topic page + Action page + View Transitions | ⏳ Not started | — |
| 10 | Bento + wow moments + intro timeline | ⏳ Not started | — |
| 11 | About page | ⏳ Not started | — |
| 12 | Polish pass | ⏳ Not started | — |
| 13 | Demo script + smoke test | ⏳ Not started | — |
| 14 | Pre-flight + recorded backup | ⏳ Not started | — |
| 15 | Dress rehearsal | ⏳ Not started | — |

---

## Key blockers

- [ ] `public/wales.pmtiles` — generated in Phase 5; must be present before travel
- [ ] VFCC safeguarding sign-off — gates Phase 4 real-anchor voice authoring
- [ ] `.private/` folder — gitignored; holds real anonymised anchor quotes (Option A)

## Key blockers

- [ ] `public/wales.pmtiles` — generated in Phase 5; must be present before travel
- [ ] VFCC safeguarding sign-off — gates Phase 4 real-anchor voice authoring
- [ ] `.private/` folder — gitignored; holds real anonymised anchor quotes (Option A)

## GitHub issues

All 16 build issues published at https://github.com/ArmandBlossoms/project-echoes-kimi-k2/issues

| # | Title | Labels | Type |
|---|-------|--------|------|
| 4 | Lock demo arc + visual direction | phase-1, ready-for-human | HITL |
| 3 | Scaffold Next.js 15 + VFCC tokens + brand chrome + shared types | phase-3, ready-for-agent | AFK |
| 9 | Offline map tiles + basemaps-assets self-hosting | phase-5, ready-for-agent | AFK |
| 1 | Core dashboard components | phase-6, ready-for-agent | AFK |
| 16 | Map base stack + building-coverage gate (Path A vs Path B) | phase-7a, ready-for-agent | AFK |
| 15 | Map sentiment overlays + heatmap + region markers + controls | phase-7b, ready-for-agent | AFK |
| 11 | Seed data ~2,800 voices + 9 priority statements + check-seed | phase-4, ready-for-agent | Hybrid |
| 14 | Zustand filter store + k-anon redaction wiring | phase-8, ready-for-agent | AFK |
| 7 | Topic / Action pages + View Transitions drill-in | phase-9, ready-for-agent | AFK |
| 10 | Bento grid dashboard + landing page composition | phase-10, ready-for-agent | AFK |
| 8 | Hero wow moments: GSAP timeline + R3F sculpture | phase-10, wow-moment, ready-for-agent | AFK |
| 2 | Map wow moments: heatmap fade-in + 3D rise + marker cascade | phase-10, wow-moment, ready-for-agent | AFK |
| 6 | About page: methodology, sources, consent, ICO references | phase-11, ready-for-agent | AFK |
| 5 | Polish pass: skeletons, empty states, focus, perf=safe, 60fps | phase-12, ready-for-agent | AFK |
| 12 | Demo script + Playwright smoke test | phase-13, ready-for-agent | AFK |
| 13 | Pre-flight + dress rehearsal | phase-15, ready-for-human | HITL |

## Notes

- Inherited phase plans live in `docs/superpowers/plans/` — read the relevant plan before starting each phase.
- Every task within a phase gets its own commit.
- `bun` is primary; `npm` is fallback for segfault/HMR flakiness only.
