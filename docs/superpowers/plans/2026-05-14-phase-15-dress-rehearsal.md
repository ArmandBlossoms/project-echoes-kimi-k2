# Project Echoes — Dress Rehearsal Implementation Plan (Phase 15)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run the demo twice end-to-end against the production build under live-demo conditions; tighten anything that doesn't land; re-record the backup video against the final build state.

**Architecture:** Two timed run-throughs separated by a remediation pass. Every observation goes into `.review/dress-rehearsal-<date>.md`. The final task re-runs Phase 14's video-record task against the post-remediation build so the backup matches what will actually be shown.

**Tech Stack:** Production-built Next.js app (`bun run start`) · stopwatch · macOS QuickTime (or OBS) · paper copy of DEMO-SCRIPT.md.

**Phase prerequisites:** Phase 14 (pre-flight) closed with all PASS. `phase-14-preflight-YYYY-MM-DD` tag exists. `demo-backup/echoes-demo-clean-run.mp4` exists.

---

## File Structure

```
.review/
  dress-rehearsal-2026-XX-XX.md     # observations from both run-throughs + remediation log
demo-backup/
  echoes-demo-clean-run.mp4         # re-recorded after final remediation (overwrites pre-flight version)
  echoes-demo-clean-run.md          # voice-over notes updated with final timestamps
```

---

## Task 1: Set up the rehearsal environment as if it were live

**Files:** none modified — environment ritual.

- [ ] **Step 1: Open the rehearsal record**

  ```bash
  cd "/Users/krit/Desktop/04 Web & Development/Project-Echoes"
  date_stamp=$(date +%m-%d)
  touch ".review/dress-rehearsal-2026-${date_stamp}.md"
  ```

  Add a header:

  ```markdown
  # Dress rehearsal — 2026-XX-XX

  Operator: Krit
  Build commit: <git rev-parse --short HEAD>
  Pre-flight tag: phase-14-preflight-<YYYY-MM-DD>
  Demo date: <YYYY-MM-DD>

  ## Observations
  ```

  Capture the build SHA:

  ```bash
  git rev-parse --short HEAD
  ```

- [ ] **Step 2: Stage the laptop exactly as on demo day**

  Run the morning-of checklist from Phase 14 — fresh browser profile, wifi off, Do Not Disturb on, fullscreen, brightness max. The whole point is to surface anything brittle that only appears under demo conditions.

- [ ] **Step 3: Build clean and start the production server**

  ```bash
  rm -rf .next
  bun run build
  bun run start &
  START_PID=$!
  sleep 5
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
  ```

  Expected: `200`. Falls back to `npm run build && npm run start` if Bun segfaults.

- [ ] **Step 4: Confirm paper copy of DEMO-SCRIPT.md is in hand**

  Print or open on a phone. The voice cue is read from paper, not from another browser tab on the demo laptop (paper survives any laptop event).

- [ ] **Step 5: Commit**

  ```bash
  git add .review/
  git commit -m "chore(dress-rehearsal): environment staged; rehearsal record opened"
  ```

---

## Task 2: Run-through 1 — full 6 minutes, no pausing

**Files:** none modified — timed run.

- [ ] **Step 1: Start the stopwatch and the spoken script**

  Open `http://localhost:3000` in fullscreen. Start a stopwatch in another room or on your phone (NOT on the demo laptop). Start reading the spoken script aloud.

- [ ] **Step 2: Do not pause to fix anything**

  Important: this is a "perform-no-matter-what" run. If something is broken on stage, you'd have to recover live — practise that. Note what broke, keep going.

- [ ] **Step 3: Record stop time and observations**

  Stop the stopwatch when you reach the final spoken sentence ("Here's the picture."). Append to `.review/dress-rehearsal-2026-XX-XX.md`:

  ```markdown
  ## Run 1

  Time: <mm:ss>
  Target: 6:00 ± 0:15

  | Minute | What was on screen | What I said | Problems |
  |---|---|---|---|
  | 0:00 – 0:45 | <observed> | <observed> | <list any> |
  | 0:45 – 2:00 | ... | ... | ... |
  | 2:00 – 3:30 | ... | ... | ... |
  | 3:30 – 4:30 | ... | ... | ... |
  | 4:30 – 5:30 | ... | ... | ... |
  | 5:30 – 6:00 | ... | ... | ... |

  Energy: <how it felt — confident / shaky / overrun>
  ```

