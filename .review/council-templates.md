# Council Briefing Templates

Each council member receives:
1. Same project context block
2. Their specific judging lens
3. Same deliverable format

## Shared context block

> Project Echoes is a demo / proof-of-concept for a live sentiment dashboard surfacing voices from Wales' care-experienced community. The demo is a fundraising artefact: it pitches VFCC (Voices From Care Cymru) CEO + Board for internal buy-in, and pitches the AWS Imagine Grant 2026 panel for the cloud funding that builds the production version.
>
> The demo runs locally on the developer's laptop with fully seeded data, ~6-minute presentation flow. The build will be "vibecoded" — i.e. an LLM coding assistant (Claude Code) will execute the plan as written, so ambiguity in the plan becomes ambiguity in the code.
>
> The plan and project conventions live in:
> - `/Users/krit/Desktop/04 Web & Development/Project-Echoes/PLAN.md`
> - `/Users/krit/Desktop/04 Web & Development/Project-Echoes/CLAUDE.md`
>
> No code has been scaffolded yet. The build hasn't started.

## Shared deliverable format

> **Step 1 — Research.** Do not skip this. Before judging, research what the plan claims. Read both documents fully. Verify external claims (tool versions, compatibility, patterns) against authoritative sources. Look at similar existing projects if relevant.
>
> **Step 2 — Judge.** Return ONE of three verdicts:
> - **APPROVED** — plan is ready to be vibecoded to full completion. You'd bet on it shipping.
> - **NEEDS-CHANGES** — plan is mostly sound but has N specific gaps that must be fixed before a vibecoded build will succeed. List them precisely.
> - **REJECTED** — plan has structural issues that require rework, not patching.
>
> **Step 3 — Justify.** For each issue you flag, give:
> - severity (BLOCKER / HIGH / MEDIUM / LOW)
> - the specific quote or section being questioned
> - the concrete fix you'd apply
>
> Be harsh and specific. The user's goal is to ship a bulletproof plan. Politeness here costs them in the build.

---

## Council member 1 — architect

**Lens:** system design soundness, AWS post-demo architecture viability, data model completeness, planning rigour.

Research focus:
- Is the data model (Voice + PriorityStatement schemas) complete and unambiguous? Are there relationships not captured?
- Is the proposed AWS pipeline (Lambda + Comprehend + DynamoDB + SageMaker for Welsh + Amplify) actually the right shape? Or are there better-suited services?
- Is there a coherent story from local seeded demo → AWS production that judges will buy?
- Does the build phase ordering reveal architectural gaps?

---

## Council member 2 — frontend-design

**Lens:** UI/UX feasibility, polish achievability, component architecture, what "looks like a real product" actually requires.

Research focus:
- Is the component breakdown complete enough that an LLM can build it without inventing components?
- Are the "wow moments" (counter tick-up, map cascade, topic-click cascade) realistic given the stack?
- Are there UI patterns that would make this look more "end-product" that the plan misses?
- Does the visual direction lock + storyboard step have enough structure to converge fast?

---

## Council member 3 — security

**Lens:** ethics, safeguarding, consent, anonymisation, data sensitivity. This is the most consequential lens for a young-people-voice platform.

Research focus:
- Does the plan address consent properly for seeded "real anonymised" quotes (Option A)?
- Is the anonymisation tagging (region + age band + care setting + topic + date) k-anonymous in small cells (e.g. Powys / under-16 / kinship)?
- Are there UK-specific safeguarding/data-protection requirements (UK GDPR, Welsh Government guidance, charity-sector codes of practice) the plan should address?
- What's the on-screen "DEMO DATA" indicator strategy? Is there one?
- Could anything in the demo, if misused, harm the young people whose voices it draws on?

---

## Council member 4 — devops

**Lens:** demo-day reliability, offline guarantee, build pipeline, pre-flight readiness.

Research focus:
- Is the offline guarantee actually implementable as described? (Fonts via `geist/font`, map tiles pre-downloaded — what's the concrete mechanism?)
- Can `bun run dev` actually run a Next.js 15 App Router project reliably? Known issues?
- Demo-day failure modes: projector resolution, laptop sleep, notifications, battery — covered?
- Is the recorded video backup workflow specified well enough to execute?

---

## Council member 5 — tester

**Lens:** verification strategy, seed data integrity, test coverage gaps.

Research focus:
- Does the verification section catch what would actually break? (E.g. data integrity: priority statement voice references all resolve to real voice IDs; provenance counts sum to total.)
- Is there a sensible smoke-test set that should be automated, even for a demo?
- Is the "dress rehearsal" structured enough to catch performance / animation issues at projector resolution?
- Are there pre-flight checks (data consistency, broken-link, accessibility-basic) missing?

---

## Council member 6 — researcher

**Lens:** external grounding — does the plan stand up against similar existing projects, sector best-practice, real-world examples of sentiment / voice dashboards?

Research focus:
- Are there existing dashboards in this space (youth voice, care-experienced data, charity sentiment platforms) the plan should learn from?
- What do AWS Imagine Grant winners typically look like? Are there genre conventions the demo should hit?
- What does the literature on participatory data with care-experienced young people say about how to do this respectfully?
- Any precedent for the "loop closing" pattern (voice → dashboard → discussion → priority → back into voice) in the sector?

---

## Approval rule

All 6 must return APPROVED for the goal to complete. Any NEEDS-CHANGES means iterate. Any REJECTED means significant rework.
