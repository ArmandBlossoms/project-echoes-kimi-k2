# Council — Security Verdict

**Status:** NEEDS-CHANGES

## Issues

### BLOCKER — k-anonymity check scoped too narrowly
- **Quote:** "for every combination of (region, ageBand, careSetting) shown together via filters"
- **Reality:** the UI also slices by topic, date-window, source. Small cells in topic × age × setting × region (exactly the slice the script demos: "16–18-year-olds in residential care saying about education") are NOT protected.
- **Fix:** extend k-anon to **every actually-displayable slice** — the cross-product of all active filter dimensions including topic, date-window (e.g. month), source. UI must render "Too few voices" redaction below k=5 on any slice.

### BLOCKER — No harmful-content editorial policy
- **Reality:** topics include mental health, transitions, relationships. ~250 LLM-generated quotes with no documented exclusion list (self-harm, suicidal ideation, abuse disclosure, named individuals, identifiable trauma). YPAB review brief is "authenticity" not "safety".
- **Fix:** add "Editorial / content safety guideline" subsection before voice authoring. Explicit exclusion list. Require YPAB reviewer to flag for **safety** as well as authenticity. Add banned-phrase / red-flag regex pass to `check:seed`. Forward this from post-demo to demo phase 4.

### BLOCKER — Spoken script contradicts DEMO DATA pill under Option A
- **Quote (demo arc):** "Every voice comes from real VFCC work — session notes, drop-ins, surveys, advocacy."
- **Reality:** under Option A, only ~50/300 are real-anchor; ~250 are LLM-generated. Misattribution by narrative.
- **Fix:** rewrite spoken line for Option A to be honest: "These voices are illustrative composites grounded in real VFCC conversations — drop-ins, advocacy, surveys, group sessions — and reviewed by a YPAB member. With the grant, they become every real voice, live." Lock wording in `DEMO-SCRIPT.md`.

### HIGH — ICO Children's Code / under-18 considerations missing
- **Fix:** add "Children & under-18 considerations" section naming ICO Age Appropriate Design Code, Article 8 UK GDPR (children's special protection), Welsh Government's Children Looked After / Care-Experienced Charter. Add to About page.

### HIGH — DEMO DATA must be per-card, not just header pill
- **Reality:** a phone-camera crop of a single quote card or priority statement won't carry the header pill.
- **Fix:** add micro-label "illustrative composite" to **each `<VoicesFeed>` card** and **each `<PriorityStatementCard>`**, not just the header pill.

### HIGH — Consent coverage needs to be a written artefact
- **Fix:** the "VFCC data-governance / consent verification" dependency must produce a **committed file** at `.review/consent-coverage.md` naming the original consent basis, the lawful re-use basis under UK GDPR (legitimate interests with LIA, or fresh consent), and confirmation that AWS-pitch reuse is covered. Verbal sign-off insufficient.

### MEDIUM — Anonymisation methodology page should reference ICO 2025 guidance
- **Fix:** About page methodology copy references ICO 2025 anonymisation guidance (spectrum-of-identifiability, motivated-intruder test). Notes k-anonymity is structural, not sufficient — re-identification risk reassessed at production.

### MEDIUM — Reviewer welfare + sample size
- **Fix:** specify: paid honorarium, support contact, opt-out, reviewer NOT a contributor of any anchor quotes (conflict of interest), sample raised from ~30 (10%) to ~60 (20%) and stratified — mental-health/transitions content over-sampled.

### MEDIUM — `sessionId` as re-identification vector
- **Fix:** either (a) keep `sessionId` server-side only (never in UI / URL / DOM), or (b) require every `sessionId` to aggregate ≥ k=5 contributors. Document which.

### LOW — Harmful-content safeguards moved to demo build phase
- **Fix:** move "harmful-content safeguards" forward from post-demo workstream 8 into demo build phase 4 — seeded demo already displays sensitive content publicly.

## What's strong (don't change)
- Option A/B fallback with explicit dependency tracking
- k-anonymity instinct (just needs broader scope)
- DEMO DATA pill (just needs per-card labelling too)
- `consentLevel: 'aggregate-only'` field
- `.private/` gitignored anchor file
- "Voices over engagement" language guidance
- Bilingual brand lockup
- YPAB review step
- Explicit decision to descope Welsh NLP rather than fake it
