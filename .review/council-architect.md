# Council — Architect Verdict

**Status:** NEEDS-CHANGES

## Issues

### BLOCKER — OpenFreeMap raster/vector contradiction
- **Quote:** "Tile source: OpenFreeMap dark style, mirrored to `public/tiles/`" and "served from `public/tiles/{z}/{x}/{y}.png`"
- **Reality:** OpenFreeMap is vector PBF tiles served via MapLibre, not raster `{z}/{x}/{y}.png`. react-leaflet's default `TileLayer` expects rasters.
- **Fix options:**
  - **Option R** (raster, simpler): switch tile provider to **Stadia Maps Alidade Smooth Dark** (offline-allowed with API key under their free tier for charities), keep react-leaflet + raster `TileLayer`, keep `public/tiles/{z}/{x}/{y}.png` layout.
  - **Option V** (vector, more current): switch map stack to **MapLibre GL + PMTiles** via `protomaps-leaflet` or `maplibre-gl-leaflet`. Single `public/tiles/wales.pmtiles` artefact.

### HIGH — Framer Motion pattern conflation
- **Quote:** "wrap the dashboard panels in a single `<LayoutGroup>` and give matching `layoutId` props to corresponding sub-elements..."
- **Reality:** `layoutId` is for shared-element transitions across mount/unmount (a chip flying from panel A to panel B). For "panels reshape together when state changes", use the `layout` prop on each animating element within a `LayoutGroup`.
- **Fix:** rewrite the wow-moment 3 pattern: "Wrap dashboard panels in a single `<LayoutGroup>`. Give each animating element a `layout` prop so it animates its own bounding-box changes when filters change. Use `layoutId` only for genuinely shared elements that cross-fade between two locations (e.g. a topic chip flying into the topic-page header)."

### HIGH — Welsh NLP path: Bedrock not SageMaker
- **Quote (post-demo):** "NLP: AWS Comprehend for English sentiment + topic; SageMaker custom model for Welsh-language NLP"
- **Reality:** Comprehend doesn't support Welsh. In 2026, Bedrock (Claude/Titan) is the standard AWS path for low-resource languages via prompt-engineered classification.
- **Fix:** "NLP: Amazon Bedrock (Claude / Titan) for both English and Welsh sentiment + topic via prompt-engineered classification, with Amazon Comprehend as a cheaper English-only fallback for high-volume processing. SageMaker reserved for a later custom Welsh classifier if Bedrock evaluation shows accuracy gaps."

### MEDIUM — `topics.length` not enforced
- **Quote:** `topics: TopicSlug[]; // 1–3`
- **Fix:** add to check:seed: `1 <= topics.length <= 3` AND topics unique. Same for: `excerpt` non-empty iff `consentLevel === 'public'`; `voiceIds` unique; `excerptVoiceIds ⊆ voiceIds`; `sessionId` present iff `source === 'ypab'`.

### MEDIUM — Provenance type implicit
- **Fix:** define `type Provenance = Record<Voice['source'], number>` and assert `sum(provenance) === voices.length`.

### MEDIUM — Voice distribution vague
- **Quote:** "Distribution is uneven (realistic): more housing + mental health, fewer rights"
- **Fix:** specify numeric table (e.g. Housing 28%, MH 24%, Education 16%, Identity 10%, Relationships 10%, Transitions 8%, Rights 4%) so LLM-authored seed is reproducible and k-anon can be pre-checked.

### LOW — Priority statement count range
- **Quote:** "8–12 priority statements"
- **Fix:** pin to exactly 9 (one per major topic + 2 cross-cutting).

### LOW — `PriorityStatement.group` union
- **Quote:** `group: 'south-wales-ypab' | 'north-wales-ypab' | 'national' | RegionSlug`
- **Fix:** split into `groupType: 'ypab' | 'national' | 'regional'` + optional `groupRegion: RegionSlug`.

### LOW — `package.json` scripts not pinned in CLAUDE.md
- **Fix:** add explicit `package.json` scripts block to CLAUDE.md's Dev commands section as the canonical source so LLM writes them correctly in phase 3.

## What's strong (don't change)
- Critical-path dependency table with named owners + fallbacks
- k-anonymity floor of 5
- Two-tier voice authenticity workflow with documented fallback
- Offline-runs verification (Network tab empty)
- Persistent DEMO DATA pill as non-negotiable
