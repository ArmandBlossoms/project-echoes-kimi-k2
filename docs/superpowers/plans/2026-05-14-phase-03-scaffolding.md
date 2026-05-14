# Project Echoes — Scaffolding Implementation Plan (Phase 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Next.js 15 + Bun + Tailwind 4 + shadcn/ui + VFCC tokens + brand chrome (EchoesHeader, DemoDataBadge) so subsequent phases can build dashboard panels into a working, themed shell.

**Architecture:** App Router Next.js 15 project. Tailwind 4 CSS-first (no `tailwind.config.js`). shadcn/ui re-themed by mapping its CSS variables onto VFCC semantic tokens in `globals.css`. Fonts self-hosted via `next/font/google` at build time. Dark theme by default via `<html data-theme="dark">`. Two brand-chrome components built and wired into the root layout.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Bun · Tailwind CSS 4 · shadcn/ui · `next/font/google` (Instrument Sans + Shrikhand + JetBrains Mono) · Biome · VFCC Design System tokens.

**Scope boundary:** This plan covers PLAN.md Phase 3 only. Phases 1 (storyboard) and 2 (visual direction lock) produce design artefacts, not code, and are handled by the `brainstorming` and `frontend-design` skills. Phases 4–15 each get their own plan.

**Source of truth:** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/PLAN.md` + `CLAUDE.md`. Read both before starting.

**Working directory:** `/Users/krit/Desktop/04 Web & Development/Project-Echoes/`

---

## File Structure (created in this plan)

```
package.json                          # bun-managed; scripts: dev, build, start, typecheck, lint, lint:fix
tsconfig.json                         # Next default + strict
next.config.ts                        # minimal; reactStrictMode true
postcss.config.mjs                    # @tailwindcss/postcss only
biome.json                            # formatter + linter rules
components.json                       # shadcn config (Tailwind 4, RSC enabled, baseColor neutral)
.gitignore                            # node_modules/, .next/, public/wales.pmtiles, .private/, .env*
src/
  app/
    layout.tsx                        # html[data-theme=dark]; loads 3 fonts; renders <EchoesHeader>
    page.tsx                          # placeholder landing — "Echoes — Voices of care-experienced Wales"
    globals.css                       # @import tailwindcss; @import vfcc-tokens; shadcn-var → VFCC mapping
  components/
    echoes-header.tsx                 # bilingual brand lockup + <DemoDataBadge>
    demo-data-badge.tsx               # "Sample data — illustrative composite voices" pill, brand motif
  styles/
    vfcc-tokens.css                   # copy of VFCC design-system tokens, googleapis @import stripped
public/
  vfcc-logo.png                       # copied from VFCC Design System assets
