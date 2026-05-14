# Project Echoes — Pre-Flight + Recorded Backup Implementation Plan (Phase 14)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run the full pre-flight battery within 24 hours of the demo — offline guarantee, 1080p + 1366×768 layout, 60fps performance, Cmd+R safety from every route — and capture a recorded backup video of one clean run-through.

**Architecture:** Checklist-style validation against the production build (`bun run build && bun run start`). Every check has an explicit pass criterion and a documented fallback (`?perf=safe`, default-pitch-0°, or fall to the recorded backup video). Results are captured in `.review/pre-flight-<date>.md` for audit.

**Tech Stack:** Bun 1.1+ (npm fallback) · Next.js 15 production build · Chrome DevTools Network + Performance tabs · macOS QuickTime (or OBS) for screen recording.

**Phase prerequisites:** Phases 3–13 complete. The Next app builds cleanly, seed data passes `check:seed`, the map renders, the Playwright smoke is green.

---

## File Structure

```
.review/
  pre-flight-2026-XX-XX.md          # checklist results for this pre-flight run (one per pre-flight)
  pre-flight-perf-2026-XX-XX.json   # exported DevTools Performance recording
  pre-flight-network-2026-XX-XX.har # exported DevTools Network HAR (offline-check evidence)
demo-backup/
  echoes-demo-clean-run.mp4         # recorded video backup; must be < 24h old by demo morning
  echoes-demo-clean-run.md          # voice-over notes + timestamps for the recorded run
```

`demo-backup/` is NOT gitignored — the recorded video is the safety net; if everything else fails, Krit plays this file.

---

## Task 1: Run `check:seed` and Playwright smoke one final time

**Files:** none modified — verification only.

- [ ] **Step 1: Confirm working tree is clean**

  ```bash
  cd "/Users/krit/Desktop/04 Web & Development/Project-Echoes"
  git status
  ```

  Expected: `nothing to commit, working tree clean`. If dirty, decide per-file whether to commit or stash before proceeding — a dirty tree at pre-flight is a flag, not a blocker.

- [ ] **Step 2: Re-run seed integrity**

  ```bash
  bun run check:seed
  ```

  Expected: exit 0. If non-zero, fix before continuing — pre-flight cannot close with a failing seed check.

- [ ] **Step 3: Re-run Playwright smoke**

  ```bash
  bun run smoke
  ```

  Expected: all assertions green. If red, fix or document the regression in `.review/pre-flight-2026-XX-XX.md` before continuing.

- [ ] **Step 4: Open a fresh pre-flight record**

  Replace `XX-XX` with today's date. Create the file:

  ```bash
  date_stamp=$(date +%m-%d)
  touch ".review/pre-flight-2026-${date_stamp}.md"
  ```

  Open it and add a header:

  ```markdown
  # Pre-flight — 2026-XX-XX

  Operator: Krit
  Build commit: <git rev-parse --short HEAD>
  Demo date: <YYYY-MM-DD>

  ## Results

  | Task | Result | Notes |
  |---|---|---|
  ```

  Capture the git short SHA in the header:

  ```bash
  git rev-parse --short HEAD
  ```

- [ ] **Step 5: Commit the pre-flight record stub**

  ```bash
  git add ".review/pre-flight-2026-${date_stamp}.md"
  git commit -m "chore(pre-flight): open pre-flight record for $(date +%Y-%m-%d)"
  ```

---

## Task 2: Build the production app with wifi ON

PLAN.md Critical Rule 5: build with wifi ON (`next/font/google` + tile/asset scripts need internet); demo with wifi OFF. This task locks the build into `.next/`.

**Files:** none modified — build only.

- [ ] **Step 1: Verify wifi is ON**

  ```bash
  networksetup -getairportpower en0
  ```

  Expected: `Wi-Fi Power (en0): On`. If `Off`, turn it on in System Settings before continuing.

- [ ] **Step 2: Clean previous build**

  ```bash
  rm -rf .next
  ```

