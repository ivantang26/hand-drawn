/**
 * Renders the painted placeholder photography to WebP (Next's image optimiser serves AVIF/WebP
 * from these), the 4KB paper grain tile, and the favicon.
 *
 *   npm run make:images            render everything
 *   npm run make:images -- hero    render only files whose name contains "hero"
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { between, doc, flourCloud, linen, rng, scatter, woodPlanks } from "./art/lib";
import * as O from "./art/objects";
import { scenes } from "./art/scenes";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public");
const filter = process.argv.slice(2).find((a) => !a.startsWith("--"));
const preview = process.argv.includes("--preview");

type Surface = "board" | "parchment" | "linen" | "oat";

function surface(kind: Surface, w: number, h: number, seed: number) {
  const r = rng(seed);
  switch (kind) {
    case "board":
      return woodPlanks(w, h, r, "#c49468", 170) + flourCloud(w * 0.3, h * 0.72, w * 0.28, h * 0.12, `fc${seed}`);
    case "parchment": {
      let out = `<rect width="${w}" height="${h}" fill="#b98a5a"/><g filter="url(#wobbleSoft)"><rect x="-20" y="-20" width="${w + 40}" height="${h + 40}" fill="#f1e5cc"/>`;
      for (let i = 0; i < 7; i++) {
        const x = between(r, 0, w);
        out += `<path d="M${x} 0 C${x + between(r, -60, 60)} ${h * 0.3} ${x + between(r, -60, 60)} ${h * 0.7} ${x + between(r, -40, 40)} ${h}" stroke="#d8c6a2" stroke-width="${between(r, 1, 3)}" fill="none" opacity="0.7"/>`;
      }
      out += scatter(r, 40, 0, 0, w, h, "#c89a5a", [1, 3], [0.2, 0.5]);
      return `${out}</g>`;
    }
    case "linen":
      return `<rect width="${w}" height="${h}" fill="#cdd6c0"/>${linen(-40, h * 0.62, w + 80, h * 0.5, "#e9dfca", `ln${seed}`, -4)}`;
    case "oat":
      return `<rect width="${w}" height="${h}" fill="#e3d3b4"/>${scatter(r, 160, 0, 0, w, h, "#c9b48f", [1, 3], [0.3, 0.6])}${scatter(r, 60, 0, 0, w, h, "#fff8e8", [1, 2.5], [0.4, 0.7])}`;
  }
}

type Shot = { surface: Surface; draw: (r: ReturnType<typeof rng>) => { defs: string; body: string }[]; extra?: (r: ReturnType<typeof rng>) => string };

const S = 800;
const C = (overrides: Partial<O.Placed> & { id: string; r: ReturnType<typeof rng> }): O.Placed => ({ x: 400, y: 430, s: 1, ...overrides });

const products: Record<string, Shot> = {
  "country-loaf": { surface: "board", draw: (r) => [O.boule(C({ id: "a", r, s: 1.35, rot: -4 }), "golden")] },
  "seeded-rye": { surface: "board", draw: (r) => [O.ryeTin(C({ id: "a", r, s: 1.35, y: 420 }))] },
  baguette: {
    surface: "board",
    draw: (r) => [O.baguette(C({ id: "a", r, s: 0.95, rot: -38, y: 410 })), O.baguette(C({ id: "b", r, s: 0.8, rot: -30, x: 520, y: 520 }))],
  },
  "spelt-honey": { surface: "board", draw: (r) => [O.batard(C({ id: "a", r, s: 1.3, rot: -8 }), "spelt")] },
  "fig-walnut": { surface: "board", draw: (r) => [O.batard(C({ id: "a", r, s: 1.3, rot: 6 }), "dark", { fruit: true })] },
  focaccia: { surface: "parchment", draw: (r) => [O.focaccia(C({ id: "a", r, s: 1.15, rot: -6, y: 410 }))] },
  croissant: {
    surface: "parchment",
    draw: (r) => [O.croissant(C({ id: "b", r, s: 0.75, rot: 18, x: 560, y: 250 })), O.croissant(C({ id: "a", r, s: 1.15, rot: -8, y: 470 }))],
  },
  "pain-au-chocolat": {
    surface: "parchment",
    draw: (r) => [O.painChoc(C({ id: "b", r, s: 0.8, rot: 12, x: 470, y: 260 })), O.painChoc(C({ id: "a", r, s: 1.1, rot: -6, x: 380, y: 500 }))],
  },
  "cardamom-bun": {
    surface: "parchment",
    draw: (r) => [O.knot(C({ id: "b", r, s: 0.7, x: 600, y: 230 })), O.knot(C({ id: "a", r, s: 1.25, x: 360, y: 460 }))],
  },
  "almond-croissant": { surface: "parchment", draw: (r) => [O.croissant(C({ id: "a", r, s: 1.2, rot: 6 }), { almond: true })] },
  "plum-danish": { surface: "parchment", draw: (r) => [O.danish(C({ id: "a", r, s: 1.5, rot: 12, y: 420 }))] },
  "banana-bread": { surface: "linen", draw: (r) => [O.cakeSlice(C({ id: "a", r, s: 1.3, rot: -3 }), "banana")] },
  "choc-cookie": {
    surface: "oat",
    draw: (r) => [O.cookie(C({ id: "b", r, s: 0.9, x: 560, y: 260 })), O.cookie(C({ id: "a", r, s: 1.3, x: 360, y: 480 }))],
  },
  "olive-oil-cake": { surface: "linen", draw: (r) => [O.cakeSlice(C({ id: "a", r, s: 1.3, rot: 2 }), "lemon")] },
  "apple-cider-cake": { surface: "linen", draw: (r) => [O.appleCake(C({ id: "a", r, s: 1.2, y: 410 }))] },
  "tahini-flapjack": {
    surface: "parchment",
    draw: (r) => [O.cookie(C({ id: "b", r, s: 0.8, rot: 14, x: 480, y: 280 }), "flapjack"), O.cookie(C({ id: "a", r, s: 1.05, rot: -8, y: 500 }), "flapjack")],
  },
  "flat-white": { surface: "oat", draw: (r) => [O.cup(C({ id: "a", r, s: 1.25, x: 380, y: 410 }), "flat")] },
  "oat-flat-white": { surface: "oat", draw: (r) => [O.cup(C({ id: "a", r, s: 1.25, x: 380, y: 410, rot: 30 }), "oat")] },
  "filter-coffee": { surface: "oat", draw: (r) => [O.cup(C({ id: "a", r, s: 1.25, x: 380, y: 410, rot: -20 }), "filter")] },
  chai: { surface: "oat", draw: (r) => [O.cup(C({ id: "a", r, s: 1.25, x: 380, y: 410, rot: 60 }), "chai")] },
  "orange-juice": { surface: "linen", draw: (r) => [O.juice(C({ id: "a", r, s: 1.35, x: 330, y: 400 }))] },
};

function productSvg(name: string, shot: Shot, seed: number) {
  const r = rng(seed);
  const parts = shot.draw(r);
  const defs = parts.map((p) => p.defs).join("");
  const body = surface(shot.surface, S, S, seed) + parts.map((p) => p.body).join("") + (shot.extra?.(r) ?? "");
  return doc(S, S, defs, body, seed % 50);
}

/** Paper grain: grey noise tile, kept under 4KB. */
async function grain() {
  const size = 96;
  const r = rng(42);
  const px = Buffer.alloc(size * size);
  for (let i = 0; i < px.length; i++) px[i] = 96 + Math.floor(r() * 128);
  const png = await sharp(px, { raw: { width: size, height: size, channels: 1 } })
    .blur(0.5)
    .png({ palette: true, colours: 8, compressionLevel: 9 })
    .toBuffer();
  await mkdir(path.join(OUT, "textures"), { recursive: true });
  await writeFile(path.join(OUT, "textures", "grain.png"), png);
  console.log(`textures/grain.png  ${(png.length / 1024).toFixed(1)}KB`);
}

