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
| 3 | Scaffolding (Next.js + Tailwind 4 + shadcn + VFCC tokens) | ⏳ Not started | — |
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

## Notes

- Inherited phase plans live in `docs/superpowers/plans/` — read the relevant plan before starting each phase.
- Every task within a phase gets its own commit.
- `bun` is primary; `npm` is fallback for segfault/HMR flakiness only.
