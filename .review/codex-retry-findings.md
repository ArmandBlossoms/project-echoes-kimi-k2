# Codex Adversarial Review (retry)

**Status:** Completed (the first dispatch hung at 26 lines for 15+ min; this retry returned).

## Codex's 5 findings + my assessment

### Finding 1 — HIGH: k-anon scope contradiction between PLAN.md and CLAUDE.md
**Codex's quote:** "Full 6-dimension cross-product enumeration is NOT required" (PLAN.md) vs "`check:seed` enumerates and asserts" the full cross-product (CLAUDE.md).
**Verified:** YES — genuine contradiction.
**Action:** **Applied.** Both docs now agree: filter dimensions are topic × region × ageBand × careSetting (588-cell cross-product, enumerable); source and month are aggregation dimensions inheriting the active-filter floor; named fixtures + single-dimension rollups + per-topic month buckets + per-topic source segments all asserted in `check:seed`.

### Finding 2 — HIGH: Make PLAN.md match CLAUDE.md (or vice versa) on cross-product scope
**Verified:** YES — same contradiction as #1.
**Action:** **Applied** in the same edit as #1.

### Finding 3 — MEDIUM: QuickFilters vs k-anon dimensions mismatch
**Codex's quote:** "QuickFilters has topic+region+age+careSetting but k-anon claims 6 dimensions."
**Verified:** YES — was a real mismatch.
**Action:** **Applied.** k-anon scope now explicitly separates filter dimensions (4) from aggregation dimensions (source + month), with the latter inheriting the floor through the filtered voice set.

### Finding 4 — MEDIUM: `groupRegion` invariant
**Codex's quote:** Should be `present iff groupType === 'regional'` (not `!== 'national'`) because ypab is not a region.
**Verified:** NO — Codex is wrong here. The original data model intentionally had `'south-wales-ypab'` and `'north-wales-ypab'` as ypab-with-region values. The split into `groupType` + `groupRegion` carries the region forward: ypab statements ARE regional in this project (each YPAB is regional). The architect independently flagged this and recommended an explicit assertion: `groupRegion` present iff `groupType !== 'national'` (i.e. present for both `ypab` and `regional`).
**Action:** **Architect's assertion applied** (not Codex's framing): `check:seed` now asserts `groupRegion present iff groupType is 'ypab' or 'regional'; absent if 'national'`.

### Finding 5 — LOW: Unavailable skills
**Codex's quote:** "Replace unavailable skill/agent names with plain tasks or real local tools."
**Verified:** NO — these skills (`brainstorming`, `frontend-design`, `tester`, `writing-plans`, `architect`, `security`, `refactor`, `claude-api`) all exist in Krit's Claude Code environment, registered as plugins. Codex doesn't see Krit's skill catalogue; it's making a false-positive assumption based on its own environment. Confirmed by direct knowledge of Krit's skill registry.
**Action:** **Rejected.** Skills retained.

## Final verdict on Codex's pass

3 of 5 fixes incorporated (1 HIGH contradiction, 1 HIGH alignment, 1 MEDIUM scope mismatch — all valid). 2 rejected with reasoning.

Codex caught the cross-doc contradiction (k-anon scope) that the Council didn't, plus the QuickFilters dimensions mismatch. Valuable contribution despite the initial hang. The other 2 findings were artefacts of Codex not seeing Krit's environment.