```

**Out of scope for this plan:** dashboard panels, map, charts, seed data, animations, R3F sculpture, view transitions. Those belong to phases 4 onward.

---

## Pre-flight (do once before Task 1)

- [ ] Verify the working directory is the empty Project-Echoes root with only `PLAN.md`, `CLAUDE.md`, `.review/`, `.git/`, `.gitignore`:

  ```bash
  cd "/Users/krit/Desktop/04 Web & Development/Project-Echoes"
  ls -A
  ```

  Expected: `.git  .gitignore  .review  CLAUDE.md  PLAN.md  docs` (this plan file lives in `docs/`).

- [ ] Verify VFCC Design System source files exist:

  ```bash
  test -f "/Users/krit/Desktop/03 Design & Assets/VFCC Design System/colors_and_type.css" && echo "tokens OK"
  test -f "/Users/krit/Desktop/03 Design & Assets/VFCC Design System/assets/vfcc-logo-full.png" && echo "logo OK"
  ```

  Expected: both lines print.

- [ ] Verify Bun ≥ 1.1 and Node ≥ 20:

  ```bash
  bun --version
  node --version
  ```

- [ ] Confirm wifi is ON for this phase — `next/font/google` and `bunx create-next-app` need internet at build/install time (per Critical Rule 5).

---

## Task 1: Initialise Next.js 15 + TypeScript with Bun

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `postcss.config.mjs`, `.gitignore`

- [ ] **Step 1: Run create-next-app into the current directory**

  ```bash
  cd "/Users/krit/Desktop/04 Web & Development/Project-Echoes"
  bunx create-next-app@latest . \
    --typescript \
    --app \
    --tailwind \
    --src-dir \
    --no-eslint \
    --import-alias "@/*" \
    --use-bun \
    --no-turbopack \
    --yes
  ```

  Notes:
  - `--no-eslint` because we use Biome (Task 5).
  - `--no-turbopack` for dev; Bun + Next 15 Turbopack HMR is flaky per PLAN.md.
  - Answer "yes" to overwriting the existing directory contents IF prompted (the only existing files are `PLAN.md`, `CLAUDE.md`, `.review/`, `docs/`, `.gitignore`, `.git/`; create-next-app won't touch the dot-folders or the existing `.md` files but verify after).

- [ ] **Step 2: Verify create-next-app left existing files intact**

  ```bash
  ls PLAN.md CLAUDE.md .review docs
  ```

  Expected: all four exist. If `PLAN.md` or `CLAUDE.md` was overwritten, restore from git: `git checkout PLAN.md CLAUDE.md`.

- [ ] **Step 3: Confirm scaffold contents**

  ```bash
  ls src/app
  cat package.json | grep -E '"(next|react|typescript)"'
  ```

  Expected:
  - `src/app` contains `layout.tsx`, `page.tsx`, `globals.css`, `favicon.ico`.
  - `next` is `^15.x`, `react` is `^19.x`, `typescript` is `^5.x`.

- [ ] **Step 4: Append project-specific entries to `.gitignore`**

  Open `.gitignore` and append these lines if not already present (the existing project-root `.gitignore` may have some; merge — do not overwrite):

  ```
  # Project Echoes additions
  public/wales.pmtiles
  public/basemaps-assets/
  .private/
  .env*
  .review/seed-check.log
  ```

- [ ] **Step 5: Boot the dev server and verify it serves**

  ```bash
  bun run dev &
  DEV_PID=$!
  sleep 6
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
  kill $DEV_PID
  ```

  Expected: `200`.

- [ ] **Step 6: Commit**

  ```bash
  git add -A
  git commit -m "feat(scaffold): init Next.js 15 + Bun + TypeScript app"
  ```

---

## Task 2: Confirm Tailwind 4 CSS-first config is correct

`create-next-app --tailwind` in 2026 ships Tailwind 4 by default. This task verifies it and removes any legacy `tailwind.config.*` if create-next-app produced one (Tailwind 4 is CSS-first, per Critical Rule from PLAN.md).

**Files:**
- Modify: `src/app/globals.css`
- Delete (if present): `tailwind.config.ts`, `tailwind.config.js`

- [ ] **Step 1: Check Tailwind version and config files**

  ```bash
  cat package.json | grep -E '"tailwindcss"|"@tailwindcss/postcss"'
  ls tailwind.config.* 2>/dev/null
  ```

  Expected:
  - `"tailwindcss": "^4.x"`
  - `"@tailwindcss/postcss": "^4.x"`
  - No `tailwind.config.*` file (Tailwind 4 doesn't use one).

- [ ] **Step 2: If a `tailwind.config.*` exists, delete it**

  ```bash
  rm -f tailwind.config.ts tailwind.config.js tailwind.config.mjs tailwind.config.cjs
  ```

- [ ] **Step 3: Verify `postcss.config.mjs` uses `@tailwindcss/postcss`**

  Open `postcss.config.mjs`. It should look like:

  ```js
  const config = {
    plugins: ["@tailwindcss/postcss"],
  };
  export default config;
  ```

  If different, replace with the above.

- [ ] **Step 4: Verify `src/app/globals.css` uses Tailwind 4 import**

  Open `src/app/globals.css`. The first non-comment line must be:

  ```css
  @import "tailwindcss";
  ```

  Remove any leftover `@tailwind base;` / `@tailwind components;` / `@tailwind utilities;` (Tailwind 3 syntax).

- [ ] **Step 5: Sanity-check a utility class**

  Replace the body of `src/app/page.tsx` with:

  ```tsx
  export default function Page() {
    return <main className="p-8 text-2xl font-semibold">Echoes</main>;
  }
  ```

  Then:

  ```bash
  bun run dev &
  DEV_PID=$!
  sleep 6
  curl -s http://localhost:3000 | grep -q 'Echoes' && echo "render OK"
  kill $DEV_PID
  ```

  Expected: `render OK`.

- [ ] **Step 6: Commit**

  ```bash
  git add -A
  git commit -m "chore(scaffold): confirm Tailwind 4 CSS-first config"
  ```

---

## Task 3: Initialise shadcn/ui (Tailwind 4, config path BLANK)

**Files:**
- Create: `components.json`, `src/lib/utils.ts` (shadcn adds this)
- Modify: `src/app/globals.css` (shadcn appends its CSS vars)

- [ ] **Step 1: Run shadcn init**

  ```bash
  bunx shadcn@latest init
  ```

  Answer the prompts:
  - **"Which style would you like to use?"** → `New York` (denser, fits VFCC compact-data feel).
  - **"Which color would you like to use as base color?"** → `Neutral` (we'll override to VFCC tokens in Task 8).
  - **"Where is your Tailwind config?"** → **LEAVE BLANK and press Enter.** Per PLAN.md Stack rule: Tailwind 4 is CSS-first; entering a path triggers the "no config found" error and the LLM may auto-downgrade to Tailwind 3. **DO NOT type a path here.**
  - **"Configure import alias?"** → accept defaults (`@/components`, `@/lib/utils`).
  - **"Use CSS variables for theming?"** → `Yes` (required so we can remap to VFCC tokens).
  - **"Use React Server Components?"** → `Yes`.

- [ ] **Step 2: Verify shadcn outputs**

  ```bash
  test -f components.json && echo "components.json OK"
  test -f src/lib/utils.ts && echo "utils.ts OK"
  grep -q ':root' src/app/globals.css && echo "shadcn vars added"
  ```

  Expected: all three lines print.

- [ ] **Step 3: Install one shadcn component to prove the wiring works**

  ```bash
  bunx shadcn@latest add button
  test -f src/components/ui/button.tsx && echo "button OK"
  ```

  Expected: `button OK`.

- [ ] **Step 4: Smoke-test the button renders**

  Temporarily add a Button to `src/app/page.tsx`:

  ```tsx
  import { Button } from "@/components/ui/button";

  export default function Page() {
    return (
      <main className="p-8 text-2xl font-semibold">
        Echoes
        <Button className="ml-4">Test</Button>
      </main>
    );
  }
  ```

  Then:

  ```bash
  bun run dev &
  DEV_PID=$!
  sleep 6
  curl -s http://localhost:3000 | grep -q 'Test' && echo "shadcn render OK"
  kill $DEV_PID
  ```

  Expected: `shadcn render OK`.

- [ ] **Step 5: Revert page.tsx to placeholder (Button stays installed, just not used yet)**

  Set `src/app/page.tsx` back to:

  ```tsx
  export default function Page() {
    return <main className="p-8 text-2xl font-semibold">Echoes</main>;
  }
  ```

- [ ] **Step 6: Commit**

  ```bash
  git add -A
  git commit -m "feat(scaffold): init shadcn/ui (Tailwind 4 CSS-first)"
  ```

---

## Task 4: Configure `next/font/google` for Instrument Sans + Shrikhand + JetBrains Mono

Self-hosted at build time. No runtime CDN fetch (Critical Rule 5).

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace `src/app/layout.tsx` with the font-wired version**

  ```tsx
  import type { Metadata } from "next";
  import { Instrument_Sans, Shrikhand, JetBrains_Mono } from "next/font/google";
  import "./globals.css";

  const instrumentSans = Instrument_Sans({
    subsets: ["latin", "latin-ext"],
    display: "swap",
    variable: "--font-ui",
    weight: ["400", "500", "600", "700"],
  });

  const shrikhand = Shrikhand({
    subsets: ["latin", "latin-ext"],
    display: "swap",
    variable: "--font-display",
    weight: "400",
  });

  const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-mono",
    weight: ["400", "500", "700"],
  });

  export const metadata: Metadata = {
    title: "Echoes — Voices of care-experienced Wales",
    description:
      "A demo dashboard surfacing the voices of care-experienced children and young people in Wales. Built for the Voices From Care Cymru (VFCC) board and the AWS Imagine Grant 2026.",
  };

  export default function RootLayout({
    children,
  }: Readonly<{ children: React.ReactNode }>) {
    return (
      <html
        lang="en"
        data-theme="dark"
        className={`${instrumentSans.variable} ${shrikhand.variable} ${jetbrainsMono.variable}`}
      >
        <body className="font-[family-name:var(--font-ui)] antialiased">
          {children}
        </body>
      </html>
    );
  }
  ```

  Note: Both Shrikhand and Instrument Sans include `latin-ext` for Welsh circumflexes (ŵ ŷ) per PLAN.md.

- [ ] **Step 2: Build to force font download at build time**

  ```bash
  bun run build
  ```

  Expected: build succeeds. If Bun segfaults (documented risk in PLAN.md), fall back:

  ```bash
  npm run build
  ```

  Either way the build must complete with no font-fetch errors.

- [ ] **Step 3: Verify fonts are self-hosted in the build output**

  ```bash
  find .next/static/media -name '*.woff2' | head -5
  ```

  Expected: at least 3 `.woff2` files listed (one per font family).

- [ ] **Step 4: Verify dev server still boots and serves**

  ```bash
  bun run dev &
  DEV_PID=$!
  sleep 6
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
  kill $DEV_PID
  ```

  Expected: `200`.

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat(scaffold): self-host Instrument Sans + Shrikhand + JetBrains Mono via next/font/google"
  ```

