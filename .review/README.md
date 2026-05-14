# Review Artefacts — Project Echoes Plan

This directory is the audit trail for the plan's pre-build review. It exists so future readers (Krit, the eventual code reviewers, or anyone re-running the plan in a later session) can see what was challenged, what was verified, what was applied, and what was rejected with reasoning.

## Process summary

The Project Echoes PLAN.md + CLAUDE.md were challenged by:

1. **An independent first-pass review** by the plan author (`krit-independent-review.md`)
2. **A technical-claims researcher** verifying high-risk stack assumptions (`researcher-stack-verification.md`)
3. **A six-member Council** of expert sub-agents — architect, frontend-design, security, devops, tester, researcher — each doing their own research before judging. Verdicts in `council-architect.md`, `council-frontend.md`, `council-security.md`, `council-devops.md`, `council-tester.md`, `council-researcher.md`.
4. **A Codex adversarial review** — first attempt hung after 26 lines of initialisation; retry succeeded with 5 findings (`codex-retry-findings.md`). 3 of 5 incorporated; 2 rejected with reasoning.

## Final result

Across rounds, 41+ specific issues surfaced and were either resolved in the plan or explicitly rejected with reasoning. The plan went through:

- **Round 1**: 1 APPROVED (researcher) · 5 NEEDS-CHANGES (architect, frontend, security, devops, tester)
- **Round 2**: 4 APPROVED (researcher, tester, security, architect) · 2 NEEDS-CHANGES (frontend, devops — with NEW issues, fixes applied)
- **Codex retry**: 3 valid findings applied (k-anon scope contradiction, QuickFilters/dimensions mismatch, alignment between docs)
- **Round 3**: final-gate verification for frontend + devops (the only remaining NEEDS-CHANGES from round 2)

The plan reflects all valid findings. Items rejected (Codex finding 4: `groupRegion` invariant; Codex finding 5: skill availability) are documented in `codex-retry-findings.md` with the reason for rejection.

## What was strengthened the most by review

- **Map stack**: original CartoDB → OpenFreeMap (vector tiles, incompatible) → Protomaps PMTiles + `protomaps-leaflet` (clean offline single-file)
- **k-anonymity**: scope clarified across filter vs aggregation dimensions; named demo-path fixtures pinned
- **Safeguarding**: editorial / content-safety guideline added; per-card DEMO DATA labels; written consent-coverage artefact; ICO Children's Code reference
- **Welsh NLP**: Bedrock primary (not SageMaker; Comprehend doesn't support Welsh)
- **Framer Motion pattern**: `<motion.div layout>` inside `<LayoutGroup>` (not matching `layoutId`s)
- **Demo-day reliability**: `next start` not `next dev`; wifi explicitly off; cable specifics; tile cache pre-travel; Cmd+R exercise-tested every route; smoke spec covers the most-fragile integration

## Files in this directory

| File | Origin |
|---|---|
| `krit-independent-review.md` | Plan author's pre-Codex review (40 points) |
| `researcher-stack-verification.md` | High-risk technical claims (CartoDB licensing, Bun+Next, react-leaflet SSR, etc.) |
| `CONSOLIDATED-FINDINGS.md` | Round-1 master list of all 41 issues |
| `council-architect.md` | Council member: system design lens |
| `council-frontend.md` | Council member: UI / polish lens |
| `council-security.md` | Council member: safeguarding / ethics lens |
| `council-devops.md` | Council member: demo-day reliability lens |
| `council-tester.md` | Council member: verification rigour lens |
| `council-researcher.md` | Council member: external grounding lens |
| `codex-retry-findings.md` | Codex's adversarial pass + author's accept/reject reasoning |
| `consent-coverage.md` | (Build phase 4) — written artefact: VFCC safeguarding sign-off + UK GDPR re-use basis |
| `seed-check.log` | (Build phase 4) — `bun run check:seed` exit log |
