# Project Echoes — 6-Minute Storyboard Implementation Plan (Phase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock the 6-minute demo arc by producing low-fidelity browser mockups of every demo screen, capturing the spoken-cue/on-screen alignment, and committing the locked arc as the source-of-truth artefact for every subsequent build phase.

**Architecture:** Design-only phase — no application code is written. Uses the `superpowers:brainstorming` skill (for arc exploration) and the `frontend-design:frontend-design` skill (for browser-rendered low-fi mockups). All outputs land in `.review/storyboard/` and the locked arc is committed at `.review/storyboard.md`. Subsequent phases (3 onward) read `.review/storyboard.md` as the spec for which screens to build.

**Tech Stack:** No app stack changes — design artefacts only. Mockups built with plain HTML + Tailwind via the frontend-design skill's browser companion (any temporary scratch project).

**Phase prerequisites:** PLAN.md and CLAUDE.md committed. No code dependencies. Recommended: at least one short conversation with the VFCC CEO or board chair to surface any "must show this" content before locking the arc.

---

## File Structure

```
.review/
  storyboard.md                          # the LOCKED arc artefact — the single source of truth
  storyboard/
    01-landing.png                       # rendered screenshot of the landing mockup
    01-landing.html                      # the mockup HTML (so anyone can re-render later)
    02-dashboard.png
    02-dashboard.html
    03-housing-drill.png
    03-housing-drill.html
    04-priority-statement.png
    04-priority-statement.html
    05-quick-filters-cascade.png
    05-quick-filters-cascade.html
    06-close-aws-slide.png
    06-close-aws-slide.html
    feedback-notes.md                    # raw notes from feedback rounds (board / colleagues)
```

`.review/storyboard.md` is the LOCKED arc. The PNG/HTML pairs in `.review/storyboard/` are working artefacts that anyone can reload to verify the locked arc still matches.

---

## Task 1: Brainstorming pass on the arc shape

**Files:**
- Create: `.review/storyboard/feedback-notes.md`

- [ ] **Step 1: Invoke the brainstorming skill**

  In Claude Code, run:

  ```
  /superpowers:brainstorming
  ```

  Frame the prompt:

  > "Help me sharpen the 6-minute Echoes demo arc for the VFCC board + AWS Imagine Grant 2026 judges. PLAN.md has a draft arc in the 'Audience and the 6-minute demo arc' table. The audience is care-experienced young people advocates (who don't want voices reduced to data points) AND AWS grant judges (who want technical credibility). What's the strongest arc shape, and where does the current draft leave value on the table?"

- [ ] **Step 2: Capture the brainstorming output into feedback-notes.md**

  Save the conversation key takeaways (NOT the full transcript — just the actionable points) to `.review/storyboard/feedback-notes.md`:

  ```markdown
  # Storyboard brainstorming — 2026-XX-XX

  ## Arc strengths (from brainstorming)
  - <point>
  - <point>

  ## Arc weaknesses (from brainstorming)
  - <point>
  - <point>

  ## Concrete changes to consider in the mockups
  - <change>
  - <change>
  ```

- [ ] **Step 3: Commit the notes**

  ```bash
  cd "/Users/krit/Desktop/04 Web & Development/Project-Echoes"
  git add .review/storyboard/feedback-notes.md
  git commit -m "design(phase-1): brainstorming pass on the 6-minute arc"
  ```

---

## Task 2: Mockup screen 1 — Landing / hero (0:00 – 0:45)

**Files:**
- Create: `.review/storyboard/01-landing.html`
- Create: `.review/storyboard/01-landing.png`