---

## Task 5: Install and configure Biome (lint + format)

**Files:**
- Create: `biome.json`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Install Biome as a dev dependency**

  ```bash
  bun add -d @biomejs/biome
  ```

- [ ] **Step 2: Initialise biome.json**

  ```bash
  bunx @biomejs/biome init
  ```

  This creates `biome.json` with sensible defaults.

- [ ] **Step 3: Replace `biome.json` with project-tuned config**

  ```json
  {
    "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
    "files": {
      "ignoreUnknown": true,
      "includes": [
        "**/*.ts",
        "**/*.tsx",
        "**/*.js",
        "**/*.jsx",
        "**/*.json",
        "**/*.css",
        "!**/.next/**",
        "!**/node_modules/**",
        "!**/public/**",
        "!**/.review/**"
      ]
    },
    "formatter": {
      "enabled": true,
      "indentStyle": "space",
      "indentWidth": 2,
      "lineWidth": 100
    },
    "linter": {
      "enabled": true,
      "rules": {
        "recommended": true,
        "style": {
          "useImportType": "warn"
        }
      }
    },
    "javascript": {
      "formatter": {
        "quoteStyle": "double",
        "semicolons": "always",
        "trailingCommas": "all"
      }
    }
  }
  ```

- [ ] **Step 4: Add scripts to `package.json`**

  Open `package.json`. Replace the `"scripts"` block with:

  ```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "biome check .",
    "lint:fix": "biome check --write ."
  }
  ```

  (The remaining scripts — `check:seed`, `fetch-tiles`, `fetch-assets`, `smoke` — are added in later phases. Per PLAN.md "scripts mirrored in package.json", we add them when their script files exist.)

