/**
 * Fails the build if any text/background pairing we ship drops below WCAG AA.
 *   npm run check:contrast
 */
import { contrastRatio, formatRatio } from "../lib/contrast";
import { colours, type ColourToken } from "../lib/tokens";

type Pair = { fg: ColourToken; bg: ColourToken; use: string; min: number };

const PAIRS: Pair[] = [
  { fg: "rye", bg: "flour", use: "body text", min: 4.5 },
  { fg: "flour", bg: "crust", use: "primary button text", min: 4.5 },
  { fg: "flour", bg: "rye", use: "selected chips, basket bar", min: 4.5 },
  { fg: "rye", bg: "oat", use: "text on cards", min: 4.5 },
  { fg: "rye", bg: "butter", use: "text on blobs and badges", min: 4.5 },
  { fg: "rye", bg: "sageTint", use: "“Plenty” chip", min: 4.5 },
  { fg: "rye", bg: "terracottaTint", use: "“Few left” chip, notices", min: 4.5 },
  { fg: "ryeSoft", bg: "soldOutTint", use: "“Sold out” chip", min: 4.5 },
  { fg: "ryeSoft", bg: "flour", use: "secondary text", min: 4.5 },
  { fg: "ryeSoft", bg: "oat", use: "secondary text on oat", min: 4.5 },
  { fg: "crust", bg: "flour", use: "handwritten notes, links", min: 4.5 },
  { fg: "chalk", bg: "chalkboard", use: "chalkboard specials", min: 4.5 },
  { fg: "butter", bg: "chalkboard", use: "chalkboard headings", min: 4.5 },
  // Non-text UI: availability dots and focus rings need 3:1 against their surroundings.
  { fg: "rye", bg: "flour", use: "input borders and focus ring", min: 3 },
  { fg: "crust", bg: "flour", use: "field focus ring", min: 3 },
];

let failed = 0;
for (const p of PAIRS) {
  const r = contrastRatio(colours[p.fg], colours[p.bg]);
  const ok = r >= p.min;
  if (!ok) failed++;
  console.log(`${ok ? "✓" : "✗"} ${p.fg} on ${p.bg}`.padEnd(34) + `${formatRatio(r).padStart(7)}  (needs ${p.min}:1) ${p.use}`);
}

if (failed) {
  console.error(`\n${failed} pairing(s) below WCAG AA.`);
  process.exit(1);
}
console.log("\nAll colour pairings pass WCAG AA.");