async function favicon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="22" fill="#F2D58A"/><g fill="none" stroke="#3E2C1C" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 42 C9 30 18.5 21.5 32 21.5 C45.5 21.5 55 29.5 54.5 42 C54.3 47 47.5 49.5 32 49.5 C16.5 49.5 9.7 47 9.5 42 Z"/><path d="M19 33 C24.5 28.5 36 27 45.5 31"/></g></svg>`;
  await writeFile(path.join(OUT, "favicon.svg"), svg);
}

async function render(file: string, svg: string, width: number, quality = 80) {
  if (filter && !file.includes(filter)) return;
  const out = path.join(OUT, file);
  await mkdir(path.dirname(out), { recursive: true });
  const img = sharp(Buffer.from(svg), { density: 72 }).resize({ width });
  const buf = await img.webp({ quality, effort: 6 }).toBuffer();
  await writeFile(out, buf);
  if (preview) await writeFile(out.replace(/\.webp$/, ".preview.png"), await sharp(buf).png().toBuffer());
  console.log(`${file}  ${(buf.length / 1024).toFixed(0)}KB`);
}

async function main() {
  await grain();
  await favicon();
  let seed = 11;
  for (const [name, shot] of Object.entries(products)) {
    await render(`photos/products/${name}.webp`, productSvg(name, shot, (seed += 7)), 800, 78);
  }
  for (const scene of scenes) {
    await render(`photos/${scene.file}`, scene.svg(), scene.width, scene.quality ?? 80);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