- [ ] **Step 5: Run lint + typecheck — both must pass clean**

  ```bash
  bun run lint
  bun run typecheck
  ```

  Expected: both exit 0. If Biome flags create-next-app's generated files, run `bun run lint:fix` once and re-run `bun run lint`. If lint still fails after fix, investigate before continuing — do not silence with broad ignores.

- [ ] **Step 6: Commit**

  ```bash
  git add -A
  git commit -m "chore(scaffold): add Biome linter + formatter, wire scripts"
  ```

---

## Task 6: Copy VFCC tokens CSS into the project (strip googleapis @import)

PLAN.md Critical Rule 5: never `@import url('googleapis.com/...')` — runtime CDN fetch breaks the offline guarantee. The source `colors_and_type.css` has one at line 1; this task strips it during the copy.

**Files:**
- Create: `src/styles/vfcc-tokens.css`

- [ ] **Step 1: Create the target directory**

  ```bash
  mkdir -p src/styles
  ```

- [ ] **Step 2: Copy the tokens CSS, stripping the googleapis @import line**

  ```bash
  tail -n +2 "/Users/krit/Desktop/03 Design & Assets/VFCC Design System/colors_and_type.css" \
    > src/styles/vfcc-tokens.css
  ```

  (`tail -n +2` starts at line 2 — the `@import url('https://fonts.googleapis.com/...')` is on line 1 and is the only line that needs stripping. Fonts are loaded via `next/font/google` in `layout.tsx` instead, so the @import is replaced, not just removed.)

- [ ] **Step 3: Verify the @import is gone**

  ```bash
  grep -n 'googleapis' src/styles/vfcc-tokens.css || echo "clean"
  ```

  Expected: `clean`.