- [ ] **Step 1: Invoke the frontend-design skill**

  ```
  /frontend-design:frontend-design
  ```

  Frame the prompt for landing:

  > "Low-fidelity browser mockup of the Echoes landing screen. Bilingual brand lockup (Echoes · Atseiniau) top-left. Hero copy: 'Voices of care-experienced Wales.' Single rotating voice quote card with per-card 'illustrative composite' label. Total counter ticking up to 2,800. Persistent 'Sample data — illustrative composite voices' pill in header. Status indicator: '6-month composite · Dec 2025 – May 2026'. VFCC warm dark theme. No emoji. Spoken-cue: 'This is Echoes. The voices you'll see today are illustrative composites grounded in real VFCC conversations and reviewed by a member of our Young People's Advisory Board.'"

- [ ] **Step 2: Save the mockup HTML + screenshot**

  Save the generated HTML to `.review/storyboard/01-landing.html`. Open it in a browser at 1920×1080, screenshot to `.review/storyboard/01-landing.png`.

- [ ] **Step 3: Sanity-check the mockup against PLAN.md "Audience and the 6-minute demo arc" row 1**

  Does the mockup show: bilingual lockup, rotating voice card, illustrative-composite label, ticking counter, DEMO DATA pill, status indicator? If any missing, regenerate.

- [ ] **Step 4: Commit**

  ```bash
  git add .review/storyboard/01-landing.html .review/storyboard/01-landing.png
  git commit -m "design(phase-1): mockup screen 1 — landing"
  ```

---

## Task 3: Mockup screen 2 — Dashboard (0:45 – 2:00)

**Files:**
- Create: `.review/storyboard/02-dashboard.html`
- Create: `.review/storyboard/02-dashboard.png`

- [ ] **Step 1: Generate the mockup**

  Frame the prompt:

  > "Low-fidelity Echoes dashboard mockup. Bento grid layout: Wales map (big — top-left, 2/3 width) with sentiment heat-map and 7 region markers at 45° pitch; voice counter top-right; sentiment donut (hopeful / mixed / worried, 3 bands); topic bar list (7 topics, horizontal bars); voices feed (3 quote cards with 'illustrative composite' labels); data provenance panel (1-to-1, YPAB, drop-in, surveys + partner-orgs-coming-soon). Brand motif: 2px ink border + 4px offset shadow on every tile. VFCC warm dark theme. Spoken-cue: 'Here's what young people are telling us across Wales — by topic, by region, by source.'"

- [ ] **Step 2: Save the mockup**

  HTML → `.review/storyboard/02-dashboard.html`. Screenshot → `.review/storyboard/02-dashboard.png`.

- [ ] **Step 3: Sanity-check**

  Cross-check against PLAN.md "Bento-grid layout" section + Components list. The 7 panels listed in `<BentoDashboard>`'s grid template should all be visible.

- [ ] **Step 4: Commit**

  ```bash
  git add .review/storyboard/02-dashboard.*
  git commit -m "design(phase-1): mockup screen 2 — dashboard bento"
  ```

---

## Task 4: Mockup screen 3 — Housing topic drill-in (2:00 – 3:30)

**Files:**
- Create: `.review/storyboard/03-housing-drill.html`
- Create: `.review/storyboard/03-housing-drill.png`

- [ ] **Step 1: Generate the mockup**

  > "Low-fidelity Echoes topic deep-dive for Housing. Topic chip morphed into the header position (visualises the View Transition). Sentiment donut filtered to housing only (62% hopeful / 24% mixed / 14% worried). Time-trend line showing the last two months dropping. Map filtered to housing-only voices, pitch flattened to 0°. North Wales region highlighted as the most concerned. Voices feed: 3 housing-tagged quote cards. 'Asking for' summary panel below. VFCC warm dark. Brand motif on cards. Spoken-cue: 'Housing — most voices are still hopeful, but you can see the trend dropping the last two months. North Wales is the most concerned region.'"

- [ ] **Step 2: Save the mockup**

  HTML → `.review/storyboard/03-housing-drill.html`. Screenshot → `.review/storyboard/03-housing-drill.png`.

- [ ] **Step 3: Sanity-check**

  PLAN.md's minute-2:00 row mentions "sentiment breakdown, time-trend line, regional map filtered to housing, voices feed, 'asking for' summary" — all five must be visible.