- [ ] **Step 3: Run the production build**

  ```bash
  bun run build
  ```

  Expected: build exits 0, route table includes `/`, `/dashboard`, `/topic/[slug]`, `/action`, `/about`.

  If Bun segfaults (documented risk per PLAN.md), fall back:

  ```bash
  npm run build
  ```

  Capture which command worked in the pre-flight record.

- [ ] **Step 4: Confirm fonts and tiles are present in the build**

  ```bash
  find .next/static/media -name '*.woff2' | wc -l
  test -f public/wales.pmtiles && echo "tiles OK"
  test -d public/basemaps-assets && echo "basemaps assets OK"
  test -f public/basemaps-style.json && echo "style JSON OK"
  ```

  Expected: woff2 count ≥ 3; all three OK lines print.

- [ ] **Step 5: Commit pre-flight record update**

  Append to `.review/pre-flight-2026-XX-XX.md`:

  ```
  | Task 2 — Production build | PASS | bun OR npm worked; fonts/tiles/style JSON all present |
  ```

  ```bash
  git add .review/
  git commit -m "chore(pre-flight): production build clean"
  ```

---

## Task 3: Verify the offline guarantee (wifi OFF + Network tab empty)

PLAN.md Critical Rule 5 + 19: the offline guarantee is the demo's reliability spine.

**Files:** none modified — verification only.

- [ ] **Step 1: Start the production server**

  ```bash
  bun run start &
  START_PID=$!
  sleep 5
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
  ```

  Expected: `200`. If non-200, the build is broken — go back to Task 2.

- [ ] **Step 2: Turn wifi OFF**

  ```bash
  networksetup -setairportpower en0 off
  networksetup -getairportpower en0
  ```

  Expected: `Wi-Fi Power (en0): Off`.

- [ ] **Step 3: Open Chrome with a clean profile, open DevTools Network tab, then visit each route**

  Manual browser steps:
  1. Open Chrome with a fresh window (or `--user-data-dir=/tmp/echoes-preflight`).
  2. Open DevTools → Network tab.
  3. Click "Disable cache" (so any cached requests show up rather than 304).
  4. Visit `http://localhost:3000/`. Wait for full render.
  5. Verify: zero requests to `fonts.googleapis.com`, `fonts.gstatic.com`, `protomaps.github.io`, `unpkg.com`, `cdn.*`, or any non-`localhost` host. The "Failed" column may show 0; all entries must be `localhost:3000`.
  6. Repeat for `/dashboard`, `/topic/housing`, `/action`, `/about`.
  7. Export the Network panel as HAR: right-click → "Save all as HAR with content" → save to `.review/pre-flight-network-2026-XX-XX.har`.

- [ ] **Step 4: Verify the map renders fully offline**

  Still in the browser (wifi off), on `/dashboard`:
  - Labels visible on the map (Cardiff, Swansea, Newport, Wrexham). If labels missing, glyph PBFs were not self-hosted — go back to Phase 5 plan and fix `fetch-assets`.
  - Building extrusion visible at zoom ≥ 14 over Cardiff. If buildings absent, check `.review/building-coverage.md` to see whether Path A or Path B was chosen and whether the Path B fallback is correctly wired.
  - Heat-map visible across populated Wales (not 7 stacked blobs — that means the jitter in `src/lib/heatmap.ts` is broken).

- [ ] **Step 5: Turn wifi back ON, stop the server**

  ```bash
  networksetup -setairportpower en0 on
  kill $START_PID
  ```

- [ ] **Step 6: Record result + commit**

  Append to `.review/pre-flight-2026-XX-XX.md`:

  ```
  | Task 3 — Offline guarantee | PASS / FAIL | HAR exported to pre-flight-network-2026-XX-XX.har; zero external hosts observed |
  ```

  ```bash
  git add .review/
  git commit -m "chore(pre-flight): offline guarantee verified — HAR captured"
  ```

  **Gate:** if FAIL, do not proceed. The whole demo depends on this.

---

## Task 4: Verify 1080p projector layout

PLAN.md "Polish checklist" + Critical Rule 17. 1080p is the target resolution.

**Files:** none modified — verification only.