- [ ] **Step 4: Verify the semantic tokens we depend on are present**

  ```bash
  grep -nE '^\s*--(bg|fg-1|surface|border-ink|brand|shadow-offset|radius)' \
    src/styles/vfcc-tokens.css | head -15
  ```

  Expected: matches for `--bg`, `--fg-1`, `--surface`, `--border-ink`, `--brand`, `--shadow-offset`, and at least one `--radius-*` token.

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat(scaffold): copy VFCC design tokens (googleapis @import stripped)"
  ```

---

## Task 7: Wire VFCC tokens into `globals.css` and map shadcn variables

shadcn ships its own CSS-var palette (`--background`, `--foreground`, `--primary`, `--border`, `--radius`, etc). PLAN.md says: map shadcn's vars onto VFCC semantic tokens so shadcn components render in VFCC colours automatically.

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Read the current shadcn-generated globals.css to confirm what's there**

  ```bash
  head -60 src/app/globals.css
  ```

  Note the shadcn `:root { ... }` and `.dark { ... }` blocks — these are the variables we'll override.

- [ ] **Step 2: Replace `src/app/globals.css` with the integrated version**

  ```css
  @import "tailwindcss";
  @import "../styles/vfcc-tokens.css";

  /*
   * shadcn/ui CSS-variable mapping.
   * shadcn's tokens on the left, VFCC semantic tokens on the right.
   * Project defaults to dark; both :root and [data-theme=dark] resolve to the same map.
   */
  :root,
  [data-theme="dark"] {
    --background: var(--bg);
    --foreground: var(--fg-1);
    --card: var(--surface);
    --card-foreground: var(--fg-1);
    --popover: var(--surface);
    --popover-foreground: var(--fg-1);
    --primary: var(--brand);
    --primary-foreground: var(--fg-on-brand);
    --secondary: var(--surface-muted);
    --secondary-foreground: var(--fg-1);
    --muted: var(--surface-muted);
    --muted-foreground: var(--fg-3);
    --accent: var(--brand-soft);
    --accent-foreground: var(--fg-1);
    --destructive: var(--brand);
    --destructive-foreground: var(--fg-on-brand);
    --border: var(--border-ink);
    --input: var(--border-ink);
    --ring: var(--brand);
    --radius: var(--radius-md, 0.75rem);
  }

  html,
  body {
    background: var(--bg);
    color: var(--fg-1);
  }

  body {
    font-family: var(--font-ui), system-ui, sans-serif;
  }
  ```

  Notes:
  - The `@import "tailwindcss"` must remain the first line.
  - `--radius-md, 0.75rem` is a defensive fallback in case the VFCC tokens file doesn't define `--radius-md` under that exact name — Task 6 verified the file contains some `--radius-*` token, but the precise name varies and we want shadcn to render even if the mapping is imperfect (the polish pass refines it).

- [ ] **Step 3: Boot dev server and verify dark background renders**

  ```bash
  bun run dev &
  DEV_PID=$!
  sleep 6
  curl -s http://localhost:3000 > /tmp/echoes-page.html
  grep -q 'data-theme="dark"' /tmp/echoes-page.html && echo "dark theme OK"
  kill $DEV_PID
  ```

  Expected: `dark theme OK`.

- [ ] **Step 4: Visually confirm in a browser (manual, one-time)**

  ```bash
  bun run dev
  ```

  Open `http://localhost:3000`. The page background should be VFCC warm dark (`#100b08`, not generic black), the "Echoes" text in cream (`#f7f2ea`-ish). If the page is white-on-black or pure black, the `data-theme="dark"` attribute didn't apply — check `layout.tsx`.

  Stop the dev server (Ctrl+C) once confirmed.

- [ ] **Step 5: Lint + typecheck stay clean**

  ```bash
  bun run lint
  bun run typecheck
  ```

  Expected: both exit 0.

- [ ] **Step 6: Commit**

  ```bash
  git add -A
  git commit -m "feat(scaffold): wire VFCC tokens; map shadcn vars; default dark theme"
  ```

---

## Task 8: Copy the VFCC logo into `public/`

**Files:**
- Create: `public/vfcc-logo.png`

- [ ] **Step 1: Copy the logo**

  ```bash
  cp "/Users/krit/Desktop/03 Design & Assets/VFCC Design System/assets/vfcc-logo-full.png" \
    public/vfcc-logo.png
  ```

- [ ] **Step 2: Verify the file**

  ```bash
  test -f public/vfcc-logo.png && \
    echo "logo size: $(wc -c < public/vfcc-logo.png) bytes"
  ```

  Expected: prints a byte count > 100000 (the source is ~630KB).

- [ ] **Step 3: Verify the dev server serves it**

  ```bash
  bun run dev &
  DEV_PID=$!
  sleep 6
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/vfcc-logo.png
  kill $DEV_PID
  ```

  Expected: `200`.

- [ ] **Step 4: Commit**

  ```bash
  git add -A
  git commit -m "feat(scaffold): add VFCC logo to public/"
  ```

---

## Task 9: Build `<DemoDataBadge>` — the persistent "Sample data" pill

This is the smaller of the two chrome components, built first so EchoesHeader can compose it. Renders the brand-motif signature: pill radius, 2px ink border, 4px offset shadow.

**Files:**
- Create: `src/components/demo-data-badge.tsx`
- Modify: `src/app/page.tsx` (temporary smoke probe — reverted in Task 11)

