# Researcher: Technical Stack Verification

Verdicts from background researcher (agent `af87fcf70ca094aa2`) on 5 high-risk technical claims.

## Summary

| Claim | Verdict | Action |
|-------|---------|--------|
| shadcn/ui + Tailwind 4 | TRUE | Proceed as planned |
| Bun + Next.js 15 dev | TRUE-WITH-CAVEATS | Document Turbopack HMR flakiness; have `npm run dev` fallback ready |
| Offline tiles mechanism | TRUE | Mechanism works (`TileLayer url="./tiles/{z}/{x}/{y}.png"`) |
| Offline tiles licensing | **FALSE** | **Swap CartoDB → OpenMapTiles / OpenFreeMap / Protomaps** |
| react-leaflet + Next App Router SSR | TRUE | Use `dynamic(() => import('./Map'), { ssr: false })` |
| Framer Motion `<LayoutGroup>` + `layoutId` | TRUE | Use it for the topic-click cascade |

## Key blocker

**CartoDB Dark Matter tiles cannot be pre-downloaded for offline use under their TOS.** Use a permissively-licensed provider instead:

- **OpenFreeMap** (MIT licensed, free for charity)
- **OpenMapTiles** (explicit offline + commercial allowance)
- **Protomaps** (free for non-commercial)

All require attribution.