- [ ] **Step 1: Resize the browser to exactly 1920×1080**

  In Chrome DevTools → Toggle device toolbar (Cmd+Shift+M) → Responsive → set Width 1920, Height 1080, Device pixel ratio 1.

- [ ] **Step 2: Visually inspect every route at 1080p**

  Visit `/`, `/dashboard`, `/topic/housing`, `/action`, `/about`. Verify:
  - `<EchoesHeader>` brand lockup is 96px+ tall and the 'V'-width clear zone is visible.
  - DEMO DATA pill visible on every route (top-right of header).
  - Typography readable from ~3m distance simulation (zoom out to 50% in DevTools, text still legible suggests projector clarity).
  - No horizontal scrollbars.
  - Bento dashboard tiles visible without overflow.
  - Map fills its grid area at default 45° pitch on `/dashboard`, 0° pitch on `/topic/housing`.

- [ ] **Step 3: Record result + commit**

  ```
  | Task 4 — 1080p layout | PASS / FAIL | <notes on any layout issues> |
  ```

  ```bash
  git add .review/
  git commit -m "chore(pre-flight): 1080p layout verified"
  ```

---

## Task 5: Verify 1366×768 fallback layout

PLAN.md "Polish checklist": the topic-click cascade is specifically retested at 1366×768.

**Files:** none modified — verification only.

- [ ] **Step 1: Resize to 1366×768**

  DevTools → Responsive → Width 1366, Height 768.

- [ ] **Step 2: Visually inspect every route**

  Same checks as Task 4 plus:
  - Bento tiles must not overflow horizontally.
  - Voice cards in `<VoicesFeed>` must remain readable.
  - `<DataProvenancePanel>` numbers must not wrap awkwardly.

- [ ] **Step 3: Specifically retest the topic-click cascade**

  Click a topic chip on `/dashboard` (e.g., Housing). Verify the View Transition / Framer Motion `layoutId` morph still lands inside the smaller viewport. The chip should travel cleanly to its new position in the topic page header; no flicker, no off-screen jumps.

- [ ] **Step 4: Record result + commit**

  ```
  | Task 5 — 1366×768 fallback | PASS / FAIL | Topic cascade behaviour: <notes> |
  ```

  ```bash
  git add .review/
  git commit -m "chore(pre-flight): 1366x768 fallback layout + cascade verified"
  ```

  If cascade is broken at 1366×768, fall back to disabling View Transitions in `?perf=safe` mode (Phase 12) and document.

---

## Task 6: Performance recording — 60fps target across every wow moment

PLAN.md Critical Rule 17: ≥58fps (≤17ms/frame) on the dashboard map + topic drill-in.

**Files:** `.review/pre-flight-perf-2026-XX-XX.json`

- [ ] **Step 1: Start the production server**

  ```bash
  bun run start &
  START_PID=$!
  sleep 5
  ```

- [ ] **Step 2: Open DevTools Performance tab, profile the dashboard load**

  Browser steps:
  1. Open `http://localhost:3000/`.
  2. DevTools → Performance → Record.
  3. Click "Enter dashboard" CTA, wait for full render including heatmap fade-in + Bento entrance.
  4. Stop recording.
  5. Inspect the Frames row. **PASS:** ≥ 58fps sustained; no spike below 50fps. **FAIL:** any sustained drop below 50fps.
  6. Save the profile: right-click in the Performance panel → "Save profile" → `.review/pre-flight-perf-2026-XX-XX-dashboard.json`.

- [ ] **Step 3: Profile a topic drill-in**

  1. With Performance still open, click Record.
  2. Click any topic chip (e.g., Housing).
  3. Wait for the cascade to settle.
  4. Stop recording.
  5. Verify frame chart shows ≤17ms/frame throughout the transition.
  6. Save profile: `.review/pre-flight-perf-2026-XX-XX-topic.json`.

- [ ] **Step 4: Profile a map pitch/rotate interaction**

  1. Record. Drag-rotate the map for ~3 seconds.
  2. Stop. Verify ≤17ms/frame.
  3. Save profile: `.review/pre-flight-perf-2026-XX-XX-map.json`.