- [ ] **Step 4: Stop the server**

  ```bash
  kill $START_PID
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add .review/
  git commit -m "chore(dress-rehearsal): run 1 of 2 complete"
  ```

---

## Task 3: Remediation pass — fix anything that didn't land

**Files:** depends on what didn't land — may touch any phase.

- [ ] **Step 1: Triage observations from Run 1**

  For each problem listed:
  - **In-script copy issue** → edit `DEMO-SCRIPT.md`, re-run Phase 13's `check:seed` for on-stage slice mentions.
  - **Wow-moment visual stumble** → identify the component (HeroIntroTimeline, HeatmapLayer, BentoDashboard, TopicCascade), fix in that file, rebuild.
  - **Timing overrun (script ran > 6:30)** → trim the script copy, not the demo content.
  - **Timing underrun (< 5:30)** → either pad the script or accept the shorter run — under is much better than over.
  - **Filter / k-anon redaction issue** → check `src/store/filters.ts` and `<VoicesFeed>` redaction state.
  - **Layout issue at projector resolution** → fix in the affected component; retest at 1080p AND 1366×768 per Phase 14 Tasks 4-5.

- [ ] **Step 2: Apply the smallest possible fix per problem**

  YAGNI. If a problem is cosmetic and doesn't actually hurt the pitch, leave it. The bigger risk is a "fix" that introduces a new regression hours before the demo. Apply only what's necessary.

- [ ] **Step 3: Rebuild + smoke-test each change**

  ```bash
  bun run typecheck
  bun run lint
  bun run check:seed
  bun run smoke
  bun run build
  ```

  Expected: all green. If anything red, do not move on — fix or revert.

- [ ] **Step 4: Document remediations applied**

  Append to `.review/dress-rehearsal-2026-XX-XX.md`:

  ```markdown
  ## Remediations applied between Run 1 and Run 2

  - <change 1> — file:line, why
  - <change 2> — file:line, why
  - ...
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "fix(dress-rehearsal): remediations from run 1"
  ```

  Use a single commit per remediation if any one is substantial; otherwise a combined commit is fine.

---

## Task 4: Run-through 2 — full 6 minutes after remediations

**Files:** none modified — timed run.

- [ ] **Step 1: Re-stage and re-build**

  ```bash
  rm -rf .next
  bun run build
  bun run start &
  START_PID=$!
  sleep 5
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
  ```

  Expected: `200`.

- [ ] **Step 2: Run the script again, timed**

  Same protocol as Task 2. Note what landed cleanly this time and what (if anything) still wobbles.

- [ ] **Step 3: Record observations**

  Append to `.review/dress-rehearsal-2026-XX-XX.md`:

  ```markdown
  ## Run 2

  Time: <mm:ss>
  Improvement vs Run 1: <delta + qualitative>

  | Minute | Verdict | Notes |
  |---|---|---|

  Energy: <observed>
  Residual issues: <list, if any>
  ```

- [ ] **Step 4: Stop the server**

  ```bash
  kill $START_PID
  ```

- [ ] **Step 5: Decide on next steps**

  If Run 2 is clean → proceed to Task 5 (re-record backup video).

  If Run 2 still has issues → go back to Task 3 for a second remediation pass. After two remediation passes, if issues persist, **stop and use the original Phase 14 backup video as the safety net** — do not keep editing the morning of the demo.

- [ ] **Step 6: Commit**

  ```bash
  git add .review/
  git commit -m "chore(dress-rehearsal): run 2 of 2 complete"
  ```

---

## Task 5: Re-record the backup video against the post-remediation build

PLAN.md Verification: "Recorded video backup current (re-recorded after final fixes)". The video that gets played live MUST match the build that's running, in case the live build dies — visual continuity matters to the board.

**Files:**
- Modify: `demo-backup/echoes-demo-clean-run.mp4` (overwrite)
- Modify: `demo-backup/echoes-demo-clean-run.md`

- [ ] **Step 1: Start the post-remediation production server**

  ```bash
  bun run start &
  START_PID=$!
  sleep 5
  ```

- [ ] **Step 2: Start QuickTime screen recording**

  File → New Screen Recording → select the browser window only. Record.

- [ ] **Step 3: Run the script end-to-end with audio**

  Speak the script aloud at demo pace. This is what plays if everything else fails — make it polished.

