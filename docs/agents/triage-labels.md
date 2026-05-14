# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning |
|---|---|---|
| `needs-triage` | `needs-triage` | Maintainer needs to evaluate this issue |
| `needs-info` | `needs-info` | Waiting on reporter (Krit / external party) for more information |
| `ready-for-agent` | `ready-for-agent` | Fully specified, ready for an AFK agent to build autonomously |
| `ready-for-human` | `ready-for-human` | Requires human implementation, decision, or external dependency |
| `wontfix` | `wontfix` | Will not be actioned |

## Additional labels used by this project

The build is organised into 15 phases. Each phase gets a label so `to-issues` can group tickets, and `triage` can filter by what's next.

| Label | Used for |
|---|---|
| `phase-1` | Storyboard the 6 minutes |
| `phase-2` | Visual direction lock |
| `phase-3` | Scaffolding (Next.js + Tailwind + shadcn + VFCC tokens) |
| `phase-4` | Seed data authoring + safety + integrity |
| `phase-5` | Offline tile generation + basemaps-assets self-hosting |
| `phase-6` | Core components |
| `phase-7a` | Map base stack + building coverage gate |
| `phase-7b` | Map overlays + interaction |
| `phase-8` | Filter state (Zustand) |
| `phase-9` | Topic page + Action page + View Transitions |
| `phase-10` | Bento + wow moments + intro timeline |
| `phase-11` | About page |
| `phase-12` | Polish pass |
| `phase-13` | Demo script + smoke test |
| `phase-14` | Pre-flight + recorded backup |
| `phase-15` | Dress rehearsal |
| `blocked` | Blocked on external dependency or gate |
| `docs` | Documentation or planning update |
| `wow-moment` | One of the 7 engineered "wow" moments |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

Edit the right-hand column to match whatever vocabulary you actually use.