- [ ] **Step 5: Stop the server**

  ```bash
  kill $START_PID
  ```

- [ ] **Step 6: Record result + commit**

  ```
  | Task 6 — 60fps performance | PASS / FAIL | <fps observations per recording> |
  ```

  ```bash
  git add .review/
  git commit -m "chore(pre-flight): performance recordings captured at 60fps target"
  ```

  If FAIL, document the bottleneck and switch the demo to `?perf=safe` (Phase 12) for the live run — re-record perf for `?perf=safe` to confirm it lands at 60fps.

---

## Task 7: Tile coverage confirmation (3D buildings render visibly)

PLAN.md Critical Rule 18.

**Files:** none modified — verification only.

- [ ] **Step 1: Start server, open `/dashboard`**

  ```bash
  bun run start &
  START_PID=$!
  sleep 5
  ```

  Open `http://localhost:3000/dashboard` in the browser.

- [ ] **Step 2: Zoom to ≥ 14 over Cardiff, Swansea, Newport, Wrexham — confirm buildings visible**

  Use the MapControls "fly to" buttons if available, else manual pan-and-zoom.

  - Cardiff (CF10): buildings visible? Y/N
  - Swansea (SA1): Y/N
  - Newport (NP19): Y/N
  - Wrexham (LL11): Y/N

  If any are N, check `.review/building-coverage.md` for Path A vs B decision. If Path A was chosen but coverage turned out sparse, fall back to Path B by re-opening `<WalesMap>` and toggling the centroid extrusion implementation — but only as a last resort, since Path B is uglier than Path A.

- [ ] **Step 3: Stop server**

  ```bash
  kill $START_PID
  ```

- [ ] **Step 4: Record result + commit**

  ```
  | Task 7 — Tile coverage | PASS / FAIL | Cardiff/Swansea/Newport/Wrexham building visibility |
  ```

  ```bash
  git add .review/
  git commit -m "chore(pre-flight): tile coverage confirmed"
  ```

---

## Task 8: Cmd+R safety from every route

PLAN.md Critical Rule 15: no `persist` middleware in Zustand → Cmd+R must reset filter state cleanly. Critical Rule 16: demo runs against production build.

**Files:** none modified — verification only.

- [ ] **Step 1: Start server**

  ```bash
  bun run start &
  START_PID=$!
  sleep 5
  ```

- [ ] **Step 2: For each route, apply filters, then Cmd+R; verify reset**

  Routes to test: `/`, `/dashboard`, `/topic/housing`, `/action`, `/about`.

  For each route:
  1. Open the route.
  2. Open `<QuickFilters>` (if present on that route) and toggle 2-3 filters.
  3. Verify filters apply.
  4. Press Cmd+R (or F5).
  5. After reload, verify filters are CLEARED (no chips, no active selections). If filters persist, `persist` middleware was accidentally added or store hydrates from storage — investigate `src/store/filters.ts`.
  6. Verify the route renders cleanly without console errors. Counter re-ticks on `/`.

- [ ] **Step 3: Stop server**

  ```bash
  kill $START_PID
  ```

- [ ] **Step 4: Record result + commit**

  ```
  | Task 8 — Cmd+R safety | PASS / FAIL | All 5 routes reset cleanly |
  ```

  ```bash
  git add .review/
  git commit -m "chore(pre-flight): Cmd+R safety verified from every route"
  ```

---

## Task 9: First full 6-minute end-to-end run

PLAN.md Verification "Full 6-min script run twice end-to-end without stumbling". This is run 1 of 2.

**Files:** none modified — verification only.

- [ ] **Step 1: Open DEMO-SCRIPT.md alongside the running demo**

  ```bash
  bun run start &
  START_PID=$!
  sleep 5
  ```

  Open `http://localhost:3000` in fullscreen. Open `DEMO-SCRIPT.md` on a second monitor or phone.

- [ ] **Step 2: Run through the entire 6-minute script aloud**

  Time it. Note where the screen falls behind the spoken cue, or vice versa. Note any visual stumble — a panel that takes too long to render, a chart that flickers, a region marker that doesn't appear when expected.