- [ ] **Step 4: Commit**

  ```bash
  git add .review/storyboard/03-housing-drill.*
  git commit -m "design(phase-1): mockup screen 3 — housing topic drill-in"
  ```

---

## Task 5: Mockup screen 4 — YPAB priority statement (3:30 – 4:30)

**Files:**
- Create: `.review/storyboard/04-priority-statement.html`
- Create: `.review/storyboard/04-priority-statement.png`

- [ ] **Step 1: Generate the mockup**

  > "Low-fidelity Echoes priority-statement card view. Card shows: group type (YPAB — South Wales), date (April 2026), statement quote, 'drawing on 47 voices' annotation, expandable linked discussion context with 2-3 example excerpts, per-card 'illustrative composite' label. Below the card: 'YPAB' source attribution + the 'illustrative composite' framing repeated. VFCC warm dark, brand motif on card. Spoken-cue: 'Last month the South Wales YPAB met about housing. Their priority statement, drawing on 47 voices, was…'"

- [ ] **Step 2: Save the mockup**

  HTML → `.review/storyboard/04-priority-statement.html`. Screenshot → `.review/storyboard/04-priority-statement.png`.

- [ ] **Step 3: Sanity-check**

  PLAN.md `<PriorityStatementCard>` spec: group + date + statement + drawing-on count + expandable discussion context + per-card `<CardSourceLabel>`. All five must be visible.

- [ ] **Step 4: Commit**

  ```bash
  git add .review/storyboard/04-priority-statement.*
  git commit -m "design(phase-1): mockup screen 4 — priority statement card"
  ```

---

## Task 6: Mockup screen 5 — Quick-filters cascade (4:30 – 5:30)

**Files:**
- Create: `.review/storyboard/05-quick-filters-cascade.html`
- Create: `.review/storyboard/05-quick-filters-cascade.png`

- [ ] **Step 1: Generate the mockup**

  > "Low-fidelity Echoes dashboard with three quick-filters applied: 'Age band: 16-18', 'Care setting: residential', 'Topic: education' — shown as three filter chips with × remove buttons in the header. All panels recompute with this filter combination. Voice counter shows the filtered total (e.g., 47 voices). Voices feed shows education-tagged quote cards from 16-18 residential young people. 'Clear all' button visible next to the filter chips. VFCC warm dark, brand motif. Spoken-cue: 'And the data isn't flat. We can ask: what are 16-to-18-year-olds in residential care saying about education? Here.'"

- [ ] **Step 2: Save the mockup**

  HTML → `.review/storyboard/05-quick-filters-cascade.html`. Screenshot → `.review/storyboard/05-quick-filters-cascade.png`.

- [ ] **Step 3: Sanity-check k-anonymity rendering**

  PLAN.md Critical Rule 3: when a slice resolves to <5, the panel renders the redaction state. The 16-18 × residential × education slice MUST hold ≥5 per PLAN.md's pinned demo-path fixtures. The mockup should show populated data, not redacted — the redaction state is exercised elsewhere.

- [ ] **Step 4: Commit**

  ```bash
  git add .review/storyboard/05-quick-filters-cascade.*
  git commit -m "design(phase-1): mockup screen 5 — quick filters cascade"
  ```

---

## Task 7: Mockup screen 6 — Close + AWS architecture (5:30 – 6:00)

**Files:**
- Create: `.review/storyboard/06-close-aws-slide.html`
- Create: `.review/storyboard/06-close-aws-slide.png`

- [ ] **Step 1: Generate the mockup**

  > "Two-part close. (a) Echoes dashboard back at overview state (clean, no filters). (b) External slide: AWS production architecture diagram — boxes for API Gateway + Lambda (intake), Bedrock (NLP: English + Welsh), DynamoDB + S3 (storage), CloudFront + Amplify (serving), CloudWatch (observability). VFCC brand on the slide chrome (header + footer); the slide is the only place AWS branding appears in the demo. Spoken-cue: 'What you've seen runs on seeded composite data. With the AWS Imagine Grant, every voice from every interaction is processed in near real-time. Here's the picture.'"