- [ ] **Step 1: Create the component**

  ```tsx
  // src/components/demo-data-badge.tsx
  export function DemoDataBadge() {
    return (
      <span
        data-testid="demo-data-badge"
        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider"
        style={{
          color: "var(--fg-1)",
          background: "var(--surface)",
          border: "2px solid var(--border-ink)",
          boxShadow: "var(--shadow-offset)",
        }}
      >
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: "var(--brand)" }}
        />
        Sample data — illustrative composite voices
      </span>
    );
  }
  ```

  Notes:
  - Inline `style` (not Tailwind utility classes) is used for VFCC tokens so the brand motif stays tied to semantic tokens — the polish pass (later phase) can lift these into a Tailwind utility plugin if desired. **Critical Rule 21**: use `var(--shadow-offset)` — never hard-code the shadow colour; the token auto-swaps light/dark.
  - The leading 8px red dot is a tiny VFCC visual anchor; can be removed in the polish phase if the design lock disagrees.
  - The exact copy `"Sample data — illustrative composite voices"` is what PLAN.md and CLAUDE.md specify — do not paraphrase.

- [ ] **Step 2: Smoke-render the badge by adding it to `src/app/page.tsx`**

  ```tsx
  import { DemoDataBadge } from "@/components/demo-data-badge";

  export default function Page() {
    return (
      <main className="p-8">
        <DemoDataBadge />
      </main>
    );
  }
  ```

- [ ] **Step 3: Verify the badge HTML renders with the expected copy**

  ```bash
  bun run dev &
  DEV_PID=$!
  sleep 6
  curl -s http://localhost:3000 > /tmp/echoes-page.html
  grep -q 'Sample data — illustrative composite voices' /tmp/echoes-page.html \
    && echo "badge copy OK"
  grep -q 'data-testid="demo-data-badge"' /tmp/echoes-page.html \
    && echo "badge testid OK"
  kill $DEV_PID
  ```

  Expected: both `OK` lines print.

- [ ] **Step 4: Lint + typecheck stay clean**

  ```bash
  bun run lint
  bun run typecheck
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat(chrome): add <DemoDataBadge> persistent illustrative-composite pill"
  ```

---

## Task 10: Build `<EchoesHeader>` — the bilingual brand lockup

**Files:**
- Create: `src/components/echoes-header.tsx`

- [ ] **Step 1: Create the component**

  ```tsx
  // src/components/echoes-header.tsx
  import Image from "next/image";
  import { DemoDataBadge } from "./demo-data-badge";

  export function EchoesHeader() {
    return (
      <header
        data-testid="echoes-header"
        className="flex items-center justify-between gap-6 px-8 py-6"
        style={{ borderBottom: "1px solid var(--border-ink)" }}
      >
        <div className="flex items-center gap-4">
          <Image
            src="/vfcc-logo.png"
            alt="Voices From Care Cymru"
            width={64}
            height={64}
            priority
            className="h-16 w-auto"
          />
          <div className="flex flex-col leading-none">
            <span
              className="text-4xl"
              style={{
                fontFamily: "var(--font-display), serif",
                color: "var(--fg-1)",
                minWidth: "96px",
              }}
            >
              Echoes
              <span
                aria-hidden="true"
                className="mx-3 text-2xl align-middle"
                style={{ color: "var(--fg-3)" }}
              >
                ·
              </span>
              <span style={{ color: "var(--brand)" }}>Atseiniau</span>
            </span>
            <span
              className="mt-1 text-xs uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-mono), monospace",
                color: "var(--fg-3)",
              }}
            >
              6-month composite · Dec 2025 – May 2026
            </span>
          </div>
        </div>

        <DemoDataBadge />
      </header>
    );
  }
  ```

  Notes:
  - The "Echoes · Atseiniau" lockup uses Shrikhand (`--font-display`). "Atseiniau" is rendered in brand red as a heritage nod.
  - The `"6-month composite · Dec 2025 – May 2026"` status line is PLAN.md's locked status indicator copy (NOT "Live · Today" — that contradicts the composite framing).
  - En-dash `–` in the date range (not em-dash, not hyphen). The bullet is `·` (middle dot).
  - 96px `minWidth` on the lockup honours PLAN.md's brand-lockup minimum width rule.
  - `priority` on `<Image>` because the logo is above-the-fold on every route.