- [ ] **Step 4: Stop recording, overwrite the backup file**

  Save to `demo-backup/echoes-demo-clean-run.mp4`. If QuickTime asks about overwrite, confirm.

  Verify:

  ```bash
  test -f demo-backup/echoes-demo-clean-run.mp4 && \
    echo "size: $(wc -c < demo-backup/echoes-demo-clean-run.mp4) bytes" && \
    echo "mtime: $(stat -f %Sm demo-backup/echoes-demo-clean-run.mp4)"
  ```

  Expected: size > 50MB, mtime is today.

- [ ] **Step 5: Update the voice-over notes**

  Edit `demo-backup/echoes-demo-clean-run.md`:
  - Update `Recorded:` date to today.
  - Update `Build commit:` to current SHA (`git rev-parse --short HEAD`).
  - Update `Runtime:` to the actual recorded length.
  - Note in the file: "Supersedes pre-flight recording — this is the demo-day backup."

- [ ] **Step 6: Confirm playback one final time**

  Open the file in QuickTime. Play from 0:00 to 0:30 and from 5:30 to end. Confirm video + audio land correctly across both ends.

- [ ] **Step 7: Stop server, commit**

  ```bash
  kill $START_PID
  git add demo-backup/
  git commit -m "feat(backup): re-record clean-run video against post-rehearsal build"
  ```

---

## Task 6: Final laptop seal — same state Krit walks in with

**Files:** none modified — close ritual.

- [ ] **Step 1: Build the FINAL deliverable build**

  ```bash
  rm -rf .next
  bun run build
  ```

  This is the build that runs at the demo. Do not modify any code after this point.

- [ ] **Step 2: Smoke-test it one more time**

  ```bash
  bun run start &
  START_PID=$!
  sleep 5
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
  curl -s http://localhost:3000 | grep -q 'Echoes' && echo "landing OK"
  curl -s http://localhost:3000/dashboard | grep -q 'Sample data — illustrative composite voices' && echo "DEMO DATA pill OK"
  kill $START_PID
  ```

  Expected: `200`, both `OK` lines.

- [ ] **Step 3: Confirm the backup video is in place AND current**

  ```bash
  test -f demo-backup/echoes-demo-clean-run.mp4 && \
    echo "mtime: $(stat -f %Sm demo-backup/echoes-demo-clean-run.mp4)"
  ```

  Expected: mtime is today (post-rehearsal re-record).

- [ ] **Step 4: Print the morning-of checklist**

  Print Phase 14's "Demo-day-morning checklist" section onto paper. Slip it inside the laptop case alongside the printed DEMO-SCRIPT.md.

- [ ] **Step 5: Tag the rehearsal close**

  ```bash
  git add -A
  git commit --allow-empty -m "chore(phase-15): dress rehearsal closed; build sealed for demo"
  git tag "phase-15-rehearsal-$(date +%Y-%m-%d)"
  ```

- [ ] **Step 6: Power off and rest**

  The laptop should now stay closed until the morning-of routine. Resist the urge to open it and "make one more change" — every change risks regression, and there's no time to remediate.

---

## Definition of Done

Dress rehearsal is closed when:

1. All 6 task checkboxes ticked.
2. `.review/dress-rehearsal-2026-XX-XX.md` exists with Run 1 + Run 2 observations + remediation log + Run 2 verdict CLEAN.
3. `demo-backup/echoes-demo-clean-run.mp4` mtime is today; size > 50MB; plays correctly.
4. `git tag phase-15-rehearsal-YYYY-MM-DD` points at the sealed-build commit.
5. Paper DEMO-SCRIPT.md + morning-of checklist are physically with the laptop.
6. The laptop is closed and not being edited.

## What success looks like

You walk into the boardroom. You open the laptop. You hit the keyboard once to wake it. The browser is already on `localhost:3000`, fullscreen, wifi off, paper script in your other hand. You speak for six minutes. The screen does exactly what the script says it does. Board members reach for their phones to take photos of the dashboard. The AWS Imagine Grant judges nod once at the AWS architecture closing slide. You stop talking at 5:58.

If anything goes wrong, you say "let me show you the recorded run" and play the backup video. The board sees the same demo. Nobody knows the laptop misbehaved.

## Out of scope

- Any code changes after Task 6 — the build is sealed.
- AWS architecture slide rehearsal — separate workstream, not part of the live demo runtime.
- Post-demo workstreams (production AWS build, Welsh NLP, public hosting) — these start after the grant lands.