- [ ] **Step 2: Save the mockup**

  HTML → `.review/storyboard/06-close-aws-slide.html`. Screenshot → `.review/storyboard/06-close-aws-slide.png`.

- [ ] **Step 3: Sanity-check the AWS box list**

  PLAN.md "Post-demo workstreams" item 2 names the boxes: API Gateway + Lambda · Bedrock · DynamoDB + RDS/Aurora · S3 · Amplify / CloudFront · CloudWatch + QuickSight. All six must appear.

- [ ] **Step 4: Commit**

  ```bash
  git add .review/storyboard/06-close-aws-slide.*
  git commit -m "design(phase-1): mockup screen 6 — close + AWS architecture"
  ```

---

## Task 8: Feedback round — show the storyboard to a trusted colleague

**Files:**
- Modify: `.review/storyboard/feedback-notes.md`

- [ ] **Step 1: Pick a reviewer**

  At least one VFCC colleague who has presented to the board before. Ideally also one care-experienced young person (paid for their time per consent rules in CLAUDE.md / PLAN.md). NOT the same person who'll be the YPAB authenticity reviewer in Phase 4 — that creates a conflict-of-interest with the locking decision.

- [ ] **Step 2: Walk them through all 6 mockup PNGs in order, reading the spoken cues aloud**

  Time it. Stop on each frame. Ask: "Is this what the spoken sentence promises? Does it feel like VFCC? Is anything reduced to a data point that shouldn't be?"

- [ ] **Step 3: Capture feedback**

  Append to `.review/storyboard/feedback-notes.md`:

  ```markdown
  ## Feedback round — 2026-XX-XX

  Reviewer: <name + role>

  ### Per-screen feedback
  - Screen 1 (landing): <feedback>
  - Screen 2 (dashboard): <feedback>
  - Screen 3 (housing): <feedback>
  - Screen 4 (priority statement): <feedback>
  - Screen 5 (cascade): <feedback>
  - Screen 6 (close): <feedback>

  ### Cross-cutting feedback
  - <e.g., "the spoken sentence at 3:30 sounded clinical">
  - <e.g., "AWS slide could be smaller, dashboard back-out longer">

  ### Changes to make before lock
  - <change>
  - <change>
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add .review/storyboard/feedback-notes.md
  git commit -m "design(phase-1): feedback round captured"
  ```

---

## Task 9: Apply feedback changes (re-mockup any screen that needs it)

**Files:**
- Modify: any of `.review/storyboard/0X-*.html` / `0X-*.png` that needs revision.

- [ ] **Step 1: Triage the feedback**

  For each "change to make before lock" item, decide:
  - **Mockup-level fix** (visual layout, copy on the mockup) — re-run the relevant Task 2-7.
  - **Spoken-cue fix** (wording in the script) — fold into the DEMO-SCRIPT.md to-do list for Phase 13; do not change the mockup.
  - **Architectural fix** (need a new panel, drop a panel) — bigger; surfaces in Task 10 below or escalate to a PLAN.md amendment.

- [ ] **Step 2: Re-mockup any screens flagged for mockup-level revision**

  For each, repeat the relevant Task 2-7 (generate, save HTML + PNG, sanity-check, commit). Use the same filenames — overwrite.

- [ ] **Step 3: Commit**

  ```bash
  git add .review/storyboard/
  git commit -m "design(phase-1): apply feedback-round revisions"
  ```

---

## Task 10: Lock the arc into `.review/storyboard.md`

**Files:**
- Create: `.review/storyboard.md`