- [ ] **Step 2: Wire `<EchoesHeader>` into the root layout**

  Open `src/app/layout.tsx`. Inside `<body>`, wrap `{children}` with the header:

  ```tsx
  // ... imports
  import { EchoesHeader } from "@/components/echoes-header";

  // ... font setup, metadata (unchanged)

  export default function RootLayout({
    children,
  }: Readonly<{ children: React.ReactNode }>) {
    return (
      <html
        lang="en"
        data-theme="dark"
        className={`${instrumentSans.variable} ${shrikhand.variable} ${jetbrainsMono.variable}`}
      >
        <body className="font-[family-name:var(--font-ui)] antialiased">
          <EchoesHeader />
          <main>{children}</main>
        </body>
      </html>
    );
  }
  ```

  (Note: the `<main>` wrapper around `{children}` replaces the inner main in `page.tsx` — see Task 11.)

- [ ] **Step 3: Verify header HTML renders**

  ```bash
  bun run dev &
  DEV_PID=$!
  sleep 6
  curl -s http://localhost:3000 > /tmp/echoes-page.html
  grep -q 'data-testid="echoes-header"' /tmp/echoes-page.html && echo "header OK"
  grep -q 'Echoes' /tmp/echoes-page.html && echo "Echoes lockup OK"
  grep -q 'Atseiniau' /tmp/echoes-page.html && echo "Atseiniau lockup OK"
  grep -q '6-month composite' /tmp/echoes-page.html && echo "status indicator OK"
  grep -q 'Sample data — illustrative composite voices' /tmp/echoes-page.html \
    && echo "DEMO DATA pill present in header OK"
  kill $DEV_PID
  ```

  Expected: all five `OK` lines print.

- [ ] **Step 4: Visually confirm in a browser (manual, one-time)**

  ```bash
  bun run dev
  ```

  Open `http://localhost:3000`. Verify:
  - Logo top-left, ~64px height.
  - "Echoes · Atseiniau" rendered in Shrikhand (chunky leaning caps). "Atseiniau" in brand red.
  - "6-month composite · Dec 2025 – May 2026" underneath in monospace.
  - DEMO DATA pill on the right side of the header with the offset-shadow motif.
  - Dark warm background; cream foreground.

  Stop the dev server once confirmed.

- [ ] **Step 5: Lint + typecheck stay clean**

  ```bash
  bun run lint
  bun run typecheck
  ```

- [ ] **Step 6: Commit**

  ```bash
  git add -A
  git commit -m "feat(chrome): add <EchoesHeader> bilingual brand lockup + status indicator"
  ```

---

## Task 11: Build the placeholder landing page

Reverts the Task 9 smoke probe (the loose `<DemoDataBadge>` in `page.tsx`) now that the badge lives inside `<EchoesHeader>`.

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx` with the placeholder landing**

  ```tsx
  export default function Page() {
    return (
      <section className="px-8 py-16">
        <h1
          className="text-6xl leading-tight"
          style={{
            fontFamily: "var(--font-display), serif",
            color: "var(--fg-1)",
          }}
        >
          Voices of care-experienced Wales.
        </h1>
        <p
          className="mt-6 max-w-prose text-lg"
          style={{ color: "var(--fg-2)" }}
        >
          Echoes surfaces what care-experienced children and young people across
          Wales are telling Voices From Care Cymru — by topic, by region, by
          source — and what the Young People&apos;s Advisory Boards are asking
          for in response.
        </p>
        <p
          className="mt-3 text-xs uppercase tracking-widest"
          style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono), monospace" }}
        >
          Phase 3 scaffold · dashboard and 3D hero land in later phases
        </p>
      </section>
    );
  }
  ```

  Tone-check (PLAN.md NON-NEGOTIABLE rules):
  - "care-experienced children and young people" — yes.
  - "Voices From Care Cymru" spelled out on first mention — yes.
  - En-dash `—` separating clauses — yes (the `&apos;` is for the apostrophe in `Young People's`).
  - No emoji, no "click here", no "service users" — clean.

- [ ] **Step 2: Verify the landing renders with the header chrome**

  ```bash
  bun run dev &
  DEV_PID=$!
  sleep 6
  curl -s http://localhost:3000 > /tmp/echoes-page.html
  grep -q 'data-testid="echoes-header"' /tmp/echoes-page.html && echo "header still in layout"
  grep -q 'Voices of care-experienced Wales' /tmp/echoes-page.html && echo "landing copy OK"
  kill $DEV_PID
  ```

  Expected: both lines print.

- [ ] **Step 3: Lint + typecheck stay clean**

  ```bash
  bun run lint
  bun run typecheck
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add -A
  git commit -m "feat(landing): placeholder landing copy honouring VFCC tone rules"
  ```

---

## Task 12: Phase-3 close — full production-build smoke + sign-off

Closes the scaffolding phase per PLAN.md Verification section ("Per-build smoke checks").