- [ ] **Step 3: Stop server**

  ```bash
  kill $START_PID
  ```

- [ ] **Step 4: Note observations**

  Append to `.review/pre-flight-2026-XX-XX.md`:

  ```
  ## Run 1 observations
  - Time: <mm:ss>
  - Stumbles: <list>
  - Visual issues: <list>
  - Script issues: <list>
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add .review/
  git commit -m "chore(pre-flight): run 1 of 2 complete"
  ```

---

## Task 10: Second full 6-minute end-to-end run

- [ ] **Step 1: Start server again**

  ```bash
  bun run start &
  START_PID=$!
  sleep 5
  ```

- [ ] **Step 2: Run through the script aloud again**

  Same observations. If any issue from run 1 has not been fixed yet, note that it persists.

- [ ] **Step 3: Stop server**

  ```bash
  kill $START_PID
  ```

- [ ] **Step 4: Note observations + decide on remediation**

  Append to `.review/pre-flight-2026-XX-XX.md`:

  ```
  ## Run 2 observations
  - Time: <mm:ss>
  - Stumbles: <list>
  - Remediations to apply before record: <list>
  ```

  If any remediation is needed, apply it now (small code fix), rebuild, and repeat Task 9 + Task 10 once. If big remediation needed, stop and re-plan.

- [ ] **Step 5: Commit**

  ```bash
  git add .review/
  git commit -m "chore(pre-flight): run 2 of 2 complete; remediations applied"
  ```

---

## Task 11: Record the backup video

The "last resort" plays if the laptop dies, the projector fails, or wifi-off mode somehow regresses. PLAN.md Verification: "Recorded video backup current (re-recorded after final fixes)".

**Files:**
- Create: `demo-backup/echoes-demo-clean-run.mp4`
- Create: `demo-backup/echoes-demo-clean-run.md`

- [ ] **Step 1: Create demo-backup directory**

  ```bash
  mkdir -p demo-backup
  ```

- [ ] **Step 2: Start the production server in a clean state**

  ```bash
  bun run start &
  START_PID=$!
  sleep 5
  ```

  Open `http://localhost:3000` in a fresh fullscreen browser window. Clear any active filters.

- [ ] **Step 3: Start screen recording**

  macOS QuickTime → File → New Screen Recording → select the browser window only (not full screen — keeps file size down and excludes OS chrome).

  Begin recording. Then begin the 6-minute spoken script.

- [ ] **Step 4: Run the script end-to-end**

  Follow DEMO-SCRIPT.md exactly. Speak aloud (microphone optional — sometimes Krit prefers a silent visual-only backup so it can be voiced over live if needed).

- [ ] **Step 5: Stop recording, save the file**

  ```
  File → Save → demo-backup/echoes-demo-clean-run.mp4
  ```

  Verify file size > 50MB (a 6-minute screen recording at reasonable quality lands in the 50-200MB range).

- [ ] **Step 6: Create voice-over note file**

  Create `demo-backup/echoes-demo-clean-run.md`:

  ```markdown
  # Echoes Demo — Clean Run Backup

  Recorded: 2026-XX-XX (re-record on every change to DEMO-SCRIPT.md or any wow moment)
  Operator: Krit
  Runtime: <mm:ss>
  Build commit: <git rev-parse --short HEAD>
  Audio: <with/without voice-over>

  ## Use cases for this backup

  1. Projector or laptop dies live — open the .mp4, play through QuickTime, voice-over live.
  2. Wifi-off mode regresses unexpectedly (cached browser somehow needs network) — same.
  3. A wow moment crashes or freezes — same.

  ## Cue points

  - 0:00 — Landing hero
  - 0:45 — Dashboard reveal
  - 2:00 — Housing topic click
  - 3:30 — YPAB priority statement
  - 4:30 — Quick-filters cascade
  - 5:30 — Close + AWS architecture slide
  ```

  Replace `<mm:ss>` and `<git rev-parse --short HEAD>` with actual values.

- [ ] **Step 7: Stop server**

  ```bash
  kill $START_PID
  ```