- [ ] **Step 1: Create the locked arc artefact**

  Write `.review/storyboard.md`:

  ```markdown
  # Project Echoes — Locked 6-Minute Demo Arc

  Locked: 2026-XX-XX (revision 1 after Phase 1)
  Status: SOURCE OF TRUTH for the build. Changes require a PLAN.md amendment.

  ## Arc

  | Minute | Screen | On-screen | Spoken cue | Mockup |
  |---|---|---|---|---|
  | 0:00 – 0:45 | Landing | <one-line summary of what's visible> | "<exact spoken cue from feedback>" | `.review/storyboard/01-landing.png` |
  | 0:45 – 2:00 | Dashboard | <summary> | "<cue>" | `.review/storyboard/02-dashboard.png` |
  | 2:00 – 3:30 | Housing drill | <summary> | "<cue>" | `.review/storyboard/03-housing-drill.png` |
  | 3:30 – 4:30 | Priority statement | <summary> | "<cue>" | `.review/storyboard/04-priority-statement.png` |
  | 4:30 – 5:30 | Quick filters cascade | <summary> | "<cue>" | `.review/storyboard/05-quick-filters-cascade.png` |
  | 5:30 – 6:00 | Close + AWS slide | <summary> | "<cue>" | `.review/storyboard/06-close-aws-slide.png` |

  ## What this locks

  - Which screens appear and in what order.
  - The spoken cue per screen (the verbatim DEMO-SCRIPT.md draft).
  - The visible panels on each screen.
  - The on-stage named slices (carry through to k-anon enumeration in Phase 4).
  - The "wow moments" budgeted per screen (per Phase 10).

  ## What this does NOT lock

  - Final colour values or typography sizing (locked in Phase 2).
  - Per-component animation specifics (Phase 10).
  - The seed-data content (Phase 4).

  ## Amendment process

  Any change to the arc after this lock requires:
  1. A note in PLAN.md "Revision X — post-storyboard amendment".
  2. A re-run of the relevant Task 2-7 mockup.
  3. A regenerated `storyboard.md` table.
  4. Sign-off from the same reviewer who signed off in Task 8.

  ## Pinned on-stage slices (carry to `check:seed` in Phase 4)

  - (housing) × (north-wales) — referenced at 2:00.
  - (16-18) × (residential) × (education) — referenced at 4:30.
  - <any others surfaced during feedback>
  ```

- [ ] **Step 2: Cross-check the locked arc against PLAN.md "Audience and the 6-minute demo arc" table**

  Walk through both side-by-side. Every minute slot must agree. If they disagree, decide which version is correct (the storyboard supersedes the PLAN.md draft, since the storyboard had a feedback round) and amend PLAN.md accordingly:

  ```bash
  # If PLAN.md needs amending:
  # Edit PLAN.md → "Audience and the 6-minute demo arc" table → match storyboard.md
  # Bump the "revision N" annotation
  git add PLAN.md
  git commit -m "docs(plan): amend 6-min arc table to match locked storyboard.md"
  ```

- [ ] **Step 3: Commit the locked arc**

  ```bash
  git add .review/storyboard.md
  git commit -m "design(phase-1): LOCK the 6-minute arc — storyboard.md is source of truth"
  ```

- [ ] **Step 4: Tag the phase close**

  ```bash
  git tag phase-01-storyboard
  ```

---

## Definition of Done

Phase 1 is closed when:

1. All 10 task checkboxes ticked.
2. `.review/storyboard.md` is committed and tagged at `phase-01-storyboard`.
3. Every minute slot (0:00, 0:45, 2:00, 3:30, 4:30, 5:30) has a paired mockup PNG + HTML in `.review/storyboard/`.
4. A feedback round happened with a real human reviewer and their notes are captured in `.review/storyboard/feedback-notes.md`.
5. If the storyboard introduced changes vs PLAN.md, PLAN.md has been amended to match.
6. Pinned on-stage slices are listed in `storyboard.md` so Phase 4's `check:seed` enumerates them.

## Out of scope

- Final visual design system pick (Phase 2 — visual direction lock).
- High-fidelity polish of mockups (Phase 2 produces those; Phase 1 mockups stay low-fi on purpose).
- The actual `DEMO-SCRIPT.md` (Phase 13).
- Any code in `src/` (Phase 3 onward).
