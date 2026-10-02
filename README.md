# Wildroot

A fictional sourdough bakery and café with two shops, built as a portfolio piece for the **organic, hand-drawn** style: blob shapes, wavy section edges, a 2px ink-line illustration set, handwritten notes and a paper-grain texture. Underneath the decoration is a practical pre-order-for-collection app.

```bash
npm install
npm run dev          # http://localhost:3000
```

## What's here

| Page | What it does |
| --- | --- |
| `/` | Hero with morphing blob, "Tomorrow's bake" with live availability per shop, chalkboard specials, process, workshop dates, both shops with an illustrated map, lazy Instagram strip |
| `/order` | Choose shop → day (tomorrow to 6 days ahead, 8pm cut-off, closures shown with reasons) → 30-minute slot → products with allergen filter → basket and checkout. Sticky basket bar on phones, sticky sidebar on larger screens |
| `/order/confirmed/[id]` | Order number, collection details, simulated email and SMS |
| `/menu` | Full menu, allergen filter, and a 14-allergen matrix |
| `/workshops` | Class types, bookable dates with live seats, gift vouchers (try `WILD-GIFT-2026`) |
| `/shops`, `/story`, `/wholesale`, `/contact` | Hours and closures, the story, trade enquiry form (FR-8), contact form |
| `/staff` | Phone-first bake planner with big steppers and autosave (FR-4) |
| `/staff/collections` | Orders by slot with a "collected" tick, pick list, print layout (FR-5) |
| `/staff/settings` | Chalkboard specials and holiday closures (FR-9) |
| `/style-guide` | Tokens, contrast, type, all 30 illustrations, shapes, components |

## How it's built

- **Next.js 16 (App Router) + TypeScript**, plain CSS with custom-property tokens (`app/globals.css`). No UI library.
- **Illustrations** (`components/illustrations/paths.ts`): 30 drawings, doodles, icons and blob outlines as data, rendered once as an inline SVG sprite. Strokes use `currentColor` and `vector-effect: non-scaling-stroke`, so the line is always 2px.
- **Blob masks** are SVG `clipPath`s in `objectBoundingBox` units applied to real `<img>` elements with alt text.
- **Motion**: underlines and circles draw in (600ms) on scroll, the hero blob morphs (SMIL, 8s), items hop into the basket (300ms), wheat sways on hover. With `prefers-reduced-motion`, marks render fully drawn and nothing moves.
- **Data**: `lib/server/store.ts` is an in-memory stand-in for Supabase, seeded with realistic demo orders. Stock, slots and class seats change inside a per-key lock, and payment happens after the reservation, so a declined card releases the stock. `supabase/schema.sql` shows the production version: `select … for update` plus a `check (sold <= planned)` constraint.
- **Time**: all rules run on Europe/London time (`lib/dates.ts`).
- **Photography**: the "photos" are painted SVG scenes rendered to WebP by `npm run make:images` (`scripts/art/`). They're placeholders for real photography; Next serves them as AVIF or WebP.

## Checks

```bash
npm run check:contrast   # every text/background pairing vs WCAG AA (runs before build)
npm run test:stock       # 60 simultaneous orders for 3 loaves; cut-off; full slots
npm run typecheck
```

## Not real

Payments (Stripe), texts and emails are simulated and logged to the server console. The staff pages have no sign-in. Data resets when the server restarts.

## Open questions from the brief

- Full payment upfront, or "pay at collection" for regulars? The demo takes payment upfront.
- Who draws the final illustration set? The drawings here follow the brief's 2px line so they can be swapped one for one.