- [ ] **Step 8: Confirm playback**

  Open `demo-backup/echoes-demo-clean-run.mp4` in QuickTime. Play the first 30 seconds and the last 30 seconds — confirm video + audio land correctly. If anything broken, re-record.

- [ ] **Step 9: Commit**

  ```bash
  git add demo-backup/
  git commit -m "feat(backup): recorded clean-run video + voice-over notes"
  ```

  Note: this commits a large binary into git. If repo size becomes a concern, switch to Git LFS for `*.mp4` — but for a single 6-minute backup, plain git is fine for now.

---

## Task 12: Phase 14 close + tag

**Files:** none modified — close ritual.

- [ ] **Step 1: Review the pre-flight record one last time**

  ```bash
  cat ".review/pre-flight-2026-$(date +%m-%d).md"
  ```

  Every task must show PASS. If any shows FAIL with no documented fallback applied, do NOT close pre-flight — fix or escalate.

- [ ] **Step 2: Confirm backup video is in place**

  ```bash
  test -f demo-backup/echoes-demo-clean-run.mp4 && \
    echo "backup video size: $(wc -c < demo-backup/echoes-demo-clean-run.mp4) bytes"
  ```

  Expected: file exists, > 50MB.

- [ ] **Step 3: Final clean build + start**

  ```bash
  rm -rf .next
  bun run build
  bun run start &
  START_PID=$!
  sleep 5
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
  kill $START_PID
  ```

  Expected: build clean, server serves `200`. This is the EXACT state Krit will demo from.

- [ ] **Step 4: Tag the pre-flight close**

  ```bash
  git add -A
  git commit --allow-empty -m "chore(phase-14): pre-flight close — all checks PASS; backup video recorded"
  git tag "phase-14-preflight-$(date +%Y-%m-%d)"
  ```

- [ ] **Step 5: Stage final demo laptop**

  Print a paper copy of `DEMO-SCRIPT.md` and tape it to the laptop palm-rest. The paper script is the last fallback.

---

## Demo-day-morning checklist

This runs the morning of the demo (NOT the pre-flight phase). Treat it as a separate ritual.

- [ ] Battery ≥ 80% — `pmset -g batt` shows ≥ 80%.
- [ ] Projector cable confirmed (USB-C → HDMI/DisplayPort/VGA per venue spec) packed.
- [ ] Wifi OFF / airplane mode ON.
- [ ] Sleep / display-off disabled — `caffeinate` running.
- [ ] Do Not Disturb on; notifications silenced.
- [ ] Screen brightness max.
- [ ] HiDPI scaling sensible for projector.
- [ ] Fresh browser profile / private window — no autofill, no extensions.
- [ ] Browser zoom reset to 100%.
- [ ] DevTools closed; F12 / Cmd+Opt+I risk noted (don't accidentally shortcut).
- [ ] Production server running — `bun run start`, NOT `next dev`.
- [ ] `http://localhost:3000` open in fresh fullscreen window.
- [ ] Backup video file on desktop, double-clickable.
- [ ] Paper copy of `DEMO-SCRIPT.md` on the palm-rest.
- [ ] Cmd+R confirmed safe — exercised once from each of `/`, `/dashboard`, `/topic/housing`, `/action`, `/about` before stepping into the room.

---

## Definition of Done

Pre-flight is closed when:

1. All 12 task checkboxes ticked.
2. `.review/pre-flight-2026-XX-XX.md` shows PASS on every line.
3. `.review/pre-flight-network-2026-XX-XX.har` and the three `pre-flight-perf-*.json` files committed.
4. `demo-backup/echoes-demo-clean-run.mp4` exists, plays, < 24h old.
5. `git tag phase-14-preflight-YYYY-MM-DD` points at a green build.
6. The demo-day-morning checklist is printed and ready to run on demo morning.

## Out of scope

- The dress rehearsal itself (Phase 15) — that runs after pre-flight, the day before or morning of the demo.
- Code fixes that emerge during pre-flight — they get committed against earlier phases, then pre-flight re-runs.
- AWS architecture slide rehearsal (post-demo workstream).