**Files:** none modified — verification only.

- [ ] **Step 1: Production build completes**

  ```bash
  bun run build
  ```

  Expected: build exits 0, prints a route table containing `/` (the landing).

  If Bun segfaults, fall back per PLAN.md Critical-Rule fallback:

  ```bash
  npm run build
  ```

  Document which command worked in the commit message.

- [ ] **Step 2: Production server serves the landing**

  ```bash
  bun run start &
  START_PID=$!
  sleep 5
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
  curl -s http://localhost:3000 | grep -q 'Sample data — illustrative composite voices' \
    && echo "DEMO DATA pill on prod build OK"
  curl -s http://localhost:3000 | grep -q 'Echoes' && echo "Echoes lockup on prod build OK"
  kill $START_PID
  ```

  Expected: `200`, then both `OK` lines.

- [ ] **Step 3: Typecheck + lint final pass**

  ```bash
  bun run typecheck
  bun run lint
  ```

  Expected: both exit 0.

- [ ] **Step 4: Verify offline guarantee at runtime (manual one-time check)**

  ```bash
  bun run build
  bun run start
  ```

  Open `http://localhost:3000` in a browser, open DevTools → Network tab, **disable wifi**, reload the page. Expected:
  - Page reloads from cache / local server with no failed requests to external CDNs.
  - Network panel shows zero entries to `fonts.googleapis.com`, `fonts.gstatic.com`, or any external host.
  - Re-enable wifi after the check; stop the server (Ctrl+C).

  If any external request fires, the `next/font/google` setup or the `googleapis @import` strip was missed — go back and fix before declaring Phase 3 done.

- [ ] **Step 5: Phase-3 close commit + tag**

  ```bash
  git add -A
  git commit --allow-empty -m "chore(phase-3): close scaffolding — build + lint + offline guarantee verified"
  git tag phase-3-scaffold
  ```

- [ ] **Step 6: Update CLAUDE.md status line**

  Open `CLAUDE.md` and update the `## Status` paragraph from:

  > **Planning stage (2026-05-14, revision 2 post-council).** PLAN.md is the source of truth. No code scaffolded yet — first step is the 6-minute storyboard + visual direction lock via the browser visual companion.

  to:

  > **Scaffolded (Phase 3 complete, 2026-05-14).** Next.js 15 + Bun + Tailwind 4 + shadcn + VFCC tokens + brand chrome (EchoesHeader + DemoDataBadge) shipped to `phase-3-scaffold`. Next: phase 4 seed data + integrity (`docs/superpowers/plans/<next-plan>.md` — to be written).

  Then:

  ```bash
  git add CLAUDE.md
  git commit -m "docs: mark phase 3 scaffolding complete in CLAUDE.md"
  ```

---

## Definition of Done for this plan

A task-by-task close is reached when:

1. All 12 task checkboxes are ticked.
2. `git tag phase-3-scaffold` exists and points at a green build.
3. `bun run dev`, `bun run build && bun run start`, `bun run typecheck`, and `bun run lint` all pass on a fresh checkout.
4. `http://localhost:3000` against the production build shows: VFCC dark theme · "Echoes · Atseiniau" brand lockup top-left in Shrikhand · DEMO DATA pill with offset-shadow motif in the header · "6-month composite · Dec 2025 – May 2026" status line · placeholder landing copy.
5. With wifi off, the page reloads cleanly from the production server with zero external network requests.
6. `CLAUDE.md` Status section reflects Phase 3 complete.

## Out of scope — handled in later plans

- Seed data + `check:seed` + YPAB review (PLAN.md Phase 4) — separate plan.
- Offline tile generation + basemaps-assets self-hosting (Phase 5) — separate plan.
- Dashboard components, charts, voices feed, provenance panel (Phase 6) — separate plan.
- MapLibre + pmtiles + deck.gl overlays (Phases 7a/7b) — separate plan.
- Zustand filter store + k-anon redaction (Phase 8) — separate plan.
- Topic + Action pages + View Transitions (Phase 9) — separate plan.
- Bento grid + wow moments + GSAP timeline + R3F sculpture (Phase 10) — separate plan.
- About page (Phase 11) — separate plan.
- Polish pass (Phase 12) — separate plan.
- DEMO-SCRIPT.md + Playwright smoke (Phase 13) — separate plan.
- Pre-flight + recorded backup (Phase 14) — checklist, not a code plan.
- Dress rehearsal (Phase 15) — checklist, not a code plan.

Each subsequent plan follows the same file naming convention: `docs/superpowers/plans/YYYY-MM-DD-<short-name>.md`.
